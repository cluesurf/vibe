// Quantum memory and error protection under the bare beat U (Q4, item vibe-computation-models-0034).
//
// Does a logical qutrit kept in a code survive T beats of the exact bare beat U (code/rule/bare-beat.ts), and which of
// U's layers leave which code space invariant? Three codes were named: the [[24,1,8]]_3 holographic code of
// Vibe/HolographicCode.lean on the 24 facet slots of one dock, a decoherence-free subspace of role spin (W12, Q1), and
// the qutrit toric code of E-QTM-0095. Library: code/compute/quantum/memory. Lean: Vibe/QuantumMemory.lean.
//
// The embedding: one qutrit per facet slot, value = tone (0 empty, 1 -> +1, 2 -> -1), role 0. The DFS uses the roles of
// like-sign excitations instead: four +1 excitations on two full lines of a dock with one in role 1; the role words of
// total spin 1 are a 3-dim multiplicity, a logical qutrit immune to collective role noise. W12's own four kets (six
// excitations, two 3-excitation DFS qubits, Q1's S = 1 sector) run beside it.
//
// HYPOTHESES, fixed after the exploratory probes tmp/memory-probe*.ts and before this file's first run:
//   H1  [[24,1,8]]_3 in the lab frame leaves at T = 1 for every logical state: the stream S moves every excitation of the
//       dock to a neighbour, so only the vacuum term stays and F(1) = |psi(vac)|^4 (3^-30 for |0_L>, 0 for |1_L>, |2_L>,
//       3^-32 for the Fourier states); F(2) <= sum_N c_N (3/4)^N / 3^r < 1/10, c_N the support's weight counts, 3/4 the
//       exact return weight of one excitation
//   H2  [[24,1,8]]_3, layer by layer: M_pair leaves it invariant (every configuration M_pair acts on has charge 2t, not
//       0 mod 3, so no codeword has weight there); D, K, M_meet, Phi_odd and S do not (exact witnesses: a generator g with
//       <V psi| g |V psi> != 1, a support configuration with Phi_odd phase != 1, the stream). Each single-line gate of
//       D, K, M_meet already leaves the code (no line Pauli is in the normalizer, so it acts as tr / 9): leak 2/9, 32/81
//       and 14/27, a weight-2 error
//   H3  the role-spin DFS is invariant under Phi_odd, D, K, M_meet and S and not under M_pair: its total-spin-1 weight is
//       exactly 1 for T <= 2 for every logical and Fourier state, falls below 1 at T = 3 for |0_L> and the three Fourier
//       states and at T = 4 for |1_L> and |2_L>; tracing beat 3 layer by layer, only M_pair moves the weight; with M_pair
//       removed it stays 1 through T = 4. At T = 1 the spatial motion is deterministic and the co-moving logical action
//       is an exact unitary, diagonal (a logical gate, not an error). The lab-frame fidelity is 0 at T = 1
//   H4  W12's four kets: total spin 1 weight 1 for T <= 2, below 1 at T = 3 for all four
//   H5  curvature control: the qutrit DFS reads the same weights on the flat D4 honeycomb {3,4,3,3} (only the gluing
//       differs; the break needs two excitations of one line back in one dock, which both meshes allow at T = 3)
// GATES, fixed before the first run:
//   G0  the code: 23 commuting independent stabilizers, frame logicals that commute, pair to a nonzero value and lie
//       outside the stabilizer; bare-beat's lines are HolographicCode.lean's (hcLineRep / hcOppRep)
//   G1  the stabilizer machinery against a dense build: a 4-qutrit cluster on lines 0 and 1 (vacuum on the other 20
//       slots) built as prod (1 + g + g^2) |0> in 81 dimensions has the support and phases amplitudePhase gives, and
//       <V psi| g |V psi> for V = D on both lines equals stabilizerExpectation for every cluster element tested
//   G2  stabilizer test controls: Z (x) Z on every line (a stabilizer) gives 1 on every generator; X on one slot gives a
//       value of modulus 1 that is not 1 (a detected Pauli error)
//   G3  the support weight counts sum to 3^r and are nonnegative integers (duality over A^perp)
//   G4  geometry for the T = 1, 2 formulas: the 24 neighbours of a dock are distinct and not the dock, a step back
//       returns; U leaves no excitation on dock 0 from any one- or two-excitation dock-0 state (vacuum fixed exactly);
//       on those states the dock-0 part of U^2 equals gamma^N (antipodal relabel) after the seven in-dock layers, with
//       |gamma|^2 = 3/4; every output keeps role 0
//   G5  M_pair maps the 24 pair configurations among themselves and fixes every other dock-0 state of at most three
//       excitations
//   G6  identical bytes: the whole computation run twice gives the same report
// Verdict: fail if a gate fails; pass if H1 to H5 hold as written; partial otherwise, naming what read differently.
//
// WHAT IT MEANS. In a closed reversible box nothing is lost (U is exactly unitary, Q0) and nothing is an attractor
// (thm_ms_reversible_no_global_contraction, the classical M4-B result): protection can only mean a subspace U maps into
// itself. Neither code here is one. [[24,1,8]]_3 sits on fixed slots and the stream carries everything off them in one
// beat; even riding with the stream, the in-dock coin D, the bounce K, the meeting and Phi_odd each push it out at
// weight 2 (one line), below the code's distance 8 but on all 12 lines at once, so it is corrupted every beat unless
// something corrects it between layers. Only M_pair keeps the code space; the in-dock line layers keep each line's
// charge, so the checks that read lines only through charge (Z^24, three W_9 rows) stay satisfied. The
// role-spin DFS is far better: five of the six distinct layers keep it exactly, the logical qutrit is carried losslessly
// through two beats (the meeting acts as a logical phase gate), and the one breaker is M_pair, which moves a same-role
// pair and not a mixed one, at T = 3 or 4. The qutrit toric code is not run: it holds logical qutrits only on a closed
// four-torus (zero on an open patch, E-QTM-0095's own control), and the beat library has no closed quotient.
//
// DETERMINISM: no random numbers, no floating point in any decision. Depth L1: exact facts about the beat on codes.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  type Ninth,
  ONE,
  ZERO,
  add,
  conj,
  equals,
  identityMatrix,
  isZero,
  keyOf,
  kron,
  mul,
  ninth,
  scale,
  sub,
  toComplex,
  zetaPower,
} from '@/code/algebra/ninth-field'
import { realSign } from '@/code/algebra/ninth-real-sign'
import {
  BEAT_LAYERS,
  BEAT_LAYER_NAMES,
  type BeatGeometry,
  type BeatState,
  LINES,
  OPPOSITE_SLOT,
  type Vibe,
  applyBeat,
  applyHalfCoinD,
  applyOddChiralPhase,
  applyOppositeSignBounce,
  applyPairLineMixer,
  applyRoleMeet,
  applyStream,
  basisKet,
  decodeConfig,
  encodeConfig,
  stateToNinth,
  stepDock,
  withGeometry,
} from '@/code/rule/bare-beat'
import {
  type Pauli3,
  type StabilizerState,
  absSquare,
  amplitudePhase,
  configOfQutrits,
  dfsQutritBasis,
  dfsQutritFourier,
  dfsSites,
  roleOneState,
  fidelity,
  firstSupportConfig,
  holographicCode,
  inverseRational,
  isRationalNinth,
  lineGate,
  lineNormalizerElements,
  linesOfPauli,
  mod3,
  normSquared,
  overlap,
  pauli3,
  pauliMul,
  spinSectorWeight,
  stabilizerExpectation,
  stabilizerState,
  supportDimension,
  supportWeightCounts,
  traceOf,
  twoQutritPauli,
  verifyCodeStructure,
  w12Kets,
} from '@/code/compute/quantum/memory'

