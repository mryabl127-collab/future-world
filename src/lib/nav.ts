import { Home, ScanSearch, Bot, GraduationCap, Bell, Wifi, ShieldCheck, MessageSquare } from "lucide-react";

export const NAV = [
  { to: "/", label: "Home", ar: "الرئيسية", icon: Home, desc: "Overview and Iraqi digital map", descAr: "نظرة عامة وخريطة العراق الرقمية" },
  { to: "/scan", label: "SCAN", ar: "فحص الروابط والصور", icon: ScanSearch, desc: "Deep URL audit & image metadata", descAr: "فحص وتدقيق الروابط والصور والسجل المدمج" },
  { to: "/assistant", label: "AI Assistant", ar: "المساعد الذكي الشامل", icon: Bot, desc: "Ask questions in all fields & cyber defense", descAr: "ذكاء اصطناعي شامل يجيب عن كل شيء" },
  { to: "/academy", label: "Academy & Library", ar: "الأكاديمية والمكتبة", icon: GraduationCap, desc: "Curriculum, digital books & certifications", descAr: "دروس تعليمية، كتب رقمية، وورش متقدمة" },
  { to: "/device", label: "Device Scan & Cleaner", ar: "فحص وتنظيف الجهاز", icon: ShieldCheck, desc: "Smart circular diagnostic cleaner", descAr: "فحص دائري لعرض المفيد وغير المفيد بأمان" },
  { to: "/internet", label: "Internet Check", ar: "فحص الإنترنت المتقدم", icon: Wifi, desc: "Deep latency, DNS, and connection audit", descAr: "فحص السرعة والبينغ وأمان DNS" },
  { to: "/community", label: "Future Community", ar: "مجتمع المستقبل", icon: MessageSquare, desc: "Secure discussions & tech exchange", descAr: "مساحة محادثة آمنة للنقاش ومشاركة الأفكار" },
  { to: "/alerts", label: "Alerts", ar: "التنبيهات الأمنية", icon: Bell, desc: "Educational security notifications", descAr: "تنبيهات الحماية والتوعية الرقمية" },
] as const;
