"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const FEATURES = [
  { icon: "🧠", title: "200+ Questions", desc: "Curated from real FAANG placement rounds — Aptitude, DSA, System Design & Reasoning." },
  { icon: "⏱", title: "60-Second Timer", desc: "Every question is timed. Train under pressure so exams feel easy." },
  { icon: "💡", title: "Smart Hints", desc: "Two progressive hints per question guide you without giving away the answer." },
  { icon: "🤖", title: "AI Question Mode", desc: "Stuck in a loop? Generate a fresh question on-demand using Gemini AI." },
  { icon: "📊", title: "Dashboard Analytics", desc: "Track attempts, accuracy trends, and your best score over time." },
  { icon: "🎯", title: "Placement Ready Grade", desc: "Get a verdict — Placement Ready / Good / Keep Practising — after every session." },
];

const CATEGORIES = [
  { label: "Aptitude", color: "#7c6bb0", bg: "#f0ecff", border: "#ddd6f3" },
  { label: "DSA", color: "#5b8a52", bg: "#e8f5e9", border: "#a5d6a7" },
  { label: "System Design", color: "#5b6bb0", bg: "#eef0ff", border: "#b5bdf5" },
  { label: "Reasoning", color: "#6b50b0", bg: "#ede8ff", border: "#c3b5f5" },
  { label: "OOP", color: "#c0945b", bg: "#fff3e0", border: "#ffcc80" },
  { label: "DBMS", color: "#5b8ab0", bg: "#e3f2fd", border: "#90caf9" },
];

