"use client";
import { Phone } from "lucide-react";
import { Logo } from "@/components/ui";
import { HydrationGate } from "@/components/hydration-gate";
import { OfflineBanner } from "@/components/offline";
import { translate } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { FullRecordGate } from "./gate";

/**
 * A token handed out at a health camp.
 *
 * Camp sign-ups live in the worker's local store — there is no server to look
 * them up on until step 1 — so this resolves client-side and says so plainly
 * when the ID belongs to another device. Nothing is invented: an unknown token
 * gets an explanation, not an empty strip.
 *
 * The two-tier rule is unchanged (locked rule 1). The emergency strip renders
 * with no code, ever; the full record still sits behind the same OTP gate.
 */
export function CampId({ token }: { token: string }) {
  return <HydrationGate><Resolved token={token} /></HydrationGate>;
}

function Bi({ k }: { k: "u.bloodGroup" | "u.allergies" | "u.ice" }) {
  return (
    <dt className="text-muted">
      {translate("en", k)}
      <span className="block text-[12.5px]">{translate("hi", k)}</span>
    </dt>
  );
}

function Resolved({ token }: { token: string }) {
  const { state } = useStore();
  const { t } = useT();
  const reg = state.campRegistrations.find((r) => r.token === token);

  if (!reg) {
    return (
      <main className="screen pb-10">
        <div className="flex items-center gap-2 mb-5">
          <Logo size={36} /><span className="display font-bold text-[17px]">VitaSync</span>
        </div>
        <p className="text-[15px] text-muted">{t("camp.notOnDevice")}</p>
      </main>
    );
  }

  const allergies = reg.allergies.length ? reg.allergies.join(", ") : t("camp.noAllergies");
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
          <div className="display text-[24px] font-bold">{reg.name}</div>
          <div className="mono text-[12.5px] text-muted">{reg.vsId}{reg.area && ` · ${reg.area}`}</div>
          <dl className="grid grid-cols-[132px_1fr] gap-y-3 mt-4 text-[15px]">
            <Bi k="u.bloodGroup" />
            <dd className="display text-[28px] font-bold text-teal leading-none">{reg.bloodGroup && reg.bloodGroup !== "?" ? reg.bloodGroup : "—"}</dd>
            <Bi k="u.allergies" /><dd className="font-semibold">{allergies}</dd>
            <Bi k="u.ice" />
            <dd className="font-semibold">
              <a href={`tel:+91${reg.phone}`} className="inline-flex items-center gap-1.5 text-teal"><Phone size={16} /> +91 {reg.phone}</a>
            </dd>
          </dl>
          <p className="mt-4 text-[13px] text-muted">{translate("en", "u.doctorNote")}</p>
          <p className="mt-1 text-[13px] text-muted">{translate("hi", "u.doctorNote")}</p>
        </div>
      </section>

      <section className="mt-4"><FullRecordGate token={token} /></section>
      <p className="text-[11.5px] text-faint mt-5">{t("camp.badge")}</p>
    </main>
  );
}
