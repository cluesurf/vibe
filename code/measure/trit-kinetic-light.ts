// Starts and readings for the kinetic charge (E-FRC-0215, 0216). Real numbers live here only; the rule
// (code/rule/trit-kinetic) holds integers. Starts built here from reals are CONSTRUCTION: they choose the
// integer state a run begins from and are disclosed as such.
//
// A UNIFORM FIELD. On the husk torus the flux E_l = e0 g_l (u_l . n), g = 2 on an axis and 1 on a diagonal,
// n a unit axis, has no divergence (it is the same on every link) and no curl (W E = 2 e0 (u . n) sums to
// zero around every triangle, whose three vectors sum to zero). It is the harmonic field, set as strings, and
// the light holds it still: B stays 0, and the angle drifts uniformly.
//
// A UNIFORM MAGNETIC FIELD, in the Landau gauge. The continuum A = (0, b x, 0) gives each link the Peierls
// phase of its line integral: beta x on the y axis (axis units, window 4 D), and on the diagonals (window
// 2 D, half the units) beta (2x + 1) / 4 on (1, 1, 0), minus that on (1, -1, 0), beta x / 2 on (0, 1, +-1).
// These are integers when beta is a multiple of 4, and periodic on a side-L torus when beta L is a multiple of
// 4 D. Every square in the (x, y) plane then has circulation beta.
//
// A RELAXED START. Charges joined by strings carry the strings' transverse part as free light, which rings
// on the torus and kicks the charges. The start removes it: the longitudinal flux E_long is the lattice
// Coulomb field of the charges (conjugate gradients, code/measure/trit-hop-light's coulombFlux), the
// potential u solving C C^T u = C (S - E_long - E_harmonic) in least squares cancels the rest, U = round(u),
// and the counters carry the fraction: with the lags zero, f_(t+1) = U - u to 1 / q^L, so the shadow flux
// starts at E_long + E_harmonic and the shadow angle at zero, a static solution of the linear leapfrog.

import { TRIT_HUSK_VECTORS } from '@/code/rule/trit-column'
import { coulombFlux, dockAt, energyMask } from '@/code/measure/trit-hop-light'
import { makeShadowScratch, shadowReading } from '@/code/measure/trit-shaped-light'
import { addCurrent, huskGeometry as huskGeometryOf, makeHuskEngine, type HuskEngine, type HuskGeometry } from '@/code/rule/trit-husk'
import { copyShaped, emptyShaped, makeShapedScratch, shapedArrays, shapedFlux, type ShapedOptions, type ShapedState } from '@/code/rule/trit-husk-shaped'
import { copyMatter, kineticBeat, kineticBeatBack, makeFieldScratch, type KineticMatter, type KineticTally } from '@/code/rule/trit-kinetic'

const G = [2, 2, 2, 1, 1, 1, 1, 1, 1]
const mod = (x: number, m: number): number => ((x % m) + m) % m

// the harmonic flux e0 g_l (u_l . n) on every link, as a real field (for the relaxed start)
export function uniformFlux(g: HuskGeometry, e0: number, axis: number): Float64Array {
  const out = new Float64Array(g.huskLinks)

  for (let l = 0; l < g.huskLinks; l++) out[l] = e0 * (G[l % 9] ?? 1) * ((TRIT_HUSK_VECTORS[l % 9] ?? [])[axis] ?? 0)

  return out
}

// the same field written into the strings
export function addUniformField(s: ShapedState, g: HuskGeometry, e0: number, axis: number): void {
  const f = uniformFlux(g, e0, axis)

  for (let l = 0; l < g.huskLinks; l++) s.string[l] = (s.string[l] ?? 0) + (f[l] ?? 0)
}

// the Landau-gauge angles of a uniform field along z with circulation beta per (x, y) square
export function setLandauAngles(s: ShapedState, g: HuskGeometry, depth: number, beta: number): void {
  if (beta % 4 !== 0 || (beta * g.side) % (4 * depth) !== 0) throw new Error('beta must be a multiple of 4 with beta L a multiple of 4 D')

  const axis = 4 * depth
  const diag = 2 * depth
  const wrap = (v: number, n: number): number => mod(v + n / 2, n) - n / 2

  for (let y = 0; y < g.huskDocks; y++) {
    const x = y % g.side

    s.angle[y * 9 + 1] = wrap(beta * x, axis)
    s.angle[y * 9 + 3] = wrap((beta * (2 * x + 1)) / 4, diag)
    s.angle[y * 9 + 4] = wrap((-beta * (2 * x + 1)) / 4, diag)
    s.angle[y * 9 + 7] = wrap((beta * x) / 2, diag)
    s.angle[y * 9 + 8] = wrap((beta * x) / 2, diag)
  }
}

