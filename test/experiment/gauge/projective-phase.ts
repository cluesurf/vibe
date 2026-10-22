// PROJECTIVE PHASE: DOES THE LIFT-FREE RULE WITH R*'S FORCED REFLECTION PHASE KEEP THE MIRROR AT FIXED MOMENTUM? (E-FRC-0313,
// item 0100 of vibe/roadmap/moving-matter, decision 022, research/confinement-many-walker.md section 3c).
// Explores whether the lift-free rule could be completed so that R*'s CPT mirror holds inside each total-momentum sector.
// E-FRC-0312 (item 0098) read the bare reflect rule VIABLE on every clause but one: on the rstar line coin the baryon's
// E -> -E mirror at total momentum K 0 failed (co-located block 0.536), since the reflection's slot flip F anticommutes with
// the Z of the coin's mirror Z K, which then needs (-1)^x per walker and maps K to K + n pi. Decision 022 fixes the
// reflected walker's slot map by requiring it to commute with the rule's own mirror: e^(i a) F with e^(2 i a) = -1, so
// i F (rule R+) or -i F (rule R-).
//
// STEP 1 (paper, checked numerically on the 2 x 2 maps and on every read sector).
//   (a) The rstar coin's mirror is Z K: K Q0 K = -Z Q1 Z and K Q1 K = -Z Q0 Z (code/measure/lift-free-walk.ts:48-56, the
//       coins of string-localize.ts:121-131; read as kq below). A shift commutes with Z K. A reflected walker's slot map
//       e^(i a) F goes to Z K (e^(i a) F) K Z = e^(-i a) Z F Z = -e^(-i a) F, since Z F Z = -F. So the bare F (a 0) is
//       odd under Z K (E-FRC-0312, projective-colour.ts:49-53, 718-720), and i F, -i F are even:
//       Z K (i F) (Z K)^-1 = Z (-i F) Z = (-i)(-F) = i F, and the same for -i F (read as zk below).
//   (b) Time reversal. U = (T' P_D T') P_S with T' = (move) X and J = (P_S^(x)n)^dag K (projective-colour.ts:47-48,
//       996-1048, lift-free-walk.ts jRead). With every coin piece complex symmetric (P^T = P, so K P K = P^dag),
//       J U J^-1 = P_S^dag (K T' K) P_D^dag (K T' K) P_S^dag P_S, which is U^dag exactly when K T' K = T'^dag, i.e. when T'
//       is a complex SYMMETRIC unitary. T' is a permutation times phases: a reflected walker under T' returns to its own
//       slot (X turns it, the reflection turns it back) with factor e^(i a), a diagonal entry; a crossing group is
//       carried to a partner configuration that carries it back, with the same reflection count elsewhere, so the same
//       phase. So T' is symmetric for EVERY a, and J (e^(i a) F) J^-1 = e^(-i a) F = (e^(i a) F)^-1 on the walker:
//       J is kept by i F (and by F, as in E-FRC-0312; time reversal cannot pick the phase, traps.md 2026-10-10 E-FRC-0308).
//       Read as the symmetry defect of T' over every sector and as the J residual.
//
// STEP 2 (numeric, the instruments and sizes of E-FRC-0312). Rules: R+ (each reflecting walker i F), R- (-i F), and as
// controls the bare reflect R0 on both coins and R+ on hadamard. Starts (distinguishable walkers, the mixed start I / 2^n
// at one site): lone (t 1), meson (t 1, 2), baryon (t 1, 1, 1), lepton (t 0). Reads:
//   unitarity    the relative sector's move is a permutation (0 states hit twice) times unit phases, and one whole cycle
//                keeps norms and the inner product of two hashed vectors; the per-beat norm change on the ring
//   mirror       t_m = tr U^m, m = 1..16 cycles, |t_m - conj t_m| / dim over the WHOLE total-momentum-0 sector on rings
//                12, 18, 24 for every start (and on 2048 for one and two walkers) and over the co-located block (closed,
//                ring-independent); ungated, the same across to total momentum pi
//   J            on the rstar coin, every sector: |U J U phi - J phi| / |phi| on a hashed phi, against J0 = K alone (teeth)
//   dynamics     ring 2048 to t 1e4 on rstar: the lone third's rms, the lepton against the free walk (final amplitudes),
//                each cluster's spread (rms from the centre), exponent and speed (code/measure/lift-free-walk.ts dynRead)
//
// GATES (fixed 2026-10-10 in the item, before any read):
//   PASS  for R+ or R- (rstar coin): unitarity to 1e-12, the K 0 mirror to 1e-10 on every start and ring (whole sector and
//         co-located block), J to 1e-10, lone-third rms <= 2, lepton exact to 1e-12, meson and baryon co-located (spread
//         <= 1e-12) with exponent >= 0.9 or speed >= 0.05 site a beat
//   KILL  R+ and R- each break the K 0 mirror or J above 1e-6
//   OPEN  otherwise, naming the clause
// UNGATED: whether t_m(R+) equals t_m(R-) or its conjugate; cluster speeds against R0; R+ on hadamard (predicted to break
// hadamard's K mirror, whose completion is the real F).
// Lead's prediction: PASS for both signs, speeds near E-FRC-0312's.
//
// DETERMINISM: no random numbers (hashed vectors from a murmur3 finalizer). FLOAT throughout, each verdict a number against
// a fixed tolerance.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  coinsOf,
  dynRead,
  finalGap,
  jRead,
  momentGap,
  permDefect,
  phaseDefect,
  relSector,
  traceMoments,
  unitarityRead,
  type CoinName,
  type DynRead,
  type LineRule,
} from '@/code/measure/lift-free-walk'

