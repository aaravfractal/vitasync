"use client";
import { useEffect, useState } from "react";
import { ciphertextHead, decryptToBlob, formatBytes } from "@/lib/attachments";
import type { Attachment } from "@/lib/types";
import { useT } from "@/lib/use-t";

/**
 * Decrypts on open, hands the bytes to the browser as an object URL, and revokes
 * that URL when the sheet closes (the Sheet unmounts its children, so cleanup
 * runs then). Nothing is written to disk on this path.
 */
export function AttachmentView({ attachment }: { attachment: Attachment }) {
  const { t } = useT();
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
          <p className="p-4 text-[13px] text-muted">{t("att.otherDevice")}</p>
        ) : !url ? (
          <p className="p-4 text-[13px] text-muted">{t("att.decrypting")}</p>
        ) : attachment.mime === "application/pdf" ? (
          <iframe src={url} title={attachment.name} className="w-full h-[320px] block" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- a blob: URL from a key only this device holds; the image optimiser cannot fetch it
          <img src={url} alt={attachment.name} className="w-full block" />
        )}
      </div>
      <div className="flex items-center justify-between gap-3 mt-2 text-[12.5px]">
        <span className="text-muted truncate">{attachment.name} · {formatBytes(attachment.size)}</span>
        <button onClick={toggleStored} className="text-teal font-semibold shrink-0">{showStored ? t("att.hide") : t("att.whatsStored")}</button>
      </div>
      {showStored && (
        <div className="mt-2 bg-paper border border-line rounded-[14px] p-3 text-[12.5px]">
          {stored ? (
            <>
              <div className="text-muted">{t("att.firstBytes", { n: stored.shown, total: formatBytes(stored.total) })}</div>
              <div className="mono text-[11.5px] break-all mt-1">{stored.hex} …</div>
              <p className="text-muted mt-2">{t("att.allThatLeaves")}</p>
            </>
          ) : (
            <div className="text-muted">{t("att.nothingStored")}</div>
          )}
        </div>
      )}
    </div>
  );
}
