import { NextRequest, NextResponse } from 'next/server';

import {
  type BasicChatMessage,
  buildResponseInputFromMessages,
  getOpenAIClient,
  normalizeModel,
  parseResponsesText,
  sanitizeMaxOutputTokens,
  sanitizeTemperature,
} from '../openai-utils';

const DEFAULT_MAX_OUTPUT_TOKENS = 1000;
const DEFAULT_TEMPERATURE = 0.7;

function buildSystemMessage() {
  return 'You are a helpful AI assistant for a dental clinic website content management system. Help users with content creation, editing, and questions about their website content. Be concise, professional, and helpful.';
}

function normalizeChatHistory(rawMessages: unknown): BasicChatMessage[] {
  if (!Array.isArray(rawMessages)) {
    return [];
  }

  return rawMessages
    .map((message) => {
      if (!message || typeof message !== 'object') {
        return null;
      }

      const { role, content } = message as { role?: unknown; content?: unknown };

      if (typeof content !== 'string') {
        return null;
      }

      const trimmedContent = content.trim();
      if (!trimmedContent) {
        return null;
      }

      const normalizedRole =
        role === 'assistant' || role === 'system' ? role : 'user';

      return {
        role: normalizedRole,
        content: trimmedContent,
      };
    })
    .filter((message): message is BasicChatMessage => Boolean(message));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      model,
      maxTokens = DEFAULT_MAX_OUTPUT_TOKENS,
      temperature = DEFAULT_TEMPERATURE,
    } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    const normalizedModel = normalizeModel(model);
    const maxOutputTokens = sanitizeMaxOutputTokens(maxTokens, DEFAULT_MAX_OUTPUT_TOKENS);
    const normalizedTemperature = sanitizeTemperature(temperature, DEFAULT_TEMPERATURE);

    const conversation = normalizeChatHistory(messages);
    const payload = buildResponseInputFromMessages([
      {
        role: 'system',
        content: buildSystemMessage(),
      },
      ...conversation,
    ]);

    const responsesResult = await openai.responses.create({
      model: normalizedModel,
      input: payload,
      max_output_tokens: maxOutputTokens,
      temperature: normalizedTemperature,
    });

    const responseText = parseResponsesText(responsesResult);

    if (!responseText) {
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response: responseText,
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
    console.error('Chat API error:', error);

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
          error: 'Failed to get AI response',
          details,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
