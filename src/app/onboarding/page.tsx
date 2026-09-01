"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, FileText, CalendarCheck } from "lucide-react";
import { Logo, Pill } from "@/components/ui";
import { Field } from "@/components/field";
import { useStore } from "@/lib/store";

const bullets = [[ShieldCheck, "You own your data"], [FileText, "No more lost files"], [CalendarCheck, "Any doctor, full history"]] as const;

/** Phone OTP sign-in. Mocked until Supabase auth ships (CLAUDE.md step 1); the code is shown on screen. */
export default function Onboarding() {
  const router = useRouter();
  const { dispatch } = useStore();
  const [stage, setStage] = useState<"intro" | "phone" | "otp">("intro");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const demo = "482913";

  function submitPhone() {
    if (phone.replace(/\D/g, "").length < 10) { setErr("Enter a 10-digit mobile number."); return; }
    setErr(""); setStage("otp");
  }
  function submitOtp() {
    if (code !== demo) { setErr("Wrong code. Try again."); return; }
    dispatch({ type: "signIn" }); router.push("/app");
  }

  return (
    <main className="screen flex flex-col items-center text-center px-7 pt-16 pb-8">
      <Logo size={56} />
      {stage === "intro" && (
        <>
          <h1 className="display text-[30px] font-bold leading-tight mt-6">Your whole health record, in one place</h1>
          <p className="text-muted text-[15px] mt-3">Symptoms, doctors, reports, refills and emergencies, on one timeline you own.</p>
          <ul className="mt-8 space-y-4 text-left w-full max-w-[320px]">
            {bullets.map(([Icon, t]) => (
              <li key={t} className="flex items-center gap-3 text-[15px] font-medium"><span className="w-10 h-10 rounded-[12px] bg-tint text-teal inline-flex items-center justify-center"><Icon size={20} strokeWidth={1.8} /></span>{t}</li>
            ))}
          </ul>
          <div className="mt-auto w-full pt-10">
            <Pill onClick={() => setStage("phone")} className="w-full">Continue with phone number</Pill>
            <p className="text-[13px] text-muted mt-3">Already have an account? <button onClick={() => setStage("phone")} className="text-teal font-semibold">Sign in</button></p>
          </div>
        </>
      )}
      {stage === "phone" && (
        <div className="w-full text-left mt-8">
          <h1 className="display text-[26px] font-bold">Your mobile number</h1>
          <p className="text-muted text-[14px] mt-1 mb-5">We&apos;ll send a one-time code. No password.</p>
          <Field label="Mobile number" inputMode="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} autoFocus />
          {err && <p className="text-danger text-[13px] mb-2">{err}</p>}
          <Pill onClick={submitPhone} className="w-full">Send code</Pill>
        </div>
      )}
      {stage === "otp" && (
        <div className="w-full text-left mt-8">
          <h1 className="display text-[26px] font-bold">Enter the code</h1>
          <p className="text-muted text-[14px] mt-1">Sent to {phone}. <button onClick={() => setStage("phone")} className="text-teal font-semibold">Change</button></p>
          <p className="text-[12px] text-gold-text mt-1 mb-4">Demo mode: the code is <span className="mono font-bold">{demo}</span></p>
          <Field label="6-digit code" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} autoFocus />
          {err && <p className="text-danger text-[13px] mb-2">{err}</p>}
          <Pill onClick={submitOtp} disabled={code.length !== 6} className="w-full">Continue</Pill>
        </div>
      )}
    </main>
  );
}
