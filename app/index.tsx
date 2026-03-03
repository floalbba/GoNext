import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="GoNext" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.hint}>
          Выберите раздел
        </Text>
        <Button
          mode="elevated"
          onPress={() => router.push('/places')}
          style={styles.button}
        >
          Места
        </Button>
        <Button
          mode="elevated"
          onPress={() => router.push('/trips')}
          style={styles.button}
        >
          Поездки
        </Button>
        <Button
          mode="elevated"
          onPress={() => router.push('/next-place')}
          style={styles.button}
        >
          Следующее место
        </Button>
        <Button
          mode="elevated"
          onPress={() => router.push('/settings')}
          style={styles.button}
        >
          Настройки
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 12,
    justifyContent: 'center',
  },
  hint: {
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginVertical: 4,
  },
});
