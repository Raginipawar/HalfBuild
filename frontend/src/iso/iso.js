// Isometric projection helpers. World units: x and y on the ground, z up.
// Everything in the 3D city is plain SVG built from these.

export const U = 22 // pixels per world unit
export const FLOOR = 0.5 // world height of one floor
const C = Math.cos(Math.PI / 6)

export const pt = (x, y, z = 0) => [(x - y) * C * U, (x + y) * 0.5 * U - z * U]

export const poly = (...points) =>
  points.map((p) => pt(...p).map((n) => n.toFixed(1)).join(',')).join(' ')

export const line = (a, b) => {
  const [x1, y1] = pt(...a)
  const [x2, y2] = pt(...b)
  return { x1, y1, x2, y2 }
}

// stable pseudo random in [0,1) from integers, used for which windows are lit
export function hash(...n) {
  let h = 2166136261
  for (const v of n) h = Math.imul(h ^ v, 16777619)
  return ((h >>> 0) % 1000) / 1000
}
