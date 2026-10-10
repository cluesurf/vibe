// 'T HOOFT ANOMALY MATCHING FOR A THREE-MEMBER COMPOSITE (E-FRC-0289, moving-matter item 0018, Key 3).
// The constituents are Weyl multiplets on one chiral face (E-FRC-0267's in-gap levels), the composites the three-member
// J = 1/2 multiplets a colour singlet allows (E-SPN-0192's census). This module holds the exact pieces:
//
//   memberWeights      one member's half + (the J = +1 half, where the face's light levels live, E-FRC-0268): the spin
//                      generator L(e_01) and the SU(2)+ generators R(e_0k) as integer 4 x 4 matrices, checked to be one
//                      spin doublet times one SU(2)+ doublet by exact traces, and the four joint weights (2 Jz, 2 T3)
//   faceConstituents   the face's Weyl multiplets: per tone, an SU(2)+ doublet of colour multiplicity 3, charge read by
//                      the vibe count of three-member-census holeCharge3 (never typed), member number 1, hand +1
//   compositeMultiplets the symmetric cube of the member labels (spin, isospin, tone) on half +, the content of a
//                      colour-singlet (epsilon) three-member state, split by 3Q into (2J, 2T) irreps by highest weight
//   traces             every coefficient, scaled to an integer: 27 Tr Q^3, 3 Tr Q, 9 Tr Q^2 N, 3 Tr Q N^2, Tr N^3, Tr N,
//                      12 Tr Q T3^2, 4 Tr N T3^2, and Witten's SU(2)+ parity (Dynkin index of isospin T mod 2,
//                      2T (2T + 1) (2T + 2) / 6: 1 for a doublet, 10 for a quartet)
//   searchMatches      every integer index assignment |l_k| <= bound over the composite multiplets that reproduces a
//                      target's coefficients for one symmetry set
//
// DETERMINISM: no random numbers. EXACT: integer matrices and integer-scaled traces, no float anywhere.

import { EVEN } from '@/code/measure/spinor-register'
import {
  evenBlade,
  rightMultiplication,
} from '@/code/measure/register-symmetry'
import {
  halfBasis,
  holeCharge3,
  onHalf,
  rotationGenerators,
} from '@/code/measure/three-member-census'

type Int = number[][]

const mul = (a: Int, b: Int): Int =>
  a.map(r =>
    b[0]!.map((_, j) => r.reduce((s, x, k) => s + x * b[k]![j]!, 0)),
  )

const trace = (a: Int): number => a.reduce((s, r, i) => s + r[i]!, 0)

const isScalar = (a: Int, c: number): boolean =>
  a.every((r, i) => r.every((x, j) => x === (i === j ? c : 0)))

const same = (a: Int, b: Int): boolean =>
  a.every((r, i) => r.every((x, j) => x === b[i]![j]!))

// ---- one member on half + ----

export type MemberWeights = {
  // A = L(e_01) and B_k = R(e_0k) on half +, all exact integer 4 x 4 with A^2 = B_k^2 = -1
  exact: boolean
  // [B_i, B_j] = +-2 B_k on half + (the SU(2)+ algebra)
  closes: boolean
  // A commutes with every B_k (spin is internal to SU(2)+, E-FRC-0268 H3)
  commutes: boolean
  // 4 T (T + 1) on half +, from - sum B_k^2: 3 is an isospin doublet
  isospinCasimir: number
  traceAB: number
  // multiplicity of each joint weight (2 Jz, 2 T3), from (4 - s t tr(A B)) / 4 with tr A = tr B = 0
  weights: { twoJz: number; twoT3: number; multiplicity: number }[]
}

