/**
 * Brújula Futura — Página del Test Vocacional
 * Quiz interactivo + resultados con Radar Chart (Recharts) y tarjetas Bento.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import {
  Target, Search, RotateCcw, Loader2, ArrowRight, ArrowLeft,
  ChevronLeft, ChevronRight, Clock, Briefcase, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import AnimatedPage from '../components/AnimatedPage';
import { SkeletonList } from '../components/SkeletonLoader';
import { getPreguntas, procesarTest } from '../services/api';

const AREA_COLORS = {
  R: '#ef4444', I: '#3b82f6', A: '#a855f7',
  S: '#10b981', E: '#f59e0b', C: '#64748b',
};

export default function TestPage() {
  const navigate = useNavigate();
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [resultado, setResultado] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    getPreguntas()
      .then(data => { setPreguntas(data); setLoading(false); })
      .catch(() => { setLoading(false); toast.error('No se pudieron cargar las preguntas. Intenta recargar la página.'); });
  }, []);

  const handleAnswer = (idPregunta, idOpcion) => {
    setAnswers(prev => ({ ...prev, [idPregunta]: idOpcion }));
    setTimeout(() => {
      if (currentStep < preguntas.length - 1) setCurrentStep(prev => prev + 1);
    }, 400);
  };

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const respuestas = Object.entries(answers).map(([id_pregunta, id_opcion]) => ({
        id_pregunta: parseInt(id_pregunta),
        id_opcion: parseInt(id_opcion),
      }));
      const res = await procesarTest(respuestas);
      setResultado(res);
      toast.success('¡Resultados listos! Descubre tu perfil vocacional.');
    } catch (e) {
      toast.error('Error al procesar el test: ' + e.message);
    }
    setProcessing(false);
  };

  const progress = preguntas.length > 0 ? (Object.keys(answers).length / preguntas.length) * 100 : 0;
  const allAnswered = preguntas.length > 0 && Object.keys(answers).length === preguntas.length;
  const pregunta = preguntas[currentStep];

  /* ── Vista de Resultados ───────────────────────── */
  if (resultado) {
    const radarData = (resultado.perfil_riasec || []).map(area => ({
      area: area.nombre_area || 'Área',
      valor: area.porcentaje || 0,
      fullMark: 100,
    }));

    return (
      <AnimatedPage>
        <section className="test-results-page">
          <div className="results-container">
            {/* Encabezado */}
            <motion.div
              className="results-header"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
            >
              <div className="results-icon-box">
                <Target size={32} />
              </div>
              <h1>Tu perfil: <span className="accent">{resultado.nombre_dominante || 'Vocacional'}</span></h1>
              <p>Tu área dominante RIASEC es <strong>{resultado.nombre_dominante || 'Desconocida'}</strong> ({resultado.codigo_dominante || 'N/A'})</p>
            </motion.div>

            {/* Bento Grid de resultados: Radar + Barras */}
            <div className="results-bento">
              {/* Radar Chart */}
              <motion.div
                className="results-radar-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h3>Perfil Vocacional</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="rgba(124, 58, 237, 0.15)" />
                    <PolarAngleAxis
                      dataKey="area"
                      tick={{ fill: '#9896b8', fontSize: 12, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Perfil"
                      dataKey="valor"
                      stroke="#7c3aed"
                      fill="url(#radarGradient)"
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(20, 22, 38, 0.95)',
                        border: '1px solid rgba(124, 58, 237, 0.3)',
                        borderRadius: '12px',
                        color: '#eeeeff',
                        fontSize: '13px',
                      }}
                      formatter={(value) => [`${value}%`, 'Afinidad']}
                    />
                    <defs>
                      <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Barras detalladas */}
              <motion.div
                className="results-bars-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
              >
                <h3>Detalle por Área</h3>
                <div className="results-bars">
                  {(resultado.perfil_riasec || []).map((area, i) => (
                    <motion.div
                      key={area.codigo_area || i}
                      className="result-bar-row"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                    >
                      <span className="bar-label">{area.nombre_area}</span>
                      <div className="bar-track">
                        <motion.div
                          className="bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${area.porcentaje || 0}%` }}
                          transition={{ delay: 0.5 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          style={{ background: `linear-gradient(90deg, ${AREA_COLORS[area.codigo_area] || '#7c3aed'}, ${(AREA_COLORS[area.codigo_area] || '#7c3aed')}88)` }}
                        />
                      </div>
                      <span className="bar-value">{area.porcentaje || 0}%</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Carreras Recomendadas */}
            <motion.div
              className="results-careers-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h2>
                <Target size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Carreras recomendadas para ti
              </h2>

              <div className="results-careers-grid">
                {(resultado.carreras_recomendadas || []).map((c, i) => (
                  <motion.div
                    key={c.id_carrera || i}
                    className="result-career-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.08 }}
                    whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(124,58,237,0.2)' }}
                  >
                    <span className="career-area-tag">{c.area_nombre || 'General'}</span>
                    <h3>{c.nombre_carrera || 'Carrera recomendada'}</h3>
                    <div className="career-meta">
                      <span><Clock size={13} /> {c.duracion_meses || 0} meses</span>
                      {c.salida_laboral && <span><Briefcase size={13} /> {c.salida_laboral}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Acciones */}
            <div className="results-actions">
              <motion.button
                className="btn-primary"
                onClick={() => navigate('/explorar')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search size={18} /> Explorar carreras
              </motion.button>
              <motion.button
                className="btn-secondary"
                onClick={() => { setResultado(null); setAnswers({}); setCurrentStep(0); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw size={16} /> Repetir test
              </motion.button>
            </div>
          </div>
        </section>
      </AnimatedPage>
    );
  }

  /* ── Vista del Quiz ────────────────────────────── */
  return (
    <AnimatedPage>
      <section className="test-page">
        <div className="section-inner" style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 24px 60px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '8px' }}>
              Test Vocacional <span className="accent">RIASEC</span>
            </h1>
            <p style={{ textAlign: 'center', marginBottom: '32px', fontSize: '1rem' }}>
              Responde con honestidad. No hay respuestas correctas ni incorrectas.
            </p>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            style={{ height: '6px', background: 'var(--bg-card)', borderRadius: 'var(--r-full)', marginBottom: '40px', overflow: 'hidden' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              style={{ height: '100%', background: 'var(--grad-brand)', borderRadius: 'var(--r-full)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </motion.div>

          {loading ? (
            <SkeletonList count={1} />
          ) : pregunta ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={pregunta.id_pregunta}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="bf-card" style={{ padding: '40px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Pregunta {currentStep + 1} de {preguntas.length}
                  </p>
                  <h2 style={{ fontSize: '1.35rem', marginBottom: '32px', lineHeight: 1.4 }}>
                    {pregunta.texto_pregunta}
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
                    {pregunta.opciones.map((op) => {
                      const selected = answers[pregunta.id_pregunta] === op.id_opcion;
                      return (
                        <motion.button
                          key={op.id_opcion}
                          onClick={() => handleAnswer(pregunta.id_pregunta, op.id_opcion)}
                          className={`test-option ${selected ? 'selected' : ''}`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          animate={selected ? { boxShadow: '0 0 20px rgba(124,58,237,0.4)' } : {}}
                        >
                          {op.texto_opcion}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                  <motion.button
                    className="btn-secondary"
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0}
                    style={{ opacity: currentStep === 0 ? 0.4 : 1 }}
                    whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
                  >
                    <ChevronLeft size={16} /> Anterior
                  </motion.button>

                  {allAnswered ? (
                    <motion.button
                      className="btn-primary"
                      onClick={handleSubmit}
                      disabled={processing}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}
                      whileTap={{ scale: 0.95 }}
                      animate={{ boxShadow: ['0 0 10px rgba(124,58,237,0.3)', '0 0 25px rgba(124,58,237,0.5)', '0 0 10px rgba(124,58,237,0.3)'] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      {processing ? (
                        <><Loader2 size={18} className="spin-icon" /> Procesando...</>
                      ) : (
                        <><ArrowRight size={18} /> Ver resultados</>
                      )}
                    </motion.button>
                  ) : (
                    <motion.button
                      className="btn-secondary"
                      onClick={() => setCurrentStep(prev => Math.min(preguntas.length - 1, prev + 1))}
                      disabled={currentStep >= preguntas.length - 1}
                      style={{ opacity: currentStep >= preguntas.length - 1 ? 0.4 : 1 }}
                      whileHover={currentStep < preguntas.length - 1 ? { scale: 1.05 } : {}}
                    >
                      Siguiente <ChevronRight size={16} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <p style={{ textAlign: 'center' }}>No hay preguntas disponibles.</p>
          )}
        </div>
      </section>
    </AnimatedPage>
  );
}
