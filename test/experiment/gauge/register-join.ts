// A CHANNEL THAT JOINS THE REGISTER HALVES, AND THE HIGGS ROW READ ON IT (E-FRC-0273). E-FRC-0271 left the Higgs row with
// one question: every piece of the register rule R*, the SU(2)+ field included, commutes with J, and under Gauss's law a
// sea that breaks SU(2)+ is not a state (Elitzur). So the row was restated as a gauge invariant condensate <psi_-^dag
// psi_+>, dressed by the field. This file derives what can join the halves and keep the rule's invariants, builds the one
// channel that survives, and reads the condensate. The derivation is note/research/vibe/roadmap/remaining-pieces.md, "A
// channel that joins the register halves".
//
// DERIVED BEFORE THE RUN (code/measure/register-join, register-sea, register-link-field).
// 1. THE CENTER (L1). 4 Gamma(-1) = -4 J exactly: the center of each dock's 2T is -1 on half + and +1 on half -, and a
//    link is odd under it at both ends. So every gauge invariant operator holds an EVEN number of half + fields, and
//    psi_-^dag psi_+ cannot be dressed into an invariant by any 2T field: its open end sits at the psi_- dock. Under
//    Gauss's law it is exactly 0 in every state. On a closed torus the physical states hold N+ even: a lone half + member
//    (a lone light face doublet) is not physical.
// 2. THE MODEL HAS NO JOIN (L1). Every one-body piece of R* is built from 24 Q_S, 48 Q_D, the chiral projector and the
//    Wilson halves, all commuting with J (E-FRC-0268), the field commutes with J (E-FRC-0271), the role kernels act on a
//    separate factor (E-FND-0160), and the wall between R1 and its mirror is built from the same projectors. A pair piece
//    that keeps N+ and N- is a Fierz relabeling. So the least join is a NEW pair piece moving two half + members in an
//    isospin singlet to two half - members.
// 3. THE CENSUS (L1). On the sector ranges where a pair piece keeps the flats (S, the slot singlet, and D, the partner),
//    the isospin singlet of Lambda^2(X+) is a spin triplet of s+ in S and of s- in D (D's odd blades trade the two spin
//    factors). Schur then predicts, over gauge x rotations and with SU(2)- added: Lambda^2(S+) -> Lambda^2(S-) 0 and 0,
//    Lambda^2(D+) -> Lambda^2(D-) 1 and 0, Lambda^2(S+) -> Lambda^2(D-) 1 and 1, Lambda^2(D+) -> Lambda^2(S-) 2 and 1. So the
//    one join that keeps SU(2)- and the untwisted rotation L(s) (E-FRC-0267's spin one half) is S -> D, and it is unique;
//    the one-sector join D -> D breaks both.
// 4. THE PIECE (L1). In beat 2's frame the source is two holes that sat at contact in S before the stream, the target two
//    holes at contact in D, both orthogonal to the flats there and to each other. K = 1 + (v - 1) Pi_b, Pi_b on the
//    bonding states (a_k + T a_k) / sqrt 2, v = rho = ringUnit(1, 0), counted from the sea. From a contact pair in the
//    source, one cycle moves |v - 1|^2 / 4 = (1 - cos theta_v) / 2 into the target: 3/28 at rho, 3/4 at omega.
// 5. WHAT IT KEEPS (L1). One branch (identity on the full sea), the flats (both channels orthogonal to them), K (the
//    occupancy count ignores registers), the member light (one hole untouched), gauge invariance, rotations, spin one
//    half, SU(2)-, and the one-body handedness. It breaks each half's member number: N+ - N- kept mod 4, N+ mod 2 exactly.
// 6. THE HIGGS ROW (L1). <psi_-^dag psi_+> stays exactly 0 (N+ parity is kept). What can form is the gauge invariant pair
//    coherence kappa = sum_k conj(<a_k|psi>) <T a_k|psi>; the ledger adds -<Pi_b> = -(<Pi_A> + <Pi_B>) / 2 - Re kappa a
//    prime unit, which is the same for bonding and antibonding on every sea E-FND-0159 compares; the field's electric
//    count is 0 on both channels; and no one-body level moves. PREDICTED TO FAIL.
//
// PREDICTED VERDICT: FAIL, on H alone, as derived. The join builds, keeps every invariant and mixes the halves.
//
// GATES, fixed before the gate run.
//  Z THE CENTER AND THE MODEL: 4 Gamma(-1) = -4 J exactly; -1 commutes with all 24 elements of 2T; J commutes exactly with
//    24 Q_S, 48 Q_D, 96 Q_D P+, 48 Q_S P+ and 2 P+ (registerGap 0).
//  N THE CENSUS: the eight dimensions of point 3, each within 1e-9 of its integer (13,824 and 331,776 elements).
//  B THE JOIN IS BUILT: S -> D: scale above 1e-6, T^dag T = Pi_A within 1e-12, T intertwines the 24 Gamma+, the 576
//    rotations, the 24 Gamma- and the 576 untwisted rotations L(s), each within 1e-12; D -> D: its T fails Gamma- and L(s)
//    by more than 1e-3 (the cost of a one-sector join).
//  I THE INVARIANTS: two holes on the L = 4 torus, E-SPN-0175's rule (light unit ringUnit(-1, 4), string ringUnit(-2, 1)
//    cap 8, contact ringUnit(2, 0) squared, hole angles reversed) with the join, 64 cycles, from the contact start (a_1 at
//    contact in S) and the moving start (E-SPN-0175's W 0 (x) W 47 pair, kept on half + (x) half +): N_F within 1e-10 of
//    0 at cycles 1, 2, 4, 8, 16, 32, 64; the weight with N+ odd at most 1e-24 at every cycle; the norm within 1e-10; the
//    least slot occupancy 6 and no K or store trigger over every two-hole configuration. And on the L = 6 torus from the
//    contact start, 8 cycles: N_F within 1e-10 of 0 at cycles 1 and 8, the N+ odd weight at most 1e-24.
//  X THE CHANNEL MIXES: after one cycle from the contact start the weight with both holes in half - is 3/28 within 1e-10
//    at v = rho (on L = 4 and L = 6) and 3/4 within 1e-10 at v = omega (L = 4); from the moving start it exceeds 1e-6 by
//    cycle 64.
//  H A GAUGE INVARIANT <psi_-^dag psi_+> FORMS (predicted FAIL): the N+ odd weight of some join run exceeds 1e-12 at some
//    cycle, or the center acts evenly on psi_-^dag psi_+ (4 Gamma(-1) not -4 J).
// CONTROLS (a failure makes the verdict partial at best).
//  C1 THE SAME PIECE WITH NOTHING JOINED: 1 + (v - 1) Pi_A, from both starts on L = 4 (64 cycles) and the contact start
//     on L = 6 (8 cycles): the weight with both holes in half - at most 1e-24 at every cycle.
//  C2 THE GAUGE CHECK HAS TEETH: the rotation average of the same seed from all of Lambda^2(S+) (no isospin singlet
//     projection) fails to intertwine some Gamma+ by more than 1e-3.
// INSTRUMENT (a failure makes the verdict partial at best). W(q) of rank 16 at every momentum with S inside it within
//  1e-12; the sector ranges invariant under every symmetry used within 1e-12; the spin lifts one-dimensional; Parseval
//  within 1e-10.
// READ, gating nothing: kappa each cycle and its running mean at cycles 8, 16, 32, 64 (the stationary part), the ledger's
//  join term -Re kappa a prime unit against the midpoint, the weight in half - over time, the mirror join's gauge gap, the
//  channels' scales.
// Verdict: fail if Z, N, B, I, X or H fails (H is predicted to); partial if a control or the instrument fails; pass
//  otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after the gate run). tmp/hc-probe1.log: the census on the eight
//  numbers, exactly the integers of point 3; rotations normalize the gauge group (6.7e-16). tmp/hc-probe2.log: 4 Gamma(-1)
//  = -4 J, S -> D intertwines everything (worst 3.5e-16, 576 of 576 untwisted), D -> D and D -> S keep 24 of 576 untwisted
//  and miss Gamma- by 0.125 and 0.078, S -> S has scale 3.8e-33 (no channel); the mirror of S -> D is gauge invariant
//  (3.2e-16). tmp/hc-smoke.log (4 cycles, L = 4): w-- 0.10714286 after one cycle from the contact start, control 1.8e-31,
//  N+ odd at most 6.3e-31, N_F at most 1.3e-13, the norm within 3.1e-11; the moving start reaches w-- 3.9e-5 by cycle 4.
//  tmp/hc-smoke2.log: every code path of this file on L = 4 for 2 cycles (and 1), the same verdict.
//
// FIRST RUN (tmp/hc-gate-E-FRC-0273.log, 833 s): FAIL on H alone, as derived. No gate moved and none was rerun.
//  - Z: 4 Gamma(-1) = -4 J, -1 central, J gaps 0 0 0 0 0. N: the eight dimensions 0 0 1 0 1 1 2 1, within 6e-16.
//  - B: S -> D scale 4.340e-2, Schur 9.0e-17, Gamma+ 2.4e-16, rotations 2.8e-16, Gamma- 3.2e-16, untwisted 3.5e-16;
//    D -> D misses Gamma- and the untwisted rotations by 0.125.
//  - I: N_F within 3.2e-13 of 0 at every read (L = 4, 64 cycles; L = 6, 8 cycles), N+ odd at most 2.4e-29, least
//    occupancy 6 over 4,718,592 configurations, K 0, store 0.
//  - X: 0.10714285714285 after one cycle at rho on L = 4 and L = 6 (3/28), 0.75000000000006 at omega (3/4); the moving
//    start reaches 1.1e-4.
//  - H fails: N+ odd at most 2.2e-29 in every join run, and 4 Gamma(-1) = -4 J.
//  - C1: the same phase with nothing joined keeps w-- at most 1.4e-29. C2: the ungauged average misses Gamma+ by 5.2e-3.
//  - READ: from the contact start w-- swings between 0.04 and 0.114 (mean 0.073) over 64 cycles; |kappa| reaches 0.224,
//    and its running mean settles at 0.063, 0.042, 0.048, 0.040 at cycles 8, 16, 32, 64 (Re 0.016, 0.014, 0.018, 0.013),
//    0.065 at cycle 8 on L = 6; the moving start's mean is 5.1e-5 at 32 and 64. The controls' means are below 4e-18. The
//    mirror join is gauge invariant too (3.2e-16).
//  THE AUDIT, as harshly as a stranger's. The algebra is L1: the center, Schur and characters, with a control (C2) that
//  fails when the gauge projection is dropped. The runs are L2: a new pair piece on R*'s engine, whose conversion is the
//  derived rational and whose invariants hold because both channels were placed orthogonal to the flats by construction.
//  The informative results are the negatives: the dressed <psi_-^dag psi_+> cannot exist, the one-sector joins cost the
//  spin one half, and no one-body mass follows. The settled running mean of kappa suggests two-hole stationary states
//  that carry the gauge invariant coherence, but 64 cycles on one box cannot separate a stationary part from a slow
//  oscillation, so it is read, not claimed.
//
// DETERMINISM: no random numbers; the seed is a golden-ratio stream, the starts are fixed modes. EXACT: 4 Gamma, J and the
// projectors are integer matrices, the one-cycle conversions are rationals (3/28, 3/4); every amplitude is float
// measurement.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { hurwitzExact } from '@/code/measure/hurwitz-gauge'
import { registerGauge } from '@/code/measure/register-link-field'
import { chirality2, volumeRight } from '@/code/measure/chiral-register'
import {
  matMul,
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { IDENTITY_SLOTS, registerGap } from '@/code/measure/register-symmetry'
import {
  flatCount,
  movingBlocks,
  newPair,
  pairNorm,
  pairStart,
  seaBeat,
  seaTriggers,
  sectorBases,
  torus,
  type Pair,
  type SeaRule,
  type Torus,
} from '@/code/measure/register-sea'
import {
  channelHom,
  contactPair,
  halfWeights,
  intertwineGap,
  joinApply,
  joinChannel,
  kron,
  mulM,
  projectHalves,
  sectorSymmetries,
  transposeM,
  wedgeProjector,
  type JoinChannel,
  type JoinMode,
  type M8,
  type Symmetries,
} from '@/code/measure/register-join'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const JOIN_UNIT: readonly [number, number] = [1, 0]
const SECOND_UNIT: readonly [number, number] = [0, 2]
const CAP = 8
const EXACT_FLOAT = 1e-10
const ALGEBRA = 1e-12
const ODD_ZERO = 1e-24
const ODD_FORMS = 1e-12
const COSTS = 1e-3
const MOVING_MIX = 1e-6
const HOM_TOL = 1e-9
const READS: readonly number[] = [1, 2, 4, 8, 16, 32, 64]
const MEANS: readonly number[] = [8, 16, 32, 64]
const GOLDEN = (Math.sqrt(5) - 1) / 2

export type JoinPlan = {
  L: number
  cycles: number
  // the second torus, contact start only
  L2: number
  cycles2: number
}

export const GATE_PLAN: JoinPlan = { L: 4, cycles: 64, L2: 6, cycles2: 8 }

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/register-join',
  code: 'E-FRC-0273',
  title:
    'a gauge invariant channel joins the two register halves and keeps every invariant of the register rule, but no gauge invariant <psi_-^dag psi_+> forms, fail as derived: the center of each dock 2T acts as -J, so every gauge invariant operator holds an even number of half + fields and psi_-^dag psi_+ cannot be dressed into an invariant by any 2T field; the least join moves two half + members in an isospin singlet to two half - members, and by characters the only one that keeps rotations, SU(2)- and spin one half runs from the S sector to the D sector, unique; built as a sector contact counted from the sea, it keeps one branch, the frozen flats, K blocked, the member light and N+ mod 2, converts exactly 3/28 of a contact pair a cycle at rho against 0 for the same phase with nothing joined, and leaves <psi_-^dag psi_+> exactly 0',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerJoinRun(GATE_PLAN)
  },
})

