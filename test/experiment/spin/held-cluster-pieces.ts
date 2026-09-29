// DOES THE WORKING RULE HOLD THE BOUND LEVEL ONCE IT CARRIES THE TWO PIECES E-SPN-0102 NAMED (E-SPN-0103)? E-SPN-0102
// placed E-SPN-0093's three-love level on the side-16 working vacuum's axis line: the rule runs it exactly and never
// touches the vacuum, but the packet spreads, because the working rule lacks two things the stand-in has: the DRIFT
// COST (removing it from the stand-in drops the fidelity to 0.74) and the FERMION SIGN where stores exist (0.20 with
// both gone). note/research/vibe/roadmap/discrete-gravity.md, "Measured, the missing link".
//
// THE PIECES (code/rule/bound-line-pieces, each optional, both off = the working rule bit for bit):
//  (a) the drift cost: a trit on every link, written only by an OPEN vibe's copy across it (the recorded hop), and a
//      phase zeta_14^(-1) (pi / N, N = 2D + 1 = 7) per link holding nonzero flux per beat. On the line Gauss reduces the
//      line's register to one trit c on the ring's cut link; the cost is zeta_14^(-n), n the links with c + Q(l) != 0
//      mod 3 (the span, unwound). zeta_14 is not in Z[w], so the exact carrier is a clock count e in Z_14 beside each
//      amplitude: one slice of the working rule per (e, c), the cost a permutation of slices. Exact, reversible, the
//      vacuum (closed vibes) untouched. It moves nothing, so a lone love's front is kept, but its amplitudes are not: a
//      lone love drags a string, a linear potential about its start.
//  (b) the fermion sign where stores exist: a store is two fermions, an even block, so its place in the mode order
//      changes no sign; any fixed order is a diagonal gauge of any other; in the order "the cluster's line first, from
//      the cut, then the rest" the beat keeps the two blocks, the rest (the vacuum with its stores) is classical and the
//      same on every branch (a common phase), and the sign that remains is the reordering parity of the line's open
//      loves. It refuses where that hypothesis fails (an open vibe off the line).
//
// THE PLACEMENT, THE RUNS AND THE READINGS are E-SPN-0102's (code/measure/held-cluster), with the rule's ring form
// carrying the pieces (code/measure/bound-line pointBeatWith: the three loves with their points on the mesh's links,
// the cut trit in the key, the cost and the sign as the rule applies them), each variant checked against the exact rule
// with the pieces (code/measure/bound-line boundWindow: the exact superposed rule, the slices, the run back).
//  Wa   the working rule plus (a)
//  Wb   the working rule plus (b)
//  Wab  the working rule plus both
//  A    E-SPN-0093's own operator (the reference for B1, as in E-SPN-0102)
//  N    the stand-in with the bounce's unit (E-SPN-0102's control)
//  Nab  the working rule plus both with the bounce's contact unit (-1 on a full line): the unbound unit, on the rule
//  Fab  the working rule plus both on FLAT links (every point 0): the stand-in's operator written as the rule writes it,
//       the calibration of the pieces against A (reported)
//
// THE PIECES' OWN CHECKS, fixed with the gates:
//  S  the sign is consistent: on the side-8 and side-12 lines (the rule's own stream tables), over every labelled
//     three-love configuration the transitions reach and every coin outcome, a potential spread along a spanning tree
//     agrees with every edge (every closed loop of the labelled graph is +1), every reached pair of states differing by
//     one exchange of two labels carries opposite signs (an exchange loop is -1, whatever its path) and every cyclic
//     relabelling the same sign (a winding loop is +1).
//  P  the cost is what it says: the cut-trit form equals the full per-link register (every link its own trit, Gauss
//     start) within 1e-12 over 64 beats on the side-16 line, with the sign and without; and a lone love's front is kept
//     (the support at every beat 1 .. 24 with the cost equals the support without, the same reach).
//
// DISCLOSED PROBES (instrument only; no probe ran a variant's long run): tmp/bound-probe1.log (S on sides 8 and 12: 896
// and 3,168 labelled states, 6,400 and 23,616 edges, consistent, exchange -1, winding +1; pointBeatWith with both pieces
// off equals E-SPN-0102's pointBeat exactly over 8 beats; the lone love: support the same, reach 24 either way, weight
// beyond reach 6 at beat 24 0.00017 with the cost against 0.625 without; the side-8 window with both pieces, 2 beats:
// norm and reversal exact, 0 leak, 0 disturbed, point gap 1.1e-16; the first reduction read 0.1 because the full register
// started at 0 instead of the Gauss flux, an instrument bug fixed before this file); tmp/bound-probe2.log (the reduction
// with the Gauss start: 1.7e-16 and 1.3e-15 over 64 beats).
//
// RUN 1 WAS AN INSTRUMENT BUG, NOT A RECORD (tmp/bound-spn-run1.log, 2,682 s, fail): the K = 0 reading labelled each
// branch by its cut trit c, a gauge relative to the ring's cut, so a cluster translated across the cut (same string,
// other c) was read as orthogonal to itself, and the calibration Fab read fidelity 0.50 at beat 1 while carrying A's
// energy 0.33002 exactly. The label is now the flux OUTSIDE the cluster (code/measure/bound-line cutRelative), the
// register's translation-invariant part. Only readings through that label changed (fidelity, share, energy); R90, drift,
// S, P and every exact window are the same instrument. Run 1 had read, with the bad label: B1 false on Wa (R90 excess 3),
// Wb (1, drift 2.35) and Wab (1); every B2 true; S, P true; both controls refused. tmp/bound-probe3.log (the calibration
// alone, fixed label): Fab against A 0.99944 to 0.99991 over 32 beats. No gate moved.
//
// GATES, E-SPN-0102's exactly, read on each variant, fixed before the first run of this file.
//  B1 compact and stationary: at every beat 1 .. 128 R90 at most A's + 1, and the center's drift at most 1 + 0.0303 t.
//  B2 exact: both exact windows (side 8, 4 beats; side 12, 2 beats) keep the norm exactly on every beat (here the
//     slices' summed norm, which is the rule's own; the physical norm, summed over the clock, is also read and must be
//     within 1e-12), run back to the start exactly, leak nothing, disturb no branch's vacuum, and match the ring form's
//     probabilities and energy excess per husk column within 1e-12.
//  B3 the level kept: fidelity at least 0.90 on every beat, the share within 0.02 of 0.98236 every 16th beat, and the
//     energy over the run within 0.01 of 0.33002.
//  CONTROL: N and Nab must each fail B1 or B3.
//  Verdict: partial if a control holds B1 and B3; pass if S, P and some variant's B1, B2, B3 hold; fail otherwise.
// PREDICTED: S, P and every B2 hold; Fab reproduces A; Wa and Wb fail B1 and B3 (each alone was not enough in the
// stand-in); Wab fails B3 (the mesh's links still split the points at every unequal-point meeting, the step from Nf to
// W in E-SPN-0102); both controls fail.
//
// FIRST RUN (run 2, 2,387 s, tmp/bound-spn-run2.log, the record): fail on B1 and B3 for every variant, no gate moved.
// S, P and every B2 hold (exact windows: slice norm exact, physical norm to 2.8e-15, run back exact, 0 leak, 0
// disturbed, point gap at most 2.5e-16, energy gap at most 5.1e-15; the cost splits the side-8 state into 21 clock and
// cut slices by beat 3). THE PIECES ARE RIGHT: Fab (both, flat links) holds the level, fidelity 0.9991 to 0.9999, share
// within 1.7e-4, energy 0.33002, R90 as A's. THE MESH'S LINKS STILL UNBIND IT: Wa R90 7 by beat 64, fidelity 0.03 to
// 0.36, energy -2.00 (the cost with no sign binds nothing); Wb R90 7 by 128, fidelity 0.28 to 0.57, share 0.91, drift
// 7.2 by 128; Wab R90 3 by beat 16, 5 by 64, 7 by 128 (A: 1, 3, 5), centered (drift 0.03), energy 0.33002 (the level's
// phase is kept), but fidelity 0.36 after one beat and 0.24 to 0.64 after, share 0.81 to 0.90. The state reaches 635,040
// entries: the unequal-point meetings split the points, E-SPN-0102's third step (Nf to W), which neither piece touches.
// Both controls fail B1 and B3. As predicted, except that Wab fails B1 as well as B3.
//
// Depth L2: the rule's own superposed dynamics with two pieces added, each checked for what it claims, instruments
// checked against the exact rule, controls that can fail. DETERMINISM: no random numbers. The rule is exact per slice in
// Z[w][1/2]; the clock's phase, the level, the placement's floats and every reading are measurement. NOTHING MOVES.
// HUSK FIRST: every reading is on one husk line's columns.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
  type LineSector,
} from '@/code/measure/coined-line-bloch'
import {
  axisRing,
  blochPacket,
  fitRing,
  levelPlacement,
  ringCenter,
  trackRun,
  type Relative,
  type Track,
} from '@/code/measure/held-cluster'
import {
  boundWindow,
  cutDensity,
  cutRelative,
  loneFront,
  placeCut,
  pointBeatWith,
  reductionGap,
  signHolonomy,
  type BoundWindow,
  type CutState,
  type PieceOptions,
} from '@/code/measure/bound-line'
import type { BoundOptions } from '@/code/rule/bound-line-pieces'

