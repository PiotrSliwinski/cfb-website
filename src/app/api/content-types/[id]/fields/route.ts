import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/content-types/[id]/fields - Add a field
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: contentTypeId } = await params;
    const body = await request.json();

    const {
      name,
      display_name,
      type,
      required = false,
      unique = false,
      translatable = false,
      placeholder,
      help_text,
      default_value,
      display_order = 0,
      visible_in_list = true,
      visible_in_form = true,
      options = {},
      validation = {},
    } = body;

    // Validate required fields
    if (!name || !display_name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, display_name, type' },
        { status: 400 }
      );
    }

    // Validate field name format
    if (!/^[a-z][a-z0-9_]*$/.test(name)) {
      return NextResponse.json(
        { error: 'Field name must start with a letter and contain only lowercase letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    // Check if field name already exists
    const { data: existing } = await supabase
      .from('content_type_fields')
      .select('id')
      .eq('content_type_id', contentTypeId)
      .eq('name', name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: `Field "${name}" already exists` },
        { status: 409 }
      );
    }

    // Insert field
    const { data, error } = await supabase
      .from('content_type_fields')
      .insert({
        content_type_id: contentTypeId,
        name,
        display_name,
        type,
        required,
        unique,
        translatable,
        placeholder,
        help_text,
        default_value,
        display_order,
        visible_in_list,
        visible_in_form,
        options,
        ...validation,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating field:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create field' },
      { status: 500 }
    );
  }
}

// POST /api/content-types/[id]/fields/reorder - Reorder fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: contentTypeId } = await params;
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates must be an array' },
        { status: 400 }
      );
    }

    // Update each field's display_order
    const promises = updates.map(({ id, display_order }: any) =>
      supabase
        .from('content_type_fields')
        .update({ display_order })
        .eq('id', id)
        .eq('content_type_id', contentTypeId)
    );

    await Promise.all(promises);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error reordering fields:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reorder fields' },
      { status: 500 }
    );
  }
}
