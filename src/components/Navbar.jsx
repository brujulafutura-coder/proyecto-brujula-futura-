import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar() {
  const navigate = useNavigate();

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
      <motion.button
        className="nav-cta"
        id="btn-comenzar"
        onClick={() => navigate('/test')}
        whileHover={{ scale: 1.08, boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
        whileTap={{ scale: 0.95 }}
      >
        Comenzar
      </motion.button>
    </motion.nav>
  );
}
