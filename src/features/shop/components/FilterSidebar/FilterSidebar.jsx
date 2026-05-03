import FilterPanel from '../FilterPanel/FilterPanel.jsx';
import styles from './FilterSidebar.module.css';

function FilterSidebar(props) {
  return (
    <aside
      className={styles.root}
      aria-label="Product filters"
    >
      <FilterPanel {...props} />
    </aside>
  );
}

export default FilterSidebar;
