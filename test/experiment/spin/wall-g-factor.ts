// g OF THE LIGHT WALL PAIR AND ITS CHIRAL PROTECTION (E-SPN-0197, OPEN-MAT-04 protection half; moving-matter item 0009
// as rewritten by decisions 002 and 007). Working rule R* with the spinor lift L(s) (decision 0006).
//
// THE QUESTION. E-FRC-0290 read, on E-FRC-0267's chiral slab, one Weyl doublet per wall (wall A hand +1, wall B hand -1)
// and a small inter-wall leak that splits the in-gap levels by +-delta. Together the two walls' levels are one massive
// Dirac member on the 3+1d wall with mass delta. A Dirac mass and a Pauli term both join wall A to wall B, so both sit in
// the (2, 2) of SU(2)_A x SU(2)_B and both vanish with the same breaking: if R*'s charge coupling keeps that chiral
// symmetry, g_w - 2 is second order in delta / Lambda (Brodsky and Drell, the chiral case); if it does not, first order.
// The leak varies about 300-fold over L = 8 to 20, so the two orders separate.
//
// THE READ (decision 007: g of a stepped walk is read from its Landau zero level, never from a k-space moment). The slab
// sits in a uniform field F01 = B = 2 pi p / qa in the tangent (0, 1) plane (wilson-register's slabStream magnetic cell,
// Landau gauge, exact Peierls phases on every hop), qa = 48, 64, 96, p = 1, K0 = K1 = K3 = 0, half +, V = -U:
//   eps0(B)  half the quasienergy gap of the zero-level pair (the levels continuous with +-delta), minimized over K2
//            (K2 = 0 and +-1e-3: symmetric to 1e-12 takes 0, else the parabola's least value)
//   mu'(B)   (delta - eps0(B)) / B, mu' its quadratic B -> 0 intercept, spread = |quadratic - line through the 2 weakest|
//   kappa_P = mu' Lambda / q, a_w = 2 M2 mu' / q, g_w = 2 + 2 a_w (q = 1); delta, Lambda, M2, v^2 = delta / M2 from B = 0
//   EIGEN    Chebyshev-filtered subspace iteration on X = (V + V^dag) / 2 over the full stream (the zero level is X's
//            top, the flat states sit at -1), deterministic start, V resolved by Rayleigh-Ritz on the converged span,
//            residual |V y - e^(-iE) y| <= 1e-10
// INSTRUMENTS (any failure leaves the verdict OPEN):
//   I1 the plain bulk member (m = pi/24, pi/12, L 1) reads |a| <= 1e-6; its spin pair E(0,-) = E(1,+) to 1e-10 at every
//      field; the first rung's (E1^2 - E_V^2) / (2 qB) against its valley's in-plane v0 v1 within 1% (B -> 0 intercept)
//   I2 the slab's two piece sets as uniform bulks (L 1): mu' from the zero level and from the spin pair (E(0,-) - E(1,+))
//      / 2B agree within 1e-3 relative + 1e-9; CONTROL |a_W| >= 1e-3 on the Wilson set (Wilson's O(a) Pauli term)
//   I3 a pure gauge moves no level > 1e-12 (L 10, qa 96); I4 (qa 96, p 2) gives (qa 48, p 1)'s eps0 to 1e-10; I5 the
//      guiding centre K1 = pi / qa moves eps0 <= 1e-10 (qa 48)
//   witness at every L: (E1^2 - eps0^2) / (2 qB) = delta / M2 within 2% (B -> 0 intercept)
//   res_kappa(L) = Lambda max(spread, I1's worst |mu'|, I3's shift / B at qa 96); unresolved if > 1e-3 or eps > 1e-2
// GATES (fixed 2026-10-08 by 0039, before any Landau read), e_env(L) = the largest eps among L - 2, L, L + 2:
//   PASS (protected): at every resolved L, |kappa_P| <= 10 e_env + 10 res_kappa, and |g_w - 2| <= 0.02 at every L
//   KILL (R*'s charge coupling breaks the chiral protection): |kappa_P| >= 0.05 v^2 at two resolved L, or
//        |g_w - 2| > 0.02 at two L
//   Between: partial, gap named. No resolved L: open
//   Reported: log-log slopes of |kappa_P| and |a_w| against eps (protected about 1 and 2, unprotected about 0 and 1), and
//   the old k-space readers' a_w (log, sin) beside each L, never gated
//
// DETERMINISM: no random numbers. Floats as measurement on the rule's exact pieces.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { chiralSlab } from '@/code/measure/anomaly-matching-walls'
import { memberU } from '@/code/measure/matching-table'
import {
  bulkSpec,
  fieldRead,
  intercepts,
  labelSets,
  landauStart,
  levelOf,
  pairLevels,
  readMember,
  slabOps,
  slabPhases,
  wallSpec,
  zeroLevel,
  type FieldRead,
  type SlabSpec,
  type ZeroRead,
} from '@/code/measure/wall-g-factor'
import type { Slab } from '@/code/measure/wilson-register'

