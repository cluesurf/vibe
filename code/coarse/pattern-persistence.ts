// Pattern persistence against the churn (the persistence problem, PS1). A logical pattern is stored as a
// plus-charge disk and the churning beat (an active vacuum plus diffusion, no cohesion) erodes it. The pattern
// is recovered by majority vote over its original cells, and the SURVIVAL TIME is the first beat the majority
// drops below one half. Spatial redundancy (a larger disk) extends that time, an error-correction effect, and
// active maintenance (re-stamping the pattern) makes it permanent at a work cost. Reuses the self-kit churn.

import { flatGraph, beat } from '@/code/model/self-kit'
import { makeRng } from '@/code/tool/rng'

// The survival time of a redundantly-stored pattern under the churn. radius sets the redundancy, maintainEvery
// re-stamps the pattern every that-many beats (0 disables maintenance, the unmaintained case). Returns the
// first beat the majority recovery fails, or beats if it never does (the pattern survives the whole run).
export function patternSurvivalTime(input: {
  L: number
  radius: number
  beats: number
  seed: number
  arrow?: number
  maintainEvery?: number
}): number {
  const { L, radius, beats, seed } = input
  const arrow = input.arrow ?? 0.05
  const maintainEvery = input.maintainEvery ?? 0
  const graph = flatGraph(L)
  const rng = makeRng({ seed })
  const moved = new Uint8Array(graph.cellCount)
  const tone = new Int8Array(graph.cellCount)
  const centre = Math.floor(L / 2)
  const disk: number[] = []

  for (let c = 0; c < graph.cellCount; c++) {
    const dx = (c % L) - centre
    const dy = Math.floor(c / L) - centre

    if (dx * dx + dy * dy <= radius * radius) {
      disk.push(c)
    }
  }

  const stamp = (): void => {
    for (const c of disk) {
      tone[c] = 1
    }
  }

  stamp()

  const majority = (): number => {
    let plus = 0

    for (const c of disk) {
      if (tone[c] === 1) {
        plus++
      }
    }

    return disk.length > 0 ? plus / disk.length : 0
  }

  for (let t = 0; t < beats; t++) {
    beat(tone, graph, moved, rng, arrow, 0)

    if (maintainEvery > 0 && t % maintainEvery === 0) {
      stamp()
    }

    if (majority() < 0.5) {
      return t
    }
  }

  return beats
}
