// IS THE BEAT-2 REVERSAL OF THE PAIR ANGLE FORCED? (E-FRC-0308, item 0096 of roadmap/moving-matter). R* applies a pair
// angle as e^(+i angle) on Q_S Q_S in beat 1 and e^(-i angle) on Q_D Q_D in beat 2 (code/measure/register-holes
// holeCycle, code/measure/register-sea seaBeat's sign). E-FRC-0307 read that this reversal turns a string linear in
// separation into a velocity coupling (ballistic), while the unreversed string localizes on both 1d coins. So the
// string-localization quark path lives only if the reversal is a choice. This file reads whether it is.
//
// TWO REVERSALS, KEPT APART. (a) The hole conjugation (register-sea derived point 1, forced by Jacobi) negates EVERY pair
// angle, in both beats alike, so it fixes the overall sign of the table and says nothing about beat 2 against beat 1. It
// is applied here in both rules. (b) The beat-2 reversal (E-SPN-0162, 'its conjugate on D D (C symmetry)') is the
// question. UNREVERSED below means beat 2 takes the same phase as beat 1: e^(+i angle) on Q_D Q_D.
//
// DERIVED BEFORE THE RUN (paper; U = T M2 T^dag M1 with M_b the dock-local beat pieces, since X T X = T^dag and X
// commutes with Q_S, Q_D and with every relative-dock phase; the basis is the real (relative dock, slot, register) one).
// 1. TIME REVERSAL DOES NOT FORCE IT (L1). M1 and M2 are complex symmetric (Q_S, Q_D real symmetric, a pair phase
//    diagonal in the relative dock and in the sector occupations), and so is A = T M2 T^dag. For any U = A B with A, B
//    unitary and symmetric, J = B^dag K (K complex conjugation) is antiunitary with J U J^-1 = U^dag: K U K = A^dag
//    B^dag and B^dag (A^dag B^dag) B = U^dag. This holds for ANY angle tables in the two beats, so it holds reversed and
//    unreversed alike. The lead's prediction (FORCED by J) is therefore predicted wrong. Read: |U J U phi - J phi|.
// 2. C (THE MIRROR) DOES (L1). E-FRC-0258 read R*'s one-body cycle C-symmetric (spec(K) = -spec(-K), raw, 1.3e-15) and
//    CPT-symmetric (spec(K) = -spec(K), 1.3e-15); E-SPN-0160 point 5: every sector's spectrum is symmetric about pi. The
//    antiunitary that does this maps the beat-1 mixer u on Q_S to the beat-2 mixer conj u on Q_D. On a pair piece it
//    maps e^(+i a) on Q_S Q_S (beat 1) to e^(-i a) on Q_D Q_D (beat 2): the REVERSED rule is its own image, so its
//    two-hole spectrum at total momentum 0 is mirror symmetric, E -> -E (raw: the free pair is symmetric about 2 pi). The
//    UNREVERSED rule at string a maps to the unreversed rule at -a, so its spectrum is mirror symmetric only up to a -> -a,
//    which fails at first order in a. With T (point 1) and P (V is even and W(F4)-invariant) kept by both rules, C fails
//    exactly when CPT does: at total momentum 0 the two-hole C and CPT mirrors are one statement. Read by trace moments
//    t_m = tr U^m over the whole half-+ two-hole space (8,192 states at L 4): mirror <=> t_m = conj t_m (raw) for all m.
// 3. THE SEA, ONE BRANCH (point 6) DOES NOT (L1). The pieces are counted from the sea (normal ordered), so each beat's
//    pair piece is 1 on the full sea in both rules. Counted raw, the reversed string cancels within a cycle and the
//    unreversed one leaves a global phase e^(2 i Phi), Phi = r^2 sum over dock pairs of a(V), one branch still.
// 4. THE HARTREE CANCELLATION (point 2) DOES NOT, but it points the same way (L1). Normal ordering removes the Hartree
//    phase in both rules. Counted raw, the reversed string shifts u -> u e^(ih) on Q_S and conj u -> conj u e^(-ih) on
//    Q_D, still a conjugate pair (a mass shift, C kept); the unreversed one shifts both by e^(+ih), breaking the
//    one-body u / conj u pairing, which is the C of point 2 again.
// 5. THE FLATS, UNITARITY AND ISOTROPY DO NOT (L1). Both rules are built from the sector projectors (E-SPN-0175 point 4
//    holds for any angle table and either sign), both are products of unitaries, and both tables depend on V alone.
//
// PREDICTED: FORCED, by C / CPT (point 2), not by J (point 1).
//
// GATES (fixed in item 0096, 2026-10-10, not moved): FORCED when some property that R* is established to have (named
// with the experiment that read it) holds reversed to 1e-10 and fails unreversed above 1e-6, and that property is itself
// not a choice; CHOICE when unreversed keeps every listed property to 1e-10; OPEN otherwise.
// THE PROPERTIES READ (each reversed and unreversed, the E-SPN-0175 rule: the member mixers at ringUnit(-1, 4), the
// sector string ringUnit(-2, 1) a unit of V, cap 8, the sector contact v^2 with v = ringUnit(2, 0), hole angles reversed;
// two holes, L 4 torus, total momentum 0, 64 cycles):
//  U  unitarity: the dense pair's norm drift over 64 cycles (E-SPN-0175 I4)
//  F  the flats: |N_F - N_F(0)| at cycles 1, 2, 4, ..., 64 from a W (x) W and an F (x) W start (E-SPN-0175 F)
//  J  time reversal: |U J U phi - J phi| / |phi| on the dense pair (point 1; R* T: E-FRC-0258)
//  C  the mirror: max over m = 1..M of |t_m - conj t_m| / dim on the reduced engine (E-FRC-0258 C and CPT, E-SPN-0160)
//  I  isotropy: max over the 384 signed permutations g and every relative dock y of |a_b(g y) - a_b(y)|, both beats
//  S  the sea: the normal-ordered pieces' amplitude on the full sea a cycle (E-SPN-0175 V, E-FND-0157); the raw-count
//     phase Phi is read beside it
// INSTRUMENT AND CONTROLS (a failure makes the verdict open). IJ the J read has teeth: J0 = K alone (no B^dag) fails by
//  more than 1e-3 on both rules. IC the mirror read has teeth and is the derived one: the free rule's moments are mirror
//  symmetric raw to 1e-10, and the unreversed rule's moments at a equal the conjugate moments of the unreversed rule at
//  -a to 1e-10 (point 2's map). IN every dense and reduced run keeps its norm to 1e-10.
//
// LIMIT: one torus (L 4) and one total momentum (0) for the mirror; trace moments to m = M are necessary conditions of
// the mirror, so a pass on them is evidence, the derivation (point 2) the proof; a failure on any m is a proof of failure.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  flatCount,
  movingBlocks,
  newPair,
  pairNorm,
  pairStart,
  seaBeat,
  sectorBases,
  sectorPiece,
  torus,
  type Pair,
  type SeaRule,
  type SectorBases,
  type Torus,
} from '@/code/measure/register-sea'
import { betaOf } from '@/code/measure/register-meson'
import {
  holeCycle,
  holeEngine,
  holeFrame,
  holeNorm,
  newHoles,
  pairAngles,
  type HoleRule,
} from '@/code/measure/register-holes'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const CAP = 8
const L = 4
const CYCLES = 64
const READS = [1, 2, 4, 8, 16, 32, 64]
const HOLDS = 1e-10
const FAILS = 1e-6
const TEETH = 1e-3
const REG = 8
const MODES = 24 * REG
const FULL = MODES * MODES

