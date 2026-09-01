"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Pill } from "@/components/ui";

export function FullRecordGate({ token }: { token: string }) {
  const router = useRouter();
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
      <div className="flex items-center gap-2 text-[12.5px] text-muted"><Lock size={16} /> Full record · reports, consults, AI summaries</div>
      {stage !== "sent" ? (
        <>
          <p className="text-[14px] mt-2">Needs the patient&apos;s approval. A 6-digit code goes to their phone, or their nominated caregiver&apos;s.</p>
          <Pill onClick={request} disabled={stage === "busy"} className="w-full mt-3">Request full record</Pill>
        </>
      ) : (
        <>
          <p className="text-[14px] mt-2">Code sent to the patient. Ask them for it.</p>
          {demo && <p className="text-[12px] text-gold-text mt-1">Demo mode (no SMS configured): code is <span className="mono font-bold">{demo}</span></p>}
          <input value={facility} onChange={(e) => setFacility(e.target.value)} placeholder="Your name / facility (for the log)" className="mt-3 w-full min-h-[44px] rounded-[12px] bg-paper border border-line px-3 text-[14px] outline-none focus:border-teal" />
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="6-digit code" aria-label="6-digit code" className="mt-2 w-full min-h-[48px] rounded-[12px] bg-paper border border-line px-3 mono text-[20px] tracking-[0.3em] outline-none focus:border-teal" />
          <Pill onClick={verify} disabled={code.length !== 6} className="w-full mt-3">Open record</Pill>
        </>
      )}
      {err && <p className="text-[13px] text-danger mt-2">{err}</p>}
    </div>
  );
}
