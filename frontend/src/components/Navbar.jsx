import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import MenuOverlay from './MenuOverlay'
import { useCurrentUser } from '../store/useStore'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const user = useCurrentUser()
  const close = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-fg" aria-label="HALFBUILT home">
            <Logo />
            <span className="text-[15px] font-semibold tracking-[0.08em]">HALFBUILT</span>
          </Link>

          <div className="flex items-center gap-2">
            {user && (
              <span className="hidden font-mono text-xs uppercase tracking-wide text-muted sm:inline">
                @{user.username}
              </span>
            )}
            <ThemeToggle />
            <button
              ref={buttonRef}
              type="button"
              className="btn btn-ghost h-9"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
            >
              <Menu size={16} />
              Menu
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay open={open} onClose={close} />
    </>
  )
}
