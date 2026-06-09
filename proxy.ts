import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PROTECTED_ROUTES = ["/dashboard", "/quiz", "/ai-quiz", "/profile"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("placeprep_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token live with Supabase — deleted users are rejected instantly here
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (!user || error) {
    // Token exists but user was deleted or token is invalid — kill session
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("reason", "access_revoked");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("placeprep_token");
    response.cookies.delete("placeprep_user");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/quiz/:path*", "/ai-quiz/:path*"],
};