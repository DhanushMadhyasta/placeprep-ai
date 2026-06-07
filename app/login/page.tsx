"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!username || !password) { setError("Please enter username and password."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Login failed."); return; }

      // Save session to localStorage
document.cookie = `placeprep_token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
localStorage.setItem("placeprep_user", JSON.stringify(data.user));
localStorage.setItem("placeprep_token", data.session.access_token);
      // Go to welcome page
      router.push("/");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <main style={s.root}>
      <style>{css}</style>

      <div style={s.blob1} />
      <div style={s.blob2} />

      <div style={s.card} className="fadeUp auth-card">
        {/* Logo */}
        <div style={s.logoRow}>
          <a href="/" style={s.logoLink}>
            <span style={s.logo}>PlacePrep <span style={s.logoAI}>AI</span></span>
          </a>
        </div>
        <h1 style={s.title} className="auth-title">Welcome Back</h1>
        <p style={s.sub} className="auth-sub">Sign in to continue your prep journey</p>

        <GoogleLoginButton />

        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or continue with username</span>
          <div style={s.dividerLine} />
        </div>

        <div style={s.fields}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Username</label>
            <input
              style={s.input}
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              onKeyDown={handleKeyDown}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />
          </div>
        </div>

        {error && <div style={s.errorBanner}>⚠️ {error}</div>}

        <button
          style={{ ...s.primaryBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing In…" : "Sign In →"}
        </button>

        <p style={s.switchText}>
          New here?{" "}
          <a href="/register" style={s.switchLink}>Create an Account</a>
        </p>
      </div>
    </main>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden; width: 100%; }
  body { font-family: 'DM Sans', sans-serif; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fadeUp { animation: fadeUp 0.5s ease both; }
  input:focus { outline: none; border-color: #7c6bb0 !important; box-shadow: 0 0 0 3px rgba(124,107,176,0.12); }
  input::placeholder { color: #b0a8c8; }
  button { transition: all 0.2s ease; font-family: 'DM Sans', sans-serif; }
  button:hover:not(:disabled) { transform: translateY(-2px); }
  a { transition: opacity 0.2s; text-decoration: none; }
  a:hover { opacity: 0.75; }

  @media (max-width: 480px) {
    .auth-card { padding: 32px 20px !important; border-radius: 20px !important; }
    .auth-title { font-size: 24px !important; }
    .auth-sub   { margin-bottom: 22px !important; }
  }
`;

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(145deg,#faf8ff 0%,#f3f0ff 50%,#f0faf4 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px 16px", fontFamily: "'DM Sans',sans-serif",
    position: "relative", overflowX: "hidden",
  },
  blob1: {
    position: "fixed", width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle,rgba(155,141,224,0.18),transparent 70%)",
    top: -100, right: -100, pointerEvents: "none",
  },
  blob2: {
    position: "fixed", width: 350, height: 350, borderRadius: "50%",
    background: "radial-gradient(circle,rgba(107,176,154,0.15),transparent 70%)",
    bottom: -80, left: -80, pointerEvents: "none",
  },
  card: {
    background: "rgba(255,255,255,0.92)", backdropFilter: "blur(24px)",
    borderRadius: 28, padding: "44px 36px",
    boxShadow: "0 20px 60px rgba(124,107,176,0.14), 0 4px 16px rgba(0,0,0,0.06)",
    border: "1px solid rgba(221,214,243,0.6)",
    width: "100%", maxWidth: 420, position: "relative", zIndex: 1,
  },
  logoRow: { marginBottom: 28, textAlign: "center" as const },
  logoLink: { textDecoration: "none" },
  logo: { fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, color: "#2d2540" },
  logoAI: { color: "#7c6bb0" },
  title: {
    fontFamily: "'Playfair Display',serif", fontSize: 30,
    fontWeight: 800, color: "#2d2540", textAlign: "center" as const, marginBottom: 6,
  },
  sub: { fontSize: 14, color: "#9488b8", textAlign: "center" as const, marginBottom: 32 },
  fields: { display: "flex", flexDirection: "column" as const, gap: 18, marginBottom: 22 },
  fieldGroup: { display: "flex", flexDirection: "column" as const, gap: 6 },
  label: { fontSize: 12, fontWeight: 700, color: "#6b5fa0", textTransform: "uppercase" as const, letterSpacing: "0.06em" },
  input: {
    padding: "13px 14px", borderRadius: 12, border: "1.5px solid #ddd6f3",
    fontSize: 15, fontFamily: "'DM Sans',sans-serif", color: "#2d2540",
    background: "#faf8ff", transition: "all 0.2s", width: "100%",
  },
  errorBanner: {
    background: "#fce8e8", border: "1.5px solid #f5a5a5", borderRadius: 11,
    padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#b71c1c",
    marginBottom: 18,
  },
  primaryBtn: {
    width: "100%", padding: "15px",
    background: "linear-gradient(135deg,#9b8de0,#6bb09a)",
    color: "#fff", border: "none", borderRadius: 14, fontSize: 15,
    fontWeight: 700, cursor: "pointer",
    boxShadow: "0 4px 20px rgba(124,107,176,0.28)", letterSpacing: "0.02em",
    marginBottom: 18,
  },
  divider: { display: "flex", alignItems: "center", gap: 10, margin: "20px 0 4px" },
  dividerLine: { flex: 1, height: 1, background: "#ede9fa" },
  dividerText: { fontSize: 12, color: "#b0a8c8", fontWeight: 600, whiteSpace: "nowrap" as const },
  switchText: { fontSize: 13, color: "#9488b8", textAlign: "center" as const },
  switchLink: { color: "#7c6bb0", fontWeight: 700 },
};