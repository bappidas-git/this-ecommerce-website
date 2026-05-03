import { forwardRef } from 'react';
import TextField from '@mui/material/TextField';
import { useFormContext, Controller } from 'react-hook-form';
import styles from './AppTextField.module.css';

function FieldShell({
  inputRef,
  label,
  optional = false,
  description,
  helperText,
  error,
  className,
  InputLabelProps,
  ...rest
}) {
  const renderedLabel = label
    ? optional
      ? (
          <span>
            {label}
            <span className={styles.optional}> (optional)</span>
          </span>
        )
      : label
    : undefined;

  const helper = error || helperText || description || undefined;

  return (
    <TextField
      inputRef={inputRef}
      label={renderedLabel}
      error={Boolean(error)}
      helperText={helper}
      InputLabelProps={InputLabelProps}
      fullWidth
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}

const AppTextField = forwardRef(function AppTextField(
  { name, control: controlProp, rules, defaultValue = '', ...rest },
  ref,
) {
  const formCtx = useFormContext();
  const control = controlProp || formCtx?.control;

  if (!name || !control) {
    return <FieldShell inputRef={ref} {...rest} />;
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <FieldShell
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

export default AppTextField;
