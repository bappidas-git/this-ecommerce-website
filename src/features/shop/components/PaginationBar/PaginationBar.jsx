import Pagination from '@mui/material/Pagination';
import styles from './PaginationBar.module.css';

function PaginationBar({ page = 1, count = 1, onChange, gridRef }) {
  if (count <= 1) return null;

  const handleChange = (event, value) => {
    if (typeof onChange === 'function') {
      onChange(value);
    }
    const target = gridRef?.current;
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className={styles.root} aria-label="Product pages">
      <Pagination
        page={page}
        count={count}
        onChange={handleChange}
        siblingCount={1}
        boundaryCount={1}
        shape="rounded"
      />
    </nav>
  );
}

export default PaginationBar;
