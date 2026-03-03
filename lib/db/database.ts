import {
  openDatabaseAsync,
  type SQLiteDatabase,
} from 'expo-sqlite';
import { ALL_SCHEMAS } from './schema';

const DB_NAME = 'gonext.db';

let dbInstance: SQLiteDatabase | null = null;

/**
 * Инициализация БД: создание таблиц при первом запуске.
 * Все данные хранятся локально (офлайн), интернет не требуется.
 */
export async function initDb(): Promise<SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  const db = await openDatabaseAsync(DB_NAME);
  for (const sql of ALL_SCHEMAS) {
    await db.execAsync(sql);
  }
  dbInstance = db;
  return db;
}

/**
 * Получить экземпляр БД (перед первым использованием вызвать initDb).
 */
export function getDb(): SQLiteDatabase {
  if (!dbInstance) {
    throw new Error('База данных не инициализирована. Вызовите initDb() при старте приложения.');
  }
  return dbInstance;
}

/**
 * Закрыть БД (для тестов или сброса).
 */
export async function closeDb(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}
