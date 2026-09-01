export type RecordType = "consult" | "report" | "rx" | "vital" | "ai_session";

export type Urgency = "low" | "gp_today" | "emergency";

/** Structured payload behind an ai_session record. Rendered at /app/record/session/{id}. */
export interface AiSession {
  urgency: Urgency;
  symptoms: string;
  likelyCause: string;
  advice: string;
  nextStep: string;
}

export interface HealthRecord {
  id: string;
  type: RecordType;
  occurredAt: string; // ISO
  provider: string;
  title: string;
  summary: string;
  sha256?: string;
  anchorTx?: string | null; // null until Polygon anchoring ships
  sealedAt?: string;
  ai?: AiSession; // ai_session records only
}

export interface Vital {
  metric: "bp" | "glucose" | "weight" | "hr" | "spo2";
  label: string;
  value: string;
  unit: string;
  delta?: string;
  status: "normal" | "watch";
  series?: number[];
}

export interface Prescription {
  id: string;
  medicine: string;
  dosage: string;
  prescriber: string;
  daysPrescribed: number;
  startedOn: string; // ISO date
}

export interface Doctor {
  id: string;
  name: string;
  speciality: string;
  years: number;
  clinic: string;
  fee: number;
  km: number;
  slots: string[];
}

export interface Hospital {
  name: string;
  km: number;
  lat: number;
  lng: number;
  phone: string;
}

export interface Patient {
  id: string; // VS-ASHA-2381 (display id, friendly)
  shareToken: string; // random, used in /u/{token}. never the name.
  name: string;
  phoneMasked: string;
  city: string;
  bloodGroup: string;
  allergies: string[];
  emergencyMeds: string[];
  ice: { name: string; phone: string; relation: string };
  abhaLinked: boolean;
}

export type DeviceKind = "apple" | "wear" | "fitbit" | "band";

/** Demo-mode pairing. No HealthKit or Health Connect until the native app ships. */
export interface ConnectedDevice {
  kind: DeviceKind;
  name: string;
  platform: string;
  connectedAt: string;
}

export interface WellnessTargets {
  steps: number;
  calories: number; // active kcal burned, not intake
  activeMinutes: number;
  water: number; // glasses
}

/** One day of activity, keyed by local date so it resets at midnight. */
export interface WellnessDay {
  date: string; // YYYY-MM-DD, local
  steps: number;
  calories: number;
  activeMinutes: number;
  water: number;
}
