// The husk integer rule of code/rule/trit-column on a husk box of any side, without building the bulk
// (E-FRC-0210 to 0212). The trit rule equals the husk integer rule bit for bit (E-FRC-0207 gate A, rechecked
// with moving matter in E-FRC-0210), and its cost on the husk does not grow with the depth D, so a large husk
// box can be run at any depth once its husk triangles are known.
//
// The husk triangles are read off a small bulk (side 8, depth 4) and tiled: every husk triangle is kept with
// the parities of its anchor dock (a, b, c mod 2) and the offsets of its three links, and repeated at every
// dock of the large box with the same parities. `huskGeometry` on side 8 gives the same triangle set as the
// bulk it came from (checked by the callers). The multiplicity n_P (bulk triangles per column dock over P)
// does not depend on the depth.
//
// The beat is huskLightBeat's wave form with typed arrays and no allocation in the loop:
//   e = S - C^T U;  A <- wrap(A + e);  B = centered(C W A);  the wave-form counters pay the force F;
//   U <- wrap(U + F)
// with kappa = 2p / q, q = 2D + 1, the angle windows 4D (axis) and 2D (diagonal), N_B = 4D, and the potential
// window n_P D. A hop changes S by the column sum of its crossings (code/rule/trit-hop): `addCurrent`.
//
// Integers only: no float, no trig, no rounding.

import { buildTritBulk, TRIT_HUSK_VECTORS, type HuskLightState, type TritBulk } from '@/code/rule/trit-column'

const mod = (x: number, m: number): number => ((x % m) + m) % m

export type HuskGeometry = {
  readonly side: number
  readonly huskDocks: number
  readonly huskLinks: number
  readonly huskNeighbour: Int32Array
  readonly triangles: number
  readonly triLinks: Int32Array
  readonly triSigns: Int8Array
  readonly multiplicity: Int32Array
  // per husk link direction: w = 2 / g (1 on an axis, 2 on a diagonal)
  readonly weight: Int32Array
}

type Template = { parity: number; offsets: number[]; directions: number[]; signs: number[]; n: number }

let templates: Template[] | undefined

function readTemplates(): Template[] {
  if (templates) return templates

  const bulk: TritBulk = buildTritBulk({ side: 8, depth: 4 })
  const side = 8
  const coord = (y: number): number[] => [y % side, Math.floor(y / side) % side, Math.floor(y / (side * side))]
  const out: Template[] = []

  // a shape is canonical: of the three choices of anchor link, and the two orientations, the one whose
  // (offset, direction, sign) list is least; the sorted order of a box's link indices is not translation
  // invariant, so the box's own order cannot serve
  for (let p = 0; p < bulk.huskTriangles; p++) {
    const links = [0, 1, 2].map(j => bulk.huskTriLinks[p * 3 + j] ?? 0)
    const signs = [0, 1, 2].map(j => bulk.huskTriSigns[p * 3 + j] ?? 0)
    let best: { text: string; t: Template } | undefined

    for (let a = 0; a < 3; a++) {
      const anchor = coord(Math.floor((links[a] ?? 0) / 9))

      for (const o of [1, -1]) {
        const rows = links.map((l, j) => {
          const c = coord(Math.floor(l / 9))

          return [0, 1, 2].map(i => mod((c[i] ?? 0) - (anchor[i] ?? 0) + side / 2, side) - side / 2).concat([l % 9, o * (signs[j] ?? 0)])
        })

        rows.sort((x, y) => x.join(',').localeCompare(y.join(',')))

        const text = rows.map(r => r.join(',')).join('|')

        if (!best || text < best.text) {
          best = {
            text,
            t: {
              parity: (anchor[0] ?? 0) % 2 + 2 * ((anchor[1] ?? 0) % 2) + 4 * ((anchor[2] ?? 0) % 2),
              offsets: rows.flatMap(r => r.slice(0, 3)),
              directions: rows.map(r => r[3] ?? 0),
              signs: rows.map(r => r[4] ?? 0),
              n: bulk.multiplicity[p] ?? 0,
            },
          }
        }
      }
    }

    out.push(best!.t)
  }

  // each parity class must hold the same number of triangles per anchor dock: 64 anchors per class at side 8
  templates = out

  return out
}

