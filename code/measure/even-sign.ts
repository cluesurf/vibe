// The signed even field (E-GRV-0076, E-GRV-0077): the even field of E-GRV-0074 with its beat untouched and one
// change in how its energy is counted. The static, Gauss-constraint part of the field's energy takes the opposite
// sign; the radiative part keeps its own.
//
// THE SPLIT (Helmholtz, in the energy's own metric). The field energy of the light is
//   I = (pi / D) [ 1/2 sum E~^2 / g + (kappa / 8) sum n_P B B' ]
// (code/measure/trit-hop-light shadowEnergy: the leapfrog invariant the integer rule keeps on its shadow). Split
// the shadow flux E~ = E_L + E_T with E_L = G grad phi, L phi = div E~ (L = div G grad, the husk Laplacian):
//   E_L is the only gradient field whose divergence is the source, so it is fixed by the content through Gauss at
//       every beat, whatever the waves do (div E~ = div S, since C^T of anything has none)
//   E_T = E~ - E_L has no divergence, and is orthogonal to E_L in the metric 1 / g the energy is written in:
//       sum E_L E_T / g = sum (grad phi) . E_T = - sum phi div E_T = 0
// So the energy splits with no cross term, I = U_L + U_T, U_L = (pi / D) 1/2 sum E_L^2 / g, and U_T = I - U_L holds
// the transverse electric and all the magnetic energy. WHY THIS SPLIT AND NO OTHER: it is the one decomposition
// with (i) a longitudinal part set entirely by the sources (the constraint), (ii) no cross term in the energy's
// own metric, (iii) no choice left (L is invertible on the zero-mean sources the sink makes). Nothing is tuned:
// there is no free parameter in it. The proposal is
//   H' = U_T - U_L = I - 2 U_L
// WHY THE BEAT IS STILL THE RULE'S. The only step H and H' could disagree on is the drift of the longitudinal angle,
// A_L <- A_L + E_L under H and A_L - E_L under H'. A_L is a gradient: it enters no plaquette, so the difference is
// a gauge drift that no field reads (E-GRV-0074 F2: the rule is gauge covariant). The waves, Gauss and reversal
// are the rule's, bit for bit.
//
// WHAT CHANGES FOR MATTER (the cost, stated here and measured by E-GRV-0077). A test source of content s is pulled
// by -dH'/dx = s (E_T - E_L) = s (E~ - 2 E_L), where the unmodified field pulls it by s E~. E~ is the rule's own
// flux and is causal (it changes at a dock only when the rule's front arrives); E_L is L^-1 of the sources and
// changes everywhere the beat a source moves. In the light the two instantaneous pieces of E_L and E_T cancel; with
// the sign flipped they add.
//
// DETERMINISM: every source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule;
// a hop is a scheduled change of one string link (code/rule/trit-husk addCurrent), which the rule reads.

import { divergence, EVEN_DEPTH, evenSurvey, gaussAgainst, longitudinal, LUMP_COLUMN, placedState, SINK_COLUMN, type EvenSurvey, type Placement } from '@/code/measure/even-field'
import { fitPowers } from '@/code/measure/husk-coulomb'
import { coulombFlux, energyMask, G_METRIC, huskGreenDifference, shadowEnergy, shadowWork, type EnergyMask } from '@/code/measure/trit-hop-light'
import {
  AMP,
  copyState,
  D0,
  dockAt,
  emptyState,
  HALF_WIDTH,
  LINE,
  LINE_WINDOW,
  makeMedium,
  mediumBeat,
  mediumBeatBack,
  noWraps,
  planarPacket,
  runPacket,
  sameState,
  SOURCE_X,
  type Medium,
  type Run,
  type Wraps,
} from '@/code/measure/varying-depth-light'
import type { HuskLightState } from '@/code/rule/trit-column'
import { addCurrent, makeHuskEngine, type HuskEngine } from '@/code/rule/trit-husk'

export type EnergyReader = {
  readonly medium: Medium
  readonly engine: HuskEngine
  readonly mask: EnergyMask
  readonly flux: Int32Array
  readonly work: Float64Array[]
}

// a uniform-depth medium's energy reader (the shadow invariant needs the depth's engine)
export function energyReader(m: Medium): EnergyReader {
  return {
    medium: m,
    engine: makeHuskEngine(m.geometry, m.dockDepth[0]!, m.p),
    mask: energyMask(m.geometry, 0, -1),
    flux: new Int32Array(m.geometry.huskLinks),
    work: shadowWork(m.geometry),
  }
}

