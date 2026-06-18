/**
 * Brújula Futura — Cliente API
 * Conecta el frontend con el backend FastAPI.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function fetchAPI(endpoint, options = {}) {
  // Inyectar token JWT si existe en localStorage
  const token = localStorage.getItem('bf_token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    // Si el token expiró, limpiar sesión
    if (res.status === 401) {
      localStorage.removeItem('bf_token');
      localStorage.removeItem('bf_user');
      window.dispatchEvent(new Event('auth_unauthorized'));
    }
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

// ── Procesar Resultados del Test ──
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

// ── Login ──────────────────────────────────────────────
export const login = (datos) =>
  fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(datos) });

// ── Chatbot (IA) ───────────────────────────────────────
export const enviarMensajeChat = (message, history, context = null) =>
  fetchAPI('/chat/', {
    method: 'POST',
    body: JSON.stringify({ message, history, context }),
  });

// ── Administración (Solo ADM) ─────────────────────────
export const getAdminStats = () => fetchAPI('/admin/stats');
export const getAdminUsers = () => fetchAPI('/admin/users');
