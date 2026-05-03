import { forwardRef } from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { useFormContext, Controller } from 'react-hook-form';
import styles from './AppRadioGroup.module.css';

function RadioShell({
  label,
  options = [],
  value,
  defaultValue,
  onChange,
  onBlur,
  description,
  helperText,
  error,
  row = false,
  disabled,
  className,
  inputRef,
  ...rest
}) {
  const helper = error || helperText || description || undefined;

  return (
    <FormControl
      error={Boolean(error)}
      disabled={disabled}
      component="fieldset"
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      {label ? <FormLabel component="legend">{label}</FormLabel> : null}
      <RadioGroup
        value={value ?? defaultValue ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        row={row}
        {...rest}
      >
        {options.map((opt) => (
          <FormControlLabel
            key={opt.value}
            value={opt.value}
            control={<Radio inputRef={inputRef} />}
            label={opt.label}
            disabled={opt.disabled}
          />
        ))}
      </RadioGroup>
      {helper ? <FormHelperText>{helper}</FormHelperText> : null}
    </FormControl>
  );
}

const AppRadioGroup = forwardRef(function AppRadioGroup(
  { name, control: controlProp, rules, defaultValue = '', ...rest },
  ref,
) {
  const formCtx = useFormContext();
  const control = controlProp || formCtx?.control;

  if (!name || !control) {
    return <RadioShell inputRef={ref} {...rest} />;
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <RadioShell
          {...rest}
          name={field.name}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={(el) => {
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          error={fieldState.error?.message}
        />
      )}
    />
  );
});

export default AppRadioGroup;
