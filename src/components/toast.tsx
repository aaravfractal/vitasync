"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

const Ctx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const show = useCallback((m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2400); }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      {msg && (
        <div role="status" className="fixed bottom-[88px] inset-x-0 z-[60] flex justify-center px-6 pointer-events-none">
          <div className="bg-ink text-white text-[13.5px] font-medium rounded-full px-4 py-2.5 shadow-lg">{msg}</div>
        </div>
      )}
    </Ctx.Provider>
  );
}
