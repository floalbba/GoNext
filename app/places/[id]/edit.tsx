import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Checkbox,
  Text,
  TextInput,
} from 'react-native-paper';
import { ScreenBackground } from '../../../components/ScreenBackground';
import { areCoordinatesValid, EXAMPLE_DD } from '../../../lib/coordinates';
import { getPlaceById, updatePlace } from '../../../lib/db';

export default function EditPlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const placeId = id ? parseInt(id, 10) : NaN;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visitLater, setVisitLater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [latStr, setLatStr] = useState('');
  const [lonStr, setLonStr] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const lat = latStr.trim() ? parseFloat(latStr) : null;
  const lon = lonStr.trim() ? parseFloat(lonStr) : null;
  const coordsValid = areCoordinatesValid(lat, lon);

  const loadPlace = useCallback(async () => {
    if (Number.isNaN(placeId)) return;
    setLoading(true);
    try {
      const place = await getPlaceById(placeId);
      if (place) {
        setName(place.name);
        setDescription(place.description);
        setVisitLater(place.visitlater === 1);
        setLiked(place.liked === 1);
        setLatStr(place.latitude != null ? String(place.latitude) : '');
        setLonStr(place.longitude != null ? String(place.longitude) : '');
      } else {
        router.back();
      }
    } finally {
      setLoading(false);
    }
  }, [placeId, router]);

  useEffect(() => {
    loadPlace();
  }, [loadPlace]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Введите название места');
      return;
    }
    if (!coordsValid) {
      if (latStr.trim() || lonStr.trim()) {
        setError(
          'Координаты в формате DD: широта от -90 до 90, долгота от -180 до 180. Пример: 55.744920, 37.604677'
        );
      } else {
        setError('Координаты в десятичных градусах (DD) или оставьте оба поля пустыми');
      }
      return;
    }
    setError('');
    setSaving(true);
    try {
      await updatePlace(placeId, {
        name: name.trim(),
        description: description.trim(),
        visitlater: visitLater ? 1 : 0,
        liked: liked ? 1 : 0,
        latitude: lat,
        longitude: lon,
      });
      router.back();
    } catch (e) {
      setError('Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Редактировать место" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          label="Название *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Описание"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <View style={styles.row}>
          <Checkbox.Item
            label="Посетить позже"
            status={visitLater ? 'checked' : 'unchecked'}
            onPress={() => setVisitLater(!visitLater)}
          />
        </View>
        <View style={styles.row}>
          <Checkbox.Item
            label="Понравилось"
            status={liked ? 'checked' : 'unchecked'}
            onPress={() => setLiked(!liked)}
          />
        </View>
        <TextInput
          label="Широта (DD)"
          value={latStr}
          onChangeText={setLatStr}
          mode="outlined"
          keyboardType="decimal-pad"
          placeholder={`Decimal Degrees, напр. ${EXAMPLE_DD.lat}`}
          style={styles.input}
        />
        <TextInput
          label="Долгота (DD)"
          value={lonStr}
          onChangeText={setLonStr}
          mode="outlined"
          keyboardType="decimal-pad"
          placeholder={`Decimal Degrees, напр. ${EXAMPLE_DD.lon}`}
          style={styles.input}
        />
        {error ? (
          <Text variant="bodySmall" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.button}
        >
          Сохранить
        </Button>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  input: { marginBottom: 12 },
  row: { marginVertical: 4 },
  error: { color: 'red', marginBottom: 8 },
  button: { marginTop: 16 },
});
