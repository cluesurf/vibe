// Lattice gauge theory for the three compact groups of the Standard Model, U(1), SU(2) and SU(3)
// (and SU(4), the next SU(N), used to separate what scales with N from what does not), on
// a periodic hypercubic lattice of any dimension. SU(3) is quantum chromodynamics without quarks:
// the eight gluon fields and their self-interaction, nothing put in by hand beyond the Wilson action.
//
//   S = beta * sum over plaquettes of (1 - (1 / N) Re Tr U_plaquette)
//
// with beta = 2N / g^2 for SU(N) and beta = 1 / g^2 for U(1). The update is a heatbath, which draws
// each link fresh from its exact conditional distribution, followed by overrelaxation, which
// reflects each link to the far side of its conditional distribution without changing the action.
//
// - U(1): the conditional density of the link angle is a von Mises distribution, sampled exactly by
//   the Best-Fisher algorithm.
// - SU(2): the conditional density is exp(alpha h0) on the 3-sphere, sampled exactly by
//   Kennedy-Pendleton (large alpha) or Creutz's inversion (small alpha).
// - SU(3): Cabibbo-Marinari, the SU(2) heatbath applied in turn to the three SU(2) subgroups that
//   act on index pairs (0, 1), (1, 2) and (0, 2). This is ergodic on SU(3) and leaves the Boltzmann
//   distribution invariant.
//
// Every draw comes from a seeded generator, so a run is a pure function of (seed, parameters).

import { Rng } from '@/code/tool/rng'
import { Hypercubic, makeHypercubic } from '@/code/tool/hypercubic'
import {
  MatrixSlot,
  addInto,
  copyMatrix,
  multiplyByCenter,
  multiplyInto,
  reunitarize,
  setIdentity,
  zeroMatrix,
} from '@/code/algebra/group/unitary-matrix'

export type GaugeGroup = 'u1' | 'su2' | 'su3' | 'su4'

export type GaugeLattice = {
  readonly form: 'gauge-lattice'
  readonly group: GaugeGroup
  // the matrix size, 1 for U(1), 2 for SU(2), 3 for SU(3)
  readonly n: number
  readonly geometry: Hypercubic
  // link (site, mu) is the matrix at offset (site * dim + mu) * 2 * n * n
  readonly links: Float64Array
}

const GROUP_SIZE: Record<GaugeGroup, number> = { u1: 1, su2: 2, su3: 3, su4: 4 }

// The SU(2) subgroups Cabibbo-Marinari cycles through: every index pair (i, j), i < j. For SU(3)
// that is (0, 1), (0, 2), (1, 2), for SU(4) six pairs. Any set covering every pair is ergodic.
function subgroupPairs(n: number): (readonly [number, number])[] {
  const pairs: (readonly [number, number])[] = []

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push([i, j])
    }
  }

  return pairs
}

const SUBGROUPS: Record<number, readonly (readonly [number, number])[]> = {
  2: subgroupPairs(2),
  3: subgroupPairs(3),
  4: subgroupPairs(4),
}

export function groupSize(input: { group: GaugeGroup }): number {
  return GROUP_SIZE[input.group]
}

// A cold start (every link the identity, the ordered vacuum) or a hot start (every link a random
// group element, the disordered state).
export function makeGaugeLattice(input: {
  group: GaugeGroup
  lengths: readonly number[]
  start: 'cold' | 'hot'
  rng: Rng
}): GaugeLattice {
  const n = GROUP_SIZE[input.group]
  const geometry = makeHypercubic({ lengths: input.lengths })
  const size = 2 * n * n
  const links = new Float64Array(geometry.sites * geometry.dim * size)

  for (let link = 0; link < geometry.sites * geometry.dim; link++) {
    const slot = { data: links, offset: link * size }

    if (input.start === 'cold') {
      setIdentity({ n, out: slot })
    } else {
      for (let k = 0; k < size; k++) {
        links[link * size + k] = input.rng.nextGaussian()
      }

      reunitarize({ n, out: slot })
    }
  }

  return { form: 'gauge-lattice', group: input.group, n, geometry, links }
}