// a string from dock a to dock b along x, then y, then z (the charge at a is +charge, at b -charge)
export function addStringPath(s: ShapedState, g: HuskGeometry, from: number[], to: number[], charge: number): void {
  const at = [...from]
  const side = g.side

  for (let axis = 0; axis < 3; axis++) {
    let d = mod((to[axis] ?? 0) - (at[axis] ?? 0) + side / 2, side) - side / 2
    const step = d > 0 ? 1 : -1

    while (d !== 0) {
      const tail = step > 0 ? [...at] : at.map((v, i) => (i === axis ? v - 1 : v))
      const link = dockAt(side, tail[0] ?? 0, tail[1] ?? 0, tail[2] ?? 0) * 9 + axis

      // a string carries outflow from the + end: S_l = +charge along the step direction
      addCurrent(s, link, -step * charge)
      at[axis] = (at[axis] ?? 0) + step
      d -= step
    }
  }
}

// C W C^T u = C W t, conjugate gradients over the triangles: the leftover t - C^T u then has no curl under the
// light's weights (C W (t - C^T u) = 0), which is what keeps B at zero. An unweighted solve leaves a curl the
// light turns into a growing B (found in tmp/force-probe2.log, fixed before any gated run)
function solvePotential(g: HuskGeometry, t: Float64Array): Float64Array {
  const n = g.triangles
  const weight = (l: number): number => 2 / (G[l % 9] ?? 1)
  const apply = (u: Float64Array, out: Float64Array, work: Float64Array): void => {
    work.fill(0)

    for (let p = 0; p < n; p++) {
      for (let j = 0; j < 3; j++) work[g.triLinks[p * 3 + j] ?? 0] = (work[g.triLinks[p * 3 + j] ?? 0] ?? 0) + (g.triSigns[p * 3 + j] ?? 0) * (u[p] ?? 0)
    }

    for (let p = 0; p < n; p++) {
      let v = 0

      for (let j = 0; j < 3; j++) {
        const l = g.triLinks[p * 3 + j] ?? 0

        v += (g.triSigns[p * 3 + j] ?? 0) * weight(l) * (work[l] ?? 0)
      }

      out[p] = v
    }
  }
  const b = new Float64Array(n)

  for (let p = 0; p < n; p++) {
    let v = 0

    for (let j = 0; j < 3; j++) {
      const l = g.triLinks[p * 3 + j] ?? 0

      v += (g.triSigns[p * 3 + j] ?? 0) * weight(l) * (t[l] ?? 0)
    }

    b[p] = v
  }

  const u = new Float64Array(n)
  const r = Float64Array.from(b)
  const d = Float64Array.from(r)
  const ad = new Float64Array(n)
  const work = new Float64Array(g.huskLinks)
  let rr = r.reduce((s, v) => s + v * v, 0)
  const stop = rr * 1e-26

  for (let it = 0; it < 5000 && rr > stop; it++) {
    apply(d, ad, work)

    const alpha = rr / d.reduce((s, v, i) => s + v * (ad[i] ?? 0), 0)

    for (let i = 0; i < n; i++) {
      u[i] = (u[i] ?? 0) + alpha * (d[i] ?? 0)
      r[i] = (r[i] ?? 0) - alpha * (ad[i] ?? 0)
    }

    const next = r.reduce((s, v) => s + v * v, 0)

    for (let i = 0; i < n; i++) d[i] = (r[i] ?? 0) + (next / rr) * (d[i] ?? 0)

    rr = next
  }

  return u
}

// the charge density of the matter on the husk docks
export function chargeDensity(g: HuskGeometry, m: KineticMatter): Float64Array {
  const rho = new Float64Array(g.huskDocks)

  for (let k = 0; k < m.charge.length; k++) {
    const y = dockAt(g.side, m.dock[k * 3] ?? 0, m.dock[k * 3 + 1] ?? 0, m.dock[k * 3 + 2] ?? 0)

    rho[y] = (rho[y] ?? 0) + (m.charge[k] ?? 0)
  }

  return rho
}

