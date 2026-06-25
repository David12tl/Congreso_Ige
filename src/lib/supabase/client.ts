import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

export function createClient() {
  return createBrowserClient<DatabaseWithoutInternals>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