export type RuleName = 'rev' | 'unrev'
export type TraceRule = 'rev' | 'unrev' | 'unrevneg' | 'free'

const unit = (kj: readonly [number, number]): [number, number] => {
  const th = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(th), Math.sin(th)]
}

const S_ANG = unitAngle(ringUnit(STRING[0], STRING[1]))
const V_ANG = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))

// E-SPN-0175's rule, hole angles reversed (both beats); beat 2 takes e^(-i phi) in seaBeat
function rules(name: RuleName): { one: SeaRule; two: SeaRule } {
  const one: SeaRule = {
    u: unit(LIGHT),
    string: -S_ANG,
    cap: CAP,
    contact: -2 * V_ANG,
    dock: null,
    member: false,
  }

  // unreversed: beat 2's own sign (-1) times a negated table gives beat 2 the same phase as beat 1
  return {
    one,
    two: name === 'rev' ? one : { ...one, string: -one.string, contact: -one.contact },
  }
}

const onePieces = () => {
  const u = unit(LIGHT)
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)

  return [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
}

function cycle(t: Torus, name: RuleName, B: SectorBases, s: Pair, spare: Pair): void {
  const r = rules(name)
  const mid = seaBeat(t, r.one, B, s, 1, spare)

  seaBeat(t, r.two, B, mid, 2, s)
}

