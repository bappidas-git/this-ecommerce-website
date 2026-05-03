import { Helmet } from 'react-helmet-async';
import styles from './App.module.css';

const brand = import.meta.env.VITE_BRAND_NAME || 'THIS Interiors';

function App() {
  return (
    <>
      <Helmet>
        <title>{brand}</title>
      </Helmet>
      <main className={styles.shell}>
        <div>
          <h1 className={styles.title}>{brand}</h1>
          <p className={styles.caption}>Coming soon</p>
        </div>
      </main>
    </>
  );
}

export default App;
