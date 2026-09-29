// Distance counted in SHARED HISTORY, calibrated on the working vacuum (E-GRV-0072). Every gravity reading so far read
// nearness from dock position or from the current state's correlations, and the settled vacuum is a product state, on
// the classical gas (E-GRV-0064) and on the quantum state (E-GRV-0068). This file reads a relation the rule makes and
// never erases: which vibes met. Two husk places are near when the vibes now in them met often in the recent past, the
// geometry-from-entanglement idea read on the history instead of the state. Nothing in the rule is changed or added.
//
// THE VACUUM (the working one): code/rule/occupation-veto-knit vetoBeat with veto 'none' on tables built on the pass
// contact (code/measure/occupation-veto-readings contactFresh), every stored pair closed, which is coinedVetoBeat with
// veto 'none' on a state the coin never splits (E-GRV-0068 S1: one term at every beat), so the classical beat is the
// rule exactly. Side 16 (65,536 docks, a 16^3 husk of depth 16, 393,216 vibes counted as stored halves and slot vibes).
// CONTROL: the old knit, veto 'point' on the lone contact (code/measure/doublet-locked-readings lockedFresh), the same
// stores, the same reading. Reported, never gated.
//
// THE READING (code/measure/shared-history). Every vibe carries a label that follows the value the slots take, through
// the rule's own stream, coin-piece permutation and pair move (a stored pair keeps both halves). Two vibes meet when
// they are in the slots of one dock at a collision. N_T(A, B) is the number of meetings in the window [T - W, T), one per
// ordered label pair and beat, whose labels sit at T in husk columns A and B. Per displacement delta (minimal image on
// the side-16 torus) N(delta) is the mean over the 4,096 origin columns; per class (axis (k, 0, 0), face (k, k, 0), body
// (k, k, k), mesh distances k, k, ceil(3k / 2), code/measure/quantum-shared-distance classOf) the mean over the class.
// W = 12, the working vacuum's own occupation period (probe 1). Read at T = 12, 24, 36, 48; T = 48 is the gated read.
// Members: the start family's first five (integer+0 to +3, golden); errors by jackknife over them.
//
// THE EMERGENT DISTANCE, three standard forms, each fixed before the run:
//   power  d = sqrt(N(axis 1) / N)                            (d ~ N^(-1/2), no free parameter)
//   log    d = 1 + ln(N(axis 1) / N) / kappa                  (kappa the least-squares rate of ln(N1 / N) on mesh - 1)
//   hop    d = lambda h, h the graph distance on the husk torus whose steps are every displacement with N > 0 (the
//          meeting graph projected to columns), lambda the least-squares scale onto the mesh distance
//
// Gates, fixed before the first run of this file. "The calibration set" is every class of mesh distance at most 6 (axis
// k = 1..6, face k = 1..6, body k = 1..4), read at T = 48.
//  C1 instrument: on every run the labeled configuration equals the rule's own beat at every beat, every label sits in
//     exactly one slot or store half at every beat, and the second pass repeats the first
//  C2 translation invariance: for every class of the calibration set, the per-origin class mean (pooled over members)
//     is above 0 at every one of the 4,096 origins, and its largest over origins is at most 1.25 times its smallest
//  C3 falls with separation: N(axis 1) is above 3 errors and above 0, and exceeds N of every class of mesh distance 4
//     or more by more than 3 errors of the difference and by more than 0
//  C4 the calibration: every class of the calibration set has N above 3 errors and above 0, and at least one of the
//     three forms gives a distance within 25% of the mesh distance on every class of the set
// Verdict: partial if C1 fails; pass if C2, C3 and C4 hold; fail otherwise.
// Reported, not gated: N per class at every read beat, the forms' distances, the fitted kappa and lambda, Euclidean
// against mesh tracking, the per-origin spread, and the whole reading on the old knit.
//
// PREDICTED, before any run: fail on C4, possibly C3. Probe 1 found the working vacuum a crystal in time: its occupation
// repeats every 12 beats and no label strays more than 4 mesh steps from its starting column, so a meeting links only
// labels whose columns lie within 8 steps. The relation is then a fixed finite-range pattern, not a profile that keeps
// falling, and the hop form sees one hop to every calibration class.
//
// PROBES before this file, disclosed (none read a relational count by displacement):
//  tmp/grv72-probe1 (side 8, 48 beats, integer+0 and +5): the labeled beat equals the rule's own on every beat, labels
//    sound; the working vacuum's occupation period is 12, labels travel at most 4 mesh steps and are home at beat 48;
//    the old knit's period is 3 and travel at most 1; both starts give the same counts (no piece reads a point).
//  tmp/grv72-probe2 (side 16): a table of distinct met pairs over one 12-beat window exceeds a Map's 2^24 entries, so
//    the count is of meetings (with multiplicity), as the header of code/measure/shared-history says.
//  tmp/grv72-probe3 (side 16): the cost of one two-pass run.
//
// FIRST RUN (219 s, tmp/grv72-run1.log): fail on C2, C3 and C4, recorded as is, no gate moved. C1 holds on all 10 runs
// (the labeled beat is the rule's, labels sound, both passes agree). The five starts give the same count bit for bit (no
// piece reads a point), so every jackknife error is 0. The PREDICTION WAS WRONG in its reason: probe 1's "at most 4
// steps" was the side-8 torus's own limit (its largest minimal image is 4). On side 16 a meeting links labels across the
// whole torus within one window: N is above 0 on all 24 classes out to body 8 (mesh 12), and it does not fall: axis 1
// 79, axis 2 70, axis 4 89, axis 8 80, body 8 144, while face 2 is 12 and face 6 is 11. The count is the same at T = 12,
// 24, 36 and 48 (the vacuum's cycle). So the relation is a crystal's fixed, direction-dependent pattern, not a distance:
// power d from 0.74 to 2.68 with no trend in mesh (rms miss 0.59 against mesh, 0.62 against Euclid), log kappa 0.18,
// and one hop to every class (lambda 3.6). It is not translation invariant: every calibration class has per-origin mean
// 0 at some origin (columns that hold no vibe at the read beat) and up to 138.7 at others. The old knit control has the
// opposite defect: its labels stay within one step, so N falls (axis 1 256, axis 2 128, face 2 16) and is exactly 0 from
// mesh 3 on, a hard edge, not a profile; C3 holds there, C2 and C4 fail. Title written after the run.
//
// Depth L2: a reading of the working vacuum's own history, on the husk, against the husk's own metric.
// DETERMINISM: no random number; the start family. NOTHING MOVES: each slot takes its neighbor's value; a label only
// records which value was taken where.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { boxHusk } from '@/code/measure/causal-components'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import {
  lockedFresh,
  vacuumConfiguration,
} from '@/code/measure/doublet-locked-readings'
import {
  toWords,
  type VetoKind,
} from '@/code/rule/occupation-veto-knit'
import {
  classLabel,
  classOf,
  type ClassName,
} from '@/code/measure/quantum-shared-distance'
import { jackknife } from '@/code/measure/shared-distance'
import {
  historyRun,
  hopDistances,
  torus,
  type HistoryRun,
  type Torus,
} from '@/code/measure/shared-history'

