/**
 * Brújula Futura — Página de Login
 * Diseño premium con glassmorphism y animaciones Framer Motion.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from || '/test';

  const [form, setForm] = useState({ correo: '', clave: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.correo || !form.clave) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiLogin(form);
      login(res.access_token, res.usuario);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas.');
    }
    setLoading(false);
  };

  return (
    <AnimatedPage>
      <section className="auth-page">
        <div className="auth-container">
          {/* Decorative elements */}
          <div className="auth-glow auth-glow-1" />
          <div className="auth-glow auth-glow-2" />

          <motion.div
            className="auth-card"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', duration: 0.7, bounce: 0.3 }}
          >
            {/* Header */}
            <div className="auth-header">
              <motion.span
                className="auth-icon"
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                🧭
              </motion.span>
              <h1>Bienvenido de vuelta</h1>
              <p>Inicia sesión para continuar tu orientación vocacional</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form" id="login-form">
              <div className="auth-field">
                <label htmlFor="login-correo">Correo electrónico</label>
                <input
                  id="login-correo"
                  type="email"
                  name="correo"
                  placeholder="tu@correo.com"
                  value={form.correo}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="login-clave">Contraseña</label>
                <input
                  id="login-clave"
                  type="password"
                  name="clave"
                  placeholder="••••••••"
                  value={form.clave}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <motion.div
                  className="auth-error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ⚠️ {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                className="auth-submit"
                id="btn-login"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="auth-spinner">⏳ Ingresando...</span>
                ) : (
                  '🚀 Iniciar Sesión'
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="auth-footer">
              <p>
                ¿No tienes cuenta?{' '}
                <Link to="/registro" className="auth-link">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </AnimatedPage>
  );
}
