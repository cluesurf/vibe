// Conformance for code/measure/fill-coherence. A fill is satisfied when a sharing fill (+1) joins
// equal nonzero tones, a polarizing fill (-1) joins opposite nonzero tones, and an insulating fill
// (0) touches a peace (zero) endpoint. We hand-check the satisfied fraction, the Hebbian fill update,
// and the largest sharing-bound same-sign patch.

import { suite, check, equal, close, exactArray } from '@/test/code/harness'
import {
  fillCoherence,
  adaptFills,
  largestSharingPatch,
} from '@/code/measure/fill-coherence'

const TOL = 1e-12

suite('measure/fill-coherence: fillCoherence', [
  check('all-satisfied configuration scores 1', () => {
    // tone=[1,1,-1,0]; edges (0,1) share equal +1, (2,3) insulate via tone[3]=0, (0,2) polarize opposite.
    const tone = Int8Array.from([1, 1, -1, 0])
    const edges: [number, number][] = [[0, 1], [2, 3], [0, 2]]
    const fill = Int8Array.from([1, 0, -1])
    close(fillCoherence(tone, edges, fill), 1, TOL)
  }),
  check('a wrong fill drops the fraction', () => {
    // edge (0,1) now carries -1 (wants opposite) but tones are equal -> unsatisfied -> 2/3.
    const tone = Int8Array.from([1, 1, -1, 0])
    const edges: [number, number][] = [[0, 1], [2, 3], [0, 2]]
    const fill = Int8Array.from([-1, 0, -1])
    close(fillCoherence(tone, edges, fill), 2 / 3, TOL)
  }),
])

suite('measure/fill-coherence: adaptFills', [
  check('fills learn the tone relationship of their endpoints', () => {
    // tone=[1,1,-1,0]; edge (0,1) equal -> +1; (0,2) opposite -> -1; (0,3) touches zero -> 0.
    const tone = Int8Array.from([1, 1, -1, 0])
    const edges: [number, number][] = [[0, 1], [0, 2], [0, 3]]
    const fill = new Int8Array(3)
    adaptFills(tone, edges, fill)
    exactArray(fill, [1, -1, 0])
  }),
])

suite('measure/fill-coherence: largestSharingPatch', [
  check('largest same-sign domain joined by sharing fills', () => {
    // tone=[1,1,1,-1]; sharing chain 0-1-2 (all +1) is a patch of 3; cell 3 (-1) is alone.
    const tone = Int8Array.from([1, 1, 1, -1])
    const edges: [number, number][] = [[0, 1], [1, 2], [2, 3]]
    const fill = Int8Array.from([1, 1, 1])
    equal(largestSharingPatch(tone, edges, fill, 4), 3)
  }),
  check('non-sharing fills do not grow a patch', () => {
    // all fills polarizing -> no union -> each nonzero cell is its own patch of size 1.
    const tone = Int8Array.from([1, 1, 1])
    const edges: [number, number][] = [[0, 1], [1, 2]]
    const fill = Int8Array.from([-1, -1])
    equal(largestSharingPatch(tone, edges, fill, 3), 1)
  }),
])
