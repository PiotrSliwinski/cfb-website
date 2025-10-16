import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getLocales, getDefaultLocaleValue, fallbackLocales, fallbackDefaultLocale } from './lib/i18n/config';

// Cache middleware configuration
let middlewareCache: {
  locales: string[];
  defaultLocale: string;
  timestamp: number;
} | null = null;

const MIDDLEWARE_CACHE_DURATION = 3600000; // 1 hour (was 1 minute)

async function getMiddlewareConfig() {
  const now = Date.now();

  // Return cached config if available and not expired
  if (middlewareCache && now - middlewareCache.timestamp < MIDDLEWARE_CACHE_DURATION) {
    return middlewareCache;
  }

  // Always return fallback immediately for fast response
  const fallbackConfig = {
    locales: [...fallbackLocales],
    defaultLocale: fallbackDefaultLocale,
    timestamp: now
  };

  // If cache is expired, try to fetch fresh data but don't block
  if (!middlewareCache || now - middlewareCache.timestamp >= MIDDLEWARE_CACHE_DURATION) {
    // Update cache in background (don't await)
    Promise.all([getLocales(), getDefaultLocaleValue()])
      .then(([locales, defaultLocale]) => {
        middlewareCache = {
          locales: locales.length > 0 ? locales : [...fallbackLocales],
          defaultLocale: defaultLocale || fallbackDefaultLocale,
          timestamp: now
        };
      })
      .catch((error) => {
        console.error('[middleware] Error fetching locales:', error);
      });
  }

  return middlewareCache || fallbackConfig;
}

export default async function middleware(request: NextRequest) {
  const { locales, defaultLocale } = await getMiddlewareConfig();

  const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'as-needed'
  });

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)']
};
