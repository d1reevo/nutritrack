import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MealsPage } from './pages/MealsPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { profileService } from './services/api';
import { UserProfile } from './types';
import { ThemeProvider, useThemeContext } from './context/ThemeContext';
import './index.css';

function AppContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme, mounted } = useThemeContext();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const prof = await profileService.getProfile();
      setProfile(prof);
      setCurrentPage('dashboard');
    } catch (err) {
      // Профиль не найден, показываем onboarding
      setCurrentPage('onboarding');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-emerald-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Onboarding
  if (!profile && currentPage === 'onboarding') {
    return (
      <OnboardingPage
        onComplete={(newProfile) => {
          setProfile(newProfile);
          setCurrentPage('dashboard');
        }}
      />
    );
  }

  // Основное приложение
  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        Ошибка: профиль не загружен
      </div>
    );
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} currentPage={currentPage} />
        <div className="flex">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
          
          <main className="flex-1 w-full">
            {currentPage === 'dashboard' && <DashboardPage />}
            {currentPage === 'meals' && <MealsPage />}
            {currentPage === 'progress' && <ProgressPage />}
            {currentPage === 'settings' && (
              <SettingsPage
                profile={profile}
                onProfileUpdate={loadProfile}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
