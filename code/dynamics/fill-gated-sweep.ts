import { Rng } from '@/code/tool/rng'

// One beat of the conserved exchange on a ternary tone field with per-EDGE fills (the
// perception substrate where the note carries a fill state). Each edge i carries a
// fill in {-1, 0, +1} that GATES the local move on its endpoints' tones, conserving
// every pair sum:
//   fill -1 (polarizing): two peaceful endpoints polarize to (+1, -1) half the time,
//   fill +1 (sharing): an opposite pair annihilates, a charge-next-to-peace hops half the time,
//   fill 0 (insulating): inert.
// `edges[i] = [v, w]` aligned to `fill[i]`. A vertex touched this sweep is skipped, so
// a beat is a matching of independent pairwise updates. `moved` is the touched flag,
// allocated fresh here to keep the sweep self-contained.
export function fillGatedSweep(input: {
  tone: Int8Array
  edges: ReadonlyArray<readonly [number, number]>
  fill: Int8Array
  rng: Rng
}): void {
  const { tone, edges, fill, rng } = input
  const moved = new Uint8Array(tone.length)
  for (let i = 0; i < edges.length; i++) {
    const v = edges[i]![0]
    const w = edges[i]![1]
    if (moved[v] || moved[w]) continue
    const f = fill[i]!
    const tv = tone[v]!
    const tw = tone[w]!
    if (f === -1) {
      if (tv === 0 && tw === 0) {
        if (rng.next() < 0.5) {
          tone[v] = 1
          tone[w] = -1
        } else {
          tone[v] = -1
          tone[w] = 1
        }
        moved[v] = 1
        moved[w] = 1
      }
    } else if (f === 1) {
      if ((tv === 1 && tw === -1) || (tv === -1 && tw === 1)) {
        tone[v] = 0
        tone[w] = 0
        moved[v] = 1
        moved[w] = 1
      } else if ((tv === 0) !== (tw === 0) && rng.next() < 0.5) {
        // hop: swap the charged with the neutral
        const tmp = tone[v]!
        tone[v] = tone[w]!
        tone[w] = tmp
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}
