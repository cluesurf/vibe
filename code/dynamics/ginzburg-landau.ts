// Relaxation (gradient flow) of a complex order-parameter field on a ring, the
// Ginzburg-Landau / XY-model heat flow. Each site feels the discrete Laplacian
// (nearest-neighbour smoothing) plus a restoring term 1 - |psi|^2 that pulls the
// magnitude back to one. The flow drives smooth configurations to vacuum but cannot
// undo a topological winding, so it relaxes a defect/anti-defect pair to zero energy
// while a like-charge pair stays locked above the topological minimum. Used to test
// that defects behave as conserved particles.

export interface Complex2 {
  re: number
  im: number
}

// The discrete Dirichlet energy of a complex field on the ring, sum over edges of
// the squared difference between neighbouring values.
export function ringFieldEnergy(psi: ReadonlyArray<Complex2>): number {
  const length = psi.length
  let e = 0
  for (let i = 0; i < length; i++) {
    const a = psi[(i + 1) % length]!
    const z = psi[i]!
    e += (a.re - z.re) ** 2 + (a.im - z.im) ** 2
  }
  return e
}

// One explicit Euler relaxation step in place, returning the next field. Each value
// moves by dt * (laplacian + (1 - |psi|^2) * psi).
function relaxStep(cur: ReadonlyArray<Complex2>, dt: number): Complex2[] {
  const length = cur.length
  return cur.map((z, i) => {
    const a = cur[(i + 1) % length]!
    const b = cur[(i + length - 1) % length]!
    const lapRe = a.re + b.re - 2 * z.re
    const lapIm = a.im + b.im - 2 * z.im
    const r2 = z.re * z.re + z.im * z.im
    const restore = 1 - r2
    return {
      re: z.re + dt * (lapRe + restore * z.re),
      im: z.im + dt * (lapIm + restore * z.im),
    }
  })
}

// Run the relaxation for the given number of steps. The optional onSample callback
// fires every sampleEvery steps (when set) with the current field, so the caller can
// record a history (for example the winding at intervals) without exposing the loop.
export function relaxRingField(input: {
  field: ReadonlyArray<Complex2>
  steps: number
  dt: number
  sampleEvery?: number
  onSample?: (field: Complex2[], step: number) => void
}): Complex2[] {
  const { field, steps, dt, sampleEvery, onSample } = input
  let cur: Complex2[] = field.map((z) => ({ ...z }))
  for (let t = 0; t < steps; t++) {
    cur = relaxStep(cur, dt)
    if (onSample && sampleEvery && t % sampleEvery === 0) onSample(cur, t)
  }
  return cur
}
