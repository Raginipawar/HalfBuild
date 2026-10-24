import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { useCurrentUser } from '../store/useStore'

// Opening scene: a watercolour sky and a small meadow where a young builder reads the
// blueprint of his half built tower while his cat sleeps. All drawn here in SVG.

export default function MeadowHero() {
  const user = useCurrentUser()
  const reduce = useReducedMotion()
  const rise = (i) => (reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] } })

  return (
    <section className="watercolor-sky relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <Clouds reduce={reduce} />

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

      <motion.div {...rise(4)} className="relative z-10 mt-auto w-full">
        <Meadow reduce={reduce} />
      </motion.div>

      {!reduce && (
        <motion.a href="#story" className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-muted" animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }} aria-label="Scroll to the story">
          <ArrowDown size={20} />
        </motion.a>
      )}
    </section>
  )
}

function Clouds({ reduce }) {
  const clouds = [
    { top: '12%', left: '-6%', w: 420, o: 0.9, d: 70 },
    { top: '26%', left: '62%', w: 360, o: 0.75, d: 90 },
    { top: '6%', left: '40%', w: 260, o: 0.6, d: 110 },
  ]
  return clouds.map((c, i) => (
    <motion.div
      key={i}
      aria-hidden
      className="cloud pointer-events-none absolute"
      style={{ top: c.top, left: c.left, width: c.w, height: c.w * 0.42, opacity: c.o }}
      animate={reduce ? undefined : { x: [0, 60, 0] }}
      transition={{ duration: c.d, repeat: Infinity, ease: 'easeInOut' }}
    />
  ))
}

