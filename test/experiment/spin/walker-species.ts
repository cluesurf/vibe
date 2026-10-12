// THE WALKER STATE SPACE, SPECIES BY SPECIES (E-SPN-0205, from next-code and the overlay's claimed codes immediately
// before writing; moving-matter item 0094, decision 020 gate G3, research/one-walker-costs.md sections 3 and 4).
// Decision 020 replaced R*'s members by walkers whose internal space is Lambda(C^3) per tone times the register, grade k a
// conserved species label, the coin acting as G (x) 1 and a link as Lambda^k(R) (love) or Lambda^k(conj R) (fear), and
// the Pauli principle per walker. This file re-reads, on that state space, what 0002 (E-SPN-0191) read on members, the
// lift of R*'s pair piece between walkers of two grades, and states which charge 0001's Coulomb track put on the pair.
//
// DERIVED BEFORE THE RUN.
// 1. EACH SPECIES HAS A ONE-BODY WALK, AND 0002'S ARGUMENT APPLIES TO IT UNCHANGED (L1). On 0002's exact box (two docks
//    of 4 modes, beat h = stream (mixer on Q_h), code/measure/register-statistics toyBox) a grade-k walker's mode is
//    (box mode, Lambda^k colour state): N = 8 C(3, k) walker modes (8, 24, 24, 8). Its beat is the box beat with the
//    stream's dock-crossing hops carrying the colour: the hops 1 -> 6 and 5 -> 2 (one direction, swapped by the box's
//    translation) carry Lambda^k(R), the hops 2 -> 5 and 6 -> 1 (the other direction) Lambda^k(R)^dag, every other mode
//    the identity. R = diag(1, w, w^2) F / (i sqrt 3), F the Z3 Fourier matrix: det R = 1, every entry in Q(w), not
//    monomial, so Lambda^1 and Lambda^2 walkers are genuinely mixed by the link and the box stays exact. The beats are
//    unitary (a permutation with unitary blocks times a unitary mixer) and translation covariant (the field is uniform).
//    So minors (fermions) on walker modes are unitary, multiplicative and covariant, and the walker full sea goes to
//    itself with det(beat), a unit; permanents are unitary, multiplicative and covariant too, but perm(beat) of a mixing
//    beat has modulus below 1 and a 2-walker 0/1 start sends weight to doubly held walker modes. PREDICTED, on every
//    species (4 grades x 2 tones): minors keep R, C, T, V, N; permanents fail V and N; the hard-core control fails.
// 2. THE EXCHANGE SIGN of the survivor is -1 on every 1-, 2- and 3-walker state and on 2 and 3 holes of the walker sea,
//    exactly as 0002 read for members, since the second-quantized swap of two walker modes is a permutation matrix and
//    its minor is the parity. This is per walker: the Pauli principle now forbids two walkers in one (box mode, colour)
//    mode, in place of E-SPN-0175's one member per (slot, register, role) mode.
// 3. THE TURN (L1). A walker carries ONE register whatever its grade (decision 020 point 1). A spatial rotation g acts on
//    it by the spinor lift L(s) (s g's rotor in Cl+(4), 0002's lift with turn -1) and as the identity on colour, so a
//    grade-k walker's action is L(s) (x) 1_C(3,k), and its 2 pi turn (the order-th power) is -1 on every grade. The
//    minors action reads +1 on every grade (0002). The member reading would give a Lambda^k state k registers, turn
//    (-1)^k: +1 for Lambda^2 (control C2 reads it explicitly on the 64-dim two-register space).
// 4. THE PAIR LIFT (L1, research section 3). R*'s pair piece on members i, j is 1 + (e^(i phi(y)) - 1) Q_i Q_j
//    (register-holes.ts:18, :1076-1086). In the walker reading the j members of walker A and the k of walker B share
//    their walker's register, so Q_a = Q_A for every member a, and each of the j k inter-walker pairs is the same
//    operator on the two-register space. Q_A Q_B is a projector, so the product is 1 + (e^(i j k phi(y)) - 1) Q_A Q_B.
//    The pairs inside one walker sit at relative dock 0 on one register: Q_a Q_b = Q_A^2 = Q_A, product
//    1 + (e^(i C(k, 2) phi(0)) - 1) Q_A, phi(0) the contact. Between doublet partners (love k, fear 3 - k) the self
//    phase differs by C(k, 2) - C(3 - k, 2) = 2k - 3 contact angles: -3, -1, 1, 3.
// 5. THE CHARGE OF 0001'S TRACK (read, not gated; STEP 3). The pull is alpha G(y), alpha = 24 pi / (mu a_B)
//    (register-coulomb-track.ts:177-178), counted as n(y) = floor(alpha G(y) / theta) (register-reduced.ts:562-571),
//    which is continuum hydrogen with alpha' = alpha / (24 pi) = 1 / (mu a_B) and E_b = mu alpha'^2 / 2
//    (register-coulomb-hold.ts:27, :39, :519). No charge enters: the pair's charge product is 1, folded into a_B, which
//    the ladder scans. So 0001 put charge 1 on each member, which the member reading's members (1/3 each,
//    member-charge.ts:26-29) do not carry, and which a Lambda^3 walker (3 thirds) does. At a fixed fine structure
//    constant a member pair's pull is 1/9 of what the track used; a Lambda^3 walker pair's is 9 times a member pair's
//    (q^2, as G1's pump), i.e. exactly what the track used. Under the walker reading the ladder needs no rescaling.
//
// GATES (fixed 2026-10-09 in item 0094, copied here before any run).
//   PASS when STEP 1 gives the minors and the -1 turn on every species to 1e-12, and STEP 2 agrees to 1e-12 on all 16
//     (j, k), j, k in 0..3.
//   REVERSE (decision 020 G3, reported as fail) when some species' minors quantization fails reversibility or the full
//     sea, or the Lambda^3 turn is +1.
//   OPEN when STEP 2 disagrees (the lift is then not forced): the smallest (j, k) is reported.
//   STEP 3 is read, not gated.
//   Operational reading of "gives the minors": on each species minors keep R, C, T, V and N exactly (Q(w) arithmetic,
//   so 1e-12 is met with 0), permanents fail at least one, and the minors' exchange sign is one value, -1, on every
//   reading. "The -1 turn": the walker action L(s) (x) 1 has 2 pi turn -1 on all of W(F4)'s one-plane rotations,
//   within 1e-12. A STEP 1 miss that is not a REVERSE clause makes the verdict partial.
// CONTROLS. C1 the hard-core quantization (the exchange sign typed +1) fails at least one of R, C, T, V on every species.
//  C2 the member reading's Lambda^2 turn (two registers, L(s) (x) L(s)) reads +1 on every rotation, so the turn read
//  separates the readings. C3 the "phase per pair of walkers" lift 1 + (e^(i phi) - 1) Q_A Q_B differs from the member
//  piece by more than 1e-6 on some relative dock for every (j, k) with j k >= 2.
// INSTRUMENT. I1 the sparse second quantization reproduces 0002's dense exact functions (unitary, multiplicative,
//  covariant, seaKept, capacityLeak) on the Lambda^0 love box for minors and permanents, and the Lambda^0 walker's
//  beats equal toyBox's exactly. I2 R is unitary with det 1 exactly and every Lambda^k(R) is unitary exactly. I3 the
//  rule's projectors 24 Q_S and 48 Q_D commute with slots(g) (x) L(s) within 1e-12 on every rotation (0002's spinor
//  covariance; the colour factor is the identity on both sides). I4 the engine-frame build of the pair piece (members
//  enumerated with their own fibers, sector the first 4 of 8, phases multiplied per active pair, as register-holes
//  pairPhases does) agrees with the operator build.
//
// DETERMINISM: no random numbers; every state of every box is enumerated. EXACT: STEP 1's quantizations are BigInt over
// Q(w). Floats: the turn sign (rotor entries are irrational, as in 0002), the boson sea on 24 walker modes (Ryser, a read),
// and STEP 2 (the angles are R*'s float angles).
//
// FIRST RUN (tmp/wspec-gate.log in the moving-matter worktree, 117 s): PASS, as predicted. No probe before it, no gate
//  moved, none rerun.
//  - STEP 1: on all 8 species minors keep R, C, T, V (|det|^2 = 1 exactly) and N. Permanents keep R, C, T and fail V
//    (|perm|^2 0.552742 on Lambda^0 and Lambda^3, 0.002085 on Lambda^1 and Lambda^2) and N (leak 0.137755 and 0.690415).
//    The hard-core control fails R, C and V everywhere. Exchange sign -1 on all readings (396 per 8-mode species,
//    12,708 per 24-mode species); hard-core typed +1. Turn of L(s) (x) 1 over 190 one-plane rotations: -1 on every
//    grade; minors action +1. Lambda^0 and Lambda^3 walks equal 0002's box exactly (det R = 1: colour-blind).
//  - STEP 2: member piece against the walker lift, worst 2.27e-15 over all 16 (j, k) and 10 distinct angles (L 4 torus,
//    hole and member signs, both beats); self-phase gaps at most 1.4e-15. phi(0) = -2.667785 (holes, E-SPN-0175's
//    rule; +2.667785 as members). Self-phase C(k, 2) phi(0): 0, 0, phi(0), 3 phi(0) (= -1.720171 wrapped, holes);
//    love k minus fear 3 - k: -3, -1, +1, +3 contact angles.
//  - Controls: C1 holds, C2 the member reading's Lambda^2 turn reads +1, C3 the walker-pair lift misses by at least
//    0.456. Instrument: I1 the sparse path reproduces 0002's dense verdicts on Lambda^0, I2 det R = 1, I3 gap 4.4e-16,
//    I4 the engine-frame build agrees.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  qw,
  qwConj,
  qwIsZero,
  qwMul,
  qwSub,
  qwValue,
  QW_ONE,
  QW_ZERO,
  type QW,
  type QWMatrix,
} from '@/code/measure/flavor-register'
import { qwDet, qwMatMulSq } from '@/code/measure/register-many-body'
import { det4 } from '@/code/measure/chiral-register'
import {
  f4Group,
  partnerProjector48,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  BOSON,
  capacityLeak,
  commutatorGap,
  covariant,
  FERMION,
  HARD_CORE,
  leftMultiplication,
  multiplicative,
  permutationMatrix,
  powerSign,
  qwPermanent,
  seaKept,
  simpleRotations,
  spinLift,
  toyBox,
  unitary,
  type Quantization,
  type State,
} from '@/code/measure/register-statistics'
import { torus } from '@/code/measure/register-sea'
import { pairAngles } from '@/code/measure/register-holes'
import {
  expand,
  gamma,
  permanentFloat,
  product,
  spaceOf,
  sparseEqual,
  sparseLeak,
  sparseUnitary,
  wedge,
  type Col,
} from '@/code/measure/walker-species'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const CAP = 8
const KS: readonly number[] = [1, 2, 3]
const TOL = 1e-12
const LIFT_GAP = 1e-6
const STREAM: readonly number[] = [3, 6, 5, 0, 7, 2, 1, 4]
// the hops carrying the link: one direction (Lambda(R)) and the other (its dagger)
const FORWARD = new Set([1, 5])
const BACKWARD = new Set([2, 6])

