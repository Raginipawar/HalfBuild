import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, RotateCcw, X } from 'lucide-react'
import { useStore, useCurrentUser } from '../store/useStore'
import { lenis } from '../lib/smoothScroll'
import { PixelSquares } from './Decor'

export default function MenuOverlay({ open, onClose }) {
  const user = useCurrentUser()
  const logout = useStore((s) => s.logout)
  const resetDemo = useStore((s) => s.resetDemo)
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const panelRef = useRef(null)

  const links = [
    { to: '/', label: 'Home', hint: 'The story and a live demo city' },
    { to: '/about', label: 'About', hint: 'Why a city, and what we believe' },
    { to: '/how-it-works', label: 'How it works', hint: 'From paused project to first step' },
    { to: '/leaderboard', label: 'Leaderboard', hint: 'Ranked by projects revived' },
    { to: '/square', label: "Builders' Square", hint: 'Find people to finish with' },
    { to: '/city', label: 'My City', hint: 'Your projects as buildings' },
  ]

  // Escape to close, Tab stays inside the menu, page scroll paused
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    panelRef.current?.querySelector('a, button')?.focus()

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
          initial: { opacity: 0, y: 40 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.1 + i * 0.05, type: 'spring', stiffness: 260, damping: 22 },
        }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 overflow-y-auto bg-ink text-paper"
          initial={reduce ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - 60px) 32px)' }}
          animate={reduce ? { opacity: 1 } : { clipPath: 'circle(150% at calc(100% - 60px) 32px)' }}
          exit={reduce ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - 60px) 32px)' }}
          transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
        >
          <div className="mx-auto flex min-h-full max-w-7xl flex-col px-4 sm:px-8">
            <div className="flex h-16 items-center justify-between border-b border-white/15">
              <span className="font-display text-2xl tracking-[0.12em]">HALFBUILT</span>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-sm border border-paper text-paper hover:bg-paper hover:text-ink"
              >
                Close <X size={16} />
              </button>
            </div>

            <nav className="flex-1 py-6 sm:py-10" aria-label="Main">
              <ul>
                {links.map((l, i) => (
                  <motion.li key={l.label} {...item(i)} className="border-b border-white/15">
                    <Link to={l.to} onClick={onClose} className="group flex items-baseline gap-4 py-3 sm:gap-8 sm:py-4">
                      <span className="w-8 text-xs text-white/50">0{i + 1}</span>
                      <span className="flex-1 font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-none transition-[transform,color] duration-300 group-hover:translate-x-3 group-hover:text-light">
                        {l.label}
                      </span>
                      <span className="hidden text-sm text-white/55 md:block">{l.hint}</span>
                      <ArrowUpRight size={22} className="self-center text-white/40 transition-colors group-hover:text-light" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.div {...item(links.length)} className="flex flex-wrap items-center gap-3 border-t border-white/15 py-6">
              {user ? (
                <>
                  <span className="mr-auto text-sm text-white/60">
                    Signed in as <span className="text-paper">{user.name}</span>
                  </span>
                  <Link to={`/builder/${user.username}`} onClick={onClose} className="btn btn-sm border border-white/40 hover:border-paper">
                    My profile
                  </Link>
                  <button
                    type="button"
                    className="btn btn-sm border border-white/40 hover:border-paper"
                    onClick={() => { logout(); onClose(); navigate('/') }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <span className="mr-auto text-sm text-white/60">Demo: demo@halfbuilt.app / demo1234</span>
                  <Link to="/login" onClick={onClose} className="btn btn-sm border border-white/40 hover:border-paper">Log in</Link>
                  <Link to="/signup" onClick={onClose} className="btn btn-sm bg-paper text-ink hover:bg-light">Sign up</Link>
                </>
              )}
              <button
                type="button"
                className="btn btn-sm text-white/60 hover:text-paper"
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
            <PixelSquares className="absolute bottom-6 right-6 hidden opacity-80 sm:block" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