// the relaxed start: potentials and counters so the shadow flux is E_long + harmonic and the shadow angle 0
// (the angles already set are kept: pass a state whose angles are the wanted static field). Returns the
// largest |S - C^T u - E_long - harmonic| left after the solve (the strings' own harmonic part, which no
// potential can remove: a string between two charges winds net flux d / V around the torus, Ewald's surface
// term) and the static field S - C^T u the start holds
export function relaxStart(engine: HuskEngine, s: ShapedState, m: KineticMatter, harmonic?: Float64Array): { residual: number; field: Float64Array } {
  const g = engine.geometry
  const q = engine.q
  const levels = 1 + s.upper.length
  const long = coulombFlux(g, chargeDensity(g, m))
  const t = new Float64Array(g.huskLinks)

  for (let l = 0; l < g.huskLinks; l++) t[l] = (s.string[l] ?? 0) - (long[l] ?? 0) - (harmonic?.[l] ?? 0)

  const u = solvePotential(g, t)
  let residual = 0
  const curl = new Float64Array(g.huskLinks)

  for (let p = 0; p < g.triangles; p++) {
    for (let j = 0; j < 3; j++) curl[g.triLinks[p * 3 + j] ?? 0] = (curl[g.triLinks[p * 3 + j] ?? 0] ?? 0) + (g.triSigns[p * 3 + j] ?? 0) * (u[p] ?? 0)
  }

  const field = new Float64Array(g.huskLinks)

  for (let l = 0; l < g.huskLinks; l++) {
    residual = Math.max(residual, Math.abs((t[l] ?? 0) - (curl[l] ?? 0)))
    field[l] = (s.string[l] ?? 0) - (curl[l] ?? 0)
  }

  for (let p = 0; p < g.triangles; p++) {
    const whole = Math.round(u[p] ?? 0)
    let rest = (whole - (u[p] ?? 0)) * q

    s.potential[p] = whole
    s.lag[p] = 0

    const c1 = Math.max(-engine.depth, Math.min(engine.depth, Math.round(rest)))

    s.counter[p] = c1
    rest = (rest - c1) * q

    for (let i = 0; i < levels - 1; i++) {
      const c = Math.max(-engine.depth, Math.min(engine.depth, Math.round(rest)))

      s.upper[i]![p] = c
      s.upperLag[i]![p] = 0
      rest = (rest - c) * q
    }

    s.spatial[p] = 0
  }

  return { residual, field }
}

// the kinetic energy, in the light's units (pi / D at hbar = 1, per beat): p v / 2 with p = K pi / (4 D q^L)
export function kineticEnergy(engine: HuskEngine, m: KineticMatter, levels: number): number {
  const unit = Math.PI / (4 * engine.depth * engine.q ** levels)
  let e = 0

  for (let k = 0; k < m.charge.length; k++) {
    if (!m.moving[k]) continue

    for (let i = 0; i < 3; i++) e += (unit * (m.momentum[k * 3 + i] ?? 0) ** 2) / (2 * m.mass)
  }

  return e
}

// the physical mass pi M / (4 D q^L) (energy beats^2 per dock^2)
export const physicalMass = (engine: HuskEngine, mass: number, levels: number): number => (Math.PI * mass) / (4 * engine.depth * engine.q ** levels)

// a charge's position in docks, unwrapped against the previous reading
export function unwrappedPosition(g: HuskGeometry, m: KineticMatter, k: number, previous?: number[]): number[] {
  return [0, 1, 2].map(i => {
    const x = (m.dock[k * 3 + i] ?? 0) + (m.offset[k * 3 + i] ?? 0) / m.mass

    if (!previous) return x

    const p = previous[i] ?? 0

    return p + (mod(x - p + g.side / 2, g.side) - g.side / 2)
  })
}

// the static lattice force on charge k, in K units per beat: e q^L (E_+ + E_-) on its two links along each
// axis, of a given real field (the relaxed start's static field), or of the Coulomb flux alone (the force the
// rule would read from an exact shadow)
export function staticForce(engine: HuskEngine, m: KineticMatter, k: number, levels: number, given?: Float64Array): number[] {
  const g = engine.geometry
  const long = given ?? coulombFlux(g, chargeDensity(g, m))
  const side = g.side
  const y = [m.dock[k * 3] ?? 0, m.dock[k * 3 + 1] ?? 0, m.dock[k * 3 + 2] ?? 0]
  const scale = engine.q ** levels * (m.charge[k] ?? 0)

  return [0, 1, 2].map(i => {
    const here = dockAt(side, y[0] ?? 0, y[1] ?? 0, y[2] ?? 0) * 9 + i
    const back = dockAt(side, (y[0] ?? 0) - (i === 0 ? 1 : 0), (y[1] ?? 0) - (i === 1 ? 1 : 0), (y[2] ?? 0) - (i === 2 ? 1 : 0)) * 9 + i

    return scale * ((long[here] ?? 0) + (long[back] ?? 0))
  })
}

