// Conformance for code/measure/avalanche. toneDensity is the nonzero fraction. The avalanche size is
// the Hamming distance between a perturbed copy and the original under matched dynamics; with an
// IDENTITY relax (no dynamics) the single seeded flip never spreads and never heals, so every
// avalanche size is exactly 1, and a vacuum background settles to density 0. We inject a deterministic
// no-op relax and a fixed RNG so the outcome is fully hand-derived.

import { suite, check, equal, exactArray } from '@/test/code/harness'
import {
  toneDensity,
  avalancheSizes,
  settledAvalancheSizes,
} from '@/code/measure/avalanche'

// A deterministic RNG that always returns 0 (so the perturbed cell is index 0 every trial).
const makeZeroRng = (_seed: number) => ({ next: () => 0 })
// Identity dynamics: leave the state untouched.
const identityRelax = (_state: Int8Array, _rng: { next: () => number }) => {}

suite('measure/avalanche: toneDensity', [
  check('nonzero fraction of a buffer', () => {
    equal(toneDensity(Int8Array.from([1, 0, -1, 0])), 0.5)
    equal(toneDensity(Int8Array.from([0, 0, 0])), 0)
  }),
])

suite('measure/avalanche: avalancheSizes (identity dynamics)', [
  check('a single seeded flip with no dynamics gives sizes of exactly 1', () => {
    const sizes = avalancheSizes({
      base: new Int8Array(4),
      steps: 5,
      trials: 3,
      perturbSeed: 0,
      streamSeed: 0,
      makeRng: makeZeroRng,
      relax: identityRelax,
      mode: 'final',
    })
    exactArray(sizes, [1, 1, 1])
  }),
  check('peak mode also reports the unspread damage of 1', () => {
    const sizes = avalancheSizes({
      base: new Int8Array(4),
      steps: 5,
      trials: 2,
      perturbSeed: 0,
      streamSeed: 0,
      makeRng: makeZeroRng,
      relax: identityRelax,
      mode: 'peak',
    })
    exactArray(sizes, [1, 1])
  }),
])

suite('measure/avalanche: settledAvalancheSizes', [
  check('vacuum settles to density 0 under identity relax', () => {
    const out = settledAvalancheSizes({
      size: 6,
      settleSteps: 10,
      steps: 5,
      trials: 2,
      settleSeed: 1,
      perturbSeed: 0,
      streamSeed: 0,
      makeRng: makeZeroRng,
      relax: identityRelax,
      mode: 'final',
    })
    equal(out.background, 0)
    exactArray(out.sizes, [1, 1])
  }),
])