export const THICKNESSES: readonly number[] = [8, 10, 12, 14, 16, 18, 20]

export default experiment({
  id: 'spin/wall-g-factor',
  code: 'E-SPN-0197',
  title:
    "g of the light wall pair from its Landau zero level: E-FRC-0267's chiral slab at L = 8 to 20 in a uniform field in the tangent (0, 1) plane (qa 48, 64, 96), the half gap of the wall-A/wall-B zero-level pair read against the leak delta, testing whether the Pauli coupling kappa_P falls with the leak (chirally protected, a_w second order in delta / Lambda) or tends to a constant (first order)",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return wallGFactorRun()
  },
})

const flag = (b: boolean): number => (b ? 1 : 0)

// least-squares slope of log |a| against log eps
export function logSlope(pts: readonly { eps: number; a: number }[]): number {
  const xs = pts.map(p => Math.log(p.eps))
  const ys = pts.map(p => Math.log(Math.abs(p.a)))
  const n = xs.length
  const mx = xs.reduce((s, x) => s + x, 0) / n
  const my = ys.reduce((s, y) => s + y, 0) / n

  let sxy = 0
  let sxx = 0

  for (let i = 0; i < n; i++) {
    sxy += (xs[i]! - mx) * (ys[i]! - my)
    sxx += (xs[i]! - mx) ** 2
  }

  return n > 1 ? sxy / sxx : Number.NaN
}

// ==== THE LANDAU READ (decision 007) ====

export const FIELDS: readonly number[] = [48, 64, 96]
const H2 = 1e-3

// a bulk at B = 0 on one class: its least positive level M, M2 (the band's E'' at M), and per valley (K0, K1 in {0, pi},
// K2 = K3 = 0, the four the (0, 1) field folds together) the level and the in-plane v0^2 v1^2 (v_j^2 = E E''_j)
export type BulkTable = {
  M: number
  M2: number
  valleys: { K: number[]; E: number; v01: number }[]
}

export function bulkTable(spec: SlabSpec): BulkTable {
  const { ops } = slabOps(spec)
  const M = Math.min(...ops.phases.map(levelOf).filter(x => x > 0))
  const M2 = readMember(ops, M, 1e-7, 'log').M2
  const h = 1e-3
  const least = (K: number[]): number => Math.min(...slabPhases(spec, K).map(levelOf).filter(x => x > 0))
  const valleys = [
    [0, 0, 0, 0],
    [Math.PI, 0, 0, 0],
    [0, Math.PI, 0, 0],
    [Math.PI, Math.PI, 0, 0],
  ].map(K => {
    const E = least(K)
    const v2 = [0, 1].map(j => {
      const p = [...K]
      const q = [...K]

      p[j]! += h
      q[j]! -= h

      return (E * (least(p) + least(q) - 2 * E)) / (h * h)
    })

    return { K, E, v01: Math.sqrt(v2[0]! * v2[1]!) }
  })

  return { M, M2, valleys }
}

// the first rung's predicted valley: the least sqrt(E_V^2 + 2 B v01_V); the witness ratio is (E1^2 - E_V^2) / (2 B v01_V)
export function rungWitness(t: BulkTable, B: number, E1: number): { ratio: number; valley: number } {
  let best = 0

  t.valleys.forEach((v, k) => {
    const w = t.valleys[best]!

    if (v.E ** 2 + 2 * B * v.v01 < w.E ** 2 + 2 * B * w.v01) {
      best = k
    }
  })

  const v = t.valleys[best]!

  return { ratio: (E1 ** 2 - v.E ** 2) / (2 * B * v.v01), valley: best }
}

// one bulk (L 1, uniform profile) at the three fields
export type BulkStage = {
  name: string
  table: BulkTable
  reads: FieldRead[]
}

