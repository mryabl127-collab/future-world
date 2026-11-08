import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Info, Link2, ImageIcon, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/Shell";
import { analyzeUrl, type UrlReport } from "@/lib/url-check";
import { addScan } from "@/lib/store";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "SCAN — Link & Image Inspection | FUTURE WORLD" },
      { name: "description", content: "Check links for visible phishing signs and read image metadata locally in your browser." },
      { property: "og:title", content: "SCAN — Link & Image Inspection" },
      { property: "og:description", content: "Spot suspicious URL patterns and inspect image metadata locally." },
    ],
  }),
  component: Scan,
});

function Scan() {
  return (
    <div>
      <PageHeader title="SCAN" subtitle="Inspect links and images for visible warning signs. Everything runs in your browser — nothing is uploaded and no link is opened." />
      <Tabs defaultValue="url">
        <TabsList className="mb-6 grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="url"><Link2 className="mr-2 h-4 w-4" />Link</TabsTrigger>
          <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" />Image</TabsTrigger>
        </TabsList>
        <TabsContent value="url"><UrlScan /></TabsContent>
        <TabsContent value="image"><ImageScan /></TabsContent>
      </Tabs>
    </div>
  );
}

const levelStyle = { high: "text-warning", warn: "text-warning/80", info: "text-primary" };

function UrlScan() {
  const [v, setV] = useState("");
  const [r, setR] = useState<UrlReport | null>(null);
  const run = (e: React.FormEvent) => {
    e.preventDefault();
    const res = analyzeUrl(v);
    setR(res);
    if (res.valid) addScan({ type: "url", target: res.url.href.slice(0, 200), level: res.risk, summary: res.findings.length ? `${res.findings.length} warning sign(s): ${res.findings.map((f) => f.title).slice(0, 2).join(", ")}` : "No obvious warning signs" });
  };
  return (
    <div className="space-y-5">
      <form onSubmit={run} className="panel flex flex-col gap-3 p-4 sm:flex-row">
        <input value={v} onChange={(e) => setV(e.target.value)} maxLength={2048} placeholder="https://example.com/login" inputMode="url" autoCapitalize="none" autoCorrect="off"
          className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-base outline-none focus:border-primary" />
        <button className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground">Inspect link</button>
      </form>
      {r && !r.valid && <div className="panel flex items-center gap-2 p-4 text-warning"><AlertTriangle className="h-4 w-4" />{r.error}</div>}
      {r?.valid && (
        <div className="panel space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0"><div className="text-xs text-muted-foreground">Domain</div><div className="break-all font-mono text-sm">{r.url.hostname}</div></div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${r.risk === "low" ? "border-success/40 text-success" : "border-warning/40 text-warning"}`}>{r.risk} concern</span>
          </div>
          {r.findings.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-success"><CheckCircle2 className="h-4 w-4" />No obvious warning signs in the address itself.</p>
          ) : (
            <ul className="space-y-3">{r.findings.map((f) => (
              <li key={f.title} className="flex gap-3 rounded-lg border border-border p-3">
                {f.level === "info" ? <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${levelStyle[f.level]}`} />}
                <div><div className="text-sm font-semibold">{f.title}</div><div className="text-sm text-muted-foreground">{f.detail}</div></div>
              </li>))}</ul>
          )}
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">This checks only the text of the link. It cannot detect malware or guarantee a website is safe. When unsure, type the official address yourself.</p>
        </div>
      )}
    </div>
  );
}

type Meta = { name: string; type: string; size: string; dims?: string | undefined; modified: string; exif: [string, string][] };

function ImageScan() {
  const [m, setM] = useState<Meta | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const onFile = async (file?: File) => {
    setErr(""); setM(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErr("Please choose an image file.");
    if (file.size > 25 * 1024 * 1024) return setErr("Image is larger than 25 MB.");
    setLoading(true);
    try {
      const dims = await new Promise<string | undefined>((res) => {
        const img = new Image(); const u = URL.createObjectURL(file);
        img.onload = () => { res(`${img.naturalWidth} × ${img.naturalHeight}px`); URL.revokeObjectURL(u); };
        img.onerror = () => { res(undefined); URL.revokeObjectURL(u); };
        img.src = u;
      });
      let exif: [string, string][] = [];
      try {
        const exifr = await import("exifr");
        const data = await exifr.parse(file, { gps: true });
        if (data) exif = Object.entries(data).filter(([, v]) => v != null && typeof v !== "object" || v instanceof Date).slice(0, 30).map(([k, v]) => [k, v instanceof Date ? v.toLocaleString() : String(v).slice(0, 80)]);
      } catch { /* no metadata */ }
      const meta: Meta = { name: file.name, type: file.type, size: `${(file.size / 1024).toFixed(1)} KB`, dims, modified: new Date(file.lastModified).toLocaleString(), exif };
      setM(meta);
      const gps = exif.some(([k]) => /latitude|longitude/i.test(k));
      addScan({ type: "image", target: file.name.slice(0, 120), level: gps ? "medium" : "low", summary: gps ? "Contains GPS location metadata" : `${exif.length} metadata field(s) found` });
    } catch { setErr("Could not read this image."); } finally { setLoading(false); }
  };
  const gps = m?.exif.some(([k]) => /latitude|longitude/i.test(k));
  return (
    <div className="space-y-5">
      <label className="panel flex cursor-pointer flex-col items-center gap-2 border-dashed p-8 text-center hover:border-primary/50">
        <ImageIcon className="h-8 w-8 text-primary" />
        <span className="font-semibold">Choose an image</span>
        <span className="text-xs text-muted-foreground">Read locally on your device · never uploaded</span>
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Reading metadata…</div>}
      {err && <div className="panel flex items-center gap-2 p-4 text-warning"><AlertTriangle className="h-4 w-4" />{err}</div>}
      {m && (
        <div className="panel space-y-4 p-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[["File name", m.name], ["Type", m.type], ["Size", m.size], ["Dimensions", m.dims ?? "Unknown"], ["Last modified", m.modified]].map(([k, v]) => (
              <div key={k} className="min-w-0"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="break-all">{v}</dd></div>))}
          </dl>
          {gps && <p className="flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning"><AlertTriangle className="h-4 w-4 shrink-0" />This photo contains GPS location. Remove location data before sharing it publicly.</p>}
          <div>
            <div className="mb-2 text-sm font-semibold">Embedded metadata (EXIF)</div>
            {m.exif.length === 0 ? <p className="text-sm text-muted-foreground">No embedded metadata found.</p> : (
              <div className="max-h-72 overflow-auto rounded-lg border border-border">{m.exif.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border px-3 py-2 text-xs last:border-0"><span className="text-muted-foreground">{k}</span><span className="break-all text-right">{v}</span></div>))}</div>
            )}
          </div>
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">This is a metadata inspection, not a malware scan.</p>
        </div>
      )}
    </div>
  );
}
