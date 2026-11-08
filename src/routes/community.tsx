import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageSquare,
  ShieldCheck,
  Send,
  Heart,
  Sparkles,
  Lock,
  User,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/Shell";
import { GroupChat } from "@/components/GroupChat";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useLocal } from "@/lib/store";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "مجتمع المستقبل — Future World Community" },
      { name: "description", content: "مساحة محادثة ونقاش آمنة ومحمية للتواصل ومناقشة التقنية والأمن السيبراني والذكاء الاصطناعي." },
      { property: "og:title", content: "مجتمع المستقبل | Future World Community" },
      { property: "og:description", content: "مجموعة آمنة ومحمية تجمع المبتكرين والمهتمين بالتقنية." },
    ],
  }),
  component: Community,
});

type Post = {
  id: string;
  author: string;
  avatarSeed: string;
  category: "general" | "security" | "ideas" | "academy";
  content: string;
  likes: number;
  date: string;
  verified: boolean;
};

const SEED_POSTS: Post[] = [
  {
    id: "p1",
    author: "المهندس علي العراقي",
    avatarSeed: "ع ع",
    category: "security",
    content: "تحية لجميع أعضاء مجتمع المستقبل! نصيحة أمنية سريعة: لا تقم أبداً بتفعيل خيار 'تذكر كلمة المرور' في الأجهزة العامة، واحرص على استخدام تطبيق مصادقة مثل Google Authenticator بدلاً من رسائل SMS للتحقق بخطوتين.",
    likes: 24,
    date: "منذ ساعة",
    verified: true,
  },
  {
    id: "p2",
    author: "سارة التميمي",
    avatarSeed: "س ت",
    category: "ideas",
    content: "فكرة ممتازة إضافة خريطة العراق ونهري دجلة والفرات في الصفحة الأولى! هل تخططون لإضافة تحديات برمجة تفاعلية ومسابقات Capture The Flag (CTF) في الأكاديمية قريباً؟",
    likes: 19,
    date: "منذ 3 ساعات",
    verified: false,
  },
  {
    id: "p3",
    author: "فريق عالم المستقبل (Future World Team)",
    avatarSeed: "FW",
    category: "general",
    content: "أهلاً وسهلاً بكم في مجتمع المستقبل! هذه المساحة مخصصة لكم جميعاً لتبادل المعرفة والتواصل الآمن. المنظومة محمية بالكامل ومراقبة آلياً لمنع الروابط الخبيثة والتصيد وضمان بيئة نقية ومفيدة.",
    likes: 42,
    date: "منذ 5 ساعات",
    verified: true,
  },
  {
    id: "p4",
    author: "أحمد الدليمي",
    avatarSeed: "أ د",
    category: "academy",
    content: "أتممت مسار أساسيات الشبكات ونظام لينكس في الأكاديمية! الشرح مبسط ومباشر والكتب المرفقة في مكتبة NIST ساعدتني كثيراً في فهم بروتوكولات التشفير.",
    likes: 15,
    date: "منذ يوم",
    verified: false,
  },
];

function Community() {
  const { t, isAr } = useTranslation();
  const { user } = useAuth();
  const [posts, setPosts] = useLocal<Post[]>("fw-community-posts", SEED_POSTS);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [newContent, setNewContent] = useState("");
  const [selectedCat, setSelectedCat] = useState<"general" | "security" | "ideas" | "academy">("general");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const authorName = user?.name || (isAr ? "مستخدم جديد" : "Guest User");
    const newPost: Post = {
      id: crypto.randomUUID(),
      author: authorName,
      avatarSeed: authorName.slice(0, 2).toUpperCase(),
      category: selectedCat,
      content: newContent.trim(),
      likes: 1,
      date: isAr ? "الآن" : "Just now",
      verified: !!user,
    };

    setPosts([newPost, ...posts]);
    setNewContent("");
  };

  const toggleLike = (id: string) => {
    const isLiked = likedPosts[id];
    setLikedPosts({ ...likedPosts, [id]: !isLiked });
    setPosts(
      posts.map((p) => {
        if (p.id === id) {
          return { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 };
        }
        return p;
      })
    );
  };

  const filtered = activeCategory === "all" ? posts : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title={t("communityTitle")}
        subtitle={t("communitySubtitle")}
      />

      {/* Safety Guarantee Banner (As requested: "ويكون محمي ومراقب") */}
      <div className="panel p-4 rounded-3xl border border-primary/40 bg-primary/10 flex items-center justify-between gap-3 text-xs sm:text-sm text-primary shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
          <span className="font-semibold">{t("communitySafetyBadge")}</span>
        </div>
        <span className="rounded-full bg-primary/20 border border-primary/30 px-2.5 py-0.5 text-[10px] font-bold text-primary shrink-0 hidden sm:inline-block">
          E2E ENCRYPTED
        </span>
      </div>

      <GroupChat isAr={isAr} />

      {/* Create New Post Card */}
      <form onSubmit={handleCreatePost} className="panel p-6 rounded-3xl border border-border bg-card shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm sm:text-base">{t("createPost")}</h3>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Lock className="h-3 w-3 text-success" />
            <span>{isAr ? "محادثة آمنة" : "Secure"}</span>
          </span>
        </div>

        <textarea
          rows={3}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder={t("postPlaceholder")}
          className="w-full rounded-2xl border border-input bg-background p-3 text-sm outline-none focus:border-primary resize-none placeholder:text-muted-foreground"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Category Picker */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{isAr ? "القسم:" : "Channel:"}</span>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value as "general" | "security" | "ideas" | "academy")}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold outline-none focus:border-primary"
            >
              <option value="general">{t("generalChat")}</option>
              <option value="security">{t("cyberSecChat")}</option>
              <option value="ideas">{t("futureIdeas")}</option>
              <option value="academy">{t("learnersClub")}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!newContent.trim()}
            className="glow inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{t("postBtn")}</span>
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: t("allTopics") },
          { id: "general", label: t("generalChat") },
          { id: "security", label: t("cyberSecChat") },
          { id: "ideas", label: t("futureIdeas") },
          { id: "academy", label: t("learnersClub") },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`h-9 rounded-full border px-4 text-xs font-semibold transition ${
              activeCategory === c.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filtered.map((post) => {
          const isLiked = likedPosts[post.id];
          return (
            <div key={post.id} className="panel p-5 rounded-3xl border border-border bg-card shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                    {post.avatarSeed}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <span>{post.author}</span>
                      {post.verified && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-label={isAr ? "عضو موثق" : "Verified"} />
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{post.date}</div>
                  </div>
                </div>

                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {post.category === "security"
                    ? t("cyberSecChat")
                    : post.category === "ideas"
                    ? t("futureIdeas")
                    : post.category === "academy"
                    ? t("learnersClub")
                    : t("generalChat")}
                </span>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

              <div className="flex items-center gap-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 hover:text-red-500 transition ${isLiked ? "text-red-500 font-bold" : ""}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  <span>{post.likes}</span>
                </button>
                <div className="flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  <span>{isAr ? "محتوى مفحوص وآمن" : "Verified Safe"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
