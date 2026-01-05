const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
const BASE_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return data;
}

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function apiPost(path, body) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? body : JSON.stringify(body || {}),
  });
  return handleResponse(res);
}

export async function apiPut(path, body) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    credentials: 'include',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? body : JSON.stringify(body || {}),
  });
  return handleResponse(res);
}

export async function apiDelete(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function apiPatch(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  return handleResponse(res);
}
