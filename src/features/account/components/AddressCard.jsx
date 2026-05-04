import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import Chip from '../../../components/common/Chip/Chip.jsx';

import styles from './AddressCard.module.css';

const COUNTRY_NAMES = {
  AE: 'United Arab Emirates',
};

function fullName(address) {
  return [address?.firstName, address?.lastName].filter(Boolean).join(' ');
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isBusy = false,
  inlineError = null,
}) {
  if (!address) return null;
  const country = COUNTRY_NAMES[address.country] || address.country || '';

  return (
    <article
      className={styles.card}
      aria-label={`Address: ${address.label || fullName(address)}`}
    >
      <header className={styles.head}>
        <h3 className={styles.label}>{address.label || 'Address'}</h3>
        {address.isDefault ? (
          <Chip
            label="Default"
            variant="soft"
            size="small"
            selected
            className={styles.defaultChip}
          />
        ) : null}
      </header>

      <address className={styles.body}>
        <p className={styles.name}>{fullName(address)}</p>
        <p className={styles.line}>{address.line1}</p>
        {address.line2 ? <p className={styles.line}>{address.line2}</p> : null}
        <p className={styles.line}>
          {[address.city, address.emirate].filter(Boolean).join(', ')}
        </p>
        {country ? <p className={styles.line}>{country}</p> : null}
        {address.phone ? (
          <p className={styles.phone}>
            <a href={`tel:${address.phone.replace(/\s+/g, '')}`}>{address.phone}</a>
          </p>
        ) : null}
      </address>

      {inlineError ? (
        <p className={styles.error} role="alert">
          {inlineError}
        </p>
      ) : null}

      <footer className={styles.actions}>
        <AppButton
          variant="ghost"
          size="small"
          onClick={onEdit}
          disabled={isBusy}
        >
          Edit
        </AppButton>
        {address.isDefault ? null : (
          <AppButton
            variant="ghost"
            size="small"
            onClick={onSetDefault}
            disabled={isBusy}
          >
            Set as default
          </AppButton>
        )}
        <AppButton
          variant="ghost"
          size="small"
          onClick={onDelete}
          disabled={isBusy}
          className={styles.danger}
        >
          Delete
        </AppButton>
      </footer>
    </article>
  );
}

export default AddressCard;
