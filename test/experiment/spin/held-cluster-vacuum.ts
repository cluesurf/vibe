// DOES BOUND MATTER STAY PUT IN THE WORKING VACUUM (E-SPN-0102)? E-SPN-0093 found the one bound state the rule is known
// to have: three loves on one husk line under the passing contact, E 0.33002, spin one half share 0.98236, compact (tail
// 5.6e-4), travelling at 0.0303. It was computed on the one-line operator: the stand-in token's (flat links, equal
// points, the canonical fermion sign, and the drift cost the husk flux would charge), never in the working vacuum.
// E-GRV-0107 found that gravity from the rule's own energy is blocked by matter that does not stay put. So: placed in
// the working vacuum and run by the rule itself, does E-SPN-0093's cluster hold its energy in place?
// note/research/vibe/roadmap/discrete-gravity.md, Part 5e.
//
// THE PLACEMENT (code/measure/held-cluster). The level's K = 0 relative amplitudes (box 12, dimension 576) put on the
// axis mesh line (root (1, 0, 0, 1)) through the box's center dock with the least position at that dock: a localized
// packet, every K at once. Each float amplitude is written into the rule's ring as (a + b w) / 2^40, so the rule then
// runs exactly; configurations whose loves collide once taken mod the line's length are left out (weight stated).
//
// THE WORKING VACUUM: the no-veto two-point store under the pass contact with the covariant coin (code/rule/coined-
// locked-knit coinedVetoBeat 'none'), the weave's own links, the vacuum's stored pairs closed (E-RLT-0105's superposed
// runs: with every vacuum pair open each vacuum like meeting splits the vacuum itself, and the branch count is out of
// reach from the first beats). The superposed rule, the amplitudes, not a path. Its fermion sign is NOT written where a
// store is held (code/rule/coined-locked-knit fermionSign refuses), so this rule is the configuration code plus the coin
// ('native' in E-SPN-0091), and it has no drift cost: nothing in it charges the husk flux.
//
// TWO INSTRUMENTS, each checked against the exact rule where it can be.
//  - THE EXACT WINDOW: the exact superposed rule on the whole configuration (every slot and store of every branch), a
//    few branches at a time, side 8 for 4 beats and side 12 for 2 (the branches double each beat: 36, 224, 520, 972 on
//    side 8, at 440 KB a branch; side 16 is 7 MB a branch), then run back. Read beside it: the vacuum run alone, and the
//    POINT-CARRYING RING FORM (code/measure/held-cluster pointBeat: the three loves alone, their points taken by the
//    mesh's own link tables, no vacuum, no sign).
//  - THE LONG RUN: that ring form on the side-16 box's own axis line (a ring of 16), 128 beats (the 16 momenta of the
//    ring dephase over the band's width in about 2 pi / 0.044 = 140 beats, so the packet's shape means something up to
//    there). Where the exact window shows every branch's vacuum untouched and the ring form equal to the rule, the
//    expected energy excess on each husk column IS the ring form's love density on it, and the long run is the rule's.
//
// READ ON EVERY RUN, per beat: the love density along the line (the cluster's expected energy per husk column, one unit
// a love), the least radius about the start's center holding 90% of it (R90), the circular drift of its center, the
// fidelity of the K = 0 part with E-SPN-0093's level (occupation-reduced: summed over point assignments), and every 16
// beats the spin one half share of that part; over the run, the level's energy read off the overlap's phase.
//
// THE RUNS, all from the same placed packet on the same ring of 16:
//  W  the working vacuum's rule (the point-carrying ring form), the one gated
//  A  E-SPN-0093's own operator (fermion, pass, drift cost, flat; code/measure/held-cluster blochPacket): the bound
//     state's own packet, the reference for B1
//  N  the same stand-in operator with the bounce's contact unit (E-SPN-0091's unbound one-line cluster, E 1.58831): the
//     NEGATIVE CONTROL, which the gates must refuse
//  Fb the exact coined knit on flat links with its fermion sign and no drift cost (coined-line-bloch ringBeat, fermion,
//     unit 0: E-SPN-0093's C2 instrument), reported
//  Nf the working vacuum's rule on flat links (ringBeat, native), reported
// so W against A splits into: the drift cost (A to Fb), the fermion sign (Fb to Nf), and the vacuum's links (Nf to W).
//
// DISCLOSED PROBES (instrument only): tmp/bsrc-probe1.log (the level at box 12: E 0.33002, share 0.98236, weight 0.912
// at span 2, 0.082 at span 4, 0.0054 at 6, none at odd spans; the native pass one-line level E 1.58831, share 0.2118);
// tmp/bsrc-probe2.log (three loves on the side-16 line: the line holds no store on any of its 16 docks; 8, then 56
// branches, no merging, 0.2 s a branch); tmp/bsrc-probe3.log (the exact side-8 window against the FLAT ring forms: equal
// at beat 1 (1.7e-16), off by 3.6e-2 at beat 2, where 32 like meetings of unequal points split: the links move the
// points); tmp/bsrc-probe4.log (the same against the point-carrying form: 1.1e-16, 1.9e-16, 1.7e-16, 9.7e-17 over 4
// beats, branches equal to entries, the vacuum untouched, no leak); tmp/bsrc-probe5.log (the run back, exact);
// tmp/bsrc-probe6.log (run A alone: fidelity 1, share 0.98236, energy 0.33002 to five places for 256 beats; R90 1 at
// the start, 3 by beat 32, 5 by beat 96, 7 by beat 176: the packet itself spreads over the ring as its momenta dephase,
// so an absolute bound of 1 + 0.0303 t was refused by the bound state itself at beat 32; the center drifts under 0.1
// through beat 192 and is meaningless after the density covers the ring). No probe read run W's long-run readings.
//
// GATES, fixed after the probes above and before the first run of this file.
//  B1 compact and stationary: at every beat 1 .. 128, R90 of W is at most R90 of A + 1, and W's center drifts at most
//     1 + 0.0303 t (the band speed).
//  B2 exact: in both exact windows, the norm is kept exactly on every beat, the run back returns the start exactly
//     (every branch's configuration and amplitude), no branch holds an open love off the line, no branch's vacuum part
//     differs from the vacuum's own run (0 disturbed), the point-carrying ring form equals the rule's configuration
//     probabilities within 1e-12, and the rule's expected energy excess per husk column equals the ring form's love
//     density within 1e-12. The placement's losses are stated.
//  B3 the bound state kept: W's fidelity with the level at least 0.90 on every beat, its share within 0.02 of 0.98236 at
//     every 16th beat, and its energy over the run within 0.01 of 0.33002.
//  CONTROL: N must fail B1 or B3 (read as W is); a gate that passes the unbound cluster proves nothing.
//  Verdict: partial if the control holds B1 and B3; otherwise pass if B1, B2, B3 hold, fail if any does not.
// PREDICTED: B2 passes; B1 and B3 fail on W, from the missing sign and the links; the control fails B3.
//
// FIRST RUN (584 s, tmp/bsrc-spn-run1.log, the record): fail on B1 and B3, as predicted, no gate moved. B2 holds: both
// exact windows keep the norm exactly and run back to the start exactly (side 8: 36, 224, 520, 972 branches; side 12:
// 100, 688), no leak, no branch's vacuum disturbed, the point-carrying ring form equal to the rule to 1.9e-16 and the
// energy excess per column equal to the love density to 3.3e-15 (the line's 16 docks hold no store, and a lone love
// passes every vacuum dock untouched, as code/rule/bounce-pair-knit derives). THE CLUSTER DOES NOT HOLD: in W the 90%
// radius goes 1, 2, 3, 2, 3, 4, ... 7 by beat 12 (about half a dock a beat, the lone coined love's top speed 0.5, not the
// band's 0.03) and stays at 7 to 8, the whole ring of 16; the density at beat 128 is flat at 0.32 to 0.44 on every even
// dock; the fidelity with the level is 0.36 after one beat and 0.03 to 0.07 from beat 16 (least 0.0285); the share
// 0.70 to 0.72; the overlap phase reads 2.76, no level. A, the stand-in's own packet, holds fidelity 1, share 0.98236,
// energy 0.33002, R90 1 to 5 over 128 beats (its momenta dephase). The steps: Fb (the knit's fermion sign, flat, no drift
// cost) already departs from the level (fidelity 0.74 to 0.93, share 0.83 to 0.94, R90 7 by 128): without the drift
// cost the level is not stationary; Nf (no sign,
// flat) R90 7 by beat 16, fidelity 0.20 to 0.67; W (the mesh's links) is Nf's spread with the points split at every
// unequal-point meeting (the state reaches 211,680 point entries). CONTROL N (the bounce's unit) fails B1 and B3, so
// the gates can refuse. What it means: the vacuum does not break the cluster (the exact windows show it untouched on
// every branch); the working vacuum's RULE does not bind it, since it lacks both the stand-in's drift cost and (where a
// store is held) the fermion sign, and each step away from the stand-in costs fidelity. Title written after the run.
//
// Depth L2: the rule's own superposed dynamics on a placed state, with instruments checked against it and a control that
// can fail. DETERMINISM: no random numbers. The rule is exact in Z[w][1/2]; the level, the placement's floats and every
// reading are measurement. NOTHING MOVES: the placement writes the start, the rule takes every value. HUSK FIRST: every
// reading is on one husk line's columns.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import {
  lineBasis,
  lineLightest,
  ringBeat,
  wholeBasis,
  type LineSector,
  type RingState,
} from '@/code/measure/coined-line-bloch'
import {
  axisRing,
  blochPacket,
  exactWindow,
  fitRing,
  levelPlacement,
  placePoints,
  placeRing,
  plainRelative,
  pointBeat,
  pointDensity,
  pointRelative,
  ringCenter,
  ringDensity,
  trackRun,
  type ExactWindow,
  type PointState,
  type Relative,
  type Track,
} from '@/code/measure/held-cluster'

