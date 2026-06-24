import { useState, useEffect } from 'react'
import { INTERESTS } from '../data/db'

const CAREER_IMAGES_RESULTS = {
  'Ingeniería de Software': 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
  'Ingeniería en Software': 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
  'Ciencia de Datos': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
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
  'Ciberseguridad': 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg',
  'UX / Product Design': 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg',
  'Automatización & IA': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
}

export default function Results({ results, selectedInterests }) {
  // Evita el renderizado del componente cuando la lista de resultados está vacía o indefinida
  if (!results || results.length === 0) return null

  return (
    <section className="section results-section" id="resultados">
      <div className="section-inner">
        <div className="section-header center">
          <div className="section-label">Tus Resultados</div>
          <h2 className="section-title">Carreras que encajan contigo</h2>
          <p className="section-desc">
            Basado en tus intereses y respuestas del test, estas son las opciones con más compatibilidad.
          </p>
        </div>

        <div className="results-grid">
          {results.map((r, index) => (
            <div
              key={r.id}
              className={`result-card ${index === 0 ? 'result-top' : ''}`}
              id={`result-${r.id}`}
            >
              {CAREER_IMAGES_RESULTS[r.name] && (
                <img
                  src={CAREER_IMAGES_RESULTS[r.name]}
                  alt={r.name}
                  style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '12px 12px 0 0', display: 'block', marginBottom: '0.75rem' }}
                />
              )}
              {index === 0 && <div className="result-crown">👑</div>}
              <span className={`result-label label-${r.label}`}>{r.labelText}</span>
              <div className="result-icon">{r.icon}</div>
              <h3>{r.name}</h3>
              {r.field && <span className="result-field">{r.field}</span>}
              <p>{r.desc}</p>
              <div className="result-match">
                <div className="match-bar-wrap">
                  <div
                    className="match-bar"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
                <span className="match-pct">{r.pct}%</span>
              </div>
              {r.matchingTags && r.matchingTags.length > 0 && (
                <div className="result-tags">
                  {r.matchingTags.map(tag => {
                    const interest = INTERESTS.find(i => i.id === tag)
                    return interest ? (
                      <span key={tag} className="result-tag">
                        {interest.icon} {interest.label}
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
