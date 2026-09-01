"use client";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

/**
 * The store hydrates from localStorage in an effect, so the first paint would
 * otherwise show seed data — English instead of the chosen language, the seeded
 * record count, yesterday's vitals — and visibly flip a moment later. Every
 * /app screen waits behind this instead. The server prerender and the first
 * client render are both the skeleton, so there is nothing to mismatch.
 */
export function HydrationGate({ children }: { children: ReactNode }) {
  const { ready } = useStore();
  if (!ready) return <ScreenSkeleton />;
  return <>{children}</>;
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
