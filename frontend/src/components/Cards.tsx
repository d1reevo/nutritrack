import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { MealEntry } from '../types';

interface MealCardProps {
  meal: MealEntry;
  onEdit: (meal: MealEntry) => void;
  onDelete: (id: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onEdit, onDelete }) => {
  return (
    <div className="card hover:shadow-xl transition-all duration-200">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/50 dark:to-teal-900/50 px-3 py-1 rounded-lg">
              {meal.time}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-3">{meal.rawText}</p>
          
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/40 dark:to-blue-900/40 p-2 rounded-xl">
              <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{meal.calories}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">ккал</div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/40 dark:to-pink-900/40 p-2 rounded-xl">
              <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{meal.protein.toFixed(0)}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Б</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/40 p-2 rounded-xl">
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{meal.fat.toFixed(0)}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Ж</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 p-2 rounded-xl">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{meal.carbs.toFixed(0)}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">У</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(meal)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-xl transition-all duration-200"
            title="Редактировать"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(meal.id)}
            className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-xl transition-all duration-200"
            title="Удалить"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

interface DayStatsProps {
  date: string;
  totalCalories: number;
  targetCalories: number;
  protein: number;
  fat: number;
  carbs: number;
  score: string;
  aiMessage: string;
}

export const DayStatsCard: React.FC<DayStatsProps> = ({
  date,
  totalCalories,
  targetCalories,
  protein,
  fat,
  carbs,
  score,
  aiMessage,
}) => {
  const caloriesRemaining = Math.max(0, targetCalories - totalCalories);
  const percentageUsed = (totalCalories / targetCalories) * 100;

  const scoreColors: Record<string, string> = {
    'отлично': 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-700 dark:text-emerald-300',
    'норм': 'bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 text-cyan-700 dark:text-cyan-300',
    'перебор': 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-700 dark:text-amber-300',
  };

  const scoreEmoji: Record<string, string> = {
    'отлично': '🌟',
    'норм': '✨',
    'перебор': '⚡',
  };

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          {new Date(date).toLocaleDateString('ru-RU', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        <div className="flex items-center gap-2 mt-3">
          <span className={`px-4 py-1.5 rounded-xl text-sm font-semibold ${scoreColors[score] || scoreColors['норм']}`}>
            {scoreEmoji[score] || '✨'} {score}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-700 dark:text-gray-300">Калории</span>
            <span className="font-semibold">{totalCalories} / {targetCalories} ккал</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percentageUsed <= 100 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'
              }`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          {caloriesRemaining > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Осталось: {caloriesRemaining} ккал
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/40 dark:to-pink-900/40 p-2.5 rounded-xl">
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{protein.toFixed(0)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Белки</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/40 p-2.5 rounded-xl">
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{fat.toFixed(0)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Жиры</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 p-2.5 rounded-xl">
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{carbs.toFixed(0)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Углеводы</div>
          </div>
        </div>

        {aiMessage && (
          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/40 dark:to-teal-900/40 p-3 rounded-xl border-l-4 border-teal-500">
            <p className="text-sm text-teal-800 dark:text-teal-100 italic">💭 {aiMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};
