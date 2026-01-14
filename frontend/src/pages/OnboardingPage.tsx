import React, { useState } from 'react';
import { Alert } from '../components/Alert';
import { profileService } from '../services/api';
import { UserProfile } from '../types';

interface OnboardingPageProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    age: 13,
    gender: 'male' as 'male' | 'female',
    heightCm: 172,
    weightKg: 65,
    targetWeightKg: 60,
    activityLevel: 'medium' as 'low' | 'medium' | 'high',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'heightCm' || name === 'weightKg' || name === 'targetWeightKg'
        ? parseFloat(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const profile = await profileService.createOrUpdateProfile(formData);
      onComplete(profile);
    } catch (err) {
      setError('Ошибка при сохранении профиля. Попробуй ещё раз.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCalories = (): number => {
    let bmr: number;
    if (formData.gender === 'male') {
      bmr = 10 * formData.weightKg + 6.25 * formData.heightCm - 5 * formData.age + 5;
    } else {
      bmr = 10 * formData.weightKg + 6.25 * formData.heightCm - 5 * formData.age - 161;
    }
    const multipliers: Record<string, number> = {
      low: 1.375,
      medium: 1.55,
      high: 1.725,
    };
    return Math.round(bmr * multipliers[formData.activityLevel] * 1.1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">🍎 NutriTrack</h1>
            <p className="text-gray-600 dark:text-gray-400">Твой личный трекер питания и похудения</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Возраст
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="input-field"
                min="10"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Пол
              </label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Рост (см)
                </label>
                <input
                  type="number"
                  name="heightCm"
                  value={formData.heightCm}
                  onChange={handleChange}
                  className="input-field"
                  min="130"
                  max="220"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Вес (кг)
                </label>
                <input
                  type="number"
                  name="weightKg"
                  value={formData.weightKg}
                  onChange={handleChange}
                  className="input-field"
                  step="0.1"
                  min="30"
                  max="200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Целевой вес (кг)
              </label>
              <input
                type="number"
                name="targetWeightKg"
                value={formData.targetWeightKg}
                onChange={handleChange}
                className="input-field"
                step="0.1"
                min="30"
                max="200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Уровень активности
              </label>
              <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="input-field">
                <option value="low">Низкий (в основном сидячий образ)</option>
                <option value="medium">Средний (3-4 дня спорта в неделю)</option>
                <option value="high">Высокий (интенсивный спорт, 6-7 дней)</option>
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>📊 Дневная норма:</strong> {calculateCalories()} ккал
              </p>
            </div>

            {error && <Alert type="error" title="Ошибка" message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Загрузка...' : 'Начать'}
            </button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              💡 Это не медицинский сервис. Для серьёзных вопросов обратись к врачу или диетологу.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
