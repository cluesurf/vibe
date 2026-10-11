// IS THE WEAK DOUBLET THE TONE-FLIPPING HODGE STAR? (E-SPN-0204, moving-matter item 0092, decision 020 point 4,
// research/one-walker-costs.md section 1). RULE: the register rule R* in the one-walker reading (decision 020 point 1): a
// walker of tone t and grade k carries Lambda^k(C^3) of its role, 8 states per tone, 16 in all, charge +k/3 (love) or
// -k/3 (fear).
//
// STEP 1 (a), HOW A COLOUR LINK ACTS ON EACH TONE, read from the code:
//  - R*'s colour links (code/measure/holonomy-caging stream, overlay lines 444-484) turn the role by R(x, d) in the
//    defining representation and carry NO tone index: the caging engine runs one tone. So no code fixes how R*'s links
//    act on the fear tone.
//  - the knit's fear beat fixes it for the role-grid moves (code/measure/role-register.ts:9-13): the unlike kernel V =
//    1 + (w - 1) Phi Phi^dag keeps the singlet only under g (x) conj g, and 3 (x) 3 holds no invariant, so the fear-tone
//    role is 3-bar, "forced".
//  - read here, over the 648 elements of Sigma(648) (exact, Q(zeta_9)): with love R and fear conj R, every piece keeps
//    the colour action: the one-body pieces and R*'s pair piece act as 1 on the role (tone-blind and role-blind), the
//    like kernel U = P_sym + w P_anti commutes with g (x) g (love-love) and conj g (x) conj g (fear-fear), the unlike
//    kernel V with g (x) conj g. The same-colour assignment (fear R) breaks V: [g (x) g, V] is order 1. That is the
//    DEFECT reading's counterexample, and it is not what the code holds.
// STEP 2 (b), THE STAR: Lambda^k(R) for k 0..3 on both tones (minors), star from love grade k to fear grade 3 - k by the
//  role epsilon, S[J][I] = sign(I J) for J the complement of I. The identity star Lambda^k(R) = det R Lambda^(3-k)(conj R)
//  star, checked exactly in Q(zeta_9) and as floats on all 648. Then the commutant census: dim Hom_G between every pair of
//  the 8 grade-tone blocks, exact (characters summed in Q(zeta_9), divided by 648), each with its charge change.
// STEP 3 (c), THE PAIR PIECE: on two walkers (256 states), S = tau (x) tau on the mixed-tone pairs, tau = star on love and
//  star^-1 on fear (a Hermitian involution), and W = P_+ + w P_- = (1 + w)/2 + (1 - w)/2 S there, 1 elsewhere. Read: the
//  commutator of W with the charge, the triality (w^(3Q)), quark number (walkers of grade 1 or 2) and lepton number
//  (grade 0 or 3), and as reads the signed B and L and colour (all 648).
// STEP 4 (d), READ, NOT GATED: on 0028's paired-wall slab (E-FRC-0267's chiral slab, L 12, ringUnit(-2, 5), Wilson mixers
//  on half 0 = half +, anomaly-matching-walls chiralSlab), the in-gap levels' count and chirality per (half, wall), and
//  whether half + selects one wall's chirality.
//
// GATES, fixed 2026-10-09 by the lead, never moved.
//  CREDIBLE (status pass): STEP 1 gives conj R (stated or consistent to 1e-12); the STEP 2 residual is at most 1e-12 on
//   all 648; the census's charge-1 maps are exactly star on all four k plus the lepton-only love 0 to 3 and fear 0 to 3
//   maps; STEP 3 conserves all four numbers to 1e-12.
//  DEFECT (status partial): STEP 1 finds both tones carry the same colour. Then a Decide item is filed.
//  KILL (status fail): the STEP 2 residual fails (det R per element reported).
//  Anything else: open.
// INSTRUMENTS: I1 the group closes at 648 and every element is unitary; I2 on a U(3) element with det i the identity
//  holds WITH the det factor and fails without it; I3 tau^2 = 1 and tau Hermitian; I4 W unitary.
// CONTROLS: C1 with the fear tone carrying R (not conj R) star is no intertwiner on k 1, 2; C2 S applied to same-tone
//  pairs too breaks the charge (the tone flip is why only mixed pairs are swapped).
// LEAD'S PREDICTION: CREDIBLE.
//
// DETERMINISM: no random numbers. EXACT: the group, its minors, the star identity and the census in Q(zeta_9); FLOAT:
// the 1e-12 residuals, STEP 3 and STEP 4, as measurement.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { wallChirality } from '@/code/measure/wilson-register'
import { kernelOperators } from '@/code/measure/role-register'
import { sigmaElements } from '@/code/measure/holonomy-caging'
import { chiralSlab, faceSpans } from '@/code/measure/anomaly-matching-walls'
import {
  add,
  conj,
  det3,
  equals,
  isUnitary,
  mul,
  neg,
  ninth,
  ONE,
  scale,
  sub,
  toComplex,
  ZERO,
  type Ninth,
} from '@/code/algebra/ninth-field'

