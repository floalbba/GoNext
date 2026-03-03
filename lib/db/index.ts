/**
 * Слой доступа к данным: БД SQLite и CRUD для мест, поездок и мест в поездке.
 */

export { initDb, getDb, closeDb } from './database';
export * from './schema';
export * from './types';
export * from './places';
export * from './trips';
export * from './tripPlaces';
export type { TripPlaceWithPlace } from './tripPlaces';
