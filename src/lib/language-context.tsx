"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  getCachedTranslation,
  setCachedTranslation,
} from "./translation-cache";

/* ================================================================
   Language definitions — 75+ languages with RTL flags
   ================================================================ */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ar", name: "Arabic", nativeName: "العربية", rtl: true },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "jv", name: "Javanese", nativeName: "Basa Jawa" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "ur", name: "Urdu", nativeName: "اردو", rtl: true },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာဘာသာ" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski" },
  { code: "sr", name: "Serbian", nativeName: "Српски" },
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu" },
  { code: "et", name: "Estonian", nativeName: "Eesti" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina" },
  { code: "he", name: "Hebrew", nativeName: "עברית", rtl: true },
  { code: "fa", name: "Persian", nativeName: "فارسی", rtl: true },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "tl", name: "Filipino", nativeName: "Filipino" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල" },
  { code: "km", name: "Khmer", nativeName: "ខ្មែរ" },
  { code: "lo", name: "Lao", nativeName: "ລາວ" },
  { code: "ka", name: "Georgian", nativeName: "ქართული" },
  { code: "hy", name: "Armenian", nativeName: "Հայերեն" },
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan" },
  { code: "uz", name: "Uzbek", nativeName: "Oʻzbek" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақ" },
  { code: "mn", name: "Mongolian", nativeName: "Монгол" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
  { code: "ig", name: "Igbo", nativeName: "Igbo" },
  { code: "ha", name: "Hausa", nativeName: "Hausa" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
  { code: "ca", name: "Catalan", nativeName: "Català" },
  { code: "eu", name: "Basque", nativeName: "Euskara" },
  { code: "gl", name: "Galician", nativeName: "Galego" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg" },
  { code: "ga", name: "Irish", nativeName: "Gaeilge" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska" },
  { code: "mt", name: "Maltese", nativeName: "Malti" },
  { code: "sq", name: "Albanian", nativeName: "Shqip" },
  { code: "mk", name: "Macedonian", nativeName: "Македонски" },
  { code: "bs", name: "Bosnian", nativeName: "Bosanski" },
];

export const POPULAR_LANGUAGES = [
  "en", "es", "zh-CN", "fr", "de", "ja", "ko", "pt", "ar", "hi", "ru", "it",
];

/* ================================================================
   Context types
   ================================================================ */

type TranslationDict = Record<string, string | Record<string, string>>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateAsync: (text: string) => Promise<string>;
  isRTL: boolean;
  recentLanguages: string[];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

/* ================================================================
   Provider
   ================================================================ */

const RECENT_KEY = "harmony_recent_langs";
const LANG_KEY = "harmony_language";

function flattenDict(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      result[fullKey] = v;
    } else if (typeof v === "object" && v !== null) {
      Object.assign(result, flattenDict(v as Record<string, unknown>, fullKey));
    }
  }
  return result;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(LANGUAGES[0]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [enFallback, setEnFallback] = useState<Record<string, string>>({});
  const [recentLanguages, setRecentLanguages] = useState<string[]>([]);

  // Load English fallback on mount
  useEffect(() => {
    import("@/translations/en.json").then((mod) => {
      setEnFallback(flattenDict(mod.default as unknown as Record<string, unknown>));
    });
  }, []);

  // Restore saved language
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(LANG_KEY);
    if (saved) {
      const lang = LANGUAGES.find((l) => l.code === saved);
      if (lang) setLanguageState(lang);
    }
    const recent = localStorage.getItem(RECENT_KEY);
    if (recent) {
      try {
        setRecentLanguages(JSON.parse(recent));
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Load translations when language changes
  useEffect(() => {
    if (language.code === "en") {
      setTranslations({});
      return;
    }
    loadTranslations(language.code);
  }, [language.code]);

  // Set RTL on html element
  useEffect(() => {
    const html = document.documentElement;
    if (language.rtl) {
      html.setAttribute("dir", "rtl");
    } else {
      html.removeAttribute("dir");
    }
    html.setAttribute("lang", language.code);
  }, [language]);

  async function loadTranslations(code: string) {
    try {
      const mod = await import(`@/translations/${code}.json`);
      setTranslations(flattenDict(mod.default as unknown as Record<string, unknown>));
    } catch {
      // No static file — translations will use API fallback
      setTranslations({});
    }
  }

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
      if (typeof window !== "undefined") {
        localStorage.setItem(LANG_KEY, lang.code);
        const updated = [
          lang.code,
          ...recentLanguages.filter((c) => c !== lang.code),
        ].slice(0, 5);
        setRecentLanguages(updated);
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      }
    },
    [recentLanguages]
  );

  const t = useCallback(
    (key: string): string => {
      if (language.code === "en") return enFallback[key] || key;
      return translations[key] || enFallback[key] || key;
    },
    [language.code, translations, enFallback]
  );

  const translateAsync = useCallback(
    async (text: string): Promise<string> => {
      if (language.code === "en") return text;

      // Check cache
      const cached = getCachedTranslation(text, language.code);
      if (cached) return cached;

      // Check static dict
      // (static dict already checked via t())

      try {
        const res = await fetch("/api/translate-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetLang: language.code }),
        });
        if (!res.ok) return text;
        const data = await res.json();
        const translated = data.translation || text;
        setCachedTranslation(text, language.code, translated);
        return translated;
      } catch {
        return text; // graceful degradation
      }
    },
    [language.code]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateAsync,
        isRTL: !!language.rtl,
        recentLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
