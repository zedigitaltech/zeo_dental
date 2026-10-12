import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { ChatRequest, ChatResponse } from '../types.js';
import {
  GEMINI_API_URL,
  SYSTEM_INSTRUCTION,
  getLanguageInstruction,
  getInitialGreeting,
  calculateCost,
} from '../utils/chatPrompt.js';
import type { GeminiResponse } from '../utils/chatPrompt.js';

// Retry with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status < 500) {
        return response;
      }
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }

    // Exponential backoff: 1s, 2s, 4s
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Body: ChatRequest;
    Reply: ChatResponse;
  }>(
    '/chat',
    {
      config: {
        rateLimit: {
          max: 15,
          timeWindow: '1 minute',
        },
      },
    },
    async (request: FastifyRequest<{ Body: ChatRequest }>, reply: FastifyReply) => {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        fastify.log.error('GEMINI_API_KEY not configured');
        return reply.status(500).send({
          response: '',
          error: 'Chat service is not configured. Please contact support.',
        });
      }

      const { message, history = [], language = 'sq' } = request.body;

      // Validate language parameter to prevent prompt injection
      const validLanguages = ['sq', 'en', 'it', 'de', 'fr', 'tr', 'el', 'es'];
      const safeLang = validLanguages.includes(language) ? language : 'en';

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return reply.status(400).send({
          response: '',
          error: 'Message is required',
        });
      }

      // Limit message length to prevent token abuse
      if (message.length > 5000) {
        return reply.status(400).send({
          response: '',
          error: 'Message is too long. Please keep it under 5000 characters.',
        });
      }

      // Language-specific instruction (using validated language)
      const languageInstruction = getLanguageInstruction(safeLang);

      // Initial greeting based on language
      const initialGreeting = getInitialGreeting(safeLang);

      // Build conversation contents
      const contents = [
        // System instruction as first user message (Gemini pattern)
        {
          role: 'user',
          parts: [{ text: `System: ${SYSTEM_INSTRUCTION}\n\n${languageInstruction}` }],
        },
        {
          role: 'model',
          parts: [{ text: initialGreeting }],
        },
        // Add conversation history
        ...history,
        // Current message
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      try {
        const response = await fetchWithRetry(`${GEMINI_API_URL}?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.5,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          fastify.log.error(`Gemini API error: ${response.status} - ${errorText}`);
          return reply.status(response.status).send({
            response: '',
            error: 'Failed to get response from AI. Please try again.',
          });
        }

        const data = (await response.json()) as GeminiResponse;
        const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
          fastify.log.error('Empty response from Gemini API: %j', data);
          return reply.status(500).send({
            response: '',
            error: 'Received empty response from AI. Please try again.',
          });
        }

        // Log usage to database (non-blocking)
        if (data.usageMetadata && fastify.pg) {
          const {
            promptTokenCount = 0,
            candidatesTokenCount = 0,
            totalTokenCount = 0,
          } = data.usageMetadata;
          const estimatedCost = calculateCost(promptTokenCount, candidatesTokenCount);

          fastify.pg
            .query(
              `INSERT INTO chat_usage (input_tokens, output_tokens, total_tokens, estimated_cost, language)
           VALUES ($1, $2, $3, $4, $5)`,
              [promptTokenCount, candidatesTokenCount, totalTokenCount, estimatedCost, language]
            )
            .catch(err => {
              fastify.log.error(
                'Failed to log chat usage: %s',
                err instanceof Error ? err.message : String(err)
              );
            });
        }

        return reply.send({ response: aiResponse });
      } catch (err) {
        fastify.log.error('Chat error: %s', err instanceof Error ? err.message : String(err));
        return reply.status(500).send({
          response: '',
          error: 'An error occurred. Please try again later.',
        });
      }
    }
  );
}
