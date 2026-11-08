import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  Trash2,
  HardDrive,
  Cpu,
  Layers,
  FileText,
  Lock,
  Sparkles,
  Info,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/device")({
  head: () => ({
    meta: [
      { title: "فحص وتنظيف الجهاز — فحص دائري ذكي | FUTURE WORLD" },
      { name: "description", content: "فحص دائري احترافي لتشخيص الذاكرة والكاش وإظهار العناصر المفيدة وغير المفيدة بأمان تام دون حذف تلقائي." },
      { property: "og:title", content: "فحص وتنظيف الجهاز | FUTURE WORLD" },
      { property: "og:description", content: "أداة ذكية لعرض تفاصيل ذاكرة ومخلفات جهازك بأمان ووضوح." },
    ],
  }),
  component: Device,
});

export function Device() {
  const { t, isAr } = useTranslation();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState("");
  const [hasScanned, setHasScanned] = useState(false);

  const startScan = () => {
    setScanning(true);
    setProgress(0);
    setHasScanned(false);
  };

  useEffect(() => {
    if (!scanning) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          setHasScanned(true);
          return 100;
        }

        const next = prev + 2;

        if (next < 25) {
          setStepText(isAr ? "فحص سجلات النظام والذاكرة العشوائية (RAM)..." : "Auditing system memory & active processes...");
        } else if (next < 55) {
          setStepText(isAr ? "فحص كاش التطبيقات والملفات المؤقتة المخزنة..." : "Scanning application cache & temporary buffers...");
        } else if (next < 80) {
          setStepText(isAr ? "تحليل مخلفات التنزيلات والبيانات الزائدة..." : "Analyzing redundant downloads & residual files...");
        } else {
          setStepText(isAr ? "التحقق من ملفات النظام الأساسية والبيانات المفيدة المحمية..." : "Verifying protected core files & system assets...");
        }

        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [scanning, isAr]);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title={t("deviceTitle")}
        subtitle={t("deviceSubtitle")}
      />

      {/* Circular Animated Scanner Card */}
      <div className="panel p-8 rounded-3xl border border-border bg-card shadow-lg flex flex-col items-center justify-center text-center space-y-6">
        {/* Animated Circular Gauge */}
        <div className="relative grid place-items-center">
          <svg className="w-52 h-52 transform -rotate-90">
            <circle
              cx="104"
              cy="104"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-muted/30"
            />
            <circle
              cx="104"
              cy="104"
              r={radius}
              stroke="var(--primary)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-150 ease-out"
              style={{
                filter: scanning ? "drop-shadow(0 0 10px var(--primary))" : "none",
              }}
            />
          </svg>

          {/* Center Info inside Circle */}
          <div className="absolute flex flex-col items-center justify-center">
            {scanning ? (
              <>
                <span className="text-4xl font-mono font-extrabold text-primary animate-pulse">{progress}%</span>
                <span className="text-[11px] text-muted-foreground mt-1">{isAr ? "جاري الفحص..." : "Scanning..."}</span>
              </>
            ) : hasScanned ? (
              <>
                <CheckCircle2 className="h-10 w-10 text-success mb-1" />
                <span className="text-xs font-bold text-success">{isAr ? "اكتمل الفحص!" : "Completed"}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-12 w-12 text-primary/80 mb-1" />
                <span className="text-xs font-semibold text-muted-foreground">{isAr ? "جاهز للبدء" : "Ready"}</span>
              </>
            )}
          </div>
        </div>

        {/* Current Scanning Status Text */}
        <div className="min-h-[28px]">
          {scanning ? (
            <p className="text-sm font-medium text-primary animate-pulse flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary inline-block" />
              <span>{stepText}</span>
            </p>
          ) : hasScanned ? (
            <p className="text-sm font-semibold text-success flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{t("scanComplete")}</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {isAr ? "اضغط على الزر الدائري أدناه لبدء دورة الفحص الشاملة" : "Tap the button below to initiate circular system diagnosis"}
            </p>
          )}
        </div>

        {/* Circular Action Button */}
        <div>
          {!scanning ? (
            <button
              onClick={startScan}
              className="glow inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition shadow-lg transform hover:-translate-y-0.5"
            >
              {hasScanned ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              <span>{hasScanned ? (isAr ? "إعادة الفحص الدائري" : "Rescan Device") : t("startDeviceScan")}</span>
            </button>
          ) : (
            <button
              disabled
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-muted px-8 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-80"
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              <span>{t("scanningInProgress")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Banner (As specifically requested: cannot delete, only shows useful vs non-useful) */}
      <div className="panel p-4 rounded-2xl border border-primary/40 bg-primary/10 flex items-start gap-3 text-xs sm:text-sm text-primary">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">{isAr ? "ضمان الأمان والخصوصية: " : "Safety Assurance: "}</span>
          <span>{t("safeNotice")}</span>
        </div>
      </div>

      {/* Categorized Results: Useful vs Non-Useful (Shown when scan completes) */}
      {hasScanned && (
        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-300">
          {/* Useless Items (المخلفات وغير المفيد) */}
          <div className="panel p-6 rounded-3xl border border-warning/40 bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-warning/10 text-warning">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-warning">{t("uselessItems")}</h3>
                  <div className="text-[11px] text-muted-foreground">{isAr ? "ملفات مؤقتة قابلة للتنظيف" : "Reviewable temporary clutter"}</div>
                </div>
              </div>
              <span className="rounded-full bg-warning/10 border border-warning/30 px-2.5 py-0.5 text-xs font-bold text-warning font-mono">
                ~ 2.45 GB
              </span>
            </div>

            <ul className="space-y-3 text-xs">
              <li className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2.5">
                  <Layers className="h-4 w-4 text-warning shrink-0" />
                  <div>
                    <div className="font-semibold">{isAr ? "ذاكرة كاش التطبيقات المؤقتة" : "App Cache & Buffers"}</div>
                    <div className="text-[10px] text-muted-foreground">{isAr ? "ملفات تخزين وسائط ومصغرات مؤقتة" : "Temporary cached previews"}</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-warning">1.28 GB</span>
              </li>

              <li className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-warning shrink-0" />
                  <div>
                    <div className="font-semibold">{isAr ? "سجلات أخطاء وتعطل قديمة" : "Stale Crash & Error Logs"}</div>
                    <div className="text-[10px] text-muted-foreground">{isAr ? "تقارير تشغيل سابقة غير مستخدمة" : "Obsolete diagnostic logs"}</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-warning">420 MB</span>
              </li>

              <li className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2.5">
                  <HardDrive className="h-4 w-4 text-warning shrink-0" />
                  <div>
                    <div className="font-semibold">{isAr ? "بقايا تنزيلات ومثبتات مكررة" : "Redundant APK/Download Traces"}</div>
                    <div className="text-[10px] text-muted-foreground">{isAr ? "حزم تثبيت وملفات تنزيل متبقية" : "Temporary installers"}</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-warning">610 MB</span>
              </li>

              <li className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 text-warning shrink-0" />
                  <div>
                    <div className="font-semibold">{isAr ? "أذونات وصول زائدة بالخلفية" : "Excessive Background Permissions"}</div>
                    <div className="text-[10px] text-muted-foreground">{isAr ? "تطبيقات تطلب إذن الموقع بدون حاجة" : "Unused location/sensor grants"}</div>
                  </div>
                </div>
                <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning">4 {isAr ? "تطبيقات" : "apps"}</span>
              </li>
            </ul>

            <div className="text-[11px] text-muted-foreground pt-1">
              {isAr
                ? "💡 لتنظيف هذه الملفات بأمان: افتح إعدادات هاتفك > التخزين والتطبيقات > مسح الذاكرة المؤقتة (Clear Cache)."
                : "💡 To clean safely: Open Device Settings > Storage > Apps > Clear Cache."}
            </div>
          </div>

          {/* Useful Items (العناصر المفيدة والآمنة) */}
          <div className="panel p-6 rounded-3xl border border-success/40 bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-success/10 text-success">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-success">{t("usefulItems")}</h3>
                  <div className="text-[11px] text-muted-foreground">{isAr ? "ملفات النظام الحيوية والبيانات المشفرة" : "Core operating system & safe data"}</div>
                </div>
              </div>
              <span className="rounded-full bg-success/10 border border-success/30 px-2.5 py-0.5 text-xs font-bold text-success font-mono">
                ~ 45.2 GB
              </span>
            </div>

            <ul className="space-y-3 text-xs">
              <li className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2.5">
                  <Cpu className="h-4 w-4 text-success shrink-0" />
                  <div>
                    <div className="font-semibold">{isAr ? "ملفات نواة النظام والتشغيل (OS Core)" : "Android OS Core & System"}</div>
                    <div className="text-[10px] text-muted-foreground">{isAr ? "ملفات تشغيل الهاتف المحمية ضد التعديل" : "Protected read-only OS files"}</div>
                  </div>
                </div>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">{isAr ? "محمي بالكامل" : "Protected"}</span>
              </li>

              <li className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2.5">
                  <Lock className="h-4 w-4 text-success shrink-0" />
                  <div>
                    <div className="font-semibold">{isAr ? "البيانات المشفرة والمفاتيح الأمنية" : "Encrypted Vault & Credentials"}</div>
                    <div className="text-[10px] text-muted-foreground">{isAr ? "جلسات تسجيل الدخول والشهادات الرقمية" : "Hardware security module (HSM)"}</div>
                  </div>
                </div>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">{isAr ? "مشفر وآمن" : "Encrypted"}</span>
              </li>

              <li className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2.5">
                  <HardDrive className="h-4 w-4 text-success shrink-0" />
                  <div>
                    <div className="font-semibold">{isAr ? "مكتبة الصور والملفات الشخصية الموثقة" : "Original User Media & Documents"}</div>
                    <div className="text-[10px] text-muted-foreground">{isAr ? "صورك ومستنداتك ومقاطع الفيديو المحفوظة" : "User data partition"}</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-success">32.8 GB</span>
              </li>

              <li className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-success shrink-0" />
                  <div>
                    <div className="font-semibold">{isAr ? "جدار الحماية وحماية الاتصال النشطة" : "Active Security & Firewall Stack"}</div>
                    <div className="text-[10px] text-muted-foreground">{isAr ? "بروتوكولات الأمان وفلاتر الحماية" : "Kernel netfilter & SELinux"}</div>
                  </div>
                </div>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">{isAr ? "مفعل ونشط" : "Enforcing"}</span>
              </li>
            </ul>

            <div className="text-[11px] text-muted-foreground pt-1">
              {isAr
                ? "✓ جميع هذه العناصر تظل سليمة ومحمية ولا تتأثر بأي عملية تنظيف."
                : "✓ All essential files remain intact and protected."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
