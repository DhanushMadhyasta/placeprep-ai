// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Public client — needed for signUp to trigger verification email
const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client — for DB writes and username checks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, username, password } = await req.json();

    // ── Validate inputs ────────────────────────────────────────────────────
    if (!fullName || !email || !username || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: "Username can only contain letters, numbers, and underscores" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    // ── Check username not already taken ───────────────────────────────────
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("username", username.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    // ── signUp (not admin.createUser) — automatically sends verification email
    const { data: authData, error: authError } = await supabasePublic.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, username: username.toLowerCase() },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered")) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }

    // ── Insert profile row ─────────────────────────────────────────────────
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      username: username.toLowerCase(),
      full_name: fullName,
      email: email.toLowerCase(),
      total_score: 0,
      total_attempts: 0,
      best_score: 0,
    });

    if (profileError) {
      // Rollback: delete auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Account created! Please check your email to verify your account before signing in.",
    });

  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}