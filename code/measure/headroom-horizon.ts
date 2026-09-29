// The headroom horizon (test/experiment/gravity/headroom-horizon-temperature): measurement for the spanned light whose
// metric parts run at the metric register's REMAINING ROOM, h = (cap - e) / cap (code/rule/depth-span-light
// makeHeadroomSpanMedium). Real numbers live here only; the rule holds integers.
//
// THE COUPLING. The register holds the found excess e (E-GRV-0118's box-free unit profile times M) in counts of
// cap / C; its room is k = C - floor(C e / cap), 0 exactly where e reaches the cap. Both of the light's metric parts,
// the clock (the kick) and the span (the drift), run at k / C, the E-GRV-0093 split kept equal, so the light's speed is
// c0 h and the static metric it runs is ds^2 = -h dt^2 + dx^2 / h (f = h, N = sqrt(h)). Matter's kick reads the same
// room and its rest term none, so its rest rate goes as sqrt(h), as E-GRV-0092's did as q^(-1/2).
//
// THE CHAIN (E-GRV-0120's route (b), run inward). A smooth plane packet starts outside the horizon and its inward half
// crosses a detector on every dock down to the horizon. By the rule's exact reversal the inward run IS the outward one
// run back, so each interval's crossing time is the outgoing ray's. On the interval between detectors r and r + 1: f =
// the light's speed there over the flat line's, placed at radius r (the medium's interval [r, r + 1] runs at dock r's
// room, a link reading its slower end; tmp/room-probe1 found the reading tracks that room to a few percent), the redshift of a static clock there z = f^(-1/2), and u = the time from the
// outermost detector, which is the outgoing ray's travel time to it. No profile value enters these readings.
//
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule.

import { linearFit } from '@/code/measure/regression'
import {
  radialDistance,
  type UnitProfile,
} from '@/code/measure/horizon-temperature'
import {
  runSpan,
  spanPacket,
  spanSpeed,
  type SpanRun,
} from '@/code/measure/depth-span'
import { ruleRestRate } from '@/code/measure/depth-arena'
import {
  dockAt,
  firstLobeCentroid,
  LINE,
  AMP,
  HALF_WIDTH,
  SOURCE_X,
} from '@/code/measure/varying-depth-light'
import {
  emptySpan,
  makeHeadroomSpanMedium,
  makeMetricSpanMedium,
  type SpanMedium,
  type SpanState,
} from '@/code/rule/depth-span-light'
import { radionMesh } from '@/code/rule/trit-radion'
import type { ClockWaveRule } from '@/code/rule/depth-clock-wave'

// ---------------------------------------------------------------------------------------------------------
// the register's room

// the room at radius r for a lump of M on the unit profile: C less the count of cap / C the excess fills, 0 where it
// reaches the cap. Below the profile's first measured radius the register is full (checked: M times the unit there
// must reach the cap)
export function roomOf(
  profile: UnitProfile,
  m: number,
  cap: number,
  base: number,
): (r: number) => number {
  if (m * profile.at(profile.first) < cap) {
    throw new Error(
      'roomOf: the lump does not fill the register at the first measured radius',
    )
  }

  return r => {
    if (r < profile.first) {
      return 0
    }

    const e = m * profile.at(r)

    return e >= cap ? 0 : base - Math.floor((base * e) / cap)
  }
}

// a line of `length` x 2 x 2 docks, the lump at x = center, the room read at the periodic distance
export type RoomLine = {
  length: number
  center: number
  resolution: number
  base: number
  room: (r: number) => number
}

export function roomMedium(line: RoomLine): SpanMedium {
  return makeHeadroomSpanMedium(
    [line.length, 2, 2],
    line.resolution,
    line.base,
    x => line.room(radialDistance(line, x)),
  )
}

// the flat light's speed on the headroom medium at full room: the metric light's at D0
export const roomSpeed = (resolution: number): number =>
  spanSpeed(resolution)

// the largest odd register C the headroom medium holds in exact integers at resolution D0: the two bounds
// makeHeadroomSpanMedium refuses past, (q0 C)^2 x 4 under 2^31 (the potential's window) and (q0 C)^2 C^2 x 64 under
// 2^53 (the spatial terms). Checked by the callers against the medium itself (C builds, C + 2 is refused)
export function headroomLimit(resolution: number): number {
  const q0 = 2 * resolution + 1
  const fits = (c: number): boolean =>
    (q0 * c) ** 2 * 4 < 2 ** 31 && (q0 * c) ** 2 * c * c * 64 < 2 ** 53

  let c = 1

  while (fits(c + 2)) {
    c += 2
  }

  return c
}

