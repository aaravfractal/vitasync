import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const SYSTEM = `You summarise a patient's own lab reports for them, in India. Plain, human, non-alarming.
Rules:
- 3 to 4 sentences, no lists, no headings. Sentence case, no exclamation marks.
- Say what changed and what is worth watching. Name the numbers you refer to.
- No diagnosis, no drug names, no dosing. Do not tell them to stop or start anything.
- If something is out of range, say it calmly and suggest talking to a GP.
Respond ONLY as JSON: {"summary": string}`;

type Body = {
  metrics?: Array<{ label: string; value: number; unit: string; status: string; previous?: number }>;
  reports?: Array<{ title: string; provider: string; occurredAt: string; summary: string }>;
};

/** Deterministic stand-in when no API key is configured, so the screen is never empty. */
function mock(b: Body) {
  const metrics = b.metrics ?? [];
  const reports = b.reports ?? [];
  if (!reports.length) return { summary: "There are no lab reports on your record yet. Once a lab adds one, a summary appears here." };
  const watch = metrics.filter((m) => m.status === "watch");
  const moved = metrics.filter((m) => m.previous !== undefined && m.previous !== m.value);
  const parts = [`Your record has ${reports.length} report${reports.length === 1 ? "" : "s"}, the most recent from ${reports[0].provider}.`];
  if (moved.length) {
    const m = moved[0];
    parts.push(`${m.label} has moved from ${m.previous} to ${m.value} ${m.unit}.`);
  }
  parts.push(watch.length ? `${watch.map((m) => `${m.label} at ${m.value} ${m.unit}`).join(" and ")} sits outside the usual range — worth raising with your GP at your next visit.` : "Everything measured is within the usual range.");
  parts.push("Nothing here needs action today unless you feel unwell.");
  return { summary: parts.join(" ") };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ ok: true, ...mock(body), mock: true });

  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
      max_tokens: 400,
      system: SYSTEM,
      messages: [{ role: "user", content: JSON.stringify({ metrics: body.metrics ?? [], reports: body.reports ?? [] }) }],
    });
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as { summary?: string };
    if (!parsed.summary) throw new Error("no summary");
    return NextResponse.json({ ok: true, summary: parsed.summary });
  } catch {
    return NextResponse.json({ ok: true, ...mock(body), mock: true });
  }
}
