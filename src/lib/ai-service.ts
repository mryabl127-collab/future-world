export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const SYSTEM_PROMPT = `أنت المساعد الذكي الشامل والموسوعي لتطبيق FUTURE WORLD (عالم المستقبل).
أنت تمتلك ذكاءً فائقاً ومعرفة عميقة في كافة مجالات العلوم، التكنولوجيا، البرمجة، الحوسبة والذكاء الاصطناعي، الأمن الرقمي، التاريخ، الثقافة، الصحة، حل المشكلات والرياضيات، وإتقان تام للغتين العربية والإنجليزية.

مبادئك الأساسية:
1. أجب بذكاء واحترافية وبلاغة عن أي سؤال يطرحه المستخدم في أي مجال من مجالات المعرفة والحياة وليس فقط الأمن السيبراني.
2. تفاعل بلغة طبيعية، ودودة، واضحة ومنظمة، واستخدم تنسيق Markdown الأنيق (عناوين، نقاط، جداول، أمثلة كود عند الحاجة).
3. أجب دائمًا بنفس لغة المستخدم (العربية الفصحى أو الإنجليزية).
4. قدم شروحاً سهلة وعميقة تلبي حاجة السائل تماماً، واقترح أفكاراً وحلولاً إضافية تفيده.
5. في المواضيع التقنية والأمنية، وضح آليات الحماية والدفاع والوقاية بأعلى معايير الدقة والمسؤولية.`;

// Curated offline responses for diverse common inquiries
const OFFLINE_KNOWLEDGE: { keywords: string[]; title: string; ar: string; en: string }[] = [
  {
    keywords: ["ذكاء اصطناعي", "ai", "artificial intelligence", "تعلم آلة"],
    title: "الذكاء الاصطناعي (Artificial Intelligence)",
    ar: `الذكاء الاصطناعي (AI) هو فرع من علوم الحاسوب يهدف لتمكين الآلات والبرمجيات من محاكاة القدرات العقلية البشرية، مثل التفكير، التعلم، التحليل، وفهم اللغات.

أهم فروعه وتطبيقاته:
• التعلم الآلي (Machine Learning): تمكين الحاسوب من التعلم من البيانات والتنبؤ.
• معالجة اللغات الطبيعية (NLP): مثل نماذج المحادثة والترجمة الفورية.
• الرؤية الحاسوبية (Computer Vision): تمييز الصور ومقاطع الفيديو والوجوه.
• الروبوتات والأنظمة المستقلة: كالسيارات ذاتية القيادة.`,
    en: `Artificial Intelligence (AI) enables machines to simulate human intelligence including reasoning, learning, and language understanding.`
  },
  {
    keywords: ["برمجة", "لغات البرمجة", "تعلم البرمجة", "كود", "coding", "programming"],
    title: "تعلم البرمجة والتطوير",
    ar: `البرمجة هي إعطاء الحاسوب تعليمات منطقية لحل مشكلات وبناء تطبيقات ومواقع وأنظمة.

أفضل لغات البرمجة للبدء:
1. Python: الأسهل تعلماً والأقوى في الذكاء الاصطناعي، تحليل البيانات، والأمن السيبراني.
2. JavaScript / TypeScript: لغة الويب الكاملة لبناء واجهات المواقع وتطبيقات الموبايل والخوادم.
3. C / C++: لفهم إدارة الذاكرة وهيكلية المعالجات والأنظمة المدمجة.`,
    en: `Programming is creating logical instructions for computers to solve problems and build applications. Popular starting languages include Python, JavaScript, and C++.`
  },
  {
    keywords: ["تصيد", "احتيال", "رابط مشبوه", "phish", "scam", "fake link"],
    title: "التصيد الاحتيالي (Phishing)",
    ar: `التصيد الاحتيالي هو محاولة خداعك لسرقة معلوماتك السرية (مثل كلمات المرور أو بطاقات الدفع).

علامات التحذير الشائعة:
• الروابط المزيفة: فحص النطاق بعناية (مثلاً g00gle.com بدلاً من google.com).
• لغة التهديد والاستعجال: عبارات مثل "سيتم إغلاق حسابك خلال 24 ساعة".
• طلب إدخال كلمة المرور أو رمز التحقق (OTP) في صفحات غير موثوقة.

طرق الحماية:
1. لا تنقر على روابط في رسائل غير متوقعة.
2. تفعيل المصادقة الثنائية (2FA) لجميع حساباتك.
3. استخدم أداة فحص الروابط (SCAN) في تطبيق Future World للتأكد من سلامة العنوان.`,
    en: `Phishing is a social engineering attack where criminals impersonate legitimate services to steal your credentials.`
  },
  {
    keywords: ["كلمة سر", "كلمة المرور", "باسوورد", "password"],
    title: "أمان كلمات المرور (Password Security)",
    ar: `لحماية حساباتك الرقمية بقوة:

1. استخدم عبارة مرور طويلة (Passphrase): مزيج من 14 حرفاً على الأقل يجمع كلمات وأرقام ورموز.
2. لا تكرر كلمة المرور: يجب أن يكون لكل حساب رئيسي (البريد، البنك، التواصل) كلمة سر فريدة.
3. استخدم مدير كلمات مرور (Password Manager) مثل Bitwarden أو 1Password.
4. فعل المصادقة الثنائية (2FA) دائماً حتى لو تم تسريب كلمة المرور.`,
    en: `Best practices for bulletproof password security: Use long passphrases, never reuse passwords, and enable Two-Factor Authentication.`
  },
  {
    keywords: ["عالم المستقبل", "future world", "من أنت", "who are you"],
    title: "عالم المستقبل (FUTURE WORLD)",
    ar: `أنا المساعد الذكي لتطبيق FUTURE WORLD، مصمم لمساعدتك والإجابة عن جميع استفساراتك في كافة مجالات المعرفة، العلوم، البرمجة، والحلول التقنية، إلى جانب الحماية والأمن الرقمي.`,
    en: `I am the FUTURE WORLD AI assistant, designed to help you in all areas of technology, science, coding, and general knowledge.`
  }
];