export function huskGeometry(side: number): HuskGeometry {
  if (side % 2 !== 0) throw new Error('the husk side must be even')

  const all = readTemplates()
  const byParity: Template[][] = Array.from({ length: 8 }, () => [])
  const seen = new Set<string>()

  // one template per (parity, shape): the side-8 box repeats each shape at its 64 anchors of that parity
  for (const t of all) {
    const key = `${t.parity}|${t.offsets.join(',')}|${t.directions.join(',')}|${t.signs.join(',')}`

    if (seen.has(key)) continue

    seen.add(key)
    byParity[t.parity]!.push(t)
  }

  const huskDocks = side ** 3
  const huskLinks = huskDocks * 9
  const huskNeighbour = new Int32Array(huskLinks)
  const at = (a: number, b: number, c: number): number => mod(a, side) + side * mod(b, side) + side * side * mod(c, side)

  for (let y = 0; y < huskDocks; y++) {
    const a = y % side
    const b = Math.floor(y / side) % side
    const c = Math.floor(y / (side * side))

    for (let h = 0; h < 9; h++) {
      const u = TRIT_HUSK_VECTORS[h] ?? []

      huskNeighbour[y * 9 + h] = at(a + (u[0] ?? 0), b + (u[1] ?? 0), c + (u[2] ?? 0))
    }
  }

  let count = 0

  for (let y = 0; y < huskDocks; y++) {
    const par = (y % side) % 2 + 2 * ((Math.floor(y / side) % side) % 2) + 4 * (Math.floor(y / (side * side)) % 2)

    count += byParity[par]!.length
  }

  const triLinks = new Int32Array(count * 3)
  const triSigns = new Int8Array(count * 3)
  const multiplicity = new Int32Array(count)

  let p = 0

  for (let y = 0; y < huskDocks; y++) {
    const a = y % side
    const b = Math.floor(y / side) % side
    const c = Math.floor(y / (side * side))
    const par = (a % 2) + 2 * (b % 2) + 4 * (c % 2)

    for (const t of byParity[par]!) {
      for (let j = 0; j < 3; j++) {
        const z = at(a + (t.offsets[j * 3] ?? 0), b + (t.offsets[j * 3 + 1] ?? 0), c + (t.offsets[j * 3 + 2] ?? 0))

        triLinks[p * 3 + j] = z * 9 + (t.directions[j] ?? 0)
        triSigns[p * 3 + j] = t.signs[j] ?? 0
      }

      multiplicity[p] = t.n
      p++
    }
  }

  return {
    side,
    huskDocks,
    huskLinks,
    huskNeighbour,
    triangles: count,
    triLinks,
    triSigns,
    multiplicity,
    weight: Int32Array.from({ length: 9 }, (_, h) => (h < 3 ? 1 : 2)),
  }
}

// the geometry of a bulk, for the exactness check against huskLightBeat (same triangle order)
export function geometryOfBulk(bulk: TritBulk): HuskGeometry {
  return {
    side: bulk.side,
    huskDocks: bulk.huskDocks,
    huskLinks: bulk.huskLinks,
    huskNeighbour: bulk.huskNeighbour,
    triangles: bulk.huskTriangles,
    triLinks: bulk.huskTriLinks,
    triSigns: bulk.huskTriSigns,
    multiplicity: bulk.multiplicity,
    weight: Int32Array.from({ length: 9 }, (_, h) => (h < 3 ? 1 : 2)),
  }
}

export type HuskEngine = {
  readonly geometry: HuskGeometry
  readonly depth: number
  readonly p: number
  readonly q: number
  readonly nb: number
  // scratch, allocated once
  readonly flux: Int32Array
  readonly field: Int32Array
  readonly curl: Int32Array
}

