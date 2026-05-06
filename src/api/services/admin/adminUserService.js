/**
 * Admin user service.
 *
 * The admin "team" area is mocked locally so the storefront and the admin
 * panel do not have to share the same `/api/users` resource (which is used
 * by customer accounts). The mock layer is backed by `localStorage`, so
 * invitations, edits and deletions persist across reloads while we wait
 * for the Laravel backend.
 *
 * The shape of every method matches what the real REST contract will look
 * like — `{ data, meta }` envelopes for list, `{ data }` for single
 * resource. Components only ever depend on the resolved value (the
 * unwrapped `data`), never on the transport.
 */

const STORAGE_KEY = 'ti_admin_users_mock_v1';
const VALID_ROLES = new Set(['admin', 'manager', 'viewer']);
const VALID_STATUSES = new Set(['Active', 'Invited', 'Disabled']);

const FIXED_NOW = () => new Date().toISOString();

const SEED_USERS = [
  {
    id: 1,
    name: 'Aaliyah Hassan',
    email: 'admin@thisinteriors.test',
    role: 'admin',
    status: 'Active',
    isDisabled: false,
    avatar: 'https://placehold.co/200x200/B8924F/F7F3ED?text=AH&font=playfair',
    lastLoginAt: '2026-04-29T08:30:00.000Z',
    createdAt: '2024-01-12T09:00:00.000Z',
    updatedAt: '2026-04-29T08:30:00.000Z',
    isSeed: true,
  },
  {
    id: 2,
    name: 'Marcus Lawal',
    email: 'manager@thisinteriors.test',
    role: 'manager',
    status: 'Active',
    isDisabled: false,
    avatar: 'https://placehold.co/200x200/B8924F/F7F3ED?text=ML&font=playfair',
    lastLoginAt: '2026-04-23T15:12:00.000Z',
    createdAt: '2024-03-04T09:00:00.000Z',
    updatedAt: '2026-04-23T15:12:00.000Z',
    isSeed: true,
  },
  {
    id: 3,
    name: 'Sana Khoury',
    email: 'viewer@thisinteriors.test',
    role: 'viewer',
    status: 'Active',
    isDisabled: false,
    avatar: 'https://placehold.co/200x200/B8924F/F7F3ED?text=SK&font=playfair',
    lastLoginAt: '2026-02-14T10:40:00.000Z',
    createdAt: '2024-06-18T09:00:00.000Z',
    updatedAt: '2026-02-14T10:40:00.000Z',
    isSeed: true,
  },
];

const hasWindow = typeof window !== 'undefined';

function readStore() {
  if (!hasWindow) return SEED_USERS.map((u) => ({ ...u }));
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStore(list) {
  if (!hasWindow) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* quota or privacy mode — non-fatal in dev */
  }
}

function ensureSeeded() {
  const existing = readStore();
  if (existing && existing.length) return existing;
  const seeded = SEED_USERS.map((u) => ({ ...u }));
  writeStore(seeded);
  return seeded;
}

function nextId(list) {
  return list.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0) + 1;
}

