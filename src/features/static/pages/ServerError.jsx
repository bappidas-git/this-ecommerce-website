import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Button from '@mui/material/Button';
import Section from '../../../components/common/Section.jsx';
import Container from '../../../components/common/Container.jsx';
import { PATHS } from '../../../routes/paths.js';
import styles from './ErrorPage.module.css';

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] },
};

function ServerError({ onRetry }) {
  const handleRetry = () => {
    if (typeof onRetry === 'function') {
      onRetry();
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <>
      <Helmet>
        <title>Something went wrong — THIS Interiors</title>
      </Helmet>
      <Section tone="cream">
        <Container gutter>
          <div className={styles.wrap}>
            <motion.div className={styles.inner} {...fade}>
              <p className={styles.code} aria-hidden>
                500
              </p>
              <p className={styles.eyebrow}>An interruption</p>
              <h1 className={styles.title}>Something went wrong.</h1>
              <span className={styles.rule} aria-hidden />
              <p className={styles.kicker}>
                We&rsquo;ve noted the issue and our team is taking a look. Try again in a moment.
              </p>
              <div className={styles.actions}>
                <Button variant="contained" color="primary" onClick={handleRetry}>
                  Try again
                </Button>
                <Button variant="outlined" color="primary" component={Link} to={PATHS.home}>
                  Return home
                </Button>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>
    </>
  );
}

export default ServerError;
