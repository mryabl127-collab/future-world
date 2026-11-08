import { useEffect, useState } from "react";

export type Language = "ar" | "en";

export const DICTIONARY = {
  ar: {
    brand: "عالم المستقبل",
    brandDesc: "منصة تعليمية للأمن السيبراني والذكاء الاصطناعي",
    navHome: "الرئيسية",
    navScan: "فحص الروابط والصور",
    navAssistant: "المساعد الذكي",
    navAcademy: "الأكاديمية والمكتبة",
    navDevice: "تنظيف وفحص الجهاز",
    navInternet: "فحص الإنترنت",
    navCommunity: "مجتمع المستقبل",
    navAlerts: "التنبيهات الأمنية",
    navSettings: "الإعدادات",
    
    languages: "اللغات",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    myAccount: "حسابي",
    logout: "تسجيل الخروج",
    
    // Home Page
    heroTitle: "عالم المستقبل",
    heroSubtitle: "بوابتك المتقدمة للحماية الرقمية، الذكاء الاصطناعي، والتعليم التقني الشامل",
    startScan: "بدء فحص الروابط",
    openAcademy: "دخول الأكاديمية",
    exploreFeatures: "استكشف الأدوات والخدمات",
    iraqMapTitle: "خريطة العراق والنشاط الرقمي",
    tigrisRiver: "نهر دجلة (الأزرق)",
    euphratesRiver: "نهر الفرات (الأحمر)",
    shattAlArab: "شط العرب",
    visitorsNote: "إحصائيات إرشادية وتوزيع الزوار في المحافظات العراقية",
    settingsCard: "الإعدادات والملف الشخصي",
    settingsCardDesc: "تخصيص اللغة والمظهر ومفاتيح الذكاء الاصطناعي ومسح البيانات",

    // Scan
    scanTitle: "كشف وفحص الروابط والصور",
    scanSubtitle: "تحليل دقيق وشامل للروابط المشبوهة والبيانات الوصفية للصور مباشرة في جهازك بأعلى معايير الخصوصية",
    tabUrl: "فحص الروابط",
    tabImage: "فحص الصور",
    tabHistory: "سجل الفحوصات السابقة",
    inspectUrlBtn: "فحص الرابط الآن",
    urlPlaceholder: "ضع الرابط هنا... مثل https://example.com/login",
    previousImageResults: "إظهار النواتج السابقة للصور",
    clearHistory: "مسح السجل",
    noHistory: "لا توجد فحوصات مسجلة حتى الآن",
    
    // Assistant
    aiTitle: "المساعد الذكي الشامل",
    aiSubtitle: "اسأل عن أي شيء: الذكاء الاصطناعي، العلوم، البرمجة، الحماية الرقمية، والحلول اليومية",
    aiPlaceholder: "اكتب سؤالك هنا في أي مجال...",
    send: "إرسال",
    stop: "إيقاف",
    copy: "نسخ",
    copied: "تم النسخ!",
    
    // Device
    deviceTitle: "فحص وتنظيف الجهاز",
    deviceSubtitle: "فحص دائري ذكي لتشخيص ذاكرة وكاش الجهاز وإظهار العناصر المفيدة وغير المفيدة بأمان تام",
    startDeviceScan: "بدء فحص وتشخيص الجهاز",
    scanningInProgress: "جاري الفحص الدائري والتشخيص...",
    scanComplete: "اكتمل الفحص بنجاح!",
    usefulItems: "العناصر المفيدة والآمنة (ملفات وبيانات النظام الأساسية)",
    uselessItems: "العناصر غير المفيدة (المخلفات والملفات المؤقتة المقترحة للمراجعة)",
    safeNotice: "أمان تام: هذا الفحص تحليلي لعرض المعلومات بدقة ولا يقوم بحذف ملفاتك تلقائياً لضمان سلامة بياناتك الهامة.",

    // Community
    communityTitle: "مجتمع المستقبل",
    communitySubtitle: "مساحة حوارية آمنة ومحمية للتواصل ومناقشة التقنية والذكاء الاصطناعي وتبادل الخبرات",
    createPost: "نشر مشاركة جديدة",
    postPlaceholder: "شارك فكرتك أو استفسارك مع مجتمع المستقبل...",
    postBtn: "نشر في المجتمع",
    communitySafetyBadge: "مجتمع محمي ومراقب بأحدث معايير الأمان والتشفير لحماية خصوصيتك",
    allTopics: "جميع المواضيع",
    generalChat: "النقاش العام",
    cyberSecChat: "استشارات الأمان",
    futureIdeas: "أفكار المستقبل",
    learnersClub: "ركن المتعلمين",

    // Auth
    authTitle: "تسجيل الدخول إلى عالم المستقبل",
    authSubtitle: "ادخل بأمان باستخدام أي بريد إلكتروني أو أنشئ حساباً جديداً في ثوانٍ",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "name@example.com (Gmail, Outlook, Yahoo...)",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "••••••••",
    nameLabel: "الاسم الكامل",
    namePlaceholder: "اسم المستخدم",
    haveAccount: "لديك حساب بالفعل؟ تسجيل الدخول",
    needAccount: "ليس لديك حساب؟ إنشاء حساب جديد",
    loginSuccess: "تم تسجيل الدخول بنجاح!",
    signupSuccess: "تم إنشاء حسابك بأمان ومرحباً بك!",
  },
  en: {
    brand: "FUTURE WORLD",
    brandDesc: "Cybersecurity & AI Educational Platform",
    navHome: "Home",
    navScan: "Link & Image Inspection",
    navAssistant: "AI Assistant",
    navAcademy: "Academy & Library",
    navDevice: "Device Scan & Cleaner",
    navInternet: "Internet Check",
    navCommunity: "Future Community",
    navAlerts: "Security Alerts",
    navSettings: "Settings",
    
    languages: "Languages",
    login: "Sign In",
    signup: "Sign Up",
    myAccount: "My Account",
    logout: "Log Out",

    // Home Page
    heroTitle: "FUTURE WORLD",
    heroSubtitle: "Your advanced gateway for digital security, AI, and comprehensive technical education",
    startScan: "Start Link Scan",
    openAcademy: "Open Academy",
    exploreFeatures: "Explore Tools & Services",
    iraqMapTitle: "Iraq Map & Regional Activity",
    tigrisRiver: "Tigris River (Blue)",
    euphratesRiver: "Euphrates River (Red)",
    shattAlArab: "Shatt al-Arab",
    visitorsNote: "Regional digital activity and visitor distribution across Iraqi provinces",
    settingsCard: "Settings & Profile",
    settingsCardDesc: "Language preferences, appearance, AI keys, and local data management",

    // Scan
    scanTitle: "Link & Image Inspection (SCAN)",
    scanSubtitle: "Deep URL security analyzer and on-device photo metadata inspection with zero data tracking",
    tabUrl: "Link Inspector",
    tabImage: "Image Inspector",
    tabHistory: "Inspection History",
    inspectUrlBtn: "Inspect Link Now",
    urlPlaceholder: "Enter link here... e.g. https://example.com/login",
    previousImageResults: "Show Past Image Results",
    clearHistory: "Clear History",
    noHistory: "No scan history recorded yet",

    // Assistant
    aiTitle: "Comprehensive AI Assistant",
    aiSubtitle: "Ask about anything: AI, science, coding, digital security, and everyday problem-solving",
    aiPlaceholder: "Ask any question in any field...",
    send: "Send",
    stop: "Stop",
    copy: "Copy",
    copied: "Copied!",

    // Device
    deviceTitle: "Device Scan & Cleaner",
    deviceSubtitle: "Smart circular diagnostic scan showing essential system data vs. temporary clutter with zero risk",
    startDeviceScan: "Start Circular Scan",
    scanningInProgress: "Circular Scan & Diagnostics in progress...",
    scanComplete: "Diagnostics Completed Successfully!",
    usefulItems: "Essential & Protected Items (System Core & Safe Data)",
    uselessItems: "Non-Essential Clutter (Temporary Cache & Residual Files)",
    safeNotice: "100% Safe: This scan is strictly diagnostic and will never automatically delete files without your consent.",

    // Community
    communityTitle: "Future World Community",
    communitySubtitle: "A protected, secure interactive space to discuss technology, AI, and share digital insights",
    createPost: "Create New Post",
    postPlaceholder: "Share your thoughts or questions with the Future World community...",
    postBtn: "Post to Community",
    communitySafetyBadge: "Protected community monitored with state-of-the-art security and encryption",
    allTopics: "All Channels",
    generalChat: "General Tech",
    cyberSecChat: "Security Q&A",
    futureIdeas: "Future Ideas",
    learnersClub: "Learners Hub",

    // Auth
    authTitle: "Sign in to FUTURE WORLD",
    authSubtitle: "Sign in securely with any email provider or create a new account in seconds",
    emailLabel: "Email Address",
    emailPlaceholder: "name@example.com (Gmail, Outlook, Yahoo...)",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    nameLabel: "Full Name",
    namePlaceholder: "Your Name",
    haveAccount: "Already have an account? Sign In",
    needAccount: "Don't have an account? Create one",
    loginSuccess: "Signed in successfully!",
    signupSuccess: "Account created securely! Welcome!",
  },
};

export function getSavedLanguage(): Language {
  if (typeof window === "undefined") return "ar";
  try {
    const saved = localStorage.getItem("fw-lang");
    if (saved === "en" || saved === "ar") return saved;
  } catch {
    // fallback
  }
  return "ar";
}

export function useTranslation() {
  const [lang, setLangState] = useState<Language>(getSavedLanguage);

  useEffect(() => {
    const sync = () => {
      const current = getSavedLanguage();
      setLangState(current);
      if (typeof document !== "undefined") {
        document.documentElement.lang = current;
        document.documentElement.dir = current === "ar" ? "rtl" : "ltr";
      }
    };

    sync();
    window.addEventListener("fw-lang-change", sync);
    return () => window.removeEventListener("fw-lang-change", sync);
  }, []);

  const setLang = (newLang: Language) => {
    try {
      localStorage.setItem("fw-lang", newLang);
      setLangState(newLang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLang;
        document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
      }
      window.dispatchEvent(new Event("fw-lang-change"));
    } catch {
      // ignore
    }
  };

  const t = (key: keyof typeof DICTIONARY.ar): string => {
    return DICTIONARY[lang][key] || DICTIONARY.ar[key] || key;
  };

  return { lang, setLang, t, isAr: lang === "ar" };
}
