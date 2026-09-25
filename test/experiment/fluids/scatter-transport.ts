// Momentum transport in the scatter weave: shear viscosity, sound, the isotropy of the stress response,
// and the dressing the block costs.
//
// E-FLD-0024 built the scatter weave (code/rule/scatter-weave): the momentum turn weave (the color turn
// weave's schedule with the momentum-keeping exchange) plus a four-line binary scattering block, so line
// momenta exchange while P stays exact. This asks what the exchange buys, on the integer D4 torus (d4Mesh),
// reading the particle momentum P (code/measure/momentum-transport), with the base alone (every line
// momentum kept) as the control:
//
// 1. SHEAR. A transverse wave of P (momentum along axis 0, wave along axis 1) on a hash background of both
//    signs, modes 1 and 2 at side 12 and mode 1 at side 16. The decay rate Gamma of the mode amplitude,
//    the viscosity nu = Gamma / k^2, and the rate ratio for doubled k (4 if diffusive, 2 if ballistic).
//    The exact invariant a line-keeping rule has, the momentum on lines perpendicular to the wave per slab,
//    is read before and after: zero change under the base, and it must break under the block.
// 2. SOUND. A longitudinal wave (momentum and wave both along axis 0), mode 1 at side 12: its running mean
//    over L beats is the slow part and the remainder is the fast part (code/measure/charge-mode's split),
//    whose spectral peak over k is the speed of the propagating mode.
// 3. ISOTROPY. The shear viscosity is a rank-four response. D4's roots make every rank-two and rank-four
//    moment of the lattice isotropic, but the rule has no symmetry beyond the identity (E-FLD-0024), so
//    the viscosity can depend on orientation at rank four, the lowest rank the lattice does not force.
//    nu is measured for three axis orientations (momentum and wave on axes 0 and 1, 2 and 3, 1 and 2) and
//    two diagonal ones (momentum along (1, 1, 0, 0), wave along (1, -1, 0, 0), and the same on axes 2
//    and 3), mode 1 at side 12, and the spread is reported as largest over smallest.
// 4. DRESSING. A lone love and a lone fear against the committed rule's (code/measure/weave-acceptance).
//
// Gates, fixed before the run: under the block the shear decays with a clean exponential window (at least
// 8 points, r2 at least 0.95) at both wavenumbers, the perpendicular invariant breaks, and P drifts by
// zero in every run; under the base the perpendicular invariant holds exactly. The k^2 law, the sound
// speed, the isotropy spread and the dressing are reported as measured, with their thresholds stated in
// the notes, not gated, since which of them this rule meets is the question.
//
// Depth L2: known lattice-gas hydrodynamics measured on a constructed rule, with a control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { type Collision, turningWeave } from '@/code/rule/collision'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { acceptance, cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { decayRateFit } from '@/code/measure/shear-mode'
import { modeLaw } from '@/code/measure/charge-mode'
import { momentumOf } from '@/code/rule/momentum-weave'
import { MOMENTUM_TURN_SPEC, scatterCollision, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import { momentumWaveSeries, momentumWaveStart, perpendicularSlabs, type WaveGeometry } from '@/code/measure/momentum-transport'

const FILL = 0.2
const BIAS = 0.4
const SALT = 7
const BEATS = 96

const SHEAR: WaveGeometry = { momentum: [1, 0, 0, 0], wave: [0, 1, 0, 0] }
const LONGITUDINAL: WaveGeometry = { momentum: [1, 0, 0, 0], wave: [1, 0, 0, 0] }
const ORIENTATIONS: [string, WaveGeometry][] = [
  ['axes01', SHEAR],
  ['axes23', { momentum: [0, 0, 1, 0], wave: [0, 0, 0, 1] }],
  ['axes12', { momentum: [0, 1, 0, 0], wave: [0, 0, 1, 0] }],
  ['diagonal01', { momentum: [1, 1, 0, 0], wave: [1, -1, 0, 0] }],
  ['diagonal23', { momentum: [0, 0, 1, 1], wave: [0, 0, 1, -1] }],
]

const spec = (): ScatterWeaveSpec => {
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: MOMENTUM_TURN_SPEC, opposite: o, forward: f }))

  return { base: MOMENTUM_TURN_SPEC, mirror, sets: scatterSchedule() }
}

type Rules = { scatter: (t: number) => Collision; base: (t: number) => Collision }

const RULES = new Map<number, { mesh: ReturnType<typeof d4Mesh>; rules: Rules }>()

function rulesAt(side: number, weave: ScatterWeaveSpec): { mesh: ReturnType<typeof d4Mesh>; rules: Rules } {
  const known = RULES.get(side)

  if (known) {
    return known
  }

  const mesh = d4Mesh({ side })
  const opposite = meshOpposites(mesh)
  const made = {
    mesh,
    rules: { scatter: scatterCollision({ spec: weave, opposite }), base: colorLocalCollision({ spec: MOMENTUM_TURN_SPEC, opposite }) },
  }

  RULES.set(side, made)

  return made
}

