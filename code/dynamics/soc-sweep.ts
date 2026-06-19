import { Rng } from '@/code/tool/rng'

// Local activity around an edge: the fraction of nonzero cells among the two
// endpoints' combined neighborhoods. The drive signal for demand-driven creation.
export function localActivity(
  tone: Int8Array,
  offsets: Int32Array,
  adj: Int32Array,
  v: number,
  w: number,
): number {
  let nz = 0
  let tot = 0
  for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
    if (tone[adj[p]!] !== 0) {
      nz++
    }

    tot++
  }

  for (let p = offsets[w]!; p < offsets[w + 1]!; p++) {
    if (tone[adj[p]!] !== 0) {
      nz++
    }

    tot++
  }

  return tot > 0 ? nz / tot : 0
}

// The self-organized-criticality beat (P135): the conserving share + hop, plus
// DEMAND-DRIVEN creation. The arrow fires where it is quiet and is suppressed where
// it is busy, so activity hovers just above the absorbing edge (the homeostatic
// loop). +/- annihilate, a charge hops into an adjacent 0 half the time, and two 0s
// create a balanced pair only when their neighborhood is below `quietThreshold`.
// With `uniform=true` the feedback is ignored and creation fires everywhere at half
// rate (the control). The `moved` buffer is the per-vertex touched flag.
export function socEdgeSweep(input: {
  tone: Int8Array
  offsets: Int32Array
  adj: Int32Array
  eu: Int32Array
  ev: Int32Array
  moved: Uint8Array
  rng: Rng
  arrow: number
  uniform: boolean
  quietThreshold?: number
}): void {
  const { tone, offsets, adj, eu, ev, moved, rng, arrow, uniform } =
    input
  const quietThreshold = input.quietThreshold ?? 0.12
  moved.fill(0)
  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!
    if (moved[v] || moved[w]) {
      continue
    }

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
      const quiet =
        localActivity(tone, offsets, adj, v, w) < quietThreshold
      const rate = uniform ? arrow * 0.5 : quiet ? arrow : 0
      if (rng.next() < rate) {
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
