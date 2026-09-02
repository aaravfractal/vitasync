"use client";
import { useState } from "react";
import Link from "next/link";
import { Stethoscope, FileText, PillBottle, HeartPulse, ShieldCheck, Siren, QrCode, BellRing, X, Activity, ChevronRight } from "lucide-react";
import { Card, IconChip, Pill, VerifiedPill } from "@/components/ui";
import { UploadReportCard, UploadReportSheet } from "@/components/upload-report";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { daysUsed } from "@/lib/demo-data";
import { dayOrEmpty, formatSteps, todayKey } from "@/lib/wellness";
import type { Key } from "@/lib/i18n";

const greetingKey = (): Key => { const h = new Date().getHours(); return h < 12 ? "home.morning" : h < 17 ? "home.afternoon" : "home.evening"; };

export default function Home() {
  const { state, dispatch } = useStore();
  const { t, d } = useT();
  const first = state.patient.name.split(" ")[0];
  const due = [...state.prescriptions].map((p) => p.daysPrescribed - daysUsed(p)).sort((a, b) => a - b)[0];
  const bp = state.vitals.find((v) => v.metric === "bp");
  const [now] = useState(() => Date.now());
  const [upload, setUpload] = useState(false);
  const next = [...state.appointments].sort((a, b) => a.when.localeCompare(b.when)).find((a) => new Date(a.when).getTime() >= now - 86400000) ?? state.appointments[0];
  const actions = [
    { href: "/app/book", icon: Stethoscope, title: t("home.bookDoctor"), sub: t("home.bookDoctorSub") },
    { href: "/app/record", icon: FileText, title: t("home.myRecords"), sub: t("home.myRecordsSub", { n: state.records.length }) },
    { href: "/app/refills", icon: PillBottle, title: t("home.refill"), sub: due <= 0 ? t("home.refillDueNow") : t("home.refillDueIn", { n: due }) },
    { href: "/app/vitals", icon: HeartPulse, title: t("nav.vitals"), sub: t("home.vitalsSub", { v: bp?.value ?? "" }) },
  ];
  const appt = next ? new Date(next.when) : null;
  const day = dayOrEmpty(state.wellness, todayKey());

  return (
    <>
      <header className="flex items-start justify-between mb-3">
        <div><div className="text-[13px] text-muted">{t(greetingKey())}</div><h1 className="text-[26px] font-bold leading-tight">{first}</h1></div>
        <Link href="/app/profile" aria-label={t("home.profileAria")} className="w-11 h-11 rounded-full bg-teal text-white display font-bold flex items-center justify-center">{first[0]}</Link>
      </header>
      <VerifiedPill text={t("home.verified")} />

      {state.reminders.map((r) => (
        <div key={r.id} className="mt-3 flex items-center gap-3 bg-gold-tint border border-gold-border rounded-[18px] p-3.5">
          <BellRing size={18} className="text-gold-text shrink-0" />
          <div className="flex-1 text-[13.5px]">{r.text}</div>
          <Link href="/app/book" className="text-teal text-[13px] font-semibold">{t("common.book")}</Link>
          <button aria-label={t("common.dismiss")} onClick={() => dispatch({ type: "removeReminder", id: r.id })} className="text-faint"><X size={16} /></button>
        </div>
      ))}

      <Card tone="teal" className="mt-4 rounded-[22px] p-5">
        <div className="text-[20px] font-bold display leading-tight">{t("home.notWell")}</div>
        <p className="text-[13.5px] text-white/85 mt-1 mb-4">{t("home.notWellSub")}</p>
        <Pill href="/app/symptom" variant="secondary" className="bg-white border-white text-teal">{t("home.checkSymptom")}</Pill>
      </Card>

      <Link href="/app/wellness" className="mt-3 rounded-[18px] bg-surface border border-line p-4 flex items-center gap-3 hover:border-tint-border">
        <IconChip icon={Activity} size={42} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-[14px]">{t("home.wellness")}</div>
          <div className="text-[12px] text-muted">
            {state.device
              ? t("home.wellnessOn", { steps: formatSteps(day.steps), a: day.water, b: state.targets.water })
              : t("home.wellnessOff")}
          </div>
        </div>
        <ChevronRight size={18} className="text-faint shrink-0" />
      </Link>

      <UploadReportCard onClick={() => setUpload(true)} className="mt-3" />

      <div className="grid grid-cols-2 gap-3 mt-3">
        {actions.map((a) => (
          <Link key={a.href} href={a.href} className="rounded-[18px] bg-surface border border-line p-4 hover:border-tint-border">
            <a.icon size={22} strokeWidth={1.8} className="text-teal" />
            <div className="font-semibold text-[14px] mt-3">{a.title}</div><div className="text-[12px] text-muted">{a.sub}</div>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Link href="/app/id" className="rounded-[18px] bg-surface border border-line p-4 flex items-center gap-3"><IconChip icon={QrCode} size={42} /><div><div className="font-semibold text-[14px]">{t("home.myId")}</div><div className="text-[12px] text-muted">{t("home.myIdSub")}</div></div></Link>
        <Link href="/app/emergency" className="rounded-[18px] bg-surface border border-line p-4 flex items-center gap-3"><IconChip icon={Siren} size={42} tone="danger" /><div><div className="font-semibold text-[14px]">{t("nav.emergency")}</div><div className="text-[12px] text-muted">{t("home.emergencySub")}</div></div></Link>
      </div>

      {next && appt && (
        <Card className="mt-3 flex items-center gap-3">
          <div className="w-[46px] h-[46px] rounded-[12px] bg-tint text-teal flex flex-col items-center justify-center leading-none">
            <span className="text-[10px] font-semibold">{d(appt, { month: "short" }).toUpperCase()}</span>
            <span className="display text-[18px] font-bold">{appt.getDate()}</span>
          </div>
          <div className="min-w-0 flex-1"><div className="font-semibold text-[14px] truncate">{next.doctor} · {next.clinic}</div><div className="text-[12px] text-muted">{d(appt, { weekday: "short", hour: "2-digit", minute: "2-digit" })} · {next.note}</div></div>
          <Link href="/app/record" className="text-teal text-[13px] font-semibold">{t("common.view")}</Link>
        </Card>
      )}
      <Link href="/app/vault" className="mt-3 flex items-center gap-2 text-[12.5px] text-muted"><ShieldCheck size={16} className="text-teal" /> {t("home.sealNote")}</Link>
      <UploadReportSheet open={upload} onClose={() => setUpload(false)} />
    </>
  );
}
