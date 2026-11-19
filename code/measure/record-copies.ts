// A FRIEND'S RECORD COPIED BY THE RULE'S OWN MEETING (the circuit of E-QTM-0200, shared from here so later experiments
// read it without importing an experiment). Registers on code/measure/rule-gates: the system S is love A (its
// direction and its point 0), the friend F a love whose point is its memory (1 with a record, 0 without), and the
// copies G_1 .. G_k loves with points 2 .. k + 1. Steps: the coin on start R, F records (the line of two on A and F,
// arm R), then the record is copied by the same meeting, STAR (F meets G_1, then G_2, .., G_k) or CHAIN (F meets G_1,
// G_1 meets G_2, ..). The source undo is two more A-F meetings on arm R, then the coin.
//
// READINGS (as E-QTM-0200, the same formulas): the reduced spectra of any set of registers (the Gram matrix of the
// smaller side, the global state pure), von Neumann entropies in bits, the exact fidelity of the A-F reduced state with
// a pure A-F state, and the redundancy R_delta (the most pairwise disjoint nonempty fragments X of {F, G_1 .. G_k} with
// I(S : X) >= (1 - delta) H(S)), by exact search over every fragment.
//
// DETERMINISM: the circuit is exact in Q(w); the spectra are floats (Householder and QL). No random number, every
// fragment enumerated. NOTHING MOVES: every gate is a take within one line of one dock.

import {
  add,
  apply,
  coinGate,
  conj,
  dirOf,
  eq,
  float,
  lineOfTwo,
  mul,
  norm,
  ONE,
  pointsOf,
  qw,
  start,
  sub,
  totalWeight,
  weightWhere,
  ZERO,
  type Gate,
  type Qw,
  type State,
} from '@/code/measure/rule-gates'
import { hermitianEigenvaluesTridiagonal } from '@/code/algebra/linear/eig-hermitian-tridiagonal'

// the friend's index in the point list (A 0, F 1, G_j j + 1)
export const FRIEND = 1
// the helper size of B_S: F as a free helper of 9 values
export const HELPER = 9

export type Schedule = 'star' | 'chain'

// the copy meetings of k copies: holder indices into the point list
export function copyMeetings(k: number, schedule: Schedule): [number, number][] {
  const out: [number, number][] = []

  for (let j = 1; j <= k; j++) {
    out.push(schedule === 'star' ? [FRIEND, j + 1] : [j, j + 1])
  }

  return out
}

export const startPoints = (k: number, record: boolean): number[] => [
  0,
  record ? 1 : 0,
  ...Array.from({ length: k }, (_, j) => j + 2),
]

export const prepared = (points: number[]): State => apply(start('R', points), coinGate)

export const friendMeasures = (s: State): State => apply(s, lineOfTwo(0, FRIEND, 'R'))

export function wignerUndo(s: State): State {
  let t = apply(s, lineOfTwo(0, FRIEND, 'R'))

  t = apply(t, lineOfTwo(0, FRIEND, 'R'))

  return apply(t, coinGate)
}

export const readS = (s: State): Qw[] =>
  ['R', 'L'].map(f => weightWhere(s, l => dirOf(l) === f))

export const l1 = (p: Qw[], q: Qw[]): Qw => {
  let total = ZERO

  for (let i = 0; i < p.length; i++) {
    const d = sub(p[i]!, q[i]!)

    // the readings are rationals (b = 0)
    total = add(total, d.a < 0n ? qw(-d.a, 0n, d.d) : d)
  }

  return total
}

// ---- reduced states ----

// a register of a label: 0 the direction, 1 + i point i (A's point is register 1, F's 2, G_j's j + 2)
export function part(l: string, registers: readonly number[]): string {
  const d = dirOf(l)
  const p = pointsOf(l)

  return registers.map(r => (r === 0 ? d : `${p[r - 1]}`)).join(',')
}

// the size of the last reduced matrix built, read by a sizing
export type SpectrumCost = { largest: number; bytes: number; built: number }

