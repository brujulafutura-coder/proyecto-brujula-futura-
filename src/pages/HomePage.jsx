import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { getUniversidades, getCarreras } from '../services/api';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
});

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ carreras: 0, universidades: 0 });

  useEffect(() => {
    Promise.all([getCarreras(), getUniversidades()])
      .then(([c, u]) => setStats({ carreras: c.length, universidades: u.length }))
      .catch(() => {});
  }, []);

  return (
    <AnimatedPage>
      {/* Hero */}
      <section className="hero" id="inicio">
        <div className="hero-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`} />
          ))}
        </div>

        <motion.div className="hero-content section-inner" variants={stagger} initial="initial" animate="animate">
          <motion.div className="hero-badge" variants={fadeUp(0)}>
            <span className="dot" />
            Orientación Vocacional para Bachilleres
          </motion.div>

          <motion.h1 variants={fadeUp(0.1)}>
            Explora tu<br />
            <span className="accent">futuro</span>
          </motion.h1>

          <motion.p className="hero-sub" variants={fadeUp(0.2)}>
            Descubre carreras, compara opciones y encuentra un camino más claro
            para tu vida profesional. Una experiencia guiada, rápida y pensada para ti.
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp(0.3)}>
            <motion.button
              className="btn-primary"
              id="btn-explorar"
              onClick={() => navigate('/test')}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              ✨ Hacer el test
            </motion.button>
            <motion.button
              className="btn-secondary"
              id="btn-ver-carreras"
              onClick={() => navigate('/explorar')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver carreras
            </motion.button>
          </motion.div>

          <motion.div className="hero-stats" variants={fadeUp(0.4)}>
            <div className="stat">
              <motion.span
                className="stat-num"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              >
                {stats.carreras}+
              </motion.span>
              <span className="stat-label">Carreras exploradas</span>
            </div>
            <div className="stat">
              <motion.span
                className="stat-num"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              >
                {stats.universidades}
              </motion.span>
              <span className="stat-label">Universidades</span>
            </div>
            <div className="stat">
              <motion.span
                className="stat-num"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
              >
                100%
              </motion.span>
              <span className="stat-label">Gratuito</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-scroll"
          onClick={() => navigate('/test')}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span>Descubre más</span>
          <div className="scroll-arrow" />
        </motion.div>
      </section>

      {/* Quick features section */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.h2
          style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '48px' }}
          {...fadeUp(0)}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          ¿Cómo funciona <span className="accent">Brújula Futura</span>?
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { icon: '🧠', title: 'Test RIASEC', desc: 'Responde 18 preguntas basadas en psicología vocacional para descubrir tu perfil.' },
            { icon: '🎓', title: 'Explora Carreras', desc: 'Navega entre 15+ carreras con datos reales de universidades ecuatorianas.' },
            { icon: '⚔️', title: 'Versus', desc: 'Compara hasta 3 carreras lado a lado: costos, duración y oportunidades.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bf-card"
              style={{ padding: '32px', textAlign: 'center' }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -8, boxShadow: '0 16px 48px rgba(124,58,237,0.25)' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: '0.95rem' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </AnimatedPage>
  );
}
