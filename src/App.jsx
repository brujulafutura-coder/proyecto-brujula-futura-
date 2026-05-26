import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import './components/components.css'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const TestPage = lazy(() => import('./pages/TestPage'))
const ExplorerPage = lazy(() => import('./pages/ExplorerPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))

// Loading fallback component
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--violet-light)' }}>
    <Loader2 size={32} className="spin-icon" />
  </div>
)

export default function App() {
  const location = useLocation()

  return (
    <div className="bf-app">
      <Navbar />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />

            {/* Rutas protegidas — requieren autenticación */}
            <Route path="/test" element={
              <ProtectedRoute><TestPage /></ProtectedRoute>
            } />
            <Route path="/explorar" element={
              <ProtectedRoute><ExplorerPage /></ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
