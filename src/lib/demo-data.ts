import type { Doctor, HealthRecord, Hospital, Patient, Prescription, Vital } from "./types";

/** Demo patient. Real data comes from Supabase once auth ships (see CLAUDE.md, step 1). */
export const patient: Patient = {
  id: "VS-ASHA-2381",
  shareToken: "k7q2m9x4e1", // random; the URL never carries the name
  name: "Asha Rawat",
  phoneMasked: "+91 98••• ••210",
  city: "Dehradun",
  bloodGroup: "B+",
  allergies: ["Penicillin"],
  emergencyMeds: ["Metformin 500 mg"],
  ice: { name: "Rahul Rawat", phone: "+91 98765 43210", relation: "Son" },
  abhaLinked: true,
};

export const records: HealthRecord[] = [
  {
    id: "r1", type: "consult", occurredAt: "2026-08-24T10:30:00+05:30", provider: "Dr. Meera Joshi · Doon Clinic",
    title: "GP consult — recurring headache", summary: "Tension-type headache likely. Hydration, sleep hygiene. Review in 2 weeks if persistent.",
  },
  {
    id: "r2", type: "report", occurredAt: "2026-08-18T08:05:00+05:30", provider: "Dr Lal PathLabs",
    title: "HbA1c and lipid panel", summary: "HbA1c 6.4% (improving from 7.1). LDL 96 mg/dL in range. Hb 11.8 g/dL, watch.",
  },
  {
    id: "r3", type: "rx", occurredAt: "2026-08-04T17:20:00+05:30", provider: "Dr. Meera Joshi",
    title: "Metformin 500 mg", summary: "1 tablet after lunch, 30 days. Refill needs a valid prescription on your record.",
  },
  {
    id: "r4", type: "ai_session", occurredAt: "2026-07-29T21:12:00+05:30", provider: "VitaSync assistant",
    title: "Symptom check — dull headache since morning", summary: "Low urgency. Suggested rest and fluids; see a GP today if sudden or one-sided.",
    ai: {
      urgency: "low",
      symptoms: "Dull headache since morning, all over, no fever",
      likelyCause: "Tension-type headache",
      advice: "Water, a proper meal and rest. Avoid screens for an hour.",
      nextStep: "Book a GP — if it turns sudden or one-sided, or comes with fever or a stiff neck",
    },
  },
  {
    id: "r5", type: "report", occurredAt: "2026-07-10T09:00:00+05:30", provider: "SRL Diagnostics",
    title: "Complete blood count", summary: "Within normal limits except Hb 11.6 g/dL.",
  },
];

export const vitals: Vital[] = [
  { metric: "bp", label: "Blood pressure", value: "122/81", unit: "mmHg", status: "normal", series: [128, 126, 124, 125, 122, 123, 122] },
  { metric: "glucose", label: "Blood sugar", value: "104", unit: "mg/dL fasting", delta: "−6 vs last week", status: "normal" },
  { metric: "weight", label: "Weight", value: "64.2", unit: "kg", delta: "−0.4 kg", status: "normal" },
  { metric: "hr", label: "Resting heart rate", value: "68", unit: "bpm", delta: "improved 4%", status: "normal" },
  { metric: "spo2", label: "SpO₂", value: "98", unit: "%", delta: "steady", status: "normal" },
];

export const prescriptions: Prescription[] = [
  { id: "p1", medicine: "Metformin 500 mg", dosage: "1 tab after lunch", prescriber: "Dr. Meera Joshi", daysPrescribed: 30, startedOn: "2026-08-05" },
  { id: "p2", medicine: "Vitamin D3 1000 IU", dosage: "1 cap morning", prescriber: "Dr. Meera Joshi", daysPrescribed: 60, startedOn: "2026-07-20" },
  { id: "p3", medicine: "Omega-3", dosage: "1 cap night", prescriber: "Dr. S. Bisht", daysPrescribed: 90, startedOn: "2026-07-01" },
];

export const doctors: Doctor[] = [
  { id: "d1", name: "Dr. Meera Joshi", speciality: "General physician", years: 12, clinic: "Doon Clinic, Rajpur Rd", fee: 400, km: 1.2, slots: ["10:30", "11:15", "16:00"] },
  { id: "d2", name: "Dr. Sandeep Bisht", speciality: "General physician", years: 8, clinic: "CMI Hospital", fee: 500, km: 0.6, slots: ["09:45", "12:00", "17:30"] },
  { id: "d3", name: "Dr. Priya Negi", speciality: "Endocrinologist", years: 15, clinic: "Max Super Speciality", fee: 900, km: 4.2, slots: ["11:00", "15:30"] },
];

/**
 * Seeded Dehradun hospitals. Live results come from Overpass (amenity=hospital,
 * emergency=yes) and are merged with these, not swapped in.
 *
 * Founders: call each number, then set verified:true. Never mark unverified
 * numbers as verified. A wrong number in an emergency costs more than no number.
 */
export const hospitals: Hospital[] = [
  { name: "CMI Hospital", km: 0.6, lat: 30.3265, lng: 78.0355, phone: "0135 2720000", verified: false },
  { name: "Doon Govt. Medical College", km: 1.1, lat: 30.3318, lng: 78.0244, phone: "0135 2630000", verified: false },
  { name: "Synergy Institute", km: 3.0, lat: 30.3060, lng: 78.0480, phone: "0135 2720000", verified: false },
  { name: "Max Super Speciality", km: 4.2, lat: 30.3600, lng: 78.0770, phone: "0135 6673000", verified: false },
  { name: "Shri Mahant Indiresh", km: 4.5, lat: 30.3040, lng: 77.9850, phone: "0135 2522111", verified: false },
];

export const userLocation = { lat: 30.3225, lng: 78.031 };

export function daysUsed(p: Prescription, today = new Date()) {
  const start = new Date(p.startedOn);
  const d = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return Math.max(0, Math.min(p.daysPrescribed, d));
}
