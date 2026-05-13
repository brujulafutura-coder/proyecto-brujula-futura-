/**
 * Brújula Futura — Página de Registro
 * Diseño premium con validación en el cliente.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { useAuth } from '../context/AuthContext';
import { registrarse } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    clave: '',
    confirmarClave: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!form.nombres || !form.apellidos || !form.correo || !form.clave) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (form.clave.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (form.clave !== form.confirmarClave) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await registrarse({
        nombres: form.nombres,
        apellidos: form.apellidos,
        correo: form.correo,
        clave: form.clave,
      });
      login(res.access_token, res.usuario);
      navigate('/test', { replace: true });
    } catch (err) {
      setError(err.message || 'Error al registrarse.');
    }
    setLoading(false);
  };

  return (
    <AnimatedPage>
      <section className="auth-page">
        <div className="auth-container">
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
                initial={{ rotate: 20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                ✨
              </motion.span>
              <h1>Crea tu cuenta</h1>
              <p>Regístrate para descubrir tu vocación ideal</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form" id="register-form">
              <div className="auth-row">
                <div className="auth-field">
                  <label htmlFor="reg-nombres">Nombres</label>
                  <input
                    id="reg-nombres"
                    type="text"
                    name="nombres"
                    placeholder="Juan Carlos"
                    value={form.nombres}
                    onChange={handleChange}
                    autoComplete="given-name"
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="reg-apellidos">Apellidos</label>
                  <input
                    id="reg-apellidos"
                    type="text"
                    name="apellidos"
                    placeholder="Pérez López"
                    value={form.apellidos}
                    onChange={handleChange}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="reg-correo">Correo electrónico</label>
                <input
                  id="reg-correo"
                  type="email"
                  name="correo"
                  placeholder="tu@correo.com"
                  value={form.correo}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="auth-row">
                <div className="auth-field">
                  <label htmlFor="reg-clave">Contraseña</label>
                  <input
                    id="reg-clave"
                    type="password"
                    name="clave"
                    placeholder="Mínimo 6 caracteres"
                    value={form.clave}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="reg-confirmar">Confirmar</label>
                  <input
                    id="reg-confirmar"
                    type="password"
                    name="confirmarClave"
                    placeholder="Repetir contraseña"
                    value={form.confirmarClave}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
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
                id="btn-registro"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="auth-spinner">⏳ Registrando...</span>
                ) : (
                  '🎯 Crear Cuenta'
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="auth-footer">
              <p>
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="auth-link">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </AnimatedPage>
  );
}
