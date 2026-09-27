// Does the light outside the clock horizon see a temperature (E-GRV-0120)? Measurement only: the box-free depth profile
// of a unit (E-GRV-0118's reading, factored here), the lapse and surface gravity it gives at the clock horizon, and the
// spanned husk light (code/rule/depth-span-light, the fixed-resolution medium of E-FRC-0257) run on a radial line
// through that profile. Real numbers live here only.
//
// THE LAPSE. In E-FRC-0257's minimal coupling a column's metric count is q = 2 D_m + 1 with D_m = D_0 + e, e the found
// depth's excess in whole steps; matter's rest rate runs as q^(-1/2) and the spanned light's speed as q^(-1) (E-GRV-0092:
// exponents 0.500 and 0.99999). That is the static metric ds^2 = -f dt^2 + dx^2 / f in the light's own units, with
//   f = q_0 / q = q_0 / (q_0 + 2 e),   N = sqrt(f),   the light's coordinate speed c_0 f.
// The clock horizon (code/rule/clock-horizon) joins where e reaches CAP, and the register holds CAP inside it, so
//   N_h = sqrt(q_0 / (q_0 + 2 CAP)),
// which is 0.957 at D_0 = 16, CAP = 3/2, and is NOT 0. A bounded register cannot make N vanish: N >= sqrt(q_0 / q_cap).
//
// THE SURFACE GRAVITY. For a static metric of this form the redshifted acceleration of a static clock at r is
// kappa(r) = c_0 N dN/dr = c_0 f' / 2 (per beat; dN/dr per dock). At a Killing horizon (N = 0) that is Hawking's kappa and
// T = kappa / 2 pi. The profile gives, at r_h, dN/dr = N^3 s CAP / (q_0 r_h), s the local log slope of e: so kappa ~ 1 / r_h
// ~ 1 / M. What N_h > 0 changes is not the rate but its LENGTH: an outgoing ray from r_h reaches infinity redshifted by
// 1 / N_h at most, so the exponential law omega ~ exp(-kappa t) holds for W = ln(1 / N_h) = ln(1 + 2 CAP / q_0) / 2
// e-folds, 0.044, whatever M is.
//
// THE READING OF THE LIGHT. A static medium keeps the beat frequency of every wave, so a mode leaves with the frequency
// it had: there is no mixing of positive and negative frequency (|beta| = 0) on a static background, and a redshift is a
// statement about clocks, read from the light's speed. A plane packet runs along a line whose metric depth at x is the
// profile at r = |x - x_c|; detectors on every dock of the +x side give its arrival times, and on each unit interval the
// local speed over the FLAT line's mean speed is the measured f. So N_meas = sqrt(f_meas), with no profile read.
//
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule.

import { linearFit } from '@/code/measure/regression'
import { greenSolve, huskCoord, stackGreen, type StackMode } from '@/code/measure/open-husk'
import { axisMean } from '@/code/measure/clock-horizon'
import { backgroundDocks, unitWithBackground } from '@/code/measure/horizon-slope'
import { backgroundResponse, coulombImages, greenAt, imageShift, periodicExcess, periodicGreen } from '@/code/measure/husk-box'
import { dockAt } from '@/code/measure/varying-depth-light'
import { runSpan, spanPacket, spanSpeed, type SpanRun } from '@/code/measure/depth-span'
import { makeMetricSpanMedium } from '@/code/rule/depth-span-light'
import type { OpenMesh } from '@/code/rule/open-husk'

// ---------------------------------------------------------------------------------------------------------
// the box-free unit excess (E-GRV-0118): the linear solve of the stack less the exact box correction, r = 2 .. side/4 - 2

export function boxFreeExcess(mesh: OpenMesh, modes: readonly StackMode[], tolerance = 1e-12): Map<number, number> {
  const side = mesh.side
  const c = side / 2
  const center = [c, c, c]
  const far = backgroundDocks(mesh, center)
  const farAt = far.map(y => huskCoord(mesh, y))
  const x = greenSolve(mesh, unitWithBackground(mesh, center, c + side * c + side * side * c, far), tolerance).x
  const g = periodicGreen(modes, side)
  const ref = backgroundResponse(g, center, farAt, [0, 0, 0])
  const out = new Map<number, number>()

  for (let r = 2; r <= side / 4 - 2; r++) {
    const eN = periodicExcess(g, center, farAt, r, ref)
    const gInf = greenAt(g, r, 0, 0) - imageShift(modes, side, [r, 0, 0], coulombImages(side, [r, 0, 0]))

    out.set(r, axisMean(mesh, x, center, r) - (eN - gInf))
  }

  return out
}

