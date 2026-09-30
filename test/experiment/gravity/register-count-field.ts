// GRAVITY'S COUNT FIELD UNDER THE REGISTER RULE (E-GRV-0146). The metric here is read from the rule's own counts: the
// depth sourced by the count (E-GRV-0119), counted from the vacuum so a hole is +1 (E-GRV-0144). E-GRV-0145 put the
// graviton at c/4 under the register and left "the count field that IS the metric, run under the register's many-body
// rule" as not run, because the rule was not written. E-SPN-0175 wrote it and ran it with the sea present, with one
// condition on every pair piece: act inside the beat's sector, and count from the sea. This file writes gravity's count
// field under that condition and reads what it gives. OPEN-GRV-13; ledger H "Newton's inverse square" and "the
// equivalence principle" (both stand-in).
//
// DERIVED BEFORE THE RUN (code/measure/register-count, code/measure/register-sea; E-SPN-0160's pieces, E-SPN-0175's
// engine).
// 1. WHICH COUNT (L1). A pair piece f(N(x), N(y)) keeps the 176 flat modes decoupled only if the count commutes with the
//    flat projector at its stage. The beat's sector count N_Q (Q_S in beat 1, Q_D in beat 2) does: W = range(U - 1)
//    contains S, so Q P_W = P_W Q (E-SPN-0175 point 4). The DOCK count (all 192 modes of a dock) does not: W is not
//    local, so a phase on a whole dock mixes momenta and F(q) with W(q'). So gravity's source is the sector count, and
//    a flat hole, orthogonal to every S_x, has sector count 0 at every dock: the flats neither source the depth nor feel
//    it. The dock count as the source is a control (CF): it must release flat weight.
// 2. ONE HOLE, NOT ONE MEMBER (L1). In the full register sea a member has no room (every register is full, E-SPN-0175
//    point 6), so every excitation is a hole. Counted from the sea, a hole's count is r - N_Q = n_Q, a unit, and the sea
//    sources exactly nothing. Counted as members it is 8 - n_Q per dock: the sea's uniform 8 (which only the torus mean
//    removal hides) minus the hole, so a hole would source -1, E-GRV-0144's "falls up". The source is one hole, weight
//    +1, and its gravitating charge at each beat is its weight in that beat's sector (the count the piece couples to).
// 3. THE PIECE. The depth acts back on a hole as a sector pair piece: two holes both in the beat's sector take a pair
//    angle phi(y) at relative dock y, with the same beat pattern as the mixer (e^(+i phi) on Q_S (x) Q_S in beat 1,
//    e^(-i phi) on Q_D (x) Q_D in beat 2). The kernel is the depth itself: k(y) = (x(0) - x(col y)) / (x(0) - x(nearest
//    column)), x the husk depth of a unit column source (code/measure/energy-lines staticDepth, E-GRV-0090's rule), col
//    the husk column of the D4 point (its first three coordinates, as boxHusk reads them). k is 0 at contact, 1 at the
//    nearest column, and rises to its far value as 1/r falls off. The unit angle is E-SPN-0175's string unit, |angle of
//    ringUnit(-2, 1)| = 0.28670: gravity is written as E-SPN-0175's sector string with the depth's profile in place of
//    min(V, cap). Because k(0) = 0 the piece has no self term, and because it is (N - r)(N - r) it has no Hartree term,
//    so one hole's band is E-SPN-0160's exactly: the source's mass stays light BY CONSTRUCTION (L1, stated, not gated).
// 4. THE SIGN, fixed by the clock and not by the outcome. The depth slows the rest rate of whatever sits in it (E-GRV-0088:
//    rest rate as q^(-1/2)). The member's rest phase per cycle is pi -+ M with M = pi - |theta|, theta the mixer angle
//    (read: restGap, slope dM/dtheta = +1 at the light angle -2.76134). A pair angle phi acts on a hole in the run's frame
//    as a mixer angle theta + phi / 2 (E-SPN-0175 runs holes as members with every pair angle reversed). So the depth
//    slows a hole's clock near the source when phi grows outward: phi(y) = +0.28670 k(y) for holes. Written for members
//    on an empty mesh the same many-body piece has phi reversed, so it would make a member's clock FASTER near the source:
//    the sector phase is odd under particle-hole, and the one sign that slows every hole's clock speeds every member's.
//    That is a prediction (control CA): the same piece read as members pushes them apart.
// 5. ATTRACTION. A scalar coupling that lowers the mass near the source pulls both bands toward it (the force on a Dirac
//    particle is -(M/E) grad M, and on the negative band the velocity is opposite the momentum), so the pair should
//    spread more slowly than free. The window is fixed by the box: the relative front moves at most c/2, one root a
//    cycle, so the free pair reaches the far side of the side-L torus after L/2 cycles; the gate reads the mean D4 string
//    length over cycles 1 .. L/2.
// 6. THE FAR FIELD (L1 for the solver). The husk solve of any compact source gives the point field times its total
//    outside the source. One hole started as S_0 on the origin (S lies in W, so it is a moving member) spreads at most
//    0.606 c/4 per beat at the light point (E-GRV-0145 Y2), so in 16 beats its front is at most 16 x 0.606 / 4 roots, a
//    husk distance of at most 3.43 columns. Beyond r = 5 the depth of its beat-averaged sector count is the point field
//    times that count, so k per unit charge on r = 5, 6, 7 (referred to r = 8) should equal the point unit's.
// 7. THE RAW COUNT'S MASS (control CH). Written on raw counts the piece puts 8 theta sum_y k(y) on each hole's sector
//    mixer (code/measure/register-count hartreeAngle), which grows with the box as L^4 because k does not fall to 0.
//    The rest gap under it depends on the box.
//
// PREDICTED VERDICT: PASS. The flat hole sources nothing, the flats stay frozen under gravity, the pair attracts on both
// boxes, the far field is the point field times the charge, and every control (the reversed sign, the dock count, the
// raw count's Hartree mass) behaves as derived.
//
// GATES, fixed before the gate run.
//  G1 THE SOURCE: on the L = 4 torus, a member projected on the flats from mode 0 and from mode 100 has sector count at
//     most 1e-12 at every dock at both stages for 8 cycles and returns to its start after each cycle within 1e-10; a
//     member projected on W from mode 47 has a beat-averaged sector charge at least 0.1 (the gate discriminates).
//  G2 THE FLATS UNDER GRAVITY: two holes on the L = 4 torus under the member mixers and the gravity piece (no string, no
//     contact), 64 cycles: from the W (x) W starts (0, 47) and (19, 20) N_F within 1e-10 of 0 at cycles 1, 2, 4, 8, 16,
//     32, 64, and from the F (x) W start (0, 47) within 1e-10 of 1.
//  G3 ATTRACTION: the mean over cycles 1 .. L/2 of the pair's mean D4 string length under gravity is below the free
//     pair's by more than 1e-8, on L = 4 from both W (x) W starts and on L = 6 from (0, 47).
//  G4 THE FAR FIELD: one hole from S_0 on the origin of the L = 16 torus, its sector count at each beat's stage averaged
//     over beats 0 .. 16, summed down the husk columns and solved on the side-16 husk: the depth falls away from the
//     source (x(0) - x(8) > 0) and its k per unit charge on r = 5, 6, 7 is within 5 percent of the point unit's k on the
//     same shells.
// INSTRUMENT (a failure makes the verdict partial at best). I1 every pair run keeps its norm within 1e-10 and the one
//  hole's total within 1e-10. I2 the point unit's k on r = 2 .. 6 (referred to r = 8) equals E-GRV-0119's point lump per
//  unit, 0.032409 / 3, within 1e-4 relative (E-GRV-0144 C2's reading). I3 the rest gap at the light angle is pi -
//  |theta| within 1e-9 and its slope at +- 1e-3 is +1 within 1e-6 (the premise of the sign). I4 Parseval at every flat
//  read within 1e-10.
// CONTROLS (a failure makes the verdict partial at best). CA THE PARTICLE-HOLE IMAGE: the same piece read as members on
//  an empty mesh (phi reversed) gives a larger window mean than free by more than 1e-8 at every size and start of G3.
//  CF THE DOCK COUNT: the gravity angle applied to the whole relative dock moves N_F by more than 1e-4 from each of the
//  three starts within 64 cycles. CH THE RAW COUNT: the rest gap under the raw Hartree angle differs between L = 4 and
//  L = 6 by more than 1e-3, and from the ordered gap by more than 1e-3 at some L.
// READ, gating nothing: the raw Hartree angle and rest gap at L = 4, 6, 8, 16; the hole's charge by beat; the dock
//  count's k; the hole's k on r = 2 .. 6 (inside the spread); the separation at every cycle; the raw count's depth sign.
// Verdict: fail if G1, G2, G3 or G4 fails; partial if all hold and the instrument or a control fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them).
//  tmp/gc-probe1: the moving cycle phases at K = 0 sit at |theta| exactly, so M = pi - |theta| = 0.380251 at the light
//  angle, and M rises with theta there (the sign of point 4 was read from this, before any pair ran); the depth kernel on
//  sides 4, 6, 8, 16 (unit 0.0398 at side 4, far value 1.158).
//  tmp/gc-probe2 B (L = 16, 16 beats): the sector charge oscillates by beat (1, 0.042, 0.852, 0.273, ...: stage S high,
//  stage D low), averaging 0.524 a beat; k per unit charge on r = 5 .. 7 at 0.9997 of the point's, 0.980 on r = 2 .. 6;
//  the point's k on r = 2 .. 6 is 1.08031e-2.
//  tmp/gc-probe2 A (L = 4, 8 cycles, 4 printed digits): gravity keeps N_F at 1e-14 from all three starts and the dock
//  count moves it to 7.8e-3 by cycle 1; the separation at cycles 1 and 2 is 1.3910, 1.5910 (gravity), 1.3936, 1.6119
//  (free), 1.3949, 1.6263 (reversed) from (0, 47), and the same order from (19, 20).
//  tmp/gc-probe3 F (L = 4): the flat members from modes 0 and 100 have total sector count below 1e-30 at every beat and
//  come back to within 1.3e-16 after 8 cycles; the moving member from mode 47 holds sector charge 0.500 at every beat.
//  The raw Hartree angle is 318.5, 1720.4, 5614.1 at L = 4, 6, 8 (as L^4), and the rest gap under it 2.325, 1.557,
//  2.866 against the ordered 0.380.
//  tmp/gc-probe3 six (L = 6, 4 cycles, cost only): the moving blocks 29 s, the pair start 92 s, 3.3 s a cycle, 2.2 GB;
//  the separation at cycles 1 to 3 was printed (gravity 1.4752, 1.7202, 1.7755; free 1.4818, 1.7673, 1.9085; reversed
//  1.4850, 1.8006, 2.0291).
//
// FIRST RUN (tmp/gc-gate-run1.log, 436 s): PASS, as predicted. No gate moved and none was rerun.
//  - G1: the flat members' sector counts at most 1.6e-31 at every dock and beat, back to their start within 2.4e-16
//    after every cycle; the moving member's charge 0.500 at every beat.
//  - G2: N_F within 1.9e-14 of 0 from both moving starts and of 1 from the frozen-plus-moving start, cycles 1 to 64.
//  - G3: window means (gravity, free, reversed) 1.4910, 1.5028, 1.5106 (L 4, (0, 47)); 1.4592, 1.4775, 1.4915 (L 4,
//    (19, 20)); 1.6570, 1.7192, 1.7716 (L 6, (0, 47)). Gravity pulls the pair in, and the pull grows with the box.
//  - G4: x(0) - x(8) = 1.702e-2 > 0; k per unit charge on r 5..7 is 0.99969 of the point unit's (charge 0.524 a beat).
//  - Instrument: the point unit's k on r 2..6 at 1.000013 of E-GRV-0119's; M = 0.380251 = pi - |theta|, slope
//    1.000000000; every norm within 1.3e-13; Parseval exact.
//  - Controls: the reversed sign (members on an empty mesh) spreads more than free at every size and start (CA); the
//    dock count moves N_F to 0.122, 0.222 and 1.001 by cycle 64 (CF); the raw count's Hartree angle is 318.5, 1720.4,
//    5614.1 and 94148.8 at L 4, 6, 8, 16 and the rest gap under it 2.325, 1.557, 2.866, 1.212 against the ordered 0.380
//    (CH).
//  - Read: the hole's charge by beat 1.000, 0.042, 0.852, 0.273, ... (stage S high, stage D low), 0.524 a beat on
//    average, where the dock count carries exactly 1; the near-field ratio 0.980 (the spread); the dock count's far ratio
//    0.99946. The raw count's depth did NOT read: the husk solve of 64 - n per column returned x(0) - x(8) = -2.9e5, and a
//    probe after the run (tmp/gc-probe4) returned NaN for a small source on a uniform 64, where the same source on 0
//    reads -0.0172. The solver does not survive the sea's uniform count; the sign reading of point 2 rests on the
//    algebra, not on this number.
//
// Depth: L1 for the source, the flats and the raw count's mass (algebra read off exact pieces); L2 for the attraction
// (a mass-type coupling on a known walk; the kernel is the depth register's stand-in, a float Green's function added to
// the rule, as in every gravity row). DETERMINISM: no random numbers; every start is a fixed mode. NOTHING MOVES: the
// pieces act inside a dock and the stream takes each slot's value one dock along.

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
  seaCycle,
  sectorBases,
  torus,
  type Moving,
  type Pair,
  type SeaRule,
  type Torus,
} from '@/code/measure/register-sea'
import {
  columnSums,
  dockCount,
  hartreeAngle,
  huskKernel,
  newOne,
  oneBeat,
  oneTorus,
  pointDepth,
  projectedStart,
  restGap,
  sectorCount,
  separation,
  singletStart,
} from '@/code/measure/register-count'
import { shellMeans, staticDepth } from '@/code/measure/energy-lines'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const FLAT_READS: readonly number[] = [1, 2, 4, 8, 16, 32, 64]
const FAR_R: readonly number[] = [5, 6, 7]
const NEAR_R: readonly number[] = [2, 3, 4, 5, 6]
const REF = 8
const EXACT = 1e-10
const COUNT_ZERO = 1e-12
const W_CHARGE = 0.1
const APART = 1e-8
const K_TOLERANCE = 0.05
const POINT_TOLERANCE = 1e-4
const CONTROL_MOVE = 1e-4
const BOX_MASS = 1e-3
const SLOPE_STEP = 1e-3
const SLOPE_TOLERANCE = 1e-6
const GAP_TOLERANCE = 1e-9
// the record compared against (its registered numbers)
const GRV_0119_POINT_K = 0.032409
const GRV_0119_ENERGY = 3.0