const TOL = 1e-12
const WALL_L = 12

export default experiment({
  id: 'spin/weak-doublet',
  code: 'E-SPN-0204',
  title:
    'explores whether the weak doublet could be the tone-flipping Hodge star of the one-walker reading: how R*\'s colour links act on the fear tone, star from love Lambda^k to fear Lambda^(3-k) as an exact Sigma(648) intertwiner, the commutant census of the 16 internal states, and the conserved numbers of the pair piece P_+ + w P_-',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return weakDoubletRun()
  },
})

// ---- small exact and float linear algebra ----

type NM = Ninth[][]
type FM = { re: number[][]; im: number[][] }

export const SUBSETS: number[][][] = [
  [[]],
  [[0], [1], [2]],
  [
    [0, 1],
    [0, 2],
    [1, 2],
  ],
  [[0, 1, 2]],
]
const OFF = [0, 1, 4, 7]
const DIMS = [1, 3, 3, 1]

function detExact(m: NM): Ninth {
  if (m.length === 0) {
    return ONE
  }

  if (m.length === 1) {
    return m[0]![0]!
  }

  if (m.length === 2) {
    return sub(mul(m[0]![0]!, m[1]![1]!), mul(m[0]![1]!, m[1]![0]!))
  }

  return det3(m)
}

type CNum = [number, number]
const cm = (a: CNum, b: CNum): CNum => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]

function detFloat(m: CNum[][]): CNum {
  if (m.length === 0) {
    return [1, 0]
  }

  if (m.length === 1) {
    return m[0]![0]!
  }

  if (m.length === 2) {
    const a = cm(m[0]![0]!, m[1]![1]!)
    const b = cm(m[0]![1]!, m[1]![0]!)

    return [a[0] - b[0], a[1] - b[1]]
  }

  let s: CNum = [0, 0]

  for (let c = 0; c < 3; c++) {
    const minor = [1, 2].map(r => [0, 1, 2].filter(x => x !== c).map(x => m[r]![x]!))
    const t = cm(m[0]![c]!, detFloat(minor))
    const sign = c % 2 === 0 ? 1 : -1

    s = [s[0] + sign * t[0], s[1] + sign * t[1]]
  }

  return s
}

// Lambda^k of a 3 x 3 matrix: entry (I, J) the minor on rows I, columns J
export function exteriorExact(g: NM, k: number): NM {
  return SUBSETS[k]!.map(I => SUBSETS[k]!.map(J => detExact(I.map(i => J.map(j => g[i]![j]!)))))
}

function exteriorFloat(g: CNum[][], k: number): CNum[][] {
  return SUBSETS[k]!.map(I => SUBSETS[k]!.map(J => detFloat(I.map(i => J.map(j => g[i]![j]!)))))
}

const conjExact = (g: NM): NM => g.map(r => r.map(conj))
const conjFloat = (g: CNum[][]): CNum[][] => g.map(r => r.map(([a, b]) => [a, -b] as CNum))
const toFloat = (g: NM): CNum[][] => g.map(r => r.map(toComplex))

function permSign(seq: readonly number[]): number {
  let s = 1

  for (let i = 0; i < seq.length; i++) {
    for (let j = i + 1; j < seq.length; j++) {
      if (seq[i]! > seq[j]!) {
        s = -s
      }
    }
  }

  return s
}

// star from love grade k to fear grade 3 - k: rows SUBSETS[3 - k], columns SUBSETS[k], S[J][I] = sign(I J) when J = I^c
export function starMatrix(k: number): number[][] {
  return SUBSETS[3 - k]!.map(J =>
    SUBSETS[k]!.map(I => {
      const complement = [0, 1, 2].filter(x => !I.includes(x))

      return complement.join() === J.join() ? permSign([...I, ...J]) : 0
    }),
  )
}

const intTimesExact = (S: number[][], M: NM): NM =>
  S.map(row =>
    M[0]!.map((_, j) =>
      row.reduce<Ninth>((s, x, l) => (x === 0 ? s : add(s, x > 0 ? M[l]![j]! : neg(M[l]![j]!))), ZERO),
    ),
  )
const exactTimesInt = (M: NM, S: number[][]): NM =>
  M.map(row =>
    S[0]!.map((_, j) =>
      row.reduce<Ninth>((s, x, l) => (S[l]![j]! === 0 ? s : add(s, S[l]![j]! > 0 ? x : neg(x))), ZERO),
    ),
  )
