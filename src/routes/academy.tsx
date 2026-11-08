import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { useLocal } from "@/lib/store";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "Cybersecurity Academy | FUTURE WORLD" },
      { name: "description", content: "Structured cybersecurity lessons from beginner to advanced with progress tracking." },
      { property: "og:title", content: "Cybersecurity Academy | FUTURE WORLD" },
      { property: "og:description", content: "Learn fundamentals, networking, Linux, web security, cryptography and more." },
    ],
  }),
  component: Academy,
});

type Lesson = { id: string; title: string; desc: string };
const L = (id: string, title: string, desc: string): Lesson => ({ id, title, desc });
const COURSES: { name: string; level: "Beginner" | "Intermediate" | "Advanced"; summary: string; lessons: Lesson[] }[] = [
  { name: "Cybersecurity fundamentals", level: "Beginner", summary: "The CIA triad, threats, vulnerabilities, and risk.", lessons: [L("f1", "Confidentiality, Integrity, Availability", "The three goals every security control protects."), L("f2", "Threats vs. vulnerabilities vs. risk", "How attackers, weaknesses, and impact relate."), L("f3", "Passwords and multi-factor authentication", "Why long passphrases and MFA stop most account takeovers."), L("f4", "Recognizing phishing", "Sender, urgency, links, and attachments: the four checks.")] },
  { name: "Networking basics", level: "Beginner", summary: "How data travels across the internet.", lessons: [L("n1", "IP addresses and DNS", "How names turn into addresses."), L("n2", "TCP, UDP and ports", "Connections, services, and what an open port means."), L("n3", "Wi‑Fi and router security", "WPA3, default passwords, and firmware updates.")] },
  { name: "Linux fundamentals", level: "Beginner", summary: "The command line every defender uses.", lessons: [L("l1", "Files and directories", "Navigating with ls, cd, and pwd."), L("l2", "Users and permissions", "rwx, chmod, and the principle of least privilege."), L("l3", "Logs and processes", "Finding what's running and what happened.")] },
  { name: "Web security", level: "Intermediate", summary: "Common web vulnerabilities and defenses.", lessons: [L("w1", "HTTPS and certificates", "What the padlock does — and doesn't — mean."), L("w2", "Injection and XSS", "Why untrusted input must be validated and encoded."), L("w3", "Sessions and cookies", "Secure, HttpOnly, and SameSite flags."), L("w4", "The OWASP Top 10", "The most critical application risks.")] },
  { name: "Cryptography fundamentals", level: "Intermediate", summary: "Hashing, encryption, and signatures.", lessons: [L("c1", "Symmetric vs. asymmetric encryption", "Shared keys versus key pairs."), L("c2", "Hashing and password storage", "Why salted slow hashes matter."), L("c3", "Digital signatures", "Proving authorship and integrity.")] },
  { name: "Privacy and digital safety", level: "Beginner", summary: "Protecting your personal information.", lessons: [L("p1", "Your digital footprint", "What you share and who can see it."), L("p2", "App permissions", "Granting only what an app needs."), L("p3", "Photo metadata", "Remove GPS location before posting.")] },
  { name: "Incident response", level: "Advanced", summary: "What to do when something goes wrong.", lessons: [L("i1", "Preparation", "Plans, contacts, and backups before an incident."), L("i2", "Detection and analysis", "Confirming and scoping what happened."), L("i3", "Containment, eradication, recovery", "Stopping spread and restoring safely."), L("i4", "Lessons learned", "Improving after every incident.")] },
  { name: "Ethical and defensive security", level: "Advanced", summary: "Working legally and responsibly.", lessons: [L("e1", "Laws and authorization", "Only test systems you own or have written permission for."), L("e2", "Responsible disclosure", "Reporting vulnerabilities the right way."), L("e3", "Defense in depth", "Layering controls so one failure isn't fatal.")] },
];

function Academy() {
  const [done, setDone] = useLocal<string[]>("fw-progress", []);
  const [level, setLevel] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const total = COURSES.reduce((a, c) => a + c.lessons.length, 0);
  const toggle = (id: string) => setDone(done.includes(id) ? done.filter((x) => x !== id) : [...done, id]);
  return (
    <div>
      <PageHeader title="Cybersecurity Academy" subtitle="Work through structured lessons and mark them complete. Progress is saved on this device.">
        <div className="mt-5 max-w-md"><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Overall progress</span><span>{done.length}/{total}</span></div>
          <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(done.length / total) * 100}%` }} /></div></div>
      </PageHeader>
      <div className="mb-6 flex flex-wrap gap-2">{(["All", "Beginner", "Intermediate", "Advanced"] as const).map((l) => (
        <button key={l} onClick={() => setLevel(l)} className={`h-9 rounded-lg border px-4 text-sm ${level === l ? "border-primary bg-accent text-primary" : "border-border"}`}>{l}</button>))}</div>
      <div className="grid gap-4 md:grid-cols-2">
        {COURSES.filter((c) => level === "All" || c.level === level).map((c) => {
          const n = c.lessons.filter((x) => done.includes(x.id)).length;
          return (
            <section key={c.name} className="panel p-5">
              <div className="flex items-start justify-between gap-3"><h2 className="font-semibold">{c.name}</h2><span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">{c.level}</span></div>
              <p className="mt-1 text-sm text-muted-foreground">{c.summary}</p>
              <div className="my-3 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(n / c.lessons.length) * 100}%` }} /></div>
              <ul className="space-y-1">{c.lessons.map((x) => (
                <li key={x.id}><button onClick={() => toggle(x.id)} className="flex w-full gap-3 rounded-lg p-2 text-left hover:bg-accent">
                  {done.includes(x.id) ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                  <span><span className="block text-sm font-medium">{x.title}</span><span className="block text-xs text-muted-foreground">{x.desc}</span></span></button></li>))}</ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
