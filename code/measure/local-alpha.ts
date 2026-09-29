// Alpha read in LOCAL units at a uniform depth (E-FRC-0256), on the spanned light (code/rule/depth-span-light) and,
// for contrast, the unchanged clock-only light (code/rule/trit-husk-shaped). Real numbers live here only; the rules
// hold integers. Starts built from reals are CONSTRUCTION, disclosed as such.
//
// THE COULOMB PHASE. Matter reads the light through E-FRC-0252's Peierls hop, zeta_(4D)^(-q A) on an axis link's
// angle A: one unit of angle is kappa = 2 pi / (4D) radians of matter phase per unit charge. A static field makes the
// angle grow (E on the unchanged light, E / Q on the spanned one, E-FRC-0254), so a charge's lattice momentum grows at
// kappa times the growth, and moving it along a path costs kappa times the growth's line integral: the Coulomb energy
// as a matter FREQUENCY (radians per beat), with no energy unit and no hbar chosen. For a +1, -1 pair at separation r
// on the x axis, the pair's energy over the coincident pair is
//   Omega(r) = kappa Phi(r) / 2,   Phi(r) = sum over the x-links (x, 0, 0), x = 0 .. r - 1, of the angle's growth
// with the uniform (harmonic) part removed: on the torus a string winds a uniform flux that no potential removes, and
// since the flux is S - C^T U and C^T U has no harmonic part, the harmonic flux is the strings' own, exactly the same
// on every beat, so its growth is subtracted exactly (code/measure/span-coulomb harmonicPart).
//
// THE LOCAL UNITS, each read off a run of the matter that sits at the depth (code/rule/depth-clock-wave: the 'span'
// form beside the spanned light, the 'clock' form beside the unchanged one, each built so its waves run at its light's
// speed):
//   clock    the rest rate omega_0 of a uniform lump (code/measure/depth-arena restRate)
//   ruler    the lump's Compton length lambda = c_m / omega_0, c_m its long-wave speed read from a standing mode of
//            wavenumber k = 2 pi / MODE_BOX: c_m^2 = (omega_k^2 - omega_0^2) / k^2
//   action   one radian of matter phase: the hop's root of unity zeta_M holds phase as a count, the same at every depth
//   c        the light's long-wave speed (2 / (q sqrt 3) spanned, 2 / sqrt(3 q) unchanged; measured by E-GRV-0092 at
//            1.00037 of the first and q^(-0.4992) for the second) on the local clock and ruler: c / (lambda omega_0)
// and then, with the torus's exact husk Green's difference G(0) - G(r) (code/measure/trit-hop-light), whose long-range
// form is 1 / (24 pi r),
//   alpha_local(r) = E_local / (c_local 24 pi (G(0) - G(r)) lambda),   E_local = Omega(r) / omega_0
// which is alpha = E r / (hbar c) with the lattice Green's function in place of 1 / r.
//
// DETERMINISM: every start is placed; nothing is drawn.

import { makeHuskEngine } from '@/code/rule/trit-husk'
import {
  copyShaped,
  emptyShaped,
  makeShapedScratch,
  shapedArrays,
  shapedBeat,
  shapedBeatBack,
  type ShapedState,
} from '@/code/rule/trit-husk-shaped'
import {
  fieldNumerators,
  makeFieldScratch,
  makeMatter,
} from '@/code/rule/trit-kinetic'
import { huskGreenDifference } from '@/code/measure/trit-hop-light'
import {
  addStringPath,
  huskGaussFailures,
  relaxStart,
} from '@/code/measure/trit-kinetic-light'
import { noWraps } from '@/code/measure/varying-depth-light'
import {
  harmonicPart,
  makeSpanShadowScratch,
  spanGaussFailures,
  spanRelaxStart,
  spanShadow,
  stringCharge,
} from '@/code/measure/span-coulomb'
import {
  copySpan,
  emptySpan,
  makeMetricSpanMedium,
  makeSpanMedium,
  makeSpanScratch,
  sameSpan,
  spanBeat,
  spanBeatBack,
} from '@/code/rule/depth-span-light'
import { restRate } from '@/code/measure/depth-arena'
import {
  clockWaveBeat,
  clockWaveBeatBack,
  clockWaveFrom,
  clockWaveRule,
  emptyClockWave,
  sameClockWave,
  type WaveForm,
} from '@/code/rule/depth-clock-wave'
import { radionMesh } from '@/code/rule/trit-radion'
import { RADION_DEPTH } from '@/code/measure/radion'

