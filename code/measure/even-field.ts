// The even field (E-GRV-0074) and the lens with a tail (E-GRV-0075): the husk light run a SECOND time, sourced
// not by charge (love minus fear) but by content (love plus fear), and its static potential read as the husk's
// local depth.
//
// THE CONSTRUCTION (no new rule). The second copy is the husk integer rule of code/measure/varying-depth-light
// (mediumBeat, the wave form of code/rule/trit-husk, equal to the trit rule at one depth) at one depth D0, with
// its string field S placed so that div S is the CONTENT of each column instead of its charge. Nothing in the beat
// changes: the source map is the only difference between the two copies. Gauss (div (S - C^T U) = div S) holds on
// every beat for any U, so the copy's longitudinal (static) field is fixed by its source at every beat, and its
// potential is the husk Green's function of E-FRC-0241 convolved with the content.
//
// A CLOSED HUSK CANNOT HOLD AN EVEN SOURCE ALONE. On a torus div S sums to zero, so a source that never goes
// negative needs a compensator. The rule-level runs (0074) put it at one far dock (the SINK, a disclosed stand-in).
// The depth reading (0075) uses the infinite husk's potential instead: G(0) = G0 of E-FRC-0241 and
// G(r) = 1 / (24 pi r) + A(r-hat) / r^5 for r >= 1 (E-FRC-0241's closed form, read there to 1.2e-4 from r = 6),
// summed over the content by the minimum image, zero at infinity (the box is a window on an infinite husk: a
// disclosed stand-in for a compensator at infinity).
//
// THE DEPTH (0075). D = D0 + Delta, Delta the number of integer thresholds j = 1, 2, ... with j theta <= phi:
// a threshold COUNT, not a rounding of the depth. theta = M / (24 pi K), M the lump's content and K = 10 the
// radius at which the continuum potential falls to one threshold, so Delta is about K / r and is 0 beyond K. The
// potential itself is a real number read off the field (measurement); the threshold count is the one place a
// real touches the integer depth (disclosed).
//
// DETERMINISM: every start and source is placed; the gauge function is an integer polynomial; nothing is drawn.
// NOTHING MOVES: each value takes its new value by the rule; no vibe is present in the medium runs.

import { tailCoefficient } from '@/code/measure/husk-coulomb'
import { coulombFlux, G_METRIC, huskGreenDifference } from '@/code/measure/trit-hop-light'
import {
  boundaryTriangles,
  copyState,
  dockAt,
  dockWeight,
  emptyState,
  halfMaxCentroid,
  lightSpeed,
  makeMedium,
  mediumBeat,
  mediumBeatBack,
  noWraps,
  planarPacket,
  runPacket,
  sameState,
  type Medium,
  type Run,
  type Wraps,
} from '@/code/measure/varying-depth-light'
import type { HuskLightState } from '@/code/rule/trit-column'

const mod = (x: number, m: number): number => ((x % m) + m) % m

// ---------------------------------------------------------------------------------------------------------
// the copy's own readings: flux, divergence, strings, gauge

// S - C^T U
export function fluxOf(m: Medium, s: HuskLightState): Int32Array {
  const g = m.geometry
  const out = Int32Array.from(s.string)

  for (let t = 0; t < g.triangles; t++) {
    const u = s.potential[t]!

    if (u === 0) continue

    for (let j = t * 3; j < t * 3 + 3; j++) out[g.triLinks[j]!] = out[g.triLinks[j]!]! - g.triSigns[j]! * u
  }

  return out
}

export function divergence(m: Medium, s: HuskLightState): Int32Array {
  const g = m.geometry
  const e = fluxOf(m, s)
  const div = new Int32Array(g.huskDocks)

  for (let l = 0; l < g.huskLinks; l++) {
    div[Math.floor(l / 9)] = div[Math.floor(l / 9)]! + e[l]!
    div[g.huskNeighbour[l]!] = div[g.huskNeighbour[l]!]! - e[l]!
  }

  return div
}

