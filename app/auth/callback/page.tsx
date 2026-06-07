"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    let ran = false;

    const handle = async () => {
      if (ran) return;
      ran = true;

      // With implicit flow, session is in the URL hash — Supabase reads it automatically
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        console.error("Session error:", error);
        router.push("/login?error=exchange_failed");
        return;
      }

      const user = session.user;
      const email = user.email!;
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        email.split("@")[0];

      const res = await fetch("/api/auth/google-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email, fullName }),
      });

      const result = await res.json();
      if (!res.ok) { router.push("/login?error=profile_error"); return; }

      localStorage.setItem("placeprep_user", JSON.stringify(result.user));
      localStorage.setItem("placeprep_token", session.access_token);
      router.push("/");
    };

    handle();
    return () => { ran = true; };
  }, [router]);

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(145deg,#faf8ff,#f3f0ff)",
      fontFamily: "'DM Sans',sans-serif",
    }}>
      <div style={{ textAlign: "center", color: "#7c6bb0" }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          border: "4px solid #ede9fa", borderTop: "4px solid #7c6bb0",
          animation: "spin 0.9s linear infinite", margin: "0 auto 16px",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontWeight: 600, fontSize: 15 }}>Signing you in…</p>
      </div>
    </main>
  );
}