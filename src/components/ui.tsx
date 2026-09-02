import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, Heart, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export function cx(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

/** Brand mark: white heart in a teal rounded square. */
export function Logo({ size = 44 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center bg-teal text-white"
      style={{ width: size, height: size, borderRadius: size * 0.24 }}
      aria-label="VitaSync"
    >
      <Heart size={size * 0.5} strokeWidth={2.2} />
    </span>
  );
}

export function Card({ className, children, tone = "surface" }: { className?: string; children: ReactNode; tone?: "surface" | "tint" | "teal" | "gold" | "danger" }) {
  const tones = {
    surface: "bg-surface border border-line",
    tint: "bg-tint border border-tint-border",
    teal: "bg-teal text-white border border-teal",
    gold: "bg-gold-tint border border-gold-border",
    danger: "bg-surface border border-line",
  };
  return <div className={cx("rounded-[18px] p-4", tones[tone], className)}>{children}</div>;
}

type PillProps = { children: ReactNode; variant?: "primary" | "secondary" | "danger" | "ghost"; className?: string; href?: string; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean };
export function Pill({ children, variant = "primary", className, href, onClick, type = "button", disabled }: PillProps) {
  const v = {
    primary: "bg-teal text-white hover:bg-teal-dark active:bg-teal-dark",
    secondary: "bg-surface text-teal border border-teal hover:bg-tint",
    danger: "bg-danger text-white hover:opacity-90",
    ghost: "bg-transparent text-teal hover:bg-tint",
  }[variant];
  const base = cx("inline-flex items-center justify-center gap-2 rounded-full min-h-[44px] px-5 font-semibold text-[15px] transition-colors disabled:opacity-50", v, className);
  if (href) return <Link href={href} className={base}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={base}>{children}</button>;
}

export function Chip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx("rounded-full px-3.5 min-h-[36px] text-[13px] font-medium border transition-colors",
        active ? "bg-teal text-white border-teal" : "bg-surface text-ink border-line hover:border-tint-border")}
    >
      {children}
    </button>
  );
}

export function IconChip({ icon: Icon, size = 44, tone = "tint" }: { icon: LucideIcon; size?: number; tone?: "tint" | "danger" | "gold" }) {
  const t = { tint: "bg-tint text-teal", danger: "bg-danger-tint text-danger", gold: "bg-gold-tint text-gold-text" }[tone];
  return (
    <span className={cx("inline-flex items-center justify-center rounded-[12px] shrink-0", t)} style={{ width: size, height: size }}>
      <Icon size={size * 0.5} strokeWidth={1.8} />
    </span>
  );
}

export function VerifiedPill({ text = "Record verified · owned by you" }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-tint border border-tint-border text-teal px-3 py-1.5 text-[12.5px] font-medium">
      <ShieldCheck size={14} strokeWidth={2} /> {text}
    </span>
  );
}

export function Overline({ children, tone = "teal" }: { children: ReactNode; tone?: "teal" | "gold" | "muted" }) {
  const c = { teal: "text-teal", gold: "text-gold-text", muted: "text-faint" }[tone];
  return <div className={cx("overline", c)}>{children}</div>;
}

export function ScreenHeader({ title, back = "/app", right, subtitle, backLabel = "Back" }: { title: ReactNode; back?: string | null; right?: ReactNode; subtitle?: ReactNode; backLabel?: string }) {
  return (
    <header className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-2 min-w-0">
        {back && (
          <Link href={back} aria-label={backLabel} className="inline-flex items-center justify-center w-11 h-11 -ml-2 rounded-full hover:bg-tint text-ink">
            <ChevronLeft size={22} strokeWidth={1.8} />
          </Link>
        )}
        <div className="min-w-0 pt-1.5">
          <h1 className="text-[18px] font-bold leading-tight">{title}</h1>
          {subtitle && <div className="text-[12.5px] text-muted mt-0.5">{subtitle}</div>}
        </div>
      </div>
      {right}
    </header>
  );
}

export function Divider() {
  return <hr className="border-0 border-t border-divider my-3" />;
}

export function StatRow({ items }: { items: Array<{ value: string; label: string }> }) {
  return (
    <div className="grid grid-cols-3">
      {items.map((it, i) => (
        <div key={it.label} className={cx("px-2 text-center", i > 0 && "border-l border-divider")}>
          <div className="display text-[22px] font-bold text-teal leading-none">{it.value}</div>
          <div className="text-[11.5px] text-muted mt-1">{it.label}</div>
        </div>
      ))}
    </div>
  );
}
