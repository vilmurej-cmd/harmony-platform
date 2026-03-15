import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();

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
      model: "gpt-4o",
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
