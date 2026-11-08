import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  BookOpen,
  GraduationCap,
  Video,
  FileText,
  Download,
  ExternalLink,
  Award,
  Sparkles,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/Shell";
import { useLocal } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { BOOKS, VIDEOS } from "@/lib/library-data";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "أكاديمية ومكتبة عالم المستقبل | FUTURE WORLD Academy & Library" },
      { name: "description", content: "دروس منهجية تفاعلية، مكتبة كتب رقمية شاملة للأمن السيبراني، فيديوهات، واختبارات قياس المعرفة." },
      { property: "og:title", content: "أكاديمية ومكتبة عالم المستقبل" },
      { property: "og:description", content: "مسارات تعليمية متكاملة من المبتدئ إلى المتقدم مع شهادات إنجاز." },
    ],
  }),
  component: Academy,
});

type Lesson = { id: string; title: string; desc: string };
const L = (id: string, title: string, desc: string): Lesson => ({ id, title, desc });

const COURSES: {
  name: string;
  nameAr: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  summaryAr: string;
  lessons: Lesson[];
}[] = [
  {
    name: "Cybersecurity fundamentals",
    nameAr: "أساسيات ومبادئ الأمن السيبراني",
    level: "Beginner",
    summary: "The CIA triad, threats, vulnerabilities, and risk.",
    summaryAr: "مثلث الحماية (السرية، السلامة، التوافر)، التهديدات والثغرات وإدارة المخاطر.",
    lessons: [
      L("f1", "مثلث CIA: السرية والسلامة والتوافر", "الأهداف الثلاثة الجوهرية لأي نظام أمني ناجح."),
      L("f2", "الفرق بين التهديد والثغرة والمخاطرة", "كيف يترابط المهاجمون مع نقاط الضعف لحماية الأنظمة."),
      L("f3", "كلمات المرور والمصادقة الثنائية (2FA)", "لماذا تحميك العبارات الطويلة ورموز OTP من الاختراق."),
      L("f4", "كشف التصيد الاحتيالي (Phishing)", "فحص المرسل، لغة التهديد، والروابط المشبوهة بدقة."),
    ],
  },
  {
    name: "Networking basics",
    nameAr: "أساسيات الشبكات والاتصالات",
    level: "Beginner",
    summary: "How data travels across the internet.",
    summaryAr: "كيف تنتقل البيانات عبر الإنترنت وبروتوكولات التوجيه.",
    lessons: [
      L("n1", "عناوين IP ونظام أسماء النطاقات DNS", "كيف تتحول الأسماء (مثل google.com) إلى عناوين رقمية."),
      L("n2", "بروتوكولات TCP و UDP والمنافذ Ports", "الاتصالات، الخدمات الشبكية، ومعنى المنفذ المفتوح."),
      L("n3", "أمان أجهزة الراوتر وشبكات Wi-Fi", "تشفير WPA3، كلمات المرور الافتراضية، وتحديث البرامج الثابتة."),
    ],
  },
  {
    name: "Linux fundamentals",
    nameAr: "أساسيات نظام لينكس (Linux) وسطر الأوامر",
    level: "Beginner",
    summary: "The command line every defender uses.",
    summaryAr: "سطر الأوامر والأذونات وإدارة الخدمات في لينكس.",
    lessons: [
      L("l1", "هيكلية الملفات والأدلة في Linux", "التنقل في النظام بالأوامر ls و cd و pwd."),
      L("l2", "المستخدمون وصلاحيات الوصول (chmod)", "مبدأ الحد الأدنى من الامتيازات وصلاحيات rwx."),
      L("l3", "مراقبة العمليات وسجلات النظام Logs", "اكتشاف ما يحدث وفحص سجلات الأمان والأخطاء."),
    ],
  },
  {
    name: "Web security",
    nameAr: "أمان تطبيقات ومواقع الويب",
    level: "Intermediate",
    summary: "Common web vulnerabilities and defenses.",
    summaryAr: "أشهر ثغرات الويب وكيفية التصدي لها وفق معايير OWASP.",
    lessons: [
      L("w1", "تشفير HTTPS وشهادات الأمان SSL/TLS", "كيف يحمي القفل الأخضر بياناتك وما لا يستطيع حمايته."),
      L("w2", "ثغرات حقن البيانات (SQLi & XSS)", "أهمية فلترة وتطهير مدخلات المستخدم قبل معالجتها."),
      L("w3", "جلسات التصفح وملفات الكوكيز Cookies", "حماية الجلسة بخصائص Secure و HttpOnly و SameSite."),
      L("w4", "قائمة OWASP Top 10 العالمية", "أخطر 10 ثغرات أمنية تهدد المواقع الإلكترونية عالمياً."),
    ],
  },
  {
    name: "Cryptography fundamentals",
    nameAr: "مبادئ علم التشفير (Cryptography)",
    level: "Intermediate",
    summary: "Hashing, encryption, and signatures.",
    summaryAr: "التشفير المتناظر وغير المتناظر والتجزئة والتوقيع الرقمي.",
    lessons: [
      L("c1", "التشفير المتناظر وغير المتناظر (AES vs RSA)", "المفاتيح المشتركة مقابل زوج المفاتيح العام والخاص."),
      L("c2", "دوال التجزئة (Hashing) وتخزين كلمات السر", "أهمية التجزئة البطيئة مع إضافة Salt للحماية من التسريب."),
      L("c3", "التوقيعات والشهادات الرقمية", "إثبات هوية صاحب الرسالة وسلامة محتواها من التغيير."),
    ],
  },
  {
    name: "Privacy and digital safety",
    nameAr: "الخصوصية والأمان الرقمي الشخصي",
    level: "Beginner",
    summary: "Protecting your personal information.",
    summaryAr: "حماية بياناتك وهويتك وبصمتك الرقمية على الإنترنت.",
    lessons: [
      L("p1", "بصمتك الرقمية (Digital Footprint)", "ماذا تشارك على الإنترنت ومن يستطيع الوصول إليه."),
      L("p2", "أذونات التطبيقات في الهواتف الذكية", "منح التطبيقات فقط الصلاحيات التي تحتاجها فعلاً."),
      L("p3", "البيانات الوصفية للصور (EXIF)", "إزالة إحداثيات الموقع الجغرافي قبل النشر على الإنترنت."),
    ],
  },
  {
    name: "Incident response",
    nameAr: "الاستجابة للحوادث الأمنية والتعافي",
    level: "Advanced",
    summary: "What to do when something goes wrong.",
    summaryAr: "خطة الطوارئ والتعامل عند حدوث اختراق أو تهديد أمني.",
    lessons: [
      L("i1", "الاستعداد والتخطيط المسبق", "النسخ الاحتياطية وجهات الاتصال قبل وقوع أي حادث أمني."),
      L("i2", "الكشف والتحليل الأمني", "تأكيد نطاق الحادث ومعرفة كيفية حدوث التسلل."),
      L("i3", "الاحتواء والاستئصال والتعافي", "عزل الأنظمة المصابة واستعادة البيانات النظيفة بأمان."),
    ],
  },
];

