// Conformance for code/substrate/sprinkle-minkowski: the Poisson sprinkle of a causal
// diamond. The HARD rule is determinism: the same seed must produce a byte-identical
// sprinkle, so the whole testbed stays a pure function of (seed, parameters). Beyond that
// the count is exact, every sampled point lies inside the diamond, and the stored causal
// relation is exactly the future-timelike relation recomputed from the coordinates. The
// determinism, count, and relation checks are EXACT; the geometry check uses a tiny epsilon
// for floating-point coordinates.

import {
  suite,
  check,
  equal,
  ok,
  notOk,
  exactArray,
} from '@/test/code/harness'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { makeRng } from '@/code/tool/rng'
import { precedes, relationCount } from '@/code/tool/poset'

const sprinkle = (seed: number, count = 120, dimension = 3) =>
  sprinkleMinkowski({ dimension, count, rng: makeRng({ seed }) })

suite('substrate/sprinkle-minkowski: determinism', [
  check('the same seed produces an identical sprinkle', () => {
    const a = sprinkle(42)
    const b = sprinkle(42)
    equal(a.size, b.size, 'size')
    exactArray(
      a.embedding!.coords,
      b.embedding!.coords,
      'coordinates must match exactly',
    )
    equal(relationCount(a), relationCount(b), 'relation count')
  }),
  check('a different seed produces a different sprinkle', () => {
    const a = sprinkle(42)
    const c = sprinkle(43)

    let differs = false

    for (let i = 0; i < a.embedding!.coords.length; i++) {
      if (a.embedding!.coords[i] !== c.embedding!.coords[i]) {
        differs = true
        break
      }
    }

    ok(differs, 'seed 42 and 43 should not coincide')
  }),
])

suite('substrate/sprinkle-minkowski: the sample', [
  check('the element count is exactly the requested count', () => {
    equal(sprinkle(7, 120).size, 120, 'count')
  }),
  check('every point lies inside the causal diamond', () => {
    // The diamond between (0,..) and (1,..): spatial radius <= min(t, 1 - t), t in [0,1].
    const d = 3
    const p = sprinkle(7, 200, d)
    const coords = p.embedding!.coords

    for (let i = 0; i < p.size; i++) {
      const t = coords[i * d]!
      ok(t >= 0 && t <= 1, `t=${t} in [0,1]`)

      let radius2 = 0

      for (let axis = 1; axis < d; axis++) {
        const x = coords[i * d + axis]!
        radius2 += x * x
      }

      const reach = Math.min(t, 1 - t)
      ok(
        radius2 <= reach * reach + 1e-9,
        `point ${i} inside the diamond`,
      )
    }
  }),
])

suite('substrate/sprinkle-minkowski: the causal relation', [
  check(
    'precedes matches the future-timelike relation recomputed from coords',
    () => {
      const d = 3
      const n = 60
      const p = sprinkleMinkowski({
        dimension: d,
        count: n,
        rng: makeRng({ seed: 11 }),
      })

      const coords = p.embedding!.coords

      const causal = (a: number, b: number): boolean => {
        const dt = coords[b * d]! - coords[a * d]!

        if (dt <= 0) {
          return false
        }

        let space2 = 0

        for (let axis = 1; axis < d; axis++) {
          const dx = coords[b * d + axis]! - coords[a * d + axis]!
          space2 += dx * dx
        }

        return dt * dt - space2 >= 0
      }

      for (let a = 0; a < n; a++) {
        for (let b = 0; b < n; b++) {
          if (a === b) {
            continue
          }

          equal(
            precedes(p, { a, b }),
            causal(a, b),
            `relation ${a}->${b}`,
          )
        }
      }
    },
  ),
  check('the relation is irreflexive and antisymmetric', () => {
    const p = sprinkle(11, 60)

    for (let a = 0; a < p.size; a++) {
      notOk(precedes(p, { a, b: a }), `irreflexive at ${a}`)

      for (let b = 0; b < p.size; b++) {
        if (precedes(p, { a, b })) {
          notOk(precedes(p, { a: b, b: a }), `antisymmetric ${a},${b}`)
        }
      }
    }
  }),
])
