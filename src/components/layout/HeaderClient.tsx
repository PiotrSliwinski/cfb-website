'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { Phone, Menu, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Treatment icon mapping
const treatmentIcons: Record<string, string> = {
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

interface HeaderClientProps {
  phoneDisplay: string;
  phoneHref: string;
  treatments: any[];
  practiceLinks: any[];
  locale: string;
}

export function HeaderClient({
  phoneDisplay,
  phoneHref,
  treatments,
  practiceLinks,
  locale,
}: HeaderClientProps) {
  const t = useTranslations('nav');
  const router = useRouter();
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle navigation with proper cleanup
  const handleNavigation = (href: string, event?: React.MouseEvent) => {
    // Prevent default to ensure we control the navigation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('[HeaderClient] Navigating to:', href);

    // Close menu immediately for better UX
    setShowMegaMenu(false);

    // Use native browser navigation for reliability
    // This ensures navigation always works, even if router.push() fails
    window.location.href = href;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Logo />

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Phone - Minimal */}
          <a
            href={phoneHref}
            className="hidden md:flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors text-sm"
          >
            <Phone className="w-4 h-4" />
            <span>{phoneDisplay}</span>
          </a>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Book Appointment - Simple */}
          <a
            href="https://booking.clinicaferreiraborges.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-400 transition-colors"
          >
            {t('bookAppointment')}
          </a>

          {/* Menu Button - Clean */}
          <button
            onClick={() => setShowMegaMenu(!showMegaMenu)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {showMegaMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Full-Width Mega Menu */}
      {showMegaMenu && (
        <div className="absolute left-0 right-0 bg-white border-t border-gray-200 shadow-lg max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Practice Section */}
              <div className="lg:col-span-4">
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    {t('practice.title')}
                  </h3>
                </div>

                <div className="space-y-1">
                  {practiceLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <button
                        key={link.href}
                        onClick={(e) => handleNavigation(link.href, e)}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                          {link.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Services Section */}
              <div className="lg:col-span-8 lg:border-l lg:border-gray-200 lg:pl-8">
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    {t('services.title')}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {treatments.map((treatment) => {
                    const translation = treatment.treatment_translations[0];
                    const isPopular = treatment.is_popular;
                    const href = `/${locale}/tratamentos/${treatment.slug}`;

                    return (
                      <button
                        key={treatment.id}
                        onClick={(e) => handleNavigation(href, e)}
                        className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-left w-full ${
                          isPopular
                            ? 'bg-primary-50 hover:bg-primary-100'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {isPopular && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full"></div>
                        )}
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          {treatmentIcons[treatment.slug] ? (
                            <Image
                              src={treatmentIcons[treatment.slug]}
                              alt={translation?.title || ''}
                              width={18}
                              height={18}
                              className="object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                            />
                          ) : (
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium transition-colors ${
                            isPopular
                              ? 'text-primary-900 group-hover:text-primary-700'
                              : 'text-gray-700 group-hover:text-primary-600'
                          }`}
                        >
                          {translation?.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
