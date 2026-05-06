import { useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import FormHelperText from '@mui/material/FormHelperText';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import styles from '../ProductFormPage.module.css';

function TagsField({ name = 'tags', disabled = false, label = 'Tags' }) {
  const { control } = useFormContext();
  const inputRef = useRef(null);
  const [draft, setDraft] = useState('');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const tags = Array.isArray(field.value) ? field.value : [];

        const addTag = (raw) => {
          const value = String(raw || '').trim();
          if (!value) return;
          if (tags.includes(value)) return;
          field.onChange([...tags, value]);
        };

        const removeTag = (index) => {
          const next = tags.slice();
          next.splice(index, 1);
          field.onChange(next);
        };

        const onKeyDown = (event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            addTag(draft);
            setDraft('');
          } else if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
            removeTag(tags.length - 1);
          }
        };

        return (
          <div>
            <label
              htmlFor={`${name}-input`}
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'var(--admin-muted)',
                marginBottom: 6,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </label>
            <div
              className={styles.tagsWrap}
              onClick={() => inputRef.current?.focus()}
              role="presentation"
            >
              {tags.map((tag, index) => (
                <span key={`${tag}-${index}`} className={styles.tagChip}>
                  {tag}
                  {!disabled ? (
                    <button
                      type="button"
                      className={styles.tagRemove}
                      onClick={(event) => {
                        event.stopPropagation();
                        removeTag(index);
                      }}
                      aria-label={`Remove ${tag}`}
                    >
                      <CloseRoundedIcon fontSize="inherit" />
                    </button>
                  ) : null}
                </span>
              ))}
              <input
                id={`${name}-input`}
                ref={inputRef}
                className={styles.tagInput}
                value={draft}
                disabled={disabled}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                onBlur={() => {
                  if (draft) {
                    addTag(draft);
                    setDraft('');
                  }
                  field.onBlur();
                }}
                placeholder={tags.length === 0 ? 'Type and press Enter' : ''}
              />
            </div>
            <FormHelperText error={Boolean(fieldState.error)}>
              {fieldState.error?.message ||
                'Press Enter or comma to add. Backspace removes the last tag.'}
            </FormHelperText>
          </div>
        );
      }}
    />
  );
}

export default TagsField;
