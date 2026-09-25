// Fear as a beat: the cube-root swap phase carried by an exact, reversible, charge-conserving step on whole
// loves and fears, with the gate set it completes checked universal rather than cited.
//
// Step 3 of the path in note/experiment/gauge/what-the-base-needs. E-FRC-0121 found the swap phase at
// 2 pi / 3 moves grid weights by a kernel in quarters, and E-FRC-0122 that each such step makes the units
// finer while love minus fear stays one whole. So the step can be a beat on integers:
//
//   n'(x) = sum over y of K(x, y) n(y),   K(x, y) = Tr(A(x) U A(y) U^dagger) / 9,
//
// on the 81 grid points of two roles, n(x) the net vibe (loves minus fears) at x, N = sum n the whole's
// charge. Love minus fear is conserved because K's columns sum to 1. The loves and fears that the new signs
// need come from calm as love-fear pairs and go back to calm by annihilation, so the beat is also a count
// of pair creations. It is exact while every n'(x) is whole, which a whole of N units allows for a number of
// steps fixed by N: the grain. Past it the beat refuses rather than rounds.
//
// Gates, fixed before the run, over 8 rounds of E-FRC-0122 (the swap phase, SUM, then the Fourier move on
// the first role), from the classical state |00>:
// - with N = 2,304 every beat is exact, love minus fear stays 2,304, and n / N equals the grid weights of
//   the state vector run in floating point, to 1e-9
// - every beat reverses exactly: the kernel of U^dagger returns the previous n
// - the grain bound: with N = 576 the first refused beat is round 8, with N = 9 round 2, as E-FRC-0122's
//   units predict (9 at the start, then 9, 36, 36, 144, 144, 576, 576, 2,304 after rounds 1 to 8). A
//   first version gated round 3 for N = 9, reading that list as starting at round 1. The run refused at
//   round 2, which is what the list says once the start is counted, and the gate was corrected to it
// - the control, the swap phase at pi / 2: its kernel is not dyadic at any power up to 2^20, so no whole
//   of any size carries it
// Universality, checked: the swap phase at 2 pi / 3 is not Clifford (its kernel is not a permutation), a
// product with Clifford gates has infinite order (no power up to 20,000 is a phase times the identity, and
// its eigenphases are not rational with denominator up to 1,000), and the Lie algebra that product's
// generator spans under conjugation by Clifford words and commutators is all 80 dimensions of su(9). The
// closure of the gate set then contains SU(9).
//
// Depth L1: exact arithmetic and linear algebra.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  adjointOperator,
  applyOperator,
  gridWeights,
  identityOperator,
  multiplyOperators,
  operator,
  phasePointOperators,
  tensorOperators,
  type Operator,
} from '@/code/measure/grid-weights'

const OMEGA = (2 * Math.PI) / 3

function swapPhase(phi: number): Operator {
  const u = operator(9)
  const c = Math.cos(phi)
  const s = Math.sin(phi)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const row = 3 * i + j
      const swapped = 3 * j + i

      u.re[row * 9 + row] = (u.re[row * 9 + row] ?? 0) + (1 + c) / 2
      u.im[row * 9 + row] = (u.im[row * 9 + row] ?? 0) + s / 2
      u.re[row * 9 + swapped] = (u.re[row * 9 + swapped] ?? 0) + (1 - c) / 2
      u.im[row * 9 + swapped] = (u.im[row * 9 + swapped] ?? 0) - s / 2
    }
  }

  return u
}

function sumGate(): Operator {
  const u = operator(9)

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      u.re[(3 * a + ((a + b) % 3)) * 9 + (3 * a + b)] = 1
    }
  }

  return u
}

function fourier(): Operator {
  const u = operator(3)

  for (let j = 0; j < 3; j++) {
    for (let k = 0; k < 3; k++) {
      u.re[j * 3 + k] = Math.cos(OMEGA * j * k) / Math.sqrt(3)
      u.im[j * 3 + k] = Math.sin(OMEGA * j * k) / Math.sqrt(3)
    }
  }

  return u
}

