// The first quantum atom on trits (E-FRC-0221, 0222): the stand-in hydrogen's fear-walk electron coupled to the
// three-level shaped light, semiclassically. A STAND-IN: the electron is the band-projected fear walk of
// E-MTR-0001 (mass sqrt 3, amplitudes held as floats, run by FFT), which plays an electron the model has not
// produced; the nucleus is a pinned stand-in of Z units whose static field is the light's own lattice
// Coulomb field (E-FRC-0212: (pi / D) G, coefficient 1 / (24 D)), given to the walk as a fixed potential.
// Nothing read here is an L3 derivation.
//
// THE COUPLING, a Hamiltonian written before any run.
//   the electron's string   A charge crossing a link pays the string S <- S - J (E-FRC-0210). A charge at x
//                           that came from the nucleus x0 along a path left the string -q_e on the path's
//                           links. The path is the lattice's axis path in one of the 6 axis orders, averaged
//                           (the multipolar, or Power-Zienau-Woolley, choice of path: any path gives the same
//                           longitudinal field and, in the dipole regime, the same radiation). The expectation
//                           of the string over the signed whole is S*_l = -q_e sum_x (rho(x) - rho0(x)) Pi_l(x),
//                           Pi_l(x) the path-averaged sign of link l on x's paths, rho = |psi|^2: THE LIGHT SEES
//                           THE EXPECTATION (semiclassical), counted into the rule as X = floor(q^L S*) (a
//                           threshold count, never a rounding) and carried by code/rule/trit-husk-polarized
//                           so the shadow is driven by S* exactly
//   the back-action         the light's energy is its leapfrog invariant I = (pi / D) [ 1/2 sum E~^2 / g +
//                           (kappa / 8) sum n B~(A~) B~(A~ + E~) ] with E~ = S* - C^T U~, so the walk feels
//                           V(x) = dI / d rho(x) = -q_e sum_l Pi_l(x) e_l, e_l = (pi / D) [ E~_l / g_l +
//                           (kappa / 8) ((C W)^T n B~(A~))_l ]: the line integral from the nucleus of the
//                           shadow field and the invariant's cross term, a phase on the walk's docks. With q_e =
//                           -1 the matter plus light energy <T + V_Z> + I is conserved; the beat splits it
//   the beat                (a1) psi <- exp(-i (V_Z + V) / 2) psi, V from the light as it stands; (b) psi <-
//                           exp(-i T(p)) psi (FFT, the band); (c) load X = floor(q^L S*(|psi|^2) + theta);
//                           (a2) the other half potential from the SAME light with the new source (I is
//                           quadratic in S* at a fixed light, so the trapezoid pays the load's change of I to
//                           second order); (d) the light beat with the source fixed, which keeps I. Reversed:
//                           (d'), (a2'), then (c') with the previous source read from exp(+i T) psi (the
//                           kinetic step does not depend on the light), (b'), (a1')
// The walk's own Hartree term (its field acting on itself) is in V, as in every semiclassical theory; it is
// 1/Z of the binding. The static field of the initial cloud is not (the light holds the field of the change,
// rho - rho0, and the nucleus's field is the stand-in potential).
//
// Measurement uses reals: the walk, its energies, projections, and the light's shadow reading.

import { fft3 } from '@/code/measure/standin-chemistry'
import { HUSK_ATOM, ROWS, coulombBox, kindBandGrid, lowestLevels, makeAtom, positionElement } from '@/code/measure/stand-in-atom'
import { huskGeometry, makeHuskEngine, type HuskEngine, type HuskGeometry } from '@/code/rule/trit-husk'
import { shapedFlux } from '@/code/rule/trit-husk-shaped'
import {
  bucketScale,
  copyPolarized,
  emptyPolarized,
  load,
  loadedSource,
  makePolarizedScratch,
  polarizedArrays,
  polarizedBeat,
  polarizedBeatBack,
  unload,
  type LoadTally,
  type PolarizedScratch,
  type PolarizedState,
} from '@/code/rule/trit-husk-polarized'

