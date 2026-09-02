"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, Pill, ScreenHeader } from "@/components/ui";
import { Sheet } from "@/components/sheet";
import { Field, Select } from "@/components/field";
import { useToast } from "@/components/toast";
import { useStore, writeRecord } from "@/lib/store";
import { useT } from "@/lib/use-t";
import type { Key } from "@/lib/i18n";
import type { Vital } from "@/lib/types";

function Trend({ series }: { series: number[] }) {
  const w = 300, h = 90, pad = 6;
  const min = Math.min(...series), max = Math.max(...series);
  const pts = series.map((v, i) => [pad + (i * (w - 2 * pad)) / Math.max(1, series.length - 1), h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[90px]" aria-hidden>
      <path d={`${d} L${last[0]},${h} L${pts[0][0]},${h} Z`} fill="#0E7C66" fillOpacity="0.07" />
      <path d={d} fill="none" stroke="#0E7C66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#0E7C66" />
    </svg>
  );
}

const units: Record<Vital["metric"], string> = { bp: "mmHg", glucose: "mg/dL fasting", weight: "kg", hr: "bpm", spo2: "%" };
/** Metric names live in the dictionary; the units next to them never change. */
const labelKeys: Record<Vital["metric"], Key> = { bp: "vit.bp", glucose: "vit.glucose", weight: "vit.weight", hr: "vit.hr", spo2: "vit.spo2" };

export default function Vitals() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [metric, setMetric] = useState<Vital["metric"]>("bp");
  const [value, setValue] = useState("");
  const [bp, ...rest] = state.vitals;

  async function save() {
    if (!value.trim()) return;
    const prev = state.vitals.find((v) => v.metric === metric);
    const diff = prev ? `${Number(value) - Number(prev.value) >= 0 ? "+" : ""}${(Number(value) - Number(prev.value)).toFixed(1)}` : "";
    const delta = prev && metric !== "bp" ? t("vit.vsLast", { d: diff }) : t("vit.loggedJustNow");
    const status: Vital["status"] = metric === "bp" ? (Number(value.split("/")[0]) > 140 ? "watch" : "normal") : metric === "spo2" ? (Number(value) < 94 ? "watch" : "normal") : "normal";
    dispatch({ type: "addVital", vital: { metric, label: t(labelKeys[metric]), value, unit: units[metric], delta, status } });
    await writeRecord(dispatch, {
      type: "vital", occurredAt: new Date().toISOString(), provider: t("common.loggedByYou"),
      title: `${t(labelKeys[metric])} ${value} ${units[metric]}`,
      summary: status === "watch" ? t("vit.outOfRange") : t("vit.inRange"),
    });
    setOpen(false); setValue(""); toast(t("vit.logged"));
  }

  return (
    <>
      <ScreenHeader title={t("vit.title")} backLabel={t("common.back")} right={<button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-teal text-white px-4 min-h-[40px] text-[13.5px] font-semibold"><Plus size={16} /> {t("vit.log")}</button>} />
      <Card>
        <div className="flex justify-between items-start">
          <div><div className="text-[12.5px] text-muted">{t("vit.bp")}</div><div className="display text-[26px] font-bold leading-tight">{bp.value} <span className="text-[13px] text-muted font-medium">{bp.unit}</span></div></div>
          <span className={`rounded-full border text-[12px] font-medium px-3 py-1 ${bp.status === "normal" ? "bg-tint border-tint-border text-teal" : "bg-gold-tint border-gold-border text-gold-text"}`}>{bp.status === "normal" ? t("vit.normalRange") : t("vit.watch")}</span>
        </div>
        <div className="mt-2">{bp.series && bp.series.length > 1 && <Trend series={bp.series} />}</div>
        <div className="text-[11.5px] text-faint">{t("vit.lastN", { n: bp.series?.length ?? 0 })}</div>
      </Card>
      <div className="grid grid-cols-2 gap-3 mt-3">
        {rest.map((v) => (
          <button key={v.metric} onClick={() => { setMetric(v.metric); setOpen(true); }} className="text-left rounded-[18px] bg-surface border border-line p-4">
            <div className="text-[12.5px] text-muted">{t(labelKeys[v.metric])}</div>
            <div className="display text-[22px] font-bold leading-tight mt-1">{v.value} <span className="text-[12px] text-muted font-medium">{v.unit}</span></div>
            <div className={`text-[12px] mt-1 ${v.status === "normal" ? "text-teal" : "text-gold-text"}`}>{v.delta}</div>
          </button>
        ))}
      </div>
      <p className="text-[12.5px] text-muted mt-4">{t("vit.note")}</p>

      <Sheet open={open} onClose={() => setOpen(false)} title={t("vit.sheetTitle")}>
        <Select label={t("vit.metric")} value={metric} onChange={(e) => setMetric(e.target.value as Vital["metric"])}>
          {(Object.keys(labelKeys) as Vital["metric"][]).map((k) => <option key={k} value={k}>{t(labelKeys[k])}</option>)}
        </Select>
        <Field label={t("vit.valueLabel", { unit: units[metric] })} placeholder={metric === "bp" ? "120/80" : "e.g. 98"} value={value} onChange={(e) => setValue(e.target.value)} inputMode={metric === "bp" ? "text" : "decimal"} autoFocus />
        <Pill onClick={save} disabled={!value.trim()} className="w-full">{t("vit.save")}</Pill>
      </Sheet>
    </>
  );
}
