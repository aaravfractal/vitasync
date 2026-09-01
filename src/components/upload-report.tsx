"use client";
import { useRef, useState } from "react";
import { FileUp, Lock } from "lucide-react";
import { Pill } from "@/components/ui";
import { Sheet } from "@/components/sheet";
import { Field } from "@/components/field";
import { useToast } from "@/components/toast";
import { ACCEPT, MAX_BYTES, encryptFile, formatBytes, isAllowedFile } from "@/lib/attachments";
import { useStore, writeSealedRecord } from "@/lib/store";
import { todayKey } from "@/lib/wellness";

/**
 * Pick a file, encrypt it here, keep only ciphertext. The File object lives in
 * state while the sheet is open and goes when it closes — the plaintext is never
 * written anywhere, not to the store, not to IndexedDB.
 */
export function UploadReportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [date, setDate] = useState(todayKey());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reset() {
    setFile(null); setTitle(""); setProvider(""); setDate(todayKey()); setError(null); setBusy(false);
    if (input.current) input.current.value = "";
  }
  function close() { reset(); onClose(); }

  function pick(f: File | undefined) {
    if (!f) return;
    if (!isAllowedFile(f)) { setFile(null); setError("PDF or image only."); return; }
    if (f.size > MAX_BYTES) { setFile(null); setError(`That file is ${formatBytes(f.size)}. The limit is 10 MB.`); return; }
    setError(null);
    setFile(f);
    if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, ""));
  }

  async function save() {
    if (!file || !title.trim() || busy) return;
    setBusy(true);
    try {
      const { attachment, sha256 } = await encryptFile(file);
      const when = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00`) : new Date();
      writeSealedRecord(dispatch, {
        type: "report",
        occurredAt: when.toISOString(),
        provider: provider.trim() || "Uploaded by you",
        title: title.trim(),
        summary: `${attachment.name} · ${formatBytes(attachment.size)}. Encrypted on this device, so only you can open it.`,
        sha256,
        attachment,
      });
      toast("Encrypted on your device and added to your record");
      close();
    } catch {
      setError("Could not encrypt that file. Try again.");
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={close} title="Upload report">
      <label className="flex items-center gap-3 rounded-[14px] border border-dashed border-tint-border bg-tint/50 p-4 cursor-pointer">
        <input
          ref={input}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <FileUp size={22} strokeWidth={1.8} className="text-teal shrink-0" />
        <span className="min-w-0">
          <span className="block font-semibold text-[14px] truncate">{file ? file.name : "Choose a file"}</span>
          <span className="block text-[12px] text-muted">{file ? formatBytes(file.size) : "PDF or photo, up to 10 MB"}</span>
        </span>
      </label>
      {error && <p role="alert" className="text-[13px] text-danger mt-2">{error}</p>}

      <div className="mt-4">
        <Field label="Title" placeholder="e.g. Lipid panel" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Field label="Lab or clinic" placeholder="e.g. Dr Lal PathLabs" value={provider} onChange={(e) => setProvider(e.target.value)} />
        <Field label="Date on the report" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <p className="flex gap-2 text-[12.5px] text-muted mb-4">
        <Lock size={15} className="text-teal shrink-0 mt-0.5" />
        Encrypted here with a key that never leaves this device. Your record keeps the hash of the encrypted file, nothing else.
      </p>
      <Pill onClick={save} disabled={!file || !title.trim() || busy} className="w-full">
        {busy ? "Encrypting…" : "Encrypt and save"}
      </Pill>
    </Sheet>
  );
}

/** The trigger used on Home and on the record timeline. */
export function UploadReportCard({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[18px] bg-surface border border-dashed border-tint-border p-4 flex items-center gap-3 text-left hover:border-teal ${className ?? ""}`}
    >
      <span className="inline-flex items-center justify-center rounded-[12px] bg-tint text-teal w-[42px] h-[42px] shrink-0"><FileUp size={21} strokeWidth={1.8} /></span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-[14px]">Upload report</span>
        <span className="block text-[12px] text-muted">PDF or photo, encrypted on this device</span>
      </span>
    </button>
  );
}
