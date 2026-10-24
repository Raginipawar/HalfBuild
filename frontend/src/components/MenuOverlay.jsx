import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, RotateCcw, X } from 'lucide-react'
import { useStore, useCurrentUser } from '../store/useStore'
import { lenis } from '../lib/smoothScroll'

export default function MenuOverlay({ open, onClose }) {
  const user = useCurrentUser()
  const logout = useStore((s) => s.logout)
  const resetDemo = useStore((s) => s.resetDemo)
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const panelRef = useRef(null)

  const links = [
    { to: '/city', label: 'My City', hint: 'Your projects, drawn as buildings' },
    { to: '/project/new', label: 'Add a project', hint: 'Put a paused project on the map' },
    { to: '/leaderboard', label: 'Leaderboard', hint: 'Ranked by projects revived, not started' },
    { to: '/square', label: "Builders' Square", hint: 'Find people to finish with' },
    { to: user ? `/builder/${user.username}` : '/login', label: 'Profile', hint: 'Your public city and activity' },
  ]

  // Escape to close, Tab stays inside the menu, page scroll paused
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    const first = panelRef.current?.querySelector('a, button')
    first?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab') return
      const items = [...panelRef.current.querySelectorAll('a, button')]
      const i = items.indexOf(document.activeElement)
      if (e.shiftKey && i <= 0) { e.preventDefault(); items.at(-1).focus() }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      lenis?.start()
    }
  }, [open, onClose])

  const item = (i) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.08 + i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 overflow-y-auto bg-bg"
          initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div aria-hidden className="pastel-wash pointer-events-none absolute inset-x-0 bottom-0 h-[45vh] opacity-60" />

          <div className="relative mx-auto flex min-h-full max-w-6xl flex-col px-4 sm:px-6">
            <div className="flex h-16 items-center justify-between border-b border-line">
              <span className="eyebrow">Menu</span>
              <button type="button" className="btn btn-ghost h-9" onClick={onClose}>
                <X size={16} /> Close
              </button>
            </div>

            <nav className="flex-1 py-6 sm:py-10" aria-label="Main">
              <ul>
                {links.map((l, i) => (
                  <motion.li key={l.label} {...item(i)} className="border-b border-line">
                    <Link
                      to={l.to}
                      onClick={onClose}
                      className="group flex items-center gap-4 py-4 sm:gap-8 sm:py-5"
                    >
                      <span className="w-8 font-mono text-xs text-muted">0{i + 1}</span>
                      <span className="heading-2 flex-1 transition-transform duration-300 group-hover:translate-x-1.5">
                        {l.label}
                      </span>
                      <span className="hidden text-right text-sm text-muted md:block">{l.hint}</span>
                      <ArrowUpRight size={20} className="text-muted transition-colors group-hover:text-fg" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.div {...item(links.length)} className="flex flex-wrap items-center gap-3 border-t border-line py-6">
              {user ? (
                <>
                  <span className="mr-auto text-sm text-muted">
                    Signed in as <span className="text-fg">{user.name}</span>
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => { logout(); onClose(); navigate('/') }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <span className="mr-auto text-sm text-muted">Try the demo: demo@halfbuilt.app / demo1234</span>
                  <Link to="/login" onClick={onClose} className="btn btn-ghost">Log in</Link>
                  <Link to="/signup" onClick={onClose} className="btn btn-primary">Sign up</Link>
                </>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  if (window.confirm('Reset all demo data? Your own changes will be cleared.')) {
                    resetDemo()
                    onClose()
                    navigate('/')
                  }
                }}
              >
                <RotateCcw size={14} /> Reset demo data
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
