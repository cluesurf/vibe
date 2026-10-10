// THE TIE PROJECTION OF THE SORTED STORE (OPEN-ENG-01, item 0021 of moving-matter). E-FND-0163's store keeps a row per
// nondecreasing momentum tuple s, and at a tie s_k = s_(k+1) it keeps BOTH orders of the tied members' fibers. Those
// entries are redundant: antisymmetry fixes psi(s; b o tau) = sgn(tau) psi(s; b) for every tau in the stabilizer G_s
// of s (the member permutations that only move members among equal momenta). Exact arithmetic keeps that relation, but
// E-FND-0165 found the steps do not hold it under rounding at L = 6 (the direct-sum Fourier transform rounds there,
// radix 4 does not), and the violation grows about 1.25 times a cycle (8.6e-7 at cycle 128).
//
// THE PROJECTION. psi(s; b) <- (1 / |G_s|) sum over tau in G_s of sgn(tau) psi(s; b o tau), (b o tau)_k = b_(tau(k)).
// Each stored entry of a row is one dense amplitude (the store reads psi(m; b) = sgn(sigma) psi(s; b o sigma)), so on
// the dense state this is the orthogonal projection onto the antisymmetric part of the tie row's fiber block: it never
// raises the norm, is idempotent, leaves an exact store unchanged, and moves a row without a tie not at all (G_s is
// the identity there). Applied once a cycle it removes the tie defect before it can grow.
//
// DETERMINISM: no random numbers; pure arithmetic on the store.

import { allPerms, permSign } from '@/code/measure/register-holes'
import type { Sorted, SortedEngine } from '@/code/measure/register-sorted-holes'

export type TieProjector = {
  // the rows with at least one tie, and for each its group's offset into the tables below
  rows: Int32Array
  groupOf: Int32Array
  // per group: the size, and for every element tau and fiber index c, the index of c o tau, and sgn(tau)
  size: number[]
  target: Int32Array[]
  sign: Float64Array[]
}

const digits = (fb: number, n: number, f: number): number[] => {
  const out = new Array<number>(n)
  let rest = fb

  for (let i = n - 1; i >= 0; i--) {
    out[i] = rest % f
    rest = Math.floor(rest / f)
  }

  return out
}

const index = (b: readonly number[], f: number): number => b.reduce((x, d) => x * f + d, 0)

// the tie projector of an engine: one group per tie pattern (which neighbouring members share a momentum)
export function tieProjector(e: SortedEngine): TieProjector {
  const n = e.n
  const f = e.frame.fiber
  const perms = allPerms(n)
  const groups = new Map<string, number>()
  const size: number[] = []
  const target: Int32Array[] = []
  const sign: Float64Array[] = []
  const rows: number[] = []
  const groupOf: number[] = []

  for (let r = 0; r < e.rows; r++) {
    const s = e.mom.subarray(r * n, r * n + n)
    const ties: number[] = []

    for (let k = 0; k + 1 < n; k++) {
      if (s[k] === s[k + 1]) {
        ties.push(k)
      }
    }

    if (ties.length === 0) {
      continue
    }

    const key = ties.join(',')

    if (!groups.has(key)) {
      // the stabilizer of s: tau with s_(tau(k)) = s_k for every k
      const G = perms.filter(tau => tau.every((j, k) => s[j] === s[k]))
      const tg = new Int32Array(G.length * e.block)
      const sg = new Float64Array(G.length)

      G.forEach((tau, g) => {
        sg[g] = permSign(tau)

        for (let c = 0; c < e.block; c++) {
          const b = digits(c, n, f)

          tg[g * e.block + c] = index(
            tau.map(j => b[j]!),
            f,
          )
        }
      })

      groups.set(key, size.length)
      size.push(G.length)
      target.push(tg)
      sign.push(sg)
    }

    rows.push(r)
    groupOf.push(groups.get(key)!)
  }

  return { rows: Int32Array.from(rows), groupOf: Int32Array.from(groupOf), size, target, sign }
}

// project every tie row onto its antisymmetric part, in place; returns the largest change of one amplitude
export function projectTies(e: SortedEngine, p: TieProjector, s: Sorted): number {
  const B = e.block
  const re = new Float64Array(B)
  const im = new Float64Array(B)

  let moved = 0

  for (let i = 0; i < p.rows.length; i++) {
    const o = p.rows[i]! * B
    const g = p.groupOf[i]!
    const G = p.size[g]!
    const tg = p.target[g]!
    const sg = p.sign[g]!

    re.fill(0)
    im.fill(0)

    for (let t = 0; t < G; t++) {
      const sgn = sg[t]!
      const at = t * B

      for (let c = 0; c < B; c++) {
        const d = o + tg[at + c]!

        re[c]! += sgn * s.re[d]!
        im[c]! += sgn * s.im[d]!
      }
    }

    for (let c = 0; c < B; c++) {
      const x = re[c]! / G
      const y = im[c]! / G

      moved = Math.max(moved, Math.hypot(x - s.re[o + c]!, y - s.im[o + c]!))
      s.re[o + c] = x
      s.im[o + c] = y
    }
  }

  return moved
}
