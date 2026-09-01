"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { Overline, Pill, ScreenHeader } from "@/components/ui";
import { uid, useStore, writeRecord } from "@/lib/store";
import { useToast } from "@/components/toast";
import type { Urgency } from "@/lib/types";

type Msg = { role: "user" | "assistant"; content: string; cta?: { href: string; label: string } };
type Next = { title: string; context: string } | null;
type Reply = { reply: string; question: boolean; urgency: Urgency; next_step: Next; likely_cause?: string; advice?: string };

const urgencyLine: Record<Urgency, string> = { emergency: "Emergency", gp_today: "See a GP today", low: "Low urgency" };

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
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Tell me what's going on, in your own words." },
  ]);
  const [input, setInput] = useState(() => params.get("q") ?? "");
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState<Next>(null);
  const [urgency, setUrgency] = useState<string>("low");
  const endRef = useRef<HTMLDivElement>(null);
  const { dispatch } = useStore();
  const toast = useToast();
  const saved = useRef(false);

  async function saveSession(d: Reply, symptom: string) {
    if (saved.current) return; saved.current = true;
    await writeRecord(dispatch, {
      type: "ai_session",
      occurredAt: new Date().toISOString(),
      provider: "VitaSync assistant",
      title: `Symptom check — ${symptom.slice(0, 40)}`,
      summary: `${urgencyLine[d.urgency]}. ${d.reply}`,
      ai: {
        urgency: d.urgency,
        symptoms: symptom,
        likelyCause: d.likely_cause?.trim() || "Not established from this conversation",
        advice: d.advice?.trim() || d.reply,
        nextStep: d.next_step ? `${d.next_step.title} — ${d.next_step.context}` : "No action needed right now",
      },
    });
  }
  function remindLater() {
    dispatch({ type: "addReminder", reminder: { id: uid(), text: `Reminder: ${next?.title ?? "book a GP"} — ${next?.context ?? ""}`, at: new Date().toISOString() } });
    setNext(null); toast("We'll remind you on your home screen");
  }

  // Block body on purpose: a concise arrow returns scrollIntoView's value, which
  // React 19 then treats as this effect's cleanup and calls on the next run.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, next]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const history = [...messages.slice(1), { role: "user" as const, content: text }];
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ messages: history }) });
      if (r.status === 429) {
        const { error } = await r.json();
        setMessages((m) => [...m, { role: "assistant", content: error ?? "Daily limit reached. Plus gets unlimited.", cta: { href: "/pricing", label: "See plans" } }]);
        return;
      }
      const d: Reply = await r.json();
      setMessages((m) => [...m, { role: "assistant", content: d.reply }]);
      setUrgency(d.urgency);
      setNext(d.next_step);
      if (!d.question) saveSession(d, history.find((m) => m.role === "user")?.content ?? text);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Couldn't reach the assistant. Check your connection and try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-120px)]">
      <ScreenHeader
        title="Symptom Checker"
        subtitle={<span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal" /> Private · saved only to your record</span>}
      />
      <div className="flex-1 space-y-3">
        {messages.map((m, i) =>
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
            <Overline tone="gold">Recommended next step</Overline>
            <div className="display text-[15.5px] font-bold mt-1">{next.title}</div>
            <div className="text-[13px] text-muted mt-0.5 mb-3">{next.context}</div>
            <div className="flex gap-2">
              {urgency === "emergency" ? (
                <Pill href="/app/emergency" variant="danger" className="flex-1">Open emergency</Pill>
              ) : (
                <Pill href="/app/book?slot=today" className="flex-1">Book a GP</Pill>
              )}
              <Pill variant="secondary" onClick={remindLater}>Remind me later</Pill>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 my-3">
          {["Dull headache since morning", "Fever for 2 days", "Can't sleep properly"].map((s) => (
            <button key={s} onClick={() => send(s)} className="rounded-full bg-surface border border-line px-3.5 py-2 text-[13px]">{s}</button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="sticky bottom-[72px] mt-3 flex items-center gap-2 bg-paper pt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe how you feel"
          aria-label="Describe how you feel"
          className="flex-1 min-h-[44px] rounded-full bg-surface border border-line px-4 text-[15px] outline-none focus:border-teal"
        />
        <button type="submit" aria-label="Send" disabled={busy} className="w-11 h-11 rounded-full bg-teal text-white flex items-center justify-center disabled:opacity-50">
          <Send size={18} />
        </button>
      </form>
      <p className="text-[11.5px] text-faint mt-2">AI can be wrong. For emergencies call 112, or 108 for an ambulance.</p>
    </div>
  );
}
