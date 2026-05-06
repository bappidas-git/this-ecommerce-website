import { Plus } from 'lucide-react';
import Radio from '@mui/material/Radio';
import Chip from '../../../components/common/Chip/Chip.jsx';
import styles from './AddressRadioCard.module.css';

const COUNTRY_NAMES = {
  AE: 'United Arab Emirates',
};

function fullName(address) {
  return [address?.firstName, address?.lastName].filter(Boolean).join(' ');
}

function AddressRadioCard({
  value,
  selected = false,
  onSelect,
  name = 'address-choice',
  address = null,
  variant = 'address',
  addLabel = 'Use a new address',
  addHint = "We'll deliver to a fresh address.",
  onEdit,
}) {
  const isAddNew = variant === 'add' || !address;
  const radioId = `${name}-${value}`;

  const country = address ? COUNTRY_NAMES[address.country] || address.country || '' : '';

  return (
    <label
      htmlFor={radioId}
      className={[
        styles.card,
        selected ? styles.cardSelected : '',
        isAddNew ? styles.cardAdd : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Radio
        id={radioId}
        name={name}
        value={value}
        checked={selected}
        onChange={() => onSelect?.(value)}
        className={styles.radio}
        inputProps={{ 'aria-describedby': `${radioId}-summary` }}
      />

      <div className={styles.body} id={`${radioId}-summary`}>
        {isAddNew ? (
          <div className={styles.addRow}>
            <span className={styles.addIcon} aria-hidden>
              <Plus size={16} />
            </span>
            <div className={styles.addText}>
              <span className={styles.addTitle}>{addLabel}</span>
              {addHint ? <span className={styles.addHint}>{addHint}</span> : null}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.headRow}>
              <span className={styles.label}>{address.label || 'Address'}</span>
              {address.isDefault ? (
                <Chip
                  label="Default"
                  variant="soft"
                  size="small"
                  selected
                  className={styles.defaultChip}
                />
              ) : null}
            </div>
            <p className={styles.name}>{fullName(address)}</p>
            <p className={styles.line}>{address.line1}</p>
            {address.line2 ? <p className={styles.line}>{address.line2}</p> : null}
            <p className={styles.line}>
              {[address.city, address.emirate].filter(Boolean).join(', ')}
              {country ? ` · ${country}` : ''}
            </p>
            {address.phone ? <p className={styles.phone}>{address.phone}</p> : null}
          </>
        )}
      </div>

      {!isAddNew && onEdit ? (
        <button
          type="button"
          className={styles.editLink}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onEdit(address);
          }}
        >
          Edit
        </button>
      ) : null}
    </label>
  );
}

export default AddressRadioCard;
