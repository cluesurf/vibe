// Hydrodynamics from the scatter weave: a shorter mean free time, the k^2 law and a constant viscosity,
// and what that costs.
//
// E-FLD-0025 found the scatter weave kinetic: a shear of the particle momentum relaxes at a rate that does
// not depend on wavelength, because only lone tones scatter and only six scatterings are tried a beat. Two
// freedoms of code/rule/scatter-weave shorten the mean free time without touching the vacuum:
// - the condition. 'lone' asks the opposite slots of all four slots to be calm. 'matched' asks the
//   opposite slot of u to be held exactly when that of w is, and of v exactly when that of x is, so a
//   lone tone also scatters against a pair member whose partner line holds a lone tone, and each line's
//   pair or lone state moves with the tone. The vacuum's lines are head-on pairs or wholly calm, so it
//   never matches and keeps its period; the opposite slots are not moved, so the move stays an involution.
// - the density: how many partitions of the 12 lines into scattering quadruples a beat uses, and how many
//   of each quadruple's three disjoint pairs. The scatterings of a sequence then share slots, so the
//   before-stage runs its sequence backward, which keeps reversal and CPT at the base phase exactly.
//
// Members, all on the head-on turn weave: lone {1 partition, 1 pair} (E-FLD-0024 and E-FLD-0025), and
// matched with {1, 1}, {1, 2}, {1, 3}, {2, 1} and {2, 3}. For each: CPT, the vacuum period, both line-graph
// component counts, a lone love's and a lone fear's dressing (side 9, four periods), and a transverse wave
// of P (momentum along axis 0, wave along axis 1, fill 0.2) at L = 12, 16 and 20, mode 1, 60 beats: its
// decay rate Gamma by the exponential window of code/measure/shear-mode and nu = Gamma / k^2.
//
// On the densest member, {2, 3}: the same at L = 24, mode 1, and L = 20, mode 2, the exponent of Gamma
// against k over all five, the relaxation along five orientations at L = 16 (the anisotropy, against the
// 6.1 of E-FLD-0025), and the exact laws with role points (side 3, 48 beats: charge, reversal of vibes,
// roles and flows, color leaks, P and the sum of the line momenta).
//
// Gates, fixed before this run: on {2, 3}, reversal, charge, CPT at the base phase, the vacuum period 24,
// line components no more than the committed 3 and 1, no color leak, P exact, the decay window clean
// (r2 above 0.99 at every size), nu constant to within 10 percent from the largest to the smallest over
// L = 12 to 24, and the exponent within 0.2 of 2. Dressing is not gated; its trade-off with the viscosity
// is the finding, reported member by member against the committed rule's 33, 160, 565, 1,508.
//
// Depth L2: known lattice-gas hydrodynamics reached on a constructed rule, with its cost measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { turningWeave } from '@/code/rule/collision'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { cptMirrorPhase, dressing, lineComponents, vacuumPeriod, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { decayRateFit } from '@/code/measure/shear-mode'
import { linearFit } from '@/code/measure/regression'
import { slopeError } from '@/code/measure/charge-mode'
import { lineMomenta, momentumOf } from '@/code/rule/momentum-weave'
import { type VibeState } from '@/code/rule/vibe-weave'
import {
  HEAD_TURN_SPEC,
  makeScatterWeave,
  scatterBeat,
  scatterBeatBack,
  scatterCollision,
  scatterLeaks,
  scatterSchedule,
  type ScatterCondition,
  type ScatterDensity,
  type ScatterWeaveSpec,
} from '@/code/rule/scatter-weave'
import { momentumWaveSeries, momentumWaveStart, type WaveGeometry } from '@/code/measure/momentum-transport'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const FILL = 0.2
const BIAS = 0.4
const SALT = 7
const BEATS = 60

