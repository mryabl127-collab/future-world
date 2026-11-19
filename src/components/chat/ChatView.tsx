import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlignRight,
  AlignLeft,
  AudioLines,
  ArrowUp,
  Copy,
  Check,
  Home,
  Mic,
  MicOff,
  Plus,
  RotateCcw,
  SquarePen,
  Trash2,
  Square,
  Lightbulb,
  Code2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTranslation } from "@/lib/i18n";
import {
  useConversations,
  useIsStreaming,
  sendMessage,
  stopStreaming,
  deleteConversation,
} from "@/lib/chat-store";

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((e: {
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

const SUGGESTIONS = [
  { icon: Lightbulb, ar: "اشرح لي الذكاء الاصطناعي ببساطة", en: "Explain AI in simple words" },
  { icon: Code2, ar: "ساعدني أكتب كود Python", en: "Help me write Python code" },
  { icon: ShieldCheck, ar: "كيف أحمي حساباتي من الاختراق؟", en: "How do I protect my accounts?" },
  { icon: Smartphone, ar: "نصائح لتسريع الهاتف والبطارية", en: "Tips to speed up my phone" },
];

export function ChatView({ threadId }: { threadId?: string }) {
  const { isAr } = useTranslation();
  const navigate = useNavigate();
  const convs = useConversations();
  const active = threadId ? convs.find((c) => c.id === threadId) : undefined;
  const messages = active?.messages ?? [];
  const busy = useIsStreaming(threadId);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const last = messages.at(-1);
  const waiting = busy && last?.role === "assistant" && !last.content;
  const status = waiting ? "submitted" : busy ? "streaming" : "ready";

  useEffect(() => {
    if (!menuOpen) taRef.current?.focus();
  }, [threadId, busy, menuOpen]);

  useEffect(() => () => recRef.current?.stop(), []);

  function submit(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    const id = sendMessage(
      value,
      threadId,
      isAr ? "تعذر إكمال الرد، حاول مرة ثانية." : "Could not complete the response, please retry.",
    );
    setInput("");
    if (id !== threadId)
      navigate({ to: "/assistant/$threadId", params: { threadId: id }, replace: !threadId });
  }

  function retry() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) submit(lastUser.content);
  }

  function toggleDictation() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      toast.error(
        isAr
          ? "الإدخال الصوتي غير مدعوم في هذا المتصفح"
          : "Voice input is not supported in this browser",
      );
      return;
    }
    const rec = new Ctor();
    rec.lang = isAr ? "ar-IQ" : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    const base = input ? input.trimEnd() + " " : "";
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i]![0]!.transcript;
      setInput(base + text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      setListening(false);
      toast.error(isAr ? "تعذر تشغيل المايكروفون" : "Could not access the microphone");
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  function newChat() {
    setMenuOpen(false);
    navigate({ to: "/assistant" });
  }

  const MenuIcon = isAr ? AlignRight : AlignLeft;

  return (
    <TooltipProvider>
      <div className="chat-theme fixed inset-0 z-50 flex flex-col" dir={isAr ? "rtl" : "ltr"}>
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-3">
          <div className="flex items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                aria-label={isAr ? "القائمة" : "Menu"}
                className="grid h-11 w-11 place-items-center rounded-full bg-card text-foreground transition hover:bg-accent"
              >
                <MenuIcon className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent
                side={isAr ? "right" : "left"}
                className="chat-theme flex w-[85vw] max-w-xs flex-col gap-0 border-border p-0"
                dir={isAr ? "rtl" : "ltr"}
              >
                <SheetTitle className="flex items-center gap-2 px-4 pr-12 pb-2 pt-5 text-base">
                  <Logo className="h-6 w-6" />
                  FUTURE WORLD AI
                </SheetTitle>
                <div className="space-y-1 px-2 py-2">
                  <button
                    onClick={newChat}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    <SquarePen className="h-4 w-4" />
                    {isAr ? "دردشة جديدة" : "New chat"}
                  </button>
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    <Home className="h-4 w-4" />
                    {isAr ? "الرجوع للتطبيق" : "Back to app"}
                  </Link>
                </div>
                <div className="px-5 pb-1 pt-3 text-xs font-semibold text-muted-foreground">
                  {isAr ? "الدردشات" : "Chats"}
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-4">
                  {convs.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">
                      {isAr ? "ما عندك دردشات بعد" : "No chats yet"}
                    </p>
                  ) : (
                    convs.map((c) => (
                      <div
                        key={c.id}
                        className={`group flex items-center rounded-xl ${c.id === threadId ? "bg-accent" : "hover:bg-accent/60"}`}
                      >
                        <Link
                          to="/assistant/$threadId"
                          params={{ threadId: c.id }}
                          onClick={() => setMenuOpen(false)}
                          className="min-w-0 flex-1 truncate px-3 py-2.5 text-sm"
                        >
                          {c.title || (isAr ? "دردشة" : "Chat")}
                        </Link>
                        <button
                          aria-label={isAr ? "حذف" : "Delete"}
                          onClick={() => {
                            deleteConversation(c.id);
                            if (c.id === threadId) newChat();
                          }}
                          className="p-2 text-muted-foreground opacity-60 transition hover:text-foreground group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex h-11 items-center gap-2 rounded-full bg-card px-4 text-sm font-semibold text-chat-upgrade">
              <Logo className="h-5 w-5" />
              <span>FUTURE WORLD AI</span>
            </div>
          </div>
          <button
            onClick={newChat}
            aria-label={isAr ? "دردشة جديدة" : "New chat"}
            className="grid h-11 w-11 place-items-center rounded-full bg-card text-foreground transition hover:bg-accent"
          >
            <SquarePen className="h-5 w-5" />
          </button>
        </header>

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <Logo className="mb-4 h-12 w-12 opacity-90" />
            <h1 className="text-2xl font-semibold">
              {isAr ? "شنو ببالك اليوم؟" : "What's on your mind today?"}
            </h1>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {isAr
                ? "اسأل أي سؤال بأي مجال، وراح أجاوبك بشكل واضح ومرتب."
                : "Ask anything in any field and get a clear, organized answer."}
            </p>
            <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.en}
                  onClick={() => submit(isAr ? s.ar : s.en)}
                  className="flex items-start gap-2 rounded-2xl border border-border p-3 text-start text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <s.icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{isAr ? s.ar : s.en}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Conversation className="flex-1">
            <ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-4 py-4">
              {messages.map((m, i) => {
                const isLast = i === messages.length - 1;
                if (m.role === "user") {
                  return (
                    <Message from="user" key={m.id}>
                      <MessageContent className="group-[.is-user]:rounded-3xl group-[.is-user]:bg-secondary group-[.is-user]:text-secondary-foreground text-[15px] leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </MessageContent>
                    </Message>
                  );
                }
                if (!m.content && isLast && busy) {
                  return (
                    <Message from="assistant" key={m.id}>
                      <Shimmer className="text-[15px]">
                        {isAr ? "جاري التفكير..." : "Thinking..."}
                      </Shimmer>
                    </Message>
                  );
                }
                return (
                  <Message from="assistant" key={m.id} className="max-w-full">
                    <MessageContent
                      className={`text-[15px] leading-7 ${m.error ? "text-destructive" : ""}`}
                    >
                      <MessageResponse isAnimating={isLast && busy}>{m.content}</MessageResponse>
                    </MessageContent>
                    {!(isLast && busy) && m.content && (
                      <MessageActions>
                        <MessageAction
                          tooltip={isAr ? "نسخ" : "Copy"}
                          label={isAr ? "نسخ" : "Copy"}
                          onClick={() => copy(m.content, m.id)}
                        >
                          {copied === m.id ? (
                            <Check className="size-4" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </MessageAction>
                        {isLast && (
                          <MessageAction
                            tooltip={isAr ? "إعادة" : "Retry"}
                            label={isAr ? "إعادة" : "Retry"}
                            onClick={retry}
                          >
                            <RotateCcw className="size-4" />
                          </MessageAction>
                        )}
                      </MessageActions>
                    )}
                  </Message>
                );
              })}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        )}

        {/* Composer */}
        <div className="mx-auto w-full max-w-3xl shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
          <PromptInput
            onSubmit={(msg) => submit(msg.text)}
            className="[&_[data-slot=input-group]]:rounded-[28px] [&_[data-slot=input-group]]:border-border [&_[data-slot=input-group]]:bg-card"
          >
            <PromptInputTextarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder={isAr ? "اسأل FUTURE WORLD" : "Ask FUTURE WORLD"}
              className="min-h-12 px-5 pt-4 text-[16px] placeholder:text-muted-foreground"
            />
            <PromptInputFooter className="px-2 pb-2">
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger
                    className="size-9 rounded-full text-foreground"
                    aria-label={isAr ? "اقتراحات" : "Suggestions"}
                  >
                    <Plus className="size-5" />
                  </PromptInputActionMenuTrigger>
                  <PromptInputActionMenuContent
                    className="chat-theme"
                    align={isAr ? "end" : "start"}
                  >
                    {SUGGESTIONS.map((s) => (
                      <PromptInputActionMenuItem
                        key={s.en}
                        onSelect={() => setInput(isAr ? s.ar : s.en)}
                      >
                        <s.icon className="me-2 size-4" />
                        {isAr ? s.ar : s.en}
                      </PromptInputActionMenuItem>
                    ))}
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
              </PromptInputTools>
              <div className="flex items-center gap-1">
                <PromptInputButton
                  onClick={toggleDictation}
                  aria-label={isAr ? "إدخال صوتي" : "Voice input"}
                  className={`size-9 rounded-full ${listening ? "text-destructive" : "text-foreground"}`}
                >
                  {listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                </PromptInputButton>
                {input.trim() || busy ? (
                  <PromptInputSubmit
                    status={status}
                    onStop={() => stopStreaming(threadId)}
                    disabled={!busy && !input.trim()}
                    className="size-9 rounded-full bg-foreground text-background hover:bg-foreground/90"
                  >
                    {busy ? (
                      <Square className="size-3.5 fill-current" />
                    ) : (
                      <ArrowUp className="size-5" />
                    )}
                  </PromptInputSubmit>
                ) : (
                  <PromptInputButton
                    onClick={toggleDictation}
                    aria-label={isAr ? "تحدث" : "Speak"}
                    className="size-9 rounded-full bg-chat-send text-chat-send-foreground hover:bg-chat-send/90"
                  >
                    <AudioLines className="size-5" />
                  </PromptInputButton>
                )}
              </div>
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {isAr
              ? "قد يخطئ الذكاء الاصطناعي، تأكد من المعلومات المهمة."
              : "AI can make mistakes. Check important info."}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
