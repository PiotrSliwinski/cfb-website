/**
 * Dynamic API Route Handler - Single Document Operations
 * Handles operations on individual entries
 *
 * Routes:
 * GET    /api/blog-posts/123           → Get one
 * PUT    /api/blog-posts/123           → Update
 * DELETE /api/blog-posts/123           → Delete
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDynamicContentServiceByName } from '@/lib/api/dynamic-content-service';

/**
 * GET /api/[collection]/[id] - Get a single entry
 * GET /api/[collection]/[id]?populate=author,categories
 * GET /api/[collection]/[id]?locale=pt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Create service for this content type
    const service = await createDynamicContentServiceByName(collection);

    // Parse query parameters
    const queryParams = {
      populate: searchParams.get('populate')?.split(','),
      locale: searchParams.get('locale') || 'en',
      publicationState: searchParams.get('publicationState') as 'live' | 'preview' | undefined,
    };

    // Find entry
    const entry = await service.findOne(id, queryParams);

    if (!entry) {
      return NextResponse.json(
        { error: { message: 'Entry not found', status: 404 } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: entry });
  } catch (error: any) {
    const { collection, id } = await params;
    console.error(`[API ${collection}/${id}] GET error:`, error);

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: { message: error.message, status: 404 } },
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
 * PUT /api/[collection]/[id] - Update an entry
 * Body: { data: { ...fields }, translations: [{ language_code: 'pt', data: {...} }] }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
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

    // Update entry
    const updated = await service.update(id, body.data, body.translations);

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    const { collection, id } = await params;
    console.error(`[API ${collection}/${id}] PUT error:`, error);

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: { message: 'Entry not found', status: 404 } },
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

/**
 * DELETE /api/[collection]/[id] - Delete an entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;

    // Create service for this content type
    const service = await createDynamicContentServiceByName(collection);

    // Delete entry
    await service.delete(id);

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const { collection, id } = await params;
    console.error(`[API ${collection}/${id}] DELETE error:`, error);

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: { message: 'Entry not found', status: 404 } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: { message: error.message || 'Internal server error', status: 500 } },
      { status: 500 }
    );
  }
}
