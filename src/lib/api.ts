import { API_URL } from './config';
import { tokenStore } from './token-store';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Options = {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach bearer token (default true)
  headers?: Record<string, string>;
};

async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const { method = 'GET', body, auth = true, headers = {} } = opts;
  const h: Record<string, string> = { ...headers };
  let payload: BodyInit | undefined;

  if (body !== undefined) {
    h['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  if (auth) {
    const token = await tokenStore.get();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { method, headers: h, body: payload });

  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) || res.statusText || 'Request failed';
    throw new ApiError(res.status, Array.isArray(message) ? message.join(', ') : message);
  }
  return data as T;
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Multipart upload (evidence). `file` is an RN file descriptor {uri,name,type}. */
async function upload<T>(
  path: string,
  file: { uri: string; name: string; type: string },
  fields: Record<string, string> = {},
): Promise<T> {
  const form = new FormData();
  // React Native FormData accepts this shape for file parts.
  form.append('file', { uri: file.uri, name: file.name, type: file.type } as any);
  for (const [k, v] of Object.entries(fields)) form.append(k, v);

  const token = await tokenStore.get();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) throw new ApiError(res.status, (data && data.message) || 'Upload failed');
  return data as T;
}

export const api = {
  get: <T>(path: string, auth = true) => request<T>(path, { method: 'GET', auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'POST', body, auth }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload,
};
