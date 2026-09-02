"use client";
import { useRef, useState } from "react";
import { FileUp, Lock } from "lucide-react";
import { Pill } from "@/components/ui";
import { Sheet } from "@/components/sheet";
import { Field } from "@/components/field";
import { useToast } from "@/components/toast";
import { ACCEPT, MAX_BYTES, encryptFile, formatBytes, isAllowedFile } from "@/lib/attachments";
import { useStore, writeSealedRecord } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { todayKey } from "@/lib/wellness";

/**
 * Pick a file, encrypt it here, keep only ciphertext. The File object lives in
 * state while the sheet is open and goes when it closes — the plaintext is never
 * written anywhere, not to the store, not to IndexedDB.
 */
export function UploadReportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const { t } = useT();
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
    if (!isAllowedFile(f)) { setFile(null); setError(t("upl.onlyPdf")); return; }
    if (f.size > MAX_BYTES) { setFile(null); setError(t("upl.tooBig", { size: formatBytes(f.size) })); return; }
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
        provider: provider.trim() || t("upl.uploadedBy"),
        title: title.trim(),
        summary: t("upl.summary", { name: attachment.name, size: formatBytes(attachment.size) }),
        sha256,
        attachment,
      });
      toast(t("upl.done"));
      close();
    } catch {
      setError(t("upl.failed"));
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={close} title={t("upl.card")}>
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
          <span className="block font-semibold text-[14px] truncate">{file ? file.name : t("upl.chooseFile")}</span>
          <span className="block text-[12px] text-muted">{file ? formatBytes(file.size) : t("upl.fileHint")}</span>
        </span>
      </label>
      {error && <p role="alert" className="text-[13px] text-danger mt-2">{error}</p>}

      <div className="mt-4">
        <Field label={t("upl.titleLabel")} placeholder={t("upl.titlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
        <Field label={t("upl.providerLabel")} placeholder={t("upl.providerPlaceholder")} value={provider} onChange={(e) => setProvider(e.target.value)} />
        <Field label={t("upl.dateLabel")} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <p className="flex gap-2 text-[12.5px] text-muted mb-4">
        <Lock size={15} className="text-teal shrink-0 mt-0.5" />
        {t("upl.privacy")}
      </p>
      <Pill onClick={save} disabled={!file || !title.trim() || busy} className="w-full">
        {busy ? t("upl.saving") : t("upl.save")}
      </Pill>
    </Sheet>
  );
}

/** The trigger used on Home and on the record timeline. */
export function UploadReportCard({ onClick, className }: { onClick: () => void; className?: string }) {
  const { t } = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[18px] bg-surface border border-dashed border-tint-border p-4 flex items-center gap-3 text-left hover:border-teal ${className ?? ""}`}
    >
      <span className="inline-flex items-center justify-center rounded-[12px] bg-tint text-teal w-[42px] h-[42px] shrink-0"><FileUp size={21} strokeWidth={1.8} /></span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-[14px]">{t("upl.card")}</span>
        <span className="block text-[12px] text-muted">{t("upl.cardSub")}</span>
      </span>
    </button>
  );
}
