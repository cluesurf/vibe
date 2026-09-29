// THE CAPTURE ON ANY CLIFFORD REGISTER, AND THE SPEED RESIDUES (E-GRV-0145). E-SPN-0160 proved that a partner with no
// transverse states takes exactly a quarter of the stream, so the singlet's light speed is c/4 on the even register
// Cl+(4). This file states that capture for a register of either size, the even forms (8) or the whole exterior algebra
// (16), from the Clifford maps alone, so the question "is there a register under which matter keeps c/2" can be read
// rather than argued.
//
//   cliffordMaps     gamma_i w = e_i ^ w + iota_i w on the chosen blades: for the even register an 8 x 8 map even to
//                    odd, for the whole algebra a 16 x 16 map (a signed permutation either way)
//   captureOf        for a unit direction u, the partner overlap T[eta][k] = <E(eta) | X_u S_k> = c0 sum_d (u . r_d)
//                    gamma(r_d)[eta][k] (S_k the uniform slot mode times blade k, E(eta)'s slot d = gamma(r_d)^T eta /
//                    (2 sqrt 12), c0 = 1 / (2 sqrt 288)); the share |T|^2 / sum_k |X_u S_k|^2, and how far T^T T and
//                    T T^T are from multiples of the identity (the Clifford condition on each side: no transverse state)
//   partnerChecks    the partner basis is orthonormal and orthogonal to the singlet (sum_d gamma(r_d) = 0)
//   vectorShare      the whole vector partner Pi4 (x) 1, as the control (share 1, with transverse states)
//   inverseMod       c as a residue: 1/4 and 1/2 mod p
//
// DETERMINISM: nothing is drawn. The maps are integer; the shares are floats read against exact rationals.

import { DOCK_ROOTS } from '@/code/measure/dock-mixer'

const ROOTS = DOCK_ROOTS
const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)

export type Register = 'even' | 'whole'

const ALL: readonly (readonly number[])[] = Array.from(
  { length: 16 },
  (_, m) => [0, 1, 2, 3].filter(i => (m >> i) & 1),
)
const EVEN_BLADES = ALL.filter(b => b.length % 2 === 0)
const ODD_BLADES = ALL.filter(b => b.length % 2 === 1)
const bladeKey = (b: readonly number[]): string => b.join(',')

function wedge(
  i: number,
  B: readonly number[],
): { sign: number; blade: number[] } | null {
  if (B.includes(i)) {
    return null
  }

  return {
    sign: B.filter(x => x < i).length % 2 === 0 ? 1 : -1,
    blade: [...B, i].sort((a, b) => a - b),
  }
}

function contract(
  i: number,
  B: readonly number[],
): { sign: number; blade: number[] } | null {
  const at = B.indexOf(i)

  return at < 0
    ? null
    : { sign: at % 2 === 0 ? 1 : -1, blade: B.filter(x => x !== i) }
}

// gamma_i as [target row][source column]; the source blades are the register (even, or all), the targets the partner's
// label space (odd, or all)
export function cliffordMaps(reg: Register): {
  maps: number[][][]
  size: number
} {
  const source = reg === 'even' ? EVEN_BLADES : ALL
  const target = reg === 'even' ? ODD_BLADES : ALL
  const index = new Map(target.map((b, k) => [bladeKey(b), k]))
  const maps = [0, 1, 2, 3].map(i => {
    const g = Array.from({ length: target.length }, () =>
      Array<number>(source.length).fill(0),
    )

    source.forEach((B, col) => {
      for (const t of [wedge(i, B), contract(i, B)]) {
        if (!t) {
          continue
        }

        g[index.get(bladeKey(t.blade))!]![col]! += t.sign
      }
    })

    return g
  })

  return { maps, size: source.length }
}

// the largest gap of gamma_i^T gamma_j + gamma_j^T gamma_i from 2 delta_ij (the Clifford relation)
export function cliffordGap(reg: Register): number {
  const { maps, size } = cliffordMaps(reg)

  let gap = 0

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let a = 0; a < size; a++) {
        for (let b = 0; b < size; b++) {
          let s = 0

          for (let e = 0; e < size; e++) {
            s +=
              maps[i]![e]![a]! * maps[j]![e]![b]! +
              maps[j]![e]![a]! * maps[i]![e]![b]!
          }

          gap = Math.max(
            gap,
            Math.abs(s - (i === j && a === b ? 2 : 0)),
          )
        }
      }
    }
  }

  return gap
}

