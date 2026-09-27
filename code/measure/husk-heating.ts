// Why the one-level husk light heats a clean wave, and whether the shaped light stops it (E-FRC-0254, 0255).
// Real numbers live here only: the rules (code/rule/trit-husk, trit-husk-shaped) hold integers.
//
// THE RULE UNDER TEST. E-GRV-0070 to 0077 run code/measure/varying-depth-light's mediumBeat, which at one depth is
// code/rule/trit-husk's fastBeat, which is code/rule/trit-husk-shaped's shapedBeat at ONE level (E-FRC-0214 X).
// So every run here steps shapedBeat, with levels = 1 for the rule E-GRV-0077 ran.
//
// THE IDENTITY (E-FRC-0214's derivation, checked here beat by beat on E-GRV-0077's own packet). After a beat the
// state holds the counter D_(t+1) and the lag D_t, and the reading of code/measure/trit-hop-light shadowEnergy is
//   A~ = A + C^T lag / q,   E~ = (S - C^T U) + C^T (counter - lag) / q
// While no angle, field or potential wraps, the next beat gives exactly
//   A~' - A~ = E~                                                    (the drift: 0 off)
//   E~' - E~ = - C^T (n p B~(A~') / q) + C^T (R' - R) / q^2          (the kick)
// with B~ = centered(C W A) + C W C^T lag / q and R the spatial remainder (the `spatial` register, -h .. h). The
// linear leapfrog is the same two lines without the last term. Moving the difference into the drift (E^ = E~ -
// C^T R / q^2 runs the linear kick exactly) leaves A~' - A~ = E^ + C^T R / q^2, a push of up to 1 / (2q) per
// triangle every beat that is not a difference of anything bounded. So the one-level rule is the linear leapfrog
// plus that push, exactly, and all its change of energy is the push's.
//
// THE COMPACT READING. The field B is read mod N_B = 4D, and the Villain / cosine reading of the magnetic term
// replaces B0 B1 by (N_B / pi)^2 sin(pi B0 / N_B) sin(pi B1 / N_B). On a run with zero wraps the rule never
// evaluates a wrap, so no compact energy is singled out by the step; the cosine reading is computed to show it
// moves as the quadratic one does.
//
// DETERMINISM: every start is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import { G_METRIC, coulombFlux, energyMask } from '@/code/measure/trit-hop-light'
import { carriedFractions, curlT, makeShadowScratch, shadowReading } from '@/code/measure/trit-shaped-light'
import { dockWeight, halfMaxCentroid, makeMedium, planarPacket, type Medium } from '@/code/measure/varying-depth-light'
import { placedState, type Placement } from '@/code/measure/even-field'
import type { HuskLightState } from '@/code/rule/trit-column'
import { makeHuskEngine, type HuskEngine, type HuskGeometry } from '@/code/rule/trit-husk'
import { copyShaped, emptyShaped, makeShapedScratch, shapedArrays, shapedBeat, shapedBeatBack, shapedFlux, type ShapedOptions, type ShapedState } from '@/code/rule/trit-husk-shaped'

const mod = (x: number, m: number): number => ((x % m) + m) % m

// a one-level state lifted to `levels` (the upper counters start at 0)
export function liftState(g: HuskGeometry, s: HuskLightState, levels: number): ShapedState {
  const out = emptyShaped(g, levels)

  out.angle.set(s.angle)
  out.potential.set(s.potential)
  out.counter.set(s.counter)
  out.lag.set(s.lag)
  out.spatial.set(s.spatial)
  out.string.set(s.string)

  return out
}

// the weighted plaquette sum (C W x)_P on real or integer link values
function plaquette(g: HuskGeometry, x: ArrayLike<number>, p: number): number {
  let b = 0

  for (let j = 0; j < 3; j++) {
    const l = g.triLinks[p * 3 + j]!

    b += g.triSigns[p * 3 + j]! * g.weight[l % 9]! * x[l]!
  }

  return b
}

