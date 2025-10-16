import { NextResponse } from 'next/server';

import { getGoogleReviews } from '@/lib/google-reviews';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minRating = Number.parseInt(searchParams.get('minRating') || '5', 10);

  const data = await getGoogleReviews(Number.isNaN(minRating) ? 5 : minRating);

  return NextResponse.json(data);
}
