import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { clientIp, rateLimitBypassed, takeDaily } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Free tier. Plus (₹299) lifts it — see /pricing. */
const DAILY_LIMIT = 5;

const SYSTEM = `You are the VitaSync symptom checker for patients in India. Plain, human, non-alarming. Never sound like an assistant.
Rules:
- Ask at most ONE short clarifying question if needed. Otherwise give a plain-language suggestion in 2-3 sentences.
- Red flags (chest pain, one-sided weakness, face droop, trouble breathing, heavy bleeding, seizure, suicidal thoughts, anaphylaxis) → urgency "emergency" and tell them to call 112 (or 108 for an ambulance) now.
- You are not a doctor. No diagnoses, no drug dosing.

LANGUAGE
- Reply in the language the patient wrote in. Decide this from their own words, every turn.
- Devanagari (e.g. "सुबह से सिर दर्द है") → reply in Hindi, in Devanagari script.
- Hinglish, i.e. Hindi written in Latin letters (e.g. "subah se sir dard hai", "pet me dard") → also reply in simple Hindi in Devanagari script.
- English → reply in English.
- The app sends the patient's chosen interface language as a hint. It is only a hint: if their message is in a different language, THEIR MESSAGE WINS.
- Hindi must be simple and respectful. Address the patient as आप — never तू or तुम. No Sanskritised or literary register; write the way a kind clinic receptionist in Dehradun speaks.
- NEVER translate or transliterate: the numbers 112 and 108, medicine names, doses, blood groups, and the abbreviations ABHA, ABDM, ICE, SpO₂. Write them exactly as they are, in Latin script, inside the Hindi sentence. Digits stay Latin (लिखिए 112, never ११२) — a paramedic must read the same number in either language.
- Every field the patient sees follows the same language: "reply", "next_step".title, "next_step".context, "likely_cause" and "advice". The JSON keys and the "urgency" value stay in English exactly as specified.

Respond ONLY as JSON: {"reply": string, "question": boolean, "urgency": "low"|"gp_today"|"emergency", "next_step": {"title": string, "context": string} | null, "likely_cause": string, "advice": string}
- "likely_cause" is a short plain phrase, not a diagnosis (e.g. "tension-type headache"). Empty string while you are still asking.
- "advice" is one sentence of what to do at home. Empty string while you are still asking.`;

type Msg = { role: "user" | "assistant"; content: string };
type Lang = "en" | "hi";

const DEVANAGARI = /[ऀ-ॿ]/;
/** Hindi written in Latin letters. Common enough in Dehradun to be the default input. */
const HINGLISH = /\b(dard|bukhar|bukhaar|sir dard|pet|saans|khansi|khaansi|chakkar|kamzori|ulti|jee ?michla|nind|neend|subah|raat se|din se|ho ?rah[ai]|lag ?rah[ai]|nahi|kya|mujhe|mera|meri)\b/i;

/**
 * The patient's own words decide the language; the app's hint only breaks a tie
 * on a message with no signal either way (a bare "ok", a number).
 */
function replyLang(messages: Msg[], hint: Lang): Lang {
  const last = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
  if (DEVANAGARI.test(last)) return "hi";
  if (HINGLISH.test(last)) return "hi";
  if (/[a-z]{3}/i.test(last)) return "en";
  return hint;
}