// Interactive Quiz Questions
const QUIZ_QUESTIONS = [
  {
    q: "ما هي أضمن وسيلة لحماية حساباتك حتى لو تم تسريب كلمة مرورك؟",
    options: ["تغيير اسم المستخدم", "تفعيل المصادقة الثنائية (2FA)", "استخدام متصفح مخفي", "مسح سجل التصفح"],
    correct: 1,
    exp: "المصادقة الثنائية تطلب خط دفاع إضافي (رمز OTP) لا يملكه المهاجم حتى لو سرق كلمة المرور.",
  },
  {
    q: "أي من هذه الروابط يعتبر مؤشراً واضحاً على التصيد الاحتيالي؟",
    options: ["https://google.com/search", "https://g00gle-security-verify.net/login", "https://wikipedia.org", "https://github.com"],
    correct: 1,
    exp: "الروابط التي تضع أصفاراً بدلاً من الحروف أو نطاقات ثانوية مضللة هي روابط تصيد احتيالي.",
  },
  {
    q: "ما هي الخاصية الأمنية التي تمنع قراءة ملفات الكوكيز عبر أكواد JavaScript الخبيثة؟",
    options: ["HttpOnly", "SameSite", "Secure", "Domain"],
    correct: 0,
    exp: "خاصية HttpOnly تمنع هجمات XSS من سرقة كوكيز الجلسة عبر السكربتات.",
  },
  {
    q: "ما هي أفضل طريقة لإنشاء كلمة مرور قوية؟",
    options: ["تاريخ ميلادك مكرراً", "كلمة واحدة سهلة", "عبارة مرور طويلة (Passphrase) من 4 كلمات وأرقام", "اسمك مع رقم 123"],
    correct: 2,
    exp: "العبارات الطويلة ترفع تعقيد التخمين والكسر العشوائي إلى مليارات السنين.",
  },
];

