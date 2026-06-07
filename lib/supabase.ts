import { createClient, SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as { supabase: SupabaseClient };

export const supabase =
  globalForSupabase.supabase ??
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "implicit", // ← skips PKCE entirely, no verifier needed
      },
    }
  );

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}

export type UserProfile = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  created_at: string;
  total_score: number;
  total_attempts: number;
  best_score: number;
};