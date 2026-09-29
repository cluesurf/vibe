// C FROM THE SEA (E-SPN-0164). The pieces that read E-SPN-0163's many-body register rule on a filled background, with
// the tones carried: the love sea and the fear sea as Fock sectors of a two-tone rest toy, the tone mirror C_v (love <->
// fear, E-SPN-0134's C), the member's two rest branches (S at +M, D at -M, E-SPN-0160) as holes, and the flavor
// transition rates a C-odd or CP-odd reading is built from.
//
//   two-tone modes     tone * 6 + s * 3 + f: tone 0 love, 1 fear; s 0 the blade 1, 1 vol (E-SPN-0163's rest pair); f the
//                      flavor. The one-body beat is tone-blind, b (+) b, and the register exchange keeps each member's
//                      tone and flavor and swaps registers between any two members, love or fear
//   sector blocks      Gamma(P) and a second-quantized operator restricted to a list of Fock states (exact minors and
//                      sparse term application), so a 12-mode rule is read on the sectors that decide a question without
//                      building its 4,096-state matrix
//   branches           the rest beat of the S branch, restToy(A+, A-) with A+ = V D V^dag, A- = D, and of the D branch,
//                      restToy(A+^dag, A-^dag): E-FRC-0259's partner beat
//   rates              Q(alpha -> beta): a member of one half, flavor alpha, found as beta after t beats, its partner in
//                      the other half traced over flavor, exact rationals; on particles (a pair above the empty
//                      background) or on holes (a pair removed from the full background, the particle-hole image)
//
// DETERMINISM: no random numbers. EXACT: every reading is BigInt arithmetic over Q(w).

import {
  qw,
  qwAdd,
  qwConj,
  qwDagger,
  qwMatMul,
  qwMul,
  restToy,
  QW_ONE,
  QW_ZERO,
  type QW,
  type QWMatrix,
} from '@/code/measure/flavor-register'
import {
  applyOps,
  chiralPair,
  qwAbs2,
  qwDet,
  qwIdentityOf,
  type Op,
} from '@/code/measure/register-many-body'

/** The modes of the two-tone rest toy: tone (0 love, 1 fear) * 6 + blade s * 3 + flavor f. */
export const TONE_MODES = 12
export const toneMode = (tone: number, s: number, f: number): number =>
  tone * 6 + s * 3 + f

/** Bitmask Fock states as a sparse vector. */
export type FockVector = Map<number, QW>

const popcount = (x: number): number => {
  let c = 0

  for (let y = x; y; y &= y - 1) {
    c++
  }

  return c
}

const modesOf = (s: number, n: number): number[] =>
  Array.from({ length: n }, (_, i) => i).filter(i => (s >> i) & 1)

/** The states of n modes with the given count in each group of modes (a group is a list of mode indices). */
export function groupedStates(
  n: number,
  groups: readonly (readonly number[])[],
  counts: readonly number[],
): number[] {
  const out: number[] = []

  for (let s = 0; s < 1 << n; s++) {
    if (
      groups.every(
        (g, i) =>
          g.reduce((c, m) => c + ((s >> m) & 1), 0) === counts[i],
      )
    ) {
      out.push(s)
    }
  }

  return out
}

/** Gamma(P) restricted to a list of states closed under P's action: [to][from] = det P[modes(to), modes(from)]. */
export function sectorGamma(
  P: QWMatrix,
  states: readonly number[],
): QWMatrix {
  const n = P.length
  const modes = states.map(s => modesOf(s, n))

  return modes.map(rows =>
    modes.map(cols =>
      rows.length === cols.length
        ? qwDet(rows.map(r => cols.map(c => (P[r] as QW[])[c]!)))
        : QW_ZERO,
    ),
  )
}

