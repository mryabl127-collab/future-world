import { useEffect, useState } from "react";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  provider: string;
  role: string;
  avatarSeed: string;
  securityScore: number;
  createdAt: string;
};

const USER_KEY = "fw-auth-user";

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: UserProfile | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    window.dispatchEvent(new Event("fw-auth-change"));
  } catch {
    // ignore
  }
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(getStoredUser);

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    window.addEventListener("fw-auth-change", sync);
    return () => window.removeEventListener("fw-auth-change", sync);
  }, []);

  const loginWithEmail = async (email: string, pass: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return { success: false, error: "يرجى إدخال بريد إلكتروني صالح" };
    }
    if (pass.length < 4) {
      return { success: false, error: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" };
    }

    const domain = cleanEmail.split("@")[1] || "custom";
    let providerName = "Email";
    if (domain.includes("gmail")) providerName = "Google Account";
    else if (domain.includes("outlook") || domain.includes("hotmail")) providerName = "Microsoft Outlook";
    else if (domain.includes("yahoo")) providerName = "Yahoo Mail";
    else if (domain.includes("icloud")) providerName = "Apple iCloud";

    const userName = name?.trim() || cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const profile: UserProfile = {
      id: crypto.randomUUID(),
      name: userName,
      email: cleanEmail,
      provider: providerName,
      role: "عضو موثق (Verified Member)",
      avatarSeed: userName.slice(0, 2).toUpperCase(),
      securityScore: 95,
      createdAt: new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" }),
    };

    saveUser(profile);
    return { success: true };
  };

  const logout = () => {
    saveUser(null);
  };

  return { user, loginWithEmail, logout, isAuthenticated: !!user };
}
