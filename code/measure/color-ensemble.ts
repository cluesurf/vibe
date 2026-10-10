// THE SIGMA(648) GAUGE ENSEMBLE ON R*'S OWN LATTICE (E-FRC-0297, moving-matter item 0056, decision 012 candidate b). Pure
// gauge heat-bath of a Sigma(648) colour field on the 24 D4 links of the weave's boxes (code/measure/color-slab bulkBox,
// slabBox), with a class function of each elementary fcc triangle t as the action,
//
//   S = beta sum_t f(U_t),   f = 1 - Re Tr U / 3 (Wilson, = (1 / 3)(3 - Re Tr U))  or  f = round(6 (1 - Re Tr U / 3)) / 6
//                                                                                    (the integer C* levels, the diagnostic)
//
// The triangles are (x, x + r_a, x + r_a + r_b) with r_a, r_b and r_a + r_b all roots (husk-braid triangles): 32 a dock,
// 8 through every link. A link (x, d) sits in the triangle of each root a with r_a . r_d = 1 (b = r_d - r_a is a root).
//
//   triangleLattice      the canonical links (d < OPPOSITE d), their reverse slots, the 8 staples of each link and the
//                        unique triangle list, with the count of triangles through each undirected link (8 expected)
//   ensembleGroup        Sigma(648) as a float table (wall-index sigma648, finite-gauge generateGroup) and the map of
//                        every element onto holonomy-caging's exact sigmaElements order (gridLifts floats), to 1e-12
//   triangleSweep        one heat-bath sweep: every canonical link drawn over the whole group from exp(-S_local), the
//                        reverse slot set to the inverse, the Weyl stream the only source of spread
//   trianglePlaquette    P = mean Re Tr U_t / 3 over the unique triangles, and the class histogram of U_t
//   triangleWilsonLoops  the triangle-tiled planar loops of side n: x -> x + n r_a -> x + n (r_a + r_b) -> x, area n^2
//   integratedTime       Sokal's windowed integrated autocorrelation time of a series
//   fieldOf / saveField  a configuration as colorGates' input (RoleLinks: element index into gridLifts().floats per
//                        directed slot x * 24 + d, reverse = inverse), stored as little-endian Int16
//
// DETERMINISM: no random numbers. The heat-bath draws are a Weyl stream (code/tool/weyl makeWeyl), so a run is a
// deterministic dynamics with a quasi-random schedule (weyl.ts header). FLOAT: the group table (finite-gauge keys to 1e-6),
// checked against the exact Q(zeta_9) elements to 1e-12.

import { writeFileSync, readFileSync } from 'node:fs'
import {
  finiteHeatbathSweep,
  finitePlaquette,
  generateGroup,
  makeFiniteGaugeLattice,
  type FiniteGroup,
} from '@/code/dynamics/finite-gauge'
import { actionLevels } from '@/code/dynamics/finite-kinetic'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { gridLifts } from '@/code/measure/holonomy-caging'
import type { ColorBox } from '@/code/measure/color-slab'
import type { Weyl } from '@/code/tool/weyl'

const SLOTS = 24

// ---- the group ----

export type EnsembleGroup = {
  group: FiniteGroup
  // col[s * order + g] = index of g s (one staple's column, contiguous in g)
  col: Int16Array
  // toSigma[g]: the index of group element g in gridLifts().elements (holonomy-caging's exact order)
  toSigma: Int32Array
  // the largest entry difference of a matched pair, and whether the map is a bijection that keeps inverses
  mapWorst: number
  mapBijective: boolean
  sigmaFloats: Float64Array[]
  sigmaInverse: Int32Array
}

