import { pct } from "@/lib/wellness";

/** Progress ring. Teal fill on a line-coloured track; gold once the target is met. */
export function Ring({ value, target, label, unit, size = 96 }: { value: number; target: number; label: string; unit: string; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const done = target > 0 && value >= target;
  const filled = pct(value, target) * c;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${value} of ${target} ${unit}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={done ? "var(--color-gold)" : "var(--color-teal)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="text-[12.5px] text-muted mt-2">{label}</div>
    </div>
  );
}

/** Segmented bar, one segment per glass. */
export function Glasses({ value, target }: { value: number; target: number }) {
  const n = Math.max(target, value);
  return (
    <div className="flex gap-1.5" role="img" aria-label={`Water: ${value} of ${target} glasses`}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`h-8 flex-1 rounded-[6px] border ${i < value ? "bg-teal border-teal" : "bg-paper border-line"}`} />
      ))}
    </div>
  );
}
