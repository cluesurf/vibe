// Active persistence probed honestly (the observer chunk, the act-to-persist frontier of E1). A self sits at
// the centre of a lethal pervasive threat, a deterministic decay that erases a fixed fraction of its charge
// every beat, while a plus-tone refuge on one side replenishes any charge that reaches it. The naive reading
// (the self walks to the refuge and survives) turned out to be a MISATTRIBUTION. The June 2026 audit showed a
// run with NO initial self (refuge only) grows almost the same survivor beside the refuge, so the survivor is
// charge shed by the clamped refuge, a halo, not a relocated self. To settle it this module carries a
// PROVENANCE label on every charge of the original disk through every hop, so we can measure directly whether
// any of the self's own charge ever reaches the refuge. Reuses the self-kit graph and cluster tools, with a
// label-carrying copy of the kit's beat (identical rng consumption, so the dynamics is bit-identical).

import {
  flatGraph,
  largestPositiveCluster,
} from '@/code/model/self-kit'
import { makeRng } from '@/code/tool/rng'
import type { Graph, Rng } from '@/code/model/self-kit'

export type PersistenceResult = {
  // the surviving plus cluster with the refuge source masked out (the audit shows it is the refuge halo).
  survivingSize: number
  // the centroid x of the surviving cluster, or -1 if nothing survived.
  finalX: number
  // the initial disk's plus count (0 in the no-self control).
  originalCharge: number
  // labeled (original-disk) charge left anywhere at the end.
  originalRemaining: number
  // the most labeled charge ever inside the refuge strip, over the whole run.
  originalInRefugeEver: number
  // labeled charge inside the surviving cluster at the end.
  originalInSurvivor: number
  // labeled charge remaining, sampled every 100 beats (the original support decaying away).
  originalTrace: number[]
  // the first beat at which no original-disk charge remains anywhere, or -1 if some survives the run.
  originalExtinctionBeat: number
}

// a copy of self-kit's beat with arrow fixed at 0, carrying a provenance label with every hop. The rng calls
// match the kit's beat exactly (one for the sweep start, one per attempted hop, and the arrow-0 creation
// branch consumes none), so the tone dynamics is identical to the kit's.
function labeledBeat(
  tone: Int8Array,
  label: Uint8Array,
  g: Graph,
  moved: Uint8Array,
  rng: Rng,
  cohesion: number,
): void {
  const { offsets, adj } = g
  const N = tone.length

  moved.fill(0)

  const start = Math.floor(rng.next() * N)

  for (let s = 0; s < N; s++) {
    const v = (start + s) % N

    if (moved[v]) continue

    const a = tone[v]!

    for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
      const w = adj[p]!

      if (moved[w]) continue

      const b = tone[w]!

      if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
        tone[v] = 0
        tone[w] = 0
        label[v] = 0
        label[w] = 0
        moved[v] = 1
        moved[w] = 1
        break
      } else if (a !== 0 && b === 0) {
        let like = 0

        for (let q = offsets[w]!; q < offsets[w + 1]!; q++) {
          const u = adj[q]!

          if (u !== v && tone[u] === a) {
            like++
          }
        }

        const pHop = 0.1 + cohesion * Math.min(like, 4)

        if (rng.next() < pHop) {
          tone[w] = a
          tone[v] = 0
          label[w] = label[v]!
          label[v] = 0
          moved[v] = 1
          moved[w] = 1
          break
        }
      }
    }
  }
}

// Run a self (or, with withSelf false, NO self, the halo control) under a pervasive decay with a refuge on
// the given side (or none), reporting the survivor and the provenance of the original disk charge.
export function activePersistence(input: {
  L: number
  beats: number
  seed: number
  refuge: 'left' | 'right' | 'none'
  withSelf?: boolean
  decayPeriod?: number
  refugeWidth?: number
}): PersistenceResult {
  const { L, beats, seed, refuge } = input
  const withSelf = input.withSelf ?? true
  const decayPeriod = input.decayPeriod ?? 6
  const refugeWidth = input.refugeWidth ?? 6
  const graph = flatGraph(L)
  const rng = makeRng({ seed })
  const moved = new Uint8Array(graph.cellCount)
  const tone = new Int8Array(graph.cellCount)
  const label = new Uint8Array(graph.cellCount)

  // a plus self disk at the centre, every cell provenance-labeled (skipped in the no-self control)
  const centre = Math.floor(L / 2)

  let originalCharge = 0

  if (withSelf) {
    for (let c = 0; c < graph.cellCount; c++) {
      const dx = (c % L) - centre
      const dy = Math.floor(c / L) - centre

      if (dx * dx + dy * dy <= 36) {
        tone[c] = 1
        label[c] = 1
        originalCharge++
      }
    }
  }

  const refugeX =
    refuge === 'left' ? 0 : refuge === 'right' ? L - refugeWidth : -1

  const inRefuge = (c: number): boolean =>
    refuge !== 'none' &&
    c % L >= refugeX &&
    c % L < refugeX + refugeWidth

  const countLabeled = (where?: (c: number) => boolean): number => {
    let n = 0

    for (let c = 0; c < graph.cellCount; c++) {
      if (tone[c] === 1 && label[c] === 1 && (!where || where(c))) {
        n++
      }
    }

    return n
  }

  let originalInRefugeEver = 0
  let originalExtinctionBeat = withSelf ? -1 : 0

  const originalTrace: number[] = [countLabeled()]

  for (let t = 0; t < beats; t++) {
    if (refuge !== 'none') {
      for (let c = 0; c < graph.cellCount; c++) {
        if (inRefuge(c)) {
          // replenished refuge charge is NOT original-disk charge, so it carries no label
          if (tone[c] !== 1) label[c] = 0

          tone[c] = 1
        }
      }
    }

    // the pervasive deterministic decay, erase every decayPeriod-th plus cell outside the refuge source
    let k = 0

    for (let c = 0; c < graph.cellCount; c++) {
      if (tone[c] === 1 && !inRefuge(c)) {
        if (k % decayPeriod === 0) {
          tone[c] = 0
          label[c] = 0
        }

        k++
      }
    }

    labeledBeat(tone, label, graph, moved, rng, 0.4)

    const inRefugeNow = countLabeled(inRefuge)

    if (inRefugeNow > originalInRefugeEver)
      originalInRefugeEver = inRefugeNow

    const remaining = countLabeled()

    if (withSelf && remaining === 0 && originalExtinctionBeat === -1)
      originalExtinctionBeat = t + 1

    if ((t + 1) % 100 === 0) originalTrace.push(remaining)
  }

  const masked = tone.slice()

  for (let c = 0; c < masked.length; c++) {
    if (inRefuge(c)) masked[c] = 0
  }

  const cells = largestPositiveCluster(masked, graph)

  let sx = 0
  let originalInSurvivor = 0

  for (const c of cells) {
    sx += c % L

    if (label[c] === 1) {
      originalInSurvivor++
    }
  }

  return {
    survivingSize: cells.length,
    finalX: cells.length ? sx / cells.length : -1,
    originalCharge,
    originalRemaining: countLabeled(),
    originalInRefugeEver,
    originalInSurvivor,
    originalTrace,
    originalExtinctionBeat,
  }
}
