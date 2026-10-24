import { useEffect, useState, useSyncExternalStore } from 'react'

// Site theme lives on <html data-theme>. This hook lets components read and change it.
const listeners = new Set()
const get = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

export function setTheme(t) {
  document.documentElement.dataset.theme = t
  try { localStorage.setItem('hb-theme', t) } catch { /* ignore */ }
  listeners.forEach((l) => l())
}

export function useTheme() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, get)
}

// City day or night: follows the site theme, can be flipped locally.
export function useCityNight() {
  const theme = useTheme()
  const [night, setNight] = useState(theme === 'dark')
  useEffect(() => setNight(theme === 'dark'), [theme])
  return [night, setNight]
}
