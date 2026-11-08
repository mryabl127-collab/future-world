import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Plus, Send, Trash2, AlertTriangle, MessageSquare, Square } from "lucide-react";
import { useLocal } from "@/lib/store";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant | FUTURE WORLD" },
      { name: "description", content: "Chat with a real AI assistant in Arabic or English about cybersecurity and any other topic." },
      { property: "og:title", content: "AI Assistant | FUTURE WORLD" },
      { property: "og:description", content: "Bilingual AI assistant for cybersecurity learning and general questions." },
    ],
  }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };
type Conv = { id: string; title: string; updatedAt: number; messages: Msg[] };

const SUGGEST = ["What is phishing and how do I spot it?", "ما هي المصادقة الثنائية ولماذا هي مهمة؟", "Explain how HTTPS works simply", "اقترح خطة لتعلم الشبكات للمبتدئين"];

function Assistant() {
  const [convs, setConvs] = useLocal<Conv[]>("fw-chats", []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showList, setShowList] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const active = convs.find((c) => c.id === activeId) ?? null;
  const messages = active?.messages ?? [];

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages.length, messages.at(-1)?.content]);
  useEffect(() => { taRef.current?.focus(); }, [activeId, busy]);

  const save = (list: Conv[]) => setConvs(list.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 50));

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    const id = active?.id ?? crypto.randomUUID();
    const history: Msg[] = [...messages.filter((m) => !m.error), { role: "user", content: t }];
    let list = convs.filter((c) => c.id !== id);
    const base: Conv = { id, title: active?.title ?? t.slice(0, 50), updatedAt: Date.now(), messages: [...history, { role: "assistant", content: "" }] };
    save([base, ...list]); setActiveId(id); setInput(""); setBusy(true);
    const ctrl = new AbortController(); abortRef.current = ctrl;
    let acc = "";
    const update = (m: Msg) => { list = list.filter((c) => c.id !== id); save([{ ...base, updatedAt: Date.now(), messages: [...history, m] }, ...list]); };
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }), signal: ctrl.signal });
      if (!res.ok || !res.body) {
        const e = await res.json().catch(() => ({ error: "The AI service is unavailable." }));
        throw new Error(e.error);
      }
      const reader = res.body.getReader(); const dec = new TextDecoder();
      for (;;) { const { done, value } = await reader.read(); if (done) break; acc += dec.decode(value, { stream: true }); update({ role: "assistant", content: acc }); }
      if (!acc.trim()) update({ role: "assistant", content: "No response was returned. Please try again.", error: true });
    } catch (e) {
      if ((e as Error).name === "AbortError") update({ role: "assistant", content: acc || "Stopped.", error: !acc });
      else update({ role: "assistant", content: (e as Error).message || "Network error — please check your connection.", error: true });
    } finally { setBusy(false); abortRef.current = null; }
  }

  return (
    <div className="flex h-[calc(100dvh-10rem)] min-h-[480px] gap-4">
      <aside className={`${showList ? "fixed inset-x-4 top-20 z-30 max-h-[70vh]" : "hidden"} panel w-auto flex-col overflow-hidden p-3 md:static md:flex md:w-64 md:max-h-none`}>
        <button onClick={() => { setActiveId(null); setShowList(false); }} className="mb-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" />New conversation</button>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {convs.length === 0 && <p className="p-2 text-xs text-muted-foreground">No saved conversations yet. They are stored only in this browser.</p>}
          {convs.map((c) => (
            <div key={c.id} className={`group flex items-center rounded-lg ${c.id === activeId ? "bg-accent" : "hover:bg-accent/60"}`}>
              <button onClick={() => { setActiveId(c.id); setShowList(false); }} className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-sm"><MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary" /><span className="truncate" dir="auto">{c.title}</span></button>
              <button aria-label="Delete conversation" onClick={() => { save(convs.filter((x) => x.id !== c.id)); if (activeId === c.id) setActiveId(null); }} className="p-2 text-muted-foreground hover:text-foreground"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </aside>

      <section className="panel flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-border text-primary"><Bot className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1"><div className="text-sm font-semibold">FUTURE WORLD Assistant</div><div className="text-xs text-muted-foreground">Real AI · العربية / English</div></div>
          <button onClick={() => setShowList((s) => !s)} className="h-9 rounded-lg border border-border px-3 text-xs md:hidden">Chats</button>
          <button onClick={() => setActiveId(null)} aria-label="New conversation" className="grid h-9 w-9 place-items-center rounded-lg border border-border md:hidden"><Plus className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Bot className="mb-3 h-10 w-10 text-primary" />
              <p className="font-semibold">Ask anything — اسأل أي شيء</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Answers are AI-generated and may contain mistakes. Don't share passwords or private data.</p>
              <div className="mt-5 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {SUGGEST.map((s) => <button key={s} dir="auto" onClick={() => send(s)} className="rounded-lg border border-border p-3 text-left text-sm hover:border-primary/50">{s}</button>)}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div dir="auto" className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : m.error ? "flex gap-2 border border-warning/40 text-warning" : "text-foreground"}`}>
                {m.error && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
                {m.content || (busy && i === messages.length - 1 ? <span className="inline-flex gap-1" aria-label="Thinking"><span className="h-2 w-2 animate-bounce rounded-full bg-primary" /><span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" /></span> : null)}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 border-t border-border p-3">
          <textarea ref={taRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={4000} rows={1} dir="auto" placeholder="Type a message… اكتب رسالتك"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(input); } }}
            className="max-h-40 min-h-11 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-base outline-none focus:border-primary" />
          {busy ? (
            <button type="button" onClick={() => abortRef.current?.abort()} aria-label="Stop" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border"><Square className="h-4 w-4" /></button>
          ) : (
            <button type="submit" aria-label="Send" disabled={!input.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"><Send className="h-4 w-4" /></button>
          )}
        </form>
      </section>
    </div>
  );
}
