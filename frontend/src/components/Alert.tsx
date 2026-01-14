import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  const baseStyles = 'rounded-lg p-4 flex gap-4 items-start';
  const typeStyles: Record<string, string> = {
    info: 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-100',
    success: 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-100',
    warning: 'bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-100',
    error: 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100',
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`}>
      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm mt-1">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-lg hover:opacity-70">
          ×
        </button>
      )}
    </div>
  );
};
