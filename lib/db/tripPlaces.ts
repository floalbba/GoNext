import { getDb } from './database';
import type { TripPlace, TripPlacePhoto } from './types';

export interface TripPlaceWithPlace extends TripPlace {
  placeName: string;
  placeDescription: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function getTripPlaces(tripId: number): Promise<TripPlace[]> {
  const db = getDb();
  const rows = await db.getAllAsync<TripPlace>(
    'SELECT id, tripId, placeId, "order", visited, visitDate, notes FROM trip_places WHERE tripId = ? ORDER BY "order"',
    tripId
  );
  return rows ?? [];
}

export async function getTripPlacesWithPlaceInfo(
  tripId: number
): Promise<TripPlaceWithPlace[]> {
  const db = getDb();
  const rows = await db.getAllAsync<TripPlaceWithPlace>(
    `SELECT tp.id, tp.tripId, tp.placeId, tp."order", tp.visited, tp.visitDate, tp.notes,
            p.name as placeName, p.description as placeDescription, p.latitude, p.longitude
     FROM trip_places tp
     LEFT JOIN places p ON p.id = tp.placeId
     WHERE tp.tripId = ?
     ORDER BY tp."order"`,
    tripId
  );
  return rows ?? [];
}

export async function getTripPlaceById(id: number): Promise<TripPlace | null> {
  const db = getDb();
  const rows = await db.getAllAsync<TripPlace>(
    'SELECT id, tripId, placeId, "order", visited, visitDate, notes FROM trip_places WHERE id = ?',
    id
  );
  return rows?.[0] ?? null;
}

export async function addPlaceToTrip(
  tripId: number,
  placeId: number,
  order: number
): Promise<number> {
  const db = getDb();
  const result = await db.runAsync(
    'INSERT INTO trip_places (tripId, placeId, "order", visited, notes) VALUES (?, ?, ?, 0, ?)',
    tripId,
    placeId,
    order,
    ''
  );
  return result.lastInsertRowId;
}

export async function updateTripPlaceOrder(tripPlaceId: number, order: number): Promise<void> {
  const db = getDb();
  await db.runAsync('UPDATE trip_places SET "order" = ? WHERE id = ?', order, tripPlaceId);
}

export async function markTripPlaceVisited(
  tripPlaceId: number,
  visited: boolean,
  visitDate?: string
): Promise<void> {
  const db = getDb();
  await db.runAsync(
    'UPDATE trip_places SET visited = ?, visitDate = ? WHERE id = ?',
    visited ? 1 : 0,
    visitDate ?? null,
    tripPlaceId
  );
}

export async function updateTripPlaceNotes(tripPlaceId: number, notes: string): Promise<void> {
  const db = getDb();
  await db.runAsync('UPDATE trip_places SET notes = ? WHERE id = ?', notes, tripPlaceId);
}

export async function removePlaceFromTrip(tripPlaceId: number): Promise<void> {
  const db = getDb();
  await db.runAsync('DELETE FROM trip_place_photos WHERE tripPlaceId = ?', tripPlaceId);
  await db.runAsync('DELETE FROM trip_places WHERE id = ?', tripPlaceId);
}

// --- Trip place photos ---

export async function getTripPlacePhotos(tripPlaceId: number): Promise<TripPlacePhoto[]> {
  const db = getDb();
  const rows = await db.getAllAsync<TripPlacePhoto>(
    'SELECT id, tripPlaceId, filePath FROM trip_place_photos WHERE tripPlaceId = ? ORDER BY id',
    tripPlaceId
  );
  return rows ?? [];
}

export async function addTripPlacePhoto(
  tripPlaceId: number,
  filePath: string
): Promise<number> {
  const db = getDb();
  const result = await db.runAsync(
    'INSERT INTO trip_place_photos (tripPlaceId, filePath) VALUES (?, ?)',
    tripPlaceId,
    filePath
  );
  return result.lastInsertRowId;
}

export async function removeTripPlacePhoto(id: number): Promise<void> {
  const db = getDb();
  await db.runAsync('DELETE FROM trip_place_photos WHERE id = ?', id);
}
