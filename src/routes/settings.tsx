import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, Sparkles, Key, Check } from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { useLocal } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Profile | FUTURE WORLD" },
      { name: "description", content: "Language, theme, and local profile preferences with clear privacy information." },
      { property: "og:title", content: "Settings & Profile | FUTURE WORLD" },
      { property: "og:description", content: "Manage your local preferences." },
    ],
  }),
  component: SettingsPage,
});

type Prefs = { name: string; lang: "en" | "ar"; accent: "electric" | "ice" | "deep"; level: string };
const ACCENTS = { electric: "oklch(0.7 0.18 245)", ice: "oklch(0.8 0.12 220)", deep: "oklch(0.6 0.2 260)" };

function SettingsPage() {
  const [prefs, setPrefs] = useLocal<Prefs>("fw-prefs", { name: "", lang: "ar", accent: "electric", level: "Beginner" });
  const [draft, setDraft] = useState(prefs);
  const [aiKey, setAiKey] = useState("");

  useEffect(() => {
    setDraft(prefs);
    try {
      setAiKey(localStorage.getItem("fw-ai-key") || "");
    } catch {
      // ignore
    }
  }, [prefs]);

  const save = () => {
    const name = draft.name.replace(/[<>]/g, "").trim().slice(0, 40);
    setPrefs({ ...draft, name });
    try {
      if (aiKey.trim()) {
        localStorage.setItem("fw-ai-key", aiKey.trim());
      } else {
        localStorage.removeItem("fw-ai-key");
      }
    } catch {
      // ignore
    }
    toast.success("تم حفظ الإعدادات على هذا الجهاز / Saved locally");
  };

  const f = "h-11 w-full rounded-lg border border-input bg-background px-3 text-base outline-none focus:border-primary transition";

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="الإعدادات والتفضيلات"
        subtitle="Settings & Profile — كل الإعدادات والمحادثات تُحفظ محلياً على جهازك."
      />

      <div className="panel space-y-5 p-5">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">اسم العرض (اختياري) / Display name</span>
          <input
            className={f}
            maxLength={40}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="مثال: علي / Ali"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">اللغة المفضلة / Language preference</span>
          <select
            className={f}
            value={draft.lang}
            onChange={(e) => setDraft({ ...draft, lang: e.target.value as Prefs["lang"] })}
          >
            <option value="ar">العربية (Arabic)</option>
            <option value="en">English (الإنجليزية)</option>
          </select>
          <span className="mt-1 block text-xs text-muted-foreground">
            المساعد الذكي يجيبك تلقائياً بنفس اللغة التي تكتب بها.
          </span>
        </label>

        <div>
          <span className="mb-2 block text-sm font-medium">لون السمة / Accent theme</span>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(ACCENTS) as Prefs["accent"][]).map((k) => (
              <button
                key={k}
                onClick={() => setDraft({ ...draft, accent: k })}
                className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm capitalize transition ${
                  draft.accent === k ? "border-primary bg-accent" : "border-border"
                }`}
              >
                <span className="h-3 w-3 rounded-full" style={{ background: ACCENTS[k] }} />
                {k}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">مستوى التعلم في الأكاديمية / Learning level</span>
          <select
            className={f}
            value={draft.level}
            onChange={(e) => setDraft({ ...draft, level: e.target.value })}
          >
            <option value="Beginner">مبتدئ (Beginner)</option>
            <option value="Intermediate">متوسط (Intermediate)</option>
            <option value="Advanced">متقدم (Advanced)</option>
          </select>
        </label>

        <button
          onClick={save}
          className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground sm:w-auto sm:px-8 transition hover:opacity-90 shadow-sm"
        >
          حفظ التفضيلات · Save
        </button>
      </div>

      {/* AI Engine Settings */}
      <div className="panel mt-6 p-5 space-y-4">
        <h2 className="flex items-center gap-2 font-bold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          محرك الذكاء الاصطناعي (AI Assistant)
        </h2>
        <div className="rounded-lg bg-accent/40 p-3 border border-border/80 text-xs text-muted-foreground leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-success mb-1">
            <Check className="h-4 w-4" />
            الذكاء الاصطناعي المدمج نشط ومجاني تلقائياً
          </div>
          يعمل المساعد الذكي مباشرة دون الحاجة لأي إعداد. يمكنك اختياريًا إدخال مفتاح API مخصص (مثل OpenAI) إذا أردت استخدام حسابك الخاص.
        </div>

        <label className="block">
          <span className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Key className="h-3.5 w-3.5" />
            مفتاح API مخصص (اختياري / Optional custom key):
          </span>
          <input
            type="password"
            className={f}
            value={aiKey}
            onChange={(e) => setAiKey(e.target.value)}
            placeholder="sk-..."
          />
        </label>
      </div>

      {/* Privacy Card */}
      <div className="panel mt-6 p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Lock className="h-4 w-4 text-primary" />
          الخصوصية والأمان
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 pr-5 text-xs text-muted-foreground">
          <li>لا نطلب كلمات المرور أو البيانات الشخصية إطلاقاً.</li>
          <li>سجل الفحص والتقدم في الأكاديمية والمحادثات تُخزن محلياً فقط على هاتفك.</li>
          <li>فحص الروابط والصور يتم معالجته محلياً على جهازك دون رفعه لأي خادم.</li>
          <li>طلبات المساعد الذكي مشفرة ولا يتم تخزينها أو مشاركتها.</li>
        </ul>
        <button
          onClick={() => {
            ["fw-history", "fw-progress", "fw-chats", "fw-prefs", "fw-alerts-read", "fw-ai-key"].forEach((k) =>
              localStorage.removeItem(k)
            );
            window.dispatchEvent(new Event("fw-store"));
            toast.success("تم مسح كافة البيانات المحلية من الهاتف");
          }}
          className="mt-4 h-10 rounded-lg border border-border px-4 text-xs font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition"
        >
          مسح جميع البيانات المحلية من الجهاز
        </button>
      </div>
    </div>
  );
}
