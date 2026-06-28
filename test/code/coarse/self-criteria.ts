// Conformance for code/coarse/self-criteria: the Markov-blanket statistical primitives. Pearson
// correlation is +-1 for perfectly (anti)aligned series and 0 for a constant; blanket screening is
// 1 when the shell fully determines interior and exterior (the clean blanket) and 0 when the shell
// is uninformative; the region partition splits a cluster into interior/shell/exterior by adjacency;
// and BFS distances grow by one per hop. All re-derived by hand.

import { suite, check, equal, close, exactArray } from '@/test/code/harness'
import {
  correlation,
  blanketScreening,
  regionPartition,
  distancesFrom,
  type Graph,
} from '@/code/coarse/self-criteria'

const TOL = 1e-9

// A CSR chain 0-1-2-3-4, the same shape used by the macro-unit conformance.
const chain: Graph = {
  cellCount: 5,
  offsets: Int32Array.from([0, 1, 3, 5, 7, 8]),
  adj: Int32Array.from([1, 0, 2, 1, 3, 2, 4, 3]),
}

suite('coarse/self-criteria: correlation', [
  check('a perfectly aligned pair correlates +1', () => {
    close(correlation([1, 2, 3], [2, 4, 6]), 1, TOL)
  }),
  check('a perfectly anti-aligned pair correlates -1', () => {
    close(correlation([1, 2, 3], [3, 2, 1]), -1, TOL)
  }),
  check('a constant series correlates 0', () => {
    close(correlation([1, 2, 3], [5, 5, 5]), 0, TOL)
  }),
])

suite('coarse/self-criteria: blanket screening', [
  // interior, exterior, shell all equal: the shell fully determines both, partial correlation
  // collapses to 0, reduction = (1 - 0)/1 = 1 (a clean blanket).
  check('a determining shell fully screens (reduction 1)', () => {
    const r = blanketScreening({
      interior: [1, 2, 3, 4],
      shell: [1, 2, 3, 4],
      exterior: [1, 2, 3, 4],
    })
    close(r.raw, 1, TOL)
    close(r.reduction, 1, TOL)
  }),
  // A constant (uninformative) shell screens nothing: its correlations are 0, so the partial equals
  // the raw and reduction = 0.
  check('an uninformative shell screens nothing (reduction 0)', () => {
    const r = blanketScreening({
      interior: [1, 2, 3, 4],
      shell: [7, 7, 7, 7],
      exterior: [1, 2, 3, 4],
    })
    close(r.raw, 1, TOL)
    close(r.screened, 1, TOL)
    close(r.reduction, 0, TOL)
  }),
])

suite('coarse/self-criteria: region partition and distances', [
  // The whole chain: every neighbor of every cell is in the set, so all interior, no shell/exterior.
  check('a full cluster is all interior', () => {
    const p = regionPartition({ cluster: [0, 1, 2, 3, 4], graph: chain })
    exactArray(p.interior.slice().sort((a, b) => a - b), [0, 1, 2, 3, 4])
    equal(p.shell.length, 0)
    equal(p.exterior.length, 0)
  }),
  // Sub-chain {1,2,3}: cell 2 is interior (1,3 both inside), 1 and 3 are shell (touch 0 and 4),
  // exterior is {0,4}.
  check('a sub-chain splits into interior, shell, exterior', () => {
    const p = regionPartition({ cluster: [1, 2, 3], graph: chain })
    exactArray(p.interior, [2])
    exactArray(p.shell.slice().sort((a, b) => a - b), [1, 3])
    exactArray(p.exterior.slice().sort((a, b) => a - b), [0, 4])
  }),
  check('BFS distances grow by one per hop', () => {
    const d = distancesFrom({ graph: chain, source: 0 })
    exactArray(d, [0, 1, 2, 3, 4])
  }),
])
