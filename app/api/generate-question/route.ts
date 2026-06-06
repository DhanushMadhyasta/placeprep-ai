import { NextResponse } from "next/server";

let cache: { q: object; time: number } | null = null;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "DSA";

    // Return cached question if less than 60 seconds old
    if (cache && Date.now() - cache.time < 60000) {
      return NextResponse.json(cache.q);
    }

    const API_KEY = process.env.GEMINI_API_KEY ?? "";

    // Very short prompt to minimize token usage
    const prompt = `Give me a ${category} MCQ for placement interviews.
Respond ONLY with JSON in this exact format (short answers, max 10 words each):
{"id":1,"category":"${category}","question":"short question?","options":["opt1","opt2","opt3","opt4"],"answer":"opt1","hint1":"short hint","hint2":"short hint2","explanation":"brief reason"}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!raw) {
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    // Very aggressive cleaning of markdown fences
    let cleaned = raw;
    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");
    cleaned = cleaned.trim();

    // Find first { and last } to extract JSON
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return NextResponse.json({ error: "No JSON found", raw }, { status: 500 });
    }

    const jsonStr = cleaned.slice(start, end + 1);
    const question = JSON.parse(jsonStr);

    // Cache it
    cache = { q: question, time: Date.now() };

    return NextResponse.json(question);

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}