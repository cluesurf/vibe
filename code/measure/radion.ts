// Measurement for the radion (E-GRV-0079, 0080): the integer depth wave of code/rule/trit-radion. Real numbers live
// here only.
//
// THE INVARIANT. The shadow x (phi plus its carried fraction) runs x_(t+1) - 2 x_t + x_(t-1) = - kappa A x_t +
// kappa rho (b = a, so sigma = kappa). Its leapfrog keeps exactly
//   E = (pi / D) [ 1/2 sum (x_(t+1) - x_t)^2 / kappa + 1/2 x_(t+1) . A x_t - rho . (x_(t+1) + x_t) / 2 ]
// (the difference of E over one beat is (x_(t+1) - x_(t-1)) . (the equation's two sides) / 2 = 0). With v = x_(t+1) -
// x_t and m = (x_(t+1) + x_t) / 2, x_(t+1) . A x_t = m . A m - v . A v / 4, so at rho = 0
//   E = (pi / D) [ 1/2 v . (1 / kappa - A / 4) v + 1/2 m . A m ] >= 0
// whenever kappa lambda_max(A) <= 4, and it is 0 only for v = 0 and m uniform (a uniform shift of the depth, which
// no dock can feel). The rule keeps E up to its carried remainder's push, at most 1 / Q^L per dock per beat.
// THE SCALE pi / D: the one normalization the rule does not fix (the equation of motion is the same for any overall
// scale). It is chosen so that a static source's energy is -(pi / D) 1/2 rho . G rho, the light's own longitudinal
// energy (pi / D) 1/2 rho . G rho with the other sign: the coupling to matter equals the light's Coulomb coupling
// (E-GRV-0076's k = sa sb / (24 D)). The SIGN is derived, not chosen: at the static solution A x = rho,
// E = (pi / D) (1/2 x . A x - rho . x) = -(pi / D) 1/2 rho . G rho < 0, and the cross term of two sources is
// -(pi / D) sa sb G(r): like sources ATTRACT, as exchange of an even-spin field must.
//
// THE STATIC READING. Every static run starts at zero field with the sources placed, so the field oscillates about its
// well forever (nothing damps it). The well is read as the Hann-weighted time average of x over T beats (weight
// sin^2 (pi t / T)), which suppresses each oscillating mode by far more than 1 / (theta T); the static energy is then
// E(x_bar) = (pi / D) (1/2 x_bar . A x_bar - rho . x_bar), stationary at the true well so its error is second order.
//
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by
// the rule.

import { fitPowers } from '@/code/measure/husk-coulomb'
import { huskGreenDifference } from '@/code/measure/trit-hop-light'
import { dockAt as mediumDock, lightSpeed, makeMedium, planarPacket, runPacket, type Run } from '@/code/measure/varying-depth-light'
import { copyRadion, emptyRadion, radionBeat, radionBeatBack, radionMesh, radionRule, radionScratch, radionWeight, sameRadion, type RadionMesh, type RadionRule, type RadionState } from '@/code/rule/trit-radion'

const mod = (x: number, m: number): number => ((x % m) + m) % m

export const kappaOf = (rule: RadionRule): number => rule.a / rule.q

// the shadow x at the state's newest beat (`now`) or the one before (`lag`)
export function shadow(rule: RadionRule, s: RadionState, which: 'now' | 'lag'): Float64Array {
  const phi = which === 'now' ? s.phi : s.phiLag
  const counters = which === 'now' ? s.counter : s.counterLag
  const out = Float64Array.from(phi)

  for (let i = 0; i < rule.levels; i++) {
    const scale = rule.q ** (i + 1)
    const c = counters[i]!

    for (let y = 0; y < out.length; y++) out[y] = out[y]! + c[y]! / scale
  }

  return out
}