export function memberWeights(): MemberWeights {
  const basis = halfBasis()
  const A = rotationGenerators('untwisted').gen[0]![0]!
  const Bs = [1, 2, 3].map(k => {
    const e = evenBlade(EVEN.findIndex(b => b.join(',') === `0,${k}`))

    return onHalf(rightMultiplication(e), basis, 0)
  })
  const exact =
    basis.eigenExact &&
    Bs.every(b => b !== null) &&
    isScalar(mul(A, A), -1) &&
    Bs.every(b => b !== null && isScalar(mul(b, b), -1))

  if (!exact) {
    return {
      exact,
      closes: false,
      commutes: false,
      isospinCasimir: Number.NaN,
      traceAB: Number.NaN,
      weights: [],
    }
  }

  const B = Bs as Int[]
  let closes = true

  for (const [i, j, k] of [
    [0, 1, 2],
    [1, 2, 0],
    [0, 2, 1],
  ] as const) {
    const c = mul(B[i]!, B[j]!).map((r, x) =>
      r.map((v, y) => v - mul(B[j]!, B[i]!)[x]![y]!),
    )
    const plus = same(c, B[k]!.map(r => r.map(v => 2 * v)))
    const minus = same(c, B[k]!.map(r => r.map(v => -2 * v)))

    closes = closes && (plus || minus)
  }

  const commutes = B.every(b => same(mul(A, b), mul(b, A)))
  // 4 T (T + 1) = - sum B_k^2 / (generator 2 T_k = i B_k): T_k = i B_k / 2, so 4 T^2 = - sum B_k^2
  const casimir = B.reduce(
    (s, b) => s.map((r, i) => r.map((v, j) => v - mul(b, b)[i]![j]!)),
    A.map(r => r.map(() => 0)),
  )
  const isospinCasimir = isScalar(casimir, casimir[0]![0]!)
    ? casimir[0]![0]!
    : Number.NaN
  const B3 = B[2]!
  const traceAB = trace(mul(A, B3))
  const traceless = trace(A) === 0 && trace(B3) === 0
  const weights: MemberWeights['weights'] = []

  for (const s of [1, -1]) {
    for (const t of [1, -1]) {
      const four = 4 - s * t * traceAB

      weights.push({
        twoJz: s,
        twoT3: t,
        multiplicity: traceless && four % 4 === 0 ? four / 4 : Number.NaN,
      })
    }
  }

  return { exact, closes, commutes, isospinCasimir, traceAB, weights }
}

// ---- multiplets ----

export type Multiplet = {
  name: string
  // 3Q, by the vibe count
  charge3: number
  // member number N
  members: number
  // 2T of SU(2)+, and the 2 T3 values present (all 2T + 1 of them unless a level was dropped)
  twoT: number
  twoT3: number[]
  // colour or other multiplicity
  copies: number
  // +1 the face's hand, -1 the other
  hand: number
}

const fullWeights = (twoT: number): number[] =>
  Array.from({ length: twoT + 1 }, (_, i) => twoT - 2 * i)

// tone 0 is a love-sea hole, tone 1 a fear-sea hole (three-member-census modes on half 0, register slot 0)
export const TONES = [0, 1] as const
export const COLOR = 3

export function faceConstituents(hand = 1): Multiplet[] {
  return TONES.map(t => ({
    name: `member ${t === 0 ? 'love-sea' : 'fear-sea'} hole`,
    charge3: holeCharge3([t]),
    members: 1,
    twoT: 1,
    twoT3: fullWeights(1),
    copies: COLOR,
    hand,
  }))
}

// every single level of the constituents (one tone, one colour, one T3) dropped in turn: 2 x 3 x 2 = 12 lists
export function dropOneLevel(cs: readonly Multiplet[]): Multiplet[][] {
  const out: Multiplet[][] = []

  cs.forEach((m, i) => {
    for (let c = 0; c < m.copies; c++) {
      for (const w of m.twoT3) {
        const rest = cs.filter((_, j) => j !== i)
        const kept: Multiplet = { ...m, copies: m.copies - 1 }
        const part: Multiplet = {
          ...m,
          copies: 1,
          twoT3: m.twoT3.filter(x => x !== w),
          name: `${m.name} without 2T3 ${w}`,
        }

        out.push(
          [...rest, kept, part].filter(x => x.copies > 0 && x.twoT3.length > 0),
        )
      }
    }
  })

  return out
}

export type CompositeIrrep = {
  charge3: number
  twoJ: number
  twoT: number
  count: number
}

export type Composites = {
  // the symmetric-cube dimension over the 8 member labels (4 weights x 2 tones): 120
  dimension: number
  irreps: CompositeIrrep[]
  // every weight multiset peeled to zero with no negative count
  decomposed: boolean
}

