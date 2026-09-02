"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Activity, Check, Droplets, Flame, Footprints, Loader2, Settings2, Watch } from "lucide-react";
import { Card, Pill, ScreenHeader, cx } from "@/components/ui";
import { Sheet } from "@/components/sheet";
import { Field } from "@/components/field";
import { useToast } from "@/components/toast";
import { useStore, writeRecord } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { dayOrEmpty, formatSteps, nextTickMs, seedDay, tickDelta, todayKey } from "@/lib/wellness";
import type { DeviceKind, WellnessTargets } from "@/lib/types";
import { Glasses, Ring } from "./ring";

/** Device and platform names are brand names: never translated. */
const CATALOGUE: Array<{ kind: DeviceKind; name: string; platform: string }> = [
  { kind: "apple", name: "Apple Watch", platform: "Apple Health" },
  { kind: "wear", name: "Galaxy / Wear OS", platform: "Health Connect" },
  { kind: "fitbit", name: "Fitbit", platform: "Fitbit" },
  { kind: "band", name: "Generic fitness band", platform: "Bluetooth" },
];

const ask = (q: string) => `/app/symptom?q=${encodeURIComponent(q)}`;

export default function Wellness() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { t } = useT();
  const [date, setDate] = useState(todayKey);
  const [connecting, setConnecting] = useState<DeviceKind | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<WellnessTargets>(state.targets);

  const day = dayOrEmpty(state.wellness, date);
  const goals = state.targets;
  const device = state.device;

  // Simulated sync. Only while a device is paired and this screen is open —
  // there is no background service, and none is claimed.
  useEffect(() => {
    if (!device) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        const now = todayKey();
        setDate(now);
        dispatch({ type: "syncWellness", date: now, ...tickDelta() });
        schedule();
      }, nextTickMs());
    };
    schedule();
    return () => clearTimeout(timer);
  }, [device, dispatch]);

  // One activity summary per day, written to the record like any other entry.
  const logged = useRef(false);
  useEffect(() => {
    if (logged.current || state.lastWellnessLog === date) return;
    if (day.steps === 0 && day.water === 0) return;
    logged.current = true;
    (async () => {
      await writeRecord(dispatch, {
        type: "vital",
        occurredAt: new Date().toISOString(),
        provider: device ? t("wel.demoSync", { name: device.name }) : t("common.loggedByYou"),
        title: t("wel.summaryTitle", { steps: formatSteps(day.steps), a: day.water, b: goals.water }),
        summary: t("wel.summaryBody", { steps: formatSteps(day.steps), kcal: day.calories, min: day.activeMinutes, a: day.water, b: goals.water }),
      });
      dispatch({ type: "wellnessLogged", date });
    })();
  }, [date, day, goals.water, device, state.lastWellnessLog, dispatch, t]);

  function connect(kind: DeviceKind) {
    if (connecting) return;
    const dev = CATALOGUE.find((c) => c.kind === kind)!;
    setConnecting(kind);
    setTimeout(() => {
      const now = todayKey();
      setDate(now);
      dispatch({
        type: "connectDevice",
        device: { kind, name: dev.name, platform: dev.platform, connectedAt: new Date().toISOString() },
        day: seedDay(now, state.targets),
      });
      setConnecting(null);
      toast(t("wel.connectedToast", { name: dev.name }));
    }, 1100);
  }

  function saveTargets() {
    dispatch({ type: "setTargets", targets: draft });
    setEditing(false);
    toast(t("wel.saved"));
  }

  const metrics = [
    {
      key: "steps",
      icon: Footprints,
      label: t("wel.steps"),
      value: day.steps,
      target: goals.steps,
      unit: t("wel.steps"),
      shown: formatSteps(day.steps),
      q: t("wel.askSteps", { steps: formatSteps(day.steps), target: formatSteps(goals.steps) }),
    },
    {
      key: "calories",
      icon: Flame,
      label: t("wel.kcal"),
      value: day.calories,
      target: goals.calories,
      unit: "kcal",
      shown: String(day.calories),
      q: t("wel.askKcal", { kcal: day.calories, target: goals.calories }),
    },
    {
      key: "active",
      icon: Activity,
      label: t("wel.activeMin"),
      value: day.activeMinutes,
      target: goals.activeMinutes,
      unit: "min",
      shown: String(day.activeMinutes),
      q: t("wel.askMin", { min: day.activeMinutes, target: goals.activeMinutes }),
    },
  ];

  return (
    <>
      <ScreenHeader
        title={t("wel.title")}
        backLabel={t("common.back")}
        subtitle={device ? `${device.name} · ${device.platform}` : t("wel.noDevice")}
        right={
          <button
            onClick={() => { setDraft(state.targets); setEditing(true); }}
            aria-label={t("wel.targetsAria")}
            className="inline-flex items-center gap-1 rounded-full bg-surface border border-line px-3.5 min-h-[40px] text-[13px] font-semibold text-teal shrink-0"
          >
            <Settings2 size={15} /> {t("wel.targets")}
          </button>
        }
      />

      <p className="inline-flex items-center gap-1.5 rounded-full bg-gold-tint border border-gold-border text-gold-text text-[12px] font-medium px-3 py-1.5">
        {t("wel.demoNote")}
      </p>

      <h2 className="text-[15px] font-bold mt-5 mb-2">{t("wel.connect")}</h2>
      <div className="grid grid-cols-2 gap-3">
        {CATALOGUE.map((d) => {
          const on = device?.kind === d.kind;
          const busy = connecting === d.kind;
          return (
            <button
              key={d.kind}
              onClick={() => connect(d.kind)}
              disabled={!!connecting}
              className={cx("text-left rounded-[18px] border p-4 min-h-[104px] disabled:opacity-60", on ? "bg-tint border-tint-border" : "bg-surface border-line")}
            >
              <Watch size={20} strokeWidth={1.8} className={on ? "text-teal" : "text-muted"} />
              <div className="font-semibold text-[14px] mt-2.5">{d.name}</div>
              <div className="text-[12px] text-muted">{d.platform}</div>
              <div className={cx("text-[12px] font-medium mt-1.5 inline-flex items-center gap-1", on ? "text-teal" : "text-faint")}>
                {busy ? (
                  <><Loader2 size={13} className="animate-spin" /> {t("wel.searching")}</>
                ) : on ? (
                  <><Check size={13} /> {t("wel.connected")}</>
                ) : (
                  t("wel.tapConnect")
                )}
              </div>
            </button>
          );
        })}
      </div>
      {device && (
        <button onClick={() => { dispatch({ type: "disconnectDevice" }); toast(t("wel.disconnected")); }} className="text-[13px] text-muted mt-2.5 min-h-[44px]">
          {t("wel.disconnect", { name: device.name })}
        </button>
      )}

      <h2 className="text-[15px] font-bold mt-5 mb-2">{t("wel.today")}</h2>
      <Card>
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((m) => (
            <Ring key={m.key} value={m.value} target={m.target} label={m.label} unit={m.unit} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-1 text-center">
          {metrics.map((m) => (
            <div key={m.key}>
              <div className="display text-[17px] font-bold leading-none">{m.shown}</div>
              <div className="text-[11.5px] text-faint mt-0.5">{t("wel.of", { n: m.key === "steps" ? formatSteps(m.target) : m.target })}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2.5 text-center">
          {metrics.map((m) => (
            <Link key={m.key} href={ask(m.q)} className="text-[11.5px] text-teal font-medium leading-tight">{t("wel.askAi")}</Link>
          ))}
        </div>
        <p className="text-[11.5px] text-faint mt-3">
          {device ? t("wel.updating", { note: t("wel.demoNote") }) : t("wel.connectPrompt")}
        </p>
      </Card>

      <Card className="mt-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-teal" />
            <div>
              <div className="font-semibold text-[14px]">{t("wel.water")}</div>
              <div className="text-[12px] text-muted">{t("wel.glasses", { a: day.water, b: goals.water })}</div>
            </div>
          </div>
          <button onClick={() => dispatch({ type: "addWater", date })} className="inline-flex items-center justify-center rounded-full bg-teal text-white px-4 min-h-[44px] text-[13.5px] font-semibold">
            {t("wel.addGlass")}
          </button>
        </div>
        <div className="mt-3"><Glasses value={day.water} target={goals.water} /></div>
        <Link href={ask(t("wel.askWater", { a: day.water, b: goals.water }))} className="inline-block text-[12px] text-teal font-medium mt-2.5">
          {t("wel.askAi")}
        </Link>
      </Card>

      <p className="text-[11.5px] text-faint mt-4">{t("wel.footNote")}</p>

      <Sheet open={editing} onClose={() => setEditing(false)} title={t("wel.targetsSheet")}>
        <Field label={t("wel.tSteps")} inputMode="numeric" value={String(draft.steps)} onChange={(e) => setDraft({ ...draft, steps: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
        <Field label={t("wel.tKcal")} inputMode="numeric" value={String(draft.calories)} onChange={(e) => setDraft({ ...draft, calories: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
        <Field label={t("wel.tMin")} inputMode="numeric" value={String(draft.activeMinutes)} onChange={(e) => setDraft({ ...draft, activeMinutes: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
        <Field label={t("wel.tWater")} inputMode="numeric" value={String(draft.water)} onChange={(e) => setDraft({ ...draft, water: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
        <Pill onClick={saveTargets} className="w-full">{t("wel.saveTargets")}</Pill>
      </Sheet>
    </>
  );
}
