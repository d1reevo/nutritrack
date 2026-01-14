import React, { useState, useEffect } from 'react';
import { WeightChart, CaloriesChart } from '../components/Charts';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { mealService, progressService, aiService } from '../services/api';
import { Day, BodyMeasurement, ProgressSummary } from '../types';

export const ProgressPage: React.FC = () => {
  const [days, setDays] = useState<Day[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [measurementData, setMeasurementData] = useState({
    date: new Date().toISOString().split('T')[0],
    weightKg: 65,
    waistCm: '',
    chestCm: '',
    hipsCm: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const [daysData, measurementsData, summaryData] = await Promise.all([
        mealService.getDays(),
        progressService.getMeasurements(),
        aiService.getProgressSummary().catch(() => null),
      ]);

      setDays(daysData);
      setMeasurements(measurementsData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
      setError('Ошибка загрузки прогресса');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await progressService.addMeasurement({
        date: measurementData.date,
        weightKg: measurementData.weightKg,
        waistCm: measurementData.waistCm ? parseFloat(measurementData.waistCm) : undefined,
        chestCm: measurementData.chestCm ? parseFloat(measurementData.chestCm) : undefined,
        hipsCm: measurementData.hipsCm ? parseFloat(measurementData.hipsCm) : undefined,
        notes: measurementData.notes,
      });

      setShowMeasurementModal(false);
      setMeasurementData({
        date: new Date().toISOString().split('T')[0],
        weightKg: 65,
        waistCm: '',
        chestCm: '',
        hipsCm: '',
        notes: '',
      });

      await loadProgressData();
    } catch (err) {
      console.error(err);
      setError('Ошибка добавления измерения');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecomputeProgress = async () => {
    try {
      setSubmitting(true);
      await aiService.recomputeProgress();
      await loadProgressData();
    } catch (err) {
      console.error(err);
      setError('Ошибка пересчёта прогресса');
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

  const calorieData = days.map(d => ({
    date: d.date,
    calories: d.totalCalories,
    target: d.calorieTargetForDay,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {error && <Alert type="error" title="Ошибка" message={error} onClose={() => setError(null)} />}

        {/* Общая оценка прогресса */}
        {summary && (
          <div className="card bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Твой прогресс{' '}
                  <span className="text-4xl">{
                    summary.overallScore === 'отлично' ? '🌟' :
                    summary.overallScore === 'хорошо' ? '⭐' :
                    summary.overallScore === 'нормально' ? '👍' : '💪'
                  }</span>
                </h2>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-2">
                  {summary.overallScore}
                </p>
              </div>
              <button
                onClick={handleRecomputeProgress}
                disabled={submitting}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? 'Пересчёт...' : 'Обновить оценку'}
              </button>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {summary.summaryText}
            </p>

            {summary.details?.strengths && summary.details.strengths.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">✅ Сильные стороны:</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {summary.details.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.details?.areasToImprove && summary.details.areasToImprove.length > 0 && (
              <div>
                <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-2">📈 Куда расти:</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {summary.details.areasToImprove.map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Статистика */}
        {summary && summary.details?.weightProgress && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Прогресс в весе</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Начальный вес:</span>
                  <span className="font-bold">{summary.details.weightProgress.startWeight?.toFixed(1) ?? '—'} кг</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Текущий вес:</span>
                  <span className="font-bold">{summary.details.weightProgress.currentWeight?.toFixed(1) ?? '—'} кг</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Целевой вес:</span>
                  <span className="font-bold">{summary.details.weightProgress.targetWeight?.toFixed(1) ?? '—'} кг</span>
                </div>
                <div className="pt-3 border-t dark:border-gray-700 flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Прогресс:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {summary.details.weightProgress.progressPercent ?? '0'}%
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Статистика питания</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Средние дневные калории:</span>
                  <span className="font-bold">{summary.details?.averageDailyCalories ?? 0} ккал</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Дней в норме:</span>
                  <span className="font-bold">{summary.details?.daysWithinTarget ?? 0}/{summary.details?.totalDays ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Процент дней в норме:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {summary.details?.totalDays ? ((summary.details.daysWithinTarget / summary.details.totalDays) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Графики */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Динамика веса</h3>
            {measurements.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Нет данных по измерениям</p>
            ) : (
              <WeightChart measurements={measurements} />
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Динамика калорий (14 дней)</h3>
            {calorieData.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Нет данных</p>
            ) : (
              <CaloriesChart data={calorieData} />
            )}
          </div>
        </div>

        {/* Измерения */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Измерения тела</h3>
            <button
              onClick={() => setShowMeasurementModal(true)}
              className="btn-primary text-sm"
            >
              + Добавить
            </button>
          </div>

          {measurements.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Нет измерений</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-2 px-4">Дата</th>
                    <th className="text-right py-2 px-4">Вес (кг)</th>
                    <th className="text-right py-2 px-4">Талия (см)</th>
                    <th className="text-right py-2 px-4">Грудь (см)</th>
                    <th className="text-right py-2 px-4">Бёдра (см)</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map(m => (
                    <tr key={m.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">{new Date(m.date).toLocaleDateString('ru-RU')}</td>
                      <td className="py-3 px-4 text-right font-bold">{m.weightKg.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right">{m.waistCm || '—'}</td>
                      <td className="py-3 px-4 text-right">{m.chestCm || '—'}</td>
                      <td className="py-3 px-4 text-right">{m.hipsCm || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Модалка добавления измерения */}
        <Modal
          isOpen={showMeasurementModal}
          title="Добавить измерение"
          onClose={() => setShowMeasurementModal(false)}
        >
          <form onSubmit={handleAddMeasurement} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Дата
              </label>
              <input
                type="date"
                value={measurementData.date}
                onChange={e => setMeasurementData({ ...measurementData, date: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Вес (кг) *
              </label>
              <input
                type="number"
                value={measurementData.weightKg}
                onChange={e => setMeasurementData({ ...measurementData, weightKg: parseFloat(e.target.value) })}
                className="input-field"
                step="0.1"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Талия (см)
                </label>
                <input
                  type="number"
                  value={measurementData.waistCm}
                  onChange={e => setMeasurementData({ ...measurementData, waistCm: e.target.value })}
                  className="input-field"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Грудь (см)
                </label>
                <input
                  type="number"
                  value={measurementData.chestCm}
                  onChange={e => setMeasurementData({ ...measurementData, chestCm: e.target.value })}
                  className="input-field"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Бёдра (см)
                </label>
                <input
                  type="number"
                  value={measurementData.hipsCm}
                  onChange={e => setMeasurementData({ ...measurementData, hipsCm: e.target.value })}
                  className="input-field"
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowMeasurementModal(false)}
                className="btn-secondary flex-1"
              >
                Отменить
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {submitting ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
