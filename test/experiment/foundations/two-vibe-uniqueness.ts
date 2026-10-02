// DO THE HARD CONSTRAINTS LEAVE ONE RULE? THE TWO-VIBE DOCK (E-FND-0172, OPEN-FND-01, route "uniqueness under the hard
// constraints"). E-SPN-0094 enumerated every covariant reversible map of ONE vibe on a dock with coefficients in the
// rule's ring Z[w][1/2]: 216, a finite list, with the Grover frame mixer G singled out. The route asks whether the same
// enumeration over the whole dock (W(F4) covariance, reversibility, integers, Eisenstein coefficients) leaves one rule
// or a short list. The whole dock has 3^24 states; this file takes the next grade, two vibes on one dock, where the
// meetings and the contact act, and asks whether the covariant ring unitaries there are finitely many.
//
// THE SPACES. Two vibes on distinct slots of one dock, three sectors that charge keeps apart: LIKE (two loves, or two
// fears, by C), unordered slot pairs {a, b}, 276 states, with the fermion sign (signed: a permutation that reverses a
// < b contributes -1) and without it; and LOVE-FEAR, ordered pairs (a, b), love at a and fear at b, 552 states. W(F4)
// (1,152 elements, code/measure/covariant-coin weylF4) acts by permuting slots.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE COMMUTANT IS NOT MULTIPLICITY-FREE. On one vibe the commutant is the 5-dimensional commutative association
//    scheme (E-SPN-0094): five eigenspaces, each irreducible piece once, so a covariant unitary is a point on a 5-torus
//    and the ring cuts that to finitely many. On two vibes an irreducible piece of W(F4) occurs m > 1 times, the
//    commutant is a sum of full matrix algebras Mat_m, and the covariant unitaries contain U(m) for each such piece: a
//    continuous family over C.
// 2. THE RING DOES NOT CUT A U(m) TO FINITELY MANY. Products of covariant ring unitaries are covariant ring unitaries.
//    Two natural ones are the second-quantized lift of G (G on each vibe, antisymmetrized in the like sector; entries in
//    Z[1/2]) and a contact phase (the unit w on every pair at one inner product, E-SPN-0092's units, diagonal and
//    covariant). They do not commute, and their product W need not have finite order.
// 3. THE TEST IS EXACT AND NEEDS NO EIGENVALUES. If W has finite order its eigenvalues are roots of unity, so tr(W^k)
//    is a sum of roots of unity, an algebraic integer of Q(w), which is in Z[w]. So tr(W^k) outside Z[w] for one k
//    proves an eigenvalue that is not a root of unity: W has infinite order, its powers are infinitely many distinct
//    covariant ring unitaries, and no enumeration under these constraints can end in a finite list.
//
// PROBES BEFORE THE GATES, DISCLOSED (tmp/tb-probe1.ts, tmp/tb-probe2.ts, floats, 17 s and 2 s). The commutant
//  dimensions equal Burnside's counts: like unsigned 152 (14 irreducible pieces, 40 distinct eigenvalues of a generic
//  symmetric element), like signed 122 (13, 36), love-fear 488 (17, 76). The word W = lift(G) . D, D the phase w on the
//  pairs at inner -2 (a full line), read in floats: like signed tr(W) 144 + 6w, tr(W^2) 252 + 15w, tr(W^3) 136.5 - 27w;
//  love-fear tr(W) 297 + 13.5w. So P1 below was seen at float precision before the gate run, which makes it exact.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: W(F4) has 1,152 elements; in every sector the number of orbitals that survive the sign equals
//     Burnside's (1/|G|) sum chi(g)^2; the lifted G and each word W used are exactly covariant (commute with all 1,152
//     elements, exact integers) and exactly unitary (W W^dag = I, exact), every entry in Z[w][1/2].
//  C1 CONTROL (the test can say "finite"): the lifted G alone is an involution and every trace of its powers k = 1 to
//     4 lies in Z[w], in every sector; the contact phase D alone has order 3 with traces in Z[w]; and on ONE vibe
//     all 216 ring unitaries of E-SPN-0094 have tr(U^k) in Z[w] for k = 1 to 6.
//  H1 THE ROUTE: the covariant ring unitaries of the two-vibe dock are finitely many (every word read has traces in
//     Z[w] for k = 1 to 4).
//  P1 THE FALSIFIER (points 2, 3): in the like signed sector tr(W^k) leaves Z[w] for some k <= 4, W = lift(G) . D with
//     the contact phase on full lines; and in the love-fear sector tr(W) leaves Z[w].
// VERDICT, fixed before the run: FAIL (as derived) when I1, C1 and P1 hold: the hard constraints leave an infinite
//  family at two vibes, so "one rule" stays decision 4; PASS when I1, C1 and H1 hold; PARTIAL otherwise.
// READ, gating nothing: per sector the number of diagonal orbitals d (so 6^d covariant diagonal ring unitaries, the
//  contact phases), the covariant permutation matrices (the classical two-vibe rules: 0/1 orbital sums with one 1 in
//  every row and column), and the first k at which each word's trace leaves Z[w].
// WHAT THIS CAN AND CANNOT SHOW. It shows the constraints as the route names them do not make a finite list at two
//  vibes, so they cannot single out one rule over the whole dock. It does not rank rules, and it does not say which
//  extra condition (least denominator, an involution, a permutation, locality in the vibe count) would.
//
// FIRST RUN 2026-10-02 (tmp/tb-fnd-run1.log, 2 s): PARTIAL, every gate as registered, none moved or rerun. I1 and C1
//  fail, on a defect of point 2 found by the run: the lift of G is unitary only in the LIKE SIGNED sector. In the
//  unsigned like sector and the love-fear sector one-body G can send both vibes to ONE slot, a state the model does not
//  have (a slot holds one trit), so the lift restricted to distinct slots is not unitary there (W W^dag != I, lift(G)
//  squared != I, its traces (321)/2, (621)/2 off Z[w]), and P1's love-fear clause (tr(W) = (594 + 27w)/2) reads a
//  map that is not reversible. A probe after the run (tmp/tb-probe3.ts) separates the sectors: in the like signed
//  sector, the fermions the rule has, every instrument check holds (lift(G), D and W covariant on all 1,152 elements,
//  lift(G) and W unitary, lift(G)^2 = I, D^3 = I, tr D = 264 + 12w) and so does C1 (lift(G) traces 150, 276, 150, 276),
//  and W = lift(G) D has traces 144 + 6w, 252 + 15w, then (273 - 54w)/2 at k = 3, outside Z[w]. So on the physical
//  sector W has an eigenvalue that is not a root of unity, and the covariant reversible two-fermion dock rules with
//  Eisenstein coefficients are infinitely many. One vibe's 216 ring unitaries all keep integral traces to k = 6.
//  Commutant dimensions equal Burnside's: 152, 122, 488; 4 diagonal orbitals in every sector (the inner products of
//  the two slots, 1, 0, -1, -2), so 6^4 contact phases; no single orbital is a positive permutation pattern. A
//  correct love-fear test needs a map that keeps the two species off one slot, not the free lift, and is not run.
//
// Depth L1: exhaustive exact algebra (integer and Eisenstein matrices, 1,152 group elements).
// DETERMINISM: fixed group, fixed words; no start, no random number.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { weylF4 } from '@/code/measure/covariant-coin'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { ringMatrix, ringUnitaries } from '@/code/measure/line-mixing'

