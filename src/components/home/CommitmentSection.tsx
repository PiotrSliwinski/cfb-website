'use client';

import { useTranslations } from 'next-intl';

export function CommitmentSection() {
  const t = useTranslations('home.commitment');

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              {t('label', 'Compromisso')}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: '#0098AA' }}>
            {t('title')}
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-primary-600">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold mb-2">
                {t('years')}
              </div>
              <p className="text-lg md:text-xl text-gray-600">
                {t('yearsDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
