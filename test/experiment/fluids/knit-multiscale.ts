// The heterogeneous multiscale step: the exact knit where it can run, feeding a lattice Boltzmann equation
// and the Navier-Stokes level it implies on flows too large for the knit.
//
// Three levels, two bridges, each measured as an error against size:
// - level 0, the knit (the scatter weave, integer and exact), on the 4D torus up to L = 24 (331,776 docks);
// - level 1, the linear lattice Boltzmann equation of E-FLD-0030 (code/coarse/knit-boltzmann), whose
//   collision is the knit's own linearized about the product background, run on the reduced lattice of
//   the flow (a plane wave needs L sites, a two-dimensional slice L^2);
// - level 2, the hydrodynamic generator that equation implies (code/coarse/knit-hydrodynamics): the
//   conserved densities' Euler flux C and transport matrix D per direction, read off the equation's slow
//   modes at k0 = 0.005, with no knit input and no fit.
//
// FLOWS, each a momentum field g on a reduced lattice made into a knit start by momentumFieldStart (a
// hashed background, lone carriers along g with probability min(1, |e . g|)), amplitude 0.4:
// - shear01 (pair clock): g = (0.4 sin(2 pi y / L), 0, 0, 0), y = r1; the E-FLD-0026 shear;
// - shear23 (pair clock): g along axis 2 varying along r3, the orientation E-FLD-0030 found overlapping
//   the slab invariant S - P0 - P1 - P2, so part of it should never decay;
// - taylorGreen (pair clock): the Taylor-Green vortex in the (r0, r1) slice,
//   g = 0.4 (cos(k r0) sin(k r1), -sin(k r0) cos(k r1), 0, 0), on the L^2 lattice of the slice;
// - sound (flip rule, fill 0.2): g = (0.4 sin(2 pi x / L), 0, 0, 0), x = r0, the E-FLD-0027 wave.
// The pair-clock flows start on the background the knit relaxes to (fill 2/3, every slot a third each),
// the flip flow at fill 0.2, the flip equation linearized about the mean occupation of the start's
// expectation.
//
// BRIDGE 1, knit to lattice Boltzmann, at L = 8, 12, 16, 20 and 24. The equation starts from the knit
// start's own averaged one-body field on the reduced lattice (oneBodyField), the exact coarse initial
// condition, and both run the same beats (48 on the pair clock, 96 for sound). The observable is the
// flow's pattern amplitude (the projection of the momentum profiles on the start's shape). The error is
// the largest difference of the two amplitudes over the run, in units of the start amplitude. The
// knit's own noise on that amplitude falls roughly as 1 / L^2, so what is left at large L is the error
// of the coarse description.
//
// BRIDGE 2, lattice Boltzmann to hydrodynamics, at L = 24, 48, 96, 192 and 384 (the vortex at 24, 48 and
// 96): the equation from the start's expectation, against the generator from the same initial densities.
// A pair-clock flow runs L^2 / 20 beats (about one e-folding of the shear), the sound wave 3 L (about two
// periods). Error: the largest difference of the normalized amplitudes. It should fall with L (the
// generator is exact to order k^2, the initial layer is order k).
//
// Gates, fixed before any of this ran:
// - B1: at L = 16, 20 and 24 the bridge-1 error is at most 0.05 for shear01, taylorGreen and sound, and
//   for shear23 the knit's and the equation's amplitudes at the last beat differ by at most 0.05;
// - B2: for shear01, taylorGreen and sound the bridge-2 error is at most 0.02 at the largest size and
//   smaller there than at L = 24.
// Reported, not gated: the errors at every size, the shear23 plateau against shear01, and the cost of a
// knit beat against an equation beat.
//
// Depth L2: the classical kinetic and hydrodynamic reductions of a lattice gas, chained and validated on
// a constructed rule, the exact micro level feeding the coarse ones.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { makeWill } from '@/code/tone/will'
import { colorLocalCollision, type ColorLocalSpec } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { FLIP_TABLE } from '@/code/rule/momentum-weave'
import { HEAD_TURN_SPEC, scatterCollision, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import {
  CHARGE_VECTOR,
  COUNT_VECTOR,
  LINE_SUM_VECTOR,
  deviationOf,
  linearBoltzmannRun,
  linearizedSchedule,
  momentumVector,
  oneBodyField,
  reducedCoordinates,
  reducedSiteCount,
  uniformBackground,
  type ReducedLattice,
} from '@/code/coarse/knit-boltzmann'
import {
  hydrodynamicEvolve,
  hydrodynamicGenerator,
  momentumFieldExpectation,
  momentumFieldStart,
  patternAmplitude,
  waveAmplitudes,
  type Hydrodynamics,
} from '@/code/coarse/knit-hydrodynamics'

const SAMPLES = 400000
const SALTS = [11, 29]
const AMPLITUDE = 0.4
const START_SALT = 7
const KNIT_SIDES = [8, 12, 16, 20, 24]
const LARGE_SIDES = [24, 48, 96, 192, 384]
const VORTEX_SIDES = [24, 48, 96]
const K0 = 0.005
const OPPOSITE = rootsD4().map((r, _, all) => all.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))
const FLIP_BASE: ColorLocalSpec = { ...HEAD_TURN_SPEC, tables: [FLIP_TABLE] }