// docks where div (S - C^T U) is not the source
export function gaussAgainst(m: Medium, s: HuskLightState, rho: Int32Array): number {
  const div = divergence(m, s)
  let bad = 0

  for (let y = 0; y < div.length; y++) if (div[y] !== rho[y]) bad++

  return bad
}

// `units` of string from dock `from` to dock `to`, along +x, then +y, then +z axis links: div S gains +units at
// `from` and -units at `to`
export function placeString(m: Medium, s: HuskLightState, from: readonly number[], to: readonly number[], units: number): void {
  const [sx, sy, sz] = m.sides
  const at = [from[0]!, from[1]!, from[2]!]
  const counts = [mod(to[0]! - from[0]!, sx), mod(to[1]! - from[1]!, sy), mod(to[2]! - from[2]!, sz)]

  for (let axis = 0; axis < 3; axis++) {
    for (let i = 0; i < counts[axis]!; i++) {
      const l = dockAt(m, at[0]!, at[1]!, at[2]!) * 9 + axis

      s.string[l] = s.string[l]! + units
      at[axis] = at[axis]! + 1
    }
  }
}

// a gauge transform by an integer function on the docks: each link's angle gains its line integral of grad
// lambda in the rule's own units (2 d lambda on an axis link, d lambda on a diagonal: a diagonal holds its line
// integral, an axis twice its, as the uniform-potential check of varying-depth-light has it), wrapped by its window
export function applyGauge(m: Medium, s: HuskLightState, lambda: Int32Array): void {
  const g = m.geometry

  for (let l = 0; l < g.huskLinks; l++) {
    const d = lambda[g.huskNeighbour[l]!]! - lambda[Math.floor(l / 9)]!
    const n = m.linkWindow[l]!

    s.angle[l] = mod(s.angle[l]! + (l % 9 < 3 ? 2 : 1) * d + n / 2, n) - n / 2
  }
}

// the largest weighted plaquette sum of a pure gauge angle (unwrapped): 0 when the gauge carries no field
export function gaugePlaquette(m: Medium, lambda: Int32Array): number {
  const g = m.geometry
  let top = 0

  for (let t = 0; t < g.triangles; t++) {
    let v = 0

    for (let j = t * 3; j < t * 3 + 3; j++) {
      const l = g.triLinks[j]!
      const d = lambda[g.huskNeighbour[l]!]! - lambda[Math.floor(l / 9)]!

      v += g.triSigns[j]! * g.weight[l % 9]! * (l % 9 < 3 ? 2 : 1) * d
    }

    top = Math.max(top, Math.abs(v))
  }

  return top
}

// the longitudinal (Coulomb) energy of the copy's flux in the light's units (pi / D) 1/2 sum E_L^2 / g, the
// source read off the flux's divergence (E-FRC-0212's reading, as code/measure/husk-coulomb longitudinalEnergy)
export function longitudinal(m: Medium, s: HuskLightState): number {
  const g = m.geometry
  const rho = Float64Array.from(divergence(m, s))
  const el = coulombFlux(g, rho)
  let sum = 0

  for (let l = 0; l < g.huskLinks; l++) sum += el[l]! ** 2 / (2 * G_METRIC[l % 9]!)

  return (Math.PI / m.dockDepth[0]!) * sum
}

// ---------------------------------------------------------------------------------------------------------
// E-GRV-0074: the second copy with an even source, on the side-8 husk at D0 = 16, 48 beats per run

export const EVEN_SIDE = 8
export const EVEN_DEPTH = 16
export const EVEN_BEATS = 48
// the lump: one column holding 3 love and 1 fear (content 4, charge +2); flipped: 1 love and 3 fear
export const LUMP_COLUMN: readonly number[] = [2, 2, 2]
export const SINK_COLUMN: readonly number[] = [6, 6, 6]

// an integer gauge function, fixed polynomial in the dock index (no draw)
export const gaugeFunction = (docks: number): Int32Array => Int32Array.from({ length: docks }, (_, y) => mod(5 * y * y + 3 * y + 1, 11) - 5)