export function ensembleGroup(): EnsembleGroup {
  const group = generateGroup({
    generators: [...SU3_SUBGROUPS.sigma648.generators],
  })
  const { order, product } = group
  const col = new Int16Array(order * order)

  for (let g = 0; g < order; g++) {
    for (let s = 0; s < order; s++) {
      col[s * order + g] = product[g * order + s]!
    }
  }

  const lifts = gridLifts()
  const floats = lifts.floats
  // bucket the exact elements by a coarse key, then match to 1e-12
  const key = (m: Float64Array): string =>
    Array.from(m, x => {
      const r = Math.round(x * 1e4)

      return r === 0 ? 0 : r
    }).join(',')
  const buckets = new Map<string, number[]>()

  floats.forEach((m, i) => {
    const k = key(m)
    const list = buckets.get(k) ?? []

    list.push(i)
    buckets.set(k, list)
  })

  const toSigma = new Int32Array(order).fill(-1)
  const used = new Uint8Array(floats.length)

  let mapWorst = 0
  let mapBijective = floats.length === order

  for (let g = 0; g < order; g++) {
    const m = group.matrices[g]!
    const candidates = buckets.get(key(m)) ?? floats.map((_, i) => i)

    let best = -1
    let bestGap = Infinity

    for (const i of candidates) {
      const f = floats[i]!

      let gap = 0

      for (let k = 0; k < 18; k++) {
        gap = Math.max(gap, Math.abs(f[k]! - m[k]!))
      }

      if (gap < bestGap) {
        bestGap = gap
        best = i
      }
    }

    toSigma[g] = best
    mapWorst = Math.max(mapWorst, bestGap)

    if (best < 0 || used[best]) {
      mapBijective = false
    } else {
      used[best] = 1
    }
  }

  for (let g = 0; g < order && mapBijective; g++) {
    mapBijective =
      lifts.inverse[toSigma[g]!] === toSigma[group.inverse[g]!]!
  }

  return {
    group,
    col,
    toSigma,
    mapWorst,
    mapBijective,
    sigmaFloats: floats,
    sigmaInverse: lifts.inverse,
  }
}

// the per-element triangle action f(g) of a form
export type ActionForm = 'wilson' | 'levels'

export function formAction(group: FiniteGroup, form: ActionForm): Float64Array {
  if (form === 'wilson') {
    return Float64Array.from(group.trace, t => 1 - t / 3)
  }

  const levels = actionLevels({ group, scale: 6 })

  return Float64Array.from(levels, l => l / 6)
}

// ---- the triangles ----

export type TriangleLattice = {
  box: ColorBox
  // canonical link slots x * 24 + d with d < OPPOSITE[d], and their reverse slots
  canon: Int32Array
  reverse: Int32Array
  // staple[l * 16 + 2 k], staple[l * 16 + 2 k + 1]: the slots (y -> z, z -> x) of link l's k-th triangle; the triangle's
  // holonomy is U(z -> x) U(y -> z) U(x -> y) and its trace is Tr(U(x -> y) S), S = U(z -> x) U(y -> z)
  staple: Int32Array
  // unique triangles: 3 slots each (x -> y, y -> z, z -> x), holonomy U3 U2 U1
  triangles: Int32Array
  // over undirected links: the least and greatest number of unique triangles through one
  perLinkMin: number
  perLinkMax: number
  // the root index of r_a + r_b, or -1
  sum: Int32Array
}

const rootIndex = new Map<string, number>(
  DOCK_ROOTS.map((r, d) => [r.join(','), d]),
)

function rootSums(): Int32Array {
  const sum = new Int32Array(SLOTS * SLOTS).fill(-1)

  for (let a = 0; a < SLOTS; a++) {
    for (let b = 0; b < SLOTS; b++) {
      const s = DOCK_ROOTS[a]!.map((x, k) => x + DOCK_ROOTS[b]![k]!)

      sum[a * SLOTS + b] = rootIndex.get(s.join(',')) ?? -1
    }
  }

  return sum
}