/** A second-quantized operator restricted to a list of states: [to][from] over the list, sparse term application. */
export function sectorOperator(
  states: readonly number[],
  terms: readonly { coef: QW; ops: readonly Op[] }[],
): QWMatrix {
  const index = new Map(states.map((s, i) => [s, i]))
  const out: QWMatrix = states.map(() => states.map(() => QW_ZERO))

  states.forEach((from, j) => {
    for (const { coef, ops } of terms) {
      const r = applyOps(from, ops)

      if (!r) {
        continue
      }

      const i = index.get(r.state)

      if (i === undefined) {
        throw new Error(`sector not closed: ${from} -> ${r.state}`)
      }

      const row = out[i] as QW[]

      row[j] = qwAdd(
        row[j]!,
        r.sign > 0 ? coef : qw(-coef.a, -coef.b, coef.d),
      )
    }
  })

  return out
}

/**
 * The register exchange of the two-tone toy as second-quantized terms: every pair of members swaps registers and keeps
 * its own tone and flavor, (1/2) sum over (s, t, x, y) c^dag_(t x) c^dag_(s y) c_(t y) c_(s x), x and y running over
 * (tone, flavor). E-SPN-0163's registerExchange with the tone carried as part of the kept label.
 */
export function toneExchangeTerms(): { coef: QW; ops: Op[] }[] {
  const half = qw(1n, 0n, 2n)
  const labels: [number, number][] = []

  for (let tone = 0; tone < 2; tone++) {
    for (let f = 0; f < 3; f++) {
      labels.push([tone, f])
    }
  }

  const m = (s: number, x: [number, number]): number =>
    toneMode(x[0], s, x[1])
  const terms: { coef: QW; ops: Op[] }[] = []

  for (let s = 0; s < 2; s++) {
    for (let t = 0; t < 2; t++) {
      for (const x of labels) {
        for (const y of labels) {
          terms.push({
            coef: half,
            ops: [
              { dag: true, mode: m(t, x) },
              { dag: true, mode: m(s, y) },
              { dag: false, mode: m(t, y) },
              { dag: false, mode: m(s, x) },
            ],
          })
        }
      }
    }
  }

  return terms
}

/** H' = k (k - 1) / 2 - O on a sector of k members. */
export function sectorExchangeCount(
  states: readonly number[],
): QWMatrix {
  const O = sectorOperator(states, toneExchangeTerms())

  return O.map((r, i) =>
    r.map((x, j) => {
      const k = popcount(states[i]!)

      return i === j
        ? qwAdd(qw(BigInt((k * (k - 1)) / 2), 0n), qw(-x.a, -x.b, x.d))
        : qw(-x.a, -x.b, x.d)
    }),
  )
}

/** The one-body rest beat of one branch: S is restToy(A+, A-), D its partner restToy(A+^dag, A-^dag). */
export function branchBeat(
  V: QWMatrix,
  D: QWMatrix,
  branch: 'S' | 'D',
): QWMatrix {
  const Ap = qwMatMul(qwMatMul(V, D), qwDagger(V))

  return branch === 'S'
    ? restToy(Ap, D, QW_ONE)
    : restToy(qwDagger(Ap), qwDagger(D), QW_ONE)
}

/** The tone-blind two-tone beat b (+) b on 12 modes. */
export function toneBlind(b: QWMatrix): QWMatrix {
  const out: QWMatrix = Array.from({ length: TONE_MODES }, () =>
    Array.from({ length: TONE_MODES }, () => QW_ZERO),
  )

  for (let tone = 0; tone < 2; tone++) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        ;(out[tone * 6 + i] as QW[])[tone * 6 + j] = (b[i] as QW[])[j]!
      }
    }
  }

  return out
}

/** The tone mirror C_v as a mode permutation (love <-> fear), and its action on a Fock state with the fermion sign. */
export const toneMirrorMode = (m: number): number =>
  m < 6 ? m + 6 : m - 6

