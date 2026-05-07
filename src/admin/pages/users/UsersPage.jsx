import { useCallback, useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';

import Seo from '../../../components/common/Seo.jsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.jsx';
import ErrorState from '../../../components/common/ErrorState/ErrorState.jsx';
import AppButton from '../../../components/common/AppButton/AppButton.jsx';

import AdminPageHeader from '../../components/AdminPageHeader.jsx';
import useAdminBreadcrumbs from '../../hooks/useAdminBreadcrumbs.js';
import useAdminUsers from '../../features/users/useAdminUsers.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { formatDate } from '../../../utils/format.js';
import { PERMS } from '../../hooks/useCanAdminAccess.js';

import InviteAdminDialog from './InviteAdminDialog.jsx';
import EditAdminDialog from './EditAdminDialog.jsx';
import DeleteAdminDialog from './DeleteAdminDialog.jsx';

import styles from './UsersPage.module.css';

const ROLE_LABEL = {
  admin: 'Admin',
  manager: 'Manager',
  viewer: 'Viewer',
};

const ROLE_CHIP_CLASS = {
  admin: styles.chipRoleAdmin,
  manager: styles.chipRoleManager,
  viewer: styles.chipRoleViewer,
};

const STATUS_CHIP_CLASS = {
  Active: styles.chipStatusActive,
  Invited: styles.chipStatusInvited,
  Disabled: styles.chipStatusDisabled,
};

const ALL_AREAS = [
  'dashboard',
  'products',
  'categories',
  'inventory',
  'orders',
  'coupons',
  'customers',
  'reviews',
  'settings',
  'reports',
  'users',
];

function expandAreas(role) {
  const list = PERMS[role] || [];
  if (list.includes('*')) return ALL_AREAS;
  return list;
}

function formatAreas(role) {
  const areas = expandAreas(role);
  if (areas.length === ALL_AREAS.length) return 'All admin areas';
  return areas.join(', ');
}

function NoRowsOverlay() {
  return (
    <div className={styles.overlay}>
      <EmptyState
        icon={<GroupOutlinedIcon fontSize="large" />}
        title="No admin users yet"
        description="Invite your first teammate to get started."
      />
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className={styles.loadingOverlay}>
      <LinearProgress />
    </div>
  );
}

function avatarFor(user) {
  if (user?.avatar) return user.avatar;
  const initials =
    String(user?.name || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join('')
      .toUpperCase() || 'TI';
  return `https://placehold.co/64x64/B8924F/F7F3ED?text=${encodeURIComponent(
    initials,
  )}&font=playfair`;
}

function RolesReferencePanel({ counts }) {
  const rows = ['admin', 'manager', 'viewer'].map((role) => ({
    role,
    label: ROLE_LABEL[role],
    areas: formatAreas(role),
    canWrite: role !== 'viewer',
    count: counts?.[role] ?? 0,
  }));

  return (
    <aside className={styles.rolesPanel} aria-labelledby="roles-ref-title">
      <header className={styles.rolesHeader}>
        <span className={styles.rolesEyebrow}>Roles</span>
        <h2 id="roles-ref-title" className={styles.rolesTitle}>
          Permission matrix
        </h2>
        <p className={styles.rolesIntro}>
          What each role can see and edit across the admin panel.
        </p>
      </header>
      <table className={styles.rolesTable}>
        <thead>
          <tr>
            <th scope="col">Role</th>
            <th scope="col">Allowed areas</th>
            <th scope="col">Write</th>
            <th scope="col">Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.role}>
              <td>
                <span
                  className={[styles.chip, ROLE_CHIP_CLASS[row.role]].join(' ')}
                >
                  {row.label}
                </span>
              </td>
              <td className={styles.rolesAreasCell}>{row.areas}</td>
              <td
                className={
                  row.canWrite ? styles.rolesWriteYes : styles.rolesWriteNo
                }
              >
                {row.canWrite ? 'Yes' : 'Read only'}
              </td>
              <td className={styles.rolesCountCell}>{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.rolesFooter}>
        Only the <strong>Admin</strong> role can manage users. Disabled accounts
        cannot sign in to the admin panel.
      </p>
    </aside>
  );
}

function UsersPage() {
  useAdminBreadcrumbs([{ label: 'Site' }, { label: 'Users' }]);
  const toast = useToast();

  const {
    items,
    error,
    isLoading,
    counts,
    refetch,
    invite,
    update,
    setDisabled,
    remove,
  } = useAdminUsers();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyRowId, setBusyRowId] = useState(null);
  const [menu, setMenu] = useState(null); // { row, anchorEl }
  const openMenu = (row, event) => setMenu({ row, anchorEl: event.currentTarget });
  const closeMenu = () => setMenu(null);

  const isLastActiveAdmin = useCallback(
    (row) =>
      row?.role === 'admin' && !row.isDisabled && counts.activeAdmins <= 1,
    [counts.activeAdmins],
  );

  const handleInvite = useCallback(
    async (payload) => {
      const result = await invite(payload);
      toast.success(`Invite sent to ${result.user.email}`);
      return result;
    },
    [invite, toast],
  );

  const handleSaveEdit = useCallback(
    async (patch) => {
      if (!editTarget) return;
      const next = await update(editTarget.id, patch);
      toast.success(`Updated ${next.name}`);
    },
    [editTarget, toast, update],
  );

  const handleToggleDisabled = useCallback(
    async (row) => {
      if (busyRowId) return;
      try {
        setBusyRowId(row.id);
        const next = await setDisabled(row.id, !row.isDisabled);
        toast.success(
          next.isDisabled
            ? `Disabled ${next.name}`
            : `Re-enabled ${next.name}`,
        );
      } catch (err) {
        toast.error(err?.message || 'Could not update this user.');
      } finally {
        setBusyRowId(null);
      }
    },
    [busyRowId, setDisabled, toast],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await remove(deleteTarget.id);
    toast.success(`Removed ${deleteTarget.name}`);
  }, [deleteTarget, remove, toast]);

  const columns = useMemo(
    () => [
      {
        field: 'avatar',
        headerName: '',
        width: 64,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => (
          <img
            className={styles.avatar}
            src={avatarFor(row)}
            alt=""
            width={36}
            height={36}
            loading="lazy"
          />
        ),
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 1.2,
        minWidth: 180,
        renderCell: ({ row }) => (
          <button
            type="button"
            className={styles.nameBtn}
            onClick={() => setEditTarget(row)}
          >
            {row.name}
          </button>
        ),
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 1.4,
        minWidth: 220,
        renderCell: ({ row }) => (
          <span className={styles.muted}>{row.email}</span>
        ),
      },
      {
        field: 'role',
        headerName: 'Role',
        width: 120,
        renderCell: ({ row }) => (
          <span
            className={[styles.chip, ROLE_CHIP_CLASS[row.role]].join(' ')}
          >
            {ROLE_LABEL[row.role] || row.role}
          </span>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        renderCell: ({ row }) => (
          <span
            className={[styles.chip, STATUS_CHIP_CLASS[row.status]].join(' ')}
          >
            {row.status}
          </span>
        ),
      },
      {
        field: 'lastLoginAt',
        headerName: 'Last login',
        width: 140,
        renderCell: ({ row }) => (
          <span className={styles.muted}>
            {row.lastLoginAt ? formatDate(row.lastLoginAt) : '—'}
          </span>
        ),
      },
      {
        field: '__actions',
        headerName: '',
        width: 70,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Tooltip title="More actions" placement="top" arrow>
            <IconButton
              size="small"
              aria-label={`Actions for ${row.name}`}
              className={styles.iconBtn}
              onClick={(e) => openMenu(row, e)}
            >
              <MoreVertRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [],
  );

  const menuRow = menu?.row;
  const menuIsLastAdmin = menuRow ? isLastActiveAdmin(menuRow) : false;

  return (
    <>
      <Seo title="Admin users | Admin" noindex />
      <AdminPageHeader
        eyebrow="Site"
        title="Admin users"
        description="Invite teammates and assign roles."
        actions={
          <AppButton
            variant="primary"
            icon={<PersonAddAlt1RoundedIcon fontSize="small" />}
            onClick={() => setInviteOpen(true)}
          >
            Invite admin
          </AppButton>
        }
      />

      <div className={styles.layout}>
        <div className={styles.gridCard}>
          <div className={styles.gridWrap} data-admin-grid-wrap>
            {error && !isLoading ? (
              <div className={styles.errorWrap}>
                <ErrorState
                  title="Could not load admin users"
                  description={error?.message || 'Please try again.'}
                  onRetry={refetch}
                />
              </div>
            ) : null}
            <DataGrid
              rows={items}
              columns={columns}
              getRowId={(r) => r.id}
              loading={isLoading}
              rowHeight={64}
              columnHeaderHeight={48}
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              getRowClassName={({ row }) =>
                row.isDisabled ? styles.disabledRow : ''
              }
              slots={{
                noRowsOverlay: NoRowsOverlay,
                loadingOverlay: LoadingOverlay,
              }}
              slotProps={{
                loadingOverlay: { variant: 'linear-progress' },
              }}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              sx={{
                border: 0,
                backgroundColor: 'transparent',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'background.default',
                  borderBottom: '1px solid #243030',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontSize: '0.6875rem',
                  color: 'text.secondary',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(184, 146, 79, 0.04)',
                },
                '& .MuiDataGrid-cell': { borderColor: 'divider' },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid',
                  borderColor: 'divider',
                },
              }}
            />
          </div>
        </div>

        <RolesReferencePanel counts={counts} />
      </div>

      <Menu
        open={Boolean(menu)}
        anchorEl={menu?.anchorEl || null}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (menuRow) setEditTarget(menuRow);
            closeMenu();
          }}
        >
          <EditOutlinedIcon fontSize="small" className={styles.menuIcon} />
          Edit
        </MenuItem>
        <MenuItem
          disabled={
            !menuRow ||
            busyRowId === menuRow?.id ||
            (!menuRow?.isDisabled && menuIsLastAdmin)
          }
          onClick={() => {
            if (menuRow) handleToggleDisabled(menuRow);
            closeMenu();
          }}
        >
          {menuRow?.isDisabled ? (
            <>
              <LockOpenRoundedIcon
                fontSize="small"
                className={styles.menuIcon}
              />
              Enable
            </>
          ) : (
            <>
              <BlockRoundedIcon fontSize="small" className={styles.menuIcon} />
              Disable
            </>
          )}
        </MenuItem>
        <MenuItem
          disabled={!menuRow || menuIsLastAdmin}
          onClick={() => {
            if (menuRow) setDeleteTarget(menuRow);
            closeMenu();
          }}
        >
          <DeleteOutlineRoundedIcon
            fontSize="small"
            className={styles.menuIcon}
          />
          Delete
        </MenuItem>
      </Menu>

      <InviteAdminDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />

      <EditAdminDialog
        open={Boolean(editTarget)}
        user={editTarget}
        isLastAdmin={editTarget ? isLastActiveAdmin(editTarget) : false}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveEdit}
      />

      <DeleteAdminDialog
        open={Boolean(deleteTarget)}
        user={deleteTarget}
        isLastAdmin={deleteTarget ? isLastActiveAdmin(deleteTarget) : false}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default UsersPage;