type Report = {
  ok: Record<string, boolean>
  numbers: Record<string, number>
  exact: Record<string, string>
}

type Matrix = Ninth[][]

const show = (x: Ninth): string => keyOf(x)
const approx = (x: Ninth): string => toComplex(x)[0].toFixed(6)
const isOne = (x: Ninth): boolean => equals(x, ONE)
const SLOTS = Array.from({ length: 24 }, (_, i) => i)
const LEAN_LINES: readonly (readonly [number, number])[] = [
  [0, 3], [1, 2], [4, 7], [5, 6], [8, 11], [9, 10], [12, 15], [13, 14], [16, 19], [17, 18], [20, 23], [21, 22],
]

const matVec = (m: Matrix, v: readonly Ninth[]): Ninth[] =>
  m.map(row => row.reduce((s, x, j) => (isZero(x) || isZero(v[j]!) ? s : add(s, mul(x, v[j]!))), ZERO))
const vecDot = (a: readonly Ninth[], b: readonly Ninth[]): Ninth => a.reduce((s, x, i) => add(s, mul(conj(x), b[i]!)), ZERO)
const mat9Mul = (p: Matrix, q: Matrix): Matrix =>
  p.map(row => q[0]!.map((_, j) => row.reduce((s, x, k) => (isZero(x) ? s : add(s, mul(x, q[k]![j]!))), ZERO)))

// the four slots of lines 0 and 1, the dense index 9 (3 v_a0 + v_b0) + (3 v_a1 + v_b1)
const CLUSTER_SLOTS = [LINES[0]![0], LINES[0]![1], LINES[1]![0], LINES[1]![1]]

