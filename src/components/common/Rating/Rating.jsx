import MuiRating from '@mui/material/Rating';
import styles from './Rating.module.css';

const SIZE_PROPS = {
  sm: { size: 'small' },
  md: { size: 'medium' },
};

function Rating({
  value = 0,
  onChange,
  size = 'md',
  precision = 0.5,
  max = 5,
  className,
  ariaLabel,
  ...rest
}) {
  const sizeProps = SIZE_PROPS[size] || SIZE_PROPS.md;
  const readOnly = !onChange;

  return (
    <MuiRating
      value={Number(value) || 0}
      onChange={onChange ? (_e, v) => onChange(v) : undefined}
      readOnly={readOnly}
      precision={precision}
      max={max}
      className={[styles.root, className].filter(Boolean).join(' ')}
      aria-label={ariaLabel || (readOnly ? `${value} out of ${max} stars` : 'Rating')}
      {...sizeProps}
      {...rest}
    />
  );
}

export default Rating;
