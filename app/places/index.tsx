import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { Appbar, Card, FAB, Text } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import {
  getAllPlaces,
  type Place,
} from '../../lib/db';

export default function PlacesListScreen() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlaces = useCallback(async () => {
    try {
      const list = await getAllPlaces();
      setPlaces(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const handlePlacePress = (id: number) => {
    router.push(`/places/${id}`);
  };

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Места" />
      </Appbar.Header>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : places.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="bodyLarge">Нет добавленных мест.</Text>
          <Text variant="bodyMedium" style={styles.hint}>
            Нажмите + чтобы добавить место
          </Text>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() => handlePlacePress(item.id)}
            >
              <Card.Title title={item.name} subtitle={item.description || undefined} />
              <Card.Content>
                <Text variant="bodySmall" numberOfLines={1}>
                  {item.latitude != null && item.longitude != null
                    ? `${item.latitude.toFixed(6)}, ${item.longitude.toFixed(6)} (DD)`
                    : 'Координаты не заданы'}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/places/create')}
        label="Добавить место"
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 88 },
  card: { marginBottom: 12 },
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
