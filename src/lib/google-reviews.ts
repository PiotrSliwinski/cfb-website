import 'server-only';

import { unstable_cache } from 'next/cache';

export interface GoogleReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface GoogleReviewsData {
  reviews: GoogleReview[];
  totalRating: number;
  totalReviews: number;
  warning?: string;
}

const fetchGoogleReviews = unstable_cache(
  async (minRating: number): Promise<GoogleReviewsData> => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey || apiKey === 'your_google_places_api_key_here' || !placeId) {
      return {
        reviews: [],
        totalRating: 0,
        totalReviews: 0,
        warning:
          'Google Places API credentials not configured. Add GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID to enable reviews.',
      };
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error('Google API responded with status:', response.status);
      return {
        reviews: [],
        totalRating: 0,
        totalReviews: 0,
        warning: `Google API responded with status: ${response.status}`,
      };
    }

    const data = (await response.json()) as {
      result?: {
        reviews?: GoogleReview[];
        rating?: number;
        user_ratings_total?: number;
      };
      status: string;
    };

    if (data.status !== 'OK') {
      console.warn('Google Places API returned status:', data.status);
      return {
        reviews: [],
        totalRating: 0,
        totalReviews: 0,
        warning: `Google Places API returned status: ${data.status}`,
      };
    }

    const reviews = data.result?.reviews ?? [];
    const filteredReviews = reviews
      .filter((review) => review.rating >= minRating)
      .sort((a, b) => b.time - a.time);

    return {
      reviews: filteredReviews,
      totalRating: data.result?.rating ?? 0,
      totalReviews: data.result?.user_ratings_total ?? 0,
    };
  },
  ['google-reviews'],
  { revalidate: 3600 }
);

export async function getGoogleReviews(minRating = 5) {
  try {
    return await fetchGoogleReviews(minRating);
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return {
      reviews: [],
      totalRating: 0,
      totalReviews: 0,
      warning: 'Unable to fetch Google reviews at this time.',
    } satisfies GoogleReviewsData;
  }
}
