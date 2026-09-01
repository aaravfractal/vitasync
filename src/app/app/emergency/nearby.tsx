"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Navigation, Phone, ShieldCheck } from "lucide-react";
import { ScreenHeader, cx } from "@/components/ui";
import { hospitals as curated } from "@/lib/demo-data";
import { FALLBACK_CENTER, locate, mergeHospitals, nearbyHospitals, type Coords } from "@/lib/geo";
import type { Hospital } from "@/lib/types";
import { EmergencyMap } from "./map";

/**
 * Curated Dehradun list from the first paint, merged with whatever Overpass
 * returns. It never blocks on the network and never empties: a failed, slow or
 * denied lookup just leaves the curated rows standing.
 */
export function EmergencyNearby({ actions, footer }: { actions: ReactNode; footer: ReactNode }) {
  const [center, setCenter] = useState<Coords>(FALLBACK_CENTER);
  const [list, setList] = useState<Hospital[]>(() => mergeHospitals(curated, [], FALLBACK_CENTER));
  const [live, setLive] = useState(false);
  const [precise, setPrecise] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const rows = useRef(new Map<string, HTMLLIElement>());

  useEffect(() => {
    let alive = true;
    (async () => {
      const here = await locate();
      if (!alive) return;
      setCenter(here.center);
      setPrecise(here.precise);
      setList(mergeHospitals(curated, [], here.center));
      try {
        const found = await nearbyHospitals(here.center);
        if (!alive || !found.length) return;
        setList(mergeHospitals(curated, found, here.center));
        setLive(true);
      } catch {
        // Timed out, offline, or Overpass is down. The curated rows stand.
      }
    })();
    return () => { alive = false; };
  }, []);

  // Tapping a pin brings its row into view and marks it for a moment.
  const onSelect = useCallback((name: string) => {
    setSelected(name);
    rows.current.get(name)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  useEffect(() => {
    if (!selected) return;
    const t = setTimeout(() => setSelected(null), 2600);
    return () => clearTimeout(t);
  }, [selected]);

  return (
    <>
      <ScreenHeader
        title={<span className="text-danger">Emergency</span>}
        subtitle={`${list.length} hospitals with 24×7 emergency near you`}
        right={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-tint border border-tint-border text-teal text-[12px] font-medium px-3 py-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-teal" /> {precise ? "Live location" : "Dehradun"}
          </span>
        }
      />
      <EmergencyMap center={center} hospitals={list} onSelect={onSelect} />

      <div className="mt-4 bg-surface border border-line rounded-[24px] p-4">
        <div className="mx-auto w-10 h-1 rounded-full bg-line mb-3" />
        {actions}
        <p className="text-[11.5px] text-faint mt-3">
          {live
            ? "Your curated list plus hospitals within 10 km from OpenStreetMap. Tap a pin to jump to its row."
            : precise
              ? "Curated list only — the hospital search did not answer in time. Tap a pin to jump to its row."
              : "Curated Dehradun list. Turn on location for hospitals near you."}
        </p>

        <ul className="divide-y divide-divider mt-1">
          {list.map((h, i) => (
            <HospitalRow
              key={`${h.name}-${h.lat}`}
              h={h}
              center={center}
              nearest={i === 0}
              selected={selected === h.name}
              ref={(node) => {
                if (node) rows.current.set(h.name, node);
                else rows.current.delete(h.name);
              }}
            />
          ))}
        </ul>

        {footer}
      </div>
    </>
  );
}

function HospitalRow({
  h,
  center,
  nearest,
  selected,
  ref,
}: {
  h: Hospital;
  center: Coords;
  nearest: boolean;
  selected: boolean;
  ref: (node: HTMLLIElement | null) => void;
}) {
  return (
    <li ref={ref} className={cx("py-3 -mx-2 px-2 rounded-[12px] transition-colors", selected && "bg-tint")}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[14px] truncate">{h.name}</span>
            {nearest && <span className="shrink-0 rounded-full bg-teal text-white text-[10.5px] font-bold px-2 py-0.5">Nearest</span>}
          </div>
          <div className="text-[12px] text-muted">{h.km} km · 24×7 emergency</div>
          {h.phone ? (
            <div className="mt-1 flex items-center gap-2">
              <span className="mono text-[12px] text-muted">{h.phone}</span>
              {h.verified ? (
                <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-teal">
                  <ShieldCheck size={13} strokeWidth={2} /> Verified number
                </span>
              ) : (
                <span className="text-[11.5px] text-faint">Listed</span>
              )}
            </div>
          ) : (
            <div className="mt-1 text-[11.5px] text-faint">No number listed · use 108</div>
          )}
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          {h.phone && (
            <a
              href={`tel:${h.phone.replace(/[^\d+]/g, "")}`}
              aria-label={`Call ${h.name}`}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-danger text-white px-3.5 min-h-[36px] text-[13px] font-semibold"
            >
              <Phone size={14} /> Call
            </a>
          )}
          <a
            href={`https://www.openstreetmap.org/directions?from=${center.lat},${center.lng}&to=${h.lat},${h.lng}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`Directions to ${h.name}`}
            className="inline-flex items-center justify-center gap-1 rounded-full border border-teal text-teal px-3.5 min-h-[36px] text-[13px] font-semibold"
          >
            <Navigation size={14} /> Directions
          </a>
        </div>
      </div>
    </li>
  );
}