export type Placement = { at: readonly number[]; to: readonly number[]; units: number }

// the state of placed strings (E starts as S, every other field 0) and the source map they give div S
export function placedState(m: Medium, placements: readonly Placement[]): { state: HuskLightState; rho: Int32Array } {
  const s = emptyState(m)
  const rho = new Int32Array(m.geometry.huskDocks)

  for (const p of placements) {
    placeString(m, s, p.at, p.to, p.units)
    rho[dockAt(m, p.at[0]!, p.at[1]!, p.at[2]!)] = rho[dockAt(m, p.at[0]!, p.at[1]!, p.at[2]!)]! + p.units
    rho[dockAt(m, p.to[0]!, p.to[1]!, p.to[2]!)] = rho[dockAt(m, p.to[0]!, p.to[1]!, p.to[2]!)]! - p.units
  }

  return { state: s, rho }
}

export type CopyRun = {
  gauss: number
  reversed: boolean
  wraps: Wraps
  energyStart: number
  energyDrift: number
  // the state after every beat (for the flip comparisons)
  trace: HuskLightState[]
}

function runCopy(m: Medium, start: HuskLightState, rho: Int32Array, withEnergy: boolean, keepTrace: boolean): CopyRun {
  const s = copyState(start)
  const wraps = noWraps()
  const trace: HuskLightState[] = []
  let gauss = gaussAgainst(m, s, rho)
  const energyStart = withEnergy ? longitudinal(m, s) : 0
  let energyDrift = 0

  for (let t = 1; t <= EVEN_BEATS; t++) {
    mediumBeat(m, s, wraps)
    gauss += gaussAgainst(m, s, rho)

    if (keepTrace) trace.push(copyState(s))

    if (withEnergy && t % 8 === 0) energyDrift = Math.max(energyDrift, Math.abs(longitudinal(m, s) - energyStart))
  }

  for (let t = 0; t < EVEN_BEATS; t++) mediumBeatBack(m, s)

  return { gauss, reversed: sameState(s, start), wraps, energyStart, energyDrift, trace }
}

const negated = (a: HuskLightState, b: HuskLightState): boolean =>
  (['angle', 'potential', 'counter', 'lag', 'spatial', 'string'] as const).every(f => a[f].every((v, i) => v === -b[f][i]!))

export type EvenSurvey = {
  // the lump and its flip on the even copy and on the light (the odd copy)
  evenLump: CopyRun
  evenFlip: CopyRun
  oddLump: CopyRun
  oddFlip: CopyRun
  evenFlipIdentical: boolean
  oddFlipNegated: boolean
  oddFlipDiffers: boolean
  // gauge covariance over 48 beats, and the gauge's own plaquette field
  gaugeCovariant: boolean
  gaugeCovariantBeats: number
  gaugePlaquette: number
  // per r = 1 .. 4 along the axis: the source-sink (dipole) energy, the torus Green's prediction, the like pair
  // W of two even sources, the like pair of the even copy for a (love, fear) pair, and the light's own for it
  dipole: number[]
  green: number[]
  evenLike: number[]
  evenLoveFear: number[]
  oddLoveFear: number[]
  energyDrift: number
  pairGauss: number
  pairReversed: boolean
  seconds: number
}

let evenCache: EvenSurvey | undefined

