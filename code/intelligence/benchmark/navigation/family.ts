/**
 * Benchmark family A, navigation on the mesh: every kind on every one of
 * the twelve lab geometries, at sizes small enough to solve exhaustively.
 *
 * Each geometry is built once, as an open ball at the largest radius any
 * kind needs, and the smaller balls are cut from it: a breadth-first
 * numbering lists the cells shell by shell, so the ball of a smaller radius
 * is a prefix of the cells, and its graph is the induced subgraph.
 *
 * Radii: the walking kinds (maze, obstacle, dynamic maze, tour) run on
 * balls of roughly 100 to 500 cells; token sliding and Sokoban, whose state
 * spaces grow as a power of the cell count, on balls of 6 to 70 cells. The
 * token balls of each degree-matched pair have equal or near cell counts
 * ({6,3} and {6,4} 7 each, {3,6} and {3,7} 10 each, {4,4} 13 and {4,5} 17).
 * {3,4,3,4} stops at radius 2, the float-safe limit of its builder.
 */

import {
  LAB_GEOMETRIES,
  labGeometry,
  type LabGeometry,
  type LabGeometryName,
} from '@/code/substrate/lab-geometry'
import { makeGraph } from '@/code/tool/graph'
import { dynamicMaze, type DynamicMaze } from '@/code/intelligence/benchmark/navigation/dynamic-maze'
import type { NavigationInstance } from '@/code/intelligence/benchmark/navigation/instance'
import { wallInstances } from '@/code/intelligence/benchmark/navigation/maze'
import { sokobanInstance } from '@/code/intelligence/benchmark/navigation/sokoban'
import { tokenInstance } from '@/code/intelligence/benchmark/navigation/token-sliding'
import { tourInstance } from '@/code/intelligence/benchmark/navigation/tour'

export interface FamilyRadii {
  walk: number
  tokens: number
  sokoban: number
}

export const FAMILY_RADII: Record<LabGeometryName, FamilyRadii> = {
  line: { walk: 12, tokens: 3, sokoban: 6 },
  '{4,4}': { walk: 8, tokens: 2, sokoban: 4 },
  '{6,3}': { walk: 7, tokens: 1, sokoban: 3 },
  '{3,6}': { walk: 8, tokens: 2, sokoban: 5 },
  '{5,4}': { walk: 4, tokens: 1, sokoban: 3 },
  '{7,3}': { walk: 4, tokens: 1, sokoban: 2 },
  '{8,3}': { walk: 3, tokens: 1, sokoban: 2 },
  '{3,4,3,4}': { walk: 2, tokens: 1, sokoban: 1 },
  '{4,5}': { walk: 5, tokens: 2, sokoban: 3 },
  '{6,4}': { walk: 4, tokens: 1, sokoban: 2 },
  '{3,7}': { walk: 8, tokens: 2, sokoban: 5 },
  '{3,4,3,3}': { walk: 2, tokens: 1, sokoban: 1 },
}

/** The ball of `radius` cut from a larger breadth-first-numbered ball. */
export function subBall(geometry: LabGeometry, radius: number): LabGeometry {
  if (radius === geometry.radius) {
    return geometry
  }
  if (radius > geometry.radius || geometry.boundary !== 'openBall') {
    throw new Error(`subBall: radius ${radius} is not inside an open ball of radius ${geometry.radius}`)
  }
  let size = 0
  while (size < geometry.graph.size && geometry.distance[size]! <= radius) {
    size++
  }
  for (let cell = size; cell < geometry.graph.size; cell++) {
    if (geometry.distance[cell]! <= radius) {
      throw new Error('subBall: the cells are not numbered shell by shell')
    }
  }
  const neighbors = Array.from({ length: size }, (_, cell) =>
    Array.from(geometry.graph.neighbors[cell]!).filter(next => next < size),
  )
  return {
    spec: geometry.spec,
    boundary: 'openBall',
    radius,
    graph: makeGraph({ size, directed: false, neighbors }),
    distance: geometry.distance.slice(0, size),
    shellSizes: geometry.shellSizes.slice(0, radius + 1),
    patchCells: geometry.patchCells,
  }
}

export interface FamilyGeometry {
  name: LabGeometryName
  walk: LabGeometry
  tokens: LabGeometry
  sokoban: LabGeometry
}

export function familyGeometries(names?: readonly LabGeometryName[]): FamilyGeometry[] {
  return LAB_GEOMETRIES.filter(spec => names === undefined || names.includes(spec.name)).map(spec => {
    const radii = FAMILY_RADII[spec.name]
    const top = Math.max(radii.walk, radii.tokens, radii.sokoban)
    const ball = labGeometry({ name: spec.name, boundary: 'openBall', radius: top })
    return {
      name: spec.name,
      walk: subBall(ball, radii.walk),
      tokens: subBall(ball, radii.tokens),
      sokoban: subBall(ball, radii.sokoban),
    }
  })
}

export interface Family {
  instances: NavigationInstance[]
  dynamic: DynamicMaze[]
}

/** Every instance of the family on the given geometries (all twelve by default). */
export function navigationFamily(names?: readonly LabGeometryName[]): Family {
  const instances: NavigationInstance[] = []
  const dynamic: DynamicMaze[] = []
  for (const geometry of familyGeometries(names)) {
    instances.push(...wallInstances(geometry.walk, 'maze'))
    instances.push(...wallInstances(geometry.walk, 'obstacle'))
    const moving = dynamicMaze(geometry.walk)
    dynamic.push(moving)
    instances.push(moving.instance)
    instances.push(tokenInstance(geometry.tokens))
    instances.push(sokobanInstance(geometry.sokoban))
    instances.push(tourInstance(geometry.walk))
  }
  return { instances, dynamic }
}
