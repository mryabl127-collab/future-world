import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Plus, Send, Trash2, AlertTriangle, MessageSquare, Square, Copy, Check, Sparkles } from "lucide-react";
import { useLocal } from "@/lib/store";
import { streamChatCompletion, type ChatMessage } from "@/lib/ai-service";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "المساعد الذكي الشامل | FUTURE WORLD AI" },
      { name: "description", content: "مساعد ذكي شامل وموسوعي يجيب عن كل استفساراتك في العلوم، البرمجة، التقنية، الحماية الرقمية، والحياة اليومية." },
      { property: "og:title", content: "المساعد الذكي الشامل | FUTURE WORLD" },
      { property: "og:description", content: "مساعد ذكي فائق السرعة يدعم كافة الأسئلة العامة والتقنية باللغتين العربية والإنجليزية." },
    ],
  }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };
type Conv = { id: string; title: string; updatedAt: number; messages: Msg[] };

const SUGGESTIONS = [
  { ar: "اشرح لي كيفية عمل نماذج الذكاء الاصطناعي التوليدي LLM", en: "How do generative AI and LLMs actually work?" },
  { ar: "ما هي أفضل خارطة طريق لتعلم البرمجة وتطوير البرمجيات؟", en: "What is the best roadmap to learn programming?" },
  { ar: "كيف أحمي حساباتي المصرفية والشخصية من الاختراق والتصيد؟", en: "How to protect bank and personal accounts from scams?" },
  { ar: "ما الفرق بين الحوسبة الكمية والحوسبة التقليدية؟", en: "Difference between quantum computing and classical computers?" },
  { ar: "ساعدني في كتابة كود Python لحل مشكلة وتحليل بيانات", en: "Help me write a Python script for data processing" },
  { ar: "نصائح لتسريع الهاتف وتحسين كفاءة البطارية والذاكرة", en: "Tips to optimize phone battery and memory performance" },
];

