"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, FileText, CalendarCheck } from "lucide-react";
import { Logo, Pill } from "@/components/ui";
import { Field } from "@/components/field";
import { LanguagePicker, LanguageSwitch } from "@/components/language-picker";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/use-t";
import type { Key } from "@/lib/i18n";

const bullets: Array<[typeof ShieldCheck, Key]> = [[ShieldCheck, "onb.b1"], [FileText, "onb.b2"], [CalendarCheck, "onb.b3"]];

/**
 * Phone OTP sign-in. Mocked until Supabase auth ships (CLAUDE.md step 1); the
 * code is shown on screen.
 *
 * Language comes first, before the pitch. A patient who reads Hindi should not
 * have to parse an English hero line to find the switch that would have given
 * them Hindi — so the very first screen is two buttons and nothing else, and
 * every screen after it keeps an EN / हिं switch in the header so the choice is
 * never a dead end.
 */
export default function Onboarding() {
  const router = useRouter();
  const { dispatch } = useStore();
  const { t } = useT();
  const [stage, setStage] = useState<"lang" | "intro" | "phone" | "otp">("lang");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const demo = "482913";

  function submitPhone() {
    if (phone.replace(/\D/g, "").length < 10) { setErr(t("onb.badPhone")); return; }
    setErr(""); setStage("otp");
  }
  function submitOtp() {
    if (code !== demo) { setErr(t("onb.wrongCode")); return; }
    dispatch({ type: "signIn" }); router.push("/app");
  }

  return (
    <main className="screen relative flex flex-col items-center text-center px-7 pt-16 pb-8">
      {stage === "lang" ? (
        <div className="w-full max-w-[320px] mt-auto mb-auto">
          <LanguagePicker brand onPick={() => setStage("intro")} />
        </div>
      ) : (
        <>
          <LanguageSwitch className="absolute top-5 right-6" />
          <Logo size={56} />
        </>
      )}
      {stage === "intro" && (
        <>
          <h1 className="display text-[30px] font-bold leading-tight mt-6">{t("onb.heroTitle")}</h1>
          <p className="text-muted text-[15px] mt-3">{t("onb.heroSub")}</p>
          <ul className="mt-8 space-y-4 text-left w-full max-w-[320px]">
            {bullets.map(([Icon, k]) => (
              <li key={k} className="flex items-center gap-3 text-[15px] font-medium"><span className="w-10 h-10 rounded-[12px] bg-tint text-teal inline-flex items-center justify-center"><Icon size={20} strokeWidth={1.8} /></span>{t(k)}</li>
            ))}
          </ul>
          <div className="mt-auto w-full pt-10">
            <Pill onClick={() => setStage("phone")} className="w-full">{t("onb.continuePhone")}</Pill>
            <p className="text-[13px] text-muted mt-3">{t("onb.haveAccount")} <button onClick={() => setStage("phone")} className="text-teal font-semibold">{t("onb.signIn")}</button></p>
          </div>
        </>
      )}
      {stage === "phone" && (
        <div className="w-full text-left mt-8">
          <h1 className="display text-[26px] font-bold">{t("onb.phoneTitle")}</h1>
          <p className="text-muted text-[14px] mt-1 mb-5">{t("onb.phoneSub")}</p>
          <Field label={t("onb.mobileLabel")} inputMode="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} autoFocus />
          {err && <p className="text-danger text-[13px] mb-2">{err}</p>}
          <Pill onClick={submitPhone} className="w-full">{t("onb.sendCode")}</Pill>
        </div>
      )}
      {stage === "otp" && (
        <div className="w-full text-left mt-8">
          <h1 className="display text-[26px] font-bold">{t("onb.otpTitle")}</h1>
          <p className="text-muted text-[14px] mt-1">{t("onb.sentTo", { phone })} <button onClick={() => setStage("phone")} className="text-teal font-semibold">{t("onb.change")}</button></p>
          <p className="text-[12px] text-gold-text mt-1 mb-4">{t("onb.demoCode")} <span className="mono font-bold">{demo}</span></p>
          <Field label={t("onb.codeLabel")} inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} autoFocus />
          {err && <p className="text-danger text-[13px] mb-2">{err}</p>}
          <Pill onClick={submitOtp} disabled={code.length !== 6} className="w-full">{t("onb.continue")}</Pill>
        </div>
      )}
    </main>
  );
}
