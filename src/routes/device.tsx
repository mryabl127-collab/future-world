import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, Info } from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { useLocal } from "@/lib/store";

export const Route = createFileRoute("/device")({
  head: () => ({
    meta: [
      { title: "Device Scan & Cleaner — Safety Checklist | FUTURE WORLD" },
      { name: "description", content: "A safe, permission-free checklist to secure your phone and browser." },
      { property: "og:title", content: "Device Safety Checklist | FUTURE WORLD" },
      { property: "og:description", content: "Browser, update, storage and privacy recommendations." },
    ],
  }),
  component: Device,
});

const GROUPS: { name: string; items: [string, string][] }[] = [
  { name: "Browser safety", items: [["b1", "Update your browser to the latest version"], ["b2", "Remove extensions you don't recognize"], ["b3", "Turn on Safe Browsing / Fraudulent Website Warning"], ["b4", "Clear saved data for sites you no longer use"]] },
  { name: "Updates", items: [["u1", "Install the latest iOS / Android system update"], ["u2", "Enable automatic app updates"], ["u3", "Delete apps that no longer receive updates"]] },
  { name: "Storage & cleanup", items: [["s1", "Delete unused apps and large old downloads"], ["s2", "Back up photos and documents"], ["s3", "Review files shared with others"]] },
  { name: "Privacy", items: [["p1", "Review location, camera, and microphone permissions"], ["p2", "Use a screen lock with a strong PIN or biometrics"], ["p3", "Enable Find My iPhone / Find My Device"], ["p4", "Turn on two-factor authentication for your account"]] },
];

function Device() {
  const [done, setDone] = useLocal<string[]>("fw-device", []);
  const total = GROUPS.reduce((a, g) => a + g.items.length, 0);
  return (
    <div className="max-w-3xl">
      <PageHeader title="Device Scan & Cleaner" subtitle="A guided checklist to secure and tidy your device." />
      <div className="panel mb-6 flex gap-3 p-4 text-sm"><Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">A website cannot deeply scan, clean, or remove malware from an iPhone or Android device, and we don't request device permissions. Follow these steps in your device's own Settings.</p></div>
      <div className="mb-6"><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Checklist progress</span><span>{done.length}/{total}</span></div>
        <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(done.length / total) * 100}%` }} /></div></div>
      <div className="grid gap-4 sm:grid-cols-2">{GROUPS.map((g) => (
        <section key={g.name} className="panel p-5"><h2 className="mb-3 font-semibold">{g.name}</h2>
          <ul className="space-y-1">{g.items.map(([id, t]) => (
            <li key={id}><button onClick={() => setDone(done.includes(id) ? done.filter((x) => x !== id) : [...done, id])} className="flex w-full gap-3 rounded-lg p-2 text-left text-sm hover:bg-accent">
              {done.includes(id) ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}{t}</button></li>))}</ul>
        </section>))}</div>
      {done.length > 0 && <button onClick={() => setDone([])} className="mt-6 h-10 rounded-lg border border-border px-4 text-sm hover:bg-accent">Reset checklist</button>}
    </div>
  );
}
