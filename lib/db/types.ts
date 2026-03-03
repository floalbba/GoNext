/**
 * Типы сущностей для локальной БД (PROJECT.md).
 */

export interface Place {
  id: number;
  name: string;
  description: string;
  visitlater: number; // 0 | 1
  liked: number; // 0 | 1
  /** Широта в десятичных градусах (Decimal Degrees, DD), от -90 до 90 */
  latitude: number | null;
  /** Долгота в десятичных градусах (Decimal Degrees, DD), от -180 до 180 */
  longitude: number | null;
  createdAt: string; // ISO
}

export interface PlacePhoto {
  id: number;
  placeId: number;
  filePath: string;
}

export interface Trip {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  current: number; // 0 | 1
}

export interface TripPlace {
  id: number;
  tripId: number;
  placeId: number;
  order: number;
  visited: number; // 0 | 1
  visitDate: string | null; // ISO
  notes: string;
}

export interface TripPlacePhoto {
  id: number;
  tripPlaceId: number;
  filePath: string;
}
