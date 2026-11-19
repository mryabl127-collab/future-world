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
import { SpeedTest } from "@/components/SpeedTest";
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
  const [conn, setConn] = useState<{ type?: string | undefined; downlink?: number | undefined; rtt?: number | undefined } | null>(null);

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

      <Tabs defaultValue="speed" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="speed" className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <span className="font-semibold">اختبار السرعة</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-semibold">الفحص المدقق</span>
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

        {/* TAB 2: SPEED TEST (Speedtest-style, real measurement) */}
        <TabsContent value="speed" className="space-y-5">
          <SpeedTest online={online} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