export function linkSlot(input: {
  lattice: GaugeLattice
  site: number
  mu: number
}): MatrixSlot {
  const { lattice } = input

  return {
    data: lattice.links,
    offset:
      (input.site * lattice.geometry.dim + input.mu) * 2 * lattice.n * lattice.n,
  }
}

// Scratch space one sweep reuses, so the inner loop never allocates.
type Scratch = {
  first: MatrixSlot
  second: MatrixSlot
  staple: MatrixSlot
  product: MatrixSlot
}

function makeScratch(input: { n: number }): Scratch {
  const size = 2 * input.n * input.n
  const buffer = new Float64Array(4 * size)

  return {
    first: { data: buffer, offset: 0 },
    second: { data: buffer, offset: size },
    staple: { data: buffer, offset: 2 * size },
    product: { data: buffer, offset: 3 * size },
  }
}

// The staple sum A of link (site, mu): the other three links of each of the 2 (dim - 1) plaquettes
// that contain it. The part of the action that depends on the link is -(beta / N) Re Tr(U A).
// `directions`, when given, keeps only the plaquettes in the (mu, nu) planes with nu in the list,
// which is how a smearing restricted to space leaves time alone. A^dag is the sum of the three-link
// paths from site to site + mu, so it points the same way as the link.
export function stapleInto(input: {
  lattice: GaugeLattice
  site: number
  mu: number
  out: MatrixSlot
  scratch?: Scratch
  directions?: readonly number[]
}): void {
  const { lattice, site, mu, out } = input
  const { n, geometry } = lattice
  const { dim, up, down } = geometry
  const scratch = input.scratch ?? makeScratch({ n })
  const link = (s: number, direction: number): MatrixSlot =>
    linkSlot({ lattice, site: s, mu: direction })

  zeroMatrix({ n, out })

  const siteMu = up[site * dim + mu] ?? 0

  for (let nu = 0; nu < dim; nu++) {
    if (nu === mu || (input.directions !== undefined && !input.directions.includes(nu))) {
      continue
    }

    const siteNu = up[site * dim + nu] ?? 0

    // forward: U_nu(x + mu) U_mu(x + nu)^dag U_nu(x)^dag
    multiplyInto({
      n,
      a: link(siteMu, nu),
      b: link(siteNu, mu),
      out: scratch.first,
      daggerB: true,
    })
    multiplyInto({
      n,
      a: scratch.first,
      b: link(site, nu),
      out: scratch.second,
      daggerB: true,
    })
    addInto({ n, a: scratch.second, out })

    // backward: U_nu(x + mu - nu)^dag U_mu(x - nu)^dag U_nu(x - nu)
    const siteMuMinusNu = down[siteMu * dim + nu] ?? 0
    const siteMinusNu = down[site * dim + nu] ?? 0

    multiplyInto({
      n,
      a: link(siteMuMinusNu, nu),
      b: link(siteMinusNu, mu),
      out: scratch.first,
      daggerA: true,
      daggerB: true,
    })
    multiplyInto({
      n,
      a: scratch.first,
      b: link(siteMinusNu, nu),
      out: scratch.second,
    })
    addInto({ n, a: scratch.second, out })
  }
}

// One draw of h0 from the density sqrt(1 - h0^2) exp(alpha h0) on [-1, 1], the conditional
// distribution of the SU(2) heatbath. Kennedy-Pendleton is efficient for large alpha, Creutz's
// inversion for small alpha. Both are exact.
export function sampleSu2HeatbathWeight(input: {
  alpha: number
  rng: Rng
}): number {
  const { alpha, rng } = input

  if (alpha > 2) {
    for (;;) {
      const r1 = 1 - rng.next()
      const r2 = rng.next()
      const r3 = 1 - rng.next()
      const c = Math.cos(2 * Math.PI * r2)
      const lambdaSquared = -(Math.log(r1) + c * c * Math.log(r3)) / (2 * alpha)
      const r4 = rng.next()

      if (r4 * r4 <= 1 - lambdaSquared) {
        return 1 - 2 * lambdaSquared
      }
    }
  }

  const floor = Math.exp(-2 * alpha)

  for (;;) {
    const r = rng.next()
    const h0 =
      alpha < 1e-12
        ? 2 * r - 1
        : 1 + Math.log(r * (1 - floor) + floor) / alpha

    if (rng.next() <= Math.sqrt(Math.max(0, 1 - h0 * h0))) {
      return h0
    }
  }
}

