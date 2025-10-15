'use server';

import { revalidatePath } from 'next/cache';
import { createClient as createAdminClient } from '@supabase/supabase-js';

type ActionResult = {
  success: boolean;
  error?: string;
};

// Service Prices Actions

export async function createServicePrice(formData: FormData): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const slug = formData.get('slug') as string;
    const priceFrom = parseFloat(formData.get('priceFrom') as string);
    const priceTo = parseFloat(formData.get('priceTo') as string);
    const displayOrder = parseInt(formData.get('displayOrder') as string);
    const isPublished = formData.get('isPublished') === 'true';

    const titlePt = formData.get('titlePt') as string;
    const titleEn = formData.get('titleEn') as string;
    const descriptionPt = formData.get('descriptionPt') as string;
    const descriptionEn = formData.get('descriptionEn') as string;

    // Create service price
    const { data: servicePrice, error: servicePriceError } = await supabaseAdmin
      .from('service_prices')
      .insert({
        slug,
        price_from: priceFrom,
        price_to: priceTo,
        display_order: displayOrder,
        is_published: isPublished,
      })
      .select()
      .single();

    if (servicePriceError) throw servicePriceError;

    // Create translations
    const { error: translationsError } = await supabaseAdmin
      .from('service_price_translations')
      .insert([
        {
          service_price_id: servicePrice.id,
          language_code: 'pt',
          title: titlePt,
          description: descriptionPt,
        },
        {
          service_price_id: servicePrice.id,
          language_code: 'en',
          title: titleEn,
          description: descriptionEn,
        },
      ]);

    if (translationsError) throw translationsError;

    revalidatePath('/[locale]/admin', 'layout');
    revalidatePath('/[locale]/pagamentos', 'layout');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create service price',
    };
  }
}

export async function updateServicePrice(id: string, formData: FormData): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const slug = formData.get('slug') as string;
    const priceFrom = parseFloat(formData.get('priceFrom') as string);
    const priceTo = parseFloat(formData.get('priceTo') as string);
    const displayOrder = parseInt(formData.get('displayOrder') as string);
    const isPublished = formData.get('isPublished') === 'true';

    const titlePt = formData.get('titlePt') as string;
    const titleEn = formData.get('titleEn') as string;
    const descriptionPt = formData.get('descriptionPt') as string;
    const descriptionEn = formData.get('descriptionEn') as string;

    // Update service price
    const { error: servicePriceError } = await supabaseAdmin
      .from('service_prices')
      .update({
        slug,
        price_from: priceFrom,
        price_to: priceTo,
        display_order: displayOrder,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (servicePriceError) throw servicePriceError;

    // Update translations
    await supabaseAdmin
      .from('service_price_translations')
      .update({
        title: titlePt,
        description: descriptionPt,
      })
      .eq('service_price_id', id)
      .eq('language_code', 'pt');

    await supabaseAdmin
      .from('service_price_translations')
      .update({
        title: titleEn,
        description: descriptionEn,
      })
      .eq('service_price_id', id)
      .eq('language_code', 'en');

    revalidatePath('/[locale]/admin', 'layout');
    revalidatePath('/[locale]/pagamentos', 'layout');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update service price',
    };
  }
}

export async function deleteServicePrice(id: string): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    // Delete translations first (foreign key constraint)
    const { error: translationsError } = await supabaseAdmin
      .from('service_price_translations')
      .delete()
      .eq('service_price_id', id);

    if (translationsError) throw translationsError;

    // Delete service price
    const { error: servicePriceError } = await supabaseAdmin
      .from('service_prices')
      .delete()
      .eq('id', id);

    if (servicePriceError) throw servicePriceError;

    revalidatePath('/[locale]/admin', 'layout');
    revalidatePath('/[locale]/pagamentos', 'layout');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete service price',
    };
  }
}

export async function toggleServicePricePublish(id: string, isPublished: boolean): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const { error } = await supabaseAdmin
      .from('service_prices')
      .update({ is_published: isPublished, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/[locale]/admin', 'layout');
    revalidatePath('/[locale]/pagamentos', 'layout');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to toggle publish status',
    };
  }
}

export async function updateServicePricesOrder(
  updates: { id: string; display_order: number }[]
): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from('service_prices')
        .update({ display_order: update.display_order })
        .eq('id', update.id);

      if (error) throw error;
    }

    revalidatePath('/[locale]/pagamentos', 'layout');
    revalidatePath('/[locale]/admin', 'layout');

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update display order',
    };
  }
}

// Financing Options Actions