export type CountPlan = {
  flatSide: number
  flatCycles: number
  flatReads: readonly number[]
  oneFlatCycles: number
  pairSides: readonly number[]
  holeSide: number
  holeBeats: number
  hartreeSides: readonly number[]
}

export const GATE_PLAN: CountPlan = {
  flatSide: 4,
  flatCycles: 64,
  flatReads: FLAT_READS,
  oneFlatCycles: 8,
  pairSides: [4, 6],
  holeSide: 16,
  holeBeats: 16,
  hartreeSides: [4, 6, 8, 16],
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gravity/register-count-field',
  code: 'E-GRV-0146',
  title:
    "gravity's count field under the many-body register rule, pass: the source is one hole's SECTOR count counted from the sea (a flat hole's is below 1.6e-31, so the 176 flats neither source nor feel gravity, and N_F stays within 1.9e-14 of its start for 64 cycles under the gravity piece while the dock count releases 0.12 to 0.22), the depth acts back as E-SPN-0175's sector string with the husk depth's own kernel in place of min(V, cap), its sign fixed by the clock (the rest gap is pi - |theta|, slope +1), and two holes pull together (window mean separation 1.491, 1.459, 1.657 against free 1.503, 1.477, 1.719 on L 4, 4, 6) while the same piece read as members pushes them apart (1.511, 1.491, 1.772): the sector phase is odd under particle-hole, so gravity is universal only because the full sea's excitations are all holes; one hole's beat-averaged charge is 0.524 and its far depth is the point field times that charge (0.99969 on r 5..7); ordered, the piece has no one-body part, so the hole stays light, while raw counts put a Hartree angle of 318 to 94,149 on it and its rest gap swings 1.21 to 2.87 with the box",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return countFieldRun(GATE_PLAN)
  },
})

