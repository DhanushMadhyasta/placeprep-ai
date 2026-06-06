"use client";

import { useState } from "react";

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

const CATEGORIES = [
  "DSA", "OOP", "DBMS", "OS", "Aptitude",
  "Reasoning", "System Design", "Networking", "Programming", "CS Fundamentals"
];

const CAT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  DSA:              { bg: "#e8f5e9", color: "#3a7a42", border: "#a5d6a7" },
  OOP:              { bg: "#fff3e0", color: "#b06b20", border: "#ffcc80" },
  DBMS:             { bg: "#e3f2fd", color: "#1a6fa8", border: "#90caf9" },
  OS:               { bg: "#fce4ec", color: "#ad1457", border: "#f48fb1" },
  Aptitude:         { bg: "#f0ecff", color: "#6b50b0", border: "#c3b5f5" },
  Reasoning:        { bg: "#f3e5f5", color: "#7b1fa2", border: "#ce93d8" },
  "System Design":  { bg: "#e8eaf6", color: "#3949ab", border: "#9fa8da" },
  Networking:       { bg: "#e0f7fa", color: "#00838f", border: "#80deea" },
  Programming:      { bg: "#f1f8e9", color: "#558b2f", border: "#aed581" },
  "CS Fundamentals":{ bg: "#fff8e1", color: "#f57f17", border: "#ffe082" },
};

