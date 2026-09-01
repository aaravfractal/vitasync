/**
 * Pulls the handful of numbers a patient actually asks about out of lab-report
 * summaries, so /app/reports can show tiles instead of paragraphs.
 * Reference ranges are the common adult ones; they are a reading aid, not a verdict.
 */
import type { HealthRecord } from "./types";

export interface Metric {
  key: string;
  label: string;
  value: number;
  unit: string;
  status: "normal" | "watch";
  /** Older reading of the same metric, if an earlier report carried one. */
  previous?: number;
  at: string;
  from: string;
}

type Pattern = { key: string; label: string; unit: string; re: RegExp; ok: (n: number) => boolean };

const PATTERNS: Pattern[] = [
  { key: "hba1c", label: "HbA1c", unit: "%", re: /hba1c[^\d]{0,12}([\d.]+)/i, ok: (n) => n < 5.7 },
  { key: "ldl", label: "LDL", unit: "mg/dL", re: /\bldl[^\d]{0,12}([\d.]+)/i, ok: (n) => n < 100 },
  { key: "hb", label: "Haemoglobin", unit: "g/dL", re: /\bhb\b[^\d]{0,12}([\d.]+)/i, ok: (n) => n >= 12 },
  { key: "tsh", label: "TSH", unit: "mIU/L", re: /\btsh\b[^\d]{0,12}([\d.]+)/i, ok: (n) => n >= 0.4 && n <= 4 },
  { key: "vitd", label: "Vitamin D", unit: "ng/mL", re: /vitamin\s*d[^\d]{0,12}([\d.]+)/i, ok: (n) => n >= 30 },
  { key: "creatinine", label: "Creatinine", unit: "mg/dL", re: /creatinine[^\d]{0,12}([\d.]+)/i, ok: (n) => n <= 1.2 },
];

export const reportRecords = (records: HealthRecord[]) =>
  records.filter((r) => r.type === "report").sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

/** Latest reading per metric, with the previous one attached for a trend. */
export function extractMetrics(records: HealthRecord[]): Metric[] {
  const newestFirst = reportRecords(records);
  const out: Metric[] = [];
  for (const p of PATTERNS) {
    const hits = newestFirst
      .map((r) => ({ r, m: `${r.title} ${r.summary}`.match(p.re) }))
      .filter((h): h is { r: HealthRecord; m: RegExpMatchArray } => h.m !== null)
      .map((h) => ({ r: h.r, value: Number(h.m[1]) }))
      .filter((h) => Number.isFinite(h.value));
    if (!hits.length) continue;
    const [latest, prior] = hits;
    out.push({
      key: p.key,
      label: p.label,
      value: latest.value,
      unit: p.unit,
      status: p.ok(latest.value) ? "normal" : "watch",
      previous: prior?.value,
      at: latest.r.occurredAt,
      from: latest.r.provider,
    });
  }
  return out;
}

export function trendOf(m: Metric) {
  if (m.previous === undefined || m.previous === m.value) return null;
  const delta = m.value - m.previous;
  return { delta, text: `${delta > 0 ? "+" : "−"}${Math.abs(Number(delta.toFixed(2)))} vs ${m.previous}` };
}
