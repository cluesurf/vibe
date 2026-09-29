// Contextuality on the model's knots: is the knit contextual for its own readings exactly where it holds a
// fear, and nowhere else?
//
// The model's readings are stabilizer measurements: an outcome is a line (one role) or a Lagrangian coset (two
// roles), and its chance is the net count of the whole over it (E-QTM-0130, E-QTM-0142). Howard, Wallman, Veitch
// and Emerson (2014) proved, for odd prime dimension, that a state is contextual with respect to stabilizer
// measurements exactly when its Wigner function is negative somewhere. The model's links are the qutrit Clifford
// group (E-QTM-0117) and the fear beat is its only non-Clifford gate (E-QTM-0118), so the prediction is that the
// Clifford part alone is noncontextual (Gross 2006: stabilizer states have a nonnegative Wigner function) and
// that contextuality appears exactly where, and only when, the fear beat has made a fear.
//
// The derivation, done here exactly rather than cited:
// 1. A noncontextual value assignment gives every displacement D(v) of two roles a value omega^f(v), with f
//    linear on every Lagrangian plane (commuting displacements multiply with no phase in the symmetric
//    convention, checked on the operators). That is a linear system over F3 in 40 unknowns, one per line
//    through the origin, solved here: its solutions form a space of dimension 4, so the only noncontextual
//    assignments are the 81 phase points x, f(v) = [x, v]. On ONE role the same system has no constraint at
//    all (the 4 lines share nothing): 81 assignments against 9 phase points, so any one-role state, fear or no
//    fear, has a noncontextual model of its own stabilizer readings (E-QTM-0120 found the matching fact for
//    KCBS: one role's stabilizer states hold no pentagon).
// 2. A noncontextual model of two roles is then a distribution q over the 81 phase points whose coset sums
//    are the readings. Every point lies in 40 cosets through itself and every other point in exactly 4 of
//    them (sum over the 40 planes P of 1[x in u + P] = 36 delta(x, u) + 4), so the coset sums fix q, and q is
//    the Wigner function. Hence: a two-role knot is noncontextual for the model's readings if and only if it
//    holds no fear.
// 3. The same identity is a noncontextuality inequality per point u: S_u = sum over the 40 planes of the
//    chance of the coset through u satisfies S_u >= 4 in every noncontextual model (an assignment at x != u
//    meets 4 of the 40, at x = u all 40), and in the model S_u = 36 W(u) + 4 exactly. So S_u < 4 exactly
//    where W(u) < 0, the deficit is 36 |W(u)| (at most 4, where W(u) = -1/9, the floor of two roles), and the
//    total deficit over all points is 36 times the fear share: 36 F / N = 18 (e^mana - 1).
//
// Gates, fixed before the first run:
// G1 structure: 4 and 40 Lagrangians; the two-role assignment space has dimension 4 and the 81 phase-point
//    functions are distinct (so they are all of it); the one-role space has dimension 4 (81 assignments, 9
//    points); every commuting pair of two-role displacements multiplies to D(u + v) with no phase (0 failures,
//    1e-12); the coset identity 36 delta + 4 holds at every u
// G2 on every two-role whole of every history below: N S_u = 36 w(u) + 4 N exactly (BigInt, 0 mismatches), a
//    point violates exactly when it holds a fear (0 mismatches), and the total deficit is 36 F (0 mismatches)
// G3 the Clifford part is noncontextual: with the fear beat off, from role basis (stabilizer) starts, 0 wholes
//    violate at any beat, on every start of the family
// G4 contextuality appears only at the fear beat: on a beat whose record has no meeting of the pair, the
//    number of violating points never changes (links move points by symplectic maps, which permute the
//    Lagrangian cosets); and with the fear beat on, some whole from a stabilizer start violates
// G5 one role is never contextual for its own readings: every line chance of every reduced role state is
//    non-negative (0 negative), while some reduced states hold fear
// G6 over E-MTH-0028's 17 link starts (vacuum, color law, 120 beats): G2 and G3 hold on 17 of 17
// Reported: violating wholes and points per law, the deepest weight reached (largest per-point deficit), the
// largest total deficit, the KCBS pentagram aligned on each reduced state's most negative point (E-QTM-0120's
// closed form) and its agreement with fear, and how many physical wholes a sample finds outside the state
// space (an instrument check on the color law's frames).
//
// Histories: the committed color weave (side 3, pair table), live links, vacuum and a golden-rate matter fill
// (2.11), every meeting pair of dock 0, 480 beats, starts |0>|1>, Strange|0>, Strange Strange (code/measure/
// knit-magic, as E-QTM-0119 and 0120), under the swap-phase law, the color law (read in the love frame,
// physicalWhole), and both with the fear beat off. The start family runs the vacuum, the color law on and off,
// from |0>|1>.
//
// Depth L2: a known theorem (HWVE 2014) derived exactly and checked on every knot the knit makes.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  fearKernels,
  meetingKernel,
  physicalWhole,
  swapPhase,
  type BeatRecord,
  type FearKernels,
  type Whole,
} from '@/code/rule/fear-weave'
import {
  classicalRecords,
  meetingPairs,
  pairRecords,
  productWhole,
  runWhole,
  vacuumBackground,
  weylBackground,
  type Background,
  type RoleState,
} from '@/code/measure/knit-magic'
import {
  assignmentSpace,
  cosetLabels,
  lagrangians,
  marginalOf,
  phaseSpace,
  type Space,
} from '@/code/measure/stabilizer-contexts'
import {
  displacementOperators,
  hermitianSpectrum,
  kcbsAligned,
  operatorFromWigner,
} from '@/code/measure/qutrit-clifford'
import {
  multiplyOperators,
  phasePointOperators,
} from '@/code/measure/grid-weights'
import { startFamily, withStart } from '@/code/measure/start-ensemble'

