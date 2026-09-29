// Distance as shared information, calibrated on the vacuum (E-GRV-0064). Van Raamsdonk's route read on the adopted knit:
// if two husk regions are close exactly when they share much information, the knit's settled vacuum must already carry a
// mutual information that is translation invariant, falls with separation, and, turned into a distance, gives back the
// husk's own mesh distance. This file asks that of the existing rule. Nothing in the rule is changed or added.
//
// THE KNIT. The coset-union vacuum under the lone bounce collision (E-RLT-0084, E-RLT-0093), side 16 (65,536 docks, a
// 16^3 husk of depth 16), the plain stream of code/measure/held-knot (no knot), the gas E-GRV-0056 used: every slot held
// when its Weyl value is below 8/24, love or fear and a role point by two more Weyl values, the vacuum's stores.
//
// THE READING (code/measure/shared-distance). 17 members (the start family, member k with gas phase k), 48 beats to
// settle, then 192 settled beats. Per beat and husk column the conserved column energy, minus its mean over the 17 members
// at that beat (removing the vacuum's shared deterministic cycle). The correlation rho of two columns pooled over members,
// beats, origins and the symmetry images of the displacement, normalized by the per-column variance; the Gaussian mutual
// information I = -1/2 ln(1 - rho^2). Displacements: the three families (k, 0, 0), (k, k, 0), (k, k, k), k = 1 .. 7, whose
// mesh distances are k, k and ceil(3k / 2), so the reading can tell the husk's own metric from the Euclidean one.
// Errors: jackknife over the 17 members.
//
// THE EMERGENT DISTANCE, two standard forms, each normalized at the nearest axis neighbor (mesh distance 1):
//   power  d = sqrt(I(axis 1) / I)                         (the d ~ I^(-1/2) proxy, no free parameter)
//   log    d = 1 + ln(I(axis 1) / I) / kappa              (kappa the least-squares rate of ln(I1 / I) on mesh - 1)
//
// Gates, fixed before the first run of this file. "The calibration set" is every class of mesh distance at most 6 (axis
// k = 1..6, face k = 1..6, body k = 1..4).
//  C1 instrument: energy and charge exact at every beat of all 17 runs
//  C2 translation invariance: for every class in the calibration set, rho over origins in the husk's first half
//     (first coordinate below 8) and over the second half differ by at most 3 jackknife errors of the difference
//  C3 falls with separation: rho at axis 1 is at least 3 errors from zero, and I(axis 1) exceeds I of every class of
//     mesh distance 4 or more by at least 3 errors of the difference
//  C4 the calibration: every class in the calibration set has rho at least 3 errors from zero, and at least one of the
//     two forms gives a distance within 25% of the mesh distance on every class of the set
// Verdict: pass if all hold; fail if C1 holds and any of C2 to C4 fails; partial if C1 fails.
//
// Reported, not gated: rho and I for every class k = 1..7, the fitted kappa, both emergent distances, and the Euclidean
// comparison (which of mesh and Euclidean distance the emergent distance tracks, by the rms of the relative miss).
//
// DISCLOSED: one probe before this file (tmp/grv64-probe.ts) timed the side-12 box build (0.8 s) and 20 plain beats
// (0.15 s) and counted a radius-1 knot's columns (7); it read no correlation. The side (16) and the displacement range
// were chosen from that timing.
//
// FIRST RUN (226 s, the record): fail on C3 and C4, recorded as is, no gate moved. C1 holds. C2 holds only because
// every reading is noise. The settled vacuum shares no information between columns: every one of the 21 classes has
// |rho| <= 5.2e-4, within 2.8 jackknife errors of zero (axis 1: 4.3e-5 +- 1.9e-4), and the mean over classes,
// about -2.5e-4, is the one correlation a conserved total forces on 4,096 columns, -1/(4,096 - 1) = -2.44e-4, the same at
// every separation. The knit's settled gas is a product state on the husk, up to that constraint, so no distance can be
// read from its shared information. Title written after the run.
//
// Depth L2: a measurement on the adopted knit's own gas, read on the husk, against the husk's own metric.
// DETERMINISM: Weyl fills and the 17 link starts; nothing is drawn. NOTHING MOVES: the stream takes the neighbor's value.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { arrowBox, type ArrowBox } from '@/code/measure/second-law-husk'
import { knotStart, knotStream } from '@/code/measure/held-knot'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  classCorrelation,
  classSums,
  displacementClasses,
  fluctuations,
  gaussianInformation,
  jackknife,
  recordRun,
} from '@/code/measure/shared-distance'

