// THE SLIDE'S TT SPEED AT ANY c (E-SPN-0145, re-reading E-GRV-0141). E-GRV-0141 found that the full dock slide at cubic
// order ties the cross polarization's gradient to -c^2 times its inertia, for c = 1, 2 and 3, where c is the slide's own
// speed (x^0 = c t). c enters only as a residue mod p (its inverse in the time component's transport, its square in the
// tie), so the same reading runs at c = 1/2, the one-body limiting speed E-SPN-0143 found under the swap coin: c* = c/2 in
// the stream's units is the residue (p + 1) / 2. This file repeats E-GRV-0141's Y2 reading (the cross polarization along
// an axis and along a face diagonal: inertia mu rank 1, (mu, gamma) rank 1, gamma + c^2 mu rank 0, mixing rank 0) for
// the full slide at a given c, with the same ansatz (every O_h-invariant quadratic plus cubic two-derivative Lagrangian
// in h, N, n and the doublet) and the same functionals, so a pass at c = (p + 1)/2 says the slide carried at c* puts the
// graviton at c*.
//
// DETERMINISM and EXACTNESS: every count is an exact rank over GF(p). Nothing is drawn.

import { addScaled, nullSpaceOfRows, parseMono, type Poly } from '@/code/algebra/jet-polynomial'
import { rankMod } from '@/code/algebra/linear/modular-linear'
import { cubicAnsatz, kernelKey as k, monomialRows, quadraticKernel, rowContext, type Ansatz } from '@/code/measure/cubic-slide'

const XY = 3
const XZ = 4
const YZ = 5

type Functional = readonly (readonly [string, number])[]

let ANSATZ: Ansatz | undefined

export type SlideTie = { invariant: number; mu: number; pair: number; tied: number; decoupled: number; faceMu: number; facePair: number; faceTied: number; faceDecoupled: number; speedAtC: boolean }

// E-GRV-0141's Y2 functionals on the full slide's invariant family at speed residue c mod p
// (`tie`, default c: the speed the tie gamma + tie^2 mu = 0 is read at; a tie other than the slide's is the control)
export function slideTied(c: number, p: number, tie = c): SlideTie {
  const ansatz = (ANSATZ = ANSATZ ?? cubicAnsatz(12, true))
  const width = ansatz.columns.length
  const ctx = rowContext({ kind: 'full', c, p, doublet: true }, 2)
  const memo = new Map<string, Poly>()
  const rows = new Map<string, Map<number, number>>()

  ansatz.columns.forEach((column, col) => {
    const total: Poly = new Map()

    for (const [key, coef] of column) {
      let r = memo.get(key)

      if (!r) {
        r = monomialRows(ctx, parseMono(key))
        memo.set(key, r)
      }
      addScaled(total, r, ((coef % p) + p) % p, p)
    }
    for (const [rk, val] of total) {
      if (!rows.has(rk)) rows.set(rk, new Map())
      rows.get(rk)!.set(col, val)
    }
  })

  const { basis } = nullSpaceOfRows(rows.values(), width, p)
  const dim = basis.length
  const kernels = ansatz.columns.map((column, col) => {
    if (!ansatz.quadratic[col]) return new Map<string, number>()

    const modded: Poly = new Map()

    addScaled(modded, column, 1, p)

    return quadraticKernel(modded, p)
  })
  const members = basis.map(theta => {
    const out: Poly = new Map()

    theta.forEach((x, col) => x !== 0 && kernels[col]!.size > 0 && addScaled(out, kernels[col]!, x, p))

    return out
  })
  const mod = (x: number): number => ((x % p) + p) % p
  const value = (f: Functional, m: Poly): number => f.reduce((t, [key, w]) => (t + ((m.get(key) ?? 0) * mod(w)) % p) % p, 0)
  const rank = (fs: readonly Functional[]): number => (dim === 0 || fs.length === 0 ? 0 : rankMod(fs.map(f => members.map(m => value(f, m))), dim, p))
  const one = (key: string): Functional => [[key, 1]]
  // c^2 mod p without leaving the exact integer range
  const c2 = Number((BigInt(tie) * BigInt(tie)) % BigInt(p))
  const mu = one(k(XY, XY, 0, 0))
  const gamma = one(k(XY, XY, 3, 3))
  const tied: Functional = [
    [k(XY, XY, 3, 3), 1],
    [k(XY, XY, 0, 0), c2],
  ]
  const decoupled: Functional[] = [one(k(XY, XY, 0, 3))]

  for (let b = 0; b < 12; b++) if (b !== XY) for (const [m, n] of [[0, 0], [0, 3], [3, 3]] as const) decoupled.push(one(k(XY, b, m, n)))

  const face = (m: number, n: number): Functional => [
    [k(XZ, XZ, m, n), 1],
    [k(YZ, YZ, m, n), 1],
    [k(XZ, YZ, m, n), -1],
  ]
  const faceMu = face(0, 0)
  const faceGamma = [...face(1, 1), ...face(2, 2), ...face(1, 2)]
  const faceTied: Functional = [...faceGamma, ...faceMu.map(([key, w]): [string, number] => [key, Number((2n * BigInt(c2) * BigInt(mod(w))) % BigInt(p))])]
  const faceDecoupled = [[...face(0, 1), ...face(0, 2)]]
  const r = {
    invariant: dim,
    mu: rank([mu]),
    pair: rank([mu, gamma]),
    tied: rank([tied]),
    decoupled: rank(decoupled),
    faceMu: rank([faceMu]),
    facePair: rank([faceMu, faceGamma]),
    faceTied: rank([faceTied]),
    faceDecoupled: rank(faceDecoupled),
  }

  return { ...r, speedAtC: r.mu === 1 && r.pair === 1 && r.tied === 0 && r.decoupled === 0 && r.faceMu === 1 && r.facePair === 1 && r.faceTied === 0 && r.faceDecoupled === 0 }
}
