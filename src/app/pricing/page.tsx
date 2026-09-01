import Link from "next/link";
import { Check } from "lucide-react";
import { Logo, Pill } from "@/components/ui";

const tiers = [
  { name: "Free", price: "₹0", per: "forever", hot: false, items: ["AI assistant, 5 chats a day", "Basic dashboard", "Medication reminders", "Emergency ID, always free"] },
  { name: "Plus", price: "₹299", per: "per month", hot: true, items: ["Unlimited AI", "Full dashboard and insights", "2 free consults a month", "Medication tracker", "Physical health ID card"] },
  { name: "Family", price: "₹499", per: "per month", hot: false, items: ["4 family profiles", "Caregiver approves sharing for parents", "Priority consult slots", "Everything in Plus"] },
];

export default function Pricing() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-6">
      <Link href="/" className="flex items-center gap-2 mb-10"><Logo size={36} /><span className="display font-bold text-[17px]">VitaSync</span></Link>
      <h1 className="display text-[36px] md:text-[44px] font-bold">Simple pricing. Records free forever.</h1>
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {tiers.map((t) => (
          <div key={t.name} className={`rounded-[22px] p-6 border ${t.hot ? "bg-tint border-teal" : "bg-surface border-line"}`}>
            {t.hot && <span className="inline-block rounded-full bg-gold text-ink text-[11px] font-bold px-2.5 py-1 mb-3">Most popular</span>}
            <div className="text-[15px] font-semibold text-muted">{t.name}</div>
            <div className="display text-[40px] font-bold text-teal leading-none mt-1">{t.price}</div>
            <div className="text-[13px] text-faint">{t.per}</div>
            <ul className="mt-5 space-y-2.5">{t.items.map((i) => <li key={i} className="flex gap-2 text-[14.5px]"><Check size={18} className="text-teal shrink-0" /> {i}</li>)}</ul>
            <Pill href={`/onboarding?plan=${t.name.toLowerCase()}`} variant={t.hot ? "primary" : "secondary"} className="w-full mt-6">{t.name === "Free" ? "Start free" : `Choose ${t.name}`}</Pill>
          </div>
        ))}
      </div>
      <p className="text-center text-[12.5px] text-faint mt-10">No card needed for Free · Cancel anytime · We don&apos;t sell health data</p>
    </main>
  );
}
