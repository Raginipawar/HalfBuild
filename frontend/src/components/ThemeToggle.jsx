import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

function currentTheme() {
  const set = document.documentElement.dataset.theme
  if (set === 'light' || set === 'dark') return set
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(currentTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('hb-theme', theme) } catch { /* ignore */ }
  }, [theme])

  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