function denseOf(p: Pauli3): Matrix {
  const part = (l: number): Matrix => {
    const [a, b] = LINES[l]!

    return twoQutritPauli(p.x[a]!, p.z[a]!, p.x[b]!, p.z[b]!)
  }

  return kron(part(0), part(1)).map(row => row.map(x => mul(x, zetaPower(3 * p.phase))))
}

function clusterGenerators(): Pauli3[] {
  const gens: Pauli3[] = []

  for (let i = 0; i < 4; i++) {
    const x = Array<number>(24).fill(0)
    const z = Array<number>(24).fill(0)

    x[CLUSTER_SLOTS[i]!] = 1

    if (i > 0) {
      z[CLUSTER_SLOTS[i - 1]!] = 1
    }

    if (i < 3) {
      z[CLUSTER_SLOTS[i + 1]!] = 1
    }

    gens.push(pauli3(x, z))
  }

  for (const slot of SLOTS) {
    if (!CLUSTER_SLOTS.includes(slot)) {
      const z = Array<number>(24).fill(0)

      z[slot] = 1
      gens.push(pauli3(Array<number>(24).fill(0), z))
    }
  }

  return gens
}

// the dock-0 part of a state (every excitation on dock 0)
function dockZeroPart(m: ReadonlyMap<string, Ninth>): Map<string, Ninth> {
  return new Map([...m].filter(([key]) => decodeConfig(key).every(v => v[0] === 0)))
}

const sameState = (a: ReadonlyMap<string, Ninth>, b: ReadonlyMap<string, Ninth>): boolean =>
  [...new Set([...a.keys(), ...b.keys()])].every(k => equals(a.get(k) ?? ZERO, b.get(k) ?? ZERO))

const IN_DOCK_LAYERS = BEAT_LAYERS.slice(0, 7)
const applyLayers = (s: BeatState, layers: typeof BEAT_LAYERS): BeatState => layers.reduce((cur, l) => l(cur, false), s)

// every dock-0 configuration of 1 and 2 excitations (role 0), and of 3 when `three`
function smallDockConfigs(three: boolean): Vibe[][] {
  const out: Vibe[][] = []
  const tones = [1, -1] as const

  for (let a = 0; a < 24; a++) {
    for (const ta of tones) {
      out.push([[0, a, ta, 0]])

      for (let b = a + 1; b < 24; b++) {
        for (const tb of tones) {
          out.push([
            [0, a, ta, 0],
            [0, b, tb, 0],
          ])

          if (three) {
            for (let c = b + 1; c < 24; c++) {
              for (const tc of tones) {
                out.push([
                  [0, a, ta, 0],
                  [0, b, tb, 0],
                  [0, c, tc, 0],
                ])
              }
            }
          }
        }
      }
    }
  }

  return out
}

const isPairConfig = (vibes: readonly Vibe[]): boolean =>
  vibes.length === 2 && OPPOSITE_SLOT[vibes[0]![1]] === vibes[1]![1] && vibes[0]![2] === vibes[1]![2]

