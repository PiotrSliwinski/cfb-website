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
  // Return 2 models: Default (GPT-5 Mini) and Premium (GPT-5)
  const chatModels = [
    {
      id: 'gpt-5-mini',
      name: 'GPT-5 Mini',
      description: 'Default'
    },
    {
      id: 'gpt-5',
      name: 'GPT-5',
      description: 'Premium'
    },
  ];

  return NextResponse.json({ models: chatModels });
}
