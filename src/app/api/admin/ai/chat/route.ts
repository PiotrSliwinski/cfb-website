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

    // Create a streaming response
    const stream = await openai.responses.create({
      model: normalizedModel,
      input: payload,
      max_output_tokens: maxOutputTokens,
      stream: true,
    });

    // Create a ReadableStream for Server-Sent Events (SSE)
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';

          for await (const chunk of stream) {
            // Extract text based on chunk type
            let chunkText = '';

            // Handle delta chunks (incremental text)
            if (chunk.type === 'response.output_text.delta' && chunk.delta) {
              chunkText = chunk.delta;
            }
            // Handle done chunk (final complete text)
            else if (chunk.type === 'response.output_text.done' && chunk.text) {
              fullText = chunk.text; // Use the complete text
              const data = JSON.stringify({ text: fullText });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              continue;
            }

            // Accumulate delta text
            if (chunkText) {
              fullText += chunkText;
              // Send the full accumulated text so far
              const data = JSON.stringify({ text: fullText });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // Send completion signal
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({
            error: error instanceof Error ? error.message : 'Streaming failed'
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
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