export function triangleLattice(box: ColorBox): TriangleLattice {
  const sum = rootSums()
  const canonDirs: number[] = []

  for (let d = 0; d < SLOTS; d++) {
    if (d < OPPOSITE[d]!) {
      canonDirs.push(d)
    }
  }

  const nCanon = box.cells * canonDirs.length
  const canon = new Int32Array(nCanon)
  const reverse = new Int32Array(nCanon)
  const staple = new Int32Array(nCanon * 16)
  // b = d - a for each (d, a) with a . d = 1
  const pairs: number[][] = Array.from({ length: SLOTS }, () => [])

  for (let d = 0; d < SLOTS; d++) {
    for (let a = 0; a < SLOTS; a++) {
      // r_b = r_d - r_a is a root exactly when r_a + r_(-d) = -r_b is one
      if (sum[a * SLOTS + OPPOSITE[d]!]! >= 0) {
        pairs[d]!.push(a)
      }
    }
  }

  let l = 0

  for (let x = 0; x < box.cells; x++) {
    for (const d of canonDirs) {
      const slot = x * SLOTS + d
      const y = box.nb[slot]!

      canon[l] = slot
      reverse[l] = y * SLOTS + OPPOSITE[d]!

      const as = pairs[d]!

      if (as.length !== 8) {
        throw new Error(`root ${d}: ${as.length} triangle roots, not 8`)
      }

      as.forEach((a, k) => {
        // r_b = r_d - r_a = -(r_a + r_(-d)), so the hop y -> z is -r_b = r_a + r_(-d)
        const negB = sum[a * SLOTS + OPPOSITE[d]!]!
        const z = box.nb[x * SLOTS + a]!

        staple[l * 16 + 2 * k] = y * SLOTS + negB
        staple[l * 16 + 2 * k + 1] = z * SLOTS + OPPOSITE[a]!

        if (box.nb[y * SLOTS + negB] !== z) {
          throw new Error('triangle does not close')
        }
      })
      l++
    }
  }

  // unique triangles by their sorted vertex set
  const seen = new Set<string>()
  const tri: number[] = []
  const perLink = new Map<number, number>()
  const undirected = (slot: number): number =>
    Math.min(slot, box.nb[slot]! * SLOTS + OPPOSITE[slot % SLOTS]!)

  for (let x = 0; x < box.cells; x++) {
    for (let a = 0; a < SLOTS; a++) {
      for (let b = 0; b < SLOTS; b++) {
        const c = sum[a * SLOTS + b]!

        if (c < 0) {
          continue
        }

        const y = box.nb[x * SLOTS + a]!
        const z = box.nb[y * SLOTS + b]!
        const k = [x, y, z].sort((p, q) => p - q).join(',')

        if (seen.has(k)) {
          continue
        }

        seen.add(k)

        const s1 = x * SLOTS + a
        const s2 = y * SLOTS + b
        const s3 = z * SLOTS + OPPOSITE[c]!

        if (box.nb[s3] !== x) {
          throw new Error('triangle does not close')
        }

        tri.push(s1, s2, s3)

        for (const s of [s1, s2, s3]) {
          const u = undirected(s)

          perLink.set(u, (perLink.get(u) ?? 0) + 1)
        }
      }
    }
  }

  let perLinkMin = Infinity
  let perLinkMax = 0

  for (const n of perLink.values()) {
    perLinkMin = Math.min(perLinkMin, n)
    perLinkMax = Math.max(perLinkMax, n)
  }

  if (perLink.size !== box.cells * 12) {
    perLinkMin = 0
  }

  return {
    box,
    canon,
    reverse,
    staple,
    triangles: Int32Array.from(tri),
    perLinkMin,
    perLinkMax,
    sum,
  }
}

// ---- the field ----

// links[slot]: the group index (ensembleGroup's float table) of the matrix carried from x to x + r_d
export type TriangleField = { links: Int16Array }

export function startField(
  lat: TriangleLattice,
  eg: EnsembleGroup,
  start: 'hot' | 'cold' | 'mixed',
  rng: Weyl,
): TriangleField {
  const { group } = eg
  const links = new Int16Array(lat.box.cells * SLOTS)
  const half = lat.box.cells / 2

  for (let l = 0; l < lat.canon.length; l++) {
    const slot = lat.canon[l]!
    const x = Math.floor(slot / SLOTS)
    const hot = start === 'hot' || (start === 'mixed' && x < half)
    const g = hot ? Math.floor(rng.next() * group.order) : group.identity

    links[slot] = g
    links[lat.reverse[l]!] = group.inverse[g]!
  }

  return { links }
}

