// components/AuthWatcher.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function AuthWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  const kick = () => {
    localStorage.removeItem("placeprep_user");
    localStorage.removeItem("placeprep_token");
    document.cookie = "placeprep_token=; path=/; max-age=0";
    router.replace("/login?reason=access_revoked");
  };

  useEffect(() => {
    if (isPublic) return;

    // Check immediately when page loads
    const check = async () => {
      const token = localStorage.getItem("placeprep_token");
      if (!token) { kick(); return; }

      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!user || error) kick();
    };

    check();

    // Poll every 30 seconds — catches deletion while user is sitting on a page
    const interval = setInterval(check, 30_000);

    // Also catches real-time token invalidation
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