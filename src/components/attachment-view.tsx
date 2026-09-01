"use client";
import { useEffect, useState } from "react";
import { ciphertextHead, decryptToBlob, formatBytes } from "@/lib/attachments";
import type { Attachment } from "@/lib/types";

/**
 * Decrypts on open, hands the bytes to the browser as an object URL, and revokes
 * that URL when the sheet closes (the Sheet unmounts its children, so cleanup
 * runs then). Nothing is written to disk on this path.
 */
export function AttachmentView({ attachment }: { attachment: Attachment }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [stored, setStored] = useState<{ hex: string; shown: number; total: number } | null>(null);
  const [showStored, setShowStored] = useState(false);

  useEffect(() => {
    let live = true;
    let objectUrl: string | null = null;
    decryptToBlob(attachment)
      .then((blob) => {
        if (!live) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment]);

  async function toggleStored() {
    setShowStored((s) => !s);
    if (!stored) setStored(await ciphertextHead(attachment).catch(() => null));
  }

  return (
    <div className="mt-3">
      <div className="rounded-[14px] border border-line bg-paper overflow-hidden">
        {failed ? (
          <p className="p-4 text-[13px] text-muted">This file was encrypted on another device, so it cannot be opened here. The hash below still proves what was sealed.</p>
        ) : !url ? (
          <p className="p-4 text-[13px] text-muted">Decrypting on this device…</p>
        ) : attachment.mime === "application/pdf" ? (
          <iframe src={url} title={attachment.name} className="w-full h-[320px] block" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- a blob: URL from a key only this device holds; the image optimiser cannot fetch it
          <img src={url} alt={attachment.name} className="w-full block" />
        )}
      </div>
      <div className="flex items-center justify-between gap-3 mt-2 text-[12.5px]">
        <span className="text-muted truncate">{attachment.name} · {formatBytes(attachment.size)}</span>
        <button onClick={toggleStored} className="text-teal font-semibold shrink-0">{showStored ? "Hide" : "What's stored"}</button>
      </div>
      {showStored && (
        <div className="mt-2 bg-paper border border-line rounded-[14px] p-3 text-[12.5px]">
          {stored ? (
            <>
              <div className="text-muted">First {stored.shown} bytes of {formatBytes(stored.total)} of ciphertext</div>
              <div className="mono text-[11.5px] break-all mt-1">{stored.hex} …</div>
              <p className="text-muted mt-2">This is all that would ever leave your phone — plus the hash.</p>
            </>
          ) : (
            <div className="text-muted">Nothing stored on this device.</div>
          )}
        </div>
      )}
    </div>
  );
}
