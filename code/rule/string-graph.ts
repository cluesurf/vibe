// A charge that pays for its string, on any mesh: the rule of code/rule/string-line put on the D4 lattice.
//
// Cells hold a vibe q_x (fear -1, calm 0, love +1) that waits in its cell between hops, as the line's do.
// Each undirected link, oriented along its first direction, holds a flux E and a demon. Gauss's law: the
// flux leaving a cell minus the flux entering it equals its vibe. The energy
//
//   H = mass * (cells holding a vibe) + tension * (links with E mod 3 not 0) + sum of demons
//
// is conserved to the unit. The links are split once into matchings (no two links of a matching share a
// cell), by a fixed greedy edge coloring, and a beat runs every matching in turn. On one link the move pairs
//   (v, 0) with (0, v), a charge hopping across, E changed by -v going to the second cell and +v coming
//   back, since the first cell's divergence changes by what leaves it, and
//   (0, 0) with (1, -1), calm making a pair, E changed by +1,
// taken only where the link's demon can pay the change in energy and stay within 0 and its capacity. Each
// pairing and its payability are symmetric, so each matching's step is its own inverse and a beat reverses
// by running the matchings in the other order. The demons then stream: each link's demon moves to the
// next link along the same direction, a permutation, undone by the reverse shift.
//
// This is matter that can wait, the second of the two routes the half-space theorem (E-FRC-0130) leaves for
// moving binding: it leaves the slot architecture of the committed rule, so it measures whether the D4
// lattice binds with a paid hop, not whether the committed rule does.

import { type Mesh } from '@/code/tool/mesh'

export type StringGraph = {
  readonly mesh: Mesh
  readonly mass: number
  readonly tension: number
  readonly capacity: number
  // undirected links as [from, to, direction], from the lower-indexed direction of each line
  readonly links: readonly (readonly [number, number, number])[]
  // the link index of (cell, direction) for the first direction of each line, -1 otherwise
  readonly linkAt: Int32Array
  readonly matchings: readonly (readonly number[])[]
  // for each link, the next link along the same direction: where its demon streams
  readonly next: Int32Array
  readonly previous: Int32Array
}

export type GraphState = {
  readonly vibe: Int8Array
  readonly flux: Int32Array
  readonly demon: Int32Array
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3

export function makeStringGraph(input: { mesh: Mesh; mass: number; tension: number; capacity: number }): StringGraph {
  const { mesh } = input
  const degree = mesh.degree
  const links: [number, number, number][] = []
  const linkAt = new Int32Array(mesh.cellCount * degree).fill(-1)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < degree; d++) {
      if (d < mesh.opposite(d)) {
        linkAt[x * degree + d] = links.length
        links.push([x, mesh.neighbour(x, d), d])
      }
    }
  }

  // greedy edge coloring, in link order: each link takes the first matching free at both ends
  const used = new Map<number, Set<number>>()
  const matchings: number[][] = []

  links.forEach(([a, b], l) => {
    const busy = new Set([...(used.get(a) ?? []), ...(used.get(b) ?? [])])

    let color = 0

    while (busy.has(color)) {
      color += 1
    }

    ;(matchings[color] ??= []).push(l)
    used.set(a, (used.get(a) ?? new Set()).add(color))
    used.set(b, (used.get(b) ?? new Set()).add(color))
  })

  const next = new Int32Array(links.length)
  const previous = new Int32Array(links.length)

  links.forEach(([, b, d], l) => {
    const onward = linkAt[b * degree + d] ?? l

    next[l] = onward
    previous[onward] = l
  })

  return { ...input, links, linkAt, matchings, next, previous }
}

export function graphEnergy(graph: StringGraph, state: GraphState): number {
  let total = 0

  for (let x = 0; x < graph.mesh.cellCount; x++) {
    total += state.vibe[x] !== 0 ? graph.mass : 0
  }

  for (let l = 0; l < graph.links.length; l++) {
    total += (mod3(state.flux[l] ?? 0) !== 0 ? graph.tension : 0) + (state.demon[l] ?? 0)
  }

  return total
}

// Gauss's law at every cell: flux out minus flux in equals the vibe
export function graphGaussHolds(graph: StringGraph, state: GraphState): boolean {
  const divergence = new Int32Array(graph.mesh.cellCount)

  graph.links.forEach(([a, b], l) => {
    divergence[a] = (divergence[a] ?? 0) + (state.flux[l] ?? 0)
    divergence[b] = (divergence[b] ?? 0) - (state.flux[l] ?? 0)
  })

  return divergence.every((v, x) => v === state.vibe[x])
}

// one matching's step, in place: an involution. `onHop` hears every charge that crosses
function matchingStep(graph: StringGraph, state: GraphState, matching: readonly number[], onHop?: (from: number, to: number, link: number) => void): void {
  const { vibe, flux, demon } = state

  for (const l of matching) {
    const [i, j] = graph.links[l] ?? [0, 0, 0]
    const a = vibe[i] ?? 0
    const b = vibe[j] ?? 0

    let na = a
    let nb = b
    let change = 0
    let massChange = 0

    if (a !== 0 && b === 0) {
      ;[na, nb, change] = [0, a, -a]
    } else if (a === 0 && b !== 0) {
      ;[na, nb, change] = [b, 0, b]
    } else if (a === 0 && b === 0) {
      ;[na, nb, change, massChange] = [1, -1, 1, 2 * graph.mass]
    } else if (a === 1 && b === -1) {
      ;[na, nb, change, massChange] = [0, 0, -1, -2 * graph.mass]
    } else {
      continue
    }

    const e = flux[l] ?? 0
    const cost = (mod3(e + change) !== 0 ? graph.tension : 0) - (mod3(e) !== 0 ? graph.tension : 0) + massChange
    const d = (demon[l] ?? 0) - cost

    if (d < 0 || d > graph.capacity) {
      continue
    }

    vibe[i] = na
    vibe[j] = nb
    flux[l] = e + change
    demon[l] = d

    if (onHop && massChange === 0) {
      onHop(a !== 0 ? i : j, a !== 0 ? j : i, l)
    }
  }
}

function copy(state: GraphState): GraphState {
  return { vibe: Int8Array.from(state.vibe), flux: Int32Array.from(state.flux), demon: Int32Array.from(state.demon) }
}

export function graphBeat(graph: StringGraph, state: GraphState, onHop?: (from: number, to: number, link: number) => void): GraphState {
  const out = copy(state)

  for (const matching of graph.matchings) {
    matchingStep(graph, out, matching, onHop)
  }

  const demon = Int32Array.from(out.demon)

  for (let l = 0; l < graph.links.length; l++) {
    out.demon[graph.next[l] ?? l] = demon[l] ?? 0
  }

  return out
}

export function graphBeatBack(graph: StringGraph, state: GraphState): GraphState {
  const out = copy(state)
  const demon = Int32Array.from(out.demon)

  for (let l = 0; l < graph.links.length; l++) {
    out.demon[graph.previous[l] ?? l] = demon[l] ?? 0
  }

  for (let k = graph.matchings.length - 1; k >= 0; k--) {
    matchingStep(graph, out, graph.matchings[k] ?? [])
  }

  return out
}