// the qutrit phase gate diag(1, 1, omega)
function phaseGate(): Operator {
  const u = identityOperator(3)

  u.re[8] = Math.cos(OMEGA)
  u.im[8] = Math.sin(OMEGA)

  return u
}

// trace of a b, complex
function traceProduct(a: Operator, b: Operator): [number, number] {
  let re = 0
  let im = 0

  for (let i = 0; i < a.n; i++) {
    for (let k = 0; k < a.n; k++) {
      const ar = a.re[i * a.n + k] ?? 0
      const ai = a.im[i * a.n + k] ?? 0
      const br = b.re[k * a.n + i] ?? 0
      const bi = b.im[k * a.n + i] ?? 0

      re += ar * br - ai * bi
      im += ar * bi + ai * br
    }
  }

  return [re, im]
}

// K(x, y) = Tr(A(x) U A(y) U^dagger) / 9, real for a unitary
function kernel(u: Operator, points: readonly Operator[]): number[][] {
  const ud = adjointOperator(u)
  const moved = points.map(a => multiplyOperators(multiplyOperators(u, a), ud))

  return points.map(ax => moved.map(m => traceProduct(ax, m)[0] / 9))
}

// the smallest power of two up to 2^limit that makes every entry whole, or -1
function dyadicPower(k: number[][], limit: number): number {
  for (let p = 0; p <= limit; p++) {
    const scale = 2 ** p

    if (k.every(row => row.every(x => Math.abs(scale * x - Math.round(scale * x)) < 1e-9))) {
      return p
    }
  }

  return -1
}

// one exact beat: n' = K n with K in quarters, or null when some n' is not whole
function beat(k4: number[][], n: number[]): number[] | null {
  const out: number[] = []

  for (let x = 0; x < k4.length; x++) {
    let m = 0

    for (let y = 0; y < n.length; y++) {
      m += (k4[x]?.[y] ?? 0) * (n[y] ?? 0)
    }

    if (m % 4 !== 0) {
      return null
    }

    out.push(m / 4)
  }

  return out
}

// real symmetric eigenvectors by cyclic Jacobi, columns of the returned matrix
function jacobi(a: number[][]): { values: number[]; vectors: number[][] } {
  const n = a.length
  const m = a.map(row => [...row])
  const v: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)))

  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += (m[p]?.[q] ?? 0) ** 2
      }
    }

    if (off < 1e-26) {
      break
    }

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = m[p]?.[q] ?? 0

        if (Math.abs(apq) < 1e-30) {
          continue
        }

        const theta = ((m[q]?.[q] ?? 0) - (m[p]?.[p] ?? 0)) / (2 * apq)
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let k = 0; k < n; k++) {
          const mkp = m[k]?.[p] ?? 0
          const mkq = m[k]?.[q] ?? 0

          m[k]![p] = c * mkp - s * mkq
          m[k]![q] = s * mkp + c * mkq
        }

        for (let k = 0; k < n; k++) {
          const mpk = m[p]?.[k] ?? 0
          const mqk = m[q]?.[k] ?? 0

          m[p]![k] = c * mpk - s * mqk
          m[q]![k] = s * mpk + c * mqk
        }

        for (let k = 0; k < n; k++) {
          const vkp = v[k]?.[p] ?? 0
          const vkq = v[k]?.[q] ?? 0

          v[k]![p] = c * vkp - s * vkq
          v[k]![q] = s * vkp + c * vkq
        }
      }
    }
  }

  return { values: m.map((row, i) => row[i] ?? 0), vectors: v }
}

