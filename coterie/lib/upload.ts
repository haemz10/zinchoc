"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

// Uploads an image to the public coterie-media bucket under the user's own
// folder (RLS requires the first path segment to equal the uid). Returns the
// public URL, or null on failure.
export async function uploadImage(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("coterie-media")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) return null;

  const { data } = supabase.storage.from("coterie-media").getPublicUrl(path);
  return data.publicUrl;
}
