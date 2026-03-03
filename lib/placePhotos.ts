import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

/**
 * Хранение фотографий мест (MVP):
 * - Файлы сохраняются в documentDirectory приложения (офлайн, не удаляются системой).
 * - Путь к файлу записывается в БД (place_photos.filePath).
 * - Права: запрашиваются через ImagePicker (галерея/камера).
 */
const PLACES_PHOTOS_DIR = 'places_photos';

/**
 * Запрашивает разрешение и открывает галерею. Возвращает локальный путь к скопированному файлу или null.
 */
export async function pickAndSavePlacePhoto(placeId: number): Promise<string | null> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return null;

    const uri = result.assets[0].uri;
    const dir = `${FileSystem.documentDirectory}${PLACES_PHOTOS_DIR}/${placeId}`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const destPath = `${dir}/${Date.now()}.${ext}`;

    await FileSystem.copyAsync({ from: uri, to: destPath });
    return destPath;
  } catch {
    return null;
  }
}

/**
 * Запрашивает разрешение и открывает камеру. Возвращает локальный путь к скопированному файлу или null.
 */
export async function takeAndSavePlacePhoto(placeId: number): Promise<string | null> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return null;

    const uri = result.assets[0].uri;
    const dir = `${FileSystem.documentDirectory}${PLACES_PHOTOS_DIR}/${placeId}`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const destPath = `${dir}/${Date.now()}.${ext}`;

    await FileSystem.copyAsync({ from: uri, to: destPath });
    return destPath;
  } catch {
    return null;
  }
}

/**
 * Преобразует путь в file:// URI для отображения в Image.
 */
export function photoPathToUri(path: string): string {
  if (path.startsWith('file://')) return path;
  return `file://${path}`;
}
