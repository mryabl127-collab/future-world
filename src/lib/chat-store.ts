import { useSyncExternalStore } from "react";
import { streamChatCompletion } from "@/lib/ai-service";

export type ChatMsg = { id: string; role: "user" | "assistant"; content: string; error?: boolean };
export type Conversation = { id: string; title: string; updatedAt: number; messages: ChatMsg[] };

const KEY = "fw-chats";
const EMPTY: Conversation[] = [];
let convs: Conversation[] | null = null;
const listeners = new Set<() => void>();
const streaming = new Map<string, AbortController>();

function load(): Conversation[] {
  if (convs) return convs;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]") as Array<Partial<Conversation>>;
    convs = raw
      .filter((c) => c && typeof c.id === "string")
      .map((c) => ({
        id: c.id!,
        title: c.title || "",
        updatedAt: c.updatedAt || Date.now(),
        messages: (c.messages || []).map((m, i) => ({
          id: (m as ChatMsg).id || `${c.id}-${i}`,
          role: m.role,
          content: m.content,
          ...(m.error ? { error: true } : {}),
        })),
      }));
  } catch {
    convs = [];
  }
  return convs;
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
function set(next: Conversation[], persistNow = true) {
  convs = next.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 50);
  listeners.forEach((l) => l());
  const write = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(convs));
    } catch {
      /* storage full or unavailable */
    }
  };
  if (persistTimer) clearTimeout(persistTimer);
  if (persistNow) write();
  else persistTimer = setTimeout(write, 400);
}

function update(id: string, fn: (c: Conversation) => Conversation, persistNow = true) {
  set(
    load().map((c) => (c.id === id ? fn(c) : c)),
    persistNow,
  );
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useConversations(): Conversation[] {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

export function useIsStreaming(id: string | undefined): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !id && streaming.has(id),
    () => false,
  );
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

export function sendMessage(
  text: string,
  convId?: string,
  fallbackError = "Could not complete the response.",
): string {
  const content = text.trim();
  const id = convId ?? newId();
  if (!content || streaming.has(id)) return id;

  const existing = load().find((c) => c.id === id);
  const history = (existing?.messages ?? []).filter((m) => !m.error && m.content);
  const userMsg: ChatMsg = { id: newId(), role: "user", content };
  const assistantId = newId();
  const conv: Conversation = {
    id,
    title: existing?.title || (content.length > 40 ? content.slice(0, 40) + "…" : content),
    updatedAt: Date.now(),
    messages: [...history, userMsg, { id: assistantId, role: "assistant", content: "" }],
  };
  set([conv, ...load().filter((c) => c.id !== id)]);

  const controller = new AbortController();
  streaming.set(id, controller);
  listeners.forEach((l) => l());

  let acc = "";
  const setAssistant = (patch: Partial<ChatMsg>, persistNow: boolean) =>
    update(
      id,
      (c) => ({
        ...c,
        updatedAt: Date.now(),
        messages: c.messages.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
      }),
      persistNow,
    );

  streamChatCompletion({
    messages: [...history, userMsg].map((m) => ({ role: m.role, content: m.content })),
    signal: controller.signal,
    onDelta: (chunk) => {
      acc += chunk;
      setAssistant({ content: acc }, false);
    },
  })
    .then(() => setAssistant({ content: acc }, true))
    .catch((e: Error) => {
      if (e.name === "AbortError") {
        setAssistant({ content: acc }, true);
      } else {
        setAssistant({ content: acc || e.message || fallbackError, error: !acc }, true);
      }
    })
    .finally(() => {
      streaming.delete(id);
      listeners.forEach((l) => l());
    });

  return id;
}

export function stopStreaming(id: string | undefined) {
  if (id) streaming.get(id)?.abort();
}

export function deleteConversation(id: string) {
  stopStreaming(id);
  set(load().filter((c) => c.id !== id));
}

export function clearAllConversations() {
  streaming.forEach((c) => c.abort());
  set([]);
}
