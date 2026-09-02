"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Pill } from "@/components/ui";
import { useT } from "@/lib/use-t";

export function FullRecordGate({ token }: { token: string }) {
  const router = useRouter();
  const { t } = useT();
  const [stage, setStage] = useState<"idle" | "sent" | "busy">("idle");
  const [code, setCode] = useState("");
  const [facility, setFacility] = useState("");
  const [demo, setDemo] = useState<string | undefined>();
  const [err, setErr] = useState("");

  async function request() {
    setStage("busy"); setErr("");
    const r = await fetch(`/u/${token}/otp`, { method: "POST", body: JSON.stringify({ action: "request" }) });
    const d = await r.json();
    if (!d.ok) { setErr(d.error); setStage("idle"); return; }
    setDemo(d.demoCode); setStage("sent");
  }
  async function verify() {
    setStage("busy"); setErr("");
    const r = await fetch(`/u/${token}/otp`, { method: "POST", body: JSON.stringify({ action: "verify", code, facility }) });
    const d = await r.json();
    if (!d.ok) { setErr(d.error); setStage("sent"); return; }
    router.refresh();
  }

  return (
    <div className="bg-surface border border-line rounded-[22px] p-4">
      <div className="flex items-center gap-2 text-[12.5px] text-muted"><Lock size={16} /> {t("u.gateHead")}</div>
      {stage !== "sent" ? (
        <>
          <p className="text-[14px] mt-2">{t("u.gateNeeds")}</p>
          <Pill onClick={request} disabled={stage === "busy"} className="w-full mt-3">{t("u.request")}</Pill>
        </>
      ) : (
        <>
          <p className="text-[14px] mt-2">{t("u.sent")}</p>
          {demo && <p className="text-[12px] text-gold-text mt-1">{t("u.demo")} <span className="mono font-bold">{demo}</span></p>}
          <input value={facility} onChange={(e) => setFacility(e.target.value)} placeholder={t("u.facility")} className="mt-3 w-full min-h-[44px] rounded-[12px] bg-paper border border-line px-3 text-[14px] outline-none focus:border-teal" />
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder={t("u.code")} aria-label={t("u.code")} className="mt-2 w-full min-h-[48px] rounded-[12px] bg-paper border border-line px-3 mono text-[20px] tracking-[0.3em] outline-none focus:border-teal" />
          <Pill onClick={verify} disabled={code.length !== 6} className="w-full mt-3">{t("u.open")}</Pill>
        </>
      )}
      {err && <p className="text-[13px] text-danger mt-2">{err}</p>}
    </div>
  );
}