// a unit's excess at any r >= 2: log-log interpolation of the measured points, and beyond the last the stack's own Green's
// function's SHAPE (stackGreen, the zero mode's 1/r there to e^(-r / l)) held to the measured LEVEL at the last point, so
// the profile has no step there; `splice` is the measured over the theory at the last point (disclosed: 0.981 on the
// lapse stack of side 64, the lattice's short-range form against the continuum's)
export type UnitProfile = { at: (r: number) => number; slope: (r: number) => number; first: number; last: number; splice: number }

export function unitProfile(measured: Map<number, number>, modes: readonly StackMode[]): UnitProfile {
  const rs = [...measured.keys()].sort((a, b) => a - b)
  const first = rs[0]!
  const last = rs[rs.length - 1]!
  const splice = measured.get(last)! / stackGreen(modes, last)
  const at = (r: number): number => {
    if (r >= last) return splice * stackGreen(modes, r)
    if (r < first) throw new Error(`unitProfile: r ${r} under the first measured ${first}`)

    const a = Math.floor(r)
    const b = a + 1
    const ea = measured.get(a)!
    const eb = measured.get(b)!

    return ea * Math.exp((Math.log(eb / ea) * Math.log(r / a)) / Math.log(b / a))
  }
  // the local log slope -d ln e / d ln r, from the bracketing pair (the theory's beyond the last point)
  const slope = (r: number): number => {
    const h = 1e-4

    if (r >= last) return -(Math.log(stackGreen(modes, r * (1 + h))) - Math.log(stackGreen(modes, r * (1 - h)))) / (Math.log(1 + h) - Math.log(1 - h))

    const a = Math.floor(r)

    return -Math.log(measured.get(a + 1)! / measured.get(a)!) / Math.log((a + 1) / a)
  }

  return { at, slope, first, last, splice }
}

// where M times the unit's excess reaches `level` (bisection on the decreasing profile)
export function radiusAt(profile: UnitProfile, m: number, level: number): number {
  let lo = profile.first
  let hi = 1e4

  if (m * profile.at(lo) < level) return NaN
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2

    if (m * profile.at(mid) >= level) lo = mid
    else hi = mid
  }

  return lo
}

// where the axis step of M times the unit reaches the window (E-GRV-0108's field criterion: weight 2 on an axis link, so
// 2 M |e'| = window), read on the same profile
export function fieldRadius(profile: UnitProfile, m: number, window: number): number {
  const step = (r: number): number => (2 * m * profile.at(r) * profile.slope(r)) / r
  let lo = profile.first
  let hi = 1e4

  if (step(lo) < window) return NaN
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2

    if (step(mid) >= window) lo = mid
    else hi = mid
  }

  return lo
}

// the lapse of an excess e (whole steps) at metric count q_0
export const lapseOf = (e: number, q0: number): number => Math.sqrt(q0 / (q0 + 2 * e))

// THE PREDICTION at a horizon of radius r_h where the excess is e_h: N_h, dN/dr there (per dock, from e' = -s e / r), the
// redshifted surface gravity c_0 N dN/dr (per beat), T = kappa / 2 pi, and the e-folds W = ln(1 / N_h)
export type SurfaceGravity = { radius: number; excess: number; lapse: number; dLapse: number; kappa: number; temperature: number; efolds: number }

export function surfaceGravity(profile: UnitProfile, m: number, radius: number, q0: number, c0: number): SurfaceGravity {
  const excess = m * profile.at(radius)
  const lapse = lapseOf(excess, q0)
  const dExcess = (-profile.slope(radius) * excess) / radius
  const dLapse = (-(lapse ** 3) * dExcess) / q0
  const kappa = c0 * lapse * dLapse

  return { radius, excess, lapse, dLapse, kappa, temperature: kappa / (2 * Math.PI), efolds: -Math.log(lapse) }
}

