/**
 * Координаты в формате десятичных градусов (Decimal Degrees, DD).
 * Пример: Храм Христа Спасителя — 55.744920, 37.604677
 */

export const DD = {
  /** Широта: от -90 до 90 */
  latMin: -90,
  latMax: 90,
  /** Долгота: от -180 до 180 */
  lonMin: -180,
  lonMax: 180,
} as const;

export function isLatitudeValid(lat: number): boolean {
  return lat >= DD.latMin && lat <= DD.latMax && !Number.isNaN(lat);
}

export function isLongitudeValid(lon: number): boolean {
  return lon >= DD.lonMin && lon <= DD.lonMax && !Number.isNaN(lon);
}

export function areCoordinatesValid(
  lat: number | null,
  lon: number | null
): boolean {
  if (lat === null && lon === null) return true;
  if (lat === null || lon === null) return false;
  return isLatitudeValid(lat) && isLongitudeValid(lon);
}

/** Пример координат для подсказок (Храм Христа Спасителя) */
export const EXAMPLE_DD = { lat: 55.74492, lon: 37.604677 };
