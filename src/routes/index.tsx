import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { Logo } from "@/components/Logo";
import { DemoBadge } from "@/components/Shell";
import { NAV } from "@/lib/nav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FUTURE WORLD — Cybersecurity Education Platform" },
      { name: "description", content: "Learn cybersecurity, inspect suspicious links, and build safer digital habits with FUTURE WORLD." },
      { property: "og:title", content: "FUTURE WORLD — Cybersecurity Education Platform" },
      { property: "og:description", content: "Lessons, safe link inspection, and an AI assistant in Arabic and English." },
    ],
  }),
  component: Index,
});

const REGIONS = [
  { name: "Baghdad", x: 128, y: 118, v: 412 },
  { name: "Basra", x: 196, y: 196, v: 188 },
  { name: "Erbil", x: 118, y: 46, v: 146 },
  { name: "Mosul", x: 92, y: 44, v: 121 },
  { name: "Najaf", x: 120, y: 160, v: 97 },
];

function Index() {
  return (
    <div className="space-y-16">
      <section className="flex flex-col items-center pt-6 text-center">
        <div className="glow mb-6 grid h-24 w-24 place-items-center rounded-3xl border border-border bg-card">
          <Logo className="h-16 w-16" />
        </div>
        <h1 className="text-4xl font-bold tracking-[0.2em] md:text-6xl">FUTURE <span className="text-primary">WORLD</span></h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Welcome. Cybersecurity is the practice of protecting people, devices, and data. Learn the fundamentals, spot warning signs in links, and build habits that keep you safe online.
        </p>
        <p className="mt-2 font-[IBM_Plex_Sans_Arabic] text-sm text-muted-foreground" dir="rtl">منصة تعليمية للأمن السيبراني باللغتين العربية والإنجليزية</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/scan" className="glow inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">Start a scan <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/academy" className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-accent">Open the Academy</Link>
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-xl font-semibold">Explore</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NAV.slice(1).map((n) => (
            <Link key={n.to} to={n.to} className="panel group flex h-full min-h-32 flex-col p-5 transition hover:border-primary/50 hover:glow">
              <n.icon className="mb-3 h-6 w-6 text-primary" />
              <div className="font-semibold">{n.label}</div>
              <div className="mt-1 text-sm text-muted-foreground">{n.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel grid gap-6 p-6 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2"><h2 className="text-xl font-semibold">Visitors & regions</h2><DemoBadge /></div>
          <p className="mt-2 text-sm text-muted-foreground">Sample figures for illustration only. No visitor analytics are collected by this site.</p>
          <ul className="mt-5 space-y-3">
            {REGIONS.map((r) => (
              <li key={r.name} className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="w-20">{r.name}</span>
                <div className="h-1.5 flex-1 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(r.v / 412) * 100}%` }} /></div>
                <span className="w-10 text-right tabular-nums text-muted-foreground">{r.v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-center">
          <svg viewBox="0 0 260 240" className="w-full max-w-[280px]" role="img" aria-label="Map of Iraq (demo data)">
            <path d="M70 20 L120 12 L150 28 L165 60 L190 90 L205 130 L225 170 L235 205 L205 215 L185 205 L150 200 L110 180 L60 150 L20 120 L30 85 L55 60 Z"
              fill="color-mix(in oklab, var(--primary) 10%, transparent)" stroke="var(--primary)" strokeWidth="1.5" />
            {REGIONS.map((r) => (
              <g key={r.name}>
                <circle cx={r.x} cy={r.y} r={3 + r.v / 80} fill="var(--primary)" opacity="0.35" />
                <circle cx={r.x} cy={r.y} r="2.5" fill="var(--primary)" />
                <text x={r.x + 7} y={r.y + 3} fontSize="9" fill="var(--muted-foreground)">{r.name}</text>
              </g>
            ))}
          </svg>
        </div>
      </section>
    </div>
  );
}
