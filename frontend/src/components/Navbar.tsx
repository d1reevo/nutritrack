import React from 'react';
import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useThemeContext } from '../context/ThemeContext';

interface NavbarProps {
  onMenuClick: () => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, currentPage }) => {
  const { theme, toggleTheme } = useThemeContext();

  const getPageTitle = (page: string): string => {
    const titles: Record<string, string> = {
      onboarding: 'Добро пожаловать',
      dashboard: 'Главная',
      meals: 'Приёмы пищи',
      progress: 'Прогресс',
      settings: 'Настройки',
    };
    return titles[page] || 'Трекер питания';
  };

  return (
    <nav className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200"
          >
            <Menu size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{getPageTitle(currentPage)}</h1>
            <p className="text-emerald-100 text-sm">NutriTrack</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 text-white"
            title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
          >
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
};
