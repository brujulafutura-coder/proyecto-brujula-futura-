import { useState } from 'react'
import { CAREERS, EMERGING } from '../data/db'
import CareerCardItem from './CareerCardItem'

export default function CareerExplorer() {
  const [expandedId, setExpandedId] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'traditional', 'emerging'

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const filteredCareers = filter === 'traditional' ? CAREERS
    : filter === 'emerging' ? EMERGING
    : [...CAREERS, ...EMERGING]

  return (
    <section className="section" id="carreras">
      <div className="section-inner">
        <div className="section-header center">
          <div className="section-label">Explorar</div>
          <h2 className="section-title">Conoce las carreras</h2>
          <p className="section-desc">
            Información real sobre carreras tradicionales y emergentes.
            Lo bueno, lo malo, salarios y demanda actual.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="career-filters" id="career-filters">
          <button
            className={`filter-tab${filter === 'all' ? ' active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={`filter-tab${filter === 'traditional' ? ' active' : ''}`}
            onClick={() => setFilter('traditional')}
          >
            Tradicionales
          </button>
          <button
            className={`filter-tab${filter === 'emerging' ? ' active' : ''}`}
            onClick={() => setFilter('emerging')}
          >
            🚀 Emergentes
          </button>
        </div>

        {/* Career Grid */}
        <div className="careers-grid">
          {filteredCareers.map(c => (
            <CareerCardItem 
              key={c.id} 
              career={c} 
              isExpanded={expandedId === c.id}
              onToggle={() => toggleExpand(c.id)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
