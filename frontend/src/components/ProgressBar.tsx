import React from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
  showLabel?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'emerald' | 'amber' | 'teal';
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  showLabel = true,
  color = 'emerald',
  animated = true,
}) => {
  const percentage = Math.min((current / target) * 100, 100);

  const colorStyles: Record<string, string> = {
    blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
    green: 'bg-gradient-to-r from-green-400 to-green-600',
    purple: 'bg-gradient-to-r from-purple-400 to-purple-600',
    red: 'bg-gradient-to-r from-red-400 to-red-600',
    emerald: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    amber: 'bg-gradient-to-r from-amber-400 to-orange-500',
    teal: 'bg-gradient-to-r from-teal-400 to-cyan-500',
  };

  return (
    <div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3.5 overflow-hidden shadow-inner">
        <div
          className={`h-full ${colorStyles[color]} transition-all duration-500 rounded-full ${
            animated ? 'ease-out' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
          <span>{Math.round(current)}</span>
          <span>/ {Math.round(target)}</span>
        </div>
      )}
    </div>
  );
};