// One heat-bath sweep of S = beta sum_t f(U_t) over every canonical link in index order.
export function triangleSweep(input: {
  lat: TriangleLattice
  eg: EnsembleGroup
  field: TriangleField
  f: Float64Array
  beta: number
  rng: Weyl
}): void {
  const { lat, eg, field, f, beta, rng } = input
  const { order, product, inverse } = eg.group
  const { col } = eg
  const links = field.links
  // the weight of one triangle, exp(-beta f(h)); f >= 0, so a product of 8 stays above exp(-8 beta max f) (no underflow
  // for beta below about 50)
  const boltz = Float64Array.from(f, v => Math.exp(-beta * v))
  const weights = new Float64Array(order)
  const nCanon = lat.canon.length
  const base = new Int32Array(8)
  const staple = lat.staple

  for (let l = 0; l < nCanon; l++) {
    for (let k = 0; k < 8; k++) {
      const u2 = links[staple[l * 16 + 2 * k]!]!
      const u3 = links[staple[l * 16 + 2 * k + 1]!]!

      base[k] = product[u3 * order + u2]! * order
    }

    const b0 = base[0]!
    const b1 = base[1]!
    const b2 = base[2]!
    const b3 = base[3]!
    const b4 = base[4]!
    const b5 = base[5]!
    const b6 = base[6]!
    const b7 = base[7]!

    let total = 0

    for (let g = 0; g < order; g++) {
      const w =
        boltz[col[b0 + g]!]! *
        boltz[col[b1 + g]!]! *
        boltz[col[b2 + g]!]! *
        boltz[col[b3 + g]!]! *
        boltz[col[b4 + g]!]! *
        boltz[col[b5 + g]!]! *
        boltz[col[b6 + g]!]! *
        boltz[col[b7 + g]!]!

      weights[g] = w
      total += w
    }

    let pick = rng.next() * total
    let chosen = 0

    while (chosen < order - 1 && pick > weights[chosen]!) {
      pick -= weights[chosen]!
      chosen++
    }

    links[lat.canon[l]!] = chosen
    links[lat.reverse[l]!] = inverse[chosen]!
  }
}

// P = mean Re Tr U_t / 3 over the unique triangles; with classOf, also the class histogram of U_t (fractions)
export function trianglePlaquette(
  lat: TriangleLattice,
  eg: EnsembleGroup,
  field: TriangleField,
  classOf?: Int32Array,
  classCount = 0,
): { P: number; histogram: number[] } {
  const { order, product, trace } = eg.group
  const links = field.links
  const t = lat.triangles
  const n = t.length / 3
  const histogram = new Array<number>(classCount).fill(0)

  let sum = 0

  for (let i = 0; i < n; i++) {
    const u1 = links[t[3 * i]!]!
    const u2 = links[t[3 * i + 1]!]!
    const u3 = links[t[3 * i + 2]!]!
    const h = product[product[u3 * order + u2]! * order + u1]!

    sum += trace[h]!

    if (classOf) {
      histogram[classOf[h]!]! += 1
    }
  }

  return { P: sum / (3 * n), histogram: histogram.map(c => c / n) }
}

// Triangle-tiled planar loops: for every dock x and ordered root pair (a, b) with r_a + r_b = r_c a root, the loop of n
// steps along a, n along b and n along -c, which encloses n^2 elementary triangles. W[n] = mean Re Tr / 3, n = 1..max.
export function triangleWilsonLoops(
  lat: TriangleLattice,
  eg: EnsembleGroup,
  field: TriangleField,
  max: number,
): number[] {
  const { order, product, trace, identity } = eg.group
  const { box, sum } = lat
  const links = field.links
  const out: number[] = [1]

  for (let n = 1; n <= max; n++) {
    let total = 0
    let count = 0

    for (let x = 0; x < box.cells; x++) {
      for (let a = 0; a < SLOTS; a++) {
        for (let b = 0; b < SLOTS; b++) {
          const c = sum[a * SLOTS + b]!

          if (c < 0) {
            continue
          }

          let h = identity
          let at = x

          for (const dir of [a, b, OPPOSITE[c]!]) {
            for (let s = 0; s < n; s++) {
              // carried along the path: H <- U(at -> next) H
              h = product[links[at * SLOTS + dir]! * order + h]!
              at = box.nb[at * SLOTS + dir]!
            }
          }

          if (at !== x) {
            throw new Error('Wilson loop does not close')
          }

          total += trace[h]! / 3
          count++
        }
      }
    }

    out.push(total / count)
  }

  return out
}

