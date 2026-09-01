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
import { ciphertextHash, decryptToBlob } from "@/lib/attachments";
import { canonicalRecord, sha256Hex, shortHash } from "@/lib/hash";
import type { HealthRecord, RecordType } from "@/lib/types";

const filters: Array<{ key: "all" | RecordType; label: string }> = [
  { key: "all", label: "All" }, { key: "consult", label: "Consults" }, { key: "report", label: "Reports" }, { key: "rx", label: "Rx" },
];
const monthOf = (iso: string) => new Date(iso).toLocaleString("en-IN", { month: "long", year: "numeric" }).toUpperCase();
const dayOf = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short" });

const cardClass = "block w-full text-left bg-surface border border-line rounded-[18px] p-4";
const actionLabel = (t: RecordType) => (t === "report" ? "View / Share" : t === "rx" ? "Refill" : t === "ai_session" ? "View report" : "Open");

/** AI sessions open their own report screen; everything else opens the detail sheet. */
function RecordCard({ r, onOpen }: { r: HealthRecord; onOpen: () => void }) {
  const body = (
    <>
      <div className="flex justify-between gap-3"><div className="font-semibold text-[14.5px]">{r.title}</div><div className="text-[12px] text-faint shrink-0">{dayOf(r.occurredAt)}</div></div>
      <div className="text-[12px] text-muted">{r.provider}</div>
      <p className="text-[13.5px] mt-2">{r.summary}</p>
      <div className="border-t border-divider mt-3 pt-2.5 flex items-center justify-between text-[12.5px]">
        <span className={cx("font-medium", r.sha256 ? "text-teal" : "text-faint")}>{r.sha256 ? "Sealed · owned by you" : "Sealing…"}</span>
        <span className="text-teal font-semibold">{actionLabel(r.type)}</span>
      </div>
    </>
  );
  if (r.type === "ai_session") return <Link href={`/app/record/session/${r.id}`} className={cardClass}>{body}</Link>;
  return <button onClick={onOpen} className={cardClass}>{body}</button>;
}

export default function Record() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState<"all" | RecordType>("all");
  const [openRec, setOpenRec] = useState<HealthRecord | null>(null);
  const [verify, setVerify] = useState<"idle" | "ok" | "bad">("idle");
  const [upload, setUpload] = useState(false);

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
    toast("Decrypted on this device and saved");
  }
  function sharePdf(r: HealthRecord) {
    const text = `${r.title}\n${r.provider}\n${new Date(r.occurredAt).toLocaleString("en-IN")}\n\n${r.summary}\n\nSHA-256: ${r.sha256}`;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${r.title.replace(/\W+/g, "-")}.txt`; a.click();
    toast("Downloaded. PDF export arrives with real uploads.");
  }

  return (
    <>
      <ScreenHeader
        title="Health record"
        subtitle={`${state.records.length} entries · sealed`}
        right={<Link href="/app/reports" className="inline-flex items-center gap-1.5 rounded-full bg-tint border border-tint-border text-teal px-3.5 min-h-[36px] text-[13px] font-semibold shrink-0"><Sparkles size={14} /> Reports summary</Link>}
      />
      <div className="flex gap-2 mb-3">{filters.map((f) => <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</Chip>)}</div>

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
      {shown.length === 0 && <p className="text-muted text-[14px]">Nothing here yet. Entries appear as you book, log vitals and upload reports.</p>}

      <div className="fixed bottom-[76px] inset-x-0 px-[22px] max-w-[430px] mx-auto"><Pill href="/app/id" className="w-full">Share record with a doctor</Pill></div>

      <Sheet open={!!openRec} onClose={() => setOpenRec(null)} title={openRec?.title}>
        {openRec && (
          <>
            <div className="text-[13px] text-muted">{openRec.provider} · {new Date(openRec.occurredAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
            <p className="text-[14.5px] mt-3">{openRec.summary}</p>
            {openRec.attachment && <AttachmentView attachment={openRec.attachment} />}
            <div className="mt-4 bg-paper border border-line rounded-[14px] p-3 text-[12.5px]">
              <div className="text-muted">{openRec.attachment ? "SHA-256 of the encrypted file" : "SHA-256"}</div>
              <div className="mono break-all">{openRec.sha256 ?? "pending"}</div>
              <button onClick={() => reverify(openRec)} className="text-teal font-semibold mt-2">Verify now</button>
              {verify === "ok" && <span className="ml-3 text-teal">Matches · untampered</span>}
              {verify === "bad" && <span className="ml-3 text-danger">Mismatch · altered</span>}
              <div className="text-faint mt-1">{shortHash(openRec.sha256)} · anchoring on Polygon testnet next</div>
            </div>
            <div className="flex gap-2 mt-4">
              {openRec.type === "rx" ? <Pill href="/app/refills" className="flex-1">Refill now</Pill> : <Pill onClick={() => download(openRec)} className="flex-1">Download</Pill>}
              <Pill href="/app/id" variant="secondary" className="flex-1">Share</Pill>
            </div>
          </>
        )}
      </Sheet>
      <UploadReportSheet open={upload} onClose={() => setUpload(false)} />
    </>
  );
}
