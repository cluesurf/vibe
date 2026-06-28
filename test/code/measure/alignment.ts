// Conformance for code/measure/alignment. Coherence is the mean edge tone product (Ising order
// parameter), conflict is the fraction of opposed nonzero edges, and decisiveness is the mean
// normalized magnitude of the parts' summed tone. Each is hand-derived.

import { suite, check, equal, close } from '@/test/code/harness'
import {
  coherenceOrder,
  conflictFraction,
  pairConflict,
  meanPairwiseConflict,
  decisiveness,
} from '@/code/measure/alignment'

const TOL = 1e-12

suite('measure/alignment: coherenceOrder', [
  check('fully agreeing edge reads +1', () => {
    equal(coherenceOrder(Int8Array.from([1, 1]), [[0, 1]]), 1)
  }),
  check('opposed edge reads -1', () => {
    equal(coherenceOrder(Int8Array.from([1, -1]), [[0, 1]]), -1)
  }),
  check('mixed edges average', () => {
    // tone=[1,1,-1], edges (0,1)->+1, (1,2)->-1 -> mean 0.
    equal(coherenceOrder(Int8Array.from([1, 1, -1]), [[0, 1], [1, 2]]), 0)
  }),
  check('no edges gives 0', () => {
    equal(coherenceOrder(Int8Array.from([1, -1]), []), 0)
  }),
])

suite('measure/alignment: conflict', [
  check('fraction of opposed nonzero edges', () => {
    // tone=[1,-1,1], edges (0,1) opposed, (1,2) opposed, (0,2) agreeing -> 2/3.
    close(
      conflictFraction(Int8Array.from([1, -1, 1]), [[0, 1], [1, 2], [0, 2]]),
      2 / 3,
      TOL,
    )
  }),
  check('pairConflict counts opposed sites', () => {
    // a=[1,1,-1], b=[-1,1,1]: opposed at 0 and 2 -> 2/3.
    close(
      pairConflict(Int8Array.from([1, 1, -1]), Int8Array.from([-1, 1, 1])),
      2 / 3,
      TOL,
    )
  }),
  check('meanPairwiseConflict over the parts', () => {
    // parts [1],[-1],[1]: pair conflicts 1,0,1 -> mean 2/3.
    close(
      meanPairwiseConflict([
        Int8Array.from([1]),
        Int8Array.from([-1]),
        Int8Array.from([1]),
      ]),
      2 / 3,
      TOL,
    )
  }),
])

suite('measure/alignment: decisiveness', [
  check('unanimous parts are fully decisive', () => {
    equal(decisiveness([Int8Array.from([1, 1]), Int8Array.from([1, 1])]), 1)
  }),
  check('partly cancelling parts read the mean magnitude', () => {
    // parts [1,1],[1,-1]: site0 sum 2 -> |2|/2=1, site1 sum 0 -> 0; mean 0.5.
    close(
      decisiveness([Int8Array.from([1, 1]), Int8Array.from([1, -1])]),
      0.5,
      TOL,
    )
  }),
])
