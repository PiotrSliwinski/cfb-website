/**
 * API Route for Settings
 *
 * GET /api/settings - Get all settings or filter by category
 * GET /api/settings?category=contact - Get settings by category
 * GET /api/settings?key=app.name - Get single setting by key
 */

import { NextResponse } from 'next/server';
import { getSettings, getSetting } from '@/app/actions/settings';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const key = searchParams.get('key');

  try {
    // Get single setting by key
    if (key) {
      const result = await getSetting(key);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json(result.data);
    }

    // Get settings by category or all settings
    const result = await getSettings(category || undefined);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
