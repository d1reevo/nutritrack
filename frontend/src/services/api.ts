import axios, { AxiosInstance } from 'axios';
import { UserProfile, Day, MealEntry, BodyMeasurement, GamificationState, ProgressSummary, DailyQuest } from '../types';

const API_BASE_URL = 'https://nutritrack-ye03.onrender.com';


const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Сервис для работы с профилем
 */
export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  createOrUpdateProfile: async (data: {
    age: number;
    gender: 'male' | 'female';
    heightCm: number;
    weightKg: number;
    targetWeightKg: number;
    activityLevel: 'low' | 'medium' | 'high';
  }): Promise<UserProfile> => {
    const response = await apiClient.post('/profile', data);
    return response.data;
  },
};

/**
 * Сервис для работы с приёмами пищи
 */
export const mealService = {
  getDays: async (): Promise<Day[]> => {
    const response = await apiClient.get('/days');
    return response.data;
  },

  getDayDetails: async (date: string): Promise<Day> => {
    const response = await apiClient.get(`/days/${date}`);
    return response.data;
  },

  addMeal: async (date: string, data: {
    time: string;
    rawText: string;
    imageUrl?: string;
  }): Promise<MealEntry & { aiMessage: string }> => {
    const response = await apiClient.post(`/days/${date}/meals`, data);
    return response.data;
  },

  editMeal: async (id: string, data: {
    time?: string;
    rawText?: string;
  }): Promise<MealEntry> => {
    const response = await apiClient.put(`/meals/${id}`, data);
    return response.data;
  },

  deleteMeal: async (id: string): Promise<void> => {
    await apiClient.delete(`/meals/${id}`);
  },
};

/**
 * Сервис для работы с измерениями и прогрессом
 */
export const progressService = {
  getMeasurements: async (): Promise<BodyMeasurement[]> => {
    const response = await apiClient.get('/progress/measurements');
    return response.data;
  },

  addMeasurement: async (data: {
    date: string;
    weightKg: number;
    waistCm?: number;
    chestCm?: number;
    hipsCm?: number;
    notes?: string;
  }): Promise<BodyMeasurement> => {
    const response = await apiClient.post('/progress/measurements', data);
    return response.data;
  },

  deleteMeasurement: async (id: string): Promise<void> => {
    await apiClient.delete(`/progress/measurements/${id}`);
  },

  getGamification: async (): Promise<GamificationState> => {
    const response = await apiClient.get('/progress/gamification');
    return response.data;
  },
};

/**
 * Сервис для работы с ИИ и прогрессом
 */
export const aiService = {
  getProgressSummary: async (): Promise<ProgressSummary> => {
    const response = await apiClient.get('/ai/progress/summary');
    return response.data;
  },

  recomputeProgress: async (): Promise<ProgressSummary> => {
    const response = await apiClient.post('/ai/recompute-progress');
    return response.data;
  },

  getDailyQuest: async (): Promise<DailyQuest> => {
    const response = await apiClient.get('/ai/daily-quest');
    return response.data;
  },
};

/**
 * Сервис здоровья
 */
export const healthService = {
  checkHealth: async (): Promise<{ status: string; message: string }> => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};
