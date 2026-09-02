"use client";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui";

const WIDE = "(min-width: 1024px)";
const trust = ["You own the record", "Sealed with SHA-256", "Emergency ID works without OTP"];

/**
 * Wide-screen wrapper for /app and /u. Below 1024px every element here is
 * `display: contents` or `display: none` (see globals.css), so the phone
 * rendering is untouched — this adds presentation, never layout, to mobile.
 * Above it the screens sit in a 430px frame that is also their containing
 * block, so the bottom nav and the sheets dock inside the frame.
 */
export function DesktopShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [wide, setWide] = useState(false);
  const [qr, setQr] = useState("");

  // Server and first client render are both narrow, so nothing to mismatch.
  useEffect(() => {
    const m = window.matchMedia(WIDE);
    const sync = () => setWide(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  // Phones never pay for the QR: the encoder is only fetched on a wide screen.
  useEffect(() => {
    if (!wide) return;
    let live = true;
    import("qrcode")
      .then((m) => m.default.toDataURL(window.location.href, { margin: 1, width: 192, color: { dark: "#1E2B28", light: "#F7F5F0" } }))
      .then((data) => live && setQr(data))
      .catch(() => live && setQr(""));
    return () => { live = false; };
  }, [wide, path]);

  return (
    <div className="deck">
      <div className="deck-backdrop" aria-hidden="true" />
      <div className="deck-mark">
        <Logo size={30} />
        <span className="display font-bold text-[16px]">VitaSync</span>
      </div>

      <div className="deck-frame">
        <div className="deck-scroll">{children}</div>
      </div>

      <aside className="deck-aside">
        <ul className="text-[13px] text-muted space-y-2.5">
          {trust.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </aside>

      <div className="deck-caption">
        {qr && (
          // eslint-disable-next-line @next/next/no-img-element -- data URL, generated on the device
          <img src={qr} alt="Scan to open this page on your phone" width={96} height={96} className="w-24 h-24 shrink-0 rounded-[10px]" />
        )}
        <p className="text-[12.5px] text-muted">VitaSync is designed for your phone. Scan to open.</p>
      </div>
    </div>
  );
}