const copyPair = (s: Pair): Pair => ({ re: Float64Array.from(s.re), im: Float64Array.from(s.im) })

function pairGap(a: Pair, b: Pair): number {
  let x = 0

  for (let k = 0; k < a.re.length; k++) {
    x += (a.re[k]! - b.re[k]!) ** 2 + (a.im[k]! - b.im[k]!) ** 2
  }

  return Math.sqrt(x)
}

// B^dag = M1^dag: beat 1's dock pieces with conjugated coefficients (Q real symmetric), no stream
function beatOneDagger(t: Torus, name: RuleName, B: SectorBases, s: Pair): void {
  const r = rules(name).one
  const [ur, ui] = r.u

  for (let i = 0; i < t.sites.length; i++) {
    const V = t.V[i]!
    const phi = r.string * Math.min(V, r.cap) + (V === 0 ? r.contact : 0)
    const beta = betaOf(ur, ui, phi)

    sectorPiece(s.re, s.im, i * FULL, B.S, [ur - 1, -ui], [beta[0], -beta[1]])
  }
}

const conjPair = (s: Pair): Pair => ({ re: Float64Array.from(s.re), im: s.im.map(x => -x) })

// ---- stage results ----

export type DenseStage = {
  kind: 'dense'
  name: string
  rule: RuleName
  start: 'WW' | 'FW'
  flat: number
  nF: number[]
  drift: number
  seconds: number
}

export type JStage = {
  kind: 'j'
  name: string
  rule: RuleName
  // |U J U phi - J phi| / |phi| with J = M1^dag K, and the teeth control with J0 = K
  residual: number
  control: number
  drift: number
  seconds: number
}

export type TraceStage = {
  kind: 'trace'
  name: string
  rule: TraceRule
  dim: number
  moments: number
  // t_m for m = 1..M
  re: number[]
  im: number[]
  drift: number
  seconds: number
}

export type PaperStage = {
  kind: 'paper'
  name: string
  // max |a_b(g y) - a_b(y)| over the 384 signed permutations, both beats, both rules
  isotropy: Record<RuleName, number>
  // the raw-count sea phase a cycle (mod 2 pi, folded to [-pi, pi]) and the normal-ordered amplitude's distance from 1
  seaRaw: Record<RuleName, number>
  seaOrdered: Record<RuleName, number>
  Phi: number
}

export type BrevStage = DenseStage | JStage | TraceStage | PaperStage
export type BrevSpec = { name: string; run: () => BrevStage }

function denseRun(name: RuleName, start: 'WW' | 'FW'): DenseStage {
  const t0 = Date.now()
  const t = torus(L)
  const mv = movingBlocks(t, onePieces())
  const B = sectorBases()
  const s = start === 'WW' ? pairStart(t, mv, 'W', 0, 'W', 47) : pairStart(t, mv, 'F', 0, 'W', 47)
  const flat = flatCount(t, mv, s).nF
  const spare = newPair(t)
  const nF: number[] = []

  let drift = 0

  for (let c = 1; c <= CYCLES; c++) {
    cycle(t, name, B, s, spare)

    if (READS.includes(c)) {
      nF.push(flatCount(t, mv, s).nF)
      drift = Math.max(drift, Math.abs(pairNorm(s) - 1))
      console.error(`dense ${name} ${start} c ${c} nF ${nF[nF.length - 1]} ${((Date.now() - t0) / 1000).toFixed(0)}s`)
    }
  }

  return {
    kind: 'dense',
    name: `dense-${name}-${start}`,
    rule: name,
    start,
    flat,
    nF,
    drift,
    seconds: (Date.now() - t0) / 1000,
  }
}

