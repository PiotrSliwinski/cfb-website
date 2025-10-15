import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/content-types/[id] - Get a specific content type with fields
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get content type
    const { data: contentType, error: typeError } = await supabase
      .from('content_types')
      .select('*')
      .eq('id', id)
      .single();

    if (typeError || !contentType) {
      return NextResponse.json(
        { error: 'Content type not found' },
        { status: 404 }
      );
    }

    // Get fields
    const { data: fields, error: fieldsError } = await supabase
      .from('content_type_fields')
      .select('*')
      .eq('content_type_id', id)
      .order('display_order');

    if (fieldsError) {
      return NextResponse.json({ error: fieldsError.message }, { status: 500 });
    }

    // Get relations
    const { data: relations, error: relationsError } = await supabase
      .from('content_type_relations')
      .select('*')
      .or(`source_content_type_id.eq.${id},target_content_type_id.eq.${id}`);

    if (relationsError) {
      return NextResponse.json(
        { error: relationsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: contentType,
      fields: fields || [],
      relations: relations || [],
    });
  } catch (error: any) {
    console.error('Error fetching content type:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content type' },
      { status: 500 }
    );
  }
}
