"use client";
// Demo-Speicher im Browser (localStorage/sessionStorage). Später durch echtes Backend ersetzen.
import { useCallback, useSyncExternalStore } from "react";

type Area = "local" | "session";
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function storage(area: Area): Storage | null {
  try {
    return area === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function read<T>(key: string, area: Area, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = storage(area)?.getItem(key) ?? null;
  } catch {}
  const k = `${area}:${key}`;
  const hit = cache.get(k);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {}
  }
  cache.set(k, { raw, value });
  return value;
}
export function writeStore<T>(key: string, value: T | null, area: Area = "local") {
  try {
    if (value === null) storage(area)?.removeItem(key);
    else storage(area)?.setItem(key, JSON.stringify(value));
  } catch {}
  listeners.forEach((l) => l());
}

/** Reaktiver Wert aus dem Browser-Speicher. `fallback` muss eine stabile Referenz sein. */
export function useStore<T>(key: string, fallback: T, area: Area = "local") {
  const value = useSyncExternalStore(subscribe, () => read(key, area, fallback), () => fallback);
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, area, fallback);
      writeStore(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next, area);
    },
    [key, area, fallback],
  );
  return [value, set] as const;
}

const noop = () => () => {};
/** true, sobald im Browser gerendert wird (vermeidet Hydration-Abweichungen). */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export type Role = "privat" | "gewerbe";
export interface Session {
  role: Role;
  name: string;
  email: string;
  company?: string;
  /** Zugang mit Admin-Rechten (nur feste Zugänge aus src/lib/accounts.ts) */
  admin?: boolean;
}
const NO_SESSION: Session | null = null;
const NO_LIST: string[] = [];

/** Anmeldung: mit «Angemeldet bleiben» im localStorage, sonst nur für diesen Tab (sessionStorage). */
export function useSession() {
  const [kept] = useStore<Session | null>("rac:session", NO_SESSION);
  const [temp] = useStore<Session | null>("rac:session", NO_SESSION, "session");
  const set = useCallback((s: Session | null, remember = true) => {
    writeStore("rac:session", s && remember ? s : null);
    writeStore("rac:session", s && !remember ? s : null, "session");
  }, []);
  return [kept ?? temp, set] as const;
}
export const useFavorites = () => useStore<string[]>("rac:favorites", NO_LIST);

export function resetDemo() {
  ["rac:session", "rac:favorites", "rac:bookings", "rac:listings", "rac:fleet", "rac:messages", "rac:requests", "rac:availability", "rac:paused", "rac:settings", "rac:km", "rac:km-settings", "rac:offers"].forEach((k) =>
    writeStore(k, null),
  );
  writeStore("rac:wizard", null, "session");
  writeStore("rac:session", null, "session");
}
