// API Route: /api/section-types
// GET - Get all available section types

import { NextRequest, NextResponse } from 'next/server';
import { pagesService } from '@/lib/api/pages-service';

export async function GET(request: NextRequest) {
  try {
    const sectionTypes = await pagesService.getSectionTypes();

    return NextResponse.json({ data: sectionTypes }, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/section-types] Error:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch section types' },
      { status: 500 }
    );
  }
}
