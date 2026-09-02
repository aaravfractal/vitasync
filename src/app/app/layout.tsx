import { BottomNav } from "@/components/bottom-nav";
import { DesktopShell } from "@/components/desktop-shell";
import { HydrationGate } from "@/components/hydration-gate";

/**
 * The nav is static chrome, so it stays put while the store hydrates.
 * DesktopShell is inert below 1024px; above it, both of these sit in the frame.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DesktopShell>
      <main className="screen">
        <HydrationGate>{children}</HydrationGate>
      </main>
      <BottomNav />
    </DesktopShell>
  );
}
