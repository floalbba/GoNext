# GoNext

Минимальное приложение на **Expo** (SDK 55) с **Expo Router**, **TypeScript** и **React Native Paper**.

## Требования

- Node.js 20.19+
- npm или yarn

## Установка и запуск

```powershell
# Установка зависимостей (уже выполнена при создании проекта)
npm install

# Запуск в режиме разработки
npx expo start
```

Далее откройте приложение в симуляторе/эмуляторе или сканируйте QR-код в Expo Go.

- **Веб:** `npx expo start --web`
- **Android:** `npx expo start --android`
- **iOS:** `npx expo start --ios`

## Структура

- `app/_layout.tsx` — корневой layout с `PaperProvider`
- `app/index.tsx` — экран Home: AppBar «GoNext», текст, кнопка и Snackbar

## Технологии

- Expo SDK 55.0.0
- Expo Router (file-based routing)
- React Native Paper
- TypeScript