const OMEGA = (2 * Math.PI) / 3
const SIDE = 3
const BEATS = 480
const FAMILY_BEATS = 120
const MATTER_SCALE = 2.11
const STATE_SAMPLE = 37
const STARTS: readonly (readonly [RoleState, RoleState])[] = [
  ['basis0', 'basis1'],
  ['strange', 'basis0'],
  ['strange', 'strange'],
]

type Law = {
  name: string
  fear: boolean
  kernel4: readonly (readonly number[])[]
  color?: FearKernels
}

type Tally = {
  wholes: number
  violatingWholes: number
  violatingPoints: number
  identityMismatches: number
  fearMismatches: number
  deficitMismatches: number
  quietChanges: number
  deepest: number
  largestDeficit: number
  sampled: number
  outside: number
}

const newTally = (): Tally => ({
  wholes: 0,
  violatingWholes: 0,
  violatingPoints: 0,
  identityMismatches: 0,
  fearMismatches: 0,
  deficitMismatches: 0,
  quietChanges: 0,
  deepest: 0,
  largestDeficit: 0,
  sampled: 0,
  outside: 0,
})

// the per-point sums S_u, times the units, of a two-role whole, and what they say
function readWhole(input: {
  weight: readonly bigint[]
  space: Space
  planes: readonly Int32Array[]
}): {
  violating: number
  identityOk: boolean
  fearOk: boolean
  deficitOk: boolean
  deepest: number
  deficitShare: number
} {
  const { weight, space, planes } = input
  const n = weight.reduce((a, b) => a + b, 0n)
  const sums = planes.map(() =>
    new Array<bigint>(space.points).fill(0n),
  )

  weight.forEach((w, x) => {
    if (w !== 0n) {
      planes.forEach((labels, p) => {
        const row = sums[p] ?? []
        const c = labels[x] ?? 0

        row[c] = (row[c] ?? 0n) + w
      })
    }
  })

  let violating = 0
  let identityOk = true
  let fearOk = true
  let deficit = 0n
  let fears = 0n
  let deepest = 0

  for (let u = 0; u < space.points; u++) {
    let s = 0n

    planes.forEach((labels, p) => {
      s += sums[p]?.[labels[u] ?? 0] ?? 0n
    })

    const w = weight[u] ?? 0n

    identityOk = identityOk && s === 36n * w + 4n * n
    fearOk = fearOk && s < 4n * n === w < 0n
    violating += s < 4n * n ? 1 : 0
    deficit += s < 4n * n ? 4n * n - s : 0n
    fears += w < 0n ? -w : 0n
    deepest = Math.min(deepest, Number(w) / Number(n))
  }

  return {
    violating,
    identityOk,
    fearOk,
    deficitOk: deficit === 36n * fears,
    deepest,
    deficitShare: Number(deficit) / Number(n),
  }
}

