/**
 * Server-side authentication utilities
 * Provides secure session validation and user management
 */

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

/**
 * Get the current authenticated user from server-side
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in Server Components or Server Actions that require auth
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/admin/login');
  }

  return user;
}

/**
 * Check if user is authenticated (boolean check)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ============================================================================
// API ROUTE AUTHENTICATION HELPERS
// ============================================================================

/**
 * Require authentication for API routes
 * Returns NextResponse with 401 if not authenticated
 * Use this in API Route Handlers that require auth
 *
 * @returns AuthUser if authenticated, NextResponse with 401 if not
 *
 * @example
 * export async function POST(request: Request) {
 *   const authResult = await requireAuthApi();
 *   if (authResult instanceof NextResponse) {
 *     return authResult; // Return 401 response
 *   }
 *   const user = authResult; // User is authenticated
 *   // ... proceed with authenticated logic
 * }
 */
export async function requireAuthApi(): Promise<AuthUser | NextResponse> {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    );
  }

  return user;
}

/**
 * Require admin role for API routes
 * Returns NextResponse with 401/403 if not authenticated or not admin
 * Use this in API Route Handlers that require admin access
 *
 * @returns AuthUser if authenticated and admin, NextResponse with 401/403 if not
 *
 * @example
 * export async function DELETE(request: Request) {
 *   const authResult = await requireAdminApi();
 *   if (authResult instanceof NextResponse) {
 *     return authResult; // Return 401/403 response
 *   }
 *   const admin = authResult; // User is authenticated admin
 *   // ... proceed with admin logic
 * }
 */
export async function requireAdminApi(): Promise<AuthUser | NextResponse> {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      },
      { status: 401 }
    );
  }

  // For now, any authenticated user is considered admin
  // TODO: Add proper role-based access control
  // if (user.role !== 'admin') {
  //   return NextResponse.json(
  //     {
  //       success: false,
  //       error: {
  //         message: 'Admin access required',
  //         code: 'FORBIDDEN',
  //       },
  //     },
  //     { status: 403 }
  //   );
  // }

  return user;
}
