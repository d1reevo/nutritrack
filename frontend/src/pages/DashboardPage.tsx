import React, { useState, useEffect } from 'react';
import { Alert } from '../components/Alert';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';
import { Zap, Trophy, Check } from 'lucide-react';
import { mealService, progressService, aiService } from '../services/api';
import { Day, GamificationState, ProgressSummary, DailyQuest } from '../types';

export const DashboardPage: React.FC = () => {
  const [today, setToday] = useState<Day | null>(null);
  const [gamification, setGamification] = useState<GamificationState | null>(null);
  const [quest, setQuest] = useState<DailyQuest | null>(null);
  const [questAccepted, setQuestAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealTime, setMealTime] = useState('12:00');
  const [mealText, setMealText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today_date = new Date().toISOString().split('T')[0];
      
      const [dayData, gamifData, questData] = await Promise.all([
        mealService.getDayDetails(today_date).catch(() => ({
          id: '',
          date: today_date,
          totalCalories: 0,
          totalProtein: 0,
          totalFat: 0,
          totalCarbs: 0,
          dayScore: 'норм',
          aiDaySummary: 'Начни добавлять приёмы пищи!',
          calorieTargetForDay: 2000,
          mealEntries: [],
          caloriesRemaining: 2000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        progressService.getGamification(),
        aiService.getDailyQuest().catch(() => ({ quest: 'Добавь овощи в один из приёмов пищи', generatedAt: new Date().toISOString() })),
      ]);

      setToday(dayData);
      setGamification(gamifData);
      setQuest(questData);
    } catch (err) {
      console.error(err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealText.trim()) return;

    setSubmitting(true);
    try {
      const today_date = new Date().toISOString().split('T')[0];
      await mealService.addMeal(today_date, {
        time: mealTime,
        rawText: mealText,
      });

      setMealText('');
      setShowMealModal(false);
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      setError('Ошибка добавления приёма пищи');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-emerald-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!today || !gamification) {
    return <div className="p-4 text-center text-red-600">Ошибка загрузки данных</div>;
  }

  const scoreEmoji: Record<string, string> = {
    'отлично': '�',
    'норм': '✨',
    'перебор': '⚡',
  };

  const scoreColors: Record<string, string> = {
    'отлично': 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-700 dark:text-emerald-300',
    'норм': 'bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 text-cyan-700 dark:text-cyan-300',
    'перебор': 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-700 dark:text-amber-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {error && <Alert type="error" title="Ошибка" message={error} onClose={() => setError(null)} />}

        {/* Основная информация дня */}
        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {new Date().toLocaleDateString('ru-RU', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              <div className="flex items-center gap-2 mt-3">
                <span className={`px-4 py-2 rounded-xl text-lg font-bold ${scoreColors[today.dayScore] || scoreColors['норм']}`}>
                  {scoreEmoji[today.dayScore]} {today.dayScore}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowMealModal(true)}
              className="btn-primary"
            >
              + Добавить приём пищи
            </button>
          </div>

          {/* Калории */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Калории</h3>
            <ProgressBar
              current={today.totalCalories}
              target={today.calorieTargetForDay}
              color={today.totalCalories <= today.calorieTargetForDay + 200 ? 'emerald' : 'amber'}
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {today.totalCalories} / {today.calorieTargetForDay} ккал
              {today.caloriesRemaining > 0 && ` • Осталось: ${today.caloriesRemaining} ккал`}
            </div>
          </div>

          {/* БЖУ */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/40 dark:to-pink-900/40 p-4 rounded-xl border border-rose-100 dark:border-rose-800">
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{today.totalProtein.toFixed(0)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Белки (г)</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/40 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{today.totalFat.toFixed(0)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Жиры (г)</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{today.totalCarbs.toFixed(0)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Углеводы (г)</div>
            </div>
          </div>

          {/* Сообщение ИИ */}
          {today.aiDaySummary && (
            <div className="mt-6 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/40 dark:to-teal-900/40 p-4 rounded-xl border-l-4 border-teal-500">
              <p className="text-teal-800 dark:text-teal-100">💭 {today.aiDaySummary}</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Геймификация */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy size={24} className="text-amber-500" />
              Прогресс
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300">Уровень {gamification.level}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{gamification.xpInLevel}/100 XP</span>
                </div>
                <ProgressBar current={gamification.xpInLevel} target={100} showLabel={false} color="teal" />
              </div>

              <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                <div>
                  <div className="text-3xl font-bold text-orange-500">🔥 {gamification.currentStreakDays}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Текущий стрик</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-500">⭐ {gamification.xp}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Всего XP</div>
                </div>
              </div>

              {gamification.achievements && gamification.achievements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Достижения</h4>
                  <div className="flex flex-wrap gap-2">
                    {gamification.achievements.slice(0, 4).map((ach, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50 px-3 py-1.5 rounded-xl text-sm font-medium text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700">
                        🏆 {ach}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Дневное задание */}
          {quest && (
            <div className="card bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-900/40 dark:via-purple-900/40 dark:to-fuchsia-900/40 border-violet-100 dark:border-violet-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap size={24} className="text-amber-500" />
                Дневное задание
              </h3>
              <div className="bg-white/80 dark:bg-gray-800/80 p-5 rounded-xl text-center backdrop-blur-sm">
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {quest.quest}
                </p>
                {questAccepted ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Check size={20} />
                    Вызов принят!
                  </div>
                ) : (
                  <button 
                    onClick={() => setQuestAccepted(true)}
                    className="btn-primary"
                  >
                    Принять вызов
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модалка добавления приёма пищи */}
      <Modal
        isOpen={showMealModal}
        title="Добавить приём пищи"
        onClose={() => setShowMealModal(false)}
      >
        <form onSubmit={handleAddMeal} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Время
            </label>
            <input
              type="time"
              value={mealTime}
              onChange={e => setMealTime(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Что ты ел/а? (опиши подробнее)
            </label>
            <textarea
              value={mealText}
              onChange={e => setMealText(e.target.value)}
              placeholder="Например: 2 яйца, 50г сыра, стакан молока..."
              className="input-field resize-none h-32"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowMealModal(false)}
              className="btn-secondary flex-1"
            >
              Отменить
            </button>
            <button
              type="submit"
              disabled={submitting || !mealText.trim()}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {submitting ? 'Обработка...' : 'Добавить'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
