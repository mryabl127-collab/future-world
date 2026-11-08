import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV } from "@/lib/nav";
import { Logo } from "./Logo";

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-lg border border-border text-primary hover:bg-accent">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-xs overflow-y-auto border-border bg-sidebar p-4">
              <SheetTitle className="mb-4 flex items-center gap-2 font-display text-base tracking-widest"><Logo className="h-7 w-7" /> FUTURE WORLD</SheetTitle>
              <nav className="flex flex-col gap-2">
                {NAV.map((n) => (
                  <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }}
                    className="flex h-12 items-center gap-3 rounded-lg border border-border px-3 text-sm font-medium text-sidebar-foreground transition hover:bg-sidebar-accent"
                    activeProps={{ className: "bg-sidebar-accent text-primary glow" }}>
                    <n.icon className="h-4 w-4 shrink-0 text-primary" /> <span className="truncate">{n.label}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <Logo className="h-7 w-7 shrink-0" />
            <span className="truncate font-display text-sm font-semibold tracking-[0.25em]">FUTURE WORLD</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">{children}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">FUTURE WORLD · Cybersecurity education platform</footer>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-8">
      <div className="mb-3 h-px w-16 bg-primary" />
      <h1 className="text-2xl font-semibold md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
      {children}
    </div>
  );
}

export function DemoBadge({ label = "DEMO" }: { label?: string }) {
  return <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-warning">{label}</span>;
}
