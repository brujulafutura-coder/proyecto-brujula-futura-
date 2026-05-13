/**
 * Brújula Futura — Cliente API
 * Conecta el frontend con el backend FastAPI.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error de red' }));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return res.json();
}

// ── Universidades ──────────────────────────────────────
export const getUniversidades = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetchAPI(`/universidades/${qs ? '?' + qs : ''}`);
};

// ── Carreras ───────────────────────────────────────────
export const getCarreras = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetchAPI(`/carreras/${qs ? '?' + qs : ''}`);
};

export const getCarreraDetalle = (id) => fetchAPI(`/carreras/${id}`);

// ── Test Vocacional ────────────────────────────────────
export const getPreguntas = () => fetchAPI('/test/preguntas');

export const procesarTest = (respuestas) =>
  fetchAPI('/test/procesar', {
    method: 'POST',
    body: JSON.stringify({ respuestas }),
  });

// ── Versus ─────────────────────────────────────────────
export const compararCarreras = (ids) =>
  fetchAPI('/versus/comparar', {
    method: 'POST',
    body: JSON.stringify({ ids_carreras: ids }),
  });

// ── Auth ───────────────────────────────────────────────
export const registrarse = (datos) =>
  fetchAPI('/auth/registro', { method: 'POST', body: JSON.stringify(datos) });

export const login = (datos) =>
  fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(datos) });
