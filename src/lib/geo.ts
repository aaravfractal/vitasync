/**
 * Location + nearby-hospital lookup for the emergency screen.
 * Runs on the device: the browser asks Overpass directly, so the patient's
 * coordinates never touch our server.
 */
import type { Hospital } from "@/lib/types";
import { userLocation } from "@/lib/demo-data";

/** Dehradun. Used whenever GPS is denied, unavailable or slow. */
export const FALLBACK_CENTER = userLocation;

export const RADIUS_M = 10_000;
/** Past this the seeded list wins — an emergency screen may not sit and spin. */
export const OVERPASS_TIMEOUT_MS = 4000;
const GEOLOCATION_TIMEOUT_MS = 5000;

export type Coords = { lat: number; lng: number };

export function distanceKm(a: Coords, b: Coords) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la = (a.lat * Math.PI) / 180;
  const lb = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Resolves to the device's position, or to Dehradun if it is denied or slow. */
export function locate(): Promise<{ center: Coords; precise: boolean }> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ center: FALLBACK_CENTER, precise: false });
      return;
    }
    let settled = false;
    const done = (center: Coords, precise: boolean) => {
      if (settled) return;
      settled = true;
      resolve({ center, precise });
    };
    navigator.geolocation.getCurrentPosition(
      (p) => done({ lat: p.coords.latitude, lng: p.coords.longitude }, true),
      () => done(FALLBACK_CENTER, false),
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 60_000 },
    );
    setTimeout(() => done(FALLBACK_CENTER, false), GEOLOCATION_TIMEOUT_MS);
  });
}

type OverpassElement = {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const QUERY = (c: Coords) => `[out:json][timeout:8];(
  node["amenity"="hospital"]["emergency"="yes"](around:${RADIUS_M},${c.lat},${c.lng});
  way["amenity"="hospital"]["emergency"="yes"](around:${RADIUS_M},${c.lat},${c.lng});
  relation["amenity"="hospital"]["emergency"="yes"](around:${RADIUS_M},${c.lat},${c.lng});
);out center;`;

/**
 * Hospitals with 24×7 emergency within 10 km. Throws on failure or after
 * OVERPASS_TIMEOUT_MS so the caller can fall back to the seeded list.
 */
export async function nearbyHospitals(center: Coords): Promise<Hospital[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), OVERPASS_TIMEOUT_MS);
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: new URLSearchParams({ data: QUERY(center) }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    const data: { elements?: OverpassElement[] } = await res.json();
    return (data.elements ?? [])
      .map((el) => {
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        const name = el.tags?.name;
        if (lat === undefined || lng === undefined || !name) return null;
        return {
          name,
          km: Number(distanceKm(center, { lat, lng }).toFixed(1)),
          lat,
          lng,
          phone: el.tags?.phone ?? el.tags?.["contact:phone"] ?? "108",
        } satisfies Hospital;
      })
      .filter((h): h is Hospital => h !== null)
      .sort((a, b) => a.km - b.km);
  } finally {
    clearTimeout(timer);
  }
}
