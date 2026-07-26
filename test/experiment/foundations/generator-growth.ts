// Base-generator family C, the GROWTH seeds, the geometry from a running process. Three results: the dock is the
// optimal 4D kissing shell and nothing can be added to it (C2/C3, pass), but a generic deterministic energy
// minimization does NOT self-assemble the dock from a generic start (C2 tail, honest open, it traps near 55
// degrees), and a content-free graph rewrite gives a definite emergent geometry that is NOT the dock (C1, the
// long shot, honest open). Plan: theory-v0.8.0/plans/the-base-generator.md.
//
// WORDING CORRECTED. An earlier version of this file read the maximality result as showing that greedy densest
// growth is FORCED to the 24-coin. That inference does not follow: maximality is a property of the ANSWER, and
// forcing is a property of the PROCESS, and greedy insertion can jam at a maximal configuration strictly
// smaller than the optimum. E-FND-0077 runs the growth and finds exactly that, a terminal jam at the
// eight-direction cross-polytope under the most natural ordering. The maximality result below is unaffected and
// still passes. What changed is the sentence drawn from it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  rootsD4,
  ternaryShells,
  halfIntegerWeights,
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

// C2/C3, the packing optimum: the dock is a kissing configuration and no direction can be added to it. This is
// a MAXIMALITY result about the configuration, not a statement that a growth process arrives at it. See
// E-FND-0077 for the process question, where greedy growth is shown to jam below the dock under some orderings.
export default experiment({
  id: 'foundations/generator-packing-optimum',
  code: 'E-FND-0022',
  title:
    'the dock is the optimal 4D kissing shell and admits no 25th direction, including against half-integer candidates',
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
    // the integer shells PLUS the 16 half-integer directions. The half-integers matter: they are absent from an
    // integer-only candidate set, and they are exactly the directions that complete the 8 coordinate axes into a
    // 24-cell, so leaving them out would make this a weaker test than it appears (see E-FND-0077).
    const candidates = [
      ...(shells.get(1) ?? []),
      ...(shells.get(2) ?? []),
      ...(shells.get(3) ?? []),
      ...halfIntegerWeights(4),
    ]

    const cannotExtend = !canExtendKissing(dock, candidates, 60)
    const ok =
      dock.length === 24 && kissing && minAngle === 60 && cannotExtend

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 24 dock directions are a kissing configuration at 60 degrees and no further direction can be added at 60 degrees, over a candidate set that includes the half-integer directions as well as the integer shells, so the dock is a maximal densest local packing in four dimensions, which is a statement about the configuration and not about any process reaching it',
      metrics: {
        directions: dock.length,
        minAngleDegrees: minAngle,
        kissing: kissing ? 1 : 0,
      },
      notes:
        'the 4D kissing number is 24 (Musin); the no-25th check is over a dense deterministic candidate set, now including the 16 half-integer directions as well as the integer shells, which is a strictly stronger test than the integer-only set this originally used. Read this as MAXIMALITY only. An earlier wording concluded that greedy densest growth is therefore forced to the 24-coin, which does not follow, because greedy insertion can jam at a maximal configuration smaller than the optimum. E-FND-0077 runs the growth and finds a terminal jam at the 8-direction cross-polytope under nearest-first ordering over integer directions.',
    })
  },
})

// C2 tail, self-assembly: a generic deterministic start relaxed under a repulsive potential does NOT reach the
// dock (it traps near 55 degrees, not the 60 of the 24-cell, and the coordination is not 8-regular).
//
// This negative is CONTROLLED by E-FND-0078, which runs the same relaxer on the same schedule against five
// universally optimal targets and reaches four of them exactly, missing only the dock, and which shows the trap
// is stable under a sixteenfold step budget. Without that control this experiment alone could not distinguish a
// hard-to-reach dock from a weak optimizer. E-FND-0079 then measures the shape of the basin.
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