function jRun(name: RuleName): JStage {
  const t0 = Date.now()
  const t = torus(L)
  const mv = movingBlocks(t, onePieces())
  const B = sectorBases()
  const phi = pairStart(t, mv, 'W', 19, 'W', 20)
  const spare = newPair(t)
  const n0 = Math.sqrt(pairNorm(phi))
  // J phi
  const jPhi = conjPair(phi)

  beatOneDagger(t, name, B, jPhi)

  // U J U phi
  const a = copyPair(phi)

  cycle(t, name, B, a, spare)

  const ja = conjPair(a)

  beatOneDagger(t, name, B, ja)
  cycle(t, name, B, ja, spare)

  // control: K U K U phi against K phi
  const k = conjPair(a)

  cycle(t, name, B, k, spare)

  const kPhi = conjPair(phi)

  return {
    kind: 'j',
    name: `j-${name}`,
    rule: name,
    residual: pairGap(ja, jPhi) / n0,
    control: pairGap(k, kPhi) / n0,
    drift: Math.abs(pairNorm(ja) - pairNorm(phi)),
    seconds: (Date.now() - t0) / 1000,
  }
}

function traceRule(rule: TraceRule, angle: Float64Array): HoleRule {
  if (rule === 'free') {
    return { angle: null }
  }

  const neg = angle.map(x => -x)

  if (rule === 'rev') {
    return { angle }
  }

  return rule === 'unrev' ? { angle, angle2: neg } : { angle: neg, angle2: angle }
}

export function traceRun(rule: TraceRule, moments: number, from = 0, to = Infinity): TraceStage {
  const t0 = Date.now()
  const t = torus(L)
  const fr = holeFrame(t, onePieces(), 8)
  const e = holeEngine(fr, 2, 0)
  const angle = pairAngles(t, -S_ANG, CAP, -2 * V_ANG)
  const r = traceRule(rule, angle)
  const dim = fr.fourier.N * fr.fiber ** 2
  const re = new Array<number>(moments).fill(0)
  const im = new Array<number>(moments).fill(0)
  const hi = Math.min(dim, to)

  let drift = 0

  for (let j = from; j < hi; j++) {
    const s = newHoles(fr, 2, 0)

    s.re[j] = 1

    for (let m = 0; m < moments; m++) {
      holeCycle(e, r, s)
      re[m]! += s.re[j]!
      im[m]! += s.im[j]!
    }

    drift = Math.max(drift, Math.abs(holeNorm(s) - 1))

    if (j % 512 === 0) {
      console.error(`trace ${rule} j ${j} ${((Date.now() - t0) / 1000).toFixed(0)}s`)
    }
  }

  return {
    kind: 'trace',
    name: `trace-${rule}${from > 0 || to < Infinity ? `-${from}-${hi}` : ''}`,
    rule,
    dim,
    moments,
    re,
    im,
    drift,
    seconds: (Date.now() - t0) / 1000,
  }
}

function signedPerms(): { p: number[]; s: number[] }[] {
  const perms: number[][] = []
  const go = (a: number[], rest: number[]): void => {
    if (rest.length === 0) {
      perms.push(a)
      return
    }

    rest.forEach((x, i) => go([...a, x], rest.filter((_, k) => k !== i)))
  }

  go([], [0, 1, 2, 3])

  const out: { p: number[]; s: number[] }[] = []

  for (const p of perms) {
    for (let m = 0; m < 16; m++) {
      out.push({ p, s: [0, 1, 2, 3].map(k => ((m >> k) & 1 ? -1 : 1)) })
    }
  }

  return out
}

function paperRun(): PaperStage {
  const t = torus(L)
  const angle = pairAngles(t, -S_ANG, CAP, -2 * V_ANG)
  const g = signedPerms()
  const mod = (x: number): number => ((x % L) + L) % L
  const tables: Record<RuleName, Float64Array[]> = {
    rev: [angle, angle.map(x => -x)],
    unrev: [angle, angle],
  }
  const isotropy: Record<RuleName, number> = { rev: 0, unrev: 0 }

  for (const name of ['rev', 'unrev'] as const) {
    for (const tab of tables[name]) {
      t.sites.forEach((y, i) => {
        for (const { p, s } of g) {
          const gy = p.map((k, a) => mod(s[a]! * y[k]!))
          const j = t.index.get(gy.join(','))!

          isotropy[name] = Math.max(isotropy[name], Math.abs(tab[j]! - tab[i]!))
        }
      })
    }
  }

  // raw sea count: every unordered pair of distinct docks, r^2 = 64 member pairs in the sector, at a(V); the sea is
  // translation invariant, so the sum is (docks / 2) sum over nonzero relative docks
  let rel = 0

  t.sites.forEach((_, i) => {
    if (t.V[i]! > 0) {
      rel += angle[i]!
    }
  })

  const Phi = (64 * t.sites.length * rel) / 2
  const fold = (x: number): number => {
    const y = ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

    return y > Math.PI ? y - 2 * Math.PI : y
  }

  return {
    kind: 'paper',
    name: 'paper',
    isotropy,
    // beat 1 +Phi, beat 2 -Phi (reversed) or +Phi (unreversed)
    seaRaw: { rev: fold(Phi - Phi), unrev: fold(2 * Phi) },
    // normal ordered: each beat's piece is 1 on the full sea (f = (N_x - r)(N_y - r) = 0 there), whatever the sign
    seaOrdered: { rev: 0, unrev: 0 },
    Phi: fold(Phi),
  }
}