export function evenSurvey(log?: (what: string) => void): EvenSurvey {
  if (evenCache) return evenCache

  const started = Date.now()
  const m = makeMedium([EVEN_SIDE, EVEN_SIDE, EVEN_SIDE], () => EVEN_DEPTH)
  const love = 3
  const fear = 1
  // content (even) and charge (odd) of the lump and of its flip
  const source = (value: number): Placement[] => [{ at: LUMP_COLUMN, to: SINK_COLUMN, units: value }]
  const evenL = placedState(m, source(love + fear))
  const evenF = placedState(m, source(fear + love))
  const oddL = placedState(m, source(love - fear))
  const oddF = placedState(m, source(fear - love))
  const evenLump = runCopy(m, evenL.state, evenL.rho, true, true)
  const evenFlip = runCopy(m, evenF.state, evenF.rho, true, true)
  const oddLump = runCopy(m, oddL.state, oddL.rho, false, true)
  const oddFlip = runCopy(m, oddF.state, oddF.rho, false, true)

  log?.(`lump runs ${(Date.now() - started) / 1000}s`)

  // gauge: beat(gauge(s)) against gauge(beat(s)), every beat
  const lambda = gaugeFunction(m.geometry.huskDocks)
  const plain = copyState(evenL.state)
  const gauged = copyState(evenL.state)
  let gaugeCovariantBeats = 0

  applyGauge(m, gauged, lambda)

  for (let t = 1; t <= EVEN_BEATS; t++) {
    mediumBeat(m, plain)
    mediumBeat(m, gauged)

    const check = copyState(plain)

    applyGauge(m, check, lambda)

    if (sameState(check, gauged)) gaugeCovariantBeats++
  }

  // the pair energies (E-FRC-0241's six configurations, on the copy)
  const dipole: number[] = []
  const green: number[] = []
  const evenLike: number[] = []
  const evenLoveFear: number[] = []
  const oddLoveFear: number[] = []
  let energyDrift = 0
  let pairGauss = 0
  let pairReversed = true
  const z1 = [0, 4, 4]
  const energyOf = (placements: Placement[]): number => {
    const p = placedState(m, placements)
    const run = runCopy(m, p.state, p.rho, true, false)

    energyDrift = Math.max(energyDrift, run.energyDrift)
    pairGauss += run.gauss
    pairReversed = pairReversed && run.reversed

    return run.energyStart
  }
  // the interaction energy of a source sa at a and sb at b, each compensated at its own Z (E-FRC-0241's six
  // configurations): W = U4 - U(a,Z1) - U(b,Z2) + sa sb (U(Z1,Z2) - U(a,Z2) - U(b,Z1)) = sa sb (pi / D)(G(r) - G(0)).
  // With sa sb = 1 this is E-FRC-0241's W_like
  const pairEnergy = (r: number, sa: number, sb: number): number => {
    const a = [0, 0, 0]
    const b = [r, 0, 0]
    const z2 = [r, 4, 4]
    const u4 = energyOf([
      { at: a, to: z1, units: sa },
      { at: b, to: z2, units: sb },
    ])
    const aZ1 = energyOf([{ at: a, to: z1, units: sa }])
    const bZ2 = energyOf([{ at: b, to: z2, units: sb }])
    const aZ2 = energyOf([{ at: a, to: z2, units: sa }])
    const bZ1 = energyOf([{ at: b, to: z1, units: sb }])
    const z1Z2 = energyOf([{ at: z1, to: z2, units: 1 }])

    return u4 - aZ1 - bZ2 + sa * sb * (z1Z2 - aZ2 - bZ1)
  }
  // a vibe's source in each copy: the even copy counts it (+1 for love and for fear), the light charges it
  const evenSource = (_kind: 'love' | 'fear'): number => 1
  const oddSource = (kind: 'love' | 'fear'): number => (kind === 'love' ? 1 : -1)

  for (let r = 1; r <= 4; r++) {
    dipole.push(energyOf([{ at: [0, 0, 0], to: [r, 0, 0], units: 1 }]))
    green.push((Math.PI / EVEN_DEPTH) * huskGreenDifference(EVEN_SIDE, [r, 0, 0]))
    evenLike.push(pairEnergy(r, evenSource('love'), evenSource('love')))
    evenLoveFear.push(pairEnergy(r, evenSource('love'), evenSource('fear')))
    oddLoveFear.push(pairEnergy(r, oddSource('love'), oddSource('fear')))
    log?.(`pair r ${r} ${(Date.now() - started) / 1000}s`)
  }

  evenCache = {
    evenLump,
    evenFlip,
    oddLump,
    oddFlip,
    evenFlipIdentical: evenLump.trace.every((s, t) => sameState(s, evenFlip.trace[t]!)),
    oddFlipNegated: oddLump.trace.every((s, t) => negated(s, oddFlip.trace[t]!)),
    oddFlipDiffers: oddLump.trace.some((s, t) => !sameState(s, oddFlip.trace[t]!)),
    gaugeCovariant: gaugeCovariantBeats === EVEN_BEATS,
    gaugeCovariantBeats,
    gaugePlaquette: gaugePlaquette(m, lambda),
    dipole,
    green,
    evenLike,
    evenLoveFear,
    oddLoveFear,
    energyDrift,
    pairGauss,
    pairReversed,
    seconds: (Date.now() - started) / 1000,
  }

  return evenCache
}

