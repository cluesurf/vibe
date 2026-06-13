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

// One beat of the conserving rule over an explicit edge list with TUNABLE process rates: a +/- contact
// annihilates with probability `share`, a charge next to a 0 hops with probability `hop`, two 0s create
// a +/- pair with probability `arrow`. The edge-list counterpart of conservingRingSweepTunable; with
// share = 1 (and a deterministic-on-pass draw) it matches conservingEdgeSweep. The (arrow, share) plane
// this scans is the parameter space the design-signature (fine-tuning) test measures the rich fraction of.
export function conservingEdgeSweepTunable(input: {
  tone: Int8Array
  eu: Int32Array
  ev: Int32Array
  moved: Uint8Array
  rng: Rng
  arrow: number
  share: number
  hop: number
}): void {
  const { tone, eu, ev, moved, rng, arrow, share, hop } = input
  moved.fill(0)
  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!
    if (moved[v] || moved[w]) continue
    const a = tone[v]!
    const b = tone[w]!
    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      if (rng.next() < share) {
        tone[v] = 0
        tone[w] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w
      if (rng.next() < hop) {
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

// One beat of the conserving rule on a 1D PERIODIC chain of length L (edge i ~ (i+1) mod L),
// instead of an explicit edge list. Same charge-conserving local update as conservingEdgeSweep
// (annihilate / hop-into-empty / pair-create with probability `arrow`). The flat-chain control
// the sliver and dodecagrid experiments compare against.
export function conservingChainSweep(input: {
  tone: Int8Array
  length: number
  moved: Uint8Array
  rng: Rng
  arrow: number
}): void {
  const { tone, length, moved, rng, arrow } = input
  moved.fill(0)
  for (let i = 0; i < length; i++) {
    const v = i
    const w = (i + 1) % length
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

// One beat of the conserving rule on a periodic 1D RING, visiting the L edges (i, i+1 mod L) in
// order starting from `start` (a rotating offset so successive beats are not phase-locked to cell 0).
// Same charge-conserving local update as conservingChainSweep. The `moved` buffer is per-vertex and
// cleared at the start. The clean ~1D slice the hierarchical block-charge tower runs on.
export function conservingRingSweep(input: {
  tone: Int8Array
  length: number
  start: number
  moved: Uint8Array
  rng: Rng
  arrow: number
}): void {
  const { tone, length, start, moved, rng, arrow } = input
  moved.fill(0)
  for (let s = 0; s < length; s++) {
    const i = (start + s) % length
    const j = (i + 1) % length
    if (moved[i] || moved[j]) continue
    const a = tone[i]!
    const b = tone[j]!
    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      tone[i] = 0
      tone[j] = 0
      moved[i] = 1
      moved[j] = 1
    } else if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? j : i
      const e = a === 0 ? i : j
      if (rng.next() < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[i] = 1
        moved[j] = 1
      }
    } else if (a === 0 && b === 0) {
      if (rng.next() < arrow) {
        if (rng.next() < 0.5) {
          tone[i] = 1
          tone[j] = -1
        } else {
          tone[i] = -1
          tone[j] = 1
        }
        moved[i] = 1
        moved[j] = 1
      }
    }
  }
}

// One beat of the conserving rule on a periodic 1D ring with TUNABLE process rates: a +/- contact
// annihilates with probability `share`, a charge next to a 0 hops with probability `hop`, and two 0s
// create a +/- pair with probability `arrow`. Edges (i, i+1 mod length) are visited in order from 0,
// a touched vertex is skipped. The deterministic-share ring (share = 1, hop = 1/2) is conservingRingSweep.
// The (arrow, share) plane this scans is where a gapless critical point of the rule is hunted.
export function conservingRingSweepTunable(input: {
  tone: Int8Array
  length: number
  moved: Uint8Array
  rng: Rng
  arrow: number
  share: number
  hop: number
}): void {
  const { tone, length, moved, rng, arrow, share, hop } = input
  moved.fill(0)
  for (let i = 0; i < length; i++) {
    const v = i
    const w = (i + 1) % length
    if (moved[v] || moved[w]) continue
    const a = tone[v]!
    const b = tone[w]!
    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      if (rng.next() < share) {
        tone[v] = 0
        tone[w] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w
      if (rng.next() < hop) {
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

// One beat of the HOP-ONLY conserving transport over an edge list: a charge next to a 0 hops
// into the 0 half the time, and nothing else (no annihilation, no pair creation). With a single
// sign present (or a clamped source) this is pure conserved diffusion of charge, the encoder /
// signal-spread dynamics. `moved` is the per-vertex touched flag, cleared at the start.
export function conservingHopSweep(input: {
  tone: Int8Array
  eu: Int32Array
  ev: Int32Array
  moved: Uint8Array
  rng: Rng
}): void {
  const { tone, eu, ev, moved, rng } = input
  moved.fill(0)
  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!
    if (moved[v] || moved[w]) continue
    const a = tone[v]!
    const b = tone[w]!
    if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w
      if (rng.next() < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

// One beat of the conserving rule taking the edges as an array of [v, w] pairs rather than two
// parallel Int32Arrays. Identical local update to conservingEdgeSweep; the convenience shape for
// callers that already hold a general-graph edge list.
export function conservingEdgeListSweep(input: {
  tone: Int8Array
  edges: ReadonlyArray<readonly [number, number]>
  moved: Uint8Array
  rng: Rng
  arrow: number
}): void {
  const { tone, edges, moved, rng, arrow } = input
  moved.fill(0)
  for (const [v, w] of edges) {
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
    } else if (a === 0 && b === 0 && rng.next() < arrow) {
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

// A position-indexed hash giving a deterministic uniform value per (key, beat, salt).
// Used by the hashed sweep so that perturbing one cell does NOT shift the random
// stream seen by distant edges (which would be a spurious instantaneous global
// difference). Both copies of a damage-spreading run see the same hash per edge.
export function hashRand(key: number, beat: number, salt: number): number {
  let h = (Math.imul(key, 73856093) ^ Math.imul(beat, 19349663) ^ Math.imul(salt, 83492791)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h = h ^ (h >>> 16)
  return (h >>> 0) / 4294967296
}

// One beat of the conserving perception rule using the position-indexed hash instead
// of a stream RNG, so differences between two copies propagate only locally (a damage-
// spreading / front-velocity probe). Same local update as conservingEdgeSweep: opposite
// tones annihilate, a charge next to a 0 hops in half the time, two 0s spawn a +/- pair
// with probability `arrow`. `beat` is the current time-step, used to index the hash.
export function conservingEdgeSweepHashed(input: {
  tone: Int8Array
  eu: Int32Array
  ev: Int32Array
  moved: Uint8Array
  beat: number
  arrow: number
}): void {
  const { tone, eu, ev, moved, beat, arrow } = input
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
      if (hashRand(k, beat, 1) < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if (a === 0 && b === 0) {
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
