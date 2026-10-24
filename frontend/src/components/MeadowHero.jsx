import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { useCurrentUser } from '../store/useStore'

// Opening scene: a dawn sky and a looping meadow illustration of a builder at work
// with his cat asleep beside him. Art from The Boring Blog, used with permission.

const FRAMES = Array.from({ length: 24 }, (_, i) => `/loop/hero/frame-${String(i + 1).padStart(2, '0')}.webp`)
const FPS = 8

export default function MeadowHero() {
  const user = useCurrentUser()
  const reduce = useReducedMotion()
  const rise = (i) => (reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] } })

  return (
    <section className="relative -mt-16 flex min-h-screen flex-col overflow-hidden pt-16">
      <img src="/sky/dawn.png" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-paper" aria-hidden />
      <div className="absolute inset-0 hidden bg-[#0f1430]/55 dark:block" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-10 text-center sm:pt-14">
        <motion.p {...rise(0)} className="eyebrow">A city for the projects you started</motion.p>
        <motion.h1 {...rise(1)} className="display mx-auto mt-5 max-w-4xl !text-[clamp(2.3rem,4.6vw+0.4rem,4.4rem)]">
          Every <span className="relative inline-block text-soft">
            abandoned
            <motion.span
              className="absolute left-0 top-[55%] h-[0.08em] w-full origin-left bg-ink"
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.1, duration: 0.5, ease: 'easeOut' }}
              aria-hidden
            />
          </span>{' '}
          <motion.span initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>unfinished</motion.span> project deserves another floor.
        </motion.h1>
        <motion.p {...rise(2)} className="lead mx-auto mt-6 max-w-2xl">
          Turn your abandoned projects into a living city, then decide which ones to bring back.
        </motion.p>
        <motion.div {...rise(3)} className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={user ? '/city' : '/signup'} className="btn btn-primary">Build my city <ArrowRight size={16} /></Link>
          <a href="#story" className="btn btn-ghost">Read the city story</a>
        </motion.div>
      </div>

      <motion.div {...rise(4)} className="relative z-10 mx-auto mt-auto w-full max-w-4xl overflow-hidden px-4">
        {/* the drawing sits left of centre in its frame, so nudge it to centre the meadow */}
        <div style={{ transform: 'translateX(13%)', clipPath: 'inset(0 10% 0 0)' }}>
          <FrameLoop reduce={reduce} />
        </div>
      </motion.div>

      {!reduce && (
        <motion.a href="#story" className="absolute bottom-8 right-6 z-20 text-muted" animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }} aria-label="Scroll to the story">
          <ArrowDown size={20} />
        </motion.a>
      )}
    </section>
  )
}

// Plays the frames like a flipbook. All frames are preloaded first so the loop never flickers.
function FrameLoop({ reduce }) {
  const [frame, setFrame] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let loaded = 0
    FRAMES.forEach((src) => {
      const img = new Image()
      img.onload = img.onerror = () => { if (++loaded === FRAMES.length) setReady(true) }
      img.src = src
    })
  }, [])

  useEffect(() => {
    if (reduce || !ready) return
    const t = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 1000 / FPS)
    return () => clearInterval(t)
  }, [reduce, ready])

  return (
    <img
      src={FRAMES[frame]}
      width={1376}
      height={768}
      alt="A young builder sits in the grass with a laptop, his back against a giant Ctrl key, while his cat sleeps on the B key beside him."
      className="block h-auto w-full mix-blend-multiply"
      draggable="false"
    />
  )
}
