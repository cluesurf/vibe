// Starts and readings for the spanned husk light's electrostatics (code/rule/depth-span-light) and the matter that
// reads it (E-FRC-0254, 0255). Real numbers live here only; the rule holds integers. Starts built here from reals
// are CONSTRUCTION: they choose the integer state a run begins from and are disclosed as such.
//
// THE CHARGE. The flux is S - C^T U and C^T U has no divergence for any U, so each dock's charge is the divergence of
// the strings S alone, fixed for the whole run. Gauss is then that the flux's divergence equals it on every beat.
//
// THE HARMONIC PART. On the torus a string between two charges winds a net flux, a uniform field no potential can
// remove. With the light's metric <a, b> = sum a b / g (g 2 on an axis, 1 on a diagonal) the three parts of a flux
// (the Coulomb gradient g grad phi, the curl C^T u, the uniform e0 g (u . n)) are orthogonal, so the uniform part
// along axis n is e0_n = sum_l S_l (u_l . n) / sum_l g_l (u_l . n)^2.
//
// A RELAXED START (code/measure/trit-kinetic-light relaxStart, the counters in the spanned light's radix). The
// Coulomb flux E_long of the charges (code/measure/trit-hop-light coulombFlux), the potential u solving
// C W C^T u = C W (S - E_long - E_harmonic), U = round(u), and the counters carrying U - u in the triangle's radix
// M_P = q_P^2 (three levels: to M^-3), every lag 0. The spanned rule's shadow E~ = (S - C^T U) + C^T (f_(t+1) - f_t)
// then starts at the static field S - C^T u, and the shadow angle A~ = (Q A + r + C^T f_t) / Q at 0. On a UNIFORM
// depth this is a static solution of the spanned light's linear leapfrog (the kick reads C W A~, which grows as
// C W E / Q = 0 for a curl-free E). On a varying depth the static field is a dielectric's (div of Q grad phi), not
// this one, so the start is built for a uniform depth only and refuses any other.
//
// DETERMINISM: every start is placed; nothing is drawn.

import { TRIT_HUSK_VECTORS } from '@/code/rule/trit-column'
import { makeHuskEngine, type HuskGeometry } from '@/code/rule/trit-husk'
import { copyShaped, emptyShaped, makeShapedScratch, shapedArrays, shapedBeat, shapedBeatBack, type ShapedState } from '@/code/rule/trit-husk-shaped'
import { fieldNumerators, makeFieldScratch, makeMatter } from '@/code/rule/trit-kinetic'
import { coulombFlux, huskGreenDifference } from '@/code/measure/trit-hop-light'
import { addStringPath, huskGaussFailures, relaxStart, solvePotential } from '@/code/measure/trit-kinetic-light'
import { noWraps } from '@/code/measure/varying-depth-light'
import { exactWalkRun, floatWalkRun, type PeierlsSetting } from '@/code/measure/peierls-reading'
import { copySpan, emptySpan, makeSpanMedium, makeSpanScratch, sameSpan, spanBeat, spanBeatBack, spanFlux, type SpanMedium, type SpanState } from '@/code/rule/depth-span-light'

const G = [2, 2, 2, 1, 1, 1, 1, 1, 1]

// the charge on each dock: the divergence of the strings
export function stringCharge(m: SpanMedium, s: SpanState): Float64Array {
  const g = m.geometry
  const rho = new Float64Array(g.huskDocks)

  for (let l = 0; l < g.huskLinks; l++) {
    const v = s.string[l]!

    if (v === 0) continue
    rho[Math.floor(l / 9)] = rho[Math.floor(l / 9)]! + v
    rho[g.huskNeighbour[l]!] = rho[g.huskNeighbour[l]!]! - v
  }

  return rho
}

// the docks where the divergence of the flux S - C^T U differs from the given charge
export function spanGaussFailures(m: SpanMedium, s: SpanState, rho: Float64Array, flux: Int32Array): number {
  const g = m.geometry
  const div = new Float64Array(g.huskDocks)

  spanFlux(m, s, flux)

  for (let l = 0; l < g.huskLinks; l++) {
    div[Math.floor(l / 9)] = div[Math.floor(l / 9)]! + flux[l]!
    div[g.huskNeighbour[l]!] = div[g.huskNeighbour[l]!]! - flux[l]!
  }

  let failures = 0

  for (let y = 0; y < g.huskDocks; y++) if (div[y] !== rho[y]) failures++

  return failures
}

