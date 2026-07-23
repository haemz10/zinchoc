"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./supabase-config";

let client: SupabaseClient | undefined;

export function supabaseBrowser(): SupabaseClient {
  client ??= createClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}