export type LightKind = 'span' | 'clock'

// ---------------------------------------------------------------------------------------------------------
// E-FRC-0256's settings. Fixed before the gated run

export const LOCAL_SIDE = 8
export const LOCAL_DEPTHS: readonly number[] = [4, 8, 16, 32]
export const LOCAL_SEPARATIONS: readonly number[] = [2, 3, 4]
export const LOCAL_BEATS = 256
export const LOCAL_LEVELS = 3
// the matter: rest term, amplitude, beats, and the standing mode's box (k = 2 pi / MODE_BOX)
export const LOCAL_REST_TERM = 3
export const LOCAL_AMP = 100000
export const LOCAL_REST_BEATS = 8192
export const LOCAL_MODE_BOX = 16
// the gates' tolerances: the spread a flat alpha may show (ten times the largest D-dependent reading error the probe
// and E-FRC-0254 found, 3.2e-5), the unchanged light's agreement with its closed form, and the local units' exponents
export const FLAT_TOLERANCE = 1e-3
export const CONTROL_TOLERANCE = 1e-3
export const EXPONENT_TOLERANCE = 0.02
// the unchanged light is hot at D 4 (E-FRC-0252, 0254; this experiment's probe: its growth off by -2.8 at three
// levels, -0.62 at five), so its gate reads from this depth up; its reversal and Gauss are gated at every depth
export const CONTROL_FROM = 8

// the Peierls coupling: radians of matter phase per unit of angle, per unit charge
export const peierlsPhase = (depth: number): number =>
  (2 * Math.PI) / (4 * depth)

// the light's long-wave speed (the linear symbol's; E-GRV-0092 measured the spanned one at 1.00037 of it)
export const lightSpeed = (light: LightKind, depth: number): number => {
  const q = 2 * depth + 1

  return light === 'span'
    ? 2 / (q * Math.sqrt(3))
    : 2 / Math.sqrt(3 * q)
}

// the closed forms the header of E-FRC-0256 derives: alpha = kappa K / (24 pi c) with K = 2 / Q the growth potential
// per unit of G(0) - G(r) (the axis flux is 2 grad phi, and a pair doubles it)
// `resolution` is the depth that sets the angle's window and so the Peierls root (code/rule/depth-span-light,
// fixed resolution); it is `depth` on both lights of E-FRC-0256
export const alphaClosed = (
  light: LightKind,
  depth: number,
  resolution = depth,
): number => {
  const q = 2 * depth + 1
  const k = light === 'span' ? 2 / q : 2

  return (
    (peierlsPhase(resolution) * k) /
    (24 * Math.PI * lightSpeed(light, depth))
  )
}

export type PairReading = {
  light: LightKind
  // the metric depth (the divisors) and the resolution depth (the windows and the Peierls root)
  depth: number
  resolution: number
  r: number
  // Phi(r): the measured line integral of the angle's growth, harmonic part removed; and the static field's line
  // integral over the growth divisor, its expected value
  phi: number
  phiStatic: number
  // the pair's field energy in the light's own invariant (E^2 weighted w / (4 Q), Q = 1 on the unchanged light)
  energy: number
  gauss: number
  // the spanned rule's own wrap count (angle, field, potential; not counted on the unchanged light), and the beats
  // on which a line link's integer angle crossed its window, followed by the reading
  wraps: number
  turns: number
  reversed: boolean
  residual: number
  green: number
}

