import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { ScreenBackground } from '../components/ScreenBackground';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Настройки" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="bodyLarge">Настройки приложения.</Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24 },
});
