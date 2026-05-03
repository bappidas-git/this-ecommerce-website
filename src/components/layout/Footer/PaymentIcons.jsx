import styles from './PaymentIcons.module.css';

const PAYMENTS = [
  { id: 'visa', label: 'Visa', src: 'https://placehold.co/56x32/FFFFFF/1B1A17?text=VISA' },
  {
    id: 'mastercard',
    label: 'Mastercard',
    src: 'https://placehold.co/56x32/FFFFFF/1B1A17?text=MC',
  },
  { id: 'amex', label: 'American Express', src: 'https://placehold.co/56x32/FFFFFF/1B1A17?text=AMEX' },
  {
    id: 'apple-pay',
    label: 'Apple Pay',
    src: 'https://placehold.co/56x32/FFFFFF/1B1A17?text=PAY',
  },
  { id: 'cod', label: 'Cash on delivery', src: 'https://placehold.co/56x32/FFFFFF/1B1A17?text=COD' },
];

function PaymentIcons() {
  return (
    <ul className={styles.list} aria-label="Accepted payment methods">
      {PAYMENTS.map((payment) => (
        <li key={payment.id} className={styles.item}>
          <img
            src={payment.src}
            alt={payment.label}
            width={56}
            height={32}
            loading="lazy"
            className={styles.badge}
          />
        </li>
      ))}
    </ul>
  );
}

export default PaymentIcons;
