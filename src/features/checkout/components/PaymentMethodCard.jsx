import Radio from '@mui/material/Radio';
import styles from './PaymentMethodCard.module.css';

function PaymentMethodCard({
  value,
  selected = false,
  onSelect,
  name = 'payment-method',
  title,
  description,
  icon = null,
  meta = null,
  children,
}) {
  const radioId = `${name}-${value}`;
  const summaryId = `${radioId}-summary`;

  return (
    <div
      className={[styles.card, selected ? styles.cardSelected : '']
        .filter(Boolean)
        .join(' ')}
    >
      <label htmlFor={radioId} className={styles.head}>
        <Radio
          id={radioId}
          name={name}
          value={value}
          checked={selected}
          onChange={() => onSelect?.(value)}
          className={styles.radio}
          inputProps={{ 'aria-describedby': summaryId }}
        />
        <div className={styles.headBody} id={summaryId}>
          <div className={styles.titleRow}>
            <span className={styles.title}>{title}</span>
            {meta ? <span className={styles.meta}>{meta}</span> : null}
          </div>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {icon ? <div className={styles.iconSlot}>{icon}</div> : null}
      </label>

      {selected && children ? <div className={styles.body}>{children}</div> : null}
    </div>
  );
}

export default PaymentMethodCard;
