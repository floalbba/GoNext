import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Appbar,
  Button,
  Card,
  IconButton,
  Menu,
  Text,
} from 'react-native-paper';
import { ScreenBackground } from '../../../components/ScreenBackground';
import {
  addPlacePhoto,
  deletePlace,
  getPlaceById,
  getPlacePhotos,
  removePlacePhoto,
} from '../../../lib/db';
import type { Place, PlacePhoto } from '../../../lib/db';
import { openInNavigator, openOnMap } from '../../../lib/maps';
import {
  photoPathToUri,
  pickAndSavePlacePhoto,
  takeAndSavePlacePhoto,
} from '../../../lib/placePhotos';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const placeId = id ? parseInt(id, 10) : NaN;
  const [place, setPlace] = useState<Place | null>(null);
  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoMenuVisible, setPhotoMenuVisible] = useState(false);

  const load = useCallback(async () => {
    if (Number.isNaN(placeId)) return;
    setLoading(true);
    try {
      const p = await getPlaceById(placeId);
      setPlace(p);
      if (p) {
        const list = await getPlacePhotos(placeId);
        setPhotos(list);
      }
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenMap = () => {
    if (place?.latitude != null && place?.longitude != null) {
      openOnMap(place.latitude, place.longitude);
    }
  };

  const handleOpenInNavigator = () => {
    if (place?.latitude != null && place?.longitude != null) {
      openInNavigator(place.latitude, place.longitude);
    }
  };

  const handleAddPhoto = async (source: 'gallery' | 'camera') => {
    if (Number.isNaN(placeId)) return;
    setPhotoMenuVisible(false);
    const path =
      source === 'gallery'
        ? await pickAndSavePlacePhoto(placeId)
        : await takeAndSavePlacePhoto(placeId);
    if (path) {
      await addPlacePhoto(placeId, path);
      load();
    }
  };

  const handleRemovePhoto = (photoId: number) => {
    Alert.alert('Удалить фото?', undefined, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await removePlacePhoto(photoId);
          load();
        },
      },
    ]);
  };

  const handleEdit = () => {
    router.push(`/places/${placeId}/edit`);
  };

  const handleDelete = () => {
    Alert.alert('Удалить место?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await deletePlace(placeId);
          router.replace('/places');
        },
      },
    ]);
  };

  if (loading || !place) {
    return (
      <ScreenBackground style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Место" />
        </Appbar.Header>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenBackground>
    );
  }

  const hasCoords =
    place.latitude != null && place.longitude != null;

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={place.name} />
        <Menu
          visible={photoMenuVisible}
          onDismiss={() => setPhotoMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="camera-plus"
              onPress={() => setPhotoMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={() => handleAddPhoto('gallery')} title="Галерея" />
          <Menu.Item onPress={() => handleAddPhoto('camera')} title="Камера" />
        </Menu>
        <Appbar.Action icon="pencil" onPress={handleEdit} />
        <Appbar.Action icon="delete" onPress={handleDelete} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {place.description ? (
          <Text variant="bodyLarge" style={styles.description}>
            {place.description}
          </Text>
        ) : null}
        <View style={styles.chips}>
          <Chip label={place.visitlater ? 'Посетить позже' : 'Не в планах'} />
          <Chip label={place.liked ? 'Понравилось' : ''} />
        </View>
        {hasCoords ? (
          <Text variant="bodySmall" style={styles.coords}>
            {place.latitude?.toFixed(6)}, {place.longitude?.toFixed(6)} (DD)
          </Text>
        ) : null}
        <View style={styles.mapButtons}>
          <Button
            mode="outlined"
            icon="map-marker"
            onPress={handleOpenMap}
            disabled={!hasCoords}
            style={styles.mapButton}
          >
            Открыть на карте
          </Button>
          <Button
            mode="outlined"
            icon="navigation"
            onPress={handleOpenInNavigator}
            disabled={!hasCoords}
            style={styles.mapButton}
          >
            Открыть в навигаторе
          </Button>
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Фотографии
        </Text>
        {photos.length === 0 ? (
          <Text variant="bodySmall" style={styles.hint}>
            Нажмите + в шапке, чтобы добавить фото из галереи или камеры.
          </Text>
        ) : (
          <View style={styles.photosRow}>
            {photos.map((item) => (
              <Card key={item.id} style={styles.photoCard}>
                <Image
                  source={{ uri: photoPathToUri(item.filePath) }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleRemovePhoto(item.id)}
                  style={styles.photoDelete}
                />
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

function Chip({ label }: { label: string }) {
  if (!label) return null;
  return (
    <View style={chipStyles.chip}>
      <Text variant="labelSmall">{label}</Text>
    </View>
  );
}
const chipStyles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  description: { marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  coords: { opacity: 0.8, marginBottom: 12 },
  mapButtons: { gap: 12, marginBottom: 24 },
  mapButton: {},
  sectionTitle: { marginBottom: 8 },
  hint: { opacity: 0.8, marginBottom: 16 },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  photoCard: {
    width: 140,
    height: 140,
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%' },
  photoDelete: { position: 'absolute', right: 0, top: 0, margin: 0 },
});