const flag = (b: boolean): number => (b ? 1 : 0)
const real = (x: QW): number => qwValue(x)[0]
const binom = (n: number, k: number): number =>
  k < 0 || k > n ? 0 : k === 0 ? 1 : (binom(n - 1, k - 1) * n) / k

export default experiment({
  id: 'spin/walker-species',
  code: 'E-SPN-0205',
  title:
    'explores whether the one-walker state space keeps the register rule\'s statistics species by species: on 0002\'s exact box, every walker species (grades 0 to 3, both tones, the link acting as Lambda^k of a non-monomial det-1 colour) keeps minors over walker modes reversible, composing, covariant, with the full sea one branch and one walker a mode, while permanents fail; the exchange sign is -1 and the 2 pi turn of the one register a walker carries is -1 on every grade; R*\'s member pair piece on co-located members lifts to 1 + (e^(i j k phi) - 1) Q_A Q_B on all 16 (j, k), with self-phase C(k, 2) phi(0)',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return walkerSpeciesRun()
  },
})

// ---------------- colour ----------------

const W1 = qw(0n, 1n)
const W2 = qw(-1n, -1n)
const wPow = (e: number): QW => [QW_ONE, W1, W2][((e % 3) + 3) % 3]!

// R = diag(1, w, w^2) F / (i sqrt 3), 1 / (i sqrt 3) = (-1 - 2w) / 3
function colourR(): QWMatrix {
  const c = qw(-1n, -2n, 3n)

  return [0, 1, 2].map(a =>
    [0, 1, 2].map(b => qwMul(wPow(a), qwMul(c, wPow(a * b)))),
  )
}

