import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Link2,
  ImageIcon,
  Loader2,
  History,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Lock,
  Unlock,
  Server,
  ArrowUpRight,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/Shell";
import { analyzeUrl, type UrlReport } from "@/lib/url-check";
import { addScan, useLocal, type ScanRecord } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "كشف وفحص الروابط والصور | FUTURE WORLD" },
      { name: "description", content: "فحص مدقق وشامل للروابط المشبوهة، كشف التصيد، تحليل DNS، وفحص البيانات الوصفية للصور مع سجل مدمج." },
      { property: "og:title", content: "كشف وفحص الروابط والصور | FUTURE WORLD" },
      { property: "og:description", content: "فحص أمني دقيق للروابط والصور بجودة المواقع الاحترافية العالمية." },
    ],
  }),
  component: Scan,
});

function Scan() {
  const { t, isAr } = useTranslation();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("scanTitle")}
        subtitle={t("scanSubtitle")}
      />

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2 rounded-full p-1 bg-muted">
          <TabsTrigger value="url" className="rounded-full text-xs sm:text-sm font-semibold">
            <Link2 className="me-2 h-4 w-4" />
            {t("tabUrl")}
          </TabsTrigger>
          <TabsTrigger value="image" className="rounded-full text-xs sm:text-sm font-semibold">
            <ImageIcon className="me-2 h-4 w-4" />
            {t("tabImage")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-6">
          <UrlScanSection />
        </TabsContent>

        <TabsContent value="image" className="space-y-6">
          <ImageScanSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UrlScanSection() {
  const { t, isAr } = useTranslation();
  const [urlInput, setUrlInput] = useState("");
  const [report, setReport] = useState<UrlReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [dnsIp, setDnsIp] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useLocal<ScanRecord[]>("fw-history", []);

  const runScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setDnsIp(null);

    // Analyze heuristics locally
    const res = analyzeUrl(urlInput);
    setReport(res);

    if (res.valid) {
      addScan({
        type: "url",
        target: res.url.href.slice(0, 200),
        level: res.risk,
        summary: res.findings.length
          ? `${res.findings.length} ملاحظة: ${res.findings.map((f) => f.title).slice(0, 2).join(", ")}`
          : "رابط آمن - لم يتم العثور على مؤشرات خطر واضحة",
      });

      // Query real DNS over HTTPS (Cloudflare DoH) for live IP resolution
      try {
        const doh = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(res.url.hostname)}&type=A`,
          { headers: { accept: "application/dns-json" } }
        );
        if (doh.ok) {
          const json = await doh.json();
          const ip = json.Answer?.find((a: { type: number; data: string }) => a.type === 1)?.data;
          if (ip) setDnsIp(ip);
        }
      } catch {
        // DNS lookup fallback
      }
    }

    setLoading(false);
  };

  const urlHistory = history.filter((h) => h.type === "url");

  // Calculate a visual security score (0-100)
  const getSecurityScore = () => {
    if (!report || !report.valid) return 0;
    if (report.risk === "high") return 25;
    if (report.risk === "medium") return 65;
    return 98;
  };

  const score = getSecurityScore();

  return (
    <div className="space-y-6">
      {/* Top Controls: Input Form + Toggle History Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={runScan} className="panel flex flex-1 gap-2 p-2 rounded-full border border-border shadow-sm">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            maxLength={2048}
            placeholder={t("urlPlaceholder")}
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            className="h-11 min-w-0 flex-1 bg-transparent px-4 text-sm sm:text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-full bg-primary px-6 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm glow flex items-center gap-2 shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            <span>{loading ? (isAr ? "جاري الفحص..." : "Auditing...") : t("inspectUrlBtn")}</span>
          </button>
        </form>

        {/* Integrated History Button (as requested: remove separate history page and make it a button here) */}
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className={`h-12 rounded-full border px-5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shrink-0 transition ${
            showHistory ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
          }`}
        >
          <History className="h-4 w-4" />
          <span>{t("tabHistory")}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono font-bold">
            {urlHistory.length}
          </span>
        </button>
      </div>

      {/* Expandable Integrated History Panel */}
      {showHistory && (
        <div className="panel p-5 rounded-3xl border border-primary/30 space-y-4 bg-card/80 backdrop-blur animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm">{isAr ? "سجل فحص الروابط المحفوظ على هذا الجهاز" : "On-Device Inspection History"}</h3>
            </div>
            {urlHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory(history.filter((h) => h.type !== "url"))}
                className="text-xs text-destructive hover:underline flex items-center gap-1 font-medium"
              >
                <Trash2 className="h-3 w-3" />
                <span>{t("clearHistory")}</span>
              </button>
            )}
          </div>

          {urlHistory.length === 0 ? (
            <p className="text-center py-6 text-xs text-muted-foreground">{t("noHistory")}</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto pe-1">
              {urlHistory.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3 text-xs bg-background/60 hover:border-primary/40 transition cursor-pointer"
                  onClick={() => {
                    setUrlInput(item.target);
                    const r = analyzeUrl(item.target);
                    setReport(r);
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-mono truncate font-medium">{item.target}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{item.summary}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                        item.level === "low"
                          ? "border-success/40 bg-success/10 text-success"
                          : item.level === "medium"
                          ? "border-warning/40 bg-warning/10 text-warning"
                          : "border-destructive/40 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {item.level === "low" ? (isAr ? "آمن" : "Safe") : item.level === "medium" ? (isAr ? "تنبيه" : "Warn") : (isAr ? "خطر" : "High Risk")}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.date).toLocaleDateString(isAr ? "ar-EG" : "en-US", { month: "numeric", day: "numeric" })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Invalid URL Warning */}
      {report && !report.valid && (
        <div className="panel flex items-center gap-3 p-4 text-warning rounded-2xl border border-warning/40 bg-warning/10">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">{report.error}</span>
        </div>
      )}

      {/* Detailed Live Security Analysis Cards */}
      {report?.valid && (
        <div className="space-y-4">
          {/* Main Inspection Score Banner */}
          <div className="panel p-6 rounded-3xl border border-border bg-card shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${
                    score >= 80 ? "bg-success/10 text-success" : score >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {score >= 80 ? <ShieldCheck className="h-7 w-7" /> : <ShieldAlert className="h-7 w-7" />}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{isAr ? "تقييم أمان الرابط" : "Overall Security Assessment"}</div>
                  <div className="text-lg font-bold">
                    {score >= 80
                      ? isAr
                        ? "رابط آمن وموثوق (Safe Link)"
                        : "Safe & Verified"
                      : score >= 50
                      ? isAr
                        ? "تحذير: يحتوي مؤشرات مشبوهة (Suspicious Signs)"
                        : "Suspicious Indicators"
                      : isAr
                      ? "خطر: مؤشرات تصيد عالية (High Phishing Risk)"
                      : "Critical Phishing Risk"}
                  </div>
                </div>
              </div>

              {/* Score Meter */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{isAr ? "مؤشر الأمان" : "Safety Score"}</div>
                  <div
                    className={`text-2xl font-mono font-extrabold ${
                      score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-destructive"
                    }`}
                  >
                    {score}/100
                  </div>
                </div>
              </div>
            </div>

            {/* URL Breakdown Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 border-t border-border pt-4 text-xs">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="text-muted-foreground flex items-center gap-1 mb-1">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span>{isAr ? "النطاق الأساسي (Domain)" : "Host Domain"}</span>
                </div>
                <div className="font-mono font-bold truncate">{report.url.hostname}</div>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="text-muted-foreground flex items-center gap-1 mb-1">
                  {report.url.protocol === "https:" ? (
                    <Lock className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5 text-destructive" />
                  )}
                  <span>{isAr ? "بروتوكول التشفير" : "Protocol (SSL)"}</span>
                </div>
                <div className={`font-mono font-bold ${report.url.protocol === "https:" ? "text-success" : "text-destructive"}`}>
                  {report.url.protocol.toUpperCase()} {report.url.protocol === "https:" ? "✓ تشفير آمن" : "⚠ غير مشفر"}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="text-muted-foreground flex items-center gap-1 mb-1">
                  <Server className="h-3.5 w-3.5 text-primary" />
                  <span>{isAr ? "عنوان IP والخادم (DNS)" : "Live Server IP"}</span>
                </div>
                <div className="font-mono font-bold truncate">
                  {dnsIp ? dnsIp : isAr ? "جاري الاستعلام..." : "Resolving..."}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="text-muted-foreground flex items-center gap-1 mb-1">
                  <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                  <span>{isAr ? "المسار والمعلمات" : "Path & Query"}</span>
                </div>
                <div className="font-mono font-bold truncate">
                  {report.url.pathname || "/"} {report.url.search ? "(معلمات نشطة)" : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Findings List */}
          <div className="panel p-5 rounded-3xl border border-border bg-card space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{isAr ? "نتائج الفحص والتدقيق الأمني" : "Detailed Audit Findings"}</span>
            </h4>

            {report.findings.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-success p-3 rounded-2xl bg-success/10 border border-success/30 font-medium">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>
                  {isAr
                    ? "تم فحص الرابط بنجاح: لا توجد مؤشرات احتيال أو حروف مشبوهة أو معلمات تتبع خبيثة."
                    : "No phishing keywords, homograph characters, or deceptive patterns found."}
                </span>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {report.findings.map((f) => (
                  <li
                    key={f.title}
                    className={`flex items-start gap-3 rounded-2xl border p-3 text-xs sm:text-sm ${
                      f.level === "high"
                        ? "border-destructive/40 bg-destructive/5 text-destructive"
                        : f.level === "warn"
                        ? "border-warning/40 bg-warning/5 text-warning"
                        : "border-border bg-muted/20 text-foreground"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">{f.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{f.detail}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <p className="border-t border-border pt-3 text-[11px] text-muted-foreground leading-relaxed">
              {isAr
                ? "💡 نصيحة أمان عالم المستقبل: الفحص يحلل تكوين الرابط، سمعة النطاق، ومؤشرات الهندسة الاجتماعية. عند الشك في أي رابط بنكي أو حسابي، افتح المتصفح واكتب العنوان الرسمي يدوياً."
                : "💡 Pro Tip: Never enter credentials on unfamiliar links. Always verify the domain spelling before submitting passwords."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

type ImageMeta = {
  name: string;
  type: string;
  size: string;
  dims?: string;
  modified: string;
  exif: [string, string][];
};

function ImageScanSection() {
  const { t, isAr } = useTranslation();
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showImageHistory, setShowImageHistory] = useState(false);
  const [history, setHistory] = useLocal<ScanRecord[]>("fw-history", []);

  const onFileChange = async (file?: File) => {
    setError("");
    setMeta(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(isAr ? "يرجى اختيار ملف صورة صالح (JPEG, PNG, WebP...)" : "Please select a valid image file.");
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setError(isAr ? "حجم الصورة كبير جداً (أكبر من 30 ميغابايت)" : "Image exceeds 30 MB limit.");
      return;
    }

    setLoading(true);
    try {
      const dims = await new Promise<string | undefined>((res) => {
        const img = new Image();
        const u = URL.createObjectURL(file);
        img.onload = () => {
          res(`${img.naturalWidth} × ${img.naturalHeight}px`);
          URL.revokeObjectURL(u);
        };
        img.onerror = () => {
          res(undefined);
          URL.revokeObjectURL(u);
        };
        img.src = u;
      });

      let exif: [string, string][] = [];
      try {
        const exifr = await import("exifr");
        const data = await exifr.parse(file, { gps: true });
        if (data) {
          exif = Object.entries(data)
            .filter(([, v]) => (v != null && typeof v !== "object") || v instanceof Date)
            .slice(0, 35)
            .map(([k, v]) => [k, v instanceof Date ? v.toLocaleString() : String(v).slice(0, 90)]);
        }
      } catch {
        // no exif
      }

      const m: ImageMeta = {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        dims,
        modified: new Date(file.lastModified).toLocaleString(),
        exif,
      };

      setMeta(m);

      const hasGps = exif.some(([k]) => /latitude|longitude/i.test(k));
      addScan({
        type: "image",
        target: file.name.slice(0, 120),
        level: hasGps ? "medium" : "low",
        summary: hasGps
          ? isAr
            ? "تحتوي بيانات الموقع الجغرافي GPS"
            : "Contains GPS Location"
          : isAr
          ? `تم العثور على ${exif.length} حقل بيانات وصفية`
          : `${exif.length} metadata fields found`,
      });
    } catch {
      setError(isAr ? "تعذر قراءة بيانات هذه الصورة." : "Could not inspect this image.");
    } finally {
      setLoading(false);
    }
  };

  const imageHistory = history.filter((h) => h.type === "image");
  const hasGps = meta?.exif.some(([k]) => /latitude|longitude/i.test(k));

  return (
    <div className="space-y-6">
      {/* Upload Zone & History Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        <label className="panel flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed p-8 text-center rounded-3xl hover:border-primary/60 transition group">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
            <ImageIcon className="h-6 w-6" />
          </div>
          <span className="font-bold text-sm sm:text-base">
            {isAr ? "اضغط لاختيار صورة وفحص البيانات الوصفية" : "Select an image to inspect EXIF metadata"}
          </span>
          <span className="text-xs text-muted-foreground">
            {isAr ? "تتم القراءة محلياً في هاتفك فقط · لا يتم رفع الصورة لأي خادم" : "Local on-device inspection · never uploaded"}
          </span>
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFileChange(e.target.files?.[0])} />
        </label>

        {/* Button to Show Past Image Results (as specifically requested) */}
        <button
          type="button"
          onClick={() => setShowImageHistory(!showImageHistory)}
          className={`h-auto min-h-[50px] sm:w-48 rounded-3xl border p-4 text-xs sm:text-sm font-semibold flex flex-col items-center justify-center gap-2 shrink-0 transition ${
            showImageHistory ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
          }`}
        >
          <History className="h-5 w-5" />
          <span>{t("previousImageResults")}</span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-mono font-bold">
            {imageHistory.length} {isAr ? "سابق" : "past"}
          </span>
        </button>
      </div>

      {/* Expandable Image History */}
      {showImageHistory && (
        <div className="panel p-5 rounded-3xl border border-primary/30 space-y-4 bg-card/80 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm">{isAr ? "سجل فحص الصور السابق" : "Past Image Inspection Records"}</h3>
            </div>
            {imageHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory(history.filter((h) => h.type !== "image"))}
                className="text-xs text-destructive hover:underline flex items-center gap-1 font-medium"
              >
                <Trash2 className="h-3 w-3" />
                <span>{t("clearHistory")}</span>
              </button>
            )}
          </div>

          {imageHistory.length === 0 ? (
            <p className="text-center py-6 text-xs text-muted-foreground">{t("noHistory")}</p>
          ) : (
            <ul className="space-y-2 max-h-52 overflow-y-auto pe-1">
              {imageHistory.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3 text-xs bg-background/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{item.target}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{item.summary}</div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                      item.level === "medium"
                        ? "border-warning/40 bg-warning/10 text-warning"
                        : "border-success/40 bg-success/10 text-success"
                    }`}
                  >
                    {item.level === "medium" ? (isAr ? "موقع GPS" : "GPS Detected") : (isAr ? "سليم" : "Clean")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>{isAr ? "جاري استخراج البيانات الوصفية (EXIF)..." : "Reading metadata..."}</span>
        </div>
      )}

      {error && (
        <div className="panel flex items-center gap-3 p-4 text-warning rounded-2xl border border-warning/40 bg-warning/10">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Image Inspection Result Card */}
      {meta && (
        <div className="panel space-y-4 p-6 rounded-3xl border border-border bg-card shadow-md">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-base flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <span>{isAr ? "بيانات ومعلومات الصورة" : "Image Specifications"}</span>
            </h3>
            <span className="text-xs text-muted-foreground font-mono">{meta.size}</span>
          </div>

          <dl className="grid gap-3 text-xs sm:text-sm sm:grid-cols-2">
            {[
              [isAr ? "اسم الملف" : "File Name", meta.name],
              [isAr ? "نوع الصورة" : "MIME Type", meta.type],
              [isAr ? "الأبعاد والدقة" : "Dimensions", meta.dims ?? "غير محدد"],
              [isAr ? "تاريخ التعديل" : "Last Modified", meta.modified],
            ].map(([k, v]) => (
              <div key={k} className="p-3 rounded-2xl bg-muted/40 border border-border">
                <dt className="text-[11px] text-muted-foreground">{k}</dt>
                <dd className="font-semibold break-all mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>

          {hasGps && (
            <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs sm:text-sm text-warning">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">{isAr ? "تحذير خصوصية: تحتوي الصورة إحداثيات GPS جغرافية" : "Privacy Warning: GPS Location Found"}</div>
                <div className="text-xs opacity-90 mt-0.5">
                  {isAr
                    ? "تكشف هذه الصورة مكان التقاطها بدقة على الخريطة. يُنصح بإزالة الموقع الجغرافي قبل مشاركتها على وسائل التواصل للحفاظ على خصوصيتك."
                    : "This photo exposes your exact physical coordinates. Strip EXIF data before public distribution."}
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="mb-2 text-xs font-bold text-muted-foreground uppercase">
              {isAr ? "البيانات الوصفية المستخرجة (EXIF Table)" : "Embedded EXIF Attributes"}
            </div>
            {meta.exif.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 rounded-2xl bg-muted/30">
                {isAr ? "لا توجد بيانات وصفية مدمجة في هذه الصورة." : "No embedded EXIF tags found."}
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto rounded-2xl border border-border">
                {meta.exif.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between gap-4 border-b border-border/60 px-3 py-2 text-xs last:border-0 hover:bg-muted/40 transition"
                  >
                    <span className="font-mono text-muted-foreground">{k}</span>
                    <span className="break-all text-right font-medium">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
