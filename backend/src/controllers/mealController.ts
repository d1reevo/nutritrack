import { Request, Response } from 'express';
import prisma from '../db/client';
import { AIService } from '../services/aiService';
import { NutritionService } from '../services/nutritionService';
import { AddMealRequest, ParsedFood } from '../types';

/**
 * Контроллер приёмов пищи
 */
export class MealController {
  /**
   * POST /api/days/:date/meals - добавить приём пищи
   */
  static async addMeal(req: Request, res: Response) {
    try {
      const { date } = req.params;
      const { time, rawText, imageUrl }: AddMealRequest = req.body;

      if (!time || !rawText) {
        return res.status(400).json({ error: 'Не заполнены обязательные поля' });
      }

      // Получаем профиль (единственный)
      const profile = await prisma.userProfile.findFirst();
      if (!profile) {
        return res.status(404).json({ error: 'Профиль не найден. Сначала заполни профиль.' });
      }

      // Получаем или создаём день
      let day = await prisma.day.findUnique({
        where: {
          date,
        },
      });

      if (!day) {
        day = await prisma.day.create({
          data: {
            date,
            userProfileId: profile.id,
            calorieTargetForDay: profile.dailyCalorieTarget,
          },
        });
      }

      // Анализируем еду через ИИ (Gemini)
      const aiAnalysis = await AIService.analyzeMeal(rawText, imageUrl).catch(() => ({
        foods: [],
        totalCalories: 0,
        totalProtein: 0,
        totalFat: 0,
        totalCarbs: 0,
        aiMessage: 'Не удалось обработать запрос. Попробуй позже.',
      }));

      // Создаём запись приёма пищи
      const mealEntry = await prisma.mealEntry.create({
        data: {
          dayId: day.id,
          time,
          rawText,
          imageUrl: imageUrl || null,
          calories: aiAnalysis.totalCalories,
          protein: aiAnalysis.totalProtein,
          fat: aiAnalysis.totalFat,
          carbs: aiAnalysis.totalCarbs,
          parsedFoodJson: JSON.stringify(aiAnalysis.foods),
        },
      });

      // Пересчитываем итоги дня
      const allMeals = await prisma.mealEntry.findMany({
        where: { dayId: day.id },
      });

      const totalCalories = allMeals.reduce((sum, m) => sum + m.calories, 0);
      const totalProtein = allMeals.reduce((sum, m) => sum + m.protein, 0);
      const totalFat = allMeals.reduce((sum, m) => sum + m.fat, 0);
      const totalCarbs = allMeals.reduce((sum, m) => sum + m.carbs, 0);

      // Оцениваем день через ИИ (с fallback)
      const dayEvaluation = await AIService.evaluateDay({
        totalCalories,
        calorieTarget: day.calorieTargetForDay,
        totalProtein,
        totalFat,
        totalCarbs,
        mealDescriptions: allMeals.map(m => m.rawText),
      }).catch(() => ({
        score: 'норм',
        comment: 'День в процессе. Продолжай отслеживать питание!',
      }));

      // Обновляем день
      await prisma.day.update({
        where: { id: day.id },
        data: {
          totalCalories,
          totalProtein,
          totalFat,
          totalCarbs,
          dayScore: dayEvaluation.score,
          aiDaySummary: dayEvaluation.comment,
        },
      });

      // Обновляем геймификацию
      await updateGamificationAfterMeal(profile.id);

      res.status(201).json({
        id: mealEntry.id,
        dayId: mealEntry.dayId,
        time: mealEntry.time,
        rawText: mealEntry.rawText,
        calories: mealEntry.calories,
        protein: mealEntry.protein,
        fat: mealEntry.fat,
        carbs: mealEntry.carbs,
        parsedFoodJson: aiAnalysis.foods,
        aiMessage: aiAnalysis.aiMessage,
        createdAt: mealEntry.createdAt,
      });
    } catch (error) {
      console.error('Ошибка добавления приёма пищи:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * GET /api/days/:date - получить день с приёмами пищи
   */
  static async getDayDetails(req: Request, res: Response) {
    try {
      const { date } = req.params;

      const day = await prisma.day.findUnique({
        where: { date },
        include: {
          mealEntries: {
            orderBy: { time: 'asc' },
          },
        },
      });

      if (!day) {
        return res.status(404).json({ error: 'День не найден' });
      }

      const mealEntries = day.mealEntries.map(m => ({
        id: m.id,
        time: m.time,
        rawText: m.rawText,
        calories: m.calories,
        protein: m.protein,
        fat: m.fat,
        carbs: m.carbs,
        parsedFoodJson: JSON.parse(m.parsedFoodJson),
      }));

      res.json({
        id: day.id,
        date: day.date,
        totalCalories: day.totalCalories,
        totalProtein: day.totalProtein,
        totalFat: day.totalFat,
        totalCarbs: day.totalCarbs,
        dayScore: day.dayScore,
        aiDaySummary: day.aiDaySummary,
        calorieTargetForDay: day.calorieTargetForDay,
        mealEntries,
        caloriesRemaining: Math.max(0, day.calorieTargetForDay - day.totalCalories),
        createdAt: day.createdAt,
      });
    } catch (error) {
      console.error('Ошибка получения дня:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * GET /api/days - получить список дней
   */
  static async getDays(req: Request, res: Response) {
    try {
      const days = await prisma.day.findMany({
        include: {
          mealEntries: true,
        },
        orderBy: { date: 'desc' },
        take: 30, // Последние 30 дней
      });

      const daysDTO = days.map(day => ({
        id: day.id,
        date: day.date,
        totalCalories: day.totalCalories,
        dayScore: day.dayScore,
        aiDaySummary: day.aiDaySummary,
        calorieTargetForDay: day.calorieTargetForDay,
        mealCount: day.mealEntries.length,
        caloriesRemaining: Math.max(0, day.calorieTargetForDay - day.totalCalories),
        createdAt: day.createdAt,
      }));

      res.json(daysDTO);
    } catch (error) {
      console.error('Ошибка получения дней:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * DELETE /api/meals/:id - удалить приём пищи
   */
  static async deleteMeal(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const meal = await prisma.mealEntry.findUnique({
        where: { id },
        include: { day: true },
      });

      if (!meal) {
        return res.status(404).json({ error: 'Приём пищи не найден' });
      }

      // Удаляем приём пищи
      await prisma.mealEntry.delete({
        where: { id },
      });

      // Пересчитываем итоги дня
      const allMeals = await prisma.mealEntry.findMany({
        where: { dayId: meal.dayId },
      });

      const totalCalories = allMeals.reduce((sum, m) => sum + m.calories, 0);
      const totalProtein = allMeals.reduce((sum, m) => sum + m.protein, 0);
      const totalFat = allMeals.reduce((sum, m) => sum + m.fat, 0);
      const totalCarbs = allMeals.reduce((sum, m) => sum + m.carbs, 0);

      // Переоцениваем день
      const dayEvaluation = await AIService.evaluateDay({
        totalCalories,
        calorieTarget: meal.day.calorieTargetForDay,
        totalProtein,
        totalFat,
        totalCarbs,
        mealDescriptions: allMeals.map(m => m.rawText),
      });

      await prisma.day.update({
        where: { id: meal.dayId },
        data: {
          totalCalories,
          totalProtein,
          totalFat,
          totalCarbs,
          dayScore: dayEvaluation.score,
          aiDaySummary: dayEvaluation.comment,
        },
      });

      res.json({ message: 'Приём пищи удалён' });
    } catch (error) {
      console.error('Ошибка удаления приёма пищи:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * PUT /api/meals/:id - отредактировать приём пищи
   */
  static async editMeal(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { time, rawText }: { time?: string; rawText?: string } = req.body;

      const meal = await prisma.mealEntry.findUnique({
        where: { id },
        include: { day: true },
      });

      if (!meal) {
        return res.status(404).json({ error: 'Приём пищи не найден' });
      }

      // Переанализируем еду через ИИ
      const aiAnalysis = await AIService.analyzeMeal(rawText || meal.rawText);

      // Обновляем приём пищи
      const updated = await prisma.mealEntry.update({
        where: { id },
        data: {
          time: time || meal.time,
          rawText: rawText || meal.rawText,
          calories: aiAnalysis.totalCalories,
          protein: aiAnalysis.totalProtein,
          fat: aiAnalysis.totalFat,
          carbs: aiAnalysis.totalCarbs,
          parsedFoodJson: JSON.stringify(aiAnalysis.foods),
        },
      });

      // Пересчитываем итоги дня
      const allMeals = await prisma.mealEntry.findMany({
        where: { dayId: meal.dayId },
      });

      const totalCalories = allMeals.reduce((sum, m) => sum + m.calories, 0);
      const totalProtein = allMeals.reduce((sum, m) => sum + m.protein, 0);
      const totalFat = allMeals.reduce((sum, m) => sum + m.fat, 0);
      const totalCarbs = allMeals.reduce((sum, m) => sum + m.carbs, 0);

      // Переоцениваем день
      const dayEvaluation = await AIService.evaluateDay({
        totalCalories,
        calorieTarget: meal.day.calorieTargetForDay,
        totalProtein,
        totalFat,
        totalCarbs,
        mealDescriptions: allMeals.map(m => m.rawText),
      });

      await prisma.day.update({
        where: { id: meal.dayId },
        data: {
          totalCalories,
          totalProtein,
          totalFat,
          totalCarbs,
          dayScore: dayEvaluation.score,
          aiDaySummary: dayEvaluation.comment,
        },
      });

      res.json({
        id: updated.id,
        time: updated.time,
        rawText: updated.rawText,
        calories: updated.calories,
        protein: updated.protein,
        fat: updated.fat,
        carbs: updated.carbs,
        parsedFoodJson: aiAnalysis.foods,
        updatedAt: updated.updatedAt,
      });
    } catch (error) {
      console.error('Ошибка редактирования приёма пищи:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
}

/**
 * Обновляет геймификацию после добавления приёма пищи
 */
async function updateGamificationAfterMeal(profileId: string) {
  try {
    const gamification = await prisma.gamificationState.findUnique({
      where: { userProfileId: profileId },
    });

    if (!gamification) return;

    // Получаем все дни для этого пользователя
    const days = await prisma.day.findMany({
      where: { userProfileId: profileId },
    });

    // Считаем активные дни (дни с записями)
    const activeDays = days.filter(d => d.totalCalories > 0).length;
    const today = new Date().toISOString().split('T')[0];

    let newStreak = gamification.currentStreakDays;

    // Проверяем, активен ли сегодня
    const todayDay = days.find(d => d.date === today);
    if (todayDay && todayDay.totalCalories > 0) {
      // Если он был активен вчера или это первый день
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
      const yesterdayDay = days.find(d => d.date === yesterday);

      if (!gamification.lastActiveDate || gamification.lastActiveDate === yesterday) {
        newStreak = (gamification.currentStreakDays || 0) + 1;
      } else {
        newStreak = 1;
      }
    }

    // Добавляем XP за запись
    let newXP = NutritionService.addXPForAction(gamification.xp, 'record_meal');

    // Проверяем, завершён ли день (есть ли дневная запись)
    const todayData = await prisma.day.findUnique({
      where: { date: today },
      include: { mealEntries: true },
    });

    if (todayData && todayData.mealEntries.length > 0) {
      newXP = NutritionService.addXPForAction(newXP, 'day_complete');
    }

    // Проверяем, день в норме калорий
    if (todayData && Math.abs(todayData.totalCalories - todayData.calorieTargetForDay) <= 200) {
      newXP = NutritionService.addXPForAction(newXP, 'within_target');
    }

    // Считаем дни в норме
    const daysWithinTarget = days.filter(
      d => Math.abs(d.totalCalories - d.calorieTargetForDay) <= 200
    ).length;

    // Определяем новые ачивки
    const currentAchievements = gamification.achievementsJson
      ? JSON.parse(gamification.achievementsJson)
      : [];

    const weightData = await prisma.bodyMeasurement.findMany({
      where: { userProfileId: profileId },
      orderBy: { date: 'asc' },
      take: 1,
    });

    const startWeight = weightData[0]?.weightKg || 0;
    const latestWeight = await prisma.bodyMeasurement.findFirst({
      where: { userProfileId: profileId },
      orderBy: { date: 'desc' },
    });
    const currentWeight = latestWeight?.weightKg || startWeight;
    const weightLost = Math.max(0, startWeight - currentWeight);

    const newAchievements = NutritionService.determineAchievements(
      activeDays,
      newStreak,
      daysWithinTarget,
      weightLost,
      newXP
    );

    const achievementsToAdd = NutritionService.findNewAchievements(
      currentAchievements,
      newAchievements
    );

    if (achievementsToAdd.length > 0) {
      newXP = NutritionService.addXPForAction(newXP, 'achievement');
    }

    const newLevel = NutritionService.calculateLevel(newXP);

    // Обновляем геймификацию
    await prisma.gamificationState.update({
      where: { id: gamification.id },
      data: {
        currentStreakDays: newStreak,
        longestStreakDays: Math.max(gamification.longestStreakDays, newStreak),
        xp: newXP,
        level: newLevel,
        achievementsJson: JSON.stringify(newAchievements),
        lastActiveDate: today,
      },
    });
  } catch (error) {
    console.error('Ошибка обновления геймификации:', error);
  }
}
