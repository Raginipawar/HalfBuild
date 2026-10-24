import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
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
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="HALFBUILT home">
            <Logo />
            <span className="font-serif text-2xl leading-none tracking-[0.12em]">HALFBUILT</span>
          </Link>

          <div className="flex items-center gap-2">
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
