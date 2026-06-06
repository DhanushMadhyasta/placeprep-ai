import { NextResponse } from "next/server";

// Track last 5 questions to avoid repeats
const recentQuestions: string[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "DSA";

    const API_KEY = process.env.GEMINI_API_KEY ?? "";
    const seed = Math.floor(Math.random() * 99999);

    const avoidStr = recentQuestions.length > 0
      ? `Do NOT generate questions about these recent topics: ${recentQuestions.join(", ")}.`
      : "";

    const prompt = `Generate a unique ${category} MCQ for placement interviews. Seed: ${seed}.
${avoidStr}
Pick a SPECIFIC, UNCOMMON subtopic within ${category}. Be creative and varied.
Return ONLY raw JSON (no markdown, no backticks):
{"id":${seed},"category":"${category}","question":"specific question here?","options":["opt1","opt2","opt3","opt4"],"answer":"opt1","hint1":"hint one","hint2":"hint two","explanation":"brief explanation"}
The answer must exactly match one option. Keep all values under 20 words each.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.0,
            maxOutputTokens: 2048,
            topP: 0.95,
            topK: 64,
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
      return NextResponse.json({ error: "Empty response from Gemini" }, { status: 500 });
    }

    // Strip markdown fences
    let cleaned = raw;
    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");
    cleaned = cleaned.trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return NextResponse.json({ error: "Could not parse response", raw }, { status: 500 });
    }

    const question = JSON.parse(cleaned.slice(start, end + 1));

    // Track recent to avoid repeats (keep last 5)
    const topic = question.question?.slice(0, 40) ?? "";
    recentQuestions.push(topic);
    if (recentQuestions.length > 5) recentQuestions.shift();

    return NextResponse.json(question);

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}