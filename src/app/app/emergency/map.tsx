"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Hospital } from "@/lib/types";

type LeafletMap = import("leaflet").Map;
type LayerGroup = import("leaflet").LayerGroup;

const youIcon = (L: typeof import("leaflet")) =>
  L.divIcon({ className: "", html: '<span style="display:block;width:16px;height:16px;border-radius:50%;background:#0E7C66;box-shadow:0 0 0 6px rgba(14,124,102,.25)"></span>', iconSize: [16, 16] });
const pinIcon = (L: typeof import("leaflet")) =>
  L.divIcon({ className: "", html: '<span style="display:block;width:14px;height:14px;border-radius:50%;background:#C0442E;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></span>', iconSize: [14, 14] });

/**
 * The map is built once and then updated in place. Rebuilding it whenever the
 * location or hospital list changes throws "Map container is already initialized"
 * and flashes the tiles.
 */
export function EmergencyMap({ center, hospitals }: { center: { lat: number; lng: number }; hospitals: Hospital[] }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap>(null);
  const markers = useRef<LayerGroup>(null);
  const leaflet = useRef<typeof import("leaflet")>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current || map.current) return;
      leaflet.current = L;
      const m = L.map(el.current, { zoomControl: false, attributionControl: true }).setView([center.lat, center.lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(m);
      markers.current = L.layerGroup().addTo(m);
      map.current = m;
      draw(L, m, markers.current);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      markers.current = null;
    };
    // Built once; the effect below keeps it current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw(L: typeof import("leaflet"), m: LeafletMap, group: LayerGroup) {
    group.clearLayers();
    L.marker([center.lat, center.lng], { icon: youIcon(L) }).addTo(group);
    hospitals.forEach((h) => L.marker([h.lat, h.lng], { icon: pinIcon(L) }).addTo(group).bindPopup(`<b>${h.name}</b><br/>${h.km} km`));
    m.setView([center.lat, center.lng], m.getZoom());
  }

  useEffect(() => {
    const L = leaflet.current;
    if (!L || !map.current || !markers.current) return;
    draw(L, map.current, markers.current);
    // draw() is stable for the values it closes over on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, hospitals]);

  return <div ref={el} className="w-full h-[46vh] rounded-[18px] overflow-hidden border border-line" aria-label="Map of nearby hospitals" />;
}
