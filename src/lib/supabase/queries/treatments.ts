import { createClient } from '@/lib/supabase/server';

export async function getTreatmentBySlug(slug: string, locale: string) {
  const supabase = await createClient();

  const { data: treatment, error } = await supabase
    .from('treatments')
    .select(`
      *,
      treatment_translations!inner(*),
      treatment_faqs(
        id,
        display_order,
        treatment_faq_translations!inner(*)
      )
    `)
    .eq('slug', slug)
    .eq('treatment_translations.language_code', locale)
    .eq('treatment_faqs.treatment_faq_translations.language_code', locale)
    .eq('is_published', true)
    .order('display_order', { foreignTable: 'treatment_faqs', ascending: true })
    .single();

  if (error) {
    console.error('Error fetching treatment:', error);
    return null;
  }

  return treatment;
}

export async function getAllTreatments(locale: string) {
  const supabase = await createClient();

  const { data: treatments, error } = await supabase
    .from('treatments')
    .select(`
      *,
      treatment_translations!inner(*)
    `)
    .eq('treatment_translations.language_code', locale)
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching treatments:', error);
    return [];
  }

  return treatments;
}

export async function getTestimonials(locale: string) {
  const supabase = await createClient();

  const { data: testimonials, error } = await supabase
    .from('testimonials')
    .select(`
      *,
      testimonial_translations!inner(*)
    `)
    .eq('testimonial_translations.language_code', locale)
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }

  return testimonials;
}
