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
  try {
    const openai = getOpenAIClient();
    const models = await openai.models.list();

    // Filter for chat models only
    const chatModels = models.data
      .filter((model) => model.id.includes('gpt'))
      .map((model) => {
        // Add friendly names and descriptions
        let name = model.id;
        let description = '';

        if (model.id === 'gpt-4o-mini') {
          name = 'GPT-4o Mini';
          description = 'Fast & affordable';
        } else if (model.id === 'gpt-4o') {
          name = 'GPT-4o';
          description = 'Balanced performance';
        } else if (model.id.includes('gpt-4-turbo')) {
          name = 'GPT-4 Turbo';
          description = 'High quality';
        } else if (model.id.includes('gpt-4')) {
          name = 'GPT-4';
          description = 'Most capable';
        } else if (model.id.includes('gpt-3.5')) {
          name = 'GPT-3.5 Turbo';
          description = 'Cheapest';
        }

        return {
          id: model.id,
          name,
          description,
        };
      })
      .sort((a, b) => {
        // Sort by preference: 4o-mini, 4o, 4-turbo, 4, 3.5
        const order = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5'];
        const aIndex = order.findIndex((o) => a.id.includes(o));
        const bIndex = order.findIndex((o) => b.id.includes(o));
        return aIndex - bIndex;
      });

    return NextResponse.json({ models: chatModels });
  } catch (error) {
    console.error('Models API error:', error);

    // Return fallback models if API fails
    return NextResponse.json({
      models: [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast & affordable' },
        { id: 'gpt-4o', name: 'GPT-4o', description: 'Balanced performance' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High quality' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Cheapest' },
      ],
    });
  }
}