// A ONE-SIDED SLICE of the radial line (test/experiment/gravity/deep-headroom-horizon): radii from .. from + length - 1
// on a line of length x 2 x 2 docks, dock x at radius from + x. The ring's seam must be a wall: the room at `from` and
// from + 1 is 0, so no link crosses the seam and the far end meets a frozen dock rather than the other side. The light
// on it is the full line's light on the same docks, without the frozen interior the full line spends its beats on
export type RoomSlice = {
  from: number
  length: number
  resolution: number
  base: number
  room: (r: number) => number
}

export function roomSliceMedium(s: RoomSlice): SpanMedium {
  if (s.room(s.from) !== 0 || s.room(s.from + 1) !== 0) {
    throw new Error(
      'roomSliceMedium: the seam is not a wall (room at from, from + 1 must be 0)',
    )
  }

  return makeHeadroomSpanMedium(
    [s.length, 2, 2],
    s.resolution,
    s.base,
    x => s.room(s.from + x),
  )
}

// THE EIKONAL STAIRCASE: the intervals [r, r + 1] from `outer` - 1 down to `inner`, each at its inner dock's room k (a
// link reads its slower end), time C / (c0 k), f = k / C, u from the outermost interval's middle. The same shape as the
// light's reading (roomIntervals), so exponential() reads both; nothing here runs the light
export function stairIntervals(
  room: (r: number) => number,
  base: number,
  c0: number,
  inner: number,
  outer: number,
): RoomInterval[] {
  const out: RoomInterval[] = []

  let t = 0
  let first = NaN

  for (let r = outer - 1; r >= inner; r--) {
    const k = room(r)

    if (k === 0) {
      break
    }

    const dt = base / (c0 * k)
    const mid = t + dt / 2

    if (Number.isNaN(first)) {
      first = mid
    }

    const f = k / base

    out.push({
      r,
      mid: r,
      f,
      z: f ** -0.5,
      lnz: -0.5 * Math.log(f),
      u: mid - first,
    })
    t += dt
  }

  return out.reverse()
}

// THE BAND where the redshift's local e-folding rate c0 f'(r) / 2 is within `fraction` of kappa, for f = 1 - (r_h / r)^s:
// the rate over kappa is (r_h / r)^(s + 1), so the band's outer edge has f_b = 1 - fraction^(s / (s + 1)) and the band is
// ln z >= -ln(f_b) / 2 (1.4849 at s = 1, fraction 0.9)
export const bandFloor = (slope: number, fraction: number): number =>
  -0.5 * Math.log(1 - fraction ** (slope / (slope + 1)))

// ---------------------------------------------------------------------------------------------------------
// the packet and the chain

// the plane packet of code/measure/varying-depth-light planarPacket (the same links, the same bump
// amp (1 - d^2 / w^2)^2 on the half grid), with the bump held to 1 / Q of an angle unit in each link's register
// (A2 = Q A + r, the nearest count): a construction from reals, disclosed, so a small amplitude stays smooth. Every
// counter and potential 0
export function smoothPacket(
  m: SpanMedium,
  levels: number,
  x0: number,
  amp: number,
  w: number,
): SpanState {
  const s = emptySpan(m, levels)
  const [sx] = m.sides
  const g = m.geometry

  const bump = (u: number): number => {
    const d = u - 2 * x0

    return Math.abs(d) >= w ? 0 : amp * (1 - (d * d) / (w * w)) ** 2
  }

  const put = (l: number, v: number): void => {
    const q = m.span[l]!
    const a2 = Math.round(v * q)
    const a = Math.floor((a2 + (q >> 1)) / q)

    s.angle[l] = a
    s.remainder[l] = a2 - q * a
  }

  for (let y = 0; y < g.huskDocks; y++) {
    const x = y % sx
    const even = bump(2 * x)
    const odd = bump(2 * x + 1)
    const at = y * 9

    put(at + 1, 2 * even)
    put(at + 7, even)
    put(at + 8, even)
    put(at + 3, odd)
    put(at + 4, -odd)
  }

  return s
}

export type Chain = { run: SpanRun; radii: number[]; arrival: number[] }

// the start run `window` beats with detectors at center + r for every r of `radii`, arrivals read on each detector's
// first passage (a reflection coming back is not read), then run back to the start bit for bit
export function roomChain(
  m: SpanMedium,
  center: number,
  start: SpanState,
  radii: readonly number[],
  window: number,
): Chain {
  const run = runSpan(
    m,
    start,
    radii.map(r => dockAt(m, center + r, 0, 0)),
    window,
    window,
    firstLobeCentroid,
  )

  return { run, radii: [...radii], arrival: run.arrival }
}

// ---------------------------------------------------------------------------------------------------------
// the readings

export type RoomInterval = {
  r: number
  mid: number
  f: number
  z: number
  lnz: number
  u: number
}