function Assistant() {
  const { t, isAr } = useTranslation();
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
    toast.success(isAr ? "تم نسخ النص بنجاح!" : "Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  async function send(text: string) {
    const tVal = text.trim();
    if (!tVal || busy) return;

    const id = active?.id ?? crypto.randomUUID();
    const history: Msg[] = [...messages.filter((m) => !m.error), { role: "user", content: tVal }];
    let list = convs.filter((c) => c.id !== id);
    const base: Conv = {
      id,
      title: active?.title ?? (tVal.length > 40 ? tVal.slice(0, 40) + "…" : tVal),
      updatedAt: Date.now(),
      messages: [...history, { role: "assistant", content: "" }],
    };

    save([base, ...list]);
    setActiveId(id);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let accumulated = "";

    try {
      const apiMessages: ChatMessage[] = history.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await streamChatCompletion({
        messages: apiMessages,
        signal: controller.signal,
        onDelta: (chunk) => {
          accumulated += chunk;
          setConvs((current) =>
            current.map((c) => {
              if (c.id !== id) return c;
              const ms = [...c.messages];
              const last = ms.at(-1);
              if (last && last.role === "assistant") {
                ms[ms.length - 1] = { role: "assistant", content: accumulated };
              }
              return { ...c, messages: ms };
            })
          );
        },
      });
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setConvs((current) =>
          current.map((c) => {
            if (c.id !== id) return c;
            const ms = [...c.messages];
            ms[ms.length - 1] = {
              role: "assistant",
              content: accumulated || (isAr ? "تعذر إكمال الرد، يرجى المحاولة ثانية." : "Could not complete the response, please retry."),
              error: true,
            };
            return { ...c, messages: ms };
          })
        );
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function stop() {
    if (abortRef.current) {
      abortRef.current.abort();
      setBusy(false);
    }
  }

  function remove(id: string) {
    const list = convs.filter((c) => c.id !== id);
    save(list);
    if (activeId === id) setActiveId(list[0]?.id ?? null);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] min-h-[520px] max-w-4xl flex-col rounded-3xl border border-border bg-card shadow-lg overflow-hidden">
      {/* Top Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 bg-muted/40">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sm sm:text-base leading-tight flex items-center gap-1.5">
              <span>{t("aiTitle")}</span>
              <span className="rounded-full bg-success/10 border border-success/30 px-2 py-0.2 text-[9px] font-bold text-success">
                {isAr ? "شامل ونشط" : "LIVE & GENERAL"}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground truncate max-w-[200px] sm:max-w-md">
              {active ? active.title : isAr ? "محادثة جديدة" : "New Chat"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowList(!showList)}
            className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold hover:bg-accent transition"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isAr ? "المحادثات السابقة" : "History"}</span>
            <span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-[10px]">{convs.length}</span>
          </button>
          <button
            onClick={() => setActiveId(null)}
            className="flex h-9 items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 text-xs font-bold text-primary hover:bg-primary/20 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isAr ? "محادثة جديدة" : "New Chat"}</span>
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Previous Chats Drawer/Sidebar */}
        {showList && (
          <div className="absolute inset-y-0 start-0 z-20 w-64 border-e border-border bg-sidebar p-3 shadow-xl backdrop-blur animate-in fade-in slide-in-from-start duration-150 flex flex-col justify-between">
            <div className="space-y-1 overflow-y-auto">
              <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground">
                {isAr ? "سجل المحادثات" : "Chat History"}
              </div>
              {convs.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">{isAr ? "لا توجد محادثات سابقة" : "No chats yet"}</div>
              ) : (
                convs.map((c) => (
                  <div
                    key={c.id}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs transition cursor-pointer ${
                      c.id === activeId ? "bg-sidebar-accent text-primary font-bold" : "hover:bg-accent/50 text-foreground"
                    }`}
                    onClick={() => {
                      setActiveId(c.id);
                      setShowList(false);
                    }}
                  >
                    <span className="truncate flex-1 pe-2">{c.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(c.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive transition p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowList(false)}
              className="w-full mt-2 h-8 rounded-full border border-border text-xs text-muted-foreground hover:bg-accent transition"
            >
              {isAr ? "إغلاق القائمة" : "Close"}
            </button>
          </div>
        )}

        {/* Messages View */}
        <div className="flex flex-1 flex-col overflow-y-auto p-4 space-y-4" dir={isAr ? "rtl" : "ltr"}>
          {messages.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
              <div className="glow mb-4 grid h-16 w-16 place-items-center rounded-3xl border border-primary/30 bg-primary/10 text-primary">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">{t("aiTitle")}</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t("aiSubtitle")}
              </p>

              <div className="mt-6 w-full space-y-2">
                <div className="text-xs font-bold text-muted-foreground">{isAr ? "أسئلة مقترحة للبدء:" : "Suggested Questions:"}</div>
                <div className="grid gap-2 text-xs text-start">
                  {SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => send(isAr ? s.ar : s.en)}
                      className="rounded-2xl border border-border bg-background/50 p-2.5 hover:border-primary/50 hover:bg-accent transition flex items-center justify-between"
                    >
                      <span>{isAr ? s.ar : s.en}</span>
                      <span className="text-primary font-bold">↵</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground font-medium rounded-br-sm"
                      : m.error
                      ? "border border-destructive/40 bg-destructive/10 text-destructive rounded-bl-sm"
                      : "border border-border bg-card text-card-foreground rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap select-text">{m.content}</div>
                </div>

                {m.role === "assistant" && m.content && !m.error && (
                  <div className="mt-1 flex items-center gap-2 px-2 text-[11px] text-muted-foreground">
                    <button
                      onClick={() => copyText(m.content, idx)}
                      className="flex items-center gap-1 hover:text-primary transition"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="h-3 w-3 text-success" />
                          <span className="text-success">{t("copied")}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>{t("copy")}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-border p-3 bg-background/80 backdrop-blur flex items-center gap-2"
        dir={isAr ? "rtl" : "ltr"}
      >
        <textarea
          ref={taRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder={t("aiPlaceholder")}
          className="flex-1 max-h-32 resize-none rounded-full border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary placeholder:text-muted-foreground"
        />

        {busy ? (
          <button
            type="button"
            onClick={stop}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition shadow-sm"
            title={t("stop")}
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="glow grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm disabled:opacity-40"
            title={t("send")}
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}
