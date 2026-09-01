"use client";
import { use } from "react";
import Link from "next/link";
import { Printer, Share2 } from "lucide-react";
import { Pill, ScreenHeader, cx } from "@/components/ui";
import { useToast } from "@/components/toast";
import { useStore } from "@/lib/store";
import { shortHash } from "@/lib/hash";
import type { AiSession, Urgency } from "@/lib/types";

const tag: Record<Urgency, { label: string; className: string }> = {
  low: { label: "Low urgency", className: "bg-tint border-tint-border text-teal" },
  gp_today: { label: "See a GP today", className: "bg-gold-tint border-gold-border text-gold-text" },
  emergency: { label: "Emergency", className: "bg-danger-tint border-danger text-danger" },
};

/** Fallback for sessions written before the structured payload existed. */
function fromSummary(summary: string): AiSession {
  return { urgency: "low", symptoms: "Not recorded", likelyCause: "Not recorded", advice: summary, nextStep: "Not recorded" };
}

export default function SessionReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, ready } = useStore();
  const toast = useToast();
  const rec = state.records.find((r) => r.id === id && r.type === "ai_session");

  if (!rec) {
    return (
      <>
        <ScreenHeader title="Session report" back="/app/record" />
        <p className="text-[14px] text-muted">{ready ? "That session isn't in your record." : "Loading…"}</p>
      </>
    );
  }

  const ai = rec.ai ?? fromSummary(rec.summary);
  const t = tag[ai.urgency];
  const when = new Date(rec.occurredAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  async function share() {
    const text = `${rec!.title}\n${rec!.provider} · ${when}\n\nUrgency: ${t.label}\nReported: ${ai.symptoms}\nLikely cause: ${ai.likelyCause}\nAdvice: ${ai.advice}\nNext step: ${ai.nextStep}\n\nSHA-256: ${rec!.sha256 ?? "pending"}\nAI-generated. Not a diagnosis.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: rec!.title, text });
        return;
      } catch {
        // Cancelled or unsupported — fall through to the download.
      }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = `${rec!.title.replace(/\W+/g, "-")}.txt`;
    a.click();
    toast("Downloaded. To send it to a doctor, use your share ID.");
  }

  return (
    <div className="pb-8">
      <ScreenHeader title="Session report" back="/app/record" subtitle={when} />

      <div className="bg-surface border border-line rounded-[18px] p-4">
        <span className={cx("inline-flex items-center rounded-full border px-3 py-1.5 text-[12.5px] font-semibold", t.className)}>{t.label}</span>
        <h2 className="display text-[17px] font-bold mt-3">{rec.title}</h2>
        <div className="text-[12px] text-muted">{rec.provider}</div>

        <dl className="mt-4 space-y-3.5">
          {[
            ["Reported symptoms", ai.symptoms],
            ["Likely cause", ai.likelyCause],
            ["Advice given", ai.advice],
            ["Next step", ai.nextStep],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="overline text-faint">{label}</dt>
              <dd className="text-[14.5px] mt-1">{value}</dd>
            </div>
          ))}
        </dl>

        {ai.urgency === "emergency" && (
          <Pill href="/app/emergency" variant="danger" className="w-full mt-4">Open emergency</Pill>
        )}
      </div>

      <div className="mt-3 bg-paper border border-line rounded-[14px] p-3 text-[12.5px]">
        <div className="text-muted">Sealed · SHA-256</div>
        <div className="mono break-all">{rec.sha256 ?? "pending"}</div>
        <div className="text-faint mt-1">{shortHash(rec.sha256)} · hashing live, anchoring on testnet next</div>
      </div>

      <div className="flex gap-2 mt-4 print:hidden">
        <Pill onClick={() => window.print()} variant="secondary" className="flex-1"><Printer size={16} /> Print</Pill>
        <Pill onClick={share} className="flex-1"><Share2 size={16} /> Share</Pill>
      </div>

      <p className="text-[11.5px] text-faint mt-4">
        This report is AI-generated from what you typed — not a diagnosis. AI can be wrong. For emergencies call 112, or 108 for an ambulance.{" "}
        <Link href="/app/record" className="text-teal">Back to your record</Link>
      </p>
    </div>
  );
}