// the spectrum of the reduced state on `registers` (the global state pure): the Gram matrix of the smaller side
export function spectrum(
  s: State,
  registers: readonly number[],
  all: number,
  cost?: SpectrumCost,
): number[] {
  const keep = new Set(registers)
  const rest = Array.from({ length: all }, (_, r) => r).filter(r => !keep.has(r))
  const rowIndex = new Map<string, number>()
  const colIndex = new Map<string, number>()
  const entries: { r: number; c: number; re: number; im: number }[] = []

  for (const [l, a] of s) {
    const rk = part(l, registers)
    const ck = part(l, rest)

    if (!rowIndex.has(rk)) {
      rowIndex.set(rk, rowIndex.size)
    }

    if (!colIndex.has(ck)) {
      colIndex.set(ck, colIndex.size)
    }

    const z = float(a)

    entries.push({ r: rowIndex.get(rk)!, c: colIndex.get(ck)!, re: z.re, im: z.im })
  }

  // rho = M M^dag on rows, or M^dag M on columns: the same nonzero spectrum
  const onRows = rowIndex.size <= colIndex.size
  const n = onRows ? rowIndex.size : colIndex.size
  const byOther = new Map<number, { i: number; re: number; im: number }[]>()

  for (const e of entries) {
    const i = onRows ? e.r : e.c
    const o = onRows ? e.c : e.r
    // M^dag M = (M^dag)(M^dag)^dag: swap the roles and conjugate
    const im = onRows ? e.im : -e.im
    const list = byOther.get(o) ?? []

    list.push({ i, re: e.re, im })
    byOther.set(o, list)
  }

  if (cost !== undefined) {
    cost.largest = Math.max(cost.largest, n)
    // re and im, plus the eigen solver's two working copies
    cost.bytes = Math.max(cost.bytes, 4 * 8 * n * n)
    cost.built++
  }

  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (const list of byOther.values()) {
    for (const x of list) {
      for (const y of list) {
        // x conj(y)
        re[x.i * n + y.i] = re[x.i * n + y.i]! + x.re * y.re + x.im * y.im
        im[x.i * n + y.i] = im[x.i * n + y.i]! + x.im * y.re - x.re * y.im
      }
    }
  }

  if (n === 1) {
    return [re[0]!]
  }

  return hermitianEigenvaluesTridiagonal(n, re, im)
}

export const entropy = (lambda: readonly number[]): number =>
  lambda.reduce((h, x) => (x > 1e-15 ? h - x * Math.log2(x) : h), 0)

export type Spectral = { sum: number; least: number }

export const spectralCheck = (lambda: readonly number[]): Spectral => ({
  sum: lambda.reduce((s, x) => s + x, 0),
  least: Math.min(...lambda),
})

// the fidelity of the A-F reduced state of s with the pure A-F state phi (labels over A and F only), exact:
// sum over the copies' tuples g of |<phi (x) g | s>|^2
export function fidelityAF(s: State, phi: Map<string, Qw>, all: number): Qw {
  const af = [0, 1, 2]
  const rest = Array.from({ length: all }, (_, r) => r).filter(r => r > 2)
  const byRest = new Map<string, Qw>()

  for (const [l, a] of s) {
    const p = phi.get(part(l, af))

    if (p === undefined) {
      continue
    }

    const g = part(l, rest)

    byRest.set(g, add(byRest.get(g) ?? ZERO, mul(conj(p), a)))
  }

  let total = ZERO

  for (const v of byRest.values()) {
    total = add(total, norm(v))
  }

  return total
}

// the most pairwise disjoint masks among `passing`, inside `avail`
export function packing(passing: readonly number[], avail: number, memo = new Map<number, number>()): number {
  if (avail === 0) {
    return 0
  }

  const known = memo.get(avail)

  if (known !== undefined) {
    return known
  }

  const low = avail & -avail
  let best = packing(passing, avail & ~low, memo)

  for (const p of passing) {
    if ((p & low) !== 0 && (p & avail) === p) {
      best = Math.max(best, 1 + packing(passing, avail & ~p, memo))
    }
  }

  memo.set(avail, best)

  return best
}

