// The paid Z3 string whose vacuum makes pairs. Built for E-FRC-0188, 0189 and 0200 to 0202.
//
// The rule is the paid string of E-FRC-0129 and 0131 (code/rule/string-line on the line, code/rule/string-graph on
// the D4 box), unchanged: matter waits in docks, a hop pays the string, and calm makes a love-fear pair on a link,
// (0, 0) -> (1, -1), when that link's demon can pay 2 mass plus the change in tension. E-FRC-0195 to 0199 ran it
// with the demon capacity (4) below the pair cost (2 x mass 4 = 8), so no pair was ever made or unmade: the
// cold vacuum's own move, pair making at the rest energy (E-SPN-0050, E-FLD-0028/0029), was switched off. Here the
// capacity is raised to twice the pair cost, so the same move is payable.
//
// In the canonical measure the demons impose, a paid link weighs x = e^(-beta tension) and a charge weighs
// y = e^(-beta mass). Summing the charges of every free dock (0, +1, -1 with weights 1, y, y) turns the
// divergence constraint of E-FRC-0195's duality into a field on the Potts spin:
//
//   sum over Z3 fluxes E and free charges of x^(paid) y^(charged) [div E = rho on the static docks]
//     = 3^(-V) sum over Potts spins theta of prod over links (1 + x (w^(dtheta) + w^(-dtheta)))
//                                             prod over free docks (1 + y (w^theta + w^(-theta)))
//                                             prod over static docks w^(-rho theta)
//
// so pair making is a MAGNETIC FIELD h = ln((1 + 2 y) / (1 - y)) on the dual 3-state Potts model. With y = 0 the
// Potts model keeps its global Z3 (theta -> theta + 1), a color singlet's insertion is Z3-neutral, and two singlets
// can be joined only by a Z3-neutral pair of strings: the residual starts at two strings, e^(-2 m r) (E-FRC-0195).
// With y > 0 the field breaks the Z3, a single spin line can end on the field (a string can end on a pair made from
// calm), and ONE string joins two singlets: the residual carries e^(-m r), one-meson exchange, with a y^2 in front.
//
// This file holds: the exact duality with the field on a small graph (integer and Eisenstein polynomials), the
// transfer matrix of the line (exact static potentials between static singlets), shortest-path counts on D4 for
// the leading-order profiles, and the fast measuring half of the D4 runs (compact singlets, their pair histograms).
// Nothing moves: a singlet is read afresh from each snapshot.

import { d4BoxCell, d4BoxCoordinates } from '@/code/substrate/d4-box'
import { graphEnergy, graphGaussHolds, type GraphState, type StringGraph } from '@/code/rule/string-graph'
import {
  addTo,
  boxDisplacement,
  bulkLength,
  fastBeat,
  fastBeatAgrees,
  huskLength,
  lengthKey,
  makeBoxGeometry,
  makeFastGraph,
  seedGas,
  singletPieces,
  type BoxGeometry,
  type LengthHistogram,
} from '@/code/measure/nucleon-gas'
import { makeStringGraph } from '@/code/rule/string-graph'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { SILVER } from '@/code/tool/weyl'

// ---------------------------------------------------------------------------------------------------------
// the exact duality with the field

export type SmallGraph = { readonly docks: number; readonly links: readonly (readonly [number, number])[] }

// a polynomial in x and y with Eisenstein coefficients a + b omega, stored as [xDegree][yDegree] -> [a, b]
export type Eisenstein2 = { readonly xs: number; readonly ys: number; readonly a: Float64Array; readonly b: Float64Array }

function eisenstein2(xs: number, ys: number): Eisenstein2 {
  return { xs, ys, a: new Float64Array(xs * ys), b: new Float64Array(xs * ys) }
}

// A dock of a charge pattern is either free (-1: its charge summed with weight y per charge) or static with the
// given charge 0, 1 or 2 (mod 3, no weight: a static charge's mass is the same in every configuration)
export type Pattern = readonly number[]

// The chain side: sum over Z3 fluxes of x^(paid links) y^(charged free docks), static docks constrained, times 3^V
// (the Potts side carries 3^V), as integer polynomials. `table` is the count of fluxes by divergence vector and paid
// links, computed once per graph.
export type FluxTable = { readonly docks: number; readonly links: number; readonly counts: Float64Array }

export function fluxTable(graph: SmallGraph): FluxTable {
  const v = graph.docks
  const l = graph.links.length
  const divs = 3 ** v
  const counts = new Float64Array(divs * (l + 1))
  const flux = new Int8Array(l)
  const total = 3 ** l

  for (let index = 0; index < total; index++) {
    let rest = index
    let paid = 0
    const div = new Int8Array(v)

    for (let k = 0; k < l; k++) {
      const e = rest % 3

      rest = (rest - e) / 3
      flux[k] = e

      if (e !== 0) {
        paid++

        const [i, j] = graph.links[k] as readonly [number, number]

        div[i] = (((div[i] as number) + e) % 3) as number
        div[j] = (((div[j] as number) - e + 3) % 3) as number
      }
    }

    let key = 0

    for (let i = v - 1; i >= 0; i--) {
      key = key * 3 + (div[i] as number)
    }

    counts[key * (l + 1) + paid] = (counts[key * (l + 1) + paid] as number) + 1
  }

  return { docks: v, links: l, counts }
}

