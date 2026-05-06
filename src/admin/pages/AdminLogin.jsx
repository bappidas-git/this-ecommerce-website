import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { adminTheme } from '../../theme/index.js';
import Section from '../../components/common/Section.jsx';
import Container from '../../components/common/Container.jsx';
import Seo from '../../components/common/Seo.jsx';

function AdminLogin() {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Seo title="Admin sign in — THIS Interiors" noindex />
      <Section tone="surface">
        <Container gutter maxWidth="sm">
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-brass)',
              margin: 0,
            }}
          >
            Admin
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              margin: '8px 0 0',
              color: 'var(--color-ink)',
            }}
          >
            Sign in
          </h1>
          <p style={{ color: 'var(--color-ink-2)', marginTop: 12 }}>
            Sign in to the THIS Interiors admin.
          </p>
        </Container>
      </Section>
    </ThemeProvider>
  );
}

export default AdminLogin;
