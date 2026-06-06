"use client";

import { useState } from "react";

const categories = [
  { label: "DSA", icon: "🌳", color: "#5b8a52", bg: "#e8f5e9", border: "#a5d6a7" },
  { label: "OOP", icon: "🧩", color: "#7c6bb0", bg: "#f0ecff", border: "#ddd6f3" },
  { label: "DBMS", icon: "🗄️", color: "#b05b8a", bg: "#fce4ec", border: "#f48fb1" },
  { label: "OS", icon: "🖥️", color: "#5b8ab0", bg: "#e3f2fd", border: "#90caf9" },
  { label: "Aptitude", icon: "🧮", color: "#c0945b", bg: "#fff3e0", border: "#ffcc80" },
  { label: "Reasoning", icon: "🧠", color: "#6b50b0", bg: "#ede7f6", border: "#b39ddb" },
  { label: "System Design", icon: "🏗️", color: "#5b6bb0", bg: "#e8eaf6", border: "#9fa8da" },
  { label: "Networking", icon: "🌐", color: "#5ba5b0", bg: "#e0f7fa", border: "#80deea" },
];

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

type MessageType = "correct" | "wrong" | "hint" | "warning" | "";

export default function AIQuestionPage() {
  const [selectedCat, setSelectedCat] = useState("DSA");
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<{ q: string; correct: boolean; cat: string }[]>([]);

  const generate = async (cat?: string) => {
    const category = cat ?? selectedCat;
    setLoading(true);
    setError("");
    setQuestion(null);
    setSelected("");
    setAttempts(0);
    setMessage("");
    setMessageType("");
    setShowAnswer(false);

    try {
      // ✅ timestamp busts any browser/server cache — always fresh question
      const res = await fetch(`/api/generate-question?category=${category}&t=${Date.now()}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setQuestion(data);
        setTotal((t) => t + 1);
      }
    } catch {
      setError("Network error — please try again.");
    }
    setLoading(false);
  };

  const checkAnswer = () => {
    if (!selected) {
      setMessage("Please select an option first.");
      setMessageType("warning");
      return;
    }
    if (!question) return;

    if (selected === question.answer) {
      setMessage("Correct Answer!");
      setMessageType("correct");
      setScore((s) => s + 1);
      setShowAnswer(true);
      setHistory((h) => [{ q: question.question, correct: true, cat: question.category }, ...h.slice(0, 4)]);
      return;
    }

    const na = attempts + 1;
    setAttempts(na);

    if (na === 1) {
      setMessage(`Hint 1: ${question.hint1}`);
      setMessageType("hint");
    } else if (na === 2) {
      setMessage(`Hint 2: ${question.hint2}`);
      setMessageType("hint");
    } else {
      setMessage(`Correct Answer: ${question.answer}. ${question.explanation}`);
      setMessageType("wrong");
      setShowAnswer(true);
      setHistory((h) => [{ q: question.question, correct: false, cat: question.category }, ...h.slice(0, 4)]);
    }
  };

  const cat = categories.find((c) => c.label === selectedCat) ?? categories[0];
  const LETTERS = ["A", "B", "C", "D"];

  const msgStyles: Record<string, React.CSSProperties> = {
    correct: { background: "#e8f5e9", borderColor: "#a5d6a7", color: "#2e7d32" },
    wrong:   { background: "#fce8e8", borderColor: "#f5a5a5", color: "#b71c1c" },
    hint:    { background: "#fdf6e3", borderColor: "#f5d7a5", color: "#7c5f00" },
    warning: { background: "#fff3e0", borderColor: "#ffcc80", color: "#e65100" },
  };

  return (
    <main style={s.root}>
      <style>{css}</style>

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div>
            <span style={s.logo}>PlacePrep <span style={s.logoAccent}>AI</span></span>
            <p style={s.tagline}>AI-Generated Questions · Powered by Gemini 3.1</p>
          </div>
          <div style={s.headerRight}>
            {total > 0 && (
              <div style={s.scorePill}>🎯 {score}/{total} correct</div>
            )}
            <a href="/quiz" style={s.navBtn}>📝 Quiz</a>
            <a href="/dashboard" style={s.navBtnOutline}>📊 Dashboard</a>
          </div>
        </div>
      </header>

      <div style={s.container}>
        <div style={s.layout}>

          {/* ── LEFT SIDEBAR ── */}
          <aside style={s.sidebar}>

            {/* Category picker */}
            <div style={s.sideCard}>
              <h3 style={s.sideTitle}>Choose Category</h3>
              <div style={s.catList}>
                {categories.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setSelectedCat(c.label)}
                    style={{
                      ...s.catBtn,
                      background: selectedCat === c.label ? c.bg : "#faf8ff",
                      borderColor: selectedCat === c.label ? c.border : "#ddd6f3",
                      color: selectedCat === c.label ? c.color : "#9488b8",
                      fontWeight: selectedCat === c.label ? 700 : 500,
                    }}
                  >
                    <span>{c.icon}</span>
                    <span>{c.label}</span>
                    {selectedCat === c.label && <span style={{ marginLeft: "auto", fontSize: 10 }}>✓</span>}
                  </button>
                ))}
              </div>

              <button
                style={{ ...s.generateBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                onClick={() => generate()}
                disabled={loading}
              >
                {loading ? (
                  <><span style={s.spinnerSmall} className="spin" /> Generating…</>
                ) : (
                  <>🤖 Generate Question</>
                )}
              </button>

              {error && <p style={s.errorText}>{error}</p>}
            </div>

            {/* Score card */}
            {total > 0 && (
              <div style={s.scoreCard}>
                <h3 style={s.sideTitle}>Session Score</h3>
                <div style={s.scoreRow}>
                  <div style={s.scoreStat}>
                    <span style={{ ...s.scoreVal, color: "#5b8a52" }}>{score}</span>
                    <span style={s.scoreLabel}>Correct</span>
                  </div>
                  <div style={s.scoreDivider} />
                  <div style={s.scoreStat}>
                    <span style={{ ...s.scoreVal, color: "#c05b5b" }}>{total - score}</span>
                    <span style={s.scoreLabel}>Wrong</span>
                  </div>
                  <div style={s.scoreDivider} />
                  <div style={s.scoreStat}>
                    <span style={{ ...s.scoreVal, color: "#7c6bb0" }}>{Math.round((score / total) * 100)}%</span>
                    <span style={s.scoreLabel}>Accuracy</span>
                  </div>
                </div>
                <div style={s.accuracyTrack}>
                  <div style={{ ...s.accuracyFill, width: `${Math.round((score / total) * 100)}%` }} />
                </div>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div style={s.historyCard}>
                <h3 style={s.sideTitle}>Recent</h3>
                {history.map((h, i) => (
                  <div key={i} style={{
                    ...s.historyItem,
                    borderBottom: i < history.length - 1 ? "1px solid #f0ecff" : "none",
                  }}>
                    <span style={{ fontSize: 14 }}>{h.correct ? "✅" : "❌"}</span>
                    <div>
                      <p style={s.historyQ}>{h.q.slice(0, 50)}{h.q.length > 50 ? "…" : ""}</p>
                      <p style={s.historyCat}>{h.cat}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* ── MAIN AREA ── */}
          <div style={s.main}>

            {/* Empty state */}
            {!question && !loading && (
              <div style={s.emptyState} className="fadeUp">
                <div style={s.emptyIcon}>🤖</div>
                <h2 style={s.emptyTitle}>Ready to Generate</h2>
                <p style={s.emptySub}>
                  Select a category and click <strong>"Generate Question"</strong><br />
                  to get a fresh AI-crafted placement MCQ.
                </p>
                <div style={s.emptyTips}>
                  {[
                    "Fresh unique question every time",
                    "Smart 2-level progressive hints",
                    "Full explanation after reveal",
                    "Session score tracking",
                  ].map((t) => (
                    <div key={t} style={s.emptyTip}>
                      <span style={s.emptyTipDot} />
                      {t}
                    </div>
                  ))}
                </div>
                <button style={s.emptyBtn} onClick={() => generate()}>
                  🚀 Generate First Question
                </button>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div style={s.loadingState} className="fadeUp">
                <div style={s.loadingSpinner} className="spin" />
                <p style={s.loadingText}>Gemini 3.1 is crafting your question…</p>
                <p style={s.loadingSubtext}>Generating a unique {selectedCat} MCQ for placements</p>
              </div>
            )}

            {/* Question card */}
            {question && !loading && (
              <div style={s.questionCard} className="fadeUp" key={question.id}>

                <div style={s.qHeader}>
                  <div style={s.qMeta}>
                    <span style={{
                      ...s.qChip,
                      background: cat.bg, color: cat.color, borderColor: cat.border,
                    }}>
                      {cat.icon} {question.category}
                    </span>
                    <span style={s.qChip}>🤖 AI Generated</span>
                    <span style={s.qChip}>
                      {Math.max(0, 3 - attempts)} attempt{3 - attempts !== 1 ? "s" : ""} left
                    </span>
                  </div>
                  <button style={s.refreshBtn} onClick={() => generate()}>
                    ↻ New Question
                  </button>
                </div>

                <h2 style={s.qText}>{question.question}</h2>

                {/* Options */}
                <div style={s.optionsGrid}>
                  {question.options.map((opt, idx) => {
                    const isSel = selected === opt;
                    const isCorrect = showAnswer && opt === question.answer;
                    const isWrong = showAnswer && isSel && opt !== question.answer;
                    return (
                      <button
                        key={opt}
                        onClick={() => !showAnswer && setSelected(opt)}
                        style={{
                          ...s.optBtn,
                          ...(isSel && !showAnswer ? s.optSel : {}),
                          ...(isCorrect ? s.optCorrect : {}),
                          ...(isWrong ? s.optWrong : {}),
                          cursor: showAnswer ? "default" : "pointer",
                        }}
                      >
                        <span style={{
                          ...s.optLetter,
                          background: isCorrect ? "#5b8a52" : isWrong ? "#c05b5b" : isSel ? "#7c6bb0" : "#f0ecff",
                          color: (isCorrect || isWrong || isSel) ? "#fff" : "#7c6bb0",
                        }}>
                          {LETTERS[idx]}
                        </span>
                        <span style={s.optText}>{opt}</span>
                        {isCorrect && <span style={{ color: "#5b8a52", fontWeight: 800 }}>✓</span>}
                        {isWrong && <span style={{ color: "#c05b5b", fontWeight: 800 }}>✗</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Submit / Next */}
                {!showAnswer ? (
                  <button style={s.submitBtn} onClick={checkAnswer}>
                    Submit Answer →
                  </button>
                ) : (
                  <button style={s.nextBtn} onClick={() => generate()}>
                    🤖 Generate Next Question →
                  </button>
                )}

                {/* Message banner */}
                {message && (
                  <div style={{ ...s.msgBanner, ...(msgStyles[messageType] ?? {}) }}>
                    {messageType === "correct" && "✅ "}
                    {messageType === "wrong" && "❌ "}
                    {messageType === "hint" && "💡 "}
                    {messageType === "warning" && "⚠️ "}
                    {message}
                  </div>
                )}

                {/* Explanation */}
                {showAnswer && (
                  <div style={s.explanationBox}>
                    <p style={s.explanationTitle}>📖 Explanation</p>
                    <p style={s.explanationText}>{question.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fadeUp { animation: fadeUp 0.4s ease both; }
  .spin { animation: spin 0.8s linear infinite; }
  button { transition: all 0.2s ease; }
  button:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
  a { transition: all 0.2s ease; }
  a:hover { opacity: 0.88; transform: translateY(-1px); }
`;

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(145deg,#faf8ff 0%,#f3f0ff 40%,#f0faf4 80%,#fffdf4 100%)",
    fontFamily: "'DM Sans',sans-serif", color: "#2d2540",
  },
  header: {
    background: "rgba(255,255,255,0.82)", backdropFilter: "blur(20px)",
    borderBottom: "1px solid #e8e2f8", padding: "14px 28px",
    position: "sticky", top: 0, zIndex: 100,
  },
  headerInner: {
    maxWidth: 1200, margin: "0 auto",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  logo: { fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, color: "#2d2540" },
  logoAccent: { color: "#7c6bb0" },
  tagline: { fontSize: 11, color: "#9488b8", marginTop: 2, letterSpacing: "0.04em" },
  headerRight: { display: "flex", alignItems: "center", gap: 10 },
  scorePill: {
    background: "#f0ecff", color: "#7c6bb0", border: "1.5px solid #ddd6f3",
    borderRadius: 99, padding: "6px 14px", fontSize: 12, fontWeight: 700,
  },
  navBtn: {
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)", color: "#fff",
    border: "none", borderRadius: 22, padding: "8px 18px",
    fontWeight: 700, fontSize: 13, textDecoration: "none", display: "inline-block",
  },
  navBtnOutline: {
    background: "transparent", color: "#7c6bb0", border: "1.5px solid #c3b5f5",
    borderRadius: 22, padding: "8px 18px", fontWeight: 700, fontSize: 13,
    textDecoration: "none", display: "inline-block",
  },
  container: { maxWidth: 1200, margin: "0 auto", padding: "28px 20px 60px" },
  layout: { display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" },

  // Sidebar
  sidebar: { display: "flex", flexDirection: "column", gap: 16 },
  sideCard: {
    background: "#fff", borderRadius: 22, padding: "22px 20px",
    border: "1px solid #ede9fa", boxShadow: "0 4px 20px rgba(124,107,176,0.07)",
  },
  sideTitle: {
    fontFamily: "'Playfair Display',serif", fontSize: 16,
    fontWeight: 700, color: "#2d2540", marginBottom: 14,
  },
  catList: { display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 },
  catBtn: {
    display: "flex", alignItems: "center", gap: 9, padding: "10px 14px",
    borderRadius: 11, border: "1.5px solid", cursor: "pointer",
    fontSize: 13, fontFamily: "'DM Sans',sans-serif",
    textAlign: "left", width: "100%", transition: "all 0.2s",
  },
  generateBtn: {
    width: "100%", padding: "13px",
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)",
    color: "#fff", border: "none", borderRadius: 12,
    fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    boxShadow: "0 4px 16px rgba(124,107,176,0.22)",
  },
  spinnerSmall: {
    width: 16, height: 16, borderRadius: "50%",
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTop: "2.5px solid #fff", display: "inline-block",
  },
  errorText: { color: "#c05b5b", fontSize: 12, marginTop: 10, fontWeight: 500 },

  // Score
  scoreCard: {
    background: "#fff", borderRadius: 22, padding: "20px",
    border: "1px solid #ede9fa", boxShadow: "0 4px 20px rgba(124,107,176,0.07)",
  },
  scoreRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  scoreStat: { textAlign: "center", flex: 1 },
  scoreVal: { display: "block", fontSize: 24, fontWeight: 800, fontFamily: "'Playfair Display',serif" },
  scoreLabel: { fontSize: 11, color: "#9488b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  scoreDivider: { width: 1, height: 32, background: "#ede9fa" },
  accuracyTrack: { height: 6, background: "#ede9fa", borderRadius: 99, overflow: "hidden" },
  accuracyFill: {
    height: "100%", background: "linear-gradient(90deg,#a8d5b5,#7c6bb0)",
    borderRadius: 99, transition: "width 0.6s ease",
  },

  // History
  historyCard: {
    background: "#fff", borderRadius: 22, padding: "20px",
    border: "1px solid #ede9fa", boxShadow: "0 4px 20px rgba(124,107,176,0.07)",
  },
  historyItem: {
    display: "flex", gap: 10, alignItems: "flex-start",
    paddingBottom: 10, marginBottom: 10,
  },
  historyQ: { fontSize: 12, color: "#4a4060", fontWeight: 500, lineHeight: 1.4 },
  historyCat: { fontSize: 10, color: "#9488b8", fontWeight: 600, marginTop: 2 },

  // Main
  main: { minHeight: 500 },

  // Empty state
  emptyState: {
    background: "#fff", borderRadius: 26, padding: "56px 40px",
    border: "1px solid #ede9fa", boxShadow: "0 4px 20px rgba(124,107,176,0.07)",
    textAlign: "center",
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: {
    fontFamily: "'Playfair Display',serif", fontSize: 26,
    fontWeight: 800, color: "#2d2540", marginBottom: 10,
  },
  emptySub: { fontSize: 15, color: "#6b6080", lineHeight: 1.7, marginBottom: 24 },
  emptyTips: { display: "inline-flex", flexDirection: "column", gap: 10, marginBottom: 28, textAlign: "left" },
  emptyTip: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#7c6bb0", fontWeight: 500 },
  emptyTipDot: { width: 8, height: 8, borderRadius: "50%", background: "#7c6bb0", flexShrink: 0 },
  emptyBtn: {
    padding: "14px 32px", background: "linear-gradient(135deg,#9b8de0,#6bb09a)",
    color: "#fff", border: "none", borderRadius: 13, fontSize: 15,
    fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
    boxShadow: "0 4px 20px rgba(124,107,176,0.22)",
  },

  // Loading
  loadingState: {
    background: "#fff", borderRadius: 26, padding: "64px 40px",
    border: "1px solid #ede9fa", boxShadow: "0 4px 20px rgba(124,107,176,0.07)",
    textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
  },
  loadingSpinner: {
    width: 48, height: 48, borderRadius: "50%",
    border: "4px solid #ede9fa", borderTop: "4px solid #7c6bb0",
  },
  loadingText: { fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#2d2540" },
  loadingSubtext: { fontSize: 13, color: "#9488b8" },

  // Question card
  questionCard: {
    background: "#fff", borderRadius: 26, padding: "32px",
    border: "1px solid #ede9fa", boxShadow: "0 8px 40px rgba(124,107,176,0.10)",
  },
  qHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12 },
  qMeta: { display: "flex", gap: 8, flexWrap: "wrap" },
  qChip: {
    background: "#f0ecff", color: "#7c6bb0", border: "1px solid #ddd6f3",
    borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700,
  },
  refreshBtn: {
    background: "#f0ecff", color: "#7c6bb0", border: "1.5px solid #ddd6f3",
    borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700,
    cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", flexShrink: 0,
  },
  qText: {
    fontFamily: "'Playfair Display',serif", fontSize: 22,
    fontWeight: 700, lineHeight: 1.6, color: "#2d2540", marginBottom: 24,
  },
  optionsGrid: { display: "grid", gap: 10, marginBottom: 22 },
  optBtn: {
    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
    background: "#faf8ff", border: "1.5px solid #ddd6f3", borderRadius: 13,
    textAlign: "left", fontFamily: "'DM Sans',sans-serif", width: "100%",
  },
  optSel: { borderColor: "#7c6bb0", background: "#f0ecff", boxShadow: "0 0 0 3px rgba(124,107,176,0.10)" },
  optCorrect: { borderColor: "#5b8a52", background: "#e8f5e9", boxShadow: "0 0 0 3px rgba(91,138,82,0.10)" },
  optWrong: { borderColor: "#c05b5b", background: "#fce8e8", boxShadow: "0 0 0 3px rgba(192,91,91,0.10)" },
  optLetter: {
    minWidth: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 800, flexShrink: 0, transition: "all 0.2s",
  },
  optText: { flex: 1, fontSize: 14, fontWeight: 500, color: "#2d2540" },
  submitBtn: {
    width: "100%", padding: "15px",
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)",
    color: "#fff", border: "none", borderRadius: 13, fontSize: 15,
    fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
    boxShadow: "0 4px 20px rgba(124,107,176,0.22)",
  },
  nextBtn: {
    width: "100%", padding: "15px", background: "#f0ecff", color: "#7c6bb0",
    border: "1.5px solid #c3b5f5", borderRadius: 13, fontSize: 15,
    fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
  },
  msgBanner: {
    marginTop: 14, padding: "13px 16px", borderRadius: 11,
    border: "1.5px solid", fontSize: 13, fontWeight: 600,
    lineHeight: 1.6, animation: "fadeUp 0.3s ease",
  },
  explanationBox: {
    marginTop: 14, padding: "16px 18px", background: "#f8f6ff",
    borderRadius: 12, border: "1.5px solid #ddd6f3",
  },
  explanationTitle: { fontSize: 13, fontWeight: 700, color: "#7c6bb0", marginBottom: 6 },
  explanationText: { fontSize: 13, color: "#4a4060", lineHeight: 1.65 },
};