function intCurlT(g: HuskGeometry, x: Int32Array): Float64Array {
  const out = new Float64Array(g.huskLinks)

  curlT(g, Float64Array.from(x), out)

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the identity, beat by beat, on the one-level rule

export type KickIdentity = {
  beats: number
  // beats on which some value wrapped (the identity is stated for none)
  wrappedBeats: number
  // largest |A~' - A~ - E~| over links and beats
  driftOff: number
  // largest |(E~' - E~ + C^T n p B~(A~') / q) - C^T (R' - R) / q^2|
  kickOff: number
  // largest |C^T (R' - R) / q^2|, the size of what the identity isolates
  residualTop: number
  // the same residual read against the linear kick's own size
  kickTop: number
}

export function kickIdentity(engine: HuskEngine, start: HuskLightState, beats: number): KickIdentity {
  const g = engine.geometry
  const { q, p: pp, nb } = engine
  const options: ShapedOptions = { levels: 1, cyclic: false }
  const s = liftState(g, start, 1)
  const scratch = makeShapedScratch(g, 1)
  const flux = new Int32Array(g.huskLinks)
  let wrappedBeats = 0
  let driftOff = 0
  let kickOff = 0
  let residualTop = 0
  let kickTop = 0

  for (let t = 0; t < beats; t++) {
    shapedFlux(engine, s, false, flux)

    const e0 = Float64Array.from(flux)
    const lag0 = intCurlT(g, s.lag)
    const cnt0 = intCurlT(g, s.counter)
    const a0 = Int32Array.from(s.angle)
    const u0 = Int32Array.from(s.potential)
    const r0 = Int32Array.from(s.spatial)
    const counter0 = Int32Array.from(s.counter)

    shapedBeat(engine, s, scratch, options)

    // wraps: the angle, the field, the potential
    let wrapped = false

    for (let l = 0; l < g.huskLinks; l++) if (s.angle[l] !== a0[l]! + e0[l]!) wrapped = true

    for (let p = 0; p < g.triangles; p++) {
      const raw = plaquette(g, s.angle, p)

      if (raw < -nb / 2 || raw >= nb / 2) wrapped = true
      if (Math.abs(s.potential[p]! - u0[p]!) > g.multiplicity[p]! * engine.depth) wrapped = true
    }

    if (wrapped) {
      wrappedBeats++
      continue
    }

    shapedFlux(engine, s, false, flux)

    const lag1 = intCurlT(g, s.lag)
    const cnt1 = intCurlT(g, s.counter)
    // the linear kick on the shadow angle after the drift
    const kickTri = new Float64Array(g.triangles)

    for (let p = 0; p < g.triangles; p++) {
      const b = mod(plaquette(g, s.angle, p) + nb / 2, nb) - nb / 2 + plaquette(g, lag1, p) / q

      kickTri[p] = (g.multiplicity[p]! * pp * b) / q
    }

    const kick = new Float64Array(g.huskLinks)
    const dr = new Float64Array(g.triangles)

    curlT(g, kickTri, kick)

    for (let p = 0; p < g.triangles; p++) dr[p] = (s.spatial[p]! - r0[p]!) / (q * q)

    const predicted = new Float64Array(g.huskLinks)

    curlT(g, dr, predicted)

    for (let l = 0; l < g.huskLinks; l++) {
      const shadow0 = e0[l]! + (cnt0[l]! - lag0[l]!) / q
      const shadow1 = flux[l]! + (cnt1[l]! - lag1[l]!) / q
      const drift = s.angle[l]! + lag1[l]! / q - (a0[l]! + lag0[l]! / q) - shadow0
      const rho = shadow1 - shadow0 + kick[l]!

      driftOff = Math.max(driftOff, Math.abs(drift))
      kickOff = Math.max(kickOff, Math.abs(rho - predicted[l]!))
      residualTop = Math.max(residualTop, Math.abs(predicted[l]!))
      kickTop = Math.max(kickTop, Math.abs(kick[l]!))
    }

    // the lag took the counter (checked, not assumed)
    for (let p = 0; p < g.triangles; p++) if (s.lag[p] !== counter0[p]) driftOff = Math.max(driftOff, 1)
  }

  return { beats, wrappedBeats, driftOff, kickOff, residualTop, kickTop }
}

// ---------------------------------------------------------------------------------------------------------
// the cosine (Villain-like) reading of the shadow invariant: the magnetic product B0 B1 replaced by
// (N_B / pi)^2 sin(pi B0 / N_B) sin(pi B1 / N_B); equal to the quadratic reading as B / N_B -> 0

export function compactReading(engine: HuskEngine, s: ShapedState, options: ShapedOptions): { energy: number; topField: number } {
  const g = engine.geometry
  const { now, next } = carriedFractions(engine, s)
  const kappa = (2 * engine.p) / engine.q
  const nb = engine.nb
  const flux = new Int32Array(g.huskLinks)
  const nowCurl = new Float64Array(g.huskLinks)
  const nextCurl = new Float64Array(g.huskLinks)

  shapedFlux(engine, s, options.cyclic, flux)
  curlT(g, now, nowCurl)
  curlT(g, next, nextCurl)

  let e = 0
  let topField = 0

  for (let l = 0; l < g.huskLinks; l++) {
    const x = flux[l]! + nextCurl[l]! - nowCurl[l]!

    e += (x * x) / (2 * G_METRIC[l % 9]!)
  }

  const moved = new Float64Array(g.huskLinks)

  for (let l = 0; l < g.huskLinks; l++) moved[l] = s.angle[l]! + flux[l]!

  for (let p = 0; p < g.triangles; p++) {
    const b0 = mod(plaquette(g, s.angle, p) + nb / 2, nb) - nb / 2 + plaquette(g, nowCurl, p)
    const b1 = mod(plaquette(g, moved, p) + nb / 2, nb) - nb / 2 + plaquette(g, nextCurl, p)

    topField = Math.max(topField, Math.abs(b0))
    e += (kappa / 8) * g.multiplicity[p]! * (nb / Math.PI) ** 2 * Math.sin((Math.PI * b0) / nb) * Math.sin((Math.PI * b1) / nb)
  }

  return { energy: (Math.PI / engine.depth) * e, topField }
}

// ---------------------------------------------------------------------------------------------------------
// a long run of the shaped light from a placed start: the shadow invariant (and its cosine reading) every `every`
// beats, wraps, Gauss against the start's divergence, optional detectors, and exact reversal

export type HeatSample = { beat: number; invariant: number; compact: number }

export type Wraps = { angle: number; field: number; potential: number }

export type HeatRun = {
  samples: HeatSample[]
  wraps: Wraps
  gauss: number
  reversed: boolean
  // per detector, the half-maximum arrival over the first `window` beats
  arrival: number[]
  topField: number
  seconds: number
}

export type HeatInput = {
  medium: Medium
  start: HuskLightState
  levels: number
  cyclic: boolean
  beats: number
  every: number
  detectors?: readonly number[]
  window?: number
}

function divergenceOf(g: HuskGeometry, flux: Int32Array): Int32Array {
  const div = new Int32Array(g.huskDocks)

  for (let l = 0; l < g.huskLinks; l++) {
    div[Math.floor(l / 9)] = div[Math.floor(l / 9)]! + flux[l]!
    div[g.huskNeighbour[l]!] = div[g.huskNeighbour[l]!]! - flux[l]!
  }

  return div
}

export function heatRun(input: HeatInput): HeatRun {
  const t0 = Date.now()
  const { medium: m, levels, cyclic, beats, every } = input
  const g = m.geometry
  const engine = makeHuskEngine(g, m.dockDepth[0]!, m.p)
  const options: ShapedOptions = { levels, cyclic }
  const s = liftState(g, input.start, levels)
  const start = copyShaped(s)
  const scratch = makeShapedScratch(g, levels)
  const reading = makeShadowScratch(g)
  const all = energyMask(g, 0, -1)
  const flux = new Int32Array(g.huskLinks)
  const detectors = input.detectors ?? []
  const window = input.window ?? beats
  const trace = detectors.map(() => new Float64Array(window + 1))
  const wraps: Wraps = { angle: 0, field: 0, potential: 0 }
  const nb = engine.nb

  shapedFlux(engine, s, cyclic, flux)

  const rho = divergenceOf(g, flux)
  let topField = 0
  const sample = (beat: number): HeatSample => {
    const c = compactReading(engine, s, options)

    topField = Math.max(topField, c.topField)

    return { beat, invariant: shadowReading(engine, s, options, all, reading), compact: c.energy }
  }
  const samples: HeatSample[] = [sample(0)]
  let gauss = 0
  const before = new Int32Array(g.huskLinks)
  const potential = new Int32Array(g.triangles)

  for (let t = 1; t <= beats; t++) {
    shapedFlux(engine, s, cyclic, flux)
    before.set(s.angle)
    potential.set(s.potential)
    shapedBeat(engine, s, scratch, options)

    for (let l = 0; l < g.huskLinks; l++) if (s.angle[l] !== before[l]! + flux[l]!) wraps.angle++

    for (let p = 0; p < g.triangles; p++) {
      const raw = plaquette(g, s.angle, p)

      if (raw < -nb / 2 || raw >= nb / 2) wraps.field++
      if (!cyclic && Math.abs(s.potential[p]! - potential[p]!) > g.multiplicity[p]! * engine.depth) wraps.potential++
    }

    shapedFlux(engine, s, cyclic, flux)

    const div = divergenceOf(g, flux)

    for (let y = 0; y < g.huskDocks; y++) if (div[y] !== rho[y]) gauss++

    if (t <= window) detectors.forEach((d, i) => (trace[i]![t] = dockWeight(s, d)))
    if (t % every === 0) samples.push(sample(t))
  }

  for (let t = 0; t < beats; t++) shapedBeatBack(engine, s, scratch, options)

  const a = shapedArrays(s)
  const b = shapedArrays(start)

  return {
    samples,
    wraps,
    gauss,
    reversed: a.every((x, i) => x.every((v, j) => v === b[i]![j])),
    arrival: trace.map(halfMaxCentroid),
    topField,
    seconds: (Date.now() - t0) / 1000,
  }
}

// the least-squares slope of the invariant against the beat over the samples at or after `from`
export function heatingSlope(run: HeatRun, from: number): number {
  const xs = run.samples.filter(x => x.beat >= from)
  const n = xs.length
  const mx = xs.reduce((a, x) => a + x.beat, 0) / n
  const my = xs.reduce((a, x) => a + x.invariant, 0) / n
  let num = 0
  let den = 0

  for (const x of xs) {
    num += (x.beat - mx) * (x.invariant - my)
    den += (x.beat - mx) ** 2
  }

  return num / den
}

// ---------------------------------------------------------------------------------------------------------
// starts

// E-GRV-0070's plane packet on a line box
export function packetStart(sides: readonly [number, number, number], depth: number, x0: number, amp: number, width: number): { medium: Medium; start: HuskLightState } {
  const medium = makeMedium(sides, () => depth)

  return { medium, start: planarPacket(medium, x0, amp, width) }
}

// E-GRV-0077's standing lump: content placed at one column with its sink
export function lumpStart(side: number, depth: number, placements: readonly Placement[]): { medium: Medium; start: HuskLightState } {
  const medium = makeMedium([side, side, side], () => depth)

  return { medium, start: placedState(medium, placements).state }
}

// the longitudinal energy U_L = (pi / D) 1/2 sum E_L^2 / g of a state's flux (Gauss fixes it; the rule's flux read
// centered when the potential is cyclic)
export function longitudinalOf(medium: Medium, s: HuskLightState, cyclic: boolean): number {
  const g = medium.geometry
  const engine = makeHuskEngine(g, medium.dockDepth[0]!, medium.p)
  const flux = new Int32Array(g.huskLinks)

  shapedFlux(engine, s, cyclic, flux)

  const el = coulombFlux(g, Float64Array.from(divergenceOf(g, flux)))
  let sum = 0

  for (let l = 0; l < g.huskLinks; l++) sum += el[l]! ** 2 / (2 * G_METRIC[l % 9]!)

  return (Math.PI / medium.dockDepth[0]!) * sum
}
