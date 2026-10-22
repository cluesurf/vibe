// LEVEL BY LEVEL: HOW HEAVY EACH BOUND LEVEL IS, AND HOW MUCH OF IT SITS AT CONTACT (E-SPN-0207).
//
// A clock of two levels dilates as relativity says only when both levels carry inertia equal to their energy with one
// c: each level's band E_i(K) = E_i + b_i K^2 + ..., and its own speed squared c_i^2 = 2 b_i E_i must be the same for
// both. This file reads, for the lowest particle-sector levels of a flux-store Bloch problem (code/measure/flux-store-
// bloch, followed in K by code/measure/bound-dispersion), each level's b_i, c_i^2, its CONTACT WEIGHT (the share of
// the level on configurations where two tokens share a dock) and its meeting share (the antisymmetric weight the
// meeting's phase acts on), and its mean string.

import {
  BOUND_KS,
  rankedParticleLevels,
  trackLevels,
} from '@/code/measure/bound-dispersion'
import {
  contactEnergy,
  spectrumAt,
  stringMoments,
  type Bloch,
  type BlochSpec,
} from '@/code/measure/flux-store-bloch'
import { evenFit } from '@/code/measure/one-light-speed'
import type { Vec } from '@/code/measure/quantum-ladder'

// the share of v on configurations with two tokens on one dock (token 0 sits at relative coordinate 0)
export function contactWeight(b: Bloch, v: Vec): number {
  let shared = 0
  let total = 0

  for (let c = 0; c < b.configs.length; c++) {
    const d = b.configs[c]!
    const pos = [0, ...d.slice(1)]

    let meets = false

    for (let a = 0; a < pos.length && !meets; a++) {
      for (let e = a + 1; e < pos.length; e++) {
        if (pos[a] === pos[e]) {
          meets = true
          break
        }
      }
    }

    for (let r = 0; r < b.labelCount; r++) {
      const i = b.index(c, r)
      const p = v.re[i]! ** 2 + v.im[i]! ** 2

      total += p

      if (meets) {
        shared += p
      }
    }
  }

  return shared / total
}

// the number of position configurations v occupies, 1 / sum_c P(c)^2 (P summed over labels): the "states" a level
// holds, in the inverse-participation sense
export function participation(b: Bloch, v: Vec): number {
  let total = 0
  let squares = 0
  const shares: number[] = []

  for (let c = 0; c < b.configs.length; c++) {
    let p = 0

    for (let r = 0; r < b.labelCount; r++) {
      const i = b.index(c, r)

      p += v.re[i]! ** 2 + v.im[i]! ** 2
    }

    shares.push(p)
    total += p
  }

  for (const p of shares) {
    squares += (p / total) ** 2
  }

  return 1 / squares
}

export type LevelInertia = {
  // the level's unwrapped energy at K = 0, read as pi + its tracked phase (E-MTR-0025's convention)
  E0: number
  // the K^2 coefficient of its band, and its own speed squared 2 b E0
  b: number
  c2: number
  contact: number
  meeting: number
  string: number
  participation: number
}

export type LevelInertiaRead = {
  levels: LevelInertia[]
  distinct: boolean
  minOverlap: number
}

// the lowest `count` particle-sector levels, each followed through BOUND_KS by overlap
export function levelInertia(
  spec: BlochSpec,
  count: number,
  ring: number,
): LevelInertiaRead {
  const ranked = rankedParticleLevels(spec, ring).slice(0, count)
  const track = trackLevels(spec, BOUND_KS, ranked)
  const bloch = spectrumAt(spec, 0).bloch
  const levels = ranked.map((lv, i): LevelInertia => {
    const e = track.energies[i]!
    const [, b] = evenFit(BOUND_KS, e)
    const E0 = Math.PI + e[0]!

    return {
      E0,
      b,
      c2: 2 * b * E0,
      contact: contactWeight(bloch, lv.level.vector),
      meeting: -contactEnergy(bloch, lv.level.vector) / ((2 * Math.PI) / 3),
      string: stringMoments(bloch, lv.level.vector).mean,
      participation: participation(bloch, lv.level.vector),
    }
  })

  return {
    levels,
    distinct: track.distinct,
    minOverlap: Math.min(...track.minOverlap),
  }
}

// a two-level clock's K^2 coefficient: Delta E(K) / Delta E(0) = 1 - alpha K^2
export const clockAlpha = (lo: LevelInertia, hi: LevelInertia): number =>
  (lo.b - hi.b) / (hi.E0 - lo.E0)
