// Shared Supabase connection constants (publishable key — RLS enforced).
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://anwjhnbqqwseyvzctmyl.supabase.co";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_k1FXXVbha2EvelMnousfVQ_dcWGLWDi";
