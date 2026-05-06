import { useState } from 'react';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppTextField from '../../../components/common/AppTextField/AppTextField.jsx';
import styles from './CustomerNotesTimeline.module.css';

const NOTE_LIMIT = 800;

function fmt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function initialsOf(name) {
  if (!name) return 'TI';
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || 'TI'
  );
}

function avatarUrl(name) {
  const initials = encodeURIComponent(initialsOf(name));
  return `https://placehold.co/64x64/B8924F/F7F3ED?text=${initials}&font=playfair`;
}

function CustomerNotesTimeline({ notes, canWrite, onAdd, isSaving }) {
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError('Note cannot be empty');
      return;
    }
    if (trimmed.length > NOTE_LIMIT) {
      setError(`Keep notes under ${NOTE_LIMIT} characters`);
      return;
    }
    setError('');
    try {
      await onAdd({ body: trimmed });
      setBody('');
    } catch {
      // toast handled in parent
    }
  };

  return (
    <section className={styles.root} aria-label="Admin notes">
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Admin notes</h2>
          <p className={styles.subtitle}>
            Internal — never visible to the customer. Use for context, escalations, and follow-ups.
          </p>
        </div>
        <span className={styles.staffChip}>staff only</span>
      </header>

      {canWrite ? (
        <form className={styles.composer} onSubmit={submit} noValidate>
          <AppTextField
            label="Add a note"
            multiline
            minRows={3}
            maxRows={6}
            value={body}
            onChange={(e) => {
              setBody(e.target.value.slice(0, NOTE_LIMIT));
              if (error) setError('');
            }}
            error={error || undefined}
            helperText={error ? undefined : `${body.length}/${NOTE_LIMIT}`}
            placeholder="Anything the next person to handle this customer should know?"
          />
          <div className={styles.composerRow}>
            <span className={styles.helper}>Visible only to admins and managers.</span>
            <AppButton
              type="submit"
              variant="primary"
              size="small"
              loading={isSaving}
              disabled={!body.trim()}
            >
              Post note
            </AppButton>
          </div>
        </form>
      ) : null}

      {notes.length === 0 ? (
        <p className={styles.empty}>No notes yet.</p>
      ) : (
        <ul className={styles.list}>
          {notes.map((note) => (
            <li key={note.id} className={styles.item}>
              <img
                className={styles.avatar}
                src={avatarUrl(note.author?.name)}
                alt=""
                width={36}
                height={36}
                loading="lazy"
              />
              <div className={styles.body}>
                <div className={styles.meta}>
                  <span className={styles.author}>{note.author?.name || 'Staff'}</span>
                  <span className={styles.staffPill}>internal</span>
                  <span className={styles.time}>{fmt(note.createdAt)}</span>
                </div>
                <p className={styles.text}>{note.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default CustomerNotesTimeline;
