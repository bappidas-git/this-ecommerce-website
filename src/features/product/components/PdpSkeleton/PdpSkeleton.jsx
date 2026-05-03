import styles from './PdpSkeleton.module.css';

function PdpSkeleton() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.gallery}>
        <div className={styles.thumbs}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`th-${i}`} className={styles.thumb} />
          ))}
        </div>
        <div className={styles.stage} />
      </div>
      <div className={styles.buybox}>
        <div className={styles.eyebrow} />
        <div className={styles.title} />
        <div className={styles.titleShort} />
        <div className={styles.price} />
        <div className={styles.line} />
        <div className={styles.line} />
        <div className={styles.line} />
        <div className={styles.button} />
      </div>
    </div>
  );
}

export default PdpSkeleton;
