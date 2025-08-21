import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../src/hooks/useAuth';
import LoginScreen from '../src/screens/auth/LoginScreen';
import { useAuthStore } from '../src/state/authStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, status } = useAuth();
  const authStore = useAuthStore();

  useEffect(() => {
    authStore.init();
  }, []);

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === 'loading') {
    return null;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
