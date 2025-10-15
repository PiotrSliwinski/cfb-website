'use client';

import { Shield, Award, Users, Heart, CheckCircle, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function CertificationBadges() {
  const t = useTranslations('home.certifications');

  const certifications = [
    {
      icon: Shield,
      title: t('omd.title'),
      description: t('omd.description'),
      color: 'bg-primary-50 text-primary-600',
    },
    {
      icon: Award,
      title: t('excellence.title'),
      description: t('excellence.description'),
      color: 'bg-accent-50 text-accent-600',
    },
    {
      icon: Users,
      title: t('patients.title'),
      description: t('patients.description'),
      color: 'bg-secondary-50 text-secondary-600',
    },
    {
      icon: Heart,
      title: t('technology.title'),
      description: t('technology.description'),
      color: 'bg-trust-50 text-trust-600',
    },
    {
      icon: CheckCircle,
      title: t('safety.title'),
      description: t('safety.description'),
      color: 'bg-primary-50 text-primary-600',
    },
    {
      icon: Star,
      title: t('rating.title'),
      description: t('rating.description'),
      color: 'bg-accent-50 text-accent-600',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('label')}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#0098AA' }}>
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {certifications.map((cert, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-6 transition-all duration-300 border border-gray-200 hover:border-primary-400"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 icon-primary group-hover:bg-primary-400 transition-colors duration-300">
                  <cert.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#4E5865' }}>
                    {cert.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {cert.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
