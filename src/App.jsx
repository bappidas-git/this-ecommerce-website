import { Helmet } from 'react-helmet-async';
import { Route, Routes } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import styles from './App.module.css';
import KitchenSink from './routes/KitchenSink.jsx';

const brand = import.meta.env.VITE_BRAND_NAME || 'THIS Interiors';
const isDev = import.meta.env.DEV;

function Landing() {
  return (
    <main className={styles.shell}>
      <Container className={styles.inner}>
        <h1 className={styles.title}>{brand}</h1>
        <Typography variant="body2" color="text.secondary" className={styles.caption}>
          Coming soon
        </Typography>
      </Container>
    </main>
  );
}

function App() {
  return (
    <>
      <Helmet>
        <title>{brand}</title>
      </Helmet>
      <Routes>
        <Route path="/" element={<Landing />} />
        {isDev ? <Route path="/_kitchen-sink" element={<KitchenSink />} /> : null}
      </Routes>
    </>
  );
}

export default App;
