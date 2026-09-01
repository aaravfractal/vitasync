/** SHA-256 via Web Crypto. Runs in the browser and in Node 18+ / edge runtimes. */
export async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const data = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** a3f8…e21c style, for the ledger list */
export function shortHash(hex?: string) {
  if (!hex) return "pending";
  return `${hex.slice(0, 4)}…${hex.slice(-4)}`;
}

/** Canonical string for a record: what gets hashed on write. */
export function canonicalRecord(r: {
  type: string; occurredAt: string; provider: string; title: string; summary: string;
}) {
  return JSON.stringify({ t: r.type, o: r.occurredAt, p: r.provider, ti: r.title, s: r.summary });
}
