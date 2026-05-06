import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import IconButton from '@mui/material/IconButton';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import AdminCard from '../../../components/AdminCard.jsx';
import AppButton from '../../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../../components/common/AppTextField/AppTextField.jsx';
import styles from '../ProductFormPage.module.css';

const PLACEHOLDER = 'https://placehold.co/600x750/E5DED2/1B1A17?text=THIS+Product&font=playfair';

function MediaSection({ disabled = false }) {
  const { control, formState } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'images',
  });
  const images = useWatch({ control, name: 'images' });

  const [draggingIndex, setDraggingIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const onDragStart = (index) => (event) => {
    setDraggingIndex(index);
    event.dataTransfer.effectAllowed = 'move';
    try {
      event.dataTransfer.setData('text/plain', String(index));
    } catch {
      /* some browsers throw for empty payloads */
    }
  };

  const onDragOver = (index) => (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (overIndex !== index) setOverIndex(index);
  };

  const onDrop = (index) => (event) => {
    event.preventDefault();
    const from = draggingIndex ?? Number(event.dataTransfer.getData('text/plain'));
    const to = index;
    if (Number.isInteger(from) && from !== to) move(from, to);
    setDraggingIndex(null);
    setOverIndex(null);
  };

  const onDragEnd = () => {
    setDraggingIndex(null);
    setOverIndex(null);
  };

  const arrayError = formState.errors?.images;
  const rootError =
    typeof arrayError?.message === 'string' ? arrayError.message : null;

  return (
    <AdminCard
      eyebrow="Media"
      className={styles.section}
      action={
        !disabled ? (
          <AppButton
            variant="ghost"
            size="small"
            icon={<AddRoundedIcon fontSize="small" />}
            onClick={() => append({ url: PLACEHOLDER, alt: '' })}
          >
            Add image
          </AppButton>
        ) : null
      }
    >
      {rootError ? (
        <p style={{ color: 'var(--color-error)', fontSize: '0.8125rem' }}>{rootError}</p>
      ) : null}
      <div className={styles.mediaList}>
        {fields.map((field, index) => {
          const url = images?.[index]?.url || PLACEHOLDER;
          const isDragging = draggingIndex === index;
          const isOver = overIndex === index && draggingIndex !== null && draggingIndex !== index;
          const classes = [
            styles.mediaRow,
            isDragging ? styles.mediaRowDragging : '',
            isOver ? styles.mediaRowOver : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={field.id}
              className={classes}
              onDragOver={onDragOver(index)}
              onDrop={onDrop(index)}
            >
              <button
                type="button"
                className={styles.mediaHandle}
                draggable={!disabled}
                onDragStart={onDragStart(index)}
                onDragEnd={onDragEnd}
                disabled={disabled}
                aria-label={`Reorder image ${index + 1}`}
              >
                <DragIndicatorRoundedIcon fontSize="small" />
              </button>
              <img
                src={url}
                alt=""
                className={styles.mediaThumb}
                width={64}
                height={80}
                onError={(event) => {
                  event.currentTarget.src = PLACEHOLDER;
                }}
              />
              <div className={styles.mediaInputs}>
                <AppTextField
                  name={`images.${index}.url`}
                  label="Image URL"
                  size="small"
                  required
                  disabled={disabled}
                />
                <AppTextField
                  name={`images.${index}.alt`}
                  label="Alt text"
                  size="small"
                  optional
                  disabled={disabled}
                />
              </div>
              <div className={styles.mediaActions}>
                <div className={styles.mediaArrows}>
                  <IconButton
                    size="small"
                    aria-label="Move image up"
                    disabled={disabled || index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    <KeyboardArrowUpRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Move image down"
                    disabled={disabled || index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    <KeyboardArrowDownRoundedIcon fontSize="small" />
                  </IconButton>
                </div>
                <IconButton
                  size="small"
                  aria-label="Delete image"
                  disabled={disabled || fields.length <= 1}
                  onClick={() => remove(index)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </div>
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
}

export default MediaSection;