function Academy() {
  const { isAr } = useTranslation();
  const [done, setDone] = useLocal<string[]>("fw-progress", []);
  const [level, setLevel] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const totalLessons = COURSES.reduce((a, c) => a + c.lessons.length, 0);
  const toggle = (id: string) =>
    setDone(done.includes(id) ? done.filter((x) => x !== id) : [...done, id]);

  const scoreCount = Object.entries(quizAnswers).filter(
    ([qIdx, optIdx]) => QUIZ_QUESTIONS[Number(qIdx)].correct === optIdx
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAr ? "أكاديمية ومكتبة عالم المستقبل" : "Academy & Cybersecurity Library"}
        subtitle={
          isAr
            ? "منظومة تعليمية متكاملة: دورات منهجية مع تتبع الإنجاز، مكتبة كتب ووثائق رقمية، وورش عمل واختبارات قياس المعرفة."
            : "Structured curriculum with progress tracking, digital books, video lectures, and interactive challenges."
        }
      >
        <div className="mt-5 max-w-md">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>{isAr ? "نسبة إنجاز الدروس في الأكاديمية" : "Curriculum Completion"}</span>
            <span className="font-mono font-bold text-primary">
              {done.length}/{totalLessons} ({Math.round((done.length / totalLessons) * 100)}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(done.length / totalLessons) * 100}%` }}
            />
          </div>
        </div>
      </PageHeader>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-lg grid-cols-3 rounded-full p-1 bg-muted">
          <TabsTrigger value="courses" className="rounded-full text-xs sm:text-sm font-semibold">
            <GraduationCap className="me-2 h-4 w-4" />
            {isAr ? "الدروس والدورات" : "Courses"}
          </TabsTrigger>
          <TabsTrigger value="library" className="rounded-full text-xs sm:text-sm font-semibold">
            <BookOpen className="me-2 h-4 w-4" />
            {isAr ? "المكتبة والكتب" : "Books & Library"}
          </TabsTrigger>
          <TabsTrigger value="quiz" className="rounded-full text-xs sm:text-sm font-semibold">
            <Award className="me-2 h-4 w-4" />
            {isAr ? "اختبار المستوى" : "Knowledge Quiz"}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Interactive Courses */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`h-9 rounded-full border px-5 text-xs sm:text-sm font-semibold transition ${
                  level === l ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
                }`}
              >
                {l === "All" ? (isAr ? "جميع المستويات" : "All Levels") : l}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {COURSES.filter((c) => level === "All" || c.level === level).map((c) => {
              const n = c.lessons.filter((x) => done.includes(x.id)).length;
              return (
                <section key={c.name} className="panel p-6 rounded-3xl border border-border bg-card shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-bold text-base sm:text-lg">{isAr ? c.nameAr : c.name}</h2>
                    <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                      {c.level}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{isAr ? c.summaryAr : c.summary}</p>
                  <div className="my-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(n / c.lessons.length) * 100}%` }}
                    />
                  </div>
                  <ul className="space-y-1.5 pt-1">
                    {c.lessons.map((x) => (
                      <li key={x.id}>
                        <button
                          onClick={() => toggle(x.id)}
                          className="flex w-full gap-3 rounded-2xl p-2.5 text-left hover:bg-accent transition"
                          dir={isAr ? "rtl" : "ltr"}
                        >
                          {done.includes(x.id) ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          ) : (
                            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs sm:text-sm font-semibold">{x.title}</span>
                            <span className="block text-[11px] text-muted-foreground mt-0.5">{x.desc}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 2: Integrated Digital Books & Library */}
        <TabsContent value="library" className="space-y-6">
          <div className="panel p-5 rounded-3xl border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>{isAr ? "مكتبة الكتب والمراجع الرقمية المعتمدة" : "Curated Digital Books & Standards"}</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isAr
                  ? "كتب وأدلة ومصادر رسمية قابلة للقراءة والتحميل مجاناً من أرقى الهيئات العالمية (NIST, OWASP, CyBOK)."
                  : "Freely accessible books, frameworks, and textbooks from leading standards bodies."}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-bold text-primary font-mono shrink-0">
              {BOOKS.length} {isAr ? "كتاب ومرجع" : "Books"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BOOKS.map((b) => (
              <div
                key={b.title}
                className="panel p-5 rounded-3xl border border-border bg-card flex flex-col justify-between hover:border-primary/50 transition hover:glow space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {b.category}
                    </span>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                      {b.level}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base leading-snug">{b.title}</h4>
                  <div className="text-xs text-primary font-medium mt-1">{b.by}</div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">{b.desc}</p>
                </div>

                <div className="flex items-center gap-2 border-t border-border pt-3">
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold hover:bg-accent transition"
                  >
                    <span>{isAr ? "فتح المرجع" : "Read Online"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {b.pdf && (
                    <a
                      href={b.pdf}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-3 text-xs font-bold text-primary hover:bg-primary/20 transition"
                      title={isAr ? "تحميل نسخة PDF" : "Download PDF"}
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>PDF</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Videos Subsection */}
          <div className="pt-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <span>{isAr ? "الورش والفيديوهات التعليمية الموصى بها" : "Recommended Video Lectures"}</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {VIDEOS.slice(0, 6).map((v) => (
                <div key={v.title} className="panel p-5 rounded-3xl border border-border bg-card space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{v.category}</span>
                    <h4 className="font-bold text-sm mt-2">{v.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{v.desc}</p>
                  </div>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold hover:bg-accent transition w-full"
                  >
                    <Video className="h-3.5 w-3.5 text-primary" />
                    <span>{isAr ? "مشاهدة الدورة" : "Watch Lecture"}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Interactive Knowledge Quiz */}
        <TabsContent value="quiz" className="space-y-6">
          <div className="panel p-6 rounded-3xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>{isAr ? "تحدي واختبار المعرفة السيبرانية" : "Cybersecurity Knowledge Check"}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAr ? "أجب عن الأسئلة التالية لقياس معرفتك والحصول على تقييم فوري." : "Test your security instincts and get instant feedback."}
                </p>
              </div>
              {quizSubmitted && (
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">{isAr ? "النتيجة النهائية" : "Your Score"}</span>
                  <div className="text-xl font-mono font-extrabold text-primary">
                    {scoreCount}/{QUIZ_QUESTIONS.length}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6 pt-2">
              {QUIZ_QUESTIONS.map((q, idx) => {
                const selected = quizAnswers[idx];
                const isCorrect = selected === q.correct;

                return (
                  <div key={idx} className="p-4 rounded-2xl border border-border bg-background/60 space-y-3">
                    <div className="font-semibold text-sm flex items-start gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span>{q.q}</span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selected === optIdx;
                        let btnStyle = "border-border hover:bg-accent";
                        if (quizSubmitted) {
                          if (optIdx === q.correct) btnStyle = "border-success bg-success/10 text-success font-bold";
                          else if (isChosen) btnStyle = "border-destructive bg-destructive/10 text-destructive";
                        } else if (isChosen) {
                          btnStyle = "border-primary bg-primary/10 text-primary font-bold";
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => setQuizAnswers({ ...quizAnswers, [idx]: optIdx })}
                            className={`p-3 rounded-xl border text-xs text-start transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === q.correct && <CheckCircle2 className="h-4 w-4 text-success" />}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="text-xs text-muted-foreground p-2 rounded-xl bg-muted/40 border border-border/60">
                        💡 {q.exp}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-center">
              {!quizSubmitted ? (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                  className="glow inline-flex h-11 items-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                >
                  <Award className="h-4 w-4" />
                  <span>{isAr ? "اعتماد الإجابات وعرض النتيجة" : "Submit Quiz"}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-8 text-sm font-semibold hover:bg-accent transition"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{isAr ? "إعادة الاختبار" : "Retake Quiz"}</span>
                </button>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
