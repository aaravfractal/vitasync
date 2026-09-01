"use client";
import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { patient as seedPatient, records as seedRecords, vitals as seedVitals, prescriptions as seedRx } from "./demo-data";
import type { ConnectedDevice, HealthRecord, Patient, Prescription, Vital, WellnessDay, WellnessTargets } from "./types";
import { emptyDay } from "./wellness";
import { canonicalRecord, sha256Hex } from "./hash";

export interface Appointment { id: string; doctor: string; clinic: string; when: string; note: string }
export interface Order { id: string; medicine: string; qty: number; amount: number; pharmacy: string; at: string; status: "placed" | "delivered" }
export interface Grant { id: string; grantee: string; scope: string; since: string; expiresAt: string; revokedAt?: string }
export interface LogEntry { id: string; actor: string; action: string; at: string }
export interface Family { id: string; name: string; relation: string; otpTarget: boolean }
export interface Reminder { id: string; text: string; at: string }

export interface State {
  signedIn: boolean;
  patient: Patient;
  records: HealthRecord[];
  vitals: Vital[];
  prescriptions: Prescription[];
  appointments: Appointment[];
  orders: Order[];
  grants: Grant[];
  log: LogEntry[];
  family: Family[];
  reminders: Reminder[];
  language: "en" | "hi";
  clinics: string[];
  device: ConnectedDevice | null;
  targets: WellnessTargets;
  wellness: WellnessDay;
  lastWellnessLog: string; // date of the last activity summary written to the record
}

const initial: State = {
  signedIn: false,
  patient: seedPatient,
  records: seedRecords,
  vitals: seedVitals,
  prescriptions: seedRx,
  appointments: [{ id: "a1", doctor: "Dr. Meera Joshi", clinic: "Doon Clinic", when: "2026-09-04T10:30:00+05:30", note: "Follow-up" }],
  orders: [{ id: "o1", medicine: "Metformin 500 mg", qty: 30, amount: 96, pharmacy: "Apollo Pharmacy, Rajpur Rd", at: "2026-08-05T11:00:00+05:30", status: "delivered" }],
  grants: [
    { id: "g1", grantee: "Dr. Meera Joshi · Doon Clinic", scope: "Full record", since: "2026-08-24", expiresAt: "2026-11-24" },
    { id: "g2", grantee: "Dr. S. Bisht · CMI Hospital", scope: "Reports only", since: "2026-07-10", expiresAt: "2026-10-10" },
  ],
  log: [
    { id: "l1", actor: "Dr. Meera Joshi", action: "opened record", at: "2026-08-24T10:32:00+05:30" },
    { id: "l2", actor: "Dr Lal PathLabs", action: "added report", at: "2026-08-18T08:05:00+05:30" },
  ],
  family: [{ id: "f1", name: "Rahul Rawat", relation: "Son", otpTarget: true }, { id: "f2", name: "Meena Rawat", relation: "Daughter", otpTarget: false }],
  reminders: [],
  language: "en",
  clinics: ["Doon Clinic", "Dr Lal PathLabs", "SRL Diagnostics"],
  device: null,
  targets: { steps: 8000, calories: 400, activeMinutes: 45, water: 8 },
  wellness: emptyDay(""),
  lastWellnessLog: "",
};

type Action =
  | { type: "hydrate"; state: State }
  | { type: "signIn" } | { type: "signOut" }
  | { type: "addRecord"; record: HealthRecord }
  | { type: "sealRecord"; id: string; sha256: string }
  | { type: "addVital"; vital: Vital }
  | { type: "addAppointment"; appt: Appointment }
  | { type: "addOrder"; order: Order }
  | { type: "revokeGrant"; id: string }
  | { type: "addGrant"; grant: Grant }
  | { type: "log"; entry: LogEntry }
  | { type: "toggleOtpTarget"; id: string }
  | { type: "addFamily"; member: Family }
  | { type: "setLanguage"; language: "en" | "hi" }
  | { type: "addReminder"; reminder: Reminder }
  | { type: "removeReminder"; id: string }
  | { type: "connectDevice"; device: ConnectedDevice; day: WellnessDay }
  | { type: "disconnectDevice" }
  | { type: "syncWellness"; date: string; steps: number; calories: number; activeMinutes: number }
  | { type: "addWater"; date: string }
  | { type: "setTargets"; targets: WellnessTargets }
  | { type: "wellnessLogged"; date: string }
  | { type: "reset" };

