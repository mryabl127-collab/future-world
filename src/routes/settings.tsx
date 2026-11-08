import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { useLocal } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Profile | FUTURE WORLD" },
      { name: "description", content: "Language, theme, and local profile preferences with clear privacy information." },
      { property: "og:title", content: "Settings & Profile | FUTURE WORLD" },
      { property: "og:description", content: "Manage your local preferences." },
    ],
  }),
  component: SettingsPage,
});

type Prefs = { name: string; lang: "en" | "ar"; accent: "electric" | "ice" | "deep"; level: string };
const ACCENTS = { electric: "oklch(0.7 0.18 245)", ice: "oklch(0.8 0.12 220)", deep: "oklch(0.6 0.2 260)" };

function SettingsPage() {
  const [prefs, setPrefs] = useLocal<Prefs>("fw-prefs", { name: "", lang: "en", accent: "electric", level: "Beginner" });
  const [draft, setDraft] = useState(prefs);
  useEffect(() => setDraft(prefs), [prefs]);
  const save = () => {
    const name = draft.name.replace(/[<>]/g, "").trim().slice(0, 40);
    setPrefs({ ...draft, name });
    toast.success("Preferences saved on this device");
  };
  const f = "h-11 w-full rounded-lg border border-input bg-background px-3 text-base outline-none focus:border-primary";
  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings & Profile" subtitle="Everything here stays in your browser. No account required." />
      <div className="panel space-y-5 p-5">
        <label className="block"><span className="mb-1 block text-sm font-medium">Display name (optional)</span><input className={f} maxLength={40} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Ali" /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">Language preference</span>
          <select className={f} value={draft.lang} onChange={(e) => setDraft({ ...draft, lang: e.target.value as Prefs["lang"] })}><option value="en">English</option><option value="ar">العربية</option></select>
          <span className="mt-1 block text-xs text-muted-foreground">The AI Assistant always replies in the language you write in.</span></label>
        <div><span className="mb-2 block text-sm font-medium">Accent theme</span>
          <div className="grid grid-cols-3 gap-2">{(Object.keys(ACCENTS) as Prefs["accent"][]).map((k) => (
            <button key={k} onClick={() => setDraft({ ...draft, accent: k })} className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm capitalize ${draft.accent === k ? "border-primary bg-accent" : "border-border"}`}><span className="h-3 w-3 rounded-full" style={{ background: ACCENTS[k] }} />{k}</button>))}</div></div>
        <label className="block"><span className="mb-1 block text-sm font-medium">Learning level</span>
          <select className={f} value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
        <button onClick={save} className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground sm:w-auto sm:px-8">Save preferences</button>
      </div>
      <div className="panel mt-6 p-5">
        <h2 className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4 text-primary" />Privacy</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>We never ask for passwords or sensitive personal data.</li>
          <li>Scan history, progress, chats, and preferences are stored only in this browser.</li>
          <li>Links and images you inspect are analyzed locally and are not uploaded.</li>
          <li>AI Assistant messages are sent securely to the AI service only to generate replies.</li>
        </ul>
        <button onClick={() => { ["fw-history", "fw-progress", "fw-chats", "fw-prefs", "fw-alerts-read"].forEach((k) => localStorage.removeItem(k)); window.dispatchEvent(new Event("fw-store")); toast.success("All local data cleared"); }}
          className="mt-4 h-10 rounded-lg border border-border px-4 text-sm hover:bg-accent">Clear all local data</button>
      </div>
    </div>
  );
}