export function bulkSpecOf(name: string): SlabSpec {
  if (name === 'm24' || name === 'm12') {
    return bulkSpec(memberU(name === 'm24' ? Math.PI / 24 : Math.PI / 12))
  }

  // 'set0' (plain) or 'set1' (Wilson): one of E-FRC-0267's two piece sets, half +, as a uniform profile
  const k = name === 'set0' ? 0 : 1
  const spec = wallSpec(chiralSlab(2))

  return { ...spec, slab: { L: 1, qa: 1, p: 0, profile: [k] } }
}

export function bulkStage(name: string, want = 24, fill = 24): BulkStage {
  const spec = bulkSpecOf(name)
  const table = bulkTable(spec)
  const base = slabOps(spec).ops.vecs
  const reads = FIELDS.map(qa =>
    fieldRead({ L: 1, qa, p: 1, profile: spec.slab.profile }, spec.sets, base, want, {
      fill,
      h: H2,
      resolve: want + 8,
    }),
  )

  return { name, table, reads }
}

export type BulkGate = {
  name: string
  // the zero level's valley: the lightest (ties: the least in-plane speed, whose rung is lowest), its mass and M2
  valley: number
  M: number
  M2: number
  mu: number[]
  muQuad: number
  muLin: number
  spread: number
  a: number
  // the spin pair: E(0, -) and E(1, +) per field, mu'_pair = (E(0, -) - E(1, +)) / 2B and its intercept
  pair: { e0minus: number; e1plus: number }[]
  muPair: number[]
  muPairQuad: number
  rungSpread: number
  witness: number[]
  witnessQuad: number
  worstResidual: number
}

// the positive levels above the zero level, as distinct clusters (within 1e-8), ascending
function rungs(r: FieldRead): number[] {
  const xs = r.zero.levels.filter(x => x > r.zero.upper + 1e-6).sort((a, b) => a - b)
  const out: number[] = []

  for (const x of xs) {
    if (out.length === 0 || x - out[out.length - 1]! > 1e-8) {
      out.push(x)
    }
  }

  return out
}

export function bulkGate(s: BulkStage): BulkGate {
  const vs = s.table.valleys
  let valley = 0

  vs.forEach((v, k) => {
    const w = vs[valley]!

    if (v.E < w.E - 1e-9 || (Math.abs(v.E - w.E) <= 1e-9 && v.v01 < w.v01)) {
      valley = k
    }
  })

  const V = vs[valley]!
  const M = V.E
  const M2 = M / V.v01
  const Bs = s.reads.map(r => r.B)
  const mu = s.reads.map(r => (M - r.eps0) / r.B)
  const ic = intercepts(Bs, mu)
  const witness = s.reads.map(r => rungWitness(s.table, r.B, r.zero.E1).ratio)
  // E(1, +) - E(0, +) = R - M with no mu' (R = sqrt(M^2 + 2 B v01), the valley's continuum rung), and E(0, -) + E(1, +)
  // = 2R: the two labels, read among the first two rung clusters (E(0, -) may equal E(1, +): the plain member)
  const pair = s.reads.map(r => {
    const R = Math.sqrt(M * M + 2 * r.B * V.v01)
    const cs = rungs(r).slice(0, 2)
    const e1plus = cs.reduce((best, c) =>
      Math.abs(c - r.zero.upper - (R - M)) < Math.abs(best - r.zero.upper - (R - M)) ? c : best,
    )
    const e0minus = cs.reduce((best, c) => (Math.abs(c + e1plus - 2 * R) < Math.abs(best + e1plus - 2 * R) ? c : best))

    return { e0minus, e1plus }
  })
  const muPair = pair.map((p, k) => (p.e0minus - p.e1plus) / (2 * Bs[k]!))

  return {
    name: s.name,
    valley,
    M,
    M2,
    mu,
    muQuad: ic.quad,
    muLin: ic.lin,
    spread: ic.spread,
    a: 2 * M2 * ic.quad,
    pair,
    muPair,
    muPairQuad: intercepts(Bs, muPair).quad,
    rungSpread: Math.max(...s.reads.map(r => r.zero.E1Spread)),
    witness,
    witnessQuad: intercepts(Bs, witness).quad,
    worstResidual: Math.max(...s.reads.flatMap(r => [r.zero.vResidual, r.minus.vResidual, r.plus.vResidual])),
  }
}

