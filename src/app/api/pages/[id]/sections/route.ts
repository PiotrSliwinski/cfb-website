// API Route: /api/pages/[id]/sections
// GET - Get all sections for a page
// POST - Add a new section to a page
// PATCH - Reorder sections

import { NextRequest, NextResponse } from 'next/server';
import { pagesService } from '@/lib/api/pages-service';
import type { CreatePageSectionInput } from '@/types/pages';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sections = await pagesService.getPageSections(id);

    return NextResponse.json({ data: sections }, { status: 200 });
  } catch (error: any) {
    const { id } = await params;
    console.error(`[GET /api/pages/${id}/sections] Error:`, error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.section_type || !body.section_data) {
      return NextResponse.json(
        { error: 'Missing required fields: section_type, section_data' },
        { status: 400 }
      );
    }

    const input: CreatePageSectionInput = {
      page_id: pageId,
      section_type: body.section_type,
      section_data: body.section_data,
      display_order: body.display_order,
    };

    const section = await pagesService.addSection(input);

    return NextResponse.json({ data: section }, { status: 201 });
  } catch (error: any) {
    const { id } = await params;
    console.error(`[POST /api/pages/${id}/sections] Error:`, error);

    if (error.message.includes('Unknown section type')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to add section' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params;
    const body = await request.json();

    // Validate reorder payload
    if (!Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Invalid payload: sections must be an array' },
        { status: 400 }
      );
    }

    // Format: [{ junctionId: '...', order: 1 }, ...]
    const sectionOrders = body.sections.map((s: any, index: number) => ({
      junctionId: s.junctionId || s.id,
      order: s.order ?? index + 1,
    }));

    await pagesService.reorderSections(pageId, sectionOrders);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    const { id } = await params;
    console.error(`[PATCH /api/pages/${id}/sections] Error:`, error);

    return NextResponse.json(
      { error: error.message || 'Failed to reorder sections' },
      { status: 500 }
    );
  }
}