const unitOf = (kj: readonly [number, number]): [number, number] => {
  const t = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(t), Math.sin(t)]
}

// the rotation average of the golden seed from all of Lambda^2(S+) to Lambda^2(D-) (no isospin singlet projection)
function ungaugedIntertwiner(sym: Symmetries): M8 {
  const src = wedgeProjector(sym.S.plus)
  const tgt = wedgeProjector(sym.D.minus)
  const n = src.length
  const seed = Array.from({ length: n }, (_, i) =>
    Array.from(
      { length: n },
      (__, j) => ((((i * n + j + 1) * GOLDEN) % 1) + 1) % 1 - 0.5,
    ),
  )
  const X0 = mulM(mulM(tgt, seed), src)
  const T = X0.map(r => r.map(() => 0))

  sym.S.rotations.forEach((gs, k) => {
    const gd = sym.D.rotations[k]!
    const m = mulM(mulM(kron(gd, gd), X0), transposeM(kron(gs, gs)))

    m.forEach((r, i) =>
      r.forEach((x, j) => (T[i]![j]! += x / sym.S.rotations.length)),
    )
  })

  return T
}

type RunResult = {
  name: string
  L: number
  mode: JoinMode
  unit: string
  nF: number[]
  oddMax: number
  minusMinus: number[]
  drift: number
  parseval: number
  kappa: [number, number][]
  means: Record<number, [number, number]>
}

