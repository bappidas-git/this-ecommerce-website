import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import Chip from '../../../components/common/Chip/Chip.jsx';
import couponService from '../../../api/services/couponService.js';
import styles from './CouponInput.module.css';

function CouponInput({ couponCode, subtotal, onApply, onClear }) {
  const [open, setOpen] = useState(Boolean(couponCode));
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Enter a coupon code.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const data = await couponService.validate(trimmed, subtotal);
      const payload = data?.data || data || {};
      onApply?.({
        code: payload.code || trimmed,
        type: payload.type || payload.discountType || 'fixed',
        value: payload.value ?? payload.amount ?? payload.discountValue ?? 0,
      });
      setCode('');
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'That code did not work. Please check and try again.';
      setError(message);
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
              <AppButton
                type="submit"
                variant="secondary"
                size="medium"
                loading={isSubmitting}
                disabled={isSubmitting}
                className={styles.applyButton}
              >
                Apply
              </AppButton>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default CouponInput;