// u . A v = sum over links of g (u_y - u_z)(v_y - v_z)
export function bilinear(mesh: RadionMesh, u: Float64Array, v: Float64Array): number {
  let s = 0

  for (let y = 0; y < mesh.docks; y++) {
    for (let h = 0; h < 9; h++) {
      const z = mesh.neighbour[y * 9 + h]!

      s += radionWeight(h) * (u[y]! - u[z]!) * (v[y]! - v[z]!)
    }
  }

  return s
}

export type RadionEnergy = { energy: number; free: number }

// E (and its rho = 0 part, `free`) on the state's last two beats
export function radionEnergy(mesh: RadionMesh, rule: RadionRule, s: RadionState, rho: Int32Array): RadionEnergy {
  const x1 = shadow(rule, s, 'now')
  const x0 = shadow(rule, s, 'lag')
  const kappa = kappaOf(rule)
  let kinetic = 0
  let source = 0

  for (let y = 0; y < mesh.docks; y++) {
    kinetic += (x1[y]! - x0[y]!) ** 2
    source += (rho[y]! * (x1[y]! + x0[y]!)) / 2
  }

  const free = (Math.PI / rule.depth) * (kinetic / (2 * kappa) + bilinear(mesh, x1, x0) / 2)

  return { energy: free - (Math.PI / rule.depth) * source, free }
}

// the static energy functional at a field x
export function staticFunctional(mesh: RadionMesh, rule: RadionRule, x: Float64Array, rho: Int32Array): number {
  let source = 0

  for (let y = 0; y < mesh.docks; y++) source += rho[y]! * x[y]!

  return (Math.PI / rule.depth) * (bilinear(mesh, x, x) / 2 - source)
}

// the top of the husk Laplacian's spectrum on a side^3 torus (its symbol at every mode), and Gershgorin's bound 48
export function laplacianTop(side: number): number {
  let top = 0
  const vectors = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
    [1, -1, 0],
    [1, 0, 1],
    [1, 0, -1],
    [0, 1, 1],
    [0, 1, -1],
  ]

  for (let c = 0; c < side; c++) {
    for (let b = 0; b < side; b++) {
      for (let a = 0; a < side; a++) {
        let l = 0

        vectors.forEach((u, h) => {
          l += radionWeight(h) * 2 * (1 - Math.cos((2 * Math.PI * (a * u[0]! + b * u[1]! + c * u[2]!)) / side))
        })
        top = Math.max(top, l)
      }
    }
  }

  return top
}

// ---------------------------------------------------------------------------------------------------------
// sources

export type Source = { at: readonly number[]; to: readonly number[]; units: number }

const dockOf = (mesh: RadionMesh, v: readonly number[]): number => {
  const [sx, sy, sz] = mesh.sides

  return mod(v[0]!, sx) + sx * mod(v[1]!, sy) + sx * sy * mod(v[2]!, sz)
}

// each source puts `units` of content at `at` and its compensator -units at `to` (a closed husk cannot hold a
// never-negative source alone: E-GRV-0074's far sink, a disclosed stand-in)
export function rhoOf(mesh: RadionMesh, sources: readonly Source[]): Int32Array {
  const rho = new Int32Array(mesh.docks)

  for (const s of sources) {
    rho[dockOf(mesh, s.at)] = rho[dockOf(mesh, s.at)]! + s.units
    rho[dockOf(mesh, s.to)] = rho[dockOf(mesh, s.to)]! - s.units
  }

  return rho
}

// the content of a lump of love and fear: the even source reads love plus fear (the light reads love minus fear)
export const contentOf = (love: number, fear: number): number => love + fear
export const chargeOf = (love: number, fear: number): number => love - fear

// ---------------------------------------------------------------------------------------------------------
// runs

export type Tally = { runs: number; reversed: boolean }

export const newTally = (): Tally => ({ runs: 0, reversed: true })

export type StaticRun = { mean: Float64Array; energy: number }

