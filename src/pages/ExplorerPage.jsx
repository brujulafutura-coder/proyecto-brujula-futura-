import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { SkeletonList } from '../components/SkeletonLoader';
import { getCarreras, getUniversidades, compararCarreras } from '../services/api';

const AREA_ICONS = { Realista: '🔧', Investigador: '🔬', Artístico: '🎨', Social: '🤝', Emprendedor: '💼', Convencional: '📊' };

export default function ExplorerPage() {
  const [carreras, setCarreras] = useState([]);
  const [universidades, setUniversidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroArea, setFiltroArea] = useState('');
  const [tab, setTab] = useState('carreras'); // 'carreras' | 'universidades' | 'versus'
  const [selected, setSelected] = useState([]);
  const [vsResult, setVsResult] = useState(null);
  const [vsLoading, setVsLoading] = useState(false);

  useEffect(() => {
    Promise.all([getCarreras(), getUniversidades()])
      .then(([c, u]) => { setCarreras(c); setUniversidades(u); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggleSelect = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
    setVsResult(null);
  };

  const handleVersus = async () => {
    if (selected.length < 2) return;
    setVsLoading(true);
    try {
      const res = await compararCarreras(selected);
      setVsResult(res);
      setTab('versus');
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setVsLoading(false);
  };

  const filteredCarreras = filtroArea
    ? carreras.filter(c => c.area_codigo === filtroArea)
    : carreras;

  const areas = [...new Set(carreras.map(c => c.area_codigo))].filter(Boolean);

  return (
    <AnimatedPage>
      <section style={{ padding: '100px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.h1
          style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '8px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Explora tu <span className="accent">futuro</span>
        </motion.h1>
        <motion.p
          style={{ textAlign: 'center', marginBottom: '32px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Navega carreras, universidades y compara opciones lado a lado.
        </motion.p>

        {/* Tabs */}
        <motion.div
          style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { id: 'carreras', label: '🎓 Carreras' },
            { id: 'universidades', label: '🏛️ Universidades' },
            { id: 'versus', label: '⚔️ Versus' },
          ].map(t => (
            <motion.button
              key={t.id}
              className={tab === t.id ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setTab(t.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ fontSize: '0.95rem' }}
            >
              {t.label}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── CARRERAS TAB ── */}
          {tab === 'carreras' && (
            <motion.div key="carreras" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              {/* Area filters */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
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
                  className="bf-card"
                  style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
                >
                  <span style={{ fontSize: '0.9rem' }}>
                    ⚔️ <strong>{selected.length}</strong>/3 seleccionadas para comparar
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button className="btn-secondary" onClick={() => { setSelected([]); setVsResult(null); }} whileHover={{ scale: 1.05 }} style={{ fontSize: '0.85rem' }}>
                      Limpiar
                    </motion.button>
                    <motion.button
                      className="btn-primary"
                      onClick={handleVersus}
                      disabled={selected.length < 2 || vsLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ fontSize: '0.85rem' }}
                    >
                      {vsLoading ? '⏳...' : '⚔️ Comparar'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {loading ? <SkeletonList count={6} /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {filteredCarreras.map((c, i) => {
                    const isSelected = selected.includes(c.id_carrera);
                    return (
                      <motion.div
                        key={c.id_carrera}
                        className="bf-card"
                        style={{
                          padding: '24px', cursor: 'pointer', position: 'relative',
                          border: isSelected ? '2px solid var(--violet)' : '1px solid var(--border-subtle)',
                        }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(124,58,237,0.2)' }}
                        onClick={() => toggleSelect(c.id_carrera)}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              position: 'absolute', top: '12px', right: '12px',
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: 'var(--grad-brand)', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                            }}
                          >
                            ✓
                          </motion.div>
                        )}
                        <span className="bf-badge" style={{ marginBottom: '12px', display: 'inline-block' }}>
                          {AREA_ICONS[c.area_nombre] || '📘'} {c.area_nombre}
                        </span>
                        <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{c.nombre_carrera}</h3>
                        <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}>⏱ {c.duracion_meses} meses · {c.tipo_opcion}</p>
                        <p style={{ fontSize: '0.85rem' }}>{c.salida_laboral?.substring(0, 100)}...</p>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {universidades.map((u, i) => (
                    <motion.div
                      key={u.id_universidad}
                      className="bf-card"
                      style={{ padding: '28px' }}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(124,58,237,0.2)' }}
                    >
                      <span className="bf-badge" style={{ marginBottom: '12px', display: 'inline-block' }}>
                        {u.tipo_universidad === 'PUB' ? '🏛️ Pública' : u.tipo_universidad === 'PRI' ? '🏫 Privada' : u.tipo_universidad === 'TEC' ? '⚙️ Tecnológico' : '📚 Instituto'}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{u.nombre_universidad}</h3>
                      <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>📍 {u.ciudad}, {u.provincia}</p>
                      {u.sitio_web && (
                        <a href={u.sitio_web} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', display: 'inline-block', marginTop: '8px' }}>
                          🌐 Visitar sitio web →
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── VERSUS TAB ── */}
          {tab === 'versus' && (
            <motion.div key="versus" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              {!vsResult ? (
                <div className="bf-card" style={{ padding: '48px', textAlign: 'center' }}>
                  <h2 style={{ marginBottom: '12px' }}>⚔️ Comparador de Carreras</h2>
                  <p style={{ marginBottom: '24px' }}>Selecciona 2 o 3 carreras en la pestaña "Carreras" y presiona "Comparar".</p>
                  <motion.button className="btn-primary" onClick={() => setTab('carreras')} whileHover={{ scale: 1.05 }}>
                    Ir a seleccionar
                  </motion.button>
                </div>
              ) : (
                <div>
                  {/* Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${vsResult.carreras.length}, 1fr)`, gap: '20px', marginBottom: '32px' }}>
                    {vsResult.carreras.map((c, i) => (
                      <motion.div
                        key={c.id_carrera}
                        className="bf-card"
                        style={{ padding: '28px' }}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                        whileHover={{ y: -4 }}
                      >
                        <span className="bf-badge" style={{ marginBottom: '12px', display: 'inline-block' }}>
                          {AREA_ICONS[c.area_nombre] || '📘'} {c.area_nombre}
                        </span>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>{c.nombre_carrera}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Duración</span>
                            <strong>{c.duracion_meses} meses</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Costo promedio</span>
                            <strong>{c.costo_promedio ? `$${c.costo_promedio}` : 'Gratuita'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Universidades</span>
                            <strong>{c.universidades_disponibles}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Modalidades</span>
                            <strong>{c.modalidades.join(', ') || '—'}</strong>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', marginTop: '16px', lineHeight: 1.5 }}>{c.salida_laboral}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Analysis */}
                  <motion.div
                    className="bf-card"
                    style={{ padding: '32px' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>📊 Análisis Comparativo</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      {vsResult.analisis.mas_corta && (
                        <motion.div className="vs-insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                          <span style={{ fontSize: '1.5rem' }}>⏱</span>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Más corta</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{vsResult.analisis.mas_corta.nombre} — {vsResult.analisis.mas_corta.duracion_meses} meses</p>
                          </div>
                        </motion.div>
                      )}
                      {vsResult.analisis.mas_economica && (
                        <motion.div className="vs-insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                          <span style={{ fontSize: '1.5rem' }}>💰</span>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Más económica</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{vsResult.analisis.mas_economica.nombre} — ${vsResult.analisis.mas_economica.costo_promedio}/sem</p>
                          </div>
                        </motion.div>
                      )}
                      {vsResult.analisis.mas_opciones && (
                        <motion.div className="vs-insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                          <span style={{ fontSize: '1.5rem' }}>🏛️</span>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Más opciones</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{vsResult.analisis.mas_opciones.nombre} — {vsResult.analisis.mas_opciones.universidades} universidades</p>
                          </div>
                        </motion.div>
                      )}
                      {vsResult.analisis.opciones_gratuitas && vsResult.analisis.opciones_gratuitas.length > 0 && (
                        <motion.div className="vs-insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                          <span style={{ fontSize: '1.5rem' }}>🆓</span>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Opciones gratuitas</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{vsResult.analisis.opciones_gratuitas.join(', ')}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <motion.button className="btn-secondary" onClick={() => { setSelected([]); setVsResult(null); setTab('carreras'); }} whileHover={{ scale: 1.05 }}>
                      🔄 Nueva comparación
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
