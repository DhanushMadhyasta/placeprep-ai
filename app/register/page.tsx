// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { AuthShell, Field, PasswordField, ErrorBanner, PrimaryButton, Divider } from "@/components/auth-shell";

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
      <AuthShell tag="ALMOST THERE" title="Check your email" sub={`We sent a verification link to ${form.email}.`}>
        <p className="text-sm text-black/45 leading-relaxed mb-6">Click the link in the email to verify your account. Once verified, you can sign in.</p>
        <div className="divide-y divide-black/[0.07] border-y border-black/[0.07] mb-8">
          {["Open your email inbox", "Click the verification link", "Come back and sign in"].map((t, i) => (
            <div key={t} className="rise flex items-center gap-4 py-3.5 text-sm text-black/65" style={{ animationDelay: `${300 + i * 90}ms` }}>
              <span className="font-pixel text-[11px] tracking-widest text-black/30">0{i + 1}</span>{t}
            </div>
          ))}
        </div>
        <PrimaryButton onClick={() => router.push("/login")}>GO TO SIGN IN</PrimaryButton>
        <p className="mt-5 text-xs text-black/35 text-center">Did not receive it? Check your spam folder.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell tag="CREATE ACCOUNT" title="Start preparing" sub="Create your free account in under a minute.">
      <GoogleLoginButton />
      <Divider text="or register with email" />

      <div className="space-y-4 mb-5">
        <Field label="Full name" placeholder="Your name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} autoComplete="name" />
        <Field label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" />
        <Field
          label="Username"
          placeholder="your_username"
          hint="Letters, numbers and underscores only. This is your login ID."
          value={form.username}
          onChange={(e) => update("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          autoComplete="username"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PasswordField label="Password" strength placeholder="Min 6 characters" value={form.password} onChange={(e) => update("password", e.target.value)} autoComplete="new-password" />
          <PasswordField label="Confirm" placeholder="Repeat password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} autoComplete="new-password" />
        </div>
      </div>

      {error && <div className="mb-5"><ErrorBanner>{error}</ErrorBanner></div>}

      <PrimaryButton onClick={handleSubmit} loading={loading}>{loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</PrimaryButton>

      <p className="mt-6 text-sm text-black/45 text-center">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4 decoration-black/20 hover:decoration-black/60 transition-colors" style={{ color: "#111" }}>Sign in</a>
      </p>
    </AuthShell>
  );
}
