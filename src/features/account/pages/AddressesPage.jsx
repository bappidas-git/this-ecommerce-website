import { useCallback, useEffect, useMemo, useState } from 'react';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

import useAccountSection from '../hooks/useAccountSection.js';
import AddressForm from '../components/AddressForm.jsx';
import AddressCard from '../components/AddressCard.jsx';

import AppButton from '../../../components/common/AppButton/AppButton.jsx';
import AppDialog from '../../../components/common/AppDialog/AppDialog.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import {
  RectSkeleton,
  TextSkeleton,
} from '../../../components/common/skeletons/index.js';
import Seo from '../../../components/common/Seo.jsx';

import { useToast } from '../../../context/ToastContext.jsx';
import { getApiErrorMessage } from '../../../hooks/useApiError.js';
import addressService from '../../../api/services/addressService.js';

import styles from './AddressesPage.module.css';

const SECTION_DESCRIPTOR = 'These addresses appear during checkout.';

function summariseAddress(address) {
  if (!address) return '';
  const name = [address.firstName, address.lastName].filter(Boolean).join(' ');
  const where = [address.line1, address.city, address.emirate]
    .filter(Boolean)
    .join(', ');
  return [name, where].filter(Boolean).join(' — ');
}

function AddressesPage() {
  useAccountSection({ descriptor: SECTION_DESCRIPTOR });
  const toast = useToast();

  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [cardErrors, setCardErrors] = useState({});

  const [editing, setEditing] = useState(null); // { mode: 'create' | 'edit', address?: {...} }
  const [confirmDelete, setConfirmDelete] = useState(null); // address being deleted
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const result = await addressService.list();
      setAddresses(Array.isArray(result?.items) ? result.items : []);
      setLoadError(null);
    } catch (err) {
      setLoadError(getApiErrorMessage(err) || 'Could not load addresses.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    refresh();
  }, [refresh]);

  const setCardError = useCallback((id, message) => {
    setCardErrors((prev) => {
      const next = { ...prev };
      if (message) next[id] = message;
      else delete next[id];
      return next;
    });
  }, []);

  const openCreate = () => setEditing({ mode: 'create' });
  const openEdit = (address) => setEditing({ mode: 'edit', address });
  const closeForm = () => setEditing(null);

  const handleSubmit = useCallback(
    async (payload) => {
      const isEdit = editing?.mode === 'edit';
      const targetId = editing?.address?.id;

      const previous = addresses;
      const optimistic = isEdit
        ? addresses.map((a) =>
            a.id === targetId
              ? { ...a, ...payload }
              : payload.isDefault
                ? { ...a, isDefault: false }
                : a,
          )
        : [
            ...(payload.isDefault
              ? addresses.map((a) => ({ ...a, isDefault: false }))
              : addresses),
            { id: `tmp-${Date.now()}`, ...payload },
          ];
      setAddresses(optimistic);

      try {
        if (isEdit) {
          await addressService.update(targetId, payload);
          toast.success('Address updated.');
        } else {
          await addressService.create(payload);
          toast.success('Address added.');
        }
        await refresh();
        closeForm();
      } catch (err) {
        setAddresses(previous);
        const fieldErrors = err?.errors;
        if (fieldErrors && typeof fieldErrors === 'object' && Object.keys(fieldErrors).length) {
          throw err;
        }
        toast.error(getApiErrorMessage(err) || 'Could not save address.');
      }
    },
    [addresses, editing, refresh, toast],
  );

  const handleSetDefault = useCallback(
    async (address) => {
      if (address.isDefault) return;
      const previous = addresses;
      setBusyId(address.id);
      setCardError(address.id, null);
      setAddresses(
        addresses.map((a) => ({ ...a, isDefault: a.id === address.id })),
      );
      try {
        await addressService.setDefault(address.id);
        await refresh();
        toast.success(`${address.label || 'Address'} is now your default.`);
      } catch (err) {
        setAddresses(previous);
        toast.error(getApiErrorMessage(err) || 'Could not update default address.');
      } finally {
        setBusyId(null);
      }
    },
    [addresses, refresh, setCardError, toast],
  );

  const requestDelete = (address) => {
    setCardError(address.id, null);
    setConfirmDelete(address);
  };

  const cancelDelete = () => {
    if (deleting) return;
    setConfirmDelete(null);
  };

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    const previous = addresses;
    setDeleting(true);
    setCardError(target.id, null);
    setAddresses(addresses.filter((a) => a.id !== target.id));
    try {
      await addressService.remove(target.id);
      await refresh();
      setConfirmDelete(null);
      toast.success('Address removed.');
    } catch (err) {
      setAddresses(previous);
      const message =
        getApiErrorMessage(err) || 'Could not delete this address.';
      if (err?.status === 409) {
        setCardError(
          target.id,
          'Add another address before removing your default.',
        );
        setConfirmDelete(null);
      } else {
        toast.error(message);
      }
    } finally {
      setDeleting(false);
    }
  }, [addresses, confirmDelete, refresh, setCardError, toast]);

  const formInitial = editing?.mode === 'edit' ? editing.address : null;
  const lockDefault =
    editing?.mode === 'edit' &&
    editing.address?.isDefault &&
    addresses.length <= 1;

  const sortedAddresses = useMemo(
    () =>
      [...addresses].sort(
        (a, b) =>
          Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)) ||
          (a.id ?? 0) - (b.id ?? 0),
      ),
    [addresses],
  );

  return (
    <>
      <Seo title="Addresses | THIS Interiors" noindex />

      <header className={styles.header}>
        <p className={styles.descriptor}>{SECTION_DESCRIPTOR}</p>
        <AppButton
          variant="primary"
          onClick={openCreate}
          icon={<AddLocationAltOutlinedIcon />}
          iconPosition="start"
          className={styles.addBtn}
        >
          Add address
        </AppButton>
      </header>

      {isLoading ? (
        <ul className={styles.grid} aria-busy="true" aria-label="Loading addresses">
          {Array.from({ length: 3 }).map((_, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={`addr-skeleton-${idx}`} className={styles.gridItem}>
              <div className={styles.skeletonCard}>
                <div className={styles.skeletonHead}>
                  <RectSkeleton w="40%" h={20} r={4} />
                  <RectSkeleton w={64} h={20} r={999} />
                </div>
                <TextSkeleton lines={3} />
                <div className={styles.skeletonActions}>
                  <RectSkeleton w={84} h={32} r={999} />
                  <RectSkeleton w={84} h={32} r={999} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : loadError ? (
        <div className={styles.errorWrap} role="alert">
          <p>{loadError}</p>
          <AppButton variant="ghost" onClick={refresh}>
            Try again
          </AppButton>
        </div>
      ) : sortedAddresses.length === 0 ? (
        <EmptyState
          icon={<LocationOnOutlinedIcon />}
          title="No saved addresses yet."
          description="Save delivery addresses to make checkout faster."
          cta={
            <AppButton variant="primary" onClick={openCreate}>
              Add your first address
            </AppButton>
          }
        />
      ) : (
        <ul className={styles.grid}>
          {sortedAddresses.map((address) => (
            <li key={address.id} className={styles.gridItem}>
              <AddressCard
                address={address}
                isBusy={busyId === address.id}
                inlineError={cardErrors[address.id] || null}
                onEdit={() => openEdit(address)}
                onDelete={() => requestDelete(address)}
                onSetDefault={() => handleSetDefault(address)}
              />
            </li>
          ))}
        </ul>
      )}

      <AppDialog
        open={Boolean(editing)}
        onClose={closeForm}
        size="md"
        title={editing?.mode === 'edit' ? 'Edit address' : 'Add a new address'}
        description={
          editing?.mode === 'edit'
            ? 'Update the details below — used at checkout.'
            : 'Fill in the details below — used at checkout.'
        }
      >
        {editing ? (
          <AddressForm
            initial={formInitial}
            lockDefault={lockDefault}
            submitLabel={editing.mode === 'edit' ? 'Save changes' : 'Add address'}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        ) : null}
      </AppDialog>

      <AppDialog
        open={Boolean(confirmDelete)}
        onClose={cancelDelete}
        size="sm"
        title="Delete this address?"
        description="It will no longer be available at checkout."
        actions={
          <>
            <AppButton variant="ghost" onClick={cancelDelete} disabled={deleting}>
              Cancel
            </AppButton>
            <AppButton variant="danger" onClick={handleDelete} loading={deleting}>
              Delete address
            </AppButton>
          </>
        }
      >
        {confirmDelete ? (
          <div className={styles.confirmBody}>
            <p className={styles.confirmLabel}>
              {confirmDelete.label || 'Address'}
              {confirmDelete.isDefault ? (
                <span className={styles.confirmTag}> · default</span>
              ) : null}
            </p>
            <p className={styles.confirmSummary}>{summariseAddress(confirmDelete)}</p>
          </div>
        ) : null}
      </AppDialog>
    </>
  );
}

export default AddressesPage;
