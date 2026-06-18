/**
 * Brújula Futura — Barra de Navegación
 * Navegación glassmorphic con menú hamburguesa responsive e iconografía Lucide.
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <motion.nav
      className="navbar"
      id="navbar"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="nav-brand" onClick={() => { navigate('/'); closeMenu(); }}>
        <Compass size={22} className="nav-compass-icon" />
        <span>Brújula Futura</span>
      </div>

      {/* Desktop links */}
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
        {user?.rol === 'Administrador' && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link admin-link ${isActive ? 'active' : ''}`}>
            <Shield size={16} style={{ marginRight: 6, verticalAlign: 'sub' }} /> Panel Admin
          </NavLink>
        )}
      </div>

      {/* Auth section (desktop) */}
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
                <User size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                {user?.nombres?.split(' ')[0] || 'Usuario'}
              </span>
              <motion.button
                className="nav-btn-logout"
                id="btn-logout"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={14} style={{ marginRight: 4 }} />
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

      {/* Hamburger button (mobile) */}
      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav-mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <NavLink to="/" className="nav-mobile-link" onClick={closeMenu} end>
              Inicio
            </NavLink>
            <NavLink to="/test" className="nav-mobile-link" onClick={closeMenu}>
              Test
            </NavLink>
            <NavLink to="/explorar" className="nav-mobile-link" onClick={closeMenu}>
              Explorar
            </NavLink>
            {user?.rol === 'Administrador' && (
              <NavLink to="/admin" className="nav-mobile-link admin-mobile-link" onClick={closeMenu}>
                <Shield size={16} style={{ display: 'inline-block', marginRight: 8 }} /> Panel Admin
              </NavLink>
            )}
            <div className="nav-mobile-divider" />
            {isAuthenticated ? (
              <>
                <span className="nav-mobile-user">
                  <User size={16} /> {user?.nombres?.split(' ')[0]}
                </span>
                <button className="nav-mobile-logout" onClick={handleLogout}>
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </>
            ) : (
              <button className="nav-mobile-cta" onClick={() => { navigate('/login'); closeMenu(); }}>
                Iniciar Sesión
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
