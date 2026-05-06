import { createTheme } from '@mui/material/styles';
import { tokens } from './tokens.js';

const { color, font, radius, shadow } = tokens;

const adminColor = {
  bg: '#0E1414',
  surface: '#16201D',
  ink: '#F7F3ED',
  ink2: '#C9C2B4',
  muted: '#8C8678',
  line: '#243030',
};

const displayVariant = {
  fontFamily: font.display,
  fontWeight: 500,
  letterSpacing: '-0.01em',
};

const baseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: color.brass,
      dark: color.brass2,
      contrastText: color.bg,
    },
    secondary: {
      main: color.emerald,
      contrastText: color.bg,
    },
    error: { main: color.error },
    success: { main: color.success },
    warning: { main: color.warning },
    background: {
      default: color.bg,
      paper: color.surface,
    },
    text: {
      primary: color.ink,
      secondary: color.ink2,
      disabled: color.muted,
    },
    divider: color.line,
    brand: {
      brass: color.brass,
      brass2: color.brass2,
      emerald: color.emerald,
      rose: color.rose,
      ink2: color.ink2,
      muted: color.muted,
      line: color.line,
      bg: color.bg,
      surface: color.surface,
      adminBg: adminColor.bg,
      adminSurface: adminColor.surface,
      adminInk: adminColor.ink,
      adminLine: adminColor.line,
    },
  },
  shape: {
    borderRadius: radius.sm,
  },
  typography: {
    fontFamily: font.body,
    h1: { ...displayVariant, fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.05 },
    h2: { ...displayVariant, fontSize: 'clamp(2rem, 4.5vw, 3rem)', lineHeight: 1.1 },
    h3: { ...displayVariant, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', lineHeight: 1.15 },
    h4: { ...displayVariant, fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', lineHeight: 1.2 },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radius.pill,
          paddingInline: 24,
          minHeight: 44,
        },
        containedPrimary: {
          backgroundColor: color.brass,
          color: color.bg,
          '&:hover': { backgroundColor: color.brass2 },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        outlined: { borderColor: color.line },
      },
    },
    MuiAppBar: {
      defaultProps: { color: 'transparent', elevation: 0 },
    },
    MuiTextField: {
      defaultProps: { size: 'medium', variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: color.brass },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: color.brass },
        },
        notchedOutline: { borderColor: color.line },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radius.pill },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: color.ink,
          color: color.surface,
          fontFamily: font.body,
          fontSize: '0.8125rem',
        },
        arrow: { color: color.ink },
      },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: {
        root: {
          color: color.ink2,
          '&:hover': { color: color.ink },
        },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: 'lg' },
    },
  },
});

baseTheme.shadows[1] = shadow[1];
baseTheme.shadows[2] = shadow[2];
baseTheme.shadows[3] = shadow[3];

export const theme = baseTheme;

const adminThemeBase = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: color.brass,
      dark: color.brass2,
      contrastText: adminColor.bg,
    },
    secondary: {
      main: color.emerald,
      contrastText: adminColor.ink,
    },
    error: { main: color.error },
    success: { main: color.success },
    warning: { main: color.warning },
    background: {
      default: adminColor.bg,
      paper: adminColor.surface,
    },
    text: {
      primary: adminColor.ink,
      secondary: adminColor.ink2,
      disabled: adminColor.muted,
    },
    divider: adminColor.line,
    brand: {
      brass: color.brass,
      brass2: color.brass2,
      emerald: color.emerald,
      rose: color.rose,
      ink2: color.ink2,
      muted: adminColor.muted,
      line: adminColor.line,
      bg: color.bg,
      surface: color.surface,
      adminBg: adminColor.bg,
      adminSurface: adminColor.surface,
      adminInk: adminColor.ink,
      adminLine: adminColor.line,
    },
  },
  shape: {
    borderRadius: radius.sm,
  },
  typography: {
    fontFamily: font.body,
    h1: { ...displayVariant, fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.1 },
    h2: { ...displayVariant, fontSize: 'clamp(1.625rem, 3vw, 2.25rem)', lineHeight: 1.15 },
    h3: { ...displayVariant, fontSize: 'clamp(1.375rem, 2.4vw, 1.875rem)', lineHeight: 1.2 },
    h4: { ...displayVariant, fontSize: 'clamp(1.125rem, 1.8vw, 1.5rem)', lineHeight: 1.25 },
    numeric: {
      fontFamily: font.mono,
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radius.pill,
          paddingInline: 20,
          minHeight: 40,
        },
        containedPrimary: {
          backgroundColor: color.brass,
          color: adminColor.bg,
          '&:hover': { backgroundColor: color.brass2 },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: adminColor.surface,
          backgroundImage: 'none',
        },
        outlined: { borderColor: adminColor.line },
      },
    },
    MuiAppBar: {
      defaultProps: { color: 'transparent', elevation: 0 },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          backgroundColor: adminColor.bg,
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: color.brass },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: color.brass },
        },
        notchedOutline: { borderColor: adminColor.line },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: { backgroundColor: adminColor.bg },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${adminColor.line}`,
          color: adminColor.ink,
          fontFamily: font.body,
        },
        head: {
          fontFamily: font.body,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          fontSize: '0.6875rem',
          color: adminColor.ink2,
        },
        body: {
          fontVariantNumeric: 'tabular-nums',
        },
      },
    },
    MuiTypography: {
      variants: [
        {
          props: { variant: 'numeric' },
          style: {
            fontFamily: font.mono,
            fontWeight: 500,
            letterSpacing: '0.01em',
            fontVariantNumeric: 'tabular-nums',
          },
        },
      ],
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radius.pill },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: adminColor.ink,
          color: adminColor.bg,
          fontFamily: font.body,
          fontSize: '0.8125rem',
        },
        arrow: { color: adminColor.ink },
      },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: {
        root: {
          color: adminColor.ink2,
          '&:hover': { color: adminColor.ink },
        },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: 'xl' },
    },
  },
});

adminThemeBase.shadows[1] = shadow[1];
adminThemeBase.shadows[2] = shadow[2];
adminThemeBase.shadows[3] = shadow[3];

export const adminTheme = adminThemeBase;

export { tokens };
