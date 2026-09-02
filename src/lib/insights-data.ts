/**
 * SIMULATED data for /insights. None of this is real.
 *
 * VitaSync has zero public users (CLAUDE.md rule 7) and no clinic partner has
 * signed, so there is nothing to aggregate. These numbers exist so a district
 * health officer can see what the view would look like, and every screen that
 * renders them says so permanently.
 *
 * Shaped like plausible Dehradun district figures: block-level camps, a monsoon
 * bump in fever presentations through August, adherence in the seventies.
 */

export const CAMPS = [
  { block: "Sahastradhara", registrations: 412 },
  { block: "Raipur", registrations: 388 },
  { block: "Doiwala", registrations: 271 },
  { block: "Vikasnagar", registrations: 246 },
  { block: "Premnagar", registrations: 198 },
  { block: "Chakrata", registrations: 134 },
] as const;

/** Twelve weeks of camp registrations, most recent last. */
export const WEEKLY = [
  { week: "Jun 16", registrations: 84 },
  { week: "Jun 23", registrations: 96 },
  { week: "Jun 30", registrations: 112 },
  { week: "Jul 7", registrations: 108 },
  { week: "Jul 14", registrations: 143 },
  { week: "Jul 21", registrations: 156 },
  { week: "Jul 28", registrations: 171 },
  { week: "Aug 4", registrations: 164 },
  { week: "Aug 11", registrations: 189 },
  { week: "Aug 18", registrations: 206 },
  { week: "Aug 25", registrations: 198 },
  { week: "Sep 1", registrations: 222 },
] as const;

/** Symptom checks by category, last 30 days. */
export const SYMPTOMS = [
  { category: "Fever and chills", checks: 1284 },
  { category: "Cough and breathing", checks: 962 },
  { category: "Stomach and digestion", checks: 741 },
  { category: "Aches and joint pain", checks: 588 },
  { category: "Headache", checks: 431 },
  { category: "Skin", checks: 296 },
] as const;

export const TOTALS = {
  registrations: CAMPS.reduce((n, c) => n + c.registrations, 0),
  camps: CAMPS.length,
  symptomChecks: SYMPTOMS.reduce((n, s) => n + s.checks, 0),
  /** Refills collected on time as a share of refills due. */
  refillAdherence: 78,
  /** Emergency strips opened by scanning a card or QR, last 30 days. */
  stripScans: 219,
};