const SIDE = 16
const READS = [12, 24, 36, 48]
const WINDOW = 12
const PRIMARY = 3
const MEMBERS = 4
const CALIBRATION = 6

type Classes = {
  labels: string[]
  names: ClassName[]
  deltas: number[][]
  of: Int32Array
}

// the displacement classes of the three families (other displacements get -1)
function familyClasses(t: Torus): Classes {
  const labels: string[] = []
  const names: ClassName[] = []
  const deltas: number[][] = []
  const of = new Int32Array(t.columns).fill(-1)

  for (let i = 1; i < t.columns; i++) {
    const c = classOf(Array.from(t.vector[i]!))

    if (c.family === 'other') {
      continue
    }

    const l = classLabel(c)

    let k = labels.indexOf(l)

    if (k < 0) {
      k = labels.length
      labels.push(l)
      names.push(c)
      deltas.push([])
    }

    deltas[k]!.push(i)
    of[i] = k
  }

  const order = labels
    .map((_, k) => k)
    .sort(
      (a, b) =>
        names[a]!.mesh - names[b]!.mesh ||
        labels[a]!.localeCompare(labels[b]!),
    )
  const remap = new Int32Array(labels.length)

  order.forEach((k, n) => (remap[k] = n))

  return {
    labels: order.map(k => labels[k]!),
    names: order.map(k => names[k]!),
    deltas: order.map(k => deltas[k]!),
    of: of.map(k => (k < 0 ? -1 : remap[k]!)),
  }
}