// Sokal's windowed integrated autocorrelation time, tau = 1/2 + sum_{t=1}^{W} rho(t), W the least t with t >= 6 tau(t)
export function integratedTime(series: readonly number[]): number {
  const n = series.length
  const mean = series.reduce((a, b) => a + b, 0) / n
  const c0 = series.reduce((a, b) => a + (b - mean) ** 2, 0) / n

  if (c0 <= 0) {
    return 0.5
  }

  let tau = 0.5

  for (let t = 1; t < n / 2; t++) {
    let c = 0

    for (let i = 0; i + t < n; i++) {
      c += (series[i]! - mean) * (series[i + t]! - mean)
    }

    tau += c / (n - t) / c0

    if (t >= 6 * tau) {
      break
    }
  }

  return Math.max(0.5, tau)
}

// ---- storage: colorGates' input ----

// the field as a role field: element index into gridLifts().floats per directed slot (RoleLinks of holonomy-caging)
export function fieldOf(
  eg: EnsembleGroup,
  field: TriangleField,
): { k: 3; mats: Float64Array[]; link: Int32Array } {
  return {
    k: 3,
    mats: eg.sigmaFloats,
    link: Int32Array.from(field.links, g => eg.toSigma[g]!),
  }
}

// little-endian Int16, one sigma index per slot x * 24 + d; refuses to overwrite
export function saveField(
  path: string,
  eg: EnsembleGroup,
  field: TriangleField,
): void {
  const link = fieldOf(eg, field).link
  const out = new Int16Array(link.length)

  out.set(link)
  writeFileSync(path, Buffer.from(out.buffer), { flag: 'wx' })
}

export function loadField(
  path: string,
  floats: Float64Array[],
): { k: 3; mats: Float64Array[]; link: Int32Array } {
  const buf = readFileSync(path)
  const raw = new Int16Array(buf.buffer, buf.byteOffset, buf.byteLength / 2)

  return { k: 3, mats: floats, link: Int32Array.from(raw) }
}

// ---- engines: one interface over R*'s triangles and the hypercubic control ----

export type EnsembleEngine = {
  name: string
  // a fresh start (the stream continues)
  start(kind: 'hot' | 'cold' | 'mixed'): void
  sweep(beta: number): void
  plaquette(): number
}

export function triangleEngine(input: {
  name: string
  lat: TriangleLattice
  eg: EnsembleGroup
  form: ActionForm
  rng: Weyl
}): EnsembleEngine & { field(): TriangleField } {
  const { lat, eg, rng } = input
  const f = formAction(eg.group, input.form)

  let field = startField(lat, eg, 'cold', rng)

  return {
    name: input.name,
    start(kind) {
      field = startField(lat, eg, kind, rng)
    },
    sweep(beta) {
      triangleSweep({ lat, eg, field, f, beta, rng })
    },
    plaquette: () => trianglePlaquette(lat, eg, field).P,
    field: () => field,
  }
}

// the control: finite-gauge's hypercubic lattice and heat-bath, unchanged (S = beta sum_p (1 - Re Tr U_p / 3))
export function hypercubicEngine(input: {
  name: string
  group: FiniteGroup
  lengths: readonly number[]
  rng: Weyl
}): EnsembleEngine {
  const { group, lengths, rng } = input

  let lattice = makeFiniteGaugeLattice({ group, lengths, start: 'cold', rng })

  return {
    name: input.name,
    start(kind) {
      lattice = makeFiniteGaugeLattice({ group, lengths, start: kind, rng })
    },
    sweep(beta) {
      finiteHeatbathSweep({ lattice, beta, rng })
    },
    plaquette: () => finitePlaquette({ lattice }),
  }
}

// ---- one beta from one start ----

export type BetaRun = {
  beta: number
  start: 'hot' | 'cold'
  therm: number
  sweeps: number
  P: number
  // the error of the mean, sigma sqrt(2 tau / N)
  Perr: number
  tau: number
  // P over the first and the last tenth of the measured sweeps (drift witness)
  Pfirst: number
  Plast: number
  ms: number
}

const mean = (xs: readonly number[]): number =>
  xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)

