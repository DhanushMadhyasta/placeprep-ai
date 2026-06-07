"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

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
  useAuth();
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    setSidebarOpen(false);

    try {
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
    if (!selected) { setMessage("Please select an option first."); setMessageType("warning"); return; }
    if (!question) return;
    if (selected === question.answer) {
      setMessage("Correct Answer!"); setMessageType("correct");
      setScore((s) => s + 1); setShowAnswer(true);
      setHistory((h) => [{ q: question.question, correct: true, cat: question.category }, ...h.slice(0, 4)]);
      return;
    }
    const na = attempts + 1; setAttempts(na);
    if (na === 1) { setMessage(`Hint 1: ${question.hint1}`); setMessageType("hint"); }
    else if (na === 2) { setMessage(`Hint 2: ${question.hint2}`); setMessageType("hint"); }
    else {
      setMessage(`Correct Answer: ${question.answer}. ${question.explanation}`);
      setMessageType("wrong"); setShowAnswer(true);
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

      {/* ── HEADER ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.headerLeft}>
            {/* Mobile menu toggle */}
            <button style={s.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)} className="menuBtn">
              {sidebarOpen ? "✕" : "☰"}
            </button>
            <div>
              <span style={s.logo}>PlacePrep <span style={s.logoAccent}>AI</span></span>
              <p style={s.tagline} className="tagline">AI Questions · Gemini 3.1</p>
            </div>
          </div>
          <div style={s.headerRight}>
            {total > 0 && <div style={s.scorePill} className="scorePillHide">🎯 {score}/{total}</div>}
            <a href="/quiz" style={s.navBtn}>📝 Quiz</a>
            <a href="/dashboard" style={s.navBtnOutline}>📊 Dashboard</a>
          </div>
        </div>
      </header>

      <div style={s.container}>

        {/* ── MOBILE CATEGORY DRAWER ── */}
        {sidebarOpen && (
          <div style={s.mobileDrawer} className="fadeUp">
            <p style={s.drawerTitle}>Choose Category</p>
            <div style={s.drawerCats}>
              {categories.map((c) => (
                <button
                  key={c.label}
                  onClick={() => { setSelectedCat(c.label); setSidebarOpen(false); }}
                  style={{
                    ...s.drawerCatBtn,
                    background: selectedCat === c.label ? c.bg : "#fff",
                    borderColor: selectedCat === c.label ? c.border : "#ddd6f3",
                    color: selectedCat === c.label ? c.color : "#6b6080",
                    fontWeight: selectedCat === c.label ? 700 : 500,
                  }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
            <button style={s.generateBtn} onClick={() => generate()} disabled={loading}>
              {loading ? "⏳ Generating…" : "🤖 Generate Question"}
            </button>
          </div>
        )}

        <div style={s.layout} className="layout">

          {/* ── DESKTOP SIDEBAR ── */}
          <aside style={s.sidebar} className="desktopSidebar">

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
                    <span style={{ flex: 1 }}>{c.label}</span>
                    {selectedCat === c.label && <span style={{ fontSize: 10 }}>✓</span>}
                  </button>
                ))}
              </div>
              <button
                style={{ ...s.generateBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                onClick={() => generate()}
                disabled={loading}
              >
                {loading
                  ? <><span style={s.spinnerSmall} className="spin" /> Generating…</>
                  : <>🤖 Generate Question</>
                }
              </button>
              {error && <p style={s.errorText}>{error}</p>}
            </div>

            {/* Score card */}
            {total > 0 && (
              <div style={s.scoreCard}>
                <h3 style={s.sideTitle}>Session Score</h3>
                <div style={s.scoreRow}>
                  {[
                    { val: score, label: "Correct", color: "#5b8a52" },
                    { val: total - score, label: "Wrong", color: "#c05b5b" },
                    { val: `${Math.round((score / total) * 100)}%`, label: "Accuracy", color: "#7c6bb0" },
                  ].map((x, i) => (
                    <>
                      {i > 0 && <div key={`d${i}`} style={s.scoreDivider} />}
                      <div key={x.label} style={s.scoreStat}>
                        <span style={{ ...s.scoreVal, color: x.color }}>{x.val}</span>
                        <span style={s.scoreLabel}>{x.label}</span>
                      </div>
                    </>
                  ))}
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
                    marginBottom: i < history.length - 1 ? 10 : 0,
                    paddingBottom: i < history.length - 1 ? 10 : 0,
                  }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{h.correct ? "✅" : "❌"}</span>
                    <div>
                      <p style={s.historyQ}>{h.q.slice(0, 48)}{h.q.length > 48 ? "…" : ""}</p>
                      <p style={s.historyCat}>{h.cat}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* ── MAIN AREA ── */}
          <div style={s.main}>

            {/* Mobile: category + generate strip */}
            <div style={s.mobileCatStrip} className="mobileCatStrip">
              <div style={s.mobileCatScroll}>
                {categories.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setSelectedCat(c.label)}
                    style={{
                      ...s.mobileCatChip,
                      background: selectedCat === c.label ? c.bg : "#fff",
                      borderColor: selectedCat === c.label ? c.border : "#ddd6f3",
                      color: selectedCat === c.label ? c.color : "#9488b8",
                      fontWeight: selectedCat === c.label ? 700 : 500,
                    }}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
              <button
                style={{ ...s.mobileGenBtn, opacity: loading ? 0.7 : 1 }}
                onClick={() => generate()}
                disabled={loading}
              >
                {loading ? "⏳" : "🤖 Generate"}
              </button>
            </div>

            {/* Mobile score strip */}
            {total > 0 && (
              <div style={s.mobileScoreStrip} className="mobileScoreStrip">
                <span style={{ fontSize: 13, fontWeight: 600, color: "#5b8a52" }}>✅ {score} correct</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#c05b5b" }}>❌ {total - score} wrong</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#7c6bb0" }}>🎯 {Math.round((score / total) * 100)}%</span>
              </div>
            )}

            {/* Empty state */}
            {!question && !loading && (
              <div style={s.emptyState} className="fadeUp">
                <div style={s.emptyIcon}>🤖</div>
                <h2 style={s.emptyTitle}>Ready to Generate</h2>
                <p style={s.emptySub}>
                  Select a category and click <strong>"Generate Question"</strong> to get a fresh AI-crafted placement MCQ.
                </p>
                <div style={s.emptyTips}>
                  {["Fresh unique question every time", "Smart 2-level progressive hints", "Full explanation after reveal", "Session score tracking"].map((t) => (
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

            {/* Loading */}
            {loading && (
              <div style={s.loadingState} className="fadeUp">
                <div style={s.loadingSpinner} className="spin" />
                <p style={s.loadingText}>Crafting your question…</p>
                <p style={s.loadingSubtext}>Generating a unique {selectedCat} MCQ</p>
              </div>
            )}

            {/* Question card */}
            {question && !loading && (
              <div style={s.questionCard} className="fadeUp" key={question.id}>

                <div style={s.qHeader}>
                  <div style={s.qMeta}>
                    <span style={{ ...s.qChip, background: cat.bg, color: cat.color, borderColor: cat.border }}>
                      {cat.icon} {question.category}
                    </span>
                    <span style={s.qChip}>🤖 AI</span>
                    <span style={s.qChip}>{Math.max(0, 3 - attempts)} attempts left</span>
                  </div>
                  <button style={s.refreshBtn} onClick={() => generate()}>↻ New</button>
                </div>

                <h2 style={s.qText}>{question.question}</h2>

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
                        {isCorrect && <span style={{ color: "#5b8a52", fontWeight: 800, flexShrink: 0 }}>✓</span>}
                        {isWrong && <span style={{ color: "#c05b5b", fontWeight: 800, flexShrink: 0 }}>✗</span>}
                      </button>
                    );
                  })}
                </div>

                {!showAnswer ? (
                  <button style={s.submitBtn} onClick={checkAnswer}>Submit Answer →</button>
                ) : (
                  <button style={s.nextBtn} onClick={() => generate()}>🤖 Generate Next Question →</button>
                )}

                {message && (
                  <div style={{ ...s.msgBanner, ...(msgStyles[messageType] ?? {}) }}>
                    {messageType === "correct" && "✅ "}
                    {messageType === "wrong" && "❌ "}
                    {messageType === "hint" && "💡 "}
                    {messageType === "warning" && "⚠️ "}
                    {message}
                  </div>
                )}

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
  html, body { overflow-x: hidden; width: 100%; }
  body { font-family: 'DM Sans', sans-serif; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fadeUp { animation: fadeUp 0.4s ease both; }
  .spin { animation: spin 0.8s linear infinite; }
  button { transition: all 0.2s ease; }
  button:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
  a { transition: all 0.2s ease; text-decoration: none; }
  a:hover { opacity: 0.88; }

  /* Desktop defaults */
  .desktopSidebar  { display: flex !important; }
  .mobileCatStrip  { display: none !important; }
  .mobileScoreStrip{ display: none !important; }
  .menuBtn         { display: none !important; }
  .layout          { grid-template-columns: 280px 1fr; }

  /* Mobile (≤768px) */
  @media (max-width: 768px) {
    .desktopSidebar   { display: none !important; }
    .mobileCatStrip   { display: flex !important; }
    .mobileScoreStrip { display: flex !important; }
    .menuBtn          { display: flex !important; }
    .layout           { grid-template-columns: 1fr !important; }
    .tagline          { display: none !important; }
    .mobileCatScroll::-webkit-scrollbar { display: none; }
  }

  @media (max-width: 420px) {
    .scorePillHide { display: none !important; }
  }
`;

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(145deg,#faf8ff 0%,#f3f0ff 40%,#f0faf4 80%,#fffdf4 100%)",
    fontFamily: "'DM Sans',sans-serif", color: "#2d2540",
    overflowX: "hidden", width: "100%",
  },

  // Header
  header: {
    background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
    borderBottom: "1px solid #e8e2f8", padding: "12px 16px",
    position: "sticky", top: 0, zIndex: 100,
    width: "100%", overflowX: "hidden",
  },
  headerInner: {
    maxWidth: 1200, margin: "0 auto",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
    width: "100%",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  logo: { fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: "#2d2540" },
  logoAccent: { color: "#7c6bb0" },
  tagline: { fontSize: 10, color: "#9488b8", marginTop: 1, letterSpacing: "0.03em" },
  headerRight: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  scorePill: {
    background: "#f0ecff", color: "#7c6bb0", border: "1.5px solid #ddd6f3",
    borderRadius: 99, padding: "5px 12px", fontSize: 12, fontWeight: 700,
  },
  navBtn: {
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)", color: "#fff",
    border: "none", borderRadius: 20, padding: "7px 16px",
    fontWeight: 700, fontSize: 12, display: "inline-block",
  },
  navBtnOutline: {
    background: "transparent", color: "#7c6bb0", border: "1.5px solid #c3b5f5",
    borderRadius: 20, padding: "7px 16px", fontWeight: 700, fontSize: 12,
    display: "inline-block",
  },
  menuBtn: {
    background: "#f0ecff", border: "1.5px solid #ddd6f3", borderRadius: 10,
    width: 36, height: 36, fontSize: 16, color: "#7c6bb0", fontWeight: 700,
    cursor: "pointer", alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Sans',sans-serif", flexShrink: 0,
  },

  // Mobile drawer
  mobileDrawer: {
    background: "#fff", border: "1px solid #ede9fa", borderRadius: 18,
    padding: "20px", marginBottom: 16,
    boxShadow: "0 8px 32px rgba(124,107,176,0.12)",
  },
  drawerTitle: { fontWeight: 700, color: "#2d2540", marginBottom: 12, fontSize: 15 },
  drawerCats: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  drawerCatBtn: {
    padding: "7px 14px", borderRadius: 99, border: "1.5px solid",
    fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
  },

  // Mobile category strip
  mobileCatStrip: {
    gap: 8, marginBottom: 14, alignItems: "center",
    flexWrap: "nowrap", width: "100%", overflow: "hidden",
  },
  mobileCatScroll: {
    display: "flex", gap: 8, overflowX: "auto", flex: 1,
    paddingBottom: 4, minWidth: 0,
    scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
  },
  mobileCatChip: {
    padding: "6px 12px", borderRadius: 99, border: "1.5px solid",
    fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
    whiteSpace: "nowrap", flexShrink: 0,
  },
  mobileGenBtn: {
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)", color: "#fff",
    border: "none", borderRadius: 10, padding: "8px 14px",
    fontWeight: 700, fontSize: 13, cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", flexShrink: 0,
  },
  mobileScoreStrip: {
    background: "#fff", borderRadius: 12, padding: "10px 16px",
    border: "1px solid #ede9fa", marginBottom: 14,
    justifyContent: "space-around", flexWrap: "wrap", gap: 8,
    alignItems: "center",
  },

  // Layout
  container: { maxWidth: 1200, margin: "0 auto", padding: "20px 16px 60px", overflowX: "hidden", width: "100%" },
  layout: { display: "grid", gap: 20, alignItems: "start", width: "100%", minWidth: 0 },

  // Desktop sidebar
  sidebar: { flexDirection: "column", gap: 14 },
  sideCard: {
    background: "#fff", borderRadius: 20, padding: "20px 18px",
    border: "1px solid #ede9fa", boxShadow: "0 4px 20px rgba(124,107,176,0.07)",
  },
  sideTitle: {
    fontFamily: "'Playfair Display',serif", fontSize: 15,
    fontWeight: 700, color: "#2d2540", marginBottom: 12,
  },
  catList: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 },
  catBtn: {
    display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
    borderRadius: 10, border: "1.5px solid", cursor: "pointer",
    fontSize: 13, fontFamily: "'DM Sans',sans-serif",
    textAlign: "left", width: "100%", transition: "all 0.2s",
  },
  generateBtn: {
    width: "100%", padding: "12px",
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)",
    color: "#fff", border: "none", borderRadius: 11,
    fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    boxShadow: "0 4px 16px rgba(124,107,176,0.22)",
  },
  spinnerSmall: {
    width: 15, height: 15, borderRadius: "50%",
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTop: "2.5px solid #fff", display: "inline-block",
  },
  errorText: { color: "#c05b5b", fontSize: 12, marginTop: 8, fontWeight: 500 },

  // Score
  scoreCard: {
    background: "#fff", borderRadius: 20, padding: "18px",
    border: "1px solid #ede9fa", boxShadow: "0 4px 20px rgba(124,107,176,0.07)",
  },
  scoreRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  scoreStat: { textAlign: "center", flex: 1 },
  scoreVal: { display: "block", fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display',serif" },
  scoreLabel: { fontSize: 10, color: "#9488b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  scoreDivider: { width: 1, height: 28, background: "#ede9fa" },
  accuracyTrack: { height: 5, background: "#ede9fa", borderRadius: 99, overflow: "hidden" },
  accuracyFill: {
    height: "100%", background: "linear-gradient(90deg,#a8d5b5,#7c6bb0)",
    borderRadius: 99, transition: "width 0.6s ease",
  },

  // History
  historyCard: {
    background: "#fff", borderRadius: 20, padding: "18px",
    border: "1px solid #ede9fa", boxShadow: "0 4px 20px rgba(124,107,176,0.07)",
  },
  historyItem: { display: "flex", gap: 10, alignItems: "flex-start" },
  historyQ: { fontSize: 11, color: "#4a4060", fontWeight: 500, lineHeight: 1.4 },
  historyCat: { fontSize: 10, color: "#9488b8", fontWeight: 600, marginTop: 2 },

  // Main
  main: { minHeight: 400, display: "flex", flexDirection: "column", gap: 0, minWidth: 0, width: "100%" },

  // Empty state
  emptyState: {
    background: "#fff", borderRadius: 24, padding: "40px 24px",
    border: "1px solid #ede9fa", boxShadow: "0 4px 20px rgba(124,107,176,0.07)",
    textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center",
    width: "100%", boxSizing: "border-box",
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontFamily: "'Playfair Display',serif", fontSize: 22,
    fontWeight: 800, color: "#2d2540", marginBottom: 10,
  },
  emptySub: { fontSize: 14, color: "#6b6080", lineHeight: 1.7, marginBottom: 20, maxWidth: "100%" },
  emptyTips: { display: "flex", flexDirection: "column", gap: 9, marginBottom: 24, alignItems: "flex-start", width: "100%" },
  emptyTip: { display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#7c6bb0", fontWeight: 500 },
  emptyTipDot: { width: 7, height: 7, borderRadius: "50%", background: "#7c6bb0", flexShrink: 0 },
  emptyBtn: {
    padding: "13px 28px", background: "linear-gradient(135deg,#9b8de0,#6bb09a)",
    color: "#fff", border: "none", borderRadius: 12, fontSize: 14,
    fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
    boxShadow: "0 4px 20px rgba(124,107,176,0.22)", width: "100%",
  },

  // Loading
  loadingState: {
    background: "#fff", borderRadius: 24, padding: "48px 24px",
    border: "1px solid #ede9fa", boxShadow: "0 4px 20px rgba(124,107,176,0.07)",
    textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
    width: "100%", boxSizing: "border-box",
  },
  loadingSpinner: {
    width: 44, height: 44, borderRadius: "50%",
    border: "4px solid #ede9fa", borderTop: "4px solid #7c6bb0",
  },
  loadingText: { fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#2d2540" },
  loadingSubtext: { fontSize: 13, color: "#9488b8" },

  // Question card
  questionCard: {
    background: "#fff", borderRadius: 24, padding: "22px 18px",
    border: "1px solid #ede9fa", boxShadow: "0 8px 40px rgba(124,107,176,0.10)",
    width: "100%", boxSizing: "border-box", minWidth: 0,
  },
  qHeader: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    marginBottom: 16, gap: 10, flexWrap: "wrap",
  },
  qMeta: { display: "flex", gap: 6, flexWrap: "wrap" },
  qChip: {
    background: "#f0ecff", color: "#7c6bb0", border: "1px solid #ddd6f3",
    borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 700,
  },
  refreshBtn: {
    background: "#f0ecff", color: "#7c6bb0", border: "1.5px solid #ddd6f3",
    borderRadius: 9, padding: "5px 12px", fontSize: 12, fontWeight: 700,
    cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", flexShrink: 0,
  },
  qText: {
    fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700,
    lineHeight: 1.6, color: "#2d2540", marginBottom: 20, wordBreak: "break-word",
  },
  optionsGrid: { display: "grid", gap: 9, marginBottom: 20 },
  optBtn: {
    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
    background: "#faf8ff", border: "1.5px solid #ddd6f3", borderRadius: 12,
    textAlign: "left", fontFamily: "'DM Sans',sans-serif", width: "100%",
  },
  optSel: { borderColor: "#7c6bb0", background: "#f0ecff", boxShadow: "0 0 0 3px rgba(124,107,176,0.10)" },
  optCorrect: { borderColor: "#5b8a52", background: "#e8f5e9", boxShadow: "0 0 0 3px rgba(91,138,82,0.10)" },
  optWrong: { borderColor: "#c05b5b", background: "#fce8e8", boxShadow: "0 0 0 3px rgba(192,91,91,0.10)" },
  optLetter: {
    minWidth: 26, height: 26, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 800, flexShrink: 0, transition: "all 0.2s",
  },
  optText: { flex: 1, fontSize: 14, fontWeight: 500, color: "#2d2540", textAlign: "left", wordBreak: "break-word", minWidth: 0 },
  submitBtn: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)",
    color: "#fff", border: "none", borderRadius: 12, fontSize: 14,
    fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
    boxShadow: "0 4px 20px rgba(124,107,176,0.22)",
  },
  nextBtn: {
    width: "100%", padding: "14px", background: "#f0ecff", color: "#7c6bb0",
    border: "1.5px solid #c3b5f5", borderRadius: 12, fontSize: 14,
    fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
  },
  msgBanner: {
    marginTop: 12, padding: "12px 14px", borderRadius: 10,
    border: "1.5px solid", fontSize: 13, fontWeight: 600, lineHeight: 1.6,
  },
  explanationBox: {
    marginTop: 12, padding: "14px 16px", background: "#f8f6ff",
    borderRadius: 11, border: "1.5px solid #ddd6f3",
  },
  explanationTitle: { fontSize: 12, fontWeight: 700, color: "#7c6bb0", marginBottom: 5 },
  explanationText: { fontSize: 13, color: "#4a4060", lineHeight: 1.65 },
};