export const TRACE_MOMENTS = 32

export function brevSpecs(): BrevSpec[] {
  const out: BrevSpec[] = [{ name: 'paper', run: paperRun }]

  for (const r of ['rev', 'unrev'] as const) {
    out.push({ name: `j-${r}`, run: () => jRun(r) })

    for (const st of ['WW', 'FW'] as const) {
      out.push({ name: `dense-${r}-${st}`, run: () => denseRun(r, st) })
    }
  }

  for (const r of ['rev', 'unrev', 'unrevneg', 'free'] as const) {
    out.push({ name: `trace-${r}`, run: () => traceRun(r, TRACE_MOMENTS) })
  }

  return out
}

// ---- the verdict ----

type Prop = {
  key: string
  established: string
  choice: boolean
  rev: number
  unrev: number
}

function mirrorRaw(t: TraceStage): number {
  let x = 0

  for (let m = 0; m < t.moments; m++) {
    x = Math.max(x, (2 * Math.abs(t.im[m]!)) / t.dim)
  }

  return x
}

// the least over a uniform shift c of max_m |t_m - e^(imc) conj t_m| / dim (a rephasing of the conserved number)
function mirrorShift(t: TraceStage): { c: number; residual: number } {
  const res = (c: number): number => {
    let x = 0

    for (let m = 0; m < t.moments; m++) {
      const k = m + 1
      const cr = Math.cos(k * c)
      const ci = Math.sin(k * c)
      // e^(ikc) conj t
      const yr = cr * t.re[m]! + ci * t.im[m]!
      const yi = ci * t.re[m]! - cr * t.im[m]!

      x = Math.max(x, Math.hypot(t.re[m]! - yr, t.im[m]! - yi) / t.dim)
    }

    return x
  }

  let best = { c: 0, residual: res(0) }
  const grid = 20000

  for (let k = 0; k < grid; k++) {
    const c = (2 * Math.PI * k) / grid
    const r = res(c)

    if (r < best.residual) {
      best = { c, residual: r }
    }
  }

  let lo = best.c - (2 * Math.PI) / grid
  let hi = best.c + (2 * Math.PI) / grid

  for (let it = 0; it < 200; it++) {
    const a = lo + (hi - lo) / 3
    const b = hi - (hi - lo) / 3

    if (res(a) < res(b)) {
      hi = b
    } else {
      lo = a
    }
  }

  const c = (lo + hi) / 2

  return res(c) < best.residual ? { c, residual: res(c) } : best
}

