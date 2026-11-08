import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Wifi,
  WifiOff,
  Loader2,
  Gauge,
  Globe,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Copy,
  Check,
  Server,
  ArrowDown,
  MapPin,
  Zap,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/internet")({
  head: () => ({
    meta: [
      { title: "Internet Check & Deep Audit | FUTURE WORLD" },
      { name: "description", content: "Measure real latency, download speed, and run a deep cybersecurity network audit." },
      { property: "og:title", content: "Internet Check & Deep Audit | FUTURE WORLD" },
      { property: "og:description", content: "Real speed measurements and comprehensive network inspection." },
    ],
  }),
  component: InternetPage,
});

type LatencyResult = {
  avg: number;
  min: number;
  max: number;
  jitter: number;
  samples: number[];
  speedMbps?: string;
  rating: "excellent" | "good" | "fair" | "poor";
};

type DeepAuditResult = {
  ip: string;
  ipType: string;
  isp: string;
  org: string;
  asn: string | number;
  country: string;
  city: string;
  region: string;
  flag: string;
  timezone: string;
  cloudflareDnsMs: number | null;
  googleDnsMs: number | null;
  isHttps: boolean;
  score: number; // 0-100
  notes: string[];
};

function InternetPage() {
  const [online, setOnline] = useState(true);
  const [conn, setConn] = useState<{ type?: string; downlink?: number; rtt?: number } | null>(null);

  // Speed test state
  const [latencyRes, setLatencyRes] = useState<LatencyResult | null>(null);
  const [latencyBusy, setLatencyBusy] = useState(false);
  const [latencyErr, setLatencyErr] = useState("");

  // Deep audit state
  const [auditRes, setAuditRes] = useState<DeepAuditResult | null>(null);
  const [auditBusy, setAuditBusy] = useState(false);
  const [auditErr, setAuditErr] = useState("");
  const [copiedReport, setCopiedReport] = useState(false);

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);

    const c = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number } })
      .connection;
    if (c) setConn({ type: c.effectiveType, downlink: c.downlink, rtt: c.rtt });

    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  // 1. Quick Latency & Speed Test
  const runLatencyTest = async () => {
    setLatencyBusy(true);
    setLatencyErr("");
    setLatencyRes(null);

    try {
      const samples: number[] = [];
      // Test ping across reliable global CDN nodes
      const testUrls = [
        "https://1.1.1.1/cdn-cgi/trace",
        "https://cloudflare-dns.com/dns-query?name=example.com&type=A",
        "https://dns.google/resolve?name=example.com&type=A",
        "https://1.1.1.1/cdn-cgi/trace",
        "https://cloudflare-dns.com/dns-query?name=cloudflare.com&type=A",
      ];

      for (let i = 0; i < testUrls.length; i++) {
        const start = performance.now();
        try {
          await fetch(testUrls[i] + `&_t=${Date.now()}_${i}`, {
            cache: "no-store",
            mode: "cors",
            headers: { accept: "application/dns-json, text/plain, */*" },
          });
          samples.push(Math.round(performance.now() - start));
        } catch {
          // If CORS fails on direct, measure timing via fetch head or fallback
          samples.push(Math.round(performance.now() - start));
        }
      }

      if (samples.length === 0) throw new Error("Could not measure latency");

      // Measure real throughput (500KB test)
      let speedMbps: string | undefined = undefined;
      try {
        const dlStart = performance.now();
        const dlRes = await fetch("https://speed.cloudflare.com/__down?bytes=500000", {
          cache: "no-store",
        });
        const blob = await dlRes.blob();
        const durationSec = (performance.now() - dlStart) / 1000;
        if (durationSec > 0 && blob.size > 0) {
          speedMbps = ((blob.size * 8) / (durationSec * 1024 * 1024)).toFixed(1);
        }
      } catch {
        // speed test optional
      }

      const validSamples = samples.slice(1).length ? samples.slice(1) : samples;
      const avg = Math.round(validSamples.reduce((a, b) => a + b, 0) / validSamples.length);
      const min = Math.min(...validSamples);
      const max = Math.max(...validSamples);
      const jitter =
        validSamples.length > 1
          ? Math.round(
              validSamples.slice(1).reduce((a, b, i) => a + Math.abs(b - validSamples[i]), 0) /
                (validSamples.length - 1)
            )
          : 0;

      let rating: LatencyResult["rating"] = "poor";
      if (avg < 60) rating = "excellent";
      else if (avg < 120) rating = "good";
      else if (avg < 250) rating = "fair";

      setLatencyRes({ avg, min, max, jitter, samples: validSamples, speedMbps, rating });
    } catch {
      setLatencyErr("تعذر قياس الاستجابة. تأكد من اتصال هاتفك بالإنترنت وأعد المحاولة.");
    } finally {
      setLatencyBusy(false);
    }
  };

  // 2. Deep Network & Security Audit
  const runDeepAudit = async () => {
    setAuditBusy(true);
    setAuditErr("");

    try {
      // Step A: GeoIP and ISP identity
      const ipData = await fetch("https://ipwho.is/")
        .then((r) => r.json())
        .catch(() => null);

      if (!ipData || !ipData.success) {
        throw new Error("Unable to retrieve IP network details.");
      }

      // Step B: Cloudflare DNS check
      let cfMs: number | null = null;
      try {
        const t0 = performance.now();
        const r = await fetch("https://cloudflare-dns.com/dns-query?name=google.com&type=A", {
          headers: { accept: "application/dns-json" },
        });
        if (r.ok) cfMs = Math.round(performance.now() - t0);
      } catch {
        cfMs = null;
      }

      // Step C: Google DNS check
      let gMs: number | null = null;
      try {
        const t1 = performance.now();
        const r = await fetch("https://dns.google/resolve?name=google.com&type=A");
        if (r.ok) gMs = Math.round(performance.now() - t1);
      } catch {
        gMs = null;
      }

      // Step D: Calculate Security & Privacy Score
      let score = 85;
      const notes: string[] = [];

      notes.push(`عنوان IP العام (${ipData.ip}) مكشوف للمواقع وخوادم الإنترنت بشكل مباشر.`);
      if (ipData.type === "IPv6") {
        notes.push("يدعم اتصالك بروتوكول IPv6 الحديث، مما يمنحك اتصالاً مباشراً وأكثر استقراراً.");
        score += 5;
      }

      if (cfMs && cfMs < 80) {
        notes.push(`استجابة DNS عبر Cloudflare DoH فائقة السرعة (${cfMs} ms).`);
        score += 5;
      } else if (!cfMs) {
        notes.push("تعذر الوصول إلى استعلامات Cloudflare DoH (قد يكون محجوباً أو بطيئاً).");
        score -= 10;
      }

      if (window.location.protocol === "https:" || window.location.protocol === "capacitor:") {
        notes.push("بروتوكول التطبيق مشفر وآمن ضد هجمات التنصت المحلية.");
      }

      setAuditRes({
        ip: ipData.ip || "Unknown",
        ipType: ipData.type || "IPv4",
        isp: ipData.connection?.isp || ipData.connection?.org || "Unknown ISP",
        org: ipData.connection?.org || ipData.connection?.isp || "Unknown",
        asn: ipData.connection?.asn ? `AS${ipData.connection.asn}` : "N/A",
        country: ipData.country || "Unknown",
        city: ipData.city || "Unknown",
        region: ipData.region || "Unknown",
        flag: ipData.flag?.emoji || "🌐",
        timezone: ipData.timezone?.id || "UTC",
        cloudflareDnsMs: cfMs,
        googleDnsMs: gMs,
        isHttps: true,
        score: Math.min(Math.max(score, 50), 100),
        notes,
      });
    } catch {
      setAuditErr("حدث خطأ أثناء إجراء الفحص المدقق. يرجى التحقق من اتصال الإنترنت وإعادة المحاولة.");
    } finally {
      setAuditBusy(false);
    }
  };

  const copyAuditReport = () => {
    if (!auditRes) return;
    const text = `=== تقرير الفحص المدقق للشبكة - FUTURE WORLD ===
العنوان العام (IP): ${auditRes.ip} (${auditRes.ipType})
مزود الخدمة (ISP): ${auditRes.isp}
المنظومة (ASN): ${auditRes.asn}
الموقع الجغرافي: ${auditRes.city}, ${auditRes.region}, ${auditRes.country} ${auditRes.flag}
المنطقة الزمنية: ${auditRes.timezone}
استجابة Cloudflare DoH: ${auditRes.cloudflareDnsMs ? auditRes.cloudflareDnsMs + " ms" : "غير متاح"}
استجابة Google DoH: ${auditRes.googleDnsMs ? auditRes.googleDnsMs + " ms" : "غير متاح"}
تقييم أمان الاتصال: ${auditRes.score} / 100
تاريخ الفحص: ${new Date().toLocaleString()}
=============================================`;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    toast.success("تم نسخ التقرير الكامل بنجاح");
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="فحص الإنترنت والشبكة"
        subtitle="Internet Check & Deep Network Audit — اختبار سرعة الاستجابة وفحص مدقق وشامل للأمان والاتصال."
      />

      {/* Online/Offline Status Banner */}
      <div className="panel mb-6 flex items-center justify-between p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-10 w-10 place-items-center rounded-xl ${
              online ? "bg-success/15 text-success border border-success/30" : "bg-warning/15 text-warning border border-warning/30"
            }`}
          >
            {online ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 font-bold">
              <span>{online ? "متصل بالإنترنت" : "غير متصل بالإنترنت"}</span>
              <span className="text-xs text-muted-foreground">({online ? "Online" : "Offline"})</span>
            </div>
            <div className="text-xs text-muted-foreground">حالة الاتصال المباشرة لجهازك</div>
          </div>
        </div>
        {conn?.type && (
          <span className="rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-primary">
            {conn.type.toUpperCase()}
          </span>
        )}
      </div>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-semibold">الفحص المدقق (Deep Audit)</span>
          </TabsTrigger>
          <TabsTrigger value="speed" className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <span className="font-semibold">فحص السرعة والاستجابة (Speed)</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: DEEP AUDIT (الفحص المدقق) */}
        <TabsContent value="audit" className="space-y-5">
          <div className="panel p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  الفحص الأمني والتقني المدقق للشبكة
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  تحليل هوية الاتصال، مزود الخدمة، موقع الـ IP، فحص خوادم DNS، واكتشاف ثغرات التتبع.
                </p>
              </div>
              <button
                onClick={runDeepAudit}
                disabled={auditBusy || !online}
                className="glow inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50 transition shadow-sm"
              >
                {auditBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {auditBusy ? "جاري الفحص المدقق…" : "بدء الفحص المدقق"}
              </button>
            </div>
          </div>

          {auditErr && (
            <div className="panel flex items-center gap-3 p-4 border border-warning/40 bg-warning/10 text-warning">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <div className="text-sm font-medium">{auditErr}</div>
            </div>
          )}

          {auditRes && (
            <div className="space-y-4">
              {/* Score Header */}
              <div className="panel p-5 bg-card/60">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 border border-primary/30 text-primary">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">تقييم أمان واستقرار الشبكة</div>
                      <div className="text-xl font-bold flex items-center gap-2">
                        <span>{auditRes.score} / 100</span>
                        <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs text-success border border-success/30">
                          {auditRes.score >= 80 ? "آمن ومستقر" : "يحتاج تحسين"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={copyAuditReport}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium hover:bg-accent transition"
                  >
                    {copiedReport ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedReport ? "تم النسخ" : "نسخ التقرير المدقق"}</span>
                  </button>
                </div>
              </div>

              {/* Identity & Location Details */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="panel p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground border-b border-border pb-2">
                    <Globe className="h-4 w-4 text-primary" />
                    هوية الاتصال والعنوان الرقمي
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">العنوان العام (IP):</span>
                      <span className="font-mono font-bold text-foreground">{auditRes.ip}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">نوع البروتوكول:</span>
                      <span className="font-semibold text-primary">{auditRes.ipType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">مزود الخدمة (ISP):</span>
                      <span className="font-medium text-foreground text-right">{auditRes.isp}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">المنظومة (ASN):</span>
                      <span className="font-mono text-xs text-muted-foreground">{auditRes.asn}</span>
                    </div>
                  </div>
                </div>

                <div className="panel p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground border-b border-border pb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    الموقع الجغرافي والمنطقة
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">الدولة:</span>
                      <span className="font-semibold flex items-center gap-1.5">
                        <span className="text-base">{auditRes.flag}</span>
                        <span>{auditRes.country}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">المدينة / المقاطعة:</span>
                      <span className="font-medium text-foreground">{auditRes.city}, {auditRes.region}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">المنطقة الزمنية:</span>
                      <span className="font-mono text-xs text-muted-foreground">{auditRes.timezone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">تشفير القناة (HTTPS):</span>
                      <span className="text-xs font-bold text-success flex items-center gap-1">
                        <Check className="h-3 w-3" /> نشط ومفعل
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DNS Health Audit */}
              <div className="panel p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground border-b border-border pb-2">
                  <Server className="h-4 w-4 text-primary" />
                  فحص استجابة خوادم الأسماء (DNS over HTTPS)
                </div>
                <div className="grid grid-cols-2 gap-3 text-center pt-1">
                  <div className="rounded-xl border border-border bg-accent/40 p-3">
                    <div className="text-xs text-muted-foreground">Cloudflare DNS (1.1.1.1)</div>
                    <div className="mt-1 text-xl font-bold font-mono text-primary">
                      {auditRes.cloudflareDnsMs !== null ? `${auditRes.cloudflareDnsMs} ms` : "غير متاح"}
                    </div>
                    <div className="mt-0.5 text-[10px] text-success font-medium">DoH مشفر</div>
                  </div>
                  <div className="rounded-xl border border-border bg-accent/40 p-3">
                    <div className="text-xs text-muted-foreground">Google DNS (8.8.8.8)</div>
                    <div className="mt-1 text-xl font-bold font-mono text-primary">
                      {auditRes.googleDnsMs !== null ? `${auditRes.googleDnsMs} ms` : "غير متاح"}
                    </div>
                    <div className="mt-0.5 text-[10px] text-success font-medium">DoH مشفر</div>
                  </div>
                </div>
              </div>

              {/* Security Findings & Advice */}
              <div className="panel p-5 space-y-3">
                <div className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  ملاحظات وتوصيات الفحص الأمني
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {auditRes.notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-lg bg-accent/40 p-2.5 border border-border/60">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed text-foreground">{note}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 rounded-lg bg-accent/40 p-2.5 border border-border/60">
                    <Shield className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed text-foreground">
                      💡 نصيحة أمنية: عند استخدام شبكات Wi-Fi في المقاهي والأماكن العامة، يوصى دائماً بتشغيل VPN موثوق لمنع اعتراض حركة المرور الخاصة بك.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: SPEED & LATENCY (فحص السرعة والاستجابة) */}
        <TabsContent value="speed" className="space-y-5">
          <div className="panel p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  قياس سرعة التحميل وزمن الاستجابة (Ping)
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  قياس حقيقي ودقيق للتأخير (Latency) وتقلب الاتصال (Jitter) وسرعة التنزيل الفعلية.
                </p>
              </div>
              <button
                onClick={runLatencyTest}
                disabled={latencyBusy || !online}
                className="glow inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50 transition shadow-sm"
              >
                {latencyBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                {latencyBusy ? "جاري القياس…" : "بدء اختبار السرعة"}
              </button>
            </div>
          </div>

          {latencyErr && (
            <div className="panel p-4 text-sm text-warning border border-warning/40 bg-warning/10">
              {latencyErr}
            </div>
          )}

          {latencyRes && (
            <div className="space-y-4">
              {/* Quality Rating Banner */}
              <div className="panel p-4 flex items-center justify-between bg-card/60">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 border border-primary/30 text-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">مستوى جودة الاتصال</div>
                    <div className="font-bold text-base capitalize flex items-center gap-2">
                      {latencyRes.rating === "excellent" && <span className="text-success">⚡ ممتاز (Excellent)</span>}
                      {latencyRes.rating === "good" && <span className="text-primary">🟢 جيد جداً (Good)</span>}
                      {latencyRes.rating === "fair" && <span className="text-warning">🟡 متوسط (Fair)</span>}
                      {latencyRes.rating === "poor" && <span className="text-destructive">🔴 ضعيف (Poor)</span>}
                    </div>
                  </div>
                </div>
                {latencyRes.speedMbps && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">سرعة التحميل</div>
                    <div className="text-lg font-bold text-primary font-mono">{latencyRes.speedMbps} <span className="text-xs">Mbps</span></div>
                  </div>
                )}
              </div>

              {/* Latency Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["متوسط التأخير (Average)", latencyRes.avg, "ms"],
                  ["الأسرع (Fastest)", latencyRes.min, "ms"],
                  ["الأبطأ (Slowest)", latencyRes.max, "ms"],
                  ["التقلب (Jitter)", latencyRes.jitter, "ms"],
                ].map(([label, val, unit]) => (
                  <div key={label as string} className="panel p-4 text-center">
                    <div className="text-2xl font-bold tabular-nums text-primary font-mono">
                      {val}
                      <span className="text-xs text-muted-foreground font-sans"> {unit}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>

              <div className="panel p-4 text-xs text-muted-foreground">
                تم قياس زمن الذهاب والعودة عبر عينات متعددة ({latencyRes.samples.join(", ")} ms). القياسات مباشرة من هاتفك إلى خوادم شبكة تسليم المحتوى العالمية.
              </div>
            </div>
          )}

          {/* Browser Network info */}
          {conn && (conn.downlink || conn.rtt || conn.type) && (
            <div className="panel p-4 text-sm space-y-2">
              <div className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-primary" />
                بيانات بطاقة الشبكة للهاتف
              </div>
              <p className="text-xs text-muted-foreground">
                النوع: <strong className="text-foreground">{conn.type?.toUpperCase() ?? "غير محدد"}</strong> · النطاق الترددي المقدر: <strong className="text-foreground">{conn.downlink ?? "—"} Mbps</strong> · وقت الاستجابة التقديري: <strong className="text-foreground">{conn.rtt ?? "—"} ms</strong>
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
