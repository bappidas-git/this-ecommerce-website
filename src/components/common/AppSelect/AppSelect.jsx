import { forwardRef } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { useFormContext, Controller } from 'react-hook-form';
import styles from './AppSelect.module.css';

function SelectShell({
  id,
  name,
  label,
  options = [],
  value,
  defaultValue = '',
  onChange,
  onBlur,
  error,
  description,
  helperText,
  fullWidth = true,
  size = 'medium',
  required,
  disabled,
  placeholder,
  className,
  inputRef,
  ...rest
}) {
  const labelId = id ? `${id}-label` : undefined;
  const helper = error || helperText || description || undefined;
  const showPlaceholder = !value && placeholder;

  return (
    <FormControl
      fullWidth={fullWidth}
      size={size}
      error={Boolean(error)}
      required={required}
      disabled={disabled}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      {label ? <InputLabel id={labelId}>{label}</InputLabel> : null}
      <Select
        id={id}
        labelId={labelId}
        label={label}
        name={name}
        value={value ?? defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        inputRef={inputRef}
        displayEmpty={Boolean(placeholder)}
        renderValue={
          showPlaceholder
            ? () => <span className={styles.placeholder}>{placeholder}</span>
            : undefined
        }
        {...rest}
      >
        {placeholder ? (
          <MenuItem value="" disabled>
            <span className={styles.placeholder}>{placeholder}</span>
          </MenuItem>
        ) : null}
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {helper ? <FormHelperText>{helper}</FormHelperText> : null}
    </FormControl>
  );
}

const AppSelect = forwardRef(function AppSelect(
  { name, control: controlProp, rules, defaultValue = '', ...rest },
  ref,
) {
  const formCtx = useFormContext();
  const control = controlProp || formCtx?.control;

  if (!name || !control) {
    return <SelectShell inputRef={ref} {...rest} />;
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <SelectShell
          {...rest}
          name={field.name}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={(el) => {
            field.ref(el);
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          error={fieldState.error?.message}
        />
      )}
    />
  );
});

export default AppSelect;