const dagger = (A: QWMatrix): QWMatrix =>
  (A[0] ?? []).map((_, j) => A.map(r => qwConj(r[j]!)))
const conjugate = (A: QWMatrix): QWMatrix => A.map(r => r.map(qwConj))

const isIdentity = (A: QWMatrix): boolean =>
  A.every((r, i) =>
    r.every(
      (x, j) => qwIsZero(qwSub(x, i === j ? QW_ONE : QW_ZERO)),
    ),
  )
const qwMatEqual = (A: QWMatrix, B: QWMatrix): boolean =>
  A.every((r, i) => r.every((x, j) => qwIsZero(qwSub(x, B[i]![j]!))))

// ---------------- the species' walk on the box ----------------

type Species = { k: number; tone: 'love' | 'fear'; d: number; N: number }

const SPECIES: Species[] = [0, 1, 2, 3].flatMap(k =>
  (['love', 'fear'] as const).map(tone => ({
    k,
    tone,
    d: binom(3, k),
    N: 8 * binom(3, k),
  })),
)

const zeros = (n: number): QWMatrix =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => QW_ZERO))

/** The beats and translation of species sp on walker modes (box mode m, colour c) -> m d + c. */
function speciesBox(
  sp: Species,
  R: QWMatrix,
): { beats: QWMatrix[]; translation: QWMatrix; mixers: QWMatrix[] } {
  const box = toyBox(ringUnit(LIGHT[0], LIGHT[1]))
  const stream = permutationMatrix([...STREAM])
  // the mixers: stream^T beat (the stream is a permutation)
  const mixers = box.beats.map(B => qwMatMulSq(dagger(stream), B))
  const C = wedge(sp.tone === 'love' ? R : conjugate(R), sp.k)
  const Cd = dagger(C)
  const d = sp.d
  const N = sp.N
  const Scol = zeros(N)

  for (let m = 0; m < 8; m++) {
    const link = FORWARD.has(m) ? C : BACKWARD.has(m) ? Cd : null

    for (let a = 0; a < d; a++) {
      for (let b = 0; b < d; b++) {
        Scol[STREAM[m]! * d + a]![m * d + b] = link
          ? link[a]![b]!
          : a === b
            ? QW_ONE
            : QW_ZERO
      }
    }
  }

  const lift = (M: QWMatrix): QWMatrix => {
    const out = zeros(N)

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        for (let a = 0; a < d; a++) {
          out[i * d + a]![j * d + a] = M[i]![j]!
        }
      }
    }

    return out
  }

  return {
    beats: mixers.map(M => qwMatMulSq(Scol, lift(M))),
    translation: lift(box.translation),
    mixers,
  }
}

