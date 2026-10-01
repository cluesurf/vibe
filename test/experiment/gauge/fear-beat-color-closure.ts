// DO THE LINK MOVES AND THE FEAR BEAT GENERATE A GROUP DENSE IN SU(3)? (E-FRC-0278, the "three colors" route of
// note/research/vibe/roadmap/routes/matter-forces-numbers.md, block F). The links act on a role by the 216 grid moves,
// whose linear lift is the classical color group Sigma(648) (E-QTM-0117). The fear beat is the only non-Clifford step
// (E-QTM-0118), and on two roles it reaches all of su(9) (E-QTM-0101). Color is a property of ONE role, a triplet, so the
// question is the group in SU(3) that the links and the fear beat's one-role images generate.
//
// THE FEAR BEAT IS A TWO-ROLE GATE, so its one-role images are named before the run, each an exact 3 x 3 unitary read
// off the package's own gates (code/rule/fear-weave swapPhase and singletPhase at 2 pi / 3, rebuilt here exactly):
//  Ga THE CLIFFORD-FRAME SLICE. E-QTM-0118 found the singlet phase V Clifford-equivalent to diag(omega, 1, ..., 1). For
//     each C = (F^e1 x 1) SUM^e2 (e1, e2 = +-1) with C V C^dag diagonal, every slice of that diagonal along either role
//     (the gate one role feels while the other holds a basis point). This frame needs SUM, a two-role Clifford no link
//     supplies, so Ga is generous to the route.
//  Gb THE COLOR CHANNELS. Two like roles split as 3 x 3 = 6 + 3bar and the swap phase U is a scalar on each; a love and
//     a fear split as 1 + 8 and V is a scalar on each. The 3bar is a triplet: Gb is U on the antisymmetric channel, with
//     the links acting there as A x A (the 2 x 2 minors of A).
//  Gc THE CLEAN MEETINGS. A role meets a partner holding a stabilizer state s (the 12 rays of the Sigma(648) orbit of
//     |0>, the classical role points) and the partner leaves in a stabilizer state s'. The block (1 x <s'|) G (1 x |s>) is
//     a one-role gate exactly when it is unitary (then the partner leaves in s' with certainty). Every block, for G in U,
//     SWAP U, V and their inverses, the partner on either side, 6 x 2 x 144 = 1,728 blocks; the unitary ones join.
// Each image is scaled into SU(3) by a root of unity (the generated group then sits in SU(3), and the choice of the
// scale moves it by the center, which Sigma(648) holds).
//
// THE THEOREMS RELIED ON, in their exact form.
//  T1 (Miller, Blichfeldt and Dickson 1916; Blichfeldt 1917; Fairbairn, Fulton and Klink 1964, J. Math. Phys. 5, 1038;
//     Yau and Yu 1993, Mem. AMS 505; Grimus and Ludl 2010, arXiv 1006.0098). A finite subgroup of SU(3) is diagonal
//     (abelian), reducible (inside U(2)), imprimitive (monomial: Delta(3 n^2), Delta(6 n^2) and their relatives, of
//     UNBOUNDED order), or one of the primitive groups Sigma(60), Sigma(168), Sigma(36 x 3) = 108, Sigma(72 x 3) = 216,
//     Sigma(216 x 3) = 648, Sigma(360 x 3) = 1080, or Sigma(60) x Z3 = 180, Sigma(168) x Z3 = 504. So "more than 1080
//     elements means infinite" holds only for a group known to be PRIMITIVE. In PSU(3) the primitive images have order at
//     most 360 (the Valentiner group A6, 1080 = 3 x 360, the 3 its center Z3): the SU(3) bound is the projective one times
//     the center, and every group here holds the center (omega 1 is in Sigma(648)).
//     Here every group contains Sigma(648), which is irreducible and primitive; an invariant subspace or a system of
//     imprimitivity of a larger group would be one of Sigma(648). So a finite group generated here is primitive, has order
//     at most 1080 and divisible by 648: it IS Sigma(648). Any count above 648 decides infinite.
//  T2 (closure). If the group is infinite its closure K is a compact Lie group of positive dimension, and the Lie algebra
//     of K's identity component is an Ad(Sigma(648))-invariant subspace of su(3). Sigma(648) acts irreducibly on su(3)
//     (measured: sum |Tr g|^4 = 2 |G|, so 3 x 3bar = 1 + 8 with 8 irreducible), so that algebra is 0 or su(3): an infinite
//     group here is DENSE in SU(3). The dichotomy is exact: Sigma(648) itself, or dense.
//
// HYPOTHESES, written before any run of this file.
//  L  THE LINKS ALONE (control). The four published generators of Sigma(648), rebuilt in Q(zeta_9), close on exactly 648
//     elements with center {1, omega, omega^2}; their conjugation of the 9 phase-point operators is a permutation group of
//     216 maps, the same set as the package's 216 grid moves (code/rule/vibe-weave gridMoves); sum |Tr g|^2 = 648 and sum
//     |Tr g|^4 = 1,296 (irreducible on C^3 and on su(3)).
//  H1 FINITE. For each image set (Ga, Gb, Gc, and all of them together), the group with Sigma(648) closes at order <= 1080:
//     by T1 that is 648, Sigma(648) itself, the Hessian group's lift, and each image already lies in it.
//  H1' DENSE (the alternative). Some closure passes 648; by T1 and T2 it is then infinite and dense in SU(3). The
//     enumeration is capped at 3,240 elements (the routes map's cap); at the cap the conclusion is the same, dense.
//  PREDICTED: H1, because every one-role image reachable this way is Clifford up to a phase or a scalar, and Gc holds no
//     unitary block (the clean meetings entangle). P, the falsifier: any closure passes 648.
// CONTROLS (a failure makes the verdict partial). C1 THE METHOD CAN SAY DENSE: Sigma(648) with the qutrit T gate (Howard and
//  Vala 2012, dense) passes the cap. C2 KNOWN ORDERS: <clock, shift> closes at 27 and <clock, shift, Fourier> at 108.
// INSTRUMENT. I1 the exact generators equal the package's float SU3_SUBGROUPS matrices to 1e-12, and the exact U and V
//  the package's swapPhase and singletPhase at 2 pi / 3 to 1e-12. I2 the stabilizer orbit of |0> has 12 rays. I3 U is
//  exactly omega on the antisymmetric channel and 1 on the symmetric, V exactly omega on the singlet and 1 on its
//  complement (the channel images are scalars, read).
// VERDICT, fixed before the run: PASS when L and H1 hold with C1, C2 and the instrument; FAIL when L fails or H1' happens
// (the route's hope, reported as a fail of the prediction); PARTIAL when a control or the instrument fails.
//
// FIRST RUN (tmp/gq-color-run1.log, 3 s): PASS, H1 as predicted, no gate moved.
//  - L: 648 elements, center 3, the conjugation of the 9 phase points gives 216 maps, the same set as the package's grid
//    moves; sum |Tr|^2 = 648 and sum |Tr|^4 = 1,296 (irreducible on C^3 and on su(3)).
//  - Ga: 2 frames diagonalize V (F SUM^-1 and F^-1 SUM^-1), with 2 distinct slices, 1 and diag(omega, 1, 1). Gb: U is
//    exactly omega on the antitriplet. Gc: 0 of 1,728 clean-meeting blocks are unitary.
//  - H1: Ga, Gb, Gc and Ga + Gc each close at exactly 648; every image lies in Sigma(648) as a matrix.
//  - C1: Sigma(648) with T passes the cap (3,241 found). C2: 27 and 108. I1 to I3 hold.
// WHAT IT MEANS. One role's color group, from the links and every one-role image of the fear beat named above, is the
// finite Sigma(648), not a dense SU(3). The fear beat's non-Clifford content is entangling only: on a color channel it is
// a scalar, in a Clifford frame its slices are Clifford, and a meeting with a classical partner never leaves the partner
// clean. Its density lives on two roles (E-QTM-0101, su(9)), where single-role gates appear only approximately (E-QTM-0104,
// words toward T x 1). So "three colors" on the rule has the classical color group's Z3 center and nothing finer, and the
// confinement route "a Z3 center inside a dense group" is closed for one-role words: Z3 alone cannot confine and keep
// members light (E-SPN-0150), so a dense color group would have to be built from two-role words as a link variable, a
// new piece. Not settled: whether some longer two-role word is EXACTLY a product A x B with A outside Sigma(648).
//
// Depth L1: classical group theory decided exactly on the package's own gates. DETERMINISM: no random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { singletPhase, swapPhase } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { type Operator } from '@/code/measure/grid-weights'
import {
  add,
  cappedClosure,
  conj,
  dagger,
  det3,
  equals,
  identityMatrix,
  isUnitary,
  isZero,
  kron,
  matMul,
  matrixKey,
  MINUS_I_OVER_ROOT3,
  mul,
  neg,
  ninth,
  OMEGA,
  ONE,
  sameMatrix,
  scale,
  scaleMatrix,
  sub,
  toComplex,
  trace,
  ZERO,
  zetaPower,
  type Ninth,
  type NinthMatrix,
} from '@/code/algebra/ninth-field'