const G_AXIS = 2
const ORDERS: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
]

export type QuantumAtom = {
  readonly side: number
  readonly depth: number
  readonly levels: number
  readonly charge: number // Z
  // false: the control, the same walk with no light (no load, no back-action)
  readonly coupled: boolean
  readonly a: number // Bohr radius 24 D / (sqrt 3 Z)
  readonly geometry: HuskGeometry
  readonly engine: HuskEngine
  readonly band: Float64Array
  readonly kineticCos: Float64Array
  readonly kineticSin: Float64Array
  readonly nucleus: Float64Array // V_Z per dock
  readonly re: Float64Array
  readonly im: Float64Array
  readonly light: PolarizedState
  readonly scratch: PolarizedScratch
  readonly reference: Float64Array // P[rho0] per husk link
  readonly polar: Float64Array // P[rho] scratch
  readonly field: Float64Array // (pi / D) E~ / g on axis links
  readonly potential: Float64Array // V per dock scratch
  readonly source: Int32Array
  readonly previous: Int32Array
  readonly flux: Int32Array
  readonly work: Float64Array[]
  readonly tally: LoadTally
}

export function makeQuantumAtom(input: { side: number; depth: number; levels: number; charge: number; coupled?: boolean }): QuantumAtom {
  const { side, depth, levels, charge } = input
  const geometry = huskGeometry(side)
  const engine = makeHuskEngine(geometry, depth)
  const n = side ** 3
  const band = kindBandGrid(HUSK_ATOM, side)
  const a = (24 * depth) / (Math.sqrt(3) * charge)

  return {
    side,
    depth,
    levels,
    charge,
    coupled: input.coupled ?? true,
    a,
    geometry,
    engine,
    band,
    kineticCos: Float64Array.from(band, Math.cos),
    kineticSin: Float64Array.from(band, e => -Math.sin(e)),
    nucleus: coulombBox(HUSK_ATOM, side, charge / (24 * depth)),
    re: new Float64Array(n),
    im: new Float64Array(n),
    light: emptyPolarized(geometry, levels),
    scratch: makePolarizedScratch(geometry, levels),
    reference: new Float64Array(geometry.huskLinks),
    polar: new Float64Array(geometry.huskLinks),
    field: new Float64Array(geometry.huskLinks),
    potential: new Float64Array(n),
    source: new Int32Array(geometry.huskLinks),
    previous: new Int32Array(geometry.huskLinks),
    flux: new Int32Array(geometry.huskLinks),
    work: [0, 1, 2, 3].map(() => new Float64Array(n)),
    tally: { crossings: 0, carried: 0, maxBucket: 0 },
  }
}

// the lattice 1s and 2p_x of the stand-in hydrogen (the static H = T + V_Z), for the start and projections
export function atomLevels(atom: QuantumAtom): { s: Float64Array; p: Float64Array; es: number; ep: number; omega: number; dipole: number } {
  const h = makeAtom({ kind: HUSK_ATOM, side: atom.side, a: atom.a, potential: Float64Array.from(atom.nucleus) })
  const s = lowestLevels({ atom: h, row: ROWS.A1g!, count: 1 })
  const p = lowestLevels({ atom: h, row: ROWS.T1u!, count: 1 })
  const sv = s.vectors[0]!
  const pv = p.vectors[0]!
  const ns = Math.sqrt(sv.reduce((x, v) => x + v * v, 0))
  const np = Math.sqrt(pv.reduce((x, v) => x + v * v, 0))
  const su = Float64Array.from(sv, v => v / ns)
  const pu = Float64Array.from(pv, v => v / np)

  return { s: su, p: pu, es: s.values[0]!, ep: p.values[0]!, omega: p.values[0]! - s.values[0]!, dipole: Math.abs(positionElement(atom.side, su, pu, 0)) }
}

