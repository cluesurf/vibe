// GHZ, Mermin and monogamy for three knots: does the model make a three-role GHZ knot, does GHZ's argument
// without inequalities go through with the model's own readings, and is entanglement among three roles
// monogamous?
//
// GHZ (Greenberger, Horne, Zeilinger 1989; Mermin 1990): for three qubits in (|000> + |111>)/sqrt 2 the Pauli
// products XXX = +1 and XYY = YXY = YYX = -1 hold with certainty, and no local assignment of +-1 values meets all
// four. For qutrits and the model's readings (displacements, measured as lines of one role), the prediction
// derived before the run is the opposite. The qutrit GHZ knot is a stabilizer state, so its Wigner function is
// non-negative, and the phase-point response of a one-role reading, Tr(A(x) D(v)) = omega^(e [x, v]), is a
// deterministic local value multiplicative on commuting sets (E-QTM-0149, 0150). So the knot's weights ARE a local
// hidden-variable model of every reading the model can make on it: each of the 27 points in its support
// reproduces all 26 of its perfect correlations. There is no all-versus-nothing contradiction with stabilizer
// readings in odd dimension, and a Mermin violation needs readings outside them. With two-outcome observables
// that are not the model's, block-diagonal on span{|0>, |1>} and |2>, the qutrit GHZ reads
// (2/3) 4 + (1/3) 2 = 10/3 > 2, a predicted lower bound.
//
// Making the GHZ knot: three love-fear pairs, each made at one meeting from a common role point (E-QTM-0152: a
// stabilizer maximally entangled pair), and the model's reading of one role of each pair on the GHZ coset
// {(a, b1, a, b2, a, b3) : b1 + b2 + b3 = 0}, a Lagrangian subspace of three roles. The three unread roles are
// then left in a GHZ knot for each of the 27 outcomes (entanglement swapping onto three roles at once).
//
// Monogamy: Coffman, Kundu and Wootters (2000) proved tau_(A|BC) >= C_AB^2 + C_AC^2 for three qubits. For qutrits
// it FAILS: Ou (2007) showed the totally antisymmetric state violates it (tau = 4/3, C_AB^2 = C_AC^2 = 1). Here
// it is read on the model's own three-role knots (the knit's matter triple, E-QTM-0105's choice of triple, from
// |0>|1>|2>, swap law and color law, over the start family) with the concurrence of each two-role marginal
// bounded from below (Chen, Albeverio, Fei 2005) and above (the eigen-decomposition), so each reading is held,
// violated or undecided. The antisymmetric state enters as a STAND-IN, labeled: the model has not been shown to
// make it. Bell monogamy (Toner and Verstraete 2006 for qubits) is read as whether one role violates CHSH with
// both partners at once.
//
// Gates, fixed before the first run:
// G1 the GHZ coset is one of the 1,120 Lagrangians of three roles; each of its 27 outcomes has chance exactly
//    1/27, and leaves a GHZ knot: equal weights on a 27-point Lagrangian coset, every role's marginal uniform
// G2 on that knot all 26 non-identity stabilizer displacements have |<D(v)>| = 1 (1e-12), and exactly 27 of the
//    729 phase points (local deterministic assignments) reproduce all 26 correlations: no GHZ contradiction; the
//    qubit control has 0 of 64 local assignments meeting its four
// G3 Mermin by see-saw: the qubit GHZ (inside three qutrits) reaches 4 (1e-6); the qutrit GHZ knot reaches at
//    least 10/3 (1e-6) with two-outcome observables outside the model's readings; the knit triple with the fear
//    beat off stays at or below 2 (1e-9)
// G4 CKW: holds on the GHZ knot (C_AB = C_AC = 0 by the upper bound); fails exactly on the antisymmetric
//    stand-in (2 > 4/3); on the knit's triples 0 readings are certified violations (the prediction)
// G5 Bell monogamy: no knit triple reading and not the GHZ knot has CHSH above 2 with both partners at once
// Reported: the knit triples' CKW counts (held, violated, undecided), their largest Mermin value with the fear
// beat on, the largest CHSH pair and its squared sum against 8.
//
// Depth L2: known constructions run with the model's pairs, readings and beats; the stand-in is labeled.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  fearKernels,
  meetingKernel,
  meetWhole,
  physicalWhole,
  swapPhase,
  type BeatRecord,
  type FearKernels,
  type Whole,
} from '@/code/rule/fear-weave'
import { classicalRecords, productWhole, weylBackground } from '@/code/measure/knit-magic'
import { cosetLabels, lagrangians, marginalOf, phaseSpace, pointOfTrits, productWeights } from '@/code/measure/stabilizer-contexts'
import { concurrenceBounds, densityOf, merminSeeSaw, partialTrace, type Hermitian3 } from '@/code/measure/knot-entanglement'
import { roleChsh } from '@/code/measure/role-bell'
import { displacementOperators } from '@/code/measure/qutrit-clifford'
import { operator, phasePointOperators, tensorOperators, type Operator } from '@/code/measure/grid-weights'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { GOLDEN, weyl } from '@/code/tool/weyl'