// from zero field, T beats forward (Hann average of x), then T back, compared bit for bit with the start
export function staticRun(mesh: RadionMesh, rule: RadionRule, rho: Int32Array, beats: number, tally: Tally): StaticRun {
  const s = emptyRadion(mesh, rule.levels)
  const start = copyRadion(s)
  const scratch = radionScratch(mesh, rule.levels)
  const mean = new Float64Array(mesh.docks)
  let weight = 0

  for (let t = 1; t <= beats; t++) {
    radionBeat(mesh, rule, s, rho, scratch)

    const w = Math.sin((Math.PI * t) / beats) ** 2

    if (w === 0) continue

    const x = shadow(rule, s, 'now')

    for (let y = 0; y < mesh.docks; y++) mean[y] = mean[y]! + w * x[y]!
    weight += w
  }

  for (let t = 0; t < beats; t++) radionBeatBack(mesh, rule, s, rho, scratch)

  for (let y = 0; y < mesh.docks; y++) mean[y] = mean[y]! / weight

  tally.runs++
  tally.reversed = tally.reversed && sameRadion(s, start)

  return { mean, energy: staticFunctional(mesh, rule, mean, rho) }
}

// the six configurations of E-FRC-0241 (as code/measure/even-sign pairLongitudinal): sources sa at a = 0 and sb at
// b = (r, 0, 0), compensated at Z1 = (0, h, h), Z2 = (r, h, h), h = side / 2:
//   W = U4 - U(a,Z1) - U(b,Z2) + sa sb (U(Z1,Z2) - U(a,Z2) - U(b,Z1)),  predicted sa sb (pi / D) (G(0) - G(r))
// (the scalar's energies are the light's longitudinal ones with the other sign). Every configuration is its own run
export function pairEnergy(mesh: RadionMesh, rule: RadionRule, r: number, sa: number, sb: number, beats: number, tally: Tally): number {
  const h = mesh.sides[0] / 2
  const a = [0, 0, 0]
  const b = [r, 0, 0]
  const z1 = [0, h, h]
  const z2 = [r, h, h]
  const u = (sources: Source[]): number => staticRun(mesh, rule, rhoOf(mesh, sources), beats, tally).energy
  const u4 = u([
    { at: a, to: z1, units: sa },
    { at: b, to: z2, units: sb },
  ])

  return u4 - u([{ at: a, to: z1, units: sa }]) - u([{ at: b, to: z2, units: sb }]) + sa * sb * (u([{ at: z1, to: z2, units: 1 }]) - u([{ at: a, to: z2, units: 1 }]) - u([{ at: b, to: z1, units: 1 }]))
}

export const pairPredicted = (side: number, depth: number, r: number, sa: number, sb: number): number => sa * sb * (Math.PI / depth) * huskGreenDifference(side, [r, 0, 0])

export type LongSample = { beat: number; energy: number; free: number }

export type LongRadion = { samples: LongSample[]; reversed: boolean; seconds: number }

// a long run from a placed start, E every `every` beats, then back to the start bit for bit
export function longRadion(mesh: RadionMesh, rule: RadionRule, start: RadionState, rho: Int32Array, beats: number, every: number): LongRadion {
  const t0 = Date.now()
  const s = copyRadion(start)
  const scratch = radionScratch(mesh, rule.levels)
  const samples: LongSample[] = [{ beat: 0, ...radionEnergy(mesh, rule, s, rho) }]

  for (let t = 1; t <= beats; t++) {
    radionBeat(mesh, rule, s, rho, scratch)

    if (t % every === 0) samples.push({ beat: t, ...radionEnergy(mesh, rule, s, rho) })
  }

  for (let t = 0; t < beats; t++) radionBeatBack(mesh, rule, s, rho, scratch)

  return { samples, reversed: sameRadion(s, start), seconds: (Date.now() - t0) / 1000 }
}