type Flow = {
  readonly name: string
  readonly rule: 'clock' | 'flip'
  readonly fill: number
  // the reduced lattice's projections
  readonly axes: readonly (readonly number[])[]
  // the momentum field at reduced coordinates, for a side
  readonly field: (coords: readonly number[], side: number) => readonly number[]
  // the pattern: momentum component and shape at reduced coordinates
  readonly pattern: readonly { readonly axis: number; readonly shape: (coords: readonly number[], side: number) => number }[]
  // the waves (in reduced coordinates) the flow lives on, for the hydrodynamic level
  readonly waves: readonly (readonly number[])[]
  readonly knitBeats: number
}

const wave = (c: number, side: number): number => (2 * Math.PI * c) / side

const FLOWS: readonly Flow[] = [
  {
    name: 'shear01',
    rule: 'clock',
    fill: 2 / 3,
    axes: [[0, 1, 0, 0]],
    field: ([y = 0], side) => [AMPLITUDE * Math.sin(wave(y, side)), 0, 0, 0],
    pattern: [{ axis: 0, shape: ([y = 0], side) => Math.sin(wave(y, side)) }],
    waves: [[1]],
    knitBeats: 48,
  },
  {
    name: 'shear23',
    rule: 'clock',
    fill: 2 / 3,
    axes: [[0, 0, 0, 1]],
    field: ([y = 0], side) => [0, 0, AMPLITUDE * Math.sin(wave(y, side)), 0],
    pattern: [{ axis: 2, shape: ([y = 0], side) => Math.sin(wave(y, side)) }],
    waves: [[1]],
    knitBeats: 48,
  },
  {
    name: 'taylorGreen',
    rule: 'clock',
    fill: 2 / 3,
    axes: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
    ],
    field: ([x = 0, y = 0], side) => [AMPLITUDE * Math.cos(wave(x, side)) * Math.sin(wave(y, side)), -AMPLITUDE * Math.sin(wave(x, side)) * Math.cos(wave(y, side)), 0, 0],
    pattern: [
      { axis: 0, shape: ([x = 0, y = 0], side) => Math.cos(wave(x, side)) * Math.sin(wave(y, side)) },
      { axis: 1, shape: ([x = 0, y = 0], side) => -Math.sin(wave(x, side)) * Math.cos(wave(y, side)) },
    ],
    waves: [
      [1, 1],
      [1, -1],
    ],
    knitBeats: 48,
  },
  {
    name: 'sound',
    rule: 'flip',
    fill: 0.2,
    axes: [[1, 0, 0, 0]],
    field: ([x = 0], side) => [AMPLITUDE * Math.sin(wave(x, side)), 0, 0, 0],
    pattern: [{ axis: 0, shape: ([x = 0], side) => Math.sin(wave(x, side)) }],
    waves: [[1]],
    knitBeats: 96,
  },
]

const AXIS_VECTORS = [0, 1, 2, 3].map(a => momentumVector([0, 1, 2, 3].map(i => (i === a ? 1 : 0))))

function specOf(base: ColorLocalSpec): ScatterWeaveSpec {
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: base, opposite: o, forward: f }))

  return { base, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
}

function operator(spec: ScatterWeaveSpec, occupation: number): Float64Array[] {
  const rule = scatterCollision({ spec, opposite: OPPOSITE })
  const [a, b] = SALTS.map(salt => linearizedSchedule({ rule, period: 24, background: uniformBackground(occupation), samples: SAMPLES, salt }))

  return (a ?? []).map((m, t) => m.map((v, i) => (v + (b?.[t]?.[i] ?? 0)) / 2))
}

