import { GraduationCap, Award, Heart, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface TeamCredentialsSectionProps {
  locale: string;
}

export async function TeamCredentialsSection({ locale }: TeamCredentialsSectionProps) {
  const t = await getTranslations('home.teamCredentials');

  const credentials = [
    {
      icon: GraduationCap,
      title: t('training.title'),
      description: t('training.description'),
      stats: t('training.stats'),
    },
    {
      icon: Award,
      title: t('specialization.title'),
      description: t('specialization.description'),
      stats: t('specialization.stats'),
    },
    {
      icon: Heart,
      title: t('dedication.title'),
      description: t('dedication.description'),
      stats: t('dedication.stats'),
    },
    {
      icon: Users,
      title: t('multidisciplinary.title'),
      description: t('multidisciplinary.description'),
      stats: t('multidisciplinary.stats'),
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('label')}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold" style={{ color: '#0098AA' }}>
            {t('title')}
          </h2>
          <p className="text-base text-gray-600 mt-4">
            {t('subtitle')}
          </p>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {credentials.map((credential, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-400 transition-colors"
            >
              <div className="icon-primary mb-4 group-hover:bg-primary-400 transition-colors duration-300">
                <credential.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#4E5865' }}>
                {credential.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {credential.description}
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="font-bold text-lg" style={{ color: '#0098AA' }}>{credential.stats}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Team Highlights */}
        <div className="bg-white rounded-2xl p-8 md:p-12 max-w-5xl mx-auto border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#0098AA' }}>
                {t('experience.value')}
              </div>
              <p className="font-medium" style={{ color: '#4E5865' }}>{t('experience.title')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('experience.subtitle')}</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#0098AA' }}>
                {t('patients.value')}
              </div>
              <p className="font-medium" style={{ color: '#4E5865' }}>{t('patients.title')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('patients.subtitle')}</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#0098AA' }}>
                {t('certified.value')}
              </div>
              <p className="font-medium" style={{ color: '#4E5865' }}>{t('certified.title')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('certified.subtitle')}</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href={`/${locale}/equipa`}
              className="inline-flex items-center justify-center bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-400 transition-colors"
            >
              {t('meetTeam')}
            </a>
          </div>
        </div>

        {/* Professional Statement */}
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <blockquote className="text-lg text-gray-700 italic">
            "{t('missionStatement')}"
          </blockquote>
          <p className="mt-4 text-sm text-gray-600 font-medium">
            - {t('teamSignature')}
          </p>
        </div>
      </div>
    </section>
  );
}
