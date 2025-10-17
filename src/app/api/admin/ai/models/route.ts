import { NextResponse } from 'next/server';

import {
  GPT_MODEL_METADATA,
  getOpenAIClient,
  resolveCanonicalModel,
} from '../openai-utils';

export async function GET() {
  try {
    const openai = getOpenAIClient();
    const { data } = await openai.models.list();

    const availableModels = new Set<string>();

    for (const model of data) {
      const canonical = resolveCanonicalModel(model.id);
      if (canonical) {
        availableModels.add(canonical);
      }
    }

    const models = GPT_MODEL_METADATA.map(({ id, name, description }) => ({
      id,
      name,
      description,
      available: availableModels.has(id),
    }));

    const availableCount = models.filter((model) => model.available).length;
    let warning: string | undefined;

    if (availableCount === 0) {
      warning = 'No GPT-5 models were returned for this API key.';
    } else if (availableCount < GPT_MODEL_METADATA.length) {
      const missing = models
        .filter((model) => !model.available)
        .map((model) => model.name);
      warning = `Some GPT-5 models are unavailable for this API key (${missing.join(', ')}).`;
    }

    return NextResponse.json(
      warning ? { models, warning } : { models }
    );
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return NextResponse.json(
      {
        error: 'Failed to load models from OpenAI',
        models: [
          {
            id: 'gpt-5-mini',
            name: 'GPT-5 Mini',
            description: 'Default (error fallback)',
          },
        ],
      },
      { status: 500 }
    );
  }
}
