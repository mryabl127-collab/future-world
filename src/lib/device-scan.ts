// Real, on-device diagnostics. Everything here is read from browser/WebView APIs at scan time;
// values a device does not expose are reported as unavailable instead of being guessed.

export type DeviceInfo = {
  os: "android" | "ios" | "windows" | "mac" | "linux" | "other";
  osName: string;
  osVersion?: string | undefined;
  model?: string | undefined;
  brand?: string | undefined;
  browser: string;
  cores?: number | undefined;
  ramGb?: number | undefined;
  screen: string;
  touch: boolean;
  language: string;
  timezone: string;
};

export type BatteryInfo = { level: number; charging: boolean } | null;
export type NetworkInfo = {
  type?: string | undefined;
  downlink?: number | undefined;
  rtt?: number | undefined;
  saveData?: boolean | undefined;
} | null;
export type StorageInfo = {
  usage: number;
  quota: number;
  caches?: number | undefined;
  indexedDB?: number | undefined;
  persisted?: boolean | undefined;
} | null;
export type PermissionInfo = {
  name: string;
  label: string;
  state: PermissionState | "unsupported";
};

export type CleanItem = {
  id: string;
  title: string;
  detail: string;
  bytes: number;
  count?: number;
  clean: () => Promise<void> | void;
};
export type KeptItem = { title: string; detail: string; bytes: number };

export const KNOWN_KEYS: Record<string, string> = {
  "fw-history": "سجل فحص الروابط والصور",
  "fw-chats": "محادثات المساعد الذكي",
  "fw-progress": "تقدمك في الأكاديمية",
  "fw-prefs": "إعداداتك",
  "fw-alerts-read": "التنبيهات المقروءة",
  "fw-ai-key": "مفتاح الذكاء الاصطناعي الخاص بك",
  "fw-chat-client-id": "هويتك في دردشة المجتمع",
  "fw-chat-name": "اسمك في دردشة المجتمع",
  "fw-community-posts": "منشورات المجتمع",
  "fw-lang": "لغة التطبيق",
  "fw-auth-user": "حسابك المسجل",
  "fw-speed-last": "آخر اختبار سرعة",
};

export const OLD_SCAN_DAYS = 30;

export function formatBytes(n: number): string {
  if (!isFinite(n) || n <= 0) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  const v = n / 1024 ** i;
  return `${v >= 100 || i === 0 ? v.toFixed(0) : v.toFixed(1)} ${u[i]}`;
}

/** UTF-16 storage size of a localStorage entry, which is how browsers count it. */
export function entryBytes(key: string, value: string): number {
  return (key.length + value.length) * 2;
}

type ScanRecord = { date: string };
type ChatConv = { messages?: Array<{ role: string; content: string; error?: boolean }> };

/** Splits the scan history into entries older than OLD_SCAN_DAYS and recent ones. */
export function splitOldScans<T extends ScanRecord>(
  list: T[],
  now: number,
): { old: T[]; recent: T[] } {
  const cutoff = now - OLD_SCAN_DAYS * 86_400_000;
  const old: T[] = [];
  const recent: T[] = [];
  for (const r of list) (new Date(r.date).getTime() < cutoff ? old : recent).push(r);
  return { old, recent };
}

/** A chat is useless when it never got a real answer (empty or failed replies only). */
export function isDeadChat(c: ChatConv): boolean {
  const msgs = c.messages ?? [];
  return !msgs.some((m) => m.role === "assistant" && m.content.trim() && !m.error);
}

/** Old app keys that start with fw- but are no longer used. */
export function isLeftoverKey(key: string): boolean {
  return key.startsWith("fw-") && !(key in KNOWN_KEYS);
}

