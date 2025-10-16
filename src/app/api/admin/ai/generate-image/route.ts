import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for image generation

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
    const { prompt, size = '1024x1024', quality = 'standard', style = 'natural', model = 'dall-e-3' } = body;

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

    // Generate image using selected model
    const imageResponse = await openai.images.generate({
      model: model as 'dall-e-2' | 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size as '1024x1024' | '1792x1024' | '1024x1792',
      quality: quality as 'standard' | 'hd',
      style: style as 'natural' | 'vivid',
    });

    const imageUrl = imageResponse.data[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    // Download the generated image
    const imageDownloadResponse = await fetch(imageUrl);
    if (!imageDownloadResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to download generated image' },
        { status: 500 }
      );
    }

    const imageBuffer = await imageDownloadResponse.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `ai-generated-${timestamp}-${randomString}.png`;

    // Determine storage path
    const bucket = body.bucket || 'general';
    const storagePath = `${bucket}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(storagePath, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to save image: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: storagePath,
      fileName,
      revisedPrompt: imageResponse.data[0]?.revised_prompt || prompt,
    });
  } catch (error) {
    console.error('AI image generation error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `AI generation failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