export function brevVerdict(stages: BrevStage[]): Verdict {
  const get = <K extends BrevStage['kind']>(kind: K, name: string): Extract<BrevStage, { kind: K }> | undefined =>
    stages.find(s => s.kind === kind && s.name === name) as Extract<BrevStage, { kind: K }> | undefined
  const need = brevSpecs().map(s => s.name)
  const missing = need.filter(n => !stages.some(s => s.name === n))

  if (missing.length > 0) {
    return verdict({ status: 'open', claim: `beat-reversal INCOMPLETE: missing ${missing.join(', ')}`, metrics: {} })
  }

  const paper = get('paper', 'paper')!
  const dense = (r: RuleName, st: 'WW' | 'FW') => get('dense', `dense-${r}-${st}`)!
  const j = (r: RuleName) => get('j', `j-${r}`)!
  const tr = (r: TraceRule) => get('trace', `trace-${r}`)!
  const flatGap = (r: RuleName): number =>
    Math.max(...(['WW', 'FW'] as const).map(st => Math.max(...dense(r, st).nF.map(x => Math.abs(x - dense(r, st).flat)))))
  const drift = (r: RuleName): number =>
    Math.max(dense(r, 'WW').drift, dense(r, 'FW').drift)
  const unrev = tr('unrev')
  const neg = tr('unrevneg')
  let mapGap = 0

  for (let m = 0; m < unrev.moments; m++) {
    mapGap = Math.max(mapGap, Math.hypot(unrev.re[m]! - neg.re[m]!, unrev.im[m]! + neg.im[m]!) / unrev.dim)
  }

  const shifted = mirrorShift(unrev)
  const props: Prop[] = [
    { key: 'U unitarity', established: 'E-SPN-0175 I4', choice: false, rev: drift('rev'), unrev: drift('unrev') },
    { key: 'F flats', established: 'E-SPN-0175 F', choice: false, rev: flatGap('rev'), unrev: flatGap('unrev') },
    { key: 'J time reversal', established: 'E-FRC-0258 T', choice: false, rev: j('rev').residual, unrev: j('unrev').residual },
    {
      key: 'C/CPT mirror (raw)',
      established: 'E-FRC-0258 C raw and CPT, E-SPN-0160 point 5; the base knit C, P, T, CPT theorem E-FND-0011',
      choice: false,
      rev: mirrorRaw(tr('rev')),
      unrev: mirrorRaw(unrev),
    },
    { key: 'I isotropy', established: 'E-SPN-0162 point 5, E-SPN-0175', choice: false, rev: paper.isotropy.rev, unrev: paper.isotropy.unrev },
    { key: 'S sea one branch, amplitude 1 (normal ordered)', established: 'E-SPN-0175 V, E-FND-0157', choice: false, rev: paper.seaOrdered.rev, unrev: paper.seaOrdered.unrev },
  ]
  const IJ = j('rev').control > TEETH && j('unrev').control > TEETH
  const IC = mirrorRaw(tr('free')) <= HOLDS && mapGap <= HOLDS
  const IN =
    drift('rev') <= HOLDS &&
    drift('unrev') <= HOLDS &&
    (['rev', 'unrev', 'unrevneg', 'free'] as const).every(r => tr(r).drift <= HOLDS) &&
    j('rev').drift <= HOLDS &&
    j('unrev').drift <= HOLDS
  const forcing = props.filter(p => p.rev <= HOLDS && p.unrev > FAILS && !p.choice)
  const choice = props.every(p => p.unrev <= HOLDS)
  const instrument = IJ && IC && IN
  const word = !instrument ? 'OPEN (instrument)' : forcing.length > 0 ? 'FORCED' : choice ? 'CHOICE' : 'OPEN'
  const status: Verdict['status'] = !instrument ? 'open' : forcing.length > 0 ? 'pass' : choice ? 'fail' : 'open'
  const metrics: Record<string, number> = {
    mirrorShiftUnrev: shifted.residual,
    mirrorShiftC: shifted.c,
    mirrorMapGap: mapGap,
    mirrorFree: mirrorRaw(tr('free')),
    jControlRev: j('rev').control,
    jControlUnrev: j('unrev').control,
    seaRawRev: paper.seaRaw.rev,
    seaRawUnrev: paper.seaRaw.unrev,
    seaPhi: paper.Phi,
  }

  props.forEach((p, i) => {
    metrics[`p${i}_rev`] = p.rev
    metrics[`p${i}_unrev`] = p.unrev
  })

  return verdict({
    status,
    claim: `beat-reversal ${word}: ${props.map(p => `${p.key} rev ${p.rev.toExponential(2)} unrev ${p.unrev.toExponential(2)} (${p.established})`).join('; ')}; forcing: ${forcing.map(p => p.key).join(', ') || 'none'}.`,
    metrics,
    control: { IJ: IJ ? 1 : 0, IC: IC ? 1 : 0, IN: IN ? 1 : 0 },
    notes: `Unreversed mirror up to the best uniform shift c ${shifted.c.toFixed(6)}: ${shifted.residual.toExponential(2)}. Raw-count sea phase a cycle: rev ${paper.seaRaw.rev.toExponential(2)}, unrev ${paper.seaRaw.unrev.toFixed(6)} (Phi ${paper.Phi.toFixed(6)}), a global phase either way. LIMIT: L 4, total momentum 0, trace moments m = 1..${TRACE_MOMENTS}.`,
  })
}

export default experiment({
  id: 'gauge/beat-reversal',
  code: 'E-FRC-0308',
  title: 'explores whether R*s beat-2 reversal of the pair angle is forced by a property the rule already has',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return brevVerdict(brevSpecs().map(s => s.run()))
  },
})
