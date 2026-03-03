import { Linking, Platform } from 'react-native';

/**
 * Координаты в формате десятичных градусов (Decimal Degrees, DD).
 * Открытие места на карте и в навигаторе через Linking.openURL.
 */

/**
 * Открывает точку на карте.
 * Координаты в DD. iOS — Apple Maps, Android/Web — Google Maps.
 */
export function openOnMap(lat: number, lon: number): void {
  const url =
    Platform.OS === 'ios'
      ? `https://maps.apple.com/?q=${lat},${lon}`
      : `https://www.google.com/maps?q=${lat},${lon}`;
  Linking.openURL(url).catch(() => {});
}

/**
 * Открывает маршрут до точки в навигаторе (Google Maps).
 * Координаты в DD. URL с destination открывает приложение/сайт с построением маршрута.
 */
export function openInNavigator(lat: number, lon: number): void {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  Linking.openURL(url).catch(() => {});
}
