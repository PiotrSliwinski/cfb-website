import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazy-load OpenAI client to avoid build-time initialization
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
}

export async function GET() {
  // Return 2 models: Default (GPT-4o Mini) and Premium (GPT-4o)
  const chatModels = [
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Default'
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: 'Premium'
    },
  ];

  return NextResponse.json({ models: chatModels });
}
