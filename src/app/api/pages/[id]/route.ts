// API Route: /api/pages/[id]
// GET - Get a single page with sections
// PUT - Update a page
// DELETE - Delete a page

import { NextRequest, NextResponse } from 'next/server';
import { pagesService } from '@/lib/api/pages-service';
import type { UpdatePageInput } from '@/types/pages';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const populate = searchParams.get('populate') !== 'false';

    const page = await pagesService.findPage(id, populate);

    return NextResponse.json({ data: page }, { status: 200 });
  } catch (error: any) {
    const { id } = await params;
    console.error(`[GET /api/pages/${id}] Error:`, error);

    if (error.message === 'Page not found') {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdatePageInput = await request.json();

    // Validate slug format if provided
    if (body.slug && !/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const page = await pagesService.updatePage(id, body);

    return NextResponse.json({ data: page }, { status: 200 });
  } catch (error: any) {
    const { id } = await params;
    console.error(`[PUT /api/pages/${id}] Error:`, error);

    // Handle duplicate slug error
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update page' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await pagesService.deletePage(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    const { id } = await params;
    console.error(`[DELETE /api/pages/${id}] Error:`, error);

    return NextResponse.json(
      { error: error.message || 'Failed to delete page' },
      { status: 500 }
    );
  }
}