// ---------------- STEP 1: one species ----------------

type Survival = {
  reversible: boolean
  composes: boolean
  covariant: boolean
  sea: boolean
  capacity: boolean
  survives: boolean
  seaAbs2: number[]
  leak: number
}

function survival(
  q: Quantization,
  beats: QWMatrix[],
  T: QWMatrix,
): Survival {
  const N = T.length
  const [b1, b2] = beats as [QWMatrix, QWMatrix]

  let reversible = true
  let composes = true
  let cov = true
  let leak = 0

  for (const n of KS) {
    const sp = spaceOf(q, N, n)
    const G = beats.map(P => gamma(sp, P))
    const GT = gamma(sp, T)

    reversible &&= G.every(g => sparseUnitary(sp, g))
    composes &&= sparseEqual(
      product(sp, G[1]!, G[0]!),
      gamma(sp, qwMatMulSq(b2, b1)),
    )
    cov &&= G.every(g => sparseEqual(product(sp, GT, g), product(sp, g, GT)))

    if (n >= 2) {
      leak = Math.max(leak, ...G.map(g => sparseLeak(sp, g)))
    }
  }

  const seaAbs2 = beats.map(P => {
    if (q.name === 'fermion') {
      const a = qwDet(P)

      return real(qwMul(a, qwConj(a)))
    }

    if (N <= 8) {
      const a = qwPermanent(P)

      return real(qwMul(a, qwConj(a)))
    }

    const [r, i] = permanentFloat(P)

    return r * r + i * i
  })
  // the fermion sea exactly (|det|^2 = 1 in Q(w)); the permanent's exactly on 8 modes, by float on 24 (a fail read)
  const sea =
    q.name === 'fermion'
      ? beats.every(P => {
          const a = qwDet(P)

          return qwIsZero(qwSub(qwMul(a, qwConj(a)), QW_ONE))
        })
      : seaAbs2.every(x => Math.abs(x - 1) <= TOL)
  const capacity = leak === 0

  return {
    reversible,
    composes,
    covariant: cov,
    sea,
    capacity,
    survives: reversible && composes && cov && sea && capacity,
    seaAbs2,
    leak,
  }
}

type Exchange = { signs: Set<number | null>[]; count: number; sign: number | null }