// husk docks where the divergence of the rule's flux (centered when cyclic) is not the matter's charge
export function huskGaussFailures(engine: HuskEngine, s: ShapedState, m: KineticMatter, cyclic: boolean, flux: Int32Array): number {
  const g = engine.geometry
  const rho = chargeDensity(g, m)
  const div = new Float64Array(g.huskDocks)

  shapedFlux(engine, s, cyclic, flux)

  for (let l = 0; l < g.huskLinks; l++) {
    const y = Math.floor(l / 9)
    const z = g.huskNeighbour[l] ?? 0

    div[y] = (div[y] ?? 0) + (flux[l] ?? 0)
    div[z] = (div[z] ?? 0) - (flux[l] ?? 0)
  }

  let bad = 0

  for (let y = 0; y < g.huskDocks; y++) bad += div[y] === rho[y] ? 0 : 1

  return bad
}

export type KineticRun = {
  // per beat (index t = after beat t + 1, index 0 the start): unwrapped positions and momenta of each charge
  readonly positions: number[][][]
  readonly momenta: number[][][]
  // per `every` beats: the light's shadow invariant and the kinetic energy (index 0 the start)
  readonly light: number[]
  readonly kinetic: number[]
  readonly gaussFailures: number
  readonly crossings: number
  // trit and register mismatches after the last `reverse` beats are run back
  readonly back: number
  readonly residual: number
  readonly field: Float64Array
  readonly msPerBeat: number
}

// a run of light and matter from a relaxed start built by `setup` (strings, angles; returns the harmonic
// field it wrote, if any)
export function runKinetic(input: {
  side: number
  depth: number
  options: ShapedOptions
  matter: KineticMatter
  setup: (s: ShapedState, g: HuskGeometry) => Float64Array | undefined
  beats: number
  every: number
  reverse: number
}): KineticRun {
  const { side, depth, options, beats, every, reverse } = input
  const m = input.matter
  const g = huskGeometryCache(side)
  const e = makeHuskEngine(g, depth)
  const s = emptyShaped(g, options.levels)
  const harmonic = input.setup(s, g)
  const { residual, field } = relaxStart(e, s, m, harmonic)
  const scratch = makeShapedScratch(g, options.levels)
  const f = makeFieldScratch(e)
  const all = energyMask(g, 0, -1)
  const reading = makeShadowScratch(g)
  const flux = new Int32Array(g.huskLinks)
  const tally: KineticTally = { crossings: 0 }
  const count = m.charge.length
  let last = Array.from({ length: count }, (_, k) => unwrappedPosition(g, m, k))
  const positions: number[][][] = [last.map(p => [...p])]
  const momenta: number[][][] = [Array.from({ length: count }, (_, k) => [0, 1, 2].map(i => m.momentum[k * 3 + i] ?? 0))]
  const light = [shadowReading(e, s, options, all, reading)]
  const kinetic = [kineticEnergy(e, m, options.levels)]
  let gaussFailures = huskGaussFailures(e, s, m, options.cyclic, flux)
  let saved: { s: ShapedState; m: KineticMatter } | undefined
  const started = Date.now()

  for (let t = 0; t < beats; t++) {
    if (t === beats - reverse) saved = { s: copyShaped(s), m: copyMatter(m) }

    kineticBeat(e, s, m, options, scratch, f, tally)

    last = last.map((p, k) => unwrappedPosition(g, m, k, p))
    positions.push(last.map(p => [...p]))
    momenta.push(Array.from({ length: count }, (_, k) => [0, 1, 2].map(i => m.momentum[k * 3 + i] ?? 0)))
    gaussFailures += huskGaussFailures(e, s, m, options.cyclic, flux)

    if ((t + 1) % every === 0) {
      light.push(shadowReading(e, s, options, all, reading))
      kinetic.push(kineticEnergy(e, m, options.levels))
    }
  }

  const msPerBeat = (Date.now() - started) / Math.max(1, beats)
  let back = 0

  for (let t = 0; t < reverse; t++) kineticBeatBack(e, s, m, options, scratch, f)

  if (saved) {
    const a = shapedArrays(s)
    const b = shapedArrays(saved.s)

    a.forEach((arr, i) => arr.forEach((v, j) => (back += v === (b[i]?.[j] ?? 0) ? 0 : 1)))

    for (const key of ['dock', 'offset', 'momentum'] as const) m[key].forEach((v, j) => (back += v === saved!.m[key][j] ? 0 : 1))
  }

  return { positions, momenta, light, kinetic, gaussFailures, crossings: tally.crossings, back, residual, field, msPerBeat }
}

const GEOMETRIES = new Map<number, HuskGeometry>()

function huskGeometryCache(side: number): HuskGeometry {
  const known = GEOMETRIES.get(side)

  if (known) return known

  const g = huskGeometryOf(side)

  GEOMETRIES.set(side, g)

  return g
}