export const RING = 2048
export const T_MAX = 10000
export const EDGE = 32
export const EDGE_TOL = 1e-12
export const MOMENTS = 16
export const RINGS = [12, 18, 24] as const
export const EXACT = 1e-12
export const MIRROR_HOLDS = 1e-10
export const MIRROR_FAILS = 1e-6
export const LONE_RMS = 2
export const EXPONENT_GATE = 0.9
export const SPEED_GATE = 0.05

export type RuleKey = 'r0' | 'rplus' | 'rminus'
export type StartName = 'lone' | 'meson' | 'baryon' | 'lepton'

export const RULE: Record<RuleKey, LineRule> = {
  r0: { cross: 'reflect', phase: 0 },
  rplus: { cross: 'reflect', phase: 1 },
  rminus: { cross: 'reflect', phase: -1 },
}
const FREE: LineRule = { cross: 'free', phase: 0 }

export const TRIALITY: Record<StartName, number[]> = { lone: [1], meson: [1, 2], baryon: [1, 1, 1], lepton: [0] }
export const STARTS: readonly StartName[] = ['lone', 'meson', 'baryon', 'lepton']
export const SIGNS: readonly RuleKey[] = ['rplus', 'rminus']

// which (coin, rule) pairs are read: rstar R+, R-, R0; hadamard R0, R+
export const MIRROR_RULES: readonly { coin: CoinName; rule: RuleKey }[] = [
  { coin: 'rstar', rule: 'rplus' },
  { coin: 'rstar', rule: 'rminus' },
  { coin: 'rstar', rule: 'r0' },
  { coin: 'hadamard', rule: 'r0' },
  { coin: 'hadamard', rule: 'rplus' },
]
export const DYN_RULES: readonly RuleKey[] = ['rplus', 'rminus', 'r0']

export const ringsOf = (start: StartName): number[] => (TRIALITY[start].length === 3 ? [...RINGS] : [RING, ...RINGS])

// ---- STEP 1, the 2 x 2 checks ----

type Cx = [number, number]
type M2 = Cx[][]

