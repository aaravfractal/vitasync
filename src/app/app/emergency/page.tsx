import { Phone } from "lucide-react";
import { Pill } from "@/components/ui";
import { EmergencyNearby } from "./nearby";

export default function Emergency() {
  return (
    <EmergencyNearby
      actions={
        <div className="grid grid-cols-2 gap-2">
          <a href="tel:112" className="inline-flex items-center justify-center gap-2 rounded-full bg-danger text-white min-h-[48px] font-semibold"><Phone size={18} /> Call 112</a>
          <a href="tel:108" className="inline-flex items-center justify-center gap-2 rounded-full bg-danger text-white min-h-[48px] font-semibold"><Phone size={18} /> Ambulance · 108</a>
        </div>
      }
      footer={
        <>
          <p className="text-[12px] text-muted mt-2">112 is the unified emergency number. 108 is the ambulance line. Your emergency strip is shared with the hospital on arrival, one tap.</p>
          <Pill href="/app/id" variant="secondary" className="w-full mt-3">Show my emergency ID</Pill>
          <Pill href="/app/emergency/share" variant="ghost" className="w-full mt-1">Share my record with the hospital</Pill>
        </>
      }
    />
  );
}
