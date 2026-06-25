/**
 * Brújula Futura — Página Explorador
 * Tres pestañas: Carreras, Universidades, Versus.
 * Iconos Lucide, toasts Sonner, sin emojis.
 */
import { useEffect, useState, useRef } from 'react';
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
  'Gastronomía en ecuador': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
  'Ingeniería aeroespacial en ecuador': 'https://images.pexels.com/photos/60132/pexels-photo-60132.jpeg',
}

function CareerImage({ nombre }) {
  const url = CAREER_IMAGES[nombre];
  const imgRef = useRef(null);
  if (!url) return null;
  return (
    <img
      ref={imgRef}
      src={`${url}?auto=compress&cs=tinysrgb&w=480`}
      alt={nombre}
      loading="lazy"
      decoding="async"
      width={480}
      height={140}
      onLoad={() => imgRef.current?.classList.add('loaded')}
      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px 10px 0 0', display: 'block', marginBottom: '10px', opacity: 0, transition: 'opacity 0.4s ease' }}
      className="career-card-img"
    />
  );
}

function CarreraModal({ carrera, onClose }) {
  if (!carrera) return null
  const img = CAREER_IMAGES[carrera.nombre_carrera] || null
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {img && <img src={`${img}?auto=compress&cs=tinysrgb&w=640`} alt={carrera.nombre_carrera} loading="lazy" decoding="async" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '16px 16px 0 0' }} />}
        <div className="modal-body">
          <span className="career-area-tag" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>
            {carrera.area_nombre}
          </span>
          <h2>{carrera.nombre_carrera}</h2>
          <div className="modal-meta">
            <span><Clock size={14} /> {carrera.duracion_meses} meses</span>
            <span><Building2 size={14} /> {carrera.tipo_opcion}</span>
          </div>
          {carrera.salida_laboral && (
            <div className="modal-section">
              <h4><Briefcase size={14} /> Salida laboral</h4>
              <p>{carrera.salida_laboral}</p>
            </div>
          )}
          {carrera.perfil_recomendado && (
            <div className="modal-section">
              <h4><BadgeCheck size={14} /> Perfil recomendado</h4>
              <p>{carrera.perfil_recomendado}</p>
            </div>
          )}
          {carrera.oferta_universitaria?.length > 0 && (
            <div className="modal-section">
              <h4><GraduationCap size={14} /> Universidades donde se ofrece</h4>
              <ul className="modal-unis">
                {carrera.oferta_universitaria.map((u, i) => (
                  <li key={i}>{u.codigo_universidad} — ${u.costo_referencial_semestre}/semestre</li>
                ))}
              </ul>
            </div>
          )}
          <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={onClose}>Cerrar</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const UNI_DATA = {
  'Universidad San Francisco de Quito': { descripcion: 'Universidad privada de investigación, reconocida como la mejor del Ecuador por QS Rankings.', fundacion: 1988, ranking: 95, internacional: 90, investigacion: 88 },
  'Pontificia Universidad Católica del Ecuador': { descripcion: 'Una de las universidades más prestigiosas del país, con fuerte enfoque humanista y científico.', fundacion: 1946, ranking: 85, internacional: 70, investigacion: 80 },
  'Escuela Politécnica Nacional': { descripcion: 'Referente nacional en ingeniería, ciencias exactas y tecnología desde 1869.', fundacion: 1869, ranking: 88, internacional: 72, investigacion: 90 },
  'Universidad Central del Ecuador': { descripcion: 'La universidad pública más grande del Ecuador, con más de 180 años de historia.', fundacion: 1826, ranking: 70, internacional: 50, investigacion: 65 },
  'Escuela Superior Politécnica del Litoral': { descripcion: 'Líder en ciencias aplicadas, tecnología e innovación en la región Costa.', fundacion: 1958, ranking: 82, internacional: 75, investigacion: 85 },
  'Universidad de Cuenca': { descripcion: 'Principal universidad pública del Austro ecuatoriano, reconocida por su calidad académica.', fundacion: 1867, ranking: 75, internacional: 60, investigacion: 70 },
  'Universidad de Guayaquil': { descripcion: 'La universidad pública con mayor cantidad de estudiantes en Ecuador.', fundacion: 1867, ranking: 65, internacional: 45, investigacion: 60 },
  'Universidad Politécnica Salesiana': { descripcion: 'Universidad privada con enfoque salesiano, fuerte en ingeniería y ciencias sociales.', fundacion: 1994, ranking: 72, internacional: 65, investigacion: 68 },
  'Universidad Técnica Particular de Loja': { descripcion: 'Pionera en educación a distancia y virtual en Latinoamérica.', fundacion: 1971, ranking: 78, internacional: 80, investigacion: 74 },
  'Instituto Superior Tecnológico Yavirac': { descripcion: 'Instituto tecnológico público de Quito enfocado en formación técnica y tecnológica.', fundacion: 1945, ranking: 60, internacional: 30, investigacion: 55 },
}

