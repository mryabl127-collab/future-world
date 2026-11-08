import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Plus, Send, Trash2, AlertTriangle, MessageSquare, Square, Copy, Check, Sparkles } from "lucide-react";
import { useLocal } from "@/lib/store";
import { streamChatCompletion, type ChatMessage } from "@/lib/ai-service";
import { toast } from "sonner";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant | FUTURE WORLD" },
      { name: "description", content: "Chat with a real AI assistant in Arabic or English about cybersecurity and technology." },
      { property: "og:title", content: "AI Assistant | FUTURE WORLD" },
      { property: "og:description", content: "Bilingual AI assistant for cybersecurity learning and general questions." },
    ],
  }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };
type Conv = { id: string; title: string; updatedAt: number; messages: Msg[] };

const SUGGESTIONS = [
  { ar: "ما هو التصيد الاحتيالي وكيف أكتشفه؟", en: "What is phishing and how do I spot it?" },
  { ar: "كيف أحمي هاتفي عند الاتصال بشبكة واي فاي عامة؟", en: "How to protect my phone on public Wi-Fi?" },
  { ar: "ما هي أهمية المصادقة الثنائية (2FA)؟", en: "Why is Two-Factor Authentication important?" },
  { ar: "كيف أنشئ كلمة مرور قوية وسهلة التذكر؟", en: "How do I create a strong memorable password?" },
  { ar: "اشرح لي ما هو جدار الحماية (Firewall) ببساطة", en: "Explain how firewalls work simply" },
  { ar: "اقترح خطة لتعلم الأمن السيبراني للمبتدئين", en: "Suggest a roadmap for cybersecurity beginners" },
];

