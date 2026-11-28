// THE REDUNDANCY CURVE (E-QTM-0200, research brief B2). E-QTM-0162 posed
// Wigner's friend on the rule's own gates and found that once the friend's record is copied to one third love, the
// undo on system and friend fails (memory back with 91/256). This file copies the record to k = 0 to 5 further loves by
// the same meeting and reads how fast a local undo fails, and whether the record becomes redundant (many disjoint
// fragments that each determine the system) or only spread.
//
// THE CIRCUIT: code/measure/rule-gates, the coin C and the line of two w U read off the working rule, exact in Q(w).
// Registers: the system S is love A (its direction and its point), the friend F a love whose point is its memory, and
// the copies G_1 .. G_k loves with points 2 .. k + 1. Steps: the coin on start R with points (0, 1, 2, .., k + 1), F
// records (the line of two on A and F, arm R), then the record is copied by the same meeting, STAR (F meets G_1, then
// G_2, .., then G_k: the gated schedule) or CHAIN (F meets G_1, G_1 meets G_2, ..: reported). k = 1 star is E-QTM-0162's
// copied case.
//
// READINGS, each k and schedule:
//  B_SF  the largest eigenvalue of the reduced state of A and F: the best fidelity any unitary on A and F alone reaches
//        with their state before the record (max over V of <psi| V rho V^dag |psi> for a pure psi is lambda_max)
//  B_S   the sum of the 9 largest eigenvalues of that state: the best fidelity of the system alone, F a free helper of
//        9 values (the trace of rho against a rank-9 projector, maximized over unitaries)
//  P_mem, L1, F_rule  E-QTM-0162's undo (two more A-F meetings on arm R, then the coin) after the copies: P(F reads 1),
//        the L1 of Wigner's P(f) against the no-friend interferometer, and the fidelity of A and F with the no-friend
//        final state (exact in Q(w))
//  R     R_delta at delta 0.1: the most pairwise disjoint nonempty fragments X of {F, G_1 .. G_k}, each with quantum
//        mutual information I(S : X) >= 0.9 H(S) (von Neumann, bits; the global state is pure)
//
// GATES, set in the item's what before any probe (gate a53d3e8c143a): G0 the splittings on 17 of 17 starts; I1 k = 1
// star gives P_mem 91/256 and L1 27/64 exactly, k = 0 P_mem 1 and the no-friend P(f); I2 every copy run back ((w U)^2,
// reverse order) then the undo gives P_mem 1, every G_j home and the no-friend P(f), exactly, every k and schedule; I3
// total weight exactly 1 after every step; I4 B_SF(0) = 1, B_SF >= F_rule - 1e-12, every spectrum sums to 1 within
// 1e-10 with no eigenvalue below -1e-10; C1 no record (F's point equal to A's): B_S = 1 within 1e-12; M1 B_SF falls
// strictly in k (star, k = 0 to 5, each step by more than 1e-9). Verdict: fail on any instrument or C1, fail if M1 fails,
// partial if every gate holds (the schedule is arranged and the friend is one vibe's point). The smoke setting (k to 2)
// is open by rule.
//
// PROBES (the probe log): smoke on a small machine (k to 2, open by rule), then full on
// M3 clone redundancy-curve (1.8 s), FAIL on M1 alone, every instrument and C1 true; title written after the run.
// Star, k = 0 .. 5: B_SF 1, then 39/64 = 0.609375 at every k >= 1 (equal to 2e-16); B_S 1 to k = 4, 0.998474 at 5;
// P_mem 1, 91/256, 199/1024, 631/4096, 2359/16384, 9271/65536; F_rule 4^-k; I(S : F) / H(S) 2 x 4^-k; R 1 at every k.
// Chain: copies past the first never touch F, so B_SF, P_mem and F_rule stay at k = 1's values; R 2 at k = 4 and 5.
// WHY B_SF SATURATES: one meeting of F (holding v) with a fresh copy at point p keeps (amplitude w k, weight 1/4) or
// exchanges (weight 3/4, the copy then holds v). The branch where F holds p is a known value, so its A-F part is pure
// up to the copies, and A's clean part weighs 13/16: lambda_max = 3/4 x 13/16 = 39/64. The next star copy moves F from
// p to the new point with 3/4 from both F-held branches alike, so the weight on (A clean, F the newest point) stays
// 39/64. The best local act undoes the episode by using the branch where the record left F, which more copies do not
// shrink; only the source's fixed undo, which needs F's own memory back, falls.
//
// DETERMINISM: exact in Q(w) up to the reduced states, whose spectra are floats (Householder and QL); no random
// number, every fragment enumerated. NOTHING MOVES: every gate is a take within one line of one dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  add,
  apply,
  coinGate,
  conj,
  dirOf,
  eq,
  float,
  gatesOnFamily,
  lineOfTwo,
  mul,
  norm,
  ONE,
  pointsOf,
  qw,
  show,
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