export default function AIQuizPage() {
  const [selectedCat, setSelectedCat] = useState("DSA");
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [history, setHistory] = useState<{ q: string; correct: boolean; cat: string }[]>([]);
  const [apiLimitHit, setApiLimitHit] = useState(false);

  const fetchQuestion = async (cat: string) => {
    setLoading(true);
    setError("");
    setQuestion(null);
    setSelected("");
    setAttempts(0);
    setMessage("");
    setShowNext(false);

    try {
      const res = await fetch(`/api/generate-question?category=${encodeURIComponent(cat)}&nocache=true`);
      const data = await res.json();

      if (data.error) {
        if (data.error.includes("429") || data.error.includes("quota")) {
          setApiLimitHit(true);
          setError("🚫 Free API limit reached. Please wait a minute and try again.");
        } else {
          setError("⚠️ Failed to generate question. Try again.");
        }
        setLoading(false);
        return;
      }

      if (!data.question || !data.options || !data.answer) {
        setError("⚠️ Invalid response from AI. Try again.");
        setLoading(false);
        return;
      }

      setQuestion(data);
      setApiLimitHit(false);
    } catch {
      setError("⚠️ Network error. Check your connection.");
    }

    setLoading(false);
  };

  const checkAnswer = () => {
    if (!selected || !question) return;
    if (selected === question.answer) {
      setTotalScore((s) => s + 1);
      setTotalAnswered((s) => s + 1);
      setHistory((h) => [...h, { q: question.question, correct: true, cat: question.category }]);
      setMessage("✅ Correct!");
      setShowNext(true);
      return;
    }
    const na = attempts + 1;
    setAttempts(na);
    if (na === 1) setMessage(`💡 Hint 1: ${question.hint1}`);
    else if (na === 2) setMessage(`💡 Hint 2: ${question.hint2}`);
    else {
      setTotalAnswered((s) => s + 1);
      setHistory((h) => [...h, { q: question.question, correct: false, cat: question.category }]);
      setMessage(`❌ Answer: ${question.answer}. ${question.explanation}`);
      setShowNext(true);
    }
  };

  const nextQuestion = () => fetchQuestion(selectedCat);

  const LETTERS = ["A", "B", "C", "D"];
  const catStyle = question ? (CAT_COLORS[question.category] ?? CAT_COLORS["Aptitude"]) : null;
  const accuracy = totalAnswered > 0 ? Math.round((totalScore / totalAnswered) * 100) : 0;

  return (
    <main style={s.root}>
      <style>{css}</style>

      {/* ── HEADER ── */}
      <header style={s.header} className="ai-header">
        <div style={s.headerInner} className="ai-header-inner">
          <div>
            <h1 style={s.logo} className="ai-logo">PlacePrep <span style={s.accent}>AI</span></h1>
            <p style={s.tagline} className="ai-tagline">Aptitude · Reasoning · Technical · System Design</p>
          </div>
          <div style={s.headerRight} className="ai-header-right">
            <div style={s.scorePills} className="ai-score-pills">
              <span style={s.pill} className="ai-pill">🎯 {totalScore} correct</span>
              <span style={s.pill} className="ai-pill">📝 {totalAnswered} answered</span>
              <span style={{ ...s.pill, color: accuracy >= 70 ? "#3a7a42" : accuracy >= 50 ? "#b06b20" : "#c05b5b" }} className="ai-pill">
                {accuracy}% accuracy
              </span>
            </div>
            <a href="/quiz" style={s.backBtn} className="ai-back-btn">← Quiz Mode</a>
          </div>
        </div>
      </header>

      <div style={s.container} className="ai-container">

        {/* ── CATEGORY SELECTOR ── */}
        <div style={s.catSection}>
          <p style={s.catLabel}>Choose a category</p>
          <div style={s.catGrid}>
            {CATEGORIES.map((cat) => {
              const cs = CAT_COLORS[cat] ?? CAT_COLORS["Aptitude"];
              const isActive = selectedCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    ...s.catChip,
                    background: isActive ? cs.bg : "#faf8ff",
                    color: isActive ? cs.color : "#9488b8",
                    border: `1.5px solid ${isActive ? cs.border : "#e8e2f8"}`,
                    fontWeight: isActive ? 700 : 500,
                    transform: isActive ? "scale(1.04)" : "scale(1)",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── GENERATE BUTTON ── */}
        {!question && !loading && (
          <div style={s.generateWrap} className="ai-generate-wrap">
            {error && <p style={s.errorMsg}>{error}</p>}
            {apiLimitHit && (
              <p style={s.limitNote}>
                💡 Free tier allows ~15 requests/minute. Wait 60s and try again.
              </p>
            )}
            <button
              style={s.generateBtn}
              className="ai-generate-btn"
              onClick={() => fetchQuestion(selectedCat)}
              disabled={loading}
            >
              ✨ Generate {selectedCat} Question
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div style={s.loadCard} className="fadeUp ai-load-card">
            <div style={s.spinner} />
            <div>
              <p style={s.loadTitle}>Generating question…</p>
              <p style={s.loadSub}>AI is crafting a {selectedCat} question for you</p>
            </div>
          </div>
        )}

        {/* ── QUESTION CARD ── */}
        {question && !loading && (
          <div style={s.qCard} className="fadeUp ai-q-card" key={question.id}>

            {/* Meta */}
            <div style={s.qMeta}>
              <span style={{ ...s.qChip, background: catStyle!.bg, color: catStyle!.color, borderColor: catStyle!.border }}>
                {question.category}
              </span>
              <span style={s.qChip}>
                {Math.max(0, 3 - attempts)} attempt{3 - attempts !== 1 ? "s" : ""} left
              </span>
              <span style={{ ...s.qChip, marginLeft: "auto", background: "#f0faf4", color: "#3a7a42", borderColor: "#a5d6a7" }}>
                🤖 AI Generated
              </span>
            </div>

            <h2 style={s.qText} className="ai-q-text">{question.question}</h2>

            {/* Options */}
            <div style={s.optGrid}>
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

            {/* Submit */}
            {!showNext && (
              <button
                style={{ ...s.submitBtn, opacity: selected ? 1 : 0.6 }}
                onClick={checkAnswer}
                disabled={!selected}
              >
                Submit Answer →
              </button>
            )}

            {/* Message */}
            {message && (
              <div style={{
                ...s.msgBanner,
                background: message.startsWith("✅") ? "#e8f5e9" : message.startsWith("❌") ? "#fce8e8" : "#fdf6e3",
                borderColor: message.startsWith("✅") ? "#a5d6a7" : message.startsWith("❌") ? "#f5a5a5" : "#f5d7a5",
                color: message.startsWith("✅") ? "#2e7d32" : message.startsWith("❌") ? "#b71c1c" : "#7c5f00",
              }}>
                {message}
              </div>
            )}

            {/* Next / Try Again */}
            {showNext && (
              <div style={{ display: "flex", gap: 10, marginTop: 12 }} className="ai-next-row">
                <button style={s.nextBtn} onClick={nextQuestion}>
                  Next Question →
                </button>
                <button
                  style={{ ...s.nextBtn, flex: "0 0 auto", background: "#f0faf4", color: "#3a7a42", borderColor: "#a5d6a7" }}
                  onClick={() => {
                    const cats = CATEGORIES.filter((c) => c !== selectedCat);
                    const randomCat = cats[Math.floor(Math.random() * cats.length)];
                    setSelectedCat(randomCat);
                    fetchQuestion(randomCat);
                  }}
                >
                  🎲 Random Category
                </button>
              </div>
            )}

            {error && <p style={{ ...s.errorMsg, marginTop: 10 }}>{error}</p>}
          </div>
        )}

        {/* ── HISTORY ── */}
        {history.length > 0 && (
          <div style={s.historySection}>
            <p style={s.historyTitle}>📋 Session History ({history.length} questions)</p>
            <div style={s.historyList}>
              {[...history].reverse().map((h, i) => {
                const cs = CAT_COLORS[h.cat] ?? CAT_COLORS["Aptitude"];
                return (
                  <div key={i} style={s.historyItem} className="ai-hist-item">
                    <span style={{ ...s.histCat, background: cs.bg, color: cs.color, borderColor: cs.border }}>
                      {h.cat}
                    </span>
                    <span style={s.histQ} className="ai-hist-q">{h.q}</span>
                    <span style={{ ...s.histResult, color: h.correct ? "#3a7a42" : "#c05b5b" }}>
                      {h.correct ? "✅" : "❌"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

// ── CSS ────────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fadeUp { animation: fadeUp 0.4s ease both; }
  button { transition: all 0.2s ease; }
  button:hover { opacity: 0.9; transform: translateY(-1px); }

  /* ── TABLET (≤ 768px) ── */
  @media (max-width: 768px) {
    .ai-header-inner { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
    .ai-header-right { margin-left: 0 !important; width: 100% !important; justify-content: space-between !important; }
    .ai-score-pills  { flex-wrap: wrap !important; gap: 5px !important; }
  }

  /* ── MOBILE (≤ 600px) ── */
  @media (max-width: 600px) {
    .ai-header       { padding: 12px 16px !important; }
    .ai-logo         { font-size: 18px !important; }
    .ai-tagline      { display: none !important; }
    .ai-container    { padding: 16px 12px 48px !important; }
    .ai-cat-chip     { padding: 6px 12px !important; font-size: 12px !important; }
    .ai-generate-btn { width: 100% !important; padding: 14px 20px !important; font-size: 15px !important; }
    .ai-generate-wrap{ padding: 28px 0 !important; width: 100% !important; }
    .ai-q-card       { padding: 18px 14px 16px !important; border-radius: 16px !important; }
    .ai-q-text       { font-size: 17px !important; margin-bottom: 16px !important; }
    .ai-opt-text     { font-size: 13px !important; }
    .ai-next-row     { flex-direction: column !important; }
    .ai-next-row button { flex: unset !important; width: 100% !important; }
    .ai-load-card    { padding: 20px 16px !important; flex-direction: column !important; text-align: center !important; }
    .ai-hist-item    { flex-wrap: wrap !important; }
    .ai-hist-q       { width: 100% !important; font-size: 12px !important; order: 3 !important; }
    .ai-pill         { font-size: 11px !important; padding: 3px 9px !important; }
    .ai-back-btn     { padding: 6px 12px !important; font-size: 12px !important; }
  }
`;

// ── STYLES ─────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(145deg,#faf8ff 0%,#f3f0ff 40%,#f0faf4 80%,#fffdf4 100%)",
    fontFamily: "'DM Sans',sans-serif", color: "#2d2540",
  },
  header: {
    background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
    borderBottom: "1px solid #e8e2f8", padding: "16px 28px",
    position: "sticky", top: 0, zIndex: 100,
  },
  headerInner: {
    maxWidth: 820, margin: "0 auto", display: "flex",
    alignItems: "center", gap: 14, flexWrap: "wrap",
  },
  logo: { fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, color: "#2d2540" },
  accent: { color: "#7c6bb0" },
  tagline: { fontSize: 11, color: "#9488b8", marginTop: 2, letterSpacing: "0.04em" },
  headerRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  scorePills: { display: "flex", gap: 7, flexWrap: "wrap" },
  pill: {
    background: "#f0ecff", color: "#7c6bb0", borderRadius: 20,
    padding: "4px 11px", fontSize: 12, fontWeight: 600, border: "1px solid #ddd6f3",
  },
  backBtn: {
    background: "transparent", color: "#7c6bb0", border: "1.5px solid #c3b5f5",
    borderRadius: 22, padding: "7px 16px", fontWeight: 700, fontSize: 13,
    cursor: "pointer", textDecoration: "none", display: "inline-block",
  },

  container: { maxWidth: 820, margin: "0 auto", padding: "28px 18px 60px" },

  // Category selector
  catSection: { marginBottom: 24 },
  catLabel: { fontSize: 12, fontWeight: 700, color: "#9488b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 },
  catGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  catChip: {
    padding: "7px 16px", borderRadius: 22, fontSize: 13,
    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
    transition: "all 0.2s ease",
  },

  // Generate
  generateWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0" },
  generateBtn: {
    padding: "16px 40px",
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)",
    color: "#fff", border: "none", borderRadius: 16, fontSize: 16,
    fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
    boxShadow: "0 4px 24px rgba(124,107,176,0.28)", letterSpacing: "0.02em",
  },
  errorMsg: { fontSize: 13, fontWeight: 600, color: "#c05b5b", textAlign: "center" },
  limitNote: {
    fontSize: 12, color: "#b06b20", background: "#fff3e0",
    border: "1px solid #ffcc80", borderRadius: 10,
    padding: "8px 16px", textAlign: "center", maxWidth: 420,
  },

  // Loading
  loadCard: {
    background: "#fff", borderRadius: 24, padding: "32px 36px",
    boxShadow: "0 8px 40px rgba(124,107,176,0.10)", border: "1px solid #ede9fa",
    display: "flex", alignItems: "center", gap: 20,
  },
  spinner: {
    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
    border: "3px solid #ede9fa", borderTop: "3px solid #7c6bb0",
    animation: "spin 0.9s linear infinite",
  },
  loadTitle: { fontSize: 15, fontWeight: 700, color: "#2d2540", marginBottom: 4 },
  loadSub: { fontSize: 13, color: "#9488b8" },

  // Question card
  qCard: {
    background: "#fff", borderRadius: 26, padding: "32px 32px 28px",
    boxShadow: "0 8px 40px rgba(124,107,176,0.10)", border: "1px solid #ede9fa",
  },
  qMeta: { display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" },
  qChip: {
    background: "#f0ecff", color: "#7c6bb0", borderRadius: 20,
    padding: "4px 12px", fontSize: 11, fontWeight: 700, border: "1px solid #ddd6f3",
  },
  qText: {
    fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700,
    lineHeight: 1.6, color: "#2d2540", marginBottom: 24,
  },

  // Options
  optGrid: { display: "grid", gap: 9, marginBottom: 22 },
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

  submitBtn: {
    width: "100%", padding: "15px",
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)",
    color: "#fff", border: "none", borderRadius: 13, fontSize: 15,
    fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
    boxShadow: "0 4px 20px rgba(124,107,176,0.22)", letterSpacing: "0.02em",
  },
  msgBanner: {
    marginTop: 14, padding: "13px 16px", borderRadius: 11,
    border: "1.5px solid", fontSize: 13, fontWeight: 600, lineHeight: 1.6,
  },
  nextBtn: {
    flex: 1, padding: "13px",
    background: "#f0ecff", color: "#7c6bb0", border: "1.5px solid #c3b5f5",
    borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.02em",
  },

  // History
  historySection: { marginTop: 32 },
  historyTitle: { fontSize: 13, fontWeight: 700, color: "#9488b8", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" },
  historyList: { display: "flex", flexDirection: "column", gap: 8 },
  historyItem: {
    background: "#fff", borderRadius: 12, padding: "12px 16px",
    border: "1px solid #ede9fa", display: "flex", alignItems: "center", gap: 10,
  },
  histCat: {
    fontSize: 10, fontWeight: 700, padding: "3px 10px",
    borderRadius: 20, border: "1px solid", flexShrink: 0,
  },
  histQ: { flex: 1, fontSize: 13, color: "#2d2540", fontWeight: 500 },
  histResult: { fontSize: 16, flexShrink: 0 },
};