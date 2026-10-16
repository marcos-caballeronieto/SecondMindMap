/**
 * Checks whether Supabase environment variables have been properly set
 * with a valid project URL rather than a placeholder.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return false
  if (url.includes('placeholder') || url.includes('your-project-id')) return false
  if (!url.startsWith('https://')) return false

  return true
}
