/**
 * Translation Cache — localStorage with 7-day expiry, 5MB limit
 */

const CACHE_PREFIX = "harmony_t_";
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB

export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}

function getCacheKey(text: string, targetLang: string): string {
  return `${CACHE_PREFIX}${targetLang}_${hashString(text)}`;
}

function getCacheSize(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      total += (localStorage.getItem(key) || "").length * 2; // UTF-16
    }
  }
  return total;
}

function evictOldest(): void {
  let oldest: { key: string; ts: number } | null = null;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(CACHE_PREFIX)) continue;
    try {
      const entry = JSON.parse(localStorage.getItem(key) || "{}");
      if (!oldest || entry.ts < oldest.ts) {
        oldest = { key, ts: entry.ts || 0 };
      }
    } catch {
      // corrupt entry — remove it
      localStorage.removeItem(key);
      return;
    }
  }
  if (oldest) localStorage.removeItem(oldest.key);
}

export function getCachedTranslation(text: string, targetLang: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const key = getCacheKey(text, targetLang);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_EXPIRY_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.v;
  } catch {
    return null;
  }
}

export function setCachedTranslation(text: string, targetLang: string, translation: string): void {
  if (typeof window === "undefined") return;
  try {
    // Evict until under limit
    while (getCacheSize() > MAX_CACHE_SIZE) {
      evictOldest();
    }
    const key = getCacheKey(text, targetLang);
    localStorage.setItem(key, JSON.stringify({ v: translation, ts: Date.now() }));
  } catch {
    // Storage full — clear all translation cache
    clearTranslationCache();
  }
}

export function clearTranslationCache(): void {
  if (typeof window === "undefined") return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}