const SIDE = 16
const PER_DOCK = 8
const SETTLE = 48
const SAMPLES = 192
const KMAX = 7
const CALIBRATION = 6

export default experiment({
  id: 'gravity/shared-information-distance',
  code: 'E-GRV-0064',
  title:
    "no distance from shared information on the adopted knit's vacuum, fail on C3 and C4: on the settled gas (side 16, 8/24 per slot, 17 starts, 192 beats) the Gaussian mutual information between husk columns, from the members' connected energy correlation, is zero within errors at every separation: all 21 displacement classes (axis, face and body diagonals, k = 1 to 7) have |rho| at most 5.2e-4, none of the 16 classes of mesh distance up to 6 is 3 errors from zero (nearest axis neighbor 4.3e-5 +- 1.9e-4), and the mean, about -2.5e-4, is the conserved total's own -1/(4,096 - 1) = -2.44e-4 at every separation; the reading is translation invariant (the two halves agree within 3 errors, trivially), energy and charge exact; the settled vacuum is a product state on the husk, so neither d ~ I^(-1/2) nor d ~ -ln I can give back the mesh distance",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const members = startFamily(16)

    let box: ArrowBox | undefined

    const runs = members.map((member, k) => {
      box = withStart(member, () => arrowBox(SIDE, 1))

      const plain = knotStream(box, -1, [0, 0, 0])

      return recordRun(
        plain,
        knotStart(plain, { perDock: PER_DOCK, phase: k, lump: false }),
        SETTLE,
        SAMPLES,
      )
    })

    log('runs')

    const columns = SIDE ** 3
    const classes = displacementClasses(KMAX)
    const sums = classSums(box!, fluctuations(runs), classes)

    log('sums')

    const rho = (j: number, h: 0 | 1 | 2) =>
      jackknife(sums, total =>
        classCorrelation(total, classes, j, h, columns),
      )
    const info = (j: number) =>
      jackknife(sums, total =>
        gaussianInformation(
          classCorrelation(total, classes, j, 2, columns),
        ),
      )
    const infoGap = (i: number, j: number) =>
      jackknife(
        sums,
        total =>
          gaussianInformation(
            classCorrelation(total, classes, i, 2, columns),
          ) -
          gaussianInformation(
            classCorrelation(total, classes, j, 2, columns),
          ),
      )
    const halfGap = (j: number) =>
      jackknife(
        sums,
        total =>
          classCorrelation(total, classes, j, 0, columns) -
          classCorrelation(total, classes, j, 1, columns),
      )

    const axis1 = classes.findIndex(
      c => c.family === 'axis' && c.k === 1,
    )
    const all = classes.map((c, j) => ({
      c,
      j,
      rho: rho(j, 2),
      info: info(j),
      halves: halfGap(j),
    }))
    const calibration = all.filter(x => x.c.mesh <= CALIBRATION)
    const i1 = all[axis1]!.info.value

    const g1 = runs.every(r => r.exact)
    const g2 = calibration.every(
      x => Math.abs(x.halves.value) <= 3 * x.halves.error,
    )
    const far = all
      .filter(x => x.c.mesh >= 4)
      .map(x => infoGap(axis1, x.j))
    const g3 =
      Math.abs(all[axis1]!.rho.value) >= 3 * all[axis1]!.rho.error &&
      far.every(g => g.value >= 3 * g.error)

    // the two emergent distances
    const power = (x: (typeof all)[number]): number =>
      x.info.value > 0 && i1 > 0
        ? Math.sqrt(i1 / x.info.value)
        : Infinity
    const logRatio = (x: (typeof all)[number]): number =>
      x.info.value > 0 && i1 > 0
        ? Math.log(i1 / x.info.value)
        : Infinity
    const fitSet = calibration.filter(
      x => x.c.mesh > 1 && Number.isFinite(logRatio(x)),
    )
    const kappa =
      fitSet.length > 0
        ? fitSet.reduce((a, x) => a + logRatio(x) * (x.c.mesh - 1), 0) /
          fitSet.reduce((a, x) => a + (x.c.mesh - 1) ** 2, 0)
        : 0
    const logDistance = (x: (typeof all)[number]): number =>
      kappa > 0 ? 1 + logRatio(x) / kappa : Infinity
    const within = (d: number, mesh: number): boolean =>
      Number.isFinite(d) && Math.abs(d / mesh - 1) <= 0.25
    const significant = calibration.every(
      x => Math.abs(x.rho.value) >= 3 * x.rho.error,
    )
    const powerHolds = calibration.every(x =>
      within(power(x), x.c.mesh),
    )
    const logHolds = calibration.every(x =>
      within(logDistance(x), x.c.mesh),
    )
    const g4 = significant && (powerHolds || logHolds)

    const rms = (
      form: (x: (typeof all)[number]) => number,
      target: (x: (typeof all)[number]) => number,
    ): number => {
      const finite = calibration.filter(x => Number.isFinite(form(x)))

      return finite.length > 0
        ? Math.sqrt(
            finite.reduce(
              (a, x) => a + (form(x) / target(x) - 1) ** 2,
              0,
            ) / finite.length,
          )
        : -1
    }

    const status = !g1 ? 'partial' : g2 && g3 && g4 ? 'pass' : 'fail'
    const label = (x: (typeof all)[number]): string =>
      `${x.c.family}${x.c.k}`
    const e = (v: number): string =>
      Number.isFinite(v) ? v.toExponential(2) : 'inf'
    const table = all
      .map(
        x =>
          `${label(x)} (mesh ${x.c.mesh}, euclid ${x.c.euclid.toFixed(2)}): rho ${e(x.rho.value)} +- ${e(x.rho.error)}, I ${e(x.info.value)} +- ${e(x.info.error)}, halves gap ${e(x.halves.value)} +- ${e(x.halves.error)}, d power ${Number.isFinite(power(x)) ? power(x).toFixed(2) : 'inf'}, d log ${Number.isFinite(logDistance(x)) ? logDistance(x).toFixed(2) : 'inf'}`,
      )
      .join('; ')
    const significantCount = calibration.filter(
      x => Math.abs(x.rho.value) >= 3 * x.rho.error,
    ).length

    return verdict({
      status,
      claim: `on the settled gas of the adopted knit (side ${SIDE}, 17 starts, ${SAMPLES} beats), the Gaussian mutual information between husk columns from the members' connected energy correlation: rho at axis 1 ${e(all[axis1]!.rho.value)} +- ${e(all[axis1]!.rho.error)}; ${significantCount} of ${calibration.length} calibration classes (mesh <= ${CALIBRATION}) carry a correlation at least 3 errors from zero; power form within 25% of the mesh distance on all: ${powerHolds}; log form (kappa ${kappa.toFixed(3)}): ${logHolds}`,
      metrics: {
        gate_C1: g1 ? 1 : 0,
        gate_C2: g2 ? 1 : 0,
        gate_C3: g3 ? 1 : 0,
        gate_C4: g4 ? 1 : 0,
        calibrationSignificant: significantCount,
        calibrationClasses: calibration.length,
        kappa,
        powerRmsMesh: rms(power, x => x.c.mesh),
        powerRmsEuclid: rms(power, x => x.c.euclid),
        logRmsMesh: rms(logDistance, x => x.c.mesh),
        logRmsEuclid: rms(logDistance, x => x.c.euclid),
        ...Object.fromEntries(
          all.map(x => [`rho_${label(x)}`, x.rho.value]),
        ),
        ...Object.fromEntries(
          all.map(x => [`rhoError_${label(x)}`, x.rho.error]),
        ),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        translationInvariant: g2 ? 1 : 0,
        fallsWithSeparation: g3 ? 1 : 0,
      },
      notes: `L2. Gates C1 ${g1}, C2 ${g2}, C3 ${g3}, C4 ${g4} (significant ${significant}, power ${powerHolds}, log ${logHolds}). Per class: ${table}. Info gap I(axis1) - I(class) for mesh >= 4: ${far.map(g => `${e(g.value)} +- ${e(g.error)}`).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
