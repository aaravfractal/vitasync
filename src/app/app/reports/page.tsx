"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ScreenHeader, cx } from "@/components/ui";
import { useStore } from "@/lib/store";
import { extractMetrics, reportRecords, trendOf } from "@/lib/reports";

const dayOf = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function Reports() {
  const { state, ready } = useStore();
  const reports = useMemo(() => reportRecords(state.records), [state.records]);
  const metrics = useMemo(() => extractMetrics(state.records), [state.records]);
  const [summary, setSummary] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let live = true;
    (async () => {
      try {
        const r = await fetch("/api/reports/summary", {
          method: "POST",
          body: JSON.stringify({
            metrics: metrics.map(({ label, value, unit, status, previous }) => ({ label, value, unit, status, previous })),
            reports: reports.map(({ title, provider, occurredAt, summary: s }) => ({ title, provider, occurredAt, summary: s })),
          }),
        });
        const d = await r.json();
        if (!live) return;
        if (d.summary) setSummary(d.summary);
        else setFailed(true);
      } catch {
        if (live) setFailed(true);
      }
    })();
    return () => { live = false; };
  }, [ready, metrics, reports]);

  return (
    <div className="pb-8">
      <ScreenHeader title="Reports" back="/app/record" subtitle={`${reports.length} lab report${reports.length === 1 ? "" : "s"} on your record`} />

      {metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => {
            const t = trendOf(m);
            return (
              <div key={m.key} className={cx("rounded-[18px] border p-4", m.status === "watch" ? "bg-gold-tint border-gold-border" : "bg-surface border-line")}>
                <div className="text-[12px] text-muted">{m.label}</div>
                <div className="display text-[24px] font-bold leading-none mt-1.5">
                  {m.value}
                  <span className="text-[12px] font-semibold text-muted ml-1">{m.unit}</span>
                </div>
                <div className={cx("text-[12px] mt-1.5 font-medium", m.status === "watch" ? "text-gold-text" : "text-teal")}>
                  {m.status === "watch" ? "Watch" : "In range"}
                </div>
                {t && <div className="text-[11.5px] text-faint mt-0.5">{t.text}</div>}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 bg-surface border border-line rounded-[18px] p-4">
        <div className="flex items-center gap-2 text-teal text-[12.5px] font-semibold"><Sparkles size={16} /> Summary</div>
        <p className="text-[14.5px] mt-2 leading-[1.5]">
          {summary || (failed ? "Couldn't build a summary just now. Your reports are listed below, unchanged." : "Reading your reports…")}
        </p>
        <p className="text-[11.5px] text-faint mt-3">Summary is AI-generated from your reports — not a diagnosis.</p>
      </div>

      <h2 className="text-[15px] font-bold mt-5 mb-2">Reports</h2>
      {reports.length === 0 ? (
        <p className="text-[14px] text-muted">No lab reports yet. They appear here as labs add them to your record.</p>
      ) : (
        <ul className="divide-y divide-divider bg-surface border border-line rounded-[18px] px-4">
          {reports.map((r) => (
            <li key={r.id} className="py-3.5">
              <div className="flex justify-between gap-3">
                <div className="font-semibold text-[14px]">{r.title}</div>
                <div className="text-[12px] text-faint shrink-0">{dayOf(r.occurredAt)}</div>
              </div>
              <div className="text-[12px] text-muted">{r.provider}</div>
              <p className="text-[13.5px] mt-1.5">{r.summary}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11.5px] text-faint mt-4">
        Reference ranges are the common adult ones and are a reading aid, not a verdict. Talk to a GP about anything marked watch.{" "}
        <Link href="/app/record" className="text-teal">Back to your record</Link>
      </p>
    </div>
  );
}
