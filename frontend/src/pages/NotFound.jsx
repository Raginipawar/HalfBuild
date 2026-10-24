import { Link } from 'react-router-dom'
import { poly } from '../iso/iso'
import { Lamp } from '../iso/StreetBits'

// 404 as an empty construction plot: a bare slab with a dashed outline.
export default function NotFound() {
  const dash = { fill: 'none', stroke: 'var(--scaffold)', strokeWidth: 1.2, strokeDasharray: '4 3' }
  return (
    <main className="relative overflow-hidden">
      <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <svg viewBox="-150 -70 300 190" className="mx-auto w-full max-w-sm" role="img" aria-label="An empty building plot">
          <defs>
            <radialGradient id="lampGlow">
              <stop offset="0" stopColor="var(--lamp)" stopOpacity="var(--glow-alpha)" />
              <stop offset="1" stopColor="var(--lamp)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <polygon points={poly([0, 6, 0], [6, 6, 0], [6, 6, -0.5], [0, 6, -0.5])} fill="var(--slab-l)" />
          <polygon points={poly([6, 6, 0], [6, 0, 0], [6, 0, -0.5], [6, 6, -0.5])} fill="var(--slab-r)" />
          <polygon points={poly([0, 0, 0], [6, 0, 0], [6, 6, 0], [0, 6, 0])} fill="var(--slab-top)" />
          <polygon points={poly([1.8, 1.8, 0], [4.2, 1.8, 0], [4.2, 4.2, 0], [1.8, 4.2, 0])} {...dash} />
          <polygon points={poly([1.8, 4.2, 0], [4.2, 4.2, 0], [4.2, 4.2, 2], [1.8, 4.2, 2])} {...dash} opacity="0.7" />
          <polygon points={poly([4.2, 4.2, 0], [4.2, 1.8, 0], [4.2, 1.8, 2], [4.2, 4.2, 2])} {...dash} opacity="0.7" />
          <Lamp x={5.3} y={5.3} />
        </svg>
        <p className="eyebrow mt-6">404 · Empty plot</p>
        <h1 className="title mt-3">Nothing has been built here yet.</h1>
        <p className="lead mx-auto mt-4 max-w-md">This address is still an empty plot of land.</p>
        <Link to="/" className="btn btn-primary mt-8">Back home</Link>
      </div>
    </main>
  )
}
