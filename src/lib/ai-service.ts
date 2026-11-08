export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const SYSTEM_PROMPT = `أنت المساعد الذكي لتطبيق FUTURE WORLD (عالم المستقبل)، خبير في الأمن السيبراني والتقنية والذكاء الاصطناعي.
مهمتك:
1. تقديم إجابات دقيقة واحترافية وواضحة وسهلة الفهم.
2. التخصص في التوعية بالأمن السيبراني، حماية الأجهزة، فحص الروابط، الحماية من الاحتيال، وأفضل الممارسات التقنية.
3. الإجابة دائمًا بنفس لغة المستخدم (العربية أو الإنجليزية).
4. استخدم تنسيق Markdown واضح ومنظم (نقاط ورؤوس أقلام وفقرات قصيرة).
5. الامتناع تمامًا عن المساعدة في أي نشاط اختراق خبيث أو غير قانوني، والتوجيه دائمًا نحو الحماية والدفاع المشروع.`;

// Curated offline responses for common security and general queries
const OFFLINE_KNOWLEDGE: { keywords: string[]; title: string; ar: string; en: string }[] = [
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
    en: `Phishing is a social engineering attack where criminals impersonate legitimate services to steal your credentials.

Warning Signs:
• Look-alike domain names and unexpected subdomains.
• Urgent deadlines and threats of account suspension.
• Unsolicited requests for one-time passwords (OTP).

Defense:
1. Verify senders before clicking links.
2. Enable multi-factor authentication (MFA).
3. Inspect links using the SCAN tool in Future World.`
  },
  {
    keywords: ["كلمة سر", "كلمة المرور", "باسوورد", "password"],
    title: "أمان كلمات المرور (Password Security)",
    ar: `لحماية حساباتك الرقمية بقوة:

1. استخدم عبارة مرور طويلة (Passphrase): مزيج من 14 حرفاً على الأقل يجمع كلمات وأرقام ورموز.
2. لا تكرر كلمة المرور: يجب أن يكون لكل حساب رئيسي (البريد، البنك، التواصل) كلمة سر فريدة.
3. استخدم مدير كلمات مرور (Password Manager) مثل Bitwarden أو 1Password.
4. فعل المصادقة الثنائية (2FA) دائماً حتى لو تم تسريب كلمة المرور.`,
    en: `Best practices for bulletproof password security:

1. Use a long passphrase of at least 14-16 characters with letters, numbers, and symbols.
2. Never reuse passwords across accounts.
3. Use a reputable password manager (e.g., Bitwarden).
4. Always enable Two-Factor Authentication (2FA).`
  },
  {
    keywords: ["مصادقة", "تحقق ثنائي", "2fa", "mfa", "otp"],
    title: "المصادقة الثنائية (2FA)",
    ar: `المصادقة الثنائية (2FA) هي إضافة خط دفاع ثانٍ لحسابك يتطلب أمرين:
1. شيء تعرفه (كلمة المرور).
2. شيء تملكه (تطبيق المصادقة مثل Google Authenticator أو مفتاح أمان فيزيائي).

فائدتها: حتى لو سرق المهاجم كلمة مرورك، لن يستطيع دخول حسابك بدون رمز التحقق المتجدد.`,
    en: `Two-Factor Authentication (2FA) adds a critical layer of defense:
1. Something you know (your password).
2. Something you possess (an authenticator app like Google Authenticator or a hardware key).

Even if your password is leaked, attackers cannot sign in without your physical device.`
  },
  {
    keywords: ["واي فاي", "wifi", "wi-fi", "شبكة عامة", "public network"],
    title: "أمان شبكات الواي فاي (Wi-Fi Security)",
    ar: `مخاطر شبكات الواي فاي المفتوحة في الأماكن العامة:
• يمكن للمهاجمين على نفس الشبكة التنصت على البيانات غير المشفرة (هجمات Man-in-the-Middle).
• إنشاء شبكات وهمية بأسماء مطابقة (Evil Twin).

نصائح الأمان:
1. استخدم شبكة خاصة افتراضية (VPN) موثوقة عند الاتصال بشبكات عامة.
2. تأكد من وجود رمز القفل وشعار HTTPS في المواقع التي تزورها.
3. أوقف الاتصال التلقائي بشبكات الواي فاي في إعدادات هاتفك.`,
    en: `Public Wi-Fi networks pose significant risks:
• Eavesdropping on unencrypted traffic (Man-in-the-Middle).
• Rogue access points with identical names.

Protection:
1. Always use a reliable VPN on untrusted Wi-Fi.
2. Ensure HTTPS is enforced for all browsing.
3. Turn off auto-connect to Wi-Fi on your phone.`
  },
  {
    keywords: ["جدار حماية", "firewall", "فايروول"],
    title: "جدار الحماية (Firewall)",
    ar: `جدار الحماية هو نظام أمني يراقب ويتحكم في حركة البيانات الصادرة والواردة بين شبكتك والإنترنت بناءً على قواعد أمان محددة.

مهامه الرئيسية:
• منع الاتصالات غير المصرح بها من التسلل إلى جهازك.
• حظر البرمجيات الخبيثة من إرسال بياناتك للخارج.
• فحص المنافذ والبروتوكولات النشطة.`,
    en: `A firewall acts as a security barrier monitoring and filtering incoming and outgoing network traffic based on predefined security rules.`
  }
];