export function chainPolynomial(table: FluxTable, pattern: Pattern): Eisenstein2 {
  const v = table.docks
  const l = table.links
  const out = eisenstein2(l + 1, v + 1)
  const scale = 3 ** v

  for (let key = 0; key < 3 ** v; key++) {
    let rest = key
    let ok = true
    let charged = 0

    for (let i = 0; i < v; i++) {
      const d = rest % 3

      rest = (rest - d) / 3

      const p = pattern[i] as number

      if (p >= 0) {
        ok = ok && d === p
      } else if (d !== 0) {
        charged++
      }
    }

    if (!ok) {
      continue
    }

    for (let paid = 0; paid <= l; paid++) {
      const c = table.counts[key * (l + 1) + paid] as number

      if (c !== 0) {
        out.a[paid * (v + 1) + charged] = (out.a[paid * (v + 1) + charged] as number) + scale * c
      }
    }
  }

  return out
}

// the Potts side: sum over theta of the link, field and insertion factors, exactly
export function pottsPolynomial(graph: SmallGraph, pattern: Pattern): Eisenstein2 {
  const v = graph.docks
  const l = graph.links.length
  const out = eisenstein2(l + 1, v + 1)
  // omega^k as [a, b] in the basis 1, omega: omega^2 = -1 - omega
  const power: [number, number][] = [
    [1, 0],
    [0, 1],
    [-1, -1],
  ]

  for (let t = 0; t < 3 ** v; t++) {
    const theta: number[] = []

    let rest = t

    for (let i = 0; i < v; i++) {
      theta.push(rest % 3)
      rest = Math.floor(rest / 3)
    }

    // prod over links of (1 + c x), c = 2 if the spins agree and -1 otherwise
    let linkPoly = [1]

    for (const [i, j] of graph.links) {
      const c = theta[i] === theta[j] ? 2 : -1
      const next = new Array<number>(linkPoly.length + 1).fill(0)

      linkPoly.forEach((p, k) => {
        next[k] = (next[k] as number) + p
        next[k + 1] = (next[k + 1] as number) + c * p
      })
      linkPoly = next
    }

    // prod over free docks of (1 + c y), c = 2 at theta 0 and -1 otherwise
    let fieldPoly = [1]
    let phase = 0

    for (let i = 0; i < v; i++) {
      const p = pattern[i] as number

      if (p < 0) {
        const c = theta[i] === 0 ? 2 : -1
        const next = new Array<number>(fieldPoly.length + 1).fill(0)

        fieldPoly.forEach((q, k) => {
          next[k] = (next[k] as number) + q
          next[k + 1] = (next[k + 1] as number) + c * q
        })
        fieldPoly = next
      } else {
        phase = (phase + 3 * 3 - ((p * (theta[i] as number)) % 3)) % 3
      }
    }

    const [pa, pb] = power[phase] as [number, number]

    linkPoly.forEach((lp, xi) => {
      fieldPoly.forEach((fp, yi) => {
        const c = lp * fp

        if (c !== 0) {
          out.a[xi * (v + 1) + yi] = (out.a[xi * (v + 1) + yi] as number) + c * pa
          out.b[xi * (v + 1) + yi] = (out.b[xi * (v + 1) + yi] as number) + c * pb
        }
      })
    })
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the line: the transfer matrix over the flux mod 3 of consecutive links

// T(e, e') for one cell between link e and link e'. A free cell: y^([e' != e]) x^([e' != 0]). A static cell of
// charge s: [e' = e + s] x^([e' != 0])
export type Matrix3 = Float64Array

export function freeCell(x: number, y: number): Matrix3 {
  const t = new Float64Array(9)

  for (let e = 0; e < 3; e++) {
    for (let f = 0; f < 3; f++) {
      t[e * 3 + f] = (e === f ? 1 : y) * (f === 0 ? 1 : x)
    }
  }

  return t
}

export function staticCell(x: number, charge: number): Matrix3 {
  const t = new Float64Array(9)

  for (let e = 0; e < 3; e++) {
    const f = (((e + charge) % 3) + 3) % 3

    t[e * 3 + f] = f === 0 ? 1 : x
  }

  return t
}

export function multiply3(a: Matrix3, b: Matrix3): Matrix3 {
  const out = new Float64Array(9)

  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 3; k++) {
      const v = a[i * 3 + k] as number

      if (v === 0) {
        continue
      }

      for (let j = 0; j < 3; j++) {
        out[i * 3 + j] = (out[i * 3 + j] as number) + v * (b[k * 3 + j] as number)
      }
    }
  }

  return out
}

// the eigenvalues of the free transfer matrix, largest first. T = A W with A symmetric (y off the diagonal) and
// W = diag(1, x, x), so W^(1/2) A W^(1/2) is symmetric with the same spectrum; solved by the cubic's trigonometric
// form
export function transferEigenvalues(x: number, y: number): [number, number, number] {
  const w = [1, Math.sqrt(x), Math.sqrt(x)]
  const s = (i: number, j: number): number => (i === j ? 1 : y) * (w[i] as number) * (w[j] as number)
  const a11 = s(0, 0)
  const a22 = s(1, 1)
  const a33 = s(2, 2)
  const a12 = s(0, 1)
  const a13 = s(0, 2)
  const a23 = s(1, 2)
  const p1 = a12 ** 2 + a13 ** 2 + a23 ** 2
  const q = (a11 + a22 + a33) / 3
  const p2 = (a11 - q) ** 2 + (a22 - q) ** 2 + (a33 - q) ** 2 + 2 * p1
  const p = Math.sqrt(p2 / 6)
  const b11 = (a11 - q) / p
  const b22 = (a22 - q) / p
  const b33 = (a33 - q) / p
  const b12 = a12 / p
  const b13 = a13 / p
  const b23 = a23 / p
  const det = b11 * (b22 * b33 - b23 * b23) - b12 * (b12 * b33 - b23 * b13) + b13 * (b12 * b23 - b22 * b13)
  const r = Math.max(-1, Math.min(1, det / 2))
  const phi = Math.acos(r) / 3
  const e1 = q + 2 * p * Math.cos(phi)
  const e3 = q + 2 * p * Math.cos(phi + (2 * Math.PI) / 3)
  const e2 = 3 * q - e1 - e3

  return [e1, e2, e3]
}

