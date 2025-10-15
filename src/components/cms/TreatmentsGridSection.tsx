import Link from 'next/link';
import Image from 'next/image';

interface Treatment {
  slug: string;
  is_popular?: boolean;
  icon?: string;
  treatment_translations: Array<{
    title: string;
    subtitle?: string;
  }>;
}

interface TreatmentsGridSectionProps {
  content: {
    label?: string;
    title: string;
    subtitle?: string;
    footer_text?: string;
    cta_text?: string;
  };
  settings: {
    columns?: number;
    show_popular?: boolean;
    show_icons?: boolean;
    limit?: number | null;
  };
  treatments: Treatment[];
  locale: string;
}

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

export function TreatmentsGridSection({
  content,
  settings,
  treatments,
  locale,
}: TreatmentsGridSectionProps) {
  const { title, subtitle, label, footer_text, cta_text } = content;
  const { columns = 5, show_icons = true, limit } = settings;

  // Apply limit if set
  const displayTreatments = limit ? treatments.slice(0, limit) : treatments;

  const gridClasses = {
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {label && (
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {label}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
            </div>
          )}

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#0098AA' }}>
            {title}
          </h2>

          {subtitle && (
            <p className="text-lg text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        {/* Treatments Grid */}
        <div className={`grid ${gridClasses} gap-6 max-w-7xl mx-auto`}>
          {displayTreatments.map((treatment) => {
            const translation = treatment.treatment_translations?.[0];
            const isPopular = treatment.is_popular;
            const iconPath = serviceIcons[treatment.slug];

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
                {show_icons && (
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
                )}

                {/* Title */}
                <h3 className="text-base font-semibold mb-2 group-hover:text-primary-600 transition-colors duration-300" style={{ color: '#4E5865' }}>
                  {translation?.title}
                </h3>

                {/* Description */}
                {translation?.subtitle && (
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {translation.subtitle}
                  </p>
                )}

                {/* Learn More Arrow */}
                <div className="mt-4 flex items-center font-medium text-sm text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="mr-1">
                    {locale === 'pt' ? 'Saber Mais' : 'Learn More'}
                  </span>
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        {footer_text && (
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6 text-base">
              {footer_text}
            </p>
            {cta_text && (
              <a
                href="tel:+351935189807"
                className="inline-flex items-center justify-center bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-400 transition-colors"
              >
                {cta_text}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
