import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, Info, ShieldAlert } from "lucide-react";
import { DemoBadge, PageHeader } from "@/components/Shell";
import { useLocal } from "@/lib/store";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts | FUTURE WORLD" },
      { name: "description", content: "Educational security alerts and sample notifications." },
      { property: "og:title", content: "Alerts | FUTURE WORLD" },
      { property: "og:description", content: "Learn from sample security notifications." },
    ],
  }),
  component: Alerts,
});

const ALERTS = [
  { id: "a1", kind: "tip", title: "Enable two-factor authentication", body: "Turn on 2FA for email, banking, and social accounts. It blocks most password-based takeovers." },
  { id: "a2", kind: "sample", title: "Sample: Fake delivery SMS", body: "Example of a common scam: “Your parcel is held, pay a fee at this link.” Couriers rarely ask for payment by SMS link." },
  { id: "a3", kind: "tip", title: "Update your phone this week", body: "System updates fix security holes. Check Settings → Software Update." },
  { id: "a4", kind: "sample", title: "Sample: Suspicious login notice", body: "Simulated alert showing what a new-device sign-in warning looks like. If it wasn't you, change your password from the official app." },
  { id: "a5", kind: "tip", title: "Back up important files", body: "Keep at least one backup offline or in a separate account to recover from loss or ransomware." },
];

function Alerts() {
  const [read, setRead] = useLocal<string[]>("fw-alerts-read", []);
  const unread = ALERTS.filter((a) => !read.includes(a.id)).length;
  return (
    <div>
      <PageHeader title="Alerts" subtitle="Educational notifications. These are not real-time threat intelligence.">
        <div className="mt-4 flex items-center gap-3"><span className="text-sm text-muted-foreground">{unread} unread</span>
          <button onClick={() => setRead(ALERTS.map((a) => a.id))} disabled={!unread} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:bg-accent disabled:opacity-40"><CheckCheck className="h-4 w-4" />Mark all read</button></div>
      </PageHeader>
      <ul className="space-y-3">{ALERTS.map((a) => {
        const isRead = read.includes(a.id);
        return (
          <li key={a.id}><button onClick={() => setRead(isRead ? read.filter((x) => x !== a.id) : [...read, a.id])} className={`panel flex w-full gap-4 p-4 text-left ${isRead ? "opacity-60" : ""}`}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border text-primary">{a.kind === "sample" ? <ShieldAlert className="h-5 w-5" /> : <Info className="h-5 w-5" />}</div>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{a.title}</span>{a.kind === "sample" ? <DemoBadge label="SAMPLE" /> : <span className="text-[10px] font-bold tracking-wider text-primary">TIP</span>}{!isRead && <span className="h-2 w-2 rounded-full bg-primary" />}</div>
              <p className="mt-1 text-sm text-muted-foreground">{a.body}</p></div>
          </button></li>);
      })}</ul>
      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><Bell className="h-3.5 w-3.5" />Tap an alert to toggle read status.</p>
    </div>
  );
}
