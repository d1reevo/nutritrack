# 🍎 NutriTrack - Персональный трекер питания и прогресса похудения

Полнофункциональное веб-приложение для отслеживания питания, калорий и прогресса похудения, с интеграцией ИИ Gemini.

## 🚀 Возможности

- ✅ **Трекинг питания**: записывай приёмы пищи, ИИ автоматически считает калории и макросы
- ✅ **Анализ с помощью ИИ**: Gemini распознаёт продукты по описанию текста
- ✅ **Дневная норма калорий**: автоматический расчёт по формуле Mifflin-St Jeor
- ✅ **Геймификация**: уровни, XP, стрик, достижения
- ✅ **История и прогресс**: графики веса, калорий, общая оценка прогресса
- ✅ **Тёмная и светлая тема**: комфортный вид в любое время суток
- ✅ **Адаптивный дизайн**: работает на телефоне, планшете и ПК
- ✅ **Без регистрации**: один пользователь, локальные данные

## 🛠 Технический стек

### Бэкенд
- **Node.js** + **TypeScript**
- **Express** (REST API)
- **Prisma** (ORM)
- **SQLite** (база данных)
- **Google Generative AI** (Gemini API)

### Фронтенд
- **React 18** + **TypeScript**
- **Vite** (сборка)
- **Tailwind CSS** (стили)
- **Recharts** (графики)
- **Lucide React** (иконки)
- **Axios** (HTTP клиент)

## 📦 Установка

