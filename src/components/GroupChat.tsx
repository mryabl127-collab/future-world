import { useEffect, useRef, useState } from "react";
import { Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type Msg = { id: string; author: string; client_id: string; content: string; created_at: string };

function getClientId(): string {
  let id = localStorage.getItem("fw-chat-client-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("fw-chat-client-id", id);
  }
  return id;
}

export function GroupChat({ isAr }: { isAr: boolean }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setClientId(getClientId());
    setName(localStorage.getItem("fw-chat-name") || "");
    let active = true;
    supabase
      .from("community_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(isAr ? "تعذر تحميل الرسائل" : "Could not load messages");
        else setMessages((data ?? []).reverse());
      });
    const channel = supabase
      .channel(`community-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_messages" }, (p) => {
        const m = p.new as Msg;
        setMessages((cur) => (cur.some((x) => x.id === m.id) ? cur : [...cur, m]));
      })
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [isAr]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const author = (user?.name || name).trim();

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || !author || sending) return;
    setSending(true);
    setError("");
    localStorage.setItem("fw-chat-name", name);
    const { data, error } = await supabase
      .from("community_messages")
      .insert({ author: author.slice(0, 40), client_id: clientId, content: content.slice(0, 1000) })
      .select()
      .single();
    setSending(false);
    if (error) {
      setError(isAr ? "لم تُرسل الرسالة، حاول مرة ثانية" : "Message not sent, try again");
      return;
    }
    setText("");
    if (data) setMessages((cur) => (cur.some((x) => x.id === data.id) ? cur : [...cur, data as Msg]));
  }

  return (
    <div className="panel rounded-3xl border border-border bg-card shadow-md overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-sm sm:text-base">{isAr ? "المحادثة الجماعية" : "Group chat"}</h3>
        <span className="ms-auto flex items-center gap-1 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          {isAr ? "مباشر" : "Live"}
        </span>
      </div>

      <div ref={listRef} className="h-80 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground pt-10">
            {isAr ? "لا توجد رسائل بعد، كن أول من يكتب!" : "No messages yet — say hi!"}
          </p>
        )}
        {messages.map((m) => {
          const mine = m.client_id === clientId;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <span className="text-[10px] text-muted-foreground mb-0.5 px-1">
                {m.author} · {new Date(m.created_at).toLocaleTimeString(isAr ? "ar-IQ" : "en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                  mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={send} className="border-t border-border p-3 space-y-2">
        {!user && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder={isAr ? "اكتب اسمك أولاً" : "Your name"}
            className="w-full rounded-full border border-input bg-background px-4 h-9 text-xs outline-none focus:border-primary"
          />
        )}
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            placeholder={isAr ? "اكتب رسالة للجميع..." : "Message everyone..."}
            className="flex-1 rounded-full border border-input bg-background px-4 h-10 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!text.trim() || !author || sending}
            aria-label={isAr ? "إرسال" : "Send"}
            className="h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </form>
    </div>
  );
}