function runPair(input: {
  t: Torus
  rule: SeaRule
  E: ReturnType<typeof sectorBases>
  ch: JoinChannel
  mv: ReturnType<typeof movingBlocks>
  start: Pair
  v: readonly [number, number]
  unit: string
  mode: JoinMode
  cycles: number
  reads: readonly number[]
  name: string
  log: (s: string) => void
}): RunResult {
  const { t, rule, E, ch, mv, start, v, mode, cycles, reads } = input
  const s: Pair = { re: Float64Array.from(start.re), im: Float64Array.from(start.im) }
  const spare = newPair(t)
  const nF: number[] = []
  const mm: number[] = []
  const kappa: [number, number][] = []
  const means: Record<number, [number, number]> = {}

  let oddMax = halfWeights(t, s).mixed
  let drift = 0
  let parseval = 0
  let sr = 0
  let si = 0

  for (let c = 1; c <= cycles; c++) {
    const mid = seaBeat(t, rule, E, s, 1, spare)
    const r = joinApply(t, mid, ch, E.D, v, mode)

    seaBeat(t, rule, E, mid, 2, s)

    const w = halfWeights(t, s)

    oddMax = Math.max(oddMax, w.mixed)
    mm.push(w.minusMinus)
    kappa.push([r.kappaRe, r.kappaIm])
    sr += r.kappaRe
    si += r.kappaIm

    if (MEANS.includes(c)) {
      means[c] = [sr / c, si / c]
    }

    if (reads.includes(c)) {
      const norm = pairNorm(s)
      const f = flatCount(t, mv, s)

      nF.push(f.nF)
      drift = Math.max(drift, Math.abs(norm - 1))
      parseval = Math.max(parseval, Math.abs(f.fourier / t.sites.length - norm))
    }
  }

  input.log(
    `${input.name} L${t.L} ${mode} ${input.unit}: nF ${nF.map(x => x.toExponential(2)).join(' ')} odd ${oddMax.toExponential(2)} w-- first ${mm[0]!.toExponential(6)} last ${mm[mm.length - 1]!.toExponential(4)}`,
  )

  return {
    name: input.name,
    L: t.L,
    mode,
    unit: input.unit,
    nF,
    oddMax,
    minusMinus: mm,
    drift,
    parseval,
    kappa,
    means,
  }
}

