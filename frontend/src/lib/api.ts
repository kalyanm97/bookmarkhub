// frontend/src/lib/api.ts
import { extractErrorMessage } from './utils';

const BASE = (process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001').replace(/\/+$/, '');

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

function joinUrl(path: string) {
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}
function isBlob(body: unknown): body is Blob {
  return typeof Blob !== 'undefined' && body instanceof Blob;
}
async function readError(res: Response): Promise<string> {
  const ct = res.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      const j = await res.json();
      // NestJS often returns { message: string | string[] }
      if (typeof j?.message === 'string') return j.message;
      if (Array.isArray(j?.message)) return j.message.join(', ');
      if (typeof j?.error === 'string') return j.error;
      return JSON.stringify(j);
    }
    return await res.text();
  } catch (e) {
    try { // eslint-disable-next-line no-console
  if (String(process.env.NODE_ENV) !== 'production') console.debug('[api] readError parse failed', e);
    } catch { void 0; }
    return res.statusText || `HTTP ${res.status}`;
  }
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  const hasBody = init.body !== undefined && init.body !== null;

  if (hasBody && !isFormData(init.body) && !isBlob(init.body) && typeof init.body !== 'string') {
    headers.set('Content-Type', 'application/json');
    init = { ...init, body: JSON.stringify(init.body as JsonValue) };
  }

  if (hasBody && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  let res: Response;
  try {
    try {
  if (String(process.env.NODE_ENV) !== 'production') {
  const method = (init && ((init as RequestInit).method as string)) || 'GET';
        const url = joinUrl(path);
  let debugBody: unknown = null;
        if (hasBody) {
          if (isFormData(init.body)) debugBody = 'FormData';
          else if (isBlob(init.body)) debugBody = 'Blob';
          else if (typeof init.body === 'string') debugBody = init.body;
          else debugBody = init.body;
        }
        try {
          console.debug('[api] ->', method, url, 'body=', debugBody, 'headers=', Object.fromEntries(headers.entries()));
        } catch (e) {
          try { // eslint-disable-next-line no-console
            if (String(process.env.NODE_ENV) !== 'production') console.debug('[api] console.debug failed', e);
          } catch { void 0; }
        }
      }
    } catch (e) {
      try { // eslint-disable-next-line no-console
    if (String(process.env.NODE_ENV) !== 'production') console.debug('[api] dev debug block failed', e);
      } catch { void 0; }
    }
    res = await fetch(joinUrl(path), {
      credentials: 'include',
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeout);
    throw new Error(extractErrorMessage(err, 'Network error'));
  }
  clearTimeout(timeout);

  if (!res.ok) {
    throw new Error(await readError(res));
  }

  if (res.status === 204 || res.status === 205) {
    return undefined as unknown as T;
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

export const get = <T = unknown>(path: string, init?: RequestInit) =>
  api<T>(path, { method: 'GET', ...(init || {}) });

export const post = <T = unknown>(path: string, body?: JsonValue | BodyInit, init?: RequestInit) =>
  api<T>(path, { method: 'POST', body: body as BodyInit | undefined, ...(init || {}) });

export const put = <T = unknown>(path: string, body?: JsonValue | BodyInit, init?: RequestInit) =>
  api<T>(path, { method: 'PUT', body: body as BodyInit | undefined, ...(init || {}) });

export const del = <T = unknown>(path: string, init?: RequestInit) =>
  api<T>(path, { method: 'DELETE', ...(init || {}) });

export { BASE };