function computeHolographic(report: Report): void {
  const { ok, numbers, exact } = report
  const code = holographicCode()
  const structure = verifyCodeStructure(code)

  // ---- G0 ----
  ok.codeIsotropic = structure.isotropic
  ok.codeRank23 = structure.rank === 23
  ok.logicalsCommute = structure.logicalsCommute
  ok.logicalsPair = structure.logicalPairing !== 0
  ok.logicalsOutside = structure.logicalsOutside
  ok.linesAreLean = LINES.length === 12 && LINES.every(([a, b], l) => a === LEAN_LINES[l]![0] && b === LEAN_LINES[l]![1])
  ok.noLineNormalizer = LINES.every((_, l) => lineNormalizerElements(code, l).length === 0)

  const dGates = LINES.map((_, l) => lineGate(applyHalfCoinD, l))
  const kGates = LINES.map((_, l) => lineGate(applyOppositeSignBounce, l))
  const meetGates = LINES.map((_, l) => lineGate(applyRoleMeet, l))

  // ---- G1: dense cross-check on a 4-qutrit cluster ----
  const clusterGens = clusterGenerators()
  const cluster = stabilizerState(clusterGens)

  let dense: Ninth[] = Array<Ninth>(81).fill(ZERO)

  dense[0] = ONE

  for (const g of clusterGens.slice(0, 4)) {
    const m = denseOf(g)
    const m2 = mat9Mul(m, m)

    dense = dense.map((x, i) => add(add(x, matVec(m, dense)[i]!), matVec(m2, dense)[i]!))
  }

  const qutritsOf = (index: number): number[] => {
    const x = Array<number>(24).fill(0)
    const digits = [(index - (index % 27)) / 27, ((index - (index % 9)) / 9) % 3, ((index - (index % 3)) / 3) % 3, index % 3]

    CLUSTER_SLOTS.forEach((slot, i) => {
      x[slot] = digits[i]!
    })

    return x
  }

  let reference: { index: number; phase: number } | undefined
  let denseAgrees = true

  for (let i = 0; i < 81; i++) {
    const phase = amplitudePhase(cluster, qutritsOf(i))

    if (isZero(dense[i]!) !== (phase === undefined)) {
      denseAgrees = false
      continue
    }

    if (phase === undefined) {
      continue
    }

    reference ??= { index: i, phase }

    const predicted = mul(dense[reference.index]!, zetaPower(3 * mod3(phase - reference.phase)))

    denseAgrees &&= equals(predicted, dense[i]!)
  }

  ok.denseSupportAndPhases = denseAgrees && reference !== undefined

  const v = kron(dGates[0]!, dGates[1]!)
  const vPsi = matVec(v, dense)
  const norm = vecDot(dense, dense)
  const tests = [
    clusterGens[0]!,
    clusterGens[1]!,
    clusterGens[2]!,
    clusterGens[3]!,
    pauliMul(clusterGens[0]!, clusterGens[2]!),
    pauliMul(pauliMul(clusterGens[1]!, clusterGens[3]!), clusterGens[3]!),
  ]

  ok.denseExpectations = tests.every(g => {
    const direct = mul(vecDot(vPsi, matVec(denseOf(g), vPsi)), inverseRational(norm))

    return equals(direct, stabilizerExpectation(cluster, g, dGates).value)
  })
  ok.denseNotTrivial = tests.some(g => !isOne(stabilizerExpectation(cluster, g, dGates).value))

  // ---- logical states ----
  const zL = code.logicalZ
  const xL = code.logicalX
  const states: { name: string; state: StabilizerState }[] = [
    ...[0, 1, 2].map(j => ({ name: `basis${j}`, state: stabilizerState([...code.stabilizers, pauli3(zL.x, zL.z, -j)]) })),
    ...[0, 1, 2].map(k => ({
      name: `fourier${k}`,
      state: stabilizerState([...code.stabilizers, pauli3(xL.x, xL.z, -k)]),
    })),
  ]
  const vacuum = Array<number>(24).fill(0)

  // ---- G3 and H1 ----
  let countsOk = true
  let boundsBelowTenth = true
  let f1AsPredicted = true

  for (const { name, state } of states) {
    const r = supportDimension(state)
    const counts = supportWeightCounts(state)
    const total = counts.reduce((s, c) => s + c, 0n)

    countsOk &&= total === 3n ** BigInt(r)

    const vacInSupport = amplitudePhase(state, vacuum) !== undefined
    // F(1) = |psi(vac)|^4 = 3^(-2r) when the vacuum is in the support
    const f1 = vacInSupport ? ninth([1], 3n ** BigInt(2 * r)) : ZERO
    // F(2) <= sum_N c_N (3/4)^N / 3^r
    const boundNumerator = counts.reduce((s, c, n) => s + c * 3n ** BigInt(n) * 4n ** BigInt(24 - n), 0n)
    const boundDenominator = 4n ** 24n * 3n ** BigInt(r)

    boundsBelowTenth &&= 10n * boundNumerator < boundDenominator
    f1AsPredicted &&= name === 'basis1' || name === 'basis2' ? isZero(f1) : vacInSupport

    numbers[`${name}SupportDimension`] = r
    numbers[`${name}MinExcitations`] = counts.findIndex(c => c > 0n)
    numbers[`${name}PairWeightCount`] = Number(counts[2])
    exact[`${name}F1`] = show(f1)
    exact[`${name}F2Bound`] = `${boundNumerator}/${boundDenominator}`
    numbers[`${name}F2BoundApprox`] = Number((boundNumerator * 1000000n) / boundDenominator) / 1000000
  }

  ok.weightCountsSum = countsOk
  ok.f2BoundBelowTenth = boundsBelowTenth
  ok.f1AsPredicted = f1AsPredicted

  // ---- G4: geometry and the T = 1, 2 formulas ----
  const neighbours = SLOTS.map(a => stepDock(0, a))

  ok.neighboursDistinct = new Set(neighbours).size === 24 && !neighbours.includes(0)
  ok.stepBackReturns = SLOTS.every(a => stepDock(neighbours[a]!, OPPOSITE_SLOT[a]!) === 0)
  ok.stepOnLeaves = SLOTS.every(a => stepDock(neighbours[a]!, a) !== 0)

  const coin = mat9Mul(dGates[0]!, dGates[0]!)
  // |+ at the lower slot> (index 3) -> |+ at the upper slot> (index 1)
  const gamma = coin[1]![3]!

  exact.gamma = show(gamma)
  ok.gammaWeightThreeQuarters = equals(absSquare(gamma), ninth([3], 4))
  // a lone tone under one D: |o|^2 = 1/4 moves to the antipodal slot (the toric-code embedding's weight-1 leak)
  exact.loneLeak = show(absSquare(dGates[0]![1]![3]!))
  ok.loneLeakQuarter = equals(absSquare(dGates[0]![1]![3]!), ninth([1], 4))

  let vacuumOnly = true
  let returnFormula = true
  let rolesKept = true

  const small = smallDockConfigs(false)

  for (const vibes of small) {
    const x = basisKet(vibes)
    const u1 = stateToNinth(applyBeat(x))

    vacuumOnly &&= dockZeroPart(u1).size === 0
    rolesKept &&= [...u1.keys()].every(k => decodeConfig(k).every(e => e[3] === 0))

    const u2 = stateToNinth(applyBeat(applyBeat(x)))
    const predicted = new Map<string, Ninth>()

    for (const [key, amp] of stateToNinth(applyLayers(x, IN_DOCK_LAYERS))) {
      const y = decodeConfig(key)
      const relabelled: Vibe[] = y.map(([d, s, t, r]) => [d, OPPOSITE_SLOT[s]!, t, r])
      const factor = y.reduce(acc => mul(acc, gamma), ONE)

      predicted.set(encodeConfig(relabelled), mul(amp, factor))
    }

    returnFormula &&= sameState(dockZeroPart(u2), predicted)
  }

  ok.vacuumOnlyStays = vacuumOnly && sameState(stateToNinth(applyBeat(basisKet([]))), new Map([['', ONE]]))
  ok.returnFormula = returnFormula
  ok.rolesStayZero = rolesKept
  numbers.smallConfigsChecked = small.length

  // ---- G2: stabilizer test controls ----
  const zz = twoQutritPauli(0, 1, 0, 1)
  const id9 = identityMatrix(9)
  const zzGates = LINES.map(() => zz)
  const xOneSlot = LINES.map((_, l) => (l === 0 ? twoQutritPauli(1, 0, 0, 0) : id9))
  const testable = code.stabilizers.filter(g => linesOfPauli(g).length <= 8)
  const basis0 = states[0]!.state

  ok.controlZZKeeps = testable.every(g => isOne(stabilizerExpectation(basis0, g, zzGates).value))

  const xValues = testable.map(g => stabilizerExpectation(basis0, g, xOneSlot).value)

  ok.controlXDetected = xValues.some(x => !isOne(x)) && xValues.every(x => isOne(absSquare(x)))
  numbers.testableGenerators = testable.length

  // ---- H2: layer verdicts ----
  const layerTest = (gates: Matrix[], label: string): boolean => {
    let broken = false

    for (const { name, state } of [states[0]!, states[3]!]) {
      const values = testable.map(g => stabilizerExpectation(state, g, gates))
      const failing = values.filter(e => !isOne(e.value))

      numbers[`${label}${name}FailingGenerators`] = failing.length

      if (failing.length > 0) {
        const fewest = failing.reduce((best, e) => (e.lines < best.lines ? e : best))

        exact[`${label}${name}Witness`] = `${show(fewest.value)} on ${fewest.lines} lines`
        broken = true
      }
    }

    return broken
  }

  ok.dBreaks = layerTest(dGates, 'D')
  ok.kBreaks = layerTest(kGates, 'K')
  ok.meetBreaks = layerTest(meetGates, 'Meet')

  const lineLeak = (gates: Matrix[]): Ninth => sub(ONE, absSquare(scale(traceOf(gates[0]!), 1, 9)))
  const leaks = { D: lineLeak(dGates), K: lineLeak(kGates), Meet: lineLeak(meetGates) }

  exact.lineLeakD = show(leaks.D)
  exact.lineLeakK = show(leaks.K)
  exact.lineLeakMeet = show(leaks.Meet)
  ok.lineLeaksAsPredicted =
    equals(leaks.D, ninth([2], 9)) && equals(leaks.K, ninth([32], 81)) && equals(leaks.Meet, ninth([14], 27))

  ok.lineGatesSameOnEveryLine = [dGates, kGates, meetGates].every(gs =>
    gs.every(g => g.every((row, i) => row.every((x, j) => equals(x, gs[0]![i]![j]!)))),
  )

  // every in-dock line layer keeps the charge of its line, so Z^24 (the charge mod 3) is never violated
  ok.lineLayersKeepCharge = [dGates, kGates, meetGates].every(gs =>
    gs.every(g => g.every((row, i) => row.every((x, j) => isZero(x) || chargeOf(i) === chargeOf(j)))),
  )

  // Phi_odd: a support configuration of |0_L> with phase != 1 (the vacuum, in the support, has phase 1)
  const phiPhase = (x: readonly number[]): Ninth => [...stateToNinth(applyOddChiralPhase(basisKet(configOfQutrits(SLOTS, x)), false)).values()][0]!
  const phiWitness = firstSupportConfig(basis0, x => x.filter(v => v !== 0).length >= 4 && !isOne(phiPhase(x)), 1_000_000)

  ok.vacuumInBasis0 = amplitudePhase(basis0, vacuum) !== undefined && isOne(phiPhase(vacuum))
  ok.phiBreaks = phiWitness !== undefined && ok.vacuumInBasis0
  exact.phiWitness = phiWitness
    ? `${phiWitness.config.join('')} phase ${show(phiPhase(phiWitness.config))} after ${phiWitness.visited}`
    : 'none'

  // M_pair: no codeword has weight on a pair configuration; M_pair keeps the pair span and fixes the rest (G5)
  const pairConfigs: number[][] = LINES.flatMap(([a, b]) =>
    [1, 2].map(t => {
      const x = Array<number>(24).fill(0)

      x[a] = t
      x[b] = t

      return x
    }),
  )

  ok.pairOutsideEverySupport = pairConfigs.every(x => states.every(({ state }) => amplitudePhase(state, x) === undefined))
  ok.pairChargeNonzero = pairConfigs.every(x => mod3(x.reduce((s, v) => s + v, 0)) !== 0)
  ok.pairSpanClosed = pairConfigs.every(x =>
    [...stateToNinth(applyPairLineMixer(basisKet(configOfQutrits(SLOTS, x)), false)).keys()].every(k =>
      isPairConfig(decodeConfig(k)),
    ),
  )

  ok.pairFixesOthers = smallDockConfigs(true)
    .filter(vibes => !isPairConfig(vibes))
    .every(vibes => sameState(stateToNinth(applyPairLineMixer(basisKet(vibes), false)), new Map([[encodeConfig(vibes), ONE]])))
  ok.pairInvariant = ok.pairOutsideEverySupport && ok.pairSpanClosed && ok.pairFixesOthers

  // S: the stream empties the dock (vacuumOnlyStays), so the code space is not invariant
  ok.streamBreaks = ok.vacuumOnlyStays
}

