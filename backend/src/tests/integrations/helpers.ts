import app, { clearStorage } from '../../index';

export { clearStorage };

// ─── Constants ────────────────────────────────────────────────────────────────

export const GHOST_APP_ID  = '00000000-0000-0000-0000-000000000000';
export const GHOST_TODO_ID = '11111111-1111-1111-1111-111111111111';
export const UUID_RE    = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const ISO8601_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

// ─── HTTP Helper ──────────────────────────────────────────────────────────────

export const request = (method: string, path: string, body?: unknown) =>
  app.request(`http://localhost${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

// ─── Factory Helpers ──────────────────────────────────────────────────────────

export async function createApp(name: string) {
  const res = await request('POST', '/api/v1/apps', { name });
  const json = await res.json() as { data: { id: string; name: string; createdAt: string; updatedAt: string }; success: boolean };
  return json.data;
}

export async function createTodo(appId: string, title: string) {
  const res = await request('POST', `/api/v1/apps/${appId}/todos`, { title });
  const json = await res.json() as { data: { id: string; appId: string; title: string; completed: boolean; createdAt: string; updatedAt: string }; success: boolean };
  return json.data;
}