// the uniform (harmonic) part of a flux on the torus, axis by axis
export function harmonicPart(g: HuskGeometry, flux: ArrayLike<number>): Float64Array {
  const out = new Float64Array(g.huskLinks)

  for (let axis = 0; axis < 3; axis++) {
    let num = 0
    let den = 0

    for (let l = 0; l < g.huskLinks; l++) {
      const u = TRIT_HUSK_VECTORS[l % 9]![axis]!

      if (u === 0) continue
      num += flux[l]! * u
      den += G[l % 9]! * u * u
    }

    const e0 = num / den

    for (let l = 0; l < g.huskLinks; l++) out[l] = out[l]! + e0 * G[l % 9]! * TRIT_HUSK_VECTORS[l % 9]![axis]!
  }

  return out
}

export type SpanRelaxed = {
  // the lattice Coulomb flux of the charges, the harmonic part, and the static field S - C^T u the start holds
  long: Float64Array
  harmonic: Float64Array
  field: Float64Array
  // the largest |S - C^T u - E_long - E_harmonic| left after the solve
  residual: number
}

export function spanRelaxStart(m: SpanMedium, s: SpanState): SpanRelaxed {
  const g = m.geometry
  const q0 = m.count[0]!

  if (m.count.some(q => q !== q0)) throw new Error('the relaxed start is built for a uniform depth only')

  const levels = 1 + s.upper.length
  const long = coulombFlux(g, stringCharge(m, s))
  const harmonic = harmonicPart(g, s.string)
  const t = new Float64Array(g.huskLinks)

  for (let l = 0; l < g.huskLinks; l++) t[l] = s.string[l]! - long[l]! - harmonic[l]!

  const u = solvePotential(g, t)
  const curl = new Float64Array(g.huskLinks)

  for (let p = 0; p < g.triangles; p++) for (let j = p * 3; j < p * 3 + 3; j++) curl[g.triLinks[j]!] = curl[g.triLinks[j]!]! + g.triSigns[j]! * u[p]!

  const field = new Float64Array(g.huskLinks)
  let residual = 0

  for (let l = 0; l < g.huskLinks; l++) {
    residual = Math.max(residual, Math.abs(t[l]! - curl[l]!))
    field[l] = s.string[l]! - curl[l]!
  }

  for (let p = 0; p < g.triangles; p++) {
    const big = m.square[p]!
    const h = (big - 1) / 2
    const whole = Math.round(u[p]!)
    let rest = (whole - u[p]!) * big

    s.potential[p] = whole
    s.lag[p] = 0

    const c1 = Math.max(-h, Math.min(h, Math.round(rest)))

    s.counter[p] = c1
    rest = (rest - c1) * big

    for (let i = 0; i < levels - 1; i++) {
      const c = Math.max(-h, Math.min(h, Math.round(rest)))

      s.upper[i]![p] = c
      s.upperLag[i]![p] = 0
      rest = (rest - c) * big
    }

    s.spatial[p] = 0
  }

  return { long, harmonic, field, residual }
}

export type SpanShadowScratch = { now: Float64Array; next: Float64Array; flux: Int32Array }

export const makeSpanShadowScratch = (m: SpanMedium): SpanShadowScratch => ({
  now: new Float64Array(m.geometry.triangles),
  next: new Float64Array(m.geometry.triangles),
  flux: new Int32Array(m.geometry.huskLinks),
})

// the carried fractions f_t (the lags) and f_(t+1) (the counters) of every triangle, in the triangle's radix
function carried(m: SpanMedium, s: SpanState, w: SpanShadowScratch): void {
  const g = m.geometry

  for (let p = 0; p < g.triangles; p++) {
    const big = m.square[p]!
    let a = s.lag[p]! / big
    let b = s.counter[p]! / big
    let scale = big

    for (let i = 0; i < s.upper.length; i++) {
      scale *= big
      a += s.upperLag[i]![p]! / scale
      b += s.upper[i]![p]! / scale
    }

    w.now[p] = a
    w.next[p] = b
  }
}