export function popcount(m: number): number {
  let c = 0

  for (let x = m; x !== 0; x &= x - 1) {
    c++
  }

  return c
}

// ---- one copied record, read as E-QTM-0200 reads it ----

export type CopiedRecord = {
  k: number
  schedule: Schedule
  // the start's points, the register count, the state after the copies, and the no-friend final A-F state
  points: number[]
  all: number
  copied: State
  noFriendAF: Map<string, Qw>
  // the A-F spectrum, B_SF and B_S
  lambdaAF: number[]
  bSF: number
  bS: number
  // the source undo after the copies
  pMem: Qw
  l1: Qw
  fRule: Qw
  // instrument parts
  weightExact: boolean
  globalUndo: boolean
  spectralOk: boolean
  boundOk: boolean
  // C1: no record
  bSNoRecord: number
}

export function copiedRecord(k: number, schedule: Schedule): CopiedRecord {
  const points = startPoints(k, true)
  // registers: the direction, then one per point
  const all = 1 + points.length
  const meetings = copyMeetings(k, schedule)
  let weightExact = true
  const check = (s: State): State => {
    weightExact &&= eq(totalWeight(s), ONE)

    return s
  }

  const noFriend = readS(apply(prepared(points), coinGate))
  let s = check(friendMeasures(check(prepared(points))))

  for (const [i, j] of meetings) {
    s = check(apply(s, lineOfTwo(i, j, null)))
  }

  // the best local undo: A (registers 0, 1) and F (register 2)
  const lambdaAF = spectrum(s, [0, 1, 2], all)
  const desc = [...lambdaAF].sort((a, b) => b - a)
  const bSF = desc[0]!
  const bS = desc.slice(0, HELPER).reduce((t, x) => t + x, 0)

  // the rule's undo
  const undone = check(wignerUndo(s))
  const pMem = weightWhere(undone, l => pointsOf(l)[FRIEND] === 1)
  const wigner = readS(undone)
  const finalNoFriend = apply(prepared(points), coinGate)
  const phi = new Map<string, Qw>()

  for (const [l, a] of finalNoFriend) {
    phi.set(part(l, [0, 1, 2]), a)
  }

  const fRule = fidelityAF(undone, phi, all)

  // the global undo: every copy run back in reverse order, then the undo
  let back = s

  for (const [i, j] of [...meetings].reverse()) {
    const g: Gate = lineOfTwo(i, j, null)

    back = check(apply(check(apply(back, g)), g))
  }

  back = check(wignerUndo(back))

  const home = weightWhere(back, l => {
    const p = pointsOf(l)

    return p.every((x, i) => x === points[i])
  })
  const globalUndo =
    eq(weightWhere(back, l => pointsOf(l)[FRIEND] === 1), ONE) &&
    eq(home, ONE) &&
    readS(back).every((p, i) => eq(p, noFriend[i]!))

  const lambdaS = spectrum(s, [0, 1], all)
  const spectralOk = [lambdaAF, lambdaS].every(x => {
    const c = spectralCheck(x)

    return Math.abs(c.sum - 1) <= 1e-10 && c.least >= -1e-10
  })
  const boundOk = bSF >= float(fRule).re - 1e-12

  // C1: no record
  const plainPoints = startPoints(k, false)
  let plain = friendMeasures(prepared(plainPoints))

  for (const [i, j] of meetings) {
    plain = apply(plain, lineOfTwo(i, j, null))
  }

  const plainDesc = spectrum(plain, [0, 1, 2], all).sort((a, b) => b - a)
  const bSNoRecord = plainDesc.slice(0, HELPER).reduce((t, x) => t + x, 0)

  return {
    k,
    schedule,
    points,
    all,
    copied: s,
    noFriendAF: phi,
    lambdaAF,
    bSF,
    bS,
    pMem,
    l1: l1(wigner, noFriend),
    fRule,
    weightExact,
    globalUndo,
    spectralOk,
    boundOk,
    bSNoRecord,
  }
}

