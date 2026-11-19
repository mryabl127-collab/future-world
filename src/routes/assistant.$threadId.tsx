import { createFileRoute } from "@tanstack/react-router";
import { ChatView } from "@/components/chat/ChatView";

export const Route = createFileRoute("/assistant/$threadId")({
  head: () => ({
    meta: [
      { title: "دردشة | FUTURE WORLD AI" },
      { name: "description", content: "محادثة مع المساعد الذكي في FUTURE WORLD." },
      { property: "og:title", content: "دردشة | FUTURE WORLD AI" },
      { property: "og:description", content: "محادثة مع المساعد الذكي في FUTURE WORLD." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChatThread,
});

function ChatThread() {
  const { threadId } = Route.useParams();
  return <ChatView threadId={threadId} />;
}
