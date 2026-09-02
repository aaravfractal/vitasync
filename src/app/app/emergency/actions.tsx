"use client";
import { Phone } from "lucide-react";
import { Pill } from "@/components/ui";
import { useT } from "@/lib/use-t";

/**
 * The two dial buttons and the footer, split out so they can read the language
 * while /app/emergency itself stays a server component. Client components are
 * still server-rendered, so `tel:112` and `tel:108` remain in the prerendered
 * HTML — locked rule 4 holds. Only the label around each number is translated;
 * the numbers themselves never are.
 *
 * This screen is exempt from HydrationGate, so a Hindi user sees the English
 * labels for one frame before the store hydrates. That is the deliberate trade:
 * the numbers are correct and dialable from the very first paint.
 */
export function EmergencyActions() {
  const { t } = useT();
  return (
    <div className="grid grid-cols-2 gap-2">
      <a href="tel:112" className="inline-flex items-center justify-center gap-2 rounded-full bg-danger text-white min-h-[48px] font-semibold"><Phone size={18} /> {t("emg.call112")}</a>
      <a href="tel:108" className="inline-flex items-center justify-center gap-2 rounded-full bg-danger text-white min-h-[48px] font-semibold"><Phone size={18} /> {t("emg.amb108")}</a>
    </div>
  );
}

export function EmergencyFooter() {
  const { t } = useT();
  return (
    <>
      <p className="text-[12px] text-muted mt-2">{t("emg.note")}</p>
      <Pill href="/app/id" variant="secondary" className="w-full mt-3">{t("emg.showId")}</Pill>
      <Pill href="/app/emergency/share" variant="ghost" className="w-full mt-1">{t("emg.shareHospital")}</Pill>
    </>
  );
}