// ---- the redundancy curve ----

export type RedundancyCurve = {
  hS: number
  // I(S : X) by fragment mask over the pieces F (bit 0), G_j (bit j)
  info: Map<number, number>
  // R_delta for each delta asked
  r: { delta: number; r: number }[]
  // the least and largest I(S : X) / H(S) by fragment size 1 .. k + 1
  bySize: { size: number; least: number; largest: number }[]
  // every spectrum summed to 1 within 1e-10, none below -1e-10
  spectralOk: boolean
}

// S = registers 0, 1; pieces F (register 2) and G_j (register j + 2)
export function redundancyCurve(
  s: State,
  k: number,
  all: number,
  deltas: readonly number[],
  cost?: SpectrumCost,
): RedundancyCurve {
  const lambdaS = spectrum(s, [0, 1], all, cost)
  const hS = entropy(lambdaS)
  const checks: Spectral[] = [spectralCheck(lambdaS)]
  const pieces = k + 1
  const info = new Map<number, number>()

  for (let mask = 1; mask < 1 << pieces; mask++) {
    const regs: number[] = []

    for (let b = 0; b < pieces; b++) {
      if (mask & (1 << b)) {
        regs.push(b + 2)
      }
    }

    const lx = spectrum(s, regs, all, cost)
    const lsx = spectrum(s, [0, 1, ...regs], all, cost)

    checks.push(spectralCheck(lx), spectralCheck(lsx))
    info.set(mask, hS + entropy(lx) - entropy(lsx))
  }

  const r = deltas.map(delta => {
    const passing = [...info].filter(([, i]) => i >= (1 - delta) * hS).map(([m]) => m)

    return { delta, r: packing(passing, (1 << pieces) - 1) }
  })
  const bySize: RedundancyCurve['bySize'] = []

  for (let size = 1; size <= pieces; size++) {
    const values = [...info]
      .filter(([m]) => popcount(m) === size)
      .map(([, i]) => (hS > 0 ? i / hS : 0))

    bySize.push({ size, least: Math.min(...values), largest: Math.max(...values) })
  }

  return {
    hS,
    info,
    r,
    bySize,
    spectralOk: checks.every(x => Math.abs(x.sum - 1) <= 1e-10 && x.least >= -1e-10),
  }
}

// the cost of a redundancy curve on s without taking it: every fragment spectrum the curve needs is built and solved,
// no entropy is formed, and a spectrum whose eigen solver does not converge is counted, not thrown
export function redundancySizing(
  s: State,
  k: number,
  all: number,
): SpectrumCost & { failed: number } {
  const cost: SpectrumCost = { largest: 0, bytes: 0, built: 0 }
  let failed = 0
  const pieces = k + 1
  const solve = (registers: number[]): void => {
    try {
      spectrum(s, registers, all, cost)
    } catch {
      failed++
    }
  }

  solve([0, 1])

  for (let mask = 1; mask < 1 << pieces; mask++) {
    const regs: number[] = []

    for (let b = 0; b < pieces; b++) {
      if (mask & (1 << b)) {
        regs.push(b + 2)
      }
    }

    solve(regs)
    solve([0, 1, ...regs])
  }

  return { ...cost, failed }
}

// the state after k copies of the record on `schedule`, with no reading taken (for a sizing)
export function copiedState(k: number, schedule: Schedule): { state: State; all: number } {
  const points = startPoints(k, true)
  let s = friendMeasures(prepared(points))

  for (const [i, j] of copyMeetings(k, schedule)) {
    s = apply(s, lineOfTwo(i, j, null))
  }

  return { state: s, all: 1 + points.length }
}