export function toneMirror(x: FockVector, n = TONE_MODES): FockVector {
  const out: FockVector = new Map()

  for (const [s, a] of x) {
    const image = modesOf(s, n).map(toneMirrorMode)
    const r = applyOps(
      0,
      image.map(mode => ({ dag: true, mode })).reverse(),
    )

    if (!r) {
      continue
    }

    out.set(r.state, r.sign > 0 ? a : qw(-a.a, -a.b, a.d))
  }

  return out
}

/** Apply a sector matrix (over `states`) to a sparse vector. */
export function applySector(
  U: QWMatrix,
  states: readonly number[],
  x: FockVector,
): FockVector {
  const index = new Map(states.map((s, i) => [s, i]))
  const out: FockVector = new Map()

  for (const [from, a] of x) {
    const j = index.get(from)

    if (j === undefined) {
      throw new Error(`state ${from} outside the sector`)
    }

    states.forEach((to, i) => {
      const u = (U[i] as QW[])[j]!

      if (u.a !== 0n || u.b !== 0n) {
        out.set(to, qwAdd(out.get(to) ?? QW_ZERO, qwMul(u, a)))
      }
    })
  }

  return out
}

/** <y|x>, y conjugated. */
export function braket(y: FockVector, x: FockVector): QW {
  let s = QW_ZERO

  for (const [k, c] of y) {
    const a = x.get(k)

    if (a) {
      s = qwAdd(s, qwMul(qwConj(c), a))
    }
  }

  return s
}

/** The integer pair state c~^dag_(h1 f1) c~^dag_(h2 f2) of E-SPN-0163 on the 6 modes of one tone, as a vector. */
export const pairVector = (
  h1: number,
  f1: number,
  h2: number,
  f2: number,
): FockVector =>
  new Map(
    [...chiralPair(h1, f1, h2, f2)].map(([k, c]) => [k, qw(c, 0n)]),
  )

/**
 * Put a one-tone (6-mode) vector on the love (tone 0) or the fear (tone 1) modes of the 12-mode toy, the other tone
 * empty. With the other tone empty the ascending-order sign is unchanged, so the map is a plain shift.
 */
export function onTone(x: FockVector, tone: number): FockVector {
  return new Map([...x].map(([s, a]) => [tone === 0 ? s : s << 6, a]))
}

/** The particle-hole image of a vector on n modes: c^dag_S |0> -> c_S |full>, exact signs (E-SPN-0163's Xi). */
export function holeImage(x: FockVector, n: number): FockVector {
  const full = (1 << n) - 1
  const out: FockVector = new Map()

  for (const [S, a] of x) {
    const r = applyOps(
      full,
      modesOf(S, n).map(mode => ({ dag: false, mode })),
    ) as { state: number; sign: number }

    out.set(
      r.state,
      r.sign > 0
        ? qwAdd(out.get(r.state) ?? QW_ZERO, a)
        : qwAdd(out.get(r.state) ?? QW_ZERO, qw(-a.a, -a.b, a.d)),
    )
  }

  return out
}

/** The flavor transition rate of a pair (h1 member alpha -> beta, partner of half -h1 traced over flavor), per beat. */
export function pairRate(
  step: (x: FockVector) => FockVector,
  lift: (x: FockVector) => FockVector,
  h1: number,
  alpha: number,
  beta: number,
  beats: number,
): QW[] {
  const perState = qw(1n, 0n, 48n)
  const out: QW[] = Array.from({ length: beats }, () => QW_ZERO)

  for (let g = 0; g < 3; g++) {
    let x = lift(pairVector(h1, alpha, -h1, g))

    for (let t = 0; t < beats; t++) {
      x = step(x)

      for (let g2 = 0; g2 < 3; g2++) {
        out[t] = qwAdd(
          out[t]!,
          qwMul(
            perState,
            qwAbs2(braket(lift(pairVector(h1, beta, -h1, g2)), x)),
          ),
        )
      }
    }
  }

  return out
}

export const identity12 = (): QWMatrix => qwIdentityOf(TONE_MODES)