const intTimesFloat = (S: number[][], M: CNum[][]): CNum[][] =>
  S.map(row =>
    M[0]!.map((_, j) =>
      row.reduce<CNum>((s, x, l) => [s[0] + x * M[l]![j]![0], s[1] + x * M[l]![j]![1]], [0, 0]),
    ),
  )
const floatTimesInt = (M: CNum[][], S: number[][]): CNum[][] =>
  M.map(row =>
    S[0]!.map((_, j) =>
      row.reduce<CNum>((s, x, l) => [s[0] + x[0] * S[l]![j]!, s[1] + x[1] * S[l]![j]!], [0, 0]),
    ),
  )
const maxDiff = (a: CNum[][], b: CNum[][], scaleB: CNum = [1, 0]): number =>
  a.reduce(
    (w, row, i) =>
      row.reduce((v, x, j) => {
        const y = cm(scaleB, b[i]![j]!)

        return Math.max(v, Math.hypot(x[0] - y[0], x[1] - y[1]))
      }, w),
    0,
  )
const sameExact = (a: NM, b: NM): boolean => a.every((row, i) => row.every((x, j) => equals(x, b[i]![j]!)))

function floatMul(a: FM, b: FM, n: number): FM {
  const re = Array.from({ length: n }, () => Array<number>(n).fill(0))
  const im = Array.from({ length: n }, () => Array<number>(n).fill(0))

  for (let i = 0; i < n; i++) {
    for (let l = 0; l < n; l++) {
      const ar = a.re[i]![l]!
      const ai = a.im[i]![l]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        re[i]![j]! += ar * b.re[l]![j]! - ai * b.im[l]![j]!
        im[i]![j]! += ar * b.im[l]![j]! + ai * b.re[l]![j]!
      }
    }
  }

  return { re, im }
}

const kron3 = (a: CNum[][], b: CNum[][]): FM => {
  const re = Array.from({ length: 9 }, () => Array<number>(9).fill(0))
  const im = Array.from({ length: 9 }, () => Array<number>(9).fill(0))

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          const z = cm(a[i]![k]!, b[j]![l]!)

          re[3 * i + j]![3 * k + l] = z[0]
          im[3 * i + j]![3 * k + l] = z[1]
        }
      }
    }
  }

  return { re, im }
}

function commutatorMax(a: FM, b: FM, n: number): number {
  const ab = floatMul(a, b, n)
  const ba = floatMul(b, a, n)

  let w = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      w = Math.max(w, Math.hypot(ab.re[i]![j]! - ba.re[i]![j]!, ab.im[i]![j]! - ba.im[i]![j]!))
    }
  }

  return w
}

const kernelFM = (k: { re: Float64Array; im: Float64Array }): FM => ({
  re: Array.from({ length: 9 }, (_, i) => Array.from(k.re.slice(9 * i, 9 * i + 9))),
  im: Array.from({ length: 9 }, (_, i) => Array.from(k.im.slice(9 * i, 9 * i + 9))),
})

// ---- the 16 internal states: index tone * 8 + OFF[k] + i ----

const blockOf = (s: number): { tone: number; k: number; i: number } => {
  const tone = s < 8 ? 0 : 1
  const r = s % 8
  const k = r === 0 ? 0 : r < 4 ? 1 : r < 7 ? 2 : 3

  return { tone, k, i: r - OFF[k]! }
}

// 3Q of an internal state: +k love, -k fear
const charge3 = (s: number): number => {
  const b = blockOf(s)

  return b.tone === 0 ? b.k : -b.k
}

// tau = star on love, star^-1 (its transpose, a signed permutation) on fear
export function tauMatrix(): number[][] {
  const t = Array.from({ length: 16 }, () => Array<number>(16).fill(0))

  for (let k = 0; k < 4; k++) {
    const S = starMatrix(k)

    for (let J = 0; J < DIMS[3 - k]!; J++) {
      for (let I = 0; I < DIMS[k]!; I++) {
        // love k, I -> fear 3 - k, J
        t[8 + OFF[3 - k]! + J]![OFF[k]! + I] = S[J]![I]!
        // fear 3 - k, J -> love k, I
        t[OFF[k]! + I]![8 + OFF[3 - k]! + J] = S[J]![I]!
      }
    }
  }

  return t
}

// rho(g): Lambda^k(g) on love, Lambda^k(conj g) on fear (or g on fear too when same is set)
function rhoBlocks(g: CNum[][], same = false): CNum[][][] {
  const blocks: CNum[][][] = []

  for (let tone = 0; tone < 2; tone++) {
    const h = tone === 0 || same ? g : conjFloat(g)

    for (let k = 0; k < 4; k++) {
      blocks.push(exteriorFloat(h, k))
    }
  }

  return blocks
}

