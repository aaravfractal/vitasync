"use client";
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/** Bottom sheet: 24px top radius, grab handle, soft top shadow. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/30" />
      <div className="absolute bottom-0 inset-x-0 mx-auto max-w-[430px] bg-surface rounded-t-[24px] shadow-[0_-12px_40px_-20px_rgba(30,43,40,.45)] p-5 pb-[max(20px,env(safe-area-inset-bottom))] max-h-[85dvh] overflow-y-auto">
        <div className="mx-auto w-10 h-1 rounded-full bg-line mb-4" />
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="text-[18px] font-bold">{title}</h2>}
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 -mr-2 rounded-full hover:bg-tint inline-flex items-center justify-center text-muted"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
