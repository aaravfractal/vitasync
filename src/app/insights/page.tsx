"use client";
import { useState } from "react";
import Link from "next/link";
import { FlaskConical, Table2 } from "lucide-react";
import { Logo } from "@/components/ui";
import { CAMPS, SYMPTOMS, TOTALS, WEEKLY } from "@/lib/insights-data";
import { BarChart, DataTable, LineChart } from "./charts";

/**
 * A concept view for district health officers.
 *
 * Deliberately outside the phone frame: this is the one screen meant to be read
 * on a desk, in a meeting, next to other district dashboards.
 *
 * Everything on it is simulated (src/lib/insights-data.ts). VitaSync has zero
 * public users and no signed clinic partner, so there is nothing real to
 * aggregate — the banner below says exactly that and does not dismiss. There
 * are no government logos here and there will not be: nothing on this page is
 * endorsed by anyone.
 */
export default function Insights() {
  const [table, setTable] = useState(false);

  const tiles = [
    { label: "Camp registrations", value: TOTALS.registrations.toLocaleString("en-IN"), sub: `across ${TOTALS.camps} block camps` },
    { label: "Symptom checks", value: TOTALS.symptomChecks.toLocaleString("en-IN"), sub: "last 30 days" },
    { label: "Refill adherence", value: `${TOTALS.refillAdherence}%`, sub: "collected on time, of refills due" },
    { label: "Emergency strip scans", value: TOTALS.stripScans.toLocaleString("en-IN"), sub: "last 30 days" },
  ];

  return (
    <main className="min-h-dvh px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto max-w-[1080px]">
        <header className="flex items-center gap-2.5 mb-5">
          <Logo size={32} />
          <span className="display font-bold text-[17px]">VitaSync</span>
          <span className="text-faint">·</span>
          <span className="text-[15px] text-muted">District insights</span>
          <Link href="/" className="ml-auto text-[13.5px] text-teal font-semibold">Back to site</Link>
        </header>

        {/* Permanent. Not a dismissable notice — it is the most important thing here. */}
        <div className="flex items-start gap-2.5 bg-gold-tint border border-gold-border rounded-[18px] p-4 text-gold-text">
          <FlaskConical size={18} className="shrink-0 mt-0.5" />
          <p className="text-[13.5px] font-medium">
            Simulated data · concept view for district health officers · no real user data exists
          </p>
        </div>

        <h1 className="display text-[28px] font-bold mt-7">Dehradun district</h1>
        <p className="text-[15px] text-muted mt-1 max-w-[62ch]">
          What a block-level view would show once camps are running and a clinic partner is signed. The
          figures below are invented for this mock-up.
        </p>

        <section className="grid gap-3 mt-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="bg-surface border border-line rounded-[18px] p-5">
              <div className="text-[13px] text-muted">{t.label}</div>
              <div className="display text-[30px] font-bold mt-1 tabular-nums">{t.value}</div>
              <div className="text-[12.5px] text-faint mt-0.5">{t.sub}</div>
            </div>
          ))}
        </section>

        <button
          onClick={() => setTable((v) => !v)}
          aria-pressed={table}
          className="inline-flex items-center gap-2 mt-6 text-[13.5px] font-semibold text-teal min-h-[36px]"
        >
          <Table2 size={16} /> {table ? "Show charts" : "Show the numbers as tables"}
        </button>

        <section className="grid gap-4 mt-3 lg:grid-cols-2">
          <div className="bg-surface border border-line rounded-[18px] p-5">
            <h2 className="display text-[17px] font-bold">Camp registrations by week</h2>
            <p className="text-[12.5px] text-muted mb-3">Twelve weeks to 1 September</p>
            {table
              ? <DataTable head={["Week", "Registrations"]} rows={WEEKLY.map((w) => [w.week, w.registrations])} />
              : <LineChart data={WEEKLY.map((w) => ({ label: w.week, value: w.registrations }))} unit="registrations" />}
          </div>

          <div className="bg-surface border border-line rounded-[18px] p-5">
            <h2 className="display text-[17px] font-bold">Top symptom categories</h2>
            <p className="text-[12.5px] text-muted mb-4">Checks in the last 30 days</p>
            {table
              ? <DataTable head={["Category", "Checks"]} rows={SYMPTOMS.map((s) => [s.category, s.checks])} />
              : <BarChart data={SYMPTOMS.map((s) => ({ label: s.category, value: s.checks }))} unit="checks" />}
          </div>
        </section>

        <section className="bg-surface border border-line rounded-[18px] p-5 mt-4">
          <h2 className="display text-[17px] font-bold">Registrations by camp</h2>
          <DataTable head={["Block", "Registrations"]} rows={CAMPS.map((c) => [c.block, c.registrations])} />
        </section>

        <p className="text-[12.5px] text-faint mt-8 max-w-[62ch]">
          VitaSync is built in Dehradun and hosted in India. Partner hospitals and labs named elsewhere on
          this site are targets, not signed agreements. This page is a design concept and is not endorsed by
          any government body.
        </p>
      </div>
    </main>
  );
}
