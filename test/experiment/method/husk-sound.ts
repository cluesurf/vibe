// Sound on the husk. The husk is the column sum of the bulk along the depth e4 (code/measure/photon-husk): the
// 24 D4 roots cast 12 shadows on the 6 cubic axes (two each, speed 1) and 12 on the face diagonals (one each,
// speed sqrt 2). A density or momentum wave on the husk is a bulk wave with k4 = 0, since the Fourier sum at
// k4 = 0 is the sum over columns, so the husk sound speed is the bulk's for k perpendicular to the depth.
//
// The derivation. At the uniform third-each occupation the pressure tensor of a lattice gas is (rho / 24) sum of
// v v^T over the 24 velocities. On the husk the velocities are the shadows: sum over shadows of v v^T =
// 2 (2 I) + 2 (4 I) - the axes twice, the diagonals once, both signs - = 12 I, so
//
//   c_s^2 = 12 / 24 = 1/2,  c_s = 1 / sqrt 2 on the husk, isotropic,
//
// the same as in the bulk. The husk gas has two speeds, 1 and sqrt 2, with mean square speed 3/2, and
// c_s^2 = <v^2> / 3 holds: c_s = v_rms / sqrt 3 with v_rms = sqrt(3/2), which is also c / 2 with c = sqrt 2 the
// fastest shadow. So the E-MTH-0010 remark that a husk gas would give c / sqrt 3 = 0.816 was wrong: that is a
// one-speed 3D gas at the fastest shadow's speed, which the projection is not.
//
// Gates, fixed before the run:
// G1 exact: the shadow multiset of the 24 roots has second moment 12 I and total weight 24 (c_s^2 = 1/2)
// G2 the flip weave (E-FLD-0027's sound rule) rings along three husk directions, the axis (1,0,0,0), the face
//    diagonal (1,1,0,0) and the body diagonal (1,1,1,0), each extrapolated to k = 0 linearly in k^2, all within
//    3 percent of 1 / sqrt 2 and nearer it than to 0.816 (the one-speed 3D gas) or 0.577 (a unit-speed 3D gas)
// Reported: the depth axis (0,0,0,1), which a flat box makes equal to the husk axis by W(F4), and the speeds at
// matched k.
//
// The box, chosen before the first run (disclosed, 2026-09-26). A wave with q4 = 0 needs the box long only along
// the axes q spans: the axis wave runs on L x T x T x T, the face diagonal on L x L x T x T, the body diagonal on
// L x L x L x T, the depth axis on T x T x T x L, with T = 8 (code/measure/husk-sound-box). The rule is the same
// rule on a smaller flat torus, the long sides are the ones fixed above, and T sets only how many docks the wave
// averages over. On the full L^4 box the flat side-28 body wave alone is 88 million dock-beats and the original
// design was about six hours. Calibration, reported: the side-12 axis wave on the full 12^4 box against 12 x 8^3,
// from the same Weyl start design. The start is momentum-transport's with its hash replaced by weylCell.
//
// Reported, the coincidence null (code/measure/coincidence-null, written before it was computed). The fear
// walk's top speed is 1/2 dock a beat, cos(phi / 2) at phi = 2 pi / 3 (E-CMP-0017), which is 1 / sqrt 2 in D4
// length since a dock step is a root of length sqrt 2; the sound speed is c / sqrt 4 = 1 / sqrt 2. Both are
// exact, so E-MTH-0010's continuous null cannot weigh them. The discrete null counts the distinct budget
// values of complexity 2 (2 x^2 = 1) within 10 percent of 1 / sqrt 2: a shared value is a common origin only if
// 1 / count < 0.01. PREDICTION: the count is at least 5, so the rate is above 0.05 and the equality is not
// admissible on its number. On the husk: a walk along a root runs at half its shadow's length, 1/2 on the 6
// lines whose shadow is an axis and 1 / sqrt 2 on the 6 with a diagonal shadow, while husk sound is 1 / sqrt 2
// on every line. PREDICTION: equal on 6 of 12 lines.
//
// Depth L2: an exact moment, then the rule's own waves. Deterministic (Weyl fills, no seed).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { colorLocalCollision, type ColorLocalSpec } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { linearFit } from '@/code/measure/regression'
import { FLIP_TABLE } from '@/code/rule/momentum-weave'
import { HEAD_TURN_SPEC, scatterCollision, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import { dampedCosineFit } from '@/code/measure/momentum-transport'
import { HUSK_VECTORS, HUSK_WEIGHTS } from '@/code/measure/photon-husk'
import { boxMeshD4, boxSlabs, boxWaveSeries, boxWaveStart, type BoxSides } from '@/code/measure/husk-sound-box'
import { budgetValuesInWindow, exactCoincidenceRate } from '@/code/measure/coincidence-null'

const BEATS = 144
const TRANSVERSE = 8
const HALF_C = Math.SQRT1_2
const ONE_SPEED_3D = Math.sqrt(2 / 3)
const UNIT_SPEED_3D = 1 / Math.sqrt(3)
const ADMISSIBLE = 0.01
const DIRECTIONS: [string, number[], number[]][] = [
  ['axis', [1, 0, 0, 0], [12, 16, 20]],
  ['face', [1, 1, 0, 0], [17, 23, 28]],
  ['body', [1, 1, 1, 0], [21, 28]],
  ['depth', [0, 0, 0, 1], [12, 16, 20]],
]

function flipSpec(): ScatterWeaveSpec {
  const base: ColorLocalSpec = { ...HEAD_TURN_SPEC, tables: [FLIP_TABLE] }
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: base, opposite: o, forward: f }))

  return { base, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
}