// One draw of an angle from the von Mises density exp(kappa cos theta), by Best and Fisher (1979).
export function sampleVonMises(input: { kappa: number; rng: Rng }): number {
  const { kappa, rng } = input

  if (kappa < 1e-8) {
    return Math.PI * (2 * rng.next() - 1)
  }

  const tau = 1 + Math.sqrt(1 + 4 * kappa * kappa)
  const rho = (tau - Math.sqrt(2 * tau)) / (2 * kappa)
  const r = (1 + rho * rho) / (2 * rho)

  for (;;) {
    const z = Math.cos(Math.PI * rng.next())
    const f = (1 + r * z) / (r + z)
    const c = kappa * (r - f)
    const u2 = 1 - rng.next()

    if (c * (2 - c) - u2 > 0 || Math.log(c / u2) + 1 - c >= 0) {
      const angle = Math.acos(Math.max(-1, Math.min(1, f)))

      return rng.next() < 0.5 ? -angle : angle
    }
  }
}

// Left-multiply rows i and j of a matrix by the 2 x 2 complex matrix g (entries g00, g01, g10, g11
// as [re, im] pairs flattened).
function rotateRows(input: {
  n: number
  target: MatrixSlot
  i: number
  j: number
  g: Float64Array
}): void {
  const { n, target, i, j, g } = input
  const d = target.data

  for (let column = 0; column < n; column++) {
    const ki = target.offset + 2 * (i * n + column)
    const kj = target.offset + 2 * (j * n + column)
    const xr = d[ki] ?? 0
    const xi = d[ki + 1] ?? 0
    const yr = d[kj] ?? 0
    const yi = d[kj + 1] ?? 0

    d[ki] = (g[0] ?? 0) * xr - (g[1] ?? 0) * xi + (g[2] ?? 0) * yr - (g[3] ?? 0) * yi
    d[ki + 1] = (g[0] ?? 0) * xi + (g[1] ?? 0) * xr + (g[2] ?? 0) * yi + (g[3] ?? 0) * yr
    d[kj] = (g[4] ?? 0) * xr - (g[5] ?? 0) * xi + (g[6] ?? 0) * yr - (g[7] ?? 0) * yi
    d[kj + 1] = (g[4] ?? 0) * xi + (g[5] ?? 0) * xr + (g[6] ?? 0) * yi + (g[7] ?? 0) * yr
  }
}

// The SU(2) matrix M(a) = [[a0 + i a3, a2 + i a1], [-a2 + i a1, a0 - i a3]] as a flat 8-vector.
function quaternionMatrix(input: {
  a0: number
  a1: number
  a2: number
  a3: number
  out: Float64Array
}): void {
  const { a0, a1, a2, a3, out } = input

  out[0] = a0
  out[1] = a3
  out[2] = a2
  out[3] = a1
  out[4] = -a2
  out[5] = a1
  out[6] = a0
  out[7] = -a3
}

// 2 x 2 complex product, flat 8-vectors, out = a b^dag.
function multiplyTwoDagger(a: Float64Array, b: Float64Array, out: Float64Array): void {
  // b^dag entries: (0,0) = conj b00, (0,1) = conj b10, (1,0) = conj b01, (1,1) = conj b11
  const entry = (
    ar: number,
    ai: number,
    br: number,
    bi: number,
  ): [number, number] => [ar * br - ai * bi, ar * bi + ai * br]
  const b00: [number, number] = [b[0] ?? 0, -(b[1] ?? 0)]
  const b01: [number, number] = [b[4] ?? 0, -(b[5] ?? 0)]
  const b10: [number, number] = [b[2] ?? 0, -(b[3] ?? 0)]
  const b11: [number, number] = [b[6] ?? 0, -(b[7] ?? 0)]
  const x00 = entry(a[0] ?? 0, a[1] ?? 0, b00[0], b00[1])
  const y00 = entry(a[2] ?? 0, a[3] ?? 0, b10[0], b10[1])
  const x01 = entry(a[0] ?? 0, a[1] ?? 0, b01[0], b01[1])
  const y01 = entry(a[2] ?? 0, a[3] ?? 0, b11[0], b11[1])
  const x10 = entry(a[4] ?? 0, a[5] ?? 0, b00[0], b00[1])
  const y10 = entry(a[6] ?? 0, a[7] ?? 0, b10[0], b10[1])
  const x11 = entry(a[4] ?? 0, a[5] ?? 0, b01[0], b01[1])
  const y11 = entry(a[6] ?? 0, a[7] ?? 0, b11[0], b11[1])

  out[0] = x00[0] + y00[0]
  out[1] = x00[1] + y00[1]
  out[2] = x01[0] + y01[0]
  out[3] = x01[1] + y01[1]
  out[4] = x10[0] + y10[0]
  out[5] = x10[1] + y10[1]
  out[6] = x11[0] + y11[0]
  out[7] = x11[1] + y11[1]
}