const gammaOf = (
  maps: readonly (readonly (readonly number[])[])[],
  r: readonly number[],
  size: number,
): number[][] =>
  Array.from({ length: size }, (_, e) =>
    Array.from({ length: size }, (_, k) =>
      [0, 1, 2, 3].reduce(
        (s, i) => s + r[i]! * (maps[i] as number[][])[e]![k]!,
        0,
      ),
    ),
  )

// the partner basis: orthonormality gap and its largest component on the singlet (the uniform slot mode)
export function partnerChecks(reg: Register): {
  orthonormal: number
  singlet: number
} {
  const { maps, size } = cliffordMaps(reg)
  const f = 1 / (2 * Math.sqrt(12))
  const gs = ROOTS.map(r => gammaOf(maps, r, size))

  let orthonormal = 0
  let singlet = 0

  for (let e1 = 0; e1 < size; e1++) {
    for (let e2 = 0; e2 < size; e2++) {
      let s = 0

      for (const g of gs) {
        for (let k = 0; k < size; k++) {
          s += f * f * g[e1]![k]! * g[e2]![k]!
        }
      }

      orthonormal = Math.max(
        orthonormal,
        Math.abs(s - (e1 === e2 ? 1 : 0)),
      )
    }

    for (let k = 0; k < size; k++) {
      singlet = Math.max(
        singlet,
        Math.abs(gs.reduce((s, g) => s + g[e1]![k]!, 0)),
      )
    }
  }

  return { orthonormal, singlet }
}

export type Capture = { share: number; sideS: number; sideD: number }

export function captureOf(
  reg: Register,
  u: readonly number[],
): Capture {
  const { maps, size } = cliffordMaps(reg)
  const c0 = 1 / (2 * Math.sqrt(288))
  const T = Array.from({ length: size }, () =>
    Array<number>(size).fill(0),
  )

  let full = 0

  ROOTS.forEach(r => {
    const w = dot(u, r)
    const g = gammaOf(maps, r, size)

    for (let e = 0; e < size; e++) {
      for (let k = 0; k < size; k++) {
        T[e]![k]! += c0 * w * g[e]![k]!
      }
    }

    full += (w * w * size) / 24
  })

  let captured = 0

  for (const row of T) {
    for (const x of row) {
      captured += x * x
    }
  }

  const TtT = Array.from({ length: size }, (_, a) =>
    Array.from({ length: size }, (_, b) =>
      T.reduce((s, row) => s + row[a]! * row[b]!, 0),
    ),
  )
  const TTt = T.map(ra =>
    T.map(rb => ra.reduce((s, x, k) => s + x * rb[k]!, 0)),
  )
  const scale = captured / size
  const off = (m: number[][]): number =>
    Math.max(
      ...m.flatMap((row, a) =>
        row.map((x, b) => Math.abs(x - (a === b ? scale : 0))),
      ),
    )

  return { share: captured / full, sideS: off(TtT), sideD: off(TTt) }
}

// the whole vector partner Pi4 (x) 1 on the even register: its share of the stream (1: it takes all of it)
export function vectorShare(u: readonly number[]): number {
  let captured = 0
  let full = 0

  for (let i = 0; i < 4; i++) {
    let s = 0

    for (const r of ROOTS) {
      s += (r[i]! * dot(u, r)) / Math.sqrt(12 * 24)
    }

    captured += 8 * s * s
  }

  for (const r of ROOTS) {
    full += (8 * dot(u, r) ** 2) / 24
  }

  return captured / full
}

// n^-1 mod p (p prime), by Fermat
export function inverseMod(n: number, p: number): number {
  let result = 1n
  let base = BigInt(n) % BigInt(p)
  let e = BigInt(p - 2)

  const P = BigInt(p)

  while (e > 0n) {
    if (e & 1n) {
      result = (result * base) % P
    }

    base = (base * base) % P
    e >>= 1n
  }

  return Number(result)
}