type KnitRun = {
  run: HistoryRun
  counts: Float64Array[]
  perOrigin: Float64Array
}

function readKnit(
  kind: VetoKind,
  t: Torus,
  classes: Classes,
): KnitRun[] {
  return startFamily(MEMBERS).map(member =>
    withStart(member, () => {
      const f =
        kind === 'none' ? contactFresh(SIDE, 'pass') : lockedFresh(SIDE)
      const column = boxHusk(f.weave.mesh, SIDE).column
      const counts = READS.map(() => new Float64Array(t.columns))
      const perOrigin = new Float64Array(
        t.columns * classes.labels.length,
      )
      const width = classes.labels.length
      const run = historyRun({
        kind,
        tables: f.tables,
        start: toWords(vacuumConfiguration(f, 'none')),
        column,
        reads: READS,
        window: WINDOW,
        visit: (k, a, b) => {
          const d = t.delta(a, b)

          counts[k]![d]! += 1

          if (k === PRIMARY) {
            const c = classes.of[d]!

            if (c >= 0) {
              perOrigin[a * width + c]! += 1
            }
          }
        },
      })

      console.error(`${kind} ${member.name}: ${JSON.stringify(run)}`)

      return { run, counts, perOrigin }
    }),
  )
}

type Reading = {
  c1: boolean
  c2: boolean
  c3: boolean
  c4: boolean
  forms: { power: boolean; log: boolean; hop: boolean }
  kappa: number
  lambda: number
  table: string
  spread: string
  byRead: string
  axis1: { value: number; error: number }
  rms: {
    powerMesh: number
    powerEuclid: number
    logMesh: number
    logEuclid: number
  }
}

