import { forwardRef } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { useFormContext, Controller } from 'react-hook-form';
import styles from './AppCheckbox.module.css';

function CheckboxShell({
  label,
  description,
  helperText,
  error,
  checked,
  defaultChecked,
  onChange,
  onBlur,
  disabled,
  inputRef,
  className,
  ...rest
}) {
  const helper = error || helperText || description || undefined;

  return (
    <FormControl
      error={Boolean(error)}
      disabled={disabled}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            onBlur={onBlur}
            inputRef={inputRef}
            {...rest}
          />
        }
        label={label}
      />
      {helper ? <FormHelperText>{helper}</FormHelperText> : null}
    </FormControl>
  );
}

const AppCheckbox = forwardRef(function AppCheckbox(
  { name, control: controlProp, rules, defaultValue = false, ...rest },
  ref,
) {
  const formCtx = useFormContext();
  const control = controlProp || formCtx?.control;

  if (!name || !control) {
    return <CheckboxShell inputRef={ref} {...rest} />;
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <CheckboxShell
          {...rest}
          name={field.name}
          checked={Boolean(field.value)}
          onChange={(e) => field.onChange(e.target.checked)}
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

export default AppCheckbox;
