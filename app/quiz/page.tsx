"use client";

import { useEffect, useState } from "react";
import { placementQuestions } from "../data/placementQuestions";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  answer: string;
  hint1: string;
  hint2: string;
  explanation: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI QUESTION GENERATOR  (calls Anthropic /v1/messages)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchAIQuestion(category: string): Promise<Question | null> {
  try {
    const prompt = `Generate one placement-interview MCQ question about "${category}". 
Return ONLY valid JSON (no markdown, no backticks) in this exact shape:
{
  "id": 999,
  "category": "${category}",
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "answer": "A",
  "hint1": "...",
  "hint2": "...",
  "explanation": "..."
}
The question must be tricky and commonly asked in top tech company placements.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as Question;
  } catch {
    return null;
  }
}
// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // shuffle and load 25 questions
  useEffect(() => {
    const shuffled = [...placementQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0,25));
  }, []);

  // countdown timer
  useEffect(() => {
    if (questions.length === 0) return;
    if (timeLeft === 0) { nextQuestion(); return; }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, questions.length]);

  if (questions.length === 0) {
    return (
      <main style={s.loadScreen}>
        <style>{css}</style>
        <div style={s.loadCard}>
          <div style={s.spinner} />
          <p style={s.loadText}>Preparing your questions…</p>
        </div>
      </main>
    );
  }

  const question = questions[currentQuestion];

  // ── handlers ──────────────────────────────────────────────────────────────
  const checkAnswer = () => {
    if (!selected) { setMessage("⚠️ Please select an option first"); return; }
    if (selected === question.answer) {
      setScore((s) => s + 1);
      setMessage("✅ Correct Answer!");
      setShowNext(true);
      return;
    }
    const na = attempts + 1;
    setAttempts(na);
    if (na === 1) setMessage(`💡 Hint 1: ${question.hint1}`);
    else if (na === 2) setMessage(`💡 Hint 2: ${question.hint2}`);
    else {
      setMessage(`❌ Correct Answer: ${question.answer}. ${question.explanation}`);
      setShowNext(true);
    }
  };

  const nextQuestion = () => {
    setCurrentQuestion((p) => p + 1);
    setSelected(""); setAttempts(0); setMessage(""); setShowNext(false); setTimeLeft(60);
  };

  const handleAIQuestion = async () => {
    setAiLoading(true); setAiError("");
    const cats = ["DSA", "OOP", "DBMS", "OS", "Aptitude", "Reasoning", "System Design"];
    const cat = cats[Math.floor(Math.random() * cats.length)];
    const q = await fetchAIQuestion(cat);
    if (q) {
      setQuestions((prev) => {
        const updated = [...prev];
        updated.splice(currentQuestion, 0, { ...q, id: Date.now() });
        return updated;
      });
      setAiError("");
    } else {
      setAiError("Couldn't generate AI question. Try again!");
    }
    setAiLoading(false);
  };

  // ── completion screen ──────────────────────────────────────────────────────
  if (currentQuestion >= questions.length) {
    if (!sessionStorage.getItem("quizSaved")) {
      const ta = Number(localStorage.getItem("totalAttempts")) || 0;
      localStorage.setItem("totalAttempts", (ta + 1).toString());
      const ts = Number(localStorage.getItem("totalScore")) || 0;
      localStorage.setItem("totalScore", (ts + score).toString());
      sessionStorage.setItem("quizSaved", "true");
    }
    const pct = Math.round((score / questions.length) * 100);
    const best = Number(localStorage.getItem("bestScore")) || 0;
    if (score > best) localStorage.setItem("bestScore", score.toString());
    const finalBest = Math.max(score, Number(localStorage.getItem("bestScore")) || 0);

    const grade =
      pct >= 80 ? { text: "🔥 Placement Ready", color: "#5b8a52", bg: "#e8f5e9", border: "#a5d6a7" }
      : pct >= 60 ? { text: "👍 Good Performance", color: "#6b50b0", bg: "#f0ecff", border: "#c3b5f5" }
      : { text: "📚 Keep Practising", color: "#b06b50", bg: "#fff3e0", border: "#ffcc80" };

    return (
      <main style={s.loadScreen}>
        <style>{css}</style>
        <div style={s.completionCard} className="fadeUp">
          <span style={s.bigEmoji}>🎉</span>
          <h1 style={s.completionTitle}>Quiz Complete!</h1>
          <div style={s.statsRow3}>
            {[
              { label: "Score", val: `${score}/${questions.length}`, color: "#5b8a52" },
              { label: "Best", val: `🏆 ${finalBest}`, color: "#6b50b0" },
              { label: "Accuracy", val: `${pct}%`, color: "#c0945b" },
            ].map((x) => (
              <div key={x.label} style={s.statPill}>
                <span style={s.pillLabel}>{x.label}</span>
                <span style={{ ...s.pillVal, color: x.color }}>{x.val}</span>
              </div>
            ))}
          </div>
          <div style={{ ...s.gradeTag, color: grade.color, background: grade.bg, borderColor: grade.border }}>
            {grade.text}
          </div>
          <button
            style={s.restartBtn}
            onClick={() => { sessionStorage.removeItem("quizSaved"); window.location.reload(); }}
          >
            Restart Quiz
          </button>
        </div>
      </main>
    );
  }

  // ── timer colour ──────────────────────────────────────────────────────────
  const timerColor = timeLeft > 45 ? "#5b8a52" : timeLeft > 20 ? "#c0945b" : "#c05b5b";
  const LETTERS = ["A", "B", "C", "D"];
  const catColors: Record<string, string> = {
    Aptitude: "#7c6bb0", DSA: "#5b8a52", OOP: "#c0945b", DBMS: "#5b8ab0",
    OS: "#b05b8a", Networking: "#5ba5b0", Programming: "#8ab05b",
    "CS Fundamentals": "#b07c5b", Reasoning: "#6b50b0", "System Design": "#5b6bb0",
  };
  const catColor = catColors[question.category] ?? "#7c6bb0";

  // ── main quiz UI ───────────────────────────────────────────────────────────
  return (
    <main style={s.root}>
      <style>{css}</style>

      {/* ── HEADER ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div>
            <h1 style={s.logo}>PlacePrep <span style={s.logoAccent}>AI</span></h1>
            <p style={s.tagline}>Aptitude · Reasoning · Technical · System Design</p>
          </div>
          <div style={s.badgeRow}>
            <span style={s.badge}>📚 200 Qs</span>
            <span style={s.badge}>⏱ 60 s</span>
            <span style={s.badge}>🎯 Placement Ready</span>
          </div>
          <div style={s.headerBtns}>
            <button
              style={{ ...s.aiBtn, opacity: aiLoading ? 0.7 : 1 }}
              onClick={handleAIQuestion}
              disabled={aiLoading}
            >
              {aiLoading ? "⏳ Generating…" : "🤖 AI Question"}
            </button>
            <a href="/dashboard" style={s.dashBtn}>📊 Dashboard</a>
          </div>
        </div>
        {aiError && <p style={s.aiError}>{aiError}</p>}
      </header>

      {/* ── BODY ── */}
      <div style={s.container}>

        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { label: "Score", val: score, color: "#5b8a52" },
            { label: "Question", val: `${currentQuestion + 1} / ${questions.length}`, color: "#7c6bb0" },
            { label: "Timer", val: `${timeLeft}s`, color: timerColor },
          ].map((x) => (
            <div key={x.label} style={s.statCard}>
              <p style={s.statLabel}>{x.label}</p>
              <p style={{ ...s.statVal, color: x.color }}>{x.val}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={s.progressWrap}>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressFill, width: `${(currentQuestion / questions.length) * 100}%` }} />
          </div>
          <p style={s.progressLabel}>
            {Math.round((currentQuestion / questions.length) * 100)}% complete —{" "}
            {currentQuestion} of {questions.length} questions answered
          </p>
        </div>

        {/* Timer strip */}
        <div style={s.timerStrip}>
          <div style={{ ...s.timerFill, width: `${(timeLeft / 60) * 100}%`, background: timerColor }} />
          <span style={{ ...s.timerLabel, color: timerColor }}>{timeLeft}s remaining</span>
        </div>

        {/* Question dots */}
        <div style={s.dotsRow}>
          {questions.map((_, i) => (
            <div key={i} style={{
              ...s.dot,
              background: i < currentQuestion ? "#5b8a52" : i === currentQuestion ? "#7c6bb0" : "#e8e2f8",
              color: i <= currentQuestion ? "#fff" : "#9488b8",
            }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Question card */}
        <div style={s.qCard} className="fadeUp" key={currentQuestion}>

          <div style={s.qMeta}>
            <span style={{ ...s.qChip, background: `${catColor}18`, color: catColor, borderColor: `${catColor}40` }}>
              {question.category}
            </span>
            <span style={s.qChip}>
              Q {currentQuestion + 1} · {Math.max(0, 3 - attempts)} attempt{3 - attempts !== 1 ? "s" : ""} left
            </span>
          </div>

          <h2 style={s.qText}>{question.question}</h2>

          <div style={s.optionsGrid}>
            {question.options.map((opt, idx) => {
              const isSel = selected === opt;
              return (
                <button
                  key={opt}
                  onClick={() => !showNext && setSelected(opt)}
                  style={{
                    ...s.optBtn,
                    ...(isSel ? s.optBtnSel : {}),
                    cursor: showNext ? "default" : "pointer",
                  }}
                >
                  <span style={{
                    ...s.optLetter,
                    background: isSel ? "#7c6bb0" : "#f0ecff",
                    color: isSel ? "#fff" : "#7c6bb0",
                  }}>
                    {LETTERS[idx]}
                  </span>
                  <span style={s.optText}>{opt}</span>
                  {isSel && <span style={s.optCheck}>✓</span>}
                </button>
              );
            })}
          </div>

          {!showNext && (
            <button style={s.submitBtn} onClick={checkAnswer}>
              Submit Answer →
            </button>
          )}

          {message && (
            <div style={{
              ...s.msgBanner,
              background: message.startsWith("✅") ? "#e8f5e9"
                : message.startsWith("❌") ? "#fce8e8" : "#fdf6e3",
              borderColor: message.startsWith("✅") ? "#a5d6a7"
                : message.startsWith("❌") ? "#f5a5a5" : "#f5d7a5",
              color: message.startsWith("✅") ? "#2e7d32"
                : message.startsWith("❌") ? "#b71c1c" : "#7c5f00",
            }}>
              {message}
            </div>
          )}

          {showNext && (
            <button style={s.nextBtn} onClick={nextQuestion}>
              {currentQuestion === questions.length - 1 ? "Finish Quiz 🎉" : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS KEYFRAMES & FONTS
// ─────────────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
  .fadeUp { animation: fadeUp 0.4s ease both; }
  button:hover { opacity: 0.92; transform: translateY(-1px); }
  button { transition: all 0.2s ease; }
  a:hover { opacity: 0.85; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  // ── loading ──
  loadScreen: {
    minHeight: "100vh",
    background: "linear-gradient(145deg,#faf8ff 0%,#f3f0ff 50%,#f0faf4 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Sans',sans-serif",
  },
  loadCard: {
    background: "#fff", borderRadius: 24, padding: "48px 56px",
    textAlign: "center", boxShadow: "0 8px 40px rgba(124,107,176,0.12)",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
    border: "1px solid #ede9fa",
  },
  spinner: {
    width: 44, height: 44, borderRadius: "50%",
    border: "4px solid #ede9fa", borderTop: "4px solid #7c6bb0",
    animation: "spin 0.9s linear infinite",
  },
  loadText: { fontSize: 16, color: "#7c6bb0", fontWeight: 600 },

  // ── root ──
  root: {
    minHeight: "100vh",
    background: "linear-gradient(145deg,#faf8ff 0%,#f3f0ff 40%,#f0faf4 80%,#fffdf4 100%)",
    fontFamily: "'DM Sans',sans-serif", color: "#2d2540",
  },

  // ── header ──
  header: {
    background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)",
    borderBottom: "1px solid #e8e2f8", padding: "16px 28px",
    position: "sticky", top: 0, zIndex: 100,
  },
  headerInner: {
    maxWidth: 900, margin: "0 auto", display: "flex",
    flexWrap: "wrap", alignItems: "center", gap: 14,
  },
  logo: {
    fontFamily: "'Playfair Display',serif", fontSize: 24,
    fontWeight: 800, color: "#2d2540", lineHeight: 1.1,
  },
  logoAccent: { color: "#7c6bb0" },
  tagline: { fontSize: 11, color: "#9488b8", marginTop: 2, letterSpacing: "0.04em" },
  badgeRow: { display: "flex", gap: 7, marginLeft: "auto", flexWrap: "wrap" },
  badge: {
    background: "#f0ecff", color: "#7c6bb0", borderRadius: 20,
    padding: "4px 11px", fontSize: 11, fontWeight: 600, border: "1px solid #ddd6f3",
  },
  headerBtns: { display: "flex", gap: 8 },
  aiBtn: {
    background: "linear-gradient(135deg,#c3b5f5,#a8d5b5)", color: "#2d2540",
    border: "none", borderRadius: 22, padding: "8px 16px",
    fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
  },
  dashBtn: {
    background: "transparent", color: "#7c6bb0", border: "1.5px solid #c3b5f5",
    borderRadius: 22, padding: "8px 16px", fontWeight: 700, fontSize: 13,
    cursor: "pointer", textDecoration: "none", display: "inline-block",
  },
  aiError: {
    maxWidth: 900, margin: "6px auto 0", color: "#c05b5b",
    fontSize: 12, fontWeight: 600, paddingLeft: 4,
  },

  // ── container ──
  container: { maxWidth: 820, margin: "0 auto", padding: "28px 18px 60px" },

  // ── stats ──
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 },
  statCard: {
    background: "#fff", borderRadius: 18, padding: "16px 18px",
    textAlign: "center", boxShadow: "0 2px 16px rgba(124,107,176,0.08)",
    border: "1px solid #ede9fa",
  },
  statLabel: { fontSize: 11, color: "#9488b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 },
  statVal: { fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display',serif" },

  // ── progress ──
  progressWrap: { marginBottom: 12 },
  progressTrack: { height: 7, background: "#ede9fa", borderRadius: 99, overflow: "hidden" },
  progressFill: {
    height: "100%", background: "linear-gradient(90deg,#a8d5b5,#7c6bb0)",
    borderRadius: 99, transition: "width 0.5s ease",
  },
  progressLabel: { fontSize: 11, color: "#9488b8", marginTop: 5, fontWeight: 500 },

  // ── timer strip ──
  timerStrip: {
    position: "relative", height: 32, background: "#f5f3ff",
    borderRadius: 9, overflow: "hidden", marginBottom: 18,
    display: "flex", alignItems: "center",
  },
  timerFill: {
    position: "absolute", left: 0, top: 0, height: "100%",
    opacity: 0.2, transition: "width 1s linear, background 1s", borderRadius: 9,
  },
  timerLabel: {
    position: "relative", zIndex: 1, fontWeight: 700,
    fontSize: 13, paddingLeft: 12, transition: "color 1s",
  },

  // ── dots ──
  dotsRow: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 22, justifyContent: "center" },
  dot: {
    width: 32, height: 32, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 700, transition: "background 0.3s",
  },

  // ── question card ──
  qCard: {
    background: "#fff", borderRadius: 26, padding: "32px 32px 28px",
    boxShadow: "0 8px 40px rgba(124,107,176,0.10)", border: "1px solid #ede9fa",
  },
  qMeta: { display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" },
  qChip: {
    background: "#f0ecff", color: "#7c6bb0", borderRadius: 20,
    padding: "4px 12px", fontSize: 11, fontWeight: 700, border: "1px solid #ddd6f3",
  },
  qText: {
    fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700,
    lineHeight: 1.6, color: "#2d2540", marginBottom: 24,
  },

  // ── options ──
  optionsGrid: { display: "grid", gap: 9, marginBottom: 22 },
  optBtn: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "13px 16px", background: "#faf8ff",
    border: "1.5px solid #ddd6f3", borderRadius: 13,
    textAlign: "left", fontFamily: "'DM Sans',sans-serif", width: "100%",
  },
  optBtnSel: {
    borderColor: "#7c6bb0", background: "#f0ecff",
    boxShadow: "0 0 0 3px rgba(124,107,176,0.12)",
  },
  optLetter: {
    minWidth: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 800, transition: "all 0.2s", flexShrink: 0,
  },
  optText: { flex: 1, fontSize: 14, fontWeight: 500, color: "#2d2540" },
  optCheck: {
    width: 22, height: 22, borderRadius: "50%", background: "#7c6bb0",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 800, flexShrink: 0,
  },

  // ── submit ──
  submitBtn: {
    width: "100%", padding: "15px",
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)",
    color: "#fff", border: "none", borderRadius: 13, fontSize: 15,
    fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
    boxShadow: "0 4px 20px rgba(124,107,176,0.22)", letterSpacing: "0.02em",
  },

  // ── message ──
  msgBanner: {
    marginTop: 14, padding: "13px 16px", borderRadius: 11,
    border: "1.5px solid", fontSize: 13, fontWeight: 600, lineHeight: 1.6,
    animation: "fadeUp 0.3s ease",
  },

  // ── next ──
  nextBtn: {
    marginTop: 12, width: "100%", padding: "13px",
    background: "#f0ecff", color: "#7c6bb0", border: "1.5px solid #c3b5f5",
    borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.02em",
  },

  // ── completion ──
  completionCard: {
    background: "#fff", borderRadius: 28, padding: "48px 42px",
    textAlign: "center", boxShadow: "0 16px 64px rgba(124,107,176,0.14)",
    border: "1px solid #ede9fa", maxWidth: 460, width: "100%",
  },
  bigEmoji: { fontSize: 52, display: "block", marginBottom: 10, animation: "pulse 1.5s ease infinite" },
  completionTitle: {
    fontFamily: "'Playfair Display',serif", fontSize: 32,
    fontWeight: 800, color: "#2d2540", marginBottom: 26,
  },
  statsRow3: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 },
  statPill: {
    background: "#f8f6ff", border: "1.5px solid #ede9fa", borderRadius: 14,
    padding: "10px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 85,
  },
  pillLabel: { fontSize: 10, color: "#9488b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" },
  pillVal: { fontSize: 20, fontWeight: 800, fontFamily: "'Playfair Display',serif" },
  gradeTag: {
    display: "inline-block", padding: "7px 20px", borderRadius: 99,
    border: "1.5px solid", fontWeight: 700, fontSize: 14, marginBottom: 24,
  },
  restartBtn: {
    width: "100%", padding: "15px",
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)",
    color: "#fff", border: "none", borderRadius: 13, fontSize: 15,
    fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
    boxShadow: "0 4px 20px rgba(124,107,176,0.22)",
  },
};