// a free packet at rest: phi = floor(amp (w^2 - d^2)^2 / w^4) for d^2 < w^2 around `center`, the lag equal
export function restingBump(mesh: RadionMesh, levels: number, center: readonly number[], amp: number, w: number): RadionState {
  const s = emptyRadion(mesh, levels)
  const [sx, sy, sz] = mesh.sides

  for (let y = 0; y < mesh.docks; y++) {
    const c = [y % sx, Math.floor(y / sx) % sy, Math.floor(y / (sx * sy))]
    const d2 = [0, 1, 2].reduce((acc, i) => acc + (mod(c[i]! - center[i]! + mesh.sides[i]! / 2, mesh.sides[i]!) - mesh.sides[i]! / 2) ** 2, 0)

    if (d2 < w * w) {
      const v = amp * (w * w - d2) ** 2
      const f = (v - mod(v, w ** 4)) / w ** 4

      s.phi[y] = f
      s.phiLag[y] = f
    }
  }

  return s
}

// ---------------------------------------------------------------------------------------------------------
// E-GRV-0079: statics, charge blindness, the invariant, reversal. Fixed before the gated run

export const RADION_DEPTH = 16
export const RADION_LEVELS = 3
export const STATIC_SIDE = 16
export const STATIC_BEATS = 1024
export const LIKE_CONTENT = 4
export const LIKE_R: readonly number[] = [1, 2, 3, 4, 5, 6, 7]
export const FIT_R: readonly number[] = [2, 3, 4, 5, 6]
export const LONG_BEATS = 4096
export const LONG_EVERY = 64
export const LUMP_SIDE = 8
export const LUMP_AT: readonly number[] = [2, 2, 2]
export const SINK_AT: readonly number[] = [6, 6, 6]
export const BUMP_AMP = 12
export const BUMP_WIDTH = 4
export const BLIND_BEATS = 64

export type StaticSurvey = {
  // W(r) of two like sources of content 4 on the side-16 husk, and its torus Green's prediction
  like: number[]
  predicted: number[]
  fitK: number
  fitB: number
  fitC0: number
  tally: Tally
  // S2: a lump of 3 love and 1 fear against its flip, beat for beat; and the same rule fed the charge
  blindBeats: number
  blindIdentical: number
  chargeIdentical: number
  blindReversed: boolean
  // S3: the spectrum and the long runs at 3 levels and at 1
  laplacianTop: number
  packet: LongRadion
  packetOne: LongRadion
  lump: LongRadion
  lumpOne: LongRadion
  lumpStatic: number
  seconds: number
}

let staticCache: StaticSurvey | undefined

