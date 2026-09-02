"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { localeOf } from "@/lib/i18n";

/**
 * Keeps <html lang> in step with the store, so screen readers and the browser's
 * own hyphenation follow the chosen language. Renders nothing; the server sends
 * lang="en" and this corrects it after hydration.
 */
export function HtmlAttrs() {
  const { state, ready } = useStore();
  useEffect(() => {
    if (ready) document.documentElement.lang = localeOf(state.language);
  }, [state.language, ready]);
  return null;
}
