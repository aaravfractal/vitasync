"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card, Pill, ScreenHeader } from "@/components/ui";
import { useToast } from "@/components/toast";
import { useStore } from "@/lib/store";

export default function MyId() {
  const { state } = useStore();
  const toast = useToast();
  const [qr, setQr] = useState<string>("");
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = `${window.location.origin}/u/${state.patient.shareToken}`;
    QRCode.toDataURL(u, { margin: 1, width: 400, color: { dark: "#1E2B28", light: "#FFFFFF" } }).then((data) => { setUrl(u); setQr(data); });
  }, [state.patient.shareToken]);

  async function share(kind: "qr" | "link") {
    try {
      if (kind === "qr" && qr && navigator.share) {
        const blob = await (await fetch(qr)).blob();
        const file = new File([blob], "vitasync-id.png", { type: "image/png" });
        await navigator.share({ title: "My VitaSync ID", text: `${state.patient.name} · emergency ID`, files: [file] });
        return;
      }
      if (navigator.share) { await navigator.share({ title: "My VitaSync ID", url }); return; }
      await navigator.clipboard.writeText(url); toast("Link copied");
    } catch { await navigator.clipboard.writeText(url); toast("Link copied"); }
  }
  function downloadQr() { const a = document.createElement("a"); a.href = qr; a.download = `vitasync-${state.patient.id}.png`; a.click(); }

  return (
    <>
      <ScreenHeader title="My VitaSync ID" />
      <Card className="text-center rounded-[22px] p-6">
        <div className="mx-auto w-[220px] h-[220px] bg-white border border-line rounded-[16px] flex items-center justify-center overflow-hidden">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL
            <img src={qr} alt={`QR code for ${url}`} className="w-full h-full" />
          ) : <span className="text-faint text-[13px]">Generating…</span>}
        </div>
        <div className="display text-[20px] font-bold mt-4">{state.patient.name}</div>
        <div className="mono text-[13px] text-muted">{state.patient.id}</div>
        <a href={url} className="text-[12.5px] text-teal mt-1 break-all block">{url.replace(/^https?:\/\//, "")}</a>
        <div className="flex gap-2 mt-4"><Pill onClick={() => share("qr")} className="flex-1">Share QR</Pill><Pill variant="secondary" onClick={() => share("link")} className="flex-1">Share link</Pill></div>
        <button onClick={downloadQr} className="text-teal text-[13px] font-semibold mt-3">Download QR image</button>
      </Card>
      <Card className="mt-3">
        <div className="grid grid-cols-[1fr_auto] gap-y-3 text-[14px]">
          <span>Name, blood group, allergies, ICE</span><span className="text-teal font-semibold">Always</span>
          <span>Full health record</span><span className="text-gold-text font-semibold">After you approve</span>
        </div>
      </Card>
      <p className="text-[12.5px] text-muted mt-3">Approval is a one-time code to your phone or your caregiver&apos;s. Links expire after 24 hours and you can revoke them from Privacy &amp; access.</p>
      <Pill href={`/u/${state.patient.shareToken}`} variant="ghost" className="w-full mt-2">Preview what a doctor sees</Pill>
    </>
  );
}
