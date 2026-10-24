import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ComingSoon from './components/ComingSoon'
import Landing from './pages/Landing'
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

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<ComingSoon phase={5} title="Log in" text="Pick up where you left off in your city." />} />
        <Route path="/signup" element={<ComingSoon phase={5} title="Sign up" text="Claim a plot of land for your paused projects." />} />
        <Route path="/city" element={<ComingSoon phase={2} title="My City" text="Your projects as a skyline, with a list view beside it." />} />
        <Route path="/project/new" element={<ComingSoon phase={3} title="Add a project" text="Fill in the form and watch the building rise as you type." />} />
        <Route path="/project/:id" element={<ComingSoon phase={3} title="Project" text="The building, its story and its construction log." />} />
        <Route path="/project/:id/inspect" element={<ComingSoon phase={4} title="Site Inspection" text="Six questions, a Revival Score and one small first step." />} />
        <Route path="/leaderboard" element={<ComingSoon phase={6} title="Revival Leaderboard" text="Ranked by projects revived, not started." />} />
        <Route path="/square" element={<ComingSoon phase={6} title="Builders' Square" text="Find co-builders for projects that stalled." />} />
        <Route path="/builder/:username" element={<ComingSoon phase={6} title="Builder profile" text="A public city and activity grid." />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
