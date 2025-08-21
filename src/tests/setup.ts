// src/tests/setup.ts
import { expect, vi } from "vitest";

// Extend-expect only if you have it installed (optional):
// import "@testing-library/react-native/extend-expect";

// Minimal Expo shim to satisfy TS declarations
// The 'prototype' property is required by expo-modules-core types.
(global as any).ExpoModulesCore = {
  NativeModule: {
    prototype: {},
  },
};

// Silence specific noisy logs during tests (optional)
const origWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = String(args[0] ?? "");
  if (
    msg.includes("It looks like you're using a version of React Native") ||
    msg.includes("No native splash screen") ||
    msg.includes("Require cycle:")
  ) return;
  origWarn(...args);
};

// Make vi available if tests reference it without import
(global as any).vi = vi;

// Mock Expo environment variables
process.env.EXPO_OS = 'web';
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock React Native Skia
vi.mock('@shopify/react-native-skia', () => ({
  Canvas: ({ children }: any) => children,
  ImageSVG: () => null,
  useSVG: () => null,
}));

// Mock React Native components
vi.mock('react-native', async () => {
  const RN = await vi.importActual('react-native-web');
  return {
    ...RN,
    Pressable: ({ onPress, children, ...props }: any) => {
      return {
        type: 'Pressable',
        props: { onPress, children, ...props },
      };
    },
  };
});

// Mock react-native-gesture-handler
vi.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  PanGestureHandler: ({ children }: any) => children,
  TapGestureHandler: ({ children }: any) => children,
  Gesture: {
    Pan: () => ({
      onUpdate: () => ({}),
      onEnd: () => ({}),
    }),
  },
  GestureDetector: ({ children }: any) => children,
  State: {
    ACTIVE: 4,
    END: 5,
  },
}));

// Mock react-native-reanimated
vi.mock('react-native-reanimated', () => ({
  default: ({ children }: any) => children,
  useSharedValue: (initial: any) => ({ value: initial }),
  useAnimatedStyle: (fn: any) => fn(),
  withSpring: (value: any) => value,
  withDecay: (value: any) => value,
}));

// Mock Expo modules  
vi.mock('expo-image', () => ({
  Image: ({ children, ...props }: any) => ({ type: 'Image', props }),
}));

vi.mock('expo-router', () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
    goBack: vi.fn(),
  }),
  useGlobalSearchParams: () => ({}),
}));

vi.mock('expo-linking', () => ({
  getLinkingURL: vi.fn(),
  openURL: vi.fn(),
}));

// Mock all native modules that might be imported
vi.mock('expo-modules-core', () => ({
  requireNativeModule: vi.fn(() => ({})),
  NativeModule: {},
}));

// Keep a default export to avoid "no exports" complaints in some runners
export default {};