// long along every axis the wave spans, TRANSVERSE elsewhere
function boxFor(direction: readonly number[], side: number, transverse: number): BoxSides {
  return [0, 1, 2, 3].map(k => (direction[k] !== 0 ? side : transverse)) as unknown as BoxSides
}

function waveSpeed(spec: ScatterWeaveSpec, sides: BoxSides, side: number, direction: number[]): { k: number; speed: number; r2: number } {
  const mesh = boxMeshD4(sides)
  const slabs = boxSlabs(sides, direction, side)
  const will = boxWaveStart({ mesh, slabs, long: side, momentum: direction, fill: 0.2, bias: 0.4, salt: 7 })
  const series = boxWaveSeries({ will, slabs, long: side, momentum: direction, collision: scatterCollision({ spec, opposite: meshOpposites(mesh) }), beats: BEATS })
  const s0 = series[0] ?? 1
  const fit = dampedCosineFit({ series: series.map(x => x / s0) })
  const k = (2 * Math.PI * Math.hypot(...direction)) / side

  return { k, speed: fit.omega / k, r2: fit.r2 }
}

export default experiment({
  id: 'method/husk-sound',
  code: 'E-MTH-0013',
  title:
    'sound on the husk: the 24 roots\' shadows on the cubic husk (axes twice at speed 1, face diagonals once at speed sqrt 2) have second moment 12 I, so the husk sound speed is exactly 1 / sqrt 2, isotropic, equal to the bulk\'s, c_s = v_rms / sqrt 3 for the two-speed husk gas, and the flip weave\'s waves along the husk axis, face diagonal and body diagonal extrapolate to it, not to the 0.816 of a one-speed 3D gas',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // G1: the shadow moment, from the roots themselves and from the husk table
    const roots = rootsD4()
    const shadows = roots.map(r => [r[0]!, r[1]!, r[2]!])
    const moment = [0, 1, 2].map(a => [0, 1, 2].map(b => shadows.reduce((s, v) => s + v[a]! * v[b]!, 0)))
    const momentExact = moment.every((row, a) => row.every((x, b) => x === (a === b ? 12 : 0)))
    const tableMoment = [0, 1, 2].map(a => [0, 1, 2].map(b => 2 * HUSK_VECTORS.reduce((s, u, h) => s + HUSK_WEIGHTS[h]! * u[a]! * u[b]!, 0)))
    const tableExact = tableMoment.every((row, a) => row.every((x, b) => x === (a === b ? 12 : 0))) && 2 * HUSK_WEIGHTS.reduce((s, w) => s + w, 0) === 24
    const meanSquareSpeed = shadows.reduce((s, v) => s + v[0]! ** 2 + v[1]! ** 2 + v[2]! ** 2, 0) / 24

    // G2: waves
    const spec = flipSpec()
    const metrics: Record<string, number> = { shadowSecondMoment: moment[0]![0]!, huskMeanSquareSpeed: meanSquareSpeed, predictedSpeed: HALF_C, transverseSide: TRANSVERSE }
    const limits: Record<string, number> = {}

    for (const [name, direction, sides] of DIRECTIONS) {
      const waves = sides.map(side => waveSpeed(spec, boxFor(direction, side, TRANSVERSE), side, direction))

      waves.forEach((w, i) => {
        metrics[`${name}SpeedL${sides[i]}`] = w.speed
        metrics[`${name}KL${sides[i]}`] = w.k
        metrics[`${name}R2L${sides[i]}`] = w.r2
      })

      limits[name] = linearFit({ xs: waves.map(w => w.k * w.k), ys: waves.map(w => w.speed) }).intercept
      metrics[`${name}SpeedAtZero`] = limits[name]!
    }

    const husk = ['axis', 'face', 'body'].map(n => limits[n]!)
    const waveGate = husk.every(v => Math.abs(v / HALF_C - 1) < 0.03 && Math.abs(v - HALF_C) < Math.abs(v - ONE_SPEED_3D) && Math.abs(v - HALF_C) < Math.abs(v - UNIT_SPEED_3D))

    // calibration: the full 12^4 box against the thin one, same start design
    const fullBox = waveSpeed(spec, [12, 12, 12, 12], 12, [1, 0, 0, 0]).speed
    const thinBox = metrics['axisSpeedL12']!

    // the coincidence null for the walk and sound speeds
    const walkTopDocks = Math.cos(Math.PI / 3)
    const walkTopBulk = walkTopDocks * Math.SQRT2
    const nullWalk = exactCoincidenceRate(HALF_C, 2)
    const lines = roots.filter((r, d) => d < roots.findIndex(o => o.every((x, k) => x === -r[k]!)))
    const huskWalk = lines.map(r => (walkTopDocks * Math.hypot(r[0]!, r[1]!, r[2]!)))
    const huskLinesEqual = huskWalk.filter(v => Math.abs(v - HALF_C) < 1e-12).length
    const window = budgetValuesInWindow(HALF_C, 2)
    // the budget values of complexity 2 nearest 1 / sqrt 2 on each side
    const nearest = (side: number): number => (side < 0 ? Math.max(...window.filter(v => v < HALF_C - 1e-12)) : Math.min(...window.filter(v => v > HALF_C + 1e-12)))

    return verdict({
      status: momentExact && tableExact && Math.abs(meanSquareSpeed - 1.5) < 1e-15 && waveGate ? 'pass' : 'fail',
      claim: `the husk sound speed is 1 / sqrt 2 exactly: the roots' shadows have second moment 12 I over weight 24 (mean square speed 3/2, so c_s = v_rms / sqrt 3 = c / 2), and the flip weave's waves extrapolate to ${husk.map(v => v.toFixed(3)).join(', ')} along the husk axis, face diagonal and body diagonal (depth axis ${limits['depth']!.toFixed(3)}), against 0.707 predicted and 0.816 for a one-speed 3D gas; the fear walk's top speed equals it in the bulk (both 1 / sqrt 2) but on the husk only on ${huskLinesEqual} of ${lines.length} lines, and ${nullWalk.values} budget values of complexity 2 lie within 10 percent, a coincidence rate of ${nullWalk.rate.toFixed(3)} against the 0.01 an identification needs`,
      metrics: {
        ...metrics,
        walkTopSpeedBulk: walkTopBulk,
        huskLinesWhereWalkEqualsSound: huskLinesEqual,
        budgetValuesComplexityTwo: nullWalk.values,
        walkSoundCoincidenceRate: nullWalk.rate,
        walkSoundAdmissible: nullWalk.rate < ADMISSIBLE ? 1 : 0,
      },
      control: { oneSpeed3D: ONE_SPEED_3D, unitSpeed3D: UNIT_SPEED_3D, fullBoxAxisSpeedL12: fullBox, thinBoxAxisSpeedL12: thinBox, budgetValueNearestBelow: nearest(-1), budgetValueNearestAbove: nearest(1) },
      notes:
        'L2. The projection is exact at k4 = 0: the Fourier amplitude of the bulk momentum at (k1, k2, k3, 0) is the Fourier amplitude of the column-summed husk field. The extrapolation uses two or three sides per direction (the body diagonal needs L = 21 and 28 to reach the axis\'s k), linear in k^2 as E-FLD-0027 did. The flat D4 box has no warp: in the hyperbolic bulk the columns shrink with depth, which this does not model. This corrects E-MTH-0010, whose claim called c / 2 a bulk-only number: the husk keeps it. First run (2026-09-26, 111 s, pass): limits 0.708, 0.712, 0.709 along axis, face and body, depth 0.721; the thin box reads the side-12 axis at 0.819 against 0.825 on the full 12^4 box (0.7 percent). The limits agree, but the dispersion does not: at k near 0.52 the axis wave runs at 0.819, the body diagonal at 0.772 and the face diagonal at 0.719, so the k^2 correction is strongly direction dependent (the face wave is nearly dispersionless) and the isotropy holds only at k = 0. The coincidence null: 7 distinct budget values of complexity 2 lie in 0.636 to 0.778 (log 2 = 0.693 and sqrt 3 - 1 = 0.732 the nearest), so the rate is 1/7 = 0.143, as predicted above 0.05, and the walk and sound speeds are equal on 6 of 12 husk lines, as predicted.',
    })
  },
})