const CAP = 3240
const SIGMA = 648
const PRIMITIVE_BOUND = 1080
const FLOAT_MATCH = 1e-12

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/fear-beat-color-closure',
  code: 'E-FRC-0278',
  title:
    "the links and every one-role image of the fear beat generate exactly Sigma(648) in SU(3), not a dense group: the links' 216 grid moves lift to Sigma(648) (648 elements, center Z3, irreducible on C^3 and on su(3)), the singlet phase's Clifford-frame slices, the swap phase on the color antitriplet and the clean meetings with a classical partner each close with it at 648, and by the classification of finite subgroups of SU(3) any group holding Sigma(648) is either Sigma(648) or dense; the qutrit T gate passes the 3,240 cap as the dense control",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return colorClosureRun()
  },
})

// ---- the package's gates, exactly ----

const omegaPower = (k: number): Ninth => zetaPower(3 * k)

const diag = (d: readonly Ninth[]): Ninth[][] =>
  d.map((x, i) => d.map((_, j) => (i === j ? x : ZERO)))

const CLOCK = diag([ONE, omegaPower(1), omegaPower(2)])
const SHIFT: Ninth[][] = [
  [ZERO, ONE, ZERO],
  [ZERO, ZERO, ONE],
  [ONE, ZERO, ZERO],
]
const FOURIER: Ninth[][] = [0, 1, 2].map(j => [0, 1, 2].map(k => mul(omegaPower(j * k), MINUS_I_OVER_ROOT3)))
const NINTH = diag([zetaPower(2), zetaPower(2), zetaPower(5)])
const T_GATE = diag([ONE, zetaPower(1), zetaPower(-1)])
const SIGMA_GENERATORS = [CLOCK, SHIFT, FOURIER, NINTH]

