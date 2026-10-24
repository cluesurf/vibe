// THE RECONSTRUCTION AXIOMS ON THE MODEL (E-QTM-0185, quantum-coverage path 2). Hardy (2001), Chiribella, D'Ariano
// and Perinotti (2011) and Masanes and Mueller (2011) derive finite quantum theory from a few rules about states,
// readings and moves. This file explores whether the model's qutrit layer obeys five of them, each read exactly on
// the model's own moves and readings, each with its own control.
//
// THE MODEL READ (code/measure/reconstruction-axioms). A role is a qutrit. Its reversible moves are the links'
// Clifford letters X, Z, S, F (216 elements mod units, E-QTM-0117); two roles meet by the like meeting U = P_sym +
// w P_anti or the love-fear meeting V = 1 + (w - 1) P_Phi (the fear beat, code/rule/fear-weave, read off the rule
// by E-QTM-0158). Reached states: every ket a word of these 10 letters makes from |00>, to a stated depth. Readings:
// the four plane readings of a role (the stabilizer bases, E-QTM-0142's coset readings) and 96 ancilla readings
// (the role meets a fresh role in one of the 12 stabilizer states by U or V, and the fresh role is plane-read,
// E-QTM-0161's POVM). Every amplitude in Q(w), every probability an exact rational.
//
// THE FIVE TESTS AND THEIR CONTROLS
//  1 CAUSALITY: every reading's effects sum to one identity (the unique deterministic effect), A's outcome
//    chances do not depend on which reading B makes, and an earlier reading's chances do not depend on which
//    reading follows. Control: a post-selected reading (keep only outcome 0 and renormalize), which must signal.
//  2 LOCAL TOMOGRAPHY: K, the rank of the table of reading chances over reached states. K_A for one role,
//    K_AB(local) with products of one-role readings, K_AB(global) the span of the joint states. Holds when
//    K_AB(local) = K_AB(global) = K_A^2. Control: the real-amplitude restriction (kets over Q, read by projectors
//    onto such kets), where real quantum theory gives K_A = 6, K_AB(local) = 36 < K_AB(global) = 45.
//  3 PURIFICATION: every reached mixed state of a role is the marginal of a reached pure whole (true by
//    construction, the model's states are pure wholes); the content is uniqueness: two reached wholes with the
//    same marginal on A should differ by a reversible move on B. On one role B's moves are the 216 Cliffords, so
//    the reached wholes are grouped by A's exact marginal and split into orbits of B's moves. Controls: the
//    stabilizer theory (SUM in place of the meetings), where uniqueness holds; the fear beat off (U -> SWAP,
//    V -> 1), where no reached whole has a mixed marginal.
//  4 CONTINUOUS REVERSIBILITY: on one role the moves are a finite group, so it fails as stated; on two roles a
//    word of infinite order (Kronecker's test on the exact characteristic polynomial) makes the group infinite,
//    and closureLieRank reads its closure (80 = all of su(9)). Countable, never continuous: what replaces the
//    axiom is density, read as the least infidelity of the reached kets to four fixed probe kets as the depth
//    grows. Control: the fear beat off (every candidate word finite, rank 0, the orbit stops growing).
//  5 COMPLEX OR REAL: a non-real Bargmann invariant <a|b><b|c><c|a> among reached kets means no change of basis,
//    unitary or antiunitary, makes the states real. Control: the real restriction, all invariants real.
//
// PROBE BEFORE THE GATES, DISCLOSED (tmp/reconstruction-probe.ts, 2026-10-24): reached counts only. The model's
// letters reach 781, 4,434, 25,929 and 152,969 kets at depths 4 to 7, of which 66, 108, 152, 256 are products (above
// 144 = 12 x 12 from depth 6, so pure non-stabilizer roles are reached); fear beat off 64, 96, 124, 140, all
// products; stabilizer 99, 196, 316, 360. No gate quantity was read.
//
// GATES, fixed before the first gate run, never moved
//  G1 CAUSALITY HOLDS: every reading (4 planes, 96 ancilla, 16 product planes) sums to the identity exactly; 0
//     violations of A's marginal under every B reading over every reached joint ket to depth 4 and every plane of
//     A; 0 violations of an earlier plane reading's chances under every later reading over every reached marginal;
//     the post-selected controls change a chance on more than 0 states each
//  G2 LOCAL TOMOGRAPHY HOLDS: K_A = 9 (span and table), K_AB(local) = K_AB(global) = 81; control K_A = 6,
//     K_AB(local) = 36, K_AB(global) = 45
//  G3 PURIFICATION, PREDICTED TO FAIL ON A ONE-ROLE PURIFIER: more than 0 reached mixed marginals, and at least one
//     marginal whose reached wholes fall into more than one orbit of B's moves; stabilizer control: more than 0
//     mixed marginals, every marginal one orbit; fear beat off: 0 mixed marginals
//  G4 CONTINUOUS REVERSIBILITY, PREDICTED TO FAIL AS STATED: one-role group 216, |0>'s orbit 12, and more than 0
//     reached pure one-role states outside it; a word of infinite order among the words to length 3; Lie rank 80;
//     control: every candidate word finite, rank 0, the orbits stop growing (144 and 360 at the last two depths);
//     density: the least infidelity to every probe is smaller at depth 7 than at depth 4
//  G5 COMPLEX: more than 0 non-real Bargmann invariants among reached one-role pure kets and among reached joint
//     kets; the real control 0 of each
// VERDICT, fixed before the run: PASS when G1 to G5 come out as registered (the predicted departures included);
//  FAIL when G1, G2 or G5 fails; PARTIAL otherwise (a departure that does not come as predicted is recorded).
//
// FIRST RUN 2026-10-24 (40 s): FAIL on two clauses, the model's own numbers all as registered. G2's control: the real
//  family (products and v x w +- w x v of the 13 real kets) spans 42 of the 45 real dimensions, an instrument
//  shortfall of the control, not of the model. G4's density clause: probe 0 (a product with B in |0>) reads 0.1516 at
//  every depth 0 to 7, the reached kets never coming closer to it.
// SECOND RUN 2026-10-24 (55 s), after one change, disclosed: the real family gained e_p and e_p +- e_q on the 9 joint
//  coordinates (projectors spanning every real symmetric operator); no gate, threshold or model quantity changed.
//  PARTIAL by the registered verdict: G1, G2, G3, G5 as registered (real control 6, 36, 45); G4 holds on every clause
//  but the density one, where probe 0 stays at 0.1516 (the other three fall: 0.381 -> 0.161, 0.152 -> 0.0133,
//  0.255 -> 0.148). The one-role pure states reached to depth 7 are 50 (12 stabilizer, 38 not), so a product probe
//  waits on the slow growth of reached pure roles: density on two roles is shown by the Lie rank, not yet by the
//  words' reach to every probe.
//
// Depth L1: known quantum-information facts read exactly on the model's own gate set; the schedule of words is
// enumerated, not run by a mesh. Deterministic: breadth-first words in a fixed letter order, no random number.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { closureLieRank } from '@/code/measure/qutrit-clifford'
import {
  EIS,
  chancesDiffer,
  postSelected,
  sumRationals,
  ancillaReading,
  applyGate,
  bargmann,
  basisKet,
  cliffordLetters,
  conditionalSecond,
  densityOf,
  densitySpan,
  densityTableRank,
  finiteOrder,
  floatKet,
  infidelity,
  isIdentity,
  isProduct,
  isReal,
  kronEffects,
  ketKey,
  localTableRank,
  luders,
  matrixKey,
  onFirst,
  onSecond,
  oneRoleGroup,
  orbitKey,
  planeReading,
  productFactors,
  productKet,
  purity,
  rational,
  reachKets,
  realKets,
  reducedRole,
  sameRational,
  singletPhaseGate,
  splitBases,
  stabilizerKets,
  stateSpan,
  sumGate,
  sumOfEffects,
  swapPhaseGate,
  toOperator,
  traceRational,
  wordMatrix,
  wordsWith,
  type FloatKet,
  type Ket,
  type Rational,
  type Reading,
} from '@/code/measure/reconstruction-axioms'
import type { CycMatrix } from '@/code/algebra/cyclotomic'

