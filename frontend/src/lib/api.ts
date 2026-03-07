const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Refresh failed');
    return true;
  } catch {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return false;
  }
}

export async function api<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...rest } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  let res = await fetch(url, { ...rest, headers, credentials: 'include' });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await fetch(url, { ...rest, headers, credentials: 'include' });
    }
  }

  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After');
    const wait = retryAfter ? parseInt(retryAfter, 10) * 1000 : 3000;
    await new Promise((r) => setTimeout(r, wait));
    return api<T>(endpoint, options);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  let res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message);
  }

  return res.json();
}