export function makeHuskEngine(geometry: HuskGeometry, depth: number, p = 1): HuskEngine {
  return {
    geometry,
    depth,
    p,
    q: 2 * depth + 1,
    nb: 4 * depth,
    flux: new Int32Array(geometry.huskLinks),
    field: new Int32Array(geometry.triangles),
    curl: new Int32Array(geometry.huskLinks),
  }
}

export function emptyHusk(engine: HuskEngine): HuskLightState {
  const g = engine.geometry

  return {
    angle: new Int32Array(g.huskLinks),
    potential: new Int32Array(g.triangles),
    counter: new Int32Array(g.triangles),
    lag: new Int32Array(g.triangles),
    spatial: new Int32Array(g.triangles),
    string: new Int32Array(g.huskLinks),
  }
}

// out = S - C^T U
export function fastFlux(engine: HuskEngine, state: HuskLightState, out: Int32Array): void {
  const g = engine.geometry

  out.set(state.string)

  for (let p = 0; p < g.triangles; p++) {
    const u = state.potential[p]!

    if (u === 0) continue

    const b = p * 3

    for (let j = b; j < b + 3; j++) {
      const l = g.triLinks[j]!

      out[l] = out[l]! - g.triSigns[j]! * u
    }
  }
}

// the raw plaquette sum (C W x)_P
function curlWeighted(g: HuskGeometry, x: Int32Array, p: number): number {
  const b = p * 3
  const l0 = g.triLinks[b]!
  const l1 = g.triLinks[b + 1]!
  const l2 = g.triLinks[b + 2]!

  return g.triSigns[b]! * g.weight[l0 % 9]! * x[l0]! + g.triSigns[b + 1]! * g.weight[l1 % 9]! * x[l1]! + g.triSigns[b + 2]! * g.weight[l2 % 9]! * x[l2]!
}

// one beat of the wave form, in place: equal to huskLightBeat bit for bit
export function fastBeat(engine: HuskEngine, state: HuskLightState): void {
  const g = engine.geometry
  const { depth: h, p: pp, q, nb, flux, field, curl } = engine
  const half = nb / 2

  fastFlux(engine, state, flux)

  for (let l = 0; l < g.huskLinks; l++) {
    const n = l % 9 < 3 ? 4 * h : 2 * h
    const v = state.angle[l]! + flux[l]!

    state.angle[l] = mod(v + n / 2, n) - n / 2
  }

  for (let p = 0; p < g.triangles; p++) {
    field[p] = mod(curlWeighted(g, state.angle, p) + half, nb) - half
  }

  // C^T D_t, read before any counter changes
  curl.fill(0)

  for (let p = 0; p < g.triangles; p++) {
    const v = state.counter[p]!

    if (v === 0) continue

    const b = p * 3

    for (let j = b; j < b + 3; j++) {
      const l = g.triLinks[j]!

      curl[l] = curl[l]! + g.triSigns[j]! * v
    }
  }

  for (let p = 0; p < g.triangles; p++) {
    const n = g.multiplicity[p]!
    const s = n * pp * curlWeighted(g, curl, p)
    const x = s + state.spatial[p]! + h
    const v = (x - mod(x, q)) / q

    state.spatial[p] = s + state.spatial[p]! - q * v

    const rest = n * pp * field[p]! - 2 * state.counter[p]! + state.lag[p]! + v
    const y = rest + h
    const k = (y - mod(y, q)) / q

    state.lag[p] = state.counter[p]!
    state.counter[p] = q * k - rest

    const w = n * h
    const u = state.potential[p]! + k

    state.potential[p] = mod(u + w, 2 * w + 1) - w
  }
}

// a husk current: S_l <- S_l - J on the husk link the crossing lies over
export function addCurrent(state: HuskLightState, huskLink: number, j: number): void {
  state.string[huskLink] = (state.string[huskLink] ?? 0) - j
}
