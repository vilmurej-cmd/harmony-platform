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

    const systemPrompt = `You are a fearless composer. People bring you a single moment from their life; you write music that makes them FEEL it again — not background music, not something pleasant. If a piece would sound fine in a hotel lobby, you have failed.

OUTPUT FORMAT — Return ONLY valid JSON, no markdown fences, no commentary.
The "reading" object comes FIRST and you must write it before any notes —
it is your interpretation, and the music must follow it:
{
  "reading": {
    "image": "string — the single strongest image in their words, in one sentence",
    "plan": "string — 2-3 sentences: why this key and tempo, where the climax lands (which bar), and the ONE risk you will take",
    "wordPainting": ["2-3 entries: 'their word/detail' → the exact musical gesture it becomes"]
  },
  "title": "string — evocative 2-5 word title",
  "key": "string — e.g. 'C major', 'A minor', 'Eb major'",
  "tempo": number — BPM between 40–160,
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
10. GO TO THE EMOTIONAL EXTREME. Commit fully to the feeling — timid middle-ground music is the one unforgivable outcome:
    - Joy/triumph: 110–160 BPM, bright staccato, fearless upward leaps of a 6th–octave, ff climax
    - Nostalgia/longing: 55–80, minor with aching major 6ths/7ths, phrases that reach up and fall back short
    - Serenity/peace: 40–60, vast open voicings, long tones, more silence than sound
    - Grief/bittersweet: 45–65, low register, appoggiaturas that lean hard before resolving, one phrase that simply stops mid-thought
    - Power/wonder: bare open 5ths, octave doublings, dynamics that build relentlessly pp→ff across the whole arc
    - Love: warm 3rds/6ths, suspensions held a beat longer than comfortable before melting
    - Hope: rising sequences, added 9ths, a climax that breaks into the piece's highest note like sun through cloud
11. TAKE AT LEAST TWO REAL RISKS, and name one of them in reading.plan:
    - a deceptive cadence where the ear expects home
    - a borrowed chord (minor iv in major, bVII, or a final Picardy third)
    - an appoggiatura on the strongest beat of the climax
    - a FULL BEAT of total silence immediately before the climax
    - a sudden pp in the bar right after the ff peak
12. WORD PAINTING — their words are your score. Pick 2-3 concrete details from the moment ("rain", "her laugh", "the last time") and give each an audible gesture (falling 16th pairs for rain, a grace-note figure for a laugh, a final phrase that echoes the opening but unresolved for a goodbye). List them in reading.wordPainting and actually write them into the notes.
13. For ${instrument}: tailor the voicing and texture to suit the instrument's character.
14. Most measures should have melody, but a one-measure rest after a big phrase is welcome. Harmony and bass can be sparse for texture.
15. Make it musical — not just technically correct. It should MOVE the listener. Before answering, silently hum through your melody: if it sounds like a warm-up scale or an arpeggio drill — or like polite background music — rewrite it.`;

    const userMessage = `Compose a ${instrument} piece (emotions: ${emotions.join(", ")}) for this moment: "${moment}"`;

    // ---------- Call OpenAI GPT-4o ----------
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 5000, // room for the reading + the notes
      temperature: 1.0, // full expressive range — the rules keep it structured
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