// least squares of y = a + k / r
function inverseK(rs: readonly number[], ys: readonly number[]): number {
  const xs = rs.map(r => 1 / r)
  const mx = xs.reduce((s, v) => s + v, 0) / xs.length
  const my = ys.reduce((s, v) => s + v, 0) / ys.length

  return (
    xs.reduce((s, v, i) => s + (v - mx) * (ys[i]! - my), 0) /
    xs.reduce((s, v) => s + (v - mx) ** 2, 0)
  )
}

// k of a husk depth profile x(r) - x(REF) on the given shells
const kOf = (profile: readonly number[], rs: readonly number[]): number =>
  inverseK(
    rs,
    rs.map(r => profile[r]! - profile[REF]!),
  )

const cloneOf = (s: Pair): Pair => ({
  re: Float64Array.from(s.re),
  im: Float64Array.from(s.im),
})

type PairRun = {
  side: number
  start: string
  rule: string
  flat: number
  meanV: number[]
  nF: number[]
  drift: number
  parseval: number
}

function runPair(
  T: Torus,
  mv: Moving,
  rule: SeaRule,
  s0: Pair,
  cycles: number,
  reads: readonly number[],
): Omit<PairRun, 'side' | 'start' | 'rule' | 'flat'> {
  const B = sectorBases()
  const s = cloneOf(s0)
  const spare = newPair(T)
  const meanV: number[] = []
  const nF: number[] = []

  let drift = 0
  let parseval = 0

  for (let c = 1; c <= cycles; c++) {
    seaCycle(T, rule, B, s, spare)
    meanV.push(separation(T, s).meanV)

    const norm = pairNorm(s)

    drift = Math.max(drift, Math.abs(norm - 1))

    if (reads.includes(c)) {
      const f = flatCount(T, mv, s)

      nF.push(f.nF)
      parseval = Math.max(
        parseval,
        Math.abs(f.fourier / T.sites.length - norm),
      )
    }
  }

  return { meanV, nF, drift, parseval }
}