export function radionStaticSurvey(log?: (what: string) => void): StaticSurvey {
  if (staticCache) return staticCache

  const started = Date.now()
  const mesh = radionMesh([STATIC_SIDE, STATIC_SIDE, STATIC_SIDE])
  const rule = radionRule(RADION_DEPTH, RADION_LEVELS)
  const tally = newTally()
  const like = LIKE_R.map(r => {
    const w = pairEnergy(mesh, rule, r, LIKE_CONTENT, LIKE_CONTENT, STATIC_BEATS, tally)

    log?.(`like r ${r} ${(Date.now() - started) / 1000}s`)

    return w
  })
  const predicted = LIKE_R.map(r => pairPredicted(STATIC_SIDE, RADION_DEPTH, r, LIKE_CONTENT, LIKE_CONTENT))
  const [c0, c1, c2] = fitPowers(FIT_R, FIT_R.map(r => like[LIKE_R.indexOf(r)]!), [1, -2]) as [number, number, number]

  // S2
  const small = radionMesh([LUMP_SIDE, LUMP_SIDE, LUMP_SIDE])
  const sourceOf = (units: number): Int32Array => rhoOf(small, [{ at: LUMP_AT, to: SINK_AT, units }])
  const run = (rho: Int32Array): RadionState[] => {
    const s = emptyRadion(small, rule.levels)
    const scratch = radionScratch(small, rule.levels)
    const trace: RadionState[] = []

    for (let t = 0; t < BLIND_BEATS; t++) {
      radionBeat(small, rule, s, rho, scratch)
      trace.push(copyRadion(s))
    }

    for (let t = 0; t < BLIND_BEATS; t++) radionBeatBack(small, rule, s, rho, scratch)

    tally.runs++
    tally.reversed = tally.reversed && sameRadion(s, emptyRadion(small, rule.levels))

    return trace
  }
  const lump = run(sourceOf(contentOf(3, 1)))
  const flip = run(sourceOf(contentOf(1, 3)))
  const lumpCharge = run(sourceOf(chargeOf(3, 1)))
  const flipCharge = run(sourceOf(chargeOf(1, 3)))

  log?.(`blind ${(Date.now() - started) / 1000}s`)

  // S3
  const one = radionRule(RADION_DEPTH, 1)
  const zero = new Int32Array(mesh.docks)
  const center = [STATIC_SIDE / 2, STATIC_SIDE / 2, STATIC_SIDE / 2]
  const packet = longRadion(mesh, rule, restingBump(mesh, RADION_LEVELS, center, BUMP_AMP, BUMP_WIDTH), zero, LONG_BEATS, LONG_EVERY)
  const packetOne = longRadion(mesh, one, restingBump(mesh, 1, center, BUMP_AMP, BUMP_WIDTH), zero, LONG_BEATS, LONG_EVERY)

  log?.(`packet ${(Date.now() - started) / 1000}s`)

  const lumpRho = sourceOf(LIKE_CONTENT)
  const lumpRun = longRadion(small, rule, emptyRadion(small, RADION_LEVELS), lumpRho, LONG_BEATS, LONG_EVERY)
  const lumpOne = longRadion(small, one, emptyRadion(small, 1), lumpRho, LONG_BEATS, LONG_EVERY)
  const lumpStatic = staticRun(small, rule, lumpRho, STATIC_BEATS, tally).energy

  log?.(`lump ${(Date.now() - started) / 1000}s`)

  staticCache = {
    like,
    predicted,
    fitK: -c1,
    fitB: -c2,
    fitC0: c0,
    tally,
    blindBeats: BLIND_BEATS,
    blindIdentical: lump.filter((s, t) => sameRadion(s, flip[t]!)).length,
    chargeIdentical: lumpCharge.filter((s, t) => sameRadion(s, flipCharge[t]!)).length,
    blindReversed: tally.reversed,
    laplacianTop: laplacianTop(STATIC_SIDE),
    packet,
    packetOne,
    lump: lumpRun,
    lumpOne,
    lumpStatic,
    seconds: (Date.now() - started) / 1000,
  }

  return staticCache
}

// ---------------------------------------------------------------------------------------------------------
// E-GRV-0080: the hop, the fall, the light. Fixed before the gated run

export const HOP_D: readonly number[] = [2, 3, 4, 5, 6, 7]
export const HOP_BEATS = 64
export const FALL_R: readonly number[] = [3, 5]
export const FALL_SOURCE = 4
// the lens: a sheet of content 1 per dock at x = LENS_SHEET, its sink sheet half the line away, on a line box
export const LENS_LINE: readonly [number, number, number] = [256, 2, 2]
export const LENS_SHEET = 90
export const LENS_BEATS = 16384
export const LENS_SOURCE_X = 40
export const LENS_AMP = 12
export const LENS_HALF_WIDTH = 16
export const LENS_DETECTORS: readonly number[] = [60, 80, 100, 120]
export const LENS_WINDOW = 620

export type HopSurvey = {
  // per d: the first beat any register at (0, d, 0) differs between the placed and the hopped run, the first beat the
  // change of x there reaches half its final (static) change, and that final change
  firstChange: number[]
  halfArrival: number[]
  finalChange: number[]
  // the change of x at (0, d, 0) after beat 1 (the instant change: E-GRV-0077 R's reading)
  instantChange: number[]
  reversed: boolean
}

export type FallSurvey = {
  // W at FALL_R for the neutral source with the 1-love and the 3-fear test lumps, and a zero source
  light: number[]
  heavy: number[]
  zero: number[]
  tally: Tally
}

