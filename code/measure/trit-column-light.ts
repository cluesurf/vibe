// Measurement for the trit-column light rule (code/rule/trit-column): the husk symbol of the rule, its
// comparison with E-FRC-0179's husk symbol read off the bulk, coherent husk waves, and the husk readings.
// Real numbers live here only. The rule file holds integers.

import { makeComplexMatrix, type ComplexMatrix } from '@/code/algebra/linear/dense'
import { hermitianEigen } from '@/code/measure/photon-modes'
import { curlSymbol, huskSymbol, plaquetteShapes } from '@/code/measure/photon-symbol'
import { makeHusk } from '@/code/measure/photon-husk'
import { photonLatticeD4 } from '@/code/rule/photon-links'
import {
  emptyTritState,
  readHusk,
  tritLightBeat,
  writeHusk,
  emptyTally,
  huskField,
  huskCurlT,
  huskCurlWeighted,
  huskLightBeat,
  type TritLight,
  type TritState,
  type HuskLightState,
} from '@/code/rule/trit-column'
import { weyl } from '@/code/tool/weyl'

// g, the husk metric: 2 on an axis, 1 on a diagonal (w = 2 / g)
const G = [2, 2, 2, 1, 1, 1, 1, 1, 1]

function huskCoordinates(light: TritLight, y: number): [number, number, number] {
  const s = light.bulk.side

  return [y % s, Math.floor(y / s) % s, Math.floor(y / (s * s))]
}

// K(k) = sum over the husk triangles of one husk dock of n_P conj(phi_a) phi_b, phi_a = c_a e^(i k . y_a)
// (averaged over the torus), so M_h(k) = K G^(-1) and the Hermitian form is G^(-1/2) K G^(-1/2)
export function tritHuskSymbol(light: TritLight, k: readonly number[]): { k: ComplexMatrix; hermitian: ComplexMatrix } {
  const { bulk } = light
  const km = makeComplexMatrix({ rows: 9, cols: 9 })
  const re = new Float64Array(9)
  const im = new Float64Array(9)

  for (let p = 0; p < bulk.huskTriangles; p++) {
    re.fill(0)
    im.fill(0)

    for (let j = 0; j < 3; j++) {
      const l = bulk.huskTriLinks[p * 3 + j] ?? 0
      const y = huskCoordinates(light, Math.floor(l / 9))
      const phase = y[0] * (k[0] ?? 0) + y[1] * (k[1] ?? 0) + y[2] * (k[2] ?? 0)
      const c = bulk.huskTriSigns[p * 3 + j] ?? 0

      re[l % 9] = (re[l % 9] ?? 0) + c * Math.cos(phase)
      im[l % 9] = (im[l % 9] ?? 0) + c * Math.sin(phase)
    }

    const n = (bulk.multiplicity[p] ?? 0) / bulk.huskDocks

    for (let a = 0; a < 9; a++) {
      for (let b = 0; b < 9; b++) {
        // conj(phi_a) phi_b
        km.re[a * 9 + b] = (km.re[a * 9 + b] ?? 0) + n * ((re[a] ?? 0) * (re[b] ?? 0) + (im[a] ?? 0) * (im[b] ?? 0))
        km.im[a * 9 + b] = (km.im[a * 9 + b] ?? 0) + n * ((re[a] ?? 0) * (im[b] ?? 0) - (im[a] ?? 0) * (re[b] ?? 0))
      }
    }
  }

  const hermitian = makeComplexMatrix({ rows: 9, cols: 9 })

  for (let a = 0; a < 9; a++) {
    for (let b = 0; b < 9; b++) {
      const s = 1 / Math.sqrt((G[a] ?? 1) * (G[b] ?? 1))

      hermitian.re[a * 9 + b] = (km.re[a * 9 + b] ?? 0) * s
      hermitian.im[a * 9 + b] = (km.im[a * 9 + b] ?? 0) * s
    }
  }

  return { k: km, hermitian }
}

export type Eigen = { values: number[]; vectors: { re: Float64Array; im: Float64Array }[] }

export function sortedEigen(m: ComplexMatrix): Eigen {
  const e = hermitianEigen(m)
  const n = m.rows
  const order = Array.from(e.values, (v, i) => [v, i] as const).sort((a, b) => a[0] - b[0])

  return {
    values: order.map(([v]) => v),
    vectors: order.map(([, i]) => ({
      re: Float64Array.from({ length: n }, (_, a) => e.vectorsRe[a * n + i] ?? 0),
      im: Float64Array.from({ length: n }, (_, a) => e.vectorsIm[a * n + i] ?? 0),
    })),
  }
}

// E-FRC-0179's husk symbol at the same husk wave vector, read off a D4 box through code/measure/photon-symbol
let e179: { husk: ReturnType<typeof makeHusk>; shapes: ReturnType<typeof plaquetteShapes> } | undefined

