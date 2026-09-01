"use client";
import { useState } from "react";
import { Card, Pill, ScreenHeader } from "@/components/ui";
import { Select } from "@/components/field";
import { useToast } from "@/components/toast";
import { hospitals } from "@/lib/demo-data";
import { uid, useStore } from "@/lib/store";

/** One-tap share on arrival: grants the chosen hospital a 24h full-record access and logs it. */
export default function EmergencyShare() {
  const { dispatch } = useStore();
  const toast = useToast();
  const [h, setH] = useState(hospitals[0].name);
  const [done, setDone] = useState(false);
  function grant() {
    const exp = new Date(Date.now() + 86400000).toISOString();
    dispatch({ type: "addGrant", grant: { id: uid(), grantee: `${h} · Emergency`, scope: "Full record (24 h)", since: new Date().toISOString().slice(0, 10), expiresAt: exp } });
    dispatch({ type: "log", entry: { id: uid(), actor: "You", action: `shared full record with ${h} for 24 h`, at: new Date().toISOString() } });
    setDone(true); toast("Shared for 24 hours");
  }
  return (
    <>
      <ScreenHeader title="Share on arrival" back="/app/emergency" />
      {done ? (
        <Card tone="tint"><div className="font-semibold text-[15px]">{h} can see your full record for 24 hours.</div><p className="text-[13px] text-muted mt-1">You can revoke it any time from Privacy &amp; access.</p><Pill href="/app/profile/access" variant="secondary" className="w-full mt-3">Manage access</Pill></Card>
      ) : (
        <Card>
          <Select label="Hospital" value={h} onChange={(e) => setH(e.target.value)}>{hospitals.map((x) => <option key={x.name}>{x.name}</option>)}</Select>
          <p className="text-[13px] text-muted mb-3">Grants full-record access for 24 hours. This is the one case where you approve from your side, so the desk never needs to ask for a code.</p>
          <Pill variant="danger" onClick={grant} className="w-full">Share my record now</Pill>
        </Card>
      )}
    </>
  );
}
