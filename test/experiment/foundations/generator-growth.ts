// Base-generator family C, the GROWTH seeds, the geometry from a running process. Three results: the dock is the
// optimal 4D kissing shell so greedy densest growth is FORCED to it (C2/C3, pass), but a generic deterministic
// energy minimization does NOT self-assemble the dock from a generic start (C2 tail, honest open, it traps near
// 55 degrees), and a content-free graph rewrite gives a definite emergent geometry that is NOT the dock (C1, the
// long shot, honest open). Plan: theory-v0.8.0/plans/the-base-generator.md.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  rootsD4,
  ternaryShells,
} from '@/code/algebra/group/root-system'
import {
  isKissingConfiguration,
  maxPairwiseCosine,
  canExtendKissing,
  coordinationAtMinAngle,
  deterministicSpiral,
  relaxRiesz,
} from '@/code/geometry/packing'
import {
  gridRefinementRewrite,
  bulkDegree,
} from '@/code/substrate/graph-rewrite'
import { ballGrowthDimension } from '@/code/measure/dimension'

const cosToDeg = (c: number) =>
  Math.round((Math.acos(Math.min(1, c)) * 180) / Math.PI)

// C2/C3, the packing optimum: the dock is a kissing configuration and no direction can be added, so greedy
// densest growth is forced to the 24-coin.
export default experiment({
  id: 'foundations/generator-packing-optimum',
  title:
    'the dock is the optimal 4D kissing shell, so densest growth is forced to the 24 directions',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const dock = rootsD4()
    const kissing = isKissingConfiguration(dock, 60)
    const minAngle = cosToDeg(maxPairwiseCosine(dock)) // 60 for the dock
    // a dense deterministic candidate set: all small lattice and half-integer directions
    const shells = ternaryShells(4)
    const candidates = [
      ...(shells.get(1) ?? []),
      ...(shells.get(2) ?? []),
      ...(shells.get(3) ?? []),
    ]
    const cannotExtend = !canExtendKissing(dock, candidates, 60)
    const ok =
      dock.length === 24 && kissing && minAngle === 60 && cannotExtend
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 24 dock directions are a kissing configuration at 60 degrees and no further direction can be added at 60 degrees, so the densest local packing in four dimensions is forced to the 24-coin',
      metrics: {
        directions: dock.length,
        minAngleDegrees: minAngle,
        kissing: kissing ? 1 : 0,
      },
      notes:
        'the 4D kissing number is 24 (Musin); the no-25th check is over a dense deterministic candidate set',
    })
  },
})

// C2 tail, self-assembly: a generic deterministic start relaxed under a repulsive potential does NOT reach the
// dock (it traps near 55 degrees, not the 60 of the 24-cell, and the coordination is not 8-regular).
experiment({
  id: 'foundations/generator-self-assembly',
  title:
    'a generic start does not self-assemble the dock under local energy minimization (honest open)',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const start = deterministicSpiral(24, 4) // deterministic golden-ratio spiral, generic, not the dock
    const startMinAngle = cosToDeg(maxPairwiseCosine(start))
    const relaxed = relaxRiesz(start, {
      steps: 6000,
      powerStart: 0.5,
      powerEnd: 4,
      stepSize: 0.01,
    })
    const relaxedMinAngle = cosToDeg(maxPairwiseCosine(relaxed))
    const coordination = coordinationAtMinAngle(relaxed)
    const eightRegular =
      Object.keys(coordination).length === 1 && coordination[8] === 24
    const reachedDock = relaxedMinAngle >= 60 && eightRegular
    return verdict({
      status: reachedDock ? 'pass' : 'open',
      claim:
        'a deterministic generic configuration relaxed under a repulsive potential improves but does NOT reach the 24-cell, it traps below 60 degrees and is not 8-regular, so local minimization does not self-assemble the dock (the optimum exists, it is just not basin-dominating)',
      metrics: {
        startMinAngleDegrees: startMinAngle,
        relaxedMinAngleDegrees: relaxedMinAngle,
        targetDegrees: 60,
        eightRegular: eightRegular ? 1 : 0,
      },
    })
  },
})

// C1, the graph-rewrite long shot: a content-free deterministic rewrite gives a definite emergent geometry that
// is NOT the 4D 24-regular dock.
experiment({
  id: 'foundations/generator-graph-rewrite',
  title:
    'a content-free graph rewrite gives a definite geometry but not the dock (the long shot, honest open)',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const graph = gridRefinementRewrite(5)
    const centers = [Math.floor(graph.nodeCount / 2)] // a deterministic interior center
    const dimension = ballGrowthDimension({
      neighbors: graph.neighbors,
      centers,
      maxRadius: 8,
    })
    const degree = bulkDegree(graph)
    const reproducesDock =
      Math.abs(dimension - 4) < 0.3 && degree === 24
    return verdict({
      status: reproducesDock ? 'pass' : 'open',
      claim:
        'a simple deterministic graph rewrite grows a definite emergent geometry (here low-dimensional, bulk degree four), which is NOT the four-dimensional 24-regular dock, so a content-free rewrite does not force the 24-cell',
      metrics: {
        emergentDimension: Math.round(dimension * 100) / 100,
        bulkDegree: degree,
        targetDimension: 4,
        targetDegree: 24,
      },
    })
  },
})
