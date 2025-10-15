// API Route: /api/pages/[id]/sections/[sectionId]
// PUT - Update a section
// DELETE - Delete a section

import { NextRequest, NextResponse } from 'next/server';
import { pagesService } from '@/lib/api/pages-service';
import type { SectionType } from '@/types/pages';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { sectionId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.section_type) {
      return NextResponse.json(
        { error: 'Missing required field: section_type' },
        { status: 400 }
      );
    }

    const sectionType = body.section_type as SectionType;
    const updates = body.section_data || body;

    const section = await pagesService.updateSection(
      sectionId,
      sectionType,
      updates
    );

    return NextResponse.json({ data: section }, { status: 200 });
  } catch (error: any) {
    const { id, sectionId } = await params;
    console.error(
      `[PUT /api/pages/${id}/sections/${sectionId}] Error:`,
      error
    );

    if (error.message.includes('Unknown section type')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update section' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { sectionId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const sectionType = searchParams.get('section_type') as SectionType;

    // Validate required field
    if (!sectionType) {
      return NextResponse.json(
        { error: 'Missing required query parameter: section_type' },
        { status: 400 }
      );
    }

    await pagesService.deleteSection(sectionId, sectionType);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    const { id, sectionId } = await params;
    console.error(
      `[DELETE /api/pages/${id}/sections/${sectionId}] Error:`,
      error
    );

    if (error.message.includes('Unknown section type')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete section' },
      { status: 500 }
    );
  }
}
