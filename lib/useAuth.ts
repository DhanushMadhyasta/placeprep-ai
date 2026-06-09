// lib/useAuth.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("placeprep_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      // getUser(token) hits Supabase's server — deleted users are rejected instantly
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!user || error) {
        localStorage.removeItem("placeprep_user");
        localStorage.removeItem("placeprep_token");
        router.replace("/login?reason=access_revoked");
      }
    };

    checkUser();

    // Real-time listener — catches token refresh failures while user is on the page
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          localStorage.removeItem("placeprep_user");
          localStorage.removeItem("placeprep_token");
          router.replace("/login?reason=access_revoked");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);
}