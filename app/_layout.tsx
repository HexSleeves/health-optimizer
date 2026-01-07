import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/stores/settings-store';
import { updateProviderConfig } from '@/services/llm';
import '../global.css';

// Prevent the splash screen from auto-hiding (only on native)
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed
  });
  
  const { geminiApiKey, openaiApiKey, llmProvider } = useSettingsStore();

  useEffect(() => {
    if (fontsLoaded && Platform.OS !== 'web') {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  
  // Initialize LLM providers with API keys from env/store
  useEffect(() => {
    if (geminiApiKey) {
      updateProviderConfig('gemini', { apiKey: geminiApiKey });
    }
    if (openaiApiKey) {
      updateProviderConfig('openai', { apiKey: openaiApiKey });
    }
  }, [geminiApiKey, openaiApiKey]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="intake"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