const OMEGA = (2 * Math.PI) / 3
const BEATS = 480
const FAMILY_BEATS = 120
const SAMPLE = 10
const MERMIN_SAMPLE = 40
const MATTER_SCALE = 2.11
const MERMIN_STARTS = 12
const MERMIN_STEPS = 200

const units = (w: readonly bigint[]): bigint => w.reduce((a, b) => a + b, 0n)
const basis = (j: number): bigint[] => Array.from({ length: 9 }, (_, q) => (Math.floor(q / 3) === j ? 1n : 0n))

// a density matrix from a pure vector
function pureDensity(re: readonly number[], im: readonly number[]): Operator {
  const n = re.length
  const out = operator(n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out.re[i * n + j] = (re[i] ?? 0) * (re[j] ?? 0) + (im[i] ?? 0) * (im[j] ?? 0)
      out.im[i * n + j] = (im[i] ?? 0) * (re[j] ?? 0) - (re[i] ?? 0) * (im[j] ?? 0)
    }
  }

  return out
}

// deterministic starting observables for the see-saw, from the golden Weyl sequence (measurement only)
function merminStarts(count: number): Hermitian3[][] {
  return Array.from({ length: count }, (_, s) =>
    Array.from({ length: 6 }, (__, o) => {
      const h: Hermitian3 = { re: new Float64Array(9), im: new Float64Array(9) }
      let k = 1 + 54 * s + 9 * o

      for (let i = 0; i < 3; i++) {
        for (let j = i; j < 3; j++) {
          const u = weyl(k++, GOLDEN) - 0.5
          const v = i === j ? 0 : weyl(k++, GOLDEN) - 0.5

          h.re[i * 3 + j] = u
          h.re[j * 3 + i] = u
          h.im[i * 3 + j] = v
          h.im[j * 3 + i] = -v
        }
      }

      return h
    }),
  )
}

type Triple = { tokens: [number, number, number]; meetings: number }