const BOX = 12
const P = 40
const SIDE = 16
const BEATS = 128
const SHARE_EVERY = 16
const WINDOWS: readonly { side: number; beats: number }[] = [
  { side: 8, beats: 4 },
  { side: 12, beats: 2 },
]
const RECORDED = {
  energy: 0.33001851839229945,
  share: 0.9823600683345252,
  speed: 0.0303,
}
const EXACT = 1e-12
const FIDELITY = 0.9
const SHARE_TOL = 0.02
const ENERGY_TOL = 0.01
const REDUCTION_BEATS = 64
const LONE_BEATS = 24
const VARIANTS: readonly { name: string; options: BoundOptions }[] = [
  { name: 'Wa', options: { cost: true, sign: false } },
  { name: 'Wb', options: { cost: false, sign: true } },
  { name: 'Wab', options: { cost: true, sign: true } },
]

const sector = (unit: number): LineSector => ({
  flavors: [0, 0, 0],
  statistics: 'fermion',
  D: 3,
  box: BOX,
  unit,
})

type Gates = {
  b1: boolean
  b3: boolean
  worstR: number
  worstDrift: number
  leastFidelity: number
  worstShare: number
  energyOff: number
}

function gatesOf(run: Track, reference: Track): Gates {
  const worstR = Math.max(
    ...run.r90.map((r, t) => r - reference.r90[t]! - 1),
  )
  const worstDrift = Math.max(
    ...run.drift.map((d, t) => d - 1 - RECORDED.speed * (t + 1)),
  )
  const leastFidelity = Math.min(...run.fidelity)
  const worstShare = Math.max(
    ...run.share.map(s =>
      Number.isNaN(s.share) ? 1 : Math.abs(s.share - RECORDED.share),
    ),
  )
  const energyOff = Math.abs(run.energy - RECORDED.energy)

  return {
    b1: worstR <= 0 && worstDrift <= 0,
    b3:
      leastFidelity >= FIDELITY &&
      worstShare <= SHARE_TOL &&
      energyOff <= ENERGY_TOL,
    worstR,
    worstDrift,
    leastFidelity,
    worstShare,
    energyOff,
  }
}

