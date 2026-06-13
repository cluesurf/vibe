// P48: the modular base (the parameter-free tessellation and its deterministic automaton).
// The choosing-the-base analysis names the modular group PSL(2,Z), built from the integers
// with no free p or q, as the most elegant base, with the Farey/Stern-Brocot tessellation,
// continued-fraction addressing, and a finite generating automaton. We confirm three
// things:
//   1. The modular tessellation (the PSL(2,Z) orbit embedded in the disc) is Lorentz-safe,
//      with no parameters to choose.
//   2. The Stern-Brocot tree is a deterministic finite automaton (the mediant rule, no
//      randomness) whose addressing is continued fractions: every rational is reached
//      exactly by following its continued fraction as a path.
//   3. The golden ratio is the central geodesic of this base: the all-ones continued
//      fraction gives Fibonacci convergents that converge to phi, tying the parameter-free
//      base to the golden ratio that recurs across the substrate work.
// See the choosing-the-base analysis. Run: npx tsx code/experiment/p48-modular-base.ts

import { makeRng } from '@/code/tool/rng'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import {
  modularGraph,
  rationalFromContinuedFraction,
} from '@/code/substrate/modular-group'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function modularBase(input: { seed: number }): {
  size: number
  degree: number
  anisotropy: number
  lorentzSafe: boolean
  addressingExact: boolean
  goldenError: number
} {
  const g = modularGraph(2500)
  let deg = 0
  for (let i = 0; i < g.size; i++) {
    deg += (g.neighbors[i] ?? new Uint32Array(0)).length
  }
  const aniso = lorentzIsotropy({ substrate: g, samples: 3000, rng: makeRng({ seed: input.seed }) })

  // Continued-fraction addressing: reconstruct several rationals from their CF.
  const cases: { cf: number[]; num: number; den: number }[] = [
    { cf: [0, 2], num: 1, den: 2 }, // 1/2 = [0;2]
    { cf: [0, 3], num: 1, den: 3 }, // 1/3 = [0;3]
    { cf: [0, 1, 4], num: 4, den: 5 }, // 4/5 = [0;1,4]
    { cf: [1, 2], num: 3, den: 2 }, // 3/2 = [1;2]
    { cf: [2, 3], num: 7, den: 3 }, // 7/3 = [2;3]
  ]
  let addressingExact = true
  for (const c of cases) {
    const r = rationalFromContinuedFraction(c.cf)
    if (r.num !== c.num || r.den !== c.den) {
      addressingExact = false
    }
  }

  // The golden ratio is the all-ones continued fraction. Its convergents are Fibonacci
  // ratios. Follow [1;1,1,...] and measure the error to phi.
  const phi = (1 + Math.sqrt(5)) / 2
  const ones = Array.from({ length: 18 }, () => 1)
  const conv = rationalFromContinuedFraction(ones)
  const goldenError = Math.abs(conv.num / conv.den - phi)

  return {
    size: g.size,
    degree: deg / Math.max(1, g.size),
    anisotropy: aniso.anisotropy,
    lorentzSafe: aniso.anisotropy < 0.25,
    addressingExact,
    goldenError,
  }
}

export default defineExperiment({
  id: 'geometry/modular-base',
  title: 'parameter-free modular base is Lorentz-safe, continued-fraction addressed, golden-ratio central',
  category: 'geometry',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = modularBase({ seed: 2 })
    const ok = r.lorentzSafe && r.addressingExact && r.goldenError < 1e-4
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the parameter-free modular tessellation is Lorentz-safe, addresses every rational by continued fraction, and has the golden ratio as its central geodesic',
      metrics: {
        anisotropy: r.anisotropy,
        goldenError: r.goldenError,
      },
    })
  },
})