const cm = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const mm = (a: M2, b: M2): M2 => [0, 1].map(i => [0, 1].map(j => {
  const p = cm(a[i]![0]!, b[0]![j]!)
  const q = cm(a[i]![1]!, b[1]![j]!)

  return [p[0] + q[0], p[1] + q[1]] as Cx
}))
const cj = (a: M2): M2 => a.map(r => r.map(x => [x[0], -x[1]] as Cx))
const gap = (a: M2, b: M2): number => Math.max(...a.flatMap((r, i) => r.map((x, j) => Math.hypot(x[0] - b[i]![j]![0], x[1] - b[i]![j]![1]))))
const neg = (a: M2): M2 => a.map(r => r.map(x => [-x[0], -x[1]] as Cx))
const Z: M2 = [[[1, 0], [0, 0]], [[0, 0], [-1, 0]]]
const F: M2 = [[[0, 0], [1, 0]], [[1, 0], [0, 0]]]
const phased = (a: number): M2 => {
  const g: Cx = [Math.cos((a * Math.PI) / 2), Math.sin((a * Math.PI) / 2)]

  return F.map(r => r.map(x => cm(g, x)))
}
const inverse = (a: M2): M2 => a.map((_, i) => a.map(r => [r[i]![0], -r[i]![1]] as Cx))

export type Step1 = {
  // |K Q0 K + Z Q1 Z|, |K Q1 K + Z Q0 Z|: the rstar coin's mirror is Z K
  kq: number
  // per phase a (0, +1, -1): |Z K (i^a F) (Z K)^-1 - i^a F| (0 = kept by the mirror), and |K (i^a F) K - (i^a F)^-1|
  zk: Record<string, number>
  kInverse: Record<string, number>
}

export function step1(): Step1 {
  const [q0c, q1c] = coinsOf('rstar')
  const toM = (c: { re: number[]; im: number[] }): M2 => [[[c.re[0]!, c.im[0]!], [c.re[1]!, c.im[1]!]], [[c.re[2]!, c.im[2]!], [c.re[3]!, c.im[3]!]]]
  const q0 = toM(q0c!)
  const q1 = toM(q1c!)
  const kq = Math.max(gap(cj(q0), neg(mm(mm(Z, q1), Z))), gap(cj(q1), neg(mm(mm(Z, q0), Z))))
  const zk: Record<string, number> = {}
  const kInverse: Record<string, number> = {}

  for (const a of [0, 1, -1]) {
    const m = phased(a)

    zk[String(a)] = gap(mm(mm(Z, cj(m)), Z), m)
    kInverse[String(a)] = gap(cj(m), inverse(m))
  }

  return { kq, zk, kInverse }
}

// ---- STEP 2: the sector reads ----

export type MirrorRead = {
  coin: CoinName
  rule: RuleKey
  start: StartName
  S: number
  dim: number
  permDefect: number
  phaseDefect: number
  unitarity: number
  mirror: number
  cluster: number
  clusterLeak: number
  piWhole: number
  piCluster: number
  whole: { re: number[]; im: number[] }
  block: { re: number[]; im: number[] }
  j?: { residual: number; control: number; symmetry: number }
  seconds: number
}

export function mirrorRead(coin: CoinName, rule: RuleKey, start: StartName, S: number): MirrorRead {
  const t0 = Date.now()
  const rs = relSector(S, TRIALITY[start], RULE[rule])
  const whole = traceMoments(rs, coin, MOMENTS)
  const block = traceMoments(rs, coin, MOMENTS, 0)
  const rsPi = relSector(S, TRIALITY[start], RULE[rule], true)
  const wholePi = traceMoments(rsPi, coin, MOMENTS)
  const blockPi = traceMoments(rsPi, coin, MOMENTS, 0)

  return {
    coin,
    rule,
    start,
    S,
    dim: rs.D,
    permDefect: permDefect(rs.perm),
    phaseDefect: phaseDefect(rs),
    unitarity: unitarityRead(rs, coin),
    mirror: whole.mirror,
    cluster: block.mirror,
    clusterLeak: block.closedLeak,
    piWhole: momentGap(whole, wholePi, true),
    piCluster: momentGap(block, blockPi, true),
    whole: { re: whole.re, im: whole.im },
    block: { re: block.re, im: block.im },
    j: coin === 'rstar' ? jRead(rs) : undefined,
    seconds: (Date.now() - t0) / 1000,
  }
}