function rho16(blocks: CNum[][][]): FM {
  const re = Array.from({ length: 16 }, () => Array<number>(16).fill(0))
  const im = Array.from({ length: 16 }, () => Array<number>(16).fill(0))

  blocks.forEach((B, b) => {
    const o = (b >= 4 ? 8 : 0) + OFF[b % 4]!

    B.forEach((row, i) =>
      row.forEach((z, j) => {
        re[o + i]![o + j] = z[0]
        im[o + i]![o + j] = z[1]
      }),
    )
  })

  return { re, im }
}

type Sparse = { idx: number[]; re: number[]; im: number[] }[]

const sparseRows = (m: FM, n: number): Sparse =>
  Array.from({ length: n }, (_, i) => {
    const row = { idx: [] as number[], re: [] as number[], im: [] as number[] }

    for (let j = 0; j < n; j++) {
      if (m.re[i]![j] !== 0 || m.im[i]![j] !== 0) {
        row.idx.push(j)
        row.re.push(m.re[i]![j]!)
        row.im.push(m.im[i]![j]!)
      }
    }

    return row
  })

const transposeFM = (m: FM, n: number): FM => ({
  re: Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => m.re[j]![i]!)),
  im: Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => m.im[j]![i]!)),
})

// ---- the pair piece on two walkers, index a * 16 + b ----

export type PairPiece = { re: Float64Array; im: Float64Array }

export function pairPiece(mixedOnly: boolean): PairPiece {
  const tau = tauMatrix()
  const N = 256
  const re = new Float64Array(N * N)
  const im = new Float64Array(N * N)
  const w: CNum = [Math.cos((2 * Math.PI) / 3), Math.sin((2 * Math.PI) / 3)]
  const p: CNum = [(1 + w[0]) / 2, w[1] / 2]
  const m: CNum = [(1 - w[0]) / 2, -w[1] / 2]

  for (let a = 0; a < 16; a++) {
    for (let b = 0; b < 16; b++) {
      const c = a * 16 + b
      const mixed = blockOf(a).tone !== blockOf(b).tone

      if (mixedOnly && !mixed) {
        re[c * N + c] = 1
        continue
      }

      re[c * N + c]! += p[0]
      im[c * N + c]! += p[1]

      for (let a2 = 0; a2 < 16; a2++) {
        const ta = tau[a2]![a]!

        if (ta === 0) {
          continue
        }

        for (let b2 = 0; b2 < 16; b2++) {
          const tb = tau[b2]![b]!

          if (tb === 0) {
            continue
          }

          const r = a2 * 16 + b2

          re[r * N + c]! += m[0] * ta * tb
          im[r * N + c]! += m[1] * ta * tb
        }
      }
    }
  }

  return { re, im }
}

function diagCommutator(W: PairPiece, d: (s: number) => number): number {
  const N = 256

  let worst = 0

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const z = Math.hypot(W.re[i * N + j]!, W.im[i * N + j]!)

      if (z !== 0) {
        worst = Math.max(worst, z * Math.abs(d(i) - d(j)))
      }
    }
  }

  return worst
}

function phaseCommutator(W: PairPiece, t: (s: number) => number): number {
  const N = 256

  let worst = 0

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const z = Math.hypot(W.re[i * N + j]!, W.im[i * N + j]!)

      if (z !== 0) {
        const di = (2 * Math.PI * t(i)) / 3
        const dj = (2 * Math.PI * t(j)) / 3

        worst = Math.max(worst, z * Math.hypot(Math.cos(di) - Math.cos(dj), Math.sin(di) - Math.sin(dj)))
      }
    }
  }

  return worst
}

function unitarityGap(W: PairPiece): number {
  const N = 256

  let worst = 0

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      let r = 0
      let s = 0

      for (let l = 0; l < N; l++) {
        const ar = W.re[i * N + l]!
        const ai = W.im[i * N + l]!
        const br = W.re[j * N + l]!
        const bi = W.im[j * N + l]!

        r += ar * br + ai * bi
        s += ai * br - ar * bi
      }

      worst = Math.max(worst, Math.hypot(r - (i === j ? 1 : 0), s))
    }
  }

  return worst
}

