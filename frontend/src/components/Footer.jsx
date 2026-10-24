import { Link } from 'react-router-dom'
import Logo from './Logo'

const COLUMNS = [
  { title: 'Product', links: [['Home', '/'], ['How it works', '/how-it-works'], ['My City', '/city'], ['Add a project', '/project/new']] },
  { title: 'Community', links: [['Leaderboard', '/leaderboard'], ["Builders' Square", '/square'], ['Demo builder', '/builder/demo']] },
  { title: 'About', links: [['Our story', '/about'], ['Log in', '/login'], ['Sign up', '/signup']] },
]

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="rounded bg-paper p-1"><Logo size={22} /></span>
            <span className="font-display text-2xl tracking-[0.12em]">HALFBUILT</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Unfinished does not mean failed. It means the next floor has not been built yet.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{c.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-white/80 hover:text-light">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-5 text-xs text-white/45 sm:px-8">
          <span>Built for Code Variant Build 01 · Problem Statement 05</span>
          <span>Team ragini.pawar24</span>
        </div>
      </div>
    </footer>
  )
}
