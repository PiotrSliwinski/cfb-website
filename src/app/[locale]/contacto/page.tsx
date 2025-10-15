import { ContactForm } from '@/components/forms/ContactForm';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getClinicSettings } from '@/lib/supabase/queries/clinic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return {
    title: locale === 'pt' ? 'Contacto | Clínica Ferreira Borges' : 'Contact | Clínica Ferreira Borges',
    description: locale === 'pt' ? 'Entre em contacto connosco em Campo de Ourique, Lisboa' : 'Contact us in Campo de Ourique, Lisbon',
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('location');
  const footer = await getTranslations('footer');

  // Fetch clinic settings from database
  const clinicSettings = await getClinicSettings();

  // Use clinic settings or fallback to hardcoded values
  const address = clinicSettings
    ? `${clinicSettings.address_line1}${clinicSettings.address_line2 ? ', ' + clinicSettings.address_line2 : ''}, ${clinicSettings.postal_code} ${clinicSettings.city}`
    : 'Rua Ferreira Borges 173C, Campo de Ourique, 1350-130 Lisboa';

  const phone = clinicSettings?.phone || '935 189 807';
  const email = clinicSettings?.email || 'geral@clinicaferreiraborges.pt';
  const googlePlaceId = clinicSettings?.google_place_id || process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;

  // Format operating hours for display
  const formatHours = (hours: any) => {
    if (!hours) return null;
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const saturday = 'saturday';
    const sunday = 'sunday';

    const weekdayHours = hours[weekdays[0]];
    const saturdayHours = hours[saturday];
    const sundayHours = hours[sunday];

    return {
      weekdays: weekdayHours?.closed ? (locale === 'pt' ? 'Fechado' : 'Closed') : `${weekdayHours?.open || '9h'} - ${weekdayHours?.close || '19h'}`,
      saturday: saturdayHours?.closed ? (locale === 'pt' ? 'Fechado' : 'Closed') : `${saturdayHours?.open || '9h'} - ${saturdayHours?.close || '13h'}`,
      sunday: sundayHours?.closed ? (locale === 'pt' ? 'Fechado' : 'Closed') : `${sundayHours?.open || ''} - ${sundayHours?.close || ''}`,
    };
  };

  const hours = formatHours(clinicSettings?.operating_hours);

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'pt' ? 'Contacto' : 'Contact'}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0098AA' }}>
              {locale === 'pt' ? 'Entre em Contacto' : 'Get in Touch'}
            </h1>
            <p className="text-base text-gray-600">
              {locale === 'pt'
                ? 'Estamos aqui para ajudar. Entre em contacto connosco.'
                : 'We are here to help. Contact us today.'}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-semibold mb-8" style={{ color: '#0098AA' }}>
                {locale === 'pt' ? 'Informações de Contacto' : 'Contact Information'}
              </h2>

              <div className="space-y-6">
                {/* Address */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
                      <MapPin className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#4E5865' }}>
                      {locale === 'pt' ? 'Morada' : 'Address'}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {address.split(', ').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < address.split(', ').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
                      <Phone className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#4E5865' }}>
                      {locale === 'pt' ? 'Telefone' : 'Phone'}
                    </h3>
                    <a href={`tel:+351${phone.replace(/\s/g, '')}`} className="text-primary-600 hover:text-primary-700 text-sm">
                      {phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
                      <Mail className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#4E5865' }}>Email</h3>
                    <a href={`mailto:${email}`} className="text-primary-600 hover:text-primary-700 text-sm">
                      {email}
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
                      <Clock className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#4E5865' }}>
                      {locale === 'pt' ? 'Horário' : 'Hours'}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {locale === 'pt' ? 'Seg - Sex' : 'Mon - Fri'}: {hours?.weekdays || '9h - 19h'}<br />
                      {locale === 'pt' ? 'Sábado' : 'Saturday'}: {hours?.saturday || '9h - 13h'}<br />
                      {locale === 'pt' ? 'Domingo' : 'Sunday'}: {hours?.sunday || (locale === 'pt' ? 'Fechado' : 'Closed')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div className="mt-8">
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&q=place_id:${googlePlaceId}&zoom=15`}
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  {locale === 'pt' ? 'Abrir no Google Maps' : 'Open in Google Maps'} →
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-8" style={{ color: '#0098AA' }}>
                {locale === 'pt' ? 'Envie-nos uma Mensagem' : 'Send us a Message'}
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Info */}
      {clinicSettings && (clinicSettings.ers_number || clinicSettings.establishment_number || clinicSettings.licence_number) && (
        <section className="py-12 bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#4E5865' }}>
                  {locale === 'pt' ? 'Informação Regulamentar' : 'Regulatory Information'}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {locale === 'pt' && <p>Entidade Reguladora da Saúde</p>}
                  {clinicSettings.ers_number && (
                    <p>
                      {locale === 'pt' ? 'N.º Registo ERS' : 'ERS Registration'}: {clinicSettings.ers_number}
                    </p>
                  )}
                  {clinicSettings.establishment_number && (
                    <p>
                      {locale === 'pt' ? 'Estabelecimento Fixo' : 'Establishment'}: {clinicSettings.establishment_number}
                    </p>
                  )}
                  {clinicSettings.licence_number && (
                    <p>
                      {locale === 'pt' ? 'Licença nº' : 'Licence No.'}: {clinicSettings.licence_number}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