// max |(rho (x) rho) W - W (rho (x) rho)| for one group element
function colourCommutator(W: PairPiece, rho: FM): number {
  const N = 256
  const rows = sparseRows(rho, 16)
  const cols = sparseRows(transposeFM(rho, 16), 16)
  const left = { re: new Float64Array(N * N), im: new Float64Array(N * N) }

  // (rho x rho) W: row (a, b) = sum rho[a][a'] rho[b][b'] W[(a', b'), c]
  for (let a = 0; a < 16; a++) {
    for (let b = 0; b < 16; b++) {
      const r = a * 16 + b
      const ra = rows[a]!
      const rb = rows[b]!

      for (let x = 0; x < ra.idx.length; x++) {
        for (let y = 0; y < rb.idx.length; y++) {
          const cr = ra.re[x]! * rb.re[y]! - ra.im[x]! * rb.im[y]!
          const ci = ra.re[x]! * rb.im[y]! + ra.im[x]! * rb.re[y]!
          const src = ra.idx[x]! * 16 + rb.idx[y]!

          for (let c = 0; c < N; c++) {
            const wr = W.re[src * N + c]!
            const wi = W.im[src * N + c]!

            if (wr === 0 && wi === 0) {
              continue
            }

            left.re[r * N + c]! += cr * wr - ci * wi
            left.im[r * N + c]! += cr * wi + ci * wr
          }
        }
      }
    }
  }

  let worst = 0

  // W (rho x rho): entry (r, (a, b)) = sum W[r, (a', b')] rho[a'][a] rho[b'][b]; cols[a] lists rho[.][a]
  for (let r = 0; r < N; r++) {
    for (let a = 0; a < 16; a++) {
      for (let b = 0; b < 16; b++) {
        const ca = cols[a]!
        const cb = cols[b]!

        let sr = 0
        let si = 0

        for (let x = 0; x < ca.idx.length; x++) {
          for (let y = 0; y < cb.idx.length; y++) {
            const src = ca.idx[x]! * 16 + cb.idx[y]!
            const wr = W.re[r * N + src]!
            const wi = W.im[r * N + src]!

            if (wr === 0 && wi === 0) {
              continue
            }

            const cr = ca.re[x]! * cb.re[y]! - ca.im[x]! * cb.im[y]!
            const ci = ca.re[x]! * cb.im[y]! + ca.im[x]! * cb.re[y]!

            sr += wr * cr - wi * ci
            si += wr * ci + wi * cr
          }
        }

        const c = a * 16 + b

        worst = Math.max(worst, Math.hypot(left.re[r * N + c]! - sr, left.im[r * N + c]! - si))
      }
    }
  }

  return worst
}

// ---- the run ----

const BLOCK_NAMES = ['love 0', 'love 1', 'love 2', 'love 3', 'fear 0', 'fear 1', 'fear 2', 'fear 3']
const blockCharge3 = (b: number): number => (b < 4 ? b : -(b - 4))

