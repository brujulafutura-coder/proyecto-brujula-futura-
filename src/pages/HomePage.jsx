/**
 * Brújula Futura — Página de Inicio
 * Hero con estadísticas dinámicas + sección Bento Grid de funcionalidades.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Search, Brain, GraduationCap, Swords,
  ArrowRight, ChevronDown, Shield, Clock, Zap
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { getUniversidades, getCarreras } from '../services/api';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
});

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const PREVIEW_CAREERS = [
  { nombre: 'Medicina', img: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg' },
  { nombre: 'Ingeniería en Software', img: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg' },
  { nombre: 'Arquitectura', img: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg' },
  { nombre: 'Diseño Gráfico', img: 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg' },
  { nombre: 'Derecho', img: 'https://images.pexels.com/photos/5669619/pexels-photo-5669619.jpeg' },
  { nombre: 'Psicología', img: 'https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg' },
  { nombre: 'Marketing Digital', img: 'https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg' },
  { nombre: 'Turismo y Hospitalidad', img: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg' },
]

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
      {/* ── Hero ────────────────────────────────────── */}
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
              <Sparkles size={18} /> Hacer el test
            </motion.button>
            <motion.button
              className="btn-secondary"
              id="btn-ver-carreras"
              onClick={() => navigate('/explorar')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search size={16} /> Ver carreras
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
          onClick={() => document.getElementById('bento-features')?.scrollIntoView({ behavior: 'smooth' })}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span>Descubre más</span>
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* ── Carreras Preview ─────────────────────── */}
      <section className="careers-preview-section">
        <motion.div
          className="careers-preview-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Carreras que puedes <span className="accent">explorar</span></h2>
          <p>Desde tecnología hasta salud, encuentra la carrera que va contigo.</p>
        </motion.div>
        <div className="careers-preview-track-wrapper">
          <div className="careers-preview-track">
            {[...PREVIEW_CAREERS, ...PREVIEW_CAREERS].map((c, i) => (
              <div key={i} className="career-preview-card" onClick={() => navigate('/explorar')}>
                <img src={c.img} alt={c.nombre} />
                <div className="career-preview-overlay">
                  <span>{c.nombre}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bento Grid Features ────────────────────── */}
      <section className="bento-section" id="bento-features">
        <motion.div
          className="bento-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Tu camino en <span className="accent">tres pasos</span></h2>
          <p>Una experiencia diseñada para ayudarte a tomar decisiones informadas sobre tu futuro profesional.</p>
        </motion.div>

        <div className="bento-grid">
          <motion.div
            className="bento-card bento-card-featured"
            style={{ backgroundImage: 'url(https://images.pexels.com/photos/3768894/pexels-photo-3768894.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden' }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -6 }}
            onClick={() => navigate('/test')}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(124,58,237,0.75) 0%, rgba(0,0,0,0.85) 100%)', borderRadius: 'inherit' }} />
            <div className="bento-card-content" style={{ position: 'relative', zIndex: 1 }}>
              <div className="bento-icon-box bento-icon-violet"><Brain size={28} /></div>
              <div className="bento-step-badge">Paso 1</div>
              <h3>Test Vocacional RIASEC</h3>
              <p>Responde 18 preguntas basadas en el modelo de Holland. Descubre tu perfil de personalidad y las áreas que mejor se alinean contigo.</p>
              <div className="bento-card-tags">
                <span><Clock size={12} /> 5 minutos</span>
                <span><Shield size={12} /> Científicamente validado</span>
                <span><Zap size={12} /> Resultados instantáneos</span>
              </div>
              <div className="bento-card-cta">Comenzar test <ArrowRight size={16} /></div>
            </div>
          </motion.div>

          <motion.div
            className="bento-card"
            style={{ backgroundImage: 'url(https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden' }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            whileHover={{ y: -6 }}
            onClick={() => navigate('/explorar')}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,182,212,0.75) 0%, rgba(0,0,0,0.85) 100%)', borderRadius: 'inherit' }} />
            <div className="bento-card-content" style={{ position: 'relative', zIndex: 1 }}>
              <div className="bento-icon-box bento-icon-cyan"><GraduationCap size={24} /></div>
              <div className="bento-step-badge">Paso 2</div>
              <h3>Explorar Carreras</h3>
              <p>Navega entre {stats.carreras || '15'}+ carreras con datos reales de universidades ecuatorianas: costos, duración y salida laboral.</p>
              <div className="bento-card-cta">Ver carreras <ArrowRight size={16} /></div>
            </div>
          </motion.div>

          <motion.div
            className="bento-card"
            style={{ backgroundImage: 'url(https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden' }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -6 }}
            onClick={() => navigate('/explorar')}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(16,185,129,0.75) 0%, rgba(0,0,0,0.85) 100%)', borderRadius: 'inherit' }} />
            <div className="bento-card-content" style={{ position: 'relative', zIndex: 1 }}>
              <div className="bento-icon-box bento-icon-emerald"><Swords size={24} /></div>
              <div className="bento-step-badge">Paso 3</div>
              <h3>Comparar Opciones</h3>
              <p>Selecciona hasta 3 carreras y compáralas lado a lado: costos, duración, universidades y campo laboral.</p>
              <div className="bento-card-cta">Comparar <ArrowRight size={16} /></div>
            </div>
          </motion.div>
        </div>
      </section>
    </AnimatedPage>
  );
}
