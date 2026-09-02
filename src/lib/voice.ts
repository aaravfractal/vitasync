"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { localeOf, type Lang } from "./i18n";

/**
 * Speech in and speech out for the symptom chat.
 *
 * Typing a symptom in Devanagari on a phone keyboard is slow, and a patient who
 * is unwell types worse. Both halves degrade to nothing: `webkitSpeechRecognition`
 * ships in Chrome and Safari but not Firefox, and a device may have no Hindi
 * voice installed. Neither case shows a broken control — the mic hides, and
 * read-aloud stays silent rather than reading Devanagari with an English voice.
 *
 * Support is read through `useSyncExternalStore` with a server snapshot of
 * "unsupported", so the server and the first client paint agree and the control
 * appears on hydration instead of flipping.
 */

// Minimal shape of the Web Speech API. It is still a draft spec and is absent
// from lib.dom, so only what is used here is declared.
type SpeechAlt = { transcript: string };
type SpeechResult = { isFinal: boolean; length: number; 0: SpeechAlt };
type SpeechEvent = { resultIndex: number; results: { length: number; [i: number]: SpeechResult } };
type SpeechErrorEvent = { error: string };
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechEvent) => void) | null;
  onerror: ((e: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Neither capability changes over the life of the page, so there is nothing to subscribe to. */
const noSubscribe = () => () => {};
const no = () => false;

/**
 * Dictation into a text field. The caller keeps owning the text: every result
 * is written back through `onText`, so the patient can correct a misheard word
 * before sending. Nothing is ever sent on the strength of speech alone.
 */
export function useSpeechInput(lang: Lang, onText: (text: string) => void) {
  const supported = useSyncExternalStore(noSubscribe, () => recognitionCtor() !== null, no);
  const [listening, setListening] = useState(false);
  const [denied, setDenied] = useState(false);
  const rec = useRef<Recognition | null>(null);
  // Text already in the field when listening began, plus everything finalised
  // since. Interim words are appended to this and replaced as they firm up.
  const base = useRef("");
  const settled = useRef("");
  const cb = useRef(onText);
  useEffect(() => { cb.current = onText; }, [onText]);

  const stop = useCallback(() => {
    rec.current?.stop();
    rec.current = null;
    setListening(false);
  }, []);

  const start = useCallback((current: string) => {
    const Ctor = recognitionCtor();
    if (!Ctor || rec.current) return;
    const r = new Ctor();
    r.lang = localeOf(lang);          // hi-IN or en-IN, following the UI language
    r.continuous = true;              // a patient describing a symptom pauses mid-sentence
    r.interimResults = true;
    base.current = current ? current.replace(/\s*$/, " ") : "";
    settled.current = "";
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) settled.current += res[0].transcript;
        else interim += res[0].transcript;
      }
      cb.current((base.current + settled.current + interim).trimStart());
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setDenied(true);
      setListening(false);
      rec.current = null;
    };
    r.onend = () => { setListening(false); rec.current = null; };
    rec.current = r;
    setDenied(false);
    setListening(true);
    r.start();
  }, [lang]);

  useEffect(() => () => { rec.current?.abort(); rec.current = null; }, []);
  // Switching language mid-dictation would leave the recogniser on the old one.
  useEffect(() => { if (rec.current) stop(); }, [lang, stop]);

  return { supported, listening, denied, start, stop };
}

// Truthiness, not `in`: some embedded browsers declare the property and leave
// it undefined, and a declared-but-absent synthesiser must read as unsupported.
const hasSynth = () => typeof window !== "undefined" && !!window.speechSynthesis;

/** Chrome fills getVoices() asynchronously; it is empty on the first call. */
function subscribeVoices(onChange: () => void) {
  if (!hasSynth()) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}
const voiceCount = () => (hasSynth() ? window.speechSynthesis.getVoices().length : 0);
const noVoices = () => 0;

/** A voice that can actually pronounce `lang`, or null. */
function voiceFor(lang: Lang): SpeechSynthesisVoice | null {
  if (!hasSynth()) return null;
  const want = localeOf(lang);
  const prefix = want.slice(0, 2);
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang.replace("_", "-") === want)
    ?? voices.find((v) => v.lang.replace("_", "-").startsWith(prefix))
    ?? null;
}

/**
 * Read-aloud for assistant replies. `speak` is a no-op when the device has no
 * voice for the language — an English voice reading Devanagari is worse than
 * silence, so the fallback is silence rather than a wrong pronunciation of
 * medical advice.
 */
export function useSpeechOutput(lang: Lang) {
  const supported = useSyncExternalStore(noSubscribe, hasSynth, no);
  // Re-binds `speak` once the voice list arrives, so the first reply is not
  // silently dropped just because it beat Chrome's voice loading.
  const voices = useSyncExternalStore(subscribeVoices, voiceCount, noVoices);

  const cancel = useCallback(() => { if (hasSynth()) window.speechSynthesis.cancel(); }, []);

  const speak = useCallback((text: string) => {
    const voice = voiceFor(lang);
    if (!voice) return; // silent fallback
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = 0.95; // a shade slower than default: this is health advice
    window.speechSynthesis.speak(u);
  }, [lang, voices]); // eslint-disable-line react-hooks/exhaustive-deps -- `voices` only re-binds after loading

  useEffect(() => cancel, [cancel]);

  return { supported, speak, cancel };
}
