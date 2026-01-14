/**
 * Сервис для расчётов по питанию
 */
export class NutritionService {
  /**
   * Считает базовую суточную норму калорий по формуле Mifflin-St Jeor
   * gender: 'male' или 'female'
   * age: возраст в годах
   * heightCm: рост в см
   * weightKg: вес в кг
   * activityLevel: 'low', 'medium' или 'high'
   */
  static calculateDailyCalories(
    gender: string,
    age: number,
    heightCm: number,
    weightKg: number,
    activityLevel: string
  ): number {
    // Формула Mifflin-St Jeor для BMR (базовый метаболизм)
    let bmr: number;

    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    // Коэффициент активности
    const activityMultiplier: Record<string, number> = {
      low: 1.375,      // Сидячий образ жизни
      medium: 1.55,    // Умеренная активность (3-4 дня спорт в неделю)
      high: 1.725,     // Очень активный (6-7 дней спорт в неделю)
    };

    const multiplier = activityMultiplier[activityLevel] || 1.55;
    const tdee = Math.round(bmr * multiplier);

    // Для подростка 13 лет можно немного скорректировать
    const ageAdjustment = age < 18 ? 1.1 : 1.0;

    return Math.round(tdee * ageAdjustment);
  }

  /**
   * Определяет оценку дня на основе калорий
   */
  static determineDayScore(
    totalCalories: number,
    targetCalories: number,
    tolerance: number = 200
  ): string {
    const diff = totalCalories - targetCalories;

    if (Math.abs(diff) <= tolerance) {
      return 'отлично';
    } else if (diff > tolerance && diff <= tolerance * 2) {
      return 'норм';
    } else {
      return 'перебор';
    }
  }

  /**
   * Считает прогресс в весе в процентах
   */
  static calculateWeightProgress(
    startWeight: number,
    currentWeight: number,
    targetWeight: number
  ): number {
    if (startWeight === targetWeight) return 0;
    const totalChange = startWeight - targetWeight;
    const actualChange = startWeight - currentWeight;
    return (actualChange / totalChange) * 100;
  }

  /**
   * Определяет достижения (ачивки) на основе статуса
   */
  static determineAchievements(
    dayCount: number,
    streak: number,
    daysWithinTarget: number,
    weightLost: number,
    xp: number
  ): string[] {
    const achievements: string[] = [];

    // Ачивки по количеству дней
    if (dayCount >= 1) achievements.push('Первый день');
    if (dayCount >= 7) achievements.push('Неделя чемпиона');
    if (dayCount >= 30) achievements.push('Месячный марафон');
    if (dayCount >= 100) achievements.push('Сотня дней');

    // Ачивки по стрику
    if (streak >= 7) achievements.push('7 дней подряд');
    if (streak >= 30) achievements.push('Месячный стрик');

    // Ачивки по дням в норме
    if (daysWithinTarget >= 7) achievements.push('Неделя без превышения');
    if (daysWithinTarget >= 30) achievements.push('Месяц в норме');

    // Ачивки по весу
    if (weightLost >= 1) achievements.push('Первый килограмм');
    if (weightLost >= 5) achievements.push('5 килограммов вниз');

    // Ачивки по XP
    if (xp >= 100) achievements.push('Стартовый подъём');
    if (xp >= 500) achievements.push('Путешествие начинается');
    if (xp >= 1000) achievements.push('Тысячный рубеж');

    return [...new Set(achievements)]; // Убираем дубликаты
  }

  /**
   * Считает уровень на основе XP
   */
  static calculateLevel(xp: number): number {
    return Math.floor(xp / 100) + 1;
  }

  /**
   * Считает XP для текущего уровня (от 0 до 100)
   */
  static calculateXPInLevel(xp: number): number {
    return xp % 100;
  }

  /**
   * Добавляет XP за различные действия
   */
  static addXPForAction(
    currentXP: number,
    actionType: 'record_meal' | 'day_complete' | 'within_target' | 'achievement'
  ): number {
    const xpRewards: Record<string, number> = {
      record_meal: 5,           // За каждый добавленный приём пищи
      day_complete: 15,         // За день с хотя бы одной записью
      within_target: 25,        // За день в норме калорий
      achievement: 50,          // За новую ачивку
    };

    return currentXP + (xpRewards[actionType] || 0);
  }

  /**
   * Ищет новые ачивки, которых не было раньше
   */
  static findNewAchievements(
    oldAchievements: string[],
    newAchievements: string[]
  ): string[] {
    return newAchievements.filter(ach => !oldAchievements.includes(ach));
  }
}
