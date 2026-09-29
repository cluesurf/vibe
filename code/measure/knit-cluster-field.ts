// The knit's own three-love levels in a uniform magnetic field on the husk (E-SPN-0089). Builds on
// code/measure/knit-love-cluster (E-SPN-0088).
//
// THE ONE-COLUMN LEVELS. E-SPN-0088 found the lightest charge-one levels to be three loves that stay in one husk column
// (E = 0: the column is neutral mod 3 and the three hops land on one husk link, so the drift cost reads l = 0, and no
// two of them ever meet on one line). Here the family is enumerated completely: every start with the three loves in
// one column (any depths, any slots), followed until it returns to a translate of itself with the three still in one
// column at every beat.
//
// THE FIELD, read from the light's columns. A uniform field B = 2 pi b / LH per husk square in the (x1, x2) plane, in
// the Landau gauge A = (0, B x1, 0), on a husk torus LH x LH x LZ over columns of depth L. A love's copy picks up the
// line integral of A along its husk shadow s from husk dock x: (B / 2) s2 (2 x1 + s1), an integer exponent
// b s2 (2 x1 + s1) of zeta_(2 LH). The exponent is periodic in x1 (2 b LH = 0 mod 2 LH), and every unit square holds
// exponent 2 b, the uniform flux. It is the husk angle of a compact light whose columns hold b quanta per square: the
// same column sums the drift cost reads. EXACT: integers mod 2 LH, no float in the rule.
//
// WHAT THE FIELD CAN DO HERE, derived. The field is a phase on each copy. The occupation map (the rule on a love-only
// cluster) never reads a phase, so every cycle of the occupation map is the same at every b, and b changes only each
// cycle's holonomy Phi(b). A Landau level needs the field to CLOSE an in-plane path into a cyclotron orbit, which a
// phase cannot do to a classical path. The eigenvectors of a phase-weighted permutation are its cycles, uniform in
// weight along each, so the in-plane extent of every level is its cycle's, at every b.

import {
  clusterBeat,
  cloneCluster,
  huskSpan,
  makeCluster,
  matchAnchor,
  startCodes,
  SHADOW_DIR,
  SHADOW_SIGN,
  type Cluster,
} from '@/code/measure/knit-love-cluster'
import { HUSK_VECTORS } from '@/code/measure/photon-husk'

const mod = (a: number, m: number): number => ((a % m) + m) % m

export const shadowOf = (d: number): number[] =>
  HUSK_VECTORS[SHADOW_DIR[d]!]!.map(x => x * SHADOW_SIGN[d]!)

export type ColumnLevel = {
  start: Cluster
  period: number
  key: string
  shadows: string
}

// every level whose three loves stay in one husk column, at column depth L (x4 mod 2L)
export function oneColumnLevels(
  depth: number,
  tmax: number,
): { levels: ColumnLevel[]; starts: number; leave: number } {
  const seen = new Map<string, ColumnLevel>()

  let starts = 0
  let leave = 0

  for (let z1 = 0; z1 < 2 * depth; z1 += 2) {
    for (let z2 = 0; z2 < 2 * depth; z2 += 2) {
      for (let d0 = 0; d0 < 24; d0++) {
        for (let d1 = 0; d1 < 24; d1++) {
          for (let d2 = 0; d2 < 24; d2++) {
            // love 0 at depth 0; distinct slots where two share a dock
            if (z1 === 0 && d1 === d0) {
              continue
            }

            if (z2 === 0 && d2 === d0) {
              continue
            }

            if (z1 === z2 && d1 === d2) {
              continue
            }

            starts++

            const start = makeCluster(
              [
                [0, 0, 0, 0],
                [0, 0, 0, z1],
                [0, 0, 0, z2],
              ],
              [d0, d1, d2],
              depth,
            )
            const c = cloneCluster(start)
            const want = startCodes(start, depth)

            let period = 0

            for (let t = 1; t <= tmax; t++) {
              clusterBeat(c, depth)

              if (huskSpan(c) !== 0) {
                break
              }

              if (matchAnchor(c, want, depth) >= 0) {
                period = t
                break
              }
            }

            if (period === 0) {
              leave++
              continue
            }

            // the cycle's name: its least class key
            const p = cloneCluster(start)

            let key = ''

            const shadows = new Set<string>()

            for (let t = 0; t < period; t++) {
              // the class key: depths relative to each love in turn (mod 2L), the least over anchors and over the cycle
              for (let a = 0; a < 3; a++) {
                const rel = [0, 1, 2]
                  .map(
                    v =>
                      `${String(mod(p.x[4 * v + 3]! - p.x[4 * a + 3]!, 2 * depth)).padStart(3, '0')},${String(p.d[v]).padStart(2, '0')}`,
                  )
                  .sort()
                  .join('|')

                if (key === '' || rel < key) {
                  key = rel
                }
              }

              for (let v = 0; v < 3; v++) {
                shadows.add(shadowOf(p.d[v]!).join(','))
              }

              clusterBeat(p, depth)
            }

            if (!seen.has(key)) {
              seen.set(key, {
                start,
                period,
                key,
                shadows: [...shadows].join(' '),
              })
            }
          }
        }
      }
    }
  }

  return { levels: [...seen.values()], starts, leave }
}