export default experiment({
  id: 'quantum/stabilizer-contextuality-is-fear',
  code: 'E-QTM-0149',
  title:
    "contextuality on the knots is the fear: the only noncontextual value assignments of two roles' displacements are the 81 phase points, so a knot is contextual for the model's own readings exactly when it holds a fear, and the 40-context inequality S_u >= 4 reads S_u = 36 W(u) + 4 exactly on every knot the knit makes, violated only at fears, never with the fear beat off from stabilizer starts, and changing only at meetings; one role is never contextual for its own readings",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // G1 structure
    const one = phaseSpace(1)
    const two = phaseSpace(2)
    const lines = lagrangians(one)
    const planes = lagrangians(two)
    const planeLabels = planes.map(p => cosetLabels(two, p))
    const lineLabels = lines.map(p => cosetLabels(one, p))
    const oneSpace = assignmentSpace(one)
    const twoSpace = assignmentSpace(two)
    const phaseFunctions = new Set<string>()

    for (let x = 0; x < 81; x++) {
      phaseFunctions.add(
        Array.from(
          { length: 81 },
          (_, v) => two.form[x * 81 + v] ?? 0,
        ).join(''),
      )
    }

    const displacements = displacementOperators(2)

    let commutingPairs = 0
    let commutingFailures = 0

    for (let u = 1; u < 81; u++) {
      for (let v = 1; v < 81; v++) {
        if ((two.form[u * 81 + v] ?? 1) !== 0) {
          continue
        }

        commutingPairs++

        const product = multiplyOperators(
          displacements[u]!,
          displacements[v]!,
        )
        const target = displacements[two.add[u * 81 + v] ?? 0]!

        let error = 0

        for (let k = 0; k < 81; k++) {
          error = Math.max(
            error,
            Math.abs((product.re[k] ?? 0) - (target.re[k] ?? 0)),
            Math.abs((product.im[k] ?? 0) - (target.im[k] ?? 0)),
          )
        }

        commutingFailures += error > 1e-12 ? 1 : 0
      }
    }

    let identityPoints = 0

    for (let u = 0; u < 81; u++) {
      let ok = true

      for (let x = 0; x < 81; x++) {
        const count = planeLabels.reduce(
          (s, labels) => s + (labels[x] === labels[u] ? 1 : 0),
          0,
        )

        ok = ok && count === (x === u ? 40 : 4)
      }

      identityPoints += ok ? 1 : 0
    }

    // one role's stabilizer states: two are orthogonal exactly when their lines are disjoint (parallel and
    // distinct), so the orthogonality graph is a union of the 4 directions' triangles
    let oneRoleOrthogonalPairs = 0
    let oneRoleOrthogonalAcross = 0

    for (let d = 0; d < 4; d++) {
      for (let e = 0; e < 4; e++) {
        const ld = lineLabels[d]!
        const le = lineLabels[e]!

        for (const c of new Set(ld)) {
          for (const f of new Set(le)) {
            if (d * 9 + c >= e * 9 + f) {
              continue
            }

            let meet = false

            for (let x = 0; x < 9; x++) {
              meet = meet || (ld[x] === c && le[x] === f)
            }

            if (!meet) {
              oneRoleOrthogonalPairs++
              oneRoleOrthogonalAcross += d === e ? 0 : 1
            }
          }
        }
      }
    }

    const structureOk =
      lines.length === 4 &&
      planes.length === 40 &&
      twoSpace.dimension === 4 &&
      phaseFunctions.size === 81 &&
      oneSpace.dimension === 4 &&
      commutingFailures === 0 &&
      commutingPairs > 0 &&
      identityPoints === 81

    // the laws
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []
    const kOff = meetingKernel(swapPhase(Math.PI)) ?? []
    const colorOn =
      fearKernels({ like: OMEGA, unlike: OMEGA }) ?? undefined
    const colorOff =
      fearKernels({ like: Math.PI, unlike: 0 }) ?? undefined
    const laws: Law[] = [
      { name: 'swap', fear: true, kernel4: kThird },
      { name: 'swapOff', fear: false, kernel4: kOff },
      { name: 'color', fear: true, kernel4: [], color: colorOn },
      { name: 'colorOff', fear: false, kernel4: [], color: colorOff },
    ]
    const points2 = phasePointOperators(2)

    const tallies = new Map<string, Tally>()

    let reducedStates = 0
    let reducedWithFear = 0
    let negativeLineChances = 0
    let kcbsViolations = 0
    let kcbsWithoutFear = 0
    let kcbsLargest = 0

    const physical = (law: Law, whole: Whole): readonly bigint[] =>
      law.color ? physicalWhole(whole).weight : whole.weight

    const runHistories = (input: {
      background: Background
      beats: number
      starts: readonly (readonly [RoleState, RoleState])[]
      laws: readonly Law[]
      key: (law: Law, start: readonly [RoleState, RoleState]) => string
      reduced: boolean
    }): void => {
      const weave = makeColorWeave({ side: SIDE, table: 'pair' })
      const records = classicalRecords({
        weave,
        links: weave.links,
        background: input.background,
        open: Array.from({ length: 24 }, (_, d) => d),
        beats: input.beats,
      })

      for (const { a, b } of meetingPairs(records)) {
        const mine: BeatRecord[] = pairRecords(records, a, b)

        for (const start of input.starts) {
          for (const law of input.laws) {
            const key = input.key(law, start)
            const tally = tallies.get(key) ?? newTally()
            const startWhole = productWhole([a, b], start)
            const wholes: Whole[] = [
              startWhole,
              ...runWhole({
                weave,
                start: startWhole,
                records: mine,
                kernel4: law.kernel4,
                color: law.color,
              }).map(s => s.whole),
            ]

            let previous = -1

            wholes.forEach((whole, t) => {
              const weight = physical(law, whole)
              const read = readWhole({
                weight,
                space: two,
                planes: planeLabels,
              })

              tally.wholes++
              tally.violatingWholes += read.violating > 0 ? 1 : 0
              tally.violatingPoints += read.violating
              tally.identityMismatches += read.identityOk ? 0 : 1
              tally.fearMismatches += read.fearOk ? 0 : 1
              tally.deficitMismatches += read.deficitOk ? 0 : 1
              tally.deepest = Math.min(tally.deepest, read.deepest)
              tally.largestDeficit = Math.max(
                tally.largestDeficit,
                read.deficitShare,
              )

              // a beat whose record holds no meeting of the pair (t indexes the whole after record t - 1)
              if (
                t > 0 &&
                (mine[t - 1]?.meetings.length ?? 0) === 0 &&
                previous >= 0 &&
                read.violating !== previous
              ) {
                tally.quietChanges++
              }

              previous = read.violating

              if (tally.wholes % STATE_SAMPLE === 0) {
                const n = Number(weight.reduce((x, y) => x + y, 0n))
                const spectrum = hermitianSpectrum(
                  operatorFromWigner(
                    weight.map(x => Number(x) / n),
                    points2,
                  ),
                )

                tally.sampled++
                tally.outside += (spectrum[0] ?? 0) < -1e-9 ? 1 : 0
              }

              if (input.reduced) {
                for (const keep of [0, 1]) {
                  const m = marginalOf(weight, 2, [keep])
                  const n = m.reduce((x, y) => x + y, 0n)

                  let fear = false
                  let minimum = 0

                  for (const w of m) {
                    fear = fear || w < 0n
                    minimum = Math.min(minimum, Number(w) / Number(n))
                  }

                  reducedStates++
                  reducedWithFear += fear ? 1 : 0

                  for (const labels of lineLabels) {
                    const chance = new Map<number, bigint>()

                    m.forEach((w, x) =>
                      chance.set(
                        labels[x] ?? 0,
                        (chance.get(labels[x] ?? 0) ?? 0n) + w,
                      ),
                    )

                    for (const c of chance.values()) {
                      negativeLineChances += c < 0n ? 1 : 0
                    }
                  }

                  const kcbs = kcbsAligned(minimum)

                  kcbsLargest = Math.max(kcbsLargest, kcbs)
                  kcbsViolations += kcbs > 2 + 1e-12 ? 1 : 0
                  kcbsWithoutFear += kcbs > 2 + 1e-12 && !fear ? 1 : 0
                }
              }
            })

            tallies.set(key, tally)
          }
        }
      }
    }

    const slots =
      makeColorWeave({ side: SIDE, table: 'pair' }).mesh.cellCount * 24

    for (const background of [
      vacuumBackground(slots),
      weylBackground({ slots, scale: MATTER_SCALE }),
    ]) {
      runHistories({
        background,
        beats: BEATS,
        starts: STARTS,
        laws,
        key: (law, start) =>
          `${law.name}:${start[0] === 'strange' ? 'magicStart' : 'stabilizerStart'}`,
        reduced: true,
      })
    }

    // G6 over the start family
    const family = startFamily(16)

    let familyPass = 0
    let familyViolatingWholes = 0

    const familyDetail: string[] = []

    for (const member of family) {
      const before = new Map(
        [...tallies.entries()].map(([k, v]) => [k, { ...v }]),
      )

      withStart(member, () => {
        runHistories({
          background: vacuumBackground(slots),
          beats: FAMILY_BEATS,
          starts: [['basis0', 'basis1']],
          laws: laws.filter(l => l.color),
          key: law => `family:${law.name}`,
          reduced: false,
        })
      })

      const on = tallies.get('family:color') ?? newTally()
      const off = tallies.get('family:colorOff') ?? newTally()
      const onBefore = before.get('family:color') ?? newTally()
      const offBefore = before.get('family:colorOff') ?? newTally()
      const exact =
        on.identityMismatches === onBefore.identityMismatches &&
        on.fearMismatches === onBefore.fearMismatches &&
        on.deficitMismatches === onBefore.deficitMismatches &&
        off.identityMismatches === offBefore.identityMismatches &&
        off.fearMismatches === offBefore.fearMismatches
      const offClean = off.violatingWholes === offBefore.violatingWholes
      const violated = on.violatingWholes - onBefore.violatingWholes

      familyPass += exact && offClean ? 1 : 0
      familyViolatingWholes += violated
      familyDetail.push(`${member.name}:${violated}`)
    }

    const sum = (
      pick: (t: Tally) => number,
      keys: readonly string[],
    ): number =>
      keys.reduce((s, k) => s + pick(tallies.get(k) ?? newTally()), 0)
    const allKeys = [...tallies.keys()]
    const onStabilizer = [
      'swap:stabilizerStart',
      'color:stabilizerStart',
    ]
    const offStabilizer = [
      'swapOff:stabilizerStart',
      'colorOff:stabilizerStart',
      'family:colorOff',
    ]
    const onKeys = allKeys.filter(
      k =>
        k.startsWith('swap:') ||
        k.startsWith('color:') ||
        k === 'family:color',
    )

    const g2 =
      sum(t => t.identityMismatches, allKeys) === 0 &&
      sum(t => t.fearMismatches, allKeys) === 0 &&
      sum(t => t.deficitMismatches, allKeys) === 0
    const g3 = sum(t => t.violatingWholes, offStabilizer) === 0
    const g4 =
      sum(t => t.quietChanges, allKeys) === 0 &&
      sum(t => t.violatingWholes, onStabilizer) > 0
    const g5 = negativeLineChances === 0 && reducedWithFear > 0
    const g6 = familyPass === family.length

    const ok = structureOk && g2 && g3 && g4 && g5 && g6
    const read = (key: string, pick: (t: Tally) => number): number =>
      pick(tallies.get(key) ?? newTally())

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "the noncontextual value assignments of two roles' displacements are exactly the 81 phase points (an F3 system of dimension 4), one role's are 81 against 9 points; so the model's own readings are contextual on a knot exactly where it holds a fear: S_u = 36 W(u) + 4 on every whole, violations only at fears, none with the fear beat off from stabilizer starts on any link start, changing only at meetings, and no one-role reading is ever contextual",
      metrics: {
        gateStructure: structureOk ? 1 : 0,
        gateIdentityAndFear: g2 ? 1 : 0,
        gateCliffordNoncontextual: g3 ? 1 : 0,
        gateOnlyAtTheFearBeat: g4 ? 1 : 0,
        gateOneRoleNoncontextual: g5 ? 1 : 0,
        gateStartFamily: g6 ? 1 : 0,
        wholesRead: sum(t => t.wholes, allKeys),
        identityMismatches: sum(t => t.identityMismatches, allKeys),
        fearMismatches: sum(t => t.fearMismatches, allKeys),
        deficitMismatches: sum(t => t.deficitMismatches, allKeys),
        quietChanges: sum(t => t.quietChanges, allKeys),
        violatingWholesFearOn: sum(t => t.violatingWholes, onKeys),
        violatingWholesFearOnStabilizerStart: sum(
          t => t.violatingWholes,
          onStabilizer,
        ),
        violatingWholesFearOffStabilizerStart: sum(
          t => t.violatingWholes,
          offStabilizer,
        ),
        violatingWholesFearOffMagicStart:
          read('swapOff:magicStart', t => t.violatingWholes) +
          read('colorOff:magicStart', t => t.violatingWholes),
        wholesFearOffMagicStart:
          read('swapOff:magicStart', t => t.wholes) +
          read('colorOff:magicStart', t => t.wholes),
        swapDeepestWeight: Math.min(
          read('swap:stabilizerStart', t => t.deepest),
          read('swap:magicStart', t => t.deepest),
        ),
        colorDeepestWeight: Math.min(
          read('color:stabilizerStart', t => t.deepest),
          read('color:magicStart', t => t.deepest),
        ),
        largestPointDeficit:
          -36 * Math.min(...allKeys.map(k => read(k, t => t.deepest))),
        largestPointDeficitStabilizerStart:
          -36 *
          Math.min(...onStabilizer.map(k => read(k, t => t.deepest))),
        largestPointDeficitStartFamily:
          -36 * read('family:color', t => t.deepest),
        largestTotalDeficit: Math.max(
          ...allKeys.map(k => read(k, t => t.largestDeficit)),
        ),
        swapLargestTotalDeficitStabilizerStart: read(
          'swap:stabilizerStart',
          t => t.largestDeficit,
        ),
        colorLargestTotalDeficitStabilizerStart: read(
          'color:stabilizerStart',
          t => t.largestDeficit,
        ),
        reducedStates,
        reducedStatesWithFear: reducedWithFear,
        negativeLineChances,
        kcbsAlignedViolations: kcbsViolations,
        kcbsAlignedViolationsWithoutFear: kcbsWithoutFear,
        kcbsAlignedLargest: kcbsLargest,
        familyMembersPassing: familyPass,
        familyMembers: family.length,
        familyViolatingWholes,
        sampledWholesOutsideStateSpace: sum(t => t.outside, allKeys),
        sampledWholes: sum(t => t.sampled, allKeys),
      },
      control: {
        lagrangiansOneRole: lines.length,
        lagrangiansTwoRoles: planes.length,
        assignmentDimensionOneRole: oneSpace.dimension,
        assignmentDimensionTwoRoles: twoSpace.dimension,
        assignmentRankTwoRoles: twoSpace.rank,
        distinctPhasePointAssignments: phaseFunctions.size,
        commutingDisplacementPairs: commutingPairs,
        commutingProductFailures: commutingFailures,
        cosetIdentityPoints: identityPoints,
        oneRoleOrthogonalPairs,
        oneRoleOrthogonalPairsAcrossDirections: oneRoleOrthogonalAcross,
      },
      notes:
        `family violating wholes per start (color law, fear on, vacuum, ${FAMILY_BEATS} beats): ${familyDetail.join(' ')}. ` +
        'First run 2026-09-26: every gate passed as fixed (202,756 wholes, 0 mismatches). Two reported metrics, the largest point deficit from stabilizer starts (3.9375, W = -7/64) and on the start family (2.667), were added after it and the file rerun, every other number unchanged. The deepest weight reached is the two-role floor -1/9 (from a Strange start), where all 40 cosets through the point have chance 0 and every noncontextual model needs at least 4 of them. integer+10 makes no fear in 120 beats, so it tests G3 only. ' +
        "L2. HWVE (2014) is derived here in the model's own terms: the displacement assignments are solved over F3, the coset identity is counted, and every knot is read in BigInt. The one-role result is the reason E-QTM-0120 found KCBS unrelated to this contextuality: a role alone has 81 noncontextual assignments for 4 unconnected contexts. The color law is read in the love frame (physicalWhole); the stored frame is not a state for an entangled love-fear knot.",
    })
  },
})
