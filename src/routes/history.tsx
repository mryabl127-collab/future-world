import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { History as HIcon, Link2, ImageIcon, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { useLocal, type ScanRecord } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Scan History | FUTURE WORLD" },
      { name: "description", content: "Review previous link and image inspections saved only on this device." },
      { property: "og:title", content: "Scan History | FUTURE WORLD" },
      { property: "og:description", content: "Your local scan history." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [list, setList] = useLocal<ScanRecord[]>("fw-history", []);
  const [filter, setFilter] = useState<"all" | "url" | "image">("all");
  const shown = list.filter((r) => filter === "all" || r.type === filter);
  return (
    <div>
      <PageHeader title="Scan History" subtitle="Stored only in this browser. Clearing it removes it permanently." />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(["all", "url", "image"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`h-9 rounded-lg border px-4 text-sm capitalize ${filter === f ? "border-primary bg-accent text-primary" : "border-border"}`}>{f === "url" ? "Links" : f === "image" ? "Images" : "All"}</button>
        ))}
        {list.length > 0 && (
          <button onClick={() => { if (confirm("Clear all local scan history?")) setList([]); }} className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm hover:bg-accent"><Trash2 className="h-4 w-4" />Clear history</button>
        )}
      </div>
      {shown.length === 0 ? (
        <div className="panel flex flex-col items-center p-10 text-center">
          <HIcon className="mb-3 h-8 w-8 text-primary" />
          <p className="font-semibold">{list.length ? "No scans match this filter" : "No scans yet"}</p>
          <p className="mt-1 text-sm text-muted-foreground">Inspect a link or image and it will appear here.</p>
          <Link to="/scan" className="mt-4 h-10 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Go to SCAN</Link>
        </div>
      ) : (
        <ul className="space-y-3">{shown.map((r) => (
          <li key={r.id} className="panel flex gap-3 p-4">
            {r.type === "url" ? <Link2 className="mt-1 h-4 w-4 shrink-0 text-primary" /> : <ImageIcon className="mt-1 h-4 w-4 shrink-0 text-primary" />}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span>{new Date(r.date).toLocaleString()}</span><span>·</span><span className="uppercase">{r.type === "url" ? "Link" : "Image"}</span>
                <span className={`rounded-full border px-2 text-[10px] font-bold uppercase ${r.level === "low" ? "border-success/40 text-success" : "border-warning/40 text-warning"}`}>{r.level}</span></div>
              <div className="mt-1 truncate font-mono text-sm">{r.target}</div>
              <div className="text-sm text-muted-foreground">{r.summary}</div>
            </div>
          </li>))}</ul>
      )}
    </div>
  );
}