// the shadow flux E~ on every link
export function shadowFlux(r: EnergyReader, s: HuskLightState): Float64Array {
  shadowEnergy(r.engine, s, r.mask, r.flux, r.work)

  return Float64Array.from(r.work[1]!)
}

// E_L = G grad phi, L phi = div E~ (read off the rule's integer flux: div E~ = div (S - C^T U))
export function longitudinalFlux(m: Medium, s: HuskLightState): Float64Array {
  return coulombFlux(m.geometry, Float64Array.from(divergence(m, s)))
}

export type SignedEnergy = {
  // I: the light's own (unmodified) energy
  invariant: number
  // U_L, U_T = I - U_L, and the proposal H' = U_T - U_L
  longitudinal: number
  transverse: number
  signed: number
  // (pi / D) sum E_L (E~ - E_L) / g: 0 up to the solver's residual when the split has no cross term
  orthogonality: number
}

export function signedEnergy(r: EnergyReader, s: HuskLightState): SignedEnergy {
  const m = r.medium
  const invariant = shadowEnergy(r.engine, s, r.mask, r.flux, r.work)
  const shadow = r.work[1]!
  const el = longitudinalFlux(m, s)
  let ll = 0
  let lt = 0

  for (let l = 0; l < m.geometry.huskLinks; l++) {
    const g = G_METRIC[l % 9]!

    ll += el[l]! ** 2 / (2 * g)
    lt += (el[l]! * (shadow[l]! - el[l]!)) / g
  }

  const k = Math.PI / m.dockDepth[0]!

  return { invariant, longitudinal: k * ll, transverse: invariant - k * ll, signed: invariant - 2 * k * ll, orthogonality: k * lt }
}

// ---------------------------------------------------------------------------------------------------------
// the static pair energy (E-FRC-0241's six configurations, as E-GRV-0074): sources sa at a = 0 and sb at
// b = (r, 0, 0), each compensated at its own far dock Z1 = (0, h, h), Z2 = (r, h, h), h = side / 2. Every
// configuration is run `beats` forward through the rule and back; its longitudinal energy is read at the start
// and at the end (Gauss fixes it)

export type Tally = { runs: number; gauss: number; reversed: boolean; drift: number; wraps: number }

export const newTally = (): Tally => ({ runs: 0, gauss: 0, reversed: true, drift: 0, wraps: 0 })

const wrapsOf = (w: Wraps): number => w.angle + w.field + w.potential

// run a placed state `beats` forward and back: Gauss against its source on every beat, longitudinal energy at the
// start (returned) and its change by the end, exact reversal
export function staticEnergy(m: Medium, placements: readonly Placement[], beats: number, tally: Tally): number {
  const p = placedState(m, placements)
  const s = copyState(p.state)
  const wraps = noWraps()
  const start = longitudinal(m, s)
  let gauss = gaussAgainst(m, s, p.rho)

  for (let t = 1; t <= beats; t++) {
    mediumBeat(m, s, wraps)
    gauss += gaussAgainst(m, s, p.rho)
  }

  const drift = Math.abs(longitudinal(m, s) - start)

  for (let t = 0; t < beats; t++) mediumBeatBack(m, s)

  tally.runs++
  tally.gauss += gauss
  tally.reversed = tally.reversed && sameState(s, p.state)
  tally.drift = Math.max(tally.drift, drift)
  tally.wraps += wrapsOf(wraps)

  return start
}

// the longitudinal interaction energy W_L(r) = U4 - U(a,Z1) - U(b,Z2) + sa sb (U(Z1,Z2) - U(a,Z2) - U(b,Z1)),
// which is sa sb (pi / D)(G(r) - G(0)): the unmodified pair energy. The proposal's is minus it
export function pairLongitudinal(m: Medium, r: number, sa: number, sb: number, beats: number, tally: Tally): number {
  const h = m.sides[0] / 2
  const a = [0, 0, 0]
  const b = [r, 0, 0]
  const z1 = [0, h, h]
  const z2 = [r, h, h]
  const u = (placements: Placement[]): number => staticEnergy(m, placements, beats, tally)
  const u4 = u([
    { at: a, to: z1, units: sa },
    { at: b, to: z2, units: sb },
  ])

  // the three cross configurations are unit dipoles: their energies enter once per unit of sa sb (a first run
  // placed them at sa and sb units, which counts sa^3 sb; E-GRV-0074 never met it, every source there being +-1)
  return u4 - u([{ at: a, to: z1, units: sa }]) - u([{ at: b, to: z2, units: sb }]) + sa * sb * (u([{ at: z1, to: z2, units: 1 }]) - u([{ at: a, to: z2, units: 1 }]) - u([{ at: b, to: z1, units: 1 }]))
}

