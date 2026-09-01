/**
 * Wellness helpers. The numbers here are a demo: until the native app ships
 * there is no HealthKit or Health Connect, so a "connected" device produces a
 * plausible day and drifts upward while the screen is open. Nothing here should
 * ever be described in the UI as a live reading from a real watch.
 */
import type { WellnessDay, WellnessTargets } from "./types";

/** Local date, not UTC — an ISO slice would roll the day over at 05:30 IST. */
export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const emptyDay = (date: string): WellnessDay => ({ date, steps: 0, calories: 0, activeMinutes: 0, water: 0 });

/** Yesterday's numbers must never show as today's. */
export const dayOrEmpty = (w: WellnessDay, date: string) => (w.date === date ? w : emptyDay(date));

/**
 * A believable partial day for the time of now, so a fresh pairing does not
 * show zeros at 4 pm. Waking hours are treated as 06:00–22:00.
 */
export function seedDay(date: string, t: WellnessTargets, now = new Date()): WellnessDay {
  const mins = now.getHours() * 60 + now.getMinutes();
  const frac = Math.max(0.06, Math.min(1, (mins - 6 * 60) / (16 * 60)));
  const jitter = () => 0.82 + Math.random() * 0.34;
  return {
    date,
    steps: Math.round((t.steps * frac * jitter()) / 10) * 10,
    calories: Math.round(t.calories * frac * jitter()),
    activeMinutes: Math.round(t.activeMinutes * frac * jitter()),
    water: 0, // the patient logs their own glasses
  };
}

/** One sync tick's worth of movement. Always non-negative, so a day only grows. */
export function tickDelta() {
  return {
    steps: 25 + Math.floor(Math.random() * 140),
    calories: 1 + Math.floor(Math.random() * 9),
    activeMinutes: Math.random() < 0.45 ? 1 : 0,
  };
}

/** 20–40 s, re-rolled each tick so it never looks metronomic. */
export const nextTickMs = () => 20_000 + Math.floor(Math.random() * 20_000);

export const pct = (value: number, target: number) => (target <= 0 ? 0 : Math.min(1, value / target));

export const formatSteps = (n: number) => n.toLocaleString("en-IN");
