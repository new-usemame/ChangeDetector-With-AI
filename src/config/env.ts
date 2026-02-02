import dotenv from 'dotenv';

dotenv.config();

export const config = {
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

if (!config.openrouter.apiKey) {
  throw new Error('OPENROUTER_API_KEY environment variable is required');
}
