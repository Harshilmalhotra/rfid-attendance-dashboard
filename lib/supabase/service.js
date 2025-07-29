import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This client uses the service role key and bypasses RLS
// Only use this for server-side operations where you need full access
export async function createServiceClient() {
  const cookieStore = await cookies()

  // Check if service role key is available
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found, falling back to anon key')
    // Fall back to regular client if service key not available
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              // The `set` method was called from a Server Component.
            }
          },
        },
      }
    )
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `set` method was called from a Server Component.
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}