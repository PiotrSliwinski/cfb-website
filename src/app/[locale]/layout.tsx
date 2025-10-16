import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Poppins } from 'next/font/google';
import '../globals.css';

const poppins = Poppins({
  weight: ['400', '600', '700'], // Reduced from 7 weights to 3 (regular, semibold, bold)
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={poppins.variable}>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://hkrpefnergidmviuewkt.supabase.co" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://booking.clinicaferreiraborges.pt" />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