export function countFieldRun(plan: CountPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const th = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const thG = -unitAngle(ringUnit(STRING[0], STRING[1]))
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const B = sectorBases()

  // ---------------- I3: the rest gap and its slope ----------------
  const M0 = restGap(th)
  const slope =
    (restGap(th + SLOPE_STEP) - restGap(th - SLOPE_STEP)) / (2 * SLOPE_STEP)
  const I3 =
    Math.abs(M0 - (Math.PI - Math.abs(th))) <= GAP_TOLERANCE &&
    Math.abs(slope - 1) <= SLOPE_TOLERANCE

  // ---------------- CH: the raw count's Hartree mass ----------------
  // the hole's mixer angle under the raw count: theta - 8 sum_y phi(y) (E-SPN-0175's hartree reading, holes' frame)
  const hartree = plan.hartreeSides.map(L => {
    const h = hartreeAngle(L, thG)

    return { L, angle: h, gap: restGap(th - h) }
  })
  const gapAt = (L: number): number => hartree.find(h => h.L === L)!.gap
  const CH =
    Math.abs(gapAt(4) - gapAt(6)) > BOX_MASS &&
    hartree.some(h => Math.abs(h.gap - M0) > BOX_MASS)

  log('I3 CH')

  // ---------------- G1: the flat member sources nothing (L = flatSide, one member) ----------------
  const T4 = torus(plan.flatSide)
  const mv4 = movingBlocks(T4, Ps)
  const o4 = oneTorus(plan.flatSide)
  const members = [
    { kind: 'F' as const, m: 0 },
    { kind: 'F' as const, m: 100 },
    { kind: 'W' as const, m: 47 },
  ].map(({ kind, m }) => {
    let s = projectedStart(o4, T4, mv4, kind, m)
    let t = newOne(o4)

    const s0 = { re: Float64Array.from(s.re), im: Float64Array.from(s.im) }
    const beats = 2 * plan.oneFlatCycles

    let largest = 0
    let charge = 0
    let back = 0
    let total = 0

    for (let b = 0; b < beats; b++) {
      const beat1 = b % 2 === 0
      const E = beat1 ? B.S : B.D
      const n = sectorCount(o4, E, s)

      for (const v of n) {
        largest = Math.max(largest, v)
        charge += v / beats
      }

      oneBeat(o4, E, beat1 ? u : [u[0], -u[1]], s, t)
      ;[s, t] = [t, s]

      if (!beat1) {
        for (let k = 0; k < s.re.length; k++) {
          back = Math.max(
            back,
            Math.hypot(s.re[k]! - s0.re[k]!, s.im[k]! - s0.im[k]!),
          )
        }
      }
    }

    total = dockCount(o4, s).reduce((a, v) => a + v, 0)

    return { kind, m, largest, charge, back, total }
  })
  const flats = members.filter(r => r.kind === 'F')
  const moving = members.find(r => r.kind === 'W')!
  const G1 =
    flats.every(r => r.largest <= COUNT_ZERO && r.back <= EXACT) &&
    moving.charge >= W_CHARGE

  log('G1')

  // ---------------- G2, CF, and the L = flatSide part of G3 and CA ----------------
  const runs: PairRun[] = []
  const window = (L: number): number => L / 2
  const flatStarts: { name: string; flat: number; make: () => Pair }[] = [
    { name: 'WW a', flat: 0, make: () => pairStart(T4, mv4, 'W', 0, 'W', 47) },
    { name: 'WW b', flat: 0, make: () => pairStart(T4, mv4, 'W', 19, 'W', 20) },
    { name: 'FW', flat: 1, make: () => pairStart(T4, mv4, 'F', 0, 'W', 47) },
  ]
  const base: SeaRule = {
    u,
    string: 0,
    cap: 0,
    contact: 0,
    dock: null,
    member: false,
  }
  const rulesOn = (T: Torus): Record<string, SeaRule> => {
    const k = huskKernel(T).kernel

    return {
      gravity: { ...base, kernel: k.map(v => thG * v) },
      free: { ...base, kernel: new Float64Array(k.length) },
      reversed: { ...base, kernel: k.map(v => -thG * v) },
      dock: { ...base, kernel: k.map(v => thG * v), whole: true },
    }
  }
  const rules4 = rulesOn(T4)

  for (const st of flatStarts) {
    const s0 = st.make()

    for (const name of ['gravity', 'dock', 'free', 'reversed']) {
      const full = name === 'gravity' || name === 'dock'

      if (!full && st.flat === 1) {
        continue
      }

      const r = runPair(
        T4,
        mv4,
        rules4[name]!,
        s0,
        full ? plan.flatCycles : window(plan.flatSide),
        full ? plan.flatReads : [],
      )

      runs.push({ side: plan.flatSide, start: st.name, rule: name, flat: st.flat, ...r })
      log(`L ${plan.flatSide} ${st.name} ${name}: V ${r.meanV.slice(0, 4).map(x => x.toFixed(6)).join(' ')} nF ${r.nF.map(x => x.toExponential(2)).join(' ')}`)
    }
  }

  // ---------------- the larger sides of G3 and CA ----------------
  for (const L of plan.pairSides.filter(L => L !== plan.flatSide)) {
    const T = torus(L)
    const mv = movingBlocks(T, Ps)
    const s0 = pairStart(T, mv, 'W', 0, 'W', 47)
    const rules = rulesOn(T)

    for (const name of ['gravity', 'free', 'reversed']) {
      const r = runPair(T, mv, rules[name]!, s0, window(L), [])

      runs.push({ side: L, start: 'WW a', rule: name, flat: 0, ...r })
      log(`L ${L} WW a ${name}: V ${r.meanV.map(x => x.toFixed(6)).join(' ')}`)
    }
  }

  const find = (side: number, start: string, rule: string): PairRun | undefined =>
    runs.find(r => r.side === side && r.start === start && r.rule === rule)
  const windowMean = (r: PairRun): number => {
    const w = window(r.side)

    return r.meanV.slice(0, w).reduce((a, v) => a + v, 0) / w
  }
  const cases = runs
    .filter(r => r.rule === 'free')
    .map(free => {
      const g = find(free.side, free.start, 'gravity')!
      const rv = find(free.side, free.start, 'reversed')!

      return {
        side: free.side,
        start: free.start,
        free: windowMean(free),
        gravity: windowMean(g),
        reversed: windowMean(rv),
      }
    })
  const G2 = runs
    .filter(r => r.rule === 'gravity' && r.nF.length > 0)
    .every(r => r.nF.every(x => Math.abs(x - r.flat) <= EXACT))
  // two W (x) W starts on the flat side and one on every other side
  const expected = 2 + plan.pairSides.filter(L => L !== plan.flatSide).length
  const G3 =
    cases.length === expected &&
    cases.every(c => c.gravity < c.free - APART)
  const CA =
    cases.length === expected &&
    cases.every(c => c.reversed > c.free + APART)
  const CF = runs
    .filter(r => r.rule === 'dock')
    .every(r => Math.max(...r.nF.map(x => Math.abs(x - r.flat))) > CONTROL_MOVE)
  const I4 = runs.every(r => r.parseval <= EXACT)

  log('G2 G3')

  // ---------------- G4: the far field of one hole (L = holeSide) ----------------
  const L = plan.holeSide
  const o = oneTorus(L)

  let s = singletStart(o, o.origin, 0)
  let t = newOne(o)

  const avg = new Float64Array(L ** 3)
  const avgDock = new Float64Array(L ** 3)
  const charges: number[] = []

  let holeDrift = 0

  for (let b = 0; b <= plan.holeBeats; b++) {
    const beat1 = b % 2 === 0
    const E = beat1 ? B.S : B.D
    const n = sectorCount(o, E, s)
    const d = dockCount(o, s)
    const scale = 1 / (plan.holeBeats + 1)

    charges.push(n.reduce((a, v) => a + v, 0))
    holeDrift = Math.max(
      holeDrift,
      Math.abs(d.reduce((a, v) => a + v, 0) - 1),
    )
    columnSums(o, n).forEach((v, c) => (avg[c]! += v * scale))
    columnSums(o, d).forEach((v, c) => (avgDock[c]! += v * scale))

    if (b < plan.holeBeats) {
      oneBeat(o, E, beat1 ? u : [u[0], -u[1]], s, t)
      ;[s, t] = [t, s]
    }
  }

  const x = pointDepth(L)
  const point = shellMeans(L, 0, x)
  const charge = avg.reduce((a, v) => a + v, 0)
  const hole = shellMeans(L, 0, staticDepth(L, avg).depth)
  const dock = shellMeans(L, 0, staticDepth(L, avgDock).depth)
  // the raw count: 8 sector members a dock of the sea, L / 2 docks a column, minus the hole
  const raw = Float64Array.from(avg, v => 8 * (L / 2) - v)
  const rawProfile = shellMeans(L, 0, staticDepth(L, raw).depth)
  const pointFar = kOf(point, FAR_R)
  const holeFar = kOf(hole, FAR_R) / charge
  const farRatio = holeFar / pointFar
  const pointNear = kOf(point, NEAR_R)
  const nearRatio = kOf(hole, NEAR_R) / charge / pointNear
  const dockRatio = kOf(dock, FAR_R) / pointFar
  const falls = hole[0]! - hole[REF]!
  const rawFalls = rawProfile[0]! - rawProfile[REF]!
  const G4 = falls > 0 && Math.abs(farRatio - 1) <= K_TOLERANCE
  const pointRatio = pointNear / (GRV_0119_POINT_K / GRV_0119_ENERGY)
  const I2 = Math.abs(pointRatio - 1) <= POINT_TOLERANCE
  const I1 = runs.every(r => r.drift <= EXACT) && holeDrift <= EXACT

  log('G4')

  // ---------------- verdict ----------------
  const hard = G1 && G2 && G3 && G4
  const instrument = I1 && I2 && I3 && I4
  const controls = CA && CF && CH
  const status = !hard ? 'fail' : !instrument || !controls ? 'partial' : 'pass'
  const e3 = (v: number): string => v.toExponential(3)
  const f6 = (v: number): string => v.toFixed(6)
  const metrics: Record<string, number> = {
    G1: flag(G1),
    G2: flag(G2),
    G3: flag(G3),
    G4: flag(G4),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    I4: flag(I4),
    CA: flag(CA),
    CF: flag(CF),
    CH: flag(CH),
    restGap: M0,
    restSlope: slope,
    lightAngle: th,
    gravityUnit: thG,
    holeCharge: charge,
    farRatio,
    nearRatio,
    dockFarRatio: dockRatio,
    pointFarK: pointFar,
    pointNearK: pointNear,
    pointRatio,
    holeFalls: falls,
    rawFalls,
    holeDrift,
    seconds: (Date.now() - started) / 1000,
  }

  members.forEach(r => {
    metrics[`member_${r.kind}${r.m}_largestSector`] = r.largest
    metrics[`member_${r.kind}${r.m}_charge`] = r.charge
    metrics[`member_${r.kind}${r.m}_back`] = r.back
  })
  hartree.forEach(h => {
    metrics[`hartree_L${h.L}_angle`] = h.angle
    metrics[`hartree_L${h.L}_gap`] = h.gap
  })
  cases.forEach(c => {
    const key = `L${c.side}_${c.start.replace(' ', '')}`

    metrics[`${key}_free`] = c.free
    metrics[`${key}_gravity`] = c.gravity
    metrics[`${key}_reversed`] = c.reversed
  })
  runs
    .filter(r => r.nF.length > 0)
    .forEach(r => {
      metrics[`L${r.side}_${r.start.replace(' ', '')}_${r.rule}_nFmove`] = Math.max(
        ...r.nF.map(v => Math.abs(v - r.flat)),
      )
    })
  charges.forEach((q, b) => (metrics[`charge_beat${b}`] = q))

  const caseText = cases
    .map(
      c =>
        `L ${c.side} ${c.start}: gravity ${f6(c.gravity)}, free ${f6(c.free)}, reversed ${f6(c.reversed)}`,
    )
    .join('; ')
  const runText = runs
    .map(
      r =>
        `L ${r.side} ${r.start}/${r.rule}: V ${r.meanV
          .slice(0, 8)
          .map(v => v.toFixed(4))
          .join(' ')}${r.nF.length > 0 ? `; N_F ${r.nF.map(e3).join(' ')}` : ''}`,
    )
    .join(' | ')

  return verdict({
    status,
    claim: `G1 ${G1} (${members.map(r => `${r.kind} ${r.m}: largest sector count ${e3(r.largest)}, charge ${f6(r.charge)}, back ${e3(r.back)}`).join('; ')}); G2 ${G2}; G3 ${G3} (window means: ${caseText}); G4 ${G4} (falls ${e3(falls)}, k per unit charge on r 5..7 ${e3(holeFar)} against the point's ${e3(pointFar)}, ratio ${farRatio.toFixed(5)}; charge ${f6(charge)} a beat); instrument I1 ${I1} I2 ${I2} (point ratio ${pointRatio.toFixed(6)}) I3 ${I3} (M ${f6(M0)}, slope ${slope.toFixed(9)}) I4 ${I4}; controls CA ${CA} CF ${CF} CH ${CH} (${hartree.map(h => `L ${h.L}: Hartree ${h.angle.toFixed(3)}, gap ${f6(h.gap)}`).join('; ')}; ordered gap ${f6(M0)})`,
    metrics,
    control: {
      CA: flag(CA),
      CF: flag(CF),
      CH: flag(CH),
      instrument: flag(instrument),
    },
    notes: `L1 (source, flats, raw mass) and L2 (attraction). Light angle ${f6(th)}, gravity unit ${f6(thG)} a unit of the depth kernel. Runs: ${runText}. Hole charge by beat ${charges.map(q => q.toFixed(4)).join(' ')}. Near-field ratio (r 2..6) ${nearRatio.toFixed(5)}; dock count far ratio ${dockRatio.toFixed(5)}; the raw count's x(0) - x(8) ${e3(rawFalls)} against the ordered ${e3(falls)}. Profiles x(r) - x(8): hole ${hole.slice(0, REF + 1).map(v => (v - hole[REF]!).toFixed(5)).join(' ')}; point ${point.slice(0, REF + 1).map(v => (v - point[REF]!).toFixed(5)).join(' ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