const heatbathH = new Float64Array(8)
const heatbathV = new Float64Array(8)
const heatbathG = new Float64Array(8)

// Update one link in place. `product` holds W = U A on entry and is kept equal to (new U) A.
function updateLink(input: {
  lattice: GaugeLattice
  link: MatrixSlot
  product: MatrixSlot
  beta: number
  mode: 'heatbath' | 'overrelax'
  rng: Rng
}): void {
  const { lattice, link, product, beta, mode, rng } = input
  const { n } = lattice
  const w = product.data
  const o = product.offset

  if (n === 1) {
    const wr = w[o] ?? 0
    const wi = w[o + 1] ?? 0
    const modulus = Math.hypot(wr, wi)
    const phase = Math.atan2(wi, wr)
    // the link weight is exp(beta |W| cos(psi)), psi = arg(g W), g the new-over-old phase
    const psi =
      mode === 'heatbath'
        ? sampleVonMises({ kappa: beta * modulus, rng })
        : -phase
    const turn = psi - phase
    const c = Math.cos(turn)
    const s = Math.sin(turn)
    const lr = link.data[link.offset] ?? 0
    const li = link.data[link.offset + 1] ?? 0

    link.data[link.offset] = lr * c - li * s
    link.data[link.offset + 1] = lr * s + li * c
    w[o] = wr * c - wi * s
    w[o + 1] = wr * s + wi * c

    return
  }

  for (const [i, j] of SUBGROUPS[n] ?? []) {
    const at = (r: number, c: number, part: number): number =>
      w[o + 2 * (r * n + c) + part] ?? 0
    const a0 = (at(i, i, 0) + at(j, j, 0)) / 2
    const a1 = (at(i, j, 1) + at(j, i, 1)) / 2
    const a2 = (at(i, j, 0) - at(j, i, 0)) / 2
    const a3 = (at(i, i, 1) - at(j, j, 1)) / 2
    const k = Math.hypot(a0, a1, a2, a3)

    if (k < 1e-14) {
      continue
    }

    quaternionMatrix({ a0: a0 / k, a1: a1 / k, a2: a2 / k, a3: a3 / k, out: heatbathV })

    if (mode === 'heatbath') {
      // the subgroup weight is exp((beta / N) Re Tr(g W)) = exp((2 beta k / N) h0), h = g V
      const alpha = (2 * beta * k) / n
      const h0 = sampleSu2HeatbathWeight({ alpha, rng })
      const radius = Math.sqrt(Math.max(0, 1 - h0 * h0))
      const cosTheta = 2 * rng.next() - 1
      const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta))
      const phi = 2 * Math.PI * rng.next()

      quaternionMatrix({
        a0: h0,
        a1: radius * sinTheta * Math.cos(phi),
        a2: radius * sinTheta * Math.sin(phi),
        a3: radius * cosTheta,
        out: heatbathH,
      })
      // g = h V^dag
      multiplyTwoDagger(heatbathH, heatbathV, heatbathG)
    } else {
      // g = (V^dag)^2, which maps h = V to h = V^dag and keeps Re Tr h fixed
      quaternionMatrix({ a0: 1, a1: 0, a2: 0, a3: 0, out: heatbathH })
      multiplyTwoDagger(heatbathH, heatbathV, heatbathG)
      heatbathH.set(heatbathG)
      multiplyTwoDagger(heatbathH, heatbathV, heatbathG)
    }

    rotateRows({ n, target: link, i, j, g: heatbathG })
    rotateRows({ n, target: product, i, j, g: heatbathG })
  }
}