// the pair +1 at the origin, -1 at (r, 0, 0), relaxed to its static field, run LOCAL_BEATS forward and back. On the
// spanned light a given `resolution` runs the fixed-resolution medium (makeMetricSpanMedium: windows of D0 =
// resolution, the divisors of the metric depth), even where the two are equal; the unchanged light has one depth only
export function pairReading(
  light: LightKind,
  depth: number,
  r: number,
  levels = LOCAL_LEVELS,
  fixedResolution?: number,
): PairReading {
  const resolution = fixedResolution ?? depth

  const side = LOCAL_SIDE
  const beats = LOCAL_BEATS
  const green = huskGreenDifference(side, [r, 0, 0])
  const line = Array.from({ length: r }, (_, x) => x * 9)
  const place = (
    s: ShapedState,
    g: Parameters<typeof addStringPath>[1],
  ): void => addStringPath(s, g, [0, 0, 0], [r, 0, 0], 1)

  if (light === 'clock' && fixedResolution !== undefined) {
    throw new Error(
      'the unchanged light has one depth: its windows and its divisor are one count',
    )
  }

  if (light === 'span') {
    const m =
      fixedResolution === undefined
        ? makeSpanMedium([side, side, side], () => depth)
        : makeMetricSpanMedium(
            [side, side, side],
            fixedResolution,
            () => depth,
          )
    const g = m.geometry
    const s = emptySpan(m, levels)

    place(s, g)

    const relaxed = spanRelaxStart(m, s)
    const start = copySpan(s)
    const rho = stringCharge(m, s)
    const scratch = makeSpanScratch(m, levels)
    const w = makeSpanShadowScratch(m)
    const angle = new Float64Array(g.huskLinks)
    const flux = new Float64Array(g.huskLinks)
    const wraps = noWraps()
    const unwrapped = new Unwrap(m.linkWindow, line, s.angle)

    let gauss = spanGaussFailures(m, s, rho, w.flux)

    for (let t = 1; t <= beats; t++) {
      spanBeat(m, s, scratch, levels, wraps)
      gauss += spanGaussFailures(m, s, rho, w.flux)
      unwrapped.take(s.angle)
    }

    spanShadow(m, s, w, angle, flux)

    let phi = 0
    let phiStatic = 0
    let energy = 0

    line.forEach((l, i) => {
      phi +=
        (unwrapped.total[i]! + angle[l]! - s.angle[l]!) / beats -
        relaxed.harmonic[l]! / m.span[l]!
      phiStatic += relaxed.long[l]! / m.span[l]!
    })

    for (let t = 0; t < beats; t++) {
      spanBeatBack(m, s, scratch, levels)
    }

    for (let l = 0; l < g.huskLinks; l++) {
      energy +=
        ((g.weight[l % 9]! / 4) * relaxed.long[l]! ** 2) / m.span[l]!
    }

    return {
      light,
      depth,
      resolution,
      r,
      phi,
      phiStatic,
      energy,
      gauss,
      wraps: wraps.angle + wraps.field + wraps.potential,
      turns: unwrapped.turns,
      reversed: sameSpan(s, start),
      residual: relaxed.residual,
      green,
    }
  }

  const m = makeSpanMedium([side, side, side], () => depth)
  const g = m.geometry
  const e = makeHuskEngine(g, depth)
  const o = emptyShaped(g, levels)
  const options = { levels, cyclic: false }
  const q = 2 * depth + 1

  place(o, g)

  const matter = makeMatter({
    mass: 1,
    charges: [
      { charge: 1, moving: false, dock: [0, 0, 0] },
      { charge: -1, moving: false, dock: [r, 0, 0] },
    ],
  })
  const harmonic = harmonicPart(g, o.string)
  const relaxed = relaxStart(e, o, matter, harmonic)
  const start = shapedArrays(copyShaped(o))
  const scratch = makeShapedScratch(g, levels)
  const f = makeFieldScratch(e)
  const flux = new Int32Array(g.huskLinks)
  const unwrapped = new Unwrap(m.linkWindow, line, o.angle)

  let gauss = huskGaussFailures(e, o, matter, false, flux)

  for (let t = 1; t <= beats; t++) {
    shapedBeat(e, o, scratch, options)
    gauss += huskGaussFailures(e, o, matter, false, flux)
    unwrapped.take(o.angle)
  }

  fieldNumerators(e, o, options, f)

  let phi = 0
  let phiStatic = 0
  let energy = 0

  line.forEach((l, i) => {
    phi +=
      (unwrapped.total[i]! + f.aShift[l]! / q ** levels) / beats -
      harmonic[l]!
    phiStatic += relaxed.field[l]! - harmonic[l]!
  })

  for (let t = 0; t < beats; t++) {
    shapedBeatBack(e, o, scratch, options)
  }

  const end = shapedArrays(o)
  const reversed = end.every((x, k) =>
    x.every((v, i) => v === start[k]![i]),
  )

  for (let l = 0; l < g.huskLinks; l++) {
    energy +=
      (g.weight[l % 9]! / 4) * (relaxed.field[l]! - harmonic[l]!) ** 2
  }

  return {
    light,
    depth,
    resolution,
    r,
    phi,
    phiStatic,
    energy,
    gauss,
    wraps: 0,
    turns: unwrapped.turns,
    reversed,
    residual: relaxed.residual,
    green,
  }
}

