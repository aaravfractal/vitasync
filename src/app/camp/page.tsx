"use client";
import { useMemo, useState } from "react";
import { Printer, UserPlus } from "lucide-react";
import QRCode from "qrcode";
import { Pill, cx } from "@/components/ui";
import { Field } from "@/components/field";
import { LanguageSwitch } from "@/components/language-picker";
import { HydrationGate } from "@/components/hydration-gate";
import { uid, useStore, type CampRegistration } from "@/lib/store";
import { useT } from "@/lib/use-t";

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const COMMON_ALLERGIES = ["Penicillin", "Sulfa", "Aspirin", "Peanuts", "Dust", "Latex"];

/** VS-<name fragment>-<4 digits>: display only. The URL never carries the name. */
function makeVsId(name: string) {
  const part = (name.split(/\s+/)[0] ?? "").replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 4) || "USER";
  return `VS-${part}-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

/** The share token is random and unrelated to the name (locked rule 2). */
function makeToken() {
  const b = new Uint8Array(5);
  crypto.getRandomValues(b);
  return [...b].map((n) => n.toString(36).padStart(2, "0")).join("").slice(0, 10);
}

const todayKey = () => new Date().toLocaleDateString("en-CA");

/**
 * Autofocus chain. A worker taking details by voice across a camp table should
 * never have to reach for the screen between answers, so Enter walks to the
 * next input. Reading DOM order beats a ref per field: adding a question to the
 * form joins it to the chain with no extra wiring.
 */
function focusNextField(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const form = e.currentTarget.closest("main");
  if (!form) return;
  const inputs = [...form.querySelectorAll("input")];
  inputs[inputs.indexOf(e.currentTarget) + 1]?.focus();
}

export default function CampPage() {
  return <HydrationGate><Camp /></HydrationGate>;
}

/**
 * Health-camp registration. Public and sign-in free: this runs on a worker's
 * phone at a table in a village, handed between people all morning.
 *
 * Everything registered here lives in this device's local store until step 1
 * ships a server, which is why the slip and the badge both say pilot demo.
 */
function Camp() {
  const { state, dispatch } = useStore();
  const { t } = useT();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [blood, setBlood] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState("");
  const [area, setArea] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<CampRegistration | null>(null);
  const [qr, setQr] = useState("");


  const today = todayKey();
  const countToday = useMemo(
    () => state.campRegistrations.filter((r) => r.at.slice(0, 10) === today).length,
    [state.campRegistrations, today],
  );

  const toggle = (a: string) => setAllergies((xs) => (xs.includes(a) ? xs.filter((x) => x !== a) : [...xs, a]));

  async function submit() {
    if (name.trim().length < 2) { setErr(t("camp.badName")); return; }
    if (phone.replace(/\D/g, "").length !== 10) { setErr(t("camp.badPhone")); return; }
    setErr("");
    const extra = otherAllergy.trim();
    const reg: CampRegistration = {
      id: uid(),
      vsId: makeVsId(name),
      token: makeToken(),
      name: name.trim(),
      phone: phone.replace(/\D/g, ""),
      age: age.trim(),
      sex,
      bloodGroup: blood,
      allergies: extra ? [...allergies, extra] : allergies,
      area: area.trim(),
      at: new Date().toISOString(),
    };
    dispatch({ type: "addCampRegistration", reg });
    const url = `${window.location.origin}/u/${reg.token}`;
    setQr(await QRCode.toDataURL(url, { margin: 1, width: 400, color: { dark: "#1E2B28", light: "#FFFFFF" } }));
    setDone(reg);
  }

  function reset() {
    setName(""); setPhone(""); setAge(""); setSex(""); setBlood("");
    setAllergies([]); setOtherAllergy(""); setArea(""); setErr(""); setDone(null); setQr("");
  }

  if (done) return <Slip reg={done} qr={qr} onNext={reset} count={countToday} />;

  return (
    <main className="screen pb-10">
      <header className="flex items-center gap-3 mb-1">
        <h1 className="display text-[26px] font-bold flex-1">{t("camp.title")}</h1>
        {/* Per villager, not per device: the next person in the queue may read the other script. */}
        <LanguageSwitch />
      </header>
      <p className="text-[13px] text-gold-text bg-gold-tint border border-gold-border rounded-full px-3 py-1 inline-block">{t("camp.badge")}</p>
      <p className="text-[15px] text-muted mt-3">{t("camp.intro")}</p>
      <p className="text-[14px] font-semibold text-teal mt-1">{t("camp.registeredToday", { n: countToday })}</p>

      <div className="mt-5 space-y-1">
        <Field label={t("camp.name")} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={focusNextField} autoFocus />
        <Field label={t("camp.mobile")} inputMode="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={focusNextField} />
        <Field label={t("camp.age")} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))} onKeyDown={focusNextField} />
      </div>

      <Group label={t("camp.sex")}>
        {([["f", t("camp.sexF")], ["m", t("camp.sexM")], ["o", t("camp.sexO")]] as const).map(([k, l]) => (
          <Chip key={k} on={sex === k} onClick={() => setSex(sex === k ? "" : k)}>{l}</Chip>
        ))}
      </Group>

      {/* Blood groups are never translated or transliterated (locked rule 4). */}
      <Group label={t("camp.bloodGroup")}>
        {BLOOD.map((b) => <Chip key={b} on={blood === b} onClick={() => setBlood(blood === b ? "" : b)}>{b}</Chip>)}
        <Chip on={blood === "?"} onClick={() => setBlood(blood === "?" ? "" : "?")}>{t("camp.bloodUnknown")}</Chip>
      </Group>

      <Group label={t("camp.allergies")}>
        {COMMON_ALLERGIES.map((a) => <Chip key={a} on={allergies.includes(a)} onClick={() => toggle(a)}>{a}</Chip>)}
      </Group>
      <div className="mt-2">
        <Field label={t("camp.allergyOther")} value={otherAllergy} onChange={(e) => setOtherAllergy(e.target.value)} onKeyDown={focusNextField} />
        <Field label={t("camp.area")} value={area} onChange={(e) => setArea(e.target.value)} />
      </div>

      {err && <p className="text-danger text-[14px] mb-2">{err}</p>}
      <Pill onClick={submit} className="w-full"><UserPlus size={18} /> {t("camp.submit")}</Pill>
    </main>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="text-[13px] font-medium text-muted mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cx(
        "rounded-full border px-4 min-h-[44px] text-[15px] font-medium",
        on ? "bg-teal text-white border-teal" : "bg-surface text-ink border-line",
      )}
    >
      {children}
    </button>
  );
}

/**
 * The result card, and the A6 slip that comes out of the printer. Both
 * languages on the slip: the person who reads it in a ward is not the person
 * who filled the form.
 */
function Slip({ reg, qr, onNext, count }: { reg: CampRegistration; qr: string; onNext: () => void; count: number }) {
  const { t } = useT();
  const allergies = reg.allergies.length ? reg.allergies.join(", ") : t("camp.noAllergies");
  return (
    <main className="screen pb-10">
      <div className="no-print">
        <h1 className="display text-[24px] font-bold">{t("camp.done")}</h1>
        <p className="text-[14px] font-semibold text-teal mt-1">{t("camp.registeredToday", { n: count })}</p>
      </div>

      {/* The one element that survives into the print sheet. */}
      <div className="camp-slip mt-4 bg-surface border border-line rounded-[22px] p-5 text-center">
        <div className="display text-[22px] font-bold">{reg.name}</div>
        <div className="mono text-[13px] text-muted mt-0.5">{reg.vsId}</div>
        {qr && (
          // eslint-disable-next-line @next/next/no-img-element -- data URL from qrcode
          <img src={qr} alt={reg.vsId} className="mx-auto my-4 w-[180px] h-[180px]" />
        )}
        <dl className="text-left text-[14px] grid grid-cols-[110px_1fr] gap-y-1.5">
          <dt className="text-muted">Blood group<span className="block text-[12px]">ब्लड ग्रुप</span></dt>
          <dd className="display text-[20px] font-bold text-teal">{reg.bloodGroup && reg.bloodGroup !== "?" ? reg.bloodGroup : "—"}</dd>
          <dt className="text-muted">Allergies<span className="block text-[12px]">एलर्जी</span></dt>
          <dd className="font-semibold">{allergies}</dd>
        </dl>
        <p className="text-[11.5px] text-muted mt-4 leading-snug">
          VitaSync · Emergency ID · no OTP needed for this strip
          <span className="block">VitaSync · आपातकालीन ID · इस पर्ची के लिए कोई OTP नहीं चाहिए</span>
        </p>
      </div>

      <p className="no-print text-[13px] text-muted mt-3">{t("camp.scanNote")}</p>
      <div className="no-print flex gap-2 mt-4">
        <Pill variant="secondary" onClick={() => window.print()} className="flex-1"><Printer size={18} /> {t("camp.print")}</Pill>
        <Pill onClick={onNext} className="flex-1">{t("camp.another")}</Pill>
      </div>
    </main>
  );
}
