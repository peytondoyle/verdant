import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/state/authStore';

WebBrowser.maybeCompleteAuthSession();

export default function AuthCallback() {
  const router = useRouter();
  const { setSession } = useAuthStore();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (params.code) {
        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(String(params.code));
        if (error) {
          console.error('Error exchanging code for session:', error);
        } else if (data.session) {
          setSession(data.session);
        }
      } else if (params.access_token && params.refresh_token) {
        // Set session directly from tokens (for deep links that contain tokens)
        const { data, error } = await supabase.auth.setSession({
          access_token: String(params.access_token),
          refresh_token: String(params.refresh_token),
        });
        if (error) {
          console.error('Error setting session from tokens:', error);
        } else if (data.session) {
          setSession(data.session);
        }
      }

      router.replace('/(tabs)');
    };

    handleAuthCallback();
  }, [params, router, setSession]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Completing sign-in...</Text>
    </View>
  );
}
