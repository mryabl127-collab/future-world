import { Link } from "@tanstack/react-router";
import { Menu, Globe, UserCheck, LogIn } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NAV } from "@/lib/nav";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { AuthModal } from "./AuthModal";
import { Logo } from "./Logo";

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { lang, setLang, t, isAr } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen" dir={isAr ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-full border border-border text-primary hover:bg-accent transition">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side={isAr ? "right" : "left"} className="w-[85vw] max-w-xs overflow-y-auto border-border bg-sidebar p-4" dir={isAr ? "rtl" : "ltr"}>
                <SheetTitle className="mb-4 flex items-center gap-2 font-display text-base tracking-widest">
                  <Logo className="h-7 w-7" /> FUTURE WORLD
                </SheetTitle>
                <nav className="flex flex-col gap-2">
                  {NAV.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: true }}
                      className="flex h-12 items-center gap-3 rounded-xl border border-border px-3 text-sm font-medium text-sidebar-foreground transition hover:bg-sidebar-accent"
                      activeProps={{ className: "bg-sidebar-accent text-primary glow border-primary/40 font-semibold" }}
                    >
                      <n.icon className="h-4 w-4 shrink-0 text-primary" />
                      <div className="flex flex-col truncate">
                        <span className="truncate">{isAr ? n.ar : n.label}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{isAr ? n.descAr : n.desc}</span>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to="/settings"
                    onClick={() => setOpen(false)}
                    className="flex h-12 items-center gap-3 rounded-xl border border-border px-3 text-sm font-medium text-sidebar-foreground transition hover:bg-sidebar-accent mt-2 pt-2 border-t"
                  >
                    <span className="text-primary text-base">⚙️</span>
                    <span>{t("navSettings")}</span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex min-w-0 items-center gap-2">
              <Logo className="h-7 w-7 shrink-0" />
              <span className="truncate font-display text-sm font-semibold tracking-[0.2em]">FUTURE <span className="text-primary">WORLD</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Red Languages Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/20 hover:text-red-400 transition"
                  title={isAr ? "اختيار اللغة" : "Select Language"}
                >
                  <Globe className="h-3.5 w-3.5 text-red-500" />
                  <span>{t("languages")}</span>
                  <span className="opacity-70 text-[10px]">({lang.toUpperCase()})</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isAr ? "start" : "end"} className="w-40 border-border bg-card">
                <DropdownMenuItem
                  onClick={() => setLang("ar")}
                  className={`cursor-pointer flex items-center justify-between ${lang === "ar" ? "text-primary font-bold" : ""}`}
                >
                  <span>العربية (Arabic)</span>
                  {lang === "ar" && <span>✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLang("en")}
                  className={`cursor-pointer flex items-center justify-between ${lang === "en" ? "text-primary font-bold" : ""}`}
                >
                  <span>English (الإنجليزية)</span>
                  {lang === "en" && <span>✓</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Login / Profile Button */}
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition"
            >
              {user ? (
                <>
                  <UserCheck className="h-3.5 w-3.5 text-success" />
                  <span className="truncate max-w-[80px] sm:max-w-[120px]">{user.name}</span>
                </>
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5" />
                  <span>{t("login")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">{children}</main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        FUTURE WORLD · {isAr ? "منصة عالم المستقبل للأمن السيبراني والذكاء الاصطناعي" : "Cybersecurity & AI education platform"}
      </footer>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-8">
      <div className="mb-3 h-1 w-16 rounded-full bg-primary" />
      <h1 className="text-2xl font-semibold md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
      {children}
    </div>
  );
}

export function DemoBadge({ label = "LIVE" }: { label?: string }) {
  return <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-primary">{label}</span>;
}
