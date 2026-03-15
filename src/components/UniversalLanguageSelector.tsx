"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Globe, Search, X, Check } from "lucide-react";
import {
  useLanguage,
  LANGUAGES,
  POPULAR_LANGUAGES,
  type Language,
} from "@/lib/language-context";

export default function UniversalLanguageSelector() {
  const { language, setLanguage, t, recentLanguages } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 100);
    } else {
      setSearch("");
    }
  }, [open]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [search]);

  const recentLangs = useMemo(
    () =>
      recentLanguages
        .map((code) => LANGUAGES.find((l) => l.code === code))
        .filter((l): l is Language => !!l && l.code !== language.code),
    [recentLanguages, language.code]
  );

  const popularLangs = useMemo(
    () =>
      POPULAR_LANGUAGES.map((code) => LANGUAGES.find((l) => l.code === code)).filter(
        (l): l is Language => !!l
      ),
    []
  );

  function selectLang(lang: Language) {
    setLanguage(lang);
    setOpen(false);
  }

  function LangButton({ lang }: { lang: Language }) {
    const isActive = lang.code === language.code;
    return (
      <button
        onClick={() => selectLang(lang)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
          isActive
            ? "bg-[#F59E0B]/15 border border-[#F59E0B]/30"
            : "hover:bg-white/5 border border-transparent"
        }`}
      >
        <div className="min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              isActive ? "text-[#F59E0B]" : "text-[#FFF7ED]"
            }`}
          >
            {lang.nativeName}
          </p>
          <p className="text-xs text-[#8B7E6A] truncate">{lang.name}</p>
        </div>
        {isActive && <Check size={16} className="text-[#F59E0B] shrink-0 ml-2" />}
      </button>
    );
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-[#8B7E6A] hover:text-[#F59E0B] border border-white/10 hover:border-[#F59E0B]/30 transition-all duration-300 bg-white/5 hover:bg-[#F59E0B]/5"
        aria-label="Change language"
      >
        <Globe size={15} />
        <span className="hidden sm:inline">{language.nativeName}</span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="w-full max-w-md max-h-[80vh] bg-[#1A1533] border border-[#F59E0B]/15 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden animate-fade-in-up"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h2 className="font-serif text-lg text-[#FFF7ED] tracking-wide">
                <Globe size={18} className="inline-block mr-2 text-[#F59E0B]" />
                {t("language.searchLanguages").replace("...", "")}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-[#8B7E6A] hover:text-[#FFF7ED] hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-white/5">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7E6A]"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("language.searchLanguages")}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-[#FFF7ED] placeholder-[#8B7E6A] focus:outline-none focus:border-[#F59E0B]/40 transition-colors"
                />
              </div>
            </div>

            {/* Language list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
              {filtered ? (
                /* Search results */
                <div className="space-y-1">
                  {filtered.length === 0 ? (
                    <p className="text-sm text-[#8B7E6A] text-center py-8">
                      No languages found
                    </p>
                  ) : (
                    filtered.map((lang) => (
                      <LangButton key={lang.code} lang={lang} />
                    ))
                  )}
                </div>
              ) : (
                <>
                  {/* Recently used */}
                  {recentLangs.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[#8B7E6A] mb-2 px-1">
                        {t("language.recentlyUsed")}
                      </p>
                      <div className="space-y-1">
                        {recentLangs.map((lang) => (
                          <LangButton key={lang.code} lang={lang} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[#8B7E6A] mb-2 px-1">
                      {t("language.popular")}
                    </p>
                    <div className="space-y-1">
                      {popularLangs.map((lang) => (
                        <LangButton key={lang.code} lang={lang} />
                      ))}
                    </div>
                  </div>

                  {/* All */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[#8B7E6A] mb-2 px-1">
                      {t("language.allLanguages")}
                    </p>
                    <div className="space-y-1">
                      {LANGUAGES.map((lang) => (
                        <LangButton key={lang.code} lang={lang} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
