/**
 * VitaSync service worker — the emergency strip, offline.
 *
 * Scope is deliberately tiny. This caches exactly two documents:
 *
 *   /u/{demo token}   the public emergency strip a doctor scans
 *   /app/emergency    112, 108, and the curated Dehradun hospital list
 *
 * Everything else goes straight to the network. A ward in Dehradun with one bar
 * of signal is exactly where these two screens matter and exactly where a
 * network fetch stalls, so both are network-first with a cache fallback: a
 * fresh copy when there is signal, the last good copy when there is not.
 *
 * SECURITY (CLAUDE.md locked rule 1): the cached copy of /u/{token} must never
 * contain the full record. The full record renders only when a valid session
 * cookie is present, so every fetch this worker stores is made with
 * `credentials: "omit"` — the server sees no cookie, renders the locked
 * emergency-strip-only page, and that is the only variant that can ever come
 * back out of the cache. A doctor who unlocked the record on this device does
 * not get to keep it offline; they re-enter a code.
 */

const VERSION = "vitasync-emergency-v1";
const DEMO_TOKEN = "k7q2m9x4e1"; // src/lib/demo-data.ts — patient.shareToken
const DOCS = [`/u/${DEMO_TOKEN}`, "/app/emergency"];

/** Hashed and immutable, so a plain cache-first is safe and never goes stale. */
const isAsset = (url) => url.pathname.startsWith("/_next/static/");
const isCachedDoc = (url) => DOCS.includes(url.pathname);

/**
 * A cached document is useless without the JS and CSS that boot it, and those
 * filenames are hashed per build, so they are read out of the HTML we just
 * fetched rather than hard-coded here.
 */
async function precache(cache, path) {
  const res = await fetch(path, { credentials: "omit", cache: "no-store" });
  if (!res.ok) return;
  const html = await res.clone().text();
  await cache.put(path, res);
  const assets = [...new Set(html.match(/\/_next\/static\/[^"'\\\s>]+/g) ?? [])];
  await Promise.all(
    assets.map((a) => cache.add(new Request(a, { credentials: "omit" })).catch(() => {})),
  );
}

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      // One failure must not sink the install; the other screen still gets cached.
      await Promise.all(DOCS.map((d) => precache(cache, d).catch(() => {})));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  // Never touch the OTP POST or anything else that changes state.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isAsset(url)) {
    e.respondWith(
      caches.match(request).then((hit) => hit ?? fetch(request).then((res) => {
        if (res.ok) caches.open(VERSION).then((c) => c.put(request, res.clone()));
        return res;
      })),
    );
    return;
  }

  if (!isCachedDoc(url)) return;

  e.respondWith(
    (async () => {
      try {
        const res = await fetch(request);
        if (res.ok) {
          // Refresh from a cookie-less copy, not from `res` — `res` may be the
          // unlocked full record for whoever is holding this phone right now.
          const cache = await caches.open(VERSION);
          fetch(url.pathname, { credentials: "omit", cache: "no-store" })
            .then((clean) => { if (clean.ok) cache.put(url.pathname, clean); })
            .catch(() => {});
        }
        return res;
      } catch {
        const hit = await caches.match(url.pathname);
        if (hit) return hit;
        throw new Error("offline and not cached");
      }
    })(),
  );
});
