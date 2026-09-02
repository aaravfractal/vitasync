"use client";
import { useState } from "react";
import { cx } from "@/components/ui";

/**
 * Two single-series charts, drawn as inline SVG.
 *
 * One series each, so identity is carried by the chart's own title and there is
 * no legend and no categorical palette to get wrong — every mark is the locked
 * teal. Grid and axes stay recessive; values wear text tokens, never the series
 * colour. Both carry a hover layer, and both have a table view underneath for
 * anyone who cannot use it.
 */

const TEAL = "var(--color-teal)";

type Pt = { label: string; value: number };

function niceMax(v: number) {
  const step = Math.pow(10, Math.floor(Math.log10(v))) / 2;
  return Math.ceil(v / step) * step;
}

/** Change over time. Crosshair follows the pointer to the nearest week. */
export function LineChart({ data, unit }: { data: Pt[]; unit: string }) {
  const [i, setI] = useState<number | null>(null);
  const W = 720, H = 260, L = 44, R = 16, T = 16, B = 34;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const x = (n: number) => L + (n * (W - L - R)) / (data.length - 1);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const ticks = [0, max / 2, max];
  const path = data.map((d, n) => `${n ? "L" : "M"}${x(n)},${y(d.value)}`).join(" ");
  const active = i === null ? null : data[i];

  return (
    <div>
      {/* The readout sits above the plot, not floating over it: a tooltip pinned
          inside the frame covered the most recent weeks, which are the ones
          anyone actually leans in to read. The row keeps its height so nothing
          shifts when the pointer enters. */}
      <div className="h-5 mb-1 text-right text-[12.5px]">
        {active && (
          <span><span className="text-muted">{active.label}</span> <span className="font-semibold text-ink">{active.value} {unit}</span></span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`${unit} by week. ${data.map((d) => `${d.label}: ${d.value}`).join(", ")}.`}
        onPointerLeave={() => setI(null)}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const n = Math.round(((px - L) / (W - L - R)) * (data.length - 1));
          setI(Math.max(0, Math.min(data.length - 1, n)));
        }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--color-divider)" strokeWidth="1" />
            <text x={L - 10} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-faint)">{t}</text>
          </g>
        ))}
        {/* Every third week, so the axis never collides with itself. */}
        {data.map((d, n) => (n % 3 === 0 || n === data.length - 1) && (
          <text key={d.label} x={x(n)} y={H - 12} textAnchor="middle" fontSize="11" fill="var(--color-faint)">{d.label}</text>
        ))}
        {active && i !== null && (
          <line x1={x(i)} x2={x(i)} y1={T} y2={H - B} stroke="var(--color-line)" strokeWidth="1" />
        )}
        <path d={path} fill="none" stroke={TEAL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* A 2px surface ring keeps the marker legible where it sits on the line. */}
        {active && i !== null && (
          <circle cx={x(i)} cy={y(active.value)} r="5.5" fill={TEAL} stroke="var(--color-surface)" strokeWidth="2" />
        )}
      </svg>
    </div>
  );
}

/** Magnitude by identity: horizontal bars, longest first, labelled directly. */
export function BarChart({ data, unit }: { data: Pt[]; unit: string }) {
  const [i, setI] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value));
  const total = data.reduce((n, d) => n + d.value, 0);
  return (
    <ul className="space-y-2.5" role="list">
      {data.map((d, n) => (
        <li
          key={d.label}
          className="grid grid-cols-[minmax(140px,190px)_1fr_auto] items-center gap-3"
          onPointerEnter={() => setI(n)}
          onPointerLeave={() => setI(null)}
        >
          <span className="text-[13.5px] text-muted truncate">{d.label}</span>
          <span className="relative block h-6 bg-paper rounded-[4px] overflow-hidden">
            <span
              className={cx("absolute inset-y-0 left-0 rounded-r-[4px] transition-[width]", i === n && "opacity-90")}
              style={{ width: `${(d.value / max) * 100}%`, background: TEAL }}
            />
          </span>
          {/* Every bar is already labelled, so hover earns its place by adding
              the share of the total rather than repeating the number. */}
          <span className="text-[13.5px] font-semibold tabular-nums whitespace-nowrap">
            {i === n
              ? <span className="text-muted font-medium">{Math.round((d.value / total) * 100)}% of {unit}</span>
              : d.value.toLocaleString("en-IN")}
          </span>
        </li>
      ))}
      <li className="sr-only">{unit}</li>
    </ul>
  );
}

/** The table view. Always available, never the only thing on screen. */
export function DataTable({ head, rows }: { head: [string, string]; rows: Array<[string, string | number]> }) {
  return (
    <table className="w-full text-[13.5px] mt-2">
      <thead>
        <tr className="text-muted text-left">
          <th className="font-medium py-1.5">{head[0]}</th>
          <th className="font-medium py-1.5 text-right">{head[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-t border-divider">
            <td className="py-1.5">{k}</td>
            <td className="py-1.5 text-right tabular-nums font-medium">{typeof v === "number" ? v.toLocaleString("en-IN") : v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
