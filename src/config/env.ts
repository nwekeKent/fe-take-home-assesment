import { z } from 'zod';

const envSchema = z.object({
  APP_BASE_PATH: z.string().default('/'),
  MOCK_API: z.string().optional()
});

export const env = envSchema.parse({
  APP_BASE_PATH: import.meta.env.VITE_APP_BASE_PATH || '/',
  MOCK_API: import.meta.env.VITE_MOCK_API
});
