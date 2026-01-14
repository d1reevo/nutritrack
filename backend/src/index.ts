import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { requestLogger, errorHandler } from './middleware/errorHandler';

// Маршруты
import profileRoutes from './routes/profile';
import mealRoutes from './routes/meals';
import progressRoutes from './routes/progress';
import aiRoutes from './routes/ai';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Routes
app.use('/api/profile', profileRoutes);
app.use('/api/days', mealRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер работает' });
});

// Обработчик ошибок
app.use(errorHandler);

// Запуск сервера
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
  console.log(`📝 База данных: ${config.databaseUrl}`);
  if (!config.geminiApiKey) {
    console.warn('⚠️  GEMINI_API_KEY не установлен. ИИ функции не будут работать.');
  }
});

export default app;