export function e179HuskValues(k: readonly number[]): number[] {
  if (!e179) {
    const lattice = photonLatticeD4({ side: 4 })

    e179 = { husk: makeHusk(lattice), shapes: plaquetteShapes(lattice) }
  }

  const m = curlSymbol(e179.husk.bulk, e179.shapes, [k[0] ?? 0, k[1] ?? 0, k[2] ?? 0, 0])

  return sortedEigen(huskSymbol(e179.husk, m).hermitian).values
}

// omega from 4 sin^2(omega / 2) = kappa lambda
export function symbolOmega(kappa: number, lambda: number): number {
  const x = kappa * lambda

  return x >= 0 && x <= 4 ? 2 * Math.asin(Math.sqrt(x) / 2) : Number.NaN
}

export const tritKappa = (light: TritLight): number => (2 * light.p) / light.q

export type WaveReading = {
  lambda: number
  omegaSymbol: number
  omegaRead: number
  // read on the shadow B~ (the wave form) or on B (the first form)
  relative: number
  // read on the raw B
  rawRelative: number
  peakB: number
  maxField: number
  // the largest |B - B~|, the wave form's dither in B
  maxDither: number
  angleWraps: number
  potentialWraps: number
  maxPotential: number
  flipsPerBeat: number
  reach: number
}

// a coherent husk wave: A = floor(amp Re(v e^(i k . y)) + 1/2) on the photon eigenvector v = G^(1/2) u of
// branch `rank` (1 and 2 are the photons, 0 the gauge mode), E = 0, the counters on the golden Weyl start;
// the amplitude is scaled so the largest |B| is `peakB`. Runs the trit rule and reads omega with the
// three-point estimator on the left-eigenvector projection z_t = sum conj(l) e^(-i k . y) A_t
export function tritWave(light: TritLight, k: readonly number[], rank: number, peakB: number, beats: number, engine: 'trit' | 'husk' = 'trit'): WaveReading {
  const { bulk } = light
  const sym = tritHuskSymbol(light, k)
  const eig = sortedEigen(sym.hermitian)
  const u = eig.vectors[rank] ?? { re: new Float64Array(9), im: new Float64Array(9) }
  const lambda = eig.values[rank] ?? 0
  const mode = (y: number, h: number): number => {
    const c = huskCoordinates(light, y)
    const phase = c[0] * (k[0] ?? 0) + c[1] * (k[1] ?? 0) + c[2] * (k[2] ?? 0)
    const g = Math.sqrt(G[h] ?? 1)

    return g * ((u.re[h] ?? 0) * Math.cos(phase) - (u.im[h] ?? 0) * Math.sin(phase))
  }
  // unit-amplitude field B, then scale
  const unit = new Float64Array(bulk.huskLinks)

  for (let l = 0; l < bulk.huskLinks; l++) {
    unit[l] = mode(Math.floor(l / 9), l % 9)
  }

  let unitPeak = 0

  for (let p = 0; p < bulk.huskTriangles; p++) {
    let b = 0

    for (let j = 0; j < 3; j++) {
      const l = bulk.huskTriLinks[p * 3 + j] ?? 0

      b += (bulk.huskTriSigns[p * 3 + j] ?? 0) * (bulk.weight[l % 9] ?? 0) * (unit[l] ?? 0)
    }

    unitPeak = Math.max(unitPeak, Math.abs(b))
  }

  const amp = peakB / unitPeak
  const state = emptyTritState(light)
  const husk = readHusk(light, state)

  for (let l = 0; l < bulk.huskLinks; l++) {
    // the start is set up with a rounding (measurement side), then put in its window: the angle is a cycling
    // number, and B mod N_B does not see the wrap
    const n = light.window[l % 9] ?? 1

    husk.angle[l] = mod(Math.floor(amp * (unit[l] ?? 0) + 0.5) + n / 2, n) - n / 2
  }

  // the first form's counter on the golden Weyl start; the wave form's carried integers at zero, the start at
  // which its shadow is the linear run itself (E-FRC-0185), and its spatial counter on the golden Weyl start
  for (let p = 0; p < bulk.huskTriangles; p++) {
    const w = Math.floor(weyl(p + 1) * light.q) - light.bulk.depth

    if (light.form === 'first') {
      husk.counter[p] = w
    } else {
      husk.spatial[p] = w
    }
  }

  writeHusk(light, state, husk)

  return readWave(light, state, k, u, lambda, beats, peakB, engine)
}

const mod = (x: number, m: number): number => ((x % m) + m) % m

