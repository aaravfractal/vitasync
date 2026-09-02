"use client";
import { Check } from "lucide-react";
import { Card, ScreenHeader } from "@/components/ui";
import { useToast } from "@/components/toast";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/use-t";

export default function Language() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { t } = useT();
  const opts = [["en", t("langs.englishFull")], ["hi", t("langs.hindiFull")]] as const;
  return (
    <>
      <ScreenHeader title={t("langs.title")} back="/app/profile" backLabel={t("common.back")} />
      <Card className="p-0 divide-y divide-divider">
        {opts.map(([k, l]) => (
          <button
            key={k}
            onClick={() => { dispatch({ type: "setLanguage", language: k }); toast(k === "hi" ? t("langs.selectedHi") : t("langs.selectedEn")); }}
            className="w-full flex items-center justify-between p-4 text-[15px]"
          >
            <span>{l}</span>{state.language === k && <Check size={18} className="text-teal" />}
          </button>
        ))}
      </Card>
      <p className="text-[12.5px] text-muted mt-3">{t("langs.note")}</p>
    </>
  );
}
