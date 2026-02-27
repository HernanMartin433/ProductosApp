const BASE_URL = '/api/v1/productos';

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(err.mensaje || err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

export const productosApi = {
  getAll: (soloActivos = true) =>
    fetch(`${BASE_URL}?soloActivos=${soloActivos}`).then(handleResponse),

  getById: (id) =>
    fetch(`${BASE_URL}/${id}`).then(handleResponse),

  create: (data) =>
    fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${BASE_URL}/${id}`, { method: 'DELETE' }).then(handleResponse),

  getLogs: (id) =>
    fetch(`${BASE_URL}/${id}/logs`).then(handleResponse),
};
