import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PUT /api/content-types/[id]/fields/[fieldId] - Update a field
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: contentTypeId, fieldId } = await params;
    const body = await request.json();

    const {
      display_name,
      required,
      unique,
      translatable,
      placeholder,
      help_text,
      default_value,
      visible_in_list,
      visible_in_form,
      options,
      validation,
    } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (display_name !== undefined) updateData.display_name = display_name;
    if (required !== undefined) updateData.required = required;
    if (unique !== undefined) updateData.unique = unique;
    if (translatable !== undefined) updateData.translatable = translatable;
    if (placeholder !== undefined) updateData.placeholder = placeholder;
    if (help_text !== undefined) updateData.help_text = help_text;
    if (default_value !== undefined) updateData.default_value = default_value;
    if (visible_in_list !== undefined) updateData.visible_in_list = visible_in_list;
    if (visible_in_form !== undefined) updateData.visible_in_form = visible_in_form;
    if (options !== undefined) updateData.options = options;

    if (validation) {
      if (validation.min_length !== undefined) updateData.min_length = validation.min_length;
      if (validation.max_length !== undefined) updateData.max_length = validation.max_length;
      if (validation.min_value !== undefined) updateData.min_value = validation.min_value;
      if (validation.max_value !== undefined) updateData.max_value = validation.max_value;
      if (validation.regex_pattern !== undefined) updateData.regex_pattern = validation.regex_pattern;
    }

    const { data, error } = await supabase
      .from('content_type_fields')
      .update(updateData)
      .eq('id', fieldId)
      .eq('content_type_id', contentTypeId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error updating field:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update field' },
      { status: 500 }
    );
  }
}

// DELETE /api/content-types/[id]/fields/[fieldId] - Delete a field
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: contentTypeId, fieldId } = await params;

    const { error } = await supabase
      .from('content_type_fields')
      .delete()
      .eq('id', fieldId)
      .eq('content_type_id', contentTypeId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting field:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete field' },
      { status: 500 }
    );
  }
}
