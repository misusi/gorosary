/**
 * Design tokens shared by the website and the mobile app.
 *
 * These are plain values, not React components — the two apps render with
 * different primitives (DOM elements vs. React Native views), so anything that
 * draws has to be written twice. Anything that is just a number or a colour
 * should live here so the two never drift apart.
 */

export interface Theme {
  bg: string;
  bgAlt: string;
  surface: string;
  ink: string;
  inkSoft: string;
  muted: string;
  line: string;
  lineStrong: string;
  accent: string;
  accentSoft: string;
  accentInk: string;
  gold: string;
  goldSoft: string;
  joyful: string;
  sorrowful: string;
  glorious: string;
  luminous: string;
}

export const lightTheme: Theme = {
  bg: '#faf7f2',
  bgAlt: '#f2ece1',
  surface: '#ffffff',
  ink: '#1f1b16',
  inkSoft: '#4a4239',
  muted: '#7d7264',
  line: '#e3d9c9',
  lineStrong: '#cfc2ad',
  accent: '#8c2f39',
  accentSoft: '#f6e9e8',
  accentInk: '#ffffff',
  gold: '#9a6f22',
  goldSoft: '#f7eeda',
  joyful: '#b98a1c',
  sorrowful: '#9c3a3c',
  glorious: '#3f6b46',
  luminous: '#8a6f2f',
};

export const darkTheme: Theme = {
  bg: '#14120f',
  bgAlt: '#1a1714',
  surface: '#1e1a16',
  ink: '#f2ece2',
  inkSoft: '#d6cdbf',
  muted: '#9c9285',
  line: '#322c26',
  lineStrong: '#453d34',
  accent: '#e08f97',
  accentSoft: '#2a1e1e',
  accentInk: '#1a1012',
  gold: '#d3ab63',
  goldSoft: '#262013',
  joyful: '#d9ad4a',
  sorrowful: '#d98a8a',
  glorious: '#7fb489',
  luminous: '#c9a961',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 22,
  xl: 34,
  xxl: 52,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const serif = 'Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif';
export const sans = 'System, -apple-system, Segoe UI, Roboto, sans-serif';

/** Colour for each set of mysteries, so a mystery set always looks the same. */
export function mysteryColor(
  set: 'joyful' | 'sorrowful' | 'glorious' | 'luminous',
  theme: Theme,
): string {
  return theme[set];
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "Day 3 of 9" — used by the novena tracker. */
export function formatProgress(done: number, total: number): string {
  return `${done} of ${total} days prayed`;
}