// the shadow angle A~ = (Q A + r + C^T f_t) / Q and the shadow flux E~ = (S - C^T U) + C^T (f_(t+1) - f_t), per link
export function spanShadow(m: SpanMedium, s: SpanState, w: SpanShadowScratch, angle: Float64Array, flux: Float64Array): void {
  const g = m.geometry

  carried(m, s, w)
  spanFlux(m, s, w.flux)

  for (let l = 0; l < g.huskLinks; l++) {
    angle[l] = s.angle[l]! * m.span[l]! + s.remainder[l]!
    flux[l] = w.flux[l]!
  }

  for (let p = 0; p < g.triangles; p++) {
    const a = w.now[p]!
    const d = w.next[p]! - a

    if (a === 0 && d === 0) continue

    for (let j = p * 3; j < p * 3 + 3; j++) {
      angle[g.triLinks[j]!] = angle[g.triLinks[j]!]! + g.triSigns[j]! * a
      flux[g.triLinks[j]!] = flux[g.triLinks[j]!]! + g.triSigns[j]! * d
    }
  }

  for (let l = 0; l < g.huskLinks; l++) angle[l] = angle[l]! / m.span[l]!
}

// the shadow invariant of code/measure/depth-span with the electric term's weight w_l / (4 Q_l) replaced by
// w_l / (4 Q_l^power): power 1 is the invariant the rule keeps, power 0 the unspanned light's normalization (a
// control: on a light holding transverse waves it is not constant). The magnetic term is the rule's own either way
export function spanEnergyWeighted(m: SpanMedium, s: SpanState, w: SpanShadowScratch, power: number): number {
  const g = m.geometry
  const angle = new Float64Array(g.huskLinks)
  const flux = new Float64Array(g.huskLinks)

  spanShadow(m, s, w, angle, flux)

  let e = 0

  for (let l = 0; l < g.huskLinks; l++) e += ((g.weight[l % 9]! / 4) * flux[l]! * flux[l]!) / m.span[l]! ** power

  // the magnetic term: B' = C W A~ now and C W (A~ + E~ / Q) next, the angle read centered as the rule reads it
  for (let p = 0; p < g.triangles; p++) {
    const nb = 4 * m.triDepth[p]!
    let raw = 0
    let shadow = 0
    let step = 0

    for (let j = p * 3; j < p * 3 + 3; j++) {
      const l = g.triLinks[j]!
      const c = g.triSigns[j]! * g.weight[l % 9]!

      raw += c * s.angle[l]!
      shadow += c * (angle[l]! - s.angle[l]!)
      step += (c * flux[l]!) / m.span[l]!
    }

    const b0 = ((((raw + nb / 2) % nb) + nb) % nb) - nb / 2 + shadow

    e += ((m.p * g.multiplicity[p]!) / (4 * m.count[p]!)) * b0 * (b0 + step)
  }

  return e
}

// ---------------------------------------------------------------------------------------------------------
// E-FRC-0254: Coulomb on the spanned light beside the unspanned one. Fixed before the gated run

export const COULOMB_SIDE = 8
export const COULOMB_DEPTHS: readonly number[] = [4, 16, 32]
// the unspanned light is hot at D 4 (E-FRC-0252's probes; tmp/span-coul-probe1.log: its growth off by 7.05), so the
// side-by-side ratio is read from this depth up
export const COULOMB_COMPARE_FROM = 16
export const COULOMB_SEPARATIONS: readonly number[] = [2, 4]
export const COULOMB_BEATS = 256
export const COULOMB_LEVELS = 3
export const COULOMB_EVERY = 16

export type CoulombReading = {
  depth: number
  r: number
  // the spanned light from the relaxed start: Gauss failures, wraps, reversal, the shadow flux's largest departure
  // from the static field over every beat (over the field's largest value), and the shadow angle's growth per beat
  gauss: number
  wraps: number
  reversed: boolean
  fluxOff: number
  // on links holding at least a twentieth of the largest static field: the largest relative departure of the spanned
  // growth from E / Q and of the unspanned growth from E, and the unspanned over the spanned growth (mean, spread)
  growthOff: number
  oldGrowthOff: number
  ratioMean: number
  ratioSpread: number
  oldGauss: number
  oldReversed: boolean
  // the spanned invariant's electric term on the Coulomb flux, over the Green's difference (G(0) - G(r)) / q
  energyOverGreen: number
  // a strung start (the strings' transverse part left as free light): the drift of the spanned invariant (weight
  // 1 / Q) and of the same sum with the unspanned weight
  strungDrift: number
  strungWrongDrift: number
  strungReversed: boolean
  residual: number
}

