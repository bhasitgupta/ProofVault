const API_BASE = '/api/v1';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('sdms_token');
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('sdms_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/mfa') {
        window.location.href = '/login';
      }
    }
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errJson.error || errorDetail;
    } catch {
      errorDetail = response.statusText ? `HTTP ${response.status}: ${response.statusText}` : `HTTP ${response.status} (Internal Server Error)`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}