// ---------------------------------------------------------------------------------------------------------
// the path polarization P[w] on the husk axis links (weight 1/6 per axis order), and its adjoint, the line
// integral of a link field from the nucleus

const idx = (side: number, c: readonly number[]): number => c[0]! + side * (c[1]! + side * c[2]!)

export function polarization(side: number, w: Float64Array, out: Float64Array): void {
  const h = side / 2
  const line = new Float64Array(side)
  const m2 = new Float64Array(side * side)
  const m1 = new Float64Array(side)
  const c = [0, 0, 0]

  out.fill(0)

  // add the path strings of a line of weights `line` (indexed by coordinate u on `axis`, from h) to the links
  // along `axis` through the base coordinates in c
  const pour = (axis: number): void => {
    // v >= 0 (u = h + v): the weight beyond, u' > u; v < 0: minus the weight at or before, u' <= u
    let beyond = 0

    for (let u = side - 1; u >= h; u--) {
      c[axis] = u
      if (u < side - 1) out[idx(side, c) * 9 + axis] = out[idx(side, c) * 9 + axis]! + beyond / 6
      beyond += line[u]!
    }

    let before = 0

    for (let u = 0; u < h; u++) {
      before += line[u]!
      c[axis] = u
      out[idx(side, c) * 9 + axis] = out[idx(side, c) * 9 + axis]! - before / 6
    }
  }

  for (const [a, b, z] of ORDERS) {
    m2.fill(0)
    m1.fill(0)

    // segment 3: along z at every (u_a, u_b)
    for (let ua = 0; ua < side; ua++) {
      for (let ub = 0; ub < side; ub++) {
        let total = 0

        for (let uz = 0; uz < side; uz++) {
          c[a] = ua
          c[b] = ub
          c[z] = uz
          line[uz] = w[idx(side, c)]!
          total += line[uz]!
        }

        m2[ua * side + ub] = total
        c[a] = ua
        c[b] = ub
        pour(z)
      }
    }

    // segment 2: along b at (u_a, z = h)
    for (let ua = 0; ua < side; ua++) {
      let total = 0

      for (let ub = 0; ub < side; ub++) {
        line[ub] = m2[ua * side + ub]!
        total += line[ub]!
      }

      m1[ua] = total
      c[a] = ua
      c[z] = h
      pour(b)
    }

    // segment 1: along a at (b = h, z = h)
    for (let ua = 0; ua < side; ua++) line[ua] = m1[ua]!

    c[b] = h
    c[z] = h
    pour(a)
  }
}

