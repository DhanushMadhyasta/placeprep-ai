// components/AuthWatcher.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PUBLIC_PATHS = ["/login", "/register"];

export function AuthWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check on login/register — no session expected there
    if (PUBLIC_PATHS.includes(pathname)) return;

    const token = localStorage.getItem("placeprep_token");

    // No token = already logged out, nothing to check
    if (!token) return;

    const kick = () => {
      localStorage.removeItem("placeprep_user");
      localStorage.removeItem("placeprep_token");
      document.cookie = "placeprep_token=; path=/; max-age=0";

      if (pathname === "/") {
        // On home page: don't redirect, just refresh so UI shows logged-out state
        router.refresh();
      } else {
        // On protected page: redirect to login with banner
        router.replace("/login?reason=access_revoked");
      }
    };

    const check = async () => {
      const currentToken = localStorage.getItem("placeprep_token");
      if (!currentToken) return; // already kicked
      const { data: { user }, error } = await supabase.auth.getUser(currentToken);
      if (!user || error) kick();
    };

    // Check immediately on mount / route change
    check();

    // Poll every 15 seconds — faster detection while sitting on a page
    const interval = setInterval(check, 15_000);

    // Real-time: catches token invalidation immediately
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) kick();
      }
    );

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [pathname]);

  return null;
}