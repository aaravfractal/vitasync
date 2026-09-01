"use client";
import { useState } from "react";
import { PillBottle, Receipt } from "lucide-react";
import { Card, IconChip, Overline, Pill, ScreenHeader } from "@/components/ui";
import { Sheet } from "@/components/sheet";
import { Field, Select } from "@/components/field";
import { useToast } from "@/components/toast";
import { daysUsed } from "@/lib/demo-data";
import { uid, useStore, writeRecord, type Order } from "@/lib/store";
import type { Prescription } from "@/lib/types";

export default function Refills() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [ordering, setOrdering] = useState<Prescription | null>(null);
  const [receipt, setReceipt] = useState<Order | null>(null);
  const [pharmacy, setPharmacy] = useState("Apollo Pharmacy, Rajpur Rd");
  const [address, setAddress] = useState("Home · 14 Vasant Vihar, Dehradun");

  const withDays = state.prescriptions.map((p) => ({ ...p, used: daysUsed(p), left: p.daysPrescribed - daysUsed(p) }));
  const due = [...withDays].sort((a, b) => a.left - b.left)[0];

  async function placeOrder() {
    if (!ordering) return;
    const qty = ordering.daysPrescribed;
    const amount = Math.round(qty * 3.2);
    const order: Order = { id: uid(), medicine: ordering.medicine, qty, amount, pharmacy, at: new Date().toISOString(), status: "placed" };
    dispatch({ type: "addOrder", order });
    await writeRecord(dispatch, { type: "rx", occurredAt: order.at, provider: pharmacy, title: `Refill ordered: ${ordering.medicine}`, summary: `${qty} units · ₹${amount} · against ${ordering.prescriber}'s prescription. Delivery to ${address}.` });
    setOrdering(null); toast("Order placed. Receipt is in Last order.");
  }

  return (
    <>
      <ScreenHeader title="Refills" />
      <Card tone="gold">
        <Overline tone="gold">{due.left <= 0 ? "Due now" : `Due in ${due.left} day${due.left === 1 ? "" : "s"}`}</Overline>
        <div className="display text-[18px] font-bold mt-1">{due.medicine}</div>
        <div className="text-[13px] text-muted">{due.dosage} · {due.prescriber}</div>
        <div className="mt-3 h-2 rounded-full bg-gold-border overflow-hidden"><div className="h-full bg-gold" style={{ width: `${(due.used / due.daysPrescribed) * 100}%` }} /></div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[12px] text-muted">{due.used} of {due.daysPrescribed} days used</span>
          <Pill onClick={() => setOrdering(due)} className="min-h-[38px] px-4 text-[13.5px]">Reorder</Pill>
        </div>
      </Card>

      <h2 className="text-[15px] font-bold mt-5 mb-2">Active prescriptions</h2>
      <Card className="p-0 divide-y divide-divider">
        {withDays.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-4">
            <IconChip icon={PillBottle} size={42} />
            <div className="min-w-0 flex-1"><div className="font-semibold text-[14px] truncate">{p.medicine}</div><div className="text-[12px] text-muted">{p.dosage} · {p.left} days left</div></div>
            <Pill variant="secondary" onClick={() => setOrdering(p)} className="min-h-[36px] px-3.5 text-[13px]">Reorder</Pill>
          </div>
        ))}
      </Card>

      <h2 className="text-[15px] font-bold mt-5 mb-2">Last order{state.orders.length > 1 ? "s" : ""}</h2>
      <Card className="p-0 divide-y divide-divider">
        {state.orders.slice(0, 3).map((o) => (
          <div key={o.id} className="flex items-center gap-3 p-4">
            <IconChip icon={Receipt} size={42} />
            <div className="flex-1 min-w-0"><div className="font-semibold text-[14px] truncate">{o.medicine} × {o.qty}</div><div className="text-[12px] text-muted">{new Date(o.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ₹{o.amount} · {o.status}</div></div>
            <button onClick={() => setReceipt(o)} className="text-teal text-[13px] font-semibold">Receipt</button>
          </div>
        ))}
      </Card>
      <p className="text-[12.5px] text-muted mt-4">Refills need a valid prescription on your record.</p>

      <Sheet open={!!ordering} onClose={() => setOrdering(null)} title="Reorder">
        {ordering && (
          <>
            <div className="bg-tint border border-tint-border rounded-[14px] p-3.5 mb-4"><div className="font-semibold text-[15px]">{ordering.medicine}</div><div className="text-[12.5px] text-muted">{ordering.dosage} · {ordering.daysPrescribed} days · Rx by {ordering.prescriber}</div></div>
            <Select label="Pharmacy" value={pharmacy} onChange={(e) => setPharmacy(e.target.value)}>
              <option>Apollo Pharmacy, Rajpur Rd</option><option>Doon Medicos, Paltan Bazaar</option><option>Wellness Forever, Vasant Vihar</option>
            </Select>
            <Field label="Deliver to" value={address} onChange={(e) => setAddress(e.target.value)} />
            <div className="flex items-center justify-between text-[14px] mb-4"><span className="text-muted">Estimated total</span><span className="display font-bold text-[18px]">₹{Math.round(ordering.daysPrescribed * 3.2)}</span></div>
            <Pill onClick={placeOrder} className="w-full">Place order</Pill>
            <p className="text-[11.5px] text-faint mt-2">Pharmacy fulfilment is simulated until a partner is signed.</p>
          </>
        )}
      </Sheet>
      <Sheet open={!!receipt} onClose={() => setReceipt(null)} title="Receipt">
        {receipt && (
          <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-[14px]">
            <dt className="text-muted">Item</dt><dd className="font-medium">{receipt.medicine} × {receipt.qty}</dd>
            <dt className="text-muted">Pharmacy</dt><dd>{receipt.pharmacy}</dd>
            <dt className="text-muted">Date</dt><dd>{new Date(receipt.at).toLocaleString("en-IN")}</dd>
            <dt className="text-muted">Status</dt><dd className="text-teal font-medium">{receipt.status}</dd>
            <dt className="text-muted">Total</dt><dd className="display font-bold text-[18px]">₹{receipt.amount}</dd>
          </dl>
        )}
      </Sheet>
    </>
  );
}
