"use client";
import { useMemo } from "react";
import { useStore } from "./store";
import { fmtDate, localeOf, translate, type Key, type Lang, type Vars } from "./i18n";

/**
 * The client half of i18n. Reads the store's existing `language` field, so a tap
 * on the language picker re-renders every screen at once — there is no separate
 * i18n state to keep in sync, and the choice persists with the rest of the store.
 */
export function useT() {
  const { state } = useStore();
  const lang = state.language;
  return useMemo(
    () => ({
      lang,
      locale: localeOf(lang),
      t: (key: Key, vars?: Vars) => translate(lang, key, vars),
      /** Dates in the UI language: toLocaleString('hi-IN') when hi. */
      d: (iso: string | number | Date, opts: Intl.DateTimeFormatOptions) => fmtDate(iso, lang, opts),
    }),
    [lang],
  );
}

export type { Key, Lang };