export function weakDoubletRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${((Date.now() - started) / 1000).toFixed(1)}s`)

  // ================= the group =================
  const { elements, closed } = sigmaElements()
  const floats = elements.map(toFloat)
  const order = elements.length
  const unitary = elements.filter(g => isUnitary(g)).length
  const dets = elements.map(det3)
  const detOne = dets.filter(d => equals(d, ONE)).length
  const detFloatGap = Math.max(
    ...dets.map(d => {
      const [r, i] = toComplex(d)

      return Math.hypot(r - 1, i)
    }),
  )
  const I1 = closed && order === 648 && unitary === 648

  log('group')

  // ================= STEP 1 =================
  const { U, V } = kernelOperators((2 * Math.PI) / 3)
  const UF = kernelFM(U)
  const VF = kernelFM(V)
  let likeLove = 0
  let likeFear = 0
  let unlikeConj = 0
  let unlikeSame = 0

  for (const g of floats) {
    const gc = conjFloat(g)

    likeLove = Math.max(likeLove, commutatorMax(kron3(g, g), UF, 9))
    likeFear = Math.max(likeFear, commutatorMax(kron3(gc, gc), UF, 9))
    unlikeConj = Math.max(unlikeConj, commutatorMax(kron3(g, gc), VF, 9))
    unlikeSame = Math.max(unlikeSame, commutatorMax(kron3(g, g), VF, 9))
  }

  // conj R is consistent when every tone-sensitive piece keeps it (the one-body pieces and the pair piece act as 1 on
  // the role); the same colour is what the code holds when the unlike kernel keeps g (x) g and not g (x) conj g
  const conjConsistent = likeLove <= TOL && likeFear <= TOL && unlikeConj <= TOL
  const sameColour = unlikeSame <= TOL && unlikeConj > TOL

  log('step 1')

  // ================= STEP 2 =================
  const stars = [0, 1, 2, 3].map(starMatrix)
  const starExact = [0, 0, 0, 0]
  const starResidual = [0, 0, 0, 0]
  const sameResidual = [0, 0, 0, 0]
  const perElementWorst: number[] = []

  elements.forEach((g, e) => {
    const gc = conjExact(g)
    const f = floats[e]!
    const fc = conjFloat(f)
    const [dr, di] = toComplex(dets[e]!)

    let worst = 0

    for (let k = 0; k < 4; k++) {
      const S = stars[k]!
      const lhs = intTimesExact(S, exteriorExact(g, k))
      const rhs = exactTimesInt(exteriorExact(gc, 3 - k), S).map(row => row.map(x => mul(dets[e]!, x)))

      if (sameExact(lhs, rhs)) {
        starExact[k]!++
      }

      // the gate: star Lambda^k(R) - Lambda^(3-k)(conj R) star, as floats (det R carried, exactly 1 on every element)
      const r = maxDiff(intTimesFloat(S, exteriorFloat(f, k)), floatTimesInt(exteriorFloat(fc, 3 - k), S))
      const withDet = maxDiff(intTimesFloat(S, exteriorFloat(f, k)), floatTimesInt(exteriorFloat(fc, 3 - k), S), [dr, di])

      starResidual[k] = Math.max(starResidual[k]!, r)
      worst = Math.max(worst, r, withDet)
      // C1: the fear tone carrying R itself
      sameResidual[k] = Math.max(
        sameResidual[k]!,
        maxDiff(intTimesFloat(S, exteriorFloat(f, k)), floatTimesInt(exteriorFloat(f, 3 - k), S)),
      )
    }

    perElementWorst.push(worst)
  })

  const starResidualMax = Math.max(...starResidual)
  const starPass = starResidualMax <= TOL && starExact.every(n => n === 648)

  // I2: a U(3) element with det i: the identity holds with det, fails without
  const tilt: CNum[][] = floats[5]!.map((row, i) => row.map(z => (i === 2 ? cm(z, [0, 1]) : z)))
  const tiltDet = detFloat(tilt)
  const tiltWith = Math.max(
    ...[0, 1, 2, 3].map(k =>
      maxDiff(intTimesFloat(stars[k]!, exteriorFloat(tilt, k)), floatTimesInt(exteriorFloat(conjFloat(tilt), 3 - k), stars[k]!), tiltDet),
    ),
  )
  const tiltWithout = Math.max(
    ...[0, 1, 2, 3].map(k =>
      maxDiff(intTimesFloat(stars[k]!, exteriorFloat(tilt, k)), floatTimesInt(exteriorFloat(conjFloat(tilt), 3 - k), stars[k]!)),
    ),
  )
  const I2 = tiltWith <= TOL && tiltWithout > 0.1

  log('step 2 star')

  // the census: dim Hom_G(a, b) = (1/648) sum conj(chi_a) chi_b, exact
  const chars: Ninth[][] = elements.map(g => {
    const gc = conjExact(g)

    return [0, 1].flatMap(tone =>
      [0, 1, 2, 3].map(k => {
        const m = exteriorExact(tone === 0 ? g : gc, k)

        return m.reduce<Ninth>((s, row, i) => add(s, row[i]!), ZERO)
      }),
    )
  })
  const homDim: number[][] = []
  let censusExact = true

  for (let a = 0; a < 8; a++) {
    homDim.push([])

    for (let b = 0; b < 8; b++) {
      let s = ZERO

      for (const c of chars) {
        s = add(s, mul(conj(c[a]!), c[b]!))
      }

      const d = scale(s, 1, 648)
      const n = Math.round(toComplex(d)[0])

      if (!equals(d, ninth([n]))) {
        censusExact = false
      }

      homDim[a]!.push(n)
    }
  }

  const nonzero: string[] = []
  const chargeOne: string[] = []

  for (let a = 0; a < 8; a++) {
    for (let b = a + 1; b < 8; b++) {
      if (homDim[a]![b]! > 0) {
        const dq = Math.abs(blockCharge3(a) - blockCharge3(b))
        const name = `${BLOCK_NAMES[a]}~${BLOCK_NAMES[b]}`

        nonzero.push(`${name} dim ${homDim[a]![b]} dQ ${dq}/3`)

        if (dq === 3) {
          chargeOne.push(`${name}:${homDim[a]![b]}`)
        }
      }
    }
  }

  const expectedChargeOne = [
    'love 0~love 3:1',
    'love 0~fear 3:1',
    'love 1~fear 2:1',
    'love 2~fear 1:1',
    'love 3~fear 0:1',
    'fear 0~fear 3:1',
  ]
  const censusPass =
    censusExact &&
    chargeOne.length === expectedChargeOne.length &&
    expectedChargeOne.every(x => chargeOne.includes(x))

  log('step 2 census')

  // ================= STEP 3 =================
  const tau = tauMatrix()
  let tauSquare = 0
  let tauSym = 0

  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      let s = 0

      for (let l = 0; l < 16; l++) {
        s += tau[i]![l]! * tau[l]![j]!
      }

      tauSquare = Math.max(tauSquare, Math.abs(s - (i === j ? 1 : 0)))
      tauSym = Math.max(tauSym, Math.abs(tau[i]![j]! - tau[j]![i]!))
    }
  }

  const I3 = tauSquare === 0 && tauSym === 0
  const tauFM: FM = { re: tau, im: tau.map(r => r.map(() => 0)) }
  let tauColour = 0

  for (const g of floats) {
    tauColour = Math.max(tauColour, commutatorMax(tauFM, rho16(rhoBlocks(g)), 16))
  }

  const W = pairPiece(true)
  const unitaryW = unitarityGap(W)
  const I4 = unitaryW <= TOL
  const pair = (f: (s: number) => number) => (c: number): number => f(Math.floor(c / 16)) + f(c % 16)
  const quark = (s: number): number => (blockOf(s).k === 1 || blockOf(s).k === 2 ? 1 : 0)
  const lepton = (s: number): number => (blockOf(s).k === 0 || blockOf(s).k === 3 ? 1 : 0)
  const signedB = (s: number): number => {
    const { tone, k } = blockOf(s)

    return (tone === 0 && k === 2) || (tone === 1 && k === 1) ? 1 : (tone === 0 && k === 1) || (tone === 1 && k === 2) ? -1 : 0
  }
  const signedL = (s: number): number => {
    const { tone, k } = blockOf(s)

    return (tone === 0 && k === 0) || (tone === 1 && k === 3) ? 1 : (tone === 0 && k === 3) || (tone === 1 && k === 0) ? -1 : 0
  }
  const conserved = {
    charge: diagCommutator(W, pair(s => charge3(s) / 3)),
    triality: phaseCommutator(W, pair(s => ((charge3(s) % 3) + 3) % 3)),
    quark: diagCommutator(W, pair(quark)),
    lepton: diagCommutator(W, pair(lepton)),
  }
  const reads = {
    signedB: diagCommutator(W, pair(signedB)),
    signedL: diagCommutator(W, pair(signedL)),
  }
  const step3Pass = Object.values(conserved).every(x => x <= TOL)

  log('step 3 numbers')

  let colourW = 0

  for (const g of floats) {
    colourW = Math.max(colourW, colourCommutator(W, rho16(rhoBlocks(g))))
  }

  // C2: S on same-tone pairs too
  const Wall = pairPiece(false)
  const C2charge = diagCommutator(Wall, pair(s => charge3(s) / 3))
  const C1 = sameResidual[1]! > 0.1 && sameResidual[2]! > 0.1
  const C2 = C2charge > 0.1

  // the example: u e- -> d nu (love 2 e01, fear 3) under S
  const uIdx = OFF[2]! + 0
  const eIdx = 8 + OFF[3]!
  const exampleTo: string[] = []

  for (let r = 0; r < 256; r++) {
    const c = uIdx * 16 + eIdx
    const z = Math.hypot(W.re[r * 256 + c]!, W.im[r * 256 + c]!)

    if (z > 1e-12) {
      const a = blockOf(Math.floor(r / 16))
      const b = blockOf(r % 16)

      exampleTo.push(
        `${a.tone ? 'fear' : 'love'} ${a.k} + ${b.tone ? 'fear' : 'love'} ${b.k} (|amp| ${z.toFixed(4)}, 3Q ${charge3(Math.floor(r / 16)) + charge3(r % 16)})`,
      )
    }
  }

  log('step 3 colour')

  // ================= STEP 4 (read) =================
  const cs = chiralSlab(WALL_L)
  const halves = ([0, 1] as const).map(half => {
    const hands = wallChirality(cs.slab, cs.sets[half]!, DOCK_ROOTS, cs.ranges[half]!.sR, cs.ranges[half]!.dR, cs.aDepths, 0.01, 0.1)
    const spans = faceSpans(cs, half)
    const wide = faceSpans(cs, half, 0.5)

    return {
      half,
      inGap: hands.inGap,
      walls: hands.walls.map(w => ({ states: w.states, chirality: w.chirality })),
      weights: spans.weights,
      wide: wide.eps.length,
    }
  })
  const plus = halves[0]!
  const plusWalls = plus.walls.filter(w => w.states > 0).length
  const halfSelects = plusWalls === 1 && halves[1]!.walls.every(w => w.states === 0)

  log('step 4')

  // ================= verdict =================
  const step1 = conjConsistent && !sameColour
  const credible = step1 && starPass && censusPass && step3Pass
  const kill = !starPass
  const instrumentsOk = I1 && I2 && I3 && I4
  const controlsOk = C1 && C2
  const status: Verdict['status'] = kill
    ? 'fail'
    : sameColour
      ? 'partial'
      : credible && instrumentsOk && controlsOk
        ? 'pass'
        : 'open'
  const word = status === 'pass' ? 'CREDIBLE' : status === 'fail' ? 'KILL' : status === 'partial' ? 'DEFECT' : 'OPEN'
  const fmt = (x: number): string => x.toExponential(1)
  const seconds = (Date.now() - started) / 1000

  return verdict({
    status,
    claim: `weak doublet as the tone Hodge star, ${word}: STEP 1 no code fixes R*'s links on fear (one-tone stream), the knit's fear beat forces 3-bar, and conj R on fear keeps every piece (like love ${fmt(likeLove)}, like fear ${fmt(likeFear)}, unlike g x conj g ${fmt(unlikeConj)}; same colour breaks it, [g x g, V] ${unlikeSame.toFixed(4)}); STEP 2 star Lambda^k(R) = Lambda^(3-k)(conj R) star exact on ${starExact.join('/')} of 648 for k 0..3, float residual ${starResidual.map(fmt).join('/')}, det R = 1 on ${detOne} of 648; census exact ${censusExact}, charge-1 maps ${chargeOne.join(', ')}; STEP 3 W = P_+ + w P_- conserves charge ${fmt(conserved.charge)}, triality ${fmt(conserved.triality)}, quark number ${fmt(conserved.quark)}, lepton number ${fmt(conserved.lepton)} (signed B ${fmt(reads.signedB)}, L ${fmt(reads.signedL)}, colour ${fmt(colourW)}); STEP 4 half + holds ${plus.walls.map((w, i) => `wall ${i ? 'B' : 'A'} ${w.states} states chi ${w.chirality.toFixed(4)}`).join(', ')}, half - ${halves[1]!.inGap} in-gap, so half + ${halfSelects ? 'selects' : 'does not select'} one wall's chirality`,
    metrics: {
      order,
      unitary,
      detOne,
      detFloatGap,
      likeLove,
      likeFear,
      unlikeConj,
      unlikeSame,
      starResidualMax,
      starExact0: starExact[0]!,
      starExact1: starExact[1]!,
      starExact2: starExact[2]!,
      starExact3: starExact[3]!,
      perElementWorst: Math.max(...perElementWorst),
      censusExact: censusExact ? 1 : 0,
      chargeOneMaps: chargeOne.length,
      tauSquare,
      tauSym,
      tauColour,
      unitaryW,
      chargeCommutator: conserved.charge,
      trialityCommutator: conserved.triality,
      quarkCommutator: conserved.quark,
      leptonCommutator: conserved.lepton,
      signedBCommutator: reads.signedB,
      signedLCommutator: reads.signedL,
      colourCommutator: colourW,
      plusWallA: plus.walls[0]!.states,
      plusWallB: plus.walls[1]?.states ?? 0,
      plusChiA: plus.walls[0]!.chirality,
      plusChiB: plus.walls[1]?.chirality ?? 0,
      minusInGap: halves[1]!.inGap,
      minusWide: halves[1]!.wide,
      halfSelects: halfSelects ? 1 : 0,
      seconds,
    },
    control: {
      sameColourStar1: sameResidual[1]!,
      sameColourStar2: sameResidual[2]!,
      sameColourStar0: sameResidual[0]!,
      sameColourStar3: sameResidual[3]!,
      tiltDetWith: tiltWith,
      tiltDetWithout: tiltWithout,
      allPairsCharge: C2charge,
    },
    notes: `L1. Instruments I1 ${I1} (closed ${closed}, order ${order}, unitary ${unitary}), I2 ${I2} (det ${tiltDet.map(x => x.toFixed(3)).join(',')}: with det ${fmt(tiltWith)}, without ${tiltWithout.toFixed(4)}), I3 ${I3}, I4 ${I4} (${fmt(unitaryW)}); controls C1 ${C1} (fear carrying R: star residual k 0..3 ${sameResidual.map(x => x.toFixed(4)).join('/')}), C2 ${C2} (S on every pair: charge ${C2charge.toFixed(4)}). tau colour ${fmt(tauColour)}. Census nonzero off-diagonal: ${nonzero.join('; ')}. Diagonal dims ${homDim.map((r, i) => r[i]).join(',')}. Example S on u e- (love 2 e01, fear 3): ${exampleTo.join(' | ')}. STEP 4 per half: ${halves.map(h => `half ${h.half ? '-' : '+'}: in-gap ${h.inGap}, ${h.walls.map((w, i) => `wall ${i ? 'B' : 'A'} ${w.states} chi ${w.chirality.toFixed(4)}`).join(', ')}, depth weights ${h.weights.map(x => x.toFixed(4)).join(' ')}, levels within 0.5 of pi ${h.wide}`).join('; ')}. ${seconds.toFixed(1)} s.`,
  })
}
