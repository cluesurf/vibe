// The flux budget of a torn husk (E-GRV-0116): where a lump's lines go once a horizon has formed. Real numbers live here
// only. A reading, not a rule: every function takes a field (a flux per link, or a depth per dock) and counts.
//
// THE BUDGET. The horizon's docks keep only their one vertical link live (code/rule/horizon-husk tornLink), so the
// content Q_H on the horizon leaves it by two routes: DOWN its verticals into the bulk, or OUT through the torn links on
// its rim, which carry a step only where one was held (the held rule, E-GRV-0112) and 0 in a placed torn statics. By
// Gauss, Q_H = down + out exactly. Past the horizon the lines spread on the husk and in the bulk layers; through the 4d
// "cylinder" at husk radius r (every dock of every layer labelled inside or outside by its own husk-equivalent distance,
// a layer-k dock being 2^k husk docks across), the content inside equals the flux out over every link that crosses it,
// husk lateral links and the rest. The husk's share of that flux is what the husk's pull at r reads.
//
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: this file reads values only.

import { HUSK_LATERAL, layerOf, type OpenMesh } from '@/code/rule/open-husk'
import { tornLink } from '@/code/rule/horizon-husk'
import { huskCoord } from '@/code/measure/open-husk'
import { verticalOf } from '@/code/measure/horizon-husk'

const mod = (x: number, m: number): number => ((x % m) + m) % m

// each dock's husk-equivalent distance from `center` (periodic, the short way round): a layer-k dock at (a, b, c) sits at
// ((a + 1/2) 2^k - 1/2, ...) in husk coordinates, the middle of the husk docks above it
export function stackDistance(mesh: OpenMesh, center: readonly number[]): Float64Array {
  const side = mesh.side

  return Float64Array.from({ length: mesh.docks }, (_, y) => {
    const k = layerOf(mesh, y)
    const s = mesh.sides[k]!
    const i = y - mesh.offset[k]!
    const p = [i % s, Math.floor(i / s) % s, Math.floor(i / (s * s))]
    const f = 2 ** k

    return Math.sqrt(
      p.reduce((t, v, j) => {
        const d = mod((v + 0.5) * f - 0.5 - center[j]!, side)

        return t + Math.min(d, side - d) ** 2
      }, 0),
    )
  })
}

// a static depth written as a flux per link, F = g (x_tail - x_head) on the live links; on a torn link its held step
// (whole steps) where `held` is given, else 0
export function staticFlux(mesh: OpenMesh, x: ArrayLike<number>, horizon: Uint8Array, held?: ArrayLike<number>): Float64Array {
  const out = new Float64Array(mesh.links)

  for (let m = 0; m < mesh.links; m++) {
    const z = mesh.head[m]!

    if (z < 0) continue
    out[m] = tornLink(mesh, horizon, m) ? (held ? held[m]! : 0) : mesh.weight[m]! * (x[mesh.tail[m]!]! - x[z]!)
  }

  return out
}

export type FluxBudget = {
  // content on the horizon, and the flux leaving it down its verticals and out through its rim's torn links
  horizonContent: number
  down: number
  out: number
  // horizon verticals whose flux points up (beyond `upFloor`)
  upVerticals: number
  // per radius: content inside, flux out over husk lateral links, over every other crossing link, and |in - out|
  inside: number[]
  husk: number[]
  bulk: number[]
  gaussOff: number
}

export function fluxBudget(mesh: OpenMesh, flux: ArrayLike<number>, rho: ArrayLike<number>, horizon: Uint8Array, distance: Float64Array, radii: readonly number[], upFloor = 1e-3): FluxBudget {
  const vertical = verticalOf(mesh)
  let horizonContent = 0
  let down = 0
  let out = 0
  let upVerticals = 0

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (!horizon[y]) continue
    horizonContent += rho[y]!

    const F = flux[vertical[y]!]!

    down += F
    if (F < -upFloor) upVerticals++
  }
  for (let m = 0; m < mesh.huskDocks * 9; m++) {
    const a = horizon[mesh.tail[m]!]!

    if (a === horizon[mesh.head[m]!]!) continue
    out += a ? flux[m]! : -flux[m]!
  }

  const inside: number[] = []
  const husk: number[] = []
  const bulk: number[] = []
  let gaussOff = 0

  for (const r of radii) {
    let q = 0
    let h = 0
    let b = 0

    for (let y = 0; y < mesh.docks; y++) if (distance[y]! < r) q += rho[y]!
    for (let m = 0; m < mesh.links; m++) {
      const z = mesh.head[m]!

      if (z < 0) continue

      const ti = distance[mesh.tail[m]!]! < r

      if (ti === distance[z]! < r) continue

      const v = ti ? flux[m]! : -flux[m]!

      if (mesh.kind[m] === HUSK_LATERAL) h += v
      else b += v
    }
    inside.push(q)
    husk.push(h)
    bulk.push(b)
    gaussOff = Math.max(gaussOff, Math.abs(q - h - b))
  }

  return { horizonContent, down, out, upVerticals, inside, husk, bulk, gaussOff }
}

// the shape of the horizon: dock count, largest and mean radius, the dipole of its docks about `center` (docks times
// docks), and the norm of their traceless quadrupole over sum r^2
export type HorizonShape = { docks: number; rMax: number; rMean: number; dipole: number; quadrupole: number }

export function horizonShape(mesh: OpenMesh, horizon: Uint8Array, center: readonly number[]): HorizonShape {
  const side = mesh.side
  const d = [0, 0, 0]
  const Q = new Float64Array(9)
  let docks = 0
  let rMax = 0
  let rSum = 0
  let norm = 0

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (!horizon[y]) continue

    const o = huskCoord(mesh, y).map((v, i) => {
      const e = mod(v - center[i]!, side)

      return e > side / 2 ? e - side : e
    })
    const r2 = o[0]! ** 2 + o[1]! ** 2 + o[2]! ** 2

    docks++
    rMax = Math.max(rMax, Math.sqrt(r2))
    rSum += Math.sqrt(r2)
    norm += r2
    for (let i = 0; i < 3; i++) {
      d[i] = d[i]! + o[i]!
      for (let j = 0; j < 3; j++) Q[3 * i + j] = Q[3 * i + j]! + 3 * o[i]! * o[j]! - (i === j ? r2 : 0)
    }
  }

  return { docks, rMax, rMean: docks ? rSum / docks : 0, dipole: Math.hypot(...d), quadrupole: norm ? Math.hypot(...Q) / norm : 0 }
}
