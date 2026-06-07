import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Look up email from username in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name, username")
      .eq("username", username.toLowerCase())
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Sign in with email + password
    const { data: signInData, error: signInError } = await supabasePublic.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (signInError) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Return session + profile info
    return NextResponse.json({
      success: true,
      user: {
        id: signInData.user.id,
        email: profile.email,
        username: profile.username,
        fullName: profile.full_name,
      },
      session: {
        access_token: signInData.session?.access_token,
        refresh_token: signInData.session?.refresh_token,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}