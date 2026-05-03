export const tokens = Object.freeze({
  color: {
    bg: '#F7F3ED',
    surface: '#FFFFFF',
    ink: '#1B1A17',
    ink2: '#4A453E',
    muted: '#8C8678',
    line: '#E5DED2',
    brass: '#B8924F',
    brass2: '#9A7836',
    emerald: '#1F4034',
    rose: '#C8A29A',
    error: '#B0382A',
    success: '#3F6B4F',
    warning: '#B8862B',
  },
  font: {
    display: '"Cormorant Garamond", Georgia, serif',
    body: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
  },
  radius: { xs: 4, sm: 8, md: 14, lg: 24, pill: 999 },
  shadow: {
    1: '0 1px 2px rgba(27,26,23,0.06)',
    2: '0 6px 20px rgba(27,26,23,0.08)',
    3: '0 18px 40px rgba(27,26,23,0.10)',
  },
  motion: {
    fast: 180,
    base: 280,
    slow: 500,
    ease: 'cubic-bezier(0.2,0.6,0.2,1)',
  },
});
