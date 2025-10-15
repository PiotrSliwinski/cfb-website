import { Tag, CreditCard, FileText, Users, Shield, Building2, Share2, Image, MessageSquare } from 'lucide-react';
import { CollectionConfig } from '@/types/admin';

export const servicePricesCollection: CollectionConfig = {
  id: 'prices',
  name: 'Service Prices',
  nameSingular: 'Service Price',
  icon: Tag,
  tableName: 'service_prices',
  translationTableName: 'service_price_translations',

  baseFields: [
    {
      name: 'slug',
      label: 'Slug (URL identifier)',
      type: 'slug',
      required: true,
      placeholder: 'e.g., dental-cleaning',
      hint: 'Use lowercase letters, numbers, and hyphens only',
    },
    {
      name: 'price_from',
      label: 'Price From (€)',
      type: 'decimal',
      required: true,
      min: 0,
      step: 0.01,
      hint: 'Set to 0 for free services',
    },
    {
      name: 'price_to',
      label: 'Price To (€)',
      type: 'decimal',
      required: true,
      min: 0,
      step: 0.01,
      hint: 'Set same as "Price From" for fixed prices',
    },
    {
      name: 'display_order',
      label: 'Display Order',
      type: 'number',
      required: true,
      min: 0,
    },
  ],

  translatableFields: {
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
      },
    ],
  },

  features: {
    draggable: true,
    publishable: true,
    featured: false,
  },

  endpoints: {
    list: '/api/prices',
    create: '/api/prices',
    update: '/api/prices',
    delete: '/api/prices',
    togglePublish: '/api/prices/publish',
    reorder: '/api/prices/reorder',
  },

  display: {
    titleField: 'title',
    descriptionField: 'description',
  },
};

export const financingOptionsCollection: CollectionConfig = {
  id: 'financing',
  name: 'Financing Options',
  nameSingular: 'Financing Option',
  icon: CreditCard,
  tableName: 'financing_options',
  translationTableName: 'financing_option_translations',

  baseFields: [
    {
      name: 'provider_name',
      label: 'Provider Name',
      type: 'text',
      placeholder: 'e.g., Cetelem, Cofidis',
    },
    {
      name: 'min_amount',
      label: 'Minimum Amount (€)',
      type: 'decimal',
      min: 0,
      step: 0.01,
      placeholder: 'Optional',
    },
    {
      name: 'max_amount',
      label: 'Maximum Amount (€)',
      type: 'decimal',
      min: 0,
      step: 0.01,
      placeholder: 'Optional',
    },
    {
      name: 'min_installments',
      label: 'Minimum Installments (months)',
      type: 'number',
      min: 1,
      placeholder: 'Optional',
    },
    {
      name: 'max_installments',
      label: 'Maximum Installments (months)',
      type: 'number',
      min: 1,
      placeholder: 'Optional',
    },
    {
      name: 'interest_rate',
      label: 'Interest Rate (%)',
      type: 'decimal',
      min: 0,
      step: 0.01,
      placeholder: 'Optional',
    },
    {
      name: 'website_url',
      label: 'Website URL',
      type: 'text',
      placeholder: 'https://...',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      placeholder: '+351...',
    },
    {
      name: 'display_order',
      label: 'Display Order',
      type: 'number',
      required: true,
      min: 0,
    },
  ],

  translatableFields: {
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
      },
      {
        name: 'terms',
        label: 'Terms & Conditions',
        type: 'textarea',
        placeholder: 'Optional',
      },
    ],
  },

  features: {
    draggable: true,
    publishable: true,
    featured: false,
  },

  endpoints: {
    list: '/api/financing',
    create: '/api/financing',
    update: '/api/financing',
    delete: '/api/financing',
    togglePublish: '/api/financing/publish',
    reorder: '/api/financing/reorder',
  },

  display: {
    titleField: 'title',
    descriptionField: 'description',
  },
};

