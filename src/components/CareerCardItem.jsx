import { useState, useEffect } from 'react'

export default function CareerCardItem({ career, isExpanded, onToggle }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(career.name)}&per_page=1`, {
      headers: { Authorization: 'BdEiOw82PXWNgprypsv9LNMwuC99vpL23x7zMsfhK6BcIpBOaakXkzZn' }
    })
      .then(r => r.json())
      .then(data => {
        if (data.photos && data.photos.length > 0) {
          setImageUrl(data.photos[0].src.landscape)
        } else {
          setImgError(true)
        }
      })
      .catch(() => setImgError(true))
  }, [career.name])

  const c = career;

  return (
    <div
      className={`career-card${isExpanded ? ' expanded' : ''}`}
      id={`career-${c.id}`}
      onClick={onToggle}
      style={{ overflow: 'hidden' }} // Asegura que el border-radius de la tarjeta corte la imagen correctamente
    >
      {c.glow && (
        <div className="career-card-glow" style={{ background: c.glow }} />
      )}

      {imageUrl && !imgError && (
        <img
          src={imageUrl}
          alt={career.name}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px 12px 0 0', display: 'block' }}
        />
      )}

      <div className="career-card-top">
        <div className="career-card-icon">{c.icon}</div>
        {c.tagLabel && (
          <span className={`career-demand-tag tag-${c.tag || c.demand}`}>
            {c.tagLabel || c.demandLabel}
          </span>
        )}
      </div>
      <h3>{c.name}</h3>
      {c.field && <span className="career-field">{c.field}</span>}
      <p className="desc">{c.desc}</p>

      {/* Expanded details */}
      {isExpanded && (
        <div className="career-expanded">
          {c.whatYouDo && (
            <div className="detail-item">
              <span className="detail-badge badge-do">Harías</span>
              <span className="detail-text">{c.whatYouDo}</span>
            </div>
          )}
          {c.pros && (
            <div className="career-pros-cons">
              <div className="pros-list">
                <h4>✅ Lo bueno</h4>
                <ul>
                  {c.pros.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div className="cons-list">
                <h4>⚠️ Los retos</h4>
                <ul>
                  {c.cons.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>
          )}
          <div className="career-meta">
            {c.avgSalary && (
              <div className="meta-item">
                <span className="meta-label">💰 Salario</span>
                <span className="meta-value">{c.avgSalary}</span>
              </div>
            )}
            {c.salary && (
              <div className="meta-item">
                <span className="meta-label">💰 Salario</span>
                <span className="meta-value">{c.salary}</span>
              </div>
            )}
            {c.duration && (
              <div className="meta-item">
                <span className="meta-label">📅 Duración</span>
                <span className="meta-value">{c.duration}</span>
              </div>
            )}
          </div>
          {c.future && (
            <div className="career-future">
              <span className="future-label">🔮 Futuro de esta carrera</span>
              <p>{c.future}</p>
            </div>
          )}
        </div>
      )}

      <div className="career-card-footer">
        <span className="expand-hint">
          {isExpanded ? 'Ver menos ↑' : 'Ver más detalles ↓'}
        </span>
      </div>
    </div>
  )
}
