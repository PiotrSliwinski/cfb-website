/**
 * Clinic settings types - centralized type definitions
 */

export interface OperatingHours {
  [day: string]: {
    open: string; // HH:MM format
    close: string; // HH:MM format
    closed: boolean;
  };
}

export interface ClinicSettings {
  id: string;
  clinic_name: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2: string | null;
  postal_code: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
  operating_hours: OperatingHours;
  ers_number: string | null;
  establishment_number: string | null;
  licence_number: string | null;
  booking_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicSettingsUpdate {
  clinic_name?: string;
  phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string | null;
  postal_code?: string;
  city?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  google_place_id?: string | null;
  operating_hours?: OperatingHours;
  ers_number?: string | null;
  establishment_number?: string | null;
  licence_number?: string | null;
  booking_url?: string | null;
}
