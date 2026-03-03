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
  Checkbox,
  Chip,
  IconButton,
  List,
  Menu,
  Modal,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { ScreenBackground } from '../../../components/ScreenBackground';
import {
  addPlaceToTrip,
  addTripPlacePhoto,
  getTripPlacePhotos,
  getTripPlacesWithPlaceInfo,
  markTripPlaceVisited,
  removePlaceFromTrip,
  removeTripPlacePhoto,
  setCurrentTrip,
  updateTripPlaceOrder,
  updateTripPlaceNotes,
} from '../../../lib/db';
import type { TripPlacePhoto } from '../../../lib/db';
import type { TripPlaceWithPlace } from '../../../lib/db';
import { getAllPlaces } from '../../../lib/db';
import type { Place } from '../../../lib/db';
import { getTripById } from '../../../lib/db';
import type { Trip } from '../../../lib/db';
import { openInNavigator, openOnMap } from '../../../lib/maps';
import { photoPathToUri } from '../../../lib/placePhotos';
import {
  pickAndSaveTripPlacePhoto,
  takeAndSaveTripPlacePhoto,
} from '../../../lib/tripPlacePhotos';

function formatDate(s: string | null): string {
  if (!s) return '';
  return s.slice(0, 10);
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tripId = id ? parseInt(id, 10) : NaN;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<TripPlaceWithPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [addPlaceModalVisible, setAddPlaceModalVisible] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState<Place[]>([]);
  const [notesModal, setNotesModal] = useState<{ tripPlaceId: number; notes: string } | null>(null);
  const [photoMenuTripPlaceId, setPhotoMenuTripPlaceId] = useState<number | null>(null);
  const [photosRefresh, setPhotosRefresh] = useState(0);

  const load = useCallback(async () => {
    if (Number.isNaN(tripId)) return;
    setLoading(true);
    try {
      const t = await getTripById(tripId);
      setTrip(t);
      if (t) {
        const list = await getTripPlacesWithPlaceInfo(tripId);
        setItems(list);
      }
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  const openAddPlaceModal = useCallback(async () => {
    const all = await getAllPlaces();
    const used = new Set(items.map((i) => i.placeId));
    setAvailablePlaces(all.filter((p) => !used.has(p.id)));
    setAddPlaceModalVisible(true);
  }, [items]);

  const handleAddPlace = async (placeId: number) => {
    await addPlaceToTrip(tripId, placeId, items.length);
    setAddPlaceModalVisible(false);
    load();
  };

  const handleSetCurrent = async () => {
    await setCurrentTrip(tripId);
    load();
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const a = items[index];
    const b = items[index - 1];
    await updateTripPlaceOrder(a.id, b.order);
    await updateTripPlaceOrder(b.id, a.order);
    load();
  };

  const handleMoveDown = async (index: number) => {
    if (index >= items.length - 1) return;
    const a = items[index];
    const b = items[index + 1];
    await updateTripPlaceOrder(a.id, b.order);
    await updateTripPlaceOrder(b.id, a.order);
    load();
  };

  const handleToggleVisited = async (tp: TripPlaceWithPlace) => {
    const next = tp.visited === 1 ? 0 : 1;
    await markTripPlaceVisited(tp.id, next === 1, next === 1 ? new Date().toISOString().slice(0, 10) : undefined);
    load();
  };

  const handleRemoveFromTrip = (tp: TripPlaceWithPlace) => {
    Alert.alert('Удалить место из маршрута?', undefined, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await removePlaceFromTrip(tp.id); load(); } },
    ]);
  };

  const handleSaveNotes = async () => {
    if (!notesModal) return;
    await updateTripPlaceNotes(notesModal.tripPlaceId, notesModal.notes);
    setNotesModal(null);
    load();
  };

  const handleAddPhoto = async (tripPlaceId: number, source: 'gallery' | 'camera') => {
    setPhotoMenuTripPlaceId(null);
    const path = source === 'gallery'
      ? await pickAndSaveTripPlacePhoto(tripPlaceId)
      : await takeAndSaveTripPlacePhoto(tripPlaceId);
    if (path) {
      await addTripPlacePhoto(tripPlaceId, path);
      setPhotosRefresh((t) => t + 1);
    }
  };

  if (loading || !trip) {
    return (
      <ScreenBackground style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Поездка" />
        </Appbar.Header>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenBackground>
    );
  }

  const dateRange = `${trip.startDate.slice(0, 10)} — ${trip.endDate.slice(0, 10)}`;

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={trip.title} />
        {!trip.current ? (
          <Appbar.Action icon="star" onPress={handleSetCurrent} />
        ) : null}
        <Appbar.Action icon="pencil" onPress={() => router.push(`/trips/${tripId}/edit`)} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {trip.description ? (
          <Text variant="bodyMedium" style={styles.description}>
            {trip.description}
          </Text>
        ) : null}
        <Text variant="bodySmall" style={styles.dates}>
          {dateRange}
        </Text>
        {!trip.current ? (
          <Button mode="outlined" onPress={handleSetCurrent} style={styles.currentBtn}>
            Сделать текущей поездкой
          </Button>
        ) : (
          <Chip icon="star" style={styles.currentChip}>{'Текущая поездка'}</Chip>
        )}

        <View style={styles.sectionRow}>
          <Text variant="titleMedium">Маршрут</Text>
          <Button mode="contained-tonal" compact onPress={openAddPlaceModal} icon="plus">
            Добавить место
          </Button>
        </View>

        {items.length === 0 ? (
          <Text variant="bodySmall" style={styles.hint}>
            Добавьте места из списка «Места».
          </Text>
        ) : (
          items.map((tp, index) => (
            <TripPlaceCard
              key={tp.id}
              item={tp}
              index={index}
              total={items.length}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              onToggleVisited={() => handleToggleVisited(tp)}
              onRemove={() => handleRemoveFromTrip(tp)}
              onEditNotes={() => setNotesModal({ tripPlaceId: tp.id, notes: tp.notes })}
              onOpenMap={
                tp.latitude != null && tp.longitude != null
                  ? () => openOnMap(tp.latitude!, tp.longitude!)
                  : undefined
              }
              onOpenInNavigator={
                tp.latitude != null && tp.longitude != null
                  ? () => openInNavigator(tp.latitude!, tp.longitude!)
                  : undefined
              }
              onAddPhoto={() => setPhotoMenuTripPlaceId(tp.id)}
              photoMenuVisible={photoMenuTripPlaceId === tp.id}
              onDismissPhotoMenu={() => setPhotoMenuTripPlaceId(null)}
              onPickPhoto={() => handleAddPhoto(tp.id, 'gallery')}
              onTakePhoto={() => handleAddPhoto(tp.id, 'camera')}
              onReload={load}
              onPhotoRemoved={() => setPhotosRefresh((t) => t + 1)}
              photosRefresh={photosRefresh}
            />
          ))
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={addPlaceModalVisible}
          onDismiss={() => setAddPlaceModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalInner}>
            <Text variant="titleMedium">Выберите место</Text>
            {availablePlaces.length === 0 ? (
              <Text variant="bodySmall">Нет доступных мест или все уже добавлены.</Text>
            ) : (
              <ScrollView style={styles.modalList}>
                {availablePlaces.map((p) => (
                  <List.Item
                    key={p.id}
                    title={p.name}
                    onPress={() => handleAddPlace(p.id)}
                  />
                ))}
              </ScrollView>
            )}
            <Button onPress={() => setAddPlaceModalVisible(false)}>Закрыть</Button>
          </View>
        </Modal>

        {notesModal ? (
          <Modal visible={!!notesModal} onDismiss={() => setNotesModal(null)} contentContainerStyle={styles.modal}>
            <View style={styles.modalInner}>
              <Text variant="titleMedium">Заметки о посещении</Text>
              <TextInput
                value={notesModal.notes}
                onChangeText={(notes) => setNotesModal((m) => (m ? { ...m, notes } : null))}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.notesInput}
              />
              <View style={styles.modalButtons}>
                <Button onPress={() => setNotesModal(null)}>Отмена</Button>
                <Button onPress={handleSaveNotes}>Сохранить</Button>
              </View>
            </View>
          </Modal>
        ) : null}
      </Portal>
    </ScreenBackground>
  );
}

