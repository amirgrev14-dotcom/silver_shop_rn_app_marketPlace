export const colors = {
  background: '#F8F8FB',
  surface: '#FFFFFF',
  primary: '#5B43D6',
  primaryDark: '#4A35B8',
  primaryLight: '#EEEAFE',
  /** Muted violet for the brand-letter accent — softer than primary. */
  primaryMuted: '#6E63B8',
  textPrimary: '#171722',
  textSecondary: '#6F6E7A',
  /** Dark violet-gray for titles — like gray, but not gray. */
  inkSoft: '#57536B',
  textMuted: '#A0A0AA',
  border: '#E8E7ED',
  borderLight: '#F0EFF4',
  silver: '#C8C8CC',
  silverLight: '#F1F1F3',
  success: '#34A853',
  error: '#E5484D',
  warning: '#F5A524',
} as const;

export const shadows = {
  card: {
    elevation: 2,
    shadowColor: '#1F1F29',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
} as const;

/** Loaded Inter families (see app/_layout useFonts). Used by AppText. */
export const fontFamilies = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;
