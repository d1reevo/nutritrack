import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import { ParsedFood } from '../types';

const genAI = new GoogleGenerativeAI(config.geminiApiKey || '');

// Модель для использования
const MODEL_NAME = 'gemini-2.0-flash-exp';

/**
 * Сервис для взаимодействия с Gemini API
 * Отвечает за анализ пищи, оценку дней и общего прогресса
 */
export class AIService {
  /**
   * Анализирует приём пищи (текст и опционально фото)
   * Возвращает распарсенные продукты с калориями и макросами
   */
  static async analyzeMeal(rawText: string, imageUrl?: string): Promise<{
    foods: ParsedFood[];
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    aiMessage: string;
  }> {
    try {
      if (!config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
        console.log('Gemini API ключ не настроен, используем fallback');
        return AIService.getFallbackMealAnalysis(rawText);
      }

      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      // Промпт на русском языке для анализа пищи
      const prompt = `Ты помощник-нутриционист. ВАЖНО: ты НЕ врач и не можешь давать медицинские рекомендации.

Проанализируй следующий текст описания еды на русском языке и определи:
1. Список продуктов (название, примерный вес в граммах)
2. Примерный расчёт калорий и макронутриентов (белки, жиры, углеводы)
3. Уверенность в оценке (low, medium, high)

Если пользователь не указал вес - оцени примерный вес по контексту.
Будь в тоне дружелюбный и поддерживающий.

Текст пищи: "${rawText}"

Ответь ТОЛЬКО в следующем JSON формате (без маркдауна, просто JSON):
{
  "foods": [
    {
      "name": "название продукта",
      "grams": число,
      "calories": число,
      "protein": число,
      "fat": число,
      "carbs": число,
      "confidence": "low|medium|high"
    }
  ],
  "totalCalories": число,
  "totalProtein": число,
  "totalFat": число,
  "totalCarbs": число,
  "aiMessage": "краткое дружелюбное сообщение о том, что записано"
}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Парсим JSON из ответа
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Не удалось распарсить ответ от ИИ');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    } catch (error: any) {
      console.error('Ошибка анализа пищи (используем fallback):', error?.message || 'Unknown error');
      // Fallback: возвращаем базовую оценку
      return AIService.getFallbackMealAnalysis(rawText);
    }
  }

  /**
   * Fallback анализ еды без ИИ
   */
  static getFallbackMealAnalysis(rawText: string): {
    foods: ParsedFood[];
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    aiMessage: string;
  } {
    // Простой подсчёт - примерно 200 ккал за приём пищи по умолчанию
    return {
      foods: [{
        name: rawText.substring(0, 50),
        grams: 100,
        calories: 200,
        protein: 10,
        fat: 8,
        carbs: 20,
        confidence: 'low' as const,
      }],
      totalCalories: 200,
      totalProtein: 10,
      totalFat: 8,
      totalCarbs: 20,
      aiMessage: 'Записано! (ИИ анализ временно недоступен)',
    };
  }

  /**
   * Оценивает день пользователя и генерирует комментарий
   */
  static async evaluateDay(dayData: {
    totalCalories: number;
    calorieTarget: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    mealDescriptions: string[];
  }): Promise<{
    score: string; // "отлично", "норм", "перебор"
    comment: string;
  }> {
    try {
      if (!config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
        return AIService.getFallbackDayEvaluation(dayData.totalCalories, dayData.calorieTarget);
      }

      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const prompt = `Ты помощник-нутриционист. ВАЖНО: ты НЕ врач.

Оцени день пользователя и дай дружелюбный комментарий:
- Съедено калорий: ${dayData.totalCalories}
- Дневная норма: ${dayData.calorieTarget}
- Белки: ${dayData.totalProtein}г, Жиры: ${dayData.totalFat}г, Углеводы: ${dayData.totalCarbs}г
- Приёмы пищи: ${dayData.mealDescriptions.join(', ')}

Напомни: это не медицинский сервис. При серьёзных проблемах со здоровьем - обратись к врачу.

Дай оценку в следующем JSON (только JSON, без маркдауна):
{
  "score": "отлично|норм|перебор",
  "comment": "2-4 предложения дружелюбного комментария с советом"
}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Не удалось распарсить ответ');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: parsed.score || 'норм',
        comment: parsed.comment || 'День идёт хорошо!',
      };
    } catch (error: any) {
      console.error('Ошибка оценки дня (используем fallback):', error?.message || 'Unknown error');
      return AIService.getFallbackDayEvaluation(dayData.totalCalories, dayData.calorieTarget);
    }
  }

  /**
   * Fallback оценка дня без ИИ
   */
  static getFallbackDayEvaluation(totalCalories: number, calorieTarget: number): { score: string; comment: string } {
    const diff = totalCalories - calorieTarget;
    if (Math.abs(diff) < 200) {
      return { score: 'отлично', comment: 'Отличный день! Ты в пределах нормы калорий. Так держать!' };
    } else if (diff > 200) {
      return { score: 'перебор', comment: 'Сегодня немного перебрал с калориями. Ничего страшного, завтра новый день!' };
    } else {
      return { score: 'норм', comment: 'Хороший день! Не забывай питаться регулярно.' };
    }
  }

  /**
   * Генерирует общую оценку прогресса за весь период
   */
  static async generateProgressSummary(progressData: {
    startDate: string;
    startWeight: number;
    currentWeight: number;
    targetWeight: number;
    averageCalories: number;
    daysWithinTarget: number;
    totalDays: number;
    streak: number;
    level: number;
    xp: number;
    achievements: string[];
  }): Promise<{
    overallScore: string;
    summaryText: string;
    strengths: string[];
    areasToImprove: string[];
  }> {
    try {
      if (!config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
        return AIService.getFallbackProgressSummary();
      }

      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const weightProgress = ((progressData.startWeight - progressData.currentWeight) / progressData.startWeight * 100).toFixed(1);

      const prompt = `Ты опытный и дружелюбный помощник-нутриционист. ВАЖНО: ты НЕ врач.

Оцени общий прогресс пользователя:
- Начальный вес: ${progressData.startWeight} кг
- Текущий вес: ${progressData.currentWeight} кг
- Целевой вес: ${progressData.targetWeight} кг
- Прогресс в весе: ${weightProgress}%
- Средние дневные калории: ${Math.round(progressData.averageCalories)}
- Дней в норме калорий: ${progressData.daysWithinTarget}/${progressData.totalDays} (${Math.round(progressData.daysWithinTarget / progressData.totalDays * 100)}%)
- Текущий стрик: ${progressData.streak} дней
- Уровень: ${progressData.level}
- Достижения: ${progressData.achievements.join(', ') || 'пока нет'}

Напомни: это не медицинский сервис. Для серьёзных вопросов - обратись к врачу/диетологу.

Дай развёрнутую оценку в JSON:
{
  "overallScore": "отлично|хорошо|нормально|есть куда расти",
  "summaryText": "3-4 абзаца подробного анализа прогресса, дружелюбный тон",
  "strengths": ["сильная сторона 1", "сильная сторона 2"],
  "areasToImprove": ["для улучшения 1", "для улучшения 2"]
}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Не удалось распарсить ответ');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        overallScore: parsed.overallScore || 'нормально',
        summaryText: parsed.summaryText || 'Отличная работа! Продолжай в том же духе.',
        strengths: parsed.strengths || [],
        areasToImprove: parsed.areasToImprove || [],
      };
    } catch (error: any) {
      console.error('Ошибка генерации оценки прогресса (используем fallback):', error?.message || 'Unknown error');
      return AIService.getFallbackProgressSummary();
    }
  }

  /**
   * Fallback оценка прогресса без ИИ
   */
  static getFallbackProgressSummary(): {
    overallScore: string;
    summaryText: string;
    strengths: string[];
    areasToImprove: string[];
  } {
    return {
      overallScore: 'хорошо',
      summaryText: 'Ты делаешь отличную работу по отслеживанию своего питания! Каждый день — это шаг к цели. Продолжай вести дневник и отслеживать прогресс.',
      strengths: ['Регулярно отслеживаешь питание', 'Ставишь цели'],
      areasToImprove: ['Продолжать отслеживание', 'Добавлять больше деталей'],
    };
  }

  /**
   * Генерирует ежедневное мини-задание (квест)
   */
  static async generateDailyQuest(): Promise<string> {
    const defaultQuests = [
      'Выпей 8 стаканов воды сегодня',
      'Добавь овощи в один из приёмов пищи',
      'Съешь фрукт на полдник',
      'Попробуй новый полезный продукт',
      'Завтракай в течение часа после пробуждения',
      'Добавь белок в каждый приём пищи',
      'Замени сладкое на фрукты',
      'Ешь медленно и без телефона',
    ];
    
    try {
      if (!config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
        return defaultQuests[Math.floor(Math.random() * defaultQuests.length)];
      }

      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const prompt = `Ты помощник для здорового питания. Придумай ОДНО простое, не экстремальное мини-задание на день для подростка 13 лет.
      
ВАЖНО:
- НЕ голодовки, НЕ опасные диеты
- Только позитивные, здоровые привычки
- Простое, выполнимое
- На русском языке

Примеры: "Выпей 8 стаканов воды", "Добавь овощи в обед", "Съешь фрукт на полдник"

Дай ответ в таком формате (только текст, без JSON):
КВЕСТ: [описание задания]`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Извлекаем текст квеста
      const questMatch = text.match(/КВЕСТ:\s*(.*)/);
      return questMatch ? questMatch[1].trim() : defaultQuests[Math.floor(Math.random() * defaultQuests.length)];
    } catch (error: any) {
      console.error('Ошибка генерации квеста (используем fallback):', error?.message || 'Unknown error');
      return defaultQuests[Math.floor(Math.random() * defaultQuests.length)];
    }
  }
}
