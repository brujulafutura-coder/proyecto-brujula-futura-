const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Función para generar un UUID v4 (fallback manual si crypto.randomUUID no está disponible)
function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Obtener o crear el session_id de la sesión actual
function getSessionId() {
    let sessionId = sessionStorage.getItem('bf_session_id');
    if (!sessionId) {
        sessionId = generateUUID();
        sessionStorage.setItem('bf_session_id', sessionId);
        
        // Registrar automáticamente el inicio de sesión
        trackEvent('SESSION_START', { timestamp: new Date().toISOString() });
    }
    return sessionId;
}

// Obtener el ID del usuario si está logueado
function getUserId() {
    try {
        const userStr = localStorage.getItem('bf_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.id_usuario;
        }
    } catch (e) {
        console.error("Error reading user from localStorage for analytics", e);
    }
    return null;
}

/**
 * Registra un evento en el backend de forma asíncrona y no intrusiva (Fire and Forget)
 * @param {string} eventType - Tipo de evento (ej: 'TEST_START', 'CAREER_VIEW')
 * @param {object} details - Datos adicionales en formato JSON
 */
export const trackEvent = (eventType, details = {}) => {
    try {
        const payload = {
            session_id: getSessionId(),
            id_usuario: getUserId(),
            tipo_evento: eventType,
            detalles: details
        };

        // Disparamos el fetch y nos olvidamos (Fire and forget)
        // No usamos await para no bloquear en lo absoluto la interfaz de usuario
        fetch(`${API_URL}/analytics/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            // keepalive: true permite que el request termine aunque el usuario cambie de página
            keepalive: true 
        }).catch(err => {
            // Silenciamos los errores de analítica en consola para no ensuciar el log del usuario
            // console.warn("Analytics error:", err);
        });
    } catch (error) {
        // Ignorar fallos catastróficos en el tracker
    }
};

// Inicializar la sesión inmediatamente si no existe al cargar el script
getSessionId();
