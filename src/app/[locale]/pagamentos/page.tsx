import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import { getServicePrices, getFinancingOptions, getInsuranceProviders } from '@/lib/supabase/queries/payments';
import { Tag, TrendingUp, Shield } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'payments' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function PaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);

  const servicePrices = await getServicePrices(locale);
  const financingOptions = await getFinancingOptions(locale);
  const insuranceProviders = await getInsuranceProviders(locale);

  const formatPrice = (priceFrom: number, priceTo: number, locale: string) => {
    if (priceFrom === 0 && priceTo === 0) {
      return locale === 'pt' ? 'Gratuito' : 'Free';
    }
    if (priceFrom === priceTo) {
      return `€${priceFrom.toFixed(0)}`;
    }
    return `€${priceFrom.toFixed(0)} - €${priceTo.toFixed(0)}`;
  };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'pt' ? 'Preços' : 'Pricing'}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
            </div>
            <h1 className="page-title">
              {locale === 'pt' ? 'Preços e Financiamento' : 'Pricing and Financing'}
            </h1>
            <p className="text-base text-gray-600">
              {locale === 'pt'
                ? 'Transparência nos preços e soluções de financiamento flexíveis para tornar o seu tratamento dentário mais acessível.'
                : 'Transparent pricing and flexible financing solutions to make your dental treatment more accessible.'}
            </p>
          </div>
        </div>
      </section>

      {/* Service Prices Section */}
      <section className="page-section bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'pt' ? 'Preços' : 'Pricing'}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
              </div>
              <h2 className="section-heading-accent text-center">
                {locale === 'pt' ? 'Tabela de Preços' : 'Price List'}
              </h2>
              <p className="text-base text-gray-600">
                {locale === 'pt'
                  ? 'Preços indicativos dos nossos principais tratamentos'
                  : 'Indicative prices for our main treatments'}
              </p>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: '#4E5865' }}>
                        {locale === 'pt' ? 'Tratamento' : 'Treatment'}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: '#4E5865' }}>
                        {locale === 'pt' ? 'Descrição' : 'Description'}
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider" style={{ color: '#4E5865' }}>
                        {locale === 'pt' ? 'Preço' : 'Price'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {servicePrices.map((service) => {
                      const translation = service.service_price_translations[0];
                      return (
                        <tr
                          key={service.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold" style={{ color: '#4E5865' }}>
                              {translation.title}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {translation.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-base font-semibold text-gray-700">
                              {formatPrice(service.price_from, service.price_to, locale)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  {locale === 'pt'
                    ? '* Preços sujeitos a alteração após avaliação. Consulte-nos para orçamento personalizado.'
                    : '* Prices subject to change after evaluation. Contact us for a personalized quote.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financing Options Section */}
      <section className="page-section bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'pt' ? 'Financiamento' : 'Financing'}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
              </div>
              <h2 className="section-heading-accent text-center">
                {locale === 'pt' ? 'Soluções de Financiamento' : 'Financing Solutions'}
              </h2>
              <p className="text-base text-gray-600">
                {locale === 'pt'
                  ? 'Parcerias com instituições financeiras para facilitar o acesso aos seus tratamentos'
                  : 'Partnerships with financial institutions to facilitate access to your treatments'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {financingOptions.map((option) => {
                const translation = option.financing_option_translations[0];

                return (
                  <div
                    key={option.id}
                    className="content-card"
                  >
                    <div className="mb-6">
                      {option.provider_name && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700 mb-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                          {option.provider_name}
                        </div>
                      )}
                      <h3 className="card-title text-xl">
                        {translation.title}
                      </h3>
                      <p className="text-base text-gray-600 mb-6">
                        {translation.description}
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {option.min_amount && option.max_amount && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">
                            {locale === 'pt' ? 'Montante' : 'Amount'}
                          </span>
                          <span className="font-semibold" style={{ color: '#4E5865' }}>
                            €{option.min_amount.toFixed(0)} - €{option.max_amount.toFixed(0)}
                          </span>
                        </div>
                      )}

                      {option.min_installments && option.max_installments && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">
                            {locale === 'pt' ? 'Prazo' : 'Term'}
                          </span>
                          <span className="font-semibold" style={{ color: '#4E5865' }}>
                            {option.min_installments} - {option.max_installments} {locale === 'pt' ? 'meses' : 'months'}
                          </span>
                        </div>
                      )}

                      {option.interest_rate !== null && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600">
                            {locale === 'pt' ? 'Taxa de Juro' : 'Interest Rate'}
                          </span>
                          <span className="font-semibold text-primary-600">
                            {option.interest_rate}% {locale === 'pt' ? 'TAEG' : 'APR'}
                          </span>
                        </div>
                      )}
                    </div>

                    {translation.terms && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          <strong>{locale === 'pt' ? 'Termos:' : 'Terms:'}</strong> {translation.terms}
                        </p>
                      </div>
                    )}

                    {option.website_url && (
                      <div className="mt-4">
                        <a
                          href={option.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700"
                        >
                          {locale === 'pt' ? 'Saber Mais' : 'Learn More'} →
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Providers Section */}
      {insuranceProviders.length > 0 && (
        <section className="page-section bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Seguros' : 'Insurance'}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                </div>
                <h2 className="section-heading-accent text-center">
                  {locale === 'pt' ? 'Seguros Aceites' : 'Accepted Insurance'}
                </h2>
                <p className="text-base text-gray-600">
                  {locale === 'pt'
                    ? 'Trabalhamos com as principais seguradoras de saúde em Portugal'
                    : 'We work with major health insurance providers in Portugal'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insuranceProviders.map((provider) => {
                  const translation = provider.insurance_provider_translations[0];

                  return (
                    <div
                      key={provider.id}
                      className="content-card"
                    >
                      {provider.logo_url && (
                        <div className="mb-4 h-16 flex items-center justify-center">
                          <img
                            src={provider.logo_url}
                            alt={translation.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}

                      <h3 className="text-xl font-bold mb-2 text-center" style={{ color: '#4E5865' }}>
                        {translation.name}
                      </h3>

                      <p className="text-gray-600 text-sm text-center mb-4">
                        {translation.description}
                      </p>

                      {translation.coverage_details && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {translation.coverage_details}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                        {provider.phone && (
                          <a
                            href={`tel:${provider.phone}`}
                            className="text-sm text-gray-600 hover:text-primary-600 flex items-center justify-center gap-2"
                          >
                            📞 {provider.phone}
                          </a>
                        )}
                        {provider.website_url && (
                          <a
                            href={provider.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-primary-600 hover:text-primary-700 text-center"
                          >
                            {locale === 'pt' ? 'Visitar Website' : 'Visit Website'} →
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  {locale === 'pt'
                    ? 'Não vê o seu seguro? Contacte-nos para verificar a cobertura do seu plano.'
                    : "Don't see your insurance? Contact us to verify your plan's coverage."}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="page-section bg-white border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'pt' ? 'Orçamento' : 'Quote'}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
            </div>
            <h2 className="section-heading-accent text-center">
              {locale === 'pt'
                ? 'Precisa de um orçamento personalizado?'
                : 'Need a personalized quote?'}
            </h2>
            <p className="text-base text-gray-600 mb-8">
              {locale === 'pt'
                ? 'Entre em contacto connosco para uma avaliação gratuita e orçamento sem compromisso.'
                : 'Contact us for a free evaluation and no-obligation quote.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+351935189807"
                className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-8 py-4 text-base font-semibold text-white hover:bg-primary-400 transition-colors"
              >
                {locale === 'pt' ? 'Ligar Agora' : 'Call Now'}
              </a>
              <a
                href="https://booking.clinicaferreiraborges.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-white border-2 border-primary-600 px-8 py-4 text-base font-semibold text-primary-600 hover:bg-primary-50 transition-all"
              >
                {locale === 'pt' ? 'Marcar Consulta' : 'Book Consultation'}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
