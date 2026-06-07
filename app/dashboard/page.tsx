"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";

export default function DashboardPage() {
  useAuth();
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    setTotalAttempts(Number(localStorage.getItem("totalAttempts")) || 0);
    setTotalScore(Number(localStorage.getItem("totalScore")) || 0);
    setBestScore(Number(localStorage.getItem("bestScore")) || 0);
  }, []);

  const avgScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
  const avgPct = Math.round((avgScore / 25) * 100);

  const clearData = () => {
    localStorage.removeItem("totalAttempts");
    localStorage.removeItem("totalScore");
    localStorage.removeItem("bestScore");
    setTotalAttempts(0); setTotalScore(0); setBestScore(0);
  };

  const stats = [
    { label: "Total Attempts", val: totalAttempts, icon: "🎯", color: "#7c6bb0", bg: "#f0ecff", border: "#ddd6f3" },
    { label: "Best Score", val: `${bestScore}/25`, icon: "🏆", color: "#5b8a52", bg: "#e8f5e9", border: "#a5d6a7" },
    { label: "Avg Score", val: `${avgScore}/25`, icon: "📈", color: "#c0945b", bg: "#fff3e0", border: "#ffcc80" },
    { label: "Avg Accuracy", val: `${avgPct}%`, icon: "✅", color: "#5b8ab0", bg: "#e3f2fd", border: "#90caf9" },
  ];

  const level =
    avgPct >= 80 ? { label: "🔥 Placement Ready", color: "#5b8a52", bg: "#e8f5e9", border: "#a5d6a7" }
    : avgPct >= 60 ? { label: "👍 On the Right Track", color: "#7c6bb0", bg: "#f0ecff", border: "#ddd6f3" }
    : { label: "📚 Keep Practising", color: "#c0945b", bg: "#fff3e0", border: "#ffcc80" };

  return (
    <main style={s.root}>
      <style>{css}</style>

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div>
            <h1 style={s.logo}>PlacePrep <span style={s.logoAccent}>AI</span></h1>
            <p style={s.tagline} className="header-tagline">Aptitude · Reasoning · Technical · System Design</p>
          </div>
          <div style={s.headerBtns} className="header-btns">
            <a href="/" style={s.headerLink} className="header-link">Home</a>
            <a href="/quiz" style={s.headerLink} className="header-link">Quiz</a>
            <a href="/ai-quiz" style={s.headerLink} className="header-link">🤖 AI</a>
            <a href="/dashboard" style={s.btnRegisterHeader} className="header-link">Dashboard</a>
          </div>
        </div>
      </header>

      <div style={s.container} className="fadeUp">

        {/* Title section */}
        <div style={s.titleSection}>
          <h2 style={s.pageTitle}>Your Progress</h2>
          <p style={s.pageSub}>Track how you're improving over time</p>
        </div>

        {/* Stats grid — big visual cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {stats.map((st) => (
            <div key={st.label} style={{ ...s.statCard, background: st.bg, borderColor: st.border }}>
              {/* Big circular icon */}
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: st.color, margin: "0 auto 12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, boxShadow: `0 4px 16px ${st.color}44`,
              }}>
                {st.icon}
              </div>
              <p style={s.statLabel}>{st.label}</p>
              <p style={{ ...s.statVal, color: st.color }}>{st.val}</p>
              {/* Mini progress bar for accuracy */}
              {st.label === "Avg Accuracy" && totalAttempts > 0 && (
                <div style={{ marginTop: 10, height: 4, background: "#e8e2f8", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${avgPct}%`, height: "100%", background: st.color, borderRadius: 99, transition: "width 0.8s ease" }} />
                </div>
              )}
              {/* Mini bar for best score */}
              {st.label === "Best Score" && totalAttempts > 0 && (
                <div style={{ marginTop: 10, height: 4, background: "#e8e2f8", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${Math.round((bestScore/25)*100)}%`, height: "100%", background: st.color, borderRadius: 99, transition: "width 0.8s ease" }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Level badge */}
        {totalAttempts > 0 && (
          <div style={s.levelSection}>
            <p style={s.levelTitle}>Current Level</p>
            <div style={{ ...s.levelBadge, color: level.color, background: level.bg, borderColor: level.border }}>
              {level.label}
            </div>
          </div>
        )}

        {/* Progress visualization */}
        {totalAttempts > 0 && (
          <div style={s.progressCard}>
            <h3 style={s.cardTitle}>Average Accuracy</h3>
            <div style={s.bigProgressTrack}>
              <div style={{ ...s.bigProgressFill, width: `${avgPct}%` }} />
            </div>
            <div style={s.progressLabels}>
              <span style={s.pLabel}>0%</span>
              <span style={{ ...s.pLabel, color: "#7c6bb0", fontWeight: 700 }}>{avgPct}%</span>
              <span style={s.pLabel}>100%</span>
            </div>

            {/* Milestones */}
            <div style={s.milestones}>
              {[
                { pct: 60, label: "Good", color: "#c0945b" },
                { pct: 80, label: "Ready", color: "#5b8a52" },
              ].map((m) => (
                <div key={m.label} style={s.milestone}>
                  <div style={{ ...s.mDot, background: avgPct >= m.pct ? m.color : "#ddd6f3" }} />
                  <span style={{ ...s.mLabel, color: avgPct >= m.pct ? m.color : "#9488b8" }}>
                    {m.pct}% — {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div style={s.tipsCard}>
          <h3 style={s.cardTitle}>💡 Placement Tips</h3>
          <div style={s.tipsList}>
            {[
              { icon: "🧮", tip: "Aptitude: Practice time-and-work, profit-loss, and percentages daily." },
              { icon: "🌳", tip: "DSA: Know trees, graphs, and DP patterns — they appear in 80% of tech rounds." },
              { icon: "🗄️", tip: "DBMS: Master SQL JOINs, normalization, and transaction properties (ACID)." },
              { icon: "🧵", tip: "OS: Understand process scheduling, deadlocks, and memory management." },
              { icon: "🏗️", tip: "System Design: Study LLD patterns and scalability concepts for senior roles." },
            ].map((t) => (
              <div key={t.tip} style={s.tipItem}>
                <span style={s.tipIcon}>{t.icon}</span>
                <span style={s.tipText}>{t.tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <a href="/quiz" style={s.startBtn}>🚀 Start New Quiz</a>
          {totalAttempts > 0 && (
            <button style={s.clearBtn} onClick={clearData}>🗑 Reset Progress</button>
          )}
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
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fadeUp { animation: fadeUp 0.4s ease both; }
  a, button { transition: all 0.2s ease; }
  a:hover, button:hover { opacity: 0.88; transform: translateY(-1px); }
`;

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh", overflowX: "hidden",
    background: "linear-gradient(145deg,#faf8ff 0%,#f3f0ff 40%,#f0faf4 80%,#fffdf4 100%)",
    fontFamily: "'DM Sans',sans-serif", color: "#2d2540",
  },
  header: {
    background: "rgba(255,255,255,0.82)", backdropFilter: "blur(20px)",
    borderBottom: "1px solid #e8e2f8", padding: "16px 28px",
    position: "sticky", top: 0, zIndex: 100,
  },
  headerInner: {
    maxWidth: 1100, margin: "0 auto", display: "flex",
    alignItems: "center", justifyContent: "space-between", gap: 12,
  },
  logo: { fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, color: "#2d2540", lineHeight: 1.1 },
  logoAccent: { color: "#7c6bb0" },
  tagline: { fontSize: 11, color: "#9488b8", marginTop: 2, letterSpacing: "0.04em" },
  headerBtns: { display: "flex", gap: 10, alignItems: "center" },
  headerLink: {
    background: "transparent", color: "#7c6bb0", border: "1.5px solid #c3b5f5",
    borderRadius: 22, padding: "7px 18px", fontWeight: 700, fontSize: 13,
    fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
    textDecoration: "none", display: "inline-block",
  },
  btnRegisterHeader: {
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)", color: "#fff",
    border: "none", borderRadius: 22, padding: "7px 18px", fontWeight: 700,
    fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
    textDecoration: "none", display: "inline-block",
  },
  primaryBtn: {
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)", color: "#fff",
    border: "none", borderRadius: 22, padding: "8px 14px", fontSize: 13, fontWeight: 700,
    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4,
    whiteSpace: "nowrap",
  },

  container: { maxWidth: 860, margin: "0 auto", padding: "32px 18px 60px" },
  titleSection: { marginBottom: 28, textAlign: "center" },
  pageTitle: { fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 800, color: "#2d2540" },
  pageSub: { color: "#9488b8", fontSize: 14, marginTop: 6 },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 24 },
  statCard: {
    borderRadius: 20, padding: "22px 20px", textAlign: "center",
    border: "1.5px solid", boxShadow: "0 2px 16px rgba(124,107,176,0.07)",
  },
  statIcon: { fontSize: 28, display: "block", marginBottom: 8 },
  statLabel: { fontSize: 11, color: "#9488b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 },
  statVal: { fontSize: 26, fontWeight: 800, fontFamily: "'Playfair Display',serif" },

  levelSection: { textAlign: "center", marginBottom: 24 },
  levelTitle: { fontSize: 12, color: "#9488b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 },
  levelBadge: { display: "inline-block", padding: "9px 24px", borderRadius: 99, border: "1.5px solid", fontWeight: 700, fontSize: 16 },

  progressCard: { background: "#fff", borderRadius: 22, padding: "28px 26px", border: "1px solid #ede9fa", boxShadow: "0 4px 20px rgba(124,107,176,0.07)", marginBottom: 20 },
  cardTitle: { fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#2d2540", marginBottom: 18 },
  bigProgressTrack: { height: 12, background: "#ede9fa", borderRadius: 99, overflow: "hidden", marginBottom: 8 },
  bigProgressFill: { height: "100%", background: "linear-gradient(90deg,#a8d5b5,#7c6bb0)", borderRadius: 99, transition: "width 0.8s ease" },
  progressLabels: { display: "flex", justifyContent: "space-between", marginBottom: 16 },
  pLabel: { fontSize: 12, color: "#9488b8", fontWeight: 500 },
  milestones: { display: "flex", gap: 20, flexWrap: "wrap" },
  milestone: { display: "flex", alignItems: "center", gap: 8 },
  mDot: { width: 10, height: 10, borderRadius: "50%", transition: "background 0.3s" },
  mLabel: { fontSize: 13, fontWeight: 600, transition: "color 0.3s" },

  tipsCard: { background: "#fff", borderRadius: 22, padding: "28px 26px", border: "1px solid #ede9fa", boxShadow: "0 4px 20px rgba(124,107,176,0.07)", marginBottom: 28 },
  tipsList: { display: "flex", flexDirection: "column", gap: 12, marginTop: 4 },
  tipItem: { display: "flex", gap: 12, alignItems: "flex-start" },
  tipIcon: { fontSize: 18, flexShrink: 0, marginTop: 1 },
  tipText: { fontSize: 14, color: "#4a4060", lineHeight: 1.55, fontWeight: 500 },

  actions: { display: "flex", gap: 12, flexWrap: "wrap" },
  startBtn: {
    flex: 1, minWidth: 160, textAlign: "center", padding: "15px",
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)", color: "#fff",
    border: "none", borderRadius: 13, fontSize: 15, fontWeight: 700,
    textDecoration: "none", display: "inline-block",
    boxShadow: "0 4px 20px rgba(124,107,176,0.22)",
  },
  clearBtn: {
    flex: 1, minWidth: 160, padding: "15px", background: "#fff",
    color: "#c05b5b", border: "1.5px solid #f5a5a5", borderRadius: 13,
    fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
  },
};