export function registerJoinRun(plan: JoinPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

  // ---------------- Z ----------------
  const hurwitz = hurwitzExact()
  const minusOne = hurwitz.doubled.findIndex(
    q => q[0] === -2 && q[1] === 0 && q[2] === 0 && q[3] === 0,
  )
  const G = registerGauge()
  const J = volumeRight()
  const centerIsJ = G.gamma4[minusOne]!.every((r, i) =>
    r.every((x, j) => x === -4 * J[i]![j]!),
  )
  const n2T = hurwitz.group.order

  let central = true

  for (let a = 0; a < n2T; a++) {
    if (
      hurwitz.group.table[minusOne * n2T + a] !==
      hurwitz.group.table[a * n2T + minusOne]
    ) {
      central = false
    }
  }

  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const chi2 = chirality2(J, 1)
  const ruleQ = [S24, D48, matMul(D48, chi2), matMul(S24, chi2), chi2]
  const jGaps = ruleQ.map(q => registerGap(q, IDENTITY_SLOTS, J))
  const Z = centerIsJ && central && jGaps.every(g => g === 0)

  log('Z')

  // ---------------- N ----------------
  const sym = sectorSymmetries()
  const homA = channelHom(sym, false)
  const homB = channelHom(sym, true)
  const predicted: [string, number, number][] = [
    ['S+S+ -> S-S-', homA.wedgeSStoSS, 0],
    ['S+S+ -> S-S- with SU(2)-', homB.wedgeSStoSS, 0],
    ['D+D+ -> D-D-', homA.wedgeDDtoDD, 1],
    ['D+D+ -> D-D- with SU(2)-', homB.wedgeDDtoDD, 0],
    ['S+S+ -> D-D-', homA.wedgeSStoDD, 1],
    ['S+S+ -> D-D- with SU(2)-', homB.wedgeSStoDD, 1],
    ['D+D+ -> S-S-', homA.wedgeDDtoSS, 2],
    ['D+D+ -> S-S- with SU(2)-', homB.wedgeDDtoSS, 1],
  ]
  const N = predicted.every(([, x, k]) => Math.abs(x - k) <= HOM_TOL)

  log('N')

  // ---------------- B ----------------
  const ch = joinChannel(sym, 'S', 'D')
  const dd = joinChannel(sym, 'D', 'D')
  const sdGaps = {
    gaugePlus: intertwineGap(ch.T, sym.S.gaugePlus, sym.D.gaugePlus),
    rotations: intertwineGap(ch.T, sym.S.rotations, sym.D.rotations),
    gaugeMinus: intertwineGap(ch.T, sym.S.gaugeMinus, sym.D.gaugeMinus),
    untwisted: intertwineGap(ch.T, sym.S.untwisted, sym.D.untwisted),
  }
  const ddGaps = {
    gaugeMinus: intertwineGap(dd.T, sym.D.gaugeMinus, sym.D.gaugeMinus),
    untwisted: intertwineGap(dd.T, sym.D.untwisted, sym.D.untwisted),
  }
  const B =
    ch.scale > 1e-6 &&
    ch.A.length === 3 &&
    ch.schurGap <= ALGEBRA &&
    Object.values(sdGaps).every(g => g <= ALGEBRA) &&
    ddGaps.gaugeMinus > COSTS &&
    ddGaps.untwisted > COSTS

  // the mirror join (every reflection gives the same one: two reflections differ by a rotation, which the join keeps)
  // and C2
  const rs = sym.S.reflections[0]!
  const rd = sym.D.reflections[0]!
  const mirror = mulM(mulM(kron(rd, rd), ch.T), transposeM(kron(rs, rs)))
  const mirrorGauge = intertwineGap(mirror, sym.S.gaugePlus, sym.D.gaugePlus)

  const ungauged = ungaugedIntertwiner(sym)
  const c2Gap = intertwineGap(ungauged, sym.S.gaugePlus, sym.D.gaugePlus)
  const C2 = c2Gap > COSTS

  log('B')

  // ---------------- the runs ----------------
  const u = unitOf(LIGHT)
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const rule: SeaRule = {
    u,
    string: -sAng,
    cap: CAP,
    contact: -2 * vAng,
    dock: null,
    member: false,
  }
  const qS = scaled(S24, 24)
  const qD = scaled(D48, 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const E = sectorBases()
  const jv = unitOf(JOIN_UNIT)
  const jw = unitOf(SECOND_UNIT)
  const want = (v: readonly [number, number]): number => (1 - v[0]) / 2
  const runs: RunResult[] = []
  const instrument: { rank: boolean; sInW: number; L: number }[] = []
  const trigger = { least: Infinity, k: 0, store: 0, configurations: 0 }

  for (const [L, cycles, full] of [
    [plan.L, plan.cycles, true],
    [plan.L2, plan.cycles2, false],
  ] as const) {
    const t = torus(L)
    const mv = movingBlocks(t, Ps)

    instrument.push({ rank: mv.rank.every(k => k === 16), sInW: mv.sOutsideW, L })

    if (full) {
      const trig = seaTriggers(t)

      trigger.least = trig.leastOccupancy
      trigger.k = trig.kTriggers
      trigger.store = trig.storeTriggers
      trigger.configurations = trig.configurations
    }

    log(`L ${L}: moving blocks`)

    const reads = full ? READS : [1, cycles]
    const starts: { name: string; make: () => Pair }[] = [
      { name: 'contact', make: () => contactPair(t, E.S, ch.A[0]!) },
    ]

    if (full) {
      starts.push({
        name: 'moving',
        make: () => projectHalves(t, pairStart(t, mv, 'W', 0, 'W', 47), 1),
      })
    }

    for (const st of starts) {
      const start = st.make()

      for (const mode of ['join', 'control'] as const) {
        runs.push(
          runPair({
            t,
            rule,
            E,
            ch,
            mv,
            start,
            v: jv,
            unit: 'rho',
            mode,
            cycles,
            reads,
            name: st.name,
            log,
          }),
        )
      }

      if (full && st.name === 'contact') {
        runs.push(
          runPair({
            t,
            rule,
            E,
            ch,
            mv,
            start,
            v: jw,
            unit: 'omega',
            mode: 'join',
            cycles: 1,
            reads: [1],
            name: st.name,
            log,
          }),
        )
      }
    }
  }

  const joins = runs.filter(r => r.mode === 'join')
  const controls = runs.filter(r => r.mode === 'control')
  const I =
    runs.every(r => r.nF.every(x => Math.abs(x) <= EXACT_FLOAT)) &&
    runs.every(r => r.oddMax <= ODD_ZERO) &&
    runs.every(r => r.drift <= EXACT_FLOAT) &&
    trigger.least === 6 &&
    trigger.k === 0 &&
    trigger.store === 0
  const contactRho = joins.filter(r => r.name === 'contact' && r.unit === 'rho')
  const contactOmega = joins.find(r => r.name === 'contact' && r.unit === 'omega')!
  const movingJoin = joins.find(r => r.name === 'moving')!
  const X =
    contactRho.length === 2 &&
    contactRho.every(r => Math.abs(r.minusMinus[0]! - want(jv)) <= EXACT_FLOAT) &&
    Math.abs(contactOmega.minusMinus[0]! - want(jw)) <= EXACT_FLOAT &&
    Math.max(...movingJoin.minusMinus) > MOVING_MIX
  const H = !centerIsJ || joins.some(r => r.oddMax > ODD_FORMS)
  const C1 = controls.every(r => r.minusMinus.every(x => x <= ODD_ZERO))
  const INS =
    instrument.every(x => x.rank && x.sInW <= ALGEBRA) &&
    sym.S.leak <= ALGEBRA &&
    sym.D.leak <= ALGEBRA &&
    sym.liftKernel === 1 &&
    runs.every(r => r.parseval <= EXACT_FLOAT)

  const hard = Z && N && B && I && X && H
  const status = !hard ? 'fail' : !C1 || !C2 || !INS ? 'partial' : 'pass'

  const metrics: Record<string, number> = {
    Z: flag(Z),
    N: flag(N),
    B: flag(B),
    I: flag(I),
    X: flag(X),
    H: flag(H),
    C1: flag(C1),
    C2: flag(C2),
    instrument: flag(INS),
    schurGap: ch.schurGap,
    scaleSD: ch.scale,
    scaleDD: dd.scale,
    sdGaugePlus: sdGaps.gaugePlus,
    sdRotations: sdGaps.rotations,
    sdGaugeMinus: sdGaps.gaugeMinus,
    sdUntwisted: sdGaps.untwisted,
    ddGaugeMinus: ddGaps.gaugeMinus,
    ddUntwisted: ddGaps.untwisted,
    mirrorGauge,
    c2Gap,
    leastOccupancy: trigger.least,
    wantRho: want(jv),
    wantOmega: want(jw),
    seconds: (Date.now() - started) / 1000,
  }

  predicted.forEach(([, x], i) => (metrics[`hom${i}`] = x))

  for (const r of runs) {
    const key = `${r.name}_L${r.L}_${r.mode}_${r.unit}`

    metrics[`${key}_first`] = r.minusMinus[0]!
    metrics[`${key}_max`] = Math.max(...r.minusMinus)
    metrics[`${key}_odd`] = r.oddMax
    metrics[`${key}_nF`] = Math.max(0, ...r.nF.map(Math.abs))

    for (const [c, m] of Object.entries(r.means)) {
      metrics[`${key}_kappaMean${c}`] = Math.hypot(m[0], m[1])
      metrics[`${key}_reKappaMean${c}`] = m[0]
    }
  }

  const runText = runs
    .map(r => {
      const mm = r.minusMinus
      const means = Object.entries(r.means)
        .map(([c, m]) => `${c}: ${m[0].toExponential(3)} ${m[1].toExponential(3)}i`)
        .join(', ')
      const absK = r.kappa.map(k => Math.hypot(k[0], k[1]))

      return `${r.name} L${r.L} ${r.mode} ${r.unit}: w-- after 1 ${mm[0]!.toExponential(8)}, max ${Math.max(...mm).toExponential(4)}, mean ${(mm.reduce((a, b) => a + b, 0) / mm.length).toExponential(4)}, last ${mm[mm.length - 1]!.toExponential(4)}; N+ odd max ${r.oddMax.toExponential(2)}; N_F ${r.nF.map(x => x.toExponential(1)).join(' ')}; |kappa| max ${Math.max(...absK).toExponential(3)}; kappa running mean ${means || 'none'}`
    })
    .join('; ')

  return verdict({
    status,
    claim: `Z ${Z} (4 Gamma(-1) = -4 J ${centerIsJ}, -1 central ${central}, J gaps ${jGaps.join(' ')}); N ${N} (${predicted.map(([k, x]) => `${k} ${x.toFixed(9)}`).join(', ')}); B ${B} (S -> D: scale ${ch.scale.toExponential(3)}, Schur ${ch.schurGap.toExponential(2)}, Gamma+ ${sdGaps.gaugePlus.toExponential(2)}, rotations ${sdGaps.rotations.toExponential(2)}, Gamma- ${sdGaps.gaugeMinus.toExponential(2)}, untwisted ${sdGaps.untwisted.toExponential(2)}; D -> D: Gamma- ${ddGaps.gaugeMinus.toExponential(3)}, untwisted ${ddGaps.untwisted.toExponential(3)}); I ${I} (${trigger.configurations} configurations, least occupancy ${trigger.least}, K ${trigger.k}, store ${trigger.store}); X ${X} (want ${want(jv).toFixed(12)} at rho, ${want(jw).toFixed(12)} at omega); H ${H} (predicted false); controls C1 ${C1} C2 ${C2} (ungauged Gamma+ gap ${c2Gap.toExponential(3)}); instrument ${INS}; mirror join Gamma+ gap ${mirrorGauge.toExponential(2)}. Runs: ${runText}`,
    metrics,
    control: { C1: flag(C1), C2: flag(C2), instrument: flag(INS) },
    notes: `L1 (the center, the census, the channel) and L2 (the two-hole runs on R*'s engine). Join unit rho = ringUnit(${JOIN_UNIT.join(', ')}), second unit omega. Tori L ${plan.L} (${plan.cycles} cycles) and L ${plan.L2} (${plan.cycles2} cycles, contact start). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
