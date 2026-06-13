// P27: Lorentz violation, and why the causal-set substrate avoids it.
// Discreteness is widely expected to break Lorentz invariance: a regular lattice has
// a modified dispersion and preferred axes, so the speed of light becomes
// energy-dependent and direction-dependent (Lorentz violation, LIV), which gamma-ray-
// burst photon timing tightly constrains. We show two things. First, a lattice DOES
// have LIV: its group velocity becomes anisotropic and energy-dependent at high
// energy. Second, the causal-set substrate (a random Poisson sprinkling) is Lorentz-
// invariant in distribution, so at the discreteness scale its link directions are
// ISOTROPIC, unlike the lattice's preferred axes. So Vibe Theory's discreteness
// predicts NO first-order LIV, matching the observed null results, where lattice
// discreteness would not. See note/questions/frontiers.md. Run:
// npx tsx code/experiment/p27-lorentz-violation.ts

import { makeRng, Rng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Lattice scalar dispersion omega(k) = sqrt(sum 4 sin^2(k_i/2)) and its group speed
// |grad_k omega|. The continuum is omega = |k| (speed 1, isotropic).
function omega(kx: number, ky: number): number {
  return Math.sqrt(4 * Math.sin(kx / 2) ** 2 + 4 * Math.sin(ky / 2) ** 2)
}
function groupSpeed(kx: number, ky: number): number {
  const h = 1e-5
  const dwx = (omega(kx + h, ky) - omega(kx - h, ky)) / (2 * h)
  const dwy = (omega(kx, ky + h) - omega(kx, ky - h)) / (2 * h)
  return Math.hypot(dwx, dwy)
}

// Group-speed anisotropy at a fixed momentum magnitude: (max - min) / mean over
// directions. Zero is perfectly Lorentz-safe, large is strong LIV.
export function latticeAnisotropy(kMag: number): { meanSpeed: number; anisotropy: number } {
  const speeds: number[] = []
  for (let a = 0; a < 24; a++) {
    const theta = (a / 24) * (Math.PI / 2) // one quadrant by symmetry
    speeds.push(groupSpeed(kMag * Math.cos(theta), kMag * Math.sin(theta)))
  }
  const mean = speeds.reduce((p, q) => p + q, 0) / speeds.length
  const max = Math.max(...speeds)
  const min = Math.min(...speeds)
  return { meanSpeed: mean, anisotropy: mean > 0 ? (max - min) / mean : 0 }
}

// Directional anisotropy of nearest-neighbor link directions at the discreteness
// scale: the 4-fold Fourier component, normalised. A lattice has strong 4-fold
// structure (preferred axes), a Poisson sprinkling has none (isotropic).
function linkDirectionAnisotropy(points: { x: number; y: number }[]): number {
  let cos4 = 0
  let sin4 = 0
  let n = 0
  for (let i = 0; i < points.length; i++) {
    let best = -1
    let bestD = Infinity
    for (let j = 0; j < points.length; j++) {
      if (i === j) {
        continue
      }
      const dx = (points[j]?.x ?? 0) - (points[i]?.x ?? 0)
      const dy = (points[j]?.y ?? 0) - (points[i]?.y ?? 0)
      const d = dx * dx + dy * dy
      if (d < bestD) {
        bestD = d
        best = j
      }
    }
    if (best >= 0) {
      const dx = (points[best]?.x ?? 0) - (points[i]?.x ?? 0)
      const dy = (points[best]?.y ?? 0) - (points[i]?.y ?? 0)
      const ang = Math.atan2(dy, dx)
      cos4 += Math.cos(4 * ang)
      sin4 += Math.sin(4 * ang)
      n += 1
    }
  }
  return n > 0 ? Math.hypot(cos4, sin4) / n : 0
}

function sprinklePoints(input: { count: number; rng: Rng }): { x: number; y: number }[] {
  return Array.from({ length: input.count }, () => ({ x: input.rng.next(), y: input.rng.next() }))
}
function latticePoints(side: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < side; i++) {
    for (let j = 0; j < side; j++) {
      pts.push({ x: i / side, y: j / side })
    }
  }
  return pts
}

export function lorentzSafety(): { sprinkle: number; lattice: number } {
  const sprinkle = linkDirectionAnisotropy(sprinklePoints({ count: 900, rng: makeRng({ seed: 1 }) }))
  const lattice = linkDirectionAnisotropy(latticePoints(30))
  return { sprinkle, lattice }
}

export default defineExperiment({
  id: 'relativity/lorentz-violation',
  title: 'a lattice violates Lorentz invariance while a sprinkling is Lorentz-safe',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const low = latticeAnisotropy(0.2).anisotropy
    const high = latticeAnisotropy(2.6).anisotropy
    const s = lorentzSafety()
    const ok =
      high > low && high > 0.1 && low < 0.05 && s.sprinkle < 0.2 && s.lattice > 0.8
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a lattice has energy-dependent anisotropy (Lorentz-violating) while a sprinkling stays isotropic (Lorentz-safe)',
      metrics: {
        anisotropyLow: low,
        anisotropyHigh: high,
        linkIsotropySprinkle: s.sprinkle,
        linkIsotropyLattice: s.lattice,
      },
    })
  },
})