// one wall thickness at the three fields, with its B = 0 table and the old k-space readers (never gated)
export type WallStage = {
  L: number
  half: 0 | 1
  delta: number
  Lambda: number
  M2: number
  v2: number
  oldLog: number
  oldSin: number
  reads: FieldRead[]
}

export function wallDepths(L: number): Set<number> {
  const cs = chiralSlab(L)

  return new Set([...cs.aDepths, ...[-3, -2, -1, 0, 1, 2].map(x => ((x % L) + L) % L)])
}

export function wallStage(
  L: number,
  half: 0 | 1 = 0,
  fields: readonly number[] = FIELDS,
  want = 4,
  extra: { K1?: number; p?: number; chi?: readonly number[] } = {},
): WallStage {
  const cs = chiralSlab(L)
  const spec = wallSpec(cs, half)
  const { ops } = slabOps(spec)
  const p = pairLevels(ops)
  const tol = Math.abs(p.delta) / 10
  const lg = readMember(ops, p.upper, tol, 'log')
  const sn = readMember(ops, p.upper, tol, 'sin')
  const gap = ops.phases.map(levelOf).map((E, k) => ({ E, k })).filter(x => Math.abs(x.E) < 0.1)
  const base = gap.map(x => ops.vecs[x.k]!)
  const depths = wallDepths(L)
  const reads = fields.map(qa => {
    const slab: Slab = { L, qa, p: extra.p ?? 1, profile: cs.slab.profile, ...(extra.chi ? { chi: extra.chi } : {}) }

    return fieldRead(slab, spec.sets, base, want, {
      depths,
      fill: 8,
      h: H2,
      resolve: want + 12,
      labels: labelSets(slab, base, gap.map(x => x.E)),
      ...(extra.K1 !== undefined ? { K1: extra.K1 } : {}),
    })
  })

  return {
    L,
    half,
    delta: p.delta,
    Lambda: p.Lambda,
    M2: lg.M2,
    v2: p.delta / lg.M2,
    oldLog: (lg.g - 2) / 2,
    oldSin: (sn.g - 2) / 2,
    reads,
  }
}

// half - at B = 0: its in-gap levels (|E| < 0.1) and its least |E|; with none there is no zero-level pair to read
export function halfMinusLevels(L: number): { inGap: number; least: number } {
  const { ops } = slabOps(wallSpec(chiralSlab(L), 1))
  const E = ops.phases.map(levelOf)

  return { inGap: E.filter(x => Math.abs(x) < 0.1).length, least: Math.min(...E.map(Math.abs)) }
}

// I3 to I5 on one wall thickness, K2 = 0: a pure gauge at qa 96 (I3), (qa 96, p 2) against (qa 48, p 1) (I4), and the
// guiding centre K1 = pi / qa at qa 48 (I5); each the largest shift of the zero-level pair's two levels
export const INSTRUMENT_L = 10

export type GaugeStage = {
  L: number
  i3: { plain: ZeroRead; gauged: ZeroRead; shift: number }
  i4: { p1: ZeroRead; p2: ZeroRead; shift: number }
  i5: { centre: ZeroRead; shifted: ZeroRead; shift: number }
}

// a deterministic pure-gauge phase per class (no symmetry, order one)
export const gaugeChi = (n: number): number[] =>
  Array.from({ length: n }, (_, k) => 2.3 * Math.sin(0.7548776662466927 * (k + 1) * (k + 3)) + 0.9 * Math.cos(1.3 * k))

const pairShift = (a: ZeroRead, b: ZeroRead): number =>
  Math.max(Math.abs(a.upper - b.upper), Math.abs(a.lower - b.lower))

export function gaugeStage(L = INSTRUMENT_L): GaugeStage {
  const cs = chiralSlab(L)
  const spec = wallSpec(cs, 0)
  const { ops } = slabOps(spec)
  const base = ops.vecs.filter((_, k) => Math.abs(levelOf(ops.phases[k]!)) < 0.1)
  const depths = wallDepths(L)
  const read = (qa: number, p: number, extra: { chi?: number[]; K1?: number } = {}, want = 4): ZeroRead => {
    const slab = { L, qa, p, profile: cs.slab.profile, ...(extra.chi ? { chi: extra.chi } : {}) }

    return zeroLevel(slab, spec.sets, 0, landauStart(slab, base, 1, 8), want * p, {
      depths,
      resolve: want * p + 12,
      ...(extra.K1 !== undefined ? { K1: extra.K1 } : {}),
    }).read
  }
  const plain96 = read(96, 1)
  const gauged = read(96, 1, { chi: gaugeChi(96 * L) })
  const p1 = read(48, 1)
  const p2 = read(96, 2)
  const shifted = read(48, 1, { K1: Math.PI / 48 })

  return {
    L,
    i3: { plain: plain96, gauged, shift: pairShift(plain96, gauged) },
    i4: { p1, p2, shift: pairShift(p1, p2) },
    i5: { centre: p1, shifted, shift: pairShift(p1, shifted) },
  }
}

