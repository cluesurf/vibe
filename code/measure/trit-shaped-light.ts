// Measurement for the shaped husk light (E-FRC-0214) and a hopping charge's radiation. Real numbers live
// here only: the rules (code/rule/trit-husk, trit-husk-shaped) hold integers.
//
// THE SHADOW. With L shaped levels the rule carries f = sum_i C_i / q^i per husk triangle (L = 1 is the
// wave form of E-FRC-0185 / 0205). After a beat the state holds f_(t+1) (the counters) and f_t (the lags),
// and the shadow
//   A~_(t+1) = A_(t+1) + C^T f_t,   E~_(t+1) = E_(t+1) + C^T (f_(t+1) - f_t)
// runs the linear leapfrog up to the last carry's residual. Its energy is the leapfrog's discrete invariant
//   I = (pi / D) [ 1/2 sum E~^2 / g + (kappa / 8) sum n_P B~(A~_t) B~(A~_t + E~_t) ]
// (code/measure/trit-hop-light), with B~ = B(A) centered plus C W C^T f.
//
// THE HOP. A charge hopping forth and back on one husk axis link (the column-summed current of a trit
// crossing, E-FRC-0210) every `half` beats, in the integer rule and in the linear leapfrog with the same
// current (E-FRC-0211 section M): the shadow flux beyond a radius against the linear flux, as a coherent gain
// <E~, E_lin> / <E_lin, E_lin> and an incoherent remainder |E~ - E_lin|^2 / |E_lin|^2 (metric 1 / g), and the
// total energies.

import { G_METRIC, dockAt, emptyLinear, energyMask, linearBeat, linearEnergy, linearFlux, type EnergyMask } from '@/code/measure/trit-hop-light'
import { addCurrent, makeHuskEngine, type HuskEngine, type HuskGeometry } from '@/code/rule/trit-husk'
import { emptyShaped, makeShapedScratch, shapedBeat, shapedFlux, type ShapedOptions, type ShapedState } from '@/code/rule/trit-husk-shaped'

const mod = (x: number, m: number): number => ((x % m) + m) % m

// f_t and f_(t+1) per triangle
export function carriedFractions(engine: HuskEngine, s: ShapedState): { now: Float64Array; next: Float64Array } {
  const q = engine.q
  const n = engine.geometry.triangles
  const now = new Float64Array(n)
  const next = new Float64Array(n)

  for (let p = 0; p < n; p++) {
    let a = (s.lag[p] ?? 0) / q
    let b = (s.counter[p] ?? 0) / q
    let scale = q

    for (let i = 0; i < s.upper.length; i++) {
      scale *= q
      a += (s.upperLag[i]![p] ?? 0) / scale
      b += (s.upper[i]![p] ?? 0) / scale
    }

    now[p] = a
    next[p] = b
  }

  return { now, next }
}

function curlT(g: HuskGeometry, x: Float64Array, out: Float64Array): void {
  out.fill(0)

  for (let p = 0; p < g.triangles; p++) {
    const v = x[p] ?? 0

    if (v === 0) continue

    for (let j = 0; j < 3; j++) {
      const l = g.triLinks[p * 3 + j] ?? 0

      out[l] = (out[l] ?? 0) + (g.triSigns[p * 3 + j] ?? 0) * v
    }
  }
}

export type ShadowScratch = { flux: Int32Array; nowCurl: Float64Array; nextCurl: Float64Array; shadow: Float64Array }

export const makeShadowScratch = (g: HuskGeometry): ShadowScratch => ({
  flux: new Int32Array(g.huskLinks),
  nowCurl: new Float64Array(g.huskLinks),
  nextCurl: new Float64Array(g.huskLinks),
  shadow: new Float64Array(g.huskLinks),
})

