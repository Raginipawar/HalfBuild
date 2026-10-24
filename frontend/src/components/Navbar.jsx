import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import Logo from './Logo'
import { setTheme, useTheme } from '../lib/theme'
import MenuOverlay from './MenuOverlay'
import { useCurrentUser } from '../store/useStore'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const user = useCurrentUser()
  const theme = useTheme()
  const close = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])

  return (
    <>
      <header className="glass-bar fixed inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="HALFBUILT home">
            <Logo />
            <span className="font-display text-[19px] leading-none tracking-[0.14em]"><b className="font-bold">HALF</b><span className="font-normal text-soft">BUILT</span></span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-ink hover:text-ink"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link to={user ? '/city' : '/signup'} className="btn btn-primary btn-sm hidden sm:inline-flex">
              {user ? 'My city' : 'Build my city'}
            </Link>
            <button
              ref={buttonRef}
              type="button"
              className="btn btn-ghost btn-sm gap-3"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
            >
              Menu
              <span aria-hidden className="flex flex-col gap-[3px]">
                <span className="block h-px w-4 bg-current" />
                <span className="block h-px w-4 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay open={open} onClose={close} />
    </>
  )
}
