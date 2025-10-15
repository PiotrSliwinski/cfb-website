/**
 * API Client for frontend data fetching
 *
 * @description
 * Provides a centralized client for making API requests to internal Next.js API routes.
 * This is the recommended approach for client-side data fetching instead of direct
 * Supabase calls, as it provides:
 * - Better security (API routes can validate and sanitize)
 * - Consistent error handling
 * - Type safety
 * - Centralized request configuration
 *
 * @example
 * ```typescript
 * import { apiClient } from '@/lib/api-client';
 *
 * // Fetch all treatments in Portuguese
 * const treatments = await apiClient.getTreatments('pt');
 *
 * // Fetch a specific treatment
 * const treatment = await apiClient.getTreatment('implantes-dentarios', 'pt');
 * ```
 */

export class ApiClient {
  private baseUrl: string;

  /**
   * Creates a new API client instance
   * Uses NEXT_PUBLIC_API_URL from environment or defaults to relative URLs
   */
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  /**
   * Makes a type-safe HTTP request to an API endpoint
   *
   * @template T - The expected response type
   * @param endpoint - The API endpoint path (e.g., '/api/treatments')
   * @param options - Fetch options (method, headers, body, etc.)
   * @returns Promise resolving to the typed response data
   * @throws Error if the request fails or returns non-ok status
   *
   * @internal
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Fetches all treatments for a specific locale
   *
   * @param locale - Language code ('pt' or 'en')
   * @returns Promise resolving to array of treatments with translations
   *
   * @example
   * ```typescript
   * const treatments = await apiClient.getTreatments('pt');
   * console.log(treatments[0].treatment_translations[0].title);
   * ```
   */
  async getTreatments(locale: string = 'pt') {
    return this.request<any[]>(`/api/treatments?locale=${locale}`);
  }

  /**
   * Fetches a single treatment by slug
   *
   * @param slug - The treatment slug (e.g., 'implantes-dentarios')
   * @param locale - Language code ('pt' or 'en')
   * @returns Promise resolving to a single treatment with translations
   *
   * @example
   * ```typescript
   * const treatment = await apiClient.getTreatment('implantes-dentarios', 'pt');
   * console.log(treatment.treatment_translations[0].title);
   * ```
   */
  async getTreatment(slug: string, locale: string = 'pt') {
    return this.request<any>(`/api/treatments?slug=${slug}&locale=${locale}`);
  }

  /**
   * Fetches all team members for a specific locale
   * Includes member translations and specialties (treatments they specialize in)
   *
   * @param locale - Language code ('pt' or 'en')
   * @returns Promise resolving to array of team members with translations and specialties
   *
   * @example
   * ```typescript
   * const members = await apiClient.getTeamMembers('pt');
   * console.log(members[0].team_member_translations[0].name);
   * console.log(members[0].specialties); // Array of treatment IDs
   * ```
   */
  async getTeamMembers(locale: string = 'pt') {
    return this.request<any[]>(`/api/team?locale=${locale}`);
  }
}

/**
 * Singleton API client instance
 *
 * @description
 * Use this exported instance for all API calls in your components.
 * This ensures consistent configuration and optimal performance.
 *
 * @example
 * ```typescript
 * import { apiClient } from '@/lib/api-client';
 *
 * function MyComponent() {
 *   const [treatments, setTreatments] = useState([]);
 *
 *   useEffect(() => {
 *     apiClient.getTreatments('pt')
 *       .then(setTreatments)
 *       .catch(console.error);
 *   }, []);
 *
 *   return <div>{treatments.map(...)}</div>;
 * }
 * ```
 */
export const apiClient = new ApiClient();
