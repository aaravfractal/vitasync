"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Navigation } from "lucide-react";
import { ScreenHeader } from "@/components/ui";
import { hospitals as seeded } from "@/lib/demo-data";
import { FALLBACK_CENTER, locate, nearbyHospitals, type Coords } from "@/lib/geo";
import type { Hospital } from "@/lib/types";
import { EmergencyMap } from "./map";

type Source = "seed" | "live";

/**
 * Real hospitals when the device and Overpass cooperate, the seeded Dehradun
 * list otherwise. It never blocks on the network: the seeded list is on screen
 * from the first paint and is only replaced once a better one arrives.
 */
export function EmergencyNearby({ actions, footer }: { actions: ReactNode; footer: ReactNode }) {
  const [center, setCenter] = useState<Coords>(FALLBACK_CENTER);
  const [list, setList] = useState<Hospital[]>(seeded);
  const [source, setSource] = useState<Source>("seed");
  const [precise, setPrecise] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      const here = await locate();
      if (!live) return;
      setCenter(here.center);
      setPrecise(here.precise);
      try {
        const found = await nearbyHospitals(here.center);
        // An empty result is not an improvement on the seeded list.
        if (live && found.length) {
          setList(found);
          setSource("live");
        }
      } catch {
        // Timed out, offline, or Overpass is down. The seeded list stands.
      }
    })();
    return () => { live = false; };
  }, []);

  return (
    <>
      <ScreenHeader
        title={<span className="text-danger">Emergency</span>}
        subtitle={`${list.length} hospitals with 24×7 emergency near you`}
        right={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-tint border border-tint-border text-teal text-[12px] font-medium px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-teal" /> {precise ? "Live location" : "Dehradun"}
          </span>
        }
      />
      <EmergencyMap center={center} hospitals={list} />

      <div className="mt-4 bg-surface border border-line rounded-[24px] p-4">
        <div className="mx-auto w-10 h-1 rounded-full bg-line mb-3" />
        {actions}
        <ul className="divide-y divide-divider mt-3">
          {list.slice(0, 2).map((h) => (
            <li key={`${h.name}-${h.lat}`} className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] truncate">{h.name}</div>
                <div className="text-[12px] text-muted">{h.km} km · 24×7 emergency</div>
              </div>
              <a
                href={`https://www.openstreetmap.org/directions?from=${center.lat},${center.lng}&to=${h.lat},${h.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-teal text-teal px-3.5 min-h-[36px] text-[13px] font-semibold"
              >
                <Navigation size={14} /> Directions
              </a>
            </li>
          ))}
        </ul>
        <p className="text-[11.5px] text-faint">
          {source === "live"
            ? "Hospitals within 10 km, from OpenStreetMap."
            : precise
              ? "Showing our Dehradun list — the hospital search did not answer in time."
              : "Showing our Dehradun list. Turn on location for hospitals near you."}
        </p>
        {footer}
      </div>
    </>
  );
}