// charge of a line basis index 3 v_a + v_b (tone +1 for 1, -1 for 2)
function chargeOf(index: number): number {
  const tone = (v: number): number => (v === 0 ? 0 : v === 1 ? 1 : -1)

  return tone((index - (index % 3)) / 3) + tone(index % 3)
}

function spinOneWeight(s: BeatState): Ninth {
  const m = stateToNinth(s)

  return mul(spinSectorWeight(m, 2), inverseRational(normSquared(m)))
}

// the beats at which the total-spin-1 weight first falls below 1 (0 when it never does up to `beats`)
function dfsRun(starts: BeatState[], beats: number, layers: typeof BEAT_LAYERS) {
  return starts.map(start => {
    const weights: Ninth[] = []
    const fidelities: Ninth[] = []

    let s = start

    for (let t = 0; t <= beats; t++) {
      weights.push(spinOneWeight(s))
      fidelities.push(fidelity(stateToNinth(start), stateToNinth(s)))

      if (t < beats) {
        s = applyLayers(s, layers)
      }
    }

    const leaves = weights.findIndex(w => realSign(sub(ONE, w)) > 0)

    return { weights, fidelities, leaves }
  })
}

function computeDfs(report: Report, geometry: BeatGeometry, tag: string, full: boolean): void {
  const { ok, numbers, exact } = report

  withGeometry(geometry, () => {
    const basis = dfsQutritBasis(0, 1)
    const fourier = dfsQutritFourier(0, 1)
    const starts = [...basis, ...fourier]
    const runs = dfsRun(starts, 4, BEAT_LAYERS)
    const names = ['basis0', 'basis1', 'basis2', 'fourier0', 'fourier1', 'fourier2']

    runs.forEach((run, i) => {
      numbers[`${tag}${names[i]}Leaves`] = run.leaves
      exact[`${tag}${names[i]}Weights`] = run.weights.map(w => (isRationalNinth(w) ? show(w) : `${show(w)} (~${approx(w)})`)).join(' | ')
      exact[`${tag}${names[i]}LabFidelity`] = run.fidelities.map(show).join(' | ')
    })

    ok[`${tag}WeightsReal`] = runs.every(run => run.weights.every(w => equals(w, conj(w))))
    ok[`${tag}HoldsTwoBeats`] = runs.every(run => run.weights.slice(0, 3).every(isOne))
    ok[`${tag}LeavesAsPredicted`] =
      runs[0]!.leaves === 3 &&
      runs[1]!.leaves === 4 &&
      runs[2]!.leaves === 4 &&
      runs[3]!.leaves === 3 &&
      runs[4]!.leaves === 3 &&
      runs[5]!.leaves === 3
    ok[`${tag}LabFidelityZeroAtOne`] = runs.every(run => isZero(run.fidelities[1]!))

    if (!full) {
      return
    }

    // the co-moving logical action at T = 1: <S j| U |k> on the normalized basis
    const carried = basis.map(b => stateToNinth(applyStream(b, false)))
    const evolved = basis.map(b => stateToNinth(applyBeat(b)))
    const g = carried.map(c => evolved.map(e => overlap(c, e)))
    const gDagG = g[0]!.map((_, i) => g[0]!.map((__, j) => g.reduce((s, row) => add(s, mul(conj(row[i]!), row[j]!)), ZERO)))

    ok.comovingUnitary = gDagG.every((row, i) => row.every((x, j) => equals(x, i === j ? ONE : ZERO)))
    ok.comovingDiagonal = g.every((row, i) => row.every((x, j) => i === j || isZero(x)))
    exact.comovingGate = g.map((row, i) => show(row[i]!)).join(' | ')
    // the logical phases relative to |0_L>
    exact.comovingRelative = g.map((row, i) => show(mul(row[i]!, conj(g[0]![0]!)))).join(' | ')

    // beat 3 layer by layer on |0_L>
    let s = basis[0]!

    for (let t = 0; t < 2; t++) {
      s = applyLayers(s, BEAT_LAYERS)
    }

    const trace: Ninth[] = []

    for (const layer of BEAT_LAYERS) {
      s = layer(s, false)
      trace.push(spinOneWeight(s))
    }

    exact.beat3Trace = trace.map((w, i) => `${BEAT_LAYER_NAMES[i]} ${isOne(w) ? '1' : `~${approx(w)}`}`).join(', ')
    ok.onlyPairMovesWeight =
      trace.slice(0, 3).every(isOne) && !isOne(trace[3]!) && trace.slice(4).every(w => equals(w, trace[3]!))

    // control: the beat without M_pair keeps total spin 1 through T = 4
    const noPair = BEAT_LAYERS.filter((_, i) => i !== 3)

    ok.noPairKeepsSpin = dfsRun(starts, 4, noPair).every(run => run.leaves === -1)

    // a spin-2 control: the symmetric role word is outside the code (weight 0)
    const sym = roleOneState(dfsSites(0, 1), [ONE, ONE, ONE, ONE])

    ok.spinTwoControl = isZero(spinOneWeight(sym))
  })
}

