import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      className="navbar"
      id="navbar"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="nav-brand" onClick={() => navigate('/')}>
        <span className="compass">🧭</span>
        <span>Brújula Futura</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          Inicio
        </NavLink>
        <NavLink to="/test" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Test
        </NavLink>
        <NavLink to="/explorar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Explorar
        </NavLink>
      </div>

      <div className="nav-auth">
        <AnimatePresence mode="wait">
          {isAuthenticated ? (
            <motion.div
              key="user-session"
              className="nav-user"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <span className="nav-user-name" title={user?.correo}>
                👤 {user?.nombres?.split(' ')[0] || 'Usuario'}
              </span>
              <motion.button
                className="nav-btn-logout"
                id="btn-logout"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Salir
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              key="login-btn"
              className="nav-cta"
              id="btn-comenzar"
              onClick={() => navigate('/login')}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              whileHover={{ scale: 1.08, boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              Iniciar Sesión
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
