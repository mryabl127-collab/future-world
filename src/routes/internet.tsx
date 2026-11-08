import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/Shell";

export const Route = createFileRoute("/internet")({
  head: () => ({
    meta: [
      { title: "Internet Check | FUTURE WORLD" },
      { name: "description", content: "Check your connection status and measure real latency to the FUTURE WORLD server." },
      { property: "og:title", content: "Internet Check | FUTURE WORLD" },
      { property: "og:description", content: "Real, measured connection latency." },
    ],
  }),
  component: Internet,
});

type Result = { avg: number; min: number; max: number; jitter: number; samples: number[] };

function Internet() {
  const [online, setOnline] = useState(true);
  const [conn, setConn] = useState<{ type?: string | undefined; downlink?: number | undefined; rtt?: number | undefined } | null>(null);
  const [res, setRes] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    const u = () => setOnline(navigator.onLine); u();
    window.addEventListener("online", u); window.addEventListener("offline", u);
    const c = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number } }).connection;
    if (c) setConn({ type: c.effectiveType, downlink: c.downlink, rtt: c.rtt });
    return () => { window.removeEventListener("online", u); window.removeEventListener("offline", u); };
  }, []);
  const run = async () => {
    setBusy(true); setErr(""); setRes(null);
    try {
      const s: number[] = [];
      for (let i = 0; i < 6; i++) {
        const t = performance.now();
        const r = await fetch(`/api/ping?t=${Date.now()}-${i}`, { cache: "no-store" });
        if (!r.ok) throw new Error();
        await r.text();
        s.push(Math.round(performance.now() - t));
      }
      const m = s.slice(1);
      const avg = Math.round(m.reduce((a, b) => a + b, 0) / m.length);
      const jitter = Math.round(m.slice(1).reduce((a, b, i) => a + Math.abs(b - (m[i] ?? b)), 0) / (m.length - 1));
      setRes({ avg, min: Math.min(...m), max: Math.max(...m), jitter, samples: m });
    } catch { setErr("Could not reach the test server. Check your connection and try again."); } finally { setBusy(false); }
  };
  return (
    <div className="max-w-2xl">
      <PageHeader title="Internet Check" subtitle="All values below are real measurements from your browser to our server." />
      <div className="panel flex items-center gap-4 p-5">
        {online ? <Wifi className="h-8 w-8 text-success" /> : <WifiOff className="h-8 w-8 text-warning" />}
        <div><div className="font-semibold">{online ? "Online" : "Offline"}</div><div className="text-sm text-muted-foreground">Status reported by your browser</div></div>
      </div>
      <button onClick={run} disabled={busy || !online} className="glow mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-foreground disabled:opacity-50">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? "Measuring…" : "Run latency test"}</button>
      {err && <p className="mt-4 text-sm text-warning">{err}</p>}
      {res && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Average", res.avg], ["Fastest", res.min], ["Slowest", res.max], ["Jitter", res.jitter]].map(([k, v]) => (
            <div key={k} className="panel p-4 text-center"><div className="text-2xl font-semibold tabular-nums text-primary">{v}<span className="text-sm text-muted-foreground"> ms</span></div><div className="text-xs text-muted-foreground">{k}</div></div>))}
          <p className="col-span-full text-xs text-muted-foreground">Round-trip time over {res.samples.length} requests ({res.samples.join(", ")} ms). Download speed is not measured.</p>
        </div>
      )}
      {conn && (conn.type || conn.downlink) && (
        <div className="panel mt-5 p-5 text-sm"><div className="mb-2 font-semibold">Browser network estimate</div>
          <p className="text-muted-foreground">Type: {conn.type ?? "—"} · Downlink: {conn.downlink ?? "—"} Mbps · RTT: {conn.rtt ?? "—"} ms</p>
          <p className="mt-1 text-xs text-muted-foreground">Rough estimate provided by the browser (Chrome/Android only), not a measurement.</p></div>
      )}
    </div>
  );
}