const DEPTH_CAUSAL = 4
const DEPTH_TABLE = 5
const DEPTH_ORBIT = 7
const DEPTH_CONTROL_ORBIT = 10
const WORD_LENGTH = 3
const MAX_POWER = 20000
const CONJUGATION_DEPTH = 2
const JOINT_TRIPLE_KETS = 40

// the four probes of the density read, fixed by hand
function probes(): FloatKet[] {
  const ket = (re: number[], im: number[]): FloatKet => {
    const n = Math.hypot(...re, ...im)

    return {
      re: Float64Array.from(re, x => x / n),
      im: Float64Array.from(im, x => x / n),
    }
  }
  const one = (a: [number, number][]): [number[], number[]] => [
    a.map(x => x[0]),
    a.map(x => x[1]),
  ]
  const kron = (
    a: [number, number][],
    b: [number, number][],
  ): [number, number][] =>
    a.flatMap(x =>
      b.map(
        (y): [number, number] => [
          x[0] * y[0] - x[1] * y[1],
          x[0] * y[1] + x[1] * y[0],
        ],
      ),
    )
  const a: [number, number][] = [
    [Math.cos(0.4), 0],
    [Math.sin(0.4) * Math.cos(0.4), Math.sin(0.4) * Math.sin(0.4)],
    [0, 0],
  ]
  const b: [number, number][] = [
    [Math.cos(0.9), 0],
    [0, 0],
    [Math.sin(0.9) * Math.cos(0.7), -Math.sin(0.9) * Math.sin(0.7)],
  ]
  const zero: [number, number][] = [
    [1, 0],
    [0, 0],
    [0, 0],
  ]
  const schmidt = Array.from({ length: 9 }, (_, i): [number, number] =>
    i === 0 ? [Math.cos(0.4), 0] : i === 4 ? [Math.sin(0.4), 0] : [0, 0],
  )
  const phased = Array.from({ length: 9 }, (_, i): [number, number] =>
    i === 0
      ? [1, 0]
      : i === 4
        ? [Math.cos(0.5), Math.sin(0.5)]
        : i === 8
          ? [Math.cos(1.3), Math.sin(1.3)]
          : [0, 0],
  )

  return [kron(a, zero), kron(a, b), schmidt, phased].map(p =>
    ket(...one(p)),
  )
}


