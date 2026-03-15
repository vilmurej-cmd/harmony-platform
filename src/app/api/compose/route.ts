import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { demoComposition } from "@/lib/demo-composition";

export async function POST(request: NextRequest) {
  try {
    const { moment, emotions, instrument, durationSeconds } = await request.json();

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
7. Melody should be singable — stepwise motion with occasional leaps. Use repetition and variation.
8. Harmony should support the melody — use chord tones, suspensions, and voice leading.
9. Bass should ground the harmony — root motion, occasional passing tones.
10. Emotional mapping:
    - Joy/triumph: major keys, wider intervals, faster tempo, staccato
    - Nostalgia/longing: minor keys, 6ths/7ths, moderate tempo, legato
    - Serenity/peace: pentatonic, open voicings, slow tempo, gentle dynamics
    - Grief/bittersweet: minor with major moments, chromaticism, rubato feel
    - Power/wonder: open 5ths, octave doublings, building dynamics
    - Love: warm 3rds/6ths, gentle suspensions, lyrical melody
    - Hope: major with added 9ths, ascending phrases, crescendo arc
11. For ${instrument}: tailor the voicing and texture to suit the instrument's character.
12. Every measure MUST have at least one melody note. Harmony and bass can be sparse for texture.
13. Make it musical — not just technically correct. It should MOVE the listener.`;

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
