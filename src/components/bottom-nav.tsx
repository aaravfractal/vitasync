"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircleHeart, FileText, HeartPulse, User } from "lucide-react";
import { cx } from "./ui";

const items = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/symptom", label: "Check", icon: MessageCircleHeart },
  { href: "/app/record", label: "Record", icon: FileText },
  { href: "/app/vitals", label: "Vitals", icon: HeartPulse },
  { href: "/app/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-line" aria-label="Primary">
      <ul className="mx-auto max-w-[430px] grid grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/app" ? path === "/app" : path.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} className={cx("flex flex-col items-center gap-0.5 py-2.5 min-h-[56px] text-[11px] font-medium", active ? "text-teal" : "text-faint")}>
                <Icon size={22} strokeWidth={active ? 2.1 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