const BOX = 12
const P = 40
const SIDE = 16
const BEATS = 128
const SHARE_EVERY = 16
const WINDOWS: readonly { side: number; beats: number }[] = [
  { side: 8, beats: 4 },
  { side: 12, beats: 2 },
]
// E-SPN-0093's recorded level (box 12) and band speed
const RECORDED = {
  energy: 0.33001851839229945,
  share: 0.9823600683345252,
  speed: 0.0303,
}
const EXACT = 1e-12
const FIDELITY = 0.9
const SHARE_TOL = 0.02
const ENERGY_TOL = 0.01

const sector = (
  statistics: 'fermion' | 'native',
  unit: number,
): LineSector => ({
  flavors: [0, 0, 0],
  statistics,
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

export default experiment({
  id: 'spin/held-cluster-vacuum',
  code: 'E-SPN-0102',
  title:
    "E-SPN-0093's bound one-line cluster does not stay put in the working vacuum, fail on B1 and B3: placed on the side-16 axis line and run by the working vacuum's own superposed rule, the vacuum is never touched (exact windows on sides 8 and 12: norm and reversal exact, 0 branches disturbed, 0 leak, the ring form equal to the rule to 2e-16), but the rule itself does not bind the three loves: the 90% radius goes from 1 to 7 of the ring's 8 by beat 12 (about half a dock a beat, not the band's 0.03), the fidelity with the level falls to 0.36 after one beat and 0.03 to 0.07 from beat 16, the share to 0.71, the energy reads 2.76 against 0.33; the stand-in's own packet holds (fidelity 1, share 0.98236, energy 0.33002); dropping its drift cost alone already costs fidelity (0.74), dropping the fermion sign (0.20), and the mesh's links split the points; the unbound control (the bounce's unit) is refused",
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
    const basis = lineBasis(sector('fermion', 0))
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const vre = level.cre
    const vim = level.cim
    const placed = levelPlacement(basis, vre, vim)
    const levelOff = Math.max(
      Math.abs(level.unwrapped - RECORDED.energy),
      Math.abs(level.spinHalf - RECORDED.share),
    )

    log('level')

    // ---- B2: the exact windows ----
    const windows: ExactWindow[] = WINDOWS.map(w => {
      const r = exactWindow(w.side, w.beats, placed, P)

      log(`window side ${w.side}`)

      return r
    })
    const b2 = windows.every(
      w =>
        w.reversed &&
        w.beats.every(
          b =>
            b.normKept &&
            b.leak === 0 &&
            b.disturbed === 0 &&
            b.pointGap <= EXACT &&
            b.energyGap <= EXACT,
        ),
    )

    // ---- the long runs on the side-16 line ----
    const center = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', center)
    const ring = axisRing(f.tables, center)
    const L = ring.docks.length
    const fit = fitRing(placed, L)
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

    log('A')

    const bounce = lineBasis(sector('fermion', 3))
    const n = blochPacket(bounce, L, vre, vim, true)
    const runN = track(n.step, n.density, n.relative)

    log('N')

    const ringRun = (sec: LineSector): Track => {
      let s: RingState = placeRing(L, fit.kept, 0, P)

      return track(
        () => void (s = ringBeat(sec, L, s)),
        () => ringDensity(L, s),
        () => plainRelative(L, s),
      )
    }

    const runFb = ringRun(sector('fermion', 0))
    const runNf = ringRun({
      flavors: [0, 0, 0],
      statistics: 'native',
      D: 3,
      box: BOX,
    })

    log('Fb, Nf')

    let w: PointState = placePoints(L, fit.kept, 0, P)
    let wLargest = w.size

    const runW = track(
      () => {
        w = pointBeat(f.tables, ring, w)
        wLargest = Math.max(wLargest, w.size)
      },
      () => pointDensity(L, w),
      () => pointRelative(L, w),
    )

    log('W')

    const gW = gatesOf(runW, runA)
    const gA = gatesOf(runA, runA)
    const gN = gatesOf(runN, runA)
    const gFb = gatesOf(runFb, runA)
    const gNf = gatesOf(runNf, runA)
    const control = !(gN.b1 && gN.b3)
    const status = !control
      ? 'partial'
      : gW.b1 && b2 && gW.b3
        ? 'pass'
        : 'fail'
    const f4 = (x: number): string => x.toFixed(4)
    const row = (name: string, r: Track, g: Gates): string =>
      `${name}: R90 ${r.r90Start} at the start, ${[16, 32, 64, 96, 128].map(t => r.r90[t - 1]).join(', ')} at beats 16, 32, 64, 96, 128; drift ${[16, 32, 64, 128].map(t => f4(r.drift[t - 1]!)).join(', ')}; fidelity ${[1, 4, 16, 32, 64, 128].map(t => f4(r.fidelity[t - 1]!)).join(', ')} at beats 1, 4, 16, 32, 64, 128 (least ${f4(g.leastFidelity)}); share ${r.share.map(s => f4(s.share)).join(', ')}; energy ${f4(r.energy)}; B1 ${g.b1} (worst R90 excess ${g.worstR}, drift excess ${f4(g.worstDrift)}), B3 ${g.b3}`
    const windowRow = (x: ExactWindow): string =>
      `side ${x.side} (ring ${x.L}, placement dropped ${x.dropped.toExponential(2)}, start norm ${x.startNorm.toFixed(6)}, ${x.startBranches} branches): ${x.beats.map((b, t) => `beat ${t + 1} ${b.branches} branches, norm ${b.normKept}, leak ${b.leak}, disturbed ${b.disturbed}, point gap ${b.pointGap.toExponential(1)}, energy gap ${b.energyGap.toExponential(1)}, unequal-point meetings ${b.splits}`).join('; ')}; reversed ${x.reversed} (${x.seconds.toFixed(0)} s)`
    const metrics: Record<string, number> = {
      gate_B1: gW.b1 ? 1 : 0,
      gate_B2: b2 ? 1 : 0,
      gate_B3: gW.b3 ? 1 : 0,
      control: control ? 1 : 0,
      levelOff,
      placementDropped: fit.dropped,
      wLargestEntries: wLargest,
      seconds: (Date.now() - started) / 1000,
    }

    for (const [name, r, g] of [
      ['W', runW, gW],
      ['A', runA, gA],
      ['N', runN, gN],
      ['Fb', runFb, gFb],
      ['Nf', runNf, gNf],
    ] as const) {
      metrics[`${name}_worstR90Excess`] = g.worstR
      metrics[`${name}_worstDriftExcess`] = g.worstDrift
      metrics[`${name}_leastFidelity`] = g.leastFidelity
      metrics[`${name}_worstShareOff`] = g.worstShare
      metrics[`${name}_energy`] = r.energy
      metrics[`${name}_r90_128`] = r.r90[BEATS - 1]!
    }

    windows.forEach(x => {
      metrics[`window${x.side}_reversed`] = x.reversed ? 1 : 0
      metrics[`window${x.side}_worstPointGap`] = Math.max(
        ...x.beats.map(b => b.pointGap),
      )

      metrics[`window${x.side}_worstEnergyGap`] = Math.max(
        ...x.beats.map(b => b.energyGap),
      )

      metrics[`window${x.side}_disturbed`] = x.beats.reduce(
        (s, b) => s + b.disturbed,
        0,
      )

      metrics[`window${x.side}_leak`] = x.beats.reduce(
        (s, b) => s + b.leak,
        0,
      )
    })

    return verdict({
      status,
      claim: `E-SPN-0093's cluster (E ${level.unwrapped.toFixed(5)}, share ${level.spinHalf.toFixed(5)}) placed on the side-16 working vacuum's axis line and run ${BEATS} beats: ${row('W (the working vacuum)', runW, gW)}; against ${row('A (the stand-in operator)', runA, gA)}; exact windows ${windows.map(windowRow).join(' | ')}; control N (the bounce's unit) B1 ${gN.b1}, B3 ${gN.b3}`,
      metrics,
      control: { N_b1: gN.b1 ? 1 : 0, N_b3: gN.b3 ? 1 : 0 },
      notes: `L2. Gates B1 ${gW.b1}, B2 ${b2}, B3 ${gW.b3}; control ${control}. Level against E-SPN-0093's record: ${levelOff.toExponential(1)}. ${row('N (stand-in, bounce unit)', runN, gN)}. ${row('Fb (exact knit, fermion, flat, no drift cost)', runFb, gFb)}. ${row('Nf (working rule, flat links)', runNf, gNf)}. W's R90 beat by beat: ${runW.r90.join(' ')}. A's: ${runA.r90.join(' ')}. W's density at beat 128 along the line: ${[...pointDensity(L, w)].map(f4).join(' ')}. Largest point-carrying state: ${wLargest} entries. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