function read(runs: KnitRun[], t: Torus, classes: Classes): Reading {
  const m = runs.length
  const classMean = (total: Float64Array, k: number): number =>
    classes.deltas[k]!.reduce((a, d) => a + total[d]!, 0) /
    (classes.deltas[k]!.length * t.columns * m)
  const sums = runs.map(r => r.counts[PRIMARY]!)
  const n = (k: number) => jackknife(sums, total => classMean(total, k))
  const gap = (i: number, k: number) =>
    jackknife(sums, total => classMean(total, i) - classMean(total, k))
  const axis1 = classes.labels.indexOf('axis1')
  const calibration = classes.names
    .map((_, k) => k)
    .filter(k => classes.names[k]!.mesh <= CALIBRATION)
  const far = classes.names
    .map((_, k) => k)
    .filter(k => classes.names[k]!.mesh >= 4)
  const above = (x: { value: number; error: number }): boolean =>
    x.value > 3 * x.error && x.value > 0
  const n1 = n(axis1)

  const c1 = runs.every(
    r => r.run.matchesRule && r.run.sound && r.run.repeatable,
  )

  // C2, pooled over members
  const width = classes.labels.length
  const pooled = new Float64Array(t.columns * width)

  for (const r of runs) {
    for (let i = 0; i < pooled.length; i++) {
      pooled[i]! += r.perOrigin[i]!
    }
  }

  const spreadOf = (k: number): { min: number; max: number } => {
    let min = Infinity
    let max = -Infinity

    for (let a = 0; a < t.columns; a++) {
      const v = pooled[a * width + k]! / (classes.deltas[k]!.length * m)

      min = Math.min(min, v)
      max = Math.max(max, v)
    }

    return { min, max }
  }

  const c2 = calibration.every(k => {
    const s = spreadOf(k)

    return s.min > 0 && s.max <= 1.25 * s.min
  })

  const c3 = above(n1) && far.every(k => above(gap(axis1, k)))

  // the three forms
  const power = (k: number): number => {
    const v = n(k).value

    return v > 0 && n1.value > 0 ? Math.sqrt(n1.value / v) : Infinity
  }

  const logRatio = (k: number): number => {
    const v = n(k).value

    return v > 0 && n1.value > 0 ? Math.log(n1.value / v) : Infinity
  }

  const fit = calibration.filter(
    k => classes.names[k]!.mesh > 1 && Number.isFinite(logRatio(k)),
  )
  const kappa =
    fit.length > 0
      ? fit.reduce(
          (a, k) => a + logRatio(k) * (classes.names[k]!.mesh - 1),
          0,
        ) /
        fit.reduce((a, k) => a + (classes.names[k]!.mesh - 1) ** 2, 0)
      : 0
  const logDistance = (k: number): number =>
    kappa > 0 ? 1 + logRatio(k) / kappa : Infinity
  const total = new Float64Array(t.columns)

  for (const s of sums) {
    for (let i = 0; i < total.length; i++) {
      total[i]! += s[i]!
    }
  }

  const steps: number[] = []

  for (let d = 1; d < t.columns; d++) {
    if (total[d]! > 0) {
      steps.push(d)
    }
  }

  const hops = hopDistances(t, steps)

  const hopOf = (k: number): number => {
    const hs = classes.deltas[k]!.map(d => hops[d]!)

    return hs.some(h => h < 0)
      ? Infinity
      : hs.reduce((a, b) => a + b, 0) / hs.length
  }

  const hopFit = calibration.filter(k => Number.isFinite(hopOf(k)))
  const lambda =
    hopFit.length > 0
      ? hopFit.reduce(
          (a, k) => a + hopOf(k) * classes.names[k]!.mesh,
          0,
        ) / hopFit.reduce((a, k) => a + hopOf(k) ** 2, 0)
      : 0
  const hopDistance = (k: number): number => lambda * hopOf(k)
  const within = (d: number, mesh: number): boolean =>
    Number.isFinite(d) && Math.abs(d / mesh - 1) <= 0.25
  const forms = {
    power: calibration.every(k =>
      within(power(k), classes.names[k]!.mesh),
    ),
    log: calibration.every(k =>
      within(logDistance(k), classes.names[k]!.mesh),
    ),
    hop: calibration.every(k =>
      within(hopDistance(k), classes.names[k]!.mesh),
    ),
  }
  const c4 =
    calibration.every(k => above(n(k))) &&
    (forms.power || forms.log || forms.hop)

  const euclid = (k: number): number => {
    const v = t.vector[classes.deltas[k]![0]!]!

    return Math.hypot(v[0]!, v[1]!, v[2]!)
  }

  const rmsOf = (
    form: (k: number) => number,
    target: (k: number) => number,
  ): number => {
    const finite = calibration.filter(k => Number.isFinite(form(k)))

    return finite.length > 0
      ? Math.sqrt(
          finite.reduce(
            (a, k) => a + (form(k) / target(k) - 1) ** 2,
            0,
          ) / finite.length,
        )
      : -1
  }

  const e = (v: number): string =>
    Number.isFinite(v) ? v.toPrecision(4) : 'inf'
  const table = classes.names
    .map(
      (c, k) =>
        `${classes.labels[k]} (mesh ${c.mesh}): N ${e(n(k).value)} +- ${e(n(k).error)}, d power ${e(power(k))}, d log ${e(logDistance(k))}, hops ${e(hopOf(k))}, d hop ${e(hopDistance(k))}`,
    )
    .join('; ')
  const spread = calibration
    .map(
      k =>
        `${classes.labels[k]} ${e(spreadOf(k).min)} to ${e(spreadOf(k).max)}`,
    )
    .join(', ')
  const byRead = READS.map(
    (T, r) =>
      `T ${T}: ${classes.names
        .map(
          (_, k) =>
            `${classes.labels[k]} ${e(
              classMean(
                runs.reduce(
                  (acc, x) => acc.map((v, i) => v + x.counts[r]![i]!),
                  new Float64Array(t.columns),
                ),
                k,
              ),
            )}`,
        )
        .join(' ')}`,
  ).join('; ')

  return {
    c1,
    c2,
    c3,
    c4,
    forms,
    kappa,
    lambda,
    table,
    spread,
    byRead,
    axis1: n1,
    rms: {
      powerMesh: rmsOf(power, k => classes.names[k]!.mesh),
      powerEuclid: rmsOf(power, euclid),
      logMesh: rmsOf(logDistance, k => classes.names[k]!.mesh),
      logEuclid: rmsOf(logDistance, euclid),
    },
  }
}

