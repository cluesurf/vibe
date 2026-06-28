// Conformance for code/substrate/coxeter/streaming-shell-count: breadth-first cell-shell counting over a
// {p,q,r,...} Coxeter cell graph without storing it. Shell 0 is the single root; shell 1 is the cell's
// coordination number (the facet count), which is independently known: 24 for the {3,4,3,4} D4 coin and 12
// for the {5,3,4} dodecahedron. Counts are EXACT integers; deeper shells must keep growing.

import { suite, check, equal, ok } from '@/test/code/harness'
import { streamingShellCounts } from '@/code/substrate/coxeter/streaming-shell-count'

suite('substrate/coxeter/streaming-shell-count: shell sizes', [
  check('{3,4,3,4} shell 1 is the 24-cell coordination number', () => {
    const counts = streamingShellCounts({ symbol: [3, 4, 3, 4], maxShell: 2 })
    equal(counts[0], 1, 'root shell')
    equal(counts[1], 24, 'degree 24 (D4 coin)')
    equal(counts.length, 3, 'three shells recorded')
    ok(counts[2]! > counts[1]!, 'shell 2 grows beyond shell 1')
  }),
  check('{5,3,4} shell 1 is the dodecahedron facet count', () => {
    const counts = streamingShellCounts({ symbol: [5, 3, 4], maxShell: 1 })
    equal(counts[0], 1, 'root shell')
    equal(counts[1], 12, 'degree 12 (dodecahedron faces)')
  }),
])