function avatarFor(name) {
  const initials =
    String(name || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join('')
      .toUpperCase() || 'TI';
  return `https://placehold.co/200x200/B8924F/F7F3ED?text=${encodeURIComponent(
    initials,
  )}&font=playfair`;
}

function makeTempPassword() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 12; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function delay(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeUser(raw) {
  const role = VALID_ROLES.has(raw.role) ? raw.role : 'viewer';
  const status = VALID_STATUSES.has(raw.status) ? raw.status : 'Active';
  return {
    id: raw.id,
    name: String(raw.name || '').trim(),
    email: String(raw.email || '').trim().toLowerCase(),
    role,
    status,
    isDisabled: Boolean(raw.isDisabled),
    avatar: raw.avatar || avatarFor(raw.name || raw.email),
    lastLoginAt: raw.lastLoginAt ?? null,
    createdAt: raw.createdAt || FIXED_NOW(),
    updatedAt: raw.updatedAt || FIXED_NOW(),
    isSeed: Boolean(raw.isSeed),
  };
}

function activeAdminCount(list) {
  return list.filter((u) => u.role === 'admin' && !u.isDisabled).length;
}

function notFound(id) {
  const err = new Error(`Admin user ${id} not found`);
  err.status = 404;
  return err;
}

function conflict(message) {
  const err = new Error(message);
  err.status = 409;
  return err;
}

function badRequest(message, fieldErrors) {
  const err = new Error(message);
  err.status = 400;
  if (fieldErrors) err.errors = fieldErrors;
  return err;
}

export const adminUserService = {
  async list() {
    const list = ensureSeeded().map(normalizeUser);
    await delay(120);
    return {
      items: list,
      meta: { total: list.length, page: 1, perPage: list.length },
    };
  },

  async getById(id) {
    const list = ensureSeeded();
    const found = list.find((u) => Number(u.id) === Number(id));
    await delay(80);
    if (!found) throw notFound(id);
    return normalizeUser(found);
  },

  async invite(payload = {}) {
    const list = ensureSeeded();
    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const role = VALID_ROLES.has(payload.role) ? payload.role : 'viewer';

    const fieldErrors = {};
    if (!name) fieldErrors.name = 'Name is required.';
    if (!email) fieldErrors.email = 'Email is required.';
    if (Object.keys(fieldErrors).length) {
      throw badRequest('Please fix the errors below.', fieldErrors);
    }

    if (list.some((u) => u.email === email)) {
      throw conflict('An admin with this email already exists.');
    }

    const tempPassword = makeTempPassword();
    const created = normalizeUser({
      id: nextId(list),
      name,
      email,
      role,
      status: 'Invited',
      isDisabled: false,
      avatar: avatarFor(name),
      lastLoginAt: null,
      createdAt: FIXED_NOW(),
      updatedAt: FIXED_NOW(),
      isSeed: false,
    });

    writeStore([...list, created]);
    await delay(220);
    return { user: created, tempPassword };
  },

  async update(id, payload = {}) {
    const list = ensureSeeded();
    const idx = list.findIndex((u) => Number(u.id) === Number(id));
    if (idx === -1) throw notFound(id);

    const current = list[idx];
    const next = { ...current };

    if (payload.name !== undefined) {
      const name = String(payload.name || '').trim();
      if (!name) {
        throw badRequest('Please fix the errors below.', {
          name: 'Name is required.',
        });
      }
      next.name = name;
      next.avatar = current.avatar || avatarFor(name);
    }

    if (payload.role !== undefined) {
      if (!VALID_ROLES.has(payload.role)) {
        throw badRequest('Please fix the errors below.', {
          role: 'Choose a valid role.',
        });
      }
      // Demoting the last admin is not allowed.
      if (
        current.role === 'admin' &&
        payload.role !== 'admin' &&
        activeAdminCount(list) <= 1
      ) {
        throw conflict(
          'You cannot remove the admin role from the last remaining admin.',
        );
      }
      next.role = payload.role;
    }

    next.updatedAt = FIXED_NOW();
    list[idx] = normalizeUser(next);
    writeStore(list);
    await delay(180);
    return list[idx];
  },

  async setDisabled(id, isDisabled) {
    const list = ensureSeeded();
    const idx = list.findIndex((u) => Number(u.id) === Number(id));
    if (idx === -1) throw notFound(id);

    const current = list[idx];
    if (
      isDisabled &&
      current.role === 'admin' &&
      !current.isDisabled &&
      activeAdminCount(list) <= 1
    ) {
      throw conflict('You cannot disable the last remaining admin.');
    }

    const next = normalizeUser({
      ...current,
      isDisabled: Boolean(isDisabled),
      status: isDisabled
        ? 'Disabled'
        : current.status === 'Disabled'
          ? 'Active'
          : current.status,
      updatedAt: FIXED_NOW(),
    });
    list[idx] = next;
    writeStore(list);
    await delay(160);
    return next;
  },

  async remove(id) {
    const list = ensureSeeded();
    const idx = list.findIndex((u) => Number(u.id) === Number(id));
    if (idx === -1) throw notFound(id);
    const target = list[idx];
    if (target.role === 'admin' && activeAdminCount(list) <= 1) {
      throw conflict('You cannot delete the last remaining admin.');
    }
    const next = list.slice();
    next.splice(idx, 1);
    writeStore(next);
    await delay(180);
    return { id: target.id };
  },

  /** Test-only helper. Resets the mock store. */
  __reset() {
    if (!hasWindow) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },
};

export default adminUserService;