function Meadow({ reduce }) {
  const sway = reduce ? '' : 'grass-sway'
  return (
    <svg viewBox="150 -70 900 400" className="mx-auto block w-full max-w-5xl" role="img"
      aria-label="A boy sits in a meadow reading the blueprint of his half built tower, his cat asleep beside him.">
      <defs>
        <filter id="wash" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="9" />
        </filter>
        <filter id="ink">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2" />
          <feDisplacementMap in="SourceGraphic" scale="1.6" />
        </filter>
        <radialGradient id="grassFill" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#9cbf7a" />
          <stop offset="0.7" stopColor="#7aa35e" />
          <stop offset="1" stopColor="#5f8a4b" />
        </radialGradient>
      </defs>

      {/* meadow island */}
      <g filter="url(#wash)">
        <ellipse cx="600" cy="268" rx="430" ry="52" fill="url(#grassFill)" opacity="0.95" />
        <ellipse cx="560" cy="258" rx="300" ry="34" fill="#a9c98a" opacity="0.6" />
        <ellipse cx="640" cy="292" rx="360" ry="22" fill="#55804a" opacity="0.35" />
      </g>

      {/* half built tower behind them */}
      <g filter="url(#ink)" transform="translate(690 40)">
        {Array.from({ length: 6 }, (_, k) => (
          <g key={k}>
            <rect x="0" y={190 - (k + 1) * 26} width="96" height="26" fill="#e9dcc4" stroke="#1f1e1f" strokeWidth="1.6" />
            {[10, 40, 70].map((x, j) => (
              <rect key={x} x={x} y={190 - (k + 1) * 26 + 7} width="16" height="12" fill={(k + j) % 3 === 0 ? '#c9cbd6' : '#F5B942'} stroke="#1f1e1f" strokeWidth="1" />
            ))}
          </g>
        ))}
        {[0, 1].map((k) => (
          <g key={`s${k}`} stroke="#6f6f6b" strokeWidth="1.4" strokeDasharray="5 4" fill="none">
            <rect x="0" y={34 - k * 26} width="96" height="26" />
            <line x1="0" y1={60 - k * 26} x2="96" y2={34 - k * 26} />
          </g>
        ))}
        <g className={reduce ? '' : 'crane-swing'} style={{ transformOrigin: '20px -60px' }} stroke="var(--color-ink)" strokeLinecap="round">
          <line x1="20" y1="8" x2="20" y2="-60" strokeWidth="2.5" />
          <line x1="-14" y1="-60" x2="132" y2="-60" strokeWidth="2.5" />
          <line x1="110" y1="-60" x2="110" y2="-28" strokeWidth="1" />
          <rect x="104" y="-28" width="12" height="9" fill="#F5B942" strokeWidth="1" />
        </g>
      </g>

      {/* tall grass blades */}
      <g className={sway} stroke="#5f8a4b" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.85">
        {Array.from({ length: 46 }, (_, i) => {
          const x = 220 + i * 17 + ((i * 37) % 11)
          const h = 18 + ((i * 53) % 34)
          return <path key={i} d={`M${x} ${262 + ((i * 7) % 18)} q ${4 - (i % 3) * 4} ${-h / 2} ${((i % 5) - 2) * 4} ${-h}`} />
        })}
      </g>

      {/* flowers */}
      {Array.from({ length: 22 }, (_, i) => (
        <circle key={i} cx={240 + ((i * 97) % 740)} cy={250 + ((i * 41) % 40)} r={2.4 + (i % 3)} fill={i % 4 === 0 ? '#f2f0e6' : '#e0573c'} opacity="0.9" />
      ))}

      {/* toolbox the boy leans on */}
      <g filter="url(#ink)">
        <rect x="430" y="196" width="64" height="52" rx="5" fill="#d9573f" stroke="#1f1e1f" strokeWidth="1.6" />
        <path d="M448 196 v-10 h28 v10" fill="none" stroke="#1f1e1f" strokeWidth="2" />
        <line x1="430" y1="214" x2="494" y2="214" stroke="#1f1e1f" strokeWidth="1.2" />
      </g>

      {/* the boy, reading a blueprint */}
      <g filter="url(#ink)" stroke="#1f1e1f" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        {/* legs */}
        <path d="M500 246 q 30 -4 52 6 l 6 10" fill="#3d4a66" />
        <path d="M502 236 q 34 -10 58 2 l 2 12" fill="#46557a" />
        <ellipse cx="566" cy="262" rx="9" ry="5" fill="#2b2b2b" />
        <ellipse cx="564" cy="250" rx="9" ry="5" fill="#2b2b2b" />
        {/* body */}
        <path d="M486 248 q -4 -40 10 -56 q 18 -8 30 4 q 6 22 2 50 z" fill="#c9533c" />
        {/* head */}
        <circle cx="510" cy="168" r="17" fill="#f1d3b8" />
        <path d="M492 165 q 2 -20 20 -20 q 18 0 20 16 l 10 3 q -24 2 -50 1 z" fill="#4a4f5c" />
        <circle cx="516" cy="170" r="4.5" fill="none" strokeWidth="1.2" />
        <circle cx="527" cy="170" r="4.5" fill="none" strokeWidth="1.2" />
        <line x1="520.5" y1="170" x2="522.5" y2="170" strokeWidth="1.2" />
        {/* arms and blueprint */}
        <path d="M498 200 q 18 22 40 16" fill="none" stroke="#c9533c" strokeWidth="9" />
        <g className={reduce ? '' : 'page-breathe'} style={{ transformOrigin: '548px 210px' }}>
          <path d="M530 222 l 36 -10 l -4 -26 l -36 10 z" fill="#4f7fb8" />
          <path d="M534 212 l 24 -7 M532 204 l 18 -5 M538 218 l 10 -3" stroke="#dfe9f5" strokeWidth="1.1" />
        </g>
        <circle cx="538" cy="214" r="5" fill="#f1d3b8" />
      </g>

      {/* the cat, asleep */}
      <g filter="url(#ink)" stroke="#1f1e1f" strokeWidth="1.5" strokeLinejoin="round">
        <g className={reduce ? '' : 'cat-breathe'} style={{ transformOrigin: '640px 258px' }}>
          <path d="M600 258 q 0 -30 40 -30 q 38 0 40 28 q -40 8 -80 2 z" fill="#d8c3a5" />
          <path d="M612 236 q 10 -6 18 -2" fill="none" stroke="#8a6f52" strokeWidth="5" opacity="0.6" />
          <path d="M650 230 q 10 -2 16 4" fill="none" stroke="#8a6f52" strokeWidth="5" opacity="0.6" />
        </g>
        <circle cx="604" cy="246" r="14" fill="#d8c3a5" />
        <path d="M594 236 l -2 -12 l 9 7 M606 233 l 4 -11 l 4 11" fill="#8a6f52" />
        <path d="M598 248 q 3 2 6 0 M608 248 q 3 2 6 0" fill="none" strokeWidth="1.2" />
        <path d="M680 256 q 24 -2 18 -18" fill="none" stroke="#8a6f52" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  )
}
