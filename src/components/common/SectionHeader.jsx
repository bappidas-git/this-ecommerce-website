import { motion } from 'framer-motion';
import Eyebrow from './Eyebrow.jsx';
import styles from './SectionHeader.module.css';
import utils from '../../styles/utilities.module.css';

const DARK_TONES = new Set(['emerald', 'ink']);

function resolveEyebrowColor(tone) {
  return DARK_TONES.has(tone) ? 'brass' : 'muted';
}

function SectionHeader({
  eyebrow,
  title,
  kicker,
  align = 'left',
  tone = 'cream',
  cta,
  className,
  id,
}) {
  const isDark = DARK_TONES.has(tone);
  const alignClass = align === 'center' ? styles.alignCenter : styles.alignLeft;
  const classes = [styles.root, alignClass, className].filter(Boolean).join(' ');

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: [0.2, 0.6, 0.2, 1] }}
    >
      <div className={styles.headRow}>
        <div className={styles.titleWrap}>
          {eyebrow ? <Eyebrow color={resolveEyebrowColor(tone)}>{eyebrow}</Eyebrow> : null}
          {title ? (
            <h2
              id={id}
              className={[styles.title, isDark ? styles.titleOnDark : ''].filter(Boolean).join(' ')}
            >
              {title}
            </h2>
          ) : null}
          {!isDark ? <span className={[utils.editorialRule, styles.rule].join(' ')} aria-hidden /> : null}
        </div>
        {cta ? <div className={styles.cta}>{cta}</div> : null}
      </div>
      {kicker ? (
        <p className={[styles.kicker, isDark ? styles.kickerOnDark : ''].filter(Boolean).join(' ')}>
          {kicker}
        </p>
      ) : null}
    </motion.div>
  );
}

export default SectionHeader;
