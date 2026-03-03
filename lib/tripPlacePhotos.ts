import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

/**
 * Хранение фотографий по посещению (MVP):
 * - Файлы в documentDirectory (офлайн), пути в trip_place_photos.filePath.
 * - Права через ImagePicker (галерея/камера).
 */
const TRIP_PLACE_PHOTOS_DIR = 'trip_place_photos';

export async function pickAndSaveTripPlacePhoto(
  tripPlaceId: number
): Promise<string | null> {
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
    const dir = `${FileSystem.documentDirectory}${TRIP_PLACE_PHOTOS_DIR}/${tripPlaceId}`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const destPath = `${dir}/${Date.now()}.${ext}`;

    await FileSystem.copyAsync({ from: uri, to: destPath });
    return destPath;
  } catch {
    return null;
  }
}

export async function takeAndSaveTripPlacePhoto(
  tripPlaceId: number
): Promise<string | null> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return null;

    const uri = result.assets[0].uri;
    const dir = `${FileSystem.documentDirectory}${TRIP_PLACE_PHOTOS_DIR}/${tripPlaceId}`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const destPath = `${dir}/${Date.now()}.${ext}`;

    await FileSystem.copyAsync({ from: uri, to: destPath });
    return destPath;
  } catch {
    return null;
  }
}
