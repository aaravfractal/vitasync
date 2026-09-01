"use client";
import { ShieldCheck } from "lucide-react";
import { Card, Pill, ScreenHeader, StatRow } from "@/components/ui";
import { useToast } from "@/components/toast";
import { useStore } from "@/lib/store";
import { shortHash } from "@/lib/hash";

export default function Vault() {
  const { state } = useStore();
  const toast = useToast();
  const active = state.grants.filter((g) => !g.revokedAt);
  function downloadAll() {
    const blob = new Blob([JSON.stringify({ patient: state.patient, records: state.records, vitals: state.vitals, prescriptions: state.prescriptions, accessLog: state.log }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `vitasync-${state.patient.id}.json`; a.click();
    toast("Your full record has been downloaded");
  }
  return (
    <>
      <ScreenHeader title="Your ledger" />
      <Card tone="teal" className="rounded-[22px] p-5">
        <ShieldCheck size={36} strokeWidth={1.6} />
        <div className="display text-[20px] font-bold mt-3">This record belongs to you</div>
        <p className="text-[13.5px] text-white/85 mt-1">Every entry is sealed with SHA-256. Nobody can change it, not a hospital, not us.</p>
      </Card>
      <Card className="mt-3"><StatRow items={[{ value: String(state.records.filter((r) => r.sha256).length), label: "entries sealed" }, { value: String(active.length), label: "with access" }, { value: "0", label: "third parties" }]} /></Card>

      <h2 className="text-[15px] font-bold mt-5 mb-2">Recent seals</h2>
      <Card className="p-0 divide-y divide-divider">
        {[...state.records].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 6).map((r) => (
          <div key={r.id} className="flex items-center justify-between p-3.5 text-[13px]">
            <div className="min-w-0"><div className="font-medium truncate">{r.title}</div><div className="mono text-[12px] text-muted">{shortHash(r.sha256)}</div></div>
            <span className="text-[11.5px] text-faint">{new Date(r.occurredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          </div>
        ))}
      </Card>
      <p className="text-[12px] text-faint mt-3">Hashing runs live in your browser. Anchoring on Polygon testnet is next; until then, seals are local.</p>
      <div className="flex gap-2 mt-4">
        <Pill variant="secondary" href="/app/profile/access" className="flex-1">Manage access</Pill>
        <Pill variant="secondary" onClick={downloadAll} className="flex-1">Download all</Pill>
      </div>
    </>
  );
}