export function coulombReading(depth: number, r: number): CoulombReading {
  const side = COULOMB_SIDE
  const levels = COULOMB_LEVELS
  const beats = COULOMB_BEATS
  const m = makeSpanMedium([side, side, side], () => depth)
  const g = m.geometry
  const q = 2 * depth + 1
  const place = (s: ShapedState): void => addStringPath(s, g, [0, 0, 0], [r, 0, 0], 1)

  // the spanned light, relaxed
  const s = emptySpan(m, levels)

  place(s)

  const relaxed = spanRelaxStart(m, s)
  const start = copySpan(s)
  const rho = stringCharge(m, s)
  const scratch = makeSpanScratch(m, levels)
  const w = makeSpanShadowScratch(m)
  const angle = new Float64Array(g.huskLinks)
  const flux = new Float64Array(g.huskLinks)
  const wraps = noWraps()
  const top = relaxed.field.reduce((a, v) => Math.max(a, Math.abs(v)), 0)
  let gauss = spanGaussFailures(m, s, rho, w.flux)
  let fluxOff = 0

  for (let t = 1; t <= beats; t++) {
    spanBeat(m, s, scratch, levels, wraps)
    gauss += spanGaussFailures(m, s, rho, w.flux)
    spanShadow(m, s, w, angle, flux)

    for (let l = 0; l < g.huskLinks; l++) fluxOff = Math.max(fluxOff, Math.abs(flux[l]! - relaxed.field[l]!) / top)
  }

  const growth = Float64Array.from(angle, v => v / beats)

  for (let t = 0; t < beats; t++) spanBeatBack(m, s, scratch, levels)

  const reversed = sameSpan(s, start)

  // the unspanned light (code/rule/trit-husk-shaped), relaxed from the same strings
  const e = makeHuskEngine(g, depth)
  const o = emptyShaped(g, levels)
  const options = { levels, cyclic: false }

  place(o)

  const matter = makeMatter({
    mass: 1,
    charges: [
      { charge: 1, moving: false, dock: [0, 0, 0] },
      { charge: -1, moving: false, dock: [r, 0, 0] },
    ],
  })

  relaxStart(e, o, matter, harmonicPart(g, o.string))

  const oldStart = shapedArrays(copyShaped(o))
  const oldScratch = makeShapedScratch(g, levels)
  const f = makeFieldScratch(e)
  const oldFlux = new Int32Array(g.huskLinks)
  let oldGauss = huskGaussFailures(e, o, matter, false, oldFlux)

  for (let t = 1; t <= beats; t++) {
    shapedBeat(e, o, oldScratch, options)
    oldGauss += huskGaussFailures(e, o, matter, false, oldFlux)
  }

  fieldNumerators(e, o, options, f)

  const oldGrowth = Float64Array.from(o.angle, (v, l) => (v + f.aShift[l]! / q ** levels) / beats)

  for (let t = 0; t < beats; t++) shapedBeatBack(e, o, oldScratch, options)

  const oldEnd = shapedArrays(o)
  const oldReversed = oldEnd.every((x, k) => x.every((v, i) => v === oldStart[k]![i]))

  let growthOff = 0
  let oldGrowthOff = 0
  const ratios: number[] = []

  for (let l = 0; l < g.huskLinks; l++) {
    const field = relaxed.field[l]!

    if (Math.abs(field) < top / 20) continue
    growthOff = Math.max(growthOff, Math.abs((growth[l]! * m.span[l]!) / field - 1))
    oldGrowthOff = Math.max(oldGrowthOff, Math.abs(oldGrowth[l]! / field - 1))
    ratios.push(oldGrowth[l]! / growth[l]!)
  }

  const ratioMean = ratios.reduce((a, v) => a + v, 0) / ratios.length
  const ratioSpread = ratios.reduce((a, v) => Math.max(a, Math.abs(v - ratioMean)), 0)
  let longEnergy = 0

  for (let l = 0; l < g.huskLinks; l++) longEnergy += ((g.weight[l % 9]! / 4) * relaxed.long[l]! ** 2) / m.span[l]!

  // the strung start
  const u = emptySpan(m, levels)

  place(u)

  const uStart = copySpan(u)
  const e0 = spanEnergyWeighted(m, u, w, 1)
  const w0 = spanEnergyWeighted(m, u, w, 0)
  let strungDrift = 0
  let strungWrongDrift = 0

  for (let t = 1; t <= beats; t++) {
    spanBeat(m, u, scratch, levels)

    if (t % COULOMB_EVERY === 0) {
      strungDrift = Math.max(strungDrift, Math.abs(spanEnergyWeighted(m, u, w, 1) / e0 - 1))
      strungWrongDrift = Math.max(strungWrongDrift, Math.abs(spanEnergyWeighted(m, u, w, 0) / w0 - 1))
    }
  }

  for (let t = 0; t < beats; t++) spanBeatBack(m, u, scratch, levels)

  return {
    depth,
    r,
    gauss,
    wraps: wraps.angle + wraps.field + wraps.potential,
    reversed,
    fluxOff,
    growthOff,
    oldGrowthOff,
    ratioMean,
    ratioSpread,
    oldGauss,
    oldReversed,
    energyOverGreen: longEnergy / (huskGreenDifference(side, [r, 0, 0]) / q),
    strungDrift,
    strungWrongDrift,
    strungReversed: sameSpan(u, uStart),
    residual: relaxed.residual,
  }
}