const windowHolds = (w: BoundWindow): boolean =>
  w.reversed &&
  w.beats.every(
    b =>
      b.normKept &&
      b.physicalNormOff <= EXACT &&
      b.leak === 0 &&
      b.disturbed === 0 &&
      b.pointGap <= EXACT &&
      b.energyGap <= EXACT,
  )

export default experiment({
  id: 'spin/held-cluster-pieces',
  code: 'E-SPN-0103',
  title:
    "the drift cost and the fermion sign written as rule pieces are exactly the stand-in's binding, but the working rule still does not hold E-SPN-0093's cluster on the mesh's own links, fail on B1 and B3 for every variant: the cost as one trit on the cut link plus a clock count in Z_14 (the ring grows to Z[zeta_42][1/2]) and the sign as the line block's reordering parity (a store is an even block) run exactly (both exact windows: norm and reversal exact, 0 leak, 0 branches disturbed, the ring form equal to the rule to 3e-16), the sign's holonomy is consistent (an exchange loop -1, a winding loop +1 on sides 8 and 12), and on flat links the two pieces reproduce the bound state (fidelity at least 0.9991, share 0.98223, energy 0.33002); on the mesh's links the cost alone spreads to R90 7 (fidelity 0.03), the sign alone 7 (0.28), both 7 by beat 128 with the level's energy 0.33002 kept but fidelity 0.24 to 0.64 and share 0.81 to 0.90: what still unbinds it is the links splitting the points at unequal-point meetings; the cost also confines a lone love (weight past a quarter of its reach 1.7e-4 against 0.63); both unbound controls are refused",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )

    // ---- the level ----
    const basis = lineBasis(sector(0))
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const vre = level.cre
    const vim = level.cim
    const placed = levelPlacement(basis, vre, vim)
    const levelOff = Math.max(
      Math.abs(level.unwrapped - RECORDED.energy),
      Math.abs(level.spinHalf - RECORDED.share),
    )

    log('level')

    // ---- S and P ----
    const holonomy = [8, 12].map(side => signHolonomy(side))
    const gS = holonomy.every(
      h =>
        h.consistent &&
        h.exchangeMinus &&
        h.windingPlus &&
        h.exchangeLoops > 0,
    )
    const center = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', center)
    const ring = axisRing(f.tables, center)
    const L = ring.docks.length
    const fit = fitRing(placed, L)
    const reduction = [false, true].map(sign =>
      reductionGap(
        { cost: true, sign },
        f.tables,
        ring,
        fit.kept,
        P,
        REDUCTION_BEATS,
      ),
    )
    const lone = loneFront(LONE_BEATS)
    const gP =
      reduction.every(g => g <= EXACT) &&
      lone.supportSame &&
      lone.reachWith === lone.reachWithout

    log('S, P')

    // ---- B2: the exact windows, per variant ----
    const windows = VARIANTS.map(v =>
      WINDOWS.map(w => {
        const r = boundWindow(v.options, w.side, w.beats, placed, P)

        log(`window ${v.name} side ${w.side}`)

        return r
      }),
    )

    // ---- the long runs ----
    const a = blochPacket(basis, L, vre, vim, true)
    const startDensity = a.density()
    const c0 = Math.round(ringCenter(startDensity)) % L
    const track = (
      step: () => void,
      density: () => Float64Array,
      relative: () => Relative,
    ): Track =>
      trackRun({
        L,
        beats: BEATS,
        window: BEATS,
        center: c0,
        startDensity,
        step,
        density,
        relative,
        basis,
        vre,
        vim,
        shareEvery: SHARE_EVERY,
      })
    const runA = track(a.step, a.density, a.relative)
    const n = blochPacket(lineBasis(sector(3)), L, vre, vim, true)
    const runN = track(n.step, n.density, n.relative)

    log('A, N')

    const largest: Record<string, number> = {}

    const ruleRun = (name: string, options: PieceOptions): Track => {
      let s: CutState = placeCut(L, fit.kept, 0, P)

      largest[name] = s.size

      const r = track(
        () => {
          s = pointBeatWith(options, f.tables, ring, s)
          largest[name] = Math.max(largest[name]!, s.size)
        },
        () => cutDensity(L, s),
        () => cutRelative(L, s),
      )

      log(name)

      return r
    }

    const runs = VARIANTS.map(v =>
      ruleRun(v.name, { ...v.options, unit: 0, flat: false }),
    )
    const runNab = ruleRun('Nab', {
      cost: true,
      sign: true,
      unit: 3,
      flat: false,
    })
    const runFab = ruleRun('Fab', {
      cost: true,
      sign: true,
      unit: 0,
      flat: true,
    })

    const gA = gatesOf(runA, runA)
    const gN = gatesOf(runN, runA)
    const gNab = gatesOf(runNab, runA)
    const gFab = gatesOf(runFab, runA)
    const gV = runs.map(r => gatesOf(r, runA))
    const b2 = windows.map(ws => ws.every(windowHolds))
    const held = VARIANTS.map(
      (_, i) => gV[i]!.b1 && b2[i]! && gV[i]!.b3,
    )
    const control = !(gN.b1 && gN.b3) && !(gNab.b1 && gNab.b3)
    const status = !control
      ? 'partial'
      : gS && gP && held.some(Boolean)
        ? 'pass'
        : 'fail'
    const f4 = (x: number): string => x.toFixed(4)
    const row = (name: string, r: Track, g: Gates): string =>
      `${name}: R90 ${r.r90Start} at the start, ${[16, 32, 64, 96, 128].map(t => r.r90[t - 1]).join(', ')} at beats 16, 32, 64, 96, 128; drift ${[16, 32, 64, 128].map(t => f4(r.drift[t - 1]!)).join(', ')}; fidelity ${[1, 4, 16, 32, 64, 128].map(t => f4(r.fidelity[t - 1]!)).join(', ')} at beats 1, 4, 16, 32, 64, 128 (least ${f4(g.leastFidelity)}); share ${r.share.map(s => f4(s.share)).join(', ')}; energy ${f4(r.energy)}; B1 ${g.b1} (worst R90 excess ${g.worstR}, drift excess ${f4(g.worstDrift)}), B3 ${g.b3}`
    const windowRow = (x: BoundWindow): string =>
      `side ${x.side} (ring ${x.L}, ${x.startBranches} branches): ${x.beats.map((b, t) => `beat ${t + 1} ${b.branches} branches in ${b.slices} slices, norm ${b.normKept}, physical ${b.physicalNormOff.toExponential(1)}, leak ${b.leak}, disturbed ${b.disturbed}, point gap ${b.pointGap.toExponential(1)}, energy gap ${b.energyGap.toExponential(1)}`).join('; ')}; reversed ${x.reversed} (${x.seconds.toFixed(0)} s)`
    const metrics: Record<string, number> = {
      gate_S: gS ? 1 : 0,
      gate_P: gP ? 1 : 0,
      control: control ? 1 : 0,
      levelOff,
      placementDropped: fit.dropped,
      reductionGap: Math.max(...reduction),
      loneFarWith: lone.farWith,
      loneFarWithout: lone.farWithout,
      seconds: (Date.now() - started) / 1000,
    }

    VARIANTS.forEach((v, i) => {
      const g = gV[i]!

      metrics[`${v.name}_B1`] = g.b1 ? 1 : 0
      metrics[`${v.name}_B2`] = b2[i] ? 1 : 0
      metrics[`${v.name}_B3`] = g.b3 ? 1 : 0
    })

    for (const [name, r, g] of [
      ...VARIANTS.map((v, i) => [v.name, runs[i]!, gV[i]!] as const),
      ['A', runA, gA] as const,
      ['N', runN, gN] as const,
      ['Nab', runNab, gNab] as const,
      ['Fab', runFab, gFab] as const,
    ]) {
      metrics[`${name}_worstR90Excess`] = g.worstR
      metrics[`${name}_worstDriftExcess`] = g.worstDrift
      metrics[`${name}_leastFidelity`] = g.leastFidelity
      metrics[`${name}_worstShareOff`] = g.worstShare
      metrics[`${name}_energy`] = r.energy
      metrics[`${name}_r90_128`] = r.r90[BEATS - 1]!
    }

    VARIANTS.forEach((v, i) =>
      windows[i]!.forEach(x => {
        metrics[`${v.name}_window${x.side}_reversed`] = x.reversed
          ? 1
          : 0

        metrics[`${v.name}_window${x.side}_worstPointGap`] = Math.max(
          ...x.beats.map(b => b.pointGap),
        )

        metrics[`${v.name}_window${x.side}_worstEnergyGap`] = Math.max(
          ...x.beats.map(b => b.energyGap),
        )

        metrics[`${v.name}_window${x.side}_disturbed`] = x.beats.reduce(
          (s, b) => s + b.disturbed,
          0,
        )
      }),
    )

    return verdict({
      status,
      claim: `E-SPN-0093's cluster (E ${level.unwrapped.toFixed(5)}, share ${level.spinHalf.toFixed(5)}) on the side-16 working vacuum's axis line, ${BEATS} beats, the rule with the drift cost (a), the line block's fermion sign (b), and both: ${VARIANTS.map((v, i) => `${row(v.name, runs[i]!, gV[i]!)}, B2 ${b2[i]}`).join(' | ')}; against ${row('A', runA, gA)}; calibration ${row('Fab (both pieces, flat links)', runFab, gFab)}; S ${gS} (${holonomy.map(h => `L ${h.L}: ${h.states} states, ${h.edges} edges, consistent ${h.consistent}, exchange -1 ${h.exchangeMinus}, winding +1 ${h.windingPlus}`).join('; ')}); P ${gP} (reduction ${reduction.map(g => g.toExponential(1)).join(', ')}; lone love support same ${lone.supportSame}, reach ${lone.reachWith} and ${lone.reachWithout}, weight beyond ${LONE_BEATS / 4} at beat ${LONE_BEATS} ${lone.farWith.toExponential(2)} with the cost against ${lone.farWithout.toFixed(3)} without); controls N B1 ${gN.b1} B3 ${gN.b3}, Nab B1 ${gNab.b1} B3 ${gNab.b3}`,
      metrics,
      control: {
        N_b1: gN.b1 ? 1 : 0,
        N_b3: gN.b3 ? 1 : 0,
        Nab_b1: gNab.b1 ? 1 : 0,
        Nab_b3: gNab.b3 ? 1 : 0,
      },
      notes: `L2. Held (B1, B2, B3): ${VARIANTS.map((v, i) => `${v.name} ${held[i]}`).join(', ')}; S ${gS}, P ${gP}, control ${control}. Level against E-SPN-0093's record: ${levelOff.toExponential(1)}. Exact windows: ${VARIANTS.map((v, i) => `${v.name}: ${windows[i]!.map(windowRow).join(' | ')}`).join(' || ')}. ${row('N (stand-in, bounce unit)', runN, gN)}. ${row('Nab (both pieces, bounce unit)', runNab, gNab)}. R90 beat by beat: ${[...VARIANTS.map((v, i) => `${v.name} ${runs[i]!.r90.join(' ')}`), `A ${runA.r90.join(' ')}`].join('; ')}. Largest ring-form states: ${Object.entries(
        largest,
      )
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