function getOfflineFallback(userPrompt: string): string {
  const p = userPrompt.toLowerCase();
  const isArabic = /[\u0600-\u06FF]/.test(userPrompt);

  for (const item of OFFLINE_KNOWLEDGE) {
    if (item.keywords.some((k) => p.includes(k))) {
      return (
        (isArabic ? item.ar : item.en) +
        (isArabic
          ? "\n\n💡 ملاحظة: هذه إجابة من قاعدة المعرفة المدمجة. للحصول على إجابات موسعة وتفاعلية لحظية تأكد من اتصال جهازك بالإنترنت."
          : "\n\n💡 Note: This is an on-device response. Connect to the internet for live AI completion.")
      );
    }
  }

  return isArabic
    ? `مرحباً بك! أنا المساعد الذكي الشامل لتطبيق FUTURE WORLD.

يسعدني الإجابة عن كل استفساراتك في كافة المجالات:
• العلوم، التكنولوجيا، والبرمجة (Python, Web, Linux...)
• الذكاء الاصطناعي وتطبيقاته الحديثة
• أسرار وحلول الأمن الرقمي وحماية الأجهزة
• الثقافة العامة، الحسابات، والنصائح اليومية

💡 يرجى التأكد من اتصال هاتفك بالإنترنت للتواصل الحي مع أحدث خوادم الذكاء الاصطناعي التوليدي.`
    : `Welcome! I am the comprehensive FUTURE WORLD AI assistant.

I can assist you with:
• Science, technology, and programming (Python, Web, Linux, etc.)
• Artificial Intelligence and machine learning
• Cybersecurity, privacy, and device protection
• General knowledge, math, and daily productivity

💡 Please ensure your device is connected to the internet for live AI responses.`;
}

// The Android app is a static bundle with no server, so it must call the published site.
const PUBLISHED_ORIGIN = "https://hearthside-ai-conversations.lovable.app";

export function getApiBase(): string {
  if (typeof window === "undefined") return "";
  const w = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } };
  const native = !!w.Capacitor?.isNativePlatform?.() || window.location.protocol === "capacitor:" ||
    (window.location.hostname === "localhost" && window.location.port === "");
  return native ? PUBLISHED_ORIGIN : "";
}

export async function streamChatCompletion({
  messages,
  onDelta,
  signal,
}: {
  messages: ChatMessage[];
  onDelta: (chunk: string) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const lastUserMessage = messages.filter((m) => m.role === "user").at(-1)?.content || "";
  const clean = messages
    .filter((m) => m.role !== "system" && m.content.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  let res: Response;
  try {
    res = await fetch(`${getApiBase()}/api/chat`, {
      method: "POST",
      signal: signal ?? null,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: clean }),
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    // No connection: answer from the built-in knowledge.
    await typeOut(getOfflineFallback(lastUserMessage), onDelta, signal);
    return;
  }

  if (!res.ok || !res.body) {
    let msg = "";
    try { msg = ((await res.json()) as { error?: string }).error || ""; } catch { /* ignore */ }
    throw new Error(msg || `AI error ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let got = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    if (text) { got = true; onDelta(text); }
  }
  if (!got) throw new Error("Empty AI response");
}

async function typeOut(text: string, onDelta: (c: string) => void, signal?: AbortSignal) {
  const chunks = text.match(/.{1,10}/gs) || [text];
  for (const c of chunks) {
    if (signal?.aborted) return;
    onDelta(c);
    await new Promise((r) => setTimeout(r, 15));
  }
}

// Kept for reference: SYSTEM_PROMPT lives on the server route.
void SYSTEM_PROMPT;

