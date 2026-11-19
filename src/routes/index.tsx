import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, ScanSearch, Bot, GraduationCap, ShieldCheck, Wifi, MessageSquare, Settings, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { DemoBadge } from "@/components/Shell";
import { useTranslation } from "@/lib/i18n";
import { IRAQ_MAP, projectIraq } from "@/lib/iraq-map-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FUTURE WORLD — منصة عالم المستقبل للأمن السيبراني والذكاء الاصطناعي" },
      { name: "description", content: "فحص الروابط المشبوهة، مساعد ذكي شامل، أكاديمية ومكتبة الأمن الرقمي، وتنظيف وفحص أمان الأجهزة." },
      { property: "og:title", content: "FUTURE WORLD — منصة عالم المستقبل" },
      { property: "og:description", content: "منظومة متكاملة للأمن السيبراني والذكاء الاصطناعي مع خريطة العراق التفاعلية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const IRAQ_CITIES = [
  { name: "بغداد (Baghdad)", en: "Baghdad", lon: 44.366, lat: 33.315, v: 480, capital: true },
  { name: "البصرة (Basra)", en: "Basra", lon: 47.783, lat: 30.508, v: 240 },
  { name: "أربيل (Erbil)", en: "Erbil", lon: 44.009, lat: 36.191, v: 195 },
  { name: "الموصل (Mosul)", en: "Mosul", lon: 43.13, lat: 36.34, v: 170 },
  { name: "النجف الأشرف (Najaf)", en: "Najaf", lon: 44.336, lat: 32.0, v: 145 },
  { name: "كربلاء المقدسة (Karbala)", en: "Karbala", lon: 44.024, lat: 32.616, v: 138 },
  { name: "السليمانية (Sulaymaniyah)", en: "Sulaymaniyah", lon: 45.437, lat: 35.557, v: 130 },
  { name: "كركوك (Kirkuk)", en: "Kirkuk", lon: 44.392, lat: 35.468, v: 118 },
  { name: "الناصرية (Nasiriyah)", en: "Nasiriyah", lon: 46.258, lat: 31.058, v: 110 },
  { name: "الرمادي (Ramadi)", en: "Ramadi", lon: 43.3, lat: 33.42, v: 105 },
];

const NEIGHBOR_LABELS = [
  { ar: "تركيا", en: "TURKEY", lon: 41.2, lat: 37.55 },
  { ar: "سوريا", en: "SYRIA", lon: 39.4, lat: 35.2 },
  { ar: "إيران", en: "IRAN", lon: 47.6, lat: 34.2 },
  { ar: "السعودية", en: "SAUDI ARABIA", lon: 42.2, lat: 29.3 },
  { ar: "الكويت", en: "KUWAIT", lon: 47.55, lat: 29.35 },
  { ar: "الأردن", en: "JORDAN", lon: 38.6, lat: 32.2 },
];

