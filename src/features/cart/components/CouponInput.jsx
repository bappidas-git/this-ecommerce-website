import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import Chip from '../../../components/common/Chip/Chip.jsx';
import couponService from '../../../api/services/couponService.js';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import useOnlineStatus from '../../../hooks/useOnlineStatus.js';
import { couponCodeField } from '../../../utils/validators.js';
import styles from './CouponInput.module.css';

const couponSchema = couponCodeField();

function CouponInput({ couponCode, subtotal, items, onApply, onClear }) {
  const [open, setOpen] = useState(Boolean(couponCode));
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const { online } = useOnlineStatus();

  const handleToggle = () => {
    setOpen((prev) => !prev);
    setError('');
  };

  const focusInput = () => {
    if (inputRef.current && typeof inputRef.current.focus === 'function') {
      inputRef.current.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let normalized = '';
    try {
      normalized = couponSchema.validateSync(code);
    } catch (validationErr) {
      setError(validationErr.message || 'Please enter a coupon code.');
      focusInput();
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const data = await couponService.validate(normalized, subtotal, items);
      const payload = data?.data || data || {};
      const isScoped = payload.appliesTo && payload.appliesTo !== 'all';
      onApply?.(
        isScoped
          ? {
              code: payload.code || normalized,
              type: 'fixed',
              value: Number(payload.discount) || 0,
            }
          : {
              code: payload.code || normalized,
              type: payload.type || payload.discountType || 'fixed',
              value:
                payload.value ??
                payload.amount ??
                payload.discountValue ??
                Number(payload.discount) ??
                0,
            },
      );
      setCode('');
    } catch (err) {
      const fieldErrors = err?.errors;
      let mapped = false;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const raw = fieldErrors.code || fieldErrors.coupon;
        const message = Array.isArray(raw) ? raw[0] : raw;
        if (message) {
          setError(String(message));
          focusInput();
          mapped = true;
        }
      }
      if (!mapped) {
        const message =
          getApiErrorMessage(err) ||
          'That code did not work. Please check and try again.';
        setError(message);
        focusInput();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (couponCode) {
    return (
      <div className={styles.appliedRow}>
        <span className={styles.appliedLabel}>Coupon applied</span>
        <Chip
          variant="soft"
          size="small"
          label={couponCode}
          icon={<LocalOfferOutlinedIcon fontSize="small" />}
          onDelete={onClear}
          deleteIcon={<CloseIcon fontSize="small" aria-label="Remove coupon" />}
          className={styles.chip}
        />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        onClick={handleToggle}
      >
        Have a code?
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.form
            key="coupon-form"
            className={styles.form}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            noValidate
          >
            <div className={styles.inputRow}>
              <AppTextField
                label="Coupon code"
                value={code}
                inputRef={inputRef}
                onChange={(event) => {
                  setCode(event.target.value);
                  if (error) setError('');
                }}
                error={error || undefined}
                size="small"
                inputProps={{ 'aria-label': 'Coupon code' }}
                className={styles.input}
                disabled={isSubmitting}
              />
              <Tooltip
                title={!online ? 'Reconnect to apply your code.' : ''}
                disableHoverListener={online}
                disableFocusListener={online}
                disableTouchListener={online}
              >
                <span>
                  <AppButton
                    type="submit"
                    variant="secondary"
                    size="medium"
                    loading={isSubmitting}
                    disabled={isSubmitting || !online}
                    className={styles.applyButton}
                  >
                    Apply
                  </AppButton>
                </span>
              </Tooltip>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default CouponInput;
