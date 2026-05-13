import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
      .catch(() => setLoading(false));
  }, []);

  const handleAnswer = (idPregunta, idOpcion) => {
    setAnswers(prev => ({ ...prev, [idPregunta]: idOpcion }));
    // Auto-advance after short delay
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
    } catch (e) {
      alert('Error al procesar: ' + e.message);
    }
    setProcessing(false);
  };

  const progress = preguntas.length > 0 ? (Object.keys(answers).length / preguntas.length) * 100 : 0;
  const allAnswered = preguntas.length > 0 && Object.keys(answers).length === preguntas.length;
  const pregunta = preguntas[currentStep];

  if (resultado) {
    return (
      <AnimatedPage>
        <section className="test-results-page">
          <div className="section-inner" style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 24px 60px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', duration: 0.6 }}>
              <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>
                Tu perfil: <span className="accent">{resultado.nombre_dominante}</span>
              </h1>
              <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.1rem' }}>
                Tu área dominante RIASEC es <strong>{resultado.nombre_dominante}</strong> ({resultado.codigo_dominante})
              </p>
            </motion.div>

            {/* RIASEC Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
              {resultado.perfil_riasec.map((area, i) => (
                <motion.div
                  key={area.codigo_area}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <span style={{ width: '140px', fontWeight: 600, fontSize: '0.95rem' }}>
                    {area.nombre_area}
                  </span>
                  <div style={{ flex: 1, height: '28px', background: 'var(--bg-card)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${area.porcentaje}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        height: '100%',
                        borderRadius: 'var(--r-full)',
                        background: `linear-gradient(90deg, ${AREA_COLORS[area.codigo_area]}, ${AREA_COLORS[area.codigo_area]}aa)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '12px',
                        fontSize: '0.8rem', fontWeight: 700, color: '#fff',
                        minWidth: area.porcentaje > 5 ? 'fit-content' : '0',
                      }}
                    >
                      {area.porcentaje > 10 && `${area.porcentaje}%`}
                    </motion.div>
                  </div>
                  <span style={{ width: '50px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {area.porcentaje}%
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Career Recommendations */}
            <motion.h2
              style={{ fontSize: '1.5rem', marginBottom: '24px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              🎯 Carreras recomendadas para ti
            </motion.h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              {resultado.carreras_recomendadas.map((c, i) => (
                <motion.div
                  key={c.id_carrera}
                  className="bf-card"
                  style={{ padding: '24px' }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(124,58,237,0.2)' }}
                >
                  <span className="bf-badge" style={{ marginBottom: '12px', display: 'inline-block' }}>{c.area_nombre}</span>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{c.nombre_carrera}</h3>
                  <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>⏱ {c.duracion_meses} meses</p>
                  <p style={{ fontSize: '0.85rem' }}>{c.salida_laboral}</p>
                </motion.div>
              ))}
            </div>

            <div style={{ textAlign: 'center', display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <motion.button
                className="btn-primary"
                onClick={() => navigate('/explorar')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔍 Explorar carreras
              </motion.button>
              <motion.button
                className="btn-secondary"
                onClick={() => { setResultado(null); setAnswers({}); setCurrentStep(0); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Repetir test
              </motion.button>
            </div>
          </div>
        </section>
      </AnimatedPage>
    );
  }

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
                    ← Anterior
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
                      {processing ? '⏳ Procesando...' : '🚀 Ver resultados'}
                    </motion.button>
                  ) : (
                    <motion.button
                      className="btn-secondary"
                      onClick={() => setCurrentStep(prev => Math.min(preguntas.length - 1, prev + 1))}
                      disabled={currentStep >= preguntas.length - 1}
                      style={{ opacity: currentStep >= preguntas.length - 1 ? 0.4 : 1 }}
                      whileHover={currentStep < preguntas.length - 1 ? { scale: 1.05 } : {}}
                    >
                      Siguiente →
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
