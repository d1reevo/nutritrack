import { useState, useEffect } from 'react';
import { Theme, getTheme, setTheme } from '../theme/themeUtils';

/**
 * Hook для работы с темой
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = getTheme();
    setThemeState(initialTheme);
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    setTheme(newTheme);
  };

  return { theme, toggleTheme, mounted };
};

/**
 * Hook для форматирования даты
 */
export const useDateFormatted = (date: string | Date): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = date.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'Сегодня';
  if (dateStr === yesterdayStr) return 'Вчера';

  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('ru-RU', options);
};
