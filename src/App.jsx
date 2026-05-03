import { Helmet } from 'react-helmet-async';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import styles from './App.module.css';

const brand = import.meta.env.VITE_BRAND_NAME || 'THIS Interiors';

function App() {
  return (
    <>
      <Helmet>
        <title>{brand}</title>
      </Helmet>
      <main className={styles.shell}>
        <Container className={styles.inner}>
          <h1 className={styles.title}>{brand}</h1>
          <Typography variant="body2" color="text.secondary" className={styles.caption}>
            Coming soon
          </Typography>
        </Container>
      </main>
    </>
  );
}

export default App;
