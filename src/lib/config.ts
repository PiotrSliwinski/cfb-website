/**
 * Application configuration management
 * Centralizes all environment variables and application settings
 */

import type { Locale, StorageBucket } from '@/types';

// ============================================================================
// Environment Variables
// ============================================================================

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
};

// ============================================================================
// Supabase Configuration
// ============================================================================

export const supabaseConfig = {
  url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', ''),
} as const;

// ============================================================================
// API Configuration
// ============================================================================

export const apiConfig = {
  baseUrl: getEnvVar('NEXT_PUBLIC_API_URL', ''),
  timeout: parseInt(getEnvVar('API_TIMEOUT', '30000'), 10),
  retryAttempts: parseInt(getEnvVar('API_RETRY_ATTEMPTS', '3'), 10),
} as const;

// ============================================================================
// Application Configuration
// ============================================================================

export const appConfig = {
  name: 'Clínica Ferreira Borges',
  description: 'Clínica Dentária de excelência',
  defaultLocale: 'pt' as Locale,
  supportedLocales: ['pt', 'en'] as Locale[],
  environment: getEnvVar('NODE_ENV', 'development'),
  isDevelopment: getEnvVar('NODE_ENV', 'development') === 'development',
  isProduction: getEnvVar('NODE_ENV', 'development') === 'production',
} as const;

// ============================================================================
// Storage Configuration
// ============================================================================

export const storageConfig = {
  buckets: {
    treatments: {
      images: 'treatment-images' as StorageBucket,
      icons: 'treatment-icons' as StorageBucket,
    },
    team: {
      photos: 'team-photos' as StorageBucket,
    },
  },
  maxFileSizes: {
    image: 10 * 1024 * 1024, // 10MB
    icon: 2 * 1024 * 1024, // 2MB
  },
  allowedMimeTypes: {
    images: ['image/png', 'image/jpeg', 'image/webp'],
    icons: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  },
} as const;

// ============================================================================
// Google Reviews Configuration
// ============================================================================

export const googleReviewsConfig = {
  placeId: getEnvVar('GOOGLE_PLACE_ID', ''),
  apiKey: getEnvVar('GOOGLE_PLACES_API_KEY', ''),
  minRating: 4,
  cacheDuration: 60 * 60 * 1000, // 1 hour
} as const;

// ============================================================================
// Pagination Configuration
// ============================================================================

export const paginationConfig = {
  defaultLimit: 10,
  maxLimit: 100,
  defaultOffset: 0,
} as const;

// ============================================================================
// Cache Configuration
// ============================================================================

export const cacheConfig = {
  defaultTTL: 60 * 60, // 1 hour in seconds
  treatments: 60 * 30, // 30 minutes
  teamMembers: 60 * 30, // 30 minutes
  reviews: 60 * 60, // 1 hour
} as const;

// ============================================================================
// Feature Flags
// ============================================================================

export const featureFlags = {
  enableReviews: getEnvVar('ENABLE_REVIEWS', 'true') === 'true',
  enableAdmin: getEnvVar('ENABLE_ADMIN', 'true') === 'true',
  enableAnalytics: getEnvVar('ENABLE_ANALYTICS', 'false') === 'true',
  enableTestMode: getEnvVar('ENABLE_TEST_MODE', 'false') === 'true',
} as const;

// ============================================================================
// Contact Information
// ============================================================================

export const contactConfig = {
  phone: '+351 225 191 010',
  email: 'geral@clinicaferreir aborges.pt',
  address: {
    street: 'Rua Ferreira Borges, 151',
    city: 'Porto',
    postalCode: '4050-253',
    country: 'Portugal',
  },
  coordinates: {
    lat: 41.1474,
    lng: -8.6109,
  },
  socialMedia: {
    facebook: 'https://facebook.com/clinicaferreiraborges',
    instagram: 'https://instagram.com/clinicaferreiraborges',
  },
} as const;

// ============================================================================
// Validation Configuration
// ============================================================================

export const validationConfig = {
  slug: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },
  title: {
    minLength: 3,
    maxLength: 200,
  },
  description: {
    minLength: 10,
    maxLength: 5000,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if a feature flag is enabled
 *
 * @param feature - The feature flag to check
 * @returns true if the feature is enabled
 *
 * @example
 * ```typescript
 * if (isFeatureEnabled('enableReviews')) {
 *   // Show reviews section
 * }
 * ```
 */
export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Gets the storage bucket name for a given type
 *
 * @param type - The type of content ('treatment-image', 'treatment-icon', or 'team-photo')
 * @returns The Supabase storage bucket name
 *
 * @example
 * ```typescript
 * const bucket = getStorageBucket('team-photo');
 * // Returns: 'team-photos'
 * ```
 */
export function getStorageBucket(type: 'treatment-image' | 'treatment-icon' | 'team-photo'): StorageBucket {
  switch (type) {
    case 'treatment-image':
      return storageConfig.buckets.treatments.images;
    case 'treatment-icon':
      return storageConfig.buckets.treatments.icons;
    case 'team-photo':
      return storageConfig.buckets.team.photos;
  }
}

/**
 * Gets the maximum allowed file size for a given type
 *
 * @param type - The file type ('image' or 'icon')
 * @returns Maximum file size in bytes
 *
 * @example
 * ```typescript
 * const maxSize = getMaxFileSize('image');
 * // Returns: 10485760 (10MB in bytes)
 * ```
 */
export function getMaxFileSize(type: 'image' | 'icon'): number {
  return storageConfig.maxFileSizes[type];
}

/**
 * Gets the allowed MIME types for a given content type
 *
 * @param type - The content type ('images' or 'icons')
 * @returns Array of allowed MIME type strings
 *
 * @example
 * ```typescript
 * const mimeTypes = getAllowedMimeTypes('images');
 * // Returns: ['image/png', 'image/jpeg', 'image/webp']
 * ```
 */
export function getAllowedMimeTypes(type: 'images' | 'icons'): readonly string[] {
  return storageConfig.allowedMimeTypes[type];
}

/**
 * Checks if the application is running in development mode
 *
 * @returns true if NODE_ENV === 'development'
 *
 * @example
 * ```typescript
 * if (isDevelopment()) {
 *   console.log('Debug info:', data);
 * }
 * ```
 */
export function isDevelopment(): boolean {
  return appConfig.isDevelopment;
}

/**
 * Checks if the application is running in production mode
 *
 * @returns true if NODE_ENV === 'production'
 *
 * @example
 * ```typescript
 * if (isProduction()) {
 *   // Enable analytics
 * }
 * ```
 */
export function isProduction(): boolean {
  return appConfig.isProduction;
}

// ============================================================================
// Type Exports
// ============================================================================

export type AppConfig = typeof appConfig;
export type StorageConfig = typeof storageConfig;
export type FeatureFlags = typeof featureFlags;
