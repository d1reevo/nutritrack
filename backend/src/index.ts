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

// ✅ Настройка CORS
const allowedOrigins = [
  'https://nutritrack-frontend-dtq5.onrender.com', // твой фронтенд на Render
  'https://nutritrack-ye03.onrender.com',
  'http://localhost:5173',                         // на будущее для локальной разработки
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Разрешаем запросы без Origin (например, от curl/Postman)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Если источник не в списке — отклоняем
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// отдельно обрабатываем preflight-запросы
app.options('*', cors());

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