// ---------------------------------------------------------------------------------------------------------
// E-GRV-0075: the lens with a tail. Every number below was fixed before the first wave run (the disclosed probe
// tmp/grv74-probe1.ts read the depth map, the eikonal and one beat's time only, no wave: 0.62 s a beat, so the
// flipped lump's wave run is replaced by the proof that its medium is identical)

export const LENS: readonly [number, number, number] = [112, 32, 32]
export const LENS_DEPTH = 16
export const LENS_AMP = 12
export const LENS_HALF_WIDTH = 16
export const LENS_SOURCE_X = 12
export const LENS_CENTER: readonly [number, number, number] = [32, 16, 16]
export const LENS_EXIT_X = 52
export const LENS_WINDOW = 270
// the radius at which the continuum potential falls to one threshold
export const LENS_K = 10
// the lump: the center column and its six axis neighbors, each 3 love and 1 fear (flipped: 1 and 3)
export const LENS_LUMP: readonly (readonly number[])[] = [
  [0, 0, 0],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]
export const HUSK_G0 = 0.0528305071922
export const DELAY_B: readonly number[] = [0, 2, 4, 6, 8]
export const BEND_B: readonly number[] = [3, 4, 5, 6]
export const FAR_B: readonly number[] = [10, 12]
export const DRIFT_R: readonly number[] = Array.from({ length: 13 }, (_, i) => i + 2)

// the infinite husk's Green's function at an integer offset: G0 at 0, else 1/(24 pi r) + A(r-hat) / r^5
export function huskGreen(v: readonly number[]): number {
  const r = Math.hypot(v[0]!, v[1]!, v[2]!)

  return r === 0 ? HUSK_G0 : 1 / (24 * Math.PI * r) + tailCoefficient('husk', v) / r ** 5
}

const minImage = (d: number, side: number): number => mod(d + side / 2, side) - side / 2

// the content of each lump column (love plus fear) and its charge (love minus fear)
export type Lump = { columns: readonly (readonly number[])[]; love: number; fear: number }

export const lensLump = (flip: boolean): Lump => ({ columns: LENS_LUMP, love: flip ? 1 : 3, fear: flip ? 3 : 1 })

// the even potential of a lump on every dock of the lens box (zero at infinity, minimum image)
export function evenPotential(lump: Lump): Float64Array {
  const [sx, sy, sz] = LENS
  const phi = new Float64Array(sx * sy * sz)
  const content = lump.love + lump.fear

  for (let y = 0; y < phi.length; y++) {
    const x = [y % sx, Math.floor(y / sx) % sy, Math.floor(y / (sx * sy))]
    let v = 0

    for (const c of lump.columns) {
      const d = [0, 1, 2].map(i => minImage(x[i]! - LENS_CENTER[i]! - c[i]!, LENS[i]!))

      v += content * huskGreen(d)
    }

    phi[y] = v
  }

  return phi
}

// the threshold: one step of depth per M / (24 pi K) of potential
export const lensTheta = (lump: Lump): number => ((lump.love + lump.fear) * lump.columns.length) / (24 * Math.PI * LENS_K)

