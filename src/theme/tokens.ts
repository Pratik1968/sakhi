// Sakhi design tokens — ported verbatim from the Claude Design System
// (project 0a731f96 "Sakhi Design System"). Web CSS custom properties → JS.

export const colors = {
  ink900: '#121114',
  ink800: '#26242B',
  ink700: '#3A383F',
  ink600: '#54515B',
  ink500: '#6E6B75',
  ink400: '#8C8994',
  ink300: '#A9A6B0',
  ink200: '#C9C7CE',
  ink100: '#E4E2E8',
  ink050: '#F3F2F5',
  white: '#FFFFFF',

  coral700: '#B92C22',
  coral600: '#E23A2E',
  coral500: '#FF4A3C',
  coral400: '#FF7A70',
  coral200: '#FFC9C3',
  coral050: '#FFF0EE',

  moss700: '#0B6E48',
  moss600: '#0F8C5C',
  moss500: '#17A86E',
  moss200: '#A9E3C7',
  moss050: '#E8F7EF',

  amber600: '#D8861F',
  amber500: '#F2A33C',
  amber200: '#FBDCAF',
  amber050: '#FDF3E5',

  lilac600: '#6B5AE0',
  lilac500: '#8C7CF0',
  lilac200: '#CFC8FA',
  lilac050: '#F1EEFE',

  // map palette
  mapBase: '#E9E7E2',
  mapPark: '#CFE8D4',
  mapWater: '#B9C7EA',
  mapRoad: '#FFFFFF',
  mapZone: '#FFE0DB',
  mapRoute: '#FF4A3C',
} as const;

// Semantic aliases
export const semantic = {
  textPrimary: colors.ink900,
  textSecondary: colors.ink500,
  textMuted: colors.ink400,
  textInverse: colors.white,
  textAccent: colors.coral600,
  surfacePage: colors.ink050,
  surfaceCard: colors.white,
  surfaceSunken: colors.ink100,
  surfaceInverse: colors.ink900,
  surfaceAccent: colors.coral050,
  surfaceSafe: colors.moss050,
  surfaceScrim: 'rgba(18,17,20,.55)',
  surfaceGlass: 'rgba(255,255,255,.78)',
  borderSubtle: colors.ink100,
  borderDefault: colors.ink200,
  borderStrong: colors.ink900,
  statusSafe: colors.moss500,
  statusAlert: colors.coral500,
  statusCaution: colors.amber500,
  statusRest: colors.lilac500,
  statusOffline: colors.ink300,
} as const;

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  pill: 999,
  card: 18,
  control: 14,
  sheet: 28,
} as const;

export const space = {
  s0: 0,
  s1: 2,
  s2: 4,
  s3: 6,
  s4: 8,
  s5: 12,
  s6: 16,
  s7: 20,
  s8: 24,
  s9: 32,
  s10: 40,
  s11: 48,
  s12: 64,
  gutter: 20,
  cardPadding: 16,
  cardPaddingLg: 20,
  sectionGap: 28,
  stackGap: 12,
  tapMin: 44,
  tabbarHeight: 82,
  headerHeight: 56,
  screenWidth: 390,
} as const;

export const fonts = {
  sans: 'Figtree_400Regular',
  sansMedium: 'Figtree_500Medium',
  sansSemibold: 'Figtree_600SemiBold',
  sansBold: 'Figtree_700Bold',
  sansBlack: 'Figtree_800ExtraBold',
  mono: 'IBMPlexMono_500Medium',
  monoSemibold: 'IBMPlexMono_600SemiBold',
} as const;

// Map a numeric weight to a Figtree family (RN can't synthesize weights reliably)
export function figtree(weight: 400 | 500 | 600 | 700 | 800): string {
  switch (weight) {
    case 400:
      return fonts.sans;
    case 500:
      return fonts.sansMedium;
    case 600:
      return fonts.sansSemibold;
    case 700:
      return fonts.sansBold;
    case 800:
      return fonts.sansBlack;
  }
}

// letterSpacing in RN is px, not em. Precompute from the design's em values.
// value = emTrack * fontSize
export const type = {
  display: { fontSize: 32, weight: 800 as const, lineHeight: 34, letterSpacing: -0.028 * 32 },
  title1: { fontSize: 26, weight: 800 as const, lineHeight: 29, letterSpacing: -0.024 * 26 },
  title2: { fontSize: 21, weight: 700 as const, lineHeight: 25, letterSpacing: -0.018 * 21 },
  title3: { fontSize: 17, weight: 700 as const, lineHeight: 22, letterSpacing: -0.012 * 17 },
  body: { fontSize: 16, weight: 400 as const, lineHeight: 23, letterSpacing: -0.005 * 16 },
  bodySm: { fontSize: 15, weight: 400 as const, lineHeight: 21, letterSpacing: 0 },
  label: { fontSize: 13, weight: 700 as const, lineHeight: 16, letterSpacing: 0.09 * 13 },
  caption: { fontSize: 12, weight: 500 as const, lineHeight: 15, letterSpacing: 0.005 * 12 },
  metric: { fontSize: 34, weight: 800 as const, lineHeight: 34, letterSpacing: -0.03 * 34 },
} as const;

export const motion = {
  durationFast: 120,
  durationBase: 200,
  durationSlow: 320,
  durationSheet: 420,
  pressScale: 0.97,
  pulseDuration: 1600,
} as const;