// an element (a + b w) / 2^p of Z[w][1/2], as integer coordinates of a matrix scaled by a common 2^p
type EisMatrix = {
  n: number
  a: Float64Array
  b: Float64Array
  p: number
}

const ROOTS = rootsD4()
const inner = (x: number, y: number): number =>
  ROOTS[x]!.reduce((s, v, i) => s + v * ROOTS[y]![i]!, 0)

// 4 G, G = (3/4) I - (1/4) R - (1/4) A0, the Grover frame mixer (E-SPN-0094)
const G4 = (c: number, a: number): number => {
  const t = inner(c, a)

  return t === 2 ? 3 : t === 0 || t === -2 ? -1 : 0
}

type Sector = {
  name: string
  states: [number, number][]
  like: boolean
  signed: boolean
}

function sectorOf(
  kind: 'like-unsigned' | 'like-signed' | 'love-fear',
): Sector {
  const states: [number, number][] = []
  const like = kind !== 'love-fear'

  for (let a = 0; a < 24; a++) {
    for (let b = 0; b < 24; b++) {
      if (like ? a < b : a !== b) {
        states.push([a, b])
      }
    }
  }

  return { name: kind, states, like, signed: kind === 'like-signed' }
}

// the slot permutation g on a sector's states: image index and sign
function action(
  s: Sector,
  g: readonly number[],
): { image: Int32Array; sign: Int8Array } {
  const index = new Map(s.states.map((x, i) => [`${x[0]},${x[1]}`, i]))
  const image = new Int32Array(s.states.length)
  const sign = new Int8Array(s.states.length)

  s.states.forEach(([a, b], i) => {
    let x = g[a]!
    let y = g[b]!
    let v = 1

    if (s.like && x > y) {
      ;[x, y] = [y, x]
      v = s.signed ? -1 : 1
    }

    image[i] = index.get(`${x},${y}`)!
    sign[i] = v
  })

  return { image, sign }
}

