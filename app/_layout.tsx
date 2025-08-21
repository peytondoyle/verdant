import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../src/hooks/useAuth';
import LoginScreen from '../src/screens/auth/LoginScreen';

export default function RootLayout() {
  const { session } = useAuth();

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="src/screens/auth/LoginScreen" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