function sweep(input: {
  lattice: GaugeLattice
  beta: number
  mode: 'heatbath' | 'overrelax'
  rng: Rng
}): void {
  const { lattice } = input
  const { n, geometry } = lattice
  const scratch = makeScratch({ n })

  for (let site = 0; site < geometry.sites; site++) {
    for (let mu = 0; mu < geometry.dim; mu++) {
      const link = linkSlot({ lattice, site, mu })

      stapleInto({ lattice, site, mu, out: scratch.staple, scratch })
      multiplyInto({ n, a: link, b: scratch.staple, out: scratch.product })
      updateLink({
        lattice,
        link,
        product: scratch.product,
        beta: input.beta,
        mode: input.mode,
        rng: input.rng,
      })
      reunitarize({ n, out: link })
    }
  }
}

// One update: a heatbath sweep followed by `overrelaxation` overrelaxation sweeps, the standard
// compound step. Overrelaxation moves the configuration far through the space of equal action,
// which cuts the autocorrelation time without changing the distribution.
export function gaugeUpdate(input: {
  lattice: GaugeLattice
  beta: number
  overrelaxation: number
  rng: Rng
}): void {
  sweep({ lattice: input.lattice, beta: input.beta, mode: 'heatbath', rng: input.rng })

  for (let k = 0; k < input.overrelaxation; k++) {
    sweep({ lattice: input.lattice, beta: input.beta, mode: 'overrelax', rng: input.rng })
  }
}

// Thermalize, then take `measurements` samples of an observable with `separation` updates between
// them. The standard Monte Carlo loop, returned as the list of samples so the caller can form any
// estimator and its jackknife error.
export function sampleGaugeEnsemble<Sample>(input: {
  lattice: GaugeLattice
  beta: number
  thermalization: number
  measurements: number
  separation: number
  overrelaxation: number
  rng: Rng
  measure: (lattice: GaugeLattice) => Sample
}): Sample[] {
  const { lattice, beta, overrelaxation, rng } = input

  for (let k = 0; k < input.thermalization; k++) {
    gaugeUpdate({ lattice, beta, overrelaxation, rng })
  }

  const samples: Sample[] = []

  for (let m = 0; m < input.measurements; m++) {
    for (let k = 0; k < input.separation; k++) {
      gaugeUpdate({ lattice, beta, overrelaxation, rng })
    }

    samples.push(input.measure(lattice))
  }

  return samples
}

// Multiply every time-like link on one time slice by the center element exp(2 pi i k / N). The
// Wilson action is unchanged (every plaquette holds either zero or two such links, one of them
// daggered), while the Polyakov loop, which winds once around time, rotates by the same phase.
export function centerTransformTimeSlice(input: {
  lattice: GaugeLattice
  slice: number
  k: number
}): void {
  const { lattice } = input
  const { geometry } = lattice
  const timeAxis = geometry.dim - 1
  const spatialVolume = geometry.sites / (geometry.lengths[timeAxis] ?? 1)

  for (let s = 0; s < spatialVolume; s++) {
    const site = input.slice * spatialVolume + s

    multiplyByCenter({
      n: lattice.n,
      k: input.k,
      out: linkSlot({ lattice, site, mu: timeAxis }),
    })
  }
}

// A copy of a lattice, so one thermalized configuration can seed several runs.
export function cloneGaugeLattice(input: { lattice: GaugeLattice }): GaugeLattice {
  return { ...input.lattice, links: new Float64Array(input.lattice.links) }
}

// Copy one link into a caller buffer, a convenience for the measures.
export function readLink(input: {
  lattice: GaugeLattice
  site: number
  mu: number
  out: MatrixSlot
}): void {
  copyMatrix({
    n: input.lattice.n,
    from: linkSlot({ lattice: input.lattice, site: input.site, mu: input.mu }),
    out: input.out,
  })
}
