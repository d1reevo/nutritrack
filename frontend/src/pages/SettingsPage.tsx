import React, { useState } from 'react';
import { Alert } from '../components/Alert';
import { profileService } from '../services/api';
import { UserProfile } from '../types';

interface SettingsPageProps {
  profile: UserProfile | null;
  onProfileUpdate: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ profile, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    age: profile?.age || 13,
    gender: profile?.gender || 'male' as 'male' | 'female',
    heightCm: profile?.heightCm || 172,
    weightKg: profile?.weightKg || 65,
    targetWeightKg: profile?.targetWeightKg || 60,
    activityLevel: profile?.activityLevel || 'medium' as 'low' | 'medium' | 'high',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'heightCm' || name === 'weightKg' || name === 'targetWeightKg'
        ? parseFloat(value)
        : value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await profileService.createOrUpdateProfile(formData);
      setSuccess('Профиль сохранён успешно!');
      setIsEditing(false);
      onProfileUpdate();
    } catch (err) {
      console.error(err);
      setError('Ошибка сохранения профиля');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {error && <Alert type="error" title="Ошибка" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" title="Успех" message={success} onClose={() => setSuccess(null)} />}

        {/* Профиль */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Мой профиль</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                Редактировать
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Возраст</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.age} лет</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Пол</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile?.gender === 'male' ? 'Мужской' : 'Женский'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Рост</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.heightCm} см</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Текущий вес</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.weightKg} кг</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Целевой вес</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.targetWeightKg} кг</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Дневная норма калорий</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{profile?.dailyCalorieTarget} ккал</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
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
                    Текущий вес (кг)
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
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Новая дневная норма:</strong> {calculateCalories()} ккал
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex-1"
                >
                  Отменить
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Информация */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">О приложении</h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              <strong>🍎 NutriTrack</strong> — это персональный трекер питания и прогресса похудения, вдохновлённый Duolingo.
            </p>
            <p>
              Приложение помогает отслеживать свои приёмы пищи, калории и прогресс в похудении, используя ИИ Gemini для анализа еды.
            </p>
            <h3 className="font-bold text-red-600 dark:text-red-400 mt-4">⚠️ Важное уведомление:</h3>
            <p>
              <strong>Это НЕ медицинский сервис.</strong> Приложение предназначено только для отслеживания питания и прогресса. 
              Оно не может заменить консультацию врача или диетолога.
            </p>
            <p>
              Для серьёзных вопросов по здоровью, диете или весу обратись к квалифицированному специалисту.
            </p>
            <h3 className="font-bold mt-4">💡 Советы для безопасного использования:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Введи реальные данные в профиль</li>
              <li>Регулярно записывай свои приёмы пищи</li>
              <li>Помни, что эти рекомендации не заменяют медицинский совет</li>
              <li>Если чувствуешь недомогание, обратись к врачу</li>
            </ul>
          </div>
        </div>

        {/* Конфиденциальность */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔒 Конфиденциальность</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Все твои данные хранятся локально и не отправляются куда-либо кроме сервера приложения.
            Мы НЕ продаём и НЕ делимся твоей информацией с третьими лицами.
          </p>
        </div>
      </div>
    </div>
  );
};
