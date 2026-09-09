"use client";
import { useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { recordDigest } from "@/components/seal-check";
import { shortHash } from "@/lib/hash";
import { useT } from "@/lib/use-t";
import type { HealthRecord } from "@/lib/types";

/**
 * Lets the doctor check the record for themselves, on their own phone.
 *
 * This is the whole claim made touchable: every entry arrives carrying the seal
 * it was written with, and this hashes the text on screen and compares the two.
 * The comparison is only worth anything because the seal is stored data rather
 * than something recomputed on read — a hash generated from the same object it
 * is checked against would always match and prove nothing.
 *
 * Display only. It reads the records already rendered, touches no cookie and no
 * store, and cannot alter what is unlocked or for how long. Nothing leaves the
 * device: the hashing is Web Crypto, and there is no request to make.
 *
 * No hex unless asked for. A clinician is being asked whether to trust the
 * record, not to audit SHA-256, and a wall of digests reads as noise to exactly
 * the person the answer is for.
 */
function VerifySeals({ records }: { records: HealthRecord[] }) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const [bad, setBad] = useState<string[] | null>(null);
  const [tech, setTech] = useState(false);

  async function run() {
    setBusy(true);
    const checked = await Promise.all(
      records.map(async (r) => ({ id: r.id, ok: !!r.sha256 && (await recordDigest(r)) === r.sha256 })),
    );
    setBad(checked.filter((c) => !c.ok).map((c) => c.id));
    setBusy(false);
  }

  const ok = bad !== null && bad.length === 0;
  return (
    <div className="mt-4 pt-4 border-t border-divider">
      <button
        onClick={run}
        disabled={busy}
        className="w-full min-h-[56px] rounded-full bg-teal text-white font-semibold text-[15px] px-5 disabled:opacity-70"
      >
        {busy ? t("u.verifyBusy") : bad === null ? t("u.verifySeal") : t("u.verifyAgain")}
      </button>

      {bad !== null && !busy && (
        <>
          <div className={`flex items-start gap-2 mt-3 text-[13.5px] font-medium ${ok ? "text-teal" : "text-danger"}`}>
            {ok ? <ShieldCheck size={18} className="shrink-0 mt-px" /> : <ShieldAlert size={18} className="shrink-0 mt-px" />}
            <span>{ok ? t("u.verifyOk", { n: records.length }) : t("u.verifyBad", { k: bad.length, n: records.length })}</span>
          </div>
          <p className="text-[12px] text-muted mt-1.5">{t("u.verifyNote")}</p>
          <button onClick={() => setTech((v) => !v)} className="text-teal font-semibold text-[12.5px] mt-2">
            {tech ? t("seal.hideTech") : t("seal.showTech")}
          </button>
          {tech && (
            <ul className="mt-2 space-y-1">
              {records.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 text-[11.5px]">
                  <span className="text-muted truncate">{r.title}</span>
                  <span className={`mono shrink-0 ${bad.includes(r.id) ? "text-danger" : "text-faint"}`}>{shortHash(r.sha256)}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Everything past the emergency strip is read at leisure by the person holding
 * the phone, so it follows their own language rather than stacking both. The
 * strip above is the part that must never need a decision.
 */
export function FullRecordPanel({ records }: { records: HealthRecord[] }) {
  const { t, d } = useT();
  return (
    <div className="bg-surface border border-line rounded-[22px] p-4">
      <div className="flex items-center gap-2 text-teal text-[12.5px] font-medium"><ShieldCheck size={16} /> {t("u.approved")}</div>
      <h2 className="text-[17px] font-bold mt-3">{t("u.fullRecord")}</h2>
      <ul className="divide-y divide-divider mt-2">
        {records.map((r) => (
          <li key={r.id} className="py-3">
            <div className="flex justify-between gap-2">
              <span className="font-semibold text-[14px]">{r.title}</span>
              <span className="text-[12px] text-faint">{d(r.occurredAt, { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <div className="text-[12px] text-muted">{r.provider}</div>
            <p className="text-[13.5px] mt-1">{r.summary}</p>
          </li>
        ))}
      </ul>
      <VerifySeals records={records} />
    </div>
  );
}

export function ShareFooter() {
  const { t } = useT();
  return <p className="text-[11.5px] text-faint mt-6">{t("u.foot")}</p>;
}