export type LensSurvey = {
  // the sheet's static field along x (time average of the rule) and the depth it sets: D0 + the count of half-level
  // thresholds it crosses (the value the rule's own phi register holds at that field)
  field: number[]
  depth: number[]
  closedField: number[]
  u0: Run
  lens: Run
  measuredDelay: number
  eikonalDelay: number
  linearDelay: number
  newtonDelay: number
  fieldReversed: boolean
}

export type CausalSurvey = { hop: HopSurvey; fall: FallSurvey; lens: LensSurvey; seconds: number }

let causalCache: CausalSurvey | undefined

function hopSurvey(mesh: RadionMesh, rule: RadionRule): HopSurvey {
  const h = mesh.sides[0] / 2
  const sink = [h, h, h]
  const rhoA = rhoOf(mesh, [{ at: [0, 0, 0], to: sink, units: FALL_SOURCE }])
  const rhoB = rhoOf(mesh, [{ at: [1, 0, 0], to: sink, units: FALL_SOURCE }])
  const a = emptyRadion(mesh, rule.levels)
  const b = emptyRadion(mesh, rule.levels)
  const scratch = radionScratch(mesh, rule.levels)
  const docks = HOP_D.map(d => dockOf(mesh, [0, d, 0]))
  // the final change: G_T(y - (1,0,0)) - G_T(y) = (G0 - Delta(y - (1,0,0))) - (G0 - Delta(y)), times the content
  const finalChange = HOP_D.map(d => FALL_SOURCE * (huskGreenDifference(mesh.sides[0], [0, d, 0]) - huskGreenDifference(mesh.sides[0], [-1, d, 0])))
  const firstChange = HOP_D.map(() => HOP_BEATS + 1)
  const halfArrival = HOP_D.map(() => HOP_BEATS + 1)
  const instantChange = HOP_D.map(() => 0)
  const registers = (s: RadionState, y: number): number[] => [s.phi[y]!, s.phiLag[y]!, ...s.counter.map(c => c[y]!), ...s.counterLag.map(c => c[y]!), s.rest[y]!]

  for (let t = 1; t <= HOP_BEATS; t++) {
    radionBeat(mesh, rule, a, rhoA, scratch)
    radionBeat(mesh, rule, b, rhoB, scratch)

    const xa = shadow(rule, a, 'now')
    const xb = shadow(rule, b, 'now')

    docks.forEach((y, i) => {
      const ra = registers(a, y)
      const rb = registers(b, y)

      if (firstChange[i]! > HOP_BEATS && ra.some((v, j) => v !== rb[j])) firstChange[i] = t
      if (halfArrival[i]! > HOP_BEATS && Math.abs(xb[y]! - xa[y]!) >= Math.abs(finalChange[i]!) / 2) halfArrival[i] = t
      if (t === 1) instantChange[i] = Math.abs(xb[y]! - xa[y]!)
    })
  }

  for (let t = 0; t < HOP_BEATS; t++) radionBeatBack(mesh, rule, b, rhoB, scratch)

  return { firstChange, halfArrival, finalChange, instantChange, reversed: sameRadion(b, emptyRadion(mesh, rule.levels)) }
}

