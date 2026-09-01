"use client";
import { Building2, FlaskConical } from "lucide-react";
import { Card, IconChip, Pill, ScreenHeader } from "@/components/ui";
import { useToast } from "@/components/toast";
import { useStore } from "@/lib/store";

export default function Clinics() {
  const { state } = useStore();
  const toast = useToast();
  const targets = ["Max Super Speciality", "Shri Mahant Indiresh", "CMI Hospital", "Apollo Pharmacy"];
  return (
    <>
      <ScreenHeader title="Connected clinics & labs" back="/app/profile" />
      <Card className="p-0 divide-y divide-divider">
        {state.clinics.map((c) => (
          <div key={c} className="flex items-center gap-3 p-4"><IconChip icon={/lab|diag/i.test(c) ? FlaskConical : Building2} size={42} /><div className="flex-1"><div className="font-semibold text-[14px]">{c}</div><div className="text-[12px] text-muted">Reports sync to your record with your OTP consent</div></div></div>
        ))}
      </Card>
      <h2 className="text-[15px] font-bold mt-5 mb-2">Coming to Dehradun</h2>
      <p className="text-[12.5px] text-muted mb-2">Partners we are working to onboard. Not yet live.</p>
      <Card className="p-0 divide-y divide-divider">{targets.map((t) => <div key={t} className="p-4 text-[14px] text-muted">{t}</div>)}</Card>
      <Pill variant="secondary" onClick={() => toast("Thanks. We'll reach out to them.")} className="w-full mt-5">Suggest a clinic</Pill>
    </>
  );
}
