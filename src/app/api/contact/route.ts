import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const supabase = await createClient();

    const { error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          treatment_interest: data.treatment_interest,
          language_code: data.language_code,
          status: 'new',
        },
      ]);

    if (error) {
      console.error('Error saving contact submission:', error);
      return NextResponse.json(
        { error: 'Failed to submit contact form' },
        { status: 500 }
      );
    }

    // TODO: Send email notification here
    // You can use Resend, SendGrid, or another email service

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