export default function HomePage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState<{ fullName: string; username: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("placeprep_token");
      const stored = localStorage.getItem("placeprep_user");

      if (!token || !stored) {
        setUser(null);
        setAuthChecked(true);
        return;
      }

      // Validate token live with Supabase — catches deleted users instantly
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

      if (!supabaseUser || error) {
        localStorage.removeItem("placeprep_user");
        localStorage.removeItem("placeprep_token");
        document.cookie = "placeprep_token=; path=/; max-age=0";
        setUser(null);
      } else {
        try { setUser(JSON.parse(stored)); } catch { }
      }

      setAuthChecked(true);
    };

    validateSession();

    // Poll every 15 seconds — re-checks while user sits on home page
    const interval = setInterval(validateSession, 15_000);

    // Listen for localStorage changes (when AuthWatcher clears the token)
    const onStorage = () => {
      const token = localStorage.getItem("placeprep_token");
      if (!token) { setUser(null); setAuthChecked(true); }
    };
    window.addEventListener("storage", onStorage);

    const t = setTimeout(() => setVisible(true), 80);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleLogout = () => {
    document.cookie = "placeprep_token=; path=/; max-age=0";
    localStorage.removeItem("placeprep_user");
    localStorage.removeItem("placeprep_token");
    setUser(null);
    router.replace("/login");
  };

  const firstName = user?.fullName?.split(" ")[0] ?? "";

  const renderHeader = () => (
    <header style={s.header}>
      <div style={s.headerInner} className="header-inner">
        <div>
          <h1 style={s.logo} className="logo-text">PlacePrep <span style={s.logoAccent}>AI</span></h1>
          <p style={s.tagline} className="header-tagline">Aptitude · Reasoning · Technical · System Design</p>
        </div>

        {authChecked && (
          <div style={s.headerBtns} className="header-btns">
            {user ? (
              <>
                <a href="/quiz" style={s.headerLink} className="header-link">Quiz</a>
                <a href="/ai-quiz" style={s.headerLink} className="header-link">🤖 AI</a>
                <a href="/dashboard" style={s.headerLink} className="header-link">Dashboard</a>
                <div style={s.avatarWrap} className="avatar-wrap">
                  <div style={s.avatarCircle}>{firstName[0]?.toUpperCase()}</div>
                  <span style={s.avatarName} className="avatar-name">{firstName}</span>
                  <button style={s.logoutBtn} className="logout-btn" onClick={handleLogout}>Sign Out</button>
                </div>
              </>
            ) : (
              <>
                <a href="/login" style={s.headerLink} className="header-link">Sign In</a>
                <a href="/register" style={s.btnRegisterHeader} className="header-link">Register →</a>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );

  const renderHeroCTA = () => (
    <div style={s.ctaRow} className="fadeUp-d5 cta-row">
      {user ? (
        <>
          <a href="/quiz" style={s.btnPrimary} className="btn-hover btn-primary">🚀 &nbsp;Start Quiz</a>
          <a href="/ai-quiz" style={s.btnAI} className="btn-hover btn-ai">🤖 &nbsp;AI Questions</a>
          <a href="/dashboard" style={s.btnSecondary} className="btn-hover btn-secondary">📊 &nbsp;Dashboard</a>
        </>
      ) : (
        <>
          <a href="/register" style={s.btnPrimary} className="btn-hover btn-primary">🚀 &nbsp;Get Started Free</a>
          <a href="/login" style={s.btnSecondary} className="btn-hover btn-secondary">Sign In →</a>
        </>
      )}
    </div>
  );

  const renderBottomCTA = () => (
    <div style={s.ctaBtns} className="cta-btns">
      {user ? (
        <>
          <a href="/quiz" style={s.btnPrimary} className="btn-hover btn-primary">🚀 &nbsp;Start Quiz Now</a>
          <a href="/ai-quiz" style={s.btnAI} className="btn-hover btn-ai">🤖 &nbsp;AI Questions</a>
          <a href="/dashboard" style={s.btnGhost} className="btn-hover">📊 &nbsp;View Dashboard</a>
        </>
      ) : (
        <>
          <a href="/register" style={s.btnPrimary} className="btn-hover btn-primary">🚀 &nbsp;Create Free Account</a>
          <a href="/login" style={s.btnGhost} className="btn-hover">Sign In →</a>
        </>
      )}
    </div>
  );

  return (
    <main style={s.root}>
      <style>{css}</style>

      {renderHeader()}

      <section style={s.hero} ref={heroRef} className="hero-grid">
        <div style={s.blob1} />
        <div style={s.blob2} />
        <div style={s.blob3} />

        <div style={{ ...s.heroContent, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.7s ease, transform 0.7s ease" }} className="hero-content">
          <div style={s.heroBadge} className="fadeUp-d1 hero-badge">
            {user ? `👋 Welcome back, ${firstName}!` : "✨ \u00A0Trusted by 10,000+ placement aspirants"}
          </div>

          <h2 style={s.heroTitle} className="fadeUp-d2 hero-title">
            Crack Your<br />
            <span style={s.heroAccent}>Dream Company</span><br />
            Interview
          </h2>

          <p style={s.heroSub} className="fadeUp-d3 hero-sub">
            Practice 200+ hand-picked placement questions across DSA, Aptitude,
            System Design &amp; Reasoning — with timed sessions, smart hints,
            and AI-generated challenges.
          </p>

          <div style={s.catRow} className="fadeUp-d4 cat-row">
            {CATEGORIES.map((c) => (
              <span key={c.label} style={{ ...s.catPill, color: c.color, background: c.bg, borderColor: c.border }}>
                {c.label}
              </span>
            ))}
          </div>

          {renderHeroCTA()}

          <div style={s.statsStrip} className="fadeUp-d6 stats-strip">
            {[
              { val: "200+", label: "Questions" },
              { val: "6", label: "Categories" },
              { val: "60s", label: "Per Question" },
              { val: "∞", label: "AI Questions" },
            ].map((x) => (
              <div key={x.label} style={s.statItem} className="stat-item">
                <span style={s.statVal}>{x.val}</span>
                <span style={s.statLabel}>{x.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...s.heroCard, opacity: visible ? 1 : 0, transform: visible ? "translateY(0) rotate(-1deg)" : "translateY(40px) rotate(-1deg)", transition: "opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s" }} className="float-card hero-card">
          <div style={s.cardHeader}>
            <span style={s.cardChip}>DSA</span>
            <span style={s.cardChip}>Q 12 · 2 attempts left</span>
          </div>
          <p style={s.cardQ}>What data structure does BFS use to explore nodes level by level?</p>
          {[
            { l: "A", t: "Stack", sel: false },
            { l: "B", t: "Queue", sel: true },
            { l: "C", t: "Heap", sel: false },
            { l: "D", t: "Linked List", sel: false },
          ].map((o) => (
            <div key={o.l} style={{ ...s.cardOpt, ...(o.sel ? s.cardOptSel : {}) }}>
              <span style={{ ...s.cardLetter, background: o.sel ? "#7c6bb0" : "#f0ecff", color: o.sel ? "#fff" : "#7c6bb0" }}>{o.l}</span>
              <span style={s.cardOptText}>{o.t}</span>
              {o.sel && <span style={s.cardCheck}>✓</span>}
            </div>
          ))}
          <div style={s.cardTimerBar}>
            <div style={s.cardTimerFill} />
            <span style={s.cardTimerLabel}>42s remaining</span>
          </div>
        </div>
      </section>

      <section style={s.featSection} className="feat-section">
        <div style={s.sectionInner}>
          <p style={s.sectionEyebrow}>Why PlacePrep AI?</p>
          <h3 style={s.sectionTitle} className="section-title">Everything you need<br /><span style={s.sectionAccent}>to get placed.</span></h3>
          <div style={s.featGrid} className="feat-grid">
            {FEATURES.map((f) => (
              <div key={f.title} style={s.featCard} className="feat-card">
                <span style={s.featIcon}>{f.icon}</span>
                <h4 style={s.featTitle}>{f.title}</h4>
                <p style={s.featDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={s.ctaSection} className="cta-section">
        <div style={s.ctaInner}>
          <div style={s.ctaBlob} />
          <p style={s.ctaEyebrow}>Ready to begin?</p>
          <h3 style={s.ctaTitle} className="cta-title">Your placement season<br />starts <span style={s.ctaTitleAccent}>right now.</span></h3>
          <p style={s.ctaSub}>{user ? "Keep pushing — every question gets you closer." : "No fluff. Just you, the clock, and 200+ placement questions."}</p>
          {renderBottomCTA()}
        </div>
      </section>

      <footer style={s.footer} className="footer-inner">
        <div style={s.footerTop}>
          <div style={s.footerLeft}>
            <span style={s.footerLogo}>PlacePrep <span style={s.logoAccent}>AI</span></span>
            <p style={s.footerTagline}>Aptitude · DSA · System Design · Reasoning</p>
          </div>
          <div style={s.footerLinks} className="footer-links">
            {user ? (
              <>
                <a href="/quiz" style={s.footerLink}>Quiz</a>
                <span style={s.footerDot} />
                <a href="/ai-quiz" style={s.footerLink}>AI Questions</a>
                <span style={s.footerDot} />
                <a href="/dashboard" style={s.footerLink}>Dashboard</a>
              </>
            ) : (
              <>
                <a href="/login" style={s.footerLink}>Sign In</a>
                <span style={s.footerDot} />
                <a href="/register" style={s.footerLink}>Register</a>
              </>
            )}
          </div>
        </div>
        <div style={s.footerDivider} />
        <div style={s.footerBottom} className="footer-bottom">
          <span style={s.footerCopy}>© {new Date().getFullYear()} PlacePrep AI. All rights reserved.</span>
          <span style={s.footerCredit}>
            Designed &amp; Developed by{" "}
            <span style={s.footerName}>Dhanush Madhyasta</span>
          </span>
        </div>
      </footer>
    </main>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; }
  a { text-decoration: none; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0) rotate(-1deg); }
    50%      { transform: translateY(-10px) rotate(-1deg); }
  }
  @keyframes blobPulse {
    0%,100% { transform: scale(1) translate(0,0); }
    50%      { transform: scale(1.08) translate(8px,-8px); }
  }

  .fadeUp-d1 { animation: fadeUp 0.6s ease 0.05s both; }
  .fadeUp-d2 { animation: fadeUp 0.6s ease 0.15s both; }
  .fadeUp-d3 { animation: fadeUp 0.6s ease 0.25s both; }
  .fadeUp-d4 { animation: fadeUp 0.6s ease 0.35s both; }
  .fadeUp-d5 { animation: fadeUp 0.6s ease 0.45s both; }
  .fadeUp-d6 { animation: fadeUp 0.6s ease 0.55s both; }

  .float-card { animation: float 4s ease-in-out infinite; }

  .btn-hover { transition: all 0.22s ease !important; }
  .btn-hover:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 32px rgba(124,107,176,0.28) !important; opacity: 1 !important; }

  .feat-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
  .feat-card:hover { transform: translateY(-5px); box-shadow: 0 12px 40px rgba(124,107,176,0.14); }

  @media (max-width: 900px) {
    .hero-grid     { grid-template-columns: 1fr !important; padding: 48px 20px 56px !important; }
    .hero-card     { display: none !important; }
    .hero-title    { font-size: 44px !important; }
    .feat-grid     { grid-template-columns: repeat(2,1fr) !important; }
    .cta-title     { font-size: 38px !important; }
    .stats-strip   { width: 100% !important; }
    .section-title { font-size: 34px !important; }
    .header-tagline{ display: none !important; }
  }

  @media (max-width: 600px) {
    .hero-grid     { padding: 36px 16px 44px !important; gap: 28px !important; }
    .hero-title    { font-size: 34px !important; letter-spacing: -0.01em !important; }
    .hero-sub      { font-size: 14px !important; }
    .hero-badge    { font-size: 11px !important; padding: 5px 12px !important; }
    .feat-grid     { grid-template-columns: 1fr !important; gap: 14px !important; }
    .cta-title     { font-size: 30px !important; }
    .cta-section   { padding: 60px 16px !important; }
    .section-title { font-size: 28px !important; }
    .feat-section  { padding: 56px 16px !important; }
    .stats-strip   { flex-wrap: wrap !important; width: 100% !important; border-radius: 14px !important; }
    .stat-item     { flex: 1 1 calc(50% - 1px) !important; padding: 12px 10px !important; }
    .cta-row       { flex-direction: column !important; align-items: stretch !important; }
    .btn-primary, .btn-secondary, .btn-ai { width: 100% !important; justify-content: center !important; }
    .header-link   { padding: 6px 10px !important; font-size: 11px !important; }
    .header-inner  { flex-wrap: wrap !important; gap: 8px !important; }
    .header-btns   { flex-wrap: wrap !important; gap: 6px !important; }
    .logo-text     { font-size: 20px !important; }
    .footer-inner  { padding: 20px 16px 18px !important; }
    .footer-bottom { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
    .footer-links  { flex-wrap: wrap !important; gap: 8px !important; }
    .cat-row       { gap: 6px !important; }
    .cta-btns      { flex-direction: column !important; align-items: stretch !important; }
    .cta-btns a    { width: 100% !important; justify-content: center !important; }
    .avatar-wrap   { padding: 3px 8px 3px 3px !important; }
    .avatar-name   { display: none !important; }
    .logout-btn    { font-size: 11px !important; }
  }
`;

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(160deg,#faf8ff 0%,#f3f0ff 45%,#f0faf4 80%,#fffdf4 100%)",
    fontFamily: "'DM Sans',sans-serif",
    color: "#2d2540",
    overflowX: "hidden",
  },
  header: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid #e8e2f8",
    padding: "16px 28px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  logo: { fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, color: "#2d2540", lineHeight: 1.1 },
  logoAccent: { color: "#7c6bb0" },
  tagline: { fontSize: 11, color: "#9488b8", marginTop: 2, letterSpacing: "0.04em" },
  headerBtns: { display: "flex", gap: 10, alignItems: "center" },
  headerLink: {
    background: "transparent", color: "#7c6bb0", border: "1.5px solid #c3b5f5",
    borderRadius: 22, padding: "7px 18px", fontWeight: 700, fontSize: 13,
    fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s",
  },
  btnRegisterHeader: {
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)", color: "#fff",
    border: "none", borderRadius: 22, padding: "7px 18px", fontWeight: 700,
    fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
  },
  avatarWrap: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#f0ecff", borderRadius: 24, padding: "4px 12px 4px 4px",
    border: "1.5px solid #ddd6f3",
  },
  avatarCircle: {
    width: 28, height: 28, borderRadius: "50%",
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)",
    color: "#fff", fontSize: 12, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Playfair Display',serif", flexShrink: 0,
  },
  avatarName: { fontSize: 13, fontWeight: 700, color: "#2d2540" },
  logoutBtn: {
    background: "transparent", border: "none", color: "#9488b8",
    fontSize: 12, fontWeight: 600, cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif", padding: "2px 4px",
  },
  hero: {
    maxWidth: 1100, margin: "0 auto", padding: "72px 28px 80px",
    display: "grid", gridTemplateColumns: "1fr 420px",
    gap: 48, alignItems: "center", position: "relative",
  },
  blob1: {
    position: "absolute", width: 420, height: 420,
    background: "radial-gradient(circle, rgba(195,181,245,0.22) 0%, transparent 70%)",
    borderRadius: "50%", top: -60, left: -100,
    animation: "blobPulse 8s ease-in-out infinite", pointerEvents: "none",
  },
  blob2: {
    position: "absolute", width: 320, height: 320,
    background: "radial-gradient(circle, rgba(168,213,181,0.20) 0%, transparent 70%)",
    borderRadius: "50%", bottom: 0, right: 60,
    animation: "blobPulse 10s ease-in-out 2s infinite", pointerEvents: "none",
  },
  blob3: {
    position: "absolute", width: 200, height: 200,
    background: "radial-gradient(circle, rgba(192,148,91,0.12) 0%, transparent 70%)",
    borderRadius: "50%", top: "40%", left: "40%", pointerEvents: "none",
  },
  heroContent: { position: "relative", zIndex: 1 },
  heroBadge: {
    display: "inline-flex", alignItems: "center",
    background: "#f0ecff", color: "#7c6bb0", border: "1px solid #ddd6f3",
    borderRadius: 99, padding: "6px 16px", fontSize: 12, fontWeight: 700,
    letterSpacing: "0.03em", marginBottom: 22,
  },
  heroTitle: {
    fontFamily: "'Playfair Display',serif", fontSize: 58, fontWeight: 900,
    lineHeight: 1.13, color: "#2d2540", marginBottom: 20, letterSpacing: "-0.02em",
  },
  heroAccent: { color: "#7c6bb0", fontStyle: "italic" },
  heroSub: { fontSize: 16, lineHeight: 1.75, color: "#6b6080", maxWidth: 480, marginBottom: 26, fontWeight: 400 },
  catRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 },
  catPill: { padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, border: "1.5px solid", letterSpacing: "0.03em" },
  ctaRow: { display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 44 },
  btnPrimary: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)", color: "#fff",
    border: "none", borderRadius: 14, padding: "14px 28px", fontSize: 15,
    fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
    boxShadow: "0 4px 20px rgba(124,107,176,0.28)", letterSpacing: "0.02em",
  },
  btnSecondary: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.85)", color: "#7c6bb0", border: "1.5px solid #c3b5f5",
    borderRadius: 14, padding: "14px 28px", fontSize: 15, fontWeight: 700,
    fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
    backdropFilter: "blur(8px)", letterSpacing: "0.02em",
  },
  btnAI: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "linear-gradient(135deg,#c3b5f5,#a8d5b5)", color: "#2d2540",
    border: "none", borderRadius: 14, padding: "14px 28px", fontSize: 15,
    fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
    letterSpacing: "0.02em", boxShadow: "0 4px 16px rgba(124,107,176,0.20)",
  },
  btnGhost: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.15)", color: "#fff",
    border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: 14,
    padding: "14px 28px", fontSize: 15, fontWeight: 700,
    fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
    backdropFilter: "blur(8px)", letterSpacing: "0.02em",
  },
  statsStrip: {
    display: "flex", gap: 0, background: "rgba(255,255,255,0.75)",
    border: "1px solid #ede9fa", borderRadius: 16,
    backdropFilter: "blur(12px)", overflow: "hidden", width: "fit-content",
  },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 24px", borderRight: "1px solid #ede9fa" },
  statVal: { fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, color: "#7c6bb0", lineHeight: 1 },
  statLabel: { fontSize: 11, color: "#9488b8", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" },
  heroCard: {
    position: "relative", zIndex: 1, background: "#fff", borderRadius: 26,
    padding: "28px 28px 22px",
    boxShadow: "0 24px 72px rgba(124,107,176,0.18), 0 4px 16px rgba(0,0,0,0.06)",
    border: "1px solid #ede9fa",
  },
  cardHeader: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  cardChip: { background: "#f0ecff", color: "#7c6bb0", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, border: "1px solid #ddd6f3" },
  cardQ: { fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, lineHeight: 1.55, color: "#2d2540", marginBottom: 18 },
  cardOpt: { display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", background: "#faf8ff", border: "1.5px solid #ddd6f3", borderRadius: 11, marginBottom: 7, cursor: "default" },
  cardOptSel: { borderColor: "#7c6bb0", background: "#f0ecff", boxShadow: "0 0 0 3px rgba(124,107,176,0.12)" },
  cardLetter: { minWidth: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 },
  cardOptText: { flex: 1, fontSize: 13, fontWeight: 500, color: "#2d2540" },
  cardCheck: { width: 20, height: 20, borderRadius: "50%", background: "#7c6bb0", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 },
  cardTimerBar: { marginTop: 14, position: "relative", height: 28, background: "#f5f3ff", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center" },
  cardTimerFill: { position: "absolute", left: 0, top: 0, height: "100%", width: "70%", background: "#5b8a52", opacity: 0.18, borderRadius: 8 },
  cardTimerLabel: { position: "relative", zIndex: 1, fontSize: 12, fontWeight: 700, color: "#5b8a52", paddingLeft: 10 },
  featSection: { background: "rgba(255,255,255,0.55)", borderTop: "1px solid #ede9fa", borderBottom: "1px solid #ede9fa", backdropFilter: "blur(12px)", padding: "80px 28px" },
  sectionInner: { maxWidth: 1100, margin: "0 auto" },
  sectionEyebrow: { fontSize: 12, fontWeight: 700, color: "#7c6bb0", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, textAlign: "center" },
  sectionTitle: { fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 800, color: "#2d2540", textAlign: "center", marginBottom: 52, lineHeight: 1.25, letterSpacing: "-0.01em" },
  sectionAccent: { color: "#7c6bb0", fontStyle: "italic" },
  featGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  featCard: { background: "#fff", borderRadius: 20, padding: "28px 26px", border: "1px solid #ede9fa", boxShadow: "0 2px 16px rgba(124,107,176,0.07)", cursor: "default" },
  featIcon: { fontSize: 32, display: "block", marginBottom: 14 },
  featTitle: { fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#2d2540", marginBottom: 8 },
  featDesc: { fontSize: 14, color: "#6b6080", lineHeight: 1.7, fontWeight: 400 },
  ctaSection: { background: "linear-gradient(135deg,#6b50b0 0%,#5b8a52 100%)", padding: "88px 28px", position: "relative", overflow: "hidden", textAlign: "center" },
  ctaBlob: { position: "absolute", width: 500, height: 500, background: "rgba(255,255,255,0.07)", borderRadius: "50%", top: -150, right: -100, pointerEvents: "none" },
  ctaInner: { maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 },
  ctaEyebrow: { fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 },
  ctaTitle: { fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1.18, marginBottom: 16, letterSpacing: "-0.02em" },
  ctaTitleAccent: { fontStyle: "italic", color: "#c3f5d5" },
  ctaSub: { fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 38, fontWeight: 400 },
  ctaBtns: { display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" },
  footer: { borderTop: "1px solid #e8e2f8", padding: "28px 48px 24px", background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)" },
  footerTop: { maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 },
  footerLeft: { display: "flex", flexDirection: "column", gap: 4 },
  footerLogo: { fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, color: "#2d2540" },
  footerTagline: { fontSize: 11, color: "#9488b8", fontWeight: 500, letterSpacing: "0.04em" },
  footerLinks: { display: "flex", alignItems: "center", gap: 10 },
  footerLink: { fontSize: 13, color: "#7c6bb0", fontWeight: 600, textDecoration: "none" },
  footerDot: { width: 4, height: 4, borderRadius: "50%", background: "#c3b5f5", display: "inline-block" },
  footerDivider: { maxWidth: 1100, margin: "0 auto 16px", height: 1, background: "linear-gradient(90deg, transparent, #e8e2f8 30%, #e8e2f8 70%, transparent)" },
  footerBottom: { maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  footerCopy: { fontSize: 12, color: "#b0a8c8", fontWeight: 500 },
  footerCredit: { fontSize: 12, color: "#9488b8", fontWeight: 500 },
  footerName: { fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13, color: "#7c6bb0", fontStyle: "italic" },
};