function getOfflineFallback(userPrompt: string): string {
  const p = userPrompt.toLowerCase();
  const isArabic = /[\u0600-\u06FF]/.test(userPrompt);

  for (const item of OFFLINE_KNOWLEDGE) {
    if (item.keywords.some((k) => p.includes(k))) {
      return (isArabic ? item.ar : item.en) + (isArabic 
        ? "\n\n💡 ملاحظة: هذه إجابة من المعرفة المدمجة في التطبيق. للحصول على إجابات موسعة وتفاعلية تأكد من اتصال هاتفك بالإنترنت." 
        : "\n\n💡 Note: This is an on-device response. Connect to the internet for real-time live AI responses.");
    }
  }

  return isArabic
    ? `مرحباً بك! أنا المساعد الذكي لتطبيق FUTURE WORLD.

لتقديم إجابات شاملة ومباشرة، يرجى التأكد من اتصال هاتفك بالإنترنت، حيث يقوم المساعد بالتواصل مع خوادم الذكاء الاصطناعي التوليدي عبر الشبكة.

يمكنك سؤالي عن:
• التصيد والاحتيال الإلكتروني (Phishing)
• إنشاء وتأمين كلمات المرور القوية
• المصادقة الثنائية (2FA) وأهميتها
• أمان شبكات الواي فاي العامة والـ VPN
• فحص الروابط والصور عبر تبويب SCAN في التطبيق`
    : `Welcome! I am the FUTURE WORLD AI assistant.

To provide comprehensive and live answers, please ensure your device is connected to the internet.

You can ask me about:
• Phishing and fraud prevention
• Password management and passphrases
• Two-Factor Authentication (2FA)
• Safe Wi-Fi and VPN practices
• Inspecting links and images in the SCAN tool`;
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
  const formattedMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.slice(-20).map((m) => ({ role: m.role, content: m.content.slice(0, 4000) })),
  ];

  // Check if user set a custom API key in Settings
  let customKey = "";
  try {
    customKey = localStorage.getItem("fw-ai-key") || "";
  } catch {
    // ignore
  }

  // 1. If custom key is provided (OpenAI or compatible)
  if (customKey.trim().startsWith("sk-")) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customKey.trim()}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: formattedMessages,
          stream: true,
        }),
      });

      if (res.ok && res.body) {
        await readSseStream(res.body, onDelta);
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") throw e;
      // fallback to public endpoint
    }
  }

  // 2. Primary Public Engine: Fast, OpenAI-compatible SSE streaming
  try {
    const res = await fetch("https://flm.stonech.at/v1/chat/completions", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: formattedMessages,
        stream: true,
      }),
    });

    if (res.ok && res.body) {
      await readSseStream(res.body, onDelta);
      return;
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    console.warn("Primary AI endpoint failed, trying backup...", e);
  }

  // 3. Backup Engine: Pollinations OpenAI endpoint
  try {
    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: formattedMessages,
        model: "openai-fast",
      }),
    });

    if (res.ok) {
      const text = await res.text();
      if (text && !text.includes("Free limit reached")) {
        // Stream out in quick natural chunks for smooth UX
        const chunks = text.match(/.{1,12}/g) || [text];
        for (const c of chunks) {
          if (signal?.aborted) return;
          onDelta(c);
          await new Promise((r) => setTimeout(r, 20));
        }
        return;
      }
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    console.warn("Backup AI endpoint failed", e);
  }

  // 4. Device Knowledge Fallback (works offline or when network is down)
  const offlineText = getOfflineFallback(lastUserMessage);
  const chunks = offlineText.match(/.{1,10}/g) || [offlineText];
  for (const c of chunks) {
    if (signal?.aborted) return;
    onDelta(c);
    await new Promise((r) => setTimeout(r, 15));
  }
}

async function readSseStream(body: ReadableStream<Uint8Array>, onDelta: (chunk: string) => void): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line === "data: [DONE]") continue;

      if (line.startsWith("data:")) {
        try {
          const json = JSON.parse(line.slice(5).trim());
          const delta = json.choices?.[0]?.delta?.content || "";
          if (delta) {
            onDelta(delta);
          }
        } catch {
          // ignore partial JSON chunk
        }
      }
    }
  }
}
