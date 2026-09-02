// Reflection positivity for the clock field, measured, with the violation living exactly where it
// should. Osterwalder-Schrader positivity is the property that lets a Euclidean field theory be a
// quantum theory: temporal two-point functions must form a positive spectral measure, equivalently
// every Toeplitz matrix built from C(tau) is positive semidefinite. Here C(tau) is MEASURED (the
// slot-averaged product of the clock field cos(2 pi tone / 3) at time separation tau, the unbiased
// estimator over a whole number of clock periods, which is NOT automatically positive) for three
// processes of the model:
//
//   - The BEATING VACUUM (the committed charge knit's flashing vacuum): positive semidefinite to
//     machine precision (the free clock field has a positive spectral measure, the OS-positivity
//     analog for the free sector).
//   - The THERMAL GAS (the momentum knit on the half-filled pair gas): positive with a large margin.
//   - The AMPLIFYING WAKE (the traveller knit's offset-slab wake of E-FND-0096, the model's own
//     measurement process): its support series VIOLATES positivity by three orders of magnitude,
//     because an amplifying process is not a stationary field and cannot be one sector of a unitary
//     theory. This is the control that could not fail to matter: the same estimator that certifies
//     the vacuum rejects the amplifier.
//
// A subtlety that bit: the estimator window must hold a whole number of clock periods per lag, or
// the pure period-three vacuum itself shows a spurious few-percent negative eigenvalue (the
// truncation, not the physics). Depth L2: the OS-positivity analog measured on the free and thermal
// sectors, with the amplifier the measured violation. The interacting Euclidean OS proof for the
// full model stays open. Deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  squareMesh,
  d4Mesh,
  meshOpposites,
} from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import {
  headOnRotate,
  lineHop,
  pairCollision,
} from '@/code/rule/collision'
import { beat, growingBeat } from '@/code/rule/lattice-gas'
import { pairGasFill } from '@/code/measure/density-front'
import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

const THIRD = (2 * Math.PI) / 3
const LAGS = 9
const PAIRS = 27
const BEATS = 36

// the smallest eigenvalue of the Toeplitz matrix built from the unbiased C(tau) of a scalar series
function toeplitzMinEig(input: {
  series: number[]
  pairs: number
}): number {
  const { series, pairs } = input
  const C: number[] = []

  for (let tau = 0; tau < LAGS; tau++) {
    let sum = 0
    let n = 0

    for (let t = 0; t < pairs && t + tau < series.length; t++) {
      sum += series[t]! * series[t + tau]!
      n++
    }

    C.push(sum / n)
  }

  const M = makeDense({ rows: LAGS, cols: LAGS })

  for (let i = 0; i < LAGS; i++) {
    for (let j = 0; j < LAGS; j++) {
      M.data[i * LAGS + j] = C[Math.abs(i - j)]!
    }
  }

  return Math.min(...Array.from(eigSymmetric({ matrix: M }).values))
}

// the slot-field correlation: C(tau) from full field snapshots, slot-averaged dot products
function fieldMinEig(input: { snapshots: number[][] }): number {
  const { snapshots } = input
  const C: number[] = []

  for (let tau = 0; tau < LAGS; tau++) {
    let sum = 0
    let n = 0

    for (
      let t = 0;
      t < PAIRS && t + tau < snapshots.length;
      t++
    ) {
      const a = snapshots[t]!
      const b = snapshots[t + tau]!
      let dot = 0

      for (let i = 0; i < a.length; i++) {
        dot += a[i]! * b[i]!
      }

      sum += dot / a.length
      n++
    }

    C.push(sum / n)
  }

  const M = makeDense({ rows: LAGS, cols: LAGS })

  for (let i = 0; i < LAGS; i++) {
    for (let j = 0; j < LAGS; j++) {
      M.data[i * LAGS + j] = C[Math.abs(i - j)]!
    }
  }

  return Math.min(...Array.from(eigSymmetric({ matrix: M }).values))
}