// the left and right Perron vectors of the free transfer matrix, by power iteration (the matrix is positive)
export function perron(t: Matrix3): { left: Float64Array; right: Float64Array; value: number } {
  let right = Float64Array.from([1, 1, 1])
  let left = Float64Array.from([1, 1, 1])
  let value = 0

  for (let step = 0; step < 2000; step++) {
    const r = new Float64Array(3)
    const l = new Float64Array(3)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        r[i] = (r[i] as number) + (t[i * 3 + j] as number) * (right[j] as number)
        l[j] = (l[j] as number) + (left[i] as number) * (t[i * 3 + j] as number)
      }
    }

    const nr = Math.hypot(...r)
    const nl = Math.hypot(...l)

    value = nr / Math.hypot(...right)
    right = r.map(v => v / nr)
    left = l.map(v => v / nl)
  }

  return { left, right, value }
}

// The weight of a window of cells (each a free or a static cell) in the infinite line, relative to the vacuum:
// <l| X |r> / (lambda0^(cells) <l|r>)
export function windowWeight(input: { x: number; y: number; cells: readonly (number | 'free')[] }): number {
  const { x, y, cells } = input
  const t = freeCell(x, y)
  const { left, right, value } = perron(t)

  let m: Matrix3 = Float64Array.from([1, 0, 0, 0, 1, 0, 0, 0, 1])

  for (const c of cells) {
    m = multiply3(m, c === 'free' ? t : staticCell(x, c))
  }

  let num = 0
  let den = 0

  for (let i = 0; i < 3; i++) {
    den += (left[i] as number) * (right[i] as number)

    for (let j = 0; j < 3; j++) {
      num += (left[i] as number) * (m[i * 3 + j] as number) * (right[j] as number)
    }
  }

  return num / (value ** cells.length * den)
}

// beta times the static potential between two static objects (lists of charges on consecutive cells) with `gap`
// free cells between them: -ln(Z12 Z0 / (Z1 Z2)), every window of the same length
export function staticPotential(input: { x: number; y: number; first: readonly number[]; second: readonly number[]; gap: number }): number {
  const { x, y, first, second, gap } = input
  const free = (n: number): 'free'[] => new Array<'free'>(n).fill('free')
  const both = windowWeight({ x, y, cells: [...first, ...free(gap), ...second] })
  const none = windowWeight({ x, y, cells: free(first.length + gap + second.length) })
  const one = windowWeight({ x, y, cells: [...first, ...free(gap + second.length)] })
  const two = windowWeight({ x, y, cells: [...free(first.length + gap), ...second] })

  return -Math.log((both * none) / (one * two))
}

// The same static potentials EXACTLY, on a ring of `ring` cells, with x = xNum / xDen and y = yNum / yDen: every
// transfer matrix scaled to whole numbers (a free cell by xDen yDen, a static cell by xDen) and multiplied in
// BigInt. The four partition functions of the double ratio hold the same multiset of free and static cells, so the
// scales cancel and the connected ratio C = Z12 Z0 / (Z1 Z2) - 1 comes out as an exact fraction. On the ring the
// correction to the infinite line is (lambda1 / lambda0)^(ring - window), far below any C read here.
export type Rational = { readonly num: bigint; readonly den: bigint }

type BigMatrix = bigint[]

function bigFree(xNum: bigint, xDen: bigint, yNum: bigint, yDen: bigint): BigMatrix {
  const out: BigMatrix = []

  for (let e = 0; e < 3; e++) {
    for (let f = 0; f < 3; f++) {
      // y^([e != f]) x^([f != 0]) times xDen yDen
      out.push((e === f ? yDen : yNum) * (f === 0 ? xDen : xNum))
    }
  }

  return out
}

function bigStatic(xNum: bigint, xDen: bigint, charge: number): BigMatrix {
  const out: BigMatrix = new Array<bigint>(9).fill(0n)

  for (let e = 0; e < 3; e++) {
    const f = (((e + charge) % 3) + 3) % 3

    out[e * 3 + f] = f === 0 ? xDen : xNum
  }

  return out
}

function bigMultiply(a: BigMatrix, b: BigMatrix): BigMatrix {
  const out: BigMatrix = new Array<bigint>(9).fill(0n)

  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 3; k++) {
      const v = a[i * 3 + k] as bigint

      if (v === 0n) {
        continue
      }

      for (let j = 0; j < 3; j++) {
        out[i * 3 + j] = (out[i * 3 + j] as bigint) + v * (b[k * 3 + j] as bigint)
      }
    }
  }

  return out
}

export function exactConnected(input: {
  x: Rational
  y: Rational
  first: readonly number[]
  second: readonly number[]
  gap: number
  ring: number
}): Rational {
  const { x, y, first, second, gap, ring } = input
  const free = bigFree(x.num, x.den, y.num, y.den)
  const window = first.length + gap + second.length
  const identity: BigMatrix = [1n, 0n, 0n, 0n, 1n, 0n, 0n, 0n, 1n]
  let rest = identity

  for (let i = 0; i < ring - window; i++) {
    rest = bigMultiply(rest, free)
  }

  // With no pairs (y = 0) the free cell is diag(1, x, x) up to its scale, so the infinite line's vacuum is the flux-0
  // vector exactly and a window's weight is the (0, 0) entry of its product: the infinite line, exactly, with no ring.
  // With pairs the ring is used, and its winding sectors add (lambda1 / lambda0)^(ring - window)
  const line = y.num === 0n
  const z = (cells: readonly (number | 'free')[]): bigint => {
    let m = line ? identity : rest

    for (const c of cells) {
      m = bigMultiply(m, c === 'free' ? free : bigStatic(x.num, x.den, c))
    }

    return line ? (m[0] as bigint) : (m[0] as bigint) + (m[4] as bigint) + (m[8] as bigint)
  }
  const pad = (n: number): 'free'[] => new Array<'free'>(n).fill('free')
  const both = z([...first, ...pad(gap), ...second])
  const none = z(pad(window))
  const one = z([...first, ...pad(gap + second.length)])
  const two = z([...pad(first.length + gap), ...second])

  return { num: both * none - one * two, den: one * two }
}

