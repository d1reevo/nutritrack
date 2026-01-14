import React from 'react';
import { X, Home, Utensils, TrendingUp, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage, onPageChange }) => {
  const pages = [
    { id: 'dashboard', label: 'Главная', icon: Home },
    { id: 'meals', label: 'Приёмы пищи', icon: Utensils },
    { id: 'progress', label: 'Прогресс', icon: TrendingUp },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  const handlePageChange = (page: string) => {
    onPageChange(page);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 shadow-lg z-40 transform transition-transform duration-300 md:translate-x-0 md:static md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 md:hidden">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Меню</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <X size={24} />
          </button>
        </div>

        <nav className="p-6 space-y-2">
          {pages.map(page => {
            const Icon = page.icon;
            const isActive = currentPage === page.id;
            return (
              <button
                key={page.id}
                onClick={() => handlePageChange(page.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{page.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl border border-emerald-100 dark:border-emerald-800">
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            💡 Подсказка: используй ИИ для анализа своей еды!
          </p>
        </div>
      </aside>
    </>
  );
};