function patternOf(flow: Flow, lattice: ReducedLattice) {
  const sites = reducedSiteCount(lattice)

  return flow.pattern.map(p => ({
    left: AXIS_VECTORS[p.axis] ?? CHARGE_VECTOR,
    shape: Float64Array.from({ length: sites }, (_, s) => p.shape(reducedCoordinates(lattice, s), lattice.side)),
  }))
}

// bridge 1: the knit and the equation from the knit start's own coarse field
function bridgeOne(flow: Flow, spec: ScatterWeaveSpec, matrices: readonly Float64Array[], background: Float64Array, side: number) {
  const mesh = d4Mesh({ side })
  const lattice: ReducedLattice = { side, axes: flow.axes }
  const pattern = patternOf(flow, lattice)
  const will = momentumFieldStart({ mesh, side, lattice, field: c => flow.field(c, side), fill: flow.fill, salt: START_SALT })
  const collision = scatterCollision({ spec, opposite: meshOpposites(mesh) })
  const table = streamSourceTable(mesh)
  const knit: number[] = []

  let current = { mesh, data: will.data.slice() }
  let scratch = makeWill(mesh)
  let started = Date.now()

  knit.push(patternAmplitude(oneBodyField({ data: current.data, side, lattice }), pattern))

  for (let t = 0; t < flow.knitBeats; t++) {
    beatInto({ src: current, dst: scratch, table, collision: collision(t) })
    ;[current, scratch] = [scratch, current]
    knit.push(patternAmplitude(oneBodyField({ data: current.data, side, lattice }), pattern))
  }

  const knitSeconds = (Date.now() - started) / 1000
  const equation: number[] = []

  started = Date.now()
  linearBoltzmannRun({
    lattice,
    matrices,
    start: deviationOf(oneBodyField({ data: will.data, side, lattice }), background),
    beats: flow.knitBeats,
    observe: field => equation.push(patternAmplitude(field, pattern)),
  })

  const equationSeconds = (Date.now() - started) / 1000
  const a0 = Math.abs(knit[0] ?? 1)
  const error = Math.max(...knit.map((a, t) => Math.abs(a - (equation[t] ?? 0)))) / a0

  return {
    side,
    error,
    knitLast: (knit[knit.length - 1] ?? 0) / (knit[0] ?? 1),
    equationLast: (equation[equation.length - 1] ?? 0) / (equation[0] ?? 1),
    knitSeconds,
    equationSeconds,
  }
}

// bridge 2: the equation from the start's expectation against the hydrodynamic generator
function bridgeTwo(flow: Flow, matrices: readonly Float64Array[], background: Float64Array, generators: readonly Hydrodynamics[], side: number) {
  const lattice: ReducedLattice = { side, axes: flow.axes }
  const pattern = patternOf(flow, lattice)
  const start = deviationOf(momentumFieldExpectation({ lattice, field: c => flow.field(c, side), fill: flow.fill, opposite: OPPOSITE }), background)
  const beats = flow.rule === 'clock' ? Math.round((side * side) / 20) : 3 * side
  const equation: number[] = []

  linearBoltzmannRun({ lattice, matrices, start, beats, observe: field => equation.push(patternAmplitude(field, pattern)) })

  // the hydrodynamic level: every wave's densities evolved by its generator, the profiles rebuilt and
  // projected on the same pattern
  const lefts = generators[0]?.lefts ?? []
  const amplitudes = flow.waves.map(w => waveAmplitudes({ field: start, lattice, lefts, wave: w }))
  const sites = reducedSiteCount(lattice)
  const phases = flow.waves.map(w => Float64Array.from({ length: sites }, (_, s) => (2 * Math.PI * w.reduce((a, x, j) => a + x * (reducedCoordinates(lattice, s)[j] ?? 0), 0)) / side))
  const ks = flow.waves.map(w => (2 * Math.PI * Math.hypot(...w)) / side)
  const hydro: number[] = []

  for (let t = 0; t <= beats; t++) {
    // rebuild each density's profile from its waves, then project the momentum profiles on the pattern
    const profiles = lefts.map(() => new Float64Array(sites))

    flow.waves.forEach((_, i) => {
      const z = hydrodynamicEvolve(generators[i] ?? (generators[0] as Hydrodynamics), ks[i] ?? 0, t, amplitudes[i] ?? { re: [], im: [] })

      lefts.forEach((__, q) => {
        const profile = profiles[q] ?? new Float64Array(sites)

        for (let s = 0; s < sites; s++) {
          const phi = phases[i]?.[s] ?? 0

          profile[s] = (profile[s] ?? 0) + (z.re[q] ?? 0) * Math.cos(phi) - (z.im[q] ?? 0) * Math.sin(phi)
        }
      })
    })

    hydro.push(momentumPatternOf(profiles, generators[0]?.names ?? [], flow.pattern.map(p => p.axis), pattern))
  }

  const e0 = equation[0] ?? 1
  const h0 = hydro[0] ?? 1
  const error = Math.max(...equation.map((a, t) => Math.abs(a / e0 - (hydro[t] ?? 0) / h0)))

  return { side, beats, error, equationLast: (equation[equation.length - 1] ?? 0) / e0, hydroLast: (hydro[hydro.length - 1] ?? 0) / h0 }
}

