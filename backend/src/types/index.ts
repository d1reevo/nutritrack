// Типы приложения

export interface CreateProfileRequest {
  age: number;
  gender: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: 'low' | 'medium' | 'high';
}

export interface UpdateProfileRequest extends CreateProfileRequest {}

export interface UserProfileDTO {
  id: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: string;
  dailyCalorieTarget: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddMealRequest {
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  rawText: string;
  imageUrl?: string;
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

export interface MealEntryDTO {
  id: string;
  dayId: string;
  time: string;
  rawText: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  parsedFoodJson: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DayDTO {
  id: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  dayScore: string;
  aiDaySummary: string;
  calorieTargetForDay: number;
  mealEntries: MealEntryDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BodyMeasurementDTO {
  id: string;
  date: string;
  weightKg: number;
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  notes?: string;
  createdAt: Date;
}

export interface GamificationStateDTO {
  id: string;
  currentStreakDays: number;
  longestStreakDays: number;
  xp: number;
  level: number;
  achievements: Achievement[];
  lastActiveDate?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: Date;
  icon: string;
}

export interface ProgressSummaryDTO {
  id: string;
  lastComputedAt: Date;
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
      progressPercent: number;
    };
    strengths: string[];
    areasToImprove: string[];
  };
}
