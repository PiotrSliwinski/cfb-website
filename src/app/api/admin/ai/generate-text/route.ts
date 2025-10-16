import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for AI generation

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { prompt, context, maxTokens = 500, temperature = 0.7, model = 'gpt-4o-mini' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Build system message based on context
    let systemMessage = 'You are a helpful assistant for a dental clinic website content management system.';

    if (context?.type === 'treatment_title') {
      systemMessage = 'You are a dental expert. Create professional, clear, and SEO-friendly treatment titles in Portuguese.';
    } else if (context?.type === 'treatment_description') {
      systemMessage = 'You are a dental expert. Write informative, patient-friendly descriptions about dental treatments in Portuguese. Focus on benefits and clarity.';
    } else if (context?.type === 'team_bio') {
      systemMessage = 'You are a professional copywriter. Write engaging and professional bios for dental team members in Portuguese.';
    } else if (context?.type === 'faq_answer') {
      systemMessage = 'You are a dental expert. Provide clear, accurate, and helpful answers to frequently asked questions in Portuguese.';
    }

    // Generate text using selected model
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      n: 1,
    });

    const generatedText = completion.choices[0]?.message?.content || '';

    if (!generatedText) {
      return NextResponse.json(
        { error: 'Failed to generate text' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      text: generatedText,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error('AI text generation error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `AI generation failed: ${error.message}` },
        { status: 500 }
      );
Event    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