// therm sweeps, then `sweeps` measured ones; onStore(i) is called after measured sweep i (1-based) when i is in `stores`
export function runBeta(input: {
  engine: EnsembleEngine
  beta: number
  start: 'hot' | 'cold'
  therm: number
  sweeps: number
  stores?: readonly number[]
  onStore?: (i: number) => void
}): BetaRun {
  const { engine, beta, start, therm, sweeps } = input
  const t0 = Date.now()

  engine.start(start)

  for (let i = 0; i < therm; i++) {
    engine.sweep(beta)
  }

  const series: number[] = []

  for (let i = 1; i <= sweeps; i++) {
    engine.sweep(beta)
    series.push(engine.plaquette())

    if (input.stores?.includes(i)) {
      input.onStore?.(i)
    }
  }

  const P = mean(series)
  const tau = integratedTime(series)
  const variance =
    series.reduce((a, b) => a + (b - P) ** 2, 0) / Math.max(1, series.length - 1)
  const tenth = Math.max(1, Math.floor(sweeps / 10))

  return {
    beta,
    start,
    therm,
    sweeps,
    P,
    Perr: Math.sqrt((variance * 2 * tau) / series.length),
    tau,
    Pfirst: mean(series.slice(0, tenth)),
    Plast: mean(series.slice(-tenth)),
    ms: Date.now() - t0,
  }
}

// ---- the first-order point by the free-energy crossing ----
//
// With the normalized measure (each link averaged over G), d ln Z / d beta = -<S> = -N_t (1 - P), so per triangle
//   hot branch:   ln Z_hot(beta) / N_t  = -int_0^beta (1 - P_hot)                        (Z(0) = 1)
//   cold branch:  ln Z_cold(beta) / N_t = (V - N_l) / N_t ln |G| + int_beta^inf (1 - P_cold)
// the cold end counting the flat fields, |G|^V gauge copies of the identity (the centre and the torus holonomy sectors add
// O(1), not O(V)). beta_f is where the two meet. The cold integral past the last grid beta is the exponential tail fitted
// to the last two cold points. A point belongs to a branch while its P stays on that branch's side of `split`.

export type CrossingRead = {
  betaF: number
  // D = ln Z_hot - ln Z_cold per triangle at each beta both branches cover, and its slope at the crossing
  table: { beta: number; D: number }[]
  slope: number
  found: boolean
}

function trapezoid(points: readonly { beta: number; y: number }[], from: number, to: number): number {
  let sum = 0

  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i]!
    const b = points[i + 1]!
    const lo = Math.max(a.beta, from)
    const hi = Math.min(b.beta, to)

    if (hi <= lo) {
      continue
    }

    const at = (x: number): number => a.y + ((b.y - a.y) * (x - a.beta)) / (b.beta - a.beta)

    sum += ((at(lo) + at(hi)) / 2) * (hi - lo)
  }

  return sum
}

export function freeEnergyCrossing(input: {
  hot: readonly { beta: number; P: number }[]
  cold: readonly { beta: number; P: number }[]
  // (V - N_l) / N_t ln |G|
  floor: number
  split: number
}): CrossingRead {
  const hot = input.hot
    .filter(p => p.P < input.split)
    .map(p => ({ beta: p.beta, y: 1 - p.P }))
    .sort((a, b) => a.beta - b.beta)
  const cold = input.cold
    .filter(p => p.P > input.split)
    .map(p => ({ beta: p.beta, y: 1 - p.P }))
    .sort((a, b) => a.beta - b.beta)

  if (hot.length < 2 || cold.length < 2 || hot[0]!.beta !== 0) {
    return { betaF: NaN, table: [], slope: NaN, found: false }
  }

  const last = cold[cold.length - 1]!
  // the tail past the last grid beta: an exponential through the last two cold points with 1 - P above 0 (none when the
  // last point reads 1 exactly, its fluctuations below double precision)
  const live = cold.filter(p => p.y > 0)
  const a = live[live.length - 2]
  const b = live[live.length - 1]
  const k = a && b && b === last ? Math.log(a.y / b.y) / (b.beta - a.beta) : Infinity
  const tail = Number.isFinite(k) && k > 0 ? last.y / k : 0
  const hotMax = hot[hot.length - 1]!.beta
  const coldMin = cold[0]!.beta
  const betas = [...new Set([...hot, ...cold].map(p => p.beta))]
    .filter(b => b >= coldMin && b <= hotMax)
    .sort((a, b) => a - b)
  const table = betas.map(beta => ({
    beta,
    D:
      -trapezoid(hot, 0, beta) -
      (input.floor + trapezoid(cold, beta, last.beta) + tail),
  }))

  for (let i = 0; i + 1 < table.length; i++) {
    const a = table[i]!
    const b = table[i + 1]!

    if (a.D > 0 && b.D <= 0) {
      const slope = (b.D - a.D) / (b.beta - a.beta)

      return { betaF: a.beta - a.D / slope, table, slope, found: true }
    }
  }

  return { betaF: NaN, table, slope: NaN, found: false }
}

