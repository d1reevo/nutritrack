// Типы фронтенда

export interface UserProfile {
  id: string;
  age: number;
  gender: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: 'low' | 'medium' | 'high';
  dailyCalorieTarget: number;
  createdAt: string;
  updatedAt: string;
}

export interface MealEntry {
  id: string;
  dayId: string;
  time: string;
  rawText: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  parsedFoodJson: ParsedFood[];
  createdAt: string;
  updatedAt: string;
}

export interface ParsedFood {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface Day {
  id: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  dayScore: string;
  aiDaySummary: string;
  calorieTargetForDay: number;
  mealEntries: MealEntry[];
  caloriesRemaining: number;
  mealCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weightKg: number;
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  notes?: string;
  createdAt: string;
}

export interface GamificationState {
  id: string;
  currentStreakDays: number;
  longestStreakDays: number;
  xp: number;
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  achievements: string[];
  lastActiveDate?: string;
}

export interface ProgressSummary {
  id: string;
  lastComputedAt: string;
  summaryText: string;
  overallScore: string;
  details: {
    averageDailyCalories: number;
    daysWithinTarget: number;
    totalDays: number;
    weightProgress: {
      startWeight: number;
      currentWeight: number;
      targetWeight: number;
      progressPercent: string;
    };
    strengths: string[];
    areasToImprove: string[];
  };
}

export interface DailyQuest {
  quest: string;
  generatedAt: string;
}
