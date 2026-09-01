"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

/**
 * Routes that render before the store is ready. Only for screens that read
 * nothing from the store and write nothing to it — a write landing before the
 * hydrate dispatch would be overwritten by it.
 *
 * /app/emergency is here because locked rule 4 wants 112 and 108 reachable, and
 * behind the gate the tel: links were missing from the prerendered HTML. The
 * screen reads its hospitals from demo-data, so there is no seed data to flash;
 * the live Overpass list arrives later on its own. Note /app/emergency/share is
 * NOT exempt: it dispatches a grant, which hydrate would clobber.
 */
const UNGATED = new Set(["/app/emergency"]);

/**
 * The store hydrates from localStorage in an effect, so the first paint would
 * otherwise show seed data — English instead of the chosen language, the seeded
 * record count, yesterday's vitals — and visibly flip a moment later. Every
 * other /app screen waits behind this. The server prerender and the first
 * client render are both the skeleton, so there is nothing to mismatch.
 */
export function HydrationGate({ children }: { children: ReactNode }) {
  const { ready } = useStore();
  const path = usePathname();
  if (ready || UNGATED.has(path)) return <>{children}</>;
  return <ScreenSkeleton />;
}

const Block = ({ className }: { className: string }) => <div className={`bg-line/60 rounded-[12px] ${className}`} />;

/** Neutral placeholder: paper background, no data, nothing that can be read as real. */
function ScreenSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex-1 space-y-2 pt-1">
          <Block className="h-3.5 w-24" />
          <Block className="h-6 w-40" />
        </div>
        <Block className="w-11 h-11 rounded-full" />
      </div>
      <Block className="h-[132px] w-full rounded-[22px] mb-3" />
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Block className="h-[104px] rounded-[18px]" />
        <Block className="h-[104px] rounded-[18px]" />
        <Block className="h-[104px] rounded-[18px]" />
        <Block className="h-[104px] rounded-[18px]" />
      </div>
      <Block className="h-[72px] w-full rounded-[18px]" />
    </div>
  );
}
