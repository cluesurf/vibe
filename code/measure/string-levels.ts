// The levels of a singlet of the paid-string rule, counted exactly on the infinite D4 lattice.
//
// The paid-string rule (code/rule/string-graph) prices a link at the tension when its flux is not 0 mod 3, and
// every move it takes reads the flux only mod 3. So the flux that matters is a Z3 1-chain E, and Gauss's law mod
// 3 says its divergence is the charge: +1 at a love, -1 (= 2) at a fear, 0 elsewhere. A singlet with n paid
// links is a Z3 chain whose support has n links. In the canonical measure the demons impose (weight x^n, with
// x = exp(-beta tension)), a singlet sits at level n with probability proportional to Omega(n) x^n, Omega(n)
// the number of connected Z3 chains of support n with the singlet's boundary. The same sum is the high-
// temperature expansion of the 3-state Potts model on the docks (the duality of code/measure/string-potts), so
// Omega(n) are that model's series coefficients.
//
// Counted here by brute force: every connected set of n links with a link at the origin dock (grown one
// adjacent link at a time, deduplicated by its sorted key), and on each set every assignment of the nonzero
// values 1, 2 to its links, kept when the divergence is the wanted boundary with a love at the origin. A meson
// is one love and one fear, a baryon three loves. Counting with a love at the origin counts a baryon once per
// love, so baryon counts are three times the number of baryons up to translation. Feasible to n = 4 (about
// 10^6 link sets).

import { rootsD4 } from '@/code/algebra/group/root-system'

const ROOTS = rootsD4()
const OFFSET = 16
const BASE = 32

// a dock of the infinite lattice as one integer (coordinates between -16 and 15)
export const packDock = (v: readonly number[]): number =>
  (v[0] ?? 0) + OFFSET + BASE * ((v[1] ?? 0) + OFFSET) + BASE ** 2 * ((v[2] ?? 0) + OFFSET) + BASE ** 3 * ((v[3] ?? 0) + OFFSET)

export const unpackDock = (k: number): number[] => [0, 1, 2, 3].map(i => (Math.floor(k / BASE ** i) % BASE) - OFFSET)

// a link as the ordered pair of its dock keys, lower first
export type Link = readonly [number, number]

const linkKey = (a: number, b: number): number => (a < b ? a * BASE ** 4 + b : b * BASE ** 4 + a)
const linkOf = (key: number): Link => [Math.floor(key / BASE ** 4), key % BASE ** 4]

export function neighbours(dock: number): number[] {
  const v = unpackDock(dock)

  return ROOTS.map(r => packDock(v.map((x, i) => x + (r[i] ?? 0))))
}

// every connected link set of size 1..maxSize with at least one link at the origin dock, by size
export function linkAnimals(maxSize: number): number[][][] {
  const origin = packDock([0, 0, 0, 0])
  const levels: number[][][] = [[]]

  let current = new Map<string, number[]>()

  for (const y of neighbours(origin)) {
    const set = [linkKey(origin, y)]

    current.set(set.join(','), set)
  }

  levels.push([...current.values()])

  for (let size = 2; size <= maxSize; size++) {
    const next = new Map<string, number[]>()

    for (const set of current.values()) {
      const docks = new Set<number>()

      for (const key of set) {
        const [a, b] = linkOf(key)

        docks.add(a)
        docks.add(b)
      }

      const inSet = new Set(set)

      for (const d of docks) {
        for (const y of neighbours(d)) {
          const key = linkKey(d, y)

          if (!inSet.has(key)) {
            const grown = [...set, key].sort((p, q) => p - q)
            const id = grown.join(',')

            if (!next.has(id)) {
              next.set(id, grown)
            }
          }
        }
      }
    }

    levels.push([...next.values()])
    current = next
  }

  return levels
}

// the boundary a chain must have
export type Boundary = 'meson' | 'baryon'

export type LevelCount = {
  // Omega(n): the number of Z3 chains of support n with the boundary and a love at the origin
  readonly count: number
  // the sum over those chains of the love-fear distance (mesons) or the largest love-love distance (baryons)
  readonly distanceSum: number
  // the sum over those chains of the husk distance (the same, the depth coordinate dropped)
  readonly huskSum: number
}

// Omega(n) and distance sums for n = 1 .. maxSize
export function singletLevels(input: { boundary: Boundary; maxSize: number; animals?: number[][][] }): LevelCount[] {
  const { boundary, maxSize } = input
  const animals = input.animals ?? linkAnimals(maxSize)
  const origin = packDock([0, 0, 0, 0])
  const out: LevelCount[] = []

  for (let n = 1; n <= maxSize; n++) {
    let count = 0
    let distanceSum = 0
    let huskSum = 0

    for (const set of animals[n] ?? []) {
      const links = set.map(linkOf)
      const docks = [...new Set(links.flat())]
      const index = new Map(docks.map((d, i) => [d, i]))

      for (let mask = 0; mask < 1 << n; mask++) {
        const divergence = new Int32Array(docks.length)

        links.forEach(([a, b], k) => {
          const value = (mask >> k) & 1 ? 2 : 1

          divergence[index.get(a) ?? 0] = (divergence[index.get(a) ?? 0] ?? 0) + value
          divergence[index.get(b) ?? 0] = (divergence[index.get(b) ?? 0] ?? 0) - value
        })

        const loves: number[] = []
        const fears: number[] = []
        let clean = true

        docks.forEach((d, i) => {
          const r = (((divergence[i] ?? 0) % 3) + 3) % 3

          if (r === 1) {
            loves.push(d)
          } else if (r === 2) {
            fears.push(d)
          }
        })

        if (!loves.includes(origin)) {
          clean = false
        }

        if (boundary === 'meson' && !(loves.length === 1 && fears.length === 1)) {
          clean = false
        }

        if (boundary === 'baryon' && !(loves.length === 3 && fears.length === 0)) {
          clean = false
        }

        if (!clean) {
          continue
        }

        count += 1

        if (boundary === 'meson') {
          const f = unpackDock(fears[0] ?? origin)

          distanceSum += Math.hypot(...f)
          huskSum += Math.hypot(f[0] ?? 0, f[1] ?? 0, f[2] ?? 0)
        } else {
          const vs = loves.map(unpackDock)

          let spread = 0
          let huskSpread = 0

          for (const p of vs) {
            for (const q of vs) {
              const d = p.map((x, i) => x - (q[i] ?? 0))

              spread = Math.max(spread, Math.hypot(...d))
              huskSpread = Math.max(huskSpread, Math.hypot(d[0] ?? 0, d[1] ?? 0, d[2] ?? 0))
            }
          }

          distanceSum += spread
          huskSum += huskSpread
        }
      }
    }

    out.push({ count, distanceSum, huskSum })
  }

  return out
}