// the integer angle on a set of links followed through its compact window: each beat's change is read centered in
// the link's window (the angle is a cycling number, E-FRC-0244's compact U(1)), and summed. `turns` counts the beats
// on which a link's angle crossed its window's edge (on the spanned light the rule's own wrap counter counts these)
class Unwrap {
  readonly total: Float64Array
  turns = 0
  private readonly last: Int32Array

  constructor(
    private readonly window: Int32Array,
    private readonly links: readonly number[],
    angle: Int32Array,
  ) {
    this.total = new Float64Array(links.length)
    this.last = Int32Array.from(links, l => angle[l]!)
  }

  take(angle: Int32Array): void {
    this.links.forEach((l, i) => {
      const n = this.window[l]!
      const raw = angle[l]! - this.last[i]!
      const step = ((((raw + n / 2) % n) + n) % n) - n / 2

      if (step !== raw) {
        this.turns++
      }

      this.total[i] = this.total[i]! + step
      this.last[i] = angle[l]!
    })
  }
}

// the frequency of a standing mode X = amp cos(2 pi n x / box), uniform in y and z, at rest: upward zero crossings
// of X at x = 0 (placed linearly between beats) over `beats`, 2 pi over their mean spacing; and the reversal
export function modeRate(
  depth: number,
  m: number,
  amp: number,
  beats: number,
  form: WaveForm,
  box: number,
  n: number,
): { rate: number; reversed: boolean } {
  const mesh = radionMesh([box, 2, 2])
  const rule = clockWaveRule(mesh, () => depth, m, form, RADION_DEPTH)
  const s = emptyClockWave(mesh)

  for (let y = 0; y < mesh.docks; y++) {
    const v = Math.floor(
      amp * Math.cos((2 * Math.PI * n * (y % box)) / box),
    )

    s.now[y] = v
    s.lag[y] = v
  }

  const start = clockWaveFrom(s)
  const lap = new Int32Array(mesh.docks)
  const ups: number[] = []

  let before = s.now[0]!

  for (let t = 1; t <= beats; t++) {
    clockWaveBeat(mesh, rule, s, lap)

    const now = s.now[0]!

    if (before < 0 && now >= 0) {
      ups.push(t - 1 + -before / (now - before))
    }

    before = now
  }

  for (let t = 0; t < beats; t++) {
    clockWaveBeatBack(mesh, rule, s, lap)
  }

  return {
    rate:
      (2 * Math.PI * (ups.length - 1)) /
      (ups[ups.length - 1]! - ups[0]!),
    reversed: sameClockWave(s, start),
  }
}

