import { getDb } from './database';
import type { Place, PlacePhoto } from './types';

export async function getAllPlaces(): Promise<Place[]> {
  const db = getDb();
  const rows = await db.getAllAsync<Place>(
    'SELECT id, name, description, visitlater, liked, latitude, longitude, createdAt FROM places ORDER BY createdAt DESC'
  );
  return rows ?? [];
}

export async function getPlaceById(id: number): Promise<Place | null> {
  const db = getDb();
  const rows = await db.getAllAsync<Place>(
    'SELECT id, name, description, visitlater, liked, latitude, longitude, createdAt FROM places WHERE id = ?',
    id
  );
  return rows?.[0] ?? null;
}

export async function createPlace(
  data: Omit<Place, 'id'> & { createdAt?: string }
): Promise<number> {
  const db = getDb();
  const createdAt = data.createdAt ?? new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO places (name, description, visitlater, liked, latitude, longitude, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.name,
    data.description ?? '',
    data.visitlater ?? 1,
    data.liked ?? 0,
    data.latitude ?? null,
    data.longitude ?? null,
    createdAt
  );
  return result.lastInsertRowId;
}

export async function updatePlace(id: number, data: Partial<Omit<Place, 'id'>>): Promise<void> {
  const db = getDb();
  const place = await getPlaceById(id);
  if (!place) return;
  await db.runAsync(
    `UPDATE places SET name = ?, description = ?, visitlater = ?, liked = ?, latitude = ?, longitude = ?
     WHERE id = ?`,
    data.name ?? place.name,
    data.description ?? place.description,
    data.visitlater ?? place.visitlater,
    data.liked ?? place.liked,
    data.latitude ?? place.latitude,
    data.longitude ?? place.longitude,
    id
  );
}

export async function deletePlace(id: number): Promise<void> {
  const db = getDb();
  await db.runAsync('DELETE FROM place_photos WHERE placeId = ?', id);
  await db.runAsync('DELETE FROM places WHERE id = ?', id);
}

// --- Place photos ---

export async function getPlacePhotos(placeId: number): Promise<PlacePhoto[]> {
  const db = getDb();
  const rows = await db.getAllAsync<PlacePhoto>(
    'SELECT id, placeId, filePath FROM place_photos WHERE placeId = ? ORDER BY id',
    placeId
  );
  return rows ?? [];
}

export async function addPlacePhoto(placeId: number, filePath: string): Promise<number> {
  const db = getDb();
  const result = await db.runAsync(
    'INSERT INTO place_photos (placeId, filePath) VALUES (?, ?)',
    placeId,
    filePath
  );
  return result.lastInsertRowId;
}

export async function removePlacePhoto(id: number): Promise<void> {
  const db = getDb();
  await db.runAsync('DELETE FROM place_photos WHERE id = ?', id);
}
