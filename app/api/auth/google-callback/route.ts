// app/api/auth/google-callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin client for DB writes (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Receives user info from the client AFTER it has already exchanged the code.
    // This route does NOT exchange the OAuth code — that must happen client-side
    // because Supabase PKCE stores the code_verifier in the browser's sessionStorage.
    const { userId, email, fullName } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing user info" }, { status: 400 });
    }

    // Check if a profile already exists for this user
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, username, full_name")
      .eq("id", userId)
      .single();

    let username: string;

    if (!existingProfile) {
      // First Google login — generate a unique username from the email
      const base = email
        .split("@")[0]
        .replace(/[^a-zA-Z0-9_]/g, "_")
        .toLowerCase();

      let suffix = 1;
      let candidate = base;

      while (true) {
        const { data: taken } = await supabaseAdmin
          .from("profiles")
          .select("username")
          .eq("username", candidate)
          .single();
        if (!taken) break;
        candidate = `${base}${suffix++}`;
      }

      username = candidate;

      await supabaseAdmin.from("profiles").insert({
        id: userId,
        username,
        full_name: fullName,
        email: email.toLowerCase(),
        total_score: 0,
        total_attempts: 0,
        best_score: 0,
      });
    } else {
      username = existingProfile.username;
    }

    return NextResponse.json({
      user: {
        id: userId,
        email,
        username,
        fullName: existingProfile?.full_name || fullName,
      },
    });
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}