/**
 * Схема БД и миграция при первом запуске.
 */

export const CREATE_PLACES = `
  CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    visitlater INTEGER NOT NULL DEFAULT 1,
    liked INTEGER NOT NULL DEFAULT 0,
    latitude REAL,
    longitude REAL,
    createdAt TEXT NOT NULL
  );
`;

export const CREATE_PLACE_PHOTOS = `
  CREATE TABLE IF NOT EXISTS place_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    placeId INTEGER NOT NULL,
    filePath TEXT NOT NULL,
    FOREIGN KEY (placeId) REFERENCES places(id) ON DELETE CASCADE
  );
`;

export const CREATE_TRIPS = `
  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    current INTEGER NOT NULL DEFAULT 0
  );
`;

export const CREATE_TRIP_PLACES = `
  CREATE TABLE IF NOT EXISTS trip_places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tripId INTEGER NOT NULL,
    placeId INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    visited INTEGER NOT NULL DEFAULT 0,
    visitDate TEXT,
    notes TEXT DEFAULT '',
    FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (placeId) REFERENCES places(id)
  );
`;

export const CREATE_TRIP_PLACE_PHOTOS = `
  CREATE TABLE IF NOT EXISTS trip_place_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tripPlaceId INTEGER NOT NULL,
    filePath TEXT NOT NULL,
    FOREIGN KEY (tripPlaceId) REFERENCES trip_places(id) ON DELETE CASCADE
  );
`;

export const ALL_SCHEMAS = [
  CREATE_PLACES,
  CREATE_PLACE_PHOTOS,
  CREATE_TRIPS,
  CREATE_TRIP_PLACES,
  CREATE_TRIP_PLACE_PHOTOS,
];
