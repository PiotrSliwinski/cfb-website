import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface GoogleReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface PlaceDetailsResponse {
  result?: {
    reviews?: GoogleReview[];
    rating?: number;
    user_ratings_total?: number;
  };
  status: string;
}

export async function GET(request: Request) {
  // Check credentials first, before any other operations
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  // If credentials are not configured, return empty data with 200 status
  // This allows the app to work in development/testing without Google API access
  if (!apiKey || apiKey === 'your_google_places_api_key_here' || !placeId) {
    return NextResponse.json({
      reviews: [],
      totalRating: 0,
      totalReviews: 0,
      warning: 'Google Places API credentials not configured. Add GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID to .env.local to enable reviews.'
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const minRating = parseInt(searchParams.get('minRating') || '5');

    // Fetch place details including reviews from Google Places API
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Google API responded with status: ${response.status}`);
    }

    const data: PlaceDetailsResponse = await response.json();

    if (data.status !== 'OK') {
      // Return empty data instead of error for graceful degradation
      console.warn(`Google Places API returned status: ${data.status}`);
      return NextResponse.json({
        reviews: [],
        totalRating: 0,
        totalReviews: 0,
        warning: `Google Places API returned status: ${data.status}`
      });
    }

    const reviews = data.result?.reviews || [];

    // Filter reviews by minimum rating (default 5 stars)
    const filteredReviews = reviews
      .filter(review => review.rating >= minRating)
      .sort((a, b) => b.time - a.time); // Sort by newest first

    return NextResponse.json({
      reviews: filteredReviews,
      totalRating: data.result?.rating || 0,
      totalReviews: data.result?.user_ratings_total || 0,
    });
  } catch (error) {
    // Graceful degradation: return empty data instead of error
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json({
      reviews: [],
      totalRating: 0,
      totalReviews: 0,
      warning: 'Unable to fetch Google reviews at this time.'
    });
  }
}
