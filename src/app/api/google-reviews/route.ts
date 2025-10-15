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
  try {
    const { searchParams } = new URL(request.url);
    const minRating = parseInt(searchParams.get('minRating') || '5');

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;

    if (!apiKey || apiKey === 'your_google_places_api_key_here') {
      return NextResponse.json({
        error: 'Google Places API key not configured',
        message: 'Please add NEXT_PUBLIC_GOOGLE_PLACES_API_KEY to your .env.local file'
      }, { status: 500 });
    }

    if (!placeId) {
      return NextResponse.json({
        error: 'Google Place ID not configured',
        message: 'Please add NEXT_PUBLIC_GOOGLE_PLACE_ID to your .env.local file'
      }, { status: 500 });
    }

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
      return NextResponse.json({
        error: 'Failed to fetch reviews',
        status: data.status,
        message: 'Google Places API returned an error status'
      }, { status: 500 });
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
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json({
      error: 'Failed to fetch reviews',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