export default experiment({
  id: 'quantum/ghz-mermin-and-monogamy',
  code: 'E-QTM-0153',
  title:
    'GHZ, Mermin and monogamy on three knots: reading one role of each of three love-fear pairs on the GHZ coset leaves a GHZ knot on the other three for all 27 outcomes, but its weights are non-negative, so with the model\'s own readings every one of its 26 perfect correlations is met by 27 local assignments and GHZ\'s argument does not go through for qutrits, while two-outcome observables outside those readings give Mermin 10/3 > 2; CKW holds on the GHZ knot and fails on the antisymmetric stand-in (Ou 2007), and is read with certified bounds on the knit\'s own triples',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const three = phaseSpace(3)
    const colorOn = fearKernels({ like: OMEGA, unlike: OMEGA }) as FearKernels
    const colorOff = fearKernels({ like: Math.PI, unlike: 0 }) as FearKernels
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []
    const kOff = meetingKernel(swapPhase(Math.PI)) ?? []

    // G1 the GHZ knot from three love-fear pairs and one reading
    const met = meetWhole({ whole: productWhole([0, 1], ['basis0', 'basis0']), a: 0, b: 1, kernel4: colorOn.unlike, divisor: colorOn.unlikeDivisor, fixed: false }) as Whole
    const pair = physicalWhole({ ...met, frame: [1, -1] }).weight
    const six = productWeights(pair, productWeights(pair, pair))
    const ghzCoset: number[] = []

    for (let a = 0; a < 3; a++) {
      for (let b1 = 0; b1 < 3; b1++) {
        for (let b2 = 0; b2 < 3; b2++) {
          ghzCoset.push(pointOfTrits([a, b1, a, b2, a, -b1 - b2], 3))
        }
      }
    }

    ghzCoset.sort((x, y) => x - y)

    const ghzKey = ghzCoset.join(',')
    const ghzIsLagrangian = lagrangians(three).some(l => l.join(',') === ghzKey)
    const labels = cosetLabels(three, ghzCoset)
    const outcomes = new Map<number, bigint[]>()

    six.forEach((w, i) => {
      if (w === 0n) {
        return
      }

      const digit = (r: number): number => Math.floor(i / 9 ** (5 - r)) % 9
      const c = labels[81 * digit(1) + 9 * digit(3) + digit(5)] ?? 0
      const kept = 81 * digit(0) + 9 * digit(2) + digit(4)
      let row = outcomes.get(c)

      if (!row) {
        row = new Array<bigint>(729).fill(0n)
        outcomes.set(c, row)
      }

      row[kept] = (row[kept] ?? 0n) + w
    })

    const total = units(six)
    let ghzOutcomes = 0

    const isGhz = (w: readonly bigint[]): boolean => {
      const n = units(w)
      const support = w.map((x, i) => (x !== 0n ? i : -1)).filter(i => i >= 0)
      const equal = support.every(i => w[i] === w[support[0] ?? 0])
      const x0 = support[0] ?? 0
      const diffs = support.map(x => three.add[x * 729 + (three.neg[x0] ?? 0)] ?? 0)
      const isotropic = diffs.every(u => diffs.every(v => three.form[u * 729 + v] === 0))
      const uniform = [0, 1, 2].every(keep => marginalOf(w, 3, [keep]).every(x => x * 9n === n))

      return support.length === 27 && equal && isotropic && uniform
    }

    for (const w of outcomes.values()) {
      ghzOutcomes += units(w) * 27n === total && isGhz(w) ? 1 : 0
    }

    const ghz = outcomes.values().next().value as bigint[]

    // G2 its perfect correlations and the local assignments that meet them
    const points1 = phasePointOperators(1)
    const d1 = displacementOperators(1)
    const chi: [number, number][] = []

    for (let p = 0; p < 9; p++) {
      for (let q = 0; q < 9; q++) {
        let re = 0
        let im = 0

        for (let i = 0; i < 3; i++) {
          for (let k = 0; k < 3; k++) {
            re += (points1[p]!.re[i * 3 + k] ?? 0) * (d1[q]!.re[k * 3 + i] ?? 0) - (points1[p]!.im[i * 3 + k] ?? 0) * (d1[q]!.im[k * 3 + i] ?? 0)
            im += (points1[p]!.re[i * 3 + k] ?? 0) * (d1[q]!.im[k * 3 + i] ?? 0) + (points1[p]!.im[i * 3 + k] ?? 0) * (d1[q]!.re[k * 3 + i] ?? 0)
          }
        }

        chi.push([re, im])
      }
    }

    const value = (x: number, v: number): [number, number] => {
      let re = 1
      let im = 0

      for (let r = 0; r < 3; r++) {
        const p = Math.floor(x / 9 ** (2 - r)) % 9
        const q = Math.floor(v / 9 ** (2 - r)) % 9
        const [cr, ci] = chi[9 * p + q] ?? [1, 0]
        const nr = re * cr - im * ci

        im = re * ci + im * cr
        re = nr
      }

      return [re, im]
    }
    const n = Number(units(ghz))
    const support = ghz.map((x, i) => (x !== 0n ? i : -1)).filter(i => i >= 0)
    const x0 = support[0] ?? 0
    const stabilizers = support.map(x => three.add[x * 729 + (three.neg[x0] ?? 0)] ?? 0).filter(v => v !== 0)
    const expectations = stabilizers.map(v => {
      let re = 0
      let im = 0

      ghz.forEach((w, x) => {
        if (w !== 0n) {
          const [cr, ci] = value(x, v)

          re += (Number(w) / n) * cr
          im += (Number(w) / n) * ci
        }
      })

      return [re, im] as [number, number]
    })
    const perfect = expectations.every(([re, im]) => Math.abs(Math.hypot(re, im) - 1) < 1e-12)
    const threeParty = stabilizers.filter(v => [0, 1, 2].every(r => Math.floor(v / 9 ** (2 - r)) % 9 !== 0)).length
    let consistentAssignments = 0

    for (let x = 0; x < 729; x++) {
      consistentAssignments += stabilizers.every((v, k) => {
        const [re, im] = value(x, v)
        const [er, ei] = expectations[k] ?? [0, 0]

        return Math.abs(re - er) < 1e-9 && Math.abs(im - ei) < 1e-9
      })
        ? 1
        : 0
    }

    // the qubit control: XXX, XYY, YXY, YYX on (|000> + |111>)/sqrt 2
    const X2 = operator(2)
    const Y2 = operator(2)

    X2.re[1] = 1
    X2.re[2] = 1
    Y2.im[1] = -1
    Y2.im[2] = 1

    const ghz2 = new Array<number>(8).fill(0)

    ghz2[0] = Math.SQRT1_2
    ghz2[7] = Math.SQRT1_2

    const expect8 = (o: Operator): number => {
      let s = 0

      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          s += (ghz2[i] ?? 0) * (o.re[i * 8 + j] ?? 0) * (ghz2[j] ?? 0)
        }
      }

      return s
    }
    const triple = (a: Operator, b: Operator, c: Operator): Operator => tensorOperators(tensorOperators(a, b), c)
    const qubitValues = [triple(X2, X2, X2), triple(X2, Y2, Y2), triple(Y2, X2, Y2), triple(Y2, Y2, X2)].map(o => Math.round(expect8(o)))
    let qubitAssignments = 0

    for (let mask = 0; mask < 64; mask++) {
      const x = (r: number): number => ((mask >> r) & 1 ? -1 : 1)
      const y = (r: number): number => ((mask >> (3 + r)) & 1 ? -1 : 1)
      const predicted = [x(0) * x(1) * x(2), x(0) * y(1) * y(2), y(0) * x(1) * y(2), y(0) * y(1) * x(2)]

      qubitAssignments += predicted.every((p, k) => p === qubitValues[k]) ? 1 : 0
    }

    // G3 Mermin
    const starts = merminStarts(MERMIN_STARTS)
    const embedded = new Array<number>(27).fill(0)

    embedded[0] = Math.SQRT1_2
    embedded[13] = Math.SQRT1_2

    const merminQubit = merminSeeSaw(pureDensity(embedded, new Array<number>(27).fill(0)), starts, MERMIN_STEPS)
    const ghzDensity = densityOf(ghz, 3)
    const merminGhz = merminSeeSaw(ghzDensity, starts, MERMIN_STEPS)

    // G4 CKW on the GHZ knot and the antisymmetric stand-in
    const tauOf = (rho: Operator): number => {
      const a = partialTrace(rho, 3, [0])
      let purity = 0

      for (let i = 0; i < 9; i++) {
        purity += (a.re[i] ?? 0) ** 2 + (a.im[i] ?? 0) ** 2
      }

      return 2 * (1 - purity)
    }
    const ghzAB = concurrenceBounds(partialTrace(ghzDensity, 3, [0, 1]))
    const ghzAC = concurrenceBounds(partialTrace(ghzDensity, 3, [0, 2]))
    const ghzTau = tauOf(ghzDensity)
    const ghzCkwHolds = ghzAB.upper ** 2 + ghzAC.upper ** 2 <= ghzTau + 1e-12
    const antisymmetric = new Array<number>(27).fill(0)

    for (const [i, j, k, s] of [
      [0, 1, 2, 1],
      [1, 2, 0, 1],
      [2, 0, 1, 1],
      [0, 2, 1, -1],
      [2, 1, 0, -1],
      [1, 0, 2, -1],
    ] as const) {
      antisymmetric[9 * i + 3 * j + k] = s / Math.sqrt(6)
    }

    const standIn = pureDensity(antisymmetric, new Array<number>(27).fill(0))
    const standInAB = concurrenceBounds(partialTrace(standIn, 3, [0, 1]))
    const standInAC = concurrenceBounds(partialTrace(standIn, 3, [0, 2]))
    const standInTau = tauOf(standIn)
    const standInFails = standInAB.exact === 1 && standInAC.exact === 1 && 2 > standInTau + 1e-12

    // the knit's matter triple, and its readings over the start family
    const tally = { readings: 0, held: 0, violated: 0, undecided: 0, bothChsh: 0, largestChshPair: 0, largestSquares: 0, largestMerminFear: 0, largestMerminOff: 0, fearReadings: 0 }
    let tripleName = ''

    const findTriple = (records: readonly BeatRecord[]): Triple | null => {
      const count = new Map<string, number>()

      for (const r of records) {
        for (const [x, y] of r.meetings) {
          const key = `${Math.min(x, y)},${Math.max(x, y)}`

          count.set(key, (count.get(key) ?? 0) + 1)
        }
      }

      let best: Triple | null = null

      for (let a = 0; a < 24; a++) {
        for (let b = a + 1; b < 24; b++) {
          for (let c = b + 1; c < 24; c++) {
            const m = [count.get(`${a},${b}`), count.get(`${a},${c}`), count.get(`${b},${c}`)]

            if (m.every(x => (x ?? 0) > 0)) {
              const total = m.reduce((s: number, x) => s + (x ?? 0), 0)

              if (!best || total > best.meetings) {
                best = { tokens: [a, b, c], meetings: total }
              }
            }
          }
        }
      }

      return best
    }

    const readTriples = (beats: number, mermin: boolean): void => {
      const weave = makeColorWeave({ side: 3, table: 'pair' })
      const slots = weave.mesh.cellCount * 24
      const records = classicalRecords({ weave, links: weave.links, background: weylBackground({ slots, scale: MATTER_SCALE }), open: Array.from({ length: 24 }, (_, d) => d), beats })
      const found = findTriple(records)

      if (!found) {
        return
      }

      const inTriple = (t: number): boolean => found.tokens.includes(t)
      const mine: BeatRecord[] = records.map(r => {
        const keep = r.meetings.map(([x, y]) => inTriple(x) && inTriple(y))

        return {
          meetings: r.meetings.filter((_, k) => keep[k]),
          signs: (r.signs ?? []).filter((_, k) => keep[k]),
          crossings: r.crossings.filter(([tk]) => inTriple(tk)),
        }
      })

      tripleName = found.tokens.join('-')

      const laws: { fear: boolean; kernel4: readonly (readonly number[])[]; color?: FearKernels }[] = [
        { fear: true, kernel4: kThird },
        { fear: true, kernel4: [], color: colorOn },
        { fear: false, kernel4: kOff },
        { fear: false, kernel4: [], color: colorOff },
      ]

      for (const law of laws) {
        let whole: Whole = { tokens: found.tokens, weight: productWeights(basis(0), productWeights(basis(1), basis(2))) }

        for (let t = 0; t < mine.length; t++) {
          whole = advanceWhole({ weave, whole, record: mine[t]!, kernel4: law.kernel4, color: law.color, fixed: false, forward: true }) as Whole

          if ((t + 1) % SAMPLE !== 0) {
            continue
          }

          const weight = law.color ? physicalWhole(whole).weight : whole.weight
          const rho = densityOf(weight, 3)
          const fear = weight.some(w => w < 0n)

          if (law.fear) {
            const ab = partialTrace(rho, 3, [0, 1])
            const ac = partialTrace(rho, 3, [0, 2])
            const bAB = concurrenceBounds(ab)
            const bAC = concurrenceBounds(ac)
            const tau = tauOf(rho)
            const chshAB = roleChsh(ab)
            const chshAC = roleChsh(ac)

            tally.readings++
            tally.fearReadings += fear ? 1 : 0

            if ((bAB.exact ?? bAB.lower) ** 2 + (bAC.exact ?? bAC.lower) ** 2 > tau + 1e-9) {
              tally.violated++
            } else if ((bAB.exact ?? bAB.upper) ** 2 + (bAC.exact ?? bAC.upper) ** 2 <= tau + 1e-9) {
              tally.held++
            } else {
              tally.undecided++
            }

            tally.bothChsh += chshAB > 2 + 1e-9 && chshAC > 2 + 1e-9 ? 1 : 0
            tally.largestChshPair = Math.max(tally.largestChshPair, Math.min(chshAB, chshAC))
            tally.largestSquares = Math.max(tally.largestSquares, chshAB ** 2 + chshAC ** 2)
          }

          if (mermin && (t + 1) % MERMIN_SAMPLE === 0) {
            const m = merminSeeSaw(rho, starts, MERMIN_STEPS)

            if (law.fear) {
              tally.largestMerminFear = Math.max(tally.largestMerminFear, m)
            } else {
              tally.largestMerminOff = Math.max(tally.largestMerminOff, m)
            }
          }
        }
      }
    }

    readTriples(BEATS, true)

    const family = startFamily(16)

    for (const member of family.slice(1)) {
      withStart(member, () => readTriples(FAMILY_BEATS, false))
    }

    const ghzChshAB = roleChsh(partialTrace(ghzDensity, 3, [0, 1]))
    const ghzChshAC = roleChsh(partialTrace(ghzDensity, 3, [0, 2]))

    const g1 = ghzIsLagrangian && outcomes.size === 27 && ghzOutcomes === 27
    const g2 = perfect && stabilizers.length === 26 && consistentAssignments === 27 && qubitAssignments === 0
    const g3 = merminQubit >= 4 - 1e-6 && merminGhz >= 10 / 3 - 1e-6 && tally.largestMerminOff <= 2 + 1e-9
    const g4 = ghzCkwHolds && standInFails && tally.violated === 0
    const g5 = tally.bothChsh === 0 && !(ghzChshAB > 2 + 1e-9 && ghzChshAC > 2 + 1e-9)

    return verdict({
      status: g1 && g2 && g3 && g4 && g5 ? 'pass' : 'fail',
      claim:
        'the model\'s reading of one role of each of three love-fear pairs on the GHZ coset leaves a GHZ knot for all 27 outcomes; its weights are non-negative, so its 26 perfect correlations under the model\'s readings are met by 27 local assignments and GHZ\'s contradiction does not arise for qutrits, while two-outcome observables outside those readings reach Mermin 10/3 or more; CKW holds on the GHZ knot, fails exactly on the antisymmetric stand-in, and is never certified broken on the knit\'s triples, and no role violates CHSH with both partners',
      metrics: {
        gateGhzMade: g1 ? 1 : 0,
        gateNoGhzContradiction: g2 ? 1 : 0,
        gateMermin: g3 ? 1 : 0,
        gateCkw: g4 ? 1 : 0,
        gateBellMonogamy: g5 ? 1 : 0,
        ghzOutcomes: outcomes.size,
        ghzOutcomesExact: ghzOutcomes,
        ghzStabilizers: stabilizers.length,
        ghzStabilizersThreeParty: threeParty,
        ghzConsistentLocalAssignments: consistentAssignments,
        qubitGhzLocalAssignments: qubitAssignments,
        merminQubitGhz: merminQubit,
        merminQutritGhzKnot: merminGhz,
        merminKnitTripleFearOn: tally.largestMerminFear,
        merminKnitTripleFearOff: tally.largestMerminOff,
        ghzTau,
        ghzConcurrenceUpperAB: ghzAB.upper,
        standInTau,
        standInConcurrenceSquaredSum: 2,
        knitReadings: tally.readings,
        knitReadingsWithFear: tally.fearReadings,
        knitCkwHeld: tally.held,
        knitCkwViolated: tally.violated,
        knitCkwUndecided: tally.undecided,
        knitBothChshAbove2: tally.bothChsh,
        knitLargestMinChshPair: tally.largestChshPair,
        knitLargestChshSquaredSum: tally.largestSquares,
        ghzChshAB,
        ghzChshAC,
      },
      control: {
        ghzCosetIsLagrangian: ghzIsLagrangian ? 1 : 0,
        qubitGhzXXX: qubitValues[0] ?? 0,
        qubitGhzXYY: qubitValues[1] ?? 0,
        standInAntisymmetricAB: standInAB.antisymmetric ? 1 : 0,
        standInLowerBoundAB: standInAB.lower,
      },
      notes: `knit triple (matter, dock 0): tokens ${tripleName}; ${family.length} starts, ${FAMILY_BEATS} beats on all but the committed start (${BEATS}), read every ${SAMPLE} beats, Mermin every ${MERMIN_SAMPLE} beats on the committed start. ` +
        'FIRST RUN 2026-09-26: fail on G5 alone, a wrong prediction. On 115 of 480 knit-triple readings one role violates CHSH with BOTH partners at once (the smaller of the two up to 2.195, far past 2), and CHSH_AB^2 + CHSH_AC^2 reaches 11.11, past the qubit Toner-Verstraete bound 8. Each pair is maximized with its own settings for the shared role (as E-QTM-0111 reads CHSH), and a qutrit role has room for two different two-level blocks, so the qubit bound does not carry over; the no-signaling bound CHSH_AB + CHSH_AC <= 4 with SHARED settings was not tested and stands. The gate stays as written. G1 to G4 passed: CKW held on 103 readings, was undecided on 377 (the bounds are loose) and certified broken on 0. ' +
        'L2. The antisymmetric state is a STAND-IN, a textbook state the model has not been shown to make; it is here only to show the CKW reader can return a violation. The GHZ knot has no fear, and that is why the model\'s readings cannot contradict it: its weights are the local model. The Mermin values come from two-outcome observables that are not the model\'s readings, as E-QTM-0111 read CHSH.',
    })
  },
})