// ---- the wall rows and the gates (fixed 2026-10-08 by 0039, before any Landau read) ----

export const LANDAU_GATE = {
  i1a: 1e-6,
  i1pair: 1e-10,
  i1witness: 0.01,
  i2agree: 1e-3,
  i2abs: 1e-9,
  i2control: 1e-3,
  i3: 1e-12,
  i4: 1e-10,
  i5: 1e-10,
  vResidual: 1e-10,
  witness: 0.02,
  res: 1e-3,
  eps: 1e-2,
  pass: 10,
  kill: 0.05,
  g: 0.02,
}

export type LandauRow = {
  L: number
  delta: number
  Lambda: number
  M2: number
  v2: number
  eps: number
  eps0: number[]
  mu: number[]
  muQuad: number
  spread: number
  kappa: number
  a: number
  g: number
  witness: number[]
  witnessQuad: number
  resKappa: number
  resolved: boolean
  oldLog: number
  oldSin: number
  vResidual: number
  wallWeight: number
  symmetric: boolean
}

export function landauRow(s: WallStage, i1Mu: number, i3PerB: number): LandauRow {
  const Bs = s.reads.map(r => r.B)
  const mu = s.reads.map(r => (s.delta - r.eps0) / r.B)
  const ic = intercepts(Bs, mu)
  const witness = s.reads.map(r => (r.zero.E1 ** 2 - r.eps0 ** 2) / (2 * r.B) / s.v2)
  const eps = Math.abs(s.delta) / s.Lambda
  const resKappa = s.Lambda * Math.max(ic.spread, i1Mu, i3PerB)
  const a = 2 * s.M2 * ic.quad
  const witnessQuad = intercepts(Bs, witness).quad
  const vResidual = Math.max(...s.reads.flatMap(r => [r.zero.vResidual, r.minus.vResidual, r.plus.vResidual]))

  return {
    L: s.L,
    delta: s.delta,
    Lambda: s.Lambda,
    M2: s.M2,
    v2: s.v2,
    eps,
    eps0: s.reads.map(r => r.eps0),
    mu,
    muQuad: ic.quad,
    spread: ic.spread,
    kappa: ic.quad * s.Lambda,
    a,
    g: 2 + 2 * a,
    witness,
    witnessQuad,
    resKappa,
    // a row whose witness misses or whose eigenvectors are not converged is not resolved either
    resolved:
      resKappa <= LANDAU_GATE.res &&
      eps <= LANDAU_GATE.eps &&
      Math.abs(witnessQuad - 1) <= LANDAU_GATE.witness &&
      vResidual <= LANDAU_GATE.vResidual,
    oldLog: s.oldLog,
    oldSin: s.oldSin,
    vResidual,
    wallWeight: Math.min(...s.reads.flatMap(r => [r.zero.wallWeight, r.minus.wallWeight, r.plus.wallWeight])),
    symmetric: s.reads.every(r => r.symmetric),
  }
}

export type LandauVerdict = {
  rows: LandauRow[]
  envelope: number[]
  pass: boolean
  kill: boolean
  status: Verdict['status']
  slopeKappa: number
  slopeA: number
  gap: string
}