// eigenphases and the Hermitian generator H of a unitary w, w = exp(i H), through a generic Hermitian
// combination of its commuting parts, diagonalized as a real symmetric matrix of twice the size
function generator(w: Operator): { phases: number[]; h: Operator } {
  const n = w.n
  const wd = adjointOperator(w)
  const x = operator(n)
  const y = operator(n)

  for (let i = 0; i < n * n; i++) {
    x.re[i] = ((w.re[i] ?? 0) + (wd.re[i] ?? 0)) / 2
    x.im[i] = ((w.im[i] ?? 0) + (wd.im[i] ?? 0)) / 2
    // (w - w^dagger) / 2i
    y.re[i] = ((w.im[i] ?? 0) - (wd.im[i] ?? 0)) / 2
    y.im[i] = -((w.re[i] ?? 0) - (wd.re[i] ?? 0)) / 2
  }

  const z = Array.from({ length: 2 * n }, () => new Array<number>(2 * n).fill(0))
  const MIX = 0.371

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const re = (x.re[i * n + j] ?? 0) + MIX * (y.re[i * n + j] ?? 0)
      const im = (x.im[i * n + j] ?? 0) + MIX * (y.im[i * n + j] ?? 0)

      z[i]![j] = re
      z[i + n]![j + n] = re
      z[i]![j + n] = -im
      z[i + n]![j] = im
    }
  }

  const { vectors } = jacobi(z)
  const h = operator(n)
  const phases: number[] = []
  const used: number[][] = []

  // each complex eigenvector appears twice in the doubled real form, as (a, b) and (-b, a): keep one of each
  for (let col = 0; col < 2 * n && used.length < n; col++) {
    const re = Array.from({ length: n }, (_, i) => vectors[i]?.[col] ?? 0)
    const im = Array.from({ length: n }, (_, i) => vectors[i + n]?.[col] ?? 0)
    const overlap = used.reduce((acc, u) => {
      let r = 0
      let m = 0

      for (let i = 0; i < n; i++) {
        r += (u[i] ?? 0) * (re[i] ?? 0) + (u[i + n] ?? 0) * (im[i] ?? 0)
        m += (u[i] ?? 0) * (im[i] ?? 0) - (u[i + n] ?? 0) * (re[i] ?? 0)
      }

      return acc + r * r + m * m
    }, 0)

    if (overlap > 0.5) {
      continue
    }

    used.push([...re, ...im])

    const expect = (a: Operator): number => {
      let total = 0

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const ar = a.re[i * n + j] ?? 0
          const ai = a.im[i * n + j] ?? 0
          // conj(v_i) a_ij v_j, real part
          const vr = (re[i] ?? 0) * (ar * (re[j] ?? 0) - ai * (im[j] ?? 0)) + (im[i] ?? 0) * (ar * (im[j] ?? 0) + ai * (re[j] ?? 0))

          total += vr
        }
      }

      return total
    }
    const phase = Math.atan2(expect(y), expect(x))

    phases.push(phase)

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // phase v v^dagger
        h.re[i * n + j] = (h.re[i * n + j] ?? 0) + phase * ((re[i] ?? 0) * (re[j] ?? 0) + (im[i] ?? 0) * (im[j] ?? 0))
        h.im[i * n + j] = (h.im[i * n + j] ?? 0) + phase * ((im[i] ?? 0) * (re[j] ?? 0) - (re[i] ?? 0) * (im[j] ?? 0))
      }
    }
  }

  return { phases, h }
}

// the rank of a set of Hermitian traceless matrices as real vectors, by Gram-Schmidt
class Span {
  private readonly basis: number[][] = []

  get rank(): number {
    return this.basis.length
  }

  add(a: Operator): boolean {
    const n = a.n
    let traceRe = 0

    for (let i = 0; i < n; i++) {
      traceRe += a.re[i * n + i] ?? 0
    }

    const v: number[] = []

    for (let i = 0; i < n * n; i++) {
      const diagonal = Math.floor(i / n) === i % n

      v.push((a.re[i] ?? 0) - (diagonal ? traceRe / n : 0), a.im[i] ?? 0)
    }

    for (const b of this.basis) {
      const dot = v.reduce((s, x, i) => s + x * (b[i] ?? 0), 0)

      for (let i = 0; i < v.length; i++) {
        v[i] = (v[i] ?? 0) - dot * (b[i] ?? 0)
      }
    }

    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0))

    if (norm < 1e-7) {
      return false
    }

    this.basis.push(v.map(x => x / norm))

    return true
  }
}

// i [a, b], Hermitian when a and b are
function bracket(a: Operator, b: Operator): Operator {
  const ab = multiplyOperators(a, b)
  const ba = multiplyOperators(b, a)
  const out = operator(a.n)

  for (let i = 0; i < a.n * a.n; i++) {
    const cr = (ab.re[i] ?? 0) - (ba.re[i] ?? 0)
    const ci = (ab.im[i] ?? 0) - (ba.im[i] ?? 0)

    out.re[i] = -ci
    out.im[i] = cr
  }

  return out
}