// ---------------------------------------------------------------------------------------------------------
// a long run with the energy split read every `every` beats

export type EnergySample = SignedEnergy & { beat: number }

export type LongRun = { samples: EnergySample[]; gauss: number; reversed: boolean; wraps: Wraps; seconds: number }

export function longRun(r: EnergyReader, start: HuskLightState, rho: Int32Array, beats: number, every: number): LongRun {
  const t0 = Date.now()
  const m = r.medium
  const s = copyState(start)
  const wraps = noWraps()
  const samples: EnergySample[] = [{ beat: 0, ...signedEnergy(r, s) }]
  let gauss = gaussAgainst(m, s, rho)

  for (let t = 1; t <= beats; t++) {
    mediumBeat(m, s, wraps)
    gauss += gaussAgainst(m, s, rho)

    if (t % every === 0) samples.push({ beat: t, ...signedEnergy(r, s) })
  }

  for (let t = 0; t < beats; t++) mediumBeatBack(m, s)

  return { samples, gauss, reversed: sameState(s, start), wraps, seconds: (Date.now() - t0) / 1000 }
}

// ---------------------------------------------------------------------------------------------------------
// the pull's signal speed: a placed state run twice, once as placed and once with one source hopped one dock at
// beat 0 (S on `link` less `units`, which moves `units` of content from the link's start dock to its end). At
// each watched dock: the largest change of E_L on its 9 out-links at beat 0 (the proposal's pull changes by -2 s
// times it at once), and the first beat at which the rule's own shadow flux on those links differs between the two
// runs (the unmodified pull's first change: the rule's front)

export type HopReading = { longitudinalChange: number[]; ruleArrival: number[]; gauss: number; reversed: boolean }

export function hopReading(r: EnergyReader, placements: readonly Placement[], link: number, units: number, docks: readonly number[], beats: number): HopReading {
  const m = r.medium
  const base = placedState(m, placements)
  const hopped = copyState(base.state)

  addCurrent(hopped, link, units)

  const rhoHopped = divergence(m, hopped)
  const elBase = longitudinalFlux(m, base.state)
  const elHop = longitudinalFlux(m, hopped)
  const longitudinalChange = docks.map(d => {
    let top = 0

    for (let h = 0; h < 9; h++) top = Math.max(top, Math.abs(elHop[d * 9 + h]! - elBase[d * 9 + h]!))

    return top
  })
  const a = copyState(base.state)
  const b = copyState(hopped)
  const ruleArrival = docks.map(() => beats + 1)
  let gauss = 0

  for (let t = 1; t <= beats; t++) {
    mediumBeat(m, a)
    mediumBeat(m, b)
    gauss += gaussAgainst(m, a, base.rho) + gaussAgainst(m, b, rhoHopped)

    const ea = shadowFlux(r, a)
    const eb = shadowFlux(r, b)

    docks.forEach((d, i) => {
      if (ruleArrival[i]! <= beats) return

      for (let h = 0; h < 9; h++) {
        if (ea[d * 9 + h] !== eb[d * 9 + h]) {
          ruleArrival[i] = t
          break
        }
      }
    })
  }

  for (let t = 0; t < beats; t++) mediumBeatBack(m, b)

  return { longitudinalChange, ruleArrival, gauss, reversed: sameState(b, hopped) }
}

// ---------------------------------------------------------------------------------------------------------
// E-GRV-0076: the static proposal. Every number here was fixed before the gated run (the disclosed probe
// tmp/grv76-probe1.ts read one long run's energy split and the cost of a beat, no pair energy)

export const SIGN_SIDE = 16
export const SIGN_BEATS = 16
export const LUMP_CONTENT = 4
export const LIKE_R: readonly number[] = [1, 2, 3, 4, 5, 6, 7]
export const FIT_R: readonly number[] = [2, 3, 4, 5, 6]
export const LONG_BEATS = 2048
export const LONG_EVERY = 64

