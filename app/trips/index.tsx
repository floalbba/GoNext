import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';

export default function TripsListScreen() {
  const router = useRouter();

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Поездки" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="bodyLarge">Список поездок будет здесь.</Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.button}>
          Назад
        </Button>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 16 },
  button: { marginTop: 16 },
});