function computeW12(report: Report): void {
  const { ok, numbers, exact } = report

  withGeometry('3434', () => {
    const runs = dfsRun(w12Kets([0, 1, 2]), 3, BEAT_LAYERS)

    runs.forEach((run, i) => {
      numbers[`w12Ket${i}Leaves`] = run.leaves
      exact[`w12Ket${i}Weights`] = run.weights.map(w => (isOne(w) ? '1' : `~${approx(w)}`)).join(' | ')
    })
    ok.w12HoldsTwoBeats = runs.every(run => run.weights.slice(0, 3).every(isOne))
    ok.w12LeavesAtThree = runs.every(run => run.leaves === 3)
  })
}

function compute(): Report {
  const report: Report = { ok: {}, numbers: {}, exact: {} }

  withGeometry('3434', () => computeHolographic(report))
  computeDfs(report, '3434', 'dfs', true)
  computeDfs(report, '3433', 'flat', false)
  computeW12(report)

  const dfsWeights = (tag: string): string =>
    ['basis0', 'basis1', 'basis2', 'fourier0', 'fourier1', 'fourier2'].map(n => report.exact[`${tag}${n}Weights`]).join(';')

  report.ok.flatSameWeights = dfsWeights('dfs') === dfsWeights('flat')

  return report
}

