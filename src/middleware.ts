import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getLocales, getDefaultLocaleValue, fallbackLocales, fallbackDefaultLocale } from './lib/i18n/config';

// Cache middleware configuration
let middlewareCache: {
  locales: string[];
  defaultLocale: string;
  timestamp: number;
} | null = null;

const MIDDLEWARE_CACHE_DURATION = 60000; // 1 minute

async function getMiddlewareConfig() {
  const now = Date.now();

  if (middlewareCache && now - middlewareCache.timestamp < MIDDLEWARE_CACHE_DURATION) {
    return middlewareCache;
  }

  try {
    const [locales, defaultLocale] = await Promise.all([
      getLocales(),
      getDefaultLocaleValue()
    ]);

    middlewareCache = {
      locales: locales.length > 0 ? locales : [...fallbackLocales],
      defaultLocale: defaultLocale || fallbackDefaultLocale,
      timestamp: now
    };

    return middlewareCache;
  } catch (error) {
    console.error('[middleware] Error fetching locales:', error);
    return {
      locales: [...fallbackLocales],
      defaultLocale: fallbackDefaultLocale,
      timestamp: now
    };
  }
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
