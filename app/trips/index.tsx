import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { Appbar, Card, Chip, FAB, Text } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { getAllTrips, type Trip } from '../../lib/db';

function formatDateRange(start: string, end: string): string {
  const s = start.slice(0, 10);
  const e = end.slice(0, 10);
  return `${s} — ${e}`;
}

export default function TripsListScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    try {
      const list = await getAllTrips();
      setTrips(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleTripPress = (id: number) => {
    router.push(`/trips/${id}`);
  };

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Поездки" />
      </Appbar.Header>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="bodyLarge">Нет поездок.</Text>
          <Text variant="bodyMedium" style={styles.hint}>
            Нажмите + чтобы создать поездку
          </Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() => handleTripPress(item.id)}
            >
              <Card.Title
                title={item.title}
                subtitle={item.description || undefined}
                right={() =>
                  item.current ? (
                    <Chip compact style={styles.currentChip}>
                      Текущая
                    </Chip>
                  ) : null
                }
              />
              <Card.Content>
                <Text variant="bodySmall">
                  {formatDateRange(item.startDate, item.endDate)}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/trips/create')}
        label="Создать поездку"
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 88 },
  card: { marginBottom: 12 },
  currentChip: { marginRight: 8 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  hint: { opacity: 0.8 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
  },
});