// is w a phase times the identity
function scalar(w: Operator, tolerance: number): boolean {
  const r0 = w.re[0] ?? 0
  const i0 = w.im[0] ?? 0

  for (let i = 0; i < w.n; i++) {
    for (let j = 0; j < w.n; j++) {
      const r = w.re[i * w.n + j] ?? 0
      const m = w.im[i * w.n + j] ?? 0

      if (i === j ? Math.hypot(r - r0, m - i0) > tolerance : Math.hypot(r, m) > tolerance) {
        return false
      }
    }
  }

  return true
}

export default experiment({
  id: 'gauge/fear-beat',
  code: 'E-FRC-0127',
  title:
    'the cube-root swap phase as a beat on whole loves and fears: an exact, reversible, charge-conserving integer step whose fears come from calm as pairs, exact for exactly as many steps as the whole has grain, and the gate set it completes checked universal, its closure containing SU(9)',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const points = phasePointOperators(2)
    const f = fourier()
    const identity3 = identityOperator(3)
    const classical = multiplyOperators(tensorOperators(f, identity3), sumGate())
    const round = multiplyOperators(classical, swapPhase(OMEGA))
    const k = kernel(round, points)
    const kBack = kernel(adjointOperator(round), points)
    const roundPower = dyadicPower(k, 20)
    const k4 = k.map(row => row.map(x => Math.round(4 * x)))
    const k4Back = kBack.map(row => row.map(x => Math.round(4 * x)))
    const start = gridWeights({ re: Array.from({ length: 9 }, (_, i) => (i === 0 ? 1 : 0)), im: new Array<number>(9).fill(0), points })

    // the exact run with N = 2,304 against the state vector
    const N = 2304
    let n = start.map(w => Math.round(N * w))
    let re: number[] = Array.from({ length: 9 }, (_, i) => (i === 0 ? 1 : 0))
    let im = new Array<number>(9).fill(0)
    let exact = true
    let chargeKept = true
    let matches = true
    let reverses = true
    let creations = 0
    let annihilations = 0
    const fears: number[] = []

    for (let r = 1; r <= 8; r++) {
      const next = beat(k4, n)

      if (!next) {
        exact = false
        break
      }

      const back = beat(k4Back, next)

      reverses = reverses && back !== null && back.every((x, i) => x === n[i])

      const fearBefore = n.filter(x => x < 0).reduce((a, b) => a - b, 0)
      const fearAfter = next.filter(x => x < 0).reduce((a, b) => a - b, 0)

      creations += Math.max(0, fearAfter - fearBefore)
      annihilations += Math.max(0, fearBefore - fearAfter)
      fears.push(fearAfter)
      n = next
      chargeKept = chargeKept && n.reduce((a, b) => a + b, 0) === N

      const moved = applyOperator(round, re, im)

      re = moved.re
      im = moved.im

      const weights = gridWeights({ re, im, points })

      matches = matches && weights.every((w, i) => Math.abs(w - (n[i] ?? 0) / N) < 1e-9)
    }

    // the grain bound: the first round each whole refuses
    const firstRefused = (units: number): number => {
      let m = start.map(w => Math.round(units * w))

      for (let r = 1; r <= 8; r++) {
        const next = beat(k4, m)

        if (!next) {
          return r
        }

        m = next
      }

      return 0
    }
    const refused576 = firstRefused(576)
    const refused9 = firstRefused(9)

    // the control: the swap phase at pi / 2
    const controlPower = dyadicPower(kernel(swapPhase(Math.PI / 2), points), 20)

    // universality. Not Clifford: the swap phase's own kernel is not a permutation
    const swapKernel = kernel(swapPhase(OMEGA), points)
    const isPermutation = swapKernel.every(row => row.filter(x => Math.abs(x) > 1e-9).length === 1 && row.some(x => Math.abs(x - 1) < 1e-9))
    const clifford = [
      tensorOperators(f, identity3),
      tensorOperators(identity3, f),
      tensorOperators(phaseGate(), identity3),
      tensorOperators(identity3, phaseGate()),
      sumGate(),
    ]
    // a product of the swap phase with Clifford gates, and its order
    const word = multiplyOperators(multiplyOperators(swapPhase(OMEGA), clifford[0]!), multiplyOperators(clifford[2]!, clifford[4]!))

    let power = identityOperator(9)
    let finiteOrder = 0

    for (let p = 1; p <= 20000 && finiteOrder === 0; p++) {
      power = multiplyOperators(power, word)
      finiteOrder = scalar(power, 1e-7) ? p : 0
    }

    const { phases, h } = generator(word)
    // eigenphases relative to the first, as fractions of a turn, rational with a small denominator?
    const rationalPhases = phases.every(phase => {
      const turn = (phase - (phases[0] ?? 0)) / (2 * Math.PI)

      for (let q = 1; q <= 1000; q++) {
        if (Math.abs(q * turn - Math.round(q * turn)) < 1e-6) {
          return true
        }
      }

      return false
    })

    // the generator's span under conjugation by Clifford words, then brackets
    const span = new Span()
    const algebra: Operator[] = []
    const conjugates: Operator[] = [identityOperator(9)]

    for (let depth = 0; depth < 3; depth++) {
      const next: Operator[] = []

      for (const c of conjugates) {
        for (const g of clifford) {
          next.push(multiplyOperators(g, c))
        }
      }

      conjugates.push(...next)
    }

    for (const c of conjugates) {
      const moved = multiplyOperators(multiplyOperators(c, h), adjointOperator(c))

      if (span.add(moved)) {
        algebra.push(moved)
      }

      if (span.rank >= 80) {
        break
      }
    }

    for (let a = 0; a < algebra.length && span.rank < 80; a++) {
      for (let b = a + 1; b < algebra.length && span.rank < 80; b++) {
        const c = bracket(algebra[a]!, algebra[b]!)

        if (span.add(c)) {
          algebra.push(c)
        }
      }
    }

    const universal = !isPermutation && finiteOrder === 0 && !rationalPhases && span.rank === 80

    const ok =
      roundPower === 2 &&
      exact &&
      chargeKept &&
      matches &&
      reverses &&
      refused576 === 8 &&
      refused9 === 2 &&
      controlPower === -1 &&
      universal

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a round of the cube-root swap phase and classical moves has a kernel in quarters, so with a whole of 2,304 units every one of 8 beats is exact on integers, keeps love minus fear, reverses exactly, and matches the state vector, a whole of 576 refuses first at round 8 and of 9 at round 2, the swap phase at pi / 2 is not dyadic at any power to 2^20, and the gate set is universal: the swap phase is not Clifford, a product with Clifford gates has infinite order, and its generator spans all of su(9) under Clifford conjugation and brackets',
      metrics: {
        kernelDenominatorPowerOfTwo: roundPower,
        exactBeats: exact ? 8 : 0,
        chargeConserved: chargeKept ? 1 : 0,
        matchesStateVector: matches ? 1 : 0,
        reversesExactly: reverses ? 1 : 0,
        pairCreations: creations,
        pairAnnihilations: annihilations,
        fearsAfterRound8: fears[7] ?? Number.NaN,
        firstRefusedRoundWhole576: refused576,
        firstRefusedRoundWhole9: refused9,
        controlDyadicPower: controlPower,
        swapPhaseIsClifford: isPermutation ? 1 : 0,
        wordFiniteOrderUpTo20000: finiteOrder,
        eigenphasesRational: rationalPhases ? 1 : 0,
        liealgebraDimension: span.rank,
      },
      control: {
        wholeUnits: N,
        cliffordWords: conjugates.length,
      },
      notes:
        'L1, exact integers for the beat, floating point for the universality check (a power is scalar within 1e-7, a phase rational within 1e-6). The beat acts on the 81 points of two roles at one place: it is the step a local rule would perform where two roles meet, not yet a rule on the D4 lattice. The fears it needs come from calm as love-fear pairs, counted here. The span check uses the principal generator of one infinite-order product, and a closed Lie algebra of dimension 80 inside u(9) with trace removed is su(9).',
    })
  },
})
