import 'server-only';

import { getLocale, getTranslations } from 'next-intl/server';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

import { getClinicSettings } from '@/lib/supabase/queries/clinic';

export async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations('footer');
  const clinicSettings = await getClinicSettings();

  const phone = clinicSettings?.phone || '+351935189807';
  const phoneDisplay = phone.replace('+351', '').trim() || '935 189 807';
  const email = clinicSettings?.email || 'geral@clinicaferreiraborges.pt';
  const address = clinicSettings?.address_line1
    ? [
        clinicSettings.address_line1,
        clinicSettings.address_line2,
        `${clinicSettings.postal_code} ${clinicSettings.city}`.trim(),
      ]
        .filter(Boolean)
        .join(', ')
    : t('address');

  return (
    <footer style={{ backgroundColor: '#0098AA' }}>
      <div className="container mx-auto px-6 py-16">
        {/* Main Footer Content - 4 columns for better symmetry */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 max-w-7xl mx-auto">
          {/* About Section */}
          <div className="text-center md:text-left">
            <h3 className="text-base font-bold text-white mb-4">
              Clínica Ferreira Borges
            </h3>
            <div className="text-xs text-white leading-relaxed space-y-1">
              <p className="font-semibold">Entidade Reguladora da Saúde</p>
              <p>N.º Registo ERS: 25393</p>
              <p>Estabelecimento Fixo: E128470</p>
              <p>Licença nº 10984/2015</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
              Contacto
            </h3>
            <div className="space-y-3 text-sm">
              <a
                href={`tel:${phone}`}
                className="flex items-center justify-center md:justify-start gap-2 text-white/90 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{phoneDisplay}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center justify-center md:justify-start gap-2 text-white/90 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-xs">{email}</span>
              </a>
              <div className="flex items-start justify-center md:justify-start gap-2 text-white/90">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-xs">{address}</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
              Horário
            </h3>
            <div className="space-y-2 text-sm text-white/90">
              <div className="flex justify-center md:justify-between">
                <span>Seg - Sex</span>
                <span className="text-white font-semibold ml-4 md:ml-0">9h - 19h</span>
              </div>
              <div className="flex justify-center md:justify-between">
                <span>Sábado</span>
                <span className="text-white font-semibold ml-4 md:ml-0">9h - 13h</span>
              </div>
              <div className="flex justify-center md:justify-between">
                <span>Domingo</span>
                <span className="text-white/50 ml-4 md:ml-0">Fechado</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
              Siga-nos
            </h3>
            <div className="flex gap-3 justify-center md:justify-start">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white hover:text-primary-600 transition-all"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white hover:text-primary-600 transition-all"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={`https://wa.me/${phone.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white hover:text-primary-600 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
            <div className="mt-6">
              <Link
                href={`/${locale}/contacto`}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-primary-600 rounded-lg font-semibold text-sm hover:bg-white/90 transition-all"
              >
                {locale === 'pt' ? 'Contacto' : 'Contact'}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/70">
            <p className="text-center md:text-left">
              &copy; {new Date().getFullYear()} Clínica Ferreira Borges. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">
                {locale === 'pt' ? 'Privacidade' : 'Privacy'}
              </a>
              <Link href={`/${locale}/termos-condicoes`} className="hover:text-white transition-colors">
                {locale === 'pt' ? 'Termos' : 'Terms'}
              </Link>
              <a href="#" className="hover:text-white transition-colors">
                {locale === 'pt' ? 'Reclamações' : 'Complaints'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