export async function readDeviceInfo(): Promise<DeviceInfo> {
  const ua = navigator.userAgent;
  let os: DeviceInfo["os"] = "other";
  let osName = "غير معروف";
  let osVersion: string | undefined;
  let model: string | undefined;

  const uad = (
    navigator as Navigator & {
      userAgentData?: {
        platform?: string;
        getHighEntropyValues?: (
          h: string[],
        ) => Promise<{ model?: string; platformVersion?: string; platform?: string }>;
      };
    }
  ).userAgentData;
  if (uad?.getHighEntropyValues) {
    try {
      const h = await uad.getHighEntropyValues(["model", "platformVersion", "platform"]);
      if (h.model) model = h.model;
      if (h.platformVersion) osVersion = h.platformVersion;
      if (h.platform) osName = h.platform;
    } catch {
      /* not allowed */
    }
  }

  if (/Android/i.test(ua)) {
    os = "android";
    osName = "Android";
    osVersion = osVersion || ua.match(/Android\s([\d.]+)/)?.[1];
    if (!model) {
      const m = ua.match(/Android[\d.\s]*;\s*([^;)]+?)(?:\sBuild|\))/);
      if (m && m[1] && m[1].trim() !== "K") model = m[1].trim();
    }
  } else if (
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  ) {
    os = "ios";
    osName = /iPad/.test(ua) || /Macintosh/.test(ua) ? "iPadOS" : "iOS";
    osVersion =
      ua.match(/OS (\d+[_.\d]*)/)?.[1]?.replace(/_/g, ".") ?? ua.match(/Version\/([\d.]+)/)?.[1];
    model = /iPad/.test(ua) || /Macintosh/.test(ua) ? "iPad" : "iPhone";
  } else if (/Windows/i.test(ua)) {
    os = "windows";
    osName = "Windows";
    if (osVersion) osVersion = parseInt(osVersion) >= 13 ? "11" : "10";
  } else if (/Mac OS X/i.test(ua)) {
    os = "mac";
    osName = "macOS";
  } else if (/Linux/i.test(ua)) {
    os = "linux";
    osName = "Linux";
  }

  const browser = /Capacitor|; wv\)/.test(ua)
    ? "تطبيق FUTURE WORLD"
    : /EdgA?\//.test(ua)
      ? "Edge"
      : /SamsungBrowser/.test(ua)
        ? "Samsung Internet"
        : /CriOS|Chrome\//.test(ua)
          ? "Chrome"
          : /FxiOS|Firefox\//.test(ua)
            ? "Firefox"
            : /Safari\//.test(ua)
              ? "Safari"
              : "متصفح";

  const dpr = window.devicePixelRatio || 1;
  return {
    os,
    osName,
    osVersion,
    model,
    brand: guessBrand(model, ua),
    browser,
    cores: navigator.hardwareConcurrency || undefined,
    ramGb: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
    screen: `${Math.round(screen.width * dpr)}×${Math.round(screen.height * dpr)}`,
    touch: navigator.maxTouchPoints > 0,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export function guessBrand(model: string | undefined, ua: string): string | undefined {
  const m = `${model ?? ""} ${ua}`;
  if (/iPhone|iPad/.test(m)) return "Apple";
  if (/\bSM-|Samsung|Galaxy/i.test(m)) return "Samsung";
  if (/Redmi|POCO|\bMi\s|Xiaomi|\b2\d{3}[A-Z0-9]{4,}\b|M2\d{3}/i.test(m)) return "Xiaomi";
  if (/HUAWEI|\b(ELE|VOG|ANA|NOH|JNY)-/i.test(m)) return "Huawei";
  if (/HONOR/i.test(m)) return "Honor";
  if (/OPPO|CPH\d{4}/i.test(m)) return "Oppo";
  if (/vivo|V\d{4}/i.test(m)) return "Vivo";
  if (/Infinix/i.test(m)) return "Infinix";
  if (/TECNO/i.test(m)) return "Tecno";
  if (/Pixel/i.test(m)) return "Google";
  if (/RMX\d{4}|realme/i.test(m)) return "Realme";
  if (/OnePlus|\b(KB|LE|IN|NE|CPH)2\d{3}/i.test(m)) return "OnePlus";
  return undefined;
}

export async function readBattery(): Promise<BatteryInfo> {
  const nav = navigator as Navigator & {
    getBattery?: () => Promise<{ level: number; charging: boolean }>;
  };
  if (!nav.getBattery) return null;
  try {
    const b = await nav.getBattery();
    return { level: Math.round(b.level * 100), charging: b.charging };
  } catch {
    return null;
  }
}

export function readNetwork(): NetworkInfo {
  const c = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean };
    }
  ).connection;
  if (!c) return null;
  return { type: c.effectiveType, downlink: c.downlink, rtt: c.rtt, saveData: c.saveData };
}

