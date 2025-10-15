import { getRequestConfig } from 'next-intl/server';
import { getLocales, getDefaultLocaleValue, fallbackDefaultLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Get valid locales from database
  const validLocales = await getLocales();
  const defaultLocale = await getDefaultLocaleValue();

  // Ensure that the incoming locale is valid
  if (!locale || !validLocales.includes(locale)) {
    locale = defaultLocale || fallbackDefaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default
  };
});
