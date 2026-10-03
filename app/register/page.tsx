// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/components/GoogleLoginButton";

const BLOCKED_DOMAINS = [
  "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com",
  "throwam.com", "yopmail.com", "trashmail.com", "fakeinbox.com",
  "sharklasers.com", "spam4.me", "dispostable.com", "mailnull.com",
  "maildrop.cc", "temp-mail.org", "getnada.com", "tempr.email",
];

const isValidEmail = (email: string): { ok: boolean; reason?: string } => {
  const formatOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  if (!formatOk) return { ok: false, reason: "Please enter a valid email address." };
  const domain = email.split("@")[1]?.toLowerCase();
  if (BLOCKED_DOMAINS.includes(domain)) {
    return { ok: false, reason: "Disposable email addresses are not allowed." };
  }
  const tld = domain?.split(".").pop();
  if (!tld || tld.length < 2) return { ok: false, reason: "Please enter a valid email address." };
  return { ok: true };
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", username: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.fullName || !form.email || !form.username || !form.password || !form.confirm) {
      setError("Please fill in all fields."); return;
    }
    const emailCheck = isValidEmail(form.email);
    if (!emailCheck.ok) { setError(emailCheck.reason!); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          username: form.username,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); return; }
      setStep("success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <main style={s.root}>
        <style>{css}</style>
        <div style={s.blob1} />
        <div style={s.blob2} />
        <div style={s.successCard} className="fadeUp">
          <div style={s.successIcon}></div>
          <h2 style={s.successTitle}>Check Your Email!</h2>
          <p style={s.successSub}>
            We sent a verification link to <strong>{form.email}</strong>.
          </p>
          <p style={s.successDesc}>
            Click the link in the email to verify your account. Once verified, you can sign in.
          </p>
          <div style={s.successSteps}>
            <div style={s.successStep}><span style={s.stepNum}>1</span><span>Open your email inbox</span></div>
            <div style={s.successStep}><span style={s.stepNum}>2</span><span>Click the verification link</span></div>
            <div style={s.successStep}><span style={s.stepNum}>3</span><span>Come back and sign in</span></div>
          </div>
          <button style={s.goLoginBtn} onClick={() => router.push("/login")}>
            Go to Sign In →
          </button>
          <p style={s.spamNote}>Didn't receive it? Check your spam folder.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={s.root}>
      <style>{css}</style>
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.card} className="fadeUp reg-card">
        <div style={s.logoRow}>
          <span style={s.logo}>PlacePrep <span style={s.logoAI}>AI</span></span>
        </div>
        <h1 style={s.title} className="reg-title">Create Account</h1>
        <p style={s.sub}>Join thousands preparing for placements</p>

        <GoogleLoginButton />

        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or register with email</span>
          <div style={s.dividerLine} />
        </div>

        <div style={s.fields}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Full Name</label>
            <input style={s.input} placeholder="Your Name" value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)} autoComplete="name" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => update("email", e.target.value)} autoComplete="email" />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Username</label>
            <input style={s.input} placeholder="your_username (used to sign in)" value={form.username}
              onChange={(e) => update("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              autoComplete="username" />
            <span style={s.fieldHint}>Only letters, numbers, underscores. This is your login ID.</span>
          </div>
          <div style={s.twoCol} className="two-col">
            <div style={s.fieldGroup}>
              <label style={s.label}>Password</label>
              <input style={s.input} type="password" placeholder="Min 6 characters" value={form.password}
                onChange={(e) => update("password", e.target.value)} autoComplete="new-password" />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Confirm</label>
              <input style={s.input} type="password" placeholder="Repeat password" value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)} autoComplete="new-password" />
            </div>
          </div>
        </div>

        {error && <div style={s.errorBanner}>{error}</div>}

        <button style={{ ...s.primaryBtn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating Account…" : "Create Account →"}
        </button>

        <p style={s.switchText}>
          Already have an account?{" "}
          <a href="/login" style={s.switchLink}>Sign In</a>
        </p>
      </div>
    </main>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden; width: 100%; }
  body { font-family: 'IBM Plex Sans',sans-serif; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .fadeUp { animation: fadeUp 0.5s ease both; }
  input:focus { outline: none; border-color: #111 !important; box-shadow: 0 0 0 3px rgba(0,0,0,0.12); }
  input::placeholder { color: #aaa; }
  button { transition: all 0.2s ease; font-family: 'IBM Plex Sans',sans-serif; }
  button:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.92; }
  a { transition: opacity 0.2s; }
  a:hover { opacity: 0.75; }
  @media (max-width: 500px) {
    .two-col   { grid-template-columns: 1fr !important; }
    .reg-card  { padding: 28px 18px !important; border-radius: 20px !important; }
    .reg-title { font-size: 24px !important; }
  }
`;

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#F5F4F0",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px 16px", fontFamily: "'IBM Plex Sans',sans-serif",
    position: "relative", overflowX: "hidden",
  },
  blob1: { position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "transparent", top: -100, right: -100, pointerEvents: "none" },
  blob2: { position: "fixed", width: 350, height: 350, borderRadius: "50%", background: "transparent", bottom: -80, left: -80, pointerEvents: "none" },
  card: {
    background: "#fff", backdropFilter: "blur(24px)",
    borderRadius: 28, padding: "40px 36px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06)",
    border: "1px solid rgba(221,214,243,0.6)", width: "100%", maxWidth: 480, position: "relative", zIndex: 1,
  },
  logoRow: { marginBottom: 24, textAlign: "center" as const },
  logo: { fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 22, fontWeight: 500, color: "#111" },
  logoAI: { color: "#111" },
  title: { fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 28, fontWeight: 500, color: "#111", textAlign: "center" as const, marginBottom: 6 },
  sub: { fontSize: 14, color: "#777", textAlign: "center" as const, marginBottom: 28 },
  fields: { display: "flex", flexDirection: "column" as const, gap: 16, marginBottom: 20 },
  fieldGroup: { display: "flex", flexDirection: "column" as const, gap: 6 },
  label: { fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase" as const, letterSpacing: "0.06em" },
  input: { padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e3dd", fontSize: 14, fontFamily: "'IBM Plex Sans',sans-serif", color: "#111", background: "#fafaf8", transition: "all 0.2s", width: "100%" },
  fieldHint: { fontSize: 11, color: "#777", marginTop: 2 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  errorBanner: { background: "#fce8e8", border: "1.5px solid #f5a5a5", borderRadius: 11, padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#b71c1c", marginBottom: 16 },
  primaryBtn: { width: "100%", padding: "15px", background: "#111", color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.28)", letterSpacing: "0.02em", marginBottom: 16 },
  divider: { display: "flex", alignItems: "center", gap: 10, margin: "20px 0 4px" },
  dividerLine: { flex: 1, height: 1, background: "#ece9e2" },
  dividerText: { fontSize: 12, color: "#aaa", fontWeight: 600, whiteSpace: "nowrap" as const },
  switchText: { fontSize: 13, color: "#777", textAlign: "center" as const },
  switchLink: { color: "#111", fontWeight: 700, textDecoration: "none" },
  successCard: {
    background: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)",
    borderRadius: 28, padding: "48px 40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
    border: "1px solid rgba(221,214,243,0.6)",
    width: "100%", maxWidth: 460,
    textAlign: "center" as const, display: "flex",
    flexDirection: "column" as const, alignItems: "center", gap: 16,
    position: "relative" as const, zIndex: 1,
  },
  successIcon: { fontSize: 60 },
  successTitle: { fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 28, fontWeight: 500, color: "#111" },
  successSub: { fontSize: 15, color: "#111", lineHeight: 1.6 },
  successDesc: { fontSize: 14, color: "#6b6080", lineHeight: 1.7 },
  successSteps: { display: "flex", flexDirection: "column" as const, gap: 10, width: "100%", marginTop: 4 },
  successStep: { display: "flex", alignItems: "center", gap: 12, background: "#fafaf8", borderRadius: 10, padding: "10px 14px", border: "1px solid #ece9e2", fontSize: 14, color: "#111", fontWeight: 500 },
  stepNum: { width: 24, height: 24, borderRadius: "50%", background: "#111", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  goLoginBtn: { width: "100%", padding: "14px", background: "#111", color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.28)", marginTop: 4 },
  spamNote: { fontSize: 12, color: "#aaa", fontStyle: "italic" as const },
};