// the intervals between adjacent RESOLVED detectors (first-lobe arrivals on both, each detector's summed weight at least
// `share` of the outermost detector's), inward chain: f = 1 / (dt c_flat), z = f^(-1/2), u from the outermost detector
export function roomIntervals(
  chain: Chain,
  cFlat: number,
  share: number,
): RoomInterval[] {
  const n = chain.radii.length
  const outer = chain.run.weight[n - 1]!
  const t0 = chain.arrival[n - 1]!
  const ok = (i: number): boolean =>
    Number.isFinite(chain.arrival[i]!) &&
    chain.run.weight[i]! >= share * outer
  const out: RoomInterval[] = []

  for (let i = 0; i + 1 < n; i++) {
    if (
      chain.radii[i + 1]! !== chain.radii[i]! + 1 ||
      !ok(i) ||
      !ok(i + 1)
    ) {
      continue
    }

    const dt = chain.arrival[i]! - chain.arrival[i + 1]!

    if (!(dt > 0)) {
      continue
    }

    const f = 1 / (dt * cFlat)

    out.push({
      r: chain.radii[i]!,
      mid: chain.radii[i]!,
      f,
      z: f ** -0.5,
      lnz: -0.5 * Math.log(f),
      u: (chain.arrival[i]! + chain.arrival[i + 1]!) / 2 - t0,
    })
  }

  return out
}

// the flat chain's mean speed over all its detectors
export function chainSpeed(chain: Chain): number {
  const n = chain.radii.length

  return (
    (chain.radii[n - 1]! - chain.radii[0]!) /
    (chain.arrival[0]! - chain.arrival[n - 1]!)
  )
}

// THE EXPONENTIAL: over the resolved intervals with ln z >= `from`, the least-squares slope of ln z against u (the
// outgoing redshift's e-folding rate) and the span of ln z they cover
export type Exponential = {
  count: number
  span: number
  rate: number
  top: number
}

export function exponential(
  ivs: readonly RoomInterval[],
  from: number,
): Exponential {
  const near = ivs.filter(iv => iv.lnz >= from)
  const top = ivs.reduce((a, iv) => Math.max(a, iv.lnz), 0)

  if (near.length < 2) {
    return { count: near.length, span: 0, rate: NaN, top }
  }

  const fit = linearFit({
    xs: near.map(iv => iv.u),
    ys: near.map(iv => iv.lnz),
  })

  return {
    count: near.length,
    span:
      Math.max(...near.map(iv => iv.lnz)) -
      Math.min(...near.map(iv => iv.lnz)),
    rate: fit.slope,
    top,
  }
}

// THE LIGHT'S SURFACE GRAVITY: on the `count` innermost resolved intervals, 1 - f fitted as (A / r)^p (ln (1 - f)
// against ln r), so f vanishes at r = A with slope p / A there, and kappa = c_flat f'(A) / 2 (the redshifted surface
// gravity of ds^2 = -f dt^2 + dx^2 / f, per beat). The fitted form is a smoothness assumption over a few docks, as in
// E-GRV-0120, not the profile
export type LightKappa = {
  radius: number
  power: number
  kappa: number
  temperature: number
  used: number
}

export function lightKappa(
  ivs: readonly RoomInterval[],
  count: number,
  cFlat: number,
): LightKappa {
  const near = [...ivs]
    .filter(iv => iv.f < 1)
    .sort((a, b) => a.mid - b.mid)
    .slice(0, count)
  const fit = linearFit({
    xs: near.map(iv => Math.log(iv.mid)),
    ys: near.map(iv => Math.log(1 - iv.f)),
  })
  const power = -fit.slope
  const radius = Math.exp(fit.intercept / power)
  const kappa = (cFlat * power) / (2 * radius)

  return {
    radius,
    power,
    kappa,
    temperature: kappa / (2 * Math.PI),
    used: near.length,
  }
}

// THE PROFILE'S: f = 1 - e / cap = 1 - (r_h / r)^s near r_h, so f'(r_h) = s / r_h and kappa = c0 s / (2 r_h)
export function profileKappa(
  profile: UnitProfile,
  radius: number,
  c0: number,
): { kappa: number; temperature: number; slope: number } {
  const slope = profile.slope(radius)
  const kappa = (c0 * slope) / (2 * radius)

  return { kappa, temperature: kappa / (2 * Math.PI), slope }
}

// the eikonal crossing time of the staircase from radius `from` down to `to` (each interval [r, r + 1] at c0 times its
// inner dock's room over C): used only to size a run's window
export function stairTime(
  room: (r: number) => number,
  base: number,
  c0: number,
  to: number,
  from: number,
): number {
  let t = 0

  for (let r = to; r < from; r++) {
    const k = room(r)

    if (k > 0) {
      t += base / (c0 * k)
    }
  }

  return t
}

// ---------------------------------------------------------------------------------------------------------
// uniform room: the light's speed, matter's rest rate, and the reduction to the metric count q0 C / k

