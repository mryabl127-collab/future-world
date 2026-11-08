export type Finding = { level: "info" | "warn" | "high"; title: string; detail: string };
export type UrlReport = { valid: false; error: string } | { valid: true; url: URL; findings: Finding[]; risk: "low" | "medium" | "high" };

const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "cutt.ly", "rb.gy", "shorturl.at"];
const RISKY_TLDS = ["zip", "mov", "xyz", "top", "click", "country", "gq", "tk", "ml", "cf", "work", "rest"];
const BRANDS = ["paypal", "apple", "google", "microsoft", "facebook", "instagram", "whatsapp", "amazon", "netflix", "bank", "zain", "asiacell"];
const BAIT = ["login", "verify", "secure", "update", "account", "wallet", "gift", "free", "bonus", "confirm", "password"];

export function analyzeUrl(raw: string): UrlReport {
  const input = raw.trim();
  if (!input) return { valid: false, error: "Please enter a link." };
  if (input.length > 2048) return { valid: false, error: "Link is too long (max 2048 characters)." };
  let url: URL;
  try { url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(input) ? input : `https://${input}`); } catch { return { valid: false, error: "This is not a valid URL format." }; }
  if (!["http:", "https:"].includes(url.protocol)) return { valid: false, error: `Unsupported scheme "${url.protocol}". Only http and https links can be inspected.` };
  const host = url.hostname.toLowerCase();
  if (!host.includes(".") && host !== "localhost") return { valid: false, error: "The domain name looks incomplete." };

  const f: Finding[] = [];
  if (url.protocol === "http:") f.push({ level: "warn", title: "Not encrypted (HTTP)", detail: "Data sent to this page is not protected by HTTPS." });
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[")) f.push({ level: "high", title: "Raw IP address", detail: "Legitimate services rarely ask you to visit a bare IP address." });
  if (host.startsWith("xn--") || host.includes(".xn--")) f.push({ level: "high", title: "Punycode domain", detail: "The domain uses encoded characters that can imitate familiar letters (homograph attack)." });
  if (url.username || url.password || input.includes("@")) f.push({ level: "high", title: "Contains '@' or credentials", detail: "Text before '@' can disguise the real destination." });
  if (SHORTENERS.includes(host)) f.push({ level: "warn", title: "Link shortener", detail: "The real destination is hidden behind a shortening service." });
  const tld = host.split(".").pop() ?? "";
  if (RISKY_TLDS.includes(tld)) f.push({ level: "warn", title: `Frequently abused ending (.${tld})`, detail: "This top-level domain is often seen in spam and phishing campaigns." });
  const parts = host.split(".");
  if (parts.length > 4) f.push({ level: "warn", title: "Many subdomains", detail: "Long chains of subdomains can hide the real site name." });
  if ((host.match(/-/g) ?? []).length >= 3) f.push({ level: "warn", title: "Many hyphens in domain", detail: "Phishing domains often use hyphens like secure-login-account-site." });
  const registrable = parts.slice(-2).join(".");
  const brand = BRANDS.find((b) => host.includes(b) && !registrable.startsWith(b + "."));
  if (brand) f.push({ level: "high", title: `Brand name "${brand}" outside its main domain`, detail: "The brand appears in the address, but the actual domain belongs to someone else." });
  const bait = BAIT.filter((w) => (url.pathname + url.search + host).toLowerCase().includes(w));
  if (bait.length) f.push({ level: "warn", title: "Urgency or login keywords", detail: `Contains: ${bait.join(", ")}. Be careful entering credentials.` });
  if (input.length > 150) f.push({ level: "info", title: "Very long link", detail: "Long links can hide suspicious parts. Read it carefully." });
  if (url.port && !["80", "443"].includes(url.port)) f.push({ level: "warn", title: `Unusual port :${url.port}`, detail: "Most public websites don't use custom ports." });
  if (/\.(exe|apk|scr|bat|msi|js|vbs)$/i.test(url.pathname)) f.push({ level: "high", title: "Direct executable download", detail: "The link points to a file that can install software." });

  const score = f.reduce((a, x) => a + (x.level === "high" ? 3 : x.level === "warn" ? 1 : 0), 0);
  return { valid: true, url, findings: f, risk: score >= 3 ? "high" : score >= 1 ? "medium" : "low" };
}
