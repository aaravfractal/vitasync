import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Phone, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui";
import { patient, records } from "@/lib/demo-data";
import { sessionValid } from "@/lib/share";
import { FullRecordGate } from "./gate";

export const dynamic = "force-dynamic";

/** Two-tier medical ID. Emergency strip: no OTP, ever. Full record: OTP to the patient/caregiver. */
export default async function PublicId({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (token !== patient.shareToken) notFound();
  const jar = await cookies();
  const unlocked = sessionValid(jar.get(`vs_share_${token}`)?.value, token);

  return (
    <main className="screen pb-10">
      <div className="flex items-center gap-2 mb-5"><Logo size={36} /><span className="display font-bold text-[17px]">VitaSync</span><span className="ml-auto text-[12px] text-faint">Patient health ID</span></div>

      <section className="bg-surface border border-line rounded-[22px] overflow-hidden">
        <div className="bg-danger-tint text-danger px-4 py-2 font-bold text-[13px] tracking-wide">EMERGENCY · no code needed</div>
        <div className="p-4">
          <div className="display text-[24px] font-bold">{patient.name}</div>
          <div className="mono text-[12.5px] text-muted">{patient.id} · {patient.city}</div>
          <dl className="grid grid-cols-[110px_1fr] gap-y-2.5 mt-4 text-[15px]">
            <dt className="text-muted">Blood group</dt><dd className="display text-[28px] font-bold text-teal leading-none">{patient.bloodGroup}</dd>
            <dt className="text-muted">Allergies</dt><dd className="font-semibold">{patient.allergies.join(", ")}</dd>
            <dt className="text-muted">Emergency meds</dt><dd className="font-semibold">{patient.emergencyMeds.join(", ")}</dd>
            <dt className="text-muted">ICE</dt><dd className="font-semibold">{patient.ice.name} ({patient.ice.relation})<br /><a href={`tel:${patient.ice.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 text-teal mt-1"><Phone size={16} /> {patient.ice.phone}</a></dd>
          </dl>
          <p className="mt-4 text-[13.5px]" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>डॉक्टर: आपातकालीन जानकारी बिना OTP। पूरी फ़ाइल OTP के बाद।</p>
        </div>
      </section>

      <section className="mt-4">
        {unlocked ? (
          <div className="bg-surface border border-line rounded-[22px] p-4">
            <div className="flex items-center gap-2 text-teal text-[12.5px] font-medium"><ShieldCheck size={16} /> Approved by the patient · this session only · logged</div>
            <h2 className="text-[17px] font-bold mt-3">Full record</h2>
            <ul className="divide-y divide-divider mt-2">
              {records.map((r) => (
                <li key={r.id} className="py-3">
                  <div className="flex justify-between gap-2"><span className="font-semibold text-[14px]">{r.title}</span><span className="text-[12px] text-faint">{new Date(r.occurredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
                  <div className="text-[12px] text-muted">{r.provider}</div>
                  <p className="text-[13.5px] mt-1">{r.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <FullRecordGate token={token} />
        )}
      </section>
      <p className="text-[11.5px] text-faint mt-6">Full record opens only with a one-time code sent to the patient&apos;s or caregiver&apos;s phone. Every access is logged and visible to the patient. Link expires in 24 hours.</p>
    </main>
  );
}
