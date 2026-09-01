"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Check } from "lucide-react";
import { Chip, Pill, ScreenHeader, cx } from "@/components/ui";
import { doctors } from "@/lib/demo-data";
import { uid, useStore, writeRecord } from "@/lib/store";
import { useToast } from "@/components/toast";

function Booking() {
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [f, setF] = useState<Record<string, boolean>>({ gp: true, today: params.get("slot") === "today", near: false, fee: false });
  const [sel, setSel] = useState<{ doc: string; slot: string } | null>(null);
  const [done, setDone] = useState<{ doc: string; slot: string } | null>(null);
  const { dispatch } = useStore();
  const toast = useToast();

  async function confirm(s: { doc: string; slot: string }) {
    const d = doctors.find((x) => x.id === s.doc)!;
    const today = new Date(); const [h, m] = s.slot.split(":").map(Number); today.setHours(h, m, 0, 0);
    dispatch({ type: "addAppointment", appt: { id: uid(), doctor: d.name, clinic: d.clinic, when: today.toISOString(), note: d.speciality } });
    await writeRecord(dispatch, { type: "consult", occurredAt: today.toISOString(), provider: `${d.name} · ${d.clinic}`, title: `Booked: ${d.speciality} consult`, summary: `Today ${s.slot}. Fee ₹${d.fee}. Your last symptom-check summary is shared with the doctor before the visit.` });
    setDone(s); toast("Booked and saved to your record");
  }

  const list = useMemo(() => doctors.filter((d) =>
    (!q || (d.name + d.speciality + d.clinic).toLowerCase().includes(q.toLowerCase())) &&
    (!f.gp || d.speciality === "General physician") && (!f.near || d.km <= 2) && (!f.fee || d.fee <= 500)), [q, f]);

  if (done) {
    const d = doctors.find((x) => x.id === done.doc)!;
    return (
      <>
        <ScreenHeader title="Booked" back="/app" />
        <div className="bg-surface border border-line rounded-[22px] p-5 text-center">
          <span className="inline-flex w-14 h-14 rounded-full bg-tint text-teal items-center justify-center"><Check size={28} /></span>
          <div className="display text-[20px] font-bold mt-3">{d.name}</div>
          <div className="text-muted text-[13.5px]">{d.clinic}</div>
          <div className="display text-[26px] font-bold text-teal mt-3">Today · {done.slot}</div>
          <p className="text-[13px] text-muted mt-3">Saved to your health record. Your doctor gets a summary of your last symptom check before the visit.</p>
          <Pill href="/app/record" className="w-full mt-4">View in record</Pill>
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title="Book a doctor" />
      <label className="flex items-center gap-2 bg-surface border border-line rounded-full px-4 min-h-[44px]">
        <Search size={18} className="text-faint" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Doctor, clinic or speciality" className="flex-1 bg-transparent outline-none text-[15px]" />
      </label>
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {[["gp", "GP"], ["today", "Today"], ["near", "Under 2 km"], ["fee", "Fee ≤ ₹500"]].map(([k, l]) => (
          <Chip key={k} active={f[k]} onClick={() => setF({ ...f, [k]: !f[k] })}>{l}</Chip>
        ))}
      </div>
      <div className="text-[12.5px] text-muted mt-3 mb-2">{list.length} doctors near you</div>
      <div className="space-y-3">
        {list.map((d) => (
          <div key={d.id} className="bg-surface border border-line rounded-[18px] p-4">
            <div className="flex gap-3">
              <span className="w-12 h-12 rounded-full bg-tint text-teal display font-bold flex items-center justify-center">{d.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("")}</span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[14.5px]">{d.name}</div>
                <div className="text-[12.5px] text-muted">{d.speciality} · {d.years} yrs · {d.clinic}</div>
              </div>
              <div className="text-right shrink-0"><div className="font-semibold text-[14px]">₹{d.fee}</div><div className="text-[12px] text-muted">{d.km} km</div></div>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {d.slots.map((s) => {
                const on = sel?.doc === d.id && sel.slot === s;
                return <button key={s} onClick={() => setSel({ doc: d.id, slot: s })} className={cx("rounded-[10px] px-3 min-h-[36px] text-[13px] border", on ? "bg-teal text-white border-teal" : "bg-surface border-line")}>{s}</button>;
              })}
              <Pill disabled={sel?.doc !== d.id} onClick={() => sel && confirm(sel)} className="ml-auto min-h-[36px] px-4 text-[13.5px]">Book</Pill>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[12.5px] text-muted mt-4">Booking saves to your health record automatically.</p>
    </>
  );
}

export default function Page() {
  return <Suspense><Booking /></Suspense>;
}
