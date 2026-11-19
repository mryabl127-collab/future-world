import { createFileRoute } from "@tanstack/react-router";
import {
  streamResponse,
  GatewayError,
  PaymentRequiredError,
  RateLimitError,
} from "@lovable.dev/ai-gateway";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM = `You are the FUTURE WORLD assistant (عالم المستقبل), a smart, friendly, general-purpose AI like ChatGPT.
- Answer any question on any subject clearly and accurately: science, tech, programming, health, history, daily life, math, writing and more, with extra expertise in cybersecurity and digital safety.
- Always reply in the same language and dialect as the user's latest message (Iraqi Arabic, standard Arabic, English, etc.).
- Format answers with Markdown: short paragraphs, headings when useful, bullet lists, tables, and fenced code blocks for code.
- Be direct; get to the answer first, then details.
- Refuse to help with clearly malicious hacking against systems the user does not own.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function parseMessages(body: unknown): Msg[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw)) return null;
  const messages = raw
    .filter(
      (m): m is Msg =>
        !!m &&
        typeof m === "object" &&
        ["user", "assistant"].includes((m as Msg).role) &&
        typeof (m as Msg).content === "string" &&
        (m as Msg).content.trim().length > 0,
    )
    .slice(-30)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));
  if (!messages.length || messages.at(-1)!.role !== "user") return null;
  return messages;
}

function errorMessage(e: unknown): { msg: string; status: number } {
  if (e instanceof RateLimitError)
    return { msg: "Too many requests right now. Please wait a moment and try again.", status: 429 };
  if (e instanceof PaymentRequiredError)
    return { msg: "The AI service has run out of credits.", status: 402 };
  if (e instanceof GatewayError) {
    console.error("AI gateway error", e.code, e.httpStatus, e.ids);
    return { msg: "The AI service is temporarily unavailable.", status: 502 };
  }
  console.error(e);
  return { msg: "The AI service is temporarily unavailable.", status: 502 };
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let messages: Msg[] | null = null;
        try {
          messages = parseMessages(await request.json());
        } catch {
          messages = null;
        }
        if (!messages)
          return Response.json({ error: "Invalid request." }, { status: 400, headers: CORS });

        let stream: Awaited<ReturnType<typeof streamResponse<"openai/gpt-6-astra">>>;
        try {
          stream = await streamResponse(
            {
              model: "openai/gpt-6-astra",
              instructions: SYSTEM,
              input: messages.map((m) => ({ role: m.role, content: m.content })),
              reasoning: { effort: "low" },
            },
            { signal: request.signal },
          );
        } catch (e) {
          const { msg, status } = errorMessage(e);
          return Response.json({ error: msg }, { status, headers: CORS });
        }

        const encoder = new TextEncoder();
        const body = new ReadableStream<Uint8Array>({
          async start(ctrl) {
            try {
              for await (const ev of stream) {
                const e = ev as { type?: string; delta?: string };
                if (e.type === "response.output_text.delta" && e.delta)
                  ctrl.enqueue(encoder.encode(e.delta));
              }
            } catch (e) {
              if ((e as Error)?.name !== "AbortError" && !request.signal.aborted) {
                const { msg } = errorMessage(e);
                ctrl.enqueue(encoder.encode(`\n\n[${msg}]`));
              }
            } finally {
              ctrl.close();
            }
          },
        });

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            ...CORS,
          },
        });
      },
    },
  },
});
