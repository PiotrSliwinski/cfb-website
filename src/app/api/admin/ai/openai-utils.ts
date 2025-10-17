import OpenAI from 'openai';

export const DEFAULT_GPT_MODEL = 'gpt-5-mini';
export const GPT_MODEL_METADATA = [
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    description: 'Fast & lightweight',
  },
  {
    id: 'gpt-5',
    name: 'GPT-5',
    description: 'Balanced performance',
  },
  {
    id: 'gpt-5-pro',
    name: 'GPT-5 Pro',
    description: 'Advanced reasoning',
  },
] as const;

const MODEL_ALIASES: Record<string, string> = {
  'gpt-5-mini': 'gpt-5-mini',
  'gpt5-mini': 'gpt-5-mini',
  'gpt-5-mini-latest': 'gpt-5-mini',
  'gpt-5-thinking-nano': 'gpt-5-mini',
  'gpt-5-main': 'gpt-5',
  'gpt5-main': 'gpt-5',
  'gpt-5': 'gpt-5',
  'gpt5': 'gpt-5',
  'gpt-5-pro': 'gpt-5-pro',
  'gpt5-pro': 'gpt-5-pro',
  'gpt-5-thinking': 'gpt-5-pro',
};

const MAX_OUTPUT_TOKENS_LIMIT = 4096;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  return new OpenAI({ apiKey });
}

function resolveModelAlias(model: unknown): string | null {
  if (typeof model !== 'string') {
    return null;
  }

  const trimmed = model.trim();
  if (!trimmed) {
    return null;
  }

  const alias = MODEL_ALIASES[trimmed.toLowerCase()];
  return alias ?? null;
}

export function normalizeModel(model: unknown): string {
  return resolveModelAlias(model) ?? DEFAULT_GPT_MODEL;
}

export function resolveCanonicalModel(model: unknown): string | null {
  return resolveModelAlias(model);
}

export function sanitizeMaxOutputTokens(value: unknown, fallback: number): number {
  const fallbackValue = Number.isFinite(fallback) ? Math.max(1, Math.floor(fallback)) : 1;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return clampInt(value);
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return clampInt(parsed);
    }
  }

  return fallbackValue;
}

function clampInt(input: number) {
  return Math.max(1, Math.min(MAX_OUTPUT_TOKENS_LIMIT, Math.floor(input)));
}

export function sanitizeTemperature(value: unknown, fallback: number): number {
  const fallbackValue =
    typeof fallback === 'number' && Number.isFinite(fallback) ? clampTemperature(fallback) : 0.7;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return clampTemperature(value);
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return clampTemperature(parsed);
    }
  }

  return fallbackValue;
}

function clampTemperature(value: number) {
  if (!Number.isFinite(value)) {
    return 0.7;
  }
  const clamped = Math.max(0, Math.min(2, value));
  return Math.round(clamped * 100) / 100;
}

export type BasicChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export function buildResponseInputFromMessages(messages: BasicChatMessage[]) {
  return messages
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
      type: 'message' as const,
    }))
    .filter((item) => item.content.length > 0);
}

export function parseResponsesText(response: OpenAI.ResponsesResponse): string {
  if (typeof response.output_text === 'string' && response.output_text.trim().length > 0) {
    return response.output_text.trim();
  }

  const text = response.output
    ?.flatMap((item) => {
      if (item.type === 'output_text' && 'text' in item) {
        return item.text;
      }
      if (item.type === 'message' && Array.isArray(item.content)) {
        return item.content
          .filter((contentItem) => contentItem.type === 'output_text' && 'text' in contentItem)
          .map((contentItem) => contentItem.text);
      }
      return [];
    })
    .join('\n')
    .trim();

  return text || '';
}
