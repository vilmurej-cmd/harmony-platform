// HARMONY — API guard: keeps the public endpoints safe to expose.
//
// Layers (serverless-honest — each instance guards itself):
//  1. Same-origin check: browsers sending Origin/Referer must match our host.
//     Stops trivial cross-site abuse and lazy scripts. Not bulletproof
//     (curl can fake it) — that's what the other layers are for.
//  2. Per-IP sliding-window rate limit (in-memory). Serverless caveat:
//     each warm instance has its own memory, so the real-world ceiling is
//     limit × instances — still a hard brake on any single abuser.
//  3. Per-instance daily budget fuse — even a distributed hammer can't
//     make one instance spend more than DAILY_CAP calls/day.
//  4. Input caps live in each route (moment length, duration, etc.).
//
// The REAL kill-switch is the OpenAI dashboard's hard usage limit —
// set one (Settings → Limits). Docs: see LAUNCH-NOTES.md.

import { NextRequest, NextResponse } from "next/server";

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();
let dailyCount = 0;
let dailyDay = "";

const MAX_BUCKETS = 5000; // memory guard

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : "").trim() || "unknown";
}

function sameOrigin(req: NextRequest): boolean {
  const host = req.headers.get("host");
  if (!host) return true;
  for (const h of ["origin", "referer"]) {
    const v = req.headers.get(h);
    if (v) {
      try {
        return new URL(v).host === host;
      } catch {
        return false;
      }
    }
  }
  // No Origin/Referer at all (curl, server-to-server): allow — layer 2/3 still apply.
  return true;
}

export interface GuardOptions {
  /** requests allowed per window per IP */
  limit: number;
  /** window length in ms */
  windowMs: number;
  /** per-instance calls per day (the fuse) */
  dailyCap?: number;
}

/**
 * Returns null when the request may proceed, or a ready-to-return
 * NextResponse (403/429) when it should not.
 */
export function guardRequest(req: NextRequest, opts: GuardOptions): NextResponse | null {
  const { limit, windowMs, dailyCap = 2000 } = opts;

  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // daily fuse (per instance)
  const today = new Date().toISOString().slice(0, 10);
  if (dailyDay !== today) {
    dailyDay = today;
    dailyCount = 0;
  }
  if (dailyCount >= dailyCap) {
    return NextResponse.json(
      { error: "rate_limited", message: "HARMONY is very popular today — please try again tomorrow." },
      { status: 429 }
    );
  }

  // per-IP sliding window
  const ip = clientIp(req);
  const now = Date.now();
  let bucket = buckets.get(ip);
  if (!bucket) {
    if (buckets.size >= MAX_BUCKETS) buckets.clear(); // crude but bounded
    bucket = { timestamps: [] };
    buckets.set(ip, bucket);
  }
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
  if (bucket.timestamps.length >= limit) {
    return NextResponse.json(
      { error: "rate_limited", message: "A moment, please — you're composing faster than the orchestra can play." },
      { status: 429 }
    );
  }

  bucket.timestamps.push(now);
  dailyCount++;
  return null;
}

/** Clamp helper for numeric inputs. */
export function clampNum(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? v : fallback;
  return Math.min(max, Math.max(min, n));
}

/** Cap + sanitize a free-text input. */
export function capText(v: unknown, maxLen: number): string {
  return (typeof v === "string" ? v : "").slice(0, maxLen).trim();
}
