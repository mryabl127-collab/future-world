import { createFileRoute } from "@tanstack/react-router";
import { ChatView } from "@/components/chat/ChatView";

export const Route = createFileRoute("/assistant/")({
  head: () => ({
    meta: [
      { title: "المساعد الذكي | FUTURE WORLD AI" },
      {
        name: "description",
        content:
          "مساعد ذكي مثل ChatGPT يجاوب على كل أسئلتك بالعربي والإنجليزي: علوم، برمجة، تقنية، حماية رقمية وحياة يومية.",
      },
      { property: "og:title", content: "المساعد الذكي | FUTURE WORLD AI" },
      { property: "og:description", content: "دردشة ذكية سريعة تجاوب على أي سؤال بأي مجال." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ChatView />,
});
