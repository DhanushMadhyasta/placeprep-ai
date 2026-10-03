"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { AuthShell, Field, PasswordField, ErrorBanner, PrimaryButton, Divider } from "@/components/auth-shell";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

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

      // Save session
      document.cookie = `placeprep_token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      localStorage.setItem("placeprep_user", JSON.stringify(data.user));
      localStorage.setItem("placeprep_token", data.session.access_token);

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
    <AuthShell tag="SIGN IN" title="Welcome back" sub="Sign in to continue your prep journey.">
      {reason === "access_revoked" && (
        <div className="mb-5"><ErrorBanner>Your access has been revoked. Please contact the administrator.</ErrorBanner></div>
      )}

      <GoogleLoginButton />
      <Divider text="or use username" />

      <div className="space-y-4 mb-5">
        <Field
          label="Username"
          placeholder="your_username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          onKeyDown={handleKeyDown}
          autoComplete="username"
          autoFocus
        />
        <PasswordField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="current-password"
        />
      </div>

      {error && <div className="mb-5"><ErrorBanner>{error}</ErrorBanner></div>}

      <PrimaryButton onClick={handleLogin} loading={loading}>{loading ? "SIGNING IN..." : "SIGN IN"}</PrimaryButton>

      <p className="mt-6 text-sm text-black/45 text-center">
        New here?{" "}
        <a href="/register" className="underline underline-offset-4 decoration-black/20 hover:decoration-black/60 transition-colors" style={{ color: "#111" }}>Create an account</a>
      </p>
    </AuthShell>
  );
}

// useSearchParams requires Suspense boundary in Next.js App Router
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