export async function createFinancingOption(formData: FormData): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const providerName = formData.get('providerName') as string || null;
    const minAmount = formData.get('minAmount') ? parseFloat(formData.get('minAmount') as string) : null;
    const maxAmount = formData.get('maxAmount') ? parseFloat(formData.get('maxAmount') as string) : null;
    const minInstallments = formData.get('minInstallments') ? parseInt(formData.get('minInstallments') as string) : null;
    const maxInstallments = formData.get('maxInstallments') ? parseInt(formData.get('maxInstallments') as string) : null;
    const interestRate = formData.get('interestRate') ? parseFloat(formData.get('interestRate') as string) : null;
    const websiteUrl = formData.get('websiteUrl') as string || null;
    const phone = formData.get('phone') as string || null;
    const displayOrder = parseInt(formData.get('displayOrder') as string);
    const isPublished = formData.get('isPublished') === 'true';

    const titlePt = formData.get('titlePt') as string;
    const titleEn = formData.get('titleEn') as string;
    const descriptionPt = formData.get('descriptionPt') as string;
    const descriptionEn = formData.get('descriptionEn') as string;
    const termsPt = formData.get('termsPt') as string || null;
    const termsEn = formData.get('termsEn') as string || null;

    // Create financing option
    const { data: financingOption, error: financingError } = await supabaseAdmin
      .from('financing_options')
      .insert({
        provider_name: providerName,
        min_amount: minAmount,
        max_amount: maxAmount,
        min_installments: minInstallments,
        max_installments: maxInstallments,
        interest_rate: interestRate,
        website_url: websiteUrl,
        phone: phone,
        display_order: displayOrder,
        is_published: isPublished,
      })
      .select()
      .single();

    if (financingError) throw financingError;

    // Create translations
    const { error: translationsError } = await supabaseAdmin
      .from('financing_option_translations')
      .insert([
        {
          financing_option_id: financingOption.id,
          language_code: 'pt',
          title: titlePt,
          description: descriptionPt,
          terms: termsPt,
        },
        {
          financing_option_id: financingOption.id,
          language_code: 'en',
          title: titleEn,
          description: descriptionEn,
          terms: termsEn,
        },
      ]);

    if (translationsError) throw translationsError;

    revalidatePath('/[locale]/admin', 'layout');
    revalidatePath('/[locale]/pagamentos', 'layout');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create financing option',
    };
  }
}

export async function updateFinancingOption(id: string, formData: FormData): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const providerName = formData.get('providerName') as string || null;
    const minAmount = formData.get('minAmount') ? parseFloat(formData.get('minAmount') as string) : null;
    const maxAmount = formData.get('maxAmount') ? parseFloat(formData.get('maxAmount') as string) : null;
    const minInstallments = formData.get('minInstallments') ? parseInt(formData.get('minInstallments') as string) : null;
    const maxInstallments = formData.get('maxInstallments') ? parseInt(formData.get('maxInstallments') as string) : null;
    const interestRate = formData.get('interestRate') ? parseFloat(formData.get('interestRate') as string) : null;
    const websiteUrl = formData.get('websiteUrl') as string || null;
    const phone = formData.get('phone') as string || null;
    const displayOrder = parseInt(formData.get('displayOrder') as string);
    const isPublished = formData.get('isPublished') === 'true';

    const titlePt = formData.get('titlePt') as string;
    const titleEn = formData.get('titleEn') as string;
    const descriptionPt = formData.get('descriptionPt') as string;
    const descriptionEn = formData.get('descriptionEn') as string;
    const termsPt = formData.get('termsPt') as string || null;
    const termsEn = formData.get('termsEn') as string || null;

    // Update financing option
    const { error: financingError } = await supabaseAdmin
      .from('financing_options')
      .update({
        provider_name: providerName,
        min_amount: minAmount,
        max_amount: maxAmount,
        min_installments: minInstallments,
        max_installments: maxInstallments,
        interest_rate: interestRate,
        website_url: websiteUrl,
        phone: phone,
        display_order: displayOrder,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (financingError) throw financingError;

    // Update translations
    await supabaseAdmin
      .from('financing_option_translations')
      .update({
        title: titlePt,
        description: descriptionPt,
        terms: termsPt,
      })
      .eq('financing_option_id', id)
      .eq('language_code', 'pt');

    await supabaseAdmin
      .from('financing_option_translations')
      .update({
        title: titleEn,
        description: descriptionEn,
        terms: termsEn,
      })
      .eq('financing_option_id', id)
      .eq('language_code', 'en');

    revalidatePath('/[locale]/admin', 'layout');
    revalidatePath('/[locale]/pagamentos', 'layout');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update financing option',
    };
  }
}

export async function deleteFinancingOption(id: string): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    // Delete translations first (foreign key constraint)
    const { error: translationsError } = await supabaseAdmin
      .from('financing_option_translations')
      .delete()
      .eq('financing_option_id', id);

    if (translationsError) throw translationsError;

    // Delete financing option
    const { error: financingError } = await supabaseAdmin
      .from('financing_options')
      .delete()
      .eq('id', id);

    if (financingError) throw financingError;

    revalidatePath('/[locale]/admin', 'layout');
    revalidatePath('/[locale]/pagamentos', 'layout');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete financing option',
    };
  }
}

export async function toggleFinancingOptionPublish(id: string, isPublished: boolean): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const { error } = await supabaseAdmin
      .from('financing_options')
      .update({ is_published: isPublished, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/[locale]/admin', 'layout');
    revalidatePath('/[locale]/pagamentos', 'layout');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to toggle publish status',
    };
  }
}

export async function updateFinancingOptionsOrder(
  updates: { id: string; display_order: number }[]
): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from('financing_options')
        .update({ display_order: update.display_order })
        .eq('id', update.id);

      if (error) throw error;
    }

    revalidatePath('/[locale]/pagamentos', 'layout');
    revalidatePath('/[locale]/admin', 'layout');

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update display order',
    };
  }
}
