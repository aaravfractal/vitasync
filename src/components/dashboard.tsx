"use client";
import { useState } from "react";
import Link from "next/link";
import { CalendarClock, CalendarDays, FileText, Flame, PillBottle, Stethoscope, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { milestoneFor, onThisDay, onThisDayDelta, streakDays, todayEvents, type TodayEvent } from "@/lib/streak";
import { todayKey } from "@/lib/wellness";

/**
 * Home and Vitals furniture, all of it reading the store and inventing nothing.
 *
 * Each of these renders nothing at all when it has no honest answer: no streak,
 * no events today, no entry from a year ago. A dashboard that fills the gap
 * with a zero or a placeholder trains people to ignore it, and this one is
 * making claims about the patient's own behaviour back at them.
 */

/** Days in a row with a logged vital or glass of water. */
export function StreakRow({ className }: { className?: string }) {
  const { state } = useStore();
  const { t } = useT();
  const n = streakDays(state.activeDays, todayKey());
  if (n === 0) return null;
  return (
    <div className={`flex items-center gap-3 rounded-[18px] bg-surface border border-line p-4 ${className ?? ""}`}>
      <div className="w-[42px] h-[42px] rounded-[12px] bg-gold-tint text-gold-text flex items-center justify-center shrink-0">
        <Flame size={20} strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-[14px]">{n === 1 ? t("dash.streakOne") : t("dash.streakDays", { n })}</div>
        <div className="text-[12px] text-muted">{t("dash.streakSub")}</div>
      </div>
    </div>
  );
}

const eventIcon = { record: FileText, booking: Stethoscope, order: PillBottle, water: CalendarDays } as const;

/** What happened today, collapsible, hidden entirely on a quiet day. */
export function TodayFeed({ className }: { className?: string }) {
  const { state } = useStore();
  const { t, d } = useT();
  const [open, setOpen] = useState(true);
  const events = todayEvents(state, todayKey());
  if (events.length === 0) return null;
  return (
    <section className={`rounded-[18px] bg-surface border border-line p-4 ${className ?? ""}`}>
      <div className="flex items-center justify-between">
        <div className="font-semibold text-[14px]">
          {t("dash.today")} <span className="text-muted font-normal">· {t("dash.todayCount", { n: events.length })}</span>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="text-teal font-semibold text-[12.5px]">
          {open ? t("dash.hide") : t("dash.show")}
        </button>
      </div>
      {open && (
        <ul className="mt-2.5 space-y-2.5">
          {events.map((e: TodayEvent) => {
            const Icon = eventIcon[e.kind];
            return (
              <li key={e.id} className="flex items-center gap-2.5 text-[13px]">
                <Icon size={15} className="text-teal shrink-0" />
                <span className="flex-1 truncate">{e.text}</span>
                <span className="text-[11.5px] text-faint shrink-0">{d(e.at, { hour: "2-digit", minute: "2-digit" })}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/**
 * The entry from about a year ago, with the change since if the same
 * measurement has been taken again. Measurement names, numbers and units are
 * never translated (locked rule 5), so the comparison needs no copy of its own
 * — which also keeps an unreviewed Hindi string off the home screen.
 */
export function OnThisDay({ className }: { className?: string }) {
  const { state } = useStore();
  const { t, d } = useT();
  const r = onThisDay(state.records, todayKey());
  if (!r) return null;
  const delta = onThisDayDelta(state.records, r);
  return (
    <Link href="/app/record" className={`flex items-center gap-3 rounded-[18px] bg-surface border border-line p-4 ${className ?? ""}`}>
      <div className="w-[42px] h-[42px] rounded-[12px] bg-tint text-teal flex items-center justify-center shrink-0">
        <CalendarClock size={20} strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] text-muted">{t("dash.onThisDay")}</div>
        <div className="font-semibold text-[14px] truncate">{r.title}</div>
        {delta ? (
          <div className="flex items-center gap-1.5 mt-0.5 text-[12.5px]">
            <span className="mono text-muted">
              {delta.from.label} {delta.from.value}{delta.from.unit} → {delta.to.value}{delta.to.unit}
            </span>
            <span className={`mono font-semibold ${delta.better ? "text-teal" : "text-gold-text"}`}>
              {delta.change > 0 ? "+" : "−"}{Math.abs(delta.change)}
            </span>
          </div>
        ) : (
          <div className="text-[12px] text-muted">{d(r.occurredAt, { day: "numeric", month: "short", year: "numeric" })}</div>
        )}
      </div>
    </Link>
  );
}

/**
 * A milestone, once. Dismissible and sticky rather than a 2.4-second toast:
 * this is the one message worth reading, and the existing toast dock times out
 * before someone reading their home screen would notice it.
 */
export function MilestoneNote({ className }: { className?: string }) {
  const { state, dispatch } = useStore();
  const { t } = useT();
  const sealed = state.records.filter((r) => r.sha256).length;
  const m = milestoneFor(sealed, streakDays(state.activeDays, todayKey()), state.milestonesShown);
  if (!m) return null;
  return (
    <div role="status" className={`flex items-center gap-3 rounded-[18px] bg-gold-tint border border-gold-border p-3.5 ${className ?? ""}`}>
      <Flame size={18} className="text-gold-text shrink-0" />
      <p className="flex-1 text-[13.5px]">
        {m.kind === "sealed" ? t("dash.milestoneSealed", { n: m.n }) : t("dash.milestoneStreak", { n: m.n })}
      </p>
      <button aria-label={t("common.dismiss")} onClick={() => dispatch({ type: "markMilestone", key: m.key })} className="text-faint">
        <X size={16} />
      </button>
    </div>
  );
}

/** "Verified N times", for a ledger row. Silent until it has happened once. */
export function VerifyCount({ id, className }: { id: string; className?: string }) {
  const { state } = useStore();
  const { t } = useT();
  const n = state.verifyCounts[id] ?? 0;
  if (n === 0) return null;
  return <div className={`text-[11.5px] text-faint ${className ?? ""}`}>{n === 1 ? t("seal.verifiedOnce") : t("seal.verifiedTimes", { n })}</div>;
}