export type StaticSurvey = {
  even: EvenSurvey
  // W_L(r) of two content-4 sources on the side-16 husk (the unmodified pair energy; the proposal's is minus it),
  // and its torus Green's prediction -sa sb (pi / D)(G(0) - G(r))
  like16: number[]
  green16: number[]
  // the proposal's W'(r) = c0 + c1 / r + c2 r^2 fitted on FIT_R: k = -c1, b = -c2
  fitK: number
  fitB: number
  fitC0: number
  tally: Tally
  lump: LongRun
  pair: LongRun
  zero: LongRun
  // the largest U_L the lump's content can hold with its sink on the side-8 husk (all of it on the one dock
  // farthest from the sink in the Green's sense): the floor of the proposal's static energy for that content
  floor: number
  seconds: number
}

let staticCache: StaticSurvey | undefined

export function staticSurvey(log?: (what: string) => void): StaticSurvey {
  if (staticCache) return staticCache

  const started = Date.now()
  const even = evenSurvey(log)

  log?.(`even survey ${(Date.now() - started) / 1000}s`)

  const m16 = makeMedium([SIGN_SIDE, SIGN_SIDE, SIGN_SIDE], () => EVEN_DEPTH)
  const tally = newTally()
  const like16 = LIKE_R.map(r => {
    const w = pairLongitudinal(m16, r, LUMP_CONTENT, LUMP_CONTENT, SIGN_BEATS, tally)

    log?.(`like r ${r} ${(Date.now() - started) / 1000}s`)

    return w
  })
  const green16 = LIKE_R.map(r => -LUMP_CONTENT * LUMP_CONTENT * (Math.PI / EVEN_DEPTH) * huskGreenDifference(SIGN_SIDE, [r, 0, 0]))
  const signed = FIT_R.map(r => -like16[LIKE_R.indexOf(r)]!)
  const [c0, c1, c2] = fitPowers(FIT_R, signed, [1, -2]) as [number, number, number]
  const m8 = makeMedium([8, 8, 8], () => EVEN_DEPTH)
  const reader = energyReader(m8)
  const lumpStart = placedState(m8, [{ at: LUMP_COLUMN, to: SINK_COLUMN, units: LUMP_CONTENT }])
  const lump = longRun(reader, lumpStart.state, lumpStart.rho, LONG_BEATS, LONG_EVERY)

  log?.(`lump ${(Date.now() - started) / 1000}s`)

  const pairStart = placedState(m8, [
    { at: [0, 0, 0], to: [0, 4, 4], units: LUMP_CONTENT },
    { at: [2, 0, 0], to: [2, 4, 4], units: LUMP_CONTENT },
  ])
  const pair = longRun(reader, pairStart.state, pairStart.rho, LONG_BEATS, LONG_EVERY)
  const zero = longRun(reader, emptyState(m8), new Int32Array(m8.geometry.huskDocks), LONG_BEATS, LONG_EVERY)

  log?.(`pair and zero ${(Date.now() - started) / 1000}s`)

  staticCache = {
    even,
    like16,
    green16,
    fitK: -c1,
    fitB: -c2,
    fitC0: c0,
    tally,
    lump,
    pair,
    zero,
    // the largest over every offset of the source from its sink (a convex energy is largest at a vertex of the
    // placements, so all of the content on one dock)
    floor: LUMP_CONTENT * LUMP_CONTENT * (Math.PI / EVEN_DEPTH) * Math.max(...Array.from({ length: 512 }, (_, y) => huskGreenDifference(8, [y % 8, Math.floor(y / 8) % 8, Math.floor(y / 64)]))),
    seconds: (Date.now() - started) / 1000,
  }

  return staticCache
}

// ---------------------------------------------------------------------------------------------------------
// E-GRV-0077: free fall, the packet, the long runs and the pull's signal speed. Fixed before the gated run

export const FALL_R: readonly number[] = [3, 5]
export const FALL_AT = 4
export const FALL_LONG = 4096
export const FALL_EVERY = 128
export const HOP_D: readonly number[] = [2, 3, 4, 5, 6, 7]
export const HOP_BEATS = 32
export const PACKET_DETECTORS: readonly number[] = [60, 100]
export const PACKET_EVERY = 35
export const DEEP = 64

