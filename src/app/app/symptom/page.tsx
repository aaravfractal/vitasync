"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mic, Send, Volume2, VolumeX } from "lucide-react";
import { Overline, Pill, ScreenHeader, cx } from "@/components/ui";
import { uid, useStore, writeRecord } from "@/lib/store";
import { useSpeechInput, useSpeechOutput } from "@/lib/voice";
import { useT } from "@/lib/use-t";
import type { Key } from "@/lib/i18n";
import { useToast } from "@/components/toast";
import type { Urgency } from "@/lib/types";

type Msg = { role: "user" | "assistant"; content: string; cta?: { href: string; label: string } };
type Next = { title: string; context: string } | null;
type Reply = { reply: string; question: boolean; urgency: Urgency; next_step: Next; likely_cause?: string; advice?: string };

const urgencyKey: Record<Urgency, Key> = { emergency: "sym.urgencyEmergency", gp_today: "sym.urgencyGp", low: "sym.urgencyLow" };

/** useSearchParams needs a boundary for this route to stay statically rendered. */
export default function SymptomPage() {
  return (
    <Suspense fallback={null}>
      <Symptom />
    </Suspense>
  );
}

function Symptom() {
  // Prefilled by the "Ask the AI about this" links on /app/wellness.
  const params = useSearchParams();
  const { t, lang } = useT();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState(() => params.get("q") ?? "");
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState<Next>(null);
  const [urgency, setUrgency] = useState<string>("low");
  const endRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useStore();
  const toast = useToast();
  const saved = useRef(false);
  // Dictation writes straight into `input`, so a misheard word is corrected
  // before sending. Nothing is ever sent on the strength of speech alone.
  const mic = useSpeechInput(lang, setInput);
  const tts = useSpeechOutput(lang);
  // Elder Mode starts with read-aloud on: someone who turned on bigger text is
  // unlikely to want to read a paragraph of advice off a phone.
  const elder = state.elderMode;
  const [readAloud, setReadAloud] = useState(elder);

  // The opener is the one message the assistant does not author, so it follows
  // the UI language and is re-written if the language changes before the first
  // reply. It is index 0 and is never sent to the model (see `send`).
  const opener = t("sym.opener");
  const thread: Msg[] = [{ role: "assistant", content: opener }, ...messages];

  async function saveSession(d: Reply, symptom: string) {
    if (saved.current) return; saved.current = true;
    await writeRecord(dispatch, {
      type: "ai_session",
      occurredAt: new Date().toISOString(),
      provider: "VitaSync assistant",
      title: t("sym.sessionTitle", { symptom: symptom.slice(0, 40) }),
      summary: `${t(urgencyKey[d.urgency])}. ${d.reply}`,
      ai: {
        urgency: d.urgency,
        symptoms: symptom,
        likelyCause: d.likely_cause?.trim() || t("sym.noCause"),
        advice: d.advice?.trim() || d.reply,
        nextStep: d.next_step ? `${d.next_step.title} — ${d.next_step.context}` : t("sym.noStep"),
      },
    });
  }
  function remindLater() {
    dispatch({ type: "addReminder", reminder: { id: uid(), text: t("sym.reminderText", { title: next?.title ?? t("sym.reminderFallback"), context: next?.context ?? "" }), at: new Date().toISOString() } });
    setNext(null); toast(t("sym.reminderSet"));
  }

  // Block body on purpose: a concise arrow returns scrollIntoView's value, which
  // React 19 then treats as this effect's cleanup and calls on the next run.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, next]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    if (mic.listening) mic.stop();
    // The opener is UI copy, not conversation: the model never sees it.
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ messages: history, lang }) });
      if (r.status === 429) {
        const { error } = await r.json();
        setMessages((m) => [...m, { role: "assistant", content: error ?? t("sym.limit"), cta: { href: "/pricing", label: t("sym.seePlans") } }]);
        return;
      }
      const d: Reply = await r.json();
      setMessages((m) => [...m, { role: "assistant", content: d.reply }]);
      if (readAloud) tts.speak(d.reply);
      setUrgency(d.urgency);
      setNext(d.next_step);
      if (!d.question) saveSession(d, history.find((m) => m.role === "user")?.content ?? text);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t("sym.offlineErr") }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-120px)]">
      <ScreenHeader
        title={t("sym.title")}
        backLabel={t("common.back")}
        subtitle={<span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal" /> {t("sym.private")}</span>}
      />
      <div className="flex-1 space-y-3">
        {thread.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[75%] bg-teal text-white px-4 py-2.5 rounded-[18px] rounded-br-[4px] text-[14.5px]">{m.content}</div>
          ) : (
            <div key={i} className="max-w-[82%] bg-surface border border-line px-4 py-2.5 rounded-[18px] rounded-bl-[4px] text-[14.5px] leading-[1.45]">
              {m.content}
              {m.cta && <> <Link href={m.cta.href} className="text-teal font-semibold whitespace-nowrap">{m.cta.label}</Link></>}
            </div>
          ),
        )}
        {busy && <div className="max-w-[82%] bg-surface border border-line px-4 py-2.5 rounded-[18px] rounded-bl-[4px] text-muted text-[14px]">…</div>}
        {next && (
          <div className="bg-surface border border-line rounded-[20px] p-4 max-w-[92%]">
            <Overline tone="gold">{t("sym.nextStep")}</Overline>
            <div className="display text-[15.5px] font-bold mt-1">{next.title}</div>
            <div className="text-[13px] text-muted mt-0.5 mb-3">{next.context}</div>
            <div className="flex gap-2">
              {urgency === "emergency" ? (
                <Pill href="/app/emergency" variant="danger" className="flex-1">{t("sym.openEmergency")}</Pill>
              ) : (
                <Pill href="/app/book?slot=today" className="flex-1">{t("sym.bookGp")}</Pill>
              )}
              <Pill variant="secondary" onClick={remindLater}>{t("sym.remindLater")}</Pill>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 my-3">
          {(["sym.chip1", "sym.chip2", "sym.chip3"] as const).map((k) => (
            <button key={k} onClick={() => send(t(k))} className="rounded-full bg-surface border border-line px-3.5 py-2 text-[13px]">{t(k)}</button>
          ))}
        </div>
      )}

      <div className="sticky bottom-[72px] mt-3 bg-paper pt-2">
        {mic.listening && (
          <p className="flex items-center gap-2 text-[13px] text-teal font-medium pb-2" role="status">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-teal opacity-70 animate-ping" />
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-teal" />
            </span>
            {t("sym.listening")}
          </p>
        )}
        {mic.denied && <p className="text-[13px] text-danger pb-2">{t("sym.micDenied")}</p>}
        {/* In Elder Mode speaking is the primary input, so the mic is a single
            large target above the keyboard rather than a 44px icon beside it. */}
        {elder && mic.supported && (
          <div className="flex flex-col items-center pb-3">
            <button
              type="button"
              onClick={() => (mic.listening ? mic.stop() : mic.start(input))}
              aria-label={mic.listening ? t("sym.micStop") : t("sym.mic")}
              aria-pressed={mic.listening}
              className={cx(
                "w-[72px] h-[72px] rounded-full flex items-center justify-center border-2 transition-colors",
                mic.listening ? "bg-teal text-white border-teal ring-8 ring-teal/20 animate-pulse" : "bg-tint text-teal border-tint-border",
              )}
            >
              <Mic size={32} />
            </button>
            <span className="text-[15px] text-muted mt-2">{mic.listening ? t("sym.micStop") : t("sym.mic")}</span>
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("sym.placeholder")}
            aria-label={t("sym.placeholder")}
            className="flex-1 min-h-[44px] rounded-full bg-surface border border-line px-4 text-[15px] outline-none focus:border-teal"
          />
          {/* Absent in Firefox — the control is not rendered at all rather than
              rendered dead, so nothing on screen promises what it cannot do. */}
          {mic.supported && !elder && (
            <button
              type="button"
              onClick={() => (mic.listening ? mic.stop() : mic.start(input))}
              aria-label={mic.listening ? t("sym.micStop") : t("sym.mic")}
              aria-pressed={mic.listening}
              className={cx(
                "w-11 h-11 rounded-full flex items-center justify-center shrink-0 border transition-colors",
                mic.listening ? "bg-teal text-white border-teal ring-4 ring-teal/25 animate-pulse" : "bg-surface text-muted border-line",
              )}
            >
              <Mic size={18} />
            </button>
          )}
          <button type="submit" aria-label={t("sym.send")} disabled={busy} className="w-11 h-11 rounded-full bg-teal text-white flex items-center justify-center shrink-0 disabled:opacity-50">
            <Send size={18} />
          </button>
        </form>
        {tts.supported && (
          <button
            type="button"
            onClick={() => { const on = !readAloud; setReadAloud(on); if (!on) tts.cancel(); }}
            aria-pressed={readAloud}
            className={cx("inline-flex items-center gap-1.5 mt-2 text-[12.5px] font-medium min-h-[32px]", readAloud ? "text-teal" : "text-muted")}
          >
            {readAloud ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {readAloud ? t("sym.speakOff") : t("sym.speakOn")}
          </button>
        )}
      </div>
      <p className="text-[11.5px] text-faint mt-2">{t("sym.disclaimer")}</p>
    </div>
  );
}
