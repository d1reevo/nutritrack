import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || 'file:./nutrition_tracker.db',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};

if (!config.geminiApiKey) {
  console.warn('⚠️  GEMINI_API_KEY не установлен. Функции ИИ не будут работать.');
}