// the test cases: a source of `source` units and a test lump of `test` units on the copy named. On the even copy
// a unit is one slot of content, love or fear alike; on the light it is charge
export type FallCase = { name: string; copy: 'even' | 'light'; source: number; test: number; content: number }

export const FALL_CASES: readonly FallCase[] = [
  // the neutral source (2 love, 2 fear: content 4, charge 0), a light lump of 1 love, a heavy lump of 3 fear
  { name: 'even_light', copy: 'even', source: 4, test: 1, content: 1 },
  { name: 'even_heavy', copy: 'even', source: 4, test: 3, content: 3 },
  // control: a charged source (3 love, 1 fear: charge +2) on the light, pulling the same two lumps (charges +1, -3)
  { name: 'light_light', copy: 'light', source: 2, test: 1, content: 1 },
  { name: 'light_heavy', copy: 'light', source: 2, test: -3, content: 3 },
  // control: no source
  { name: 'zero', copy: 'even', source: 0, test: 1, content: 1 },
]

export type FallSurvey = {
  // per case, W_L at FALL_R (the unmodified pair energy of the case's copy)
  pairs: Record<string, number[]>
  tally: Tally
  packet: Run
  packetSpeed: number
  packetEnergy: LongRun
  lump: LongRun
  lumpDeep: LongRun
  zero: LongRun
  hop: HopReading
  seconds: number
}

let fallCache: FallSurvey | undefined

export function fallSurvey(log?: (what: string) => void): FallSurvey {
  if (fallCache) return fallCache

  const started = Date.now()
  const m16 = makeMedium([SIGN_SIDE, SIGN_SIDE, SIGN_SIDE], () => EVEN_DEPTH)
  const tally = newTally()
  const pairs: Record<string, number[]> = {}

  for (const c of FALL_CASES) {
    pairs[c.name] = FALL_R.map(r => pairLongitudinal(m16, r, c.source, c.test, SIGN_BEATS, tally))
    log?.(`${c.name} ${(Date.now() - started) / 1000}s`)
  }

  // the packet: E-GRV-0070's line, depth, amplitude and support
  const line = makeMedium(LINE, () => D0)
  const packetStart = planarPacket(line, SOURCE_X, AMP, HALF_WIDTH)
  const packet = runPacket(
    line,
    packetStart,
    PACKET_DETECTORS.map(x => dockAt(line, x, 0, 0)),
    LINE_WINDOW,
  )
  const packetEnergy = longRun(energyReader(line), packetStart, new Int32Array(line.geometry.huskDocks), LINE_WINDOW, PACKET_EVERY)

  log?.(`packet ${(Date.now() - started) / 1000}s`)

  const long = (depth: number): LongRun => {
    const m = makeMedium([8, 8, 8], () => depth)
    const p = placedState(m, [{ at: LUMP_COLUMN, to: SINK_COLUMN, units: LUMP_CONTENT }])

    return longRun(energyReader(m), p.state, p.rho, FALL_LONG, FALL_EVERY)
  }
  const lump = long(EVEN_DEPTH)

  log?.(`lump ${(Date.now() - started) / 1000}s`)

  const lumpDeep = long(DEEP)
  const m8 = makeMedium([8, 8, 8], () => EVEN_DEPTH)
  const zero = longRun(energyReader(m8), emptyState(m8), new Int32Array(m8.geometry.huskDocks), FALL_LONG, FALL_EVERY)

  log?.(`deep and zero ${(Date.now() - started) / 1000}s`)

  const h = SIGN_SIDE / 2
  const hop = hopReading(
    energyReader(m16),
    [{ at: [0, 0, 0], to: [h, h, h], units: LUMP_CONTENT }],
    dockAt(m16, 0, 0, 0) * 9,
    LUMP_CONTENT,
    HOP_D.map(d => dockAt(m16, 0, d, 0)),
    HOP_BEATS,
  )

  log?.(`hop ${(Date.now() - started) / 1000}s`)

  fallCache = {
    pairs,
    tally,
    packet,
    packetSpeed: (PACKET_DETECTORS[1]! - PACKET_DETECTORS[0]!) / (packet.arrival[1]! - packet.arrival[0]!),
    packetEnergy,
    lump,
    lumpDeep,
    zero,
    hop,
    seconds: (Date.now() - started) / 1000,
  }

  return fallCache
}
