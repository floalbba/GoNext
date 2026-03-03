import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Text, TextInput } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { createTrip } from '../../lib/db';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CreateTripScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      const id = await createTrip({
        title: title.trim(),
        description: description.trim(),
        startDate: start,
        endDate: end,
        current: 0,
      });
      router.replace(`/trips/${id}`);
    } catch (e) {
      setError('Не удалось создать поездку');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Новая поездка" />
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
          Создать
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
