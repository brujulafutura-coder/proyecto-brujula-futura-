/**
 * Brújula Futura — Página Explorador
 * Tres pestañas: Carreras, Universidades, Versus.
 * Iconos Lucide, toasts Sonner, sin emojis.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Building2, Swords, Wrench, Microscope, Palette,
  Users, Briefcase, BarChart3, BookOpen, MapPin, ExternalLink,
  Clock, DollarSign, School, BadgeCheck, Check, X, Loader2, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import AnimatedPage from '../components/AnimatedPage';
import { SkeletonList } from '../components/SkeletonLoader';
import { getCarreras, getUniversidades, compararCarreras } from '../services/api';
import { trackEvent } from '../services/analyticsService';

const AREA_ICONS = {
  Realista: Wrench, Investigador: Microscope, Artístico: Palette,
  Social: Users, Emprendedor: Briefcase, Convencional: BarChart3,
};

const UNI_ICONS = { PUB: Building2, PRI: School, TEC: Wrench, INS: BookOpen };
const UNI_LABELS = { PUB: 'Pública', PRI: 'Privada', TEC: 'Tecnológico', INS: 'Instituto' };

const AreaIcon = ({ name, size = 14 }) => {
  const Icon = AREA_ICONS[name] || BookOpen;
  return <Icon size={size} />;
};

const CAREER_IMAGES = {
  'Ingeniería en Software': 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
  'Ciencia de Datos e Inteligencia Artificial': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
  'Medicina': 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg',
  'Enfermería': 'https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg',
  'Psicología': 'https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg',
  'Educación Inicial': 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg',
  'Derecho': 'https://images.pexels.com/photos/5669619/pexels-photo-5669619.jpeg',
  'Administración de Empresas': 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
  'Marketing Digital': 'https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg',
  'Contabilidad y Auditoría': 'https://images.pexels.com/photos/6693661/pexels-photo-6693661.jpeg',
  'Ingeniería Civil': 'https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg',
  'Electricidad y Automatización': 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg',
  'Arquitectura': 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
  'Diseño Gráfico': 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg',
  'Turismo y Hospitalidad': 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
  'Gastronomía': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
  'Ingeniería Aeroespacial': 'https://images.pexels.com/photos/60132/pexels-photo-60132.jpeg',
}

function CareerImage({ nombre }) {
  const url = CAREER_IMAGES[nombre]
  if (!url) return null
  return <img src={url} alt={nombre} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px 10px 0 0', display: 'block', marginBottom: '10px' }} />
}

export default function ExplorerPage() {
  const [carreras, setCarreras] = useState([]);
  const [universidades, setUniversidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroArea, setFiltroArea] = useState('');
  const [tab, setTab] = useState('carreras');
  const [selected, setSelected] = useState([]);
  const [vsResult, setVsResult] = useState(null);
  const [vsLoading, setVsLoading] = useState(false);

  useEffect(() => {
    Promise.all([getCarreras(), getUniversidades()])
      .then(([c, u]) => { setCarreras(c); setUniversidades(u); setLoading(false); })
      .catch(() => { setLoading(false); toast.error('No se pudieron cargar los datos. Intenta recargar.'); });
  }, []);

  const toggleSelect = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) { toast.info('Máximo 3 carreras para comparar.'); return prev; }
      
      // Telemetría: Registro silencioso de carrera explorada
      const carreraObj = carreras.find(c => c.id_carrera === id);
      if (carreraObj) trackEvent('CAREER_VIEW', { carrera: carreraObj.nombre_carrera, area: carreraObj.area_nombre });
      
      return [...prev, id];
    });
    setVsResult(null);
  };

  const handleVersus = async () => {
    if (selected.length < 2) { toast.warning('Selecciona al menos 2 carreras.'); return; }
    setVsLoading(true);
    
    // Telemetría: Registro de comparación
    const selectedNames = carreras.filter(c => selected.includes(c.id_carrera)).map(c => c.nombre_carrera);
    trackEvent('CAREER_COMPARE', { carreras_comparadas: selectedNames });

    try {
      const res = await compararCarreras(selected);
      setVsResult(res);
      setTab('versus');
      toast.success('Comparación lista.');
    } catch (e) {
      toast.error('Error al comparar: ' + e.message);
    }
    setVsLoading(false);
  };

  const filteredCarreras = filtroArea ? carreras.filter(c => c.area_codigo === filtroArea) : carreras;
  const areas = [...new Set(carreras.map(c => c.area_codigo))].filter(Boolean);

  const tabs = [
    { id: 'carreras', label: 'Carreras', icon: <GraduationCap size={16} /> },
    { id: 'universidades', label: 'Universidades', icon: <Building2 size={16} /> },
    { id: 'versus', label: 'Versus', icon: <Swords size={16} /> },
  ];

  return (
    <AnimatedPage>
      <section className="explorer-section">
        <motion.h1
          className="explorer-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Explora tu <span className="accent">futuro</span>
        </motion.h1>
        <motion.p
          className="explorer-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Navega carreras, universidades y compara opciones lado a lado.
        </motion.p>

        {/* Tabs */}
        <motion.div
          className="explorer-tabs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {tabs.map(t => (
            <motion.button
              key={t.id}
              className={tab === t.id ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setTab(t.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t.icon} {t.label}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── CARRERAS TAB ── */}
          {tab === 'carreras' && (
            <motion.div key="carreras" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              {/* Area filters */}
              <div className="explorer-filters">
                <motion.button
                  className={filtroArea === '' ? 'bf-filter-active' : 'bf-filter'}
                  onClick={() => setFiltroArea('')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Todas
                </motion.button>
                {areas.map(a => (
                  <motion.button
                    key={a}
                    className={filtroArea === a ? 'bf-filter-active' : 'bf-filter'}
                    onClick={() => setFiltroArea(a)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {a}
                  </motion.button>
                ))}
              </div>

              {/* Versus bar */}
              {selected.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="explorer-vs-bar"
                >
                  <span>
                    <Swords size={16} /> <strong>{selected.length}</strong>/3 seleccionadas
                  </span>
                  <div className="explorer-vs-actions">
                    <motion.button className="btn-secondary btn-sm" onClick={() => { setSelected([]); setVsResult(null); }} whileHover={{ scale: 1.05 }}>
                      <X size={14} /> Limpiar
                    </motion.button>
                    <motion.button
                      className="btn-primary btn-sm"
                      onClick={handleVersus}
                      disabled={selected.length < 2 || vsLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {vsLoading ? <><Loader2 size={14} className="spin-icon" /> Cargando...</> : <><Swords size={14} /> Comparar</>}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {loading ? <SkeletonList count={6} /> : (
                <div className="explorer-grid">
                  {filteredCarreras.map((c, i) => {
                    const isSelected = selected.includes(c.id_carrera);
                    return (
                      <motion.div
                        key={c.id_carrera}
                        className={`explorer-card ${isSelected ? 'explorer-card-selected' : ''}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ y: -4 }}
                        onClick={() => toggleSelect(c.id_carrera)}
                      >
                        {isSelected && (
                          <motion.div className="explorer-check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Check size={14} />
                          </motion.div>
                        )}
                        <CareerImage nombre={c.nombre_carrera} />
                        <span className="career-area-tag">
                          <AreaIcon name={c.area_nombre} size={12} /> {c.area_nombre}
                        </span>
                        <h3>{c.nombre_carrera}</h3>
                        <div className="career-meta">
                          <span><Clock size={13} /> {c.duracion_meses} meses · {c.tipo_opcion}</span>
                          <span><Briefcase size={13} /> {c.salida_laboral?.substring(0, 80)}{c.salida_laboral?.length > 80 ? '...' : ''}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── UNIVERSIDADES TAB ── */}
          {tab === 'universidades' && (
            <motion.div key="universidades" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              {loading ? <SkeletonList count={4} /> : (
                <div className="explorer-grid">
                  {universidades.map((u, i) => {
                    const UniIcon = UNI_ICONS[u.tipo_universidad] || Building2;
                    return (
                      <motion.div
                        key={u.id_universidad}
                        className="explorer-card"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ y: -4 }}
                        onClick={() => trackEvent('UNIVERSITY_CLICK', { universidad: u.nombre_universidad })}
                      >
                        <span className="career-area-tag">
                          <UniIcon size={12} /> {UNI_LABELS[u.tipo_universidad] || u.tipo_universidad}
                        </span>
                        <h3>{u.nombre_universidad}</h3>
                        <div className="career-meta">
                          <span><MapPin size={13} /> {u.ciudad}, {u.provincia}</span>
                        </div>
                        {u.sitio_web && (
                          <a href={u.sitio_web} target="_blank" rel="noopener noreferrer" className="explorer-web-link" onClick={e => e.stopPropagation()}>
                            <ExternalLink size={13} /> Visitar sitio web
                          </a>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── VERSUS TAB ── */}
          {tab === 'versus' && (
            <motion.div key="versus" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              {!vsResult ? (
                <div className="explorer-empty-vs">
                  <Swords size={40} className="explorer-empty-icon" />
                  <h2>Comparador de Carreras</h2>
                  <p>Selecciona 2 o 3 carreras en la pestaña "Carreras" y presiona "Comparar".</p>
                  <motion.button className="btn-primary" onClick={() => setTab('carreras')} whileHover={{ scale: 1.05 }}>
                    Ir a seleccionar
                  </motion.button>
                </div>
              ) : (
                <div>
                  <div className="explorer-vs-grid" style={{ gridTemplateColumns: `repeat(${vsResult.carreras.length}, 1fr)` }}>
                    {vsResult.carreras.map((c, i) => (
                      <motion.div
                        key={c.id_carrera}
                        className="explorer-card"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12 }}
                      >
                        <span className="career-area-tag">
                          <AreaIcon name={c.area_nombre} size={12} /> {c.area_nombre}
                        </span>
                        <h3>{c.nombre_carrera}</h3>
                        <div className="vs-detail-list">
                          <div className="vs-detail-row">
                            <span><Clock size={13} /> Duración</span>
                            <strong>{c.duracion_meses} meses</strong>
                          </div>
                          <div className="vs-detail-row">
                            <span><DollarSign size={13} /> Costo</span>
                            <strong>{c.costo_promedio ? `$${c.costo_promedio}` : 'Gratuita'}</strong>
                          </div>
                          <div className="vs-detail-row">
                            <span><Building2 size={13} /> Universidades</span>
                            <strong>{c.universidades_disponibles}</strong>
                          </div>
                          <div className="vs-detail-row">
                            <span><BookOpen size={13} /> Modalidades</span>
                            <strong>{c.modalidades.join(', ') || '—'}</strong>
                          </div>
                        </div>
                        <p className="vs-salida">{c.salida_laboral}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Analysis */}
                  <motion.div
                    className="explorer-analysis"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3><BarChart3 size={20} /> Análisis Comparativo</h3>
                    <div className="analysis-grid">
                      {vsResult.analisis.mas_corta && (
                        <div className="analysis-item">
                          <Clock size={20} className="analysis-icon" />
                          <div>
                            <p className="analysis-label">Más corta</p>
                            <p className="analysis-value">{vsResult.analisis.mas_corta.nombre} — {vsResult.analisis.mas_corta.duracion_meses} meses</p>
                          </div>
                        </div>
                      )}
                      {vsResult.analisis.mas_economica && (
                        <div className="analysis-item">
                          <DollarSign size={20} className="analysis-icon" />
                          <div>
                            <p className="analysis-label">Más económica</p>
                            <p className="analysis-value">{vsResult.analisis.mas_economica.nombre} — ${vsResult.analisis.mas_economica.costo_promedio}/sem</p>
                          </div>
                        </div>
                      )}
                      {vsResult.analisis.mas_opciones && (
                        <div className="analysis-item">
                          <Building2 size={20} className="analysis-icon" />
                          <div>
                            <p className="analysis-label">Más opciones</p>
                            <p className="analysis-value">{vsResult.analisis.mas_opciones.nombre} — {vsResult.analisis.mas_opciones.universidades} universidades</p>
                          </div>
                        </div>
                      )}
                      {vsResult.analisis.opciones_gratuitas?.length > 0 && (
                        <div className="analysis-item">
                          <BadgeCheck size={20} className="analysis-icon" />
                          <div>
                            <p className="analysis-label">Opciones gratuitas</p>
                            <p className="analysis-value">{vsResult.analisis.opciones_gratuitas.join(', ')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <div className="explorer-vs-reset">
                    <motion.button className="btn-secondary" onClick={() => { setSelected([]); setVsResult(null); setTab('carreras'); }} whileHover={{ scale: 1.05 }}>
                      <RotateCcw size={16} /> Nueva comparación
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </AnimatedPage>
  );
}
