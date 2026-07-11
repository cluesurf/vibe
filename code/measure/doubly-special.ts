// Doubly-special-relativity diagnostics for an emergent dispersion. A lattice dispersion has a maximum
// frequency (a second invariant at the cell scale) and a signal speed that caps at c and collapses at the
// band edge, where a continuum dispersion is unbounded with speed always c. These reusable measures let an
// experiment read those signatures off any omega(k, m).

const PI = Math.PI

// the continuum (ordinary relativistic) dispersion, unbounded, group velocity -> 1. The control case.
export function continuumDispersion(k: number, m: number): number {
  return Math.sqrt(m * m + k * k)
}

export type DispersionBand = {
  // the maximum frequency over the scanned band (a cell-scale cap for a lattice, unbounded for a continuum).
  maxOmega: number
  // the maximum group velocity |d omega / d k| over the band (the signal speed cap).
  maxGroupVelocity: number
  // the group velocity at the band edge (collapses toward zero for a lattice).
  groupVelocityAtEdge: number
}

// Scan a dispersion omega(k, m) over k in [0, kMax] at the given resolution and report its band signatures.
export function scanDispersionBand(input: {
  omega: (k: number, m: number) => number
  m: number
  samples: number
  kMax?: number
}): DispersionBand {
  const { omega, m, samples } = input
  const kMax = input.kMax ?? PI
  const dk = kMax / samples

  let maxOmega = 0
  let maxGroupVelocity = 0

  for (let i = 0; i <= samples; i++) {
    const k = (i * kMax) / samples
    const w = omega(k, m)

    if (w > maxOmega) maxOmega = w

    if (i < samples) {
      const gv = Math.abs((omega(k + dk, m) - w) / dk)

      if (gv > maxGroupVelocity) maxGroupVelocity = gv
    }
  }

  const kEdge = kMax - dk
  const groupVelocityAtEdge = (omega(kMax, m) - omega(kEdge, m)) / dk

  return { maxOmega, maxGroupVelocity, groupVelocityAtEdge }
}