export async function readStorage(): Promise<StorageInfo> {
  if (!navigator.storage?.estimate) return null;
  try {
    const e = (await navigator.storage.estimate()) as StorageEstimate & {
      usageDetails?: { caches?: number; indexedDB?: number };
    };
    const persisted = navigator.storage.persisted ? await navigator.storage.persisted() : undefined;
    return {
      usage: e.usage ?? 0,
      quota: e.quota ?? 0,
      caches: e.usageDetails?.caches,
      indexedDB: e.usageDetails?.indexedDB,
      persisted,
    };
  } catch {
    return null;
  }
}

export async function readPermissions(): Promise<PermissionInfo[]> {
  const list: Array<[string, string]> = [
    ["geolocation", "الموقع"],
    ["camera", "الكاميرا"],
    ["microphone", "المايكروفون"],
    ["notifications", "الإشعارات"],
  ];
  return Promise.all(
    list.map(async ([name, label]) => {
      try {
        const s = await navigator.permissions.query({ name: name as PermissionName });
        return { name, label, state: s.state };
      } catch {
        return { name, label, state: "unsupported" as const };
      }
    }),
  );
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Finds real removable leftovers in this app's storage, plus what is kept and why. */
export async function scanAppData(
  now = Date.now(),
): Promise<{ junk: CleanItem[]; kept: KeptItem[] }> {
  const junk: CleanItem[] = [];
  const kept: KeptItem[] = [];
  const notify = () => window.dispatchEvent(new Event("fw-store"));

  // Cache Storage: this app does not use offline caches, so anything here is leftover.
  if ("caches" in window) {
    try {
      const names = await caches.keys();
      if (names.length) {
        let bytes = 0;
        let count = 0;
        for (const n of names) {
          const c = await caches.open(n);
          const reqs = await c.keys();
          count += reqs.length;
          for (const r of reqs.slice(0, 200)) {
            const res = await c.match(r);
            if (res) bytes += (await res.clone().blob()).size;
          }
        }
        junk.push({
          id: "caches",
          title: "ذاكرة كاش قديمة للتطبيق",
          detail: `${count} ملف محفوظ مؤقتاً في ${names.length} مجلد كاش`,
          bytes,
          count,
          clean: async () => {
            await Promise.all(names.map((n) => caches.delete(n)));
          },
        });
      }
    } catch {
      /* unavailable */
    }
  }

  // Leftover service workers from older versions.
  if (navigator.serviceWorker?.getRegistrations) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs.length)
        junk.push({
          id: "sw",
          title: "خدمات خلفية قديمة",
          detail: `${regs.length} خدمة تعمل بالخلفية من نسخة سابقة`,
          bytes: 0,
          count: regs.length,
          clean: async () => {
            await Promise.all(regs.map((r) => r.unregister()));
          },
        });
    } catch {
      /* unavailable */
    }
  }

  // Session (temporary) storage.
  let sessBytes = 0;
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i)!;
    sessBytes += entryBytes(k, sessionStorage.getItem(k) ?? "");
  }
  if (sessionStorage.length)
    junk.push({
      id: "session",
      title: "بيانات جلسة مؤقتة",
      detail: `${sessionStorage.length} عنصر مؤقت من الاستخدام الحالي`,
      bytes: sessBytes,
      count: sessionStorage.length,
      clean: () => sessionStorage.clear(),
    });

  // Scan history older than 30 days.
  const history = readJson<Array<{ date: string }>>("fw-history", []);
  const { old, recent } = splitOldScans(history, now);
  if (old.length) {
    junk.push({
      id: "old-scans",
      title: `سجل فحوصات أقدم من ${OLD_SCAN_DAYS} يوم`,
      detail: `${old.length} فحص قديم ما تحتاجه`,
      bytes: JSON.stringify(old).length * 2,
      count: old.length,
      clean: () => {
        localStorage.setItem("fw-history", JSON.stringify(recent));
        notify();
      },
    });
  }

  // Chats that never got an answer.
  const chats = readJson<Array<ChatConv & { id: string }>>("fw-chats", []);
  const dead = chats.filter(isDeadChat);
  if (dead.length) {
    const alive = chats.filter((c) => !isDeadChat(c));
    junk.push({
      id: "dead-chats",
      title: "محادثات فارغة أو فاشلة",
      detail: `${dead.length} محادثة بدون أي جواب`,
      bytes: JSON.stringify(dead).length * 2,
      count: dead.length,
      clean: () => {
        localStorage.setItem("fw-chats", JSON.stringify(alive));
        notify();
      },
    });
  }

  // Unknown fw- keys left by older versions, and known keys kept.
  const leftovers: string[] = [];
  let leftoverBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    const v = localStorage.getItem(k) ?? "";
    if (isLeftoverKey(k)) {
      leftovers.push(k);
      leftoverBytes += entryBytes(k, v);
    } else if (k in KNOWN_KEYS) {
      let detail = "محفوظ لأنك تحتاجه";
      if (k === "fw-history") detail = `${recent.length} فحص حديث`;
      if (k === "fw-chats") detail = `${chats.length - dead.length} محادثة`;
      kept.push({ title: KNOWN_KEYS[k]!, detail, bytes: entryBytes(k, v) });
    }
  }
  if (leftovers.length)
    junk.push({
      id: "leftovers",
      title: "بقايا نسخ قديمة من التطبيق",
      detail: `${leftovers.length} عنصر ما يستخدمه التطبيق حالياً`,
      bytes: leftoverBytes,
      count: leftovers.length,
      clean: () => {
        leftovers.forEach((k) => localStorage.removeItem(k));
        notify();
      },
    });

  return { junk, kept: kept.sort((a, b) => b.bytes - a.bytes) };
}

