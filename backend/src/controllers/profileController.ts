import { Request, Response } from 'express';
import prisma from '../db/client';
import { CreateProfileRequest } from '../types';
import { NutritionService } from '../services/nutritionService';

/**
 * Контроллер профиля пользователя
 */
export class ProfileController {
  /**
   * GET /api/profile - получить профиль
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const profile = await prisma.userProfile.findFirst();

      if (!profile) {
        return res.status(404).json({ error: 'Профиль не найден' });
      }

      res.json({
        id: profile.id,
        age: profile.age,
        gender: profile.gender,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        targetWeightKg: profile.targetWeightKg,
        activityLevel: profile.activityLevel,
        dailyCalorieTarget: profile.dailyCalorieTarget,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      });
    } catch (error) {
      console.error('Ошибка получения профиля:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * POST /api/profile - создать/обновить профиль
   */
  static async createOrUpdateProfile(req: Request, res: Response) {
    try {
      const data: CreateProfileRequest = req.body;

      // Валидация
      if (!data.age || !data.gender || !data.heightCm || !data.weightKg || !data.targetWeightKg || !data.activityLevel) {
        return res.status(400).json({ error: 'Не заполнены обязательные поля' });
      }

      // Рассчитываем дневную норму калорий
      const dailyCalories = NutritionService.calculateDailyCalories(
        data.gender,
        data.age,
        data.heightCm,
        data.weightKg,
        data.activityLevel
      );

      // Проверяем, есть ли уже профиль
      const existingProfile = await prisma.userProfile.findFirst();

      if (existingProfile) {
        // Обновляем
        const updated = await prisma.userProfile.update({
          where: { id: existingProfile.id },
          data: {
            age: data.age,
            gender: data.gender,
            heightCm: data.heightCm,
            weightKg: data.weightKg,
            targetWeightKg: data.targetWeightKg,
            activityLevel: data.activityLevel,
            dailyCalorieTarget: dailyCalories,
          },
        });

        return res.json({
          id: updated.id,
          age: updated.age,
          gender: updated.gender,
          heightCm: updated.heightCm,
          weightKg: updated.weightKg,
          targetWeightKg: updated.targetWeightKg,
          activityLevel: updated.activityLevel,
          dailyCalorieTarget: updated.dailyCalorieTarget,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        });
      }

      // Создаём новый профиль
      const newProfile = await prisma.userProfile.create({
        data: {
          age: data.age,
          gender: data.gender,
          heightCm: data.heightCm,
          weightKg: data.weightKg,
          targetWeightKg: data.targetWeightKg,
          activityLevel: data.activityLevel,
          dailyCalorieTarget: dailyCalories,
        },
      });

      // Создаём геймификацию для нового профиля
      await prisma.gamificationState.create({
        data: {
          userProfileId: newProfile.id,
        },
      });

      // Создаём кеш прогресса
      await prisma.progressSummaryCache.create({
        data: {
          userProfileId: newProfile.id,
          lastComputedAt: new Date(),
          summaryText: 'Добро пожаловать! Начни вести свой дневник питания.',
          overallScore: 'начало',
        },
      });

      res.status(201).json({
        id: newProfile.id,
        age: newProfile.age,
        gender: newProfile.gender,
        heightCm: newProfile.heightCm,
        weightKg: newProfile.weightKg,
        targetWeightKg: newProfile.targetWeightKg,
        activityLevel: newProfile.activityLevel,
        dailyCalorieTarget: newProfile.dailyCalorieTarget,
        createdAt: newProfile.createdAt,
        updatedAt: newProfile.updatedAt,
      });
    } catch (error) {
      console.error('Ошибка создания/обновления профиля:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
}