function lensSurvey(rule: RadionRule, log?: (what: string) => void): LensSurvey {
  const mesh = radionMesh(LENS_LINE)
  const [sx, sy, sz] = LENS_LINE
  const sources: Source[] = []

  for (let z = 0; z < sz; z++) for (let y = 0; y < sy; y++) sources.push({ at: [LENS_SHEET, y, z], to: [LENS_SHEET + sx / 2, y, z], units: 1 })

  const rho = rhoOf(mesh, sources)
  const tally = newTally()
  const run = staticRun(mesh, rule, rho, LENS_BEATS, tally)
  const field = Array.from({ length: sx }, (_, x) => run.mean[dockOf(mesh, [x, 0, 0])]!)
  // closed form: on states uniform in y and z, A is 6 (2 x - x(+1) - x(-1)) per dock, and a unit sheet at 0 with its
  // sink at sx / 2 gives the zero-mean tent x(u) = (sx / 48)(1 - 4 |u| / sx) for |u| <= sx / 2 (u the offset from
  // the sheet): slopes -+1 / 12, a slope jump of 1 / 6 at the sheet
  const closedField = Array.from({ length: sx }, (_, x) => {
    const u = Math.abs(mod(x - LENS_SHEET + sx / 2, sx) - sx / 2)

    return (sx / 48) * (1 - (4 * u) / sx)
  })
  // the half-level thresholds: +j for x >= j - 1/2, -j for x < -(j - 1/2)
  const count = (v: number): number => {
    let j = 0

    if (v >= 0) {
      while (v >= j + 0.5) j++

      return j
    }

    while (v < -(j + 0.5)) j++

    return -j
  }
  const depth = field.map(v => RADION_DEPTH + count(v))

  log?.(`lens field ${run.energy}`)

  const m0 = makeMedium(LENS_LINE, () => RADION_DEPTH)
  const mLens = makeMedium(LENS_LINE, x => depth[x]!)
  const start = planarPacket(m0, LENS_SOURCE_X, LENS_AMP, LENS_HALF_WIDTH)
  const detectors = LENS_DETECTORS.map(x => mediumDock(m0, x, 0, 0))
  const u0 = runPacket(m0, start, detectors, LENS_WINDOW)
  const lens = runPacket(mLens, start, detectors, LENS_WINDOW)
  const first = LENS_DETECTORS[0]!
  const last = LENS_DETECTORS[LENS_DETECTORS.length - 1]!
  const c0 = lightSpeed(RADION_DEPTH)
  let eikonalDelay = 0
  let linearDelay = 0
  let newtonDelay = 0

  for (let x = first; x < last; x++) {
    eikonalDelay += 1 / lightSpeed(depth[x]!) - 1 / c0
    // the linear index n - 1 = x / (2 D0 + 1) of the unthresholded field
    linearDelay += field[x]! / (2 * RADION_DEPTH + 1) / c0
    // the Newtonian count: a unit of content (inertia 1, a stand-in) at x has energy -(pi / D) x, so Phi_N = -(pi / D) x
    // and the index a potential alone gives is 1 - Phi_N / c0^2
    newtonDelay += ((Math.PI / RADION_DEPTH) * field[x]!) / c0 ** 2 / c0
  }

  return {
    field,
    depth,
    closedField,
    u0,
    lens,
    measuredDelay: lens.arrival[LENS_DETECTORS.length - 1]! - lens.arrival[0]! - (u0.arrival[LENS_DETECTORS.length - 1]! - u0.arrival[0]!),
    eikonalDelay,
    linearDelay,
    newtonDelay,
    fieldReversed: tally.reversed,
  }
}

export function radionCausalSurvey(log?: (what: string) => void): CausalSurvey {
  if (causalCache) return causalCache

  const started = Date.now()
  const mesh = radionMesh([STATIC_SIDE, STATIC_SIDE, STATIC_SIDE])
  const rule = radionRule(RADION_DEPTH, RADION_LEVELS)
  const hop = hopSurvey(mesh, rule)

  log?.(`hop ${(Date.now() - started) / 1000}s`)

  const tally = newTally()
  const light = FALL_R.map(r => pairEnergy(mesh, rule, r, FALL_SOURCE, contentOf(1, 0), STATIC_BEATS, tally))
  const heavy = FALL_R.map(r => pairEnergy(mesh, rule, r, FALL_SOURCE, contentOf(0, 3), STATIC_BEATS, tally))
  const zero = FALL_R.map(r => pairEnergy(mesh, rule, r, 0, contentOf(1, 0), STATIC_BEATS, tally))

  log?.(`fall ${(Date.now() - started) / 1000}s`)

  const lens = lensSurvey(rule, log)

  log?.(`lens ${(Date.now() - started) / 1000}s`)

  causalCache = { hop, fall: { light, heavy, zero, tally }, lens, seconds: (Date.now() - started) / 1000 }

  return causalCache
}
