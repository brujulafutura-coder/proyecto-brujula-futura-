import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import TestPage from './pages/TestPage'
import ExplorerPage from './pages/ExplorerPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import './App.css'
import './components/components.css'

export default function App() {
  const location = useLocation()

  return (
    <div className="bf-app">
      <Navbar />
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
      <Footer />
    </div>
  )
}
