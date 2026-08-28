export const colors = {
  background: '#F7F7F8',
  surface: '#FFFFFF',
  primary: '#5145B8',
  primaryDark: '#43389C',
  primaryLight: '#EEEAFE',
  textPrimary: '#1F1F29',
  textSecondary: '#777782',
  textMuted: '#A0A0AA',
  border: '#E5E5EA',
  borderLight: '#EFEFF2',
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