const HALF = ninth([1], 2)
// U = P_sym + omega P_anti = (1 + omega) / 2 + (1 - omega) / 2 SWAP, index 3 i + j
const SWAP: Ninth[][] = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (__, c) => (c === 3 * (r % 3) + Math.floor(r / 3) ? ONE : ZERO)),
)
const SWAP_PHASE: Ninth[][] = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (__, c) =>
    add(r === c ? mul(add(ONE, OMEGA), HALF) : ZERO, equals(SWAP[r]![c]!, ONE) ? mul(sub(ONE, OMEGA), HALF) : ZERO),
  ),
)
// V = 1 + (omega - 1) |Phi><Phi|, Phi = sum_j |j j> / sqrt 3
const SINGLET_PHASE: Ninth[][] = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (__, c) =>
    add(r === c ? ONE : ZERO, r % 4 === 0 && c % 4 === 0 ? scale(sub(OMEGA, ONE), 1, 3) : ZERO),
  ),
)
// SUM |x, y> = |x, x + y>
const SUM: Ninth[][] = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (__, c) => {
    const x = Math.floor(c / 3)
    const y = c % 3

    return r === 3 * x + ((x + y) % 3) ? ONE : ZERO
  }),
)

const floatGap3 = (exact: NinthMatrix, m: Float64Array): number =>
  Math.max(
    ...exact.flatMap((row, i) =>
      row.map((x, j) => {
        const [re, im] = toComplex(x)

        return Math.hypot(re - m[2 * (3 * i + j)]!, im - m[2 * (3 * i + j) + 1]!)
      }),
    ),
  )

