"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { localeOf } from "@/lib/i18n";

/**
 * Keeps <html> in step with the store: `lang` so screen readers and the
 * browser's own hyphenation follow the chosen language, and the `elder` class
 * that drives the Elder Mode type scale in globals.css.
 *
 * Renders nothing; the server sends lang="en" with no class and this corrects
 * both after hydration.
 */
export function HtmlAttrs() {
  const { state, ready } = useStore();
  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = localeOf(state.language);
    document.documentElement.classList.toggle("elder", state.elderMode);
  }, [state.language, state.elderMode, ready]);
  return null;
}