const FRIEND = 1
const DELTA = 0.1
const HELPER = 9

type Schedule = 'star' | 'chain'

// the copy meetings of k copies: holder indices into the point list (A 0, F 1, G_j j + 1)
function copyMeetings(k: number, schedule: Schedule): [number, number][] {
  const out: [number, number][] = []

  for (let j = 1; j <= k; j++) {
    out.push(schedule === 'star' ? [FRIEND, j + 1] : [j, j + 1])
  }

  return out
}

const startPoints = (k: number, record: boolean): number[] => [
  0,
  record ? 1 : 0,
  ...Array.from({ length: k }, (_, j) => j + 2),
]

const prepared = (points: number[]): State => apply(start('R', points), coinGate)

const friendMeasures = (s: State): State => apply(s, lineOfTwo(0, FRIEND, 'R'))

function wignerUndo(s: State): State {
  let t = apply(s, lineOfTwo(0, FRIEND, 'R'))

  t = apply(t, lineOfTwo(0, FRIEND, 'R'))

  return apply(t, coinGate)
}

const readS = (s: State): Qw[] =>
  ['R', 'L'].map(f => weightWhere(s, l => dirOf(l) === f))

const l1 = (p: Qw[], q: Qw[]): Qw => {
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
function part(l: string, registers: readonly number[]): string {
  const d = dirOf(l)
  const p = pointsOf(l)

  return registers.map(r => (r === 0 ? d : `${p[r - 1]}`)).join(',')
}

// the spectrum of the reduced state on `registers` (the global state pure): the Gram matrix of the smaller side
function spectrum(s: State, registers: readonly number[], all: number): number[] {
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

const entropy = (lambda: readonly number[]): number =>
  lambda.reduce((h, x) => (x > 1e-15 ? h - x * Math.log2(x) : h), 0)

type Spectral = { sum: number; least: number }

const spectralCheck = (lambda: readonly number[]): Spectral => ({
  sum: lambda.reduce((s, x) => s + x, 0),
  least: Math.min(...lambda),
})

// the fidelity of the A-F reduced state of s with the pure A-F state phi (labels over A and F only), exact:
// sum over the copies' tuples g of |<phi (x) g | s>|^2
function fidelityAF(s: State, phi: Map<string, Qw>, all: number): Qw {
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
function packing(passing: readonly number[], avail: number, memo = new Map<number, number>()): number {
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

type Case = {
  k: number
  schedule: Schedule
  bSF: number
  bS: number
  pMem: Qw
  l1: Qw
  fRule: Qw
  hS: number
  iSF: number
  r: number
  // the least and largest I(S : X) / H(S) by fragment size 1 .. k + 1
  bySize: { size: number; least: number; largest: number }[]
  // instrument parts
  weightExact: boolean
  globalUndo: boolean
  spectralOk: boolean
  boundOk: boolean
  // C1: no record
  bSNoRecord: number
}

function runCase(k: number, schedule: Schedule): Case {
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

  // redundancy: S = registers 0, 1; pieces F (2), G_j (j + 2)
  const spectra: Spectral[] = [spectralCheck(lambdaAF)]
  const lambdaS = spectrum(s, [0, 1], all)
  const hS = entropy(lambdaS)

  spectra.push(spectralCheck(lambdaS))

  const pieces = k + 1
  const info = new Map<number, number>()

  for (let mask = 1; mask < 1 << pieces; mask++) {
    const regs: number[] = []

    for (let b = 0; b < pieces; b++) {
      if (mask & (1 << b)) {
        regs.push(b + 2)
      }
    }

    const lx = spectrum(s, regs, all)
    const lsx = spectrum(s, [0, 1, ...regs], all)

    spectra.push(spectralCheck(lx), spectralCheck(lsx))
    info.set(mask, hS + entropy(lx) - entropy(lsx))
  }

  const passing = [...info].filter(([, i]) => i >= (1 - DELTA) * hS).map(([m]) => m)
  const r = packing(passing, (1 << pieces) - 1)
  const bySize: Case['bySize'] = []

  for (let size = 1; size <= pieces; size++) {
    const values = [...info]
      .filter(([m]) => popcount(m) === size)
      .map(([, i]) => (hS > 0 ? i / hS : 0))

    bySize.push({ size, least: Math.min(...values), largest: Math.max(...values) })
  }

  const spectralOk = spectra.every(
    x => Math.abs(x.sum - 1) <= 1e-10 && x.least >= -1e-10,
  )
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
    bSF,
    bS,
    pMem,
    l1: l1(wigner, noFriend),
    fRule,
    hS,
    iSF: info.get(1)!,
    r,
    bySize,
    weightExact,
    globalUndo,
    spectralOk,
    boundOk,
    bSNoRecord,
  }
}

function popcount(m: number): number {
  let c = 0

  for (let x = m; x !== 0; x &= x - 1) {
    c++
  }

  return c
}

const fmt = (x: number): string => x.toFixed(6)

export default experiment({
  id: 'quantum/redundancy-curve',
  code: 'E-QTM-0200',
  title:
    "the redundancy curve of Wigner's friend on the rule's own gates, fail as gated (gates set before the run): copying the friend's record to k = 0 to 5 further loves by the same meeting makes the source's undo restore the memory with 1, 91/256, 199/1024, 631/4096, 2359/16384, 9271/65536 (strictly falling), but the best undo by any unitary on system and friend stays 39/64 for every k >= 1 (3/4 x 13/16: the friend holds the last copy's fresh point with 3/4 whatever came before), so the gated strict fall fails; no record turns redundant (R_0.1 = 1 at every k on the star, the friend's share of the system's information falls as 2 x 4^-k), and a chain of copies reaches R 2 only at k = 4 and 5; the schedule is arranged and the friend is one vibe's point",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const full = process.env.REDUNDANCY_SWEEP === 'full'
    const kMax = full ? 5 : 2
    const gates = gatesOnFamily()
    const cases: Case[] = []

    for (const schedule of ['star', 'chain'] as const) {
      for (let k = 0; k <= kMax; k++) {
        cases.push(runCase(k, schedule))
      }
    }

    const star = cases.filter(c => c.schedule === 'star')
    const k0 = star[0]!
    const k1 = star[1]!
    const g = {
      G0: gates.passing === gates.of,
      I1:
        eq(k1.pMem, qw(91n, 0n, 256n)) &&
        eq(k1.l1, qw(27n, 0n, 64n)) &&
        eq(k0.pMem, ONE) &&
        eq(k0.l1, ZERO),
      I2: cases.every(c => c.globalUndo),
      I3: cases.every(c => c.weightExact),
      I4:
        Math.abs(k0.bSF - 1) <= 1e-12 &&
        cases.every(c => c.boundOk && c.spectralOk),
      C1: cases.every(c => Math.abs(c.bSNoRecord - 1) <= 1e-12),
      M1: star.every((c, i) => i === 0 || star[i - 1]!.bSF - c.bSF > 1e-9),
    }
    const instruments = g.G0 && g.I1 && g.I2 && g.I3 && g.I4 && g.C1
    const status = !full
      ? 'open'
      : !instruments || !g.M1
        ? 'fail'
        : 'partial'
    const metrics: Record<string, number> = {
      startsReadingTheGates: gates.passing,
      starts: gates.of,
    }

    for (const c of cases) {
      const p = `${c.schedule}${c.k}`

      metrics[`${p}_bSF`] = c.bSF
      metrics[`${p}_bS`] = c.bS
      metrics[`${p}_pMem`] = float(c.pMem).re
      metrics[`${p}_l1`] = float(c.l1).re
      metrics[`${p}_fRule`] = float(c.fRule).re
      metrics[`${p}_hS`] = c.hS
      metrics[`${p}_iSF`] = c.iSF
      metrics[`${p}_R`] = c.r
      metrics[`${p}_bSNoRecord`] = c.bSNoRecord
    }

    for (const [key, v] of Object.entries(g)) {
      metrics[`gate_${key}`] = v ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    const rows = cases.map(
      c =>
        `${c.schedule} k ${c.k}: B_SF ${fmt(c.bSF)}, B_S ${fmt(c.bS)}, P_mem ${show(c.pMem)} (${fmt(float(c.pMem).re)}), L1 ${show(c.l1)}, F_rule ${show(c.fRule)} (${fmt(float(c.fRule).re)}), H(S) ${fmt(c.hS)}, I(S:F)/H(S) ${fmt(c.hS > 0 ? c.iSF / c.hS : 0)}, R ${c.r}, I/H by size ${c.bySize.map(b => `${b.size}: ${fmt(b.least)}..${fmt(b.largest)}`).join(' ')}, no-record B_S ${fmt(c.bSNoRecord)}`,
    )

    return verdict({
      status,
      claim: `the friend record of E-QTM-0162 copied to k = 0 to ${kMax} further loves by the same meeting (star schedule): the best local undo on system and friend B_SF reads ${star.map(c => fmt(c.bSF)).join(', ')}, the undo of the source restores the memory with ${star.map(c => show(c.pMem)).join(', ')}, and R_0.1 reads ${star.map(c => c.r).join(', ')}`,
      metrics,
      control: { noRecordSystemRestored: g.C1 ? 1 : 0 },
      notes: `L2. ${full ? 'full' : 'smoke (open by rule)'}. Gates ${Object.entries(g)
        .map(([key, v]) => `${key} ${v}`)
        .join(', ')}. ${rows.join('; ')}. The schedule is arranged and the friend is one vibe point. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