function TripPlaceCard({
  item,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onToggleVisited,
  onRemove,
  onEditNotes,
  onOpenMap,
  onOpenInNavigator,
  onAddPhoto,
  photoMenuVisible,
  onDismissPhotoMenu,
  onPickPhoto,
  onTakePhoto,
  onPhotoRemoved,
  photosRefresh,
}: {
  item: TripPlaceWithPlace;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisited: () => void;
  onRemove: () => void;
  onEditNotes: () => void;
  onOpenMap?: () => void;
  onOpenInNavigator?: () => void;
  onAddPhoto: () => void;
  photoMenuVisible: boolean;
  onDismissPhotoMenu: () => void;
  onPickPhoto: () => void;
  onTakePhoto: () => void;
  onPhotoRemoved: () => void;
  photosRefresh: number;
}) {
  const [photos, setPhotos] = useState<TripPlacePhoto[]>([]);
  useEffect(() => {
    getTripPlacePhotos(item.id).then(setPhotos);
  }, [item.id, photosRefresh]);

  return (
    <Card style={styles.placeCard}>
      <Card.Content>
        <View style={styles.placeRow}>
          <View style={styles.orderButtons}>
            <IconButton icon="chevron-up" size={20} onPress={onMoveUp} disabled={index === 0} />
            <Text variant="labelMedium">{index + 1}</Text>
            <IconButton icon="chevron-down" size={20} onPress={onMoveDown} disabled={index === total - 1} />
          </View>
          <View style={styles.placeMain}>
            <Text variant="titleSmall">{item.placeName}</Text>
            <View style={styles.visitedRow}>
              <Checkbox.Item
                label="Посещено"
                status={item.visited ? 'checked' : 'unchecked'}
                onPress={onToggleVisited}
                style={styles.checkboxItem}
              />
            </View>
            {item.visited && item.visitDate ? (
              <Text variant="bodySmall">Дата: {formatDate(item.visitDate)}</Text>
            ) : null}
            <View style={styles.placeActions}>
              <Button compact onPress={onEditNotes}>
                {item.notes ? 'Изменить заметки' : 'Заметки'}
              </Button>
              {onOpenMap ? (
                <Button compact onPress={onOpenMap}>На карте</Button>
              ) : null}
              {onOpenInNavigator ? (
                <Button compact onPress={onOpenInNavigator}>В навигатор</Button>
              ) : null}
              <Menu
                visible={photoMenuVisible}
                onDismiss={onDismissPhotoMenu}
                anchor={<Button compact onPress={onAddPhoto}>Фото</Button>}
                contentStyle={styles.menuContent}
              >
                <Menu.Item onPress={onPickPhoto} title="Галерея" />
                <Menu.Item onPress={onTakePhoto} title="Камера" />
              </Menu>
              <IconButton icon="delete" size={20} onPress={onRemove} />
            </View>
            {item.notes ? (
              <Text variant="bodySmall" style={styles.notesPreview}>
                {item.notes}
              </Text>
            ) : null}
            {photos.length > 0 ? (
              <View style={styles.photosRow}>
                {photos.map((ph) => (
                  <TripPlacePhotoThumb key={ph.id} photoId={ph.id} filePath={ph.filePath} onRemove={onPhotoRemoved} />
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

function TripPlacePhotoThumb({
  photoId,
  filePath,
  onRemove,
}: {
  photoId: number;
  filePath: string;
  onRemove: () => void;
}) {
  const handleRemove = () => {
    Alert.alert('Удалить фото?', undefined, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          const { removeTripPlacePhoto } = await import('../../../lib/db');
          await removeTripPlacePhoto(photoId);
          onRemove();
        },
      },
    ]);
  };

  return (
    <View style={thumbStyles.wrap}>
      <Image source={{ uri: photoPathToUri(filePath) }} style={thumbStyles.img} resizeMode="cover" />
      <IconButton icon="close" size={16} onPress={handleRemove} style={thumbStyles.del} />
    </View>
  );
}

const thumbStyles = StyleSheet.create({
  wrap: { width: 64, height: 64, marginRight: 8, position: 'relative' },
  img: { width: '100%', height: '100%', borderRadius: 8 },
  del: { position: 'absolute', right: -8, top: -8, margin: 0 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  description: { marginBottom: 8 },
  dates: { marginBottom: 12 },
  currentBtn: { marginBottom: 16 },
  currentChip: { alignSelf: 'flex-start', marginBottom: 16 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  hint: { marginBottom: 16 },
  placeCard: { marginBottom: 12 },
  placeRow: { flexDirection: 'row' },
  orderButtons: { alignItems: 'center', marginRight: 12 },
  placeMain: { flex: 1 },
  visitedRow: { marginVertical: 4 },
  checkboxItem: { marginLeft: -12 },
  placeActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 4 },
  notesPreview: { marginTop: 4, fontStyle: 'italic' },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  modal: { margin: 24, backgroundColor: 'white', borderRadius: 8, padding: 16 },
  modalInner: { maxHeight: 400 },
  modalList: { maxHeight: 280 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
  notesInput: { marginVertical: 12 },
  menuContent: { backgroundColor: 'white' },
});
