import 'server-only';

import { getLocale } from 'next-intl/server';

import { HeaderClient } from './HeaderClient';
import { getAllTreatments } from '@/lib/supabase/queries/treatments';
import { getClinicSettings } from '@/lib/supabase/queries/clinic';

export async function Header() {
  const locale = await getLocale();

  const [treatments, clinicSettings] = await Promise.all([
    getAllTreatments(locale),
    getClinicSettings(),
  ]);

  const phone = clinicSettings?.phone || '+351935189807';
  const phoneDisplay = phone.replace('+351', '');

  const simplifiedTreatments = treatments.map((treatment: any) => {
    const translation = treatment.treatment_translations?.[0];

    return {
      id: treatment.id,
      slug: treatment.slug,
      isPopular: treatment.is_popular,
      title: translation?.title || '',
    };
  });

  return (
    <HeaderClient
      phoneDisplay={phoneDisplay}
      phoneHref={phone}
      treatments={simplifiedTreatments}
      locale={locale}
    />
  );
}
