"use client";
import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { ciphertextHash } from "@/lib/attachments";
import { canonicalRecord, sha256Hex } from "@/lib/hash";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/use-t";
import type { HealthRecord } from "@/lib/types";

/**
 * Re-runs an entry's seal and says, in a sentence, whether it still holds.
 *
 * The existing "Verify now" button answers the same question but only when
 * pressed, which makes the seal feel like a feature you go and use. A clinician
 * reading a record wants the answer already on the page, so this runs on mount
 * and states the result plainly. No hex by default: a doctor is being asked to
 * trust the record, not to audit SHA-256, and a wall of hex reads as noise to
 * the one person the line is for. The digest is one toggle away for anyone who
 * does want it.
 *
 * The hashing itself is the code that was already here — the same two calls the
 * record sheet's Verify now makes, deliberately left untouched.
 */
export async function recordDigest(r: HealthRecord) {
  // An upload seals its ciphertext, so re-hash what is actually on disk; every
  // other entry re-hashes its canonical JSON.
  return r.attachment ? ciphertextHash(r.attachment).catch(() => "") : sha256Hex(canonicalRecord(r));
}

/**
 * Seals any seed entry that has not been sealed yet.
 *
 * Sealing was only ever triggered by opening the Record screen, which was
 * invisible while the ledger showed a short hash and nothing else. Now that
 * every row states its seal, a ledger opened first reads "Not sealed yet" five
 * times over on the one screen whose whole job is to say the opposite. The
 * Record screen keeps its own copy of this on purpose: it is on the path the
 * clickthrough asserts against, and duplicating four lines is cheaper the night
 * before a demo than refactoring a tested one.
 */
export function useSealUnsealed() {
  const { state, dispatch } = useStore();
  useEffect(() => {
    state.records
      .filter((r) => !r.sha256)
      .forEach(async (r) => dispatch({ type: "sealRecord", id: r.id, sha256: await sha256Hex(canonicalRecord(r)) }));
  }, [state.records, dispatch]);
}

type Status = "checking" | "ok" | "bad" | "pending";

export function SealCheck({ r, showHash = false, className }: { r: HealthRecord; showHash?: boolean; className?: string }) {
  const { t, d } = useT();
  // The result carries the id it was computed for, so "checking" and "pending"
  // are derived rather than set — switching entries cannot leave a stale verdict
  // on screen, and the effect never sets state synchronously.
  const [result, setResult] = useState<{ id: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!r.sha256) return;
    let live = true;
    recordDigest(r)
      .then((h) => live && setResult({ id: r.id, ok: h === r.sha256 }))
      .catch(() => live && setResult({ id: r.id, ok: false }));
    return () => {
      live = false;
    };
  }, [r]);

  const status: Status = !r.sha256 ? "pending" : result?.id === r.id ? (result.ok ? "ok" : "bad") : "checking";

  const sealedOn = d(r.occurredAt, { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className={className}>
      {status === "ok" && (
        <div className="flex items-start gap-1.5 text-teal text-[12.5px] font-medium">
          <ShieldCheck size={15} className="shrink-0 mt-px" />
          <span>{t("seal.ok", { date: sealedOn })}</span>
        </div>
      )}
      {status === "bad" && (
        <div className="flex items-start gap-1.5 text-danger text-[12.5px] font-medium">
          <ShieldAlert size={15} className="shrink-0 mt-px" />
          <span>{t("seal.bad")}</span>
        </div>
      )}
      {status === "checking" && <div className="text-muted text-[12.5px]">{t("seal.checking")}</div>}
      {status === "pending" && <div className="text-faint text-[12.5px]">{t("seal.pending")}</div>}
      {showHash && <div className="mono text-[11.5px] text-faint break-all mt-1">{r.sha256 ?? t("rec.pending")}</div>}
    </div>
  );
}

/** The one control that turns the hex on, worded for a reader who may not want it. */
export function TechToggle({ on, onToggle, className }: { on: boolean; onToggle: () => void; className?: string }) {
  const { t } = useT();
  return (
    <button onClick={onToggle} className={`text-teal font-semibold text-[12.5px] ${className ?? ""}`}>
      {on ? t("seal.hideTech") : t("seal.showTech")}
    </button>
  );
}