export const insuranceProvidersCollection: CollectionConfig = {
  id: 'insurance',
  name: 'Insurance Providers',
  nameSingular: 'Insurance Provider',
  icon: Shield,
  tableName: 'insurance_providers',
  translationTableName: 'insurance_provider_translations',

  baseFields: [
    {
      name: 'slug',
      label: 'Slug (URL identifier)',
      type: 'slug',
      required: true,
      placeholder: 'e.g., medis',
      hint: 'Use lowercase letters, numbers, and hyphens only',
    },
    {
      name: 'logo_url',
      label: 'Logo URL',
      type: 'text',
      placeholder: 'https://...',
      hint: 'URL to the insurance provider logo image',
    },
    {
      name: 'website_url',
      label: 'Website URL',
      type: 'text',
      placeholder: 'https://...',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      placeholder: '+351...',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      placeholder: 'contact@provider.com',
    },
    {
      name: 'display_order',
      label: 'Display Order',
      type: 'number',
      required: true,
      min: 0,
    },
  ],

  translatableFields: {
    fields: [
      {
        name: 'name',
        label: 'Provider Name',
        type: 'text',
        required: true,
      },
      {
        name: 'description',
        label: 'Short Description',
        type: 'textarea',
        required: true,
        hint: 'Brief description of the insurance provider',
      },
      {
        name: 'coverage_details',
        label: 'Coverage Details',
        type: 'textarea',
        placeholder: 'Optional',
        hint: 'Detailed information about coverage and conditions',
      },
    ],
  },

  features: {
    draggable: true,
    publishable: true,
    featured: false,
  },

  endpoints: {
    list: '/api/insurance',
    create: '/api/insurance',
    update: '/api/insurance',
    delete: '/api/insurance',
    togglePublish: '/api/insurance/publish',
    reorder: '/api/insurance/reorder',
  },

  display: {
    titleField: 'name',
    descriptionField: 'description',
  },
};

export const contactInformationCollection: CollectionConfig = {
  id: 'contact',
  name: 'Contact Information',
  nameSingular: 'Contact Info',
  icon: Building2,
  tableName: 'contact_information',
  translationTableName: 'contact_information_translations',

  baseFields: [
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: true,
      placeholder: '+351935189807',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      required: true,
      placeholder: 'geral@clinicaferreiraborges.pt',
    },
    {
      name: 'address_line1',
      label: 'Address Line 1',
      type: 'text',
      required: true,
      placeholder: 'Rua Ferreira Borges 173C',
    },
    {
      name: 'address_line2',
      label: 'Address Line 2',
      type: 'text',
      placeholder: 'Campo de Ourique',
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      required: true,
      placeholder: 'Lisboa',
    },
    {
      name: 'postal_code',
      label: 'Postal Code',
      type: 'text',
      required: true,
      placeholder: '1350-130',
    },
    {
      name: 'google_maps_embed_url',
      label: 'Google Maps Embed URL',
      type: 'text',
      placeholder: 'https://www.google.com/maps/embed?pb=...',
    },
  ],

  translatableFields: {
    fields: [
      {
        name: 'business_hours',
        label: 'Business Hours',
        type: 'textarea',
        required: true,
        placeholder: 'Segunda a Sábado: 10:00 - 20:00',
      },
      {
        name: 'additional_notes',
        label: 'Additional Notes',
        type: 'textarea',
        placeholder: 'Fechado aos Domingos e Feriados',
      },
    ],
  },

  features: {
    draggable: false,
    publishable: false,
    featured: false,
  },

  endpoints: {
    list: '/api/contact-info',
    create: '/api/contact-info',
    update: '/api/contact-info',
    delete: '/api/contact-info',
  },

  display: {
    titleField: 'phone',
    descriptionField: 'email',
  },
};

export const socialMediaLinksCollection: CollectionConfig = {
  id: 'social',
  name: 'Social Media Links',
  nameSingular: 'Social Media Link',
  icon: Share2,
  tableName: 'social_media_links',
  translationTableName: 'social_media_link_translations',

  baseFields: [
    {
      name: 'platform',
      label: 'Platform',
      type: 'text',
      required: true,
      placeholder: 'facebook, instagram, linkedin',
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: true,
      placeholder: 'https://facebook.com/...',
    },
    {
      name: 'icon_name',
      label: 'Icon Name',
      type: 'text',
      placeholder: 'Facebook',
      hint: 'Lucide icon name',
    },
    {
      name: 'display_order',
      label: 'Display Order',
      type: 'number',
      required: true,
      min: 0,
    },
  ],

  translatableFields: {
    fields: [
      {
        name: 'display_name',
        label: 'Display Name',
        type: 'text',
        placeholder: 'Facebook',
      },
      {
        name: 'hover_text',
        label: 'Hover Text',
        type: 'text',
        placeholder: 'Siga-nos no Facebook',
      },
    ],
  },

  features: {
    draggable: true,
    publishable: true,
    featured: false,
  },

  endpoints: {
    list: '/api/social-media',
    create: '/api/social-media',
    update: '/api/social-media',
    delete: '/api/social-media',
    togglePublish: '/api/social-media/publish',
    reorder: '/api/social-media/reorder',
  },

  display: {
    titleField: 'display_name',
    descriptionField: 'platform',
  },
};