function snapshotSeries(input: {
  start: Will
  rule: (slots: Int8Array, base: number, degree: number) => void
}): number[][] {
  let will: Will = {
    mesh: input.start.mesh,
    data: Int8Array.from(input.start.data),
  }
  const out: number[][] = []

  for (let t = 0; t < BEATS; t++) {
    will = beat(will, input.rule)
    out.push(Array.from(will.data, v => Math.cos(THIRD * v)))
  }

  return out
}

// the traveller wake's support series, measured live (the E-FND-0096 geometry at side 13)
function wakeSupportSeries(): number[] {
  const side = 13
  const mesh = d4Mesh({ side })
  const rule = lineHop({ opposite: meshOpposites(mesh) })
  const coordinate = (c: number, axis: number): number =>
    Math.floor(c / side ** axis) % side
  const late = new Set<number>()

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = coordinate(cell, 0)

    if (x >= 5 && x <= 7) {
      late.add(cell)
    }
  }

  const mid = Math.floor(side / 2)
  let seedCell = 0

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    if (
      coordinate(cell, 0) === 1 &&
      coordinate(cell, 1) === mid &&
      coordinate(cell, 2) === mid &&
      coordinate(cell, 3) === mid
    ) {
      seedCell = cell
      break
    }
  }

  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  const series: number[] = []

  for (let t = 0; t < 33; t++) {
    if (t === 3) {
      seeded.data[seedCell * mesh.degree] = 1
    }

    const active = (cell: number): boolean =>
      late.has(cell) ? t >= 1 : true

    vacuum = growingBeat(vacuum, rule, active)
    seeded = growingBeat(seeded, rule, active)

    let support = 0

    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vacuum.data[i]) {
        support++
      }
    }

    series.push(support)
  }

  return series
}

export default experiment({
  id: 'quantum/clock-field-positivity',
  code: 'E-QTM-0096',
  title:
    "reflection positivity measured where it must hold and fail: the beating vacuum's clock-field Toeplitz matrix is positive semidefinite to machine precision and the thermal gas positive with a large margin (the Osterwalder-Schrader analog for the free and thermal sectors, on an estimator that is not automatically positive), while the traveller wake's amplifying support series violates positivity by three orders of magnitude (an amplifier is not a stationary field), with the whole-period estimator window the method correction that separates truncation artifacts from physics",
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const side = 12
    const mesh = squareMesh({ side })
    const opposite = meshOpposites(mesh)

    const vacuumMin = fieldMinEig({
      snapshots: snapshotSeries({
        start: makeWill(mesh),
        rule: pairCollision({ opposite }),
      }),
    })

    const gas = makeWill(mesh)

    pairGasFill({ will: gas, pairFill: 0.4 })

    const gasMin = fieldMinEig({
      snapshots: snapshotSeries({
        start: gas,
        rule: headOnRotate({ opposite }),
      }),
    })

    const wake = wakeSupportSeries()
    const wakeMin = toeplitzMinEig({ series: wake, pairs: 21 })
    const wakeGrew = wake[wake.length - 1]! > 50

    const vacuumPositive = vacuumMin > -1e-12
    const gasPositive = gasMin > 0.3
    const wakeViolates = wakeMin < -100

    const ok =
      vacuumPositive && gasPositive && wakeViolates && wakeGrew

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the vacuum clock field is positive semidefinite above -1e-12, the thermal gas above 0.3, and the measured amplifying wake below -100 on the same estimator',
      metrics: {
        vacuumMinEigenvalue: Number(vacuumMin.toExponential(3)),
        gasMinEigenvalue: Number(gasMin.toFixed(4)),
        wakeMinEigenvalue: Number(wakeMin.toExponential(3)),
        wakeFinalSupport: wake[wake.length - 1]!,
      },
      // CONTROL: the amplifying wake, where positivity MUST fail and measurably does
      control: {
        wakeViolation: Number(wakeMin.toExponential(3)),
      },
      notes:
        'the free-sector statement is the honest scope: OS positivity for the interacting Euclidean theory (the full reconstruction theorem) stays open, and this experiment supplies the measured half, a positive spectral measure for the free clock field and the thermal gas, plus the physically mandatory violation at the amplifier. The estimator subtlety (a window that is not a whole number of clock periods fakes a few-percent violation on the exact vacuum) is the reusable method lesson.',
    })
  },
})
