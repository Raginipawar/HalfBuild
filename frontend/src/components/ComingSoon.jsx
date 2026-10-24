import { Link } from 'react-router-dom'

// Placeholder for screens that arrive in later build phases.
export default function ComingSoon({ title, phase, text }) {
  return (
    <main className="relative overflow-hidden">
      <div aria-hidden className="pastel-wash pointer-events-none absolute -inset-x-20 -top-24 h-96 opacity-70" />
      <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="eyebrow">Under construction · Phase {phase}</p>
        <h1 className="heading-2 mt-4">{title}</h1>
        <p className="text-large mx-auto mt-4 max-w-xl text-muted">{text}</p>
        <Link to="/" className="btn btn-ghost mt-8">Back to the city</Link>
      </div>
    </main>
  )
}
