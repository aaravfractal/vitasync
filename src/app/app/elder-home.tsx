"use client";
import Link from "next/link";
import { Phone, PillBottle, Siren, Stethoscope } from "lucide-react";
import { cx } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/use-t";

/**
 * The Elder Mode home: four things, each one tap away.
 *
 * Everything else — records, vitals, wellness, bookings, sharing — is still
 * there, one level down in Profile. This screen is not a reduced version of the
 * app; it is the four things someone reaches for when they are unwell.
 */
export function ElderHome() {
  const { state } = useStore();
  const { t } = useT();
  const first = state.patient.name.split(" ")[0];

  // The person to ring. The nominated caregiver if we hold a number for them,
  // otherwise the ICE contact — who, by definition, is the one to call.
  const caregiver = state.family.find((f) => f.otpTarget && f.phone);
  const ice = state.patient.ice;
  const callee = caregiver
    ? { name: caregiver.name, relation: caregiver.relation, phone: caregiver.phone! }
    : ice.phone
      ? { name: ice.name, relation: ice.relation, phone: ice.phone }
      : null;

  const cards = [
    { href: "/app/symptom", icon: Stethoscope, label: t("home.checkSymptom"), sub: "", tone: "teal" as const },
    { href: "/app/emergency", icon: Siren, label: t("nav.emergency"), sub: t("home.emergencySub"), tone: "danger" as const },
    { href: "/app/refills", icon: PillBottle, label: t("home.refill"), sub: "", tone: "plain" as const },
  ];

  return (
    <>
      <header className="flex items-center justify-between mb-5">
        <h1 className="display text-[30px] font-bold leading-tight">{first}</h1>
        <Link href="/app/profile" aria-label={t("home.profileAria")} className="w-14 h-14 rounded-full bg-teal text-white display text-[20px] font-bold flex items-center justify-center">{first[0]}</Link>
      </header>

      <div className="space-y-3.5">
        {cards.map(({ href, icon: Icon, label, sub, tone }) => (
          <Link
            key={href}
            href={href}
            className={cx(
              "flex items-center gap-4 rounded-[22px] border p-5 min-h-[92px]",
              tone === "teal" && "bg-tint border-tint-border",
              tone === "danger" && "bg-danger-tint border-danger-tint text-danger",
              tone === "plain" && "bg-surface border-line",
            )}
          >
            <Icon size={34} strokeWidth={1.7} className={cx("shrink-0", tone === "danger" ? "text-danger" : "text-teal")} />
            <span className="flex-1">
              <span className="block display text-[21px] font-bold leading-tight">{label}</span>
              {sub && <span className="block text-[15px] text-muted mt-0.5">{sub}</span>}
            </span>
          </Link>
        ))}

        {/* A tel: link, not a route — one tap should start the call. */}
        {callee ? (
          <a href={`tel:${callee.phone.replace(/\s/g, "")}`} className="flex items-center gap-4 rounded-[22px] border border-line bg-surface p-5 min-h-[92px]">
            <Phone size={34} strokeWidth={1.7} className="shrink-0 text-teal" />
            <span className="flex-1">
              <span className="block display text-[21px] font-bold leading-tight">{t("elder.callFamily")}</span>
              <span className="block text-[15px] text-muted mt-0.5">{t("elder.callFamilySub", { name: callee.name, relation: callee.relation })}</span>
            </span>
          </a>
        ) : (
          <Link href="/app/profile/family" className="flex items-center gap-4 rounded-[22px] border border-line bg-surface p-5 min-h-[92px]">
            <Phone size={34} strokeWidth={1.7} className="shrink-0 text-muted" />
            <span className="flex-1">
              <span className="block display text-[21px] font-bold leading-tight">{t("elder.callFamily")}</span>
              <span className="block text-[15px] text-muted mt-0.5">{t("elder.noCaregiver")}</span>
            </span>
          </Link>
        )}
      </div>

      <p className="text-[15px] text-muted text-center mt-6">{t("elder.more")}</p>
    </>
  );
}