// a fraction as a double, without overflow
export function rationalValue(r: Rational): number {
  if (r.num === 0n) {
    return 0
  }

  const sign = (r.num < 0n ? -1 : 1) * (r.den < 0n ? -1 : 1)
  const n = r.num < 0n ? -r.num : r.num
  const d = r.den < 0n ? -r.den : r.den
  const shift = BigInt(Math.max(0, n.toString(2).length - 60))
  const dshift = BigInt(Math.max(0, d.toString(2).length - 60))

  return sign * (Number(n >> shift) / Number(d >> dshift)) * 2 ** (Number(shift) - Number(dshift))
}

// ln of a positive fraction, exactly enough for a rate
export function rationalLog(r: Rational): number {
  const n = r.num < 0n ? -r.num : r.num
  const d = r.den < 0n ? -r.den : r.den
  const nb = n.toString(2).length
  const db = d.toString(2).length
  const ns = BigInt(Math.max(0, nb - 60))
  const ds = BigInt(Math.max(0, db - 60))

  return Math.log(Number(n >> ns)) - Math.log(Number(d >> ds)) + (Number(ns) - Number(ds)) * Math.LN2
}

// the static baryon of the line, three loves on consecutive cells, as an exact matrix over the flux mod 3
export function lineBaryon(x: Rational): BigMatrix {
  return bigMultiply(bigMultiply(bigStatic(x.num, x.den, 1), bigStatic(x.num, x.den, 1)), bigStatic(x.num, x.den, 1))
}

// The line rule's OWN measure. Its pair move is (0, 0) -> (1, -1) on a link oriented rightward, so a pair is born with
// the love on the left, charges never pass one another, and a pair unmakes only as love-left: the integer flux, 0 at
// the start, stays at least 0 on every link (each move keeps it: a proof by cases in E-FRC-0189's header). The rule
// therefore samples paths of integer flux E >= 0, weight x^([E mod 3 != 0]) per link and y per step of E, not the
// mod-3 paths of the transfer matrix above, which also count the fear-left orientation. This is that measure, the
// flux levels truncated at `levels`: the charge density, the paid fraction, and the chance per cell that a piece of
// paid flux holding exactly one love and one fear, d cells apart with no charge between, starts there (both
// orientations, from every level a = 0 mod 3).
export function orderedLineMeasure(input: { x: number; y: number; levels: number; profile: number; gaps?: number }): {
  lambda0: number
  charges: number
  paid: number
  profile: number[]
  connected: number[]
} {
  const { x, y, levels } = input
  const n = levels + 1
  const t = new Float64Array(n * n)

  for (let e = 0; e < n; e++) {
    for (let f = Math.max(0, e - 1); f <= Math.min(levels, e + 1); f++) {
      t[e * n + f] = (e === f ? 1 : y) * (f % 3 === 0 ? 1 : x)
    }
  }

  let right = new Float64Array(n).fill(1)
  let left = new Float64Array(n).fill(1)
  let value = 1

  for (let step = 0; step < 5000; step++) {
    const r = new Float64Array(n)
    const l = new Float64Array(n)

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        r[i] = (r[i] as number) + (t[i * n + j] as number) * (right[j] as number)
        l[j] = (l[j] as number) + (left[i] as number) * (t[i * n + j] as number)
      }
    }

    const nr = Math.hypot(...r)
    const nl = Math.hypot(...l)

    value = nr / Math.hypot(...right)
    right = r.map(v => v / nr)
    left = l.map(v => v / nl)
  }

  const lr = left.reduce((a, v, i) => a + v * (right[i] as number), 0)
  let charges = 0
  let paid = 0

  for (let e = 0; e < n; e++) {
    paid += e % 3 !== 0 ? ((left[e] as number) * (right[e] as number)) / lr : 0

    for (let f = 0; f < n; f++) {
      if (e !== f) {
        charges += ((left[e] as number) * (t[e * n + f] as number) * (right[f] as number)) / (value * lr)
      }
    }
  }

  const profile = Array.from({ length: input.profile + 1 }, (_, d) => {
    if (d === 0) {
      return 0
    }

    let sum = 0

    for (let a = 0; a < n; a += 3) {
      for (const b of [a - 1, a + 1]) {
        if (b < 0 || b > levels) {
          continue
        }

        // level a (unpaid), a charge to b, d - 1 calm cells at b, the opposite charge back to a
        sum += ((left[a] as number) * y * x * x ** (d - 1) * y * (right[a] as number)) / (value ** (d + 1) * lr)
      }
    }

    return sum
  })

  // the connected ratio of two static love-left mesons with `gap` free cells between, on the infinite line of this
  // measure: static cells step the level by their charge with no y, and must stay inside 0 .. levels
  const staticStep = (charge: number): Float64Array => {
    const s = new Float64Array(n * n)

    for (let e = 0; e < n; e++) {
      const f = e + charge

      if (f >= 0 && f < n) {
        s[e * n + f] = f % 3 === 0 ? 1 : x
      }
    }

    return s
  }
  const times = (a: Float64Array, b: Float64Array): Float64Array => {
    const out = new Float64Array(n * n)

    for (let i = 0; i < n; i++) {
      for (let k = 0; k < n; k++) {
        const v = a[i * n + k] as number

        if (v !== 0) {
          for (let j = 0; j < n; j++) {
            out[i * n + j] = (out[i * n + j] as number) + v * (b[k * n + j] as number)
          }
        }
      }
    }

    return out
  }
  const weight = (cells: readonly (number | 'free')[]): number => {
    let m = new Float64Array(n * n)

    for (let i = 0; i < n; i++) {
      m[i * n + i] = 1
    }

    for (const c of cells) {
      m = times(m, c === 'free' ? t : staticStep(c))
    }

    let s = 0

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        s += (left[i] as number) * (m[i * n + j] as number) * (right[j] as number)
      }
    }

    return s / (value ** cells.length * lr)
  }
  const connected = Array.from({ length: (input.gaps ?? 0) + 1 }, (_, gap) => {
    const pad = (k: number): 'free'[] => new Array<'free'>(k).fill('free')
    const both = weight([1, -1, ...pad(gap), 1, -1])
    const none = weight(pad(gap + 4))
    const one = weight([1, -1, ...pad(gap + 2)])
    const two = weight([...pad(gap + 2), 1, -1])

    return (both * none) / (one * two) - 1
  })

  return { lambda0: value, charges, paid, profile, connected }
}

