import { getTranslations } from 'next-intl/server';
import { Scan, Cuboid, Smile, Monitor, Microscope, Camera, LucideIcon } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'technology' });

  return {
    title: `${t('title')} | Clínica Ferreira Borges`,
    description: t('subtitle'),
  };
}

// Icon mapping - can be edited via /admin/content/technology/{lang}
const iconMap: Record<string, LucideIcon> = {
  Scan,
  Cuboid,
  Smile,
  Monitor,
  Microscope,
  Camera,
};

export default async function TechnologyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'technology' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Main technologies - all content comes from translations
  const technologies = [
    {
      iconName: 'Scan',
      sectionKey: 'intraoralScanner',
    },
    {
      iconName: 'Cuboid',
      sectionKey: 'cbct',
    },
    {
      iconName: 'Smile',
      sectionKey: 'smileDesign',
    },
  ].map(tech => {
    const Icon = iconMap[tech.iconName] || Scan;
    return {
      icon: Icon,
      title: t(`${tech.sectionKey}.title`),
      description: t(`${tech.sectionKey}.description`),
      benefits: [
        t(`${tech.sectionKey}.benefit1`),
        t(`${tech.sectionKey}.benefit2`),
        t(`${tech.sectionKey}.benefit3`),
        t(`${tech.sectionKey}.benefit4`),
      ],
    };
  });

  // Additional technologies - all content comes from translations
  const additionalTech = [
    { iconName: 'Monitor', sectionKey: 'digitalRadiology' },
    { iconName: 'Microscope', sectionKey: 'microscopy' },
    { iconName: 'Camera', sectionKey: 'photography' },
  ].map(tech => {
    const Icon = iconMap[tech.iconName] || Monitor;
    return {
      icon: Icon,
      title: t(`${tech.sectionKey}.title`),
      description: t(`${tech.sectionKey}.description`),
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

      {/* Main Technologies Section */}
      <section className="py-20" style={{ backgroundColor: '#FCFCFD' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl p-8 md:p-10 border border-gray-200 hover:border-primary-400 transition-colors"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center group-hover:bg-primary-400 transition-colors duration-300" style={{ backgroundColor: '#0098AA' }}>
                      <tech.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-4" style={{ color: '#0098AA' }}>
                      {tech.title}
                    </h2>
                    <p className="text-base text-gray-600 mb-6 leading-relaxed">
                      {tech.description}
                    </p>

                    {/* Benefits Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tech.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-600 flex-shrink-0"></div>
                          <span className="text-sm font-medium" style={{ color: '#4E5865' }}>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Technologies Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold" style={{ color: '#0098AA' }}>
              {t('moreTech.title')}
            </h2>
            <p className="text-base text-gray-600 mt-4">
              {t('moreTech.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {additionalTech.map((tech, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-400 transition-colors"
              >
                <div className="icon-primary mb-4 group-hover:bg-primary-400 transition-colors duration-300">
                  <tech.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#4E5865' }}>
                  {tech.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {tech.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Statement */}
      <section className="py-20 border-t border-gray-200" style={{ backgroundColor: '#FCFCFD' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-white rounded-2xl p-8 border border-gray-200">
              <p className="text-lg font-medium mb-2" style={{ color: '#4E5865' }}>
                "{t('trustStatement')}"
              </p>
              <p className="text-sm text-gray-500">
                Clínica Ferreira Borges
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6" style={{ color: '#4E5865' }}>
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
