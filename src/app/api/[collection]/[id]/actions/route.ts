/**
 * Dynamic API Route Handler - Document Actions
 * Handles special actions on entries (publish, unpublish, etc.)
 *
 * Routes:
 * POST /api/blog-posts/123/actions → Execute action
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDynamicContentServiceByName } from '@/lib/api/dynamic-content-service';
import type { ContentStatus } from '@/types/dynamic-content';

/**
 * POST /api/[collection]/[id]/actions - Execute an action
 * Body: { action: 'publish' | 'unpublish' | 'archive' }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const body = await request.json();

    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: { message: 'Missing "action" in request body', status: 400 } },
        { status: 400 }
      );
    }

    // Create service for this content type
    const service = await createDynamicContentServiceByName(collection);

    let status: ContentStatus;

    switch (action) {
      case 'publish':
        status = 'published';
        break;
      case 'unpublish':
        status = 'draft';
        break;
      case 'archive':
        status = 'archived';
        break;
      default:
        return NextResponse.json(
          { error: { message: `Unknown action: ${action}`, status: 400 } },
          { status: 400 }
        );
    }

    // Update status
    const updated = await service.setStatus(id, status);

    return NextResponse.json({
      data: updated,
      meta: { action, status },
    });
  } catch (error: any) {
    const { collection, id } = await params;
    console.error(`[API ${collection}/${id}/actions] POST error:`, error);

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
