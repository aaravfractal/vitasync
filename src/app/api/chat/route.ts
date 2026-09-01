import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { clientIp, takeDaily } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Free tier. Plus (₹299) lifts it — see /pricing. */
const DAILY_LIMIT = 5;

const SYSTEM = `You are the VitaSync symptom checker for patients in India. Plain, human, non-alarming. Never sound like an assistant.
Rules:
- Ask at most ONE short clarifying question if needed. Otherwise give a plain-language suggestion in 2-3 sentences.
- Red flags (chest pain, one-sided weakness, face droop, trouble breathing, heavy bleeding, seizure, suicidal thoughts, anaphylaxis) → urgency "emergency" and tell them to call 112 (or 108 for an ambulance) now.
- You are not a doctor. No diagnoses, no drug dosing.
Respond ONLY as JSON: {"reply": string, "question": boolean, "urgency": "low"|"gp_today"|"emergency", "next_step": {"title": string, "context": string} | null, "likely_cause": string, "advice": string}
- "likely_cause" is a short plain phrase, not a diagnosis (e.g. "tension-type headache"). Empty string while you are still asking.
- "advice" is one sentence of what to do at home. Empty string while you are still asking.`;

type Msg = { role: "user" | "assistant"; content: string };

function mock(messages: Msg[]) {
  const last = messages[messages.length - 1]?.content.toLowerCase() ?? "";
  if (/chest|breath|stroke|faint|bleed/.test(last))
    return { reply: "This can be serious. Please call 112 now, or 108 for an ambulance. Don't wait to see if it passes.", question: false, urgency: "emergency", next_step: { title: "Call 112 now", context: "Emergency" }, likely_cause: "Needs urgent assessment in person", advice: "Do not drive yourself. Stay with someone until help arrives." };
  if (messages.filter((m) => m.role === "user").length === 1)
    return { reply: "Is it on one side of your head, or all over? And did it start suddenly?", question: true, urgency: "low", next_step: null, likely_cause: "", advice: "" };
  return { reply: "This sounds like a tension-type headache. Water, a proper meal and rest usually help. If it turns sudden or one-sided, or comes with fever or a stiff neck, see a GP today.", question: false, urgency: "gp_today", next_step: { title: "Book a GP", context: "If sudden or one-sided, see a GP today" }, likely_cause: "Tension-type headache", advice: "Water, a proper meal and rest. Avoid screens for an hour." };
}

export async function POST(req: Request) {
  const gate = takeDaily(`chat:${clientIp(req)}`, DAILY_LIMIT);
  if (!gate.ok) return NextResponse.json({ ok: false, error: "Daily limit reached. Plus gets unlimited." }, { status: 429 });

  const { messages } = (await req.json()) as { messages: Msg[] };
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ ...mock(messages), mock: true });

  const client = new Anthropic();
  const res = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
    max_tokens: 400,
    system: SYSTEM,
    messages,
  });
  const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
  try {
    return NextResponse.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
  } catch {
    return NextResponse.json({ reply: text, question: false, urgency: "low", next_step: null, likely_cause: "", advice: "" });
  }
}
