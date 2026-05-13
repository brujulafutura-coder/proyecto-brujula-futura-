import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import TestPage from './pages/TestPage'
import ExplorerPage from './pages/ExplorerPage'
import './App.css'
import './components/components.css'

export default function App() {
  const location = useLocation()

  return (
    <div className="bf-app">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/explorar" element={<ExplorerPage />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
