import { BottomNav } from "@/components/bottom-nav";
import { HydrationGate } from "@/components/hydration-gate";

/** The nav is static chrome, so it stays put while the store hydrates. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="screen">
        <HydrationGate>{children}</HydrationGate>
      </main>
      <BottomNav />
    </>
  );
}