// alpha = C / c with C = s / (12 N) (E-FRC-0242: the drift's phase per unit of e^2 / 2 is 2 pi s / N, times the husk
// Green's function 1 / (24 pi r)) and N = q the column's Weyl pair (hbar kept): the unspanned light has s = 1 and
// c = 2 / sqrt(3 q); the spanned light divides its drift by Q = q, so s = 1 / q, and c = 2 / (q sqrt 3)
export const alphaUnspanned = (depth: number): number => {
  const q = 2 * depth + 1

  return 1 / (12 * q) / (2 / Math.sqrt(3 * q))
}

export const alphaSpanned = (depth: number): number => {
  const q = 2 * depth + 1

  return 1 / (12 * q * q) / (2 / (q * Math.sqrt(3)))
}

// ---------------------------------------------------------------------------------------------------------
// E-FRC-0255: E-FRC-0252's test charge on the spanned light. Fixed before the gated run

export const PEIERLS: PeierlsSetting = { side: 24, depth: 32, order: 1024, pack: 16 }
export const PEIERLS_BEATS = 512
export const PEIERLS_RS: readonly number[] = [4, 5, 6, 7, 8]
export const PEIERLS_LEVELS = 3
// E-FRC-0252's source, and the spanned run's: q times it, so the integer angle a = (A2 - r) / Q moves as E-FRC-0252's did
export const PEIERLS_SOURCE = 4
export const PEIERLS_SCALED = PEIERLS_SOURCE * (2 * PEIERLS.depth + 1)

// strings of `units` from the origin to (side / 2, side / 2, side / 2) along x, then y, then z, stepping `dir`
export function addStringWay(s: ShapedState, g: HuskGeometry, units: number, dir: number): void {
  const side = g.side
  const at = [0, 0, 0]
  const mod = (x: number, n: number): number => ((x % n) + n) % n

  for (let axis = 0; axis < 3; axis++) {
    for (let i = 0; i < side / 2; i++) {
      const tail = dir > 0 ? [...at] : at.map((v, k) => (k === axis ? v - 1 : v))
      const dock = mod(tail[0]!, side) + side * mod(tail[1]!, side) + side * side * mod(tail[2]!, side)

      s.string[dock * 9 + axis] = s.string[dock * 9 + axis]! + dir * units
      at[axis] = mod(at[axis]! + dir, side)
    }
  }
}

export type SpanLightRecord = {
  source: number
  // per beat t = 1 .. beats: the integer axis angle and the shadow angle on the line's x-links (x, 0, 0)
  line: Int32Array[]
  shadow: Float64Array[]
  // the static field on those links (S - C^T u of the relaxed start)
  staticLine: Float64Array
  gauss: number
  wraps: number
  reversed: boolean
  harmonic: number
  residual: number
  seconds: number
}