const exact = (x: number): number => {
  if (!Number.isSafeInteger(x)) {
    throw new Error(`lost exactness at ${x}`)
  }

  return x
}

// (x + y w)(u + v w) = (xu - yv) + (xv + yu - yv) w, since w^2 = -1 - w
function multiply(X: EisMatrix, Y: EisMatrix): EisMatrix {
  const n = X.n
  const a = new Float64Array(n * n)
  const b = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let l = 0; l < n; l++) {
      const x = X.a[i * n + l]!
      const y = X.b[i * n + l]!

      if (x === 0 && y === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        const u = Y.a[l * n + j]!
        const v = Y.b[l * n + j]!

        if (u === 0 && v === 0) {
          continue
        }

        a[i * n + j] = a[i * n + j]! + x * u - y * v
        b[i * n + j] = b[i * n + j]! + x * v + y * u - y * v
      }
    }
  }

  for (let i = 0; i < n * n; i++) {
    exact(a[i]!)
    exact(b[i]!)
  }

  return { n, a, b, p: X.p + Y.p }
}

// conj(x + y w) = (x - y) - y w
function adjoint(X: EisMatrix): EisMatrix {
  const n = X.n
  const a = new Float64Array(n * n)
  const b = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = X.a[j * n + i]!
      const y = X.b[j * n + i]!

      a[i * n + j] = x - y
      b[i * n + j] = -y
    }
  }

  return { n, a, b, p: X.p }
}

// the trace as (A + B w) / 2^p, reduced: in Z[w] when the reduced p is 0
function trace(X: EisMatrix): { A: bigint; B: bigint; p: number } {
  let A = 0n
  let B = 0n

  for (let i = 0; i < X.n; i++) {
    A += BigInt(X.a[i * X.n + i]!)
    B += BigInt(X.b[i * X.n + i]!)
  }

  let p = X.p

  while (p > 0 && A % 2n === 0n && B % 2n === 0n) {
    A /= 2n
    B /= 2n
    p--
  }

  return { A, B, p }
}

const traceText = (t: { A: bigint; B: bigint; p: number }): string =>
  `(${t.A} + ${t.B}w)/2^${t.p}`

function isIdentity(X: EisMatrix): boolean {
  const one = 2 ** X.p

  for (let i = 0; i < X.n; i++) {
    for (let j = 0; j < X.n; j++) {
      if (
        X.a[i * X.n + j] !== (i === j ? one : 0) ||
        X.b[i * X.n + j] !== 0
      ) {
        return false
      }
    }
  }

  return true
}

// covariance: X commutes with every group element, exactly (permutation with sign)
function covariant(
  X: EisMatrix,
  actions: readonly { image: Int32Array; sign: Int8Array }[],
): boolean {
  const n = X.n

  for (const { image, sign } of actions) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const s = sign[i]! * sign[j]!
        const at = image[i]! * n + image[j]!

        if (
          X.a[at] !== s * X.a[i * n + j]! ||
          X.b[at] !== s * X.b[i * n + j]!
        ) {
          return false
        }
      }
    }
  }

  return true
}

// the lift of G to the sector, scaled by 16
function liftG(s: Sector): EisMatrix {
  const n = s.states.length
  const a = new Float64Array(n * n)

  s.states.forEach(([c, d], i) =>
    s.states.forEach(([x, y], j) => {
      a[i * n + j] = s.like
        ? G4(c, x) * G4(d, y) -
          (s.signed ? 1 : -1) * G4(d, x) * G4(c, y)
        : G4(c, x) * G4(d, y)
    }),
  )

  return { n, a, b: new Float64Array(n * n), p: 4 }
}

