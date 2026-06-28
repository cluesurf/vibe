// Conformance for code/check/structure: the localization measures the lattice-gas experiments read off a will.
// occupiedSet/occupiedCells flag cells with any nonzero slot, componentCount counts mesh-connected clusters,
// diameter/travelDistance are graph distances, and momentum is the tone-weighted vector sum of direction roots.
// We build wills with a known geometry on the square mesh and re-derive every count and vector by hand.

import { suite, check, equal } from '@/test/code/harness'
import { squareMesh } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import {
  occupiedCells,
  componentCount,
  diameter,
  travelDistance,
  momentum,
} from '@/code/check/structure'

const SIDE = 5
const mesh = squareMesh({ side: SIDE })
// cell index = y * side + x. Direction order: 0 +x, 1 -x, 2 +y, 3 -y.

// Place a tone in one (cell, direction) slot.
function place(will: Will, cell: number, direction: number, tone: number): void {
  will.data[cell * mesh.degree + direction] = tone
}

// 4D roots aligned to the square mesh directions, so momentum is hand-computable.
const squareRoots = [
  [1, 0, 0, 0],
  [-1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, -1, 0, 0],
]

suite('check/structure: occupancy and components', [
  check('two adjacent occupied cells form one cluster', () => {
    const will = makeWill(mesh)
    place(will, 0, 0, 1) // cell 0
    place(will, 1, 0, 1) // cell 1 = neighbour of 0 along +x
    equal(occupiedCells(will), 2, 'two cells hold charge')
    equal(componentCount(will), 1, 'they touch, so one cluster')
    equal(diameter(will), 1, 'one hop apart')
  }),
  check('two far-apart occupied cells form two clusters', () => {
    const will = makeWill(mesh)
    place(will, 0, 0, 1) // (0,0)
    place(will, 12, 0, 1) // (2,2), not adjacent to (0,0)
    equal(occupiedCells(will), 2, 'two cells hold charge')
    equal(componentCount(will), 2, 'separated, so two clusters')
  }),
  check('an empty will has zero occupancy and zero components', () => {
    const will = makeWill(mesh)
    equal(occupiedCells(will), 0, 'nothing occupied')
    equal(componentCount(will), 0, 'no clusters')
    equal(diameter(will), 0, 'no spread')
  }),
])

suite('check/structure: travel distance', [
  check('travelDistance is the farthest charged cell from the start', () => {
    const will = makeWill(mesh)
    place(will, 0, 0, 1) // cell 0, distance 0 from start 0
    place(will, 1, 0, 1) // cell 1, distance 1
    equal(travelDistance({ will, start: 0 }), 1, 'reaches one hop out')
  }),
])

suite('check/structure: momentum is the tone-weighted root sum', [
  check('a single +1 along +x has momentum (1,0,0,0)', () => {
    const will = makeWill(mesh)
    place(will, 0, 0, 1)
    equal(JSON.stringify(momentum(will, squareRoots)), JSON.stringify([1, 0, 0, 0]))
  }),
  check('+x and +y tones add their roots: (1,1,0,0)', () => {
    const will = makeWill(mesh)
    place(will, 0, 0, 1)
    place(will, 0, 2, 1)
    equal(JSON.stringify(momentum(will, squareRoots)), JSON.stringify([1, 1, 0, 0]))
  }),
  check('a -1 tone along +x reverses the contribution: (-1,0,0,0)', () => {
    const will = makeWill(mesh)
    place(will, 3, 0, -1)
    equal(JSON.stringify(momentum(will, squareRoots)), JSON.stringify([-1, 0, 0, 0]))
  }),
  check('opposite directions with equal tone cancel to zero momentum', () => {
    const will = makeWill(mesh)
    place(will, 0, 0, 1) // +x
    place(will, 0, 1, 1) // -x
    equal(JSON.stringify(momentum(will, squareRoots)), JSON.stringify([0, 0, 0, 0]))
  }),
])
