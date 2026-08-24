const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const SESSION_KEY = "ovejite_supabase_session";
const TABLE = "cms_records";

const assertConfigured = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.");
  }
};

const readSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
};
const saveSession = (session) => {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
};

async function authFetch(path, options = {}) {
  assertConfigured();
  const response = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { message: text }; }
  if (!response.ok) throw new Error(body?.msg || body?.message || body?.error_description || body?.error || "Authentication request failed");
  return body;
}

async function apiFetch(path, options = {}, retry = true) {
  assertConfigured();
  let session = readSession();
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

  let response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, { ...options, headers });

  if (response.status === 401 && retry && session?.refresh_token) {
    try {
      const refreshed = await authFetch(`/token?grant_type=refresh_token`, {
        method: "POST",
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      saveSession(refreshed);
      return apiFetch(path, options, false);
    } catch {
      saveSession(null);
    }
  }

  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { message: text }; }
  if (!response.ok) throw new Error(body?.message || body?.hint || body?.details || "Database request failed");
  return body;
}

const entityTableName = (name) => String(name);
const flatten = (row) => ({
  ...(row?.data || {}),
  id: row.id,
  created_date: row.created_at,
  updated_date: row.updated_at,
});

const normalize = (value) => {
  if (value === undefined) return null;
  return value;
};

const compareValues = (a, b) => {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
};

const sortItems = (items, sort) => {
  if (!sort) return items;
  const descending = String(sort).startsWith("-");
  const field = descending ? String(sort).slice(1) : String(sort);
  return [...items].sort((a, b) => {
    const result = compareValues(a?.[field], b?.[field]);
    return descending ? -result : result;
  });
};

const matches = (item, filters = {}) => Object.entries(filters).every(([key, expected]) => {
  if (expected === undefined || expected === null) return true;
  if (Array.isArray(expected)) return expected.includes(item?.[key]);
  return item?.[key] === expected;
});

function makeEntity(entityName) {
  const table = entityTableName(entityName);
  return {
    async list(sortBy = "-created_date", limit = 100) {
      const rows = await apiFetch(`/${TABLE}?entity=eq.${encodeURIComponent(table)}&select=id,entity,data,created_at,updated_at&limit=${Math.max(1, Number(limit) || 100)}`);
      return sortItems((rows || []).map(flatten), sortBy).slice(0, limit || 100);
    },
    async filter(filters = {}, sortBy = "-created_date", limit = 100) {
      const rows = await apiFetch(`/${TABLE}?entity=eq.${encodeURIComponent(table)}&select=id,entity,data,created_at,updated_at&limit=1000`);
      return sortItems((rows || []).map(flatten).filter((item) => matches(item, filters)), sortBy).slice(0, limit || 100);
    },
    async create(data) {
      const payload = { entity: table, data: data || {} };
      const rows = await apiFetch(`/${TABLE}`, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(payload),
      });
      return flatten(rows[0]);
    },
    async update(id, data) {
      const existing = await apiFetch(`/${TABLE}?id=eq.${encodeURIComponent(id)}&select=id,data,created_at,updated_at`);
      const merged = { ...(existing?.[0]?.data || {}), ...(data || {}) };
      const rows = await apiFetch(`/${TABLE}?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ data: merged }),
      });
      return flatten(rows[0]);
    },
    async delete(id) {
      await apiFetch(`/${TABLE}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      return true;
    },
  };
}

const entities = new Proxy({}, {
  get: (_target, name) => makeEntity(name),
});

const auth = {
  async me() {
    const session = readSession();
    if (!session?.access_token) throw new Error("Not authenticated");
    const user = await authFetch(`/user`, { headers: { Authorization: `Bearer ${session.access_token}` } });
    return user;
  },
  async loginViaEmailPassword(email, password) {
    const session = await authFetch(`/token?grant_type=password`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveSession(session);
    return session;
  },
  async logout() {
    const session = readSession();
    try {
      if (session?.access_token) {
        await authFetch(`/logout`, { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } });
      }
    } finally {
      saveSession(null);
    }
  },
  async register({ email, password }) {
    const result = await authFetch(`/signup`, {
      method: "POST",
      body: JSON.stringify({ email, password, options: { emailRedirectTo: window.location.origin + "/login" } }),
    });
    if (result?.access_token) saveSession(result);
    return result;
  },
  async resetPasswordRequest(email) {
    return authFetch(`/recover`, {
      method: "POST",
      body: JSON.stringify({ email, redirect_to: `${window.location.origin}/reset-password` }),
    });
  },
  async updatePassword(password) {
    const session = readSession();
    if (!session?.access_token) throw new Error("Your reset session has expired. Please request a new link.");
    return authFetch(`/user`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ password }),
    });
  },
  async loginWithProvider(provider, returnTo = "/") {
    assertConfigured();
    const redirect = `${window.location.origin}${returnTo || "/"}`;
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=${encodeURIComponent(provider)}&redirect_to=${encodeURIComponent(redirect)}`;
  },
  setToken(token) {
    const session = readSession() || {};
    saveSession({ ...session, access_token: token });
  },
};

const integrations = {
  Core: {
    async UploadFile({ file }) {
      assertConfigured();
      const session = readSession();
      if (!session?.access_token) throw new Error("Please log in before uploading images.");
      const safeName = String(file.name || "image").replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${crypto.randomUUID()}-${safeName}`;
      const response = await fetch(`${SUPABASE_URL}/storage/v1/object/site-images/${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": file.type || "application/octet-stream",
          "x-upsert": "true",
        },
        body: file,
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Upload failed");
      }
      return { file_url: `${SUPABASE_URL}/storage/v1/object/public/site-images/${path}` };
    },
  },
};

export const base44 = { entities, auth, integrations };
