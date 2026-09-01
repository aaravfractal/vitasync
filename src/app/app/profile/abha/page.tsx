"use client";
import { Link2, RefreshCw, QrCode } from "lucide-react";
import { Card, IconChip, Pill, ScreenHeader } from "@/components/ui";
import { useToast } from "@/components/toast";
import { useStore } from "@/lib/store";

export default function Abha() {
  const { state } = useStore();
  const toast = useToast();
  const items = [["Pulls records from ABDM hospitals", "Any hospital on the national network can send reports to your record."], ["Consent stays with you", "Every pull needs your OTP and can be revoked from Privacy & access."], ["One ID at every counter", "Show your ABHA or VitaSync QR. Either works."]];
  return (
    <>
      <ScreenHeader title="ABHA" back="/app/profile" />
      <Card tone="tint" className="flex items-center gap-3">
        <IconChip icon={Link2} size={44} />
        <div><div className="font-semibold text-[15px]">Ayushman Bharat Health Account</div><div className="text-[12.5px] text-muted">{state.patient.abhaLinked ? "Linked · verified with ABDM" : "Not linked"}</div></div>
      </Card>
      <div className="mono text-[13px] text-muted mt-3">91-2381-4470-1129 · asha.rawat@abdm</div>
      <ul className="mt-4 space-y-3">{items.map(([t, d]) => <li key={t}><div className="font-semibold text-[14px]">{t}</div><div className="text-[13px] text-muted">{d}</div></li>)}</ul>
      <div className="flex gap-2 mt-5"><Pill href="/app/id" className="flex-1"><QrCode size={16} /> Show QR at desk</Pill><Pill variant="secondary" onClick={() => toast("Sync runs once ABDM sandbox access is live")} className="flex-1"><RefreshCw size={16} /> Sync now</Pill></div>
      <p className="text-[12px] text-faint mt-3">Last synced: 18 Aug, 08:05. ABDM integration is in sandbox; sync is simulated in this build.</p>
    </>
  );
}
