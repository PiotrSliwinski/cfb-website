'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Users, CreditCard, MapPin, Microscope } from 'lucide-react';
import { HeaderClient } from './HeaderClient';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

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

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [treatments, setTreatments] = useState<any[]>([]);
  const [phone, setPhone] = useState('+351935189807');

  useEffect(() => {
    // Fetch treatments
    const loadTreatments = async () => {
      try {
        const data = await apiClient.getTreatments(locale);
        setTreatments(data);
      } catch (error) {
        console.error('Failed to load treatments:', error);
      }
    };

    loadTreatments();
  }, [locale]);

  const practiceLinks = [
    {
      href: `/${locale}/equipa`,
      label: t('practice.team'),
      icon: Users,
      description: t('practice.teamDesc')
    },
    {
      href: `/${locale}/tecnologia`,
      label: t('practice.technology'),
      icon: Microscope,
      description: t('practice.technologyDesc')
    },
    {
      href: `/${locale}/pagamentos`,
      label: t('practice.payments'),
      icon: CreditCard,
      description: t('practice.paymentsDesc')
    },
    {
      href: `/${locale}/contacto`,
      label: t('practice.location'),
      icon: MapPin,
      description: t('practice.locationDesc')
    },
  ];

  // Format phone for display (remove country code for cleaner look)
  const phoneDisplay = phone.replace('+351', '');
  const phoneHref = phone;

  return (
    <HeaderClient
      phoneDisplay={phoneDisplay}
      phoneHref={phoneHref}
      treatments={treatments}
      practiceLinks={practiceLinks}
      locale={locale}
    />
  );
}