// the contact phase: w on every pair at the given inner product, 1 elsewhere
function contact(s: Sector, at: number): EisMatrix {
  const n = s.states.length
  const a = new Float64Array(n * n)
  const b = new Float64Array(n * n)

  s.states.forEach(([x, y], i) => {
    if (inner(x, y) === at) {
      b[i * n + i] = 1
    } else {
      a[i * n + i] = 1
    }
  })

  return { n, a, b, p: 0 }
}

// orbitals that survive the sign, diagonal orbitals, Burnside's count, and the covariant permutation matrices
function orbitals(
  s: Sector,
  actions: readonly { image: Int32Array; sign: Int8Array }[],
): {
  count: number
  diagonal: number
  burnside: number
  permutations: number
} {
  const n = s.states.length
  const seen = new Int32Array(n * n).fill(-1)
  const alive: boolean[] = []
  const isDiagonal: boolean[] = []

  let burnside = 0

  for (const { image, sign } of actions) {
    let chi = 0

    for (let i = 0; i < n; i++) {
      if (image[i] === i) {
        chi += sign[i]!
      }
    }

    burnside += chi * chi
  }

  burnside /= actions.length

  const value = new Int8Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (seen[i * n + j]! >= 0) {
        continue
      }

      const id = alive.length

      let ok = true

      for (const { image, sign } of actions) {
        const at = image[i]! * n + image[j]!
        const v = sign[i]! * sign[j]!

        if (seen[at] === id && value[at] !== v) {
          ok = false
        }

        seen[at] = id
        value[at] = v
      }

      alive.push(ok)
      isDiagonal.push(i === j)
    }
  }

  const count = alive.filter(Boolean).length
  const diagonal = alive.filter((v, k) => v && isDiagonal[k]).length

  // covariant permutations: a set of alive orbitals covering each row exactly once, positive signs only; search over
  // the orbitals of row 0 that are permutations themselves or combine, by exhaustive subsets of the row-0 orbitals
  const rowOrbitals = new Map<number, number[]>()

  for (let j = 0; j < n; j++) {
    const id = seen[j]!

    if (alive[id]) {
      rowOrbitals.set(id, [...(rowOrbitals.get(id) ?? []), j])
    }
  }

  const ids = [...rowOrbitals.keys()].filter(
    id => rowOrbitals.get(id)!.length === 1,
  )

  let permutations = 0

  for (const id of ids) {
    // a single-entry row orbital: the orbital is a signed permutation pattern; count it when it has one entry in every
    // row and column and every sign +1
    const rows = new Int32Array(n)
    const cols = new Int32Array(n)

    let positive = true

    for (let x = 0; x < n * n; x++) {
      if (seen[x] === id) {
        rows[Math.floor(x / n)] = rows[Math.floor(x / n)]! + 1
        cols[x % n] = cols[x % n]! + 1

        if (value[x] !== 1) {
          positive = false
        }
      }
    }

    if (
      positive &&
      rows.every(r => r === 1) &&
      cols.every(c => c === 1)
    ) {
      permutations++
    }
  }

  return { count, diagonal, burnside, permutations }
}

export {
  action,
  adjoint,
  contact,
  covariant,
  isIdentity,
  liftG,
  multiply,
  sectorOf,
  trace,
}