function exchangeSigns(q: Quantization, N: number): Exchange {
  const all = Array.from({ length: N }, (_, i) => i)
  const half = N / 2
  const swapCols = (a: number, b: number): Col[] =>
    all.map(i => [[i === a ? b : i === b ? a : i, QW_ONE]])
  const pairsOf = (s: State): [number, number][] =>
    s.flatMap((a, i) => s.slice(i + 1).map(b => [a, b] as [number, number]))
  const sets = Array.from({ length: 5 }, () => new Set<number | null>())

  let count = 0

  const read = (state: State, reference: State, a: number, b: number, into: number): void => {
    const cols = swapCols(a, b)
    const col = expand(q, cols, state)
    const key = state.join(',')
    const ref = expand(q, cols, reference).get(reference.join(',')) ?? QW_ZERO
    const own = col.get(key) ?? QW_ZERO
    const eigen = col.size === 1 && col.has(key)

    let sign: number | null = null

    if (eigen && own.b === 0n && ref.b === 0n && ref.a !== 0n) {
      const ratio = Number(own.a * ref.d) / Number(ref.a * own.d)

      sign = ratio === 1 ? 1 : ratio === -1 ? -1 : null
    }

    sets[into]!.add(sign)
    count++
  }

  // one walker in dock x with dock y full, swapped with the sea walker at its translate
  for (let m = 0; m < half; m++) {
    read([m, ...all.slice(half)], [], m, m + half, 0)
  }

  for (const s of FERMION.states(N, 2)) {
    read(s, [], s[0]!, s[1]!, 1)
  }

  for (const s of FERMION.states(N, 3)) {
    for (const [a, b] of pairsOf(s)) {
      read(s, [], a, b, 2)
    }
  }

  for (const [k, into] of [
    [2, 3],
    [3, 4],
  ] as const) {
    for (const H of FERMION.states(N, k)) {
      const state = all.filter(i => !H.includes(i))

      for (const [a, b] of pairsOf(H)) {
        read(state, all, a, b, into)
      }
    }
  }

  const values = sets.map(s => (s.size === 1 ? [...s][0]! : null))
  const sign = values.every(v => v !== null && v === values[0]) ? values[0]! : null

  return { signs: sets, count, sign }
}

// ---------------- the turn ----------------

const kron = (A: readonly (readonly number[])[], B: readonly (readonly number[])[]): number[][] =>
  A.flatMap(ra =>
    B.map(rb => ra.flatMap(a => rb.map(b => a * b))),
  )
const eye = (n: number): number[][] =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))

// ---------------- STEP 2: the pair lift ----------------

type CMat = { re: Float64Array; im: Float64Array; n: number }

const cEye = (n: number): CMat => {
  const m = { re: new Float64Array(n * n), im: new Float64Array(n * n), n }

  for (let i = 0; i < n; i++) {
    m.re[i * n + i] = 1
  }

  return m
}

function cMul(A: CMat, B: CMat): CMat {
  const n = A.n
  const out = { re: new Float64Array(n * n), im: new Float64Array(n * n), n }

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = A.re[i * n + k]!
      const ai = A.im[i * n + k]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        out.re[i * n + j]! += ar * B.re[k * n + j]! - ai * B.im[k * n + j]!
        out.im[i * n + j]! += ar * B.im[k * n + j]! + ai * B.re[k * n + j]!
      }
    }
  }

  return out
}

// 1 + (e^(i theta) - 1) P, P real
function phasePiece(P: Float64Array, n: number, theta: number): CMat {
  const m = cEye(n)
  const cr = Math.cos(theta) - 1
  const ci = Math.sin(theta)

  for (let k = 0; k < n * n; k++) {
    m.re[k]! += cr * P[k]!
    m.im[k]! += ci * P[k]!
  }

  return m
}

function cGap(A: CMat, B: CMat): number {
  let g = 0

  for (let k = 0; k < A.re.length; k++) {
    g = Math.max(g, Math.hypot(A.re[k]! - B.re[k]!, A.im[k]! - B.im[k]!))
  }

  return g
}

// the 8-dim register's sector projector in a non-coordinate frame: V diag(1,1,1,1,0,0,0,0) V^T, V the Sylvester Hadamard / sqrt 8
function sectorProjector(): Float64Array {
  const n = 8
  const V = (i: number, j: number): number => {
    let b = i & j
    let p = 0

    while (b) {
      p ^= b & 1
      b >>= 1
    }

    return (p ? -1 : 1) / Math.sqrt(n)
  }
  const Q = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0

      for (let c = 0; c < 4; c++) {
        s += V(i, c) * V(j, c)
      }

      Q[i * n + j] = s
    }
  }

  return Q
}

const kronReal = (A: Float64Array, B: Float64Array, n: number): Float64Array => {
  const out = new Float64Array(n * n * n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        for (let l = 0; l < n; l++) {
          out[(i * n + k) * n * n + j * n + l] = A[i * n + j]! * B[k * n + l]!
        }
      }
    }
  }

  return out
}

const realMul = (A: Float64Array, B: Float64Array, n: number): Float64Array => {
  const out = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      for (let j = 0; j < n; j++) {
        out[i * n + j]! += A[i * n + k]! * B[k * n + j]!
      }
    }
  }

  return out
}

