"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Chip, Pill, ScreenHeader, cx } from "@/components/ui";
import { Sheet } from "@/components/sheet";
import { useToast } from "@/components/toast";
import { AttachmentView } from "@/components/attachment-view";
import { UploadReportCard, UploadReportSheet } from "@/components/upload-report";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { ciphertextHash, decryptToBlob } from "@/lib/attachments";
import { canonicalRecord, sha256Hex, shortHash } from "@/lib/hash";
import type { Key } from "@/lib/i18n";
import type { HealthRecord, RecordType } from "@/lib/types";

const filters: Array<{ key: "all" | RecordType; label: Key }> = [
  { key: "all", label: "rec.all" }, { key: "consult", label: "rec.consults" }, { key: "report", label: "rec.reports" }, { key: "rx", label: "rec.rx" },
];

const cardClass = "block w-full text-left bg-surface border border-line rounded-[18px] p-4";
const actionKey = (type: RecordType): Key => (type === "report" ? "rec.actionViewShare" : type === "rx" ? "rec.actionRefill" : type === "ai_session" ? "rec.actionReport" : "rec.actionOpen");

/** AI sessions open their own report screen; everything else opens the detail sheet. */
function RecordCard({ r, onOpen }: { r: HealthRecord; onOpen: () => void }) {
  const { t, d } = useT();
  const body = (
    <>
      <div className="flex justify-between gap-3"><div className="font-semibold text-[14.5px]">{r.title}</div><div className="text-[12px] text-faint shrink-0">{d(r.occurredAt, { day: "numeric", month: "short" })}</div></div>
      <div className="text-[12px] text-muted">{r.provider}</div>
      <p className="text-[13.5px] mt-2">{r.summary}</p>
      <div className="border-t border-divider mt-3 pt-2.5 flex items-center justify-between text-[12.5px]">
        <span className={cx("font-medium", r.sha256 ? "text-teal" : "text-faint")}>{r.sha256 ? t("rec.sealed") : t("rec.sealing")}</span>
        <span className="text-teal font-semibold">{t(actionKey(r.type))}</span>
      </div>
    </>
  );
  if (r.type === "ai_session") return <Link href={`/app/record/session/${r.id}`} className={cardClass}>{body}</Link>;
  return <button onClick={onOpen} className={cardClass}>{body}</button>;
}

export default function Record() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { t, d, locale } = useT();
  const [filter, setFilter] = useState<"all" | RecordType>("all");
  const [openRec, setOpenRec] = useState<HealthRecord | null>(null);
  const [verify, setVerify] = useState<"idle" | "ok" | "bad">("idle");
  const [upload, setUpload] = useState(false);

  const monthOf = (iso: string) => d(iso, { month: "long", year: "numeric" }).toUpperCase();

  // Seal any unsealed entries (seed data). In production hashing happens on write, server-side.
  useEffect(() => {
    state.records.filter((r) => !r.sha256).forEach(async (r) => dispatch({ type: "sealRecord", id: r.id, sha256: await sha256Hex(canonicalRecord(r)) }));
  }, [state.records, dispatch]);

  const shown = useMemo(() => [...state.records].filter((r) => filter === "all" || r.type === filter).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)), [state.records, filter]);

  /** An upload seals its ciphertext, so re-hash what is on disk; every other entry re-hashes its canonical JSON. */
  async function reverify(r: HealthRecord) {
    const h = await (r.attachment ? ciphertextHash(r.attachment).catch(() => "") : sha256Hex(canonicalRecord(r)));
    setVerify(h === r.sha256 ? "ok" : "bad");
  }
  async function download(r: HealthRecord) {
    if (!r.attachment) return sharePdf(r);
    const url = URL.createObjectURL(await decryptToBlob(r.attachment));
    const a = document.createElement("a"); a.href = url; a.download = r.attachment.name; a.click();
    URL.revokeObjectURL(url);
    toast(t("rec.decrypted"));
  }
  function sharePdf(r: HealthRecord) {
    const text = `${r.title}\n${r.provider}\n${new Date(r.occurredAt).toLocaleString(locale)}\n\n${r.summary}\n\nSHA-256: ${r.sha256}`;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${r.title.replace(/\W+/g, "-")}.txt`; a.click();
    toast(t("rec.downloadedTxt"));
  }

  return (
    <>
      <ScreenHeader
        title={t("rec.title")}
        backLabel={t("common.back")}
        subtitle={t("rec.sub", { n: state.records.length })}
        right={<Link href="/app/reports" className="inline-flex items-center gap-1.5 rounded-full bg-tint border border-tint-border text-teal px-3.5 min-h-[36px] text-[13px] font-semibold shrink-0"><Sparkles size={14} /> {t("rec.reportsSummary")}</Link>}
      />
      <div className="flex gap-2 mb-3">{filters.map((f) => <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>{t(f.label)}</Chip>)}</div>

      <UploadReportCard onClick={() => setUpload(true)} className="mb-4" />

      <ol className="relative border-l-2 border-line ml-2.5 pl-6 space-y-4 pb-16">
        {shown.map((r, i) => {
          const m = monthOf(r.occurredAt);
          const showMonth = i === 0 || m !== monthOf(shown[i - 1].occurredAt);
          const gold = r.type === "report";
          return (
            <li key={r.id} className="relative">
              <span className={cx("absolute -left-[35px] top-1 w-5 h-5 rounded-full ring-4 ring-paper", gold ? "bg-gold" : "bg-teal")} />
              {showMonth && <div className="overline text-faint mb-2">{m}</div>}
              <RecordCard r={r} onOpen={() => { setOpenRec(r); setVerify("idle"); }} />
            </li>
          );
        })}
      </ol>
      {shown.length === 0 && <p className="text-muted text-[14px]">{t("rec.empty")}</p>}

      <div className="fixed bottom-[76px] inset-x-0 px-[22px] max-w-[430px] mx-auto"><Pill href="/app/id" className="w-full">{t("rec.shareWithDoctor")}</Pill></div>

      <Sheet open={!!openRec} onClose={() => setOpenRec(null)} title={openRec?.title}>
        {openRec && (
          <>
            <div className="text-[13px] text-muted">{openRec.provider} · {d(openRec.occurredAt, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
            <p className="text-[14.5px] mt-3">{openRec.summary}</p>
            {openRec.attachment && <AttachmentView attachment={openRec.attachment} />}
            <div className="mt-4 bg-paper border border-line rounded-[14px] p-3 text-[12.5px]">
              <div className="text-muted">{openRec.attachment ? t("rec.shaEncrypted") : t("rec.sha")}</div>
              <div className="mono break-all">{openRec.sha256 ?? t("rec.pending")}</div>
              <button onClick={() => reverify(openRec)} className="text-teal font-semibold mt-2">{t("common.verifyNow")}</button>
              {verify === "ok" && <span className="ml-3 text-teal">{t("common.hashMatches")}</span>}
              {verify === "bad" && <span className="ml-3 text-danger">{t("common.hashMismatch")}</span>}
              <div className="text-faint mt-1">{shortHash(openRec.sha256)} · {t("rec.anchorNext")}</div>
            </div>
            <div className="flex gap-2 mt-4">
              {openRec.type === "rx" ? <Pill href="/app/refills" className="flex-1">{t("rec.refillNow")}</Pill> : <Pill onClick={() => download(openRec)} className="flex-1">{t("common.download")}</Pill>}
              <Pill href="/app/id" variant="secondary" className="flex-1">{t("common.share")}</Pill>
            </div>
          </>
        )}
      </Sheet>
      <UploadReportSheet open={upload} onClose={() => setUpload(false)} />
    </>
  );
}
