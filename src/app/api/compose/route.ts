import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { demoComposition } from "@/lib/demo-composition";
import { guardRequest, clampNum, capText } from "@/lib/api-guard";

const ALLOWED_INSTRUMENTS = ["Piano", "Strings", "Ambient", "Jazz", "Cinematic"];

export async function POST(request: NextRequest) {
  // composing is expensive (GPT-4o) — tight limits: 5/min, 20/hour per IP
  const blocked =
    guardRequest(request, { limit: 5, windowMs: 60_000 }) ??
    guardRequest(request, { limit: 20, windowMs: 3_600_000, dailyCap: 1000 });
  if (blocked) return blocked;

  try {
    const body = await request.json();

    // ---------- Input caps (never trust the client) ----------
    const moment = capText(body.moment, 600);
    const emotions: string[] = (Array.isArray(body.emotions) ? body.emotions : [])
      .slice(0, 5)
      .map((e: unknown) => capText(e, 30))
      .filter(Boolean);
    const instrument = ALLOWED_INSTRUMENTS.includes(body.instrument) ? body.instrument : "Piano";
    const durationSeconds = clampNum(body.durationSeconds, 16, 120, 60);

    // ---------- Fallback to demo if no API key ----------
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        composition: demoComposition,
      });
    }

    // ---------- Build prompt ----------
    const measures = Math.max(8, Math.floor(durationSeconds / 4));

    const systemPrompt = `You are an expert music composer who translates human emotions into Tone.js compositions.

OUTPUT FORMAT — Return ONLY valid JSON, no markdown fences, no commentary:
{
  "title": "string — evocative 2-5 word title",
  "key": "string — e.g. 'C major', 'A minor', 'Eb major'",
  "tempo": number — BPM between 50–140,
  "timeSignature": [4, 4],
  "detectedEmotion": "string — primary emotion",
  "dynamicArc": ["pp"|"p"|"mp"|"mf"|"f"|"ff" for each measure],
  "measures": [
    {
      "bar": number,
      "dynamic": "pp"|"p"|"mp"|"mf"|"f"|"ff",
      "melody": [{ "pitch": "C4", "time": "0:0:0", "duration": "4n", "velocity": 0.7 }],
      "harmony": [{ "pitch": "E3", "time": "0:0:0", "duration": "2n", "velocity": 0.4 }],
      "bass": [{ "pitch": "C2", "time": "0:0:0", "duration": "1m", "velocity": 0.5 }]
    }
  ]
}

RULES:
1. Compose exactly ${measures} measures.
2. Time format is "bar:beat:subdivision" (0-indexed). Bar 1 = "0:x:x", Bar 2 = "1:x:x", etc.
3. Duration values: "1m" (whole), "2n" (half), "4n" (quarter), "8n" (eighth), "4n." (dotted quarter), "2n." (dotted half).
4. Pitch range: C2–C6. Use the instrument's natural range.
5. Velocity: 0.0–1.0. Should align with the dynamic marking.
6. Create a dynamic arc — start soft, build to a climax, then resolve. The dynamicArc array must match the number of measures.
7. MELODY — write a THEME, not an exercise. This is the most important rule:
   a. Invent a short MOTIF (2–4 notes with a distinctive rhythm) in bar 1 and build everything from it: repeat it, transpose it, invert it, stretch its rhythm. A listener must be able to hum the motif after one hearing.
   b. NEVER walk up or down a scale for more than 3 consecutive notes. Break lines with direction changes, leaps of a 3rd–6th, and returns.
   c. Vary the rhythm inside every measure — mix at least two different note durations, use dotted rhythms and off-beat entrances ("x:1:2", "x:2:2"), and leave RESTS. Silence between phrases is part of the melody; do not fill every beat.
   d. Phrase in 4-bar arcs: statement → echo (varied repeat) → lift (rise in tension) → resolve (breathe). The single highest note of the piece appears exactly once, at the climax.
   e. End phrases on longer notes ("2n", "2n.") so the music breathes.
8. Harmony should support the melody — CHANGE chords between measures (real harmonic rhythm, not one chord repeated), use inversions, suspensions that resolve, and voice leading. 2–4 harmony notes per measure is plenty; place some off the downbeat.
9. Bass should ground the harmony — root motion with passing tones on weak beats; give the bass its own gentle contour, never the same note for two consecutive measures unless the harmony truly holds.
10. Emotional mapping:
    - Joy/triumph: major keys, wider intervals, faster tempo, staccato
    - Nostalgia/longing: minor keys, 6ths/7ths, moderate tempo, legato
    - Serenity/peace: pentatonic, open voicings, slow tempo, gentle dynamics
    - Grief/bittersweet: minor with major moments, chromaticism, rubato feel
    - Power/wonder: open 5ths, octave doublings, building dynamics
    - Love: warm 3rds/6ths, gentle suspensions, lyrical melody
    - Hope: major with added 9ths, ascending phrases, crescendo arc
11. For ${instrument}: tailor the voicing and texture to suit the instrument's character.
12. Most measures should have melody, but a one-measure rest after a big phrase is welcome. Harmony and bass can be sparse for texture.
13. Make it musical — not just technically correct. It should MOVE the listener. Before answering, silently hum through your melody: if it sounds like a warm-up scale or an arpeggio drill, rewrite it.`;

    const userMessage = `Compose a ${instrument} piece (emotions: ${emotions.join(", ")}) for this moment: "${moment}"`;

    // ---------- Call OpenAI GPT-4o ----------
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const text = completion.choices[0]?.message?.content || "";

    // ---------- Parse JSON ----------
    // Strip markdown fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const composition = JSON.parse(cleaned);

    return NextResponse.json({ success: true, composition });
  } catch (error) {
    console.error("Compose API error:", error);
    // Fall back to demo composition instead of returning error
    return NextResponse.json({ success: true, composition: demoComposition });
  }
}