// ---------------------------------------------------------------------------------------------------------
// D4: shortest paths, for the leading-order profile of one string

// the number of shortest root paths from the origin to every D4 vector within graph distance `reach`, keyed by
// the vector, by breadth-first layers
export function shortestPaths(reach: number): Map<string, { vector: number[]; length: number; count: number }> {
  const roots = rootsD4()
  const out = new Map<string, { vector: number[]; length: number; count: number }>()
  let layer = new Map<string, { vector: number[]; count: number }>([['0,0,0,0', { vector: [0, 0, 0, 0], count: 1 }]])

  out.set('0,0,0,0', { vector: [0, 0, 0, 0], length: 0, count: 1 })

  for (let n = 1; n <= reach; n++) {
    const next = new Map<string, { vector: number[]; count: number }>()

    for (const { vector, count } of layer.values()) {
      for (const r of roots) {
        const v = vector.map((a, k) => a + (r[k] ?? 0))
        const key = v.join(',')

        if (out.has(key)) {
          continue
        }

        const entry = next.get(key)

        if (entry) {
          entry.count += count
        } else {
          next.set(key, { vector: v, count })
        }
      }
    }

    for (const [key, entry] of next) {
      out.set(key, { vector: entry.vector, length: n, count: entry.count })
    }

    layer = next
  }

  return out
}

// The leading-order profile of one string of weight x per link from the origin: at each D4 vector v, N(v) x^n(v)
// with n the fewest roots and N the shortest paths, per dock of each bulk shell, and column-summed per husk dock of
// each husk shell (the husk drops the depth coordinate, code/measure/photon-husk). Returned as shells of (r, value,
// count), the form code/measure/nucleon-gas ornsteinZernikeRate fits.
export function leadingProfile(input: { x: number; reach: number }): { bulk: { r: number; value: number; count: number }[]; husk: { r: number; value: number; count: number }[] } {
  const paths = shortestPaths(input.reach)
  const bulk = new Map<number, { sum: number; count: number }>()
  const columns = new Map<string, { sum: number; key: number }>()

  for (const { vector, length, count } of paths.values()) {
    if (length === 0) {
      continue
    }

    const weight = count * input.x ** length
    const bulkKey = vector.reduce((a, b) => a + b * b, 0)
    const b = bulk.get(bulkKey) ?? { sum: 0, count: 0 }

    b.sum += weight
    b.count += 1
    bulk.set(bulkKey, b)

    const column = `${vector[0]},${vector[1]},${vector[2]}`
    const c = columns.get(column) ?? { sum: 0, key: (vector[0] ?? 0) ** 2 + (vector[1] ?? 0) ** 2 + (vector[2] ?? 0) ** 2 }

    c.sum += weight
    columns.set(column, c)
  }

  const husk = new Map<number, { sum: number; count: number }>()

  for (const c of columns.values()) {
    if (c.key === 0) {
      continue
    }

    const h = husk.get(c.key) ?? { sum: 0, count: 0 }

    h.sum += c.sum
    h.count += 1
    husk.set(c.key, h)
  }

  const shells = (m: Map<number, { sum: number; count: number }>): { r: number; value: number; count: number }[] =>
    [...m.entries()].map(([key, s]) => ({ r: Math.sqrt(key), value: s.sum / s.count, count: s.count })).sort((a, b) => a.r - b.r)

  return { bulk: shells(bulk), husk: shells(husk) }
}

// ---------------------------------------------------------------------------------------------------------
// D4 runs: compact singlets and their pair histograms, fast

// the doubled midpoint data of every link: its first dock's basis coordinates and the root's D4 vector
export type LinkTable = {
  readonly side: number
  readonly coordinates: Int32Array
  readonly step: Int32Array
}

export function linkTable(graph: StringGraph, geometry: BoxGeometry): LinkTable {
  const side = geometry.side
  const coordinates = new Int32Array(graph.links.length * 4)
  const step = new Int32Array(graph.links.length * 4)

  graph.links.forEach(([a, b], l) => {
    const c = d4BoxCoordinates({ cell: a, side })
    // the link's root, read as the minimal-image D4 vector from its first dock to its second
    const r = boxDisplacement(geometry, b, a)

    for (let k = 0; k < 4; k++) {
      coordinates[l * 4 + k] = c[k] ?? 0
      step[l * 4 + k] = r[k] ?? 0
    }
  })

  return { side, coordinates, step }
}

