import { Home, ScanSearch, Bot, History, GraduationCap, Bell, Settings, Library, Wifi, ShieldCheck } from "lucide-react";

export const NAV = [
  { to: "/", label: "Home", ar: "الرئيسية", icon: Home, desc: "Overview" },
  { to: "/scan", label: "SCAN", ar: "الفحص", icon: ScanSearch, desc: "Inspect links and image metadata" },
  { to: "/assistant", label: "AI Assistant", ar: "المساعد الذكي", icon: Bot, desc: "Ask security questions in Arabic or English" },
  { to: "/history", label: "Scan History", ar: "سجل الفحص", icon: History, desc: "Your past inspections, stored on this device" },
  { to: "/academy", label: "Cybersecurity Academy", ar: "أكاديمية الأمن", icon: GraduationCap, desc: "Structured lessons from beginner to advanced" },
  { to: "/alerts", label: "Alerts", ar: "التنبيهات", icon: Bell, desc: "Educational security notifications" },
  { to: "/settings", label: "Settings & Profile", ar: "الإعدادات", icon: Settings, desc: "Language, theme, and privacy" },
  { to: "/library", label: "Cybersecurity Library", ar: "المكتبة", icon: Library, desc: "Videos, books, and PDF resources" },
  { to: "/internet", label: "Internet Check", ar: "فحص الإنترنت", icon: Wifi, desc: "Measure real connection latency" },
  { to: "/device", label: "Device Scan & Cleaner", ar: "فحص الجهاز", icon: ShieldCheck, desc: "A safe device-security checklist" },
] as const;