const wrap = (x: number): number => {
  const t = (((x + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

  return t - Math.PI
}

// ---------------- the run ----------------

export function walkerSpeciesRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

  // ---------- I2: colour ----------
  const R = colourR()
  const detR = qwDet(R)
  const I2 =
    qwIsZero(qwSub(detR, QW_ONE)) &&
    [0, 1, 2, 3].every(k => {
      const C = wedge(R, k)
      const Cf = wedge(conjugate(R), k)

      return isIdentity(qwMatMulSq(dagger(C), C)) && isIdentity(qwMatMulSq(dagger(Cf), Cf))
    }) &&
    qwIsZero(qwSub(wedge(R, 3)[0]![0]!, QW_ONE))

  // ---------- I1: the sparse path against 0002's dense functions on Lambda^0 love ----------
  const box = toyBox(ringUnit(LIGHT[0], LIGHT[1]))
  const zeroBox = speciesBox(SPECIES[0]!, R)
  const I1beats =
    zeroBox.beats.every((B, h) => qwMatEqual(B, box.beats[h]!)) &&
    qwMatEqual(zeroBox.translation, box.translation)
  const dense = (q: Quantization) => ({
    reversible: KS.every(k => box.beats.every(P => unitary(q, P, k))),
    composes: KS.every(k => multiplicative(q, box.beats[1]!, box.beats[0]!, k)),
    covariant: KS.every(k => box.beats.every(P => covariant(q, P, box.translation, k))),
    sea: box.beats.every(P => seaKept(q, P).kept),
    capacity: [2, 3].every(k => box.beats.every(P => qwIsZero(capacityLeak(q, P, k)))),
  })

  log('instruments')

  // ---------- STEP 1 ----------
  type SpeciesRead = {
    sp: Species
    fermion: Survival
    boson: Survival
    hardCore: Survival
    exchange: Exchange
    typed: Exchange
  }

  const reads: SpeciesRead[] = []

  for (const sp of SPECIES) {
    const b = speciesBox(sp, R)
    const fermion = survival(FERMION, b.beats, b.translation)
    const boson = survival(BOSON, b.beats, b.translation)
    const hardCore = survival(HARD_CORE, b.beats, b.translation)
    const exchange = exchangeSigns(FERMION, sp.N)
    const typed = exchangeSigns(HARD_CORE, sp.N)

    reads.push({ sp, fermion, boson, hardCore, exchange, typed })
    log(`species ${sp.tone} ${sp.k}`)
  }

  const zeroRead = reads[0]!
  const denseF = dense(FERMION)
  const denseB = dense(BOSON)
  const same = (a: ReturnType<typeof dense>, s: Survival): boolean =>
    a.reversible === s.reversible &&
    a.composes === s.composes &&
    a.covariant === s.covariant &&
    a.sea === s.sea &&
    a.capacity === s.capacity
  const I1 = I1beats && same(denseF, zeroRead.fermion) && same(denseB, zeroRead.boson)

  // the turn: walker action L(s) (x) 1_d, the minors action, the member reading's Lambda^2 (L (x) L)
  const group = f4Group()
  const simple = simpleRotations(group, det4)
  const qS = singletProjector24()
  const qD = partnerProjector48()
  const walkerTurn = [0, 1, 2, 3].map(() => new Set<number | null>())
  const minorsTurn = new Set<number | null>()
  const memberTwo = new Set<number | null>()

  let spinGap = 0

  for (const { g, order } of simple) {
    const L = leftMultiplication(spinLift(g.matrix))

    for (const k of [0, 1, 2, 3]) {
      walkerTurn[k]!.add(powerSign(kron(L, eye(binom(3, k))), order, TOL))
    }

    minorsTurn.add(powerSign(g.register, order, TOL))
    memberTwo.add(powerSign(kron(L, L), order, TOL))
    spinGap = Math.max(
      spinGap,
      commutatorGap(g.slots, L, qS),
      commutatorGap(g.slots, L, qD),
    )
  }

  const single = (s: Set<number | null>): number | null =>
    s.size === 1 ? [...s][0]! : null
  const turns = walkerTurn.map(single)
  const I3 = spinGap <= TOL

  log('turn')

  // ---------- STEP 2 ----------
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const T4 = torus(4)
  // E-SPN-0175's rule on holes (angles reversed), beat 1; beat 2 applies the same angles reversed again
  const holeAngles = pairAngles(T4, -sAng, CAP, -2 * vAng)
  const memberAngles = pairAngles(T4, sAng, CAP, 2 * vAng)
  const angles = new Set<number>()

  for (const set of [holeAngles, memberAngles]) {
    for (const a of set) {
      angles.add(a)
      angles.add(-a)
    }
  }

  const Q = sectorProjector()
  const Qidem = Math.max(...Array.from(realMul(Q, Q, 8), (x, i) => Math.abs(x - Q[i]!)))
  const QQ = kronReal(Q, Q, 8)
  const lift: { j: number; k: number; gap: number; walkerPairGap: number; frameGap: number }[] = []

  for (let j = 0; j <= 3; j++) {
    for (let k = 0; k <= 3; k++) {
      let gap = 0
      let walkerPairGap = 0
      let frameGap = 0

      for (const phi of angles) {
        // the operator build: j k identical pair factors on the shared two-register space
        const factor = phasePiece(QQ, 64, phi)

        let member = cEye(64)

        for (let p = 0; p < j * k; p++) {
          member = cMul(member, factor)
        }

        gap = Math.max(gap, cGap(member, phasePiece(QQ, 64, j * k * phi)))
        walkerPairGap = Math.max(
          walkerPairGap,
          cGap(member, j * k === 0 ? cEye(64) : factor),
        )

        // the engine-frame build: j + k members with their own fibers, co-located walkers' members sharing one
        for (let bA = 0; bA < 8; bA++) {
          for (let bB = 0; bB < 8; bB++) {
            const fibers = [
              ...Array<number>(j).fill(bA),
              ...Array<number>(k).fill(bB),
            ]

            let pr = 1
            let pi = 0

            for (let a = 0; a < j; a++) {
              for (let b = j; b < j + k; b++) {
                if (fibers[a]! < 4 && fibers[b]! < 4) {
                  const x = pr * Math.cos(phi) - pi * Math.sin(phi)

                  pi = pr * Math.sin(phi) + pi * Math.cos(phi)
                  pr = x
                }
              }
            }

            const on = bA < 4 && bB < 4
            const wr = on ? Math.cos(j * k * phi) : 1
            const wi = on ? Math.sin(j * k * phi) : 0

            frameGap = Math.max(frameGap, Math.hypot(pr - wr, pi - wi))
          }
        }
      }

      lift.push({ j, k, gap, walkerPairGap, frameGap })
    }
  }

  // the self-phase: C(k, 2) pairs on one register, Q_a Q_b = Q Q
  const phi0Hole = holeAngles[T4.origin]!
  const phi0Member = memberAngles[T4.origin]!
  const QsQs = realMul(Q, Q, 8)
  const selfGap = [0, 1, 2, 3].map(k => {
    const c = binom(k, 2)

    let worst = 0

    for (const phi of [phi0Hole, phi0Member]) {
      const factor = phasePiece(QsQs, 8, phi)

      let m = cEye(8)

      for (let p = 0; p < c; p++) {
        m = cMul(m, factor)
      }

      worst = Math.max(worst, cGap(m, phasePiece(Q, 8, c * phi)))
    }

    return worst
  })
  const selfTable = [0, 1, 2, 3].map(k => ({
    k,
    pairs: binom(k, 2),
    hole: wrap(binom(k, 2) * phi0Hole),
    member: wrap(binom(k, 2) * phi0Member),
    split: binom(k, 2) - binom(3 - k, 2),
  }))

  log('lift')

  // ---------- gates ----------
  const minorsOk = reads.every(r => r.fermion.survives)
  const permanentsFail = reads.every(r => !r.boson.survives)
  const exchangeOk = reads.every(r => r.exchange.sign === -1)
  const turnOk = turns.every(t => t === -1)
  const STEP1 = minorsOk && permanentsFail && exchangeOk && turnOk
  const reverse =
    reads.some(r => !r.fermion.reversible || !r.fermion.sea) || turns[3] === 1
  const liftGap = Math.max(...lift.map(l => l.gap))
  const STEP2 = lift.every(l => l.gap <= TOL) && selfGap.every(g => g <= TOL)
  const firstMiss = lift.find(l => l.gap > TOL)
  const C1 = reads.every(
    r => !r.hardCore.reversible || !r.hardCore.composes || !r.hardCore.covariant || !r.hardCore.sea,
  )
  const C2 = single(memberTwo) === 1
  const multi = lift.filter(l => l.j * l.k >= 2)
  const C3 = multi.every(l => l.walkerPairGap > LIFT_GAP)
  const C3least = Math.min(...multi.map(l => l.walkerPairGap))
  const I4 = lift.every(l => l.frameGap <= TOL)
  const controls = C1 && C2 && C3
  const instrument = I1 && I2 && I3 && I4
  const status: Verdict['status'] = reverse
    ? 'fail'
    : !STEP2
      ? 'open'
      : STEP1 && controls && instrument
        ? 'pass'
        : 'partial'

  const set = (s: Set<number | null>): string =>
    [...s].map(x => (x === null ? 'none' : String(x))).join('/')
  const surv = (s: Survival): string =>
    `R ${s.reversible} C ${s.composes} T ${s.covariant} V ${s.sea} (|amp|^2 ${s.seaAbs2.map(x => x.toFixed(6)).join(', ')}) N ${s.capacity} (leak ${s.leak.toFixed(6)})`
  const speciesClaim = reads
    .map(
      r =>
        `${r.sp.tone} Lambda^${r.sp.k} (${r.sp.N} walker modes): minors ${surv(r.fermion)}; permanents ${surv(r.boson)}; hard-core ${surv(r.hardCore)}; exchange ${r.exchange.sign} on ${r.exchange.count} readings (${r.exchange.signs.map(set).join(', ')}), hard-core typed ${r.typed.sign}`,
    )
    .join('. ')
  const metrics: Record<string, number> = {
    STEP1: flag(STEP1),
    STEP2: flag(STEP2),
    reverse: flag(reverse),
    minorsOk: flag(minorsOk),
    permanentsFail: flag(permanentsFail),
    exchangeOk: flag(exchangeOk),
    turnOk: flag(turnOk),
    liftGap,
    selfGapMax: Math.max(...selfGap),
    walkerPairLeast: C3least,
    phi0Hole,
    phi0Member,
    spinGap,
    Qidem,
    simpleRotations: simple.length,
    C1: flag(C1),
    C2: flag(C2),
    C3: flag(C3),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    I4: flag(I4),
    seconds: (Date.now() - started) / 1000,
  }

  for (const r of reads) {
    const key = `${r.sp.tone}${r.sp.k}`

    metrics[`${key}_minors`] = flag(r.fermion.survives)
    metrics[`${key}_permanents`] = flag(r.boson.survives)
    metrics[`${key}_bosonSea`] = Math.max(...r.boson.seaAbs2)
    metrics[`${key}_bosonLeak`] = r.boson.leak
    metrics[`${key}_exchange`] = r.exchange.sign ?? 0
    metrics[`${key}_readings`] = r.exchange.count
  }

  turns.forEach((t, k) => (metrics[`turn${k}`] = t ?? 0))
  lift.forEach(l => {
    metrics[`lift_${l.j}${l.k}`] = l.gap
  })

  return verdict({
    status,
    claim: `STEP 1 ${STEP1}: ${speciesClaim}. Turn of the walker action L(s) (x) 1 over ${simple.length} one-plane rotations: ${walkerTurn.map((s, k) => `Lambda^${k} ${set(s)}`).join(', ')}; minors action ${set(minorsTurn)}. STEP 2 ${STEP2}: member piece against 1 + (e^(i j k phi) - 1) Q_A Q_B over ${angles.size} distinct angles (hole and member signs, both beats, L 4 torus), worst ${liftGap.toExponential(2)} on all 16 (j, k)${firstMiss ? `, first miss (${firstMiss.j}, ${firstMiss.k})` : ''}; self-phase gaps ${selfGap.map(g => g.toExponential(1)).join(', ')}; self-phase C(k, 2) phi(0), phi(0) ${phi0Hole.toFixed(6)} (holes, E-SPN-0175's rule) / ${phi0Member.toFixed(6)} (members): ${selfTable.map(s => `k ${s.k}: ${s.pairs} phi(0) = ${s.hole.toFixed(6)} / ${s.member.toFixed(6)}, love k - fear 3-k ${s.split} phi(0)`).join('; ')}. Controls C1 ${C1} C2 ${C2} (member-reading Lambda^2 turn ${set(memberTwo)}) C3 ${C3} (walker-pair lift misses by at least ${C3least.toExponential(2)}); instrument I1 ${I1} I2 ${I2} (det R = 1) I3 ${I3} (gap ${spinGap.toExponential(2)}) I4 ${I4}. ${reverse ? 'REVERSE (decision 020 G3).' : ''}`,
    metrics,
    control: { C1: flag(C1), C2: flag(C2), C3: flag(C3), instrument: flag(instrument) },
    notes: `L1. STEP 3 (read): 0001's track (E-SPN-0200, and E-SPN-0183, E-SPN-0173 before it) puts no charge factor on the pull: alpha = 24 pi / (mu a_B) (register-coulomb-track.ts:177-178), n(y) = floor(alpha G(y) / theta) (register-reduced.ts:562-571), continuum hydrogen alpha' = alpha / (24 pi) = 1 / (mu a_B) (register-coulomb-hold.ts:27, :39, :519), so the pair's charge product is 1, folded into a_B. A member carries 1/3 (member-charge.ts:26-29), so at fixed fine structure a member pair's pull is 1/9 of the track's; a Lambda^3 walker (3 thirds) pair's is 9 times a member pair's, exactly the track's: the ladder needs no rescaling under the walker reading. Colour R = diag(1, w, w^2) F / (i sqrt 3). Q a rank-4 projector in the Hadamard frame (idempotent to ${Qidem.toExponential(1)}). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
