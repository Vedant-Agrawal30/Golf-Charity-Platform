// ✅ Use ONLY in /pages/api routes or getServerSideProps
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import type { NextApiRequest, NextApiResponse } from 'next'

export const createPagesServerClient = (
  req: NextApiRequest,
  res: NextApiResponse
) =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(req.headers.cookie ?? '').filter(cookie => cookie.value !== undefined) as { name: string; value: string }[]
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          res.setHeader(
            'Set-Cookie',
            cookiesToSet.map(({ name, value, options }) =>
              serializeCookieHeader(name, value, options)
            )
          )
        },
      },
    }
  )