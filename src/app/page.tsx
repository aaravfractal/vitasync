import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo, Pill } from "@/components/ui";

const stats = [["10+", "clinics and labs targeted in Dehradun"], ["<60s", "from symptom to a next step"], ["SHA-256", "seal on every entry"], ["Anywhere", "one QR, any counter"]];

export default function Landing() {
  return (
    <main>
      <nav className="mx-auto max-w-[1180px] px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2"><Logo size={36} /><span className="display font-bold text-[17px]">VitaSync</span></Link>
        <div className="hidden md:flex items-center gap-7 text-[14px] text-muted">
          <a href="#how">How it works</a><a href="#clinics">For clinics</a><Link href="/pricing">Pricing</Link>
          <Pill href="/app" className="min-h-[40px] px-4 text-[14px]">Open dashboard</Pill>
        </div>
        <Pill href="/app" className="md:hidden min-h-[40px] px-4 text-[14px]">Open</Pill>
      </nav>

      <section className="mx-auto max-w-[1180px] px-6 pt-10 pb-16 grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-tint border border-tint-border text-teal text-[13px] font-medium px-3.5 py-1.5"><ShieldCheck size={15} /> We don&apos;t sell health data to anyone</span>
          <h1 className="display text-[40px] md:text-[52px] font-bold leading-[1.05] mt-5 max-w-[14ch]">The health app that actually connects the dots</h1>
          <p className="text-[17px] text-muted mt-5 max-w-[46ch]">Symptom check, vitals, doctor booking and refills in one place. Built in Dehradun.</p>
          <div className="flex gap-3 mt-7"><Pill href="/app/symptom">Check a symptom</Pill><Pill href="/app" variant="secondary">Open dashboard</Pill></div>
        </div>
        <div className="bg-surface border border-line rounded-[22px] p-5 max-w-[380px] md:justify-self-end w-full shadow-[0_20px_50px_-30px_rgba(30,43,40,.35)]">
          <div className="text-[12.5px] text-muted mb-3 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal" /> Private · saved only to your record</div>
          <div className="ml-auto max-w-[75%] bg-teal text-white px-4 py-2.5 rounded-[18px] rounded-br-[4px] text-[14px]">Dull headache since morning, no fever</div>
          <div className="max-w-[85%] bg-paper border border-line px-4 py-2.5 rounded-[18px] rounded-bl-[4px] text-[14px] mt-2">Is it on one side, or all over?</div>
          <div className="ml-auto max-w-[75%] bg-teal text-white px-4 py-2.5 rounded-[18px] rounded-br-[4px] text-[14px] mt-2">All over, since I woke up</div>
          <div className="bg-paper border border-line rounded-[16px] p-3.5 mt-3">
            <div className="overline text-gold-text">Recommended next step</div>
            <div className="display font-bold text-[15px] mt-0.5">Book a GP</div>
            <div className="text-[12.5px] text-muted">If sudden or one-sided, see a GP today</div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-[1180px] px-6 grid grid-cols-2 md:grid-cols-4 border-y border-line">
        {stats.map(([v, l], i) => (
          <div key={v} className={`py-7 px-4 ${i > 0 ? "md:border-l border-line" : ""}`}><div className="display text-[28px] font-bold text-teal">{v}</div><div className="text-[13px] text-muted">{l}</div></div>
        ))}
      </section>

      <section id="clinics" className="mx-auto max-w-[1180px] px-6 py-16 grid md:grid-cols-3 gap-6">
        {[["You own the record", "Encrypted on your device. Only a hash is anchored. Delete your account and everything goes."],
          ["Any doctor, full history", "Scan the QR at any counter. Emergency basics show instantly. The full file opens only with a code on your phone."],
          ["Built on the national stack", "Link your ABHA and pull records from any ABDM hospital, then seal them."]].map(([t, d]) => (
          <div key={t}><h3 className="text-[18px] font-bold">{t}</h3><p className="text-[15px] text-muted mt-2">{d}</p></div>
        ))}
      </section>

      <section className="bg-teal text-white">
        <div className="mx-auto max-w-[1180px] px-6 py-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div><h2 className="display text-[36px] font-bold">One record. Yours.</h2><p className="text-white/85 mt-2">Free to start · Plus ₹299/month · Family ₹499/month</p></div>
          <Pill href="/onboarding" variant="secondary" className="bg-white border-white text-teal">Get started</Pill>
        </div>
      </section>
      <footer className="mx-auto max-w-[1180px] px-6 py-8 text-[12.5px] text-faint">VitaSync AI · Built in Dehradun · hello@vitasync.ai</footer>
    </main>
  );
}