export type LocalUnits = {
  light: LightKind
  depth: number
  // the local clock (rest rate, radians per beat) and its closed form; the matter's long-wave speed; the ruler
  rest: number
  restClosed: number
  mode: number
  matterSpeed: number
  compton: number
  // the light's speed on the local clock and ruler
  cLocal: number
  reversed: boolean
}

export function localUnits(
  light: LightKind,
  depth: number,
): LocalUnits {
  const form: WaveForm = light === 'span' ? 'span' : 'clock'
  const r0 = restRate(
    depth,
    LOCAL_REST_TERM,
    LOCAL_AMP,
    LOCAL_REST_BEATS,
    form,
  )
  const mode = modeRate(
    depth,
    LOCAL_REST_TERM,
    LOCAL_AMP,
    LOCAL_REST_BEATS,
    form,
    LOCAL_MODE_BOX,
    1,
  )
  const k = (2 * Math.PI) / LOCAL_MODE_BOX
  const matterSpeed = Math.sqrt(mode.rate ** 2 - r0.rate ** 2) / k
  const compton = matterSpeed / r0.rate

  return {
    light,
    depth,
    rest: r0.rate,
    restClosed: r0.closed,
    mode: mode.rate,
    matterSpeed,
    compton,
    cLocal: lightSpeed(light, depth) / (compton * r0.rate),
    reversed: r0.reversed && mode.reversed,
  }
}

export type LocalAlpha = {
  pair: PairReading
  units: LocalUnits
  // the Coulomb energy as a matter frequency, on the coordinate beat and on the local clock
  omega: number
  energyLocal: number
  // the separation's Green's difference on the local ruler (per ruler), the local alpha, and the coordinate alpha
  // Omega / (24 pi c (G0 - G(r))) it must equal
  greenLocal: number
  alphaLocal: number
  alphaCoordinate: number
  alphaClosed: number
  // the note's product (the light's invariant energy on the local clock, times the separation on the local ruler,
  // over 24 pi, with no hbar and no c): flat on the spanned light
  noteProduct: number
  // hbar in the light's invariant energy unit: the invariant pair energy over its matter frequency
  hbarInvariant: number
}

export function localAlpha(
  pair: PairReading,
  units: LocalUnits,
): LocalAlpha {
  const omega = (peierlsPhase(pair.resolution) * pair.phi) / 2
  const energyLocal = omega / units.rest
  const greenLocal = pair.green * units.compton
  const alphaLocal =
    energyLocal / (units.cLocal * 24 * Math.PI * greenLocal)

  return {
    pair,
    units,
    omega,
    energyLocal,
    greenLocal,
    alphaLocal,
    alphaCoordinate:
      omega /
      (24 * Math.PI * lightSpeed(pair.light, pair.depth) * pair.green),
    alphaClosed: alphaClosed(pair.light, pair.depth, pair.resolution),
    noteProduct: pair.energy / units.rest / (24 * Math.PI * greenLocal),
    hbarInvariant: pair.energy / omega,
  }
}

export type LocalAlphaSurvey = {
  readings: LocalAlpha[]
  units: LocalUnits[]
  seconds: number
}

let surveyCache: LocalAlphaSurvey | undefined

export function localAlphaSurvey(
  log?: (what: string) => void,
): LocalAlphaSurvey {
  if (surveyCache) {
    return surveyCache
  }

  const started = Date.now()
  const lights: LightKind[] = ['span', 'clock']
  const units = lights.flatMap(light =>
    LOCAL_DEPTHS.map(depth => localUnits(light, depth)),
  )
  const readings: LocalAlpha[] = []

  for (const u of units) {
    for (const r of LOCAL_SEPARATIONS) {
      readings.push(localAlpha(pairReading(u.light, u.depth, r), u))
      log?.(
        `${u.light} D ${u.depth} r ${r} ${(Date.now() - started) / 1000}s`,
      )
    }
  }

  surveyCache = {
    readings,
    units,
    seconds: (Date.now() - started) / 1000,
  }

  return surveyCache
}
