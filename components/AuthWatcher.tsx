// components/AuthWatcher.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PUBLIC_PATHS = ["/login", "/register"];

export function AuthWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  const kick = () => {
    localStorage.removeItem("placeprep_user");
    localStorage.removeItem("placeprep_token");
    document.cookie = "placeprep_token=; path=/; max-age=0";
    // On home page just reload so UI reflects logged-out state
    // On protected pages redirect to login
    if (pathname === "/") {
      router.refresh();
    } else {
      router.replace("/login?reason=access_revoked");
    }
  };

  useEffect(() => {
    // Skip check on login/register pages
    if (PUBLIC_PATHS.includes(pathname)) return;

    const token = localStorage.getItem("placeprep_token");
    // No token = already logged out, nothing to check
    if (!token) return;

    // Check immediately on every page load/navigation
    const check = async () => {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!user || error) kick();
    };

    check();

    // Poll every 30 seconds — catches deletion while user sits on a page
    const interval = setInterval(check, 30_000);

    // Real-time: catches token invalidation events
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