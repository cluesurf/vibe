// Conformance for code/dynamics/renormalization-blocks: block constructions for real-space RG.
// Invariants:
//   - csrVoronoiBlocks and geometricBlocks PARTITION the graph: every cell gets a block index in range.
//   - domainBlocks are internally UNIFORM: every cell in a block carries the same tone.
//   - coherentFills are SYMMETRIC: the two half-edges of an undirected edge carry the same fill.
//   - DETERMINISM under a fixed seed.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  csrVoronoiBlocks,
  geometricBlocks,
  domainBlocks,
  coherentFills,
} from '@/code/dynamics/renormalization-blocks'
import { makeGraph, Graph } from '@/code/tool/graph'
import { makeRng } from '@/code/tool/rng'

const N = 60

function ring(): { g: Graph; offsets: Int32Array; adj: Int32Array } {
  const neighbors = Array.from({ length: N }, (_, i) => [
    (i - 1 + N) % N,
    (i + 1) % N,
  ])

  const g = makeGraph({ size: N, directed: false, neighbors })
  const offsets = new Int32Array(N + 1)
  const adj = new Int32Array(2 * N)

  for (let i = 0; i < N; i++) {
    offsets[i] = 2 * i
    adj[2 * i] = (i - 1 + N) % N
    adj[2 * i + 1] = (i + 1) % N
  }

  offsets[N] = 2 * N

  return { g, offsets, adj }
}

suite('dynamics/renormalization-blocks: partition validity', [
  check('csrVoronoiBlocks assigns every cell a block in range', () => {
    const { offsets, adj } = ring()
    const { blockOf, numBlocks } = csrVoronoiBlocks({
      offsets,
      adj,
      size: N,
      targetSize: 6,
      rng: makeRng({ seed: 1 }),
    })

    for (let c = 0; c < N; c++)
      {ok(
        blockOf[c]! >= 0 && blockOf[c]! < numBlocks,
        `cell ${c} in range`,
      )}
  }),
  check('geometricBlocks assigns every cell a block', () => {
    const { g } = ring()
    const { cl, K } = geometricBlocks(g, 6, makeRng({ seed: 2 }))
    ok(K >= 2, 'at least two blocks')

    for (let c = 0; c < N; c++)
      {ok(cl[c]! >= 0 && cl[c]! < K, `cell ${c} assigned`)}
  }),
])

suite(
  'dynamics/renormalization-blocks: domain uniformity and fill symmetry',
  [
    check('domainBlocks are internally uniform in tone', () => {
      const { g } = ring()
      const tone = Int8Array.from({ length: N }, (_, i) =>
        Math.floor(i / 7) % 2 === 0 ? 1 : -1,
      )

      const { cl, K } = domainBlocks(g, tone)
      const blockTone = new Map<number, number>()

      for (let c = 0; c < N; c++) {
        const b = cl[c]!

        if (blockTone.has(b))
          {equal(blockTone.get(b)!, tone[c]!, `block ${b} uniform`)}
        else {blockTone.set(b, tone[c]!)}
      }

      ok(K >= 2, 'multiple domains')
    }),
    check('coherentFills are symmetric across each edge', () => {
      const { g } = ring()
      const fills = coherentFills(g, 0.7, makeRng({ seed: 3 }))

      for (let v = 0; v < N; v++) {
        const row = g.neighbors[v]!

        for (let k = 0; k < row.length; k++) {
          const w = row[k]!
          const kk = g.neighbors[w]!.indexOf(v)
          equal(
            fills[v]![k]!,
            fills[w]![kk]!,
            `edge ${v}-${w} symmetric`,
          )
        }
      }
    }),
  ],
)

suite('dynamics/renormalization-blocks: determinism', [
  check('csrVoronoiBlocks is reproducible under a fixed seed', () => {
    const { offsets, adj } = ring()
    const a = csrVoronoiBlocks({
      offsets,
      adj,
      size: N,
      targetSize: 6,
      rng: makeRng({ seed: 9 }),
    }).blockOf

    const b = csrVoronoiBlocks({
      offsets,
      adj,
      size: N,
      targetSize: 6,
      rng: makeRng({ seed: 9 }),
    }).blockOf

    for (let c = 0; c < N; c++) {equal(a[c]!, b[c]!, `cell ${c}`)}
  }),
])
