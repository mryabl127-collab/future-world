// Real network speed test against Cloudflare's public speed-test edge (CORS + Timing-Allow-Origin enabled).
// Download/upload use several parallel streams for a fixed time window, like Ookla Speedtest,
// and ignore the ramp-up period so TCP slow-start does not drag the result down.

const BASE = "https://speed.cloudflare.com";

export type Phase = "idle" | "ping" | "download" | "upload" | "done";

export type ServerInfo = {
  ip?: string | undefined;
  colo?: string | undefined;
  city?: string | undefined;
  country?: string | undefined;
  asn?: string | undefined;
  isp?: string | undefined;
};

export type SpeedResult = {
  pingMs: number;
  jitterMs: number;
  downloadMbps: number;
  uploadMbps: number;
  server: ServerInfo;
  date: string;
};

/** Megabits per second, using decimal megabits (1 Mbps = 1,000,000 bits/s) like Ookla. */
export function toMbps(bytes: number, ms: number): number {
  if (ms <= 0 || bytes <= 0) return 0;
  return (bytes * 8) / (ms / 1000) / 1_000_000;
}

export function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

/** Mean absolute difference between consecutive samples (RFC 3550 style jitter). */
export function jitter(values: number[]): number {
  if (values.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < values.length; i++) sum += Math.abs(values[i]! - values[i - 1]!);
  return sum / (values.length - 1);
}

/**
 * Throughput from (time, cumulativeBytes) points, skipping the ramp-up window.
 * Falls back to the whole run when the test was shorter than the warm-up.
 */