const floatGap9 = (exact: NinthMatrix, u: Operator): number =>
  Math.max(
    ...exact.flatMap((row, i) =>
      row.map((x, j) => {
        const [re, im] = toComplex(x)

        return Math.hypot(re - u.re[i * 9 + j]!, im - u.im[i * 9 + j]!)
      }),
    ),
  )

// the scale z^k or -z^k that puts a unitary into SU(3), or null
function intoSu3(a: NinthMatrix): Ninth[][] | null {
  const d = det3(a)

  for (const sign of [1, -1]) {
    for (let k = 0; k < 9; k++) {
      const t = sign === 1 ? zetaPower(k) : neg(zetaPower(k))

      if (equals(mul(mul(mul(t, t), t), d), ONE)) {
        return scaleMatrix(a, t)
      }
    }
  }

  return null
}

const isScalar = (a: NinthMatrix): boolean =>
  a.every((row, i) => row.every((x, j) => (i === j ? equals(x, a[0]![0]!) : isZero(x))))

const isDiagonal = (a: NinthMatrix): boolean => a.every((row, i) => row.every((x, j) => i === j || isZero(x)))

// |x|^2 as an exact field element
const norm2 = (x: Ninth): Ninth => mul(x, conj(x))

// ---- the phase points: A(a, b) = D(a, b) P D(a, b)^dag, D(a, b) = omega^(2 a b) X^a Z^b ----

function phasePoints(): Ninth[][][] {
  const X: Ninth[][] = [0, 1, 2].map(r => [0, 1, 2].map(c => ((c + 1) % 3 === r ? ONE : ZERO)))
  const Z = diag([ONE, omegaPower(1), omegaPower(2)])
  const P: Ninth[][] = [0, 1, 2].map(r => [0, 1, 2].map(c => ((3 - c) % 3 === r ? ONE : ZERO)))
  const power = (m: NinthMatrix, k: number): Ninth[][] =>
    Array.from({ length: k }).reduce<Ninth[][]>(acc => matMul(m, acc), identityMatrix(3))

  return Array.from({ length: 9 }, (_, q) => {
    const a = Math.floor(q / 3)
    const b = q % 3
    const D = scaleMatrix(matMul(power(X, a), power(Z, b)), omegaPower(2 * a * b))

    return matMul(matMul(D, P), dagger(D))
  })
}

// the 2 x 2 minors of A on the antisymmetric pairs (0,1), (0,2), (1,2): A x A on the 3bar channel
const PAIRS: readonly (readonly [number, number])[] = [
  [0, 1],
  [0, 2],
  [1, 2],
]
const wedge2 = (a: NinthMatrix): Ninth[][] =>
  PAIRS.map(([i, j]) =>
    PAIRS.map(([k, l]) => sub(mul(a[i]![k]!, a[j]![l]!), mul(a[i]![l]!, a[j]![k]!))),
  )

type Run = { name: string; order: number; closed: boolean }

const closeWith = (name: string, extra: readonly NinthMatrix[], base: readonly NinthMatrix[] = SIGMA_GENERATORS): Run => {
  const c = cappedClosure([...base, ...extra], CAP)

  return { name, order: c.elements.length, closed: c.closed }
}

