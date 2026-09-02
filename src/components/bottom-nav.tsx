"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircleHeart, FileText, HeartPulse, User, Siren } from "lucide-react";
import { cx } from "./ui";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/use-t";
import type { Key } from "@/lib/i18n";

const items: Array<{ href: string; label: Key; icon: typeof Home }> = [
  { href: "/app", label: "nav.home", icon: Home },
  { href: "/app/symptom", label: "nav.check", icon: MessageCircleHeart },
  { href: "/app/record", label: "nav.record", icon: FileText },
  { href: "/app/vitals", label: "nav.vitals", icon: HeartPulse },
  { href: "/app/profile", label: "nav.profile", icon: User },
];

/**
 * Elder Mode keeps three destinations. Record and Vitals are reachable from
 * Profile; Emergency replaces them here, because the one thing that must never
 * be two taps away is 112.
 */
const elderItems: Array<{ href: string; label: Key; icon: typeof Home }> = [
  { href: "/app", label: "nav.home", icon: Home },
  { href: "/app/symptom", label: "nav.check", icon: MessageCircleHeart },
  { href: "/app/emergency", label: "nav.emergency", icon: Siren },
];

export function BottomNav() {
  const path = usePathname();
  const { state } = useStore();
  const { t } = useT();
  const shown = state.elderMode ? elderItems : items;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-line" aria-label="Primary">
      <ul className={cx("mx-auto max-w-[430px] grid px-2 pb-[env(safe-area-inset-bottom)]", state.elderMode ? "grid-cols-3" : "grid-cols-5")}>
        {shown.map(({ href, label, icon: Icon }) => {
          const active = href === "/app" ? path === "/app" : path.startsWith(href);
          const danger = href === "/app/emergency";
          return (
            <li key={href}>
              <Link href={href} className={cx("flex flex-col items-center gap-0.5 py-2.5 min-h-[56px] font-medium", state.elderMode ? "text-[13px]" : "text-[11px]", danger ? "text-danger" : active ? "text-teal" : "text-faint")}>
                <Icon size={state.elderMode ? 26 : 22} strokeWidth={active ? 2.1 : 1.8} />
                {t(label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