// the shadow flux E~ into scratch.shadow, and the shadow invariant over the mask
export function shadowReading(engine: HuskEngine, s: ShapedState, options: ShapedOptions, mask: EnergyMask, scratch: ShadowScratch): number {
  const g = engine.geometry
  const { now, next } = carriedFractions(engine, s)
  const kappa = (2 * engine.p) / engine.q
  const nb = engine.nb

  shapedFlux(engine, s, options.cyclic, scratch.flux)
  curlT(g, now, scratch.nowCurl)
  curlT(g, next, scratch.nextCurl)

  let e = 0

  for (let l = 0; l < g.huskLinks; l++) {
    const x = (scratch.flux[l] ?? 0) + (scratch.nextCurl[l] ?? 0) - (scratch.nowCurl[l] ?? 0)

    scratch.shadow[l] = x

    if (mask.links[l]) e += (x * x) / (2 * (G_METRIC[l % 9] ?? 1))
  }

  for (let p = 0; p < g.triangles; p++) {
    if (!mask.triangles[p]) continue

    let bn = 0
    let bt = 0
    let sn = 0
    let st = 0

    for (let j = 0; j < 3; j++) {
      const l = g.triLinks[p * 3 + j] ?? 0
      const c = (g.triSigns[p * 3 + j] ?? 0) * (g.weight[l % 9] ?? 0)

      bn += c * (s.angle[l] ?? 0)
      bt += c * ((s.angle[l] ?? 0) + (scratch.flux[l] ?? 0))
      sn += c * (scratch.nowCurl[l] ?? 0)
      st += c * (scratch.nextCurl[l] ?? 0)
    }

    const b0 = mod(bn + nb / 2, nb) - nb / 2 + sn
    const b1 = mod(bt + nb / 2, nb) - nb / 2 + st

    e += (kappa / 8) * (g.multiplicity[p] ?? 0) * b0 * b1
  }

  return (Math.PI / engine.depth) * e
}

export type HopRadiation = {
  gain: number
  incoherentOverSignal: number
  integerTotal: number
  linearTotal: number
  integerOverLinearTotal: number
  hops: number
}

// a charge hopping forth and back on the axis link at the origin, every `half` beats, for `beats` beats;
// read beyond `radius`
export function hopRadiation(input: { geometry: HuskGeometry; depth: number; options: ShapedOptions; beats: number; half: number; radius: number }): HopRadiation {
  const { geometry: g, depth, options, beats, half, radius } = input
  const engine = makeHuskEngine(g, depth)
  const center = dockAt(g.side, 0, 0, 0)
  const all = energyMask(g, center, -1)
  const far = energyMask(g, center, radius)
  const s = emptyShaped(g, options.levels)
  const shapedScratch = makeShapedScratch(g, options.levels)
  const lin = emptyLinear(g)
  const scratch = new Float64Array(g.huskLinks)
  const next = new Float64Array(g.huskLinks)
  const reading = makeShadowScratch(g)
  let hops = 0

  for (let t = 0; t < beats; t++) {
    const j = t % (2 * half) === 0 ? 1 : t % (2 * half) === half ? -1 : 0

    if (j !== 0) {
      addCurrent(s, center * 9, j)
      lin.string[center * 9] = (lin.string[center * 9] ?? 0) - j
      hops++
    }

    shapedBeat(engine, s, shapedScratch, options)
    linearBeat(engine, lin, scratch)
  }

  const integerTotal = shadowReading(engine, s, options, all, reading)

  shadowReading(engine, s, options, far, reading)

  const linearTotal = linearEnergy(engine, lin, all, scratch, next)

  linearFlux(g, lin, scratch)

  let dot = 0
  let norm = 0
  let rest = 0

  for (let l = 0; l < g.huskLinks; l++) {
    if (!far.links[l]) continue

    const w = 1 / (G_METRIC[l % 9] ?? 1)
    const x = reading.shadow[l] ?? 0
    const y = scratch[l] ?? 0

    dot += w * x * y
    norm += w * y * y
    rest += w * (x - y) ** 2
  }

  return { gain: dot / norm, incoherentOverSignal: rest / norm, integerTotal, linearTotal, integerOverLinearTotal: integerTotal / linearTotal, hops }
}

// the shadow energy of a single unit impulse on the axis link at the origin, read every `every` beats
export function impulseHeating(input: { geometry: HuskGeometry; depth: number; options: ShapedOptions; beats: number; every: number }): number[] {
  const { geometry: g, depth, options, beats, every } = input
  const engine = makeHuskEngine(g, depth)
  const all = energyMask(g, 0, -1)
  const s = emptyShaped(g, options.levels)
  const shapedScratch = makeShapedScratch(g, options.levels)
  const reading = makeShadowScratch(g)
  const out: number[] = []

  addCurrent(s, 0, 1)

  for (let t = 0; t < beats; t++) {
    shapedBeat(engine, s, shapedScratch, options)

    if (t % every === every - 1) out.push(shadowReading(engine, s, options, all, reading))
  }

  return out
}