### Требования
- Node.js 16+ и npm/yarn
- Gemini API ключ (получи на https://makersuite.google.com/app/apikey)

### 1. Клонирование и установка зависимостей

```bash
# Установка зависимостей бэкенда
cd backend
npm install

# Установка зависимостей фронтенда
cd ../frontend
npm install
```

### 2. Настройка переменных окружения

**backend/.env**
```
DATABASE_URL="file:./nutrition_tracker.db"
GEMINI_API_KEY="твой_ключ_gemini_api"
NODE_ENV="development"
PORT=5000
```

### 3. Инициализация БД

```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

## 🚀 Запуск

### Вариант 1: Два отдельных терминала

**Терминал 1 - Бэкенд:**
```bash
cd backend
npm run dev
# Сервер запустится на http://localhost:5000
```

**Терминал 2 - Фронтенд:**
```bash
cd frontend
npm run dev
# Приложение откроется на http://localhost:3000
```

### Вариант 2: Production-сборка

**Бэкенд:**
```bash
cd backend
npm run build
npm start
```

**Фронтенд:**
```bash
cd frontend
npm run build
# Статические файлы будут в папке dist/
```

## 📋 Структура проекта

```
webkaon/
├── backend/
│   ├── src/
│   │   ├── index.ts                 # Точка входа сервера
│   │   ├── config/
│   │   │   └── env.ts              # Переменные окружения
│   │   ├── db/
│   │   │   └── client.ts           # Prisma клиент
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript типы
│   │   ├── services/
│   │   │   ├── aiService.ts        # Интеграция с Gemini
│   │   │   └── nutritionService.ts # Расчёты питания
│   │   ├── controllers/
│   │   │   ├── profileController.ts
│   │   │   ├── mealController.ts
│   │   │   ├── progressController.ts
│   │   │   └── aiController.ts
│   │   ├── routes/
│   │   │   ├── profile.ts
│   │   │   ├── meals.ts
│   │   │   ├── progress.ts
│   │   │   └── ai.ts
│   │   └── middleware/
│   │       └── errorHandler.ts
│   ├── prisma/
│   │   └── schema.prisma           # Схема БД
│   ├── .env                        # Переменные окружения
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                # Точка входа React
│   │   ├── App.tsx                 # Главный компонент
│   │   ├── index.css               # Глобальные стили
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Charts.tsx
│   │   │   └── Cards.tsx
│   │   ├── pages/
│   │   │   ├── OnboardingPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── MealsPage.tsx
│   │   │   ├── ProgressPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── hooks/
│   │   │   └── index.ts            # Custom hooks
│   │   ├── services/
│   │   │   └── api.ts              # API клиент
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript типы
│   │   └── theme/
│   │       └── themeUtils.ts       # Управление темой
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.ts
└── README.md
```

## 🔌 API эндпойнты

### Профиль
- `GET /api/profile` - получить профиль
- `POST /api/profile` - создать/обновить профиль

### Приёмы пищи
- `GET /api/days` - список дней
- `GET /api/days/:date` - подробная информация по дню
- `POST /api/days/:date/meals` - добавить приём пищи
- `PUT /api/meals/:id` - редактировать приём пищи
- `DELETE /api/meals/:id` - удалить приём пищи

### Измерения и прогресс
- `GET /api/progress/measurements` - получить измерения
- `POST /api/progress/measurements` - добавить измерение
- `DELETE /api/progress/measurements/:id` - удалить измерение
- `GET /api/progress/gamification` - статус геймификации

### ИИ и прогресс
- `GET /api/ai/progress/summary` - получить оценку прогресса
- `POST /api/ai/recompute-progress` - пересчитать оценку
- `GET /api/ai/daily-quest` - получить дневное задание

## 🤖 Интеграция с Gemini

Приложение использует Gemini API для:
- **Анализа пищи**: распознание продуктов по текстовому описанию
- **Подсчёта калорий**: автоматический расчёт макронутриентов
- **Оценки дня**: дружелюбный комментарий на основе калорий
- **Анализа прогресса**: общая оценка и рекомендации
- **Мини-заданий**: ежедневные задачи для мотивации

## 📊 Геймификация

- 🔥 **Стрик**: количество дней подряд с записями
- ⭐ **XP**: очки за активность
- 📈 **Уровни**: система уровней (каждые 100 XP)
- 🏆 **Достижения**: значки за различные события

## 🎨 Дизайн

- Яркие, дружелюбные цвета (вдохновлено Duolingo)
- Округлые карточки и мягкие тени
- Адаптивная верстка (mobile-first)
- Поддержка светлой и тёмной темы

## ⚠️ Важные замечания

**Это НЕ медицинский сервис!** Приложение предназначено только для:
- Отслеживания питания и калорий
- Мотивации и геймификации
- Общего анализа прогресса

Для серьёзных вопросов по здоровью, диете или весу обратитесь к врачу или квалифицированному диетологу.

## 🔒 Безопасность и конфиденциальность

- Данные хранятся локально (SQLite)
- Данные отправляются только на сервер приложения и Gemini API
- Мы НЕ продаём и НЕ делимся твоей информацией
- Нет необходимости в регистрации

## 🐛 Возможные проблемы и решения

### "GEMINI_API_KEY не установлен"
Установи ключ в `backend/.env`:
```
GEMINI_API_KEY="твой_ключ"
```

### Ошибка подключения к БД
```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

### Фронтенд не подключается к бэкенду
Убедись, что:
1. Бэкенд запущен на `http://localhost:5000`
2. Фронтенд запущен на `http://localhost:3000`
3. В `frontend/vite.config.ts` правильный proxy

## 📝 Примеры использования

### Добавление приёма пищи
```
Время: 12:00
Описание: 2 яйца, 50г сыра, стакан молока
ИИ автоматически считает ~350 ккал
```

### Добавление измерения
```
Дата: 2024-01-15
Вес: 64.5 кг
Талия: 72 см
Грудь: 88 см
Бёдра: 92 см
```

## 📚 Дополнительные ресурсы

- [Документация Gemini API](https://ai.google.dev)
- [Документация Prisma](https://www.prisma.io/docs)
- [Документация Express](https://expressjs.com)
- [Документация Tailwind CSS](https://tailwindcss.com)
- [Документация React](https://react.dev)

## 📄 Лицензия

Этот проект создан в образовательных целях.

---

**Создано с ❤️ для здорового образа жизни**

Если у тебя есть вопросы или идеи - создавай issues или pull requests!
