import { useEffect, useState } from "react";

export type ScanRecord = { id: string; date: string; type: "url" | "image"; target: string; summary: string; level: "low" | "medium" | "high" };

const read = <T,>(k: string, d: T): T => {
  if (typeof window === "undefined") return d;
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; }
};
const write = (k: string, v: unknown) => { localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new Event("fw-store")); };

export function useLocal<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(initial);
  useEffect(() => {
    const sync = () => setVal(read(key, initial));
    sync();
    window.addEventListener("fw-store", sync);
    return () => window.removeEventListener("fw-store", sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  // Accepts a value or an updater function (the AI chat streams with updaters).
  const set = (v: T | ((cur: T) => T)) => {
    setVal((cur) => {
      const next = typeof v === "function" ? (v as (c: T) => T)(cur) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    queueMicrotask(() => window.dispatchEvent(new Event("fw-store")));
  };
  return [val, set] as const;
}

export function addScan(r: Omit<ScanRecord, "id" | "date">) {
  const list = read<ScanRecord[]>("fw-history", []);
  write("fw-history", [{ ...r, id: crypto.randomUUID(), date: new Date().toISOString() }, ...list].slice(0, 100));
}