/** Step-by-step instructions for freeing space on the whole phone, matched to the detected device. */
export function cleaningGuide(info: DeviceInfo): { title: string; steps: string[] } {
  if (info.os === "ios")
    return {
      title: `تنظيف ${info.model ?? "iPhone"} بالكامل`,
      steps: [
        "افتح الإعدادات ← عام ← تخزين الـ iPhone، وشوف أي التطبيقات تاخذ أكبر مساحة.",
        "فعّل «تفريغ التطبيقات غير المستخدمة» حتى يحذف التطبيقات اللي ما تستخدمها ويحتفظ ببياناتها.",
        "الصور ← الألبومات ← «المحذوفة مؤخراً» ← حذف الكل (تبقى 30 يوم وتاخذ مساحة).",
        "Safari: الإعدادات ← Safari ← مسح السجل وبيانات المواقع.",
        "واتساب: الإعدادات ← التخزين والبيانات ← إدارة التخزين، واحذف الفيديوهات الكبيرة والمكررة.",
      ],
    };
  if (info.os === "android") {
    const name = [info.brand, info.model].filter(Boolean).join(" ") || "هاتفك";
    const brandStep =
      info.brand === "Samsung"
        ? "افتح الإعدادات ← العناية بالبطارية والجهاز ← التخزين، واضغط «تنظيف» للملفات المكررة والكبيرة وسلة المحذوفات."
        : info.brand === "Xiaomi"
          ? "افتح تطبيق «الأمان» (Security) ← المنظف (Cleaner)، وراجع الملفات قبل الحذف."
          : info.brand === "Huawei" || info.brand === "Honor"
            ? "افتح «مدير الهاتف» (Phone Manager) ← تنظيف التخزين."
            : info.brand === "Oppo" || info.brand === "Realme" || info.brand === "OnePlus"
              ? "افتح الإعدادات ← التخزين ← «تنظيف» (Clean up)."
              : "افتح تطبيق Files by Google ← تنظيف، وراجع الملفات المكررة والكبيرة والملفات غير المرغوبة.";
    return {
      title: `تنظيف ${name} بالكامل`,
      steps: [
        brandStep,
        "الإعدادات ← التطبيقات، وافتح التطبيقات الكبيرة (مثل تيك توك، إنستغرام، تيليجرام) ← التخزين ← «مسح ذاكرة التخزين المؤقت» فقط (لا تضغط مسح البيانات).",
        "تيليجرام: الإعدادات ← البيانات والتخزين ← استخدام التخزين ← مسح ذاكرة التخزين المؤقت.",
        "واتساب: الإعدادات ← التخزين والبيانات ← إدارة التخزين، واحذف الملفات الكبيرة والمعاد توجيهها.",
        "مجلد التنزيلات (Download): احذف ملفات APK والفيديوهات القديمة اللي ما تحتاجها.",
      ],
    };
  }
  return {
    title: "تنظيف جهازك",
    steps: [
      "امسح سجل المتصفح وملفات الكاش من إعدادات المتصفح ← الخصوصية.",
      "احذف التطبيقات والبرامج اللي ما تستخدمها.",
      "افرغ سلة المحذوفات ومجلد التنزيلات من الملفات القديمة.",
    ],
  };
}