const INSTRUMENT = [
  'codeIsotropic',
  'codeRank23',
  'logicalsCommute',
  'logicalsPair',
  'logicalsOutside',
  'linesAreLean',
  'noLineNormalizer',
  'denseSupportAndPhases',
  'denseExpectations',
  'denseNotTrivial',
  'controlZZKeeps',
  'controlXDetected',
  'weightCountsSum',
  'neighboursDistinct',
  'stepBackReturns',
  'stepOnLeaves',
  'gammaWeightThreeQuarters',
  'vacuumOnlyStays',
  'returnFormula',
  'rolesStayZero',
  'pairSpanClosed',
  'pairFixesOthers',
  'lineGatesSameOnEveryLine',
  'lineLayersKeepCharge',
  'spinTwoControl',
  'dfsWeightsReal',
]

const H1 = ['f1AsPredicted', 'f2BoundBelowTenth']
const H2 = ['pairInvariant', 'pairOutsideEverySupport', 'pairChargeNonzero', 'dBreaks', 'kBreaks', 'meetBreaks', 'phiBreaks', 'streamBreaks', 'lineLeaksAsPredicted']
const H3 = ['dfsHoldsTwoBeats', 'dfsLeavesAsPredicted', 'onlyPairMovesWeight', 'noPairKeepsSpin', 'comovingUnitary', 'comovingDiagonal', 'dfsLabFidelityZeroAtOne']
const H4 = ['w12HoldsTwoBeats', 'w12LeavesAtThree']
const H5 = ['flatHoldsTwoBeats', 'flatSameWeights']