// the plaquette pattern of the mode, beta_P = sum c w v e^(i k . y), v = G^(1/2) u, weighted by n_P: the
// branches are orthogonal in this product (v1^dagger W K W v2 = 4 lambda u1^dagger u2), and the gauge mode
// has none
function fieldPattern(light: TritLight, k: readonly number[], u: { re: Float64Array; im: Float64Array }): { re: Float64Array; im: Float64Array } {
  const { bulk } = light
  const re = new Float64Array(bulk.huskTriangles)
  const im = new Float64Array(bulk.huskTriangles)

  for (let p = 0; p < bulk.huskTriangles; p++) {
    for (let j = 0; j < 3; j++) {
      const l = bulk.huskTriLinks[p * 3 + j] ?? 0
      const h = l % 9
      const c = huskCoordinates(light, Math.floor(l / 9))
      const phase = c[0] * (k[0] ?? 0) + c[1] * (k[1] ?? 0) + c[2] * (k[2] ?? 0)
      const s = (bulk.huskTriSigns[p * 3 + j] ?? 0) * (bulk.weight[h] ?? 0) * Math.sqrt(G[h] ?? 1)
      const vr = u.re[h] ?? 0
      const vi = u.im[h] ?? 0

      re[p] = (re[p] ?? 0) + s * (vr * Math.cos(phase) - vi * Math.sin(phase))
      im[p] = (im[p] ?? 0) + s * (vr * Math.sin(phase) + vi * Math.cos(phase))
    }

    re[p] = (re[p] ?? 0) * (bulk.multiplicity[p] ?? 0)
    im[p] = (im[p] ?? 0) * (bulk.multiplicity[p] ?? 0)
  }

  return { re, im }
}

// z = sum over P of conj(n_P beta_P) B_P, B the centered plaquette field (gauge invariant, blind to wraps).
// With `lag`, the wave form's shadow B~ = B + C W C^T lag / q
function project(light: TritLight, angle: Int32Array, pattern: { re: Float64Array; im: Float64Array }, lag?: Int32Array): [number, number] {
  let zr = 0
  let zi = 0
  const shift = lag ? huskCurlT(light, lag) : undefined

  for (let p = 0; p < light.bulk.huskTriangles; p++) {
    const b = huskField(light, angle, p) + (shift ? huskCurlWeighted(light, shift, p) / light.q : 0)

    zr += (pattern.re[p] ?? 0) * b
    zi -= (pattern.im[p] ?? 0) * b
  }

  return [zr, zi]
}


function omegaOf(zs: readonly (readonly [number, number])[]): number {
  let num = 0
  let den = 0

  for (let t = 1; t < zs.length - 1; t++) {
    const [ar, ai] = zs[t] ?? [0, 0]
    const [br, bi] = zs[t + 1] ?? [0, 0]
    const [cr, ci] = zs[t - 1] ?? [0, 0]

    num += ar * (br + cr) + ai * (bi + ci)
    den += 2 * (ar * ar + ai * ai)
  }

  return Math.acos(Math.max(-1, Math.min(1, num / den)))
}

// run the wave and read it. `engine` 'trit' runs the trit rule on the bulk; 'husk' runs the husk integer rule
// on the decoded integers, which the trit rule equals bit for bit (E-FRC-0207 gate A), for the larger boxes
function readWave(light: TritLight, state: TritState, k: readonly number[], u: { re: Float64Array; im: Float64Array }, lambda: number, beats: number, peakB: number, engine: 'trit' | 'husk'): WaveReading {
  const raw: [number, number][] = []
  const shadow: [number, number][] = []
  const tally = emptyTally()
  const pattern = fieldPattern(light, k, u)
  const husk = readHusk(light, state)

  let maxPotential = 0
  let maxField = 0
  let maxDither = 0

  const read = (h: HuskLightState): void => {
    raw.push(project(light, h.angle, pattern))
    shadow.push(light.form === 'wave' ? project(light, h.angle, pattern, h.lag) : project(light, h.angle, pattern))

    const shift = light.form === 'wave' ? huskCurlT(light, h.lag) : undefined

    for (let p = 0; p < h.potential.length; p++) {
      maxPotential = Math.max(maxPotential, Math.abs(h.potential[p] ?? 0))
      maxField = Math.max(maxField, Math.abs(huskField(light, h.angle, p)))

      if (shift) {
        maxDither = Math.max(maxDither, Math.abs(huskCurlWeighted(light, shift, p)) / light.q)
      }
    }
  }

  read(husk)

  for (let t = 0; t < beats; t++) {
    if (engine === 'trit') {
      tritLightBeat(light, state, tally)
      read(readHusk(light, state))
    } else {
      huskLightBeat(light, husk, tally)
      read(husk)
    }
  }

  const omegaSymbol = symbolOmega(tritKappa(light), lambda)
  const omegaRead = omegaOf(shadow)
  const omegaRaw = omegaOf(raw)

  return {
    lambda,
    omegaSymbol,
    omegaRead,
    relative: omegaRead / omegaSymbol - 1,
    rawRelative: omegaRaw / omegaSymbol - 1,
    peakB,
    maxField,
    maxDither,
    angleWraps: tally.wraps,
    potentialWraps: tally.potentialWraps,
    maxPotential,
    flipsPerBeat: tally.flips / beats,
    reach: tally.reach,
  }
}
