import { getDb } from './database';
import type { Trip } from './types';

export async function getAllTrips(): Promise<Trip[]> {
  const db = getDb();
  const rows = await db.getAllAsync<Trip>(
    'SELECT id, title, description, startDate, endDate, createdAt, current FROM trips ORDER BY startDate DESC'
  );
  return rows ?? [];
}

export async function getTripById(id: number): Promise<Trip | null> {
  const db = getDb();
  const rows = await db.getAllAsync<Trip>(
    'SELECT id, title, description, startDate, endDate, createdAt, current FROM trips WHERE id = ?',
    id
  );
  return rows?.[0] ?? null;
}

export async function getCurrentTrip(): Promise<Trip | null> {
  const db = getDb();
  const rows = await db.getAllAsync<Trip>(
    'SELECT id, title, description, startDate, endDate, createdAt, current FROM trips WHERE current = 1 LIMIT 1'
  );
  return rows?.[0] ?? null;
}

export async function createTrip(
  data: Omit<Trip, 'id'> & { createdAt?: string }
): Promise<number> {
  const db = getDb();
  const createdAt = data.createdAt ?? new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO trips (title, description, startDate, endDate, createdAt, current)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.title,
    data.description ?? '',
    data.startDate,
    data.endDate,
    createdAt,
    data.current ?? 0
  );
  return result.lastInsertRowId;
}

export async function updateTrip(id: number, data: Partial<Omit<Trip, 'id'>>): Promise<void> {
  const db = getDb();
  const trip = await getTripById(id);
  if (!trip) return;
  await db.runAsync(
    `UPDATE trips SET title = ?, description = ?, startDate = ?, endDate = ?, current = ?
     WHERE id = ?`,
    data.title ?? trip.title,
    data.description ?? trip.description,
    data.startDate ?? trip.startDate,
    data.endDate ?? trip.endDate,
    data.current ?? trip.current,
    id
  );
}

export async function setCurrentTrip(tripId: number): Promise<void> {
  const db = getDb();
  await db.runAsync('UPDATE trips SET current = 0');
  await db.runAsync('UPDATE trips SET current = 1 WHERE id = ?', tripId);
}

export async function deleteTrip(id: number): Promise<void> {
  const db = getDb();
  await db.runAsync('DELETE FROM trip_places WHERE tripId = ?', id);
  await db.runAsync('DELETE FROM trips WHERE id = ?', id);
}
