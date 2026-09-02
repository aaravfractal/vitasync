"use client";
import { useEffect, useState } from "react";
import { CloudOff } from "lucide-react";
import { translate } from "@/lib/i18n";
import { useT } from "@/lib/use-t";

/**
 * Registers the emergency service worker (public/sw.js). It caches only the
 * public strip and /app/emergency — see the header there for why the cached
 * copy can never contain the full record.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}

/**
 * Shown on the two screens that keep working without signal. `bi` stacks both
 * languages, for /u/{token} where the reader did not choose the app's language.
 *
 * The check is a real request, not `navigator.onLine`. That flag reports "this
 * device is attached to a network", not "this device can reach us" — it stays
 * true on a hotel wifi that goes nowhere, and headless Chromium never flips it
 * at all. A HEAD that fails is the only honest answer.
 */
export function OfflineBanner({ bi = false }: { bi?: boolean }) {
  const [offline, setOffline] = useState(false);
  const { t } = useT();

  useEffect(() => {
    let alive = true;
    const probe = async () => {
      try {
        const r = await fetch("/sw.js", { method: "HEAD", cache: "no-store" });
        if (alive) setOffline(!r.ok);
      } catch {
        if (alive) setOffline(true);
      }
    };
    probe();
    // Signal comes and goes in a ward; the banner should follow it without a reload.
    const id = setInterval(probe, 15000);
    addEventListener("online", probe);
    addEventListener("offline", probe);
    return () => {
      alive = false;
      clearInterval(id);
      removeEventListener("online", probe);
      removeEventListener("offline", probe);
    };
  }, []);

  if (!offline) return null;
  return (
    <div role="status" className="flex items-start gap-2.5 bg-gold-tint border border-gold-border rounded-[18px] p-3.5 mb-4 text-gold-text">
      <CloudOff size={18} className="shrink-0 mt-0.5" />
      <div className="text-[13.5px] font-medium">
        {bi ? translate("en", "common.offline") : t("common.offline")}
        {bi && <span className="block font-normal">{translate("hi", "common.offline")}</span>}
      </div>
    </div>
  );
}