export function mirrorPlan(coin: CoinName, rule: RuleKey): MirrorRead[] {
  return STARTS.flatMap(start => ringsOf(start).map(S => mirrorRead(coin, rule, start, S)))
}

// ---- the dynamics ----

export type Dyn = Omit<DynRead, 'final'> & { ruleKey: RuleKey; start: StartName }

export function dyn(coin: CoinName, rule: RuleKey, start: StartName): Dyn {
  const d = dynRead({ coin, rule: RULE[rule], t: TRIALITY[start], S: RING, T: T_MAX, edge: EDGE, edgeTol: EDGE_TOL })

  return { ...d, ruleKey: rule, start }
}

export type LeptonRead = { coin: CoinName; rule: RuleKey; gap: number; beatDrift: number }

export function leptonRead(coin: CoinName, rule: RuleKey): LeptonRead {
  const base = { coin, t: TRIALITY.lepton, S: RING, T: T_MAX, edge: EDGE, edgeTol: EDGE_TOL, keepFinal: true }
  const a = dynRead({ ...base, rule: RULE[rule] })
  const b = dynRead({ ...base, rule: FREE })

  return { coin, rule, gap: finalGap(a.final!, b.final!), beatDrift: Math.max(a.beatDrift, b.beatDrift) }
}

// ---- the verdict ----

export type Reads = { step1: Step1; mirrors: MirrorRead[]; dyn: Dyn[]; leptons: LeptonRead[] }

const e2 = (x: number): string => x.toExponential(2)
const f4 = (x: number): string => (Math.abs(x) < 1e-3 && x !== 0 ? x.toExponential(2) : x.toFixed(4))

export type SignRead = {
  rule: RuleKey
  unitarity: number
  mirror: number
  j: number
  lone: number
  lepton: number
  clauses: string[]
  broken: boolean
}

export function signRead(r: Reads, rule: RuleKey): SignRead {
  const ms = r.mirrors.filter(m => m.coin === 'rstar' && m.rule === rule)
  const ds = r.dyn.filter(d => d.coin === 'rstar' && d.ruleKey === rule)
  const lep = r.leptons.filter(l => l.coin === 'rstar' && l.rule === rule)
  const perm = ms.reduce((a, m) => a + m.permDefect, 0)
  const unitarity = Math.max(...ms.map(m => Math.max(m.phaseDefect, m.unitarity)), ...ds.map(d => d.beatDrift), ...lep.map(l => l.beatDrift))
  const mirror = Math.max(...ms.map(m => Math.max(m.mirror, m.cluster)))
  const j = Math.max(...ms.map(m => m.j!.residual))
  const symmetry = ms.reduce((a, m) => a + m.j!.symmetry, 0)
  const lone = ds.find(d => d.start === 'lone')!.rmsMax
  const lepton = Math.max(...lep.map(l => l.gap))
  const clauses: string[] = []

  if (perm !== 0 || unitarity > EXACT) {
    clauses.push(`unitarity (${perm} states hit twice, ${e2(unitarity)})`)
  }

  if (mirror > MIRROR_HOLDS) {
    const where = ms
      .filter(m => Math.max(m.mirror, m.cluster) > MIRROR_HOLDS)
      .map(m => `${m.start} S ${m.S} whole ${e2(m.mirror)} cluster ${e2(m.cluster)}`)

    clauses.push(`K 0 mirror ${e2(mirror)} (${where.join('; ')})`)
  }

  if (j > MIRROR_HOLDS || symmetry !== 0) {
    clauses.push(`J ${e2(j)} (T' asymmetric on ${symmetry} states)`)
  }

  if (!(lone <= LONE_RMS)) {
    clauses.push(`lone rms ${f4(lone)}`)
  }

  if (!(lepton <= EXACT) || lep.length === 0) {
    clauses.push(`lepton ${e2(lepton)}`)
  }

  for (const s of ['meson', 'baryon'] as const) {
    const d = ds.find(x => x.start === s)!

    if (!(d.spreadMax <= EXACT && (d.exponent >= EXPONENT_GATE || d.speed >= SPEED_GATE))) {
      clauses.push(`${s} motion (spread ${f4(d.spreadMax)}, exponent ${f4(d.exponent)}, speed ${f4(d.speed)})`)
    }
  }

  return { rule, unitarity, mirror, j, lone, lepton, clauses, broken: mirror > MIRROR_FAILS || j > MIRROR_FAILS }
}