// e_env(L) = the largest eps among L - 2, L, L + 2 in the run
export function landauGates(rows: readonly LandauRow[], instruments: boolean): LandauVerdict {
  const envelope = rows.map(r =>
    Math.max(...rows.filter(x => Math.abs(x.L - r.L) <= 2).map(x => x.eps)),
  )
  const resolved = rows.filter(r => r.resolved)
  const pass =
    resolved.every(r => Math.abs(r.kappa) <= LANDAU_GATE.pass * envelope[rows.indexOf(r)]! + LANDAU_GATE.pass * r.resKappa) &&
    rows.every(r => Math.abs(r.g - 2) <= LANDAU_GATE.g)
  const kill =
    resolved.filter(r => Math.abs(r.kappa) >= LANDAU_GATE.kill * r.v2).length >= 2 ||
    rows.filter(r => Math.abs(r.g - 2) > LANDAU_GATE.g).length >= 2
  const slopeKappa = logSlope(resolved.map(r => ({ eps: r.eps, a: r.kappa })))
  const slopeA = logSlope(resolved.map(r => ({ eps: r.eps, a: r.a })))
  const status: Verdict['status'] = !instruments
    ? 'open'
    : resolved.length === 0
      ? 'open'
      : kill
        ? 'fail'
        : pass
          ? 'pass'
          : 'partial'
  const failing = resolved
    .filter(r => Math.abs(r.kappa) > LANDAU_GATE.pass * envelope[rows.indexOf(r)]! + LANDAU_GATE.pass * r.resKappa)
    .map(r => r.L)
  const gap =
    status === 'partial'
      ? `PASS fails at L ${failing.join(', ')} (|kappa_P| above 10 e_env + 10 res_kappa) and KILL does not fire`
      : ''

  return { rows: [...rows], envelope, pass, kill, status, slopeKappa, slopeA, gap }
}

// ---- the whole run ----

export type LandauStages = {
  bulk: Record<string, BulkStage>
  gauge: GaugeStage
  walls: WallStage[]
  halfMinus: { inGap: number; least: number }
}

export const BULKS: readonly string[] = ['m24', 'm12', 'set0', 'set1']

