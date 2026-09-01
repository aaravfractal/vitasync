import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

export function Field({ label, ...p }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block mb-3">
      <span className="block text-[12.5px] text-muted mb-1">{label}</span>
      <input {...p} className="w-full min-h-[44px] rounded-[12px] bg-paper border border-line px-3 text-[15px] outline-none focus:border-teal" />
    </label>
  );
}
export function Select({ label, children, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="block mb-3">
      <span className="block text-[12.5px] text-muted mb-1">{label}</span>
      <select {...p} className="w-full min-h-[44px] rounded-[12px] bg-paper border border-line px-3 text-[15px] outline-none focus:border-teal">{children}</select>
    </label>
  );
}