export function twoVibeUniquenessRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const group = weylF4()
  const sectors = (
    ['like-unsigned', 'like-signed', 'love-fear'] as const
  ).map(sectorOf)
  const metrics: Record<string, number> = { groupOrder: group.length }
  const notes: string[] = []

  let i1 = group.length === 1152
  let c1 = true
  let p1 = true
  let h1 = true

  for (const s of sectors) {
    const actions = group.map(g => action(s, g))
    const orb = orbitals(s, actions)

    i1 &&= orb.count === orb.burnside
    metrics[`${s.name}_states`] = s.states.length
    metrics[`${s.name}_commutant`] = orb.count
    metrics[`${s.name}_burnside`] = orb.burnside
    metrics[`${s.name}_diagonalOrbitals`] = orb.diagonal
    metrics[`${s.name}_permutations`] = orb.permutations

    const lift = liftG(s)
    const D = contact(s, -2)
    const W = multiply(lift, D)
    const unitary = (X: EisMatrix): boolean =>
      isIdentity(multiply(X, adjoint(X)))

    i1 &&=
      covariant(lift, actions) &&
      covariant(D, actions) &&
      covariant(W, actions) &&
      unitary(lift) &&
      unitary(W)

    // C1: the lift alone and D alone
    let power = lift

    const liftTraces: string[] = []

    for (let k = 1; k <= 4; k++) {
      const t = trace(power)

      liftTraces.push(traceText(t))
      c1 &&= t.p === 0
      power = multiply(power, lift)
    }

    c1 &&= isIdentity(multiply(lift, lift))
    c1 &&= isIdentity(multiply(multiply(D, D), D)) && trace(D).p === 0

    // the word's traces
    const kMax = s.name === 'love-fear' ? 1 : 4
    const wordTraces: string[] = []

    let first = 0

    power = W

    for (let k = 1; k <= kMax; k++) {
      const t = trace(power)

      wordTraces.push(traceText(t))

      if (t.p > 0 && first === 0) {
        first = k
      }

      if (k < kMax) {
        power = multiply(power, W)
      }
    }

    metrics[`${s.name}_firstNonIntegralTrace`] = first

    if (s.name !== 'like-unsigned') {
      p1 &&= first > 0
      h1 &&= first === 0
    }

    notes.push(
      `${s.name}: ${s.states.length} states, commutant ${orb.count} (Burnside ${orb.burnside}), diagonal orbitals ${orb.diagonal}, covariant permutation orbitals ${orb.permutations}; lift(G) traces ${liftTraces.join(', ')}; W = lift(G) D traces ${wordTraces.join(', ')}`,
    )
    log(s.name)
  }

  // C1 on one vibe: all 216 ring unitaries of E-SPN-0094 have integral traces of their powers
  const one = ringUnitaries()

  let oneIntegral = true

  for (const u of one.unitaries) {
    const n = 24
    const m = ringMatrix(u.coefficients)
    const X: EisMatrix = {
      n,
      a: Float64Array.from(m.entries.flat().map(e => Number(e[0]))),
      b: Float64Array.from(m.entries.flat().map(e => Number(e[1]))),
      p: m.p,
    }

    let power = X

    for (let k = 1; k <= 6; k++) {
      oneIntegral &&= trace(power).p === 0
      power = multiply(power, X)
    }
  }

  c1 &&= oneIntegral && one.unitaries.length === 216
  metrics.oneVibeRingUnitaries = one.unitaries.length

  const status =
    i1 && c1 && p1 ? 'fail' : i1 && c1 && h1 ? 'pass' : 'partial'

  return verdict({
    status,
    claim: `${p1 ? 'the hard constraints do not leave one rule' : 'the two-vibe dock was enumerated'}: on two vibes of one dock the W(F4) commutant is not multiplicity-free (like signed ${metrics['like-signed_commutant']}, love-fear ${metrics['love-fear_commutant']} dimensions), and the product of two covariant ring unitaries, the lifted Grover mixer and the contact phase w on full lines, has a trace power outside Z[w] (like signed at k = ${metrics['like-signed_firstNonIntegralTrace']}, love-fear at k = ${metrics['love-fear_firstNonIntegralTrace']}), so it has an eigenvalue that is not a root of unity and its powers are infinitely many covariant reversible dock rules with Eisenstein coefficients; one vibe's 216 stay finite`,
    metrics: {
      gate_I1: i1 ? 1 : 0,
      gate_C1: c1 ? 1 : 0,
      gate_H1: h1 ? 1 : 0,
      gate_P1: p1 ? 1 : 0,
      ...metrics,
      seconds: (Date.now() - started) / 1000,
    },
    control: { oneVibeIntegral: oneIntegral ? 1 : 0 },
    notes: `L1. Gates I1 ${i1}, C1 ${c1}, H1 ${h1}, P1 ${p1}. ${notes.join('. ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'foundations/two-vibe-uniqueness',
  code: 'E-FND-0172',
  title:
    "do the hard constraints leave one rule? the two-vibe dock, partial (the lifted Grover mixer is unitary only on like fermions, so the instrument and control gates fail on the unsigned and love-fear sectors, a defect of the derivation), and on the physical sector the answer is no: on two like fermions of one dock the W(F4) commutant has dimension 122 (13 irreducible pieces, not multiplicity-free), and the product of the lifted Grover mixer and the contact phase w on full lines, both covariant ring unitaries, has tr(W^3) = (273 - 54w)/2 outside Z[w], so an eigenvalue that is not a root of unity: covariance, reversibility and Eisenstein coefficients admit infinitely many two-vibe dock rules, while one vibe's 216 stay finite; one rule stays decision 4",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return twoVibeUniquenessRun()
  },
})
