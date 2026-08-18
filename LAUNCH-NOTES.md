# HARMONY — launch refresh notes (Aug 18, 2026)

## What changed in this refresh

1. **Cost protection** (`src/lib/api-guard.ts`, applied in both API routes):
   - `/api/compose`: 5/min + 20/hour per IP, 1,000/day per-instance fuse,
     input caps (moment ≤600 chars, ≤5 emotions, duration 16–120s,
     instrument allow-list).
   - `/api/translate-content`: 30/min per IP, 5,000/day fuse, text ≤2,000
     chars — and switched to gpt-4o-mini (~15x cheaper, quality holds).
   - Same-origin check on both.
   - Honest limits: serverless means per-IP limits are per warm instance —
     a strong brake, not a wall. See the human step below for the real wall.

2. **Honesty pass**: removed the three invented testimonials ("Sarah K." etc.).
   Replaced with clearly-labeled example moments ("what could yours sound
   like?"). Nothing on the page now claims users we don't have.

3. **Share polish**: real Open Graph + Twitter card metadata and a new
   `public/og.png` — shared links now unfurl with the golden waveform card
   instead of a blank box.

## Human steps before/at launch (Josh)

- **THE REAL KILL-SWITCH**: OpenAI dashboard → Settings → Limits → set a
  hard monthly usage cap (e.g. $25). This is the one protection that can't
  be bypassed. Do this before sharing the link anywhere.
- Verify `OPENAI_API_KEY` is set in Vercel → harmony-platform → Settings →
  Environment Variables (without it, composing silently falls back to demo).
- Delete the duplicate Vercel project `harmony-platform-xk4q` (Vercel
  dashboard) — only `harmony-platform` is wired to GitHub.
- Domain: point a real domain at the project when the brand house is chosen.
- Deploy this refresh: `cd ~/harmony-platform && git add -A && git commit -m "Launch refresh: API cost protection, honesty pass, share metadata" && git push`
  (GitHub push auto-deploys to Vercel).

## Later (the native app track)

Josh's call: Harmony's future is a native app. Key technical note for that
build: Tone.js is Web-Audio-only — the RN app will need react-native-audio-api
(or a WebView audio core) — scoped separately.