// the depth offset: how many thresholds j theta (j = 1, 2, ...) the potential reaches
export function thresholdCount(phi: number, theta: number): number {
  let j = 0

  while (phi >= (j + 1) * theta) j++

  return j
}

export function lensDepth(lump: Lump | undefined): Int32Array {
  const [sx, sy, sz] = LENS
  const out = new Int32Array(sx * sy * sz).fill(LENS_DEPTH)

  if (!lump) return out

  const phi = evenPotential(lump)
  const theta = lensTheta(lump)

  for (let y = 0; y < out.length; y++) out[y] = LENS_DEPTH + thresholdCount(phi[y]!, theta)

  return out
}

const dockIndex = (x: number, y: number, z: number): number => mod(x, LENS[0]) + LENS[0] * mod(y, LENS[1]) + LENS[0] * LENS[1] * mod(z, LENS[2])

// the straight-line eikonal delay to the exit plane of the ray at (y, z): sum over x of 1/c(D) - 1/c(D0)
export function eikonalDelay(depth: Int32Array, y: number, z: number): number {
  const c0 = lightSpeed(LENS_DEPTH)
  let tau = 0

  for (let x = LENS_SOURCE_X; x < LENS_EXIT_X; x++) tau += 1 / lightSpeed(depth[dockIndex(x, y, z)]!) - 1 / c0

  return tau
}

// the continuum weak lens of an index 1 + eps / r truncated at r = K (the threshold's cut): deflection
// 2 eps [1/b - b/(K s) + b/(s (K + s))], s = sqrt(K^2 - b^2), eps = K / (2 D0 + 1)
export function truncatedDeflection(b: number): number {
  const k = LENS_K
  const eps = k / (2 * LENS_DEPTH + 1)
  const s = Math.sqrt(k * k - b * b)

  return b >= k ? 0 : 2 * eps * (1 / b - b / (k * s) + b / (s * (k + s)))
}

// forward only (the control, whose reversal E-GRV-0070 already ran): every detector's arrival and raw trace
function forwardRun(m: Medium, start: HuskLightState, detectors: readonly number[], window: number): { arrival: number[]; traces: Float64Array[]; wraps: Wraps } {
  const s = copyState(start)
  const wraps = noWraps()
  const traces = detectors.map(() => new Float64Array(window + 1))

  for (let t = 1; t <= window; t++) {
    mediumBeat(m, s, wraps)
    detectors.forEach((d, i) => {
      traces[i]![t] = dockWeight(s, d)
    })
  }

  return { arrival: traces.map(halfMaxCentroid), traces, wraps }
}

export type LensSurvey = {
  depthMaxLump: number
  depthFlipIdentical: boolean
  depthColumnsDeepened: number
  shellRadius: number[]
  boundary: number
  // exit-plane detectors: y line at z = center (first LENS[1]), then z line at y = center (next LENS[2])
  u0: { arrival: number[]; wraps: Wraps }
  lump: Run
  flipMediumIdentical: boolean
  eikonalY: number[]
  eikonalZ: number[]
  // the self-energy of a unit charge (charge blind, q^2) at r from the lump, per link pi / D, along +y and +z,
  // and the even field's own interaction energy of unit content there, (pi / D0) phi
  selfEnergy: number[]
  evenEnergy: number[]
  seconds: number
}

let lensCache: LensSurvey | undefined