export function landauStages(): LandauStages {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${((Date.now() - started) / 1000).toFixed(1)}s`)
  const bulk: Record<string, BulkStage> = {}

  for (const name of BULKS) {
    bulk[name] = bulkStage(name)
    log(name)
  }

  const gauge = gaugeStage()

  log('gauge')

  const walls = THICKNESSES.map(L => {
    const w = wallStage(L)

    log(`L ${L}`)

    return w
  })

  return { bulk, gauge, walls, halfMinus: halfMinusLevels(12) }
}

export type InstrumentRead = {
  i1: boolean
  i2: boolean
  i2control: boolean
  i3: boolean
  i4: boolean
  i5: boolean
  all: boolean
  i1Mu: number
  i3PerB: number
  gates: Record<string, BulkGate>
}

export function instrumentRead(s: LandauStages): InstrumentRead {
  const G = LANDAU_GATE
  const gates = Object.fromEntries(BULKS.map(n => [n, bulkGate(s.bulk[n]!)])) as Record<string, BulkGate>
  const i1 = ['m24', 'm12'].every(n => {
    const g = gates[n]!

    return (
      Math.abs(g.a) <= G.i1a &&
      g.rungSpread <= G.i1pair &&
      Math.abs(g.witnessQuad - 1) <= G.i1witness &&
      g.worstResidual <= G.vResidual
    )
  })
  const i2 = ['set0', 'set1'].every(n => {
    const g = gates[n]!

    return (
      Math.abs(g.muQuad - g.muPairQuad) <= G.i2agree * Math.abs(g.muQuad) + G.i2abs && g.worstResidual <= G.vResidual
    )
  })
  const i2control = Math.abs(gates.set1!.a) >= G.i2control
  const i3 = s.gauge.i3.shift <= G.i3
  const i4 = s.gauge.i4.shift <= G.i4
  const i5 = s.gauge.i5.shift <= G.i5

  return {
    i1,
    i2,
    i2control,
    i3,
    i4,
    i5,
    all: i1 && i2 && i2control && i3 && i4 && i5,
    i1Mu: Math.max(...['m24', 'm12'].flatMap(n => gates[n]!.mu.map(Math.abs))),
    i3PerB: s.gauge.i3.shift / ((2 * Math.PI) / 96),
    gates,
  }
}

export function landauVerdict(s: LandauStages): Verdict {
  const ins = instrumentRead(s)
  const rows = s.walls.map(w => landauRow(w, ins.i1Mu, ins.i3PerB))
  const v = landauGates(rows, ins.all)
  const fmt = (x: number, d = 3): string => x.toExponential(d)
  const g = ins.gates
  const table = v.rows
    .map(
      (r, k) =>
        `L ${r.L}: delta ${fmt(r.delta)}, Lambda ${r.Lambda.toFixed(4)}, M2 ${fmt(r.M2)}, eps ${fmt(r.eps, 2)} (e_env ${fmt(v.envelope[k]!, 2)}), eps0 ${r.eps0.map(x => fmt(x, 6)).join('/')} at qa 48/64/96, mu' ${fmt(r.muQuad)} (spread ${fmt(r.spread, 1)}), kappa_P ${fmt(r.kappa)}, a_w ${fmt(r.a)}, g_w ${r.g.toFixed(7)}, res_kappa ${fmt(r.resKappa, 1)}${r.resolved ? '' : ' UNRESOLVED'}, witness ${r.witnessQuad.toFixed(4)}, old a_w log ${fmt(r.oldLog, 2)} sin ${fmt(r.oldSin, 2)}`,
    )
    .join('; ')
  const instrumentText = `I1 ${ins.i1} (a ${fmt(g.m24!.a, 1)}, ${fmt(g.m12!.a, 1)}; spin pair ${fmt(Math.max(g.m24!.rungSpread, g.m12!.rungSpread), 1)}; witness ${g.m24!.witnessQuad.toFixed(5)}), I2 ${ins.i2} (Wilson mu' zero ${fmt(g.set1!.muQuad, 6)} pair ${fmt(g.set1!.muPairQuad, 6)}; plain ${fmt(g.set0!.muQuad, 1)}), CONTROL a_W ${g.set1!.a.toFixed(4)} (${ins.i2control}), I3 ${fmt(s.gauge.i3.shift, 1)} (${ins.i3}), I4 ${fmt(s.gauge.i4.shift, 1)} (${ins.i4}), I5 ${fmt(s.gauge.i5.shift, 1)} (${ins.i5})`
  const resolvedRows = v.rows.filter(r => r.resolved)

  return verdict({
    status: v.status,
    claim: `${v.status.toUpperCase()}: instruments ${instrumentText}. Walls (half +): ${table}. PASS ${v.pass}, KILL ${v.kill}, resolved L ${resolvedRows.map(r => r.L).join(',')}; log-log slopes against eps: |kappa_P| ${v.slopeKappa.toFixed(3)}, |a_w| ${v.slopeA.toFixed(3)} (protected about 1 and 2, unprotected about 0 and 1). ${v.gap} Half - at L 12: ${s.halfMinus.inGap} in-gap levels (least |E| ${s.halfMinus.least.toFixed(4)}), so no zero-level pair to read there.`,
    metrics: {
      resolved: resolvedRows.length,
      pass: flag(v.pass),
      kill: flag(v.kill),
      slopeKappa: v.slopeKappa,
      slopeA: v.slopeA,
      ...Object.fromEntries(
        v.rows.flatMap(r => [
          [`delta_L${r.L}`, r.delta],
          [`Lambda_L${r.L}`, r.Lambda],
          [`M2_L${r.L}`, r.M2],
          [`eps_L${r.L}`, r.eps],
          [`mu_L${r.L}`, r.muQuad],
          [`kappa_L${r.L}`, r.kappa],
          [`a_L${r.L}`, r.a],
          [`res_L${r.L}`, r.resKappa],
          [`witness_L${r.L}`, r.witnessQuad],
          [`oldLog_L${r.L}`, r.oldLog],
          [`oldSin_L${r.L}`, r.oldSin],
        ]),
      ),
    },
    control: {
      instruments: flag(ins.all),
      i1: flag(ins.i1),
      i2: flag(ins.i2),
      i2control: flag(ins.i2control),
      aWilson: g.set1!.a,
      i3: s.gauge.i3.shift,
      i4: s.gauge.i4.shift,
      i5: s.gauge.i5.shift,
      i1A24: g.m24!.a,
      i1A12: g.m12!.a,
      i1Witness: g.m24!.witnessQuad,
      worstWallResidual: Math.max(...v.rows.map(r => r.vResidual)),
      halfMinusInGap: s.halfMinus.inGap,
    },
    notes: `L2. R* with L(s). Half +. Decision 007's reader. The plain member has four valleys (K0, K1 in {0, pi}) of mass M, in-plane v0 v1 0.497, 0.159, 0.159, 0.0552, so I1's witness reads the (pi, pi) valley's rung; the Wilson set's zero level is its (pi, pi) valley (M ${g.set1!.M.toFixed(6)}). The wall pair has 4 zero-level states and no doubler walls.`,
  })
}

export function wallGFactorRun(): Verdict {
  return landauVerdict(landauStages())
}
