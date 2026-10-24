import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HelloIntro, { shouldPlayIntro } from './components/HelloIntro'
import { ProtectedRoute } from './components/ui'
import Landing from './pages/Landing'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import { Login, Signup } from './pages/Auth'
import MyCity, { Profile } from './pages/MyCity'
import AddProject from './pages/AddProject'
import ProjectDetail from './pages/ProjectDetail'
import Inspection from './pages/Inspection'
import { Leaderboard, BuildersSquare } from './pages/Community'
import NotFound from './pages/NotFound'
import { lenis } from './lib/smoothScroll'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>

export default function App() {
  const [intro, setIntro] = useState(shouldPlayIntro)

  return (
    <div className="flex min-h-screen flex-col">
      {intro && <HelloIntro onDone={() => setIntro(false)} />}
      <ScrollToTop />
      <Navbar />
      <div className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/city" element={guard(<MyCity />)} />
          <Route path="/project/new" element={guard(<AddProject />)} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/project/:id/inspect" element={guard(<Inspection />)} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/square" element={<BuildersSquare />} />
          <Route path="/builder/:username" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
