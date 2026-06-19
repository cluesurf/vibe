// Cohesive-memory retention on a stored graph. Warm the tone field to its dynamic steady state, imprint
// a BFS-ball "pleasure" blob (set the ball tones to +1), run more beats, then measure how much of the
// blob survives above the background: (mean-blob-after - background) / (mean-blob-at-imprint -
// background). A value near one means the imprint persisted, near zero means it eroded into the
// background. The beat is the cohesive edge sweep (annihilating, with a temperature escape) or the plain
// conserving edge sweep, selected by `cohesive`. RNG seeds are fixed inside (warm seed 9, run seed 31),
// so the retention is a deterministic property of the graph and the rule.

import { csrBallNodes } from '@/code/tool/graph'
import { perceptionEdgeBeat } from '@/code/dynamics/perception-edge-beat'
import { makeRng } from '@/code/tool/rng'

type StoredGraph = {
  cellCount: number
  offsets: Int32Array
  adj: Int32Array
}

export function imprintRetention(input: {
  graph: StoredGraph
  eu: Int32Array
  ev: Int32Array
  cohesive: boolean
  blobSize: number
}): number {
  const { graph: g, eu, ev, cohesive, blobSize } = input
  const n = g.cellCount
  const tone = new Int8Array(n)
  const moved = new Uint8Array(n)
  const rngWarm = makeRng({ seed: 9 })
  for (let b = 0; b < 30; b++)
    perceptionEdgeBeat({
      tone,
      eu,
      ev,
      offsets: g.offsets,
      adj: g.adj,
      moved,
      rng: rngWarm,
      arrow: 0.05,
      cohesive,
      temperature: 0.02,
    })
  const blob = csrBallNodes({
    offsets: g.offsets,
    adj: g.adj,
    size: n,
    source: 0,
    limit: blobSize,
  })
  for (const i of blob) tone[i] = 1
  const meanBlob = (): number =>
    blob.reduce((s, i) => s + tone[i]!, 0) / blob.length
  const start = meanBlob()
  const rng2 = makeRng({ seed: 31 })
  for (let b = 0; b < 30; b++)
    perceptionEdgeBeat({
      tone,
      eu,
      ev,
      offsets: g.offsets,
      adj: g.adj,
      moved,
      rng: rng2,
      arrow: 0.05,
      cohesive,
      temperature: 0.02,
    })
  const after = meanBlob()
  let bg = 0
  for (let i = 0; i < n; i++) bg += tone[i]!
  bg /= n
  return (after - bg) / (start - bg || 1)
}
