"use client";
import { Logo, cx } from "@/components/ui";
import { useStore } from "@/lib/store";
import { translate, type Lang } from "@/lib/i18n";
import { useT } from "@/lib/use-t";

const OPTIONS: Array<{ code: Lang; label: string }> = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
];

/**
 * Two large buttons, nothing else. The first thing a new patient sees, and the
 * first thing a health worker sets per villager in camp mode. The labels are
 * each written in their own script, so neither reader has to decode the other's.
 */
export function LanguagePicker({ onPick, brand = false }: { onPick?: (l: Lang) => void; brand?: boolean }) {
  const { state, dispatch } = useStore();
  function pick(code: Lang) {
    dispatch({ type: "setLanguage", language: code });
    onPick?.(code);
  }
  return (
    <div className="w-full">
      {brand && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <Logo size={40} />
          <span className="display font-bold text-[18px]">VitaSync</span>
        </div>
      )}
      {/* Both prompts are shown: a Hindi-first reader must not have to read English to choose. */}
      <p className="text-center text-[15px] text-muted">{translate("en", "lang.pick")}</p>
      <p className="text-center text-[15px] text-muted mb-5">{translate("hi", "lang.pick")}</p>
      <div className="space-y-3">
        {OPTIONS.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => pick(code)}
            className={cx(
              "w-full min-h-[68px] rounded-[18px] border-2 display text-[22px] font-bold transition-colors",
              state.language === code ? "bg-teal text-white border-teal" : "bg-surface text-ink border-line hover:border-teal",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Compact EN / हिं switch for a screen header, so the choice is never a dead end. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { state, dispatch } = useStore();
  const { t } = useT();
  return (
    <div role="group" aria-label={t("lang.switchAria")} className={cx("inline-flex rounded-full border border-line bg-surface p-0.5 shrink-0", className)}>
      {OPTIONS.map(({ code }) => (
        <button
          key={code}
          onClick={() => dispatch({ type: "setLanguage", language: code })}
          aria-pressed={state.language === code}
          className={cx(
            "min-w-[46px] min-h-[36px] rounded-full text-[13px] font-semibold transition-colors",
            state.language === code ? "bg-teal text-white" : "text-muted",
          )}
        >
          {translate(code, code === "en" ? "lang.shortEn" : "lang.shortHi")}
        </button>
      ))}
    </div>
  );
}
