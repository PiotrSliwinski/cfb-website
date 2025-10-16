import { createBrowserClient } from '@supabase/ssr';

/**
 * @deprecated Client-side Supabase access has been removed for security.
 * Use Server Actions instead:
 * - Authentication: import { signIn } from '@/app/actions/auth'
 * - Data operations: Use server actions from @/app/actions/*
 *
 * If you absolutely need client-side access, use Server Components or API routes.
 */
export function createClient() {
  throw new Error(
    'Direct client-side Supabase access is disabled. Use Server Actions instead. ' +
    'See: src/app/actions/auth.ts, src/app/actions/treatments.ts, etc.'
  );

  // Old implementation (now disabled):
  // return createBrowserClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // );
}
