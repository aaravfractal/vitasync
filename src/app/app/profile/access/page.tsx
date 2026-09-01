"use client";
import { Card, Pill, ScreenHeader } from "@/components/ui";
import { useToast } from "@/components/toast";
import { uid, useStore } from "@/lib/store";

export default function Access() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const active = state.grants.filter((g) => !g.revokedAt);
  const revoked = state.grants.filter((g) => g.revokedAt);
  function revoke(id: string, who: string) {
    dispatch({ type: "revokeGrant", id });
    dispatch({ type: "log", entry: { id: uid(), actor: "You", action: `revoked access for ${who}`, at: new Date().toISOString() } });
    toast("Access revoked");
  }
  return (
    <>
      <ScreenHeader title="Privacy & access" back="/app/profile" />
      <Card tone="tint" className="text-[13.5px]">We never sell your data. Every access is logged here. Delete your account and everything goes, except entries you chose to share.</Card>

      <h2 className="text-[15px] font-bold mt-5 mb-2">Who has access</h2>
      {active.length === 0 && <p className="text-muted text-[14px]">Nobody. Share your ID when you next see a doctor.</p>}
      <Card className="p-0 divide-y divide-divider">
        {active.map((g) => (
          <div key={g.id} className="flex items-center gap-3 p-4">
            <div className="flex-1"><div className="font-semibold text-[14px]">{g.grantee}</div><div className="text-[12px] text-muted">{g.scope} · until {new Date(g.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div></div>
            <Pill variant="secondary" onClick={() => revoke(g.id, g.grantee)} className="min-h-[34px] px-3 text-[12.5px] border-danger text-danger hover:bg-danger-tint">Revoke</Pill>
          </div>
        ))}
      </Card>
      {revoked.length > 0 && <p className="text-[12px] text-faint mt-2">{revoked.length} revoked</p>}

      <h2 className="text-[15px] font-bold mt-5 mb-2">Access log</h2>
      <Card className="p-0 divide-y divide-divider">
        {state.log.map((l) => (
          <div key={l.id} className="p-3.5 text-[13px]"><span className="font-medium">{l.actor}</span> <span className="text-muted">{l.action}</span><div className="text-[11.5px] text-faint">{new Date(l.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div></div>
        ))}
      </Card>
      <Pill href="/app/id" className="w-full mt-5">Share record with a doctor</Pill>
    </>
  );
}