// the light's speed at uniform room k on E-GRV-0092's line and packet (detectors 60 and 100)
export const ROOM_NEAR = 60
export const ROOM_FAR = 100

export function uniformRoomSpeed(
  k: number,
  base: number,
  resolution: number,
  levels: number,
): { k: number; speed: number; run: SpanRun } {
  const m = makeHeadroomSpanMedium(LINE, resolution, base, () => k)
  const window = Math.ceil((80 * base) / (roomSpeed(resolution) * k))
  const run = runSpan(
    m,
    spanPacket(m, levels, SOURCE_X, AMP, HALF_WIDTH),
    [dockAt(m, ROOM_NEAR, 0, 0), dockAt(m, ROOM_FAR, 0, 0)],
    window,
    window,
  )

  return {
    k,
    speed: (ROOM_FAR - ROOM_NEAR) / (run.arrival[1]! - run.arrival[0]!),
    run,
  }
}

// matter at uniform room k: code/rule/depth-clock-wave's span form with q replaced by the rational q0 C / k and every
// term multiplied by k^2 so it is whole (inertia 9 q0^2 C^2, stiffness 2 k^2, rest term m q0 C k): its kick reads the
// room, its rest term does not, so omega^2 = m (k / C) / (9 q0) up to the leapfrog's acos
export function roomMatterRule(
  k: number,
  base: number,
  resolution: number,
  m: number,
): { mesh: ReturnType<typeof radionMesh>; rule: ClockWaveRule } {
  const mesh = radionMesh([4, 2, 2])
  const q0 = 2 * resolution + 1
  const big = 9 * q0 * q0 * base * base

  return {
    mesh,
    rule: {
      form: 'span',
      inertia: new Int32Array(mesh.docks).fill(big),
      half: new Int32Array(mesh.docks).fill((big - 1) / 2),
      rest: new Int32Array(mesh.docks).fill(m * q0 * base * k),
      a: 2 * k * k,
    },
  }
}

export function roomRestRate(
  k: number,
  base: number,
  resolution: number,
  m: number,
  amp: number,
  beats: number,
): { k: number; rate: number; closed: number; reversed: boolean } {
  const { mesh, rule } = roomMatterRule(k, base, resolution, m)

  return {
    k,
    ...ruleRestRate(mesh, rule, amp, beats),
    closed: Math.acos(
      1 - (m * k) / (2 * 9 * (2 * resolution + 1) * base),
    ),
  }
}

// THE REDUCTION. Where q0 C / k is an odd whole number q_m = 2 D_m + 1, uniform room k is the minimal-coupling light
// at metric depth D_m, one linear map (drift k / (q0 C) = 1 / q_m, kick likewise), with a finer carry. Both lights run
// the same packet on a short line; the detector traces' arrivals and weights are compared
export function reductionDepth(
  k: number,
  base: number,
  resolution: number,
): number {
  const q = ((2 * resolution + 1) * base) / k

  if (!Number.isInteger(q) || q % 2 === 0) {
    throw new Error(
      `reductionDepth: q0 C / k = ${q} is not an odd whole number`,
    )
  }

  return (q - 1) / 2
}

export type Reduction = {
  k: number
  depth: number
  room: SpanRun
  metric: SpanRun
  arrivalOff: number
  weightOff: number
}

export const REDUCTION_LINE: readonly [number, number, number] = [
  96, 2, 2,
]
export const REDUCTION_DETECTOR = 60

export function reduction(
  k: number,
  base: number,
  resolution: number,
  levels: number,
): Reduction {
  const depth = reductionDepth(k, base, resolution)
  const room = makeHeadroomSpanMedium(
    REDUCTION_LINE,
    resolution,
    base,
    () => k,
  )
  const metric = makeMetricSpanMedium(
    REDUCTION_LINE,
    resolution,
    () => depth,
  )
  const window = Math.ceil(
    (REDUCTION_DETECTOR - SOURCE_X + HALF_WIDTH) / spanSpeed(depth),
  )
  const detectors = [
    dockAt(room, REDUCTION_DETECTOR - 8, 0, 0),
    dockAt(room, REDUCTION_DETECTOR, 0, 0),
  ]
  const a = runSpan(
    room,
    spanPacket(room, levels, SOURCE_X, AMP, HALF_WIDTH),
    detectors,
    window,
    window,
  )
  const b = runSpan(
    metric,
    spanPacket(metric, levels, SOURCE_X, AMP, HALF_WIDTH),
    detectors,
    window,
    window,
  )

  return {
    k,
    depth,
    room: a,
    metric: b,
    arrivalOff: Math.max(
      ...a.arrival.map((t, i) => Math.abs(t / b.arrival[i]! - 1)),
    ),
    weightOff: Math.max(
      ...a.weight.map((w, i) => Math.abs(w / b.weight[i]! - 1)),
    ),
  }
}