const SHEAR: WaveGeometry = { momentum: [1, 0, 0, 0], wave: [0, 1, 0, 0] }
const ORIENTATIONS: readonly (readonly [string, WaveGeometry])[] = [
  ['axes01', SHEAR],
  ['axes23', { momentum: [0, 0, 1, 0], wave: [0, 0, 0, 1] }],
  ['axes12', { momentum: [0, 1, 0, 0], wave: [0, 0, 1, 0] }],
  ['diagonal01', { momentum: [1, 1, 0, 0], wave: [1, -1, 0, 0] }],
  ['diagonal23', { momentum: [0, 0, 1, 1], wave: [0, 0, 1, -1] }],
]

type Member = { readonly name: string; readonly condition: ScatterCondition; readonly density: ScatterDensity }

const MEMBERS: readonly Member[] = [
  { name: 'lone11', condition: 'lone', density: { partitions: 1, pairs: 1 } },
  { name: 'matched11', condition: 'matched', density: { partitions: 1, pairs: 1 } },
  { name: 'matched12', condition: 'matched', density: { partitions: 1, pairs: 2 } },
  { name: 'matched13', condition: 'matched', density: { partitions: 1, pairs: 3 } },
  { name: 'matched21', condition: 'matched', density: { partitions: 2, pairs: 1 } },
  { name: 'matched23', condition: 'matched', density: { partitions: 2, pairs: 3 } },
]

function shear(spec: ScatterWeaveSpec, side: number, mode: number, geometry: WaveGeometry = SHEAR) {
  const mesh = d4Mesh({ side })
  const will = momentumWaveStart({ mesh, side, geometry, mode, fill: FILL, bias: BIAS, salt: SALT })
  const p0 = momentumOf(will.data).p
  const { series, final } = momentumWaveSeries({ will, collision: scatterCollision({ spec, opposite: meshOpposites(mesh) }), beats: BEATS, side, geometry, mode })
  const fit = decayRateFit({ series })
  const k = (2 * Math.PI * mode * Math.hypot(...geometry.wave)) / side

  return { side, mode, k, gamma: fit.gamma, r2: fit.r2, points: fit.points, nu: fit.gamma / (k * k), drift: Math.max(...momentumOf(final.data).p.map((x, i) => Math.abs(x - (p0[i] ?? 0)))) }
}

// the exact laws with role points, side 3, 48 beats
function laws(spec: ScatterWeaveSpec) {
  const weave = makeScatterWeave({ side: 3, spec })
  const slots = weave.mesh.cellCount * 24
  const start: VibeState = { vibe: new Int8Array(slots), role: new Int8Array(slots), flow: new Int32Array(slots) }

  for (let i = 0; i < slots; i++) {
    const u = ((i + 1) * GOLDEN * 1.37) % 1

    start.vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
    start.role[i] = Math.floor(((i + 3) * GOLDEN * 1.37 * 9) % 9)
  }

  const charge = (s: VibeState): number => s.vibe.reduce((a, b) => a + b, 0)
  const p0 = momentumOf(start.vibe).p
  const sum0 = lineMomenta(start.vibe, weave.opposite).reduce((a, b) => a + b, 0)

  let s = start
  let leaks = 0
  let chargeKept = true
  let pDrift = 0
  let sumDrift = 0

  for (let t = 0; t < 48; t++) {
    leaks += scatterLeaks(weave, s, t)
    s = scatterBeat(weave, s, t)
    chargeKept = chargeKept && charge(s) === charge(start)
    pDrift = Math.max(pDrift, ...momentumOf(s.vibe).p.map((x, k) => Math.abs(x - (p0[k] ?? 0))))
    sumDrift = Math.max(sumDrift, Math.abs(lineMomenta(s.vibe, weave.opposite).reduce((a, b) => a + b, 0) - sum0))
  }

  for (let t = 47; t >= 0; t--) {
    s = scatterBeatBack(weave, s, t)
  }

  const reverses = s.vibe.every((x, i) => x === start.vibe[i]) && s.role.every((x, i) => x === start.role[i]) && s.flow.every((x, i) => x === start.flow[i])

  return { leaks, chargeKept, pDrift, sumDrift, reverses }
}

