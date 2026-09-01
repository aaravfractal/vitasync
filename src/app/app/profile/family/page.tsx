"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, Pill, ScreenHeader } from "@/components/ui";
import { Sheet } from "@/components/sheet";
import { Field, Select } from "@/components/field";
import { useToast } from "@/components/toast";
import { uid, useStore } from "@/lib/store";

export default function Family() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(""); const [relation, setRelation] = useState("Parent");
  return (
    <>
      <ScreenHeader title="Family members" back="/app/profile" right={<button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-teal text-white px-4 min-h-[40px] text-[13.5px] font-semibold"><Plus size={16} /> Add</button>} />
      <p className="text-[13.5px] text-muted mb-3">A nominated caregiver also receives the one-time code when a doctor requests your full record.</p>
      <Card className="p-0 divide-y divide-divider">
        {state.family.map((f) => (
          <div key={f.id} className="flex items-center gap-3 p-4">
            <span className="w-10 h-10 rounded-full bg-tint text-teal display font-bold flex items-center justify-center">{f.name[0]}</span>
            <div className="flex-1"><div className="font-semibold text-[14px]">{f.name}</div><div className="text-[12px] text-muted">{f.relation}{f.otpTarget ? " · receives approval codes" : ""}</div></div>
            <button onClick={() => { dispatch({ type: "toggleOtpTarget", id: f.id }); toast(f.otpTarget ? "Removed as caregiver" : "Now receives approval codes"); }} className={`rounded-full px-3 min-h-[34px] text-[12.5px] font-semibold border ${f.otpTarget ? "bg-teal text-white border-teal" : "text-teal border-teal"}`}>{f.otpTarget ? "Caregiver" : "Make caregiver"}</button>
          </div>
        ))}
      </Card>
      <p className="text-[12px] text-faint mt-3">Family plan: 4 profiles. {4 - state.family.length - 1} slot{4 - state.family.length - 1 === 1 ? "" : "s"} left.</p>
      <Sheet open={open} onClose={() => setOpen(false)} title="Add a family member">
        <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <Select label="Relation" value={relation} onChange={(e) => setRelation(e.target.value)}><option>Parent</option><option>Spouse</option><option>Child</option><option>Sibling</option><option>Other</option></Select>
        <Pill disabled={!name.trim()} onClick={() => { dispatch({ type: "addFamily", member: { id: uid(), name: name.trim(), relation, otpTarget: false } }); setName(""); setOpen(false); toast("Added"); }} className="w-full">Add member</Pill>
      </Sheet>
    </>
  );
}