export default experiment({
  id: 'gravity/shared-history-distance',
  code: 'E-GRV-0072',
  title:
    "no distance from shared history on the working vacuum, fail on C2, C3 and C4: labeling every vibe through the rule's own stream, coin permutation and pair move (the labeled beat equals the rule's on every beat of 10 runs, side 16) and counting meetings in a 12-beat window between the columns the met vibes now sit in, the relation reaches the whole side-16 torus in one window and does not fall with separation (axis 1 79, axis 2 70, axis 4 89, axis 8 80, body 8 at mesh 12 144, face 2 12, the same at T = 12, 24, 36, 48 and on all 5 starts), so the power, log and hop forms all miss the mesh distance (power rms 0.59) and it is not translation invariant (every calibration class 0 at some origin); the old knit control is the opposite, a relation that stops dead at mesh 3 (256, 128, then 0); the vacuum is a crystal in time, and a crystal's meeting pattern is not a metric",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const t = torus(SIDE)
    const classes = familyClasses(t)
    const working = read(readKnit('none', t, classes), t, classes)

    console.error(
      `working read ${Math.round((Date.now() - started) / 1000)}s`,
    )

    const old = read(readKnit('point', t, classes), t, classes)

    console.error(
      `old read ${Math.round((Date.now() - started) / 1000)}s`,
    )

    const status = !working.c1
      ? 'partial'
      : working.c2 && working.c3 && working.c4
        ? 'pass'
        : 'fail'

    return verdict({
      status,
      claim: `working vacuum (side ${SIDE}, window ${WINDOW}, read at T = ${READS[PRIMARY]}): instrument ${working.c1}, translation invariant ${working.c2}, falls with separation ${working.c3}, calibrated ${working.c4} (power ${working.forms.power}, log ${working.forms.log}, hop ${working.forms.hop}); N(axis 1) ${working.axis1.value.toPrecision(4)} +- ${working.axis1.error.toPrecision(2)}; old knit control: C2 ${old.c2}, C3 ${old.c3}, C4 ${old.c4}`,
      metrics: {
        gate_C1: working.c1 ? 1 : 0,
        gate_C2: working.c2 ? 1 : 0,
        gate_C3: working.c3 ? 1 : 0,
        gate_C4: working.c4 ? 1 : 0,
        formPower: working.forms.power ? 1 : 0,
        formLog: working.forms.log ? 1 : 0,
        formHop: working.forms.hop ? 1 : 0,
        kappa: working.kappa,
        lambda: working.lambda,
        axis1: working.axis1.value,
        axis1Error: working.axis1.error,
        powerRmsMesh: working.rms.powerMesh,
        powerRmsEuclid: working.rms.powerEuclid,
        logRmsMesh: working.rms.logMesh,
        logRmsEuclid: working.rms.logEuclid,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        oldC1: old.c1 ? 1 : 0,
        oldC2: old.c2 ? 1 : 0,
        oldC3: old.c3 ? 1 : 0,
        oldC4: old.c4 ? 1 : 0,
        oldAxis1: old.axis1.value,
      },
      notes: `L2. WORKING: per class at T = ${READS[PRIMARY]} (kappa ${working.kappa.toFixed(4)}, lambda ${working.lambda.toFixed(4)}): ${working.table}. Per-origin spread (min to max) on the calibration set: ${working.spread}. By read beat: ${working.byRead}. OLD KNIT: per class (kappa ${old.kappa.toFixed(4)}, lambda ${old.lambda.toFixed(4)}): ${old.table}. Spread: ${old.spread}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
