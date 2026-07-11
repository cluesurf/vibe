import { Rng } from '@/code/tool/rng'
import { hashRand } from '@/code/dynamics/conserving-sweep'

// Count neighbors of cell `i` that carry tone `q`, ignoring `except` (the partner
// across the active edge). The local same-tone company of a cell.
export function agreeCount(
  tone: Int8Array,
  offsets: Int32Array,
  adj: Int32Array,
  i: number,
  q: number,
  except: number,
): number {
  let c = 0

  for (let p = offsets[i]!; p < offsets[i + 1]!; p++) {
    const w = adj[p]!

    if (w !== except && tone[w] === q) {
      c++
    }
  }

  return c
}

// The COHESIVE perception beat. Like the bare conserving sweep, but the share/hop is
// DEMAND-DRIVEN by company: a charge hops into an adjacent 0 only when the
// destination has at least as much same-tone company as the source (so charges
// gather into blobs), with a small `escapeProbability` of hopping anyway (keeps the
// dynamics ergodic). With `annihilate` on, opposite tones cancel first. With
// `arrow > 0`, two 0s mint a balanced pair at that rate. Charge conserving except
// for the explicit annihilate / arrow moves. The `moved` buffer is the per-vertex
// touched flag, cleared at the start.
export function cohesiveEdgeSweep(input: {
  tone: Int8Array
  eu: Int32Array
  ev: Int32Array
  offsets: Int32Array
  adj: Int32Array
  moved: Uint8Array
  rng: Rng
  annihilate: boolean
  arrow: number
  escapeProbability?: number
}): void {
  const { tone, eu, ev, offsets, adj, moved, rng, annihilate, arrow } =
    input

  const escapeProbability = input.escapeProbability ?? 0.02

  moved.fill(0)

  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!

    if (moved[v] || moved[w]) {
      continue
    }

    const a = tone[v]!
    const b = tone[w]!

    if (
      annihilate &&
      ((a === 1 && b === -1) || (a === -1 && b === 1))
    ) {
      tone[v] = 0
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w
      const q = tone[c]!

      if (
        agreeCount(tone, offsets, adj, e, q, c) >=
          agreeCount(tone, offsets, adj, c, q, e) ||
        rng.next() < escapeProbability
      ) {
        tone[e] = q
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if (arrow > 0 && a === 0 && b === 0) {
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

// The DETERMINISTIC version of cohesiveEdgeSweep: every probabilistic decision (the escape hop, the
// arrow pair creation, the pair sign) is decided by the stateless hash hashRand(edge index, beat, salt)
// instead of an RNG. A fixed rule with no seed and no hidden state, varying per edge and per beat.
export function cohesiveEdgeSweepHashed(input: {
  tone: Int8Array
  eu: Int32Array
  ev: Int32Array
  offsets: Int32Array
  adj: Int32Array
  moved: Uint8Array
  beat: number
  annihilate: boolean
  arrow: number
  escapeProbability?: number
}): void {
  const { tone, eu, ev, offsets, adj, moved, beat, annihilate, arrow } =
    input

  const escapeProbability = input.escapeProbability ?? 0.02

  moved.fill(0)

  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!

    if (moved[v] || moved[w]) {
      continue
    }

    const a = tone[v]!
    const b = tone[w]!

    if (
      annihilate &&
      ((a === 1 && b === -1) || (a === -1 && b === 1))
    ) {
      tone[v] = 0
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w
      const q = tone[c]!

      if (
        agreeCount(tone, offsets, adj, e, q, c) >=
          agreeCount(tone, offsets, adj, c, q, e) ||
        hashRand(k, beat, 1) < escapeProbability
      ) {
        tone[e] = q
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if (arrow > 0 && a === 0 && b === 0) {
      if (hashRand(k, beat, 2) < arrow) {
        if (hashRand(k, beat, 3) < 0.5) {
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