function UniversidadModal({ uni, carreras = [], onClose }) {
  if (!uni) return null
  const data = UNI_DATA[uni.nombre_universidad] || {}
  const tipoLabel = { PUB: 'Pública', PRI: 'Privada', TEC: 'Tecnológico', INS: 'Instituto' }

  const carrerasDeEstaUni = carreras.filter(c =>
    c.oferta_universitaria?.some(o => o.codigo_universidad === uni.codigo_universidad)
  )

  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-content" initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 60, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body">
          <span className="career-area-tag" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>{tipoLabel[uni.tipo_universidad] || uni.tipo_universidad}</span>
          <h2>{uni.nombre_universidad}</h2>
          <div className="modal-meta">
            <span><MapPin size={14} /> {uni.ciudad}, {uni.provincia}</span>
          </div>

          {data.descripcion && (
            <div className="modal-section">
              <p>{data.descripcion}</p>
            </div>
          )}

          {data.ranking && (
            <div className="modal-section">
              <h4><BarChart3 size={14} /> Indicadores</h4>
              <div className="uni-stats">
                <div className="uni-stat-row">
                  <span>Ranking nacional</span>
                  <div className="uni-bar-bg"><div className="uni-bar-fill" style={{ width: `${data.ranking}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} /></div>
                  <span className="uni-bar-val">{data.ranking}/100</span>
                </div>
                <div className="uni-stat-row">
                  <span>Internacional</span>
                  <div className="uni-bar-bg"><div className="uni-bar-fill" style={{ width: `${data.internacional}%`, background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)' }} /></div>
                  <span className="uni-bar-val">{data.internacional}/100</span>
                </div>
                <div className="uni-stat-row">
                  <span>Investigación</span>
                  <div className="uni-bar-bg"><div className="uni-bar-fill" style={{ width: `${data.investigacion}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }} /></div>
                  <span className="uni-bar-val">{data.investigacion}/100</span>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>Fundada en {data.fundacion}</p>
            </div>
          )}

          {carrerasDeEstaUni.length > 0 && (
            <div className="modal-section">
              <h4><GraduationCap size={14} /> Carreras disponibles</h4>
              <div className="uni-carreras-list">
                {carrerasDeEstaUni.map((c, i) => {
                  const oferta = c.oferta_universitaria?.find(o => o.codigo_universidad === uni.codigo_universidad)
                  return (
                    <div key={i} className="uni-carrera-item">
                      <span>{c.nombre_carrera}</span>
                      <span className="uni-carrera-costo">{oferta?.costo_referencial_semestre ? '$' + oferta.costo_referencial_semestre + '/sem' : 'Gratuita'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            {uni.sitio_web && (
              <a href={uni.sitio_web} target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <ExternalLink size={15} /> Visitar sitio web
              </a>
            )}
            <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
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
  const [modalCarrera, setModalCarrera] = useState(null);
  const [modoVersus, setModoVersus] = useState(false);
  const [modalUniversidad, setModalUniversidad] = useState(null);

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

              {/* Versus bar — solo en modo selección */}
              {modoVersus && selected.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="explorer-vs-bar"
                >
                  <span>
                    <Swords size={16} /> <strong>{selected.length}</strong>/3 seleccionadas
                  </span>
                  <div className="explorer-vs-actions">
                    <motion.button className="btn-secondary btn-sm" onClick={() => { setSelected([]); setVsResult(null); setModoVersus(false); }} whileHover={{ scale: 1.05 }}>
                      <X size={14} /> Cancelar
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
                        transition={{ delay: Math.min(i * 0.04, 0.35) }}
                        whileHover={{ y: -4 }}
                        onClick={() => {
                          if (modoVersus) {
                            toggleSelect(c.id_carrera);
                          } else {
                            trackEvent('CAREER_VIEW', { carrera: c.nombre_carrera, area: c.area_nombre });
                            setModalCarrera(c);
                          }
                        }}
                      >
                        {isSelected && (
                          <motion.div className="explorer-check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Check size={14} />
                          </motion.div>
                        )}
                        <CareerImage nombre={c.nombre_carrera} />
                        <div className="explorer-card-inner">
                          <span className="career-area-tag">
                            <AreaIcon name={c.area_nombre} size={12} /> {c.area_nombre}
                          </span>
                          <h3>{c.nombre_carrera}</h3>
                          <div className="career-meta">
                            <span><Clock size={13} /> {c.duracion_meses} meses · {c.tipo_opcion}</span>
                            <span><Briefcase size={13} /> {c.salida_laboral?.substring(0, 80)}{c.salida_laboral?.length > 80 ? '...' : ''}</span>
                          </div>
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
                        onClick={() => { trackEvent('UNIVERSITY_CLICK', { universidad: u.nombre_universidad }); setModalUniversidad(u); }}
                      >
                        <div className="explorer-card-inner">
                          <span className="career-area-tag">
                            <UniIcon size={12} /> {UNI_LABELS[u.tipo_universidad] || u.tipo_universidad}
                          </span>
                          <h3>{u.nombre_universidad}</h3>
                          <div className="career-meta">
                            <span><MapPin size={13} /> {u.ciudad}, {u.provincia}</span>
                          </div>
                        </div>
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
                  <p>Elige 2 o 3 carreras y compáralas lado a lado: duración, costos, universidades y salida laboral.</p>
                  <motion.button
                    className="btn-primary"
                    style={{ marginTop: '1.5rem', padding: '14px 36px', fontSize: '1rem' }}
                    onClick={() => { setModoVersus(true); setTab('carreras'); setSelected([]); setVsResult(null); }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Swords size={16} /> Seleccionar carreras para comparar
                  </motion.button>
                </div>
              ) : (
                <motion.div key="versus-result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="vs-cards-grid">
                    {vsResult.carreras?.map((c, i) => {
                      const img = CAREER_IMAGES[c.nombre_carrera]
                      return (
                        <div key={i} className="vs-card">
                          {img && <img src={`${img}?auto=compress&cs=tinysrgb&w=480`} alt={c.nombre_carrera} loading="lazy" decoding="async" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }} />}
                          <div className="vs-card-body">
                            <span className="career-area-tag">{c.area_nombre}</span>
                            <h3>{c.nombre_carrera}</h3>
                            <div className="vs-card-stats">
                              <div className="vs-stat"><span className="vs-stat-label">Duración</span><span className="vs-stat-value">{c.duracion_meses} meses</span></div>
                              <div className="vs-stat"><span className="vs-stat-label">Costo</span><span className="vs-stat-value">{c.costo_promedio ? '$' + c.costo_promedio : 'Gratuita'}</span></div>
                              <div className="vs-stat"><span className="vs-stat-label">Universidades</span><span className="vs-stat-value">{c.num_universidades ?? c.universidades_disponibles}</span></div>
                              <div className="vs-stat"><span className="vs-stat-label">Modalidades</span><span className="vs-stat-value">{c.modalidades?.join(', ')}</span></div>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.5 }}>{c.salida_laboral}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="vs-analysis">
                    <h3>Análisis Comparativo</h3>
                    <div className="vs-analysis-grid">
                      {Array.isArray(vsResult.analisis) ? vsResult.analisis.map((item, i) => (
                        <div key={i} className="vs-analysis-card">
                          <span className="vs-analysis-label">{item.categoria}</span>
                          <span className="vs-analysis-value">{item.ganador}</span>
                          <span className="vs-analysis-detail">{item.detalle}</span>
                        </div>
                      )) : (
                        // Fallback para la estructura anterior del backend
                        <>
                          {vsResult.analisis?.mas_corta && <div className="vs-analysis-card"><span className="vs-analysis-label">Más corta</span><span className="vs-analysis-value">{vsResult.analisis.mas_corta.nombre}</span><span className="vs-analysis-detail">{vsResult.analisis.mas_corta.duracion_meses} meses</span></div>}
                          {vsResult.analisis?.mas_economica && <div className="vs-analysis-card"><span className="vs-analysis-label">Más económica</span><span className="vs-analysis-value">{vsResult.analisis.mas_economica.nombre}</span><span className="vs-analysis-detail">${vsResult.analisis.mas_economica.costo_promedio}/sem</span></div>}
                          {vsResult.analisis?.mas_opciones && <div className="vs-analysis-card"><span className="vs-analysis-label">Más opciones</span><span className="vs-analysis-value">{vsResult.analisis.mas_opciones.nombre}</span><span className="vs-analysis-detail">{vsResult.analisis.mas_opciones.universidades} universidades</span></div>}
                          {vsResult.analisis?.opciones_gratuitas?.length > 0 && <div className="vs-analysis-card"><span className="vs-analysis-label">Gratuitas</span><span className="vs-analysis-value">{vsResult.analisis.opciones_gratuitas.join(', ')}</span><span className="vs-analysis-detail">Sin costo</span></div>}
                        </>
                      )}
                    </div>
                  </div>

                  <button className="btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => { setVsResult(null); setSelected([]); setModoVersus(false); setTab('carreras'); }}>
                    <RotateCcw size={14} /> Nueva comparación
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalCarrera && <CarreraModal carrera={modalCarrera} onClose={() => setModalCarrera(null)} />}
          {modalUniversidad && <UniversidadModal uni={modalUniversidad} carreras={carreras} onClose={() => setModalUniversidad(null)} />}
        </AnimatePresence>
      </section>
    </AnimatedPage>
  );
}
