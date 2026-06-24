import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function Footer() {
  const navigate = useNavigate()
  return (
    <footer className="ft2">
      <div className="ft2-inner">
        <div className="ft2-left">
          <button className="ft2-logo" onClick={() => navigate('/')}>
            <Compass size={18} />
            <span>Brújula Futura</span>
          </button>
          <p className="ft2-tagline">Orientación vocacional para estudiantes de Ecuador</p>
        </div>

        <nav className="ft2-nav">
          <button className="ft2-link" onClick={() => navigate('/')}>Inicio</button>
          <button className="ft2-link" onClick={() => navigate('/test')}>Test</button>
          <button className="ft2-link" onClick={() => navigate('/explorar')}>Explorar</button>
        </nav>
      </div>

      <div className="ft2-bottom">
        <span>© 2025 Brújula Futura</span>
      </div>
    </footer>
  )
}