function Assistant() {
  const [convs, setConvs] = useLocal<Conv[]>("fw-chats", []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showList, setShowList] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const active = convs.find((c) => c.id === activeId) ?? null;
  const messages = active?.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, messages.at(-1)?.content]);

  useEffect(() => {
    taRef.current?.focus();
  }, [activeId, busy]);

  const save = (list: Conv[]) => setConvs(list.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 50));

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("تم نسخ النص / Copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;

    const id = active?.id ?? crypto.randomUUID();
    const history: Msg[] = [...messages.filter((m) => !m.error), { role: "user", content: t }];
    let list = convs.filter((c) => c.id !== id);
    const base: Conv = {
      id,
      title: active?.title ?? (t.length > 40 ? t.slice(0, 40) + "…" : t),
      updatedAt: Date.now(),
      messages: [...history, { role: "assistant", content: "" }],
    };

    save([base, ...list]);
    setActiveId(id);
    setInput("");
    setBusy(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let acc = "";

    const update = (m: Msg) => {
      list = list.filter((c) => c.id !== id);
      save([{ ...base, updatedAt: Date.now(), messages: [...history, m] }, ...list]);
    };

    try {
      const chatMessages: ChatMessage[] = history.map(({ role, content }) => ({ role, content }));
      await streamChatCompletion({
        messages: chatMessages,
        signal: ctrl.signal,
        onDelta: (chunk) => {
          acc += chunk;
          update({ role: "assistant", content: acc });
        },
      });

      if (!acc.trim()) {
        update({
          role: "assistant",
          content: "لم يتم استلام إجابة. يرجى التأكد من اتصال الإنترنت وإعادة المحاولة.\nNo response received. Please check connection and try again.",
          error: true,
        });
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        update({ role: "assistant", content: acc || "تم الإيقاف · Stopped", error: !acc });
      } else {
        update({
          role: "assistant",
          content: acc || ((e as Error).message || "حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت."),
          error: !acc,
        });
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  return (
    <div className="flex h-[calc(100dvh-9.5rem)] min-h-[500px] gap-4">
      {/* Sidebar for Conversations */}
      <aside
        className={`${
          showList ? "fixed inset-x-4 top-20 z-30 max-h-[75vh]" : "hidden"
        } panel w-auto flex-col overflow-hidden p-3 md:static md:flex md:w-64 md:max-h-none`}
      >
        <button
          onClick={() => {
            setActiveId(null);
            setShowList(false);
          }}
          className="mb-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          محادثة جديدة · New chat
        </button>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {convs.length === 0 && (
            <p className="p-3 text-center text-xs text-muted-foreground">
              لا توجد محادثات سابقة. تُحفظ المحادثات محلياً على جهازك.
            </p>
          )}
          {convs.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center rounded-lg transition ${
                c.id === activeId ? "bg-accent border border-primary/20" : "hover:bg-accent/60"
              }`}
            >
              <button
                onClick={() => {
                  setActiveId(c.id);
                  setShowList(false);
                }}
                className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-sm"
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate font-medium" dir="auto">
                  {c.title}
                </span>
              </button>
              <button
                aria-label="Delete conversation"
                onClick={() => {
                  save(convs.filter((x) => x.id !== c.id));
                  if (activeId === c.id) setActiveId(null);
                }}
                className="p-2 text-muted-foreground opacity-60 hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="panel flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border bg-card/40 px-4 py-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 border border-primary/30 text-primary shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">FUTURE WORLD AI</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success border border-success/30">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                نشط · Active
              </span>
            </div>
            <div className="text-xs text-muted-foreground">مساعد ذكي للأمن السيبراني والتقنية · Arabic & English</div>
          </div>
          <button
            onClick={() => setShowList((s) => !s)}
            className="h-9 rounded-lg border border-border px-3 text-xs md:hidden"
          >
            المحادثات
          </button>
          <button
            onClick={() => setActiveId(null)}
            aria-label="New conversation"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border md:hidden"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center p-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 border border-primary/30 text-primary mb-3">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>
              <h2 className="text-lg font-bold">اسأل أي شيء في الأمن والتقنية</h2>
              <p className="mt-1 text-sm text-muted-foreground">Ask anything about cybersecurity & technology</p>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                إجابات ذكية وفورية تدعم اللغتين العربية والإنجليزية، وتعمل بالذكاء الاصطناعي السحابي والمعرفة المدمجة.
              </p>
              <div className="mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    dir="auto"
                    onClick={() => send(s.ar)}
                    className="flex flex-col text-right rounded-xl border border-border bg-card/60 p-3 text-sm transition hover:border-primary/60 hover:bg-accent/40"
                  >
                    <span className="font-medium text-foreground">{s.ar}</span>
                    <span className="mt-0.5 text-xs text-muted-foreground">{s.en}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`relative max-w-[88%] group ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  dir="auto"
                  className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground font-medium rounded-br-xs"
                      : m.error
                      ? "flex gap-2 border border-warning/40 bg-warning/10 text-warning rounded-bl-xs"
                      : "bg-accent/70 border border-border/80 text-foreground rounded-bl-xs"
                  }`}
                >
                  {m.error && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
                  {m.content || (busy && i === messages.length - 1 ? (
                    <span className="inline-flex items-center gap-1.5 py-1" aria-label="Thinking">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                    </span>
                  ) : null)}
                </div>

                {/* Assistant message action bar */}
                {m.role === "assistant" && m.content && !m.error && (
                  <div className="mt-1 flex items-center gap-1 px-1">
                    <button
                      onClick={() => copyText(m.content, i)}
                      aria-label="Copy message"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition"
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check className="h-3 w-3 text-success" />
                          <span className="text-success">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 border-t border-border bg-card/30 p-3"
        >
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={4000}
            rows={1}
            dir="auto"
            placeholder="اكتب استفسارك هنا… Type a message"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
            className="max-h-36 min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              aria-label="Stop"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-accent text-foreground hover:bg-destructive/20 hover:text-destructive transition"
            >
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send"
              disabled={!input.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40 shadow-sm transition hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </form>
      </section>
    </div>
  );
}
