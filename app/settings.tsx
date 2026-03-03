import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Divider, List, Text } from 'react-native-paper';
import { ScreenBackground } from '../components/ScreenBackground';

const APP_NAME = 'GoNext';
const APP_VERSION = '1.0.0';
const APP_DESCRIPTION =
  'Дневник туриста. Планируйте поездки, сохраняйте места и отмечайте посещения. Работает офлайн.';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Настройки" />
      </Appbar.Header>

      <View style={styles.content}>
        <List.Section>
          <List.Subheader>О приложении</List.Subheader>
          <List.Item
            title={APP_NAME}
            description={`Версия ${APP_VERSION}`}
            left={(props) => <List.Icon {...props} icon="application" />}
          />
          <Divider />
          <View style={styles.descriptionBlock}>
            <Text variant="bodyMedium" style={styles.description}>
              {APP_DESCRIPTION}
            </Text>
          </View>
        </List.Section>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 8 },
  descriptionBlock: { padding: 16, paddingTop: 8 },
  description: { opacity: 0.9 },
});
