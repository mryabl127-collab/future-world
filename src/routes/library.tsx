import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, ExternalLink, FileDown, PlayCircle, Search, X } from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { BOOKS, CATEGORIES, VIDEOS, type Resource } from "@/lib/library-data";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Cybersecurity Library — Videos & Books | FUTURE WORLD" },
      { name: "description", content: "Curated educational videos and open-access books and PDFs from universities, governments, and official sources." },
      { property: "og:title", content: "Cybersecurity Library | FUTURE WORLD" },
      { property: "og:description", content: "Legal, open educational videos and books on cybersecurity." },
    ],
  }),
  component: LibraryPage,
});

const sel = "h-10 min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary";

function LibraryPage() {
  const [tab, setTab] = useState<"videos" | "books">("videos");
  const [q, setQ] = useState(""); const [cat, setCat] = useState("all"); const [lvl, setLvl] = useState("all"); const [lang, setLang] = useState("all");
  const data = tab === "videos" ? VIDEOS : BOOKS;
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.filter((r) => (cat === "all" || r.category === cat) && (lvl === "all" || r.level === lvl) && (lang === "all" || r.lang === lang) && (!s || `${r.title} ${r.by} ${r.desc} ${r.category}`.toLowerCase().includes(s)));
  }, [data, q, cat, lvl, lang]);
  const reset = () => { setQ(""); setCat("all"); setLvl("all"); setLang("all"); };
  return (
    <div>
      <PageHeader title="Cybersecurity Library" subtitle="Hand-picked resources from universities, governments, and official educational organizations. Links open the official source." />
      <div className="mb-6 grid grid-cols-2 gap-3">
        {([["videos", "Educational Videos", PlayCircle, VIDEOS.length], ["books", "Books & PDF Resources", BookOpen, BOOKS.length]] as const).map(([k, l, I, n]) => (
          <button key={k} onClick={() => setTab(k)} className={`panel flex flex-col items-start gap-1 p-4 text-left transition ${tab === k ? "glow border-primary/60" : ""}`}>
            <I className="h-6 w-6 text-primary" /><span className="text-sm font-semibold sm:text-base">{l}</span><span className="text-xs text-muted-foreground">{n} resources</span>
          </button>
        ))}
      </div>
      <div className="panel mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative sm:col-span-2 lg:col-span-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value.slice(0, 100))} placeholder="Search…" aria-label="Search library" className={`${sel} w-full pl-9 text-base`} /></label>
        <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)} className={sel}><option value="all">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <select aria-label="Level" value={lvl} onChange={(e) => setLvl(e.target.value)} className={sel}><option value="all">All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
        <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value)} className={sel}><option value="all">All languages</option><option>English</option><option>Arabic</option></select>
      </div>
      {list.length === 0 ? (
        <div className="panel flex flex-col items-center p-10 text-center"><Search className="mb-3 h-8 w-8 text-primary" /><p className="font-semibold">No resources match your filters</p>
          <button onClick={reset} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm hover:bg-accent"><X className="h-4 w-4" />Clear filters</button></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((r) => <Card key={r.title} r={r} video={tab === "videos"} />)}</div>
      )}
    </div>
  );
}

function Card({ r, video }: { r: Resource; video: boolean }) {
  return (
    <article className="panel flex flex-col p-5">
      <div className="mb-3 flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-wide">
        <span className="rounded-full bg-accent px-2 py-0.5 text-primary">{r.category}</span>
        <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">{r.level}</span>
        <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">{r.lang}</span>
      </div>
      <h3 className="font-semibold leading-snug">{r.title}</h3>
      <p className="mt-1 text-xs text-primary/80">{r.by}{r.duration ? ` · ${r.duration}` : ""}</p>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.desc}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground">{video ? <PlayCircle className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}{video ? "Watch" : "Official source"}</a>
        {r.pdf && <a href={r.pdf} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-accent"><FileDown className="h-3.5 w-3.5" />PDF</a>}
      </div>
    </article>
  );
}
