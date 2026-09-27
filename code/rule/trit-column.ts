// Light held as column sums of trits (E-FRC-0207 to E-FRC-0209): every integer the U(1) link sector carries
// is the sum of a column of trits down the 4D depth, so the depth is the register and no integer is stored.
//
// The bulk. The D4 lattice {x in Z^4 : sum x even} with period L (even) on x1, x2, x3 and 2D on the depth x4,
// so every husk dock (x1, x2, x3) has a column of D bulk docks (x4 of one parity), as in code/measure/
// photon-husk, but with the depth period D chosen apart from the husk side L. Each bulk dock has 12 links
// (the first roots, each casting a husk direction with orientation +1: e_i + e4 and e_i - e4 cast the axis
// e_i, and the six e_i + e_j or e_i - e_j with no depth part cast the face diagonals) and 32 triangles
// (three roots summing to zero). A husk link has m = 2D bulk links over it on an axis and m = D on a
// diagonal. A bulk triangle casts a husk triangle, one of its links over each of the husk triangle's three
// links, and every husk triangle P has n_P D bulk triangles over it, n_P per column dock.
//
// What each bulk object holds, all trits:
//   a bulk dock   its vibe (the charge)
//   a bulk link   a: an angle trit, and s: a string trit (the flux its vibes dragged, static here)
//   a triangle    u: a potential trit, and up to three counter trits (on one triangle per column dock only)
// No link holds a flux. The flux on a bulk link is a relation, s - (C^T u), the string minus the curl of its
// triangles' potentials, so Gauss's law in the bulk holds by construction: the curl has no divergence.
//
// What the husk reads, all column sums:
//   the flux    E_l = S_l - sum over P of C(P, l) U_P, S the column sum of s, U_P the column sum of u
//   the angle   A_l the column sum of a, a cycling number: the axis column (2D trits) mod 4D, the diagonal
//               column (D trits) mod 2D, so the plaquette field B_P = sum C(P, l) w_l A_l (w = 1 on an axis,
//               2 on a diagonal) is well defined mod N_B = 4D
//   a counter   the column sum of D counter trits, a cycling number in -D .. D, mod q = 2D + 1: the
//               column's own range, so a counter is its column's value
//
// The beat, the leapfrog of code/rule/photon-links read on the husk:
//   1. drift: A_l <- A_l + E_l in its window
//   2. kick:  each husk triangle's counters take the drive n_P p B_P and each wrap pays one unit of force F_P
//             into U_P (U_P <- U_P + F_P). First form (E-FRC-0181): X = n_P p B_P + R_P, F_P the multiple of
//             q nearest X, R_P <- X - q F_P. Wave form (E-FRC-0185): the carried fraction fed back through
//             the leapfrog operator, its spatial term paid by a second counter (see `force` below)
// so the coupling is kappa = 2p / q per bulk triangle, and with p = 1 it is 2 / (2D + 1). THE COUPLING IS THE
// INVERSE DEPTH. Linearized, the husk beat is E'' = -kappa M_h A with M_h = C^T N C G^(-1), exactly
// E-FRC-0179's husk symbol P M P^T G^(-1).
//
// How a kick is paid down a column. Each column is kept in the thermometer code: a value v is |v| trits of
// sign v at the top of the column (depth order) and zeros below. Adding f moves the front by f: exactly |f|
// trits change, all at the front, and the rest of the column is untouched. A value that leaves its window
// wraps: the angle and the counter are cycling numbers by design (the angle's wrap is compact U(1), the
// counter's wrap is the force), and a potential column that fills wraps too, reversibly, and is counted
// (a cap would merge two states into one and break the bijection). A wrap rewrites the whole column.
//
// What the rule reads. The drift reads the column sum of the bulk flux and the kick reads the column sums of
// the bulk triangles' angle sums, both additive, and then takes ONE non-additive step per plaquette: the
// counter's floor. A floor of a column sum is not a sum of floors, so this step reads the whole column: the
// rule's reach down the depth is D. It is local on the husk (a plaquette reads its own three link columns
// and its own counter), and global along the depth. E-FRC-0207 proves no depth-local rule can do better.
//
// Reversible: the drift is a shear, the kick a translation of (U, R) given B, undone by F = ceil((n p B -
// R') / q). The rule is a bijection of the thermometer states, which are in one to one correspondence with
// the husk integer states in their windows. Only integers here: no float, no trig, no rounding. The one
// division is exact (a multiple of q divided by q).

import { rootsD4 } from '@/code/algebra/group/root-system'

