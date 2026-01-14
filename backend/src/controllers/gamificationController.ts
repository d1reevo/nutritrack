import { Request, Response } from 'express';
import prisma from '../db/client';

/**
 * Контроллер геймификации
 */
export class GamificationController {
  /**
   * GET /api/gamification - получить текущий статус геймификации
   */
  static async getGamification(req: Request, res: Response) {
    try {
      const profile = await prisma.userProfile.findFirst();
      if (!profile) {
        return res.status(404).json({ error: 'Профиль не найден' });
      }

      const gamification = await prisma.gamificationState.findUnique({
        where: { userProfileId: profile.id },
      });

      if (!gamification) {
        return res.status(404).json({ error: 'Геймификация не найдена' });
      }

      const achievements = gamification.achievementsJson
        ? JSON.parse(gamification.achievementsJson)
        : [];

      res.json({
        id: gamification.id,
        currentStreakDays: gamification.currentStreakDays,
        longestStreakDays: gamification.longestStreakDays,
        xp: gamification.xp,
        level: gamification.level,
        xpInLevel: gamification.xp % 100,
        xpForNextLevel: 100,
        achievements,
        lastActiveDate: gamification.lastActiveDate,
      });
    } catch (error) {
      console.error('Ошибка получения геймификации:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
}
