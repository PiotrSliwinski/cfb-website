/**
 * Validation utilities for form data and API inputs
 * Provides type-safe validation with detailed error messages
 */

import type {
  ValidationResult,
  ValidationError,
  TreatmentFormData,
  TeamMemberFormData,
  Locale,
} from '@/types';

// ============================================================================
// Base Validators
// ============================================================================

export function isRequired(value: any, fieldName: string): ValidationError | null {
  if (value === undefined || value === null || value === '') {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    };
  }
  return null;
}

export function isEmail(value: string, fieldName: string): ValidationError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (value && !emailRegex.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid email address`,
    };
  }
  return null;
}

export function isSlug(value: string, fieldName: string): ValidationError | null {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (value && !slugRegex.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid slug (lowercase, numbers, and hyphens only)`,
    };
  }
  return null;
}

export function isUrl(value: string, fieldName: string): ValidationError | null {
  try {
    new URL(value);
    return null;
  } catch {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid URL`,
    };
  }
}

export function minLength(
  value: string,
  min: number,
  fieldName: string
): ValidationError | null {
  if (value && value.length < min) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${min} characters`,
    };
  }
  return null;
}

export function maxLength(
  value: string,
  max: number,
  fieldName: string
): ValidationError | null {
  if (value && value.length > max) {
    return {
      field: fieldName,
      message: `${fieldName} must be at most ${max} characters`,
    };
  }
  return null;
}

export function isLocale(value: string, fieldName: string): ValidationError | null {
  if (value !== 'pt' && value !== 'en') {
    return {
      field: fieldName,
      message: `${fieldName} must be either 'pt' or 'en'`,
    };
  }
  return null;
}

// ============================================================================
// Complex Validators
// ============================================================================

export function validateTreatment(data: TreatmentFormData): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  const requiredError = isRequired(data.slug, 'slug');
  if (requiredError) errors.push(requiredError);

  const categoryError = isRequired(data.category, 'category');
  if (categoryError) errors.push(categoryError);

  // Slug validation
  if (data.slug) {
    const slugError = isSlug(data.slug, 'slug');
    if (slugError) errors.push(slugError);
  }

  // URL validations
  if (data.icon_url) {
    const iconError = isUrl(data.icon_url, 'icon_url');
    if (iconError) errors.push(iconError);
  }

  if (data.hero_image_url) {
    const heroError = isUrl(data.hero_image_url, 'hero_image_url');
    if (heroError) errors.push(heroError);
  }

  // Translations validation
  if (!data.treatment_translations || data.treatment_translations.length === 0) {
    errors.push({
      field: 'treatment_translations',
      message: 'At least one translation is required',
    });
  } else {
    data.treatment_translations.forEach((translation, index) => {
      const localeError = isLocale(translation.language_code, `translation[${index}].language_code`);
      if (localeError) errors.push(localeError);

      const titleError = isRequired(translation.title, `translation[${index}].title`);
      if (titleError) errors.push(titleError);

      if (translation.title) {
        const titleMinError = minLength(translation.title, 3, `translation[${index}].title`);
        if (titleMinError) errors.push(titleMinError);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateTeamMember(data: TeamMemberFormData): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  const slugError = isRequired(data.slug, 'slug');
  if (slugError) errors.push(slugError);

  const photoError = isRequired(data.photo_url, 'photo_url');
  if (photoError) errors.push(photoError);

  // Slug validation
  if (data.slug) {
    const slugFormatError = isSlug(data.slug, 'slug');
    if (slugFormatError) errors.push(slugFormatError);
  }

  // Photo URL validation
  if (data.photo_url) {
    const photoUrlError = isUrl(data.photo_url, 'photo_url');
    if (photoUrlError) errors.push(photoUrlError);
  }

  // Email validation
  if (data.email) {
    const emailError = isEmail(data.email, 'email');
    if (emailError) errors.push(emailError);
  }

  // Translations validation
  if (!data.team_member_translations || data.team_member_translations.length === 0) {
    errors.push({
      field: 'team_member_translations',
      message: 'At least one translation is required',
    });
  } else {
    data.team_member_translations.forEach((translation, index) => {
      const localeError = isLocale(translation.language_code, `translation[${index}].language_code`);
      if (localeError) errors.push(localeError);

      const nameError = isRequired(translation.name, `translation[${index}].name`);
      if (nameError) errors.push(nameError);

      const titleError = isRequired(translation.title, `translation[${index}].title`);
      if (titleError) errors.push(titleError);
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ============================================================================
// Sanitization
// ============================================================================

export function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function sanitizeEmail(value: string): string {
  return value.toLowerCase().trim();
}

export function sanitizeHtml(value: string): string {
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ============================================================================
// Type Guards with Validation
// ============================================================================

export function assertTreatment(data: any): asserts data is TreatmentFormData {
  const result = validateTreatment(data);
  if (!result.valid) {
    throw new Error(`Invalid treatment data: ${result.errors?.map(e => e.message).join(', ')}`);
  }
}

export function assertTeamMember(data: any): asserts data is TeamMemberFormData {
  const result = validateTeamMember(data);
  if (!result.valid) {
    throw new Error(`Invalid team member data: ${result.errors?.map(e => e.message).join(', ')}`);
  }
}