// the squared bulk and husk lengths (times 4) of the midpoint displacement of two links, through the box's
// minimal-image table: the same geometry as code/measure/nucleon-gas midpointDisplacement, without allocation
export function midpointKeys(input: { table: LinkTable; geometry: BoxGeometry; first: number; second: number; out: Int32Array }): void {
  const { table, geometry, first, second, out } = input
  const side = table.side
  let index = 0
  let place = 1

  for (let k = 0; k < 4; k++) {
    const d = (table.coordinates[second * 4 + k] as number) - (table.coordinates[first * 4 + k] as number)

    index += (((d % side) + side) % side) * place
    place *= side
  }

  const base = geometry.minimal[index] as readonly number[]
  let bulk = 0
  let husk = 0

  for (let k = 0; k < 4; k++) {
    // doubled: 2 base + (s2 - s1)
    const v = 2 * (base[k] as number) + (table.step[second * 4 + k] as number) - (table.step[first * 4 + k] as number)

    bulk += v * v
    husk += k < 3 ? v * v : 0
  }

  // (v / 2)^2 times 4 is v^2
  out[0] = bulk
  out[1] = husk
}

// the dock index of a basis-coordinate difference, for dock-to-dock displacements
export function dockDifference(input: { geometry: BoxGeometry; a: number; b: number }): readonly number[] {
  const { geometry, a, b } = input
  const ca = geometry.coordinates[a] ?? []
  const cb = geometry.coordinates[b] ?? []

  return geometry.minimal[d4BoxCell({ coordinates: ca.map((x, k) => x - (cb[k] ?? 0)), side: geometry.side })] ?? []
}

// The compact singlets of one snapshot, from its pieces: mesons whose piece is one paid link between a love and a
// fear (their link), and baryons whose piece is two paid links through three loves or three fears (their middle
// dock, the dock the two links share)
export type Compact = { readonly mesons: number[]; readonly baryons: number[]; readonly mesonDocks: number[][]; readonly baryonDocks: number[][] }

export function compactSinglets(graph: StringGraph, pieces: readonly { loves: number[]; fears: number[]; links: number[]; paid: number }[]): Compact {
  const mesons: number[] = []
  const mesonDocks: number[][] = []
  const baryons: number[] = []
  const baryonDocks: number[][] = []

  for (const p of pieces) {
    if (p.loves.length === 1 && p.fears.length === 1 && p.paid === 1) {
      const l = p.links[0] as number

      mesons.push(l)
      mesonDocks.push([p.loves[0] as number, p.fears[0] as number])
    } else if (p.paid === 2 && ((p.loves.length === 3 && p.fears.length === 0) || (p.fears.length === 3 && p.loves.length === 0))) {
      const [a, b] = graph.links[p.links[0] as number] as readonly [number, number, number]
      const [c, d] = graph.links[p.links[1] as number] as readonly [number, number, number]

      baryons.push(a === c || a === d ? a : b)
      baryonDocks.push(p.loves.length === 3 ? [...p.loves] : [...p.fears])
    }
  }

  return { mesons, baryons, mesonDocks, baryonDocks }
}

// the squared bulk and husk lengths (times 4) from a dock to the midpoint of a link: doubled coordinates again
export function dockLinkKeys(input: { table: LinkTable; geometry: BoxGeometry; dock: number; link: number; out: Int32Array }): void {
  const { table, geometry, dock, link, out } = input
  const side = table.side
  const c = geometry.coordinates[dock] as readonly number[]
  let index = 0
  let place = 1

  for (let k = 0; k < 4; k++) {
    const d = (table.coordinates[link * 4 + k] as number) - (c[k] as number)

    index += (((d % side) + side) % side) * place
    place *= side
  }

  const base = geometry.minimal[index] as readonly number[]
  let bulk = 0
  let husk = 0

  for (let k = 0; k < 4; k++) {
    const v = 2 * (base[k] as number) + (table.step[link * 4 + k] as number)

    bulk += v * v
    husk += k < 3 ? v * v : 0
  }

  out[0] = bulk
  out[1] = husk
}

