import { useState } from 'react'
import { CAREER_VERSUS } from '../data/db'

export default function Versus() {
  const [activeVs, setActiveVs] = useState(0)

  // Extrae los datos del versus activo para calcular las métricas de comparación
  const vs = CAREER_VERSUS[activeVs]
  const scoreA = vs.criteria.filter(c => c.winner === 'a').length
  const scoreB = vs.criteria.filter(c => c.winner === 'b').length

  return (
    <section className="section versus-bg" id="versus">
      <div className="section-inner">
        <div className="section-header center">
          <div className="section-label">Comparar</div>
          <h2 className="section-title">Versus de Carreras ⚔️</h2>
          <p className="section-desc">
            Compara dos carreras lado a lado para tomar una decisión más informada.
          </p>
        </div>

        {/* VS Selector */}
        <div className="vs-selector" id="vs-selector">
          {CAREER_VERSUS.map((v, i) => (
            <button
              key={v.id}
              className={`vs-tab${activeVs === i ? ' active' : ''}`}
              onClick={() => setActiveVs(i)}
              id={`vs-tab-${i}`}
            >
              {v.careerA} <span className="vs-x">vs</span> {v.careerB}
            </button>
          ))}
        </div>

        {/* VS Card */}
        <div className="vs-card" id="vs-comparison">
          {/* Header */}
          <div className="vs-header">
            <div className="vs-team vs-team-a">
              <h3>{vs.careerA}</h3>
              <span className="vs-score">{scoreA}</span>
            </div>
            <div className="vs-badge">VS</div>
            <div className="vs-team vs-team-b">
              <h3>{vs.careerB}</h3>
              <span className="vs-score">{scoreB}</span>
            </div>
          </div>

          {/* Criteria rows */}
          <div className="vs-criteria">
            {vs.criteria.map((c, i) => (
              <div key={i} className="vs-row" id={`vs-row-${i}`}>
                <div className={`vs-cell vs-cell-a${c.winner === 'a' ? ' winner' : ''}`}>
                  {c.a}
                  {c.winner === 'a' && <span className="win-badge">✓</span>}
                </div>
                <div className="vs-cell vs-cell-label">{c.label}</div>
                <div className={`vs-cell vs-cell-b${c.winner === 'b' ? ' winner' : ''}`}>
                  {c.b}
                  {c.winner === 'b' && <span className="win-badge">✓</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div className="vs-verdict">
            {scoreA > scoreB ? (
              <p>📊 <strong>{vs.careerA}</strong> tiene más puntos a favor en esta comparación, pero ambas son excelentes opciones.</p>
            ) : scoreB > scoreA ? (
              <p>📊 <strong>{vs.careerB}</strong> destaca más en esta comparación, pero la elección depende de tus intereses personales.</p>
            ) : (
              <p>📊 ¡Empate! Ambas carreras son muy buenas opciones. La decisión depende de lo que más te apasiona.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
