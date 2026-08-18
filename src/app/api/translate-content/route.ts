import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { guardRequest, capText } from "@/lib/api-guard";

export async function POST(req: NextRequest) {
  // translations are cheaper but chatty — 30/min per IP, generous daily fuse
  const blocked = guardRequest(req, { limit: 30, windowMs: 60_000, dailyCap: 5000 });
  if (blocked) return blocked;

  try {
    const raw = await req.json();
    const text = capText(raw.text, 2000);
    const targetLang = capText(raw.targetLang, 10);

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: "Missing text or targetLang" },
        { status: 400 }
      );
    }

    // Skip translation for English
    if (targetLang === "en") {
      return NextResponse.json({ translation: text });
    }

    if (!process.env.OPENAI_API_KEY) {
      // Graceful degradation — return original text
      return NextResponse.json({ translation: text });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // translation quality holds; ~15x cheaper than gpt-4o
      temperature: 0.3,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are translating for HARMONY, an emotional music composition platform. Preserve emotional tone and poetic quality. Emotion names must feel natural, not clinical. Use standard international music terms. Keep brand names unchanged (HARMONY). Translate the following text to language code "${targetLang}". Return ONLY the translated text, no explanations.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const translation =
      completion.choices[0]?.message?.content?.trim() || text;

    return NextResponse.json({ translation });
  } catch (error) {
    console.error("Translation error:", error);
    // Graceful degradation — return original text if provided
    try {
      const body = await req.clone().json();
      return NextResponse.json({ translation: body.text || "" });
    } catch {
      return NextResponse.json(
        { error: "Translation failed" },
        { status: 500 }
      );
    }
  }
}