export default experiment({
  id: 'fluids/scatter-hydrodynamics',
  code: 'E-FLD-0026',
  title:
    'the scatter weave reaches hydrodynamics when a lone tone may also scatter against a pair member whose partner line holds a lone tone and every beat tries 36 scatterings: a shear of the particle momentum decays as nu k^2 with one viscosity (nu about 0.47, constant to within 10 percent from L = 12 to 24, exponent near 2), with the vacuum period, CPT, reversal, charge, P and local color exact; but no member measured reaches both a constant viscosity and the committed dressing, the dressing growing with every step toward hydrodynamics',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))
    const specOf = (m: Member): ScatterWeaveSpec => ({ base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule(m.density), condition: m.condition })
    const committedRule: ScheduledRule = (o, f) => turningWeave({ opposite: o, forward: f })
    const committedLove = dressing(committedRule, { tone: 1 }).periodLargest
    const committedFear = dressing(committedRule, { tone: -1 }).periodLargest
    const committedVacuum = lineComponents(committedRule, false)
    const committedDense = lineComponents(committedRule, true)

    const measured = MEMBERS.map(m => {
      const spec = specOf(m)
      const rule: ScheduledRule = (o, f) => scatterCollision({ spec, opposite: o, forward: f })
      const runs = [12, 16, 20].map(side => shear(spec, side, 1))
      const nus = runs.map(r => r.nu)

      return {
        member: m,
        spec,
        cpt: cptMirrorPhase(rule),
        vacuum: vacuumPeriod(rule),
        vacuumComponents: lineComponents(rule, false),
        denseComponents: lineComponents(rule, true),
        love: dressing(rule, { tone: 1 }).periodLargest,
        fear: dressing(rule, { tone: -1 }).periodLargest,
        runs,
        nuSpread: Math.max(...nus) / Math.min(...nus),
      }
    })

    const dense = measured.find(x => x.member.name === 'matched23') ?? measured[0]
    const denseSpec = dense?.spec ?? specOf(MEMBERS[0] ?? { name: '', condition: 'lone', density: 'pair' })
    const extra = [shear(denseSpec, 24, 1), shear(denseSpec, 20, 2)]
    const allRuns = [...(dense?.runs ?? []), ...extra]
    const fit = linearFit({ xs: allRuns.map(r => Math.log(r.k)), ys: allRuns.map(r => Math.log(r.gamma)) })
    const exponentError = slopeError(
      allRuns.map(r => Math.log(r.k)),
      allRuns.map(r => Math.log(r.gamma)),
      fit.slope,
      fit.intercept,
    )
    const modeOneRuns = [...(dense?.runs ?? []), extra[0]].filter(r => r !== undefined)
    const nuSpread = Math.max(...modeOneRuns.map(r => r.nu)) / Math.min(...modeOneRuns.map(r => r.nu))
    const oriented = ORIENTATIONS.map(([name, geometry]) => ({ name, ...shear(denseSpec, 16, 1, geometry) }))
    const orientedNus = oriented.map(o => o.nu)
    const anisotropy = Math.max(...orientedNus) / Math.min(...orientedNus)
    const law = laws(denseSpec)

    const loveNoMore = (x: (typeof measured)[number]): boolean => x.love.every((v, p) => v <= (committedLove[p] ?? 0))
    const viscous = (x: (typeof measured)[number]): boolean => x.nuSpread <= 1.1
    const tradeOff = measured.every(x => !(loveNoMore(x) && viscous(x)))

    const ok =
      dense !== undefined &&
      law.reverses &&
      law.chargeKept &&
      law.leaks === 0 &&
      law.pDrift === 0 &&
      dense.cpt === mirror &&
      dense.vacuum === 24 &&
      dense.vacuumComponents <= committedVacuum &&
      dense.denseComponents <= committedDense &&
      allRuns.every(r => r.r2 > 0.99 && r.drift === 0) &&
      nuSpread <= 1.1 &&
      Math.abs(fit.slope - 2) <= 0.2

    const metrics: Record<string, number> = {}

    for (const x of measured) {
      const n = x.member.name

      metrics[`${n}_cpt`] = x.cpt
      metrics[`${n}_vacuumPeriod`] = x.vacuum
      metrics[`${n}_vacuumComponents`] = x.vacuumComponents
      metrics[`${n}_denseComponents`] = x.denseComponents
      x.love.forEach((v, p) => (metrics[`${n}_loveSupportPeriod${p + 1}`] = v))
      x.fear.forEach((v, p) => (metrics[`${n}_fearSupportPeriod${p + 1}`] = v))
      x.runs.forEach(r => {
        metrics[`${n}_gammaL${r.side}`] = r.gamma
        metrics[`${n}_nuL${r.side}`] = r.nu
        metrics[`${n}_r2L${r.side}`] = r.r2
      })
      metrics[`${n}_nuSpread`] = x.nuSpread
      metrics[`${n}_loveNoMoreThanCommitted`] = loveNoMore(x) ? 1 : 0
    }

    extra.forEach(r => {
      metrics[`matched23_gammaL${r.side}M${r.mode}`] = r.gamma
      metrics[`matched23_nuL${r.side}M${r.mode}`] = r.nu
      metrics[`matched23_r2L${r.side}M${r.mode}`] = r.r2
    })
    metrics.exponent = fit.slope
    metrics.exponentError = exponentError
    metrics.nuSpreadL12to24 = nuSpread
    metrics.nuMean = modeOneRuns.reduce((s, r) => s + r.nu, 0) / modeOneRuns.length
    oriented.forEach(o => {
      metrics[`gamma_${o.name}`] = o.gamma
      metrics[`nu_${o.name}`] = o.nu
      metrics[`r2_${o.name}`] = o.r2
    })
    metrics.anisotropy = anisotropy
    metrics.colorLeaks = law.leaks
    metrics.reverses = law.reverses ? 1 : 0
    metrics.chargeKept = law.chargeKept ? 1 : 0
    metrics.momentumDrift = law.pDrift
    metrics.lineSumDrift = law.sumDrift
    metrics.tradeOffHolds = tradeOff ? 1 : 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the densest matched member the exact laws hold (reversal with role points, charge, P, CPT at the base phase, the vacuum period 24, no color leak, line components within the committed ones), the shear decays cleanly at every size, nu is constant to within 10 percent from L = 12 to 24, and the exponent of Gamma against k is within 0.2 of 2. Reported: every member, its dressing, its viscosity spread, and whether any reaches both',
      metrics,
      control: {
        ...Object.fromEntries(committedLove.map((v, p) => [`committedLoveSupportPeriod${p + 1}`, v])),
        ...Object.fromEntries(committedFear.map((v, p) => [`committedFearSupportPeriod${p + 1}`, v])),
        committedVacuumComponents: committedVacuum,
        committedDenseComponents: committedDense,
      },
      notes:
        'L2, exact, no random numbers. What shortens the mean free time is the matched condition, not the density alone: lone tones against lone tones stay kinetic at every density (E-FLD-0025, and lone {1, 1} here), while matched at 36 scatterings a beat makes the shear decay diffusively, nu constant over wavelengths from 12 to 24 docks. The mode-2 point at L = 20 (k = 0.63) sits at the start of the kinetic crossover and is inside the exponent fit. The cost is the dressing: every step toward hydrodynamics spreads a lone tone further, because a gas that relaxes a shear in tens of beats is one in which a disturbance reaches every tone it meets. Among the members measured the trade-off is total (tradeOffHolds): the members that dress no more than the committed rule are the kinetic ones, and the ones nearer a constant viscosity dress more by the fourth period, 1.3 to 6.9 times the committed rule (1,897 to 10,391 against 1,508), the densest, the one viscous member, the most. The viscosity is strongly anisotropic: nu along axes 2 and 3 is a seventh of nu along axes 0 and 1. So a constant viscosity and the committed dressing are not reached together on this base. The sum of the twelve line momenta stays exact as local color forces (E-FLD-0024), so one combination of line momenta never relaxes. The anisotropy is the ratio of the largest to the smallest nu over five orientations at L = 16 (nu = Gamma / k^2, so the diagonal waves, whose k is larger by sqrt 2, compare on the same footing), against 6.1 for the ratio of kinetic rates in E-FLD-0025.',
    })
  },
})
