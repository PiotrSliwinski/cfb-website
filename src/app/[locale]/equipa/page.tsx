import { getTranslations } from 'next-intl/server';
import { getTeamMembers } from '@/lib/supabase/queries/team';
import Image from 'next/image';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'team' });

  return {
    title: `${t('title')} | Clínica Ferreira Borges`,
    description: t('subtitle'),
  };
}

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'team' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const supabaseTeamMembers = await getTeamMembers(locale);

  // Transform Supabase data to match the display format
  const teamMembers = supabaseTeamMembers.map((member: any) => {
    const translation = member.team_member_translations?.[0];
    return {
      id: member.id,
      name: translation?.name || member.full_name || '',
      title: translation?.title || translation?.position || '',
      licence: member.licence_number || '',
      imageUrl: member.photo_url || '/images/placeholder-team.jpg',
    };
  });

  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('label')}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#0098AA' }}>
              {t('title')}
            </h1>
            <p className="text-base text-gray-600">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-primary-400 transition-all duration-300"
              >
                {/* Photo */}
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="card-title mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary-600 font-medium mb-2">
                    {member.title}
                  </p>
                  {member.licence && (
                    <p className="text-xs text-gray-500 mb-3">
                      {member.licence}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-base text-gray-600 mb-8">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://booking.clinicaferreiraborges.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-primary-600 text-white font-semibold px-8 py-4 rounded-lg hover:bg-primary-400 transition-colors"
              >
                {tCommon('bookAppointment')}
              </a>
              <a
                href="tel:+351935189807"
                className="inline-flex items-center justify-center bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-primary-50 transition-colors border-2 border-primary-600"
              >
                {tCommon('callNow')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
