import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { getAllTreatments } from '@/lib/supabase/queries/treatments';

interface Service {
  slug: string;
  icon: string;
  is_popular?: boolean;
}

// Icon mapping for fallback
const serviceIcons: Record<string, string> = {
  'aparelho-invisivel': '/images/services/aparelho-invisivel.svg',
  'branqueamento': '/images/services/branqueamento.svg',
  'cirurgia-oral': '/images/services/cirurgia-oral.svg',
  'consulta-dentaria': '/images/services/consulta-dentaria.svg',
  'dentisteria': '/images/services/dentisteria.svg',
  'dor-orofacial': '/images/services/dor-orofacial.svg',
  'endodontia': '/images/services/endodontia.svg',
  'implantes-dentarios': '/images/services/implantes-dentarios.svg',
  'limpeza-dentaria': '/images/services/limpeza-dentaria.svg',
  'medicina-dentaria-do-sono': '/images/services/medicina-dentaria-do-sono.svg',
  'odontopediatria': '/images/services/odontopediatria.svg',
  'ortodontia': '/images/services/ortodontia.svg',
  'periodontologia': '/images/services/periodontologia.svg',
  'reabilitacao-oral': '/images/services/reabilitacao-oral.svg',
  'restauracao-estetica': '/images/services/restauracao-estetica.svg',
};

interface ServicesSectionProps {
  locale: string;
}

export async function ServicesSection({ locale }: ServicesSectionProps) {
  const t = await getTranslations({ namespace: 'home.services' });
  const treatments = await getAllTreatments(locale);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('sectionLabel')}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#0098AA' }}>
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {treatments.length === 0 ? (
            <div className="col-span-full text-center text-gray-600">
              {t('notFound')}
            </div>
          ) : (
            treatments.map((treatment) => {
              const translation = treatment.treatment_translations?.[0];
              const isPopular = treatment.is_popular;
              const iconPath = serviceIcons[treatment.slug as keyof typeof serviceIcons];

              return (
                <Link
                  key={treatment.slug}
                  href={`/${locale}/tratamentos/${treatment.slug}`}
                  className="group relative bg-white rounded-xl p-6 transition-all duration-300 border border-gray-200 hover:border-primary-300 flex flex-col items-center text-center"
                  style={isPopular ? { backgroundColor: '#CCEFF3' } : {}}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full"></div>
                  )}

                  {/* Icon */}
                  <div className="w-16 h-16 mb-4 relative flex items-center justify-center bg-gray-50 rounded-full group-hover:bg-primary-50 transition-colors duration-300">
                    {iconPath && (
                      <Image
                        src={iconPath}
                        alt={translation?.title || ''}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold mb-2 group-hover:text-primary-600 transition-colors duration-300" style={{ color: '#4E5865' }}>
                    {translation?.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {translation?.subtitle}
                  </p>

                  {/* Learn More Arrow */}
                  <div className="mt-4 flex items-center font-medium text-sm text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="mr-1">{t('learnMore')}</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6 text-base">
            {t('notFound')}
          </p>
          <a
            href="tel:+351935189807"
            className="inline-flex items-center justify-center bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-400 transition-colors"
          >
            {t('talkToUs')}
          </a>
        </div>
      </div>
    </section>
  );
}