// A gas run of the pair-making rule. The demons of code/rule/string-graph only stream and never merge, so a vacuum
// whose demons all start at 0 or 1 can never gather a pair's cost on one link and stays frozen (the probe that found
// this: tmp/bind-d4-probe-a.log). The demons here start at whole values from 0 to the capacity, drawn by the silver
// Weyl sequence from the truncated geometric law q^d (the canonical demon law at e^(-beta) = q), so the vacuum can
// pay for pairs from the first beat. Seeds are code/measure/nucleon-gas seedGas. The rule is code/rule/string-graph,
// unchanged, run by nucleon-gas fastBeat after checking it against graphBeat bit for bit from this start.
export function runPairGas(input: {
  graph: StringGraph
  mesons: number
  baryons: number
  // the demon law's ratio at the start
  q: number
  settle: number
  beats: number
  every: number
  look: (state: GraphState, beat: number) => void
}): { meanDemon: number; exact: boolean; agrees: boolean; startEnergy: number } {
  const { graph, mesons, baryons, q, settle, beats, every, look } = input
  const seeded = seedGas({ graph, mesons, baryons })
  const weights = Array.from({ length: graph.capacity + 1 }, (_, d) => q ** d)
  const total = weights.reduce((a, b) => a + b, 0)
  const cumulative = weights.map((_, d) => weights.slice(0, d + 1).reduce((a, b) => a + b, 0) / total)
  const demon = Int32Array.from({ length: graph.links.length }, (_, l) => {
    const u = ((l + 1) * SILVER) % 1

    return cumulative.findIndex(c => u < c)
  })
  const start: GraphState = { ...seeded, demon }
  const e0 = graphEnergy(graph, start)
  const agrees = fastBeatAgrees(graph, start, 40)
  const fast = makeFastGraph(graph)
  const s: GraphState = { vibe: Int8Array.from(start.vibe), flux: Int32Array.from(start.flux), demon: Int32Array.from(start.demon) }

  let exact = graphGaussHolds(graph, start)
  let demonSum = 0
  let samples = 0

  for (let t = 0; t < settle + beats; t++) {
    fastBeat(fast, s)

    if (t >= settle && (t - settle) % every === 0) {
      if (samples % 25 === 0) {
        exact = exact && graphEnergy(graph, s) === e0 && graphGaussHolds(graph, s)
      }

      let d = 0

      for (let l = 0; l < graph.links.length; l++) {
        d += s.demon[l] as number
      }

      demonSum += d / graph.links.length
      samples += 1
      look(s, t)
    }
  }

  exact = exact && graphEnergy(graph, s) === e0 && graphGaussHolds(graph, s)

  return { meanDemon: demonSum / Math.max(1, samples), exact, agrees, startEnergy: e0 }
}

// ---------------------------------------------------------------------------------------------------------
// The D4 pair vacuum measured: one run of the pair-making rule, read for the three questions of E-FRC-0200 to 0202
// (the residual between compact singlets, their contact, and a baryon against a meson). Every histogram is keyed by 4
// times a squared length (bulk, and husk with the depth dropped). The ideal reference is MIXED EVENTS: each
// snapshot's compact singlets are paired with those of the snapshot `lag` reads earlier, which share the box and the
// density but not the moment, so the ratio real / mixed reads the correlation with every geometric factor of the box
// divided out (pairs that would share a dock are dropped from the mixed count, as no real pair can share one). Real
// pairs are normalized by N (N - 1) / 2 per snapshot and mixed by N_t N_(t - lag), so g -> 1 wherever there is no
// correlation, without forcing any shell.

export type PairHistograms = {
  readonly bulk: Float64Array
  readonly husk: Float64Array
  norm: number
}

export type PairVacuum = {
  readonly beta: number
  readonly x: number
  readonly y: number
  readonly meanDemon: number
  readonly exact: boolean
  readonly agrees: boolean
  readonly reads: number
  readonly chargesPerDock: number
  readonly fewestCharges: number
  readonly mostCharges: number
  readonly compactMesonsPerRead: number
  readonly compactBaryonsPerRead: number
  // pieces holding four of one charge and one of the other, per read, and two and two
  readonly fourOnePerRead: number
  readonly twoTwoPerRead: number
  // the love-fear displacement of every piece holding exactly one love and one fear
  readonly profile: { bulk: LengthHistogram; husk: LengthHistogram; pieces: number }
  readonly mesonPairs: { real: PairHistograms; mixed: PairHistograms }
  readonly baryonMeson: { real: PairHistograms; mixed: PairHistograms }
  readonly geometry: BoxGeometry
}

const KEYS = 4096

// The one parameter set of E-FRC-0200 to 0202, so the three read the same two runs: mass 2 and tension 3 (a string's
// break costs 2 mass - tension = 1, the pair cost is 7), the side-9 D4 box, 24 mesons and 4 baryon-antibaryon pairs
// seeded (matter to carry energy between demons, E-FRC-0189's lesson), demons from q = 0.35, 40,000 beats read every
// 4th, mixed events 250 reads back. The pair run's demons hold twice the pair cost; the control's hold 6, one below
// it, so the control can neither make nor unmake a pair.
export const PAIR_VACUUM = {
  side: 9,
  mass: 2,
  tension: 3,
  capacity: 14,
  controlCapacity: 6,
  q: 0.35,
  mesons: 24,
  baryons: 4,
  settle: 2000,
  beats: 40000,
  every: 4,
  lag: 250,
} as const

export function pairVacuumPair(): { paired: PairVacuum; control: PairVacuum } {
  const p = PAIR_VACUUM
  const common = { side: p.side, mass: p.mass, tension: p.tension, q: p.q, mesons: p.mesons, baryons: p.baryons, settle: p.settle, beats: p.beats, every: p.every, lag: p.lag }

  return { paired: pairVacuumRun({ ...common, capacity: p.capacity }), control: pairVacuumRun({ ...common, capacity: p.controlCapacity }) }
}

function histograms(): PairHistograms {
  return { bulk: new Float64Array(KEYS), husk: new Float64Array(KEYS), norm: 0 }
}

