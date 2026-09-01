"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, KeyRound, Building2, Languages, LifeBuoy, ShieldCheck, ChevronRight, Link2 } from "lucide-react";
import { Card, IconChip, ScreenHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import { clearAttachments } from "@/lib/attachments";

export default function Profile() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const p = state.patient;
  const rows = [
    { href: "/app/profile/family", icon: Users, label: "Family members", sub: `${state.family.length} linked` },
    { href: "/app/profile/access", icon: KeyRound, label: "Privacy & access", sub: `${state.grants.filter((g) => !g.revokedAt).length} with access · ${state.log.length} events logged` },
    { href: "/app/profile/clinics", icon: Building2, label: "Connected clinics & labs", sub: String(state.clinics.length) },
    { href: "/app/profile/abha", icon: Link2, label: "ABHA", sub: p.abhaLinked ? "Linked · verified with ABDM" : "Not linked" },
    { href: "/app/profile/language", icon: Languages, label: "Language", sub: state.language === "hi" ? "हिन्दी" : "English" },
    { href: "/app/profile/help", icon: LifeBuoy, label: "Help & support", sub: "" },
  ];
  return (
    <>
      <ScreenHeader title="Profile" />
      <div className="flex items-center gap-4">
        <span className="w-[60px] h-[60px] rounded-full bg-teal text-white display text-[22px] font-bold flex items-center justify-center">{p.name[0]}</span>
        <div><div className="display text-[20px] font-bold">{p.name}</div><div className="text-[13px] text-muted">{p.phoneMasked} · {p.city}</div><div className="mono text-[12px] text-faint">{p.id}</div></div>
      </div>
      <Link href="/app/vault" className="mt-4 flex items-center gap-3 bg-tint border border-tint-border rounded-[18px] p-4">
        <IconChip icon={ShieldCheck} size={42} />
        <div className="flex-1"><div className="font-semibold text-[14px]">Data ownership</div><div className="text-[12.5px] text-muted">You own the record. We never sell your data.</div></div>
        <ChevronRight size={18} className="text-faint" />
      </Link>
      <Card className="mt-3 p-0 divide-y divide-divider">
        {rows.map((r) => (
          <Link key={r.label} href={r.href} className="w-full flex items-center gap-3 p-4 text-left">
            <r.icon size={20} strokeWidth={1.8} className="text-teal" />
            <div className="flex-1"><div className="text-[14px] font-medium">{r.label}</div>{r.sub && <div className="text-[12px] text-muted">{r.sub}</div>}</div>
            <ChevronRight size={18} className="text-faint" />
          </Link>
        ))}
      </Card>
      <Card className="mt-3"><button onClick={() => { clearAttachments(); dispatch({ type: "signOut" }); router.push("/onboarding"); }} className="w-full text-left text-danger font-semibold text-[14px]">Sign out</button></Card>
      <p className="text-center text-[11.5px] text-faint mt-6">VitaSync AI · v1.4 · Built in Dehradun</p>
    </>
  );
}
