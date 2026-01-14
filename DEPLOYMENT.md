# Deployment - Развёртывание приложения

## Локальное развёртывание

### Минимальные требования
- Node.js 16+
- npm или yarn
- 100 МБ свободного места
- Gemini API ключ

### Шаги установки

1. **Клонирование/распаковка проекта**
```bash
cd webkaon
```

2. **Установка зависимостей**
```bash
# Способ 1: Автоматически
npm run install-all

# Способ 2: Вручную
cd backend && npm install
cd ../frontend && npm install
cd ..
```

3. **Конфигурация**
```bash
# backend/.env
GEMINI_API_KEY="твой_ключ_от_https://makersuite.google.com/app/apikey"
DATABASE_URL="file:./nutrition_tracker.db"
NODE_ENV="development"
PORT=5000
```

4. **Инициализация БД**
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
cd ..
```

5. **Запуск**
```bash
# Способ 1: Одна команда (требует npm 7+)
npm run dev

# Способ 2: Два терминала
# Терминал 1
cd backend && npm run dev

# Терминал 2
cd frontend && npm run dev
```

6. **Открытие приложения**
```
http://localhost:3000
```

## Production развёртывание

### Сборка приложения

```bash
# Сборка обоих частей
npm run build

# Или отдельно
cd backend && npm run build
cd ../frontend && npm run build
```

### Запуск в production

**Бэкенд (Node.js сервер):**
```bash
cd backend
NODE_ENV=production npm start
```

**Фронтенд (статические файлы):**
- Скопируй содержимое `frontend/dist/` на веб-сервер (nginx, Apache, и т.д.)
- Или используй Node.js статический сервер

### Nginx конфиг примера

```nginx
server {
    listen 80;
    server_name твой-домен.ru;

    # Фронтенд (статические файлы)
    location / {
        root /var/www/nutrition-tracker/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API прокси
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker (опционально)

**Dockerfile для бэкенда:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/src ./src
COPY backend/prisma ./prisma

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
```

**Dockerfile для фронтенда:**
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Резервное копирование данных

### Резервная копия БД
```bash
# Просто скопируй файл
cp backend/nutrition_tracker.db backup/nutrition_tracker.db.$(date +%Y%m%d_%H%M%S)
```

### Автоматическое резервное копирование (cron)
```bash
# Добавь в crontab
0 2 * * * cp /path/to/nutrition_tracker.db /backup/nutrition_tracker.db.$(date +\%Y\%m\%d)
```

## Обновление приложения

1. **Скопируй новые файлы**
```bash
cp -r новый-вариант/* старый-вариант/
```

2. **Обнови зависимости**
```bash
cd backend && npm install
cd ../frontend && npm install
```

3. **Выполни миграции (если есть)**
```bash
cd backend
npm run prisma:migrate
```

4. **Перезапусти приложение**
```bash
# Убей старые процессы
pkill -f "npm run dev"

# Запусти заново
npm run dev
```

## Проблемы и решения

### Port 5000/3000 уже используется
```bash
# Linux/Mac - найти процесс
lsof -i :5000
# Убить процесс
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Gemini API ошибка "API key not valid"
- Проверь ключ в `backend/.env`
- Убедись, что API включен в Google Cloud Console
- Переиндексируй ключ (создай новый)

### БД не инициализируется
```bash
cd backend
rm -rf prisma/dev.db
npm run prisma:migrate
```

### Фронтенд не видит бэкенд API
- Проверь, что оба запущены
- Убедись, что proxy в `frontend/vite.config.ts` указан на правильный адрес
- Проверь CORS в бэкенде

## Мониторинг

### Логирование
```bash
# Сохранять логи в файл
cd backend
npm run dev > logs.txt 2>&1 &
```

### Проверка здоровья
```bash
curl http://localhost:5000/api/health
```

## Оптимизация для production

1. **Включи кеширование**
```javascript
// backend - добавь в middleware
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

2. **Сжатие ответов**
```bash
npm install compression
```

3. **Rate limiting**
```bash
npm install express-rate-limit
```

4. **HTTPS/SSL**
- Используй Let's Encrypt для бесплатного сертификата
- Настрой редирект с HTTP на HTTPS

## Система мониторинга

### Свободное место на диске
```bash
df -h
```

### Использование памяти
```bash
free -h
ps aux | grep node
```

### Логирование ошибок
```bash
# Мониторь логи в real-time
tail -f backend/app.log
```

## Безопасность

1. **Переменные окружения**
   - Никогда не коммитай `.env`
   - Используй `.env.example` для документации

2. **База данных**
   - Резервное копирование каждый день
   - Ограничивай доступ к файлам БД

3. **API**
   - Используй HTTPS в production
   - Добавь rate limiting
   - Валидируй все входные данные

4. **Gemini API**
   - Используй различные ключи для dev/prod
   - Мониторь использование API (может быть платным)

---

**Удачи с развёртыванием! 🚀**