// Demo replies for when ANTHROPIC_API_KEY is unset. The Hindi here is machine-
// drafted like the rest — REVIEW, see docs/hindi-review.md. 112 and 108 are
// written in Latin digits on purpose (locked rule 4).
const MOCK = {
  en: {
    emergency: { reply: "This can be serious. Please call 112 now, or 108 for an ambulance. Don't wait to see if it passes.", question: false, urgency: "emergency", next_step: { title: "Call 112 now", context: "Emergency" }, likely_cause: "Needs urgent assessment in person", advice: "Do not drive yourself. Stay with someone until help arrives." },
    ask: { reply: "Is it on one side of your head, or all over? And did it start suddenly?", question: true, urgency: "low", next_step: null, likely_cause: "", advice: "" },
    answer: { reply: "This sounds like a tension-type headache. Water, a proper meal and rest usually help. If it turns sudden or one-sided, or comes with fever or a stiff neck, see a GP today.", question: false, urgency: "gp_today", next_step: { title: "Book a GP", context: "If sudden or one-sided, see a GP today" }, likely_cause: "Tension-type headache", advice: "Water, a proper meal and rest. Avoid screens for an hour." },
  },
  hi: {
    emergency: { reply: "यह गंभीर हो सकता है। अभी 112 पर कॉल कीजिए, या एम्बुलेंस के लिए 108 पर। यह अपने आप ठीक होने का इंतज़ार मत कीजिए।", question: false, urgency: "emergency", next_step: { title: "अभी 112 पर कॉल कीजिए", context: "आपात स्थिति" }, likely_cause: "तुरंत आमने-सामने जाँच ज़रूरी है", advice: "ख़ुद गाड़ी मत चलाइए। मदद आने तक किसी के साथ रहिए।" },
    ask: { reply: "दर्द सिर के एक तरफ़ है या पूरे सिर में? और क्या यह अचानक शुरू हुआ था?", question: true, urgency: "low", next_step: null, likely_cause: "", advice: "" },
    answer: { reply: "यह तनाव वाला सिर दर्द लगता है। पानी, समय पर खाना और आराम से आमतौर पर ठीक हो जाता है। अगर दर्द अचानक तेज़ हो, एक तरफ़ हो, या बुख़ार या गर्दन में अकड़न के साथ हो, तो आज ही डॉक्टर को दिखाइए।", question: false, urgency: "gp_today", next_step: { title: "डॉक्टर बुक कीजिए", context: "अचानक या एक तरफ़ का दर्द हो तो आज ही दिखाइए" }, likely_cause: "तनाव वाला सिर दर्द", advice: "पानी, समय पर खाना और आराम। एक घंटे तक स्क्रीन से दूर रहिए।" },
  },
} as const;

function mock(messages: Msg[], lang: Lang) {
  const last = messages[messages.length - 1]?.content.toLowerCase() ?? "";
  const m = MOCK[lang];
  // Devanagari and Hinglish red-flag words alongside the English ones, so the
  // demo routes to emergency in either language (locked rule 5).
  if (/chest|breath|stroke|faint|bleed|saans|behosh|khoon|छाती|साँस|सांस|बेहोश|खून|लकवा/.test(last)) return m.emergency;
  if (messages.filter((x) => x.role === "user").length === 1) return m.ask;
  return m.answer;
}

export async function POST(req: Request) {
  if (!rateLimitBypassed(req)) {
    const gate = takeDaily(`chat:${clientIp(req)}`, DAILY_LIMIT);
    if (!gate.ok) return NextResponse.json({ ok: false, error: "Daily limit reached. Plus gets unlimited." }, { status: 429 });
  }

  const body = (await req.json()) as { messages?: Msg[]; lang?: string };
  if (!Array.isArray(body.messages) || body.messages.length === 0)
    return NextResponse.json({ ok: false, error: "messages must be a non-empty array." }, { status: 400 });
  const messages = body.messages;
  const hint: Lang = body.lang === "hi" ? "hi" : "en";
  const lang = replyLang(messages, hint);

  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ ...mock(messages, lang), mock: true });

  const client = new Anthropic();
  const res = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
    // Devanagari costs more tokens per word than Latin, so a cap tuned for
    // English truncates a Hindi reply mid-JSON and drops it to the raw-text
    // fallback below. The ceiling is generous; the prompt still asks for 2-3
    // sentences, so a normal reply is nowhere near it.
    max_tokens: 900,
    system: `${SYSTEM}\n\nThe patient's interface language is set to ${hint === "hi" ? "Hindi" : "English"}. This is a hint only — if their message is in another language, follow their message.`,
    messages,
  });
  const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
  try {
    return NextResponse.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
  } catch {
    return NextResponse.json({ reply: text, question: false, urgency: "low", next_step: null, likely_cause: "", advice: "" });
  }
}
