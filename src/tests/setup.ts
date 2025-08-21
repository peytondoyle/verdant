import '@testing-library/react-native/extend-expect';
import { mock } from 'vitest-mock-extended';
import { supabase } from '@/lib/supabase';

// Mock the entire supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: mock(),
}));

// Mock react-native-reanimated for gesture handlers
vi.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock expo-router's useNavigation hook
vi.mock('expo-router', () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
    goBack: vi.fn(),
  }),
  useGlobalSearchParams: () => ({}),
}));

// Mock react-native-gesture-handler
vi.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  PanGestureHandler: ({ children }: any) => children,
  TapGestureHandler: ({ children }: any) => children,
  State: {
    ACTIVE: 4,
    END: 5,
  },
}));

// Mock console.error to suppress specific warnings during tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (typeof args[0] === "string" && args[0].includes("It looks like you're using a version of React Native")) {
    return;
  }
  originalConsoleError(...args);
};
