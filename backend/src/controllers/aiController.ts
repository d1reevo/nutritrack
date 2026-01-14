import { Request, Response } from 'express';
import prisma from '../db/client';
import { AIService } from '../services/aiService';

/**
 * Контроллер для ИИ функций
 */
export class AIController {
  /**
   * GET /api/progress/summary - получить последнюю сохранённую общую оценку
   */
  static async getProgressSummary(req: Request, res: Response) {
    try {
      const profile = await prisma.userProfile.findFirst();
      if (!profile) {
        return res.status(404).json({ error: 'Профиль не найден' });
      }

      const cache = await prisma.progressSummaryCache.findUnique({
        where: { userProfileId: profile.id },
      });

      if (!cache) {
        return res.status(404).json({ error: 'Оценка прогресса не вычислена' });
      }

      const details = cache.detailsJson ? JSON.parse(cache.detailsJson) : {};

      res.json({
        id: cache.id,
        lastComputedAt: cache.lastComputedAt,
        summaryText: cache.summaryText,
        overallScore: cache.overallScore,
        details,
        createdAt: cache.createdAt,
      });
    } catch (error) {
      console.error('Ошибка получения сводки прогресса:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * POST /api/ai/recompute-progress - пересчитать общую оценку прогресса
   */
  static async recomputeProgress(req: Request, res: Response) {
    try {
      const profile = await prisma.userProfile.findFirst();
      if (!profile) {
        return res.status(404).json({ error: 'Профиль не найден' });
      }

      // Получаем все дни пользователя
      const days = await prisma.day.findMany({
        where: { userProfileId: profile.id },
        orderBy: { date: 'asc' },
      });

      if (days.length === 0) {
        return res.status(400).json({ error: 'Нет данных для анализа' });
      }

      // Считаем статистику
      const averageCalories = days.length > 0
        ? days.reduce((sum, d) => sum + d.totalCalories, 0) / days.length
        : 0;

      const daysWithinTarget = days.filter(
        d => Math.abs(d.totalCalories - d.calorieTargetForDay) <= 200
      ).length;

      // Получаем первое и последнее измерение
      const measurements = await prisma.bodyMeasurement.findMany({
        where: { userProfileId: profile.id },
        orderBy: { date: 'asc' },
      });

      const startWeight = measurements.length > 0 ? measurements[0].weightKg : profile.weightKg;
      const currentWeight = measurements.length > 0
        ? measurements[measurements.length - 1].weightKg
        : profile.weightKg;

      // Получаем геймификацию
      const gamification = await prisma.gamificationState.findUnique({
        where: { userProfileId: profile.id },
      });

      const achievements = gamification?.achievementsJson
        ? JSON.parse(gamification.achievementsJson)
        : [];

      // Генерируем оценку через ИИ
      const progressData = {
        startDate: days[0].date,
        startWeight,
        currentWeight,
        targetWeight: profile.targetWeightKg,
        averageCalories,
        daysWithinTarget,
        totalDays: days.length,
        streak: gamification?.currentStreakDays || 0,
        level: gamification?.level || 1,
        xp: gamification?.xp || 0,
        achievements,
      };

      const aiSummary = await AIService.generateProgressSummary(progressData);

      // Сохраняем в кеш
      const cache = await prisma.progressSummaryCache.findUnique({
        where: { userProfileId: profile.id },
      });

      const details = {
        averageDailyCalories: Math.round(averageCalories),
        daysWithinTarget,
        totalDays: days.length,
        weightProgress: {
          startWeight,
          currentWeight,
          targetWeight: profile.targetWeightKg,
          progressPercent: ((startWeight - currentWeight) / (startWeight - profile.targetWeightKg) * 100).toFixed(1),
        },
        strengths: aiSummary.strengths,
        areasToImprove: aiSummary.areasToImprove,
      };

      if (cache) {
        // Обновляем кеш
        const updated = await prisma.progressSummaryCache.update({
          where: { id: cache.id },
          data: {
            lastComputedAt: new Date(),
            summaryText: aiSummary.summaryText,
            overallScore: aiSummary.overallScore,
            detailsJson: JSON.stringify(details),
          },
        });

        return res.json({
          id: updated.id,
          lastComputedAt: updated.lastComputedAt,
          summaryText: updated.summaryText,
          overallScore: updated.overallScore,
          details,
        });
      }

      // Создаём новый кеш
      const newCache = await prisma.progressSummaryCache.create({
        data: {
          userProfileId: profile.id,
          lastComputedAt: new Date(),
          summaryText: aiSummary.summaryText,
          overallScore: aiSummary.overallScore,
          detailsJson: JSON.stringify(details),
        },
      });

      res.json({
        id: newCache.id,
        lastComputedAt: newCache.lastComputedAt,
        summaryText: newCache.summaryText,
        overallScore: newCache.overallScore,
        details,
      });
    } catch (error) {
      console.error('Ошибка пересчёта прогресса:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * GET /api/ai/daily-quest - получить ежедневное мини-задание
   */
  static async getDailyQuest(req: Request, res: Response) {
    const defaultQuests = [
      'Выпей 8 стаканов воды сегодня',
      'Добавь овощи в один из приёмов пищи',
      'Съешь фрукт на полдник',
      'Попробуй новый полезный продукт',
      'Завтракай в течение часа после пробуждения',
    ];
    
    try {
      const quest = await AIService.generateDailyQuest();

      res.json({
        quest,
        generatedAt: new Date(),
      });
    } catch (error) {
      console.error('Контроллер: Ошибка генерации квеста, используем fallback');
      // Возвращаем fallback вместо ошибки 500
      res.json({
        quest: defaultQuests[Math.floor(Math.random() * defaultQuests.length)],
        generatedAt: new Date(),
      });
    }
  }
}
