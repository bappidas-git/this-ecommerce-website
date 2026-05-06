import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@mui/material/Button';
import Section from './Section.jsx';
import Container from './Container.jsx';
import Seo from './Seo.jsx';
import styles from './CrashScreen.module.css';

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] },
};

const isDev = Boolean(import.meta.env?.DEV);

function CrashScreen({ error, onRetry }) {
  return (
    <>
      <Seo title="Something has gone quiet — THIS Interiors" noindex />
      <Section tone="cream">
        <Container gutter>
          <div className={styles.wrap}>
            <motion.div className={styles.inner} {...fade}>
              <p className={styles.eyebrow}>Something has gone quiet</p>
              <h1 className={styles.title}>We&rsquo;ve hit an unexpected snag.</h1>
              <span className={styles.rule} aria-hidden />
              <p className={styles.kicker}>
                Take a breath and try again. If the issue persists, return home and
                pick up where you left off.
              </p>
              <div className={styles.actions}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onRetry}
                  type="button"
                >
                  Try again
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to="/"
                >
                  Return home
                </Button>
              </div>

              {isDev && error ? (
                <details className={styles.details}>
                  <summary>Error details (dev only)</summary>
                  <p className={styles.errorName}>
                    {error.name || 'Error'}: {error.message || 'Unknown error'}
                  </p>
                  {error.stack ? (
                    <pre className={styles.stack}>{error.stack}</pre>
                  ) : null}
                </details>
              ) : null}
            </motion.div>
          </div>
        </Container>
      </Section>
    </>
  );
}

export default CrashScreen;