export default experiment({
  id: 'quantum/reconstruction-axioms',
  code: 'E-QTM-0185',
  title:
    "the reconstruction axioms on the model's qutrit layer: causality, local tomography (K_AB = K_A^2 = 81) and irreducibly complex amplitudes hold exactly on the model's own moves and readings, purification holds only up to moves a single role does not have, and continuous reversibility fails as stated, the reversible moves being a finite group on one role and a countable dense group on two",
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const c = cliffordLetters()
    const local = [...c.map(onFirst), ...c.map(onSecond)]
    const U = swapPhaseGate(EIS.root(1))
    const V = singletPhaseGate(EIS.root(1))
    const SWAP = swapPhaseGate(EIS.scale(EIS.one(), -1n))
    const model = [...local, U, V]
    const off = [...local, SWAP]
    const stab = [...local, sumGate()]
    const start = basisKet(9, 0)

    // ---- readings ----
    const stabKets = stabilizerKets()
    const bases = splitBases(stabKets)
    const planes = bases.map((b, i) => planeReading(`plane ${i}`, b))
    const ancilla: Reading[] = []

    for (const [gname, gate] of [
      ['U', U],
      ['V', V],
    ] as const) {
      stabKets.forEach((fresh, f) => {
        bases.forEach((basis, i) => {
          ancilla.push(
            ancillaReading({
              name: `${gname} fresh ${f} plane ${i}`,
              gate,
              fresh,
              basis,
            }),
          )
        })
      })
    }

    const oneRole = [...planes, ...ancilla]
    const productPlanes: Reading[] = planes.flatMap(p =>
      planes.map(q => ({
        name: `${p.name} x ${q.name}`,
        effects: kronEffects(p.effects, q.effects),
      })),
    )

    // ---- 1 causality ----
    const readingsSummingToOne = [...oneRole, ...productPlanes].filter(r =>
      isIdentity(sumOfEffects(r)),
    ).length
    const readingsTotal = oneRole.length + productPlanes.length

    const causalKets = reachKets({
      letters: model,
      start,
      depth: DEPTH_CAUSAL,
    }).map(r => r.ket)

    let marginalViolations = 0
    let marginalComparisons = 0
    let postSelectedSignalingStates = 0

    for (const k of causalKets) {
      let signals = false

      for (const p of planes) {
        const sigmas = p.effects.map(e => conditionalSecond(k, e))
        const firstMarginals = sigmas.map(s =>
          sumRationals(oneRole[0]!.effects.map(f => traceRational(f, s))),
        )
        const posts: Rational[][] = []

        for (const r of oneRole) {
          sigmas.forEach((s, a) => {
            const m = sumRationals(r.effects.map(f => traceRational(f, s)))

            marginalComparisons++
            marginalViolations += sameRational(m, firstMarginals[a]!) ? 0 : 1
          })

          // the control: B keeps only outcome 0 of the reading, renormalized
          const post = postSelected(sigmas, r.effects[0]!)

          if (post) {
            posts.push(post)
          }
        }

        signals ||= chancesDiffer(posts)
      }

      postSelectedSignalingStates += signals ? 1 : 0
    }

    // earlier and later readings on one role, over the reached marginals
    const tableKets = reachKets({
      letters: model,
      start,
      depth: DEPTH_TABLE,
    }).map(r => r.ket)
    const marginals = new Map<string, CycMatrix>()

    for (const k of tableKets) {
      for (const keep of [0, 1] as const) {
        const rho = reducedRole(k, keep)

        marginals.set(matrixKey(rho), rho)
      }
    }

    let futureViolations = 0
    let futureComparisons = 0
    let futurePostSignalingStates = 0

    for (const rho of marginals.values()) {
      let signals = false

      for (const p of planes) {
        const taus = p.effects.map(e => luders(e, rho))
        const before = taus.map(t =>
          sumRationals(oneRole[0]!.effects.map(f => traceRational(f, t))),
        )
        const posts: Rational[][] = []

        for (const r of oneRole) {
          taus.forEach((t, a) => {
            const m = sumRationals(r.effects.map(f => traceRational(f, t)))

            futureComparisons++
            futureViolations += sameRational(m, before[a]!) ? 0 : 1
          })

          const post = postSelected(taus, r.effects[0]!)

          if (post) {
            posts.push(post)
          }
        }

        signals ||= chancesDiffer(posts)
      }

      futurePostSignalingStates += signals ? 1 : 0
    }

    const g1 =
      readingsSummingToOne === readingsTotal &&
      marginalViolations === 0 &&
      futureViolations === 0 &&
      postSelectedSignalingStates > 0 &&
      futurePostSignalingStates > 0

    // ---- 2 local tomography ----
    const oneRoleStates = [...marginals.values(), ...stabKets.map(densityOf)]
    const oneRoleEffects = oneRole.flatMap(r => r.effects)
    const planeEffects = planes.flatMap(r => r.effects)
    const kASpan = densitySpan(oneRoleStates)
    const kATable = densityTableRank(oneRoleStates, oneRoleEffects)
    const kABGlobal = stateSpan(tableKets)
    const kABLocal = localTableRank(tableKets, planeEffects, planeEffects)

    const real1 = realKets(3)
    const realProjectors = real1.map(densityOf)
    const real2: Ket[] = []

    for (let i = 0; i < real1.length; i++) {
      for (let j = 0; j < real1.length; j++) {
        real2.push(productKet(real1[i]!, real1[j]!))

        if (i < j) {
          const p = productKet(real1[i]!, real1[j]!)
          const q = productKet(real1[j]!, real1[i]!)

          for (const sign of [1n, -1n]) {
            real2.push({
              entries: p.entries.map((x, t) =>
                EIS.add(
                  EIS.scale(x, q.den),
                  EIS.scale(q.entries[t]!, sign * p.den),
                ),
              ),
              den: p.den * q.den,
            })
          }
        }
      }
    }

    // run 2 addition (the control's instrument, disclosed): e_p and e_p +- e_q on the 9 joint coordinates, whose
    // projectors span every real symmetric operator (run 1's family spanned 42 of 45)
    for (let p = 0; p < 9; p++) {
      for (let q = p; q < 9; q++) {
        for (const sign of p === q ? [0n] : [1n, -1n]) {
          real2.push({
            entries: Array.from({ length: 9 }, (_, t): [bigint, bigint] => [
              t === p ? 1n : t === q ? sign : 0n,
              0n,
            ]),
            den: 1n,
          })
        }
      }
    }

    const realKA = densitySpan(realProjectors)
    const realKATable = densityTableRank(realProjectors, realProjectors)
    const realKABGlobal = stateSpan(real2)
    const realKABLocal = localTableRank(real2, realProjectors, realProjectors)

    const g2 =
      kASpan === 9 &&
      kATable === 9 &&
      kABLocal === 81 &&
      kABGlobal === 81 &&
      realKA === 6 &&
      realKATable === 6 &&
      realKABLocal === 36 &&
      realKABGlobal === 45

    // ---- 3 purification ----
    const bMoves = oneRoleGroup().map(onSecond)

    const purificationRead = (kets: readonly Ket[]) => {
      const groups = new Map<string, Set<string>>()
      const isMixed = new Map<string, boolean>()

      for (const k of kets) {
        const rho = reducedRole(k, 0)
        const key = matrixKey(rho)
        const p = purity(rho)

        isMixed.set(key, p.num !== p.den)

        const set = groups.get(key) ?? new Set<string>()

        set.add(orbitKey(k, bMoves))
        groups.set(key, set)
      }

      let mixed = 0
      let mixedSplit = 0
      let pureSplit = 0
      let largest = 0

      for (const [key, orbits] of groups) {
        if (isMixed.get(key)) {
          mixed++
          mixedSplit += orbits.size > 1 ? 1 : 0
        } else {
          pureSplit += orbits.size > 1 ? 1 : 0
        }

        largest = Math.max(largest, orbits.size)
      }

      return { marginals: groups.size, mixed, mixedSplit, pureSplit, largest }
    }

    const purModel = purificationRead(tableKets)
    const stabKetsReached = reachKets({
      letters: stab,
      start,
      depth: DEPTH_CONTROL_ORBIT,
    })
    const offKetsReached = reachKets({
      letters: off,
      start,
      depth: DEPTH_CONTROL_ORBIT,
    })
    const purStab = purificationRead(stabKetsReached.map(r => r.ket))
    const purOff = purificationRead(offKetsReached.map(r => r.ket))

    const g3 =
      purModel.mixed > 0 &&
      purModel.mixedSplit > 0 &&
      purStab.mixed > 0 &&
      purStab.mixedSplit === 0 &&
      purStab.pureSplit === 0 &&
      purOff.mixed === 0

    // ---- 4 continuous reversibility ----
    const group = oneRoleGroup()
    const zero3 = basisKet(3, 0)
    const orbitOfZero = new Set(
      group.map(g => matrixKey(densityOf(applyGate(g, zero3)))),
    )

    const orbitReached = reachKets({
      letters: model,
      start,
      depth: DEPTH_ORBIT,
    })
    const pureRoles = new Map<string, Ket>()

    for (const { ket } of orbitReached) {
      if (isProduct(ket)) {
        for (const f of productFactors(ket)) {
          pureRoles.set(matrixKey(densityOf(f)), f)
        }
      }
    }

    const pureOutside = [...pureRoles.keys()].filter(
      k => !orbitOfZero.has(k),
    ).length

    // words over [U or SWAP, S on 1, F on 1, S on 2, F on 2] that hold the meeting
    const alphabet = (meeting: CycMatrix): CycMatrix[] => [
      meeting,
      onFirst(c[2]!),
      onFirst(c[3]!),
      onSecond(c[2]!),
      onSecond(c[3]!),
    ]
    const words = wordsWith({ alphabet: 5, length: WORD_LENGTH, must: 0 })
    const modelLetters = alphabet(U)
    const controlLetters = alphabet(SWAP)
    const infiniteWords = words.filter(
      w => !finiteOrder(wordMatrix(modelLetters, w)),
    )
    const controlFinite = words.filter(w =>
      finiteOrder(wordMatrix(controlLetters, w)),
    ).length
    const firstInfinite = infiniteWords[0] ?? []

    const lie = closureLieRank({
      generators: modelLetters.map(toOperator),
      words: firstInfinite.length > 0 ? [firstInfinite] : [],
      maxPower: MAX_POWER,
      conjugationDepth: CONJUGATION_DEPTH,
    })
    const lieControl = closureLieRank({
      generators: controlLetters.map(toOperator),
      words,
      maxPower: MAX_POWER,
      conjugationDepth: CONJUGATION_DEPTH,
    })

    // the orbit sizes by depth, and the density read
    const sizes = (reached: readonly { depth: number }[], depth: number) =>
      Array.from(
        { length: depth + 1 },
        (_, d) => reached.filter(r => r.depth <= d).length,
      )
    const modelSizes = sizes(orbitReached, DEPTH_ORBIT)
    const stabSizes = sizes(stabKetsReached, DEPTH_CONTROL_ORBIT)
    const offSizes = sizes(offKetsReached, DEPTH_CONTROL_ORBIT)
    const probeKets = probes()
    const best = probeKets.map(() =>
      new Array<number>(DEPTH_ORBIT + 1).fill(1),
    )

    for (const { ket, depth } of orbitReached) {
      const f = floatKet(ket)

      probeKets.forEach((p, i) => {
        const x = infidelity(p, f)

        for (let d = depth; d <= DEPTH_ORBIT; d++) {
          if (x < best[i]![d]!) {
            best[i]![d] = x
          }
        }
      })
    }

    const denser = best.every(b => b[DEPTH_ORBIT]! < b[4]!)
    const offBest = probeKets.map(p =>
      Math.min(
        ...offKetsReached.map(r => infidelity(p, floatKet(r.ket))),
      ),
    )

    const g4 =
      group.length === 216 &&
      orbitOfZero.size === 12 &&
      pureOutside > 0 &&
      infiniteWords.length > 0 &&
      lie.rank === 80 &&
      controlFinite === words.length &&
      lieControl.rank === 0 &&
      offSizes[DEPTH_CONTROL_ORBIT - 1] === 144 &&
      offSizes[DEPTH_CONTROL_ORBIT] === 144 &&
      stabSizes[DEPTH_CONTROL_ORBIT - 1] === 360 &&
      stabSizes[DEPTH_CONTROL_ORBIT] === 360 &&
      denser

    // ---- 5 complex or real ----
    const countNonReal = (kets: readonly Ket[]): number => {
      let n = 0

      for (let i = 0; i < kets.length; i++) {
        for (let j = i + 1; j < kets.length; j++) {
          for (let k = j + 1; k < kets.length; k++) {
            n += isReal(bargmann(kets[i]!, kets[j]!, kets[k]!).num) ? 0 : 1
          }
        }
      }

      return n
    }
    const roleKets = [...pureRoles.values()]
    const nonRealOne = countNonReal(roleKets)
    const nonRealStabilizer = countNonReal(stabKets)
    const jointKets = tableKets.slice(0, JOINT_TRIPLE_KETS)
    const nonRealJoint = countNonReal(jointKets)
    const realNonRealOne = countNonReal(real1)
    const realNonRealJoint = countNonReal(real2.slice(0, JOINT_TRIPLE_KETS))

    // a witness: the first non-real invariant among the stabilizer kets
    let witness = ''

    for (let i = 0; i < stabKets.length && !witness; i++) {
      for (let j = i + 1; j < stabKets.length && !witness; j++) {
        for (let k = j + 1; k < stabKets.length && !witness; k++) {
          const b = bargmann(stabKets[i]!, stabKets[j]!, stabKets[k]!)

          if (!isReal(b.num)) {
            witness = `(${b.num[0]} + ${b.num[1]} w) / ${b.den} on stabilizer kets ${i}, ${j}, ${k}`
          }
        }
      }
    }

    const g5 =
      nonRealOne > 0 &&
      nonRealJoint > 0 &&
      realNonRealOne === 0 &&
      realNonRealJoint === 0

    const status =
      !g1 || !g2 || !g5 ? 'fail' : g3 && g4 ? 'pass' : 'partial'

    const round = (x: number): number => Number(x.toPrecision(4))

    return verdict({
      status,
      claim:
        "on the model's qutrit layer causality holds exactly (every reading sums to the identity, no reading of B or later reading moves A's chances, while post-selection does), local tomography holds (K_A = 9, K_AB = 81 from products of one-role readings, against 6, 36 and 45 for the real restriction), and the amplitudes are irreducibly complex (non-real Bargmann invariants, real restriction none); purification exists by construction but is unique only up to moves a single role does not have, and continuous reversibility fails as stated: the moves are a finite group of 216 on one role and a countable dense group on two",
      metrics: {
        gateCausality: g1 ? 1 : 0,
        gateLocalTomography: g2 ? 1 : 0,
        gatePurification: g3 ? 1 : 0,
        gateReversibility: g4 ? 1 : 0,
        gateComplex: g5 ? 1 : 0,
        readingsSummingToIdentity: readingsSummingToOne,
        readings: readingsTotal,
        causalKets: causalKets.length,
        marginalComparisons,
        marginalViolations,
        futureComparisons,
        futureViolations,
        oneRoleMarginals: marginals.size,
        tableKets: tableKets.length,
        kASpan,
        kATable,
        kABLocal,
        kABGlobal,
        purificationMarginals: purModel.marginals,
        purificationMixedMarginals: purModel.mixed,
        purificationMixedSplit: purModel.mixedSplit,
        purificationPureSplit: purModel.pureSplit,
        purificationLargestOrbitCount: purModel.largest,
        oneRoleGroup: group.length,
        orbitOfZero: orbitOfZero.size,
        pureRolesReached: pureRoles.size,
        pureRolesOutsideOrbit: pureOutside,
        candidateWords: words.length,
        infiniteOrderWords: infiniteWords.length,
        lieRank: lie.rank,
        liePower: lie.power,
        modelOrbitDepth4: modelSizes[4]!,
        modelOrbitDepth7: modelSizes[DEPTH_ORBIT]!,
        ...Object.fromEntries(
          best.flatMap((b, i) => [
            [`probe${i}InfidelityDepth4`, round(b[4]!)],
            [`probe${i}InfidelityDepth7`, round(b[DEPTH_ORBIT]!)],
          ]),
        ),
        nonRealOneRoleTriples: nonRealOne,
        nonRealStabilizerTriples: nonRealStabilizer,
        nonRealJointTriples: nonRealJoint,
        oneRolePureKets: roleKets.length,
      },
      control: {
        postSelectedSignalingStates,
        futurePostSignalingStates,
        realKA,
        realKATable,
        realKABLocal,
        realKABGlobal,
        stabilizerMixedMarginals: purStab.mixed,
        stabilizerMixedSplit: purStab.mixedSplit,
        stabilizerPureSplit: purStab.pureSplit,
        fearOffMixedMarginals: purOff.mixed,
        fearOffFiniteWords: controlFinite,
        fearOffLieRank: lieControl.rank,
        fearOffOrbitLast: offSizes[DEPTH_CONTROL_ORBIT]!,
        stabilizerOrbitLast: stabSizes[DEPTH_CONTROL_ORBIT]!,
        ...Object.fromEntries(
          offBest.map((x, i) => [`fearOffProbe${i}Infidelity`, round(x)]),
        ),
        realNonRealOneRoleTriples: realNonRealOne,
        realNonRealJointTriples: realNonRealJoint,
      },
      notes:
        `first infinite-order word (letters U, S1, F1, S2, F2): ${firstInfinite.join(' ')}; Bargmann witness ${witness}; ` +
        `model orbit by depth ${modelSizes.join(', ')}; fear beat off ${offSizes.join(', ')}; stabilizer ${stabSizes.join(', ')}; ` +
        `least infidelity by depth per probe: ${best.map(b => b.map(round).join('/')).join('; ')}. ` +
        'L1. The model is read here as a subtheory of complex quantum theory on its own letters, so causality and local tomography are consistency checks whose content is that the model reaches enough states and readings to fill the full dimensions; purification and reversibility are where the finite one-role group bites.',
    })
  },
})
