import { useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import AdminCard from '../../../components/AdminCard.jsx';
import AppButton from '../../../../components/common/AppButton/AppButton.jsx';
import AppSelect from '../../../../components/common/AppSelect/AppSelect.jsx';
import AppSwitch from '../../../../components/common/AppSwitch/AppSwitch.jsx';
import AppTextField from '../../../../components/common/AppTextField/AppTextField.jsx';
import { adminProductService } from '../../../../api/services/admin/adminProductService.js';
import { STATUS_OPTIONS } from '../productSchema.js';
import styles from '../ProductFormPage.module.css';

function formatRelative(date) {
  if (!date) return 'Not yet saved';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

function RelatedProductsField({ name = 'relatedProductIds', currentId, disabled }) {
  const { control } = useFormContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [labelsById, setLabelsById] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!query.trim()) {
      setResults([]);
      return undefined;
    }
    setLoading(true);
    adminProductService
      .list({ q: query.trim(), perPage: 8 })
      .then((res) => {
        if (!active) return;
        const items = (res.items || []).filter(
          (p) => String(p.id) !== String(currentId),
        );
        setResults(items);
        setLabelsById((prev) => {
          const next = { ...prev };
          for (const p of items) next[String(p.id)] = p.name || p.slug || `#${p.id}`;
          return next;
        });
      })
      .catch(() => {
        if (active) setResults([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query, currentId]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selected = Array.isArray(field.value) ? field.value : [];
        const selectedSet = new Set(selected.map(String));

        const add = (id, label) => {
          if (selectedSet.has(String(id))) return;
          field.onChange([...selected, id]);
          setLabelsById((prev) => ({ ...prev, [String(id)]: label }));
          setQuery('');
        };
        const remove = (id) => {
          field.onChange(selected.filter((x) => String(x) !== String(id)));
        };

        const filtered = results.filter((p) => !selectedSet.has(String(p.id)));

        return (
          <div className={styles.relatedSearchWrap}>
            <AppTextField
              label="Related products"
              size="small"
              optional
              disabled={disabled}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name…"
            />
            {selected.length > 0 ? (
              <div className={styles.relatedSelected}>
                {selected.map((id) => (
                  <span key={id} className={styles.tagChip}>
                    {labelsById[String(id)] || `#${id}`}
                    {!disabled ? (
                      <button
                        type="button"
                        className={styles.tagRemove}
                        onClick={() => remove(id)}
                        aria-label="Remove related product"
                      >
                        <CloseRoundedIcon fontSize="inherit" />
                      </button>
                    ) : null}
                  </span>
                ))}
              </div>
            ) : null}
            {query.trim() ? (
              <div className={styles.relatedResults}>
                {loading ? (
                  <p className={styles.relatedEmpty}>Searching…</p>
                ) : filtered.length === 0 ? (
                  <p className={styles.relatedEmpty}>No matches</p>
                ) : (
                  <ul>
                    {filtered.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => add(p.id, p.name)}
                          disabled={disabled}
                        >
                          {p.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
        );
      }}
    />
  );
}

function SidebarColumn({
  mode,
  productId,
  categories,
  disabled,
  isSubmitting,
  onSave,
  onCancel,
  lastSavedAt,
}) {
  const { control } = useFormContext();
  // Re-render every 30s so "saved relative time" stays fresh.
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const status = useWatch({ control, name: 'status' });

  const categoryOptions = useMemo(
    () => [
      { value: '', label: '— No category —' },
      ...(categories || []).map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories],
  );

  return (
    <aside className={styles.sidebar}>
      <AdminCard eyebrow="Status">
        <AppSelect
          name="status"
          label="Status"
          options={STATUS_OPTIONS}
          disabled={disabled}
          helperText={
            status === 'archived'
              ? 'Archived products are hidden from the storefront.'
              : status === 'draft'
                ? 'Drafts are not visible publicly.'
                : 'Active products appear in the storefront.'
          }
        />
      </AdminCard>

      <AdminCard eyebrow="Visibility">
        <AppSwitch name="isFeatured" label="Featured" disabled={disabled} />
        <AppSwitch
          name="isLimitedEdition"
          label="Limited edition"
          disabled={disabled}
        />
      </AdminCard>

      <AdminCard eyebrow="Organization">
        <AppSelect
          name="categoryId"
          label="Category"
          options={categoryOptions}
          disabled={disabled}
        />
        <RelatedProductsField currentId={productId} disabled={disabled} />
      </AdminCard>

      <AdminCard eyebrow="Save">
        <p style={{ margin: 0, color: 'var(--admin-muted)', fontSize: '0.8125rem' }}>
          Last saved {formatRelative(lastSavedAt)}
        </p>
        <div className={styles.savedRow}>
          <AppButton variant="ghost" size="small" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </AppButton>
          {!disabled ? (
            <AppButton
              variant="primary"
              size="small"
              onClick={onSave}
              loading={isSubmitting}
            >
              {mode === 'create' ? 'Create product' : 'Save changes'}
            </AppButton>
          ) : null}
        </div>
      </AdminCard>
    </aside>
  );
}

export default SidebarColumn;