export const heroSectionsCollection: CollectionConfig = {
  id: 'heroes',
  name: 'Hero Sections',
  nameSingular: 'Hero Section',
  icon: Image,
  tableName: 'hero_sections',
  translationTableName: 'hero_section_translations',

  baseFields: [
    {
      name: 'slug',
      label: 'Slug',
      type: 'slug',
      required: true,
      placeholder: 'home-hero',
    },
    {
      name: 'page_identifier',
      label: 'Page Identifier',
      type: 'text',
      required: true,
      placeholder: 'home, team, payments',
      hint: 'Which page this hero belongs to',
    },
    {
      name: 'background_image_url',
      label: 'Background Image URL',
      type: 'text',
      placeholder: 'https://...',
    },
    {
      name: 'background_gradient',
      label: 'Background Gradient',
      type: 'text',
      placeholder: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      name: 'display_order',
      label: 'Display Order',
      type: 'number',
      required: true,
      min: 0,
    },
  ],

  translatableFields: {
    fields: [
      {
        name: 'heading',
        label: 'Heading',
        type: 'text',
        required: true,
      },
      {
        name: 'subheading',
        label: 'Subheading',
        type: 'textarea',
        required: true,
      },
      {
        name: 'cta_text',
        label: 'CTA Button Text',
        type: 'text',
        placeholder: 'Marcar Consulta',
      },
      {
        name: 'cta_url',
        label: 'CTA Button URL',
        type: 'text',
        placeholder: 'https://booking.clinicaferreiraborges.pt',
      },
      {
        name: 'secondary_cta_text',
        label: 'Secondary CTA Text',
        type: 'text',
        placeholder: 'Optional',
      },
      {
        name: 'secondary_cta_url',
        label: 'Secondary CTA URL',
        type: 'text',
        placeholder: 'Optional',
      },
    ],
  },

  features: {
    draggable: true,
    publishable: true,
    featured: false,
  },

  endpoints: {
    list: '/api/hero-sections',
    create: '/api/hero-sections',
    update: '/api/hero-sections',
    delete: '/api/hero-sections',
    togglePublish: '/api/hero-sections/publish',
    reorder: '/api/hero-sections/reorder',
  },

  display: {
    titleField: 'heading',
    descriptionField: 'page_identifier',
  },
};

export const ctaSectionsCollection: CollectionConfig = {
  id: 'ctas',
  name: 'CTA Sections',
  nameSingular: 'CTA Section',
  icon: MessageSquare,
  tableName: 'cta_sections',
  translationTableName: 'cta_section_translations',

  baseFields: [
    {
      name: 'slug',
      label: 'Slug',
      type: 'slug',
      required: true,
      placeholder: 'team-bottom-cta',
    },
    {
      name: 'section_identifier',
      label: 'Section Identifier',
      type: 'text',
      required: true,
      placeholder: 'team-bottom, payments-bottom',
      hint: 'Where this CTA appears',
    },
    {
      name: 'background_color',
      label: 'Background Color',
      type: 'text',
      placeholder: '#667eea',
    },
    {
      name: 'background_image_url',
      label: 'Background Image URL',
      type: 'text',
      placeholder: 'https://...',
    },
    {
      name: 'display_order',
      label: 'Display Order',
      type: 'number',
      required: true,
      min: 0,
    },
  ],

  translatableFields: {
    fields: [
      {
        name: 'heading',
        label: 'Heading',
        type: 'text',
        required: true,
      },
      {
        name: 'subheading',
        label: 'Subheading',
        type: 'textarea',
      },
      {
        name: 'primary_button_text',
        label: 'Primary Button Text',
        type: 'text',
        placeholder: 'Marcar Consulta',
      },
      {
        name: 'primary_button_url',
        label: 'Primary Button URL',
        type: 'text',
        placeholder: 'https://booking.clinicaferreiraborges.pt',
      },
      {
        name: 'secondary_button_text',
        label: 'Secondary Button Text',
        type: 'text',
        placeholder: 'Optional',
      },
      {
        name: 'secondary_button_url',
        label: 'Secondary Button URL',
        type: 'text',
        placeholder: 'Optional',
      },
    ],
  },

  features: {
    draggable: true,
    publishable: true,
    featured: false,
  },

  endpoints: {
    list: '/api/cta-sections',
    create: '/api/cta-sections',
    update: '/api/cta-sections',
    delete: '/api/cta-sections',
    togglePublish: '/api/cta-sections/publish',
    reorder: '/api/cta-sections/reorder',
  },

  display: {
    titleField: 'heading',
    descriptionField: 'section_identifier',
  },
};

// Export all collections as a registry
export const collections: Record<string, CollectionConfig> = {
  prices: servicePricesCollection,
  financing: financingOptionsCollection,
  insurance: insuranceProvidersCollection,
  contact: contactInformationCollection,
  social: socialMediaLinksCollection,
  heroes: heroSectionsCollection,
  ctas: ctaSectionsCollection,
};