export type FieldCycle = {
  length: number
  exponent: number
  extent1: number
  extent2: number
  inPlane: boolean
}

// the cycles of the occupation map over every torus translate of a level, with each cycle's field holonomy exponent
// (mod 2 LH, of zeta_(2 LH)) and its in-plane extent
export function torusCycles(
  start: Cluster,
  depth: number,
  LH: number,
  LZ: number,
  b: number,
): FieldCycle[] {
  const keyOf = (c: Cluster): string =>
    [0, 1, 2]
      .map(
        v =>
          `${mod(c.x[4 * v]!, LH)},${mod(c.x[4 * v + 1]!, LH)},${mod(c.x[4 * v + 2]!, LZ)},${c.x[4 * v + 3]},${c.d[v]}`,
      )
      .sort()
      .join('|')

  const reduce = (c: Cluster): void => {
    for (let v = 0; v < 3; v++) {
      c.x[4 * v] = mod(c.x[4 * v]!, LH)
      c.x[4 * v + 1] = mod(c.x[4 * v + 1]!, LH)
      c.x[4 * v + 2] = mod(c.x[4 * v + 2]!, LZ)
    }
  }

  const visited = new Set<string>()
  const out: FieldCycle[] = []

  for (let a1 = 0; a1 < LH; a1++) {
    for (let a2 = 0; a2 < LH; a2++) {
      for (let a3 = 0; a3 < LZ; a3++) {
        for (let a4 = 0; a4 < 2 * depth; a4++) {
          if (mod(a1 + a2 + a3 + a4, 2) !== 0) {
            continue
          }

          const c = cloneCluster(start)

          for (let v = 0; v < 3; v++) {
            c.x[4 * v] = c.x[4 * v]! + a1
            c.x[4 * v + 1] = c.x[4 * v + 1]! + a2
            c.x[4 * v + 2] = c.x[4 * v + 2]! + a3
            c.x[4 * v + 3] = mod(c.x[4 * v + 3]! + a4, 2 * depth)
          }

          reduce(c)

          const first = keyOf(c)

          if (visited.has(first)) {
            continue
          }

          let length = 0
          let exponent = 0

          const x1s = new Set<number>()
          const x2s = new Set<number>()

          let inPlane = false
          let key = first

          do {
            visited.add(key)

            for (let v = 0; v < 3; v++) {
              x1s.add(c.x[4 * v]!)
              x2s.add(c.x[4 * v + 1]!)
            }

            // the collision first (as the beat does), then read each love's copy from the slot it streams on
            const probe = cloneCluster(c)

            clusterBeat(c, depth)

            for (let v = 0; v < 3; v++) {
              const s1 = c.x[4 * v]! - probe.x[4 * v]!
              const s2 = c.x[4 * v + 1]! - probe.x[4 * v + 1]!

              if (s1 !== 0 || s2 !== 0) {
                inPlane = true
              }

              exponent = mod(
                exponent + b * s2 * (2 * probe.x[4 * v]! + s1),
                2 * LH,
              )
            }

            reduce(c)
            length++
            key = keyOf(c)

            if (length > 1_000_000) {
              throw new Error(
                'knit-cluster-field: a cycle did not close',
              )
            }
          } while (key !== first)

          out.push({
            length,
            exponent,
            extent1: x1s.size,
            extent2: x2s.size,
            inPlane,
          })
        }
      }
    }
  }

  return out
}