function IraqMap({ isAr }: { isAr: boolean }) {
  const tigris = projectIraq(43.75, 34.45);
  const euphrates = projectIraq(42.25, 34.05);
  const shatt = projectIraq(47.95, 30.25);
  return (
    <svg
      viewBox={IRAQ_MAP.viewBox}
      className="h-auto w-full"
      role="img"
      aria-label={isAr ? "خريطة العراق مع المحافظات ونهري دجلة والفرات" : "Map of Iraq with provinces and the Tigris and Euphrates rivers"}
    >
      <defs>
        <clipPath id="iraq-clip">
          <path d={IRAQ_MAP.outline} />
        </clipPath>
      </defs>

      {/* Neighbouring countries for context */}
      {IRAQ_MAP.neighbors.map((n) => (
        <path key={n.name} d={n.d} fill="var(--map-neighbor)" stroke="var(--border)" strokeWidth="0.6" />
      ))}
      {NEIGHBOR_LABELS.map((n) => {
        const p = projectIraq(n.lon, n.lat);
        return (
          <text key={n.en} x={p.x} y={p.y} textAnchor="middle" fontSize="8" fill="var(--muted-foreground)" opacity="0.7" className="select-none">
            {isAr ? n.ar : n.en}
          </text>
        );
      })}

      {/* Iraq land: same tint and border colour as before */}
      <path
        d={IRAQ_MAP.outline}
        fill="color-mix(in oklab, var(--primary) 14%, var(--card))"
        stroke="none"
      />
      {IRAQ_MAP.provinces.map((p) => (
        <path key={p.name} d={p.d} fill="transparent" className="transition-colors hover:fill-[color-mix(in_oklab,var(--map-green)_14%,transparent)]">
          <title>{p.name}</title>
        </path>
      ))}

      {/* Province borders in green */}
      <path d={IRAQ_MAP.provinceBorders} fill="none" stroke="var(--map-green)" strokeWidth="0.9" strokeDasharray="3 2" strokeLinejoin="round" opacity="0.9" />

      {/* Rivers and lakes in green */}
      <g clipPath="url(#iraq-clip)">
        {IRAQ_MAP.lakes.map((l) => (
          <path key={l.name} d={l.d} fill="color-mix(in oklab, var(--map-green) 55%, transparent)" stroke="var(--map-green)" strokeWidth="0.6" />
        ))}
        {IRAQ_MAP.rivers.map((r, i) => (
          <path
            key={`${r.name}-${i}`}
            d={r.d}
            fill="none"
            stroke="var(--map-green)"
            strokeWidth={r.major ? 2 : 1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>

      {/* Country border */}
      <path d={IRAQ_MAP.outline} fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinejoin="round" />

      {/* River labels */}
      <g fontSize="9" fontWeight="bold" fill="var(--map-green)" className="select-none pointer-events-none">
        <text x={tigris.x} y={tigris.y}>{isAr ? "دجلة" : "Tigris"}</text>
        <text x={euphrates.x} y={euphrates.y}>{isAr ? "الفرات" : "Euphrates"}</text>
        <text x={shatt.x} y={shatt.y} fontSize="7">{isAr ? "شط العرب" : "Shatt al-Arab"}</text>
      </g>

      {/* Cities */}
      {IRAQ_CITIES.map((c) => {
        const p = projectIraq(c.lon, c.lat);
        return (
          <g key={c.en}>
            {c.capital ? (
              <>
                <circle cx={p.x} cy={p.y} r="8" fill="var(--warning)" opacity="0.25" className="animate-ping" style={{ transformOrigin: `${p.x}px ${p.y}px` }} />
                <circle cx={p.x} cy={p.y} r="4" fill="var(--warning)" stroke="var(--background)" strokeWidth="1" />
                <text x={p.x + 7} y={p.y + 4} fontSize="11" fontWeight="bold" fill="var(--warning)">
                  {isAr ? "بغداد ★" : "Baghdad ★"}
                </text>
              </>
            ) : (
              <>
                <circle cx={p.x} cy={p.y} r="2.6" fill="var(--foreground)" stroke="var(--background)" strokeWidth="0.8" />
                <text x={p.x + 5} y={p.y + 3} fontSize="8" fill="var(--foreground)" opacity="0.9">
                  {isAr ? c.name.split(" ")[0] : c.en}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Index() {
  const { t, isAr } = useTranslation();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center pt-6 text-center">
        <div className="glow mb-6 grid h-24 w-24 place-items-center rounded-full border border-border bg-card shadow-lg">
          <Logo className="h-14 w-14" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-[0.15em] md:text-6xl font-display">
          FUTURE <span className="text-primary">WORLD</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground text-sm sm:text-base leading-relaxed">
          {t("heroSubtitle")}
        </p>

        {/* Circular Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/scan"
            className="glow inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition transform hover:-translate-y-0.5"
          >
            <ScanSearch className="h-4 w-4" />
            <span>{t("startScan")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/academy"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-8 text-sm font-semibold hover:bg-accent transition shadow-sm hover:border-primary/50"
          >
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>{t("openAcademy")}</span>
          </Link>
          <Link
            to="/assistant"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-8 text-sm font-semibold text-primary hover:bg-primary/20 transition shadow-sm"
          >
            <Bot className="h-4 w-4" />
            <span>{t("navAssistant")}</span>
          </Link>
        </div>
      </section>

      {/* Circular Feature Cards */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>{t("exploreFeatures")}</span>
          </h2>
          <DemoBadge label={isAr ? "شامل" : "ALL IN ONE"} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/scan"
            className="panel group flex flex-col p-6 rounded-3xl transition hover:border-primary/60 hover:glow"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
              <ScanSearch className="h-6 w-6" />
            </div>
            <div className="font-bold text-lg">{t("navScan")}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {isAr ? "كشف الروابط المشبوهة، فحص النطاق وDNS، وسجل الفحوصات المدمج." : "Deep link analysis, domain risk, and integrated scan history."}
            </div>
          </Link>

          <Link
            to="/assistant"
            className="panel group flex flex-col p-6 rounded-3xl transition hover:border-primary/60 hover:glow"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
              <Bot className="h-6 w-6" />
            </div>
            <div className="font-bold text-lg">{t("navAssistant")}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {isAr ? "مساعد ذكي شامل يجيبك عن كل مجالات التكنولوجيا والعلوم والحياة." : "Comprehensive AI answering in all scientific, tech, and general fields."}
            </div>
          </Link>

          <Link
            to="/device"
            className="panel group flex flex-col p-6 rounded-3xl transition hover:border-primary/60 hover:glow"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="font-bold text-lg">{t("navDevice")}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {isAr ? "فحص دائري ذكي لتشخيص الذاكرة والكاش وعرض المفيد وغير المفيد بأمان." : "Circular animated diagnostic scanner showing useful vs. clutter data."}
            </div>
          </Link>

          <Link
            to="/academy"
            className="panel group flex flex-col p-6 rounded-3xl transition hover:border-primary/60 hover:glow"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="font-bold text-lg">{t("navAcademy")}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {isAr ? "المكتبة الرقمية المدمجة والكتب والدورات المنهجية المعتمدة." : "Unified curriculum, digital books, workshops, and level quizzes."}
            </div>
          </Link>

          <Link
            to="/internet"
            className="panel group flex flex-col p-6 rounded-3xl transition hover:border-primary/60 hover:glow"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
              <Wifi className="h-6 w-6" />
            </div>
            <div className="font-bold text-lg">{t("navInternet")}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {isAr ? "قياس دقيق لزمن الاستجابة (Ping)، السرعة، وتدقيق أمان DNS." : "Real latency, jitter, speed, IP, and DNS over HTTPS security audit."}
            </div>
          </Link>

          <Link
            to="/community"
            className="panel group flex flex-col p-6 rounded-3xl transition hover:border-primary/60 hover:glow border-primary/30"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="font-bold text-lg">{t("navCommunity")}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {isAr ? "غرف نقاش ومحادثة تفاعلية محمية وآمنة للمستخدمين." : "Protected, secure discussion rooms and tech community exchange."}
            </div>
          </Link>
        </div>

        {/* Settings Circular Button Card on Home Page (as specifically requested) */}
        <div className="mt-6">
          <Link
            to="/settings"
            className="panel group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-border hover:border-primary/60 transition hover:glow"
          >
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-muted border border-border group-hover:border-primary group-hover:text-primary transition">
                <Settings className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t("settingsCard")}</h3>
                <p className="text-sm text-muted-foreground">{t("settingsCardDesc")}</p>
              </div>
            </div>
            <div className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-6 text-sm font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition self-start sm:self-auto">
              <span>{isAr ? "فتح الإعدادات" : "Open Settings"}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* Iraq Map Section: real province borders, rivers and lakes */}
      <section className="panel grid gap-8 p-6 md:grid-cols-2 rounded-3xl border border-border shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{t("iraqMapTitle")}</h2>
            <DemoBadge label="IRAQ MAP" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t("visitorsNote")}</p>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-background/50 p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-map-green" />
              <span className="font-bold text-map-green">{isAr ? "الأنهار (دجلة والفرات)" : "Rivers (Tigris & Euphrates)"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0 w-8 border-t border-dashed border-map-green" />
              <span className="font-bold text-map-green">{isAr ? "حدود المحافظات (18)" : "Province borders (18)"}</span>
            </div>
          </div>

          <ul className="mt-5 space-y-2.5 max-h-[260px] overflow-y-auto pe-1">
            {IRAQ_CITIES.map((r) => (
              <li key={r.en} className="flex items-center gap-3 text-xs sm:text-sm">
                <MapPin className={`h-4 w-4 shrink-0 ${r.capital ? "text-warning animate-pulse" : "text-primary"}`} />
                <span className="w-32 truncate font-medium">{isAr ? r.name : r.en}</span>
                <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(r.v / 480) * 100}%` }} />
                </div>
                <span className="w-12 text-right tabular-nums text-muted-foreground font-mono">{r.v}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[420px] rounded-2xl border border-border/80 bg-card/60 p-3 shadow-inner">
            <IraqMap isAr={isAr} />
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground px-1 border-t border-border/50 pt-2">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-map-green inline-block animate-pulse" />
                {isAr ? "خريطة جغرافية حقيقية" : "Real geographic map"}
              </span>
              <span>{isAr ? "ملتقى القرنة وشط العرب" : "Al-Qurna Confluence"}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
