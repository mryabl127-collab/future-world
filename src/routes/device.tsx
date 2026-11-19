import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  Play,
  RotateCcw,
  CheckCircle2,
  Trash2,
  HardDrive,
  Cpu,
  Smartphone,
  BatteryCharging,
  Battery,
  Wifi,
  MemoryStick,
  Monitor,
  Info,
  AlertTriangle,
  Lock,
  Sparkles,
  Loader2,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/Shell";
import { useTranslation } from "@/lib/i18n";
import {
  cleaningGuide,
  formatBytes,
  readBattery,
  readDeviceInfo,
  readNetwork,
  readPermissions,
  readStorage,
  scanAppData,
  type BatteryInfo,
  type CleanItem,
  type DeviceInfo,
  type KeptItem,
  type NetworkInfo,
  type PermissionInfo,
  type StorageInfo,
} from "@/lib/device-scan";

export const Route = createFileRoute("/device")({
  head: () => ({
    meta: [
      { title: "فحص وتنظيف الجهاز — قراءة حقيقية لجهازك | FUTURE WORLD" },
      {
        name: "description",
        content:
          "فحص حقيقي يقرأ معلومات جهازك (النظام، الذاكرة، البطارية، التخزين، الأذونات) ويحدد البيانات غير المفيدة الفعلية مع تنظيفها بضغطة.",
      },
      { property: "og:title", content: "فحص وتنظيف الجهاز | FUTURE WORLD" },
      {
        property: "og:description",
        content: "قراءة حقيقية لجهازك بدون أرقام وهمية، وتنظيف فعلي للبيانات غير المفيدة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Device,
});

type Report = {
  info: DeviceInfo;
  battery: BatteryInfo;
  network: NetworkInfo;
  storage: StorageInfo;
  permissions: PermissionInfo[];
  junk: CleanItem[];
  kept: KeptItem[];
  heapMb?: number | undefined;
};

const STEPS = [
  "قراءة نظام التشغيل ونوع الجهاز…",
  "قراءة المعالج والذاكرة والشاشة…",
  "فحص البطارية والشبكة…",
  "قياس مساحة التخزين المستخدمة…",
  "البحث عن الملفات المؤقتة والبقايا…",
  "مراجعة أذونات التطبيق…",
];

function tipsFor(r: Report): Array<{ level: "warn" | "ok"; text: string }> {
  const tips: Array<{ level: "warn" | "ok"; text: string }> = [];
  const { info, battery, network, storage } = r;
  if (battery) {
    if (battery.level <= 20 && !battery.charging)
      tips.push({
        level: "warn",
        text: `البطارية ${battery.level}% وغير موصولة بالشاحن. فعّل وضع توفير الطاقة واشحن الهاتف.`,
      });
    else if (battery.charging && battery.level >= 95)
      tips.push({
        level: "warn",
        text: "الهاتف مشحون تقريباً بالكامل وهو على الشاحن. افصله للحفاظ على عمر البطارية.",
      });
    else
      tips.push({
        level: "ok",
        text: `البطارية ${battery.level}%${battery.charging ? " وتشحن الآن" : ""} — حالتها طبيعية.`,
      });
  }
  if (info.ramGb !== undefined) {
    if (info.ramGb <= 2)
      tips.push({
        level: "warn",
        text: `ذاكرة الهاتف حوالي ${info.ramGb} GB وهي قليلة. سكّر التطبيقات المفتوحة بالخلفية وتجنّب تشغيل ألعاب ثقيلة مع تطبيقات أخرى.`,
      });
    else if (info.ramGb <= 4)
      tips.push({
        level: "ok",
        text: `ذاكرة الهاتف حوالي ${info.ramGb} GB — كافية للاستخدام اليومي، سكّر التطبيقات الثقيلة إذا لاحظت بطء.`,
      });
    else tips.push({ level: "ok", text: `ذاكرة الهاتف ${info.ramGb} GB أو أكثر — ممتازة للأداء.` });
  }
  const ver = parseFloat(info.osVersion ?? "");
  if (info.os === "android" && ver && ver < 10)
    tips.push({
      level: "warn",
      text: `نظام Android ${info.osVersion} قديم وما يستلم تحديثات أمان. حدّث النظام إذا متوفر أو انتبه من التطبيقات المجهولة.`,
    });
  if (info.os === "ios" && ver && ver < 16)
    tips.push({
      level: "warn",
      text: `نظام iOS ${info.osVersion} قديم. حدّثه من الإعدادات ← عام ← تحديث البرنامج.`,
    });
  if (network?.saveData) tips.push({ level: "ok", text: "وضع توفير البيانات مفعّل على جهازك." });
  if (network?.type && ["slow-2g", "2g"].includes(network.type))
    tips.push({
      level: "warn",
      text: "الشبكة الحالية بطيئة جداً (2G). جرّب الـ Wi-Fi أو مكان بتغطية أفضل.",
    });
  if (storage && storage.quota > 0 && storage.usage / storage.quota > 0.8)
    tips.push({
      level: "warn",
      text: "التطبيق قرب يستهلك كل المساحة المسموحة له. نظّف العناصر غير المفيدة بالأسفل.",
    });
  const granted = r.permissions.filter((p) => p.state === "granted");
  if (granted.length)
    tips.push({
      level: "warn",
      text: `سمحت للتطبيق باستخدام: ${granted.map((p) => p.label).join("، ")}. إذا ما تحتاجها، اسحب الإذن من إعدادات الهاتف.`,
    });
  return tips;
}

export function Device() {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [cleaning, setCleaning] = useState<string | null>(null);

  async function startScan() {
    setScanning(true);
    setReport(null);
    const step = async (i: number) => {
      setStepText(STEPS[i]!);
      setProgress(Math.round((i / STEPS.length) * 100));
      await new Promise((r) => setTimeout(r, 350));
    };
    try {
      await step(0);
      const info = await readDeviceInfo();
      await step(1);
      const mem = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      await step(2);
      const [battery, network] = [await readBattery(), readNetwork()];
      await step(3);
      const storage = await readStorage();
      await step(4);
      const { junk, kept } = await scanAppData();
      await step(5);
      const permissions = await readPermissions();
      setProgress(100);
      setReport({
        info,
        battery,
        network,
        storage,
        permissions,
        junk,
        kept,
        heapMb: mem ? Math.round(mem.usedJSHeapSize / 1048576) : undefined,
      });
    } catch {
      toast.error("تعذر إكمال الفحص، حاول مرة ثانية.");
    } finally {
      setScanning(false);
    }
  }

  async function refreshJunk() {
    const [{ junk, kept }, storage] = await Promise.all([scanAppData(), readStorage()]);
    setReport((r) => (r ? { ...r, junk, kept, storage } : r));
  }

  async function clean(item: CleanItem) {
    setCleaning(item.id);
    try {
      await item.clean();
      toast.success(`تم حذف: ${item.title}`);
    } catch {
      toast.error("تعذر الحذف");
    }
    await refreshJunk();
    setCleaning(null);
  }

  async function cleanAll() {
    if (!report) return;
    setCleaning("all");
    for (const item of report.junk) {
      try {
        await item.clean();
      } catch {
        /* continue */
      }
    }
    toast.success("تم تنظيف كل العناصر غير المفيدة");
    await refreshJunk();
    setCleaning(null);
  }

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const junkBytes = report?.junk.reduce((a, b) => a + b.bytes, 0) ?? 0;
  const keptBytes = report?.kept.reduce((a, b) => a + b.bytes, 0) ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title={t("deviceTitle")}
        subtitle="فحص حقيقي يقرأ معلومات جهازك الفعلية ويحدد البيانات غير المفيدة الموجودة فعلاً — بدون أرقام وهمية."
      />

      {/* Scanner */}
      <div className="panel flex flex-col items-center justify-center space-y-6 rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="relative grid place-items-center">
          <svg className="h-52 w-52 -rotate-90 transform">
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
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
              style={{ filter: scanning ? "drop-shadow(0 0 10px var(--primary))" : "none" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            {scanning ? (
              <>
                <span className="font-mono text-4xl font-extrabold text-primary">{progress}%</span>
                <span className="mt-1 text-[11px] text-muted-foreground">جاري الفحص…</span>
              </>
            ) : report ? (
              <>
                <CheckCircle2 className="mb-1 h-10 w-10 text-success" />
                <span className="text-xs font-bold text-success">اكتمل الفحص</span>
              </>
            ) : (
              <>
                <ShieldCheck className="mb-1 h-12 w-12 text-primary/80" />
                <span className="text-xs font-semibold text-muted-foreground">جاهز للبدء</span>
              </>
            )}
          </div>
        </div>

        <div className="min-h-[28px]">
          {scanning ? (
            <p className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{stepText}</span>
            </p>
          ) : report ? (
            <p className="text-sm font-semibold text-success">
              {report.junk.length
                ? `لقينا ${report.junk.length} عنصر غير مفيد${junkBytes ? ` بحجم ${formatBytes(junkBytes)}` : ""}`
                : "جهازك نظيف — ما لقينا بيانات غير مفيدة"}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              اضغط الزر حتى نقرأ معلومات جهازك الحقيقية
            </p>
          )}
        </div>

        <button
          onClick={startScan}
          disabled={scanning}
          className="glow inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90 disabled:opacity-60"
        >
          {scanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : report ? (
            <RotateCcw className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
          <span>{scanning ? "جاري الفحص…" : report ? "إعادة الفحص" : t("startDeviceScan")}</span>
        </button>
      </div>

      {report && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Device info */}
          <section className="panel space-y-4 rounded-3xl p-6">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Smartphone className="h-5 w-5 text-primary" /> معلومات جهازك (مقروءة من الجهاز نفسه)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow
                icon={Smartphone}
                label="الجهاز"
                value={
                  [report.info.brand, report.info.model].filter(Boolean).join(" ") ||
                  "ما يكشفه المتصفح"
                }
              />
              <InfoRow
                icon={Monitor}
                label="النظام"
                value={`${report.info.osName}${report.info.osVersion ? " " + report.info.osVersion : ""}`}
              />
              <InfoRow
                icon={Cpu}
                label="المعالج"
                value={report.info.cores ? `${report.info.cores} أنوية` : "غير متاح"}
              />
              <InfoRow
                icon={MemoryStick}
                label="الذاكرة (RAM)"
                value={
                  report.info.ramGb
                    ? `حوالي ${report.info.ramGb} GB${report.info.ramGb >= 8 ? " أو أكثر" : ""}`
                    : "ما يكشفها هذا الجهاز"
                }
              />
              <InfoRow
                icon={report.battery?.charging ? BatteryCharging : Battery}
                label="البطارية"
                value={
                  report.battery
                    ? `${report.battery.level}%${report.battery.charging ? " · تشحن" : ""}`
                    : "ما يكشفها هذا الجهاز"
                }
              />
              <InfoRow
                icon={Wifi}
                label="الشبكة"
                value={
                  report.network
                    ? `${report.network.type?.toUpperCase() ?? "—"}${report.network.downlink ? ` · حوالي ${report.network.downlink} Mbps` : ""}${report.network.rtt ? ` · ${report.network.rtt} ms` : ""}`
                    : navigator.onLine
                      ? "متصل"
                      : "غير متصل"
                }
              />
              <InfoRow icon={Monitor} label="الشاشة" value={`${report.info.screen} بكسل`} />
              <InfoRow
                icon={HardDrive}
                label="تخزين التطبيق"
                value={
                  report.storage
                    ? `${formatBytes(report.storage.usage)} مستخدم من ${formatBytes(report.storage.quota)} مسموح`
                    : "غير متاح"
                }
              />
            </div>
          </section>

          {/* Junk vs kept */}
          <div className="grid gap-6 md:grid-cols-2">
            <section className="panel space-y-4 rounded-3xl border-warning/40 p-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-warning/10 text-warning">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-warning sm:text-base">
                      غير مفيد — ممكن تحذفه
                    </h3>
                    <div className="text-[11px] text-muted-foreground">موجود فعلاً على جهازك</div>
                  </div>
                </div>
                <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 font-mono text-xs font-bold text-warning">
                  {formatBytes(junkBytes)}
                </span>
              </div>
              {report.junk.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                  <Sparkles className="h-8 w-8 text-success" />
                  ما لقينا أي بيانات غير مفيدة. كل شي نظيف.
                </div>
              ) : (
                <>
                  <ul className="space-y-3 text-xs">
                    {report.junk.map((j) => (
                      <li
                        key={j.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 p-3"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold">{j.title}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {j.detail}
                            {j.bytes ? ` · ${formatBytes(j.bytes)}` : ""}
                          </div>
                        </div>
                        <button
                          onClick={() => clean(j)}
                          disabled={!!cleaning}
                          className="shrink-0 rounded-full border border-warning/40 px-3 py-1.5 text-[11px] font-bold text-warning transition hover:bg-warning/10 disabled:opacity-50"
                        >
                          {cleaning === j.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "حذف"
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={cleanAll}
                    disabled={!!cleaning}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-warning text-sm font-bold text-destructive-foreground transition hover:bg-warning/90 disabled:opacity-60"
                  >
                    {cleaning === "all" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    تنظيف الكل
                  </button>
                </>
              )}
            </section>

            <section className="panel space-y-4 rounded-3xl border-success/40 p-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-success/10 text-success">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-success sm:text-base">
                      مفيد — يبقى محفوظ
                    </h3>
                    <div className="text-[11px] text-muted-foreground">ما نحذفه أبداً</div>
                  </div>
                </div>
                <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 font-mono text-xs font-bold text-success">
                  {formatBytes(keptBytes)}
                </span>
              </div>
              {report.kept.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  لا توجد بيانات محفوظة بعد.
                </p>
              ) : (
                <ul className="space-y-3 text-xs">
                  {report.kept.map((k) => (
                    <li
                      key={k.title}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 p-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold">{k.title}</div>
                        <div className="text-[11px] text-muted-foreground">{k.detail}</div>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-success">
                        {formatBytes(k.bytes)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Device-specific notes */}
          <section className="panel space-y-3 rounded-3xl p-6">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <ListChecks className="h-5 w-5 text-primary" /> ملاحظات حسب جهازك
            </h2>
            <ul className="space-y-2 text-sm">
              {tipsFor(report).map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3"
                >
                  {tip.level === "warn" ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  )}
                  <span className="leading-relaxed">{tip.text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Whole-phone guide */}
          <section className="panel space-y-3 rounded-3xl p-6">
            {(() => {
              const g = cleaningGuide(report.info);
              return (
                <>
                  <h2 className="flex items-center gap-2 text-base font-bold">
                    <Sparkles className="h-5 w-5 text-primary" /> {g.title}
                  </h2>
                  <ol className="list-decimal space-y-2 ps-5 text-sm leading-relaxed text-muted-foreground marker:text-primary">
                    {g.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </>
              );
            })()}
          </section>
        </div>
      )}

      <div className="panel flex items-start gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-4 text-xs text-primary sm:text-sm">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-bold">بكل صراحة: </span>
          كل الأرقام هنا مقروءة من جهازك وقت الفحص. أنظمة الهاتف (Android و iPhone) تمنع أي تطبيق من
          فتح ملفات التطبيقات الثانية، لذلك ننظف بيانات هذا التطبيق فعلياً، ونعطيك خطوات دقيقة حسب
          نوع جهازك لتنظيف باقي الهاتف. ما نحذف شي بدون ما تضغط حذف.
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Cpu; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
