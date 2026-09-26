// The order in k at which the cold weave's and the cold quaternion knit's husk transport anisotropy falls,
// read off the knits themselves (E-RLT-0060).
//
// THE QUESTION is E-RLT-0059's: an anisotropy that starts at relative order k^4 or higher vanishes at long
// wavelength like a lattice artifact and the CPT-isotropy fork closes physically; one at k^2 or k^0 leaves
// it standing. The cold knits carry kinetic stores and dock counters (unbounded integers), so their dock
// collision is not a bijection on a small finite set and E-RLT-0059's exact linearization does not apply.
// They are measured by running them.
//
// THE RUNS (code/measure/husk-hydro, Weyl-placed starts, fill 0.2, bias 0.4, stores and counters empty, as
// E-FLD-0032 and E-RLT-0054): on d4Mesh boxes of side L = 8, 10, 12, 14, 16, 20 (six wavelengths
// k = 2 pi / L), a transverse wave in each of the six husk axis orientations (momentum along husk axis i,
// wave along husk axis j, i != j), read as the husk (column-summed) amplitude, 60 beats, its decay rate
// Gamma by the exponential window and nu = Gamma / k^2; the six bulk orientations with the depth axis
// (momentum or wave along axis 4) beside them; a longitudinal wave along each husk axis, 144 beats, its
// speed by the damped-cosine fit, and along the depth axis in the bulk. Within one family every orientation
// has the same |k| at a given L, so their spread is an anisotropy with no k-dependence mixed in, and the
// six husk shear orientations are carried into each other by the husk's cubic group, so a knit with that
// group would give them all one nu.
// THE ANISOTROPY at each L is (max - min) / mean over the family; its exponent is the log-log slope
// against k over the six sides, with its least-squares standard error.
//
// THE CONTROL: the same runs on the free-streaming gas (no collision), whose dynamics has the full W(F4)
// symmetry, so its spread within a family is the noise of the deterministic starts. A knit's anisotropy is
// read only where it exceeds twice the control's at the same L.
//
// Gates, fixed before the first run:
//  S1 E exact in every run of both cold knits
//  S2 each knit's husk shear and husk sound anisotropy exceeds twice the control's at every L
//  S3 every husk exponent resolved: standard error under 0.5
// HYPOTHESIS H (the fork closes physically): every husk exponent of both knits is at least 3.
// Verdict: pass if S1, S2, S3 and H hold; fail if S1, S2, S3 hold and H does not (the fork stands);
// partial otherwise. Reported: whether each knit is hydrodynamic at these wavelengths (the log-log slope of
// the mean husk Gamma against k, 2 for diffusion, 1 or less for a ballistic or frozen wave).
//
// DETERMINISM: Weyl-sequence starts (code/measure/husk-hydro weylWaveStart), no random numbers.
// Depth L2: the rules run, their transport read on the husk with a control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { coldGas, shearRun, soundRun, toneGas, type GasSystem } from '@/code/measure/husk-hydro'
import { type WaveGeometry } from '@/code/measure/momentum-transport'
import { logSlope, spread } from '@/code/measure/husk-transport-order'
import { makeColdQuaternionKnit } from '@/code/rule/cold-quaternion-knit'
import { coldBeat, coldEnergy, makeColdWeave, type ColdState } from '@/code/rule/cold-weave'
import { HEAD_TURN_SPEC, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { passThrough } from '@/code/rule/collision'
import { d4Mesh } from '@/code/tool/mesh'

const SIDES = [8, 10, 12, 14, 16, 20]

const axis = (i: number): number[] => [0, 1, 2, 3].map(k => (k === i ? 1 : 0))

const HUSK_SHEARS: WaveGeometry[] = [
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 2],
  [2, 0],
  [2, 1],
].map(([m, w]) => ({ momentum: axis(m!), wave: axis(w!) }))
const DEPTH_SHEARS: WaveGeometry[] = [
  [0, 3],
  [3, 0],
  [1, 3],
  [3, 1],
  [2, 3],
  [3, 2],
].map(([m, w]) => ({ momentum: axis(m!), wave: axis(w!) }))
const HUSK_SOUNDS: WaveGeometry[] = [0, 1, 2].map(i => ({ momentum: axis(i), wave: axis(i) }))
const DEPTH_SOUND: WaveGeometry = { momentum: axis(3), wave: axis(3) }

