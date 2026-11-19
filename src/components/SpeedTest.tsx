import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Activity, Globe, Server, RotateCcw, X } from "lucide-react";
import {
  GAUGE_MARKS,
  gaugeFraction,
  lookupIsp,
  measureDownload,
  measurePing,
  measureUpload,
  type Phase,
  type SpeedResult,
} from "@/lib/speedtest";

const LAST_KEY = "fw-speed-last";
const CX = 150;
const CY = 155;
const R = 118;
const START = 150; // degrees, SVG clockwise from +x
const SWEEP = 240;

function polar(deg: number, r = R) {
  const a = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}
function arcPath(t: number) {
  const end = START + SWEEP * Math.max(0.0001, Math.min(1, t));
  const p0 = polar(START);
  const p1 = polar(end);
  const large = end - START > 180 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${R} ${R} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

function fmt(n: number | undefined) {
  if (n === undefined || !isFinite(n)) return "—";
  if (n >= 100) return n.toFixed(0);
  if (n >= 10) return n.toFixed(1);
  return n.toFixed(2);
}

function rate(r: SpeedResult): { label: string; cls: string; note: string } {
  const d = r.downloadMbps;
  if (d >= 50 && r.pingMs < 60)
    return {
      label: "ممتاز",
      cls: "text-success",
      note: "مناسب للبث بدقة 4K، الألعاب أونلاين، ومكالمات الفيديو لعدة أجهزة معاً.",
    };
  if (d >= 20)
    return {
      label: "جيد جداً",
      cls: "text-success",
      note: "مناسب لمشاهدة الفيديو بدقة عالية ومكالمات الفيديو بدون تقطيع.",
    };
  if (d >= 8)
    return {
      label: "متوسط",
      cls: "text-warning",
      note: "يكفي للتصفح ويوتيوب بدقة 720p–1080p، وقد يتقطع مع عدة أجهزة.",
    };
  return {
    label: "ضعيف",
    cls: "text-destructive",
    note: "مناسب للرسائل والتصفح الخفيف فقط. جرّب الاقتراب من الراوتر أو إعادة تشغيله.",
  };
}

export function SpeedTest({ online }: { online: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [live, setLive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [ping, setPing] = useState<number>();
  const [jit, setJit] = useState<number>();
  const [down, setDown] = useState<number>();
  const [up, setUp] = useState<number>();
  const [result, setResult] = useState<SpeedResult | null>(null);
  const [last, setLast] = useState<SpeedResult | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_KEY);
      if (raw) setLast(JSON.parse(raw) as SpeedResult);
    } catch {
      /* ignore */
    }
    return () => abortRef.current?.abort();
  }, []);

  async function start() {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setError("");
    setResult(null);
    setPing(undefined);
    setJit(undefined);
    setDown(undefined);
    setUp(undefined);
    setLive(0);
    try {
      setPhase("ping");
      const ispPromise = lookupIsp(ctrl.signal);
      const p = await measurePing(ctrl.signal, (ms) => setPing(ms));
      setPing(p.ping);
      setJit(p.jitter);

      setPhase("download");
      setProgress(0);
      const d = await measureDownload(ctrl.signal, (mbps, prog) => {
        setLive(mbps);
        setProgress(prog);
      });
      setDown(d);
      setLive(0);

      setPhase("upload");
      setProgress(0);
      const u = await measureUpload(ctrl.signal, (mbps, prog) => {
        setLive(mbps);
        setProgress(prog);
      });
      setUp(u);
      setLive(0);

      const isp = await ispPromise;
      const res: SpeedResult = {
        pingMs: p.ping,
        jitterMs: p.jitter,
        downloadMbps: d,
        uploadMbps: u,
        server: {
          ...p.server,
          isp: isp.isp,
          city: isp.city ?? p.server.city,
          country: isp.country ?? p.server.country,
        },
        date: new Date().toISOString(),
      };
      setResult(res);
      setLast(res);
      try {
        localStorage.setItem(LAST_KEY, JSON.stringify(res));
      } catch {
        /* ignore */
      }
      setPhase("done");
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setPhase("idle");
        return;
      }
      setError("تعذر إكمال الاختبار. تأكد من اتصالك بالإنترنت وأعد المحاولة.");
      setPhase("idle");
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  const running = phase === "ping" || phase === "download" || phase === "upload";
  const color = phase === "upload" ? "var(--speed-up)" : "var(--speed-down)";
  const frac = gaugeFraction(live);
  const needleDeg = START + SWEEP * frac;
  const needleTip = polar(needleDeg, R - 22);
  const shown = result ?? (phase === "idle" ? last : null);
  const verdict = result ? rate(result) : null;

  return (
    <div className="space-y-4">
      {/* Results strip */}
      <div className="panel grid grid-cols-3 divide-x divide-border p-4 text-center rtl:divide-x-reverse">
        <Stat
          icon={<ArrowDown className="h-4 w-4 text-speed-down" />}
          label="التنزيل"
          value={
            phase === "download"
              ? fmt(live)
              : fmt(down ?? (phase === "idle" ? shown?.downloadMbps : undefined))
          }
          unit="Mbps"
          active={phase === "download"}
        />
        <Stat
          icon={<ArrowUp className="h-4 w-4 text-speed-up" />}
          label="الرفع"
          value={
            phase === "upload"
              ? fmt(live)
              : fmt(up ?? (phase === "idle" ? shown?.uploadMbps : undefined))
          }
          unit="Mbps"
          active={phase === "upload"}
        />
        <Stat
          icon={<Activity className="h-4 w-4 text-warning" />}
          label="البنغ"
          value={
            ping !== undefined
              ? Math.round(ping).toString()
              : shown && phase === "idle"
                ? Math.round(shown.pingMs).toString()
                : "—"
          }
          unit="ms"
          active={phase === "ping"}
          sub={
            jit !== undefined
              ? `تذبذب ${Math.round(jit)} ms`
              : shown && phase === "idle"
                ? `تذبذب ${Math.round(shown.jitterMs)} ms`
                : undefined
          }
        />
      </div>

      {/* Gauge */}
      <div className="panel relative flex flex-col items-center overflow-hidden px-4 pb-6 pt-4">
        {!running && phase !== "done" ? (
          <div className="flex flex-col items-center py-6">
            <button
              onClick={start}
              disabled={!online}
              className="group relative grid h-48 w-48 place-items-center rounded-full border-2 border-speed-down text-4xl font-bold tracking-widest text-foreground transition hover:bg-speed-down/10 disabled:opacity-40"
              aria-label="ابدأ اختبار السرعة"
            >
              <span className="absolute inset-0 animate-ping rounded-full border border-speed-down/40 [animation-duration:2.5s]" />
              ابدأ
            </button>
            {last && (
              <p className="mt-4 text-xs text-muted-foreground">
                آخر اختبار: {new Date(last.date).toLocaleString("ar-IQ")}
              </p>
            )}
          </div>
        ) : (
          <>
            <svg viewBox="0 0 300 250" className="w-full max-w-sm">
              <path
                d={arcPath(1)}
                fill="none"
                stroke="var(--muted)"
                strokeWidth="18"
                strokeLinecap="round"
              />
              {running && phase !== "ping" && (
                <path
                  d={arcPath(frac)}
                  fill="none"
                  stroke={color}
                  strokeWidth="18"
                  strokeLinecap="round"
                  style={{ transition: "d 0.2s linear" }}
                />
              )}
              {GAUGE_MARKS.map((m, i) => {
                const deg = START + (SWEEP * i) / (GAUGE_MARKS.length - 1);
                const p = polar(deg, R - 32);
                return (
                  <text
                    key={m}
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--muted-foreground)"
                  >
                    {m}
                  </text>
                );
              })}
              {running && phase !== "ping" && (
                <>
                  <line
                    x1={CX}
                    y1={CY}
                    x2={needleTip.x}
                    y2={needleTip.y}
                    stroke="var(--foreground)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={{ transition: "all 0.2s linear" }}
                  />
                  <circle cx={CX} cy={CY} r="8" fill="var(--foreground)" />
                </>
              )}
              <text
                x={CX}
                y={CY + 62}
                textAnchor="middle"
                fontSize="40"
                fontWeight="700"
                fill="var(--foreground)"
                className="tabular-nums"
              >
                {phase === "ping"
                  ? ping !== undefined
                    ? Math.round(ping)
                    : "…"
                  : phase === "done"
                    ? fmt(result?.downloadMbps)
                    : fmt(live)}
              </text>
              <text
                x={CX}
                y={CY + 84}
                textAnchor="middle"
                fontSize="13"
                fill="var(--muted-foreground)"
              >
                {phase === "ping"
                  ? "ms · قياس البنغ"
                  : phase === "download"
                    ? "Mbps · تنزيل"
                    : phase === "upload"
                      ? "Mbps · رفع"
                      : "Mbps · سرعة التنزيل"}
              </text>
            </svg>
            {running && (
              <div className="mt-1 w-full max-w-xs">
                <div className="h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${phase === "ping" ? 30 : progress * 100}%`,
                      background: color,
                    }}
                  />
                </div>
                <button
                  onClick={cancel}
                  className="mx-auto mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" /> إيقاف
                </button>
              </div>
            )}
            {phase === "done" && (
              <button
                onClick={start}
                className="mt-2 inline-flex h-11 items-center gap-2 rounded-full border border-speed-down px-6 text-sm font-semibold hover:bg-speed-down/10"
              >
                <RotateCcw className="h-4 w-4" /> إعادة الاختبار
              </button>
            )}
          </>
        )}
      </div>

      {error && (
        <div className="panel border-warning/40 bg-warning/10 p-4 text-sm text-warning">
          {error}
        </div>
      )}

      {result && verdict && (
        <div className="panel space-y-2 p-4">
          <div className="text-xs text-muted-foreground">تقييم اتصالك</div>
          <div className={`text-lg font-bold ${verdict.cls}`}>{verdict.label}</div>
          <p className="text-sm text-muted-foreground">{verdict.note}</p>
        </div>
      )}

      {shown && (
        <div className="panel grid gap-3 p-4 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">مزود الخدمة</div>
              <div className="truncate font-semibold">
                {shown.server.isp || (shown.server.asn ? `AS${shown.server.asn}` : "غير معروف")}
              </div>
              <div className="truncate font-mono text-[11px] text-muted-foreground">
                {shown.server.ip}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">خادم الاختبار</div>
              <div className="truncate font-semibold">Cloudflare · {shown.server.colo ?? "—"}</div>
              <div className="truncate text-[11px] text-muted-foreground">
                {[shown.server.city, shown.server.country].filter(Boolean).join("، ")}
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
        الاختبار حقيقي: ينزّل ويرفع بيانات فعلية لمدة 10 ثوانٍ لكل مرحلة عبر عدة اتصالات متوازية
        (مثل تطبيق Speedtest) ويتجاهل أول ثانيتين حتى يستقر الخط. قد يستهلك الاختبار من باقة
        الإنترنت بحسب سرعتك.
      </p>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  unit,
  active,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  active?: boolean;
  sub?: string | undefined;
}) {
  return (
    <div className={`px-1 transition ${active ? "opacity-100" : "opacity-90"}`}>
      <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground">
        {icon}
        {label}
        <span className="text-[10px] font-normal">{unit}</span>
      </div>
      <div
        className={`mt-1 font-mono text-2xl font-bold tabular-nums ${active ? "animate-pulse" : ""}`}
      >
        {value}
      </div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
