import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/content-types - List all content types
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: contentTypes, error } = await supabase
      .from('content_types')
      .select('*')
      .order('display_name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get field counts for each content type
    const typesWithCounts = await Promise.all(
      contentTypes.map(async (type) => {
        const { count } = await supabase
          .from('content_type_fields')
          .select('*', { count: 'exact', head: true })
          .eq('content_type_id', type.id);

        return { ...type, field_count: count || 0 };
      })
    );

    return NextResponse.json({
      data: typesWithCounts,
      total: typesWithCounts.length,
    });
  } catch (error: any) {
    console.error('Error fetching content types:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content types' },
      { status: 500 }
    );
  }
}

// POST /api/content-types - Create a new content type
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      name,
      display_name,
      singular_name,
      description,
      icon,
      kind = 'collectionType',
      draftable = true,
      publishable = true,
      reviewable = false,
      settings = {},
    } = body;

    // Validate required fields
    if (!name || !display_name || !singular_name) {
      return NextResponse.json(
        { error: 'Missing required fields: name, display_name, singular_name' },
        { status: 400 }
      );
    }

    // Validate name format (lowercase, underscores only)
    if (!/^[a-z][a-z0-9_]*$/.test(name)) {
      return NextResponse.json(
        { error: 'Name must start with a letter and contain only lowercase letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('content_types')
      .insert([
        {
          name,
          display_name,
          singular_name,
          description,
          icon,
          kind,
          draftable,
          publishable,
          reviewable,
          settings,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique violation
        return NextResponse.json(
          { error: `Content type "${name}" already exists` },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating content type:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create content type' },
      { status: 500 }
    );
  }
}

// PUT /api/content-types - Update a content type
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('content_types')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Content type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error updating content type:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update content type' },
      { status: 500 }
    );
  }
}

// DELETE /api/content-types - Delete a content type
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // Check if there's any content using this type
    const { count } = await supabase
      .from('dynamic_content')
      .select('*', { count: 'exact', head: true })
      .eq('content_type_id', id);

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete content type: ${count} content entries exist. Delete the content entries first.`,
        },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from('content_types')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting content type:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete content type' },
      { status: 500 }
    );
  }
}
