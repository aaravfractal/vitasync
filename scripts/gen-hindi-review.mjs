/**
 * Regenerates docs/hindi-review.md from src/lib/i18n.ts, so the review sheet can
 * never drift from the strings actually shipping.
 *
 * Run: node scripts/gen-hindi-review.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(new URL("../src/lib/i18n.ts", import.meta.url), "utf8");

const PAIR = /^ {2}"([^"]+)":\s*"((?:[^"\\]|\\.)*)",/;

/** Pull `"key": "value",` pairs out of one object literal, keeping file order. */
function parseBlock(start, end) {
  const from = src.indexOf(start);
  if (from < 0) throw new Error(`could not find ${start}`);
  const body = src.slice(from + start.length, src.indexOf(end, from));
  const out = new Map();
  for (const line of body.split("\n")) {
    const m = line.match(PAIR);
    if (m) out.set(m[1], m[2].replace(/\\"/g, '"'));
  }
  return out;
}

const en = parseBlock("export const en = {", "} as const;");
const hi = parseBlock("export const hi: Record<Key, string> = {", "\n};");

const missing = [...en.keys()].filter((k) => !hi.has(k));
if (missing.length) {
  console.error(`Missing Hindi for: ${missing.join(", ")}`);
  process.exit(1);
}

const esc = (s) => s.replace(/\|/g, "\\|");
const rows = [...en.entries()].map((entry) => `| \`${entry[0]}\` | ${esc(entry[1])} | ${esc(hi.get(entry[0]))} |`);

writeFileSync(
  new URL("../docs/hindi-review.md", import.meta.url),
  `# Hindi review sheet

Every Hindi string shipping in the app, next to its English source. **None of
these has been reviewed by a native speaker yet** — each one is marked
\`// REVIEW\` in \`src/lib/i18n.ts\`. Reviewing means: correct the Hindi column
here, then edit the matching line in \`i18n.ts\` and drop its \`// REVIEW\`.

Rules the translation must keep:

- **"112" and "108" are never translated or transliterated.** Same for medicine
  names, doses, blood groups, \`ABHA\`, \`ABDM\`, \`ICE\`, \`SpO₂\` and \`SHA-256\`.
- Digits stay Latin. \`hi-IN\` uses the \`latn\` numbering system by default, so a
  number a paramedic reads is identical in both languages.
- Address the patient as **आप**, never तू or तुम.
- Sentence case, no exclamation marks (CLAUDE.md conventions).
- \`{braces}\` are placeholders filled at runtime. Keep them exactly, spelling
  included; the words around them may be reordered freely.

${en.size} strings. Regenerate with \`node scripts/gen-hindi-review.mjs\`.

| Key | English | हिन्दी (draft) |
| --- | --- | --- |
${rows.join("\n")}
`,
);
console.log(`docs/hindi-review.md: ${en.size} strings`);
