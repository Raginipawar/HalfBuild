import { Link } from 'react-router-dom'
import { PixelSquares } from './Decor'

// Placeholder for screens that arrive in later build phases.
export default function ComingSoon({ title, phase, text }) {
  return (
    <main className="relative mx-auto max-w-3xl px-4 py-28 text-center sm:px-8">
      <PixelSquares className="mx-auto mb-8" />
      <p className="eyebrow">Under construction · Phase {phase}</p>
      <h1 className="title mt-4">{title}</h1>
      <p className="lead mx-auto mt-4 max-w-xl">{text}</p>
      <Link to="/" className="btn btn-ghost mt-8">Back home</Link>
    </main>
  )
}