const allTrue = (report: Report, names: readonly string[]): boolean => names.every(n => report.ok[n] === true)

export default experiment({
  id: 'computation/bare-u-memory',
  code: 'E-CMP-0038',
  title:
    'quantum memory under the bare beat U: the [[24,1,8]]_3 holographic code on one dock leaves at T = 1 (the stream empties the dock; F(1) = |psi(vac)|^4, F(2) below 1/10) and only M_pair keeps it (by charge), while D, K, the meeting and Phi_odd each push it out at weight 2; a logical qutrit in the role-spin decoherence-free subspace of four like-sign excitations is kept exactly by five of the six layers and carried losslessly for two beats, and M_pair alone breaks it at T = 3 or 4, the same on the flat {3,4,3,3}; W12 kets break at T = 3; the qutrit toric code needs a closed torus the beat library lacks',
  category: 'computation',
  substrates: ['{3,4,3,4}', '{3,4,3,3}'],
  depth: 'L1',
  paper: false,
  run() {
    const first = compute()
    const second = compute()
    const identical = JSON.stringify(first) === JSON.stringify(second)
    const instrument = allTrue(first, INSTRUMENT) && identical
    const h = [H1, H2, H3, H4, H5].map(names => allTrue(first, names))
    const failed = Object.entries(first.ok)
      .filter(([, v]) => !v)
      .map(([k]) => k)
    const status = !instrument ? 'fail' : h.every(Boolean) ? 'pass' : 'partial'
    const e = first.exact
    const n = first.numbers

    return verdict({
      status,
      claim: !instrument
        ? `an instrument gate failed (${failed.join(', ') || (identical ? 'none' : 'two runs differ')})`
        : `[[24,1,8]]_3 on one dock: F(1) = ${e.basis0F1} for |0_L>, ${e.basis1F1} for |1_L> and |2_L>, ${e.fourier0F1} for the Fourier states (the stream empties the dock), F(2) <= ${n.basis0F2BoundApprox} (|0_L>) and ${n.fourier0F2BoundApprox} (Fourier)${h[0] ? '' : ' (H1 read differently)'}; M_pair keeps the code (no codeword on a pair configuration, charge 2t), D, K, M_meet, Phi_odd and S do not, and one line of D, K, M_meet leaks ${e.lineLeakD}, ${e.lineLeakK}, ${e.lineLeakMeet} (weight 2)${h[1] ? '' : ' (H2 read differently)'}; the role-spin DFS qutrit keeps total spin 1 exactly through T = 2, leaves at T = ${n.dfsbasis0Leaves} (|0_L>, Fourier) and ${n.dfsbasis1Leaves} (|1_L>, |2_L>), only M_pair moves the weight and without it nothing leaks through T = 4, T = 1 acts as the exact logical gate ${e.comovingRelative}${h[2] ? '' : ' (H3 read differently)'}; W12 kets leave at T = ${n.w12Ket0Leaves}${h[3] ? '' : ' (H4 read differently)'}; flat {3,4,3,3} ${first.ok.flatSameWeights ? 'reads the same weights' : 'differs'}${h[4] ? '' : ' (H5 read differently)'}`,
      metrics: first.numbers,
      control: {
        identicalBytes: identical ? 1 : 0,
        instrumentGates: INSTRUMENT.filter(name => first.ok[name]).length,
        instrumentGatesTotal: INSTRUMENT.length,
        smallConfigsChecked: n.smallConfigsChecked ?? 0,
        testableGenerators: n.testableGenerators ?? 0,
      },
      notes: `L1, exact over Q(zeta_9). Witnesses: D ${e.Dbasis0Witness}, K ${e.Kbasis0Witness}, M_meet ${e.Meetbasis0Witness} (<V psi|g|V psi> for a generator g, |0_L>); Phi_odd ${e.phiWitness}; gamma ${e.gamma}. DFS weights (exact, by beat 0..4): |0_L> ${e.dfsbasis0Weights}; |1_L> ${e.dfsbasis1Weights}; Fourier0 ${e.dfsfourier0Weights}. Lab fidelity |0_L> ${e.dfsbasis0LabFidelity}. Beat 3 trace: ${e.beat3Trace}. Lone-tone leak under D ${e.loneLeak} (any code with one slot per line, such as an edge-on-half-slot toric embedding, leaks at weight 1). Failed checks: ${failed.join(', ') || 'none'}. Not run: the qutrit toric code (E-QTM-0095) needs a closed four-torus and the beat library has none; F(T) for [[24,1,8]]_3 past T = 2 (24-excitation states of 3^15 terms).`,
    })
  },
})
