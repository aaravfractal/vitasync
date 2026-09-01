"use client";
import { Check } from "lucide-react";
import { Card, ScreenHeader } from "@/components/ui";
import { useToast } from "@/components/toast";
import { useStore } from "@/lib/store";

export default function Language() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const opts = [["en", "English"], ["hi", "हिन्दी (Hindi)"]] as const;
  return (
    <>
      <ScreenHeader title="Language" back="/app/profile" />
      <Card className="p-0 divide-y divide-divider">
        {opts.map(([k, l]) => (
          <button key={k} onClick={() => { dispatch({ type: "setLanguage", language: k }); toast(k === "hi" ? "हिन्दी चुनी गई। पूरा अनुवाद जल्द।" : "English selected"); }} className="w-full flex items-center justify-between p-4 text-[15px]">
            <span>{l}</span>{state.language === k && <Check size={18} className="text-teal" />}
          </button>
        ))}
      </Card>
      <p className="text-[12.5px] text-muted mt-3">Hindi voice input and Elder Mode (large type) arrive with the H2 2027 release. The assistant already understands Hindi.</p>
    </>
  );
}
