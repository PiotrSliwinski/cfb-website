import { createClient } from '@/lib/supabase/server';

export async function getServicePrices(locale: string) {
  const supabase = await createClient();

  const { data: servicePrices, error } = await supabase
    .from('service_prices')
    .select(`
      *,
      service_price_translations!inner(*)
    `)
    .eq('service_price_translations.language_code', locale)
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching service prices:', error);
    return [];
  }

  return servicePrices || [];
}

export async function getFinancingOptions(locale: string) {
  const supabase = await createClient();

  const { data: financingOptions, error } = await supabase
    .from('financing_options')
    .select(`
      *,
      financing_option_translations!inner(*)
    `)
    .eq('financing_option_translations.language_code', locale)
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching financing options:', error);
    return [];
  }

  return financingOptions || [];
}

export async function getInsuranceProviders(locale: string) {
  const supabase = await createClient();

  const { data: insuranceProviders, error } = await supabase
    .from('insurance_providers')
    .select(`
      *,
      insurance_provider_translations!inner(*)
    `)
    .eq('insurance_provider_translations.language_code', locale)
    .eq('is_published', true)
    .order('display_order', { ascending: true});

  if (error) {
    console.error('Error fetching insurance providers:', error);
    return [];
  }

  return insuranceProviders || [];
}
