import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

import {
  getOpenAIClient,
  normalizeModel,
  parseResponsesText,
  sanitizeMaxOutputTokens,
  sanitizeTemperature,
} from '../openai-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for AI generation

function buildSystemMessage(contextType?: string) {
  switch (contextType) {
    case 'treatment_title':
      return 'You are a dental expert. Create professional, clear, and SEO-friendly treatment titles.';
    case 'treatment_subtitle':
      return 'You are a dental expert. Create engaging subtitles for dental treatments that complement the main title.';
    case 'treatment_description':
      return 'You are a dental expert. Write informative, patient-friendly descriptions about dental treatments. Focus on benefits and clarity.';
    case 'team_bio':
      return 'You are a professional copywriter. Write engaging and professional bios for dental team members.';
    case 'team_credentials':
      return 'You are a professional copywriter. List professional credentials, degrees, certifications, and memberships for dental professionals in a clear, organized format.';
    case 'faq_answer':
      return 'You are a dental expert. Provide clear, accurate, and helpful answers to frequently asked questions.';
    default:
      return 'You are a helpful assistant for a dental clinic website content management system.';
  }
}

function normalizePrompt(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      prompt,
      context,
      maxTokens = 500,
      temperature = 0.7,
      model,
    } = body;

    const trimmedPrompt = normalizePrompt(prompt);

    if (!trimmedPrompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    const normalizedModel = normalizeModel(model);
    const maxOutputTokens = sanitizeMaxOutputTokens(maxTokens, 500);
    const normalizedTemperature = sanitizeTemperature(temperature, 0.7);
    const systemMessage = buildSystemMessage(context?.type);

    const responsesResult = await openai.responses.create({
      model: normalizedModel,
      input: trimmedPrompt,
      instructions: systemMessage,
      temperature: normalizedTemperature,
      max_output_tokens: maxOutputTokens,
    });

    const generatedText = parseResponsesText(responsesResult);

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
        promptTokens: responsesResult.usage?.input_tokens || 0,
        completionTokens: responsesResult.usage?.output_tokens || 0,
        totalTokens:
          (responsesResult.usage?.input_tokens || 0) +
          (responsesResult.usage?.output_tokens || 0),
        endpoint: 'responses',
      },
      metadata: {
        model: normalizedModel,
        temperature: normalizedTemperature,
        maxOutputTokens,
      },
    });
  } catch (error) {
    console.error('AI text generation error:', error);

    if (error instanceof Error) {
      const apiError =
        typeof (error as any).error === 'object' ? (error as any).error : null;
      const details =
        apiError?.message ??
        (typeof (error as any).message === 'string'
          ? (error as any).message
          : null);

      return NextResponse.json(
        {
          error: `AI generation failed: ${error.message}`,
          details,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
