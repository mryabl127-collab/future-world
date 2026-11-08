import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM = `You are the FUTURE WORLD assistant, a helpful, knowledgeable AI. Answer questions on any subject clearly and accurately, with special expertise in cybersecurity education and defensive security. Always reply in the same language as the user's latest message (Arabic or English, or others). Use concise markdown-free plain text with short paragraphs and simple lists. Refuse to help with clearly malicious hacking against systems the user does not own.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env['LOVABLE_API_KEY'];
        if (!key) return Response.json({ error: "The AI service is not configured." }, { status: 503 });
        let messages: Msg[];
        try {
          const body = (await request.json()) as { messages?: unknown };
          if (!Array.isArray(body.messages)) throw new Error();
          messages = body.messages
            .filter((m): m is Msg => !!m && typeof m === "object" && ["user", "assistant"].includes((m as Msg).role) && typeof (m as Msg).content === "string")
            .slice(-30)
            .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));
          if (!messages.length || messages.at(-1)!.role !== "user") throw new Error();
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          signal: request.signal,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            instructions: SYSTEM,
            input: messages.map((m) => ({ role: m.role, content: m.content })),
            reasoning: { effort: "low" },
            store: false,
            stream: true,
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const msg = upstream.status === 429 ? "Too many requests right now. Please wait a moment and try again."
            : upstream.status === 402 ? "The AI service has run out of credits."
            : "The AI service is temporarily unavailable.";
          return Response.json({ error: msg }, { status: upstream.status === 429 || upstream.status === 402 ? upstream.status : 502 });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buf = "";
        const stream = upstream.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
          transform(chunk, ctrl) {
            buf += decoder.decode(chunk, { stream: true });
            const frames = buf.split("\n\n");
            buf = frames.pop() ?? "";
            for (const f of frames) {
              const line = f.split("\n").find((l) => l.startsWith("data:"));
              if (!line) continue;
              try {
                const ev = JSON.parse(line.slice(5).trim());
                if (ev.type === "response.output_text.delta" && ev.delta) ctrl.enqueue(encoder.encode(ev.delta));
                if (ev.type === "response.failed" || ev.type === "error") ctrl.enqueue(encoder.encode("\n\n[The AI service returned an error.]"));
              } catch { /* ignore partial */ }
            }
          },
        }));
        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache, no-transform" } });
      },
    },
  },
});