// the husk's 9 directions, as code/measure/photon-husk has them
export const TRIT_HUSK_VECTORS: readonly (readonly number[])[] = [
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

const mod = (x: number, m: number): number => ((x % m) + m) % m

// floor(x / q) for integers, q > 0, with no rounding: x - (x mod q) is a multiple of q
export function floorDiv(x: number, q: number): number {
  return (x - mod(x, q)) / q
}

export type TritBulk = {
  readonly side: number
  readonly depth: number
  readonly docks: number
  readonly huskDocks: number
  // 12 first roots: the root, and the husk direction it casts
  readonly roots: readonly (readonly number[])[]
  readonly firstHusk: Int32Array
  readonly neighbour: Int32Array // docks * 24, by root index of rootsD4()
  readonly links: number // docks * 12
  readonly triangles: number
  // each triangle's 3 bulk links and their orientations
  readonly triLinks: Int32Array
  readonly triSigns: Int8Array
  // the husk: 9 links per husk dock
  readonly huskLinks: number
  readonly huskNeighbour: Int32Array // huskDocks * 9: the far end of husk link (y, h)
  readonly weight: Int32Array // per husk direction: w = 2 / g, 1 on an axis, 2 on a diagonal
  // husk triangles: 3 husk links, orientations, n_P
  readonly huskTriangles: number
  readonly huskTriLinks: Int32Array
  readonly huskTriSigns: Int8Array
  readonly multiplicity: Int32Array // n_P, bulk triangles over P per column dock
  // the column of each husk link: its bulk links in depth order (offsets into linkColumn)
  readonly linkColumnStart: Int32Array
  readonly linkColumn: Int32Array
  // the column of each husk triangle: its bulk triangles in depth order, and their orientation relative to P
  readonly triColumnStart: Int32Array
  readonly triColumn: Int32Array
  readonly triColumnSign: Int8Array
  // the counter column of each husk triangle: one bulk triangle per column dock (D entries each)
  readonly counterColumn: Int32Array
  readonly counterColumnSign: Int8Array
  // each bulk dock's husk dock and depth
  readonly column: Int32Array
  readonly level: Int32Array
}

// the bulk dock of (a, b, c, x4) with x4 of the parity of a + b + c
function dockIndex(side: number, depth: number, a: number, b: number, c: number, x4: number): number {
  const y = mod(a, side) + side * mod(b, side) + side * side * mod(c, side)
  const m = mod(x4, 2 * depth)

  return y * depth + Math.floor(m / 2)
}

export function buildTritBulk(input: { side: number; depth: number }): TritBulk {
  const { side, depth } = input

  if (side % 2 !== 0) {
    throw new Error('the husk side must be even so the depth parity is well defined')
  }

  const roots = rootsD4()
  const index = (v: readonly number[]): number => roots.findIndex(r => r.every((x, k) => x === (v[k] ?? 0)))
  const opposite = roots.map(r => index(r.map(x => -x)))
  const huskDocks = side ** 3
  const docks = huskDocks * depth
  const coords = new Int32Array(docks * 4)
  const column = new Int32Array(docks)
  const level = new Int32Array(docks)

  for (let y = 0; y < huskDocks; y++) {
    const a = y % side
    const b = Math.floor(y / side) % side
    const c = Math.floor(y / (side * side))

    for (let m = 0; m < depth; m++) {
      const x = y * depth + m

      coords[x * 4] = a
      coords[x * 4 + 1] = b
      coords[x * 4 + 2] = c
      coords[x * 4 + 3] = 2 * m + ((a + b + c) % 2)
      column[x] = y
      level[x] = m
    }
  }

  const neighbour = new Int32Array(docks * 24)

  for (let x = 0; x < docks; x++) {
    for (let d = 0; d < 24; d++) {
      const r = roots[d] ?? []

      neighbour[x * 24 + d] = dockIndex(
        side,
        depth,
        (coords[x * 4] ?? 0) + (r[0] ?? 0),
        (coords[x * 4 + 1] ?? 0) + (r[1] ?? 0),
        (coords[x * 4 + 2] ?? 0) + (r[2] ?? 0),
        (coords[x * 4 + 3] ?? 0) + (r[3] ?? 0),
      )
    }
  }

  // the 12 first roots: each casts +TRIT_HUSK_VECTORS[h]
  const firstRoot: number[] = []
  const firstHuskList: number[] = []

  for (let h = 0; h < 9; h++) {
    const u = TRIT_HUSK_VECTORS[h] ?? []
    const depths = h < 3 ? [1, -1] : [0]

    for (const z of depths) {
      firstRoot.push(index([u[0] ?? 0, u[1] ?? 0, u[2] ?? 0, z]))
      firstHuskList.push(h)
    }
  }

  const firstOf = new Int32Array(24).fill(-1)

  firstRoot.forEach((d, k) => (firstOf[d] = k))

  // the link and orientation of the step from x along root d
  const step = (x: number, d: number): [number, number] => {
    const k = firstOf[d] ?? -1

    if (k >= 0) {
      return [x * 12 + k, 1]
    }

    return [(neighbour[x * 24 + d] ?? 0) * 12 + (firstOf[opposite[d] ?? 0] ?? 0), -1]
  }

  // triangles: roots (a, b, c), a + b + c = 0, kept from the representation whose first root index is the
  // smallest of a, b, c and their opposites
  const triLinks: number[] = []
  const triSigns: number[] = []
  const triStart: number[] = []

  for (let x = 0; x < docks; x++) {
    for (let a = 0; a < 24; a++) {
      for (let b = 0; b < 24; b++) {
        const c = index((roots[a] ?? []).map((v, k) => -v - ((roots[b] ?? [])[k] ?? 0)))

        if (c < 0 || a >= Math.min(b, c, opposite[a] ?? 0, opposite[b] ?? 0, opposite[c] ?? 0)) {
          continue
        }

        const y = neighbour[x * 24 + a] ?? 0
        const z = neighbour[y * 24 + b] ?? 0

        for (const [from, d] of [
          [x, a],
          [y, b],
          [z, c],
        ] as const) {
          const [l, s] = step(from, d)

          triLinks.push(l)
          triSigns.push(s)
        }

        triStart.push(x)
      }
    }
  }

  const triangles = triStart.length
  const firstHusk = Int32Array.from(firstHuskList)
  const huskOf = (l: number): number => (column[Math.floor(l / 12)] ?? 0) * 9 + (firstHusk[l % 12] ?? 0)
  const huskLinks = huskDocks * 9
  const huskNeighbour = new Int32Array(huskLinks)

  for (let y = 0; y < huskDocks; y++) {
    const a = y % side
    const b = Math.floor(y / side) % side
    const c = Math.floor(y / (side * side))

    for (let h = 0; h < 9; h++) {
      const u = TRIT_HUSK_VECTORS[h] ?? []

      huskNeighbour[y * 9 + h] = mod(a + (u[0] ?? 0), side) + side * mod(b + (u[1] ?? 0), side) + side * side * mod(c + (u[2] ?? 0), side)
    }
  }

  // husk triangles: the sorted husk links of each bulk triangle, oriented so the smallest link has sign +1
  const key = new Map<string, number>()
  const huskTriLinks: number[] = []
  const huskTriSigns: number[] = []
  const triHusk = new Int32Array(triangles)
  const triHuskSign = new Int8Array(triangles)

  for (let t = 0; t < triangles; t++) {
    const entries = [0, 1, 2]
      .map(j => [huskOf(triLinks[t * 3 + j] ?? 0), triSigns[t * 3 + j] ?? 0] as const)
      .sort((p, q) => p[0] - q[0])

    if (entries[0]![0] === entries[1]![0] || entries[1]![0] === entries[2]![0]) {
      throw new Error(`bulk triangle ${t} casts a husk link twice`)
    }

    const orient = entries[0]![1]
    const k = entries.map(([l, s]) => `${l}:${s * orient}`).join(',')

    let p = key.get(k)

    if (p === undefined) {
      p = huskTriSigns.length / 3
      key.set(k, p)

      for (const [l, s] of entries) {
        huskTriLinks.push(l)
        huskTriSigns.push(s * orient)
      }
    }

    triHusk[t] = p
    triHuskSign[t] = orient
  }

  const huskTriangles = huskTriSigns.length / 3
  const counts = new Int32Array(huskTriangles)

  for (let t = 0; t < triangles; t++) {
    counts[triHusk[t] ?? 0] = (counts[triHusk[t] ?? 0] ?? 0) + 1
  }

  const multiplicity = Int32Array.from(counts, c => c / depth)

  if (Array.from(counts).some(c => c % depth !== 0)) {
    throw new Error('a husk triangle has a bulk column that is not a whole number per column dock')
  }

  // columns, depth order: bulk links by (level, direction); bulk triangles by (level of start, index)
  const linkColumnStart = new Int32Array(huskLinks + 1)
  const linkCount = new Int32Array(huskLinks)

  for (let l = 0; l < docks * 12; l++) {
    linkCount[huskOf(l)] = (linkCount[huskOf(l)] ?? 0) + 1
  }

  for (let i = 0; i < huskLinks; i++) {
    linkColumnStart[i + 1] = (linkColumnStart[i] ?? 0) + (linkCount[i] ?? 0)
  }

  const linkColumn = new Int32Array(docks * 12)
  const linkFill = Int32Array.from(linkColumnStart)

  // docks are ordered column-major (y * depth + level), so a plain scan is in depth order
  for (let l = 0; l < docks * 12; l++) {
    const i = huskOf(l)

    linkColumn[linkFill[i] ?? 0] = l
    linkFill[i] = (linkFill[i] ?? 0) + 1
  }

  const triColumnStart = new Int32Array(huskTriangles + 1)

  for (let p = 0; p < huskTriangles; p++) {
    triColumnStart[p + 1] = (triColumnStart[p] ?? 0) + (counts[p] ?? 0)
  }

  const order = Array.from({ length: triangles }, (_, t) => t).sort((s, t) => (level[triStart[s] ?? 0] ?? 0) - (level[triStart[t] ?? 0] ?? 0) || s - t)
  const triColumn = new Int32Array(triangles)
  const triColumnSign = new Int8Array(triangles)
  const triFill = Int32Array.from(triColumnStart)
  const counterColumn = new Int32Array(huskTriangles * depth)
  const counterColumnSign = new Int8Array(huskTriangles * depth)
  const counterFill = new Int32Array(huskTriangles)
  const lastLevel = new Int32Array(huskTriangles).fill(-1)

  for (const t of order) {
    const p = triHusk[t] ?? 0
    const at = triFill[p] ?? 0

    triColumn[at] = t
    triColumnSign[at] = triHuskSign[t] ?? 1
    triFill[p] = at + 1

    const lv = level[triStart[t] ?? 0] ?? 0

    if (lastLevel[p] !== lv) {
      lastLevel[p] = lv

      const c = counterFill[p] ?? 0

      counterColumn[p * depth + c] = t
      counterColumnSign[p * depth + c] = triHuskSign[t] ?? 1
      counterFill[p] = c + 1
    }
  }

  if (Array.from(counterFill).some(c => c !== depth)) {
    throw new Error('a counter column does not have one triangle per column dock')
  }

  return {
    side,
    depth,
    docks,
    huskDocks,
    roots: firstRoot.map(d => roots[d] ?? []),
    firstHusk,
    neighbour,
    links: docks * 12,
    triangles,
    triLinks: Int32Array.from(triLinks),
    triSigns: Int8Array.from(triSigns),
    huskLinks,
    huskNeighbour,
    weight: Int32Array.from({ length: 9 }, (_, h) => (h < 3 ? 1 : 2)),
    huskTriangles,
    huskTriLinks: Int32Array.from(huskTriLinks),
    huskTriSigns: Int8Array.from(huskTriSigns),
    multiplicity,
    linkColumnStart,
    linkColumn,
    triColumnStart,
    triColumn,
    triColumnSign,
    counterColumn,
    counterColumnSign,
    column,
    level,
  }
}

// ---------------------------------------------------------------------------------------------------------
// The column code

// the value of a column: the signed sum of its trits
export function columnValue(trits: Int8Array, entries: Int32Array, signs: Int8Array | undefined, start: number, length: number): number {
  let v = 0

  for (let i = 0; i < length; i++) {
    v += (signs ? (signs[start + i] ?? 1) : 1) * (trits[entries[start + i] ?? 0] ?? 0)
  }

  return v
}

// write the thermometer code of v into a column; returns the number of trits changed (each counted by the
// size of its change, 1 or 2) and the deepest position changed plus one (the reach)
export function writeColumn(trits: Int8Array, entries: Int32Array, signs: Int8Array | undefined, start: number, length: number, v: number): { flips: number; reach: number } {
  let flips = 0
  let reach = 0
  const s = v > 0 ? 1 : v < 0 ? -1 : 0
  const n = Math.abs(v)

  if (n > length) {
    throw new Error(`value ${v} does not fit a column of ${length}`)
  }

  for (let i = 0; i < length; i++) {
    const o = signs ? (signs[start + i] ?? 1) : 1
    const want = i < n ? s * o : 0
    const at = entries[start + i] ?? 0
    const had = trits[at] ?? 0

    if (had !== want) {
      flips += Math.abs(want - had)
      reach = i + 1
      trits[at] = want
    }
  }

  return { flips, reach }
}

// ---------------------------------------------------------------------------------------------------------
// The husk integer rule: the reference the trit rule must equal, on plain integers
//
// Two forms of the force, both linear in B with the coupling carried by counters mod q, never rounded:
//   first  (E-FRC-0181) X = n p B + R, F = floor(X / q), R <- X - q F. Its carried error is white in time
//          and heats: at the small fields a D-deep column allows, the noise is as large as the wave
//   wave   (E-FRC-0185) the error fed back through the leapfrog's own operator: with d = D / q the carried
//          fraction, F = n p B / q + d_(t+1) - 2 d_t + d_(t-1) + (kappa / 2) N C W C^T d_t, the spatial term
//          carried by a second counter mod q (V = floor((S + R2) / q), S = n p (C W C^T D_t)_P) instead of
//          rounded. Then the shadow A~ = A + C^T d_(t-1) runs the linear leapfrog, driven only by the second
//          counter's first-order carry (bounded by 1 / q)
// Each counter is a cycling number mod q, held as a column of D trits.

export type TritForm = 'first' | 'wave'

export type TritLight = {
  readonly bulk: TritBulk
  readonly form: TritForm
  // the coupling numerator; kappa = 2 p / q per bulk triangle
  readonly p: number
  // the counter modulus q = 2 D + 1
  readonly q: number
  // the plaquette field modulus N_B = 4 D, and each husk direction's angle window size
  readonly nb: number
  readonly window: Int32Array
  // the potential window: |U_P| <= n_P D, cycling mod 2 n_P D + 1
  readonly potentialWindow: Int32Array
}

export function makeTritLight(input: { side: number; depth: number; p?: number; form?: TritForm }): TritLight {
  const bulk = buildTritBulk(input)
  const d = input.depth

  return {
    bulk,
    form: input.form ?? 'wave',
    p: input.p ?? 1,
    q: 2 * d + 1,
    nb: 4 * d,
    window: Int32Array.from({ length: 9 }, (_, h) => (h < 3 ? 4 * d : 2 * d)),
    potentialWindow: Int32Array.from(bulk.multiplicity, n => n * d),
  }
}

// the husk state: angles A (per husk link), potentials U (per husk triangle), three counters per husk
// triangle (first form: counter is R; wave form: counter is D_t, lag is D_(t-1), spatial is R2), all in
// 0 .. q - 1, and the strings S (per husk link, static)
export type HuskLightState = {
  readonly angle: Int32Array
  readonly potential: Int32Array
  readonly counter: Int32Array
  readonly lag: Int32Array
  readonly spatial: Int32Array
  readonly string: Int32Array
}

export type Tally = { wraps: number; potentialWraps: number; flips: number; reach: number }

export const emptyTally = (): Tally => ({ wraps: 0, potentialWraps: 0, flips: 0, reach: 0 })

// A in its window: the axis in -2D .. 2D - 1, the diagonal in -D .. D - 1
function wrapAngle(light: TritLight, h: number, v: number): number {
  const n = light.window[h] ?? 1

  return mod(v + n / 2, n) - n / 2
}

function wrapPotential(light: TritLight, p: number, v: number): number {
  const w = light.potentialWindow[p] ?? 0

  return mod(v + w, 2 * w + 1) - w
}

// B mod N_B, centered in -N_B/2 .. N_B/2 - 1 (the seam at -N_B/2)
export function centeredField(light: TritLight, b: number): number {
  return mod(b + light.nb / 2, light.nb) - light.nb / 2
}

// sum over P of C(P, l) x_P on every husk link: the husk curl's transpose
export function huskCurlT(light: TritLight, x: ArrayLike<number>): Int32Array {
  const { bulk } = light
  const out = new Int32Array(bulk.huskLinks)

  for (let p = 0; p < bulk.huskTriangles; p++) {
    const v = x[p] ?? 0

    if (v === 0) continue

    for (let j = 0; j < 3; j++) {
      const l = bulk.huskTriLinks[p * 3 + j] ?? 0

      out[l] = (out[l] ?? 0) + (bulk.huskTriSigns[p * 3 + j] ?? 0) * v
    }
  }

  return out
}

// the husk flux of every husk link from the husk integers: S - C^T U
export function huskFlux(light: TritLight, state: HuskLightState): Int32Array {
  const curl = huskCurlT(light, state.potential)

  return Int32Array.from(state.string, (s, l) => s - (curl[l] ?? 0))
}

// the raw plaquette sum C W x (not centered)
export function huskCurlWeighted(light: TritLight, x: ArrayLike<number>, p: number): number {
  const { bulk } = light

  let b = 0

  for (let j = 0; j < 3; j++) {
    const l = bulk.huskTriLinks[p * 3 + j] ?? 0

    b += (bulk.huskTriSigns[p * 3 + j] ?? 0) * (bulk.weight[l % 9] ?? 0) * (x[l] ?? 0)
  }

  return b
}

export function huskField(light: TritLight, angle: ArrayLike<number>, p: number): number {
  return centeredField(light, huskCurlWeighted(light, angle, p))
}

type Counters = { counter: Int32Array; lag: Int32Array; spatial: Int32Array }

// The force of every husk triangle from its field b (centered) and its counters, updating the counters in
// place: the one non-additive step. Every counter is centered, in -D .. D, which is exactly the range of a
// column of D trits, so a counter IS its column's value. The multiple of q in the window [x - D, x + D] is
// unique because the window holds q = 2D + 1 integers.
function force(light: TritLight, b: Int32Array, c: Counters): Int32Array {
  const { bulk, p: pp, q } = light
  const h = bulk.depth
  const f = new Int32Array(bulk.huskTriangles)

  if (light.form === 'first') {
    for (let p = 0; p < bulk.huskTriangles; p++) {
      const x = (bulk.multiplicity[p] ?? 0) * pp * (b[p] ?? 0) + (c.counter[p] ?? 0)
      const k = floorDiv(x + h, q)

      c.counter[p] = x - q * k
      f[p] = k
    }

    return f
  }

  // the spatial term from D_t, read before any counter changes
  const t = huskCurlT(light, c.counter)

  for (let p = 0; p < bulk.huskTriangles; p++) {
    const n = bulk.multiplicity[p] ?? 0
    const s = n * pp * huskCurlWeighted(light, t, p)
    const v = floorDiv(s + (c.spatial[p] ?? 0) + h, q)

    c.spatial[p] = s + (c.spatial[p] ?? 0) - q * v

    const rest = n * pp * (b[p] ?? 0) - 2 * (c.counter[p] ?? 0) + (c.lag[p] ?? 0) + v
    const k = floorDiv(rest + h, q)

    c.lag[p] = c.counter[p] ?? 0
    c.counter[p] = q * k - rest
    f[p] = k
  }

  return f
}

// the inverse of force, given the same b: returns the force the forward step paid
function forceBack(light: TritLight, b: Int32Array, c: Counters): Int32Array {
  const { bulk, p: pp, q } = light
  const h = bulk.depth
  const f = new Int32Array(bulk.huskTriangles)

  if (light.form === 'first') {
    for (let p = 0; p < bulk.huskTriangles; p++) {
      const drive = (bulk.multiplicity[p] ?? 0) * pp * (b[p] ?? 0)
      const r = c.counter[p] ?? 0
      const k = floorDiv(drive - r + h, q)

      c.counter[p] = r + q * k - drive
      f[p] = k
    }

    return f
  }

  // the spatial term was read from D_t, which is now the lag
  const t = huskCurlT(light, c.lag)

  for (let p = 0; p < bulk.huskTriangles; p++) {
    const n = bulk.multiplicity[p] ?? 0
    const s = n * pp * huskCurlWeighted(light, t, p)
    const r2 = c.spatial[p] ?? 0
    const v = floorDiv(s - r2 + h, q)

    c.spatial[p] = r2 - s + q * v

    const next = c.counter[p] ?? 0
    const now = c.lag[p] ?? 0
    const y = -next - n * pp * (b[p] ?? 0) + 2 * now - v
    const k = floorDiv(h - y, q)

    c.counter[p] = now
    c.lag[p] = q * k + y
    f[p] = k
  }

  return f
}

// one beat of the husk integer rule, in place
export function huskLightBeat(light: TritLight, state: HuskLightState, tally?: Tally): void {
  const { bulk } = light
  const e = huskFlux(light, state)

  for (let l = 0; l < bulk.huskLinks; l++) {
    const raw = (state.angle[l] ?? 0) + (e[l] ?? 0)
    const next = wrapAngle(light, l % 9, raw)

    if (tally && next !== raw) tally.wraps++
    state.angle[l] = next
  }

  const b = Int32Array.from({ length: bulk.huskTriangles }, (_, p) => huskField(light, state.angle, p))
  const f = force(light, b, state)

  for (let p = 0; p < bulk.huskTriangles; p++) {
    const raw = (state.potential[p] ?? 0) + (f[p] ?? 0)
    const next = wrapPotential(light, p, raw)

    if (tally && next !== raw) tally.potentialWraps++
    state.potential[p] = next
  }
}

export function huskLightBeatBack(light: TritLight, state: HuskLightState): void {
  const { bulk } = light
  const b = Int32Array.from({ length: bulk.huskTriangles }, (_, p) => huskField(light, state.angle, p))
  const f = forceBack(light, b, state)

  for (let p = 0; p < bulk.huskTriangles; p++) {
    state.potential[p] = wrapPotential(light, p, (state.potential[p] ?? 0) - (f[p] ?? 0))
  }

  const e = huskFlux(light, state)

  for (let l = 0; l < bulk.huskLinks; l++) {
    state.angle[l] = wrapAngle(light, l % 9, (state.angle[l] ?? 0) - (e[l] ?? 0))
  }
}

export function emptyHuskLight(light: TritLight): HuskLightState {
  return {
    angle: new Int32Array(light.bulk.huskLinks),
    potential: new Int32Array(light.bulk.huskTriangles),
    counter: new Int32Array(light.bulk.huskTriangles),
    lag: new Int32Array(light.bulk.huskTriangles),
    spatial: new Int32Array(light.bulk.huskTriangles),
    string: new Int32Array(light.bulk.huskLinks),
  }
}

export function copyHuskLight(state: HuskLightState): HuskLightState {
  return {
    angle: Int32Array.from(state.angle),
    potential: Int32Array.from(state.potential),
    counter: Int32Array.from(state.counter),
    lag: Int32Array.from(state.lag),
    spatial: Int32Array.from(state.spatial),
    string: Int32Array.from(state.string),
  }
}

// ---------------------------------------------------------------------------------------------------------
// The trit rule: the same beat, every integer read as a column sum of bulk trits and paid back as trit flips

export type TritState = {
  readonly vibe: Int8Array // per bulk dock
  readonly angle: Int8Array // per bulk link
  readonly string: Int8Array // per bulk link
  readonly potential: Int8Array // per bulk triangle
  // three counter trits per bulk triangle, used only on the counter column's triangles
  readonly counter: Int8Array
  readonly lag: Int8Array
  readonly spatial: Int8Array
}

export function emptyTritState(light: TritLight): TritState {
  const { bulk } = light

  return {
    vibe: new Int8Array(bulk.docks),
    angle: new Int8Array(bulk.links),
    string: new Int8Array(bulk.links),
    potential: new Int8Array(bulk.triangles),
    counter: new Int8Array(bulk.triangles),
    lag: new Int8Array(bulk.triangles),
    spatial: new Int8Array(bulk.triangles),
  }
}

export function copyTritState(s: TritState): TritState {
  return {
    vibe: Int8Array.from(s.vibe),
    angle: Int8Array.from(s.angle),
    string: Int8Array.from(s.string),
    potential: Int8Array.from(s.potential),
    counter: Int8Array.from(s.counter),
    lag: Int8Array.from(s.lag),
    spatial: Int8Array.from(s.spatial),
  }
}

// the bulk flux of every bulk link: s - C^T u, a relation of the link's string and its triangles
export function bulkFlux(light: TritLight, state: TritState): Int32Array {
  const { bulk } = light
  const e = Int32Array.from(state.string)

  for (let t = 0; t < bulk.triangles; t++) {
    const u = state.potential[t] ?? 0

    if (u === 0) continue

    for (let j = 0; j < 3; j++) {
      const l = bulk.triLinks[t * 3 + j] ?? 0

      e[l] = (e[l] ?? 0) - (bulk.triSigns[t * 3 + j] ?? 0) * u
    }
  }

  return e
}

// the column sums of a bulk link field onto the husk links
export function columnSumLinks(light: TritLight, field: ArrayLike<number>): Int32Array {
  const { bulk } = light
  const out = new Int32Array(bulk.huskLinks)

  for (let i = 0; i < bulk.huskLinks; i++) {
    let v = 0

    for (let k = bulk.linkColumnStart[i] ?? 0; k < (bulk.linkColumnStart[i + 1] ?? 0); k++) {
      v += field[bulk.linkColumn[k] ?? 0] ?? 0
    }

    out[i] = v
  }

  return out
}

// the plaquette fields read from the bulk: each bulk triangle's angle sum b, summed down the column of its
// husk triangle, is (n_P / 2) B_P exactly (every bulk link over a husk link lies in the same number of the
// column's triangles); returned as 2 sum b, which the caller divides by n_P
export function columnTriangleAngles(light: TritLight, state: TritState): Int32Array {
  const { bulk } = light
  const out = new Int32Array(bulk.huskTriangles)

  for (let p = 0; p < bulk.huskTriangles; p++) {
    let v = 0

    for (let k = bulk.triColumnStart[p] ?? 0; k < (bulk.triColumnStart[p + 1] ?? 0); k++) {
      const t = bulk.triColumn[k] ?? 0
      const o = bulk.triColumnSign[k] ?? 1

      for (let j = 0; j < 3; j++) {
        v += o * (bulk.triSigns[t * 3 + j] ?? 0) * (state.angle[bulk.triLinks[t * 3 + j] ?? 0] ?? 0)
      }
    }

    out[p] = 2 * v
  }

  return out
}

const counterRead = (light: TritLight, trits: Int8Array, p: number): number =>
  columnValue(trits, light.bulk.counterColumn, light.bulk.counterColumnSign, p * light.bulk.depth, light.bulk.depth)

const counterWrite = (light: TritLight, trits: Int8Array, p: number, v: number): { flips: number; reach: number } =>
  writeColumn(trits, light.bulk.counterColumn, light.bulk.counterColumnSign, p * light.bulk.depth, light.bulk.depth, v)

// decode the husk integers from the trits
export function readHusk(light: TritLight, state: TritState): HuskLightState {
  const { bulk } = light
  const angle = columnSumLinks(light, state.angle)
  const string = columnSumLinks(light, state.string)
  const potential = new Int32Array(bulk.huskTriangles)
  const counter = new Int32Array(bulk.huskTriangles)
  const lag = new Int32Array(bulk.huskTriangles)
  const spatial = new Int32Array(bulk.huskTriangles)

  for (let p = 0; p < bulk.huskTriangles; p++) {
    const start = bulk.triColumnStart[p] ?? 0

    potential[p] = columnValue(state.potential, bulk.triColumn, bulk.triColumnSign, start, (bulk.triColumnStart[p + 1] ?? 0) - start)
    counter[p] = counterRead(light, state.counter, p)
    lag[p] = counterRead(light, state.lag, p)
    spatial[p] = counterRead(light, state.spatial, p)
  }

  return { angle, potential, counter, lag, spatial, string }
}

// encode husk integers as thermometer columns (angles, potentials, counters). The strings are placed by the
// caller along bulk paths and are left alone
export function writeHusk(light: TritLight, state: TritState, husk: HuskLightState): Tally {
  const { bulk } = light
  const tally = emptyTally()
  const add = (r: { flips: number; reach: number }): void => {
    tally.flips += r.flips
    tally.reach = Math.max(tally.reach, r.reach)
  }

  for (let i = 0; i < bulk.huskLinks; i++) {
    const start = bulk.linkColumnStart[i] ?? 0

    add(writeColumn(state.angle, bulk.linkColumn, undefined, start, (bulk.linkColumnStart[i + 1] ?? 0) - start, husk.angle[i] ?? 0))
  }

  for (let p = 0; p < bulk.huskTriangles; p++) {
    const start = bulk.triColumnStart[p] ?? 0

    add(writeColumn(state.potential, bulk.triColumn, bulk.triColumnSign, start, (bulk.triColumnStart[p + 1] ?? 0) - start, husk.potential[p] ?? 0))
    add(counterWrite(light, state.counter, p, husk.counter[p] ?? 0))
    add(counterWrite(light, state.lag, p, husk.lag[p] ?? 0))
    add(counterWrite(light, state.spatial, p, husk.spatial[p] ?? 0))
  }

  return tally
}

// the counters read from their columns, into plain arrays the force law updates, then paid back
function readCounters(light: TritLight, state: TritState): Counters {
  const n = light.bulk.huskTriangles

  return {
    counter: Int32Array.from({ length: n }, (_, p) => counterRead(light, state.counter, p)),
    lag: Int32Array.from({ length: n }, (_, p) => counterRead(light, state.lag, p)),
    spatial: Int32Array.from({ length: n }, (_, p) => counterRead(light, state.spatial, p)),
  }
}

function payCounters(light: TritLight, state: TritState, c: Counters, add: (r: { flips: number; reach: number }) => void): void {
  for (let p = 0; p < light.bulk.huskTriangles; p++) {
    add(counterWrite(light, state.counter, p, c.counter[p] ?? 0))

    if (light.form === 'wave') {
      add(counterWrite(light, state.lag, p, c.lag[p] ?? 0))
      add(counterWrite(light, state.spatial, p, c.spatial[p] ?? 0))
    }
  }
}

function fieldsFromBulk(light: TritLight, state: TritState): Int32Array {
  const twice = columnTriangleAngles(light, state)

  return Int32Array.from(twice, (v, p) => centeredField(light, v / (light.bulk.multiplicity[p] ?? 1)))
}

function payPotentials(light: TritLight, state: TritState, f: Int32Array, sign: number, t: Tally | undefined, add: (r: { flips: number; reach: number }) => void): void {
  const { bulk } = light

  for (let p = 0; p < bulk.huskTriangles; p++) {
    const k = sign * (f[p] ?? 0)

    if (k === 0) continue

    const start = bulk.triColumnStart[p] ?? 0
    const length = (bulk.triColumnStart[p + 1] ?? 0) - start
    const u = columnValue(state.potential, bulk.triColumn, bulk.triColumnSign, start, length)
    const next = wrapPotential(light, p, u + k)

    if (t && next !== u + k) t.potentialWraps++
    add(writeColumn(state.potential, bulk.triColumn, bulk.triColumnSign, start, length, next))
  }
}

function driftTrits(light: TritLight, state: TritState, sign: number, t: Tally | undefined, add: (r: { flips: number; reach: number }) => void): void {
  const { bulk } = light
  const flux = columnSumLinks(light, bulkFlux(light, state))

  for (let i = 0; i < bulk.huskLinks; i++) {
    const start = bulk.linkColumnStart[i] ?? 0
    const length = (bulk.linkColumnStart[i + 1] ?? 0) - start
    const a = columnValue(state.angle, bulk.linkColumn, undefined, start, length)
    const raw = a + sign * (flux[i] ?? 0)
    const next = wrapAngle(light, i % 9, raw)

    if (t && next !== raw) t.wraps++
    add(writeColumn(state.angle, bulk.linkColumn, undefined, start, length, next))
  }
}

// one beat of the trit rule, in place. The drift reads the column sum of the bulk flux (a relation of the
// strings and the triangles' potentials) and pays each angle column; the kick reads the column sums of the
// bulk triangles' angle sums and the counter columns, takes the counters' floors, and pays the potential and
// counter columns
export function tritLightBeat(light: TritLight, state: TritState, tally?: Tally): void {
  const add = (r: { flips: number; reach: number }): void => {
    if (tally) {
      tally.flips += r.flips
      tally.reach = Math.max(tally.reach, r.reach)
    }
  }

  driftTrits(light, state, 1, tally, add)

  const c = readCounters(light, state)
  const f = force(light, fieldsFromBulk(light, state), c)

  payCounters(light, state, c, add)
  payPotentials(light, state, f, 1, tally, add)
}

export function tritLightBeatBack(light: TritLight, state: TritState): void {
  const none = (): void => undefined
  const c = readCounters(light, state)
  const f = forceBack(light, fieldsFromBulk(light, state), c)

  payCounters(light, state, c, none)
  payPotentials(light, state, f, -1, undefined, none)
  driftTrits(light, state, -1, undefined, none)
}

// bulk docks where the divergence of the bulk flux is not the vibe
export function bulkGaussViolations(light: TritLight, state: TritState): number {
  const { bulk } = light
  const e = bulkFlux(light, state)
  const div = new Int32Array(bulk.docks)
  const firstRoots = bulk.roots

  for (let l = 0; l < bulk.links; l++) {
    const x = Math.floor(l / 12)
    const r = firstRoots[l % 12] ?? []
    const d = rootsIndex(r)
    const y = bulk.neighbour[x * 24 + d] ?? 0

    div[x] = (div[x] ?? 0) + (e[l] ?? 0)
    div[y] = (div[y] ?? 0) - (e[l] ?? 0)
  }

  let bad = 0

  for (let x = 0; x < bulk.docks; x++) {
    bad += div[x] === (state.vibe[x] ?? 0) ? 0 : 1
  }

  return bad
}

const ROOTS = rootsD4()

function rootsIndex(r: readonly number[]): number {
  return ROOTS.findIndex(o => o.every((x, k) => x === (r[k] ?? 0)))
}

// husk docks where the divergence of the husk flux is not the column charge
export function huskGaussViolations(light: TritLight, flux: ArrayLike<number>, vibe: Int8Array): number {
  const { bulk } = light
  const div = new Int32Array(bulk.huskDocks)
  const charge = new Int32Array(bulk.huskDocks)

  for (let x = 0; x < bulk.docks; x++) {
    charge[bulk.column[x] ?? 0] = (charge[bulk.column[x] ?? 0] ?? 0) + (vibe[x] ?? 0)
  }

  for (let l = 0; l < bulk.huskLinks; l++) {
    const y = Math.floor(l / 9)
    const z = bulk.huskNeighbour[l] ?? 0

    div[y] = (div[y] ?? 0) + (flux[l] ?? 0)
    div[z] = (div[z] ?? 0) - (flux[l] ?? 0)
  }

  let bad = 0

  for (let y = 0; y < bulk.huskDocks; y++) {
    bad += div[y] === charge[y] ? 0 : 1
  }

  return bad
}

// place a vibe v at bulk dock x and -v at the end of a path of first-root steps, joined by a string of trits;
// each link of the path must be free. Returns the far dock
export function placeTritPair(light: TritLight, state: TritState, x: number, steps: readonly number[], v: number): number {
  const { bulk } = light

  let c = x

  for (const k of steps) {
    const l = c * 12 + k

    if (state.string[l] !== 0) {
      throw new Error('the path crosses a string twice')
    }

    state.string[l] = v
    c = bulk.neighbour[c * 24 + rootsIndex(bulk.roots[k] ?? [])] ?? 0
  }

  state.vibe[x] = (state.vibe[x] ?? 0) + v
  state.vibe[c] = (state.vibe[c] ?? 0) - v

  return c
}
