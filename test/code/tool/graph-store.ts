// Conformance for code/tool/graph-store: the binary persistence format for a CSR cell graph and a tone state.
// The load-bearing property is an exact byte-layout round-trip: load(save(x)) === x, including the int32 header,
// the (cellCount+1) offset words, the adjacency words, and signed int8 tones. A bug in any offset arithmetic
// corrupts the reload, so we check the recovered arrays element for element (exact, integers).

import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { suite, check, equal, exactArray } from '@/test/code/harness'
import {
  StoredGraph,
  saveGraph,
  loadGraph,
  saveState,
  loadState,
} from '@/code/tool/graph-store'

const dir = mkdtempSync(join(tmpdir(), 'graph-store-'))

// A tiny CSR graph: 3 cells, adjacency 0->{1,2}, 1->{2}, 2->{} (offsets are cumulative counts).
const graph: StoredGraph = {
  cellCount: 3,
  offsets: Int32Array.from([0, 2, 3, 3]),
  adj: Int32Array.from([1, 2, 2]),
}

suite('tool/graph-store: graph round-trip', [
  check('loadGraph recovers exactly what saveGraph wrote', () => {
    const path = join(dir, 'g.bin')

    saveGraph(path, graph)

    const back = loadGraph(path)

    equal(back.cellCount, graph.cellCount, 'cellCount')
    exactArray(back.offsets, graph.offsets, 'offsets')
    exactArray(back.adj, graph.adj, 'adj')
  }),
  check(
    'an empty-adjacency graph round-trips (no off-by-one on adjLen 0)',
    () => {
      const empty: StoredGraph = {
        cellCount: 2,
        offsets: Int32Array.from([0, 0, 0]),
        adj: Int32Array.from([]),
      }

      const path = join(dir, 'empty.bin')

      saveGraph(path, empty)

      const back = loadGraph(path)

      equal(back.cellCount, 2, 'cellCount')
      exactArray(back.offsets, empty.offsets, 'offsets')
      equal(back.adj.length, 0, 'no adjacency')
    },
  ),
])

suite('tool/graph-store: state round-trip', [
  check('loadState recovers signed tones exactly', () => {
    const tone = Int8Array.from([-1, 0, 1, 1, -1, 0])
    const path = join(dir, 's.bin')

    saveState(path, tone)

    const back = loadState(path)

    equal(back.length, tone.length, 'length')
    exactArray(back, tone, 'tones including the negatives')
  }),
])
