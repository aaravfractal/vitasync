/**
 * Report files, encrypted on the device.
 *
 * The AES-GCM key is generated once and kept **non-extractable** in IndexedDB:
 * `crypto.subtle.exportKey` refuses it, so no copy of the key material exists
 * anywhere this code — or anything we ship later — could upload. Ciphertext and
 * iv live in IndexedDB too, never localStorage: the store serialises its whole
 * blob on every state change, and a megabyte of base64 there would be both slow
 * and a plaintext-shaped footgun.
 *
 * Plaintext exists only in memory, for as long as a sheet is open. Nothing here
 * writes it to disk, and the record entry carries only the pointer and the hash.
 */
import { sha256Hex } from "./hash";
import type { Attachment } from "./types";

const DB = "vitasync-vault";
const KEYS = "keys";
const BLOBS = "blobs";
const KEY_ID = "primary";

export const MAX_BYTES = 10 * 1024 * 1024;
export const ACCEPT = "application/pdf,image/*";

export const isAllowedFile = (f: File) => f.type === "application/pdf" || f.type.startsWith("image/");

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

interface StoredBlob { id: string; iv: Uint8Array<ArrayBuffer>; ciphertext: ArrayBuffer; mime: string }

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(KEYS)) db.createObjectStore(KEYS);
      if (!db.objectStoreNames.contains(BLOBS)) db.createObjectStore(BLOBS, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(store: string, mode: IDBTransactionMode, op: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = op(db.transaction(store, mode).objectStore(store));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

/**
 * One key per device, made on the first upload. `false` is the extractable flag:
 * this key can encrypt and decrypt here and can never be read back out.
 */
export async function deviceKey(): Promise<CryptoKey> {
  const existing = await run<CryptoKey | undefined>(KEYS, "readonly", (s) => s.get(KEY_ID));
  if (existing) return existing;
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  await run(KEYS, "readwrite", (s) => s.put(key, KEY_ID));
  return key;
}

/** Encrypt, hash the ciphertext, store both. Returns what the record entry keeps. */
export async function encryptFile(file: File): Promise<{ attachment: Attachment; sha256: string }> {
  const key = await deviceKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, await file.arrayBuffer());
  const id = crypto.randomUUID();
  await run(BLOBS, "readwrite", (s) => s.put({ id, iv, ciphertext, mime: file.type } satisfies StoredBlob));
  return { attachment: { id, name: file.name, mime: file.type, size: file.size }, sha256: await sha256Hex(ciphertext) };
}

async function readBlob(a: Attachment): Promise<StoredBlob> {
  const rec = await run<StoredBlob | undefined>(BLOBS, "readonly", (s) => s.get(a.id));
  if (!rec) throw new Error("not on this device");
  return rec;
}

/** Decrypt into memory. The caller owns the object URL and must revoke it. */
export async function decryptToBlob(a: Attachment): Promise<Blob> {
  const rec = await readBlob(a);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: rec.iv }, await deviceKey(), rec.ciphertext);
  return new Blob([plain], { type: a.mime || rec.mime || "application/octet-stream" });
}

/** Re-hash what is actually on disk. The seal holds only if this still matches. */
export async function ciphertextHash(a: Attachment) {
  return sha256Hex((await readBlob(a)).ciphertext);
}

/** First bytes of the stored ciphertext, for the "what's stored" panel. */
export async function ciphertextHead(a: Attachment, bytes = 48) {
  const { ciphertext } = await readBlob(a);
  const head = Array.from(new Uint8Array(ciphertext.slice(0, bytes)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
  return { hex: head, shown: Math.min(bytes, ciphertext.byteLength), total: ciphertext.byteLength };
}

/** Sign-out: the records go, so the ciphertext they point at goes with them. */
export function clearAttachments() {
  return new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(DB);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
}
