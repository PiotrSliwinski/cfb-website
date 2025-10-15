import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import { ConditionalLayout } from '@/components/layout/ConditionalLayout';
import { Poppins } from 'next/font/google';
import '../globals.css';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
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
      <body className="flex min-h-screen flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <ConditionalLayout>{children}</ConditionalLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
