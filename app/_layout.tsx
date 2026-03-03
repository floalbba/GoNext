import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { initDb } from '../lib/db';

export default function RootLayout() {
  useEffect(() => {
    initDb().catch((e) => console.error('Ошибка инициализации БД:', e));
  }, []);

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
