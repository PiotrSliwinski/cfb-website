/**
 * Dynamic API Route Handler
 * Automatically handles CRUD operations for ANY content type
 * Based on Strapi's dynamic API generation pattern
 *
 * Routes:
 * GET    /api/blog-posts              → List all
 * GET    /api/blog-posts/123          → Get one
 * POST   /api/blog-posts              → Create
 * PUT    /api/blog-posts/123          → Update
 * DELETE /api/blog-posts/123          → Delete
 * POST   /api/blog-posts/123/publish  → Publish
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDynamicContentServiceByName } from '@/lib/api/dynamic-content-service';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/[collection] - List all entries
 * GET /api/[collection]?filters[title][$contains]=test
 * GET /api/[collection]?pagination[page]=1&pagination[pageSize]=10
 * GET /api/[collection]?sort=createdAt:desc
 * GET /api/[collection]?populate=author,categories
 * GET /api/[collection]?publicationState=live
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Create service for this content type
    const service = await createDynamicContentServiceByName(collection);

    // Parse query parameters
    const queryParams = {
      filters: parseFilters(searchParams),
      populate: searchParams.get('populate')?.split(','),
      sort: searchParams.get('sort')?.split(','),
      locale: searchParams.get('locale') || 'en',
      publicationState: searchParams.get('publicationState') as 'live' | 'preview' | undefined,
      pagination: {
        page: parseInt(searchParams.get('pagination[page]') || '1'),
        pageSize: parseInt(searchParams.get('pagination[pageSize]') || '25'),
      },
    };

    // Execute query
    const result = await service.find(queryParams);

    return NextResponse.json(result);
  } catch (error: any) {
    const { collection } = await params;
    console.error(`[API ${collection}] GET error:`, error);

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: { message: `Collection "${collection}" not found`, status: 404 } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: { message: error.message || 'Internal server error', status: 500 } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/[collection] - Create a new entry
 * Body: { data: { ...fields }, translations: [{ language_code: 'pt', data: {...} }] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const body = await request.json();

    // Validate request body
    if (!body.data || typeof body.data !== 'object') {
      return NextResponse.json(
        { error: { message: 'Missing or invalid "data" field in request body', status: 400 } },
        { status: 400 }
      );
    }

    // Create service for this content type
    const service = await createDynamicContentServiceByName(collection);

    // Create entry
    const created = await service.create(body.data, body.translations);

    return NextResponse.json(
      { data: created },
      { status: 201 }
    );
  } catch (error: any) {
    const { collection } = await params;
    console.error(`[API ${collection}] POST error:`, error);

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: { message: `Collection "${collection}" not found`, status: 404 } },
        { status: 404 }
      );
    }

    if (error.message.includes('Required field') || error.message.includes('Invalid')) {
      return NextResponse.json(
        { error: { message: error.message, status: 400 } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { message: error.message || 'Internal server error', status: 500 } },
      { status: 500 }
    );
  }
}

// ============ Helper Functions ============

function parseFilters(searchParams: URLSearchParams): Record<string, any> | undefined {
  const filters: Record<string, any> = {};
  let hasFilters = false;

  // Parse filters in format: filters[field][operator]=value
  // Example: filters[title][$contains]=test
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filters[')) {
      hasFilters = true;
      const match = key.match(/filters\[([^\]]+)\](\[([^\]]+)\])?/);
      if (match) {
        const field = match[1];
        const operator = match[3];

        if (operator) {
          // filters[field][$operator]=value
          if (!filters[field]) filters[field] = {};
          filters[field][operator] = parseValue(value);
        } else {
          // filters[field]=value (direct equality)
          filters[field] = parseValue(value);
        }
      }
    }
  }

  return hasFilters ? filters : undefined;
}

function parseValue(value: string): any {
  // Try to parse as JSON first (for arrays, objects)
  try {
    return JSON.parse(value);
  } catch {
    // Parse boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Parse number
    if (!isNaN(Number(value)) && value !== '') {
      return Number(value);
    }

    // Return as string
    return value;
  }
}
