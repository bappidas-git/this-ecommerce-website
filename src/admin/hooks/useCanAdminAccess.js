import { useMemo } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';

const PERMS = {
  admin: ['*'],
  manager: [
    'dashboard',
    'products',
    'categories',
    'inventory',
    'orders',
    'customers',
    'reviews',
    'coupons',
    'settings',
    'reports',
  ],
  viewer: [
    'dashboard',
    'products',
    'categories',
    'inventory',
    'orders',
    'customers',
    'reviews',
    'reports',
  ],
};

const VALID_AREAS = new Set([
  'dashboard',
  'products',
  'categories',
  'inventory',
  'orders',
  'customers',
  'reviews',
  'coupons',
  'settings',
  'reports',
  'users',
]);

function roleAllows(role, area) {
  const list = PERMS[role];
  if (!list) return false;
  if (list.includes('*')) return true;
  return list.includes(area);
}

export default function useCanAdminAccess(area) {
  const ctx = useAdminAuth();
  const role = ctx?.role ?? ctx?.user?.role ?? null;

  return useMemo(() => {
    if (!role) return { canRead: false, canWrite: false };
    if (!area) return { canRead: true, canWrite: role !== 'viewer' };
    if (!VALID_AREAS.has(area)) return { canRead: false, canWrite: false };
    const canRead = roleAllows(role, area);
    const canWrite = canRead && role !== 'viewer';
    return { canRead, canWrite };
  }, [role, area]);
}

export { PERMS };
