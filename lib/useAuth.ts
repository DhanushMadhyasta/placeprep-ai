// lib/useAuth.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("placeprep_user");
    const token = localStorage.getItem("placeprep_token");

    if (!user || !token) {
      router.replace("/login");
    }
  }, [router]);
}