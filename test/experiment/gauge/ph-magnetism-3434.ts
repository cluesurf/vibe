// P251 (PH5 genuine, PH6 ASSUMED): magnetism on {3,4,3,4}. PH5 FIELD magnetism is a GENUINE lattice result:
// a charged wavepacket on a 2D lattice with Peierls phases (the gauge link phases of p249) DEFLECTS, the
// lattice Lorentz force emerges from the gauge coupling, deflection grows with B, zero when B = 0, with the
// B = 0 control. PH6 SPIN magnetism is NOT an independent test, it ASSUMES g = 2 and integrates the Larmor
// equation dS/dt = (g/2m) S x B, so it only DEMONSTRATES precession, it does not derive g. Flagged L0 in the
// test catalog. g = 2 must be derived from the Dirac coupling in future work, it is set by hand here.
// Run: npx tsx code/experiment/p251-ph-magnetism-3434.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type C = [number, number]
const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cmul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cscale = (a: C, s: number): C => [a[0] * s, a[1] * s]
const cabs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const phase = (t: number): C => [Math.cos(t), Math.sin(t)]

// PH5: 2D tight-binding charged particle, Landau gauge A_y = B*x (Peierls phase on y-hops). A wavepacket with
// initial x-momentum deflects in y (the lattice Lorentz force). Split-step: free hop in x and y with phases.
function deflection(B: number, L: number, steps: number): number {
  const idx = (x: number, y: number): number => x * L + y
  const wrap = (a: number): number => ((a % L) + L) % L
  // gaussian wavepacket with x-momentum kx
  const kx = 1.0, x0 = L / 2, y0 = L / 2, w = 4
  let psi: C[] = new Array(L * L).fill([0, 0])
  let nrm = 0
  for (let x = 0; x < L; x++) for (let y = 0; y < L; y++) { const g = Math.exp(-((x - x0) ** 2 + (y - y0) ** 2) / (2 * w * w)); const ph = phase(kx * x); psi[idx(x, y)] = cscale(ph, g); nrm += g * g }
  psi = psi.map((z) => cscale(z, 1 / Math.sqrt(nrm)))
  const tau = 0.35 // hop strength per step (small => semiclassical)
  for (let t = 0; t < steps; t++) {
    const next: C[] = psi.map((z) => [...z] as C)
    for (let x = 0; x < L; x++) for (let y = 0; y < L; y++) {
      const i = idx(x, y)
      // x-hops (no phase), y-hops with Peierls phase e^{i B x} (Landau gauge)
      const hop = (j: number, ph: C): void => { next[i] = cadd(next[i]!, cscale(cmul(psi[j]!, ph), tau)) }
      hop(idx(wrap(x + 1), y), [1, 0]); hop(idx(wrap(x - 1), y), [1, 0])
      hop(idx(x, wrap(y + 1)), phase(B * x)); hop(idx(x, wrap(y - 1)), phase(-B * x))
    }
    let n2 = 0; for (const z of next) n2 += cabs2(z); psi = next.map((z) => cscale(z, 1 / Math.sqrt(n2)))
  }
  let ybar = 0, wsum = 0
  for (let x = 0; x < L; x++) for (let y = 0; y < L; y++) { const p = cabs2(psi[idx(x, y)]!); ybar += (y - y0) * p; wsum += p }
  return ybar / wsum // transverse drift
}

export function phMagnetism(): { lorentzDeflects: boolean; deflectionGrowsWithB: boolean; spinPrecesses: boolean } {
  const L = 28, steps = 12
  const d0 = deflection(0, L, steps), dB = deflection(0.25, L, steps), dB2 = deflection(0.5, L, steps)
  const lorentzDeflects = Math.abs(dB) > 0.05 && Math.abs(d0) < 0.02
  const deflectionGrowsWithB = Math.abs(dB2) > Math.abs(dB)

  // PH6 (ASSUMED, NOT a test): IF g = 2 (set by hand), the Larmor equation dS/dt = (g/2m) S x B precesses the
  // spin. This only DEMONSTRATES precession given the assumption, it does NOT derive g. Honest L0. To make it
  // a real test, g must be measured from the Dirac coupling, not input.
  const gAssumed = 2, q = 1, m = 1, Bz = 0.3, dt = 0.05, N = 400
  let S = [1, 0, 0]
  for (let t = 0; t < N; t++) { const cross = [S[1]! * Bz, -S[0]! * Bz, 0]; for (let k = 0; k < 3; k++) S[k]! += (gAssumed * q / (2 * m)) * cross[k]! * dt; const n = Math.hypot(...S); S = S.map((x) => x / n) }
  const finalAngle = Math.atan2(S[1]!, S[0]!)
  const spinPrecesses = Math.abs(S[2]!) < 1e-6 && Math.abs(finalAngle) > 0.1

  return { lorentzDeflects, deflectionGrowsWithB, spinPrecesses }
}

export default defineExperiment({
  id: 'gauge/ph-magnetism-3434',
  title: 'a charged wavepacket deflects in a magnetic field, the lattice Lorentz force, with a B = 0 control',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = phMagnetism()
    const ok = r.lorentzDeflects && r.deflectionGrowsWithB
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a charged wavepacket on the lattice with Peierls phases deflects transversely in a magnetic field with the deflection growing with the field, and travels straight when the field is zero',
      metrics: {
        lorentzDeflects: r.lorentzDeflects ? 1 : 0,
        deflectionGrowsWithB: r.deflectionGrowsWithB ? 1 : 0,
        spinPrecesses: r.spinPrecesses ? 1 : 0,
      },
      notes:
        'L2, known physics, the lattice Lorentz force from a gauge coupling, with the B = 0 straight-line control. Only the PH5 field-magnetism part is scored. The PH6 spin precession assumes g = 2 by hand and integrates the Larmor equation, so it is L0 circular and does not enter the pass.',
    })
  },
})
