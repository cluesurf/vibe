// The model's link moves as exact Eisenstein matrices, so a knit history can be rebuilt as a word of
// code/measure/eisenstein-words and compared with the whole the knit's integer kernels carry.
//
// A link move is a grid table (code/rule/sigma-links, weave.moves.act); code/rule/fear-weave applies it to a
// whole through phaseMove, the same table read on the phase index 3 a + b (the convention fixed 2026-09-26,
// E-QTM-0124). A Clifford element is determined up to a global unit by the permutation it makes of the nine
// phase points (u A(x) u^dagger = A(pi x)), so each link move has exactly one element here, found by matching
// permutations. The displacement T(v) (x -> x + v) is the element a comoving meeting conjugates by.

import { phasePointOperators } from '@/code/measure/grid-weights'
import { applyFirst, cliffordGroup, eisValue, type Mat3, type State9 } from '@/code/measure/eisenstein-words'

// the permutation a Clifford element makes of the nine single-role phase points (phase index 3 a + b), or -1
// entries where a point has no image among them
export function cliffordPointPermutation(g: Mat3): number[] {
  const points = phasePointOperators(1)
  const scale = 3 ** g.den3
  const u = g.num.map(x => eisValue(x, scale))
  const perm: number[] = []

  for (const a of points) {
    const re = new Float64Array(9)
    const im = new Float64Array(9)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let sr = 0
        let si = 0

        for (let k = 0; k < 3; k++) {
          for (let l = 0; l < 3; l++) {
            const [ur, ui] = u[3 * i + k]!
            const ar = a.re[3 * k + l] ?? 0
            const ai = a.im[3 * k + l] ?? 0
            const [vr, vi0] = u[3 * j + l]!
            const vi = -vi0
            const tr = ur * ar - ui * ai
            const ti = ur * ai + ui * ar

            sr += tr * vr - ti * vi
            si += tr * vi + ti * vr
          }
        }

        re[3 * i + j] = sr
        im[3 * i + j] = si
      }
    }

    perm.push(points.findIndex(p => p.re.every((v, k) => Math.abs(v - (re[k] ?? 0)) < 1e-9 && Math.abs((p.im[k] ?? 0) - (im[k] ?? 0)) < 1e-9)))
  }

  return perm
}

export type CliffordTable = {
  group: Mat3[]
  perms: number[][]
  // the element with this point permutation, or throw
  elementOf(perm: readonly number[]): Mat3
  indexOf(perm: readonly number[]): number
  // the displacement x -> x + v, v a phase index
  translation(v: number): Mat3
}

let TABLE: CliffordTable | undefined

export function cliffordTable(): CliffordTable {
  if (TABLE) {
    return TABLE
  }

  const group = cliffordGroup()
  const perms = group.map(cliffordPointPermutation)
  const keys = new Map(perms.map((p, i) => [p.join(','), i]))
  const indexOf = (perm: readonly number[]): number => keys.get(perm.join(',')) ?? -1
  const elementOf = (perm: readonly number[]): Mat3 => {
    const i = indexOf(perm)

    if (i < 0) {
      throw new Error('no Clifford element makes this permutation')
    }

    return group[i]!
  }

  TABLE = {
    group,
    perms,
    elementOf,
    indexOf,
    translation: (v: number) => elementOf(Array.from({ length: 9 }, (_, p) => phasePlus(p, v))),
  }

  return TABLE
}

// phase points added and negated componentwise mod 3 (index 3 a + b)
export function phasePlus(p: number, v: number): number {
  return 3 * ((Math.floor(p / 3) + Math.floor(v / 3)) % 3) + (((p % 3) + (v % 3)) % 3)
}

export function phaseNegate(v: number): number {
  return 3 * ((3 - Math.floor(v / 3)) % 3) + ((3 - (v % 3)) % 3)
}

// exchange the two roles of a state
export function swapRoles(s: State9): State9 {
  return { num: s.num.map((_, i) => s.num[3 * (i % 3) + Math.floor(i / 3)]!), k2: s.k2, m3: s.m3 }
}

// (1 x D) psi
export function applySecond(d: Mat3, s: State9): State9 {
  return swapRoles(applyFirst(d, swapRoles(s)))
}

// D on coordinate c (0 or 1)
export function applyOn(c: number, d: Mat3, s: State9): State9 {
  return c === 0 ? applyFirst(d, s) : applySecond(d, s)
}
