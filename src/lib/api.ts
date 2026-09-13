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

/**
 * Multipart upload (evidence). `file` is an RN file descriptor {uri,name,type}.
 *
 * Uses React Native's XMLHttpRequest instead of the global `fetch`: Expo SDK 54+
 * installs a WinterCG `fetch` whose FormData serialization rejects RN's
 * {uri,name,type} file parts ("Unsupported FormDataPart implementation"). RN's
 * XHR uploads the part through native networking, streaming the file by uri.
 */
function upload<T>(
  path: string,
  file: { uri: string; name: string; type: string },
  fields: Record<string, string> = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const form = new FormData();
    // React Native FormData accepts this shape for file parts.
    form.append('file', { uri: file.uri, name: file.name, type: file.type } as any);
    for (const [k, v] of Object.entries(fields)) form.append(k, v);

    tokenStore
      .get()
      .then((token) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}${path}`);
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        // Do NOT set Content-Type — RN fills in the multipart boundary itself.
        xhr.onload = () => {
          const text = xhr.responseText;
          const data = text ? safeJson(text) : null;
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data as T);
          } else {
            const message =
              (data && (data.message || data.error)) || xhr.statusText || 'Upload failed';
            reject(new ApiError(xhr.status, Array.isArray(message) ? message.join(', ') : message));
          }
        };
        xhr.onerror = () => reject(new ApiError(xhr.status || 0, 'Upload failed'));
        xhr.send(form);
      })
      .catch(reject);
  });
}

export const api = {
  get: <T>(path: string, auth = true) => request<T>(path, { method: 'GET', auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'POST', body, auth }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload,
};