function wave(input: { side: number; mode: number; geometry: WaveGeometry; which: keyof Rules; weave: ScatterWeaveSpec }) {
  const { side, mode, geometry, which, weave } = input
  const { mesh, rules } = rulesAt(side, weave)
  const will = momentumWaveStart({ mesh, side, geometry, mode, fill: FILL, bias: BIAS, salt: SALT })
  const before = perpendicularSlabs({ will, side, geometry })
  const p0 = momentumOf(will.data).p
  const { series, final } = momentumWaveSeries({ will, collision: rules[which], beats: BEATS, side, geometry, mode })
  const after = perpendicularSlabs({ will: final, side, geometry })
  const norm = Math.hypot(...geometry.wave)
  const k = (2 * Math.PI * mode * norm) / side
  const fit = decayRateFit({ series })

  return {
    series,
    k,
    fit,
    nu: fit.gamma / (k * k),
    invariantDelta: Math.max(...after.map((x, i) => Math.abs(x - (before[i] ?? 0)))),
    momentumDrift: Math.max(...momentumOf(final.data).p.map((x, i) => Math.abs(x - (p0[i] ?? 0)))),
  }
}

export default experiment({
  id: 'fluids/scatter-transport',
  code: 'E-FLD-0025',
  title: 'PENDING',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const weave = spec()

    // 1. shear
    const s1 = wave({ side: 12, mode: 1, geometry: SHEAR, which: 'scatter', weave })
    const s2 = wave({ side: 12, mode: 2, geometry: SHEAR, which: 'scatter', weave })
    const s16 = wave({ side: 16, mode: 1, geometry: SHEAR, which: 'scatter', weave })
    const b1 = wave({ side: 12, mode: 1, geometry: SHEAR, which: 'base', weave })
    const b2 = wave({ side: 12, mode: 2, geometry: SHEAR, which: 'base', weave })
    const rateRatio = s2.fit.gamma / s1.fit.gamma
    const baseRatio = b2.fit.gamma / b1.fit.gamma

    // 2. sound
    const sound = (which: keyof Rules) => {
      const run = wave({ side: 12, mode: 1, geometry: LONGITUDINAL, which, weave })
      const start = run.series[0] ?? 1
      const law = modeLaw({ series: run.series.map(x => x / start), window: 12 })

      return { speed: law.fastFrequency / run.k, slowRate: law.slowRate, fastRate: law.fastRate, drift: run.momentumDrift }
    }
    const soundScatter = sound('scatter')
    const soundBase = sound('base')

    // 3. isotropy
    const oriented = ORIENTATIONS.map(([name, geometry]) => ({ name, ...wave({ side: 12, mode: 1, geometry, which: 'scatter', weave }) }))
    const nus = oriented.map(o => o.nu)
    const spread = Math.max(...nus) / Math.min(...nus)

    // 4. dressing
    const scatterBattery = acceptance((o, f) => scatterCollision({ spec: weave, opposite: o, forward: f }))
    const committed = acceptance((o, f) => turningWeave({ opposite: o, forward: f }))

    const runs = [s1, s2, s16, b1, b2, ...oriented]
    const momentumExact = runs.every(r => r.momentumDrift === 0) && soundScatter.drift === 0 && soundBase.drift === 0
    const clean = [s1, s2].every(r => r.fit.points >= 8 && r.fit.r2 >= 0.95)
    const invariantBreaks = s1.invariantDelta > 0 && s2.invariantDelta > 0
    const baseKeepsInvariant = b1.invariantDelta === 0 && b2.invariantDelta === 0

    const ok = momentumExact && clean && invariantBreaks && baseKeepsInvariant

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: 'PENDING',
      metrics: {
        gammaMode1: s1.fit.gamma,
        gammaMode2: s2.fit.gamma,
        r2Mode1: s1.fit.r2,
        r2Mode2: s2.fit.r2,
        pointsMode1: s1.fit.points,
        pointsMode2: s2.fit.points,
        rateRatio,
        nuMode1: s1.nu,
        nuMode2: s2.nu,
        nuSide16: s16.nu,
        gammaSide16: s16.fit.gamma,
        perpendicularInvariantDelta: Math.max(s1.invariantDelta, s2.invariantDelta),
        soundSpeed: soundScatter.speed,
        soundSlowRate: soundScatter.slowRate,
        soundFastRate: soundScatter.fastRate,
        ...Object.fromEntries(oriented.map(o => [`nu_${o.name}`, o.nu])),
        ...Object.fromEntries(oriented.map(o => [`r2_${o.name}`, o.fit.r2])),
        isotropySpread: spread,
        ...Object.fromEntries(scatterBattery.love.periodLargest.map((x, p) => [`loveSupportPeriod${p + 1}`, x])),
        ...Object.fromEntries(scatterBattery.fear.periodLargest.map((x, p) => [`fearSupportPeriod${p + 1}`, x])),
      },
      control: {
        baseGammaMode1: b1.fit.gamma,
        baseGammaMode2: b2.fit.gamma,
        baseR2Mode1: b1.fit.r2,
        baseRateRatio: baseRatio,
        baseNuMode1: b1.nu,
        basePerpendicularInvariantDelta: Math.max(b1.invariantDelta, b2.invariantDelta),
        baseSoundSpeed: soundBase.speed,
        baseSoundSlowRate: soundBase.slowRate,
        ...Object.fromEntries(committed.love.periodLargest.map((x, p) => [`committedLoveSupportPeriod${p + 1}`, x])),
      },
      notes: 'PENDING',
    })
  },
})
