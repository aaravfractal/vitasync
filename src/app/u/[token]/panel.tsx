"use client";
import { ShieldCheck } from "lucide-react";
import { useT } from "@/lib/use-t";
import type { HealthRecord } from "@/lib/types";

/**
 * Everything past the emergency strip is read at leisure by the person holding
 * the phone, so it follows their own language rather than stacking both. The
 * strip above is the part that must never need a decision.
 */
export function FullRecordPanel({ records }: { records: HealthRecord[] }) {
  const { t, d } = useT();
  return (
    <div className="bg-surface border border-line rounded-[22px] p-4">
      <div className="flex items-center gap-2 text-teal text-[12.5px] font-medium"><ShieldCheck size={16} /> {t("u.approved")}</div>
      <h2 className="text-[17px] font-bold mt-3">{t("u.fullRecord")}</h2>
      <ul className="divide-y divide-divider mt-2">
        {records.map((r) => (
          <li key={r.id} className="py-3">
            <div className="flex justify-between gap-2">
              <span className="font-semibold text-[14px]">{r.title}</span>
              <span className="text-[12px] text-faint">{d(r.occurredAt, { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <div className="text-[12px] text-muted">{r.provider}</div>
            <p className="text-[13.5px] mt-1">{r.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ShareFooter() {
  const { t } = useT();
  return <p className="text-[11.5px] text-faint mt-6">{t("u.foot")}</p>;
}