export function compositeMultiplets(w: MemberWeights): Composites {
  const labels: { twoJz: number; twoT3: number; tone: number }[] = []

  for (const t of TONES) {
    for (const x of w.weights) {
      for (let k = 0; k < x.multiplicity; k++) {
        labels.push({ twoJz: x.twoJz, twoT3: x.twoT3, tone: t })
      }
    }
  }

  const byCharge = new Map<number, Map<string, number>>()
  let dimension = 0

  for (let a = 0; a < labels.length; a++) {
    for (let b = a; b < labels.length; b++) {
      for (let c = b; c < labels.length; c++) {
        const ls = [labels[a]!, labels[b]!, labels[c]!]
        const q3 = holeCharge3(ls.map(l => l.tone))
        const key = `${ls.reduce((s, l) => s + l.twoJz, 0)},${ls.reduce((s, l) => s + l.twoT3, 0)}`
        const m = byCharge.get(q3) ?? new Map<string, number>()

        m.set(key, (m.get(key) ?? 0) + 1)
        byCharge.set(q3, m)
        dimension++
      }
    }
  }

  const irreps: CompositeIrrep[] = []
  let decomposed = true

  for (const [q3, m] of [...byCharge].sort((x, y) => x[0] - y[0])) {
    for (;;) {
      const live = [...m].filter(([, n]) => n !== 0)

      if (live.length === 0) {
        break
      }

      if (live.some(([, n]) => n < 0)) {
        decomposed = false
        break
      }

      const pts = live.map(([k]) => k.split(',').map(Number) as [number, number])
      const top = pts.reduce((p, x) =>
        x[0] > p[0] || (x[0] === p[0] && x[1] > p[1]) ? x : p,
      )
      const [twoJ, twoT] = top
      const n = m.get(`${twoJ},${twoT}`)!

      if (twoJ < 0 || twoT < 0) {
        decomposed = false
        break
      }

      for (const jz of fullWeights(twoJ)) {
        for (const t3 of fullWeights(twoT)) {
          const k = `${jz},${t3}`

          m.set(k, (m.get(k) ?? 0) - n)
        }
      }

      irreps.push({ charge3: q3, twoJ, twoT, count: n })
    }
  }

  return { dimension, irreps, decomposed }
}

// the J = 1/2 composites as Weyl multiplets of the face's hand, one per copy
export function spinHalfComposites(c: Composites): Multiplet[] {
  const out: Multiplet[] = []

  for (const r of c.irreps.filter(x => x.twoJ === 1)) {
    for (let k = 0; k < r.count; k++) {
      out.push({
        name: `Q ${r.charge3}/3 T ${r.twoT}/2 #${k + 1}`,
        charge3: r.charge3,
        members: 3,
        twoT: r.twoT,
        twoT3: fullWeights(r.twoT),
        copies: 1,
        hand: 1,
      })
    }
  }

  return out
}

// ---- the coefficients ----

export const COEFFICIENTS = [
  'QQQ',
  'Q',
  'QTT',
  'witten',
  'QQN',
  'QNN',
  'NNN',
  'N',
  'NTT',
] as const

export type Coefficient = (typeof COEFFICIENTS)[number]

// the integer each coefficient is scaled by, so every trace is an integer
export const SCALE: Record<Coefficient, number> = {
  QQQ: 27,
  Q: 3,
  QTT: 12,
  witten: 1,
  QQN: 9,
  QNN: 3,
  NNN: 1,
  N: 1,
  NTT: 4,
}

export type SymmetrySet = 'S1' | 'S2' | 'S3'

// frozen before computing (item 0018): S1 = U(1)_Q, S2 = U(1)_Q x SU(2)+, S3 = S2 x U(1)_N
export const SETS: Record<SymmetrySet, readonly Coefficient[]> = {
  S1: ['QQQ', 'Q'],
  S2: ['QQQ', 'Q', 'QTT', 'witten'],
  S3: ['QQQ', 'Q', 'QTT', 'witten', 'QQN', 'QNN', 'NNN', 'N', 'NTT'],
}

