import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Phone } from "lucide-react";
import { Logo } from "@/components/ui";
import { patient, records } from "@/lib/demo-data";
import { translate } from "@/lib/i18n";
import { sessionValid } from "@/lib/share";
import { OfflineBanner } from "@/components/offline";
import { CampId } from "./camp";
import { FullRecordGate } from "./gate";
import { FullRecordPanel, ShareFooter } from "./panel";

export const dynamic = "force-dynamic";

/**
 * Two-tier medical ID. Emergency strip: no OTP, ever. Full record: OTP to the
 * patient/caregiver.
 *
 * The strip is rendered in BOTH languages at once, stacked. Whoever picks this
 * phone up in a ward is not the person who chose the app's language, and a
 * paramedic must never have to guess at a label — so English and हिन्दी sit
 * side by side. The values between them (B+, medicine names, the ICE number)
 * are written once and never translated.
 */
function Bi({ k }: { k: "u.bloodGroup" | "u.allergies" | "u.emergencyMeds" | "u.ice" }) {
  return (
    <dt className="text-muted">
      {translate("en", k)}
      <span className="block text-[12.5px]">{translate("hi", k)}</span>
    </dt>
  );
}

export default async function PublicId({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  // A camp token is not on the server — it was minted on a worker's phone and
  // lives in that device's store until step 1. Hand it to the client resolver
  // rather than 404ing; it enforces the same two-tier rules.
  if (token !== patient.shareToken) {
    if (!/^[a-z0-9]{6,32}$/.test(token)) notFound();
    return <CampId token={token} />;
  }
  const jar = await cookies();
  const unlocked = sessionValid(jar.get(`vs_share_${token}`)?.value, token);

  return (
    <main className="screen pb-10">
      <div className="flex items-center gap-2 mb-5">
        <Logo size={36} /><span className="display font-bold text-[17px]">VitaSync</span>
        <span className="ml-auto text-[12px] text-faint text-right">{translate("en", "u.kicker")}<span className="block">{translate("hi", "u.kicker")}</span></span>
      </div>

      <OfflineBanner bi />

      <section className="bg-surface border border-line rounded-[22px] overflow-hidden">
        <div className="bg-danger-tint text-danger px-4 py-2 font-bold text-[13px] tracking-wide">
          {translate("en", "u.emergencyBanner")}
          <span className="block font-semibold">{translate("hi", "u.emergencyBanner")}</span>
        </div>
        <div className="p-4">
          <div className="display text-[24px] font-bold">{patient.name}</div>
          <div className="mono text-[12.5px] text-muted">{patient.id} · {patient.city}</div>
          <dl className="grid grid-cols-[132px_1fr] gap-y-3 mt-4 text-[15px]">
            <Bi k="u.bloodGroup" /><dd className="display text-[28px] font-bold text-teal leading-none">{patient.bloodGroup}</dd>
            <Bi k="u.allergies" /><dd className="font-semibold">{patient.allergies.join(", ")}</dd>
            <Bi k="u.emergencyMeds" /><dd className="font-semibold">{patient.emergencyMeds.join(", ")}</dd>
            <Bi k="u.ice" /><dd className="font-semibold">{patient.ice.name} ({patient.ice.relation})<br /><a href={`tel:${patient.ice.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 text-teal mt-1"><Phone size={16} /> {patient.ice.phone}</a></dd>
          </dl>
          <p className="mt-4 text-[13px] text-muted">{translate("en", "u.doctorNote")}</p>
          <p className="mt-1 text-[13px] text-muted">{translate("hi", "u.doctorNote")}</p>
        </div>
      </section>

      <section className="mt-4">
        {unlocked ? <FullRecordPanel records={records} /> : <FullRecordGate token={token} />}
      </section>
      <ShareFooter />
    </main>
  );
}