function coldWeaveGas(): GasSystem<ColdState> {
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))
  const spec: ScatterWeaveSpec = { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }

  return {
    name: 'cold weave',
    make: side => {
      const mesh = d4Mesh({ side })
      const weave = makeColdWeave({ mesh, spec })

      return {
        mesh,
        start: vibe => ({ vibe, store: new Int32Array(vibe.length), demon: new Int32Array(mesh.cellCount * 12) }),
        step: (s, t) => coldBeat(weave, s, t),
        vibe: s => s.vibe,
        energy: s => coldEnergy(s),
      }
    },
  }
}

type SideReading = {
  side: number
  k: number
  huskShear: number[]
  depthShear: number[]
  huskGamma: number[]
  huskSound: number[]
  depthSound: number
  energyExact: boolean
  huskEqualsBulk: boolean
  r2: number[]
}

function readSide<S>(system: GasSystem<S>, side: number): SideReading {
  const husk = HUSK_SHEARS.map(g => shearRun(system, side, g))
  const depth = DEPTH_SHEARS.map(g => shearRun(system, side, g))
  const sounds = HUSK_SOUNDS.map(g => soundRun(system, side, g))
  const depthSound = soundRun(system, side, DEPTH_SOUND)

  return {
    side,
    k: (2 * Math.PI) / side,
    huskShear: husk.map(r => r.nu),
    depthShear: depth.map(r => r.nu),
    huskGamma: husk.map(r => r.gamma),
    huskSound: sounds.map(r => r.speed),
    depthSound: depthSound.speed,
    energyExact: [...husk, ...depth, ...sounds, depthSound].every(r => r.energyExact),
    huskEqualsBulk: [...husk, ...sounds].every(r => r.huskEqualsBulk),
    r2: husk.map(r => r.r2),
  }
}

type Family = { series: number[]; exponent: number; error: number }

function family(ks: readonly number[], values: readonly number[][]): Family {
  const series = values.map(v => spread(v))
  const fit = logSlope(ks, series)

  return { series, exponent: fit.slope, error: fit.error }
}

