// API Route: /api/pages
// GET - List all pages
// POST - Create a new page

import { NextRequest, NextResponse } from 'next/server';
import { pagesService } from '@/lib/api/pages-service';
import type { CreatePageInput } from '@/types/pages';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const status = searchParams.get('status') || undefined;
    const locale = searchParams.get('locale') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');

    const result = await pagesService.findPages({
      status,
      locale,
      page,
      pageSize,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/pages] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePageInput = await request.json();

    // Validate required fields
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug' },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase, alphanumeric, hyphens only)
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const page = await pagesService.createPage(body);

    return NextResponse.json({ data: page }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/pages] Error:', error);

    // Handle duplicate slug error
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create page' },
      { status: 500 }
    );
  }
}
