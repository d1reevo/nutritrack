import React, { useState, useEffect } from 'react';
import { MealCard, DayStatsCard } from '../components/Cards';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { mealService } from '../services/api';
import { Day } from '../types';

export const MealsPage: React.FC = () => {
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [editTime, setEditTime] = useState('');
  const [editText, setEditText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDays();
  }, []);

  const loadDays = async () => {
    try {
      setLoading(true);
      const daysData = await mealService.getDays();
      const safeDaysData = Array.isArray(daysData) ? daysData : [];
      setDays(safeDaysData);
      if (safeDaysData.length > 0 && !safeDaysData.find(d => d.date === selectedDate)) {
        setSelectedDate(safeDaysData[0].date);
      }
    } catch (err) {
      console.error(err);
      setError('Ошибка загрузки дней');
      setDays([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedDay = days?.find(d => d.date === selectedDate) ?? null;

  const handleEditMeal = (meal: any) => {
    if (!meal) return;
    setEditingMeal(meal);
    setEditTime(meal.time || '');
    setEditText(meal.rawText || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeal?.id) return;
    
    setSubmitting(true);

    try {
      await mealService.editMeal(editingMeal.id, {
        time: editTime,
        rawText: editText,
      });
      await loadDays();
      setEditingMeal(null);
    } catch (err) {
      console.error(err);
      setError('Ошибка сохранения');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!id) return;
    if (!confirm('Удалить этот приём пищи?')) return;

    try {
      await mealService.deleteMeal(id);
      await loadDays();
    } catch (err) {
      console.error(err);
      setError('Ошибка удаления');
    }
  };

  // Безопасное получение приёмов пищи
  const mealEntries = selectedDay?.mealEntries ?? [];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {error && <Alert type="error" title="Ошибка" message={error} onClose={() => setError(null)} />}

        {/* Выбор даты */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Выбери дату</h3>
          <div className="flex overflow-x-auto gap-2 pb-2">
            {!days || days.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Нет данных по приёмам пищи</p>
            ) : (
              days.map(day => (
                <button
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                    selectedDate === day.date
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="text-xs opacity-80">{new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'short' })}</div>
                  <div className="text-lg">{new Date(day.date).getDate()}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {selectedDay ? (
          <>
            {/* Статистика дня */}
            <DayStatsCard
              date={selectedDay.date}
              totalCalories={selectedDay.totalCalories ?? 0}
              targetCalories={selectedDay.calorieTargetForDay ?? 2000}
              protein={selectedDay.totalProtein ?? 0}
              fat={selectedDay.totalFat ?? 0}
              carbs={selectedDay.totalCarbs ?? 0}
              score={selectedDay.dayScore ?? 'норм'}
              aiMessage={selectedDay.aiDaySummary ?? ''}
            />

            {/* Приёмы пищи */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Приёмы пищи</h3>
              {mealEntries.length === 0 ? (
                <div className="card text-center">
                  <p className="text-gray-500 dark:text-gray-400">В этот день записей нет</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mealEntries.map(meal => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onEdit={handleEditMeal}
                      onDelete={handleDeleteMeal}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Нет данных о приёмах пищи</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Добавь свой первый приём пищи на главной странице</p>
          </div>
        )}

        {/* Модалка редактирования */}
        <Modal
          isOpen={!!editingMeal}
          title="Редактировать приём пищи"
          onClose={() => setEditingMeal(null)}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Время
              </label>
              <input
                type="time"
                value={editTime}
                onChange={e => setEditTime(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Описание
              </label>
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="input-field resize-none h-32"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setEditingMeal(null)}
                className="btn-secondary flex-1"
              >
                Отменить
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {submitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
