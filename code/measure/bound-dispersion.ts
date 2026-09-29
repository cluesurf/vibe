// Measurement for E-MTR-0024 and 0025: the flux-string bound state's band E(K) near K = 0 and the beat between two
// of its levels, read on the Bloch operator of code/measure/flux-store-bloch (locked STAND-IN tokens on one husk
// line). The particle-sector levels at K = 0 are ranked by E-SPN-0076's unwrapped energy (lightestUnwrapped's
// definition, reproduced here so the second level's vector is kept too), then each is followed to K > 0 by overlap
// and its energy unwrapped continuously from the previous K.

import {
  branchReader,
  contactEnergy,
  overlap,
  spectrumAt,
  stringMoments,
  type BlochSpec,
  type Level,
} from '@/code/measure/flux-store-bloch'

// E-SPN-0077's three locked loves and E-SPN-0076's love-fear pair, under C, with the cost c = N
export const threeLoves = (D: number): BlochSpec => {
  const N = 2 * D + 1

  return {
    kinds: ['love', 'love', 'love'],
    convention: 'C',
    unlike: 'knit',
    depth: D,
    cost: N,
    root: 2 * N * N,
    labels: 2,
  }
}

export const loveFear = (D: number): BlochSpec => {
  const N = 2 * D + 1

  return {
    kinds: ['love', 'fear'],
    convention: 'C',
    unlike: 'knit',
    depth: D,
    cost: N,
    root: 2 * N * N,
    labels: 2,
  }
}

// the momenta the bound state's band is followed through
export const BOUND_KS: readonly number[] = [
  0, 0.04, 0.08, 0.12, 0.16, 0.2, 0.24,
]

export type RankedLevel = {
  level: Level
  unwrapped: number
  mean: number
  even: number
}

export function rankedParticleLevels(
  spec: BlochSpec,
  L: number,
): RankedLevel[] {
  const r = spectrumAt(spec, 0)
  const read = branchReader(r.bloch, L)
  const sigma = (2 * Math.PI * spec.cost) / spec.root
  const rows: RankedLevel[] = []

  for (const lv of r.all) {
    const reading = read(lv.vector)

    if (reading.even < 0.5) {
      continue
    }

    const mean = stringMoments(r.bloch, lv.vector).mean
    const reference =
      reading.kinetic + sigma * mean + contactEnergy(r.bloch, lv.vector)
    const unwrapped =
      lv.energy +
      2 * Math.PI * Math.round((reference - lv.energy) / (2 * Math.PI))

    rows.push({ level: lv, unwrapped, mean, even: reading.even })
  }

  return rows.sort((x, y) => x.unwrapped - y.unwrapped)
}

export type Track = {
  K: number[]
  energies: number[][]
  minOverlap: number[]
  distinct: boolean
}

// follow each start level through the momenta Ks (Ks[0] = 0, increasing in small steps)
export function trackLevels(
  spec: BlochSpec,
  Ks: readonly number[],
  starts: readonly RankedLevel[],
): Track {
  const energies = starts.map(s => [s.unwrapped])
  const minOverlap = starts.map(() => 1)

  let prev = starts.map(s => s.level)
  let distinct = true

  for (let i = 1; i < Ks.length; i++) {
    const all = spectrumAt(spec, Ks[i]!).all
    const picks: Level[] = []
    const used = new Set<number>()

    prev.forEach((p, t) => {
      let best = 0
      let bestOverlap = -1

      all.forEach((lv, j) => {
        const o = overlap(p.vector, lv.vector)

        if (o > bestOverlap) {
          bestOverlap = o
          best = j
        }
      })

      if (used.has(best)) {
        distinct = false
      }

      used.add(best)
      picks.push(all[best]!)
      minOverlap[t] = Math.min(minOverlap[t]!, bestOverlap)

      const last = energies[t]![energies[t]!.length - 1]!

      let e = all[best]!.energy

      e += 2 * Math.PI * Math.round((last - e) / (2 * Math.PI))
      energies[t]!.push(e)
    })

    prev = picks
  }

  return { K: Ks.slice(), energies, minOverlap, distinct }
}