// V(x) = sum_l Pi_l(x) e_l, e a field on the axis links: the path-averaged line integral from the nucleus
export function lineIntegral(side: number, e: Float64Array, out: Float64Array): void {
  const h = side / 2
  const c = [0, 0, 0]
  const f1 = new Float64Array(side)
  const f2 = new Float64Array(side)

  out.fill(0)

  // F(u) along axis through base c, F(h) = 0, F(u + 1) = F(u) + e(u)
  const walkLine = (axis: number, into: Float64Array): void => {
    into[h] = 0

    for (let u = h; u < side - 1; u++) {
      c[axis] = u
      into[u + 1] = into[u]! + e[idx(side, c) * 9 + axis]!
    }

    for (let u = h - 1; u >= 0; u--) {
      c[axis] = u
      into[u] = into[u + 1]! - e[idx(side, c) * 9 + axis]!
    }
  }

  const f3 = new Float64Array(side)

  for (const [a, b, z] of ORDERS) {
    c[b] = h
    c[z] = h
    walkLine(a, f1)

    for (let ua = 0; ua < side; ua++) {
      c[a] = ua
      c[z] = h
      walkLine(b, f2)

      for (let ub = 0; ub < side; ub++) {
        c[a] = ua
        c[b] = ub
        walkLine(z, f3)

        for (let uz = 0; uz < side; uz++) {
          c[a] = ua
          c[b] = ub
          c[z] = uz

          const i = idx(side, c)

          out[i] = out[i]! + (f1[ua]! + f2[ub]! + f3[uz]!) / 6
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------------------
// the light's shadow as the walk reads it, and its energy

function fractions(atom: QuantumAtom): { now: Float64Array; lag: Float64Array } {
  const { light: s, engine, levels } = atom
  const q = engine.q
  const n = engine.geometry.triangles
  const now = new Float64Array(n)
  const lag = new Float64Array(n)

  for (let p = 0; p < n; p++) {
    let a = s.counter[p]! / q
    let b = s.lag[p]! / q
    let scale = q

    for (let i = 0; i < levels - 1; i++) {
      scale *= q
      a += s.upper[i]![p]! / scale
      b += s.upperLag[i]![p]! / scale
    }

    now[p] = a
    lag[p] = b
  }

  return { now, lag }
}

function curlT(g: HuskGeometry, x: Float64Array, out: Float64Array): void {
  out.fill(0)

  for (let p = 0; p < g.triangles; p++) {
    const v = x[p]!

    if (v === 0) continue

    for (let j = p * 3; j < p * 3 + 3; j++) out[g.triLinks[j]!] = out[g.triLinks[j]!]! + g.triSigns[j]! * v
  }
}

// E~ on every husk link: E - g + g_lag + C^T (f_now - f_lag), into work[0]; returns the fractions
function shadowFlux(atom: QuantumAtom): { now: Float64Array; lag: Float64Array; shadow: Float64Array; curlNow: Float64Array; curlLag: Float64Array } {
  const { engine, light: s, levels } = atom
  const g = engine.geometry
  const scale = bucketScale(engine, levels)
  const f = fractions(atom)
  const curlNow = new Float64Array(g.huskLinks)
  const curlLag = new Float64Array(g.huskLinks)
  const shadow = new Float64Array(g.huskLinks)

  shapedFlux(engine, s, false, atom.flux)
  curlT(g, f.now, curlNow)
  curlT(g, f.lag, curlLag)

  for (let l = 0; l < g.huskLinks; l++) shadow[l] = atom.flux[l]! - s.bucket[l]! / scale + s.bucketLag[l]! / scale + curlNow[l]! - curlLag[l]!

  return { ...f, shadow, curlNow, curlLag }
}

// The light's shadow invariant (pi / D) [1/2 sum E~^2 / g + (kappa / 8) sum n B~(A~_t) B~(A~_t + E~_t)], with
// E~ = S* - C^T U~ for the source the next drift uses. `point`: 'loaded' right after a load (A~_t = A +
// C^T f_lag - g_lag), 'beaten' right after a light beat, before the next load (A~ = A + C^T f_lag - g, the
// source still the one the last drift used)
export function lightEnergy(atom: QuantumAtom, point: 'loaded' | 'beaten' = 'loaded'): number {
  const { engine, light: s, levels } = atom
  const g = engine.geometry
  const scale = bucketScale(engine, levels)
  const r = shadowFlux(atom)
  const kappa = (2 * engine.p) / engine.q
  const nb = engine.nb
  const metric = [2, 2, 2, 1, 1, 1, 1, 1, 1]
  const shiftOf = point === 'loaded' ? s.bucketLag : s.bucket
  let e = 0

  for (let l = 0; l < g.huskLinks; l++) e += (r.shadow[l]! * r.shadow[l]!) / (2 * metric[l % 9]!)

  for (let p = 0; p < g.triangles; p++) {
    let bn = 0
    let bt = 0
    let sn = 0
    let st = 0

    for (let j = p * 3; j < p * 3 + 3; j++) {
      const l = g.triLinks[j]!
      const c = g.triSigns[j]! * g.weight[l % 9]!
      const shift = r.curlLag[l]! - shiftOf[l]! / scale

      bn += c * s.angle[l]!
      bt += c * (s.angle[l]! + atom.flux[l]!)
      sn += c * shift
      st += c * (shift + r.shadow[l]! - atom.flux[l]!)
    }

    const b0 = ((((bn + nb / 2) % nb) + nb) % nb) - nb / 2 + sn
    const b1 = ((((bt + nb / 2) % nb) + nb) % nb) - nb / 2 + st

    e += (kappa / 8) * g.multiplicity[p]! * b0 * b1
  }

  return (Math.PI / engine.depth) * e
}

// V on every dock from the light as it stands: (pi / D) line integral of E~ / g along the axis paths
// `point` as in lightEnergy: which bucket shifts A~_t (after a light beat: the bucket; after a load: its lag)
function interaction(atom: QuantumAtom, point: 'loaded' | 'beaten'): void {
  if (!atom.coupled) {
    atom.potential.fill(0)

    return
  }

  const r = shadowFlux(atom)
  const { engine, light: s, levels } = atom
  const g = engine.geometry
  const scale = bucketScale(engine, levels)
  const coupling = Math.PI / atom.depth
  const kappa = (2 * engine.p) / engine.q
  const nb = engine.nb

  atom.field.fill(0)

  for (let l = 0; l < atom.field.length; l++) if (l % 9 < 3) atom.field[l] = (coupling * r.shadow[l]!) / G_AXIS

  // the leapfrog invariant's cross term (kappa / 8) sum n B~_t B~(A~_t + E~) also depends on S*, through E~:
  // its derivative (kappa / 8) (C W)^T (n B~_t), with A~_t = A + C^T f_lag - g
  const shiftOf = point === 'loaded' ? s.bucketLag : s.bucket

  for (let p = 0; p < g.triangles; p++) {
    let bn = 0
    let sn = 0

    for (let j = p * 3; j < p * 3 + 3; j++) {
      const l = g.triLinks[j]!
      const c = g.triSigns[j]! * g.weight[l % 9]!

      bn += c * s.angle[l]!
      sn += c * (r.curlLag[l]! - shiftOf[l]! / scale)
    }

    const b0 = ((((bn + nb / 2) % nb) + nb) % nb) - nb / 2 + sn
    const w = coupling * (kappa / 8) * g.multiplicity[p]! * b0

    for (let j = p * 3; j < p * 3 + 3; j++) {
      const l = g.triLinks[j]!

      if (l % 9 < 3) atom.field[l] = atom.field[l]! + w * g.triSigns[j]! * g.weight[l % 9]!
    }
  }

  lineIntegral(atom.side, atom.field, atom.potential)
}

// ---------------------------------------------------------------------------------------------------------
// the walk

export function setWalk(atom: QuantumAtom, re: Float64Array, im: Float64Array): void {
  atom.re.set(re)
  atom.im.set(im)

  const rho = atom.work[0]!

  for (let i = 0; i < rho.length; i++) rho[i] = re[i]! ** 2 + im[i]! ** 2

  polarization(atom.side, rho, atom.reference)
}

function kinetic(atom: QuantumAtom, re: Float64Array, im: Float64Array, sign: number): void {
  const { kineticCos: kc, kineticSin: ks } = atom

  fft3(re, im, atom.side, false)

  for (let i = 0; i < re.length; i++) {
    const r = re[i]!
    const m = im[i]!
    const s = sign * ks[i]!

    re[i] = r * kc[i]! - m * s
    im[i] = r * s + m * kc[i]!
  }

  fft3(re, im, atom.side, true)
}

// psi <- exp(-i sign (V_Z + V) / 2) psi: half a potential step
function potentialStep(atom: QuantumAtom, sign: number): void {
  const { re, im, nucleus, potential } = atom

  for (let i = 0; i < re.length; i++) {
    const v = (nucleus[i]! + potential[i]!) / 2
    const c = Math.cos(v)
    const s = -sign * Math.sin(v)
    const r = re[i]!
    const m = im[i]!

    re[i] = r * c - m * s
    im[i] = r * s + m * c
  }
}

// The counter's thresholds sit at (k - theta) / q^L with theta the golden fraction, so a link whose S* is at
// rest at zero (every link far from the atom) is not on a threshold, where the last bit of a float would
// decide the count
const THRESHOLD_PHASE = (Math.sqrt(5) - 1) / 2

// X = floor(q^L S* + theta) from a walk (re, im), S* = P[rho] - P[rho0] (q_e = -1), on axis links
function countSource(atom: QuantumAtom, re: Float64Array, im: Float64Array, out: Int32Array): void {
  const rho = atom.work[3]!
  const scale = bucketScale(atom.engine, atom.levels)

  for (let i = 0; i < rho.length; i++) rho[i] = re[i]! ** 2 + im[i]! ** 2

  polarization(atom.side, rho, atom.polar)

  for (let l = 0; l < out.length; l++) out[l] = l % 9 < 3 ? Math.floor(scale * (atom.polar[l]! - atom.reference[l]!) + THRESHOLD_PHASE) : 0
}

export type BeatTally = { sourceMismatches: number; previousMismatches: number }

// One beat of matter and light, a Strang splitting of the matter step around one light state: (a1) half
// potential from the light as it stands (the source S*_old), (b) the kinetic step, (c) load the source counted
// from |psi|^2, (a2) half potential from the same light with the new source, then (d) the light beat with the
// source fixed. The light's invariant is quadratic in S* at a fixed light state, so the trapezoid of (a1) and
// (a2) pays the load's change of it to second order, and the light beat keeps it (E-FRC-0214's shadow).
// Returns the light's energy at the point after (a2), before the light beat (the leapfrog's own reading
// point), when asked
export function atomBeat(atom: QuantumAtom, read = false): number {
  interaction(atom, 'beaten')
  potentialStep(atom, 1)
  kinetic(atom, atom.re, atom.im, 1)
  countSource(atom, atom.re, atom.im, atom.source)
  load(atom.engine, atom.light, atom.levels, atom.source, atom.tally)
  interaction(atom, 'loaded')
  potentialStep(atom, 1)

  const energy = read ? lightEnergy(atom) : 0

  polarizedBeat(atom.engine, atom.light, atom.scratch, atom.levels)

  return energy
}

// Its inverse. The previous source is read from exp(+i T) psi, which the light does not enter; counts links
// where the source the state holds differs from the one the walk gives
export function atomBeatBack(atom: QuantumAtom, tally: BeatTally): void {
  polarizedBeatBack(atom.engine, atom.light, atom.scratch, atom.levels)
  interaction(atom, 'loaded')
  potentialStep(atom, -1)

  loadedSource(atom.engine, atom.light, atom.levels, atom.previous)
  countSource(atom, atom.re, atom.im, atom.source)

  for (let l = 0; l < atom.source.length; l++) tally.sourceMismatches += atom.source[l] === atom.previous[l] ? 0 : 1

  kinetic(atom, atom.re, atom.im, -1)
  countSource(atom, atom.re, atom.im, atom.previous)
  unload(atom.engine, atom.light, atom.levels, atom.previous)
  interaction(atom, 'beaten')
  potentialStep(atom, -1)
}

// the source the state holds against the one counted from the walk now (the forward consistency check)
export function sourceConsistency(atom: QuantumAtom): number {
  loadedSource(atom.engine, atom.light, atom.levels, atom.previous)
  countSource(atom, atom.re, atom.im, atom.source)

  let m = 0

  for (let l = 0; l < atom.source.length; l++) m += atom.source[l] === atom.previous[l] ? 0 : 1

  return m
}

// ---------------------------------------------------------------------------------------------------------
// readings

export function walkEnergy(atom: QuantumAtom): number {
  const re = atom.work[1]!
  const im = atom.work[2]!
  let v = 0

  re.set(atom.re)
  im.set(atom.im)

  for (let i = 0; i < re.length; i++) v += atom.nucleus[i]! * (re[i]! ** 2 + im[i]! ** 2)

  fft3(re, im, atom.side, false)

  let t = 0

  for (let i = 0; i < re.length; i++) t += atom.band[i]! * (re[i]! ** 2 + im[i]! ** 2)

  return t / re.length + v
}

export function overlap(atom: QuantumAtom, u: Float64Array): number {
  let r = 0
  let m = 0

  for (let i = 0; i < u.length; i++) {
    r += u[i]! * atom.re[i]!
    m += u[i]! * atom.im[i]!
  }

  return r * r + m * m
}

// the chance within radius R of the nucleus, and the norm
export function within(atom: QuantumAtom, radius: number): { inside: number; norm: number } {
  const side = atom.side
  const h = side / 2
  let inside = 0
  let norm = 0

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const i = x + side * (y + side * z)
        const p = atom.re[i]! ** 2 + atom.im[i]! ** 2

        norm += p
        if ((x - h) ** 2 + (y - h) ** 2 + (z - h) ** 2 <= radius * radius) inside += p
      }
    }
  }

  return { inside, norm }
}

// the dipole <x - x0> of the walk
export function dipoleX(atom: QuantumAtom): number {
  const side = atom.side
  const h = side / 2
  let d = 0

  for (let i = 0; i < atom.re.length; i++) d += (atom.re[i]! ** 2 + atom.im[i]! ** 2) * ((i % side) - h)

  return d
}

// Gauss in the shadow: max over docks of |div (X / q^L) + (rho - rho0)| (div S* = -(rho - rho0) exactly), and
// the integer charges div S the string records
export function gaussReading(atom: QuantumAtom, rho0: Float64Array): { shadowMax: number; integerMax: number; integerDocks: number; integerTotal: number; integerIdentity: number } {
  const { engine, light: s, levels } = atom
  const g = engine.geometry
  const scale = bucketScale(engine, levels)
  const x = new Int32Array(g.huskLinks)

  loadedSource(engine, s, levels, x)

  const divX = new Float64Array(g.huskDocks)
  const divS = new Int32Array(g.huskDocks)
  const divE = new Int32Array(g.huskDocks)

  shapedFlux(engine, s, false, atom.flux)

  for (let l = 0; l < g.huskLinks; l++) {
    const y = Math.floor(l / 9)
    const z = g.huskNeighbour[l]!

    divX[y] = divX[y]! + x[l]!
    divX[z] = divX[z]! - x[l]!
    divS[y] = divS[y]! + s.string[l]!
    divS[z] = divS[z]! - s.string[l]!
    divE[y] = divE[y]! + atom.flux[l]!
    divE[z] = divE[z]! - atom.flux[l]!
  }

  let shadowMax = 0
  let integerMax = 0
  let integerDocks = 0
  let integerTotal = 0
  let integerIdentity = 0

  for (let y = 0; y < g.huskDocks; y++) {
    const rho = atom.re[y]! ** 2 + atom.im[y]! ** 2

    shadowMax = Math.max(shadowMax, Math.abs(divX[y]! / scale + (rho - rho0[y]!)))
    integerMax = Math.max(integerMax, Math.abs(divS[y]!))
    integerDocks += divS[y] === 0 ? 0 : 1
    integerTotal += divS[y]!
    integerIdentity += divE[y] === divS[y] ? 0 : 1
  }

  return { shadowMax, integerMax, integerDocks, integerTotal, integerIdentity }
}

export function lightSnapshot(atom: QuantumAtom): PolarizedState {
  return copyPolarized(atom.light)
}

export function lightMismatches(a: PolarizedState, b: PolarizedState): number {
  const x = polarizedArrays(a)
  const y = polarizedArrays(b)
  let m = 0

  x.forEach((arr, i) => arr.forEach((v, j) => (m += v === y[i]![j] ? 0 : 1)))

  return m
}
