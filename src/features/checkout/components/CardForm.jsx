import { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import AppCheckbox from '../../../components/common/AppCheckbox/AppCheckbox.jsx';
import { detectBrand, BRAND_LABELS } from './cardUtils.js';
import styles from './CardForm.module.css';

function digitsOnly(value) {
  return String(value || '').replace(/\D+/g, '');
}

function formatCardNumber(value) {
  return digitsOnly(value).slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const d = digitsOnly(value).slice(0, 4);
  if (d.length < 3) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function BrandBadge({ brand }) {
  if (!brand) return null;
  return (
    <span
      className={`${styles.brandBadge} ${styles[`brand_${brand}`] || ''}`.trim()}
      aria-label={`Detected card brand: ${BRAND_LABELS[brand] || brand}`}
    >
      {BRAND_LABELS[brand] || brand}
    </span>
  );
}

function CardForm({ idPrefix = 'card-', serverErrors = null }) {
  const { control } = useFormContext();
  const watched = useWatch({ control, name: 'cardNumber' });
  const detectedBrand = useMemo(() => detectBrand(watched || ''), [watched]);

  const cvvLen = detectedBrand === 'amex' ? 4 : 3;

  const helpFromServer = (field) =>
    serverErrors && serverErrors[field] ? serverErrors[field] : undefined;

  return (
    <div className={styles.root} aria-describedby={`${idPrefix}encrypt-note`}>
      <p id={`${idPrefix}encrypt-note`} className={styles.encryptNote}>
        Your card details stay encrypted in transit and aren&apos;t stored on our servers.
      </p>

      <div className={styles.grid}>
        <div className={styles.fullRow}>
          <Controller
            name="cardNumber"
            control={control}
            render={({ field, fieldState }) => {
              const error = fieldState.error?.message || helpFromServer('cardNumber');
              const errId = `${idPrefix}cardNumber-error`;
              return (
                <div className={styles.fieldWithBadge}>
                  <TextField
                    {...field}
                    id={`${idPrefix}cardNumber`}
                    label="Card number"
                    placeholder="0000 0000 0000 0000"
                    fullWidth
                    autoComplete="cc-number"
                    inputMode="numeric"
                    error={Boolean(error)}
                    helperText={error}
                    value={formatCardNumber(field.value)}
                    onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                    inputProps={{
                      maxLength: 19 + 4, // 19 digits + 4 spaces
                      'aria-describedby': error ? errId : undefined,
                      'aria-invalid': Boolean(error) || undefined,
                    }}
                  />
                  <BrandBadge brand={detectedBrand} />
                </div>
              );
            }}
          />
        </div>

        <div className={styles.fullRow}>
          <Controller
            name="cardName"
            control={control}
            render={({ field, fieldState }) => {
              const error = fieldState.error?.message || helpFromServer('cardName');
              const errId = `${idPrefix}cardName-error`;
              return (
                <TextField
                  {...field}
                  id={`${idPrefix}cardName`}
                  label="Name on card"
                  placeholder="As printed on the card"
                  fullWidth
                  autoComplete="cc-name"
                  error={Boolean(error)}
                  helperText={error}
                  inputProps={{
                    maxLength: 80,
                    'aria-describedby': error ? errId : undefined,
                    'aria-invalid': Boolean(error) || undefined,
                  }}
                />
              );
            }}
          />
        </div>

        <div className={styles.halfRow}>
          <Controller
            name="expiry"
            control={control}
            render={({ field, fieldState }) => {
              const error = fieldState.error?.message || helpFromServer('expiry');
              const errId = `${idPrefix}expiry-error`;
              return (
                <TextField
                  {...field}
                  id={`${idPrefix}expiry`}
                  label="Expiry"
                  placeholder="MM/YY"
                  fullWidth
                  autoComplete="cc-exp"
                  inputMode="numeric"
                  error={Boolean(error)}
                  helperText={error}
                  value={formatExpiry(field.value)}
                  onChange={(e) => field.onChange(formatExpiry(e.target.value))}
                  inputProps={{
                    maxLength: 5,
                    'aria-describedby': error ? errId : undefined,
                    'aria-invalid': Boolean(error) || undefined,
                  }}
                />
              );
            }}
          />
        </div>

        <div className={styles.halfRow}>
          <Controller
            name="cvv"
            control={control}
            render={({ field, fieldState }) => {
              const error = fieldState.error?.message || helpFromServer('cvv');
              const errId = `${idPrefix}cvv-error`;
              return (
                <TextField
                  {...field}
                  id={`${idPrefix}cvv`}
                  label={detectedBrand === 'amex' ? 'CID' : 'CVV'}
                  placeholder={detectedBrand === 'amex' ? '4 digits' : '3 digits'}
                  fullWidth
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  type="password"
                  error={Boolean(error)}
                  helperText={error}
                  value={digitsOnly(field.value).slice(0, cvvLen)}
                  onChange={(e) =>
                    field.onChange(digitsOnly(e.target.value).slice(0, cvvLen))
                  }
                  inputProps={{
                    maxLength: cvvLen,
                    'aria-describedby': error ? errId : undefined,
                    'aria-invalid': Boolean(error) || undefined,
                  }}
                />
              );
            }}
          />
        </div>
      </div>

      <AppCheckbox
        name="saveCard"
        label="Save this card for next time"
        description="Coming soon — for now this is just a preference and no card data is stored."
      />
    </div>
  );
}

export default CardForm;
