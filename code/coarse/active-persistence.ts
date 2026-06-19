// Active persistence, a self acting to survive (the observer chunk, the act-to-persist frontier of E1). A
// self sits at the centre of a lethal pervasive threat, a deterministic decay that erases a fixed fraction of
// its charge every beat, so a self that stays put is wiped out. A plus-tone refuge on one side replenishes
// any charge that reaches it. The self's emergent approach-avoid mobility (the lean, E4) carries it toward the
// refuge, so it relocates to safety and persists. With no refuge there is nowhere to go and it dies. The
// agency is emergent, the directed move toward the refuge, not an added goal. Reuses the self-kit.

import {
  flatGraph,
  beat,
  largestPositiveCluster,
} from '@/code/model/self-kit'
import { makeRng } from '@/code/tool/rng'

export interface PersistenceResult {
  // the surviving self, the largest plus cluster with the refuge source masked out.
  survivingSize: number
  // the centroid x of the surviving self, or -1 if it died. Shows which way it relocated.
  finalX: number
}

// Run a self under a pervasive decay with a refuge on the given side (or none) and report whether it survived
// and where it ended up.
export function activePersistence(input: {
  L: number
  beats: number
  seed: number
  refuge: 'left' | 'right' | 'none'
  decayPeriod?: number
  refugeWidth?: number
}): PersistenceResult {
  const { L, beats, seed, refuge } = input
  const decayPeriod = input.decayPeriod ?? 6
  const refugeWidth = input.refugeWidth ?? 6
  const graph = flatGraph(L)
  const rng = makeRng({ seed })
  const moved = new Uint8Array(graph.cellCount)
  const tone = new Int8Array(graph.cellCount)

  // a plus self disk at the centre
  const centre = Math.floor(L / 2)
  for (let c = 0; c < graph.cellCount; c++) {
    const dx = (c % L) - centre
    const dy = Math.floor(c / L) - centre
    if (dx * dx + dy * dy <= 36) {
      tone[c] = 1
    }
  }

  const refugeX =
    refuge === 'left' ? 0 : refuge === 'right' ? L - refugeWidth : -1
  const inRefuge = (c: number): boolean =>
    refuge !== 'none' &&
    c % L >= refugeX &&
    c % L < refugeX + refugeWidth

  for (let t = 0; t < beats; t++) {
    if (refuge !== 'none') {
      for (let c = 0; c < graph.cellCount; c++) {
        if (inRefuge(c)) {
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
        }

        k++
      }
    }

    beat(tone, graph, moved, rng, 0, 0.4)
  }

  const masked = tone.slice()
  for (let c = 0; c < masked.length; c++) {
    if (inRefuge(c)) {
      masked[c] = 0
    }
  }

  const cells = largestPositiveCluster(masked, graph)
  let sx = 0
  for (const c of cells) {
    sx += c % L
  }

  return {
    survivingSize: cells.length,
    finalX: cells.length ? sx / cells.length : -1,
  }
}