export function spanPeierlsLight(source: number, log?: (what: string) => void): SpanLightRecord {
  const started = Date.now()
  const { side, depth } = PEIERLS
  const levels = PEIERLS_LEVELS
  const m = makeSpanMedium([side, side, side], () => depth)
  const g = m.geometry
  const s = emptySpan(m, levels)

  addStringWay(s, g, source / 2, 1)
  addStringWay(s, g, source / 2, -1)

  const relaxed = spanRelaxStart(m, s)
  const start = copySpan(s)
  const rho = stringCharge(m, s)
  const scratch = makeSpanScratch(m, levels)
  const w = makeSpanShadowScratch(m)
  const angle = new Float64Array(g.huskLinks)
  const flux = new Float64Array(g.huskLinks)
  const wraps = noWraps()
  const lineLinks = Array.from({ length: side }, (_, x) => x * 9)
  const line: Int32Array[] = []
  const shadow: Float64Array[] = []
  let gauss = spanGaussFailures(m, s, rho, w.flux)

  for (let t = 1; t <= PEIERLS_BEATS; t++) {
    spanBeat(m, s, scratch, levels, wraps)
    gauss += spanGaussFailures(m, s, rho, w.flux)
    spanShadow(m, s, w, angle, flux)
    line.push(Int32Array.from(lineLinks, l => s.angle[l]!))
    shadow.push(Float64Array.from(lineLinks, l => angle[l]!))

    if (t % 64 === 0) log?.(`light ${source} beat ${t} ${(Date.now() - started) / 1000}s`)
  }

  for (let t = 0; t < PEIERLS_BEATS; t++) spanBeatBack(m, s, scratch, levels)

  return {
    source,
    line,
    shadow,
    staticLine: Float64Array.from(lineLinks, l => relaxed.field[l]!),
    gauss,
    wraps: wraps.angle + wraps.field + wraps.potential,
    reversed: sameSpan(s, start),
    harmonic: relaxed.harmonic.reduce((a, v) => Math.max(a, Math.abs(v)), 0),
    residual: relaxed.residual,
    seconds: (Date.now() - started) / 1000,
  }
}

export type WalkReading = { r: number; love: number; fear: number; neutral: number; electric: number; staticRef: number; shadowRef: number; ratio: number }

// the walkers of charge +1, -1 and 0 at every r over a recorded light; the static reference reads A(t) = t E / Q
export function walkReadings(light: SpanLightRecord, rs: readonly number[], charges: readonly number[], back: (r: number, q: number) => boolean): { readings: WalkReading[]; normOk: boolean; backOk: boolean } {
  const q = 2 * PEIERLS.depth + 1
  let normOk = true
  let backOk = true
  const readings = rs.map(r => {
    const move = new Map<number, number>()

    for (const c of charges) {
      const x = exactWalkRun(PEIERLS, r, c, light.line, back(r, c))

      move.set(c, x.move)
      normOk &&= x.normOk
      backOk &&= x.backOk
    }

    const st = (c: number): number => floatWalkRun(PEIERLS, r, c, PEIERLS_BEATS, (t, x) => ((t + 1) * light.staticLine[x]!) / q)
    const sh = (c: number): number => floatWalkRun(PEIERLS, r, c, PEIERLS_BEATS, (t, x) => light.shadow[t]![x]!)
    const neutral = move.get(0) ?? 0
    const electric = (move.get(1)! - move.get(-1)!) / 2
    const staticRef = (st(1) - st(-1)) / 2

    return { r, love: move.get(1)! - neutral, fear: move.get(-1)! - neutral, neutral, electric, staticRef, shadowRef: (sh(1) - sh(-1)) / 2, ratio: electric / staticRef }
  })

  return { readings, normOk, backOk }
}

export type CoulombSurvey = { readings: CoulombReading[]; seconds: number }

let coulombCache: CoulombSurvey | undefined

export function spanCoulombSurvey(log?: (what: string) => void): CoulombSurvey {
  if (coulombCache) return coulombCache

  const started = Date.now()
  const readings = COULOMB_DEPTHS.flatMap(depth =>
    COULOMB_SEPARATIONS.map(r => {
      const x = coulombReading(depth, r)

      log?.(`D ${depth} r ${r} ${(Date.now() - started) / 1000}s`)

      return x
    }),
  )

  coulombCache = { readings, seconds: (Date.now() - started) / 1000 }

  return coulombCache
}
