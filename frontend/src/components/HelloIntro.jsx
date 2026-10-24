import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const WORDS = ['Hello', 'Namaste', 'Hola', 'Bonjour', 'Konnichiwa', 'Hallo']
const STEP = 380 // ms per word
const KEY = 'hb-intro-seen'

// Plays once per browser session, skipped for reduced motion.
export function shouldPlayIntro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try { return sessionStorage.getItem(KEY) !== '1' } catch { return true }
}

export default function HelloIntro({ onDone }) {
  const [i, setI] = useState(0)
  const [leaving, setLeaving] = useState(false)

  const finish = () => {
    try { sessionStorage.setItem(KEY, '1') } catch { /* ignore */ }
    setLeaving(true)
  }

  useEffect(() => {
    if (leaving) return
    const t = setTimeout(() => (i < WORDS.length - 1 ? setI(i + 1) : finish()), STEP + (i === WORDS.length - 1 ? 250 : 0))
    return () => clearTimeout(t)
  }, [i, leaving])

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink text-paper"
      initial={{ y: 0 }}
      animate={{ y: leaving ? '-100%' : 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => leaving && onDone()}
      aria-live="polite"
    >
      <div className="flex items-center gap-4">
        <span className="h-2.5 w-2.5 rounded-full bg-light" aria-hidden />
        <AnimatePresence mode="wait">
          <motion.span
            key={WORDS[i]}
            className="font-display text-[clamp(3rem,10vw,7rem)] leading-none"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.16 }}
          >
            {WORDS[i]}
          </motion.span>
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={finish}
        className="btn btn-sm absolute bottom-6 right-6 border border-white/40 text-paper hover:border-paper"
      >
        Skip
      </button>
    </motion.div>
  )
}