// ---------------------------------------------------------------------------------------------------------
// the light on a radial line

// the line: x runs 0 .. length - 1 on a periodic box `length` x 2 x 2, the lump's center at x_c, r = the periodic
// distance |x - x_c|. The metric register counts in 1 / scale of a step: D_m = scale D_0 + round(scale e(r)), with e the
// profile outside `inner` and `innerExcess` inside it (the register held at its cap), so q_0 = 2 scale D_0 + 1.
export type RadialLine = { length: number; center: number; scale: number; resolution: number; excessAt: (r: number) => number }

export function radialDistance(line: Pick<RadialLine, 'length' | 'center'>, x: number): number {
  const d = Math.abs(x - line.center)

  return Math.min(d, line.length - d)
}

export function radialMedium(line: RadialLine): ReturnType<typeof makeMetricSpanMedium> {
  return makeMetricSpanMedium([line.length, 2, 2], line.resolution, x => line.scale * line.resolution + Math.round(line.scale * line.excessAt(radialDistance(line, x))))
}

// the metric count of the flat line, and its light speed
export const lineCount = (line: RadialLine): number => 2 * line.scale * line.resolution + 1
export const lineSpeed = (line: RadialLine): number => spanSpeed(line.scale * line.resolution)

export type LightChain = { run: SpanRun; radii: number[]; arrival: number[] }

// a plane packet started at x_start (moving both ways), detectors on the +x side at r = 0 .. reach, `window` beats
export function lightChain(line: RadialLine, start: number, reach: number, window: number, levels: number, amp: number, width: number): LightChain {
  const m = radialMedium(line)
  const radii = Array.from({ length: reach + 1 }, (_, r) => r)
  const run = runSpan(
    m,
    spanPacket(m, levels, start, amp, width),
    radii.map(r => dockAt(m, line.center + r, 0, 0)),
    window,
  )

  return { run, radii, arrival: run.arrival }
}

// the measured f on each unit interval [r, r + 1] of `radii` (both ends at or beyond `from`): the local speed over the flat
// chain's mean speed over the same span, its midpoint, and the mean arrival there
export type Interval = { mid: number; f: number; lapse: number; time: number }

export function intervals(chain: LightChain, flatMean: number, from: number): Interval[] {
  const out: Interval[] = []

  for (let i = 0; i + 1 < chain.radii.length; i++) {
    const r = chain.radii[i]!

    if (r < from) continue

    const dt = chain.arrival[i + 1]! - chain.arrival[i]!
    const f = 1 / dt / flatMean

    out.push({ mid: r + 0.5, f, lapse: Math.sqrt(f), time: (chain.arrival[i]! + chain.arrival[i + 1]!) / 2 })
  }

  return out
}

// the flat chain's mean speed over detectors from `from` to its last
export function flatMeanSpeed(chain: LightChain, from: number): number {
  const i = chain.radii.indexOf(from)
  const j = chain.radii.length - 1

  return (chain.radii[j]! - chain.radii[i]!) / (chain.arrival[j]! - chain.arrival[i]!)
}

// THE LIGHT'S SURFACE GRAVITY. On the first `count` intervals wholly outside r_h, 1 - N_meas is fitted as A r^(-p) (a local
// power law, ln (1 - N) against ln r), and extrapolated to r_h: N(r_h) and dN/dr there, kappa = c_0 N dN/dr. The fitted
// form is a smoothness assumption about the profile over three docks, not the profile.
export type LightGravity = { lapse: number; dLapse: number; kappa: number; temperature: number; efolds: number; power: number; used: number }

export function lightGravity(ivs: readonly Interval[], radius: number, count: number, c0: number): LightGravity {
  const near = ivs.filter(iv => iv.mid - 0.5 >= radius).slice(0, count)
  const fit = linearFit({ xs: near.map(iv => Math.log(iv.mid)), ys: near.map(iv => Math.log(1 - iv.lapse)) })
  const power = -fit.slope
  const amp = Math.exp(fit.intercept)
  const lapse = 1 - amp * radius ** -power
  const dLapse = amp * power * radius ** (-power - 1)
  const kappa = c0 * lapse * dLapse

  return { lapse, dLapse, kappa, temperature: kappa / (2 * Math.PI), efolds: -Math.log(lapse), power, used: near.length }
}
