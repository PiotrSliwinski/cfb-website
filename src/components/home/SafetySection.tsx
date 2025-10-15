'use client';

import { Shield, Droplets, Thermometer, Sparkles, ClipboardCheck, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function SafetySection() {
  const t = useTranslations('home.safety');

  const safetyMeasures = [
    {
      icon: Droplets,
      title: t('sterilization.title'),
      description: t('sterilization.description'),
    },
    {
      icon: Shield,
      title: t('protocols.title'),
      description: t('protocols.description'),
    },
    {
      icon: Thermometer,
      title: t('temperature.title'),
      description: t('temperature.description'),
    },
    {
      icon: Sparkles,
      title: t('cleaning.title'),
      description: t('cleaning.description'),
    },
    {
      icon: ClipboardCheck,
      title: t('traceability.title'),
      description: t('traceability.description'),
    },
    {
      icon: Users,
      title: t('training.title'),
      description: t('training.description'),
    },
  ];

  return (
    <section className="py-20 border-y border-gray-100" style={{ backgroundColor: '#FCFCFD' }}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {safetyMeasures.map((measure, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-6 transition-all duration-300 border border-gray-200 hover:border-primary-400"
            >
              {/* Icon */}
              <div className="icon-primary mb-4 group-hover:bg-primary-400 transition-colors duration-300">
                <measure.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#4E5865' }}>
                {measure.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {measure.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Trust Statement */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-2xl p-8 max-w-3xl border border-gray-200">
            <p className="text-lg font-medium mb-2" style={{ color: '#4E5865' }}>
              "{t('trustStatement')}"
            </p>
            <p className="text-sm text-gray-500">
              {t('certification')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
