import { createClient } from '@supabase/supabase-js'
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use this in all 'use client' components
export const createBrowserClient = () =>
  createSSRBrowserClient(URL, ANON)

// Use this in API routes
export const createServerClient = () =>
  createClient(URL, ANON)

// Use this in webhooks (bypasses RLS)
export const createAdminClient = () =>
  createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false }
  })