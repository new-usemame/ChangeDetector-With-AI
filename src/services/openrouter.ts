import { config } from '../config/env';
import { logger } from '../utils/logger';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private apiKey: string;
  private defaultModel: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = config.openrouter.apiKey;
    this.defaultModel = config.openrouter.model;
  }

  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const model = options.model || this.defaultModel;
    const url = `${this.baseUrl}/chat/completions`;

    const requestBody = {
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
    };

    try {
      logger.debug(`Calling OpenRouter API with model: ${model}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.RAILWAY_PUBLIC_DOMAIN || 'https://railway.app',
          'X-Title': 'AI Wrapper for changedetection.io',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`OpenRouter API error: ${response.status} - ${errorText}`);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as ChatCompletionResponse;
      
      if (data.usage) {
        logger.debug(`OpenRouter usage: ${data.usage.total_tokens} tokens`);
      }

      return data;
    } catch (error) {
      logger.error('Error calling OpenRouter API:', error);
      throw error;
    }
  }

  async extractText(messages: ChatMessage[], model?: string): Promise<string> {
    const response = await this.chatCompletion({ messages, model });
    
    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response from OpenRouter API');
    }

    return response.choices[0].message.content;
  }
}

export const openRouterService = new OpenRouterService();