export function pairVacuumRun(input: {
  side: number
  mass: number
  tension: number
  capacity: number
  q: number
  mesons: number
  baryons: number
  settle: number
  beats: number
  every: number
  lag: number
}): PairVacuum {
  const { side, lag } = input
  const graph = makeStringGraph({ mesh: d4BoxMesh({ side }), mass: input.mass, tension: input.tension, capacity: input.capacity })
  const geometry = makeBoxGeometry(side)
  const table = linkTable(graph, geometry)
  const keys = new Int32Array(2)
  const profile = { bulk: new Map() as LengthHistogram, husk: new Map() as LengthHistogram, pieces: 0 }
  const mesonPairs = { real: histograms(), mixed: histograms() }
  const baryonMeson = { real: histograms(), mixed: histograms() }
  // the ring of past reads: compact mesons (links and docks) and baryons (middle docks and docks)
  const past: Compact[] = []
  const shares = (a: readonly number[], b: readonly number[]): boolean => a.some(d => b.includes(d))

  let reads = 0
  let charges = 0
  let fewest = Infinity
  let most = 0
  let compactMesons = 0
  let compactBaryons = 0
  let fourOne = 0
  let twoTwo = 0

  const out = runPairGas({
    graph,
    mesons: input.mesons,
    baryons: input.baryons,
    q: input.q,
    settle: input.settle,
    beats: input.beats,
    every: input.every,
    look: state => {
      reads++

      let here = 0

      for (let x = 0; x < state.vibe.length; x++) {
        here += state.vibe[x] !== 0 ? 1 : 0
      }

      charges += here
      fewest = Math.min(fewest, here)
      most = Math.max(most, here)

      const pieces = singletPieces(graph, state)

      for (const p of pieces) {
        if (p.loves.length === 1 && p.fears.length === 1) {
          const v = boxDisplacement(geometry, p.fears[0] as number, p.loves[0] as number)

          addTo(profile.bulk, lengthKey(bulkLength(v) ** 2))
          addTo(profile.husk, lengthKey(huskLength(v) ** 2))
          profile.pieces++
        }

        fourOne += (p.loves.length === 4 && p.fears.length === 1) || (p.loves.length === 1 && p.fears.length === 4) ? 1 : 0
        twoTwo += p.loves.length === 2 && p.fears.length === 2 ? 1 : 0
      }

      const now = compactSinglets(graph, pieces)
      const n = now.mesons.length

      compactMesons += n
      compactBaryons += now.baryons.length

      // real meson pairs
      mesonPairs.real.norm += (n * (n - 1)) / 2

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          midpointKeys({ table, geometry, first: now.mesons[i] as number, second: now.mesons[j] as number, out: keys })
          mesonPairs.real.bulk[keys[0] as number] = (mesonPairs.real.bulk[keys[0] as number] as number) + 1
          mesonPairs.real.husk[keys[1] as number] = (mesonPairs.real.husk[keys[1] as number] as number) + 1
        }
      }

      // real baryon-meson pairs
      baryonMeson.real.norm += now.baryons.length * n

      now.baryons.forEach(b => {
        for (const l of now.mesons) {
          dockLinkKeys({ table, geometry, dock: b, link: l, out: keys })
          baryonMeson.real.bulk[keys[0] as number] = (baryonMeson.real.bulk[keys[0] as number] as number) + 1
          baryonMeson.real.husk[keys[1] as number] = (baryonMeson.real.husk[keys[1] as number] as number) + 1
        }
      })

      // mixed: this read against the read `lag` earlier
      if (past.length === lag) {
        const then = past.shift() as Compact

        mesonPairs.mixed.norm += n * then.mesons.length
        baryonMeson.mixed.norm += now.baryons.length * then.mesons.length

        now.mesons.forEach((l, i) => {
          then.mesons.forEach((m, j) => {
            if (shares(now.mesonDocks[i] as number[], then.mesonDocks[j] as number[])) {
              return
            }

            midpointKeys({ table, geometry, first: l, second: m, out: keys })
            mesonPairs.mixed.bulk[keys[0] as number] = (mesonPairs.mixed.bulk[keys[0] as number] as number) + 1
            mesonPairs.mixed.husk[keys[1] as number] = (mesonPairs.mixed.husk[keys[1] as number] as number) + 1
          })
        })

        now.baryons.forEach((b, i) => {
          then.mesons.forEach((m, j) => {
            if (shares(now.baryonDocks[i] as number[], then.mesonDocks[j] as number[])) {
              return
            }

            dockLinkKeys({ table, geometry, dock: b, link: m, out: keys })
            baryonMeson.mixed.bulk[keys[0] as number] = (baryonMeson.mixed.bulk[keys[0] as number] as number) + 1
            baryonMeson.mixed.husk[keys[1] as number] = (baryonMeson.mixed.husk[keys[1] as number] as number) + 1
          })
        })
      }

      past.push(now)
    },
  })
  const beta = unitDemonBeta({ meanDemon: out.meanDemon, capacity: input.capacity })

  return {
    beta,
    x: Math.exp(-beta * input.tension),
    y: Math.exp(-beta * input.mass),
    meanDemon: out.meanDemon,
    exact: out.exact,
    agrees: out.agrees,
    reads,
    chargesPerDock: charges / (reads * graph.mesh.cellCount),
    fewestCharges: fewest,
    mostCharges: most,
    compactMesonsPerRead: compactMesons / reads,
    compactBaryonsPerRead: compactBaryons / reads,
    fourOnePerRead: fourOne / reads,
    twoTwoPerRead: twoTwo / reads,
    profile,
    mesonPairs,
    baryonMeson,
    geometry,
  }
}

// One shell of g(R) - 1 from real and mixed histograms: the excess and its Poisson error
export type Shell = { readonly r: number; readonly g: number; readonly sigma: number; readonly real: number; readonly mixed: number }

export function correlationShells(pair: { real: PairHistograms; mixed: PairHistograms }, which: 'bulk' | 'husk'): Shell[] {
  const real = pair.real[which]
  const mixed = pair.mixed[which]
  const out: Shell[] = []

  for (let key = 1; key < KEYS; key++) {
    const r = real[key] as number
    const m = mixed[key] as number

    if (m <= 0) {
      continue
    }

    const g = r / pair.real.norm / (m / pair.mixed.norm)
    // Poisson on both counts
    const sigma = g * Math.sqrt(1 / Math.max(r, 1) + 1 / m)

    out.push({ r: Math.sqrt(key / 4), g, sigma, real: r, mixed: m })
  }

  return out
}
