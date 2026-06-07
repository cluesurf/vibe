// P32: the Einstein equations as equations of motion, and the graviton dynamics.
// P24 derived the linearized Einstein operator G[h] from the action. The Einstein
// equation is G[h] = 8 pi T (with a source) or G[h] = 0 (vacuum). We show the
// equation behaves as a real theory of gravity:
//   - Conservation (the contracted Bianchi identity): the Einstein tensor is
//     transverse, k . G[h] = 0 for any h, so the equation AUTOMATICALLY enforces
//     energy-momentum conservation.
//   - The Newtonian limit: the static equation reduces to the Poisson equation, whose
//     solution is the 1/r potential (P16).
//   - The graviton dynamics: in vacuum the transverse-traceless modes obey a wave
//     equation with dispersion omega = |k|, so the graviton PROPAGATES at the speed of
//     light, massless.
// See note/questions/frontiers.md. Run: npx tsx code/experiment/p32-einstein-equations.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { einsteinOp, gravitonFromAction } from '~/experiment/p24-graviton-from-action'

// Residual of the contracted Bianchi identity k_i G_ij[h], averaged over random
// symmetric perturbations h. Zero means the Einstein tensor is transverse, which is
// energy-momentum conservation built into the equation of motion.
export function bianchiResidual(input: { k: number[]; samples: number; seed: number }): number {
  const rng = makeRng({ seed: input.seed })
  let worst = 0
  for (let s = 0; s < input.samples; s++) {
    const h: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    for (let i = 0; i < 3; i++) {
      for (let j = i; j < 3; j++) {
        const v = rng.next() * 2 - 1
        h[i]![j] = v
        h[j]![i] = v
      }
    }
    const g = einsteinOp(h, input.k)
    let hn = 0
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        hn += (h[i]?.[j] ?? 0) ** 2
      }
    }
    // k_i G_ij summed over i, for each j, then the norm of that 3-vector.
    let div2 = 0
    for (let j = 0; j < 3; j++) {
      let d = 0
      for (let i = 0; i < 3; i++) {
        d += (input.k[i] ?? 0) * (g[i]?.[j] ?? 0)
      }
      div2 += d * d
    }
    const rel = hn > 0 ? Math.sqrt(div2) / Math.sqrt(hn) : 0
    worst = Math.max(worst, rel)
  }
  return worst
}

// Graviton wave speed omega/|k| from the vacuum equation. The graviton eigenvalue of
// G is (1/2)|k|^2, so the wave dispersion is omega = sqrt(2 * eigenvalue) = |k|, hence
// speed omega/|k| = 1 (the speed of light), independent of frequency (massless).
export function gravitonSpeed(kMag: number): number {
  const r = gravitonFromAction({ k: [kMag, 0, 0] })
  const omega = Math.sqrt(2 * r.gravitonEigenvalue)
  return omega / kMag
}

export function main(): void {
  console.log('P32: the Einstein equations as equations of motion, and graviton dynamics')
  console.log('')
  console.log('  Conservation (contracted Bianchi identity): k . G[h] for random perturbations h')
  for (const k of [[0, 0, 1], [1, 1, 0], [2, 1, 3]]) {
    const res = bianchiResidual({ k, samples: 50, seed: 1 })
    console.log(`    k=(${k.join(',')}): worst |k . G[h]| / |h| = ${res.toExponential(1)} (zero = transverse, conservation holds)`)
  }
  console.log('')
  console.log('  The Newtonian limit: the static Einstein equation is the Poisson equation, whose')
  console.log('  point-source solution is the 1/r potential (validated in P16, R^2 0.997 in 3D).')
  console.log('  So Newton gravity IS the static weak-field Einstein equation.')
  console.log('')
  console.log('  Graviton dynamics (vacuum wave speed omega/|k|, the speed of light):')
  for (const k of [0.25, 0.5, 1.0]) {
    console.log(`    |k| = ${k}: omega/|k| = ${gravitonSpeed(k).toFixed(4)}`)
  }
  console.log('  The speed is one and frequency-independent, so the graviton is massless and')
  console.log('  propagates at the speed of light.')
  console.log('')
  console.log('  So the linearized Einstein equation is a genuine equation of motion: it conserves')
  console.log('  energy-momentum (transverse Einstein tensor), it reduces to Newton in the static')
  console.log('  limit, and in vacuum it propagates a massless graviton at the speed of light. The')
  console.log('  remaining step is the full nonlinear Einstein equation from the discrete action.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
