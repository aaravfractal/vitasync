"use client";
import { useState } from "react";
import Link from "next/link";
import { Stethoscope, FileText, PillBottle, HeartPulse, ShieldCheck, Siren, QrCode, BellRing, X } from "lucide-react";
import { Card, IconChip, Pill, VerifiedPill } from "@/components/ui";
import { useStore } from "@/lib/store";
import { daysUsed } from "@/lib/demo-data";

function greeting() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }

export default function Home() {
  const { state, dispatch } = useStore();
  const first = state.patient.name.split(" ")[0];
  const due = [...state.prescriptions].map((p) => p.daysPrescribed - daysUsed(p)).sort((a, b) => a - b)[0];
  const bp = state.vitals.find((v) => v.metric === "bp");
  const [now] = useState(() => Date.now());
  const next = [...state.appointments].sort((a, b) => a.when.localeCompare(b.when)).find((a) => new Date(a.when).getTime() >= now - 86400000) ?? state.appointments[0];
  const actions = [
    { href: "/app/book", icon: Stethoscope, title: "Book doctor", sub: "GPs near you, today" },
    { href: "/app/record", icon: FileText, title: "My records", sub: `${state.records.length} entries, sealed` },
    { href: "/app/refills", icon: PillBottle, title: "Refill", sub: due <= 0 ? "1 due now" : `1 due in ${due} days` },
    { href: "/app/vitals", icon: HeartPulse, title: "Vitals", sub: `BP ${bp?.value}, normal` },
  ];
  const d = next ? new Date(next.when) : null;

  return (
    <>
      <header className="flex items-start justify-between mb-3">
        <div><div className="text-[13px] text-muted">{greeting()}</div><h1 className="text-[26px] font-bold leading-tight">{first}</h1></div>
        <Link href="/app/profile" aria-label="Profile" className="w-11 h-11 rounded-full bg-teal text-white display font-bold flex items-center justify-center">{first[0]}</Link>
      </header>
      <VerifiedPill />

      {state.reminders.map((r) => (
        <div key={r.id} className="mt-3 flex items-center gap-3 bg-gold-tint border border-gold-border rounded-[18px] p-3.5">
          <BellRing size={18} className="text-gold-text shrink-0" />
          <div className="flex-1 text-[13.5px]">{r.text}</div>
          <Link href="/app/book" className="text-teal text-[13px] font-semibold">Book</Link>
          <button aria-label="Dismiss" onClick={() => dispatch({ type: "removeReminder", id: r.id })} className="text-faint"><X size={16} /></button>
        </div>
      ))}

      <Card tone="teal" className="mt-4 rounded-[22px] p-5">
        <div className="text-[20px] font-bold display leading-tight">Not feeling well?</div>
        <p className="text-[13.5px] text-white/85 mt-1 mb-4">Describe it in plain words. One question back, then a next step.</p>
        <Pill href="/app/symptom" variant="secondary" className="bg-white border-white text-teal">Check a symptom</Pill>
      </Card>

      <div className="grid grid-cols-2 gap-3 mt-3">
        {actions.map((a) => (
          <Link key={a.href} href={a.href} className="rounded-[18px] bg-surface border border-line p-4 hover:border-tint-border">
            <a.icon size={22} strokeWidth={1.8} className="text-teal" />
            <div className="font-semibold text-[14px] mt-3">{a.title}</div><div className="text-[12px] text-muted">{a.sub}</div>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Link href="/app/id" className="rounded-[18px] bg-surface border border-line p-4 flex items-center gap-3"><IconChip icon={QrCode} size={42} /><div><div className="font-semibold text-[14px]">My VitaSync ID</div><div className="text-[12px] text-muted">Share with a doctor</div></div></Link>
        <Link href="/app/emergency" className="rounded-[18px] bg-surface border border-line p-4 flex items-center gap-3"><IconChip icon={Siren} size={42} tone="danger" /><div><div className="font-semibold text-[14px]">Emergency</div><div className="text-[12px] text-muted">Nearest 24×7 help</div></div></Link>
      </div>

      {next && d && (
        <Card className="mt-3 flex items-center gap-3">
          <div className="w-[46px] h-[46px] rounded-[12px] bg-tint text-teal flex flex-col items-center justify-center leading-none">
            <span className="text-[10px] font-semibold">{d.toLocaleString("en-IN", { month: "short" }).toUpperCase()}</span>
            <span className="display text-[18px] font-bold">{d.getDate()}</span>
          </div>
          <div className="min-w-0 flex-1"><div className="font-semibold text-[14px] truncate">{next.doctor} · {next.clinic}</div><div className="text-[12px] text-muted">{d.toLocaleString("en-IN", { weekday: "short", hour: "2-digit", minute: "2-digit" })} · {next.note}</div></div>
          <Link href="/app/record" className="text-teal text-[13px] font-semibold">View</Link>
        </Card>
      )}
      <Link href="/app/vault" className="mt-3 flex items-center gap-2 text-[12.5px] text-muted"><ShieldCheck size={16} className="text-teal" /> Every entry is sealed with SHA-256. Nobody can change it.</Link>
    </>
  );
}