const dynkinParity = (twoT: number): number =>
  ((twoT * (twoT + 1) * (twoT + 2)) / 6) % 2

const mod2 = (x: number): number => ((x % 2) + 2) % 2

export function traces(ms: readonly Multiplet[]): Record<Coefficient, number> {
  const out = Object.fromEntries(COEFFICIENTS.map(c => [c, 0])) as Record<
    Coefficient,
    number
  >

  for (const m of ms) {
    const q = m.charge3
    const n = m.members
    const w = m.hand * m.copies

    for (const t of m.twoT3) {
      out.QQQ += w * q * q * q
      out.Q += w * q
      out.QTT += w * q * t * t
      out.QQN += w * q * q * n
      out.QNN += w * q * n * n
      out.NNN += w * n * n * n
      out.N += w * n
      out.NTT += w * n * t * t
    }

    // a hand of weight h counts |h| Weyl copies: the global anomaly does not see the hand
    out.witten += Math.abs(m.hand) * m.copies * dynkinParity(m.twoT)
  }

  out.witten = mod2(out.witten)

  return out
}

// a scaled coefficient as a reduced fraction
export function asFraction(c: Coefficient, v: number): string {
  const d = SCALE[c]
  const g = (a: number, b: number): number => (b === 0 ? a : g(b, a % b))
  const k = g(Math.abs(v), d) || 1

  return d / k === 1 ? `${v / k}` : `${v / k}/${d / k}`
}

export const vacuous = (
  t: Record<Coefficient, number>,
  set: SymmetrySet,
): boolean => SETS[set].every(c => t[c] === 0)

export type Search = {
  set: SymmetrySet
  // assignments tried, (2 bound + 1)^multiplets
  tried: number
  matches: number
  // matches with some |Q| = 1 composite at nonzero index
  electronMatches: number
  // the first such match, one index per composite multiplet
  example: number[] | null
}

export function searchMatches(
  target: Record<Coefficient, number>,
  composites: readonly Multiplet[],
  set: SymmetrySet,
  bound: number,
): Search {
  const cs = SETS[set]
  const linear = cs.filter(c => c !== 'witten')
  const hasWitten = cs.includes('witten')
  const per = composites.map(m => traces([m]))
  const vec = per.map(t => linear.map(c => t[c]))
  const wit = per.map(t => t.witten)
  const goal = linear.map(c => target[c])
  const k = composites.length
  const l = Array<number>(k).fill(-bound)
  const electron = composites.map(m => Math.abs(m.charge3) === 3)
  let tried = 0
  let matches = 0
  let electronMatches = 0
  let example: number[] | null = null

  for (;;) {
    tried++

    let ok = true

    for (let c = 0; c < goal.length && ok; c++) {
      let s = 0

      for (let i = 0; i < k; i++) {
        s += l[i]! * vec[i]![c]!
      }

      ok = s === goal[c]
    }

    if (ok && hasWitten) {
      let w = 0

      for (let i = 0; i < k; i++) {
        w += Math.abs(l[i]!) * wit[i]!
      }

      ok = mod2(w) === target.witten
    }

    if (ok) {
      matches++

      if (l.some((x, i) => x !== 0 && electron[i])) {
        electronMatches++
        example ??= l.slice()
      }
    }

    let i = 0

    while (i < k && l[i] === bound) {
      l[i] = -bound
      i++
    }

    if (i === k) {
      break
    }

    l[i]!++
  }

  return { set, tried, matches, electronMatches, example }
}

// Tr N C^2 and Tr Q C^2 over the colour triplets (index 1/2 per triplet), scaled by 2 and by 6: the ABJ anomaly of each
// U(1) with the colour force
export function colorAnomaly(ms: readonly Multiplet[]): {
  twiceNCC: number
  sixQCC: number
} {
  let twiceNCC = 0
  let sixQCC = 0

  for (const m of ms.filter(x => x.copies === COLOR)) {
    for (const _t of m.twoT3) {
      twiceNCC += m.hand * m.members
      sixQCC += m.hand * m.charge3
    }
  }

  return { twiceNCC, sixQCC }
}
