"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Activity, Check, Droplets, Flame, Footprints, Loader2, Settings2, Watch } from "lucide-react";
import { Card, Pill, ScreenHeader, cx } from "@/components/ui";
import { Sheet } from "@/components/sheet";
import { Field } from "@/components/field";
import { useToast } from "@/components/toast";
import { useStore, writeRecord } from "@/lib/store";
import { dayOrEmpty, formatSteps, nextTickMs, seedDay, tickDelta, todayKey } from "@/lib/wellness";
import type { DeviceKind, WellnessTargets } from "@/lib/types";
import { Glasses, Ring } from "./ring";

const CATALOGUE: Array<{ kind: DeviceKind; name: string; platform: string }> = [
  { kind: "apple", name: "Apple Watch", platform: "Apple Health" },
  { kind: "wear", name: "Galaxy / Wear OS", platform: "Health Connect" },
  { kind: "fitbit", name: "Fitbit", platform: "Fitbit" },
  { kind: "band", name: "Generic fitness band", platform: "Bluetooth" },
];

const DEMO_NOTE = "Demo sync · real watch sync ships with the mobile app";

const ask = (q: string) => `/app/symptom?q=${encodeURIComponent(q)}`;

export default function Wellness() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [date, setDate] = useState(todayKey);
  const [connecting, setConnecting] = useState<DeviceKind | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<WellnessTargets>(state.targets);

  const day = dayOrEmpty(state.wellness, date);
  const t = state.targets;
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
        provider: device ? `${device.name} · demo sync` : "Logged by you",
        title: `Activity summary — ${formatSteps(day.steps)} steps, ${day.water}/${t.water} glasses`,
        summary: `${formatSteps(day.steps)} steps, ${day.calories} active kcal, ${day.activeMinutes} active minutes, ${day.water} of ${t.water} glasses of water. Figures are from demo sync, not a medical device.`,
      });
      dispatch({ type: "wellnessLogged", date });
    })();
  }, [date, day, t.water, device, state.lastWellnessLog, dispatch]);

  function connect(kind: DeviceKind) {
    if (connecting) return;
    const d = CATALOGUE.find((c) => c.kind === kind)!;
    setConnecting(kind);
    setTimeout(() => {
      const now = todayKey();
      setDate(now);
      dispatch({
        type: "connectDevice",
        device: { kind, name: d.name, platform: d.platform, connectedAt: new Date().toISOString() },
        day: seedDay(now, state.targets),
      });
      setConnecting(null);
      toast(`${d.name} connected · demo sync`);
    }, 1100);
  }

  function saveTargets() {
    dispatch({ type: "setTargets", targets: draft });
    setEditing(false);
    toast("Targets updated");
  }

  const metrics = [
    {
      key: "steps",
      icon: Footprints,
      label: "Steps",
      value: day.steps,
      target: t.steps,
      unit: "steps",
      shown: formatSteps(day.steps),
      q: `My watch says I walked ${formatSteps(day.steps)} steps today, against a target of ${formatSteps(t.steps)}. Is that enough for someone like me?`,
    },
    {
      key: "calories",
      icon: Flame,
      label: "Active kcal",
      value: day.calories,
      target: t.calories,
      unit: "kcal",
      shown: String(day.calories),
      q: `I burned about ${day.calories} active kcal today against a ${t.calories} kcal target. What should I make of that?`,
    },
    {
      key: "active",
      icon: Activity,
      label: "Active minutes",
      value: day.activeMinutes,
      target: t.activeMinutes,
      unit: "min",
      shown: String(day.activeMinutes),
      q: `I got ${day.activeMinutes} active minutes today against a ${t.activeMinutes} minute target. Is that enough movement?`,
    },
  ];

  return (
    <>
      <ScreenHeader
        title="Wellness"
        subtitle={device ? `${device.name} · ${device.platform}` : "No device connected"}
        right={
          <button
            onClick={() => { setDraft(state.targets); setEditing(true); }}
            aria-label="Edit targets"
            className="inline-flex items-center gap-1 rounded-full bg-surface border border-line px-3.5 min-h-[40px] text-[13px] font-semibold text-teal shrink-0"
          >
            <Settings2 size={15} /> Targets
          </button>
        }
      />

      <p className="inline-flex items-center gap-1.5 rounded-full bg-gold-tint border border-gold-border text-gold-text text-[12px] font-medium px-3 py-1.5">
        {DEMO_NOTE}
      </p>

      <h2 className="text-[15px] font-bold mt-5 mb-2">Connect a device</h2>
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
                  <><Loader2 size={13} className="animate-spin" /> Searching…</>
                ) : on ? (
                  <><Check size={13} /> Connected</>
                ) : (
                  "Tap to connect"
                )}
              </div>
            </button>
          );
        })}
      </div>
      {device && (
        <button onClick={() => { dispatch({ type: "disconnectDevice" }); toast("Device disconnected"); }} className="text-[13px] text-muted mt-2.5 min-h-[44px]">
          Disconnect {device.name}
        </button>
      )}

      <h2 className="text-[15px] font-bold mt-5 mb-2">Today, live</h2>
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
              <div className="text-[11.5px] text-faint mt-0.5">of {m.key === "steps" ? formatSteps(m.target) : m.target}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2.5 text-center">
          {metrics.map((m) => (
            <Link key={m.key} href={ask(m.q)} className="text-[11.5px] text-teal font-medium leading-tight">Ask the AI about this</Link>
          ))}
        </div>
        <p className="text-[11.5px] text-faint mt-3">
          {device ? `Updating every half minute or so while this screen is open. ${DEMO_NOTE}.` : "Connect a device to see steps, kcal and active minutes move."}
        </p>
      </Card>

      <Card className="mt-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-teal" />
            <div>
              <div className="font-semibold text-[14px]">Water</div>
              <div className="text-[12px] text-muted">{day.water} of {t.water} glasses</div>
            </div>
          </div>
          <button onClick={() => dispatch({ type: "addWater", date })} className="inline-flex items-center justify-center rounded-full bg-teal text-white px-4 min-h-[44px] text-[13.5px] font-semibold">
            + Add glass
          </button>
        </div>
        <div className="mt-3"><Glasses value={day.water} target={t.water} /></div>
        <Link href={ask(`I have had ${day.water} of ${t.water} glasses of water today. Should I be drinking more?`)} className="inline-block text-[12px] text-teal font-medium mt-2.5">
          Ask the AI about this
        </Link>
      </Card>

      <p className="text-[11.5px] text-faint mt-4">
        These figures come from demo sync, not a medical device, and a summary is added to your record once a day. Real Apple Health and Health Connect reads need the native app.
      </p>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Daily targets">
        <Field label="Steps" inputMode="numeric" value={String(draft.steps)} onChange={(e) => setDraft({ ...draft, steps: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
        <Field label="Active kcal burned" inputMode="numeric" value={String(draft.calories)} onChange={(e) => setDraft({ ...draft, calories: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
        <Field label="Active minutes" inputMode="numeric" value={String(draft.activeMinutes)} onChange={(e) => setDraft({ ...draft, activeMinutes: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
        <Field label="Glasses of water" inputMode="numeric" value={String(draft.water)} onChange={(e) => setDraft({ ...draft, water: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
        <Pill onClick={saveTargets} className="w-full">Save targets</Pill>
      </Sheet>
    </>
  );
}
