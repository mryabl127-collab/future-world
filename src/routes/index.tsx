import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, ScanSearch, Bot, GraduationCap, ShieldCheck, Wifi, MessageSquare, Settings, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { DemoBadge } from "@/components/Shell";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FUTURE WORLD — منصة عالم المستقبل للأمن السيبراني والذكاء الاصطناعي" },
      { name: "description", content: "فحص الروابط المشبوهة، مساعد ذكي شامل، أكاديمية ومكتبة الأمن الرقمي، وتنظيف وفحص أمان الأجهزة." },
      { property: "og:title", content: "FUTURE WORLD — منصة عالم المستقبل" },
      { property: "og:description", content: "منظومة متكاملة للأمن السيبراني والذكاء الاصطناعي مع خريطة العراق التفاعلية." },
    ],
  }),
  component: Index,
});

const IRAQ_CITIES = [
  { name: "بغداد (Baghdad)", en: "Baghdad", x: 235, y: 195, v: 480, capital: true },
  { name: "البصرة (Basra)", en: "Basra", x: 330, y: 310, v: 240 },
  { name: "أربيل (Erbil)", en: "Erbil", x: 215, y: 92, v: 195 },
  { name: "الموصل (Mosul)", en: "Mosul", x: 175, y: 90, v: 170 },
  { name: "النجف الأشرف (Najaf)", en: "Najaf", x: 210, y: 245, v: 145 },
  { name: "كربلاء المقدسة (Karbala)", en: "Karbala", x: 212, y: 220, v: 138 },
  { name: "السليمانية (Sulaymaniyah)", en: "Sulaymaniyah", x: 260, y: 110, v: 130 },
  { name: "كركوك (Kirkuk)", en: "Kirkuk", x: 225, y: 130, v: 118 },
  { name: "الناصرية (Nasiriyah)", en: "Nasiriyah", x: 285, y: 285, v: 110 },
  { name: "الرمادي (Ramadi)", en: "Ramadi", x: 180, y: 185, v: 105 },
];

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

      {/* Iraq Map Section with Tigris (Blue) and Euphrates (Red) */}
      <section className="panel grid gap-8 p-6 md:grid-cols-2 rounded-3xl border border-border shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{t("iraqMapTitle")}</h2>
            <DemoBadge label="IRAQ MAP" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t("visitorsNote")}</p>

          {/* River Legend */}
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-background/50 p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-8 rounded-full bg-sky-400 shadow-sm" />
              <span className="font-bold text-sky-400">{t("tigrisRiver")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-8 rounded-full bg-red-500 shadow-sm" />
              <span className="font-bold text-red-500">{t("euphratesRiver")}</span>
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

        {/* Detailed SVG Map of Iraq with Rivers */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[360px] rounded-2xl border border-border/80 bg-card/60 p-4 shadow-inner">
            <svg
              viewBox="0 0 420 400"
              className="w-full h-auto drop-shadow-md"
              role="img"
              aria-label="خريطة جمهورية العراق مع نهري دجلة والفرات"
            >
              <defs>
                <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Iraq Border Polygon Outline */}
              <path
                d="M 120 45 
                   L 155 35 
                   L 185 28 
                   L 220 38 
                   L 255 52 
                   L 285 75 
                   L 305 110 
                   L 290 145 
                   L 315 185 
                   L 340 230 
                   L 365 275 
                   L 380 320 
                   L 365 350 
                   L 335 345 
                   L 300 330 
                   L 260 305 
                   L 220 280 
                   L 160 250 
                   L 90 220 
                   L 50 185 
                   L 30 140 
                   L 45 110 
                   L 75 80 
                   L 100 55 Z"
                fill="color-mix(in oklab, var(--primary) 12%, transparent)"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinejoin="round"
                className="transition-colors"
              />

              {/* Internal Subtle Topography Curves */}
              <path
                d="M 80 90 Q 150 120 220 100"
                fill="none"
                stroke="var(--border)"
                strokeWidth="0.8"
                strokeDasharray="2 3"
              />
              <path
                d="M 70 170 Q 140 200 240 180"
                fill="none"
                stroke="var(--border)"
                strokeWidth="0.8"
                strokeDasharray="2 3"
              />

              {/* Tigris River (نهر دجلة) - Blue River Path */}
              <path
                d="M 145 35 
                   Q 160 65 175 90 
                   T 200 135 
                   T 220 165 
                   T 235 195 
                   T 265 235 
                   T 295 270 
                   T 315 295"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow-blue)"
              />

              {/* Euphrates River (نهر الفرات) - Red River Path */}
              <path
                d="M 60 115 
                   Q 95 130 130 150 
                   T 180 185 
                   T 205 215 
                   T 225 240 
                   T 255 265 
                   T 285 285 
                   T 315 295"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow-red)"
              />

              {/* Shatt al-Arab Confluence (شط العرب) to Basra and Gulf */}
              <path
                d="M 315 295 
                   Q 330 310 345 330 
                   L 355 348"
                fill="none"
                stroke="#0284c7"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* River Labels directly on the map */}
              <g className="font-bold text-[10px] select-none pointer-events-none">
                <text x="145" y="70" fill="#38bdf8" transform="rotate(35 145 70)">نهر دجلة</text>
                <text x="80" y="145" fill="#ef4444" transform="rotate(22 80 145)">نهر الفرات</text>
                <text x="325" y="338" fill="#38bdf8" fontSize="8">شط العرب</text>
              </g>

              {/* City Dots and Markers */}
              {IRAQ_CITIES.map((c) => (
                <g key={c.en} className="transition-transform hover:scale-125 cursor-pointer">
                  {c.capital ? (
                    <>
                      <circle cx={c.x} cy={c.y} r="8" fill="#eab308" opacity="0.25" className="animate-ping" />
                      <circle cx={c.x} cy={c.y} r="4.5" fill="#eab308" stroke="#000" strokeWidth="1" />
                      <text x={c.x + 8} y={c.y + 4} fontSize="11" fontWeight="bold" fill="#eab308">
                        {isAr ? "بغداد ★" : "Baghdad ★"}
                      </text>
                    </>
                  ) : (
                    <>
                      <circle cx={c.x} cy={c.y} r="2.8" fill="var(--primary)" />
                      <text x={c.x + 6} y={c.y + 3} fontSize="8.5" fill="var(--foreground)" opacity="0.9">
                        {isAr ? c.name.split(" ")[0] : c.en}
                      </text>
                    </>
                  )}
                </g>
              ))}
            </svg>

            {/* Map bottom indicators */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground px-1 border-t border-border/50 pt-2">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                {isAr ? "خريطة جغرافية حية" : "Live Regional Nodes"}
              </span>
              <span>{isAr ? "ملتقى القرنة وشط العرب" : "Al-Qurna Confluence"}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