export function pphVerdict(r: Reads): Verdict {
  const s1 = r.step1
  const signs = SIGNS.map(s => signRead(r, s))
  const pass = signs.filter(s => s.clauses.length === 0)
  const kill = signs.every(s => s.broken)
  const word = pass.length > 0 ? `PASS (${pass.map(s => s.rule).join(', ')})` : kill ? 'KILL' : `OPEN (${signs.map(s => `${s.rule}: ${s.clauses.join(', ')}`).join('; ')})`
  const status: Verdict['status'] = pass.length > 0 ? 'pass' : kill ? 'fail' : 'open'
  const find = (coin: CoinName, rule: RuleKey, start: StartName, S: number): MirrorRead | undefined =>
    r.mirrors.find(m => m.coin === coin && m.rule === rule && m.start === start && m.S === S)
  // ungated: t_m(R+) against t_m(R-) and its conjugate, over every rstar sector and block
  let same = 0
  let conjugate = 0

  for (const m of r.mirrors.filter(x => x.coin === 'rstar' && x.rule === 'rplus')) {
    const o = find('rstar', 'rminus', m.start, m.S)

    if (!o) {
      continue
    }

    for (const [a, b] of [[m.whole, o.whole], [m.block, o.block]] as const) {
      const dim = a === m.whole ? m.dim : 1 << TRIALITY[m.start].length

      a.re.forEach((x, k) => {
        same = Math.max(same, Math.hypot(x - b.re[k]!, a.im[k]! - b.im[k]!) / dim)
        conjugate = Math.max(conjugate, Math.hypot(x - b.re[k]!, a.im[k]! + b.im[k]!) / dim)
      })
    }
  }

  const mirrorOf = (coin: CoinName, rule: RuleKey): number =>
    Math.max(...r.mirrors.filter(m => m.coin === coin && m.rule === rule).map(m => Math.max(m.mirror, m.cluster)))
  const piOf = (coin: CoinName, rule: RuleKey): number =>
    Math.max(...r.mirrors.filter(m => m.coin === coin && m.rule === rule && TRIALITY[m.start].length % 2 === 1).map(m => Math.max(m.piWhole, m.piCluster)))
  const jOf = (rule: RuleKey): { residual: number; control: number } => {
    const ms = r.mirrors.filter(m => m.coin === 'rstar' && m.rule === rule && m.j)

    return { residual: Math.max(...ms.map(m => m.j!.residual)), control: Math.min(...ms.map(m => m.j!.control)) }
  }
  const d = (rule: RuleKey, start: StartName): Dyn | undefined => r.dyn.find(x => x.coin === 'rstar' && x.ruleKey === rule && x.start === start)
  const metrics: Record<string, number> = {
    kq: s1.kq,
    zk0: s1.zk['0']!,
    zkPlus: s1.zk['1']!,
    zkMinus: s1.zk['-1']!,
    kInverseMax: Math.max(...Object.values(s1.kInverse)),
    plusMinusSame: same,
    plusMinusConjugate: conjugate,
  }

  for (const { coin, rule } of MIRROR_RULES) {
    metrics[`${coin}_${rule}_mirror`] = mirrorOf(coin, rule)
    metrics[`${coin}_${rule}_piOdd`] = piOf(coin, rule)
  }

  for (const rule of DYN_RULES) {
    const j = jOf(rule)

    metrics[`rstar_${rule}_j`] = j.residual
    metrics[`rstar_${rule}_j0`] = j.control

    for (const start of STARTS) {
      const x = d(rule, start)

      if (x) {
        metrics[`rstar_${rule}_${start}_speed`] = x.speed
        metrics[`rstar_${rule}_${start}_exponent`] = x.exponent
        metrics[`rstar_${rule}_${start}_spreadMax`] = x.spreadMax
        metrics[`rstar_${rule}_${start}_rmsMax`] = x.rmsMax
        metrics[`rstar_${rule}_${start}_beatDrift`] = x.beatDrift
      }
    }
  }

  for (const s of signs) {
    metrics[`${s.rule}_unitarity`] = s.unitarity
    metrics[`${s.rule}_leptonGap`] = s.lepton
  }

  const line = (rule: RuleKey): string =>
    STARTS.map(s => {
      const x = d(rule, s)

      return x ? `${s} speed ${f4(x.speed)} exp ${f4(x.exponent)} spread ${f4(x.spreadMax)} rms ${f4(x.rmsMax)}` : `${s} -`
    }).join(', ')

  return verdict({
    status,
    claim: `projective-phase ${word}: STEP 1 K Q0 K = -Z Q1 Z to ${e2(s1.kq)}; Z K (i^a F) (Z K)^-1 - i^a F: a 0 ${e2(s1.zk['0']!)}, a +1 ${e2(s1.zk['1']!)}, a -1 ${e2(s1.zk['-1']!)}; K (i^a F) K = (i^a F)^-1 to ${e2(metrics.kInverseMax!)}. STEP 2 rstar: ${signs.map(s => `${s.rule} unitarity ${e2(s.unitarity)}, K 0 mirror ${e2(s.mirror)}, J ${e2(s.j)}, lone rms ${f4(s.lone)}, lepton gap ${e2(s.lepton)}`).join('; ')}; R0 mirror ${e2(mirrorOf('rstar', 'r0'))}. Dynamics: R+ ${line('rplus')}; R- ${line('rminus')}; R0 ${line('r0')}.`,
    metrics,
    control: {
      rstarR0Mirror: mirrorOf('rstar', 'r0'),
      rstarR0PiOdd: piOf('rstar', 'r0'),
      hadamardR0Mirror: mirrorOf('hadamard', 'r0'),
      hadamardRplusMirror: mirrorOf('hadamard', 'rplus'),
      jControlMin: Math.min(...DYN_RULES.map(x => jOf(x).control)),
    },
    notes: `Ungated: t_m(R+) against t_m(R-) over every rstar sector and block, max |difference| / dim ${e2(same)}, against the conjugate ${e2(conjugate)}. R+ on hadamard: mirror ${e2(mirrorOf('hadamard', 'rplus'))} (hadamard R0 ${e2(mirrorOf('hadamard', 'r0'))}). Across to K + pi on odd walker numbers: R+ ${e2(piOf('rstar', 'rplus'))}, R- ${e2(piOf('rstar', 'rminus'))}, R0 ${e2(piOf('rstar', 'r0'))}. Cluster speed over R0: meson R+ ${f4((d('rplus', 'meson')?.speed ?? NaN) / (d('r0', 'meson')?.speed ?? NaN))}, baryon R+ ${f4((d('rplus', 'baryon')?.speed ?? NaN) / (d('r0', 'baryon')?.speed ?? NaN))}, baryon R- ${f4((d('rminus', 'baryon')?.speed ?? NaN) / (d('r0', 'baryon')?.speed ?? NaN))}. LIMIT: the three-walker whole-sector mirror is read on rings ${RINGS.join(', ')}, not 2048 (the co-located block is ring-independent); the line, not the 3+1d mesh.`,
  })
}

export function allReads(): Reads {
  return {
    step1: step1(),
    mirrors: MIRROR_RULES.flatMap(p => mirrorPlan(p.coin, p.rule)),
    dyn: DYN_RULES.flatMap(rule => STARTS.map(start => dyn('rstar', rule, start))),
    leptons: SIGNS.map(rule => leptonRead('rstar', rule)),
  }
}

export default experiment({
  id: 'gauge/projective-phase',
  code: 'E-FRC-0313',
  title: 'explores whether the lift-free rule, with each reflected walker turned by i F as R*s mirror forces, could keep the E -> -E mirror at fixed momentum, time reversal and moving colour-neutral clusters',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return pphVerdict(allReads())
  },
})
