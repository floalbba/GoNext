import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Text, TextInput } from 'react-native-paper';
import { ScreenBackground } from '../../../components/ScreenBackground';
import { getTripById, updateTrip } from '../../../lib/db';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tripId = id ? parseInt(id, 10) : NaN;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadTrip = useCallback(async () => {
    if (Number.isNaN(tripId)) return;
    setLoading(true);
    try {
      const trip = await getTripById(tripId);
      if (trip) {
        setTitle(trip.title);
        setDescription(trip.description);
        setStartDate(trip.startDate.slice(0, 10));
        setEndDate(trip.endDate.slice(0, 10));
      } else {
        router.back();
      }
    } finally {
      setLoading(false);
    }
  }, [tripId, router]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Введите название поездки');
      return;
    }
    const start = startDate.trim() || todayISO();
    const end = endDate.trim() || todayISO();
    if (end < start) {
      setError('Дата окончания не может быть раньше даты начала');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await updateTrip(tripId, {
        title: title.trim(),
        description: description.trim(),
        startDate: start,
        endDate: end,
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
        <Appbar.Content title="Редактировать поездку" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          label="Название *"
          value={title}
          onChangeText={setTitle}
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
        <TextInput
          label="Дата начала"
          value={startDate}
          onChangeText={setStartDate}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />
        <TextInput
          label="Дата окончания"
          value={endDate}
          onChangeText={setEndDate}
          mode="outlined"
          placeholder="YYYY-MM-DD"
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
  error: { color: 'red', marginBottom: 8 },
  button: { marginTop: 16 },
});