export function lensSurvey(log?: (what: string) => void): LensSurvey {
  if (lensCache) return lensCache

  const started = Date.now()
  const [sx, sy, sz] = LENS
  const [cx, cy, cz] = LENS_CENTER
  const depthLump = lensDepth(lensLump(false))
  const depthFlip = lensDepth(lensLump(true))
  const medium = (depth: Int32Array): Medium => makeMedium(LENS, (x, y, z) => depth[dockIndex(x, y, z)]!)
  const m0 = makeMedium(LENS, () => LENS_DEPTH)
  const mLump = medium(depthLump)
  const mFlip = medium(depthFlip)
  const detectors = [
    ...Array.from({ length: sy }, (_, y) => dockAt(m0, LENS_EXIT_X, y, cz)),
    ...Array.from({ length: sz }, (_, z) => dockAt(m0, LENS_EXIT_X, cy, z)),
  ]
  const start = planarPacket(m0, LENS_SOURCE_X, LENS_AMP, LENS_HALF_WIDTH)
  const u0 = forwardRun(m0, start, detectors, LENS_WINDOW)

  log?.(`u0 ${(Date.now() - started) / 1000}s`)

  const lump = runPacket(mLump, start, detectors, LENS_WINDOW, 10)

  log?.(`lump ${(Date.now() - started) / 1000}s`)

  // the flipped lump's medium: the medium reads the lump only through its per-column parameters, so equal
  // parameters are an equal run (the wave run is not repeated, to keep the run light)
  const flipMediumIdentical =
    mFlip.dockDepth.every((v, i) => v === mLump.dockDepth[i]) &&
    mFlip.linkWindow.every((v, i) => v === mLump.linkWindow[i]) &&
    mFlip.triDepth.every((v, i) => v === mLump.triDepth[i])

  // shell radii along +y: the first r at which Delta falls to each value
  const shellRadius: number[] = []
  let last = depthLump[dockIndex(cx, cy, cz)]! - LENS_DEPTH

  for (let r = 1; r <= sy / 2; r++) {
    const d = depthLump[dockIndex(cx, cy + r, cz)]! - LENS_DEPTH

    if (d < last) {
      shellRadius.push(r)
      last = d
    }
  }

  // the self-energy of a unit charge: its static field on the uniform box (source delta minus the mean, E-FRC-0241's
  // Coulomb flux by conjugate gradients), weighted per link by pi / D of the link's start dock
  const g = m0.geometry
  const rho = new Float64Array(g.huskDocks).fill(-1 / g.huskDocks)

  rho[0] = rho[0]! + 1

  const field = coulombFlux(g, rho)
  const energyAt = (px: number, py: number, pz: number): number => {
    let sum = 0

    for (let y = 0; y < g.huskDocks; y++) {
      const x = [y % sx, Math.floor(y / sx) % sy, Math.floor(y / (sx * sy))]
      const shifted = dockIndex(x[0]! - px, x[1]! - py, x[2]! - pz)
      const w = Math.PI / mLump.dockDepth[y]!

      for (let h = 0; h < 9; h++) sum += (w * field[shifted * 9 + h]! ** 2) / (2 * G_METRIC[h]!)
    }

    return sum
  }
  const phi = evenPotential(lensLump(false))
  const selfEnergy = DRIFT_R.map(r => (energyAt(cx, cy + r, cz) + energyAt(cx, cy, cz + r)) / 2)
  const evenEnergy = DRIFT_R.map(r => ((Math.PI / LENS_DEPTH) * (phi[dockIndex(cx, cy + r, cz)]! + phi[dockIndex(cx, cy, cz + r)]!)) / 2)

  lensCache = {
    depthMaxLump: depthLump.reduce((a, v) => Math.max(a, v), 0),
    depthFlipIdentical: depthLump.every((v, i) => v === depthFlip[i]),
    depthColumnsDeepened: depthLump.reduce((c, v) => c + (v > LENS_DEPTH ? 1 : 0), 0),
    shellRadius,
    boundary: boundaryTriangles(mLump),
    u0: { arrival: u0.arrival, wraps: u0.wraps },
    lump,
    flipMediumIdentical,
    eikonalY: Array.from({ length: sy }, (_, y) => eikonalDelay(depthLump, y, cz)),
    eikonalZ: Array.from({ length: sz }, (_, z) => eikonalDelay(depthLump, cy, z)),
    selfEnergy,
    evenEnergy,
    seconds: (Date.now() - started) / 1000,
  }

  return lensCache
}