/** Today's row, or a fresh one — never yesterday's numbers under today's date. */
const dayOf = (s: State, date: string) => (s.wellness.date === date ? s.wellness : emptyDay(date));

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "hydrate": return a.state;
    case "signIn": return { ...s, signedIn: true };
    case "signOut": return { ...initial, signedIn: false };
    case "reset": return initial;
    case "addRecord": return { ...s, records: [a.record, ...s.records] };
    case "sealRecord": return { ...s, records: s.records.map((r) => (r.id === a.id ? { ...r, sha256: a.sha256, sealedAt: new Date().toISOString() } : r)) };
    case "addVital": return { ...s, vitals: s.vitals.map((v) => (v.metric === a.vital.metric ? { ...v, ...a.vital, series: [...(v.series ?? []), Number(a.vital.value.split("/")[0])].slice(-7) } : v)) };
    case "addAppointment": return { ...s, appointments: [a.appt, ...s.appointments] };
    case "addOrder": return { ...s, orders: [a.order, ...s.orders] };
    case "revokeGrant": return { ...s, grants: s.grants.map((g) => (g.id === a.id ? { ...g, revokedAt: new Date().toISOString() } : g)) };
    case "addGrant": return { ...s, grants: [a.grant, ...s.grants] };
    case "log": return { ...s, log: [a.entry, ...s.log] };
    case "toggleOtpTarget": return { ...s, family: s.family.map((f) => (f.id === a.id ? { ...f, otpTarget: !f.otpTarget } : f)) };
    case "addFamily": return { ...s, family: [...s.family, a.member] };
    case "setLanguage": return { ...s, language: a.language };
    case "addReminder": return { ...s, reminders: [a.reminder, ...s.reminders] };
    case "removeReminder": return { ...s, reminders: s.reminders.filter((r) => r.id !== a.id) };
    case "connectDevice": return { ...s, device: a.device, wellness: a.day };
    case "disconnectDevice": return { ...s, device: null };
    case "syncWellness": {
      const d = dayOf(s, a.date);
      // Deltas only, so the day can never tick backwards.
      return { ...s, wellness: { ...d, steps: d.steps + a.steps, calories: d.calories + a.calories, activeMinutes: d.activeMinutes + a.activeMinutes } };
    }
    case "addWater": {
      const d = dayOf(s, a.date);
      return { ...s, wellness: { ...d, water: Math.min(d.water + 1, 20) } };
    }
    case "setTargets": return { ...s, targets: a.targets };
    case "wellnessLogged": return { ...s, lastWellnessLog: a.date };
  }
}

const KEY = "vitasync.v1";
const Ctx = createContext<{ state: State; dispatch: (a: Action) => void; ready: boolean } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [ready, setReady] = useReducer(() => true, false);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) dispatch({ type: "hydrate", state: { ...initial, ...JSON.parse(raw) } }); } catch {}
    setReady();
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(state)); }, [state, ready]);
  return <Ctx.Provider value={{ state, dispatch, ready }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside StoreProvider");
  return c;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

/**
 * Write a record that already carries its own hash — an uploaded report, whose
 * seal is the SHA-256 of the ciphertext, not of the canonical JSON. It lands
 * sealed in one dispatch so nothing can re-seal it with the wrong hash.
 */
export function writeSealedRecord(dispatch: (a: Action) => void, r: Omit<HealthRecord, "id" | "sealedAt">) {
  const id = uid();
  dispatch({ type: "addRecord", record: { ...r, id, sealedAt: new Date().toISOString() } });
  return id;
}

/** Write a record, hash it, mark sealed. Mirrors what the server will do in step 1. */
export async function writeRecord(dispatch: (a: Action) => void, r: Omit<HealthRecord, "id">) {
  const id = uid();
  dispatch({ type: "addRecord", record: { ...r, id } });
  const sha = await sha256Hex(canonicalRecord(r));
  dispatch({ type: "sealRecord", id, sha256: sha });
  return id;
}
