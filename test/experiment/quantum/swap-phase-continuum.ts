// Does the cube-root swap phase supply the one non-classical element the continuum needs?
//
// E-FRC-0103 found the classical color group Sigma(648) stops getting finer at about the N_t = 4 spacing,
// and the note (what-the-base-needs, "How far the classical color group reaches") says why: Sigma(648) is
// a maximal finite subgroup of SU(3), so the next step is one non-classical element and then the group is
// dense. The fear weave (code/rule/fear-weave) has exactly one non-classical step, the swap phase at
// 2 pi / 3 where two roles meet, and every link value is an element of Sigma(648) acting on one role. So
// the gate set a lattice of roles actually has is
//
//   Sigma(648) on the first role, Sigma(648) on the second, and U = P_sym + omega P_anti,
//
// with no two-role Clifford (E-FRC-0127's check used SUM, which no link supplies). Measured here:
// 1. Sigma(648) built by closure from its published generators: 648 elements, every one classical on the
//    role grid, through 216 distinct grid moves, the link values of the vibe weave
// 2. the closure of that gate set: an infinite-order product (no power up to 20,000 is a phase times the
//    identity, eigenphases not rational with denominator up to 1,000), and the Lie algebra its generator
//    spans under conjugation by local Clifford words and brackets, all 80 dimensions of su(9) or not.
//    Control: the same set with the plain exchange (phi = pi) in place of the swap phase is a finite
//    group, closed at 93,312 elements up to phase, and its breadth-first ball stops there, while the
//    swap-phase ball passes it
// 3. how fine one swap phase makes the steps. Among all words (A1 x A2) U (B1 x B2) with the A and B in
//    Sigma(648), exhaustively (a trace identity reduces them to 216^3 cases): the smallest distance from
//    the identity, against the smallest step of the classical group, and the closest approach to the
//    qutrit T gate on the first role (T x 1, E-FRC-0121's continuum element), against the classical floor.
//    The distance is d(V, W) = sqrt(1 - |Tr V^dagger W| / 9), blind to a global phase
// 4. what the finer step costs: the Wigner kernel of the best one-swap-phase word, its denominator (the
//    grain) and whether it has fears
//
// Gates, fixed before the run: 648 classical elements through 216 grid moves; the swap-phase set has an
// infinite-order word whose algebra is all 80 dimensions; the exchange control closes at 93,312; one swap
// phase gives a step smaller than the classical group's smallest step and a closer approach to T x 1 than
// any classical element, with a kernel in quarters that holds fears. The exchange control's one-swap words
// come no closer to T x 1 than sqrt(2 / 3).
//
// The first run failed the one-swap-phase gates, and the failure stands: one swap phase between classical
// words gives no step smaller than the classical group's (0.650115 both, equal to 1e-15) and comes no
// closer to T x 1 (0.716 against 0.395). Every one-swap word is at least as far from the local gates as
// the swap phase itself. Section 5 was added after that run, reported and not gated: words with TWO swap
// phases, W = U (G x H) V (E x F), V = U or U^dagger, enumerated exhaustively by a second trace identity.
//
// What this cannot show: that the dense closure is reached at the rate the lattice needs, or that the
// two-role words act on a LINK. A link carries one role's frame, a 3 x 3 element, and the step found here
// is a 9 x 9 word on two roles that approximates a one-role rotation. The closure containing SU(9) means it
// contains every one-role rotation too, but only as a limit.
//
// Depth L1: exact enumeration and linear algebra, floating point with stated tolerances.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { generateGroup, type Matrix3 } from '@/code/dynamics/finite-gauge'
import { QUTRIT_T, SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { phaseSpaceAction } from '@/code/measure/qutrit-phase-space'
import {
  adjointOperator,
  identityOperator,
  multiplyOperators,
  operator,
  tensorOperators,
  type Operator,
} from '@/code/measure/grid-weights'
import { quarterKernel, swapPhase, wignerKernel } from '@/code/rule/fear-weave'

const OMEGA = (2 * Math.PI) / 3
const CONTROL_ORDER = 93312

function fromMatrix3(m: Matrix3): Operator {
  const out = operator(3)

  for (let k = 0; k < 9; k++) {
    out.re[k] = m[2 * k] ?? 0
    out.im[k] = m[2 * k + 1] ?? 0
  }

  return out
}

// complex trace of a product of two 3 x 3 or 9 x 9 operators, Tr(a b)
function traceOf(a: Operator, b: Operator): [number, number] {
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

function trace(a: Operator): [number, number] {
  let re = 0
  let im = 0

  for (let i = 0; i < a.n; i++) {
    re += a.re[i * a.n + i] ?? 0
    im += a.im[i * a.n + i] ?? 0
  }

  return [re, im]
}

// a key for an operator up to a global phase: divide by the phase of its first entry of largest size
function phaseKey(a: Operator): string {
  let best = 0
  let at = 0

  for (let i = 0; i < a.n * a.n; i++) {
    const m = Math.hypot(a.re[i] ?? 0, a.im[i] ?? 0)

    if (m > best + 1e-6) {
      best = m
      at = i
    }
  }

  const angle = Math.atan2(a.im[at] ?? 0, a.re[at] ?? 0)
  const c = Math.cos(-angle)
  const s = Math.sin(-angle)
  const parts: number[] = []

  for (let i = 0; i < a.n * a.n; i++) {
    const r = (a.re[i] ?? 0) * c - (a.im[i] ?? 0) * s
    const m = (a.re[i] ?? 0) * s + (a.im[i] ?? 0) * c

    parts.push(Math.round(r * 1e5) || 0, Math.round(m * 1e5) || 0)
  }

  return parts.join(',')
}

// breadth-first ball sizes of the group the generators make, up to phase, stopping past a cap
function ballSizes(generators: readonly Operator[], radius: number, cap: number): number[] {
  const seen = new Set<string>([phaseKey(identityOperator(generators[0]?.n ?? 9))])
  let frontier: Operator[] = [identityOperator(generators[0]?.n ?? 9)]
  const sizes: number[] = [1]

  for (let r = 1; r <= radius && seen.size <= cap; r++) {
    const next: Operator[] = []

    for (const element of frontier) {
      for (const g of generators) {
        const candidate = multiplyOperators(element, g)
        const key = phaseKey(candidate)

        if (!seen.has(key)) {
          seen.add(key)
          next.push(candidate)
        }
      }

      if (seen.size > cap) {
        break
      }
    }

    frontier = next
    sizes.push(seen.size)

    if (next.length === 0) {
      break
    }
  }

  return sizes
}

// real symmetric eigenvectors by cyclic Jacobi (as in E-FRC-0127)
function jacobi(a: number[][]): number[][] {
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

  return v
}

// eigenphases and the Hermitian generator H of a unitary w = exp(i H), as in E-FRC-0127
function generator(w: Operator): { phases: number[]; h: Operator } {
  const n = w.n
  const wd = adjointOperator(w)
  const x = operator(n)
  const y = operator(n)

  for (let i = 0; i < n * n; i++) {
    x.re[i] = ((w.re[i] ?? 0) + (wd.re[i] ?? 0)) / 2
    x.im[i] = ((w.im[i] ?? 0) + (wd.im[i] ?? 0)) / 2
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

  const vectors = jacobi(z)
  const h = operator(n)
  const phases: number[] = []
  const used: number[][] = []

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

          total +=
            (re[i] ?? 0) * (ar * (re[j] ?? 0) - ai * (im[j] ?? 0)) +
            (im[i] ?? 0) * (ar * (im[j] ?? 0) + ai * (re[j] ?? 0))
        }
      }

      return total
    }
    const phase = Math.atan2(expect(y), expect(x))

    phases.push(phase)

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
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

// i [a, b]
function bracket(a: Operator, b: Operator): Operator {
  const ab = multiplyOperators(a, b)
  const ba = multiplyOperators(b, a)
  const out = operator(a.n)

  for (let i = 0; i < a.n * a.n; i++) {
    out.re[i] = -((ab.im[i] ?? 0) - (ba.im[i] ?? 0))
    out.im[i] = (ab.re[i] ?? 0) - (ba.re[i] ?? 0)
  }

  return out
}

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

// order up to a limit (0 when none), and whether the eigenphases are rational with a small denominator
function orderAndPhases(w: Operator): { order: number; rational: boolean; h: Operator } {
  let power = identityOperator(w.n)
  let order = 0

  for (let p = 1; p <= 20000 && order === 0; p++) {
    power = multiplyOperators(power, w)
    order = scalar(power, 1e-7) ? p : 0
  }

  const { phases, h } = generator(w)
  const rational = phases.every(phase => {
    const turn = (phase - (phases[0] ?? 0)) / (2 * Math.PI)

    for (let q = 1; q <= 1000; q++) {
      if (Math.abs(q * turn - Math.round(q * turn)) < 1e-6) {
        return true
      }
    }

    return false
  })

  return { order, rational, h }
}

export default experiment({
  id: 'quantum/swap-phase-continuum',
  code: 'E-QTM-0101',
  title:
    'the cube-root swap phase supplies the non-classical element the continuum floor needs: with only the link values a lattice of roles carries, Sigma(648) on each role, it generates a group whose Lie algebra is all of su(9), and a single swap phase already makes a step finer than the classical color group and a closer approach to the qutrit T gate than any classical element, at the price of one fear beat of grain',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    // 1. Sigma(648), classical on the grid through 216 grid moves
    const group = generateGroup({ generators: SU3_SUBGROUPS.sigma648.generators, limit: 4000 })
    const actions = group.matrices.map(m => phaseSpaceAction({ unitary: m }))
    const classical = actions.filter(a => a !== undefined).length
    const representatives = new Map<string, Operator>()

    actions.forEach((a, i) => {
      const key = (a ?? []).join(',')

      if (a && !representatives.has(key)) {
        representatives.set(key, fromMatrix3(group.matrices[i] ?? new Float64Array(18)))
      }
    })

    const clifford = [...representatives.values()]
    const one = identityOperator(3)
    const u = swapPhase(OMEGA)
    const exchange = swapPhase(Math.PI)
    const local = SU3_SUBGROUPS.sigma648.generators.map(fromMatrix3)
    const localTwo = [...local.map(g => tensorOperators(g, one)), ...local.map(g => tensorOperators(one, g))]

    // 2. an infinite-order word, and the algebra it spans
    const candidates = [
      multiplyOperators(u, localTwo[2] ?? u),
      multiplyOperators(multiplyOperators(u, localTwo[2] ?? u), localTwo[3] ?? u),
      multiplyOperators(multiplyOperators(u, localTwo[2] ?? u), multiplyOperators(localTwo[3] ?? u, localTwo[7] ?? u)),
    ]
    const studied = candidates.map(orderAndPhases)
    const chosen = studied.findIndex(s => s.order === 0 && !s.rational)
    const h = studied[chosen]?.h ?? operator(9)
    const span = new Span()
    const algebra: Operator[] = []
    const conjugates: Operator[] = [identityOperator(9)]

    for (let depth = 0; depth < 3; depth++) {
      const next: Operator[] = []

      for (const c of conjugates) {
        for (const g of [...localTwo, u]) {
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

    // the exchange control closes, the swap phase ball passes it
    const controlBall = ballSizes([...localTwo, exchange], 40, CONTROL_ORDER + 10)
    const swapBall = ballSizes([...localTwo, u], 40, CONTROL_ORDER + 10)

    // 3. one swap phase between classical words: exhaustively over P, Q, C in Sigma(648) mod center,
    // Tr(X^dagger (C x 1) U (C^-1 P x Q)) = a Tr(X^dagger P) Tr(Q) + b Tr(X^dagger C Q C^-1 P) for X = x x 1
    const a: [number, number] = [(1 + Math.cos(OMEGA)) / 2, Math.sin(OMEGA) / 2]
    const b: [number, number] = [(1 - Math.cos(OMEGA)) / 2, -Math.sin(OMEGA) / 2]
    const t = fromMatrix3(QUTRIT_T)
    const conjugated: { s: Operator; q: number }[] = []
    const seenConjugates = new Set<string>()

    clifford.forEach((q, qi) => {
      for (const c of clifford) {
        const s = multiplyOperators(multiplyOperators(c, q), adjointOperator(c))
        const key = `${qi}:${phaseKey(s)}`

        if (!seenConjugates.has(key)) {
          seenConjugates.add(key)
          conjugated.push({ s, q: qi })
        }
      }
    })

    const bestOver = (x: Operator, gain: [number, number], swapGain: [number, number]) => {
      const xd = adjointOperator(x)
      let best = 0
      let bestWord: [number, number, number] = [0, 0, 0]

      clifford.forEach((p, pi) => {
        const y = multiplyOperators(p, xd)
        const [tr, ti] = traceOf(xd, p)

        conjugated.forEach(({ s, q }, si) => {
          const [qr, qi] = trace(clifford[q] ?? one)
          const [sr, sm] = traceOf(s, y)
          // gain Tr(x^dagger P) Tr(Q) + swapGain Tr(x^dagger S P)
          const pr = tr * qr - ti * qi
          const pm = tr * qi + ti * qr
          const re = gain[0] * pr - gain[1] * pm + swapGain[0] * sr - swapGain[1] * sm
          const im = gain[0] * pm + gain[1] * pr + swapGain[0] * sm + swapGain[1] * sr
          const value = Math.hypot(re, im)

          if (value > best + 1e-12) {
            best = value
            bestWord = [pi, q, si]
          }
        })
      })

      return { distance: Math.sqrt(Math.max(0, 1 - best / 9)), word: bestWord }
    }

    // the classical floor: the smallest step of Sigma(648) x Sigma(648), and its closest approach to T x 1
    let smallestClassical = Number.POSITIVE_INFINITY
    let closestClassical = Number.POSITIVE_INFINITY

    for (const p of clifford) {
      const [pr, pm] = trace(p)
      const magnitude = Math.hypot(pr, pm)
      const [tr, tm] = traceOf(adjointOperator(t), p)

      // (P x Q) against 1: |Tr P| |Tr Q| / 9, the best Q being 1 unless P is 1
      if (magnitude < 3 - 1e-9) {
        smallestClassical = Math.min(smallestClassical, Math.sqrt(1 - (magnitude * 3) / 9))
      }

      closestClassical = Math.min(closestClassical, Math.sqrt(Math.max(0, 1 - (Math.hypot(tr, tm) * 3) / 9)))
    }

    const toIdentity = bestOver(one, a, b)
    const toT = bestOver(t, a, b)
    const toTExchange = bestOver(t, [0, 0], [1, 0])

    // 4. the kernel of the best word toward T x 1
    const [pi, qi, si] = toT.word
    const p = clifford[pi] ?? one
    const q = clifford[qi] ?? one
    const s = conjugated[si]?.s ?? one
    // rebuild a C with S = C Q C^-1
    const c = clifford.find(candidate => phaseKey(multiplyOperators(multiplyOperators(candidate, q), adjointOperator(candidate))) === phaseKey(s)) ?? one
    const word = multiplyOperators(
      multiplyOperators(tensorOperators(c, one), u),
      tensorOperators(multiplyOperators(adjointOperator(c), p), q),
    )
    const [wr, wm] = traceOf(adjointOperator(tensorOperators(t, one)), word)
    const wordDistance = Math.sqrt(Math.max(0, 1 - Math.hypot(wr, wm) / 9))
    const k4 = quarterKernel(word)
    const kernel = wignerKernel(word)
    const kernelFears = kernel.flat().filter(x => x < -1e-9).length
    const permutationKernel = kernel.every(row => row.filter(x => Math.abs(x) > 1e-9).length === 1)

    // 5. two swap phases, added after the first run: W = U (G x H) V (E x F) with V = U or U^dagger. With
    // X = G E, Y = H F, Z = G F (free, since G = 1, E = X, F = Z, H = Y Z^-1 realizes any triple),
    // Tr W = ac Tr X Tr Y + ad Tr(Z Y Z^-1 X) + bc Tr(X Y) + bd Tr(Y Z^-1 X) Tr Z, U = a + b SWAP,
    // V = c + d SWAP. Toward T x 1 the same identity holds with X = C T^dagger, C in Sigma(648), which
    // covers the words that begin with U: an upper bound on the two-swap-phase optimum
    const flat = (m: Operator): Float64Array => {
      const out = new Float64Array(18)

      for (let k = 0; k < 9; k++) {
        out[2 * k] = m.re[k] ?? 0
        out[2 * k + 1] = m.im[k] ?? 0
      }

      return out
    }
    const product = (x: Float64Array, y: Float64Array): Float64Array => {
      const out = new Float64Array(18)

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          let re = 0
          let im = 0

          for (let k = 0; k < 3; k++) {
            const ar = x[2 * (3 * i + k)] ?? 0
            const ai = x[2 * (3 * i + k) + 1] ?? 0
            const br = y[2 * (3 * k + j)] ?? 0
            const bi = y[2 * (3 * k + j) + 1] ?? 0

            re += ar * br - ai * bi
            im += ar * bi + ai * br
          }

          out[2 * (3 * i + j)] = re
          out[2 * (3 * i + j) + 1] = im
        }
      }

      return out
    }
    // Tr(x y) into out[0], out[1]
    const traceProduct = (x: Float64Array, y: Float64Array, out: Float64Array, at: number): void => {
      let re = 0
      let im = 0

      for (let i = 0; i < 3; i++) {
        for (let k = 0; k < 3; k++) {
          const ar = x[2 * (3 * i + k)] ?? 0
          const ai = x[2 * (3 * i + k) + 1] ?? 0
          const br = y[2 * (3 * k + i)] ?? 0
          const bi = y[2 * (3 * k + i) + 1] ?? 0

          re += ar * br - ai * bi
          im += ar * bi + ai * br
        }
      }

      out[at] = re
      out[at + 1] = im
    }
    const cl = clifford.map(flat)
    const clInverse = clifford.map(m => flat(adjointOperator(m)))
    const traceFlat = (m: Float64Array): [number, number] => [(m[0] ?? 0) + (m[8] ?? 0) + (m[16] ?? 0), (m[1] ?? 0) + (m[9] ?? 0) + (m[17] ?? 0)]
    const pairs: { a: Float64Array; b: Float64Array; y: number; z: number; ty: [number, number]; tz: [number, number] }[] = []

    cl.forEach((y, yi) => {
      cl.forEach((z, zi) => {
        const yz = product(y, clInverse[zi] ?? y)

        pairs.push({ a: product(z, yz), b: yz, y: yi, z: zi, ty: traceFlat(y), tz: traceFlat(z) })
      })
    })

    const tDagger = flat(adjointOperator(t))
    const cplx = (x: [number, number], y: [number, number]): [number, number] => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
    const conj = (x: [number, number]): [number, number] => [x[0], -x[1]]
    const twoSwap = (xs: readonly Float64Array[]) => {
      let smallest = Number.POSITIVE_INFINITY
      let closest = Number.POSITIVE_INFINITY
      let closestWord: [number, number, number, number] = [0, 0, 0, 1]
      let smallestWord: [number, number, number, number] = [0, 0, 0, 1]
      const traces = new Float64Array(6)

      xs.forEach((x, xi) => {
        const tx = traceFlat(x)

        for (const p of pairs) {
          traceProduct(p.a, x, traces, 0)
          traceProduct(p.b, x, traces, 2)
          traceProduct(x, cl[p.y] ?? x, traces, 4)

          const t1 = cplx(tx, p.ty)
          const t2: [number, number] = [traces[0] ?? 0, traces[1] ?? 0]
          const t3: [number, number] = [traces[4] ?? 0, traces[5] ?? 0]
          const t4 = cplx([traces[2] ?? 0, traces[3] ?? 0], p.tz)

          for (const sign of [1, -1]) {
            const c = sign === 1 ? a : conj(a)
            const d = sign === 1 ? b : conj(b)
            const sum = [cplx(cplx(a, c), t1), cplx(cplx(a, d), t2), cplx(cplx(b, c), t3), cplx(cplx(b, d), t4)].reduce(
              (acc, v) => [acc[0] + v[0], acc[1] + v[1]] as [number, number],
              [0, 0] as [number, number],
            )
            const distance = Math.sqrt(Math.max(0, 1 - Math.hypot(sum[0], sum[1]) / 9))

            if (distance > 1e-6 && distance < smallest - 1e-12) {
              smallest = distance
              smallestWord = [xi, p.y, p.z, sign]
            }

            if (distance < closest) {
              closest = distance
              closestWord = [xi, p.y, p.z, sign]
            }
          }
        }
      })

      return { smallest, closest, closestWord, smallestWord }
    }

    // a two-swap-phase word W = U (1 x Y Z^-1) V (X' x Z) from its indices, X' = the Clifford in X
    const rebuild = ([xi, yi, zi, sign]: readonly [number, number, number, number]): Operator => {
      const zOp = clifford[zi] ?? one
      const hOp = multiplyOperators(clifford[yi] ?? one, adjointOperator(zOp))
      const second = sign === 1 ? u : adjointOperator(u)

      return multiplyOperators(multiplyOperators(u, tensorOperators(one, hOp)), multiplyOperators(second, tensorOperators(clifford[xi] ?? one, zOp)))
    }

    const twoToIdentity = twoSwap(cl)
    const twoToT = twoSwap(cl.map(c => product(c, tDagger)))
    // rebuild the best two-swap-phase word toward T x 1 and measure it again: G = 1, E = C, F = Z, H = Y Z^-1
    const twoWord = rebuild(twoToT.closestWord)
    const [tr2, ti2] = traceOf(adjointOperator(tensorOperators(t, one)), twoWord)
    const stepWord = rebuild(twoToIdentity.smallestWord)
    const [trs, tis] = trace(stepWord)
    const stepWordDistance = Math.sqrt(Math.max(0, 1 - Math.hypot(trs, tis) / 9))
    const stepKernel = wignerKernel(stepWord)
    const stepKernelFears = stepKernel.flat().filter(x => x < -1e-9).length
    const stepKernelSixteenths = stepKernel.every(row => row.every(x => Math.abs(16 * x - Math.round(16 * x)) < 1e-9))
    const stepKernelQuarters = stepKernel.every(row => row.every(x => Math.abs(4 * x - Math.round(4 * x)) < 1e-9))
    const twoWordDistance = Math.sqrt(Math.max(0, 1 - Math.hypot(tr2, ti2) / 9))
    const twoKernel = wignerKernel(twoWord)
    const twoKernelSixteenths = twoKernel.every(row => row.every(x => Math.abs(16 * x - Math.round(16 * x)) < 1e-9))
    const twoKernelQuarters = twoKernel.every(row => row.every(x => Math.abs(4 * x - Math.round(4 * x)) < 1e-9))
    const twoKernelFears = twoKernel.flat().filter(x => x < -1e-9).length

    const universal = chosen >= 0 && span.rank === 80
    const ok =
      group.order === 648 &&
      classical === 648 &&
      clifford.length === 216 &&
      universal &&
      (controlBall[controlBall.length - 1] ?? 0) === CONTROL_ORDER &&
      (swapBall[swapBall.length - 1] ?? 0) > CONTROL_ORDER &&
      toIdentity.distance < smallestClassical &&
      toT.distance < closestClassical &&
      Math.abs(wordDistance - toT.distance) < 1e-9 &&
      k4 !== null &&
      kernelFears > 0 &&
      !permutationKernel &&
      toTExchange.distance >= Math.sqrt(2 / 3) - 1e-9

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'Sigma(648) is 648 classical elements through 216 grid moves; with it on each role, the cube-root swap phase generates a group with an infinite-order element whose Lie algebra is all 80 dimensions of su(9), while the plain exchange closes at 93,312 elements; one swap phase between classical words gives a step smaller than the classical group smallest step and comes closer to T on one role than any classical element, and that word has a kernel in quarters with fears, while one exchange comes no closer than sqrt(2/3)',
      metrics: {
        sigma648Order: group.order,
        classicalElements: classical,
        distinctGridMoves: clifford.length,
        infiniteOrderWordFound: chosen >= 0 ? 1 : 0,
        wordOrderUpTo20000: studied[chosen]?.order ?? -1,
        lieAlgebraDimension: span.rank,
        swapPhaseBallAtCap: swapBall[swapBall.length - 1] ?? 0,
        swapPhaseBallRadius: swapBall.length - 1,
        smallestStepOneSwapPhase: toIdentity.distance,
        closestToTOneSwapPhase: toT.distance,
        bestWordKernelIsQuarters: k4 !== null ? 1 : 0,
        bestWordKernelNegativeEntries: kernelFears,
        smallestStepTwoSwapPhases: twoToIdentity.smallest,
        smallestStepTwoSwapPhasesRebuilt: stepWordDistance,
        stepWordKernelInSixteenths: stepKernelSixteenths ? 1 : 0,
        stepWordKernelInQuarters: stepKernelQuarters ? 1 : 0,
        stepWordKernelNegativeEntries: stepKernelFears,
        closestToTTwoSwapPhasesBound: twoToT.closest,
        closestToTTwoSwapPhasesRebuilt: twoWordDistance,
        twoSwapWordKernelInSixteenths: twoKernelSixteenths ? 1 : 0,
        twoSwapWordKernelInQuarters: twoKernelQuarters ? 1 : 0,
        twoSwapWordKernelNegativeEntries: twoKernelFears,
      },
      control: {
        smallestStepClassical: smallestClassical,
        closestToTClassical: closestClassical,
        exchangeGroupOrder: controlBall[controlBall.length - 1] ?? 0,
        exchangeGroupRadius: controlBall.length - 1,
        closestToTOneExchange: toTExchange.distance,
        conjugatePairs: conjugated.length,
      },
      notes:
        'L1. The one-swap-phase words are enumerated exhaustively with the trace identity Tr(X^dagger (A1 x A2) U (B1 x B2)) = a Tr(x^dagger A1 B1) Tr(A2 B2) + b Tr(x^dagger A1 B2 A2 B1), U = a + b SWAP, and A2 = 1 without loss, so the cases are P = A1 B1, Q = A2 B2 and the conjugates C Q C^-1. The best word toward T x 1 is rebuilt as a 9 x 9 matrix and its distance recomputed as a second method. Group elements are compared up to phase at 1e-5. The Lie algebra is spanned by the principal generator of one infinite-order word under conjugation and brackets, as in E-FRC-0127, whose caveat carries over: the principal logarithm lies in the closure algebra when the eigenphases carry no rational relation with a nonzero turn, which the rationality test makes likely but does not prove. A link holds one role frame: the finer steps here are two-role words that approximate one-role rotations, not new link values.',
    })
  },
})
