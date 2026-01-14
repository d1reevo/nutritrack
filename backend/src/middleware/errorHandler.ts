import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для обработки ошибок
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Ошибка:', err);

  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    message: err.message,
  });
}

/**
 * Middleware для логирования запросов
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}
