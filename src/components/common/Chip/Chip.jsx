import { forwardRef } from 'react';
import MuiChip from '@mui/material/Chip';
import styles from './Chip.module.css';

const VARIANT_CLASS = {
  solid: styles.solid,
  soft: styles.soft,
  outline: styles.outline,
};

const Chip = forwardRef(function Chip(
  {
    variant = 'soft',
    selected = false,
    size = 'medium',
    className,
    ...rest
  },
  ref,
) {
  const variantClass = VARIANT_CLASS[variant] || VARIANT_CLASS.soft;
  const classes = [
    styles.root,
    variantClass,
    selected ? styles.selected : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <MuiChip
      ref={ref}
      size={size}
      variant={variant === 'outline' ? 'outlined' : 'filled'}
      className={classes}
      aria-pressed={rest.onClick ? selected : undefined}
      {...rest}
    />
  );
});

export default Chip;
