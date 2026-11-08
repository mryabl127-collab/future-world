import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { Mail, Lock, User, ShieldCheck, LogOut, CheckCircle2, Sparkles } from "lucide-react";

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, loginWithEmail, logout } = useAuth();
  const { t, isAr } = useTranslation();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await loginWithEmail(email, password, isSignUp ? name : undefined);
      if (res.success) {
        setSuccessMsg(isSignUp ? t("signupSuccess") : t("loginSuccess"));
        setTimeout(() => {
          onOpenChange(false);
          setSuccessMsg("");
          setEmail("");
          setPassword("");
          setName("");
        }, 1200);
      } else {
        setError(res.error || "فشل تسجيل الدخول، يرجى المحاولة ثانية");
      }
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-card p-6" dir={isAr ? "rtl" : "ltr"}>
        <DialogHeader>
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            {user ? (isAr ? "الملف الشخصي والحساب" : "My Profile & Account") : isSignUp ? t("signup") : t("login")}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {user ? (isAr ? "معلومات أمان حسابك في عالم المستقبل" : "Your Future World security profile") : t("authSubtitle")}
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <div className="space-y-5 py-2">
            <div className="rounded-xl border border-border bg-background p-4 text-center">
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-lg">
                {user.avatarSeed}
              </div>
              <h3 className="font-bold text-base">{user.name}</h3>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success border border-success/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {user.role}
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/30">
                  {user.provider}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border p-3 text-xs space-y-1.5 bg-muted/30">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isAr ? "مستوى الأمان الرقمي:" : "Security Score:"}</span>
                <span className="font-bold text-primary">{user.securityScore}% ({isAr ? "ممتاز" : "Optimal"})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isAr ? "تاريخ التسجيل:" : "Registered:"}</span>
                <span>{user.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isAr ? "التشفير والمزامنة:" : "Encryption:"}</span>
                <span className="text-success font-medium">{isAr ? "محمي ومحلي" : "Local & AES-GCM"}</span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                onOpenChange(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/20 transition"
            >
              <LogOut className="h-4 w-4" /> {t("logout")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="rounded-lg border border-success/40 bg-success/10 p-3 text-xs text-success flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> {successMsg}
              </div>
            )}

            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">{t("nameLabel")}</label>
                <div className="relative">
                  <User className="absolute top-3 start-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    className="w-full h-10 rounded-lg border border-input bg-background ps-9 pe-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">{t("emailLabel")}</label>
              <div className="relative">
                <Mail className="absolute top-3 start-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="w-full h-10 rounded-lg border border-input bg-background ps-9 pe-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">{t("passwordLabel")}</label>
              <div className="relative">
                <Lock className="absolute top-3 start-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className="w-full h-10 rounded-lg border border-input bg-background ps-9 pe-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-md glow flex items-center justify-center gap-2"
            >
              {loading ? (isAr ? "جاري المعالجة..." : "Processing...") : isSignUp ? t("signup") : t("login")}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-xs text-primary hover:underline font-medium"
              >
                {isSignUp ? t("haveAccount") : t("needAccount")}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