// ---- the first-order point by mixed starts ----

export type MixedStep = {
  beta: number
  Phot: number
  Pcold: number
  // P of the mixed start over its last tenth, and its place between the branches (0 hot, 1 cold)
  Pmixed: number
  fraction: number
  // the same over its first tenth
  fractionStart: number
  grows: 'hot' | 'cold' | 'neither'
  ms: number
}

export type MixedRead = {
  steps: MixedStep[]
  lo: number
  hi: number
  betaF: number
  // the bracket ends read as they must (hot wins at lo, cold at hi)
  bracketHeld: boolean
}

// One beta: hot and cold references (refTherm + refSweeps each), then a mixed start for mixedSweeps. The fraction
// (P - Phot) / (Pcold - Phot) over the last tenth says which phase grew; when the references meet (one phase), the phase is
// the one whose P they share, read against `split` (a P between the branches).
export function mixedStep(input: {
  engine: EnsembleEngine
  beta: number
  refTherm: number
  refSweeps: number
  mixedSweeps: number
  split: number
}): MixedStep {
  const { engine, beta } = input
  const t0 = Date.now()
  const hot = runBeta({ engine, beta, start: 'hot', therm: input.refTherm, sweeps: input.refSweeps })
  const cold = runBeta({ engine, beta, start: 'cold', therm: input.refTherm, sweeps: input.refSweeps })

  engine.start('mixed')

  const series: number[] = []

  for (let i = 0; i < input.mixedSweeps; i++) {
    engine.sweep(beta)
    series.push(engine.plaquette())
  }

  const tenth = Math.max(1, Math.floor(input.mixedSweeps / 10))
  const Pmixed = mean(series.slice(-tenth))
  const Pstart = mean(series.slice(0, tenth))
  const gap = cold.P - hot.P
  const onePhase = Math.abs(gap) < 0.05
  const place = (p: number): number =>
    onePhase ? (p > input.split ? 1 : 0) : (p - hot.P) / gap
  const fraction = place(Pmixed)
  const grows: MixedStep['grows'] =
    fraction > 0.75 ? 'cold' : fraction < 0.25 ? 'hot' : 'neither'

  return {
    beta,
    Phot: hot.P,
    Pcold: cold.P,
    Pmixed,
    fraction,
    fractionStart: place(Pstart),
    grows,
    ms: Date.now() - t0,
  }
}

// Bisection on [lo, hi] until hi - lo <= resolution; the direction at a 'neither' step is fraction > 1/2 (the side that
// still gained). The ends are read first, and a bracket whose ends do not read hot at lo and cold at hi stops there.
export function mixedBisection(input: {
  engine: EnsembleEngine
  lo: number
  hi: number
  resolution: number
  refTherm: number
  refSweeps: number
  mixedSweeps: number
  split: number
  log?: (s: MixedStep) => void
}): MixedRead {
  const step = (beta: number): MixedStep => {
    const s = mixedStep({ ...input, beta })

    input.log?.(s)

    return s
  }
  const atLo = step(input.lo)
  const atHi = step(input.hi)
  const steps: MixedStep[] = [atLo, atHi]
  const bracketHeld = atLo.fraction < 0.5 && atHi.fraction > 0.5

  let lo = input.lo
  let hi = input.hi

  while (bracketHeld && hi - lo > input.resolution + 1e-9) {
    const mid = Math.round(((lo + hi) / 2) * 1e4) / 1e4
    const s = step(mid)

    steps.push(s)

    if (s.fraction > 0.5) {
      hi = mid
    } else {
      lo = mid
    }
  }

  return { steps, lo, hi, betaF: (lo + hi) / 2, bracketHeld }
}