export function steadyThroughput(points: Array<[number, number]>, warmupMs: number): number {
  if (points.length < 2) return 0;
  const start = points.find(([t]) => t >= warmupMs) ?? points[0]!;
  const end = points[points.length - 1]!;
  if (end[0] - start[0] < 500) return toMbps(end[1] - points[0]![1], end[0] - points[0]![0]);
  return toMbps(end[1] - start[1], end[0] - start[0]);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function serverTimeOf(entry: PerformanceResourceTiming | undefined): number {
  if (!entry?.serverTiming?.length) return 0;
  return Math.max(0, ...entry.serverTiming.map((s) => s.duration || 0));
}

export async function measurePing(
  signal: AbortSignal,
  onSample: (ms: number) => void,
  count = 20,
): Promise<{ ping: number; jitter: number; server: ServerInfo }> {
  const samples: number[] = [];
  let server: ServerInfo = {};
  for (let i = 0; i < count; i++) {
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    const url = `${BASE}/__down?bytes=0&r=${Math.random().toString(36).slice(2)}`;
    const t0 = performance.now();
    const res = await fetch(url, { cache: "no-store", signal });
    await res.arrayBuffer();
    const t1 = performance.now();
    if (i === 0) {
      server = {
        ip: res.headers.get("cf-meta-ip") ?? undefined,
        colo: res.headers.get("cf-meta-colo") ?? undefined,
        city: res.headers.get("cf-meta-city") ?? undefined,
        country: res.headers.get("cf-meta-country") ?? undefined,
        asn: res.headers.get("cf-meta-asn") ?? undefined,
      };
    }
    const entry = performance.getEntriesByName(url).at(-1) as PerformanceResourceTiming | undefined;
    let ms = t1 - t0;
    if (entry && entry.responseStart > 0 && entry.requestStart > 0) {
      ms = entry.responseStart - entry.requestStart - serverTimeOf(entry);
    }
    ms = Math.max(1, ms);
    // The first requests include connection setup; keep them out of the result.
    if (i >= 2) {
      samples.push(ms);
      onSample(ms);
    }
  }
  performance.clearResourceTimings();
  return { ping: median(samples), jitter: jitter(samples), server };
}

export async function measureDownload(
  signal: AbortSignal,
  onProgress: (mbps: number, progress: number) => void,
  durationMs = 10_000,
  streams = 6,
): Promise<number> {
  const ctrl = new AbortController();
  const abortAll = () => ctrl.abort();
  signal.addEventListener("abort", abortAll);
  let total = 0;
  const t0 = performance.now();
  const points: Array<[number, number]> = [[0, 0]];
  let running = true;

  const worker = async () => {
    while (running) {
      try {
        const res = await fetch(`${BASE}/__down?bytes=50000000&r=${Math.random()}`, {
          cache: "no-store",
          signal: ctrl.signal,
        });
        const reader = res.body!.getReader();
        while (running) {
          const { done, value } = await reader.read();
          if (done) break;
          total += value.byteLength;
        }
        await reader.cancel().catch(() => {});
      } catch {
        if (!running || ctrl.signal.aborted) return;
        await sleep(200);
      }
    }
  };

  const workers = Array.from({ length: streams }, worker);
  while (performance.now() - t0 < durationMs && !signal.aborted) {
    await sleep(200);
    const t = performance.now() - t0;
    points.push([t, total]);
    const recent = points.filter(([pt]) => pt >= t - 1500);
    onProgress(toMbps(total - recent[0]![1], t - recent[0]![0]), Math.min(1, t / durationMs));
  }
  running = false;
  ctrl.abort();
  signal.removeEventListener("abort", abortAll);
  await Promise.allSettled(workers);
  if (signal.aborted) throw new DOMException("aborted", "AbortError");
  return steadyThroughput(points, 2000);
}

function makePayload(size: number): Blob {
  const chunk = new Uint8Array(65536);
  crypto.getRandomValues(chunk);
  const parts: Uint8Array[] = [];
  for (let s = 0; s < size; s += chunk.length) parts.push(chunk);
  return new Blob(parts as BlobPart[], { type: "application/octet-stream" });
}

export async function measureUpload(
  signal: AbortSignal,
  onProgress: (mbps: number, progress: number) => void,
  durationMs = 10_000,
  streams = 4,
): Promise<number> {
  const payload = makePayload(8 * 1024 * 1024);
  const xhrs = new Set<XMLHttpRequest>();
  let total = 0;
  let running = true;
  const t0 = performance.now();
  const points: Array<[number, number]> = [[0, 0]];

  const send = () =>
    new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      let last = 0;
      xhrs.add(xhr);
      xhr.upload.onprogress = (e) => {
        total += e.loaded - last;
        last = e.loaded;
      };
      const finish = () => {
        xhrs.delete(xhr);
        resolve();
      };
      xhr.onload = finish;
      xhr.onerror = finish;
      xhr.onabort = finish;
      xhr.open("POST", `${BASE}/__up?r=${Math.random()}`);
      xhr.send(payload);
    });

  const worker = async () => {
    while (running) {
      await send();
      if (running) await sleep(10);
    }
  };
  const workers = Array.from({ length: streams }, worker);

  while (performance.now() - t0 < durationMs && !signal.aborted) {
    await sleep(200);
    const t = performance.now() - t0;
    points.push([t, total]);
    const recent = points.filter(([pt]) => pt >= t - 1500);
    onProgress(toMbps(total - recent[0]![1], t - recent[0]![0]), Math.min(1, t / durationMs));
  }
  running = false;
  xhrs.forEach((x) => x.abort());
  await Promise.allSettled(workers);
  if (signal.aborted) throw new DOMException("aborted", "AbortError");
  return steadyThroughput(points, 2000);
}

export async function lookupIsp(
  signal: AbortSignal,
): Promise<{ isp?: string | undefined; city?: string | undefined; country?: string | undefined }> {
  try {
    const r = await fetch("https://ipwho.is/", { signal });
    const d = (await r.json()) as {
      success?: boolean;
      connection?: { isp?: string; org?: string };
      city?: string;
      country?: string;
    };
    if (!d.success) return {};
    return { isp: d.connection?.isp || d.connection?.org, city: d.city, country: d.country };
  } catch {
    return {};
  }
}

/** Gauge scale like Ookla: non-linear so slow and fast connections both read clearly. */
export const GAUGE_MARKS = [0, 5, 10, 25, 50, 100, 250, 500, 1000];

export function gaugeFraction(mbps: number, marks = GAUGE_MARKS): number {
  if (mbps <= 0) return 0;
  const max = marks[marks.length - 1]!;
  if (mbps >= max) return 1;
  for (let i = 1; i < marks.length; i++) {
    if (mbps <= marks[i]!) {
      const a = marks[i - 1]!;
      const b = marks[i]!;
      return (i - 1 + (mbps - a) / (b - a)) / (marks.length - 1);
    }
  }
  return 1;
}