// the pattern amplitude from density profiles directly
function momentumPatternOf(profiles: readonly Float64Array[], names: readonly string[], axes: readonly number[], pattern: readonly { shape: Float64Array }[]): number {
  let num = 0
  let den = 0

  axes.forEach((axis, i) => {
    const rho = profiles[names.indexOf(`p${axis}`)] ?? new Float64Array(0)
    const shape = pattern[i]?.shape ?? new Float64Array(0)

    for (let s = 0; s < shape.length; s++) {
      num += (rho[s] ?? 0) * (shape[s] ?? 0)
      den += (shape[s] ?? 0) ** 2
    }
  })

  return den > 0 ? num / den : 0
}

export default experiment({
  id: 'fluids/knit-multiscale',
  code: 'E-FLD-0031',
  title:
    'the knit, its lattice Boltzmann equation and the hydrodynamics that equation implies agree flow by flow: a shear, a Taylor-Green vortex and a sound wave on the exact knit at L = 16 to 24 are followed beat for beat by the equation from the knit start own coarse field to within 0.005 to 0.029 of the start amplitude, and on flows up to L = 384 the Navier-Stokes level read off the equation slow modes follows the equation with an error falling as L^-2 (0.036 to 0.00016 for the shear, 0.116 to 0.0018 for sound); a P2 wave along axis 3 keeps 0.80 of itself forever through the slab invariant, which both coarse levels carry',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const clock = specOf(HEAD_TURN_SPEC)
    const flip = specOf(FLIP_BASE)
    const soundFlow = FLOWS.find(f => f.rule === 'flip') ?? (FLOWS[0] as Flow)
    const flipLattice: ReducedLattice = { side: 24, axes: soundFlow.axes }
    const flipExpectation = momentumFieldExpectation({ lattice: flipLattice, field: c => soundFlow.field(c, 24), fill: soundFlow.fill, opposite: OPPOSITE })
    const flipOccupation = flipExpectation.reduce((s, v) => s + v, 0) / (flipExpectation.length / 2)
    const operators = { clock: operator(clock, 2 / 3), flip: operator(flip, flipOccupation) }
    const backgrounds = { clock: uniformBackground(2 / 3), flip: uniformBackground(flipOccupation) }
    const densities = (rule: 'clock' | 'flip'): Record<string, Float64Array> => ({
      charge: CHARGE_VECTOR,
      p0: AXIS_VECTORS[0] ?? CHARGE_VECTOR,
      p1: AXIS_VECTORS[1] ?? CHARGE_VECTOR,
      p2: AXIS_VECTORS[2] ?? CHARGE_VECTOR,
      p3: AXIS_VECTORS[3] ?? CHARGE_VECTOR,
      line: LINE_SUM_VECTOR,
      ...(rule === 'flip' ? { count: COUNT_VECTOR } : {}),
    })

    const metrics: Record<string, number> = { flipOccupation }
    const results = FLOWS.map(flow => {
      const spec = flow.rule === 'clock' ? clock : flip
      const matrices = operators[flow.rule]
      const background = backgrounds[flow.rule]
      // the generator of each wave's direction, the reduced wave mapped back to a 4D direction
      const generators = flow.waves.map(w =>
        hydrodynamicGenerator({
          matrices,
          direction: [0, 1, 2, 3].map(k => flow.axes.reduce((s, axis, j) => s + (axis[k] ?? 0) * (w[j] ?? 0), 0)),
          k0: K0,
          densities: densities(flow.rule),
        }),
      )
      const one = KNIT_SIDES.map(side => bridgeOne(flow, spec, matrices, background, side))
      const two = (flow.name === 'taylorGreen' ? VORTEX_SIDES : LARGE_SIDES).map(side => bridgeTwo(flow, matrices, background, generators, side))

      one.forEach(r => {
        metrics[`${flow.name}_knitVsEquationErrorL${r.side}`] = r.error
        metrics[`${flow.name}_knitLastL${r.side}`] = r.knitLast
        metrics[`${flow.name}_equationLastL${r.side}`] = r.equationLast
      })
      two.forEach(r => {
        metrics[`${flow.name}_equationVsHydroErrorL${r.side}`] = r.error
        metrics[`${flow.name}_equationLastBigL${r.side}`] = r.equationLast
        metrics[`${flow.name}_hydroLastBigL${r.side}`] = r.hydroLast
      })

      const big = one.find(r => r.side === 24)

      metrics[`${flow.name}_knitSecondsL24`] = big?.knitSeconds ?? 0
      metrics[`${flow.name}_equationSecondsL24`] = big?.equationSeconds ?? 0

      return { flow, one, two }
    })

    const gated = results.filter(r => r.flow.name !== 'shear23')
    const shear23 = results.find(r => r.flow.name === 'shear23')
    const b1 =
      gated.every(r => r.one.filter(x => x.side >= 16).every(x => x.error <= 0.05)) &&
      (shear23?.one.filter(x => x.side >= 16).every(x => Math.abs(x.knitLast - x.equationLast) <= 0.05) ?? false)
    const b2 = gated.every(r => {
      const last = r.two[r.two.length - 1]
      const first = r.two[0]

      return last !== undefined && first !== undefined && last.error <= 0.02 && last.error < first.error
    })

    metrics.b1KnitToEquation = b1 ? 1 : 0
    metrics.b2EquationToHydro = b2 ? 1 : 0

    return verdict({
      status: b1 && b2 ? 'pass' : 'fail',
      claim:
        'at L = 16, 20 and 24 the lattice Boltzmann equation started from the knit start own coarse field follows the knit shear, Taylor-Green vortex and sound wave to within 0.05 of the start amplitude at every beat, and the shear23 end point to 0.05; on flows up to L = 384 the Navier-Stokes level read off the equation slow modes follows the equation to 0.02 at the largest size, better than at L = 24',
      metrics,
      notes:
        'L2. Bridge 1 (knit to equation, largest gap over the run in units of the start amplitude, L = 8, 12, 16, 20, 24): shear01 0.029, 0.014, 0.008, 0.005, 0.010; Taylor-Green 0.032, 0.020, 0.014, 0.013, 0.019; sound 0.029, 0.023, 0.029, 0.026, 0.027; shear23 0.034, 0.016, 0.020, 0.019, 0.022. The gap falls from L = 8 (where the knit noise on the amplitude is largest) and then levels at 0.01 to 0.03: what is left is the coarse description, the linear equation against a knit started at bias 0.4 from lone carriers. Bridge 2 (equation to hydrodynamics, L = 24, 48, 96, 192, 384): shear01 0.036, 0.010, 0.0026, 0.00065, 0.00016, falling as L^-2 (a factor 4 per doubling, the k^2 order of the Chapman-Enskog truncation); shear23 0.0096 to 0.00005, the same law; Taylor-Green 0.012, 0.0050, 0.0016 (L = 24 to 96); sound 0.116, 0.056, 0.022, 0.0067, 0.0018, slower at first (the Burnett dispersion of the speed, 0.83 at L = 12 against 0.71 at k = 0) then L^-2. THE PLATEAU. shear23, a P2 wave along axis 3, overlaps the slab invariant S - P0 - P1 - P2 of E-FLD-0030: on the knit it still holds 0.67 of its amplitude after 48 beats at L = 24 where shear01 holds 0.22, and the equation, which carries the invariant, holds 0.69; on large flows the equation and the hydrodynamic level both settle at 0.798 of the start, the part of the wave the invariant keeps forever. So the seventh of E-FLD-0026 for the axes-23 orientation is a plateau read as a slow rate. COST. At L = 24 a knit beat of a whole 4D flow takes about 0.5 s (48 beats in 25 s), the equation on the flow reduced lattice under 3 ms a beat, the hydrodynamic level a matrix exponential per wave. The knit is exact, the equation carries 1 to 3 percent of the start amplitude of error on these flows, and hydrodynamics adds an error that vanishes as L^-2.',
    })
  },
})
