import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Text } from 'react-native-paper';
import { ScreenBackground } from '../components/ScreenBackground';
import { getNextPlace } from '../lib/db';
import type { TripPlaceWithPlace } from '../lib/db';
import type { Trip } from '../lib/db';
import { openInNavigator, openOnMap } from '../lib/maps';

type NextState =
  | { status: 'loading' }
  | { status: 'no-trip' }
  | { status: 'all-visited'; tripTitle: string }
  | { status: 'has-place'; trip: Trip; place: TripPlaceWithPlace };

export default function NextPlaceScreen() {
  const router = useRouter();
  const [state, setState] = useState<NextState>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getNextPlace();
      if (!result) {
        const { getCurrentTrip } = await import('../lib/db');
        const current = await getCurrentTrip();
        if (current) {
          setState({ status: 'all-visited', tripTitle: current.title });
        } else {
          setState({ status: 'no-trip' });
        }
        return;
      }
      setState({ status: 'has-place', trip: result.trip, place: result.place });
    } catch (e) {
      setState({ status: 'no-trip' });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state.status === 'loading') {
    return (
      <ScreenBackground style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Следующее место" />
        </Appbar.Header>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenBackground>
    );
  }

  if (state.status === 'no-trip') {
    return (
      <ScreenBackground style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Следующее место" />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text variant="titleMedium" style={styles.messageTitle}>
            Нет текущей поездки
          </Text>
          <Text variant="bodyMedium" style={styles.messageText}>
            Выберите поездку в разделе «Поездки» и отметьте её как текущую.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/trips')}
            style={styles.button}
          >
            Перейти к поездкам
          </Button>
        </View>
      </ScreenBackground>
    );
  }

  if (state.status === 'all-visited') {
    return (
      <ScreenBackground style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Следующее место" />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text variant="titleMedium" style={styles.messageTitle}>
            Все места посещены
          </Text>
          <Text variant="bodyMedium" style={styles.messageText}>
            В поездке «{state.tripTitle}» не осталось непосещённых мест.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/trips')}
            style={styles.button}
          >
            К поездкам
          </Button>
        </View>
      </ScreenBackground>
    );
  }

  const { trip, place } = state;
  const hasCoords =
    place.latitude != null && place.longitude != null;

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Следующее место" />
      </Appbar.Header>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.tripLabel}>
              Поездка: {trip.title}
            </Text>
            <Text variant="headlineSmall" style={styles.placeName}>
              {place.placeName}
            </Text>
            {place.placeDescription ? (
              <Text variant="bodyMedium" style={styles.description}>
                {place.placeDescription}
              </Text>
            ) : null}
            {hasCoords ? (
              <Text variant="bodySmall" style={styles.coords}>
                {place.latitude?.toFixed(6)}, {place.longitude?.toFixed(6)} (DD)
              </Text>
            ) : (
              <Text variant="bodySmall" style={styles.noCoords}>
                Координаты не заданы
              </Text>
            )}
          </Card.Content>
        </Card>

        <View style={styles.buttons}>
          <Button
            mode="contained"
            icon="map-marker"
            onPress={() =>
              hasCoords && openOnMap(place.latitude!, place.longitude!)
            }
            disabled={!hasCoords}
            style={styles.button}
          >
            Открыть на карте
          </Button>
          <Button
            mode="contained-tonal"
            icon="navigation"
            onPress={() =>
              hasCoords && openInNavigator(place.latitude!, place.longitude!)
            }
            disabled={!hasCoords}
            style={styles.button}
          >
            Открыть в навигаторе
          </Button>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  messageTitle: { textAlign: 'center', marginBottom: 12 },
  messageText: { textAlign: 'center', marginBottom: 24 },
  button: { marginTop: 12 },
  card: { marginBottom: 24 },
  tripLabel: { opacity: 0.8, marginBottom: 4 },
  placeName: { marginBottom: 8 },
  description: { marginBottom: 8 },
  coords: { opacity: 0.8 },
  noCoords: { opacity: 0.7, fontStyle: 'italic' },
  buttons: { gap: 12 },
});
