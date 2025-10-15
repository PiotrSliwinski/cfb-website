// API Route: /api/pages/[id]/publish
// POST - Publish a page
// DELETE - Unpublish a page

import { NextRequest, NextResponse } from 'next/server';
import { pagesService } from '@/lib/api/pages-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = await pagesService.publishPage(id);

    return NextResponse.json({ data: page }, { status: 200 });
  } catch (error: any) {
    const { id } = await params;
    console.error(`[POST /api/pages/${id}/publish] Error:`, error);

    return NextResponse.json(
      { error: error.message || 'Failed to publish page' },
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

    const page = await pagesService.unpublishPage(id);

    return NextResponse.json({ data: page }, { status: 200 });
  } catch (error: any) {
    const { id } = await params;
    console.error(`[DELETE /api/pages/${id}/publish] Error:`, error);

    return NextResponse.json(
      { error: error.message || 'Failed to unpublish page' },
      { status: 500 }
    );
  }
}
