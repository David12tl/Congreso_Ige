"use client";

import { useMemo } from "react";
import { createClient } from "@/src/lib/supabase/client";

export function useSupabase() {
  const supabase = useMemo(() => createClient(), []);
  return supabase;
}