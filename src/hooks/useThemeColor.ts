/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type Theme = 'light' | 'dark';
type ThemedProps = { light?: string; dark?: string };

export function useThemeColor(props: ThemedProps, colorName: keyof typeof Colors.light) {
  const theme = (useColorScheme() ?? 'light') as Theme;
  const colorFromProps = props[theme];

  return colorFromProps ?? Colors[theme][colorName];
}
