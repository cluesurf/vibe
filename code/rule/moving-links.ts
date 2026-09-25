// Roles on moving links: the color weave with links that evolve, by a rule that keeps every frame change a
// symmetry, reverses exactly, and conserves the links' energy to the unit.
//
// Step 2 of the path in note/experiment/gauge/what-the-base-needs. The color weave's links are grid moves
// fixed for the run. The deterministic sampler of E-FRC-0110 moves Sigma(648) links, but it steps a link
// to the next admissible element in the group's index order, which no frame change respects: its ensemble
// is frame-free, its steps are not. So the links here move by a reflection instead.
//
// A triangle of the D4 lattice is three roots summing to zero, a closed loop x -> x+a -> x+a+b -> x. Its
// transport is T = g_c g_b g_a (grid moves composed along the loop), and its energy is 9 minus the number
// of grid points T leaves in place, a class function that is 0 exactly for the identity (in Sigma(648)
// terms 9 - |Tr U|^2). Reflecting link U = g_a through the staple A = g_c g_b of one triangle,
//
//   U' = A^-1 U^-1 A^-1,
//
// sends that triangle's transport to its inverse, which has the same fixed points, so its energy is kept.
// The other triangles through the link change, so the reflection is taken only where it leaves the sum of
// the energies of every triangle through the link unchanged. The step is its own inverse (the condition
// reads the same from either side), a frame change h conjugates it into h U' h^-1 (covariant), and no
// triangle holds two links of one line, so every link of one direction reflects at once. The link back
// along the line always holds the inverse.
//
// A beat: the color weave's matter beat on the current links, then one reflection sub-step per direction
// line, each through the next triangle type in a fixed rotation. Backward: the sub-steps in reverse order,
// then the matter beat backward. Links do not read the matter: there is no back-reaction, so this carries
// roles on moving links but does not make matter pull on them.

import { colorBeat, colorBeatBack, type ColorWeave } from '@/code/rule/color-weave'
import { type VibeState } from '@/code/rule/vibe-weave'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { zeroSumTriangles } from '@/code/measure/collision-anatomy'

export type MovingLinks = {
  readonly weave: ColorWeave
  // for each direction, the (b, c) pairs completing a triangle x -> x+a -> x+a+b -> x
  readonly staples: readonly (readonly (readonly [number, number])[])[]
  // the energy level of each grid move, 9 minus its fixed points
  readonly level: Int8Array
}

export type LinkState = VibeState & { readonly links: Int16Array }

export function makeMovingLinks(weave: ColorWeave): MovingLinks {
  const roots = rootsD4()
  const staples: [number, number][][] = Array.from({ length: 24 }, () => [])

  // every ordered way round each zero-sum triangle: a first, then b, then c
  for (const [p, q, r] of zeroSumTriangles({ directions: roots })) {
    const t = [p ?? 0, q ?? 0, r ?? 0]

    for (const [a, b, c] of [
      [t[0], t[1], t[2]],
      [t[0], t[2], t[1]],
      [t[1], t[0], t[2]],
      [t[1], t[2], t[0]],
      [t[2], t[0], t[1]],
      [t[2], t[1], t[0]],
    ] as [number, number, number][]) {
      staples[a]?.push([b, c])
    }
  }

  const level = Int8Array.from(weave.moves.act, table => 9 - table.reduce((n, image, point) => n + (image === point ? 1 : 0), 0))

  return { weave, staples, level }
}

// the transport round the triangle x -a-> x+a -b-> x+a+b -c-> x, with link u in place of (x, a)
function triangle(input: { moving: MovingLinks; links: Int16Array; x: number; a: number; b: number; c: number; u: number }): number {
  const { moving, links, x, a, b, c, u } = input
  const { mesh, moves } = moving.weave
  const y = mesh.neighbour(x, a)
  const z = mesh.neighbour(y, b)
  const gb = links[y * 24 + b] ?? moves.identity
  const gc = links[z * 24 + c] ?? moves.identity

  return moves.compose(gc, moves.compose(gb, u))
}

// the summed energy of every triangle through link (x, a) with u in its place, both ways round each
function localEnergy(input: { moving: MovingLinks; links: Int16Array; x: number; a: number; u: number }): number {
  const { moving, links, x, a, u } = input

  let total = 0

  for (const [b, c] of moving.staples[a] ?? []) {
    total += moving.level[triangle({ moving, links, x, a, b, c, u })] ?? 0
  }

  return total
}

// one reflection sub-step on every link of direction a, through the triangle type `type`: an involution
function reflect(input: { moving: MovingLinks; links: Int16Array; a: number; type: number }): number {
  const { moving, links, a, type } = input
  const { mesh, moves, opposite } = moving.weave
  const pairs = moving.staples[a] ?? []
  const [b, c] = pairs[type % pairs.length] ?? [0, 0]
  const updates: [number, number][] = []

  for (let x = 0; x < mesh.cellCount; x++) {
    const u = links[x * 24 + a] ?? moves.identity
    const y = mesh.neighbour(x, a)
    const z = mesh.neighbour(y, b)
    // the staple from x+a back to x
    const staple = moves.compose(links[z * 24 + c] ?? moves.identity, links[y * 24 + b] ?? moves.identity)
    const inverse = moves.inverse[staple] ?? moves.identity
    const next = moves.compose(inverse, moves.compose(moves.inverse[u] ?? moves.identity, inverse))

    if (next !== u && localEnergy({ moving, links, x, a, u: next }) === localEnergy({ moving, links, x, a, u })) {
      updates.push([x, next])
    }
  }

  for (const [x, next] of updates) {
    links[x * 24 + a] = next
    links[mesh.neighbour(x, a) * 24 + (opposite[a] ?? a)] = moves.inverse[next] ?? moves.identity
  }

  return updates.length
}

// the sub-steps of beat t: one per line, first direction of each, through a rotating triangle type
function schedule(moving: MovingLinks, t: number): [number, number][] {
  return moving.weave.lines.map(([a], k) => [a, t + k])
}

export function movingBeat(moving: MovingLinks, state: LinkState, t: number): { state: LinkState; moved: number } {
  const matter = colorBeat({ ...moving.weave, links: state.links }, state, t)
  const links = Int16Array.from(state.links)

  let moved = 0

  for (const [a, type] of schedule(moving, t)) {
    moved += reflect({ moving, links, a, type })
  }

  return { state: { ...matter, links }, moved }
}

export function movingBeatBack(moving: MovingLinks, state: LinkState, t: number): LinkState {
  const links = Int16Array.from(state.links)

  for (const [a, type] of [...schedule(moving, t)].reverse()) {
    reflect({ moving, links, a, type })
  }

  return { ...colorBeatBack({ ...moving.weave, links }, state, t), links }
}

// the total energy of every triangle on the lattice, each counted once per ordered traversal
export function linkEnergy(moving: MovingLinks, links: Int16Array): number {
  let total = 0

  for (let x = 0; x < moving.weave.mesh.cellCount; x++) {
    for (let a = 0; a < 24; a++) {
      for (const [b, c] of moving.staples[a] ?? []) {
        total += moving.level[triangle({ moving, links, x, a, b, c, u: links[x * 24 + a] ?? moving.weave.moves.identity })] ?? 0
      }
    }
  }

  return total
}
