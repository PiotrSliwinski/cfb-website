// Home page components - content editable via /admin/content/home/{lang}
import { getTranslations } from 'next-intl/server';

import { HeroSection } from '@/components/home/HeroSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { CommitmentSection } from '@/components/home/CommitmentSection';
import GoogleReviewsSection from '@/components/home/GoogleReviewsSection';
import { CertificationBadges } from '@/components/home/CertificationBadges';
import { SafetySection } from '@/components/home/SafetySection';
import { TeamCredentialsSection } from '@/components/home/TeamCredentialsSection';
import { FAQSection } from '@/components/home/FAQSection';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.hero' });

  return {
    title: `${t('title')} | Clínica Ferreira Borges`,
    description: t('subtitle'),
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="flex flex-col">
      <HeroSection />
      <CertificationBadges />
      <ServicesSection locale={locale} />
      <SafetySection />
      <TeamCredentialsSection locale={locale} />
      <CommitmentSection />
      <GoogleReviewsSection />
      <FAQSection />
    </div>
  );
}
