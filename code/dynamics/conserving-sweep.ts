import { Rng } from '@/code/tool/rng'

// One beat of the conserving perception rule over an edge list. Each undirected
// edge is visited once; a vertex already touched this sweep is skipped (so a beat
// is a matching of independent pairwise updates). The local update on a ternary
// tone pair (values in -1, 0, +1) is charge conserving:
//   +/- annihilate to 0/0,
//   a charge next to a 0 hops into the 0 half the time,
//   two 0s spontaneously create a +/- pair with probability `arrow`.
// The `moved` buffer is the per-vertex touched flag, cleared at the start.
export function conservingEdgeSweep(input: {
  tone: Int8Array
  eu: Int32Array
  ev: Int32Array
  moved: Uint8Array
  rng: Rng
  arrow: number
}): void {
  const { tone, eu, ev, moved, rng, arrow } = input
  moved.fill(0)
  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!
    if (moved[v] || moved[w]) continue
    const a = tone[v]!
    const b = tone[w]!
    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      tone[v] = 0
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w
      if (rng.next() < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if (a === 0 && b === 0) {
      if (rng.next() < arrow) {
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
    }
  }
}
