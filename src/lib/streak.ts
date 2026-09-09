/**
 * Dashboard arithmetic: the streak, today's events, and the year-ago entry.
 *
 * Pure and React-free on purpose, the way i18n is — these are the numbers the
 * home screen makes claims with, and a claim about the patient's own behaviour
 * has to be checkable on its own. Every date here is a local YYYY-MM-DD key
 * (see `todayKey` in wellness.ts): an ISO slice would roll the day over at
 * 05:30 IST and hand somebody a broken streak overnight.
 */
import type { HealthRecord } from "./types";
import type { Appointment, Order, State } from "./store";

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** The day before a key, via a real Date so month and year ends behave. */
export function prevDay(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(y, m - 1, d);
  t.setDate(t.getDate() - 1);
  return dayKey(t);
}

/**
 * Consecutive days ending today — or ending yesterday, which still counts as a
 * live streak. Someone who logged last thing last night has not broken anything
 * by not having logged again at 8am, and a counter that resets at midnight
 * teaches people to distrust it.
 */
export function streakDays(activeDays: string[], today: string) {
  const seen = new Set(activeDays);
  let cursor = seen.has(today) ? today : prevDay(today);
  if (!seen.has(cursor)) return 0;
  let n = 0;
  while (seen.has(cursor)) {
    n += 1;
    cursor = prevDay(cursor);
  }
  return n;
}

export type TodayEvent = { id: string; kind: "record" | "booking" | "order" | "water"; text: string; at: string };

/**
 * What the patient did today, from what the store already holds. Ordered newest
 * first. Nothing is invented: a quiet day returns an empty list and the caller
 * shows nothing rather than filler.
 */
export function todayEvents(state: State, today: string): TodayEvent[] {
  const onDay = (iso: string) => {
    const t = new Date(iso);
    return !Number.isNaN(t.getTime()) && dayKey(t) === today;
  };
  const out: TodayEvent[] = [];
  state.records.filter((r: HealthRecord) => onDay(r.occurredAt)).forEach((r) =>
    out.push({ id: `r-${r.id}`, kind: "record", text: r.title, at: r.occurredAt }));
  state.appointments.filter((a: Appointment) => onDay(a.when)).forEach((a) =>
    out.push({ id: `a-${a.id}`, kind: "booking", text: `${a.doctor} · ${a.clinic}`, at: a.when }));
  state.orders.filter((o: Order) => onDay(o.at)).forEach((o) =>
    out.push({ id: `o-${o.id}`, kind: "order", text: `${o.medicine} × ${o.qty}`, at: o.at }));
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

/**
 * An entry from about a year ago, if there is one. The window is generous —
 * a year plus or minus a week — because "on this day" is a prompt to look back,
 * not an anniversary, and an exact-date match would almost never fire.
 */
export function onThisDay(records: HealthRecord[], today: string, windowDays = 7) {
  const [y, m, d] = today.split("-").map(Number);
  const target = new Date(y - 1, m - 1, d).getTime();
  const span = windowDays * 86400000;
  return (
    records
      .filter((r) => Math.abs(new Date(r.occurredAt).getTime() - target) <= span)
      .sort((a, b) =>
        Math.abs(new Date(a.occurredAt).getTime() - target) - Math.abs(new Date(b.occurredAt).getTime() - target))[0] ?? null
  );
}

/**
 * The same measurement taken since, and the change between them.
 *
 * Comparable means the same `label` on both records — an HbA1c against an
 * HbA1c, never against an LDL. Returns null when there is nothing honest to
 * subtract, and `better` comes from the metric's own `betterWhen` because
 * whether a smaller number is good news is clinical, not arithmetic.
 */
export function onThisDayDelta(records: HealthRecord[], old: HealthRecord) {
  const from = old.metric;
  if (!from) return null;
  const newer = records
    .filter((r) => r.id !== old.id && r.metric?.label === from.label && r.occurredAt > old.occurredAt)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
  const to = newer?.metric;
  if (!to) return null;
  const change = Number((to.value - from.value).toFixed(2));
  if (change === 0) return null;
  return { from, to, change, better: from.betterWhen === "lower" ? change < 0 : change > 0 };
}

/**
 * The milestone this state has just reached, or null. Thresholds are checked
 * against what has already been shown, so each one fires once and never again.
 */
export function milestoneFor(sealed: number, streak: number, shown: string[]): { key: string; kind: "sealed" | "streak"; n: number } | null {
  if (sealed >= 10 && !shown.includes("sealed-10")) return { key: "sealed-10", kind: "sealed", n: 10 };
  const blocks = Math.floor(streak / 30);
  if (blocks >= 1) {
    const key = `streak-${blocks * 30}`;
    if (!shown.includes(key)) return { key, kind: "streak", n: blocks * 30 };
  }
  return null;
}
