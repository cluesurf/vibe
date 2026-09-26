// Conformance for code/tool/weyl, the deterministic low-discrepancy sequences that replaced the seeded
// generator on 2026-09-25. The hard contract: the stream IS the Kronecker sequence it states (checked
// against the formula, not the implementation), it is bit-identical for the same start, its values stay in
// range, a window of consecutive values is jointly equidistributed (a pair histogram far flatter than a
// generator's), the Gaussian map is the inverse normal distribution, and the matrix helpers are exactly
// orthogonal and unitary to rounding.

import { suite, check, equal, ok, close } from '@/test/code/harness'
import {
  GOLDEN,
  inverseNormal,
  makeWeyl,
  sampleEmpiricalFrequencies,
  weyl,
  weylCell,
  weylOrthogonal,
  weylPermutation,
  weylUnitary,
  weylUnitVector,
} from '@/code/tool/weyl'

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]

function fraction(x: number): number {
  return x - Math.floor(x)
}

suite('tool/weyl: the stream is the stated Kronecker sequence', [
  // draw k < 64 at start 0 is step 1 of slot k: frac(sqrt p_k), to the 2^-32 fixed-point rounding
  check('the first pass at start 0 reads frac(sqrt p) in prime order', () => {
    const stream = makeWeyl({ start: 0 })

    for (const p of PRIMES) {
      close(stream.next(), fraction(Math.sqrt(p)), 2 ** -31, `sqrt ${p}`)
    }
  }),
  // draw 64 is step 2 of slot 0: frac(2 sqrt 2)
  check('the 65th value at start 0 is frac(2 sqrt 2)', () => {
    const stream = makeWeyl({ start: 0 })

    for (let i = 0; i < 64; i++) {
      stream.next()
    }

    close(stream.next(), fraction(2 * Math.SQRT2), 2 ** -30, 'second pass, slot 0')
  }),
  check('the same start gives a bit-identical stream', () => {
    const a = makeWeyl({ start: 12345 })
    const b = makeWeyl({ start: 12345 })

    for (let i = 0; i < 500; i++) {
      equal(a.next(), b.next(), `value ${i}`)
    }

    for (let i = 0; i < 100; i++) {
      equal(a.nextGaussian(), b.nextGaussian(), `normal ${i}`)
    }
  }),
  check('different starts give different streams', () => {
    const a = makeWeyl({ start: 1 })
    const b = makeWeyl({ start: 2 })

    ok(
      Array.from({ length: 16 }, () => a.next() !== b.next()).some(Boolean),
      'streams must differ',
    )
  }),
])

suite('tool/weyl: range and uniformity', [
  check('next() stays in [0, 1) and nextInt in [0, max)', () => {
    const stream = makeWeyl({ start: 424242 })

    for (let i = 0; i < 5000; i++) {
      const v = stream.next()
      const k = stream.nextInt({ max: 7 })

      ok(v >= 0 && v < 1, `next out of [0,1): ${v}`)
      ok(Number.isInteger(k) && k >= 0 && k < 7, `nextInt out of range: ${k}`)
    }
  }),
  // A window of two consecutive values is a 2-D Kronecker point, so a 10 x 10 histogram of 100 000
  // pairs is far flatter than chance: an independent generator gives a chi-square near 99 (its degrees
  // of freedom), a low-discrepancy set gives a small fraction of that.
  check('consecutive pairs are jointly equidistributed, flatter than chance', () => {
    const stream = makeWeyl({ start: 1 })
    const pairs = 100_000
    const cells = new Float64Array(100)

    for (let i = 0; i < pairs; i++) {
      const u = stream.next()
      const v = stream.next()

      cells[Math.floor(u * 10) * 10 + Math.floor(v * 10)]! += 1
    }

    const expected = pairs / 100

    let chi = 0

    for (const c of cells) {
      chi += (c - expected) ** 2 / expected
    }

    ok(chi < 60, `pair chi-square ${chi.toFixed(1)} should sit well below 99`)
  }),
  check('the normal values have mean 0 and variance 1', () => {
    const stream = makeWeyl({ start: 2 })
    const count = 200_000

    let m1 = 0
    let m2 = 0

    for (let i = 0; i < count; i++) {
      const g = stream.nextGaussian()

      m1 += g
      m2 += g * g
    }

    close(m1 / count, 0, 2e-3, 'mean')
    close(m2 / count, 1, 5e-3, 'variance')
  }),
  check('inverseNormal is the inverse of the normal distribution at known quantiles', () => {
    close(inverseNormal(0.5), 0, 1e-9, 'median')
    close(inverseNormal(0.975), 1.959963984540054, 1e-8, '97.5 percent')
    close(inverseNormal(0.001), -3.090232306167813, 1e-8, '0.1 percent')
  }),
  check('empirical frequencies over a stream converge to the bin shares', () => {
    const freqs = sampleEmpiricalFrequencies({
      counts: [1, 2, 3, 4],
      draws: 20_000,
      rng: makeWeyl({ start: 5 }),
    })

    close(freqs[0]!, 0.1, 2e-3, 'bin 0')
    close(freqs[3]!, 0.4, 2e-3, 'bin 3')
  }),
])

suite('tool/weyl: the helpers', [
  check('weyl(n) is frac(n phi) for the golden rotation', () => {
    close(weyl(1), GOLDEN, 1e-15, 'n = 1')
    close(weyl(10), fraction(10 * GOLDEN), 1e-15, 'n = 10')
  }),
  check('weylCell is frac of a sum of three sqrt multiples, to fixed point', () => {
    const expected = fraction(3 * Math.SQRT2 + 5 * Math.sqrt(3) + 7 * Math.sqrt(5))

    close(weylCell(3, 5, 7), expected, 1e-8, 'cell (3, 5, 7)')
  }),
  check('weylPermutation is a permutation and is fixed by its start', () => {
    const a = weylPermutation({ size: 50, start: 9 })
    const b = weylPermutation({ size: 50, start: 9 })

    equal(new Set(a).size, 50, 'every index once')
    ok(a.every((v, i) => v === b[i]), 'same start, same permutation')
  }),
  check('weylUnitVector has unit length', () => {
    const v = weylUnitVector({ dimension: 40, start: 3 })

    close(v.reduce((s, x) => s + x * x, 0), 1, 1e-12, 'norm')
  }),
  check('weylOrthogonal rows are orthonormal', () => {
    const rows = weylOrthogonal({ dimension: 6, start: 3 })

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const dot = rows[i]!.reduce((s, x, k) => s + x * rows[j]![k]!, 0)

        close(dot, i === j ? 1 : 0, 1e-12, `row ${i} . row ${j}`)
      }
    }
  }),
  check('weylUnitary rows are orthonormal under the Hermitian product', () => {
    const { re, im } = weylUnitary({ dimension: 5, start: 4 })

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        let dr = 0
        let di = 0

        for (let k = 0; k < 5; k++) {
          dr += re[i]![k]! * re[j]![k]! + im[i]![k]! * im[j]![k]!
          di += re[i]![k]! * im[j]![k]! - im[i]![k]! * re[j]![k]!
        }

        close(dr, i === j ? 1 : 0, 1e-12, `real part ${i} ${j}`)
        close(di, 0, 1e-12, `imaginary part ${i} ${j}`)
      }
    }
  }),
])