export default experiment({
  id: 'relativity/cold-knit-anisotropy-order',
  code: 'E-RLT-0060',
  title:
    'the cold knits run at L = 8 to 20, partial: the husk shear anisotropy among the six cubic-equivalent axis orientations stays of order one, falling as k^0.50 +- 0.06 for the cold weave (2.02 to 1.25, its decay not yet diffusive, Gamma ~ k^1.62) and flat for the cold quaternion knit (k^0.07 +- 0.10, 2.2 to 2.5, which does not decay diffusively at all), while the husk sound speed is equal on the three axes to 3 to 6 percent (cold weave) and 0.1 to 0.4 percent (cold quaternion) with no resolved trend; E is exact in every run, but the free-streaming control gives no usable noise floor for the shear and the sound exponents are unresolved',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const systems: [string, GasSystem<unknown>][] = [
      ['streaming', toneGas('streaming', () => () => passThrough) as GasSystem<unknown>],
      ['coldWeave', coldWeaveGas() as GasSystem<unknown>],
      ['coldQuaternion', coldGas('cold quaternion', () => makeColdQuaternionKnit()) as GasSystem<unknown>],
    ]
    const metrics: Record<string, number> = {}
    const readings: Record<string, SideReading[]> = {}

    for (const [name, system] of systems) {
      readings[name] = SIDES.map(side => readSide(system, side))
    }

    const ks = SIDES.map(s => (2 * Math.PI) / s)
    const families: Record<string, Record<string, Family>> = {}

    for (const [name] of systems) {
      const r = readings[name]!

      families[name] = {
        huskShear: family(
          ks,
          r.map(x => x.huskShear),
        ),
        bulkShear: family(
          ks,
          r.map(x => [...x.huskShear, ...x.depthShear]),
        ),
        huskSound: family(
          ks,
          r.map(x => x.huskSound),
        ),
        bulkSound: family(
          ks,
          r.map(x => [...x.huskSound, x.depthSound]),
        ),
      }

      for (const [q, f] of Object.entries(families[name]!)) {
        metrics[`${name}_${q}_exponent`] = Number(f.exponent.toFixed(4))
        metrics[`${name}_${q}_error`] = Number(f.error.toFixed(4))
        f.series.forEach((v, i) => {
          metrics[`${name}_${q}_anisotropy_L${SIDES[i]}`] = v
        })
      }

      r.forEach(x => {
        x.huskShear.forEach((v, i) => {
          metrics[`${name}_nu_L${x.side}_husk${i}`] = v
        })
        x.huskSound.forEach((v, i) => {
          metrics[`${name}_speed_L${x.side}_axis${i}`] = v
        })
        metrics[`${name}_speed_L${x.side}_depth`] = x.depthSound
        metrics[`${name}_minR2_L${x.side}`] = Math.min(...x.r2)
      })

      const meanGamma = r.map(x => x.huskGamma.reduce((s, v) => s + v, 0) / x.huskGamma.length)

      metrics[`${name}_huskGammaExponent`] = Number(logSlope(ks, meanGamma).slope.toFixed(4))
      metrics[`${name}_energyExact`] = r.every(x => x.energyExact) ? 1 : 0
      metrics[`${name}_huskEqualsBulk`] = r.every(x => x.huskEqualsBulk) ? 1 : 0
    }

    const knits = ['coldWeave', 'coldQuaternion']
    const s1 = knits.every(n => metrics[`${n}_energyExact`] === 1)
    const control = families.streaming!
    const s2 = knits.every(n =>
      (['huskShear', 'huskSound'] as const).every(q => families[n]![q]!.series.every((v, i) => v > 2 * (control[q]!.series[i] ?? Number.POSITIVE_INFINITY))),
    )
    const huskFits = knits.flatMap(n => (['huskShear', 'huskSound'] as const).map(q => ({ knit: n, q, ...families[n]![q]! })))
    const s3 = huskFits.every(f => f.error < 0.5)
    const closes = huskFits.every(f => f.exponent >= 3)

    metrics.seconds = (Date.now() - started) / 1000

    const status = s1 && s2 && s3 ? (closes ? 'pass' : 'fail') : 'partial'

    return verdict({
      status,
      claim: `husk anisotropy exponents measured on the cold knits at L = 8 to 20: ${huskFits.map(f => `${f.knit} ${f.q} ${f.exponent.toFixed(2)} +- ${f.error.toFixed(2)}`).join(', ')}; the fork ${closes ? 'closes' : 'stands'} at these wavelengths`,
      metrics,
      control: {
        streamingHuskShearExponent: control.huskShear!.exponent,
        streamingHuskShearAnisotropyL20: control.huskShear!.series[SIDES.length - 1] ?? Number.NaN,
        streamingHuskSoundAnisotropyL20: control.huskSound!.series[SIDES.length - 1] ?? Number.NaN,
      },
      notes: `L2. Gates: S1 energy exact ${s1}, S2 above the control ${s2}, S3 resolved ${s3}, H closes ${closes}. First run recorded as is, nothing moved. WHY PARTIAL: (1) the control was designed badly for the shear: a free-streaming gas has no exponential decay, its fitted rates are near zero with r2 under 0.01, so its spread (0.008 to 9) is not a noise floor, and S2 fails on it; for the sound the control is exactly isotropic (spread 0) and both knits pass. (2) The sound anisotropy among the three husk axes is 0.1 to 6 percent at every side with no trend, so its exponents (-0.27 +- 0.41, 0.81 +- 0.86) are unresolved. (3) Neither knit is hydrodynamic here: the cold weave's mean husk Gamma goes as k^1.62 with fit r2 0.23 to 0.79, and the cold quaternion knit's as k^-0.32 with r2 near 0.02 (its exchange almost never fires, E-RLT-0054), so the numbers read the pre-hydrodynamic and ballistic regimes, not the k -> 0 limit. What stands anyway: at every side both knits' husk shear rates differ by a factor of order one among orientations the husk cubic group makes equivalent, the anisotropy E-RLT-0058 allows at leading order ({I, -I} for the cold weave, Q8 for the cold quaternion knit, neither forcing the shear). The axis family cannot see the axis against diagonal sound anisotropy E-RLT-0054 found (0.94 against 0.63 for the cold quaternion knit). Since their stores and counters rule out E-RLT-0059's exact count, a k -> 0 exponent for these two knits needs a linearization that handles the store and counter levels.`,
    })
  },
})