export function colorClosureRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

  // ---------------- instrument I1 ----------------
  const pub = SU3_SUBGROUPS.sigma648.generators
  const genGap = Math.max(...SIGMA_GENERATORS.map((g, i) => floatGap3(g, pub[i]!)))
  const swapGap = floatGap9(SWAP_PHASE, swapPhase((2 * Math.PI) / 3))
  const singletGap = floatGap9(SINGLET_PHASE, singletPhase((2 * Math.PI) / 3))
  const I1 =
    genGap < FLOAT_MATCH &&
    swapGap < FLOAT_MATCH &&
    singletGap < FLOAT_MATCH &&
    isUnitary(SWAP_PHASE) &&
    isUnitary(SINGLET_PHASE) &&
    SIGMA_GENERATORS.every(g => isUnitary(g) && equals(det3(g), ONE)) &&
    equals(det3(T_GATE), ONE)

  // ---------------- L: the links alone ----------------
  const sigma = cappedClosure(SIGMA_GENERATORS, CAP)
  const G = sigma.elements
  const center = G.filter(isScalar).length
  const traces = G.map(trace)
  const sum2 = traces.reduce((s, t) => add(s, norm2(t)), ZERO)
  const sum4 = traces.reduce((s, t) => add(s, mul(norm2(t), norm2(t))), ZERO)
  const points = phasePoints()
  const pointKeys = points.map(matrixKey)
  const gridOfPhase = (q: number): number => Math.floor(q / 3) + 3 * (q % 3)
  const permutations = new Set<string>()

  let permutesPoints = true

  for (const g of G) {
    const gd = dagger(g)
    const image = points.map(A => pointKeys.indexOf(matrixKey(matMul(matMul(g, A), gd))))

    if (image.some(x => x < 0)) {
      permutesPoints = false
      continue
    }

    // as a table on the grid index a + 3 b: grid point gridOfPhase(q) goes to gridOfPhase(image[q])
    const table = Array<number>(9).fill(0)

    image.forEach((to, q) => {
      table[gridOfPhase(q)] = gridOfPhase(to)
    })
    permutations.add(table.join(''))
  }

  const moves = new Set(gridMoves().act.map(t => Array.from(t).join('')))
  const sameMoves = permutations.size === moves.size && [...permutations].every(p => moves.has(p))
  const L =
    sigma.closed &&
    G.length === SIGMA &&
    center === 3 &&
    permutesPoints &&
    permutations.size === 216 &&
    sameMoves &&
    equals(sum2, ninth([SIGMA])) &&
    equals(sum4, ninth([2 * SIGMA]))

  log('L')

  // ---------------- instrument I2, I3 ----------------
  const rays = new Map<string, Ninth[]>()

  for (const g of G) {
    const v = [0, 1, 2].map(i => g[i]![0]!)
    const projector = v.map(x => v.map(y => mul(x, conj(y))))

    rays.set(matrixKey(projector), v)
  }

  const states = [...rays.values()]
  const I2 = states.length === 12

  const basis9 = (i: number, j: number): Ninth[] => Array.from({ length: 9 }, (_, k) => (k === 3 * i + j ? ONE : ZERO))
  const apply9 = (m: NinthMatrix, v: readonly Ninth[]): Ninth[] =>
    m.map(row => row.reduce((s, x, k) => add(s, mul(x, v[k]!)), ZERO))
  const sameVector = (a: readonly Ninth[], b: readonly Ninth[]): boolean => a.every((x, k) => equals(x, b[k]!))
  const anti = PAIRS.map(([i, j]) => basis9(i, j).map((x, k) => sub(x, basis9(j, i)[k]!)))
  const sym = [0, 1, 2].flatMap(i =>
    [0, 1, 2].filter(j => j >= i).map(j => basis9(i, j).map((x, k) => add(x, basis9(j, i)[k]!))),
  )
  const phi = basis9(0, 0).map((x, k) => add(add(x, basis9(1, 1)[k]!), basis9(2, 2)[k]!))
  const octet = [
    ...[0, 1, 2].flatMap(i => [0, 1, 2].filter(j => j !== i).map(j => basis9(i, j))),
    basis9(0, 0).map((x, k) => sub(x, basis9(1, 1)[k]!)),
    basis9(1, 1).map((x, k) => sub(x, basis9(2, 2)[k]!)),
  ]
  const I3 =
    anti.every(v => sameVector(apply9(SWAP_PHASE, v), v.map(x => mul(OMEGA, x)))) &&
    sym.every(v => sameVector(apply9(SWAP_PHASE, v), v)) &&
    sameVector(apply9(SINGLET_PHASE, phi), phi.map(x => mul(OMEGA, x))) &&
    octet.every(v => sameVector(apply9(SINGLET_PHASE, v), v))

  log('instrument')

  // ---------------- Ga: the Clifford-frame slices of V ----------------
  const fourier9 = (e: number): Ninth[][] => kron(e === 1 ? FOURIER : dagger(FOURIER), identityMatrix(3))
  const sum9 = (e: number): Ninth[][] => (e === 1 ? SUM : dagger(SUM))
  const frames: string[] = []
  const sliceSet = new Map<string, Ninth[][]>()

  for (const e1 of [1, -1]) {
    for (const e2 of [1, -1]) {
      const C = matMul(fourier9(e1), sum9(e2))
      const W = matMul(matMul(C, SINGLET_PHASE), dagger(C))

      if (!isDiagonal(W)) {
        continue
      }

      frames.push(`F^${e1} SUM^${e2}`)

      for (let x = 0; x < 3; x++) {
        const alongSecond = diag([0, 1, 2].map(j => W[3 * x + j]![3 * x + j]!))
        const alongFirst = diag([0, 1, 2].map(j => W[3 * j + x]![3 * j + x]!))

        for (const s of [alongSecond, alongFirst]) {
          sliceSet.set(matrixKey(s), s)
        }
      }
    }
  }

  const Ga = [...sliceSet.values()].map(intoSu3)
  const GaOk = frames.length > 0 && Ga.every(x => x !== null)
  const omegaSlice = [...sliceSet.values()].some(s => sameMatrix(s, diag([OMEGA, ONE, ONE])))

  // ---------------- Gb: the swap phase on the antitriplet ----------------
  // the coefficient of anti[r] in U anti[c], read where anti[r] alone has its +1 (the pair (i, j), i < j)
  const onAnti: Ninth[][] = anti.map((_, r) =>
    anti.map(v => apply9(SWAP_PHASE, v)[3 * PAIRS[r]![0] + PAIRS[r]![1]]!),
  )
  const GbImage = intoSu3(onAnti)
  const wedgeGenerators = SIGMA_GENERATORS.map(wedge2)

  // ---------------- Gc: the clean meetings ----------------
  const gates: { name: string; m: NinthMatrix }[] = [
    { name: 'U', m: SWAP_PHASE },
    { name: 'SWAP U', m: matMul(SWAP, SWAP_PHASE) },
    { name: 'V', m: SINGLET_PHASE },
  ].flatMap(g => [g, { name: `${g.name}^-1`, m: dagger(g.m) }])

  let blocks = 0

  const unitaryBlocks = new Map<string, Ninth[][]>()
  const blockOf = (m: NinthMatrix, s: readonly Ninth[], t: readonly Ninth[], partner: 0 | 1): Ninth[][] =>
    [0, 1, 2].map(a =>
      [0, 1, 2].map(c => {
        let acc = ZERO

        for (let b = 0; b < 3; b++) {
          for (let d = 0; d < 3; d++) {
            const row = partner === 1 ? 3 * a + d : 3 * d + a
            const col = partner === 1 ? 3 * c + b : 3 * b + c
            const x = m[row]![col]!

            if (!isZero(x) && !isZero(t[d]!) && !isZero(s[b]!)) {
              acc = add(acc, mul(mul(conj(t[d]!), x), s[b]!))
            }
          }
        }

        return acc
      }),
    )

  for (const g of gates) {
    for (const partner of [0, 1] as const) {
      for (const s of states) {
        for (const t of states) {
          const M = blockOf(g.m, s, t, partner)

          blocks++

          if (isUnitary(M)) {
            unitaryBlocks.set(matrixKey(M), M)
          }
        }
      }
    }
  }

  const Gc = [...unitaryBlocks.values()].map(intoSu3)
  const GcOk = Gc.every(x => x !== null)

  log('images')

  // ---------------- H1: the closures ----------------
  const runA = closeWith('Ga', Ga.filter((x): x is Ninth[][] => x !== null))
  const runB = closeWith('Gb', GbImage ? [GbImage] : [], wedgeGenerators)
  const runC = closeWith('Gc', Gc.filter((x): x is Ninth[][] => x !== null))
  const runAll = closeWith('Ga + Gc', [...Ga, ...Gc].filter((x): x is Ninth[][] => x !== null))
  const runs = [runA, runB, runC, runAll]
  const H1 = GaOk && GbImage !== null && GcOk && runs.every(r => r.closed && r.order <= PRIMITIVE_BOUND)
  const dense = runs.filter(r => !r.closed || r.order > SIGMA)
  const named = runs.every(r => r.closed && r.order === SIGMA)

  log('H1')

  // ---------------- controls ----------------
  const tRun = closeWith('T', [T_GATE])
  const C1 = !tRun.closed && tRun.order > SIGMA
  const delta27 = cappedClosure([CLOCK, SHIFT], CAP)
  const sigma108 = cappedClosure([CLOCK, SHIFT, FOURIER], CAP)
  const C2 = delta27.closed && delta27.elements.length === 27 && sigma108.closed && sigma108.elements.length === 108
  const inSigma = (m: NinthMatrix): boolean => G.some(g => sameMatrix(g, m))
  const tInSigma = inSigma(T_GATE)
  const imagesInSigma = [...Ga, ...Gc].every(x => x !== null && inSigma(x))

  log('controls')

  const status: Verdict['status'] = !L || !H1 ? 'fail' : C1 && C2 && I1 && I2 && I3 ? 'pass' : 'partial'
  const runLine = (r: Run): string => `${r.name} ${r.closed ? 'closes at' : 'passes the cap at'} ${r.order}`

  return verdict({
    status,
    claim: `L ${L} (Sigma(648) closes ${sigma.closed} at ${G.length}, center ${center}, permutes the phase points ${permutesPoints}, ${permutations.size} grid maps equal to the package's ${moves.size} grid moves ${sameMoves}, sum |Tr|^2 = ${toComplex(sum2)[0]}, sum |Tr|^4 = ${toComplex(sum4)[0]}); images: Ga ${sliceSet.size} slices from ${frames.length} diagonalizing frames (${frames.join(', ')}; diag(omega, 1, 1) among them ${omegaSlice}), Gb U on the antitriplet = omega 1 (I3 ${I3}), Gc ${unitaryBlocks.size} unitary blocks of ${blocks}; H1 ${H1} (${runs.map(runLine).join('; ')}; every closure exactly Sigma(648) ${named}; ${dense.length} pass 648); controls C1 ${C1} (${runLine(tRun)}) C2 ${C2} (Delta(27) ${delta27.elements.length}, Sigma(108) ${sigma108.elements.length}); instrument I1 ${I1} (generators ${genGap.toExponential(1)}, U ${swapGap.toExponential(1)}, V ${singletGap.toExponential(1)}) I2 ${I2} (${states.length} stabilizer rays) I3 ${I3}`,
    metrics: {
      L: flag(L),
      H1: flag(H1),
      C1: flag(C1),
      C2: flag(C2),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      sigmaOrder: G.length,
      center,
      gridMaps: permutations.size,
      sliceImages: sliceSet.size,
      cliffordFrames: frames.length,
      unitaryBlocks: unitaryBlocks.size,
      blocks,
      orderGa: runA.order,
      orderGb: runB.order,
      orderGc: runC.order,
      orderAll: runAll.order,
      orderWithT: tRun.order,
      denseRuns: dense.length,
      stabilizerRays: states.length,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      orderWithT: tRun.order,
      tClosed: flag(tRun.closed),
      delta27: delta27.elements.length,
      sigma108: sigma108.elements.length,
    },
    notes: `L1. Every image in Sigma(648) as a matrix: ${imagesInSigma}; the T gate in Sigma(648): ${tInSigma}. Cap ${CAP}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
