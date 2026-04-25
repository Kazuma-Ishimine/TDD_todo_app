import app, { clearStorage } from '../../index';

export { clearStorage };

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Ghost app ID for testing.
 */
export const GHOST_APP_ID  = '00000000-0000-0000-0000-000000000000';
/**
 * Ghost todo ID for testing.
 */
export const GHOST_TODO_ID = '11111111-1111-1111-1111-111111111111';
/**
 * Regex to validate UUID format.
 */
export const UUID_RE    = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * Regex to validate ISO8601 datetime format.
 */
export const ISO8601_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

// ─── HTTP Helper ──────────────────────────────────────────────────────────────

/**
 * Makes an HTTP request to the app.
 */
export const request = (method: string, path: string, body?: unknown) =>
  app.request(`http://localhost${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

// ─── Factory Helpers ──────────────────────────────────────────────────────────

/**
 * Creates an app with the given name.
 */
export async function createApp(name: string) {
  const res = await request('POST', '/api/v1/apps', { name });
  const json = await res.json() as { data: { id: string; name: string; createdAt: string; updatedAt: string }; success: boolean };
  return json.data;
}

/**
 * Creates a todo with the given app ID and title.
 */
export async function createTodo(appId: string, title: string) {
  const res = await request('POST', `/api/v1/apps/${appId}/todos`, { title });
  const json = await res.json() as { data: { id: string; appId: string; title: string; completed: boolean; createdAt: string; updatedAt: string }; success: boolean };
  return json.data;
}
