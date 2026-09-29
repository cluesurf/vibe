// CAN THE LIKE MEETING'S SPLIT BECOME A PHASE, AND IS IT WHAT UNBINDS THE CLUSTER (E-SPN-0104)? E-SPN-0103 put the drift
// cost and the fermion sign into the working rule: on flat links they hold E-SPN-0093's three-love level (fidelity at
// least 0.9991), on the mesh's links it still spreads, and the step between the two is the like meeting at UNEQUAL
// points, which splits a branch: keep (1 + w)/2, exchange -(1 - w)/2 (code/rule/occupation-veto-knit meetBranch).
// note/research/vibe/roadmap/discrete-gravity.md, "Measured, both pieces added (E-SPN-0103 fail), and the third piece".
//
// WHAT THE SPLIT IS FOR, derived (code/rule/doublet-locked-knit header, E-RLT-0100 T1). On the two points it is
// U = w P_sym + P_anti = (1 + w)/2 I - (1 - w)/2 SWAP: the lock's two-label form of the coin, a phase w on the
// point-symmetric channel and none on the antisymmetric one, the like-pair twin of the love-fear meeting
// V = 1 + (w - 1)|Phi><Phi|. So it is a CONTACT CHANNEL, a choice of which pairs feel the contact, not a symmetry:
//  - the line law (E-SPN-0098, the tone of every mesh line) needs only a meeting that keeps the occupation; so do the
//    occupation momentum (E-SPN-0090) and the light cone (the meeting moves no vibe; the stream alone moves)
//  - covariance (E-SPN-0094's dock commutant, W(F4)): I and SWAP each commute with every g (x) g, and the link group on
//    the points (ASL(2, 3), order 216, 2-transitive: every unequal pair one orbit) leaves a meeting only a constant keep
//    phase and a constant exchange phase at unequal points
//  - E-SPN-0094 to 0099 concern the frame mixer (a vibe leaving its line) and its cascades; none reads the like meeting.
// A meeting a I + b SWAP with the equal-point phase w (a + b = w) is unitary iff a - b is a unit, and a permutation
// times a phase iff a = 0 or b = 0: exactly two, 'keep' (w I) and 'exchange' (w SWAP), code/rule/permutation-meeting,
// which states why each keeps unitarity, reversal, the vacuum, a lone love's front, the line law and covariance.
//
// WHERE THE CLUSTER MEETS UNEQUAL POINTS, measured before this file (tmp/split-probe1.log): along the axis line the
// transport is FLAT, the second slot's move at x + 1 undoing the first's at x on 8 of 8, 12 of 12 and 16 of 16 links,
// and the ring's holonomy (order 6 on side 16) is its only curvature. So two loves meeting carry unequal points only if
// they started in different frames or one wound the ring relative to the other: the mesh does NOT force the split on a
// line-bound cluster. E-SPN-0103's placement put every love at point 0 in the TABLE's gauge, which is a different frame
// at every dock, so its loves met unequal points from the first beat, and their points recorded where each began.
//
// THE RUNS, E-SPN-0103's in every respect but the meeting and the placement (code/measure/permutation-meeting): the side-16
// working vacuum's axis line, 128 beats, both pieces (cost and sign) in every variant but the controls.
//  Kab   the 'keep' meeting, E-SPN-0103's placement (point 0 at every dock)
//  Xab   the 'exchange' meeting, E-SPN-0103's placement
//  KabP  the 'keep' meeting, the parallel placement (point T(0 -> x)(0) at x: one frame along the line)
//  XabP  the 'exchange' meeting, the parallel placement
//  WabP  the working split meeting, the parallel placement (the rule of E-SPN-0103 unchanged)
//  references: A (E-SPN-0093's operator, as in E-SPN-0102), Fab (both pieces on flat links), Wab (E-SPN-0103's own run,
//  re-read with this file's label)
//  THE LABEL: the level reading's point label is read in the line's own frame (code/measure/permutation-meeting
//  cutRelativeFramed; flat runs in the flat gauge, where it is E-SPN-0103's cutRelative). Probe 2 found the table-gauge
//  label read Fab at 0.39 and a parallel run at 0.50 by beat 1 (a love crossing the ring's cut takes the holonomy),
//  instrument bugs fixed before this file.
//
// GATES, E-SPN-0102's exactly (thresholds unchanged), read on each variant, fixed before the first run of this file.
//  B1 compact and stationary: at every beat 1 .. 128 R90 at most A's + 1, and the center's drift at most 1 + 0.0303 t.
//  B2 exact: both exact windows (side 8, 4 beats; side 12, 2 beats) keep the norm exactly on every beat (the slices'
//     summed norm; the physical norm within 1e-12), run back to the start exactly, leak nothing, disturb no branch's
//     vacuum, and match the ring form's probabilities and energy excess per husk column within 1e-12.
//  B3 the level kept: fidelity at least 0.90 on every beat, the share within 0.02 of 0.98236 every 16th beat, and the
//     energy over the run within 0.01 of 0.33002.
//  L  the replaced rule's line law and light cone, exactly: on every window of Kab, Xab, KabP and XabP, every branch at
//     every beat holds every mesh line's tone at its start value (0 lines broken) and every open love within one ring
//     step of a position held the beat before (0 outside); and a lone love under each permutation meeting on side 12
//     reaches 6 docks in 6 beats (the front at one dock a beat, the ring's half).
//  CONTROLS: (a) K00 and K00P (the keep meeting with no cost and no sign, each placement) must each fail B1 or B3;
//     (b) the vacuum: the side-8 and side-12 working vacuum alone, 8 and 6 beats, under each permutation meeting equals
//     the working rule bit for bit; (c) a lone love on the axis line, the same runs, equals the working rule bit for bit.
//  Verdict: partial if a control fails; pass if L holds and some variant holds B1, B2 and B3; fail otherwise.
// PREDICTED: L and every control hold; Kab and Xab FAIL B3 (under E-SPN-0103's placement the points record which love
// began where, so the loves are partly distinguishable and the fermion interference is lost, whatever the meeting);
// KabP, XabP and WabP hold B1, B2 and B3 and read as Fab (in one frame no loves meet unequal points unless one winds
// the ring), so the working split was never the obstacle: the placement's frame was.
//
// A MEASUREMENT, NOT A GATE: the confinement reading (code/measure/permutation-meeting chargeReading, the full per-link
// register on flat links, 24 beats): the far weight and the costly links outside the span for a lone love, two loves
// (charge 2) and a Z_3-neutral trio with its string closed at the start (Gauss), with the cost and without; and the
// centroid's rms at beats 8, 16, 24.
//
// A NOTE ON THE MEASUREMENT: the trio's far weight with the cost (1.3e-3) is small too, so "the neutral one moves
// freely" is NOT shown: the cost binds the three loves to each other and slows their centroid as well (rms 1.81 against
// 3.96). What the reading shows is the outside string: 0 costly links outside the trio's span, against 0.85 for a lone
// love and 0.45 for a pair.
//
// DISCLOSED PROBES (instrument only; no probe ran a gated 128-beat run): tmp/split-probe1.log (the transport flat on
// every link of sides 8, 12, 16; holonomies of order 6 on side 16; the link group of order 216); tmp/split-probe2.log and
// split-probe2b.log (32 beats of the ring form: with the fixed label Fab and WabP read fidelity 0.9994 to 0.9999 with
// the same R90 beat for beat, Wab 0.19 to 0.36, Kab 0.17, Xab 0.33, K00 0.09 with energy 2.76; the permutation meeting
// equal to the working rule on the side-8 vacuum and a lone love, 8 beats; the side-8 window, keep, parallel, 2 beats
// exact with 0 lines broken); tmp/split-probe3*.log (the confinement reading).
//
// FIRST RUN (1,511 s, tmp/split-spn-run1.log, the record): pass, no gate moved, as predicted. L holds (0 mesh lines
// broken and 0 loves outside the cone on every window branch, 6,144 lines on side 8 and 20,736 on side 12; a lone
// love reaches 6 docks in 6 beats under both meetings). Every control holds: K00 and K00P spread (R90 7 by beat 16,
// fidelity 0.09 and 0.11, energy 2.76), the vacuum and a lone love under each permutation meeting equal the working
// rule bit for bit (sides 8 and 12). Every B2 holds. KabP, XabP and WabP hold B1, B2 and B3 and read as Fab to four
// places (R90 the same beat for beat, fidelity at least 0.9991, share 0.9822, energy 0.33002): in one frame the loves
// never meet unequal points in 128 beats, so the working split is never hit and costs nothing. Under E-SPN-0103's
// placement neither permutation meeting binds: Kab fidelity 0.16 to 0.29 (R90 7), Xab 0.32 to 0.43 (R90 5, B1 excess 1),
// the working split (Wab) 0.19 to 0.41. The confinement reading: a lone love's far weight 1.7e-4 with the cost against
// 0.63 without (centroid rms 1.40 against 8.81 at beat 24), two loves 6.0e-5 against 0.31 (rms 1.09 against 5.89), the
// neutral trio 1.3e-3 against 0.10 (rms 1.81 against 3.96) with 0 costly links outside its span either way; the lone
// love's and the pair's strings reach outside their span (0.85, 0.45 links with the cost). Title written after the run.
//
// Depth L2: the rule's own superposed dynamics with one piece changed, each change checked for what it claims, controls
// that can fail. DETERMINISM: no random numbers. The rule is exact per slice in Z[w][1/2]; the level, the placement's
// floats and every reading are measurement. NOTHING MOVES. HUSK FIRST: every reading is on one husk line's columns.

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
  cutDensity,
  pointBeatWith,
  type CutState,
  type PieceOptions,
} from '@/code/measure/bound-line'
import {
  chargeReading,
  cutRelativeFramed,
  flatGauge,
  lineGauge,
  meetingWindow,
  placeCutFramed,
  sameAsWorking,
  type MeetingWindow,
  type Placement,
} from '@/code/measure/permutation-meeting'
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
const SAME: readonly { side: number; beats: number }[] = [
  { side: 8, beats: 8 },
  { side: 12, beats: 6 },
]
const FRONT_SIDE = 12
const FRONT_BEATS = 6
const CHARGE_BEATS = 24
const VARIANTS: readonly {
  name: string
  options: BoundOptions
  placement: Placement
  replaced: boolean
}[] = [
  {
    name: 'Kab',
    options: { cost: true, sign: true, meeting: 'keep' },
    placement: 'zero',
    replaced: true,
  },
  {
    name: 'Xab',
    options: { cost: true, sign: true, meeting: 'exchange' },
    placement: 'zero',
    replaced: true,
  },
  {
    name: 'KabP',
    options: { cost: true, sign: true, meeting: 'keep' },
    placement: 'parallel',
    replaced: true,
  },
  {
    name: 'XabP',
    options: { cost: true, sign: true, meeting: 'exchange' },
    placement: 'parallel',
    replaced: true,
  },
  {
    name: 'WabP',
    options: { cost: true, sign: true },
    placement: 'parallel',
    replaced: false,
  },
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

const windowHolds = (w: MeetingWindow): boolean =>
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
const windowLaw = (w: MeetingWindow): boolean =>
  w.beats.every(b => b.toneBroken === 0 && b.outsideCone === 0)

export default experiment({
  id: 'spin/permutation-meeting',
  code: 'E-SPN-0104',
  title:
    "the like meeting's split at unequal points is a contact channel, not a symmetry, and it never unbound E-SPN-0093's cluster: the placement's frame did, pass: exactly two meetings with the equal-point phase w are a permutation times a phase (keep w I, exchange w SWAP), and each keeps the line law and the light cone exactly (0 of 6,144 and 20,736 mesh lines broken, 0 loves outside the cone on every window branch), the vacuum and a lone love bit for bit, norm and reversal; the transport along the line is flat (16 of 16 links, holonomy of order 6), so a cluster placed in one frame meets no unequal points, and with the drift cost and the fermion sign the working rule's own split holds the level for 128 beats exactly as the flat links do (fidelity at least 0.9991, share 0.9822, energy 0.33002, R90 as the stand-in's), as do keep and exchange; E-SPN-0103's point-0 placement is a different frame at every dock, and there no meeting binds (keep 0.16, exchange 0.32, split 0.19); both unbound controls refused; the cost confines a lone love and a pair (far weight 1.7e-4 and 6e-5 against 0.63 and 0.31) and leaves a Z_3-neutral trio's outside string at 0 links",
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

    // ---- the line's transport ----
    const center = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', center)
    const ring = axisRing(f.tables, center)
    const L = ring.docks.length
    const gauge = lineGauge(f.tables, ring)
    const fit = fitRing(placed, L)

    // ---- controls (b), (c) and the lone front ----
    const same = (['keep', 'exchange'] as const).flatMap(m =>
      SAME.map(s => ({
        meeting: m,
        ...sameAsWorking(m, s.side, s.beats),
      })),
    )
    const fronts = (['keep', 'exchange'] as const).map(m =>
      sameAsWorking(m, FRONT_SIDE, FRONT_BEATS),
    )
    const controlVacuum = same.every(s => s.vacuumSame)
    const controlLone = same.every(s => s.loneSame)
    const frontHolds = fronts.every(
      s => s.loneReach === FRONT_BEATS && s.loneSame,
    )

    log('controls b, c')

    // ---- B2 and L: the exact windows, per variant ----
    const windows = VARIANTS.map(v =>
      WINDOWS.map(w => {
        const r = meetingWindow(
          v.options,
          v.placement,
          w.side,
          w.beats,
          placed,
          P,
        )

        log(`window ${v.name} side ${w.side}`)

        return r
      }),
    )
    const gL =
      frontHolds &&
      VARIANTS.every(
        (v, i) => !v.replaced || windows[i]!.every(windowLaw),
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

    log('A')

    const largest: Record<string, number> = {}

    const ruleRun = (
      name: string,
      options: PieceOptions,
      placement: Placement,
    ): Track => {
      let s: CutState = placeCutFramed(gauge, fit.kept, P, placement)

      const read = options.flat ? flatGauge(L) : gauge

      largest[name] = s.size

      const r = track(
        () => {
          s = pointBeatWith(options, f.tables, ring, s)
          largest[name] = Math.max(largest[name]!, s.size)
        },
        () => cutDensity(L, s),
        () => cutRelativeFramed(read, s),
      )

      log(name)

      return r
    }

    const runs = VARIANTS.map(v =>
      ruleRun(
        v.name,
        { ...v.options, unit: 0, flat: false },
        v.placement,
      ),
    )
    const runFab = ruleRun(
      'Fab',
      { cost: true, sign: true, unit: 0, flat: true },
      'zero',
    )
    const runWab = ruleRun(
      'Wab',
      { cost: true, sign: true, unit: 0, flat: false },
      'zero',
    )
    const runK00 = ruleRun(
      'K00',
      {
        cost: false,
        sign: false,
        meeting: 'keep',
        unit: 0,
        flat: false,
      },
      'zero',
    )
    const runK00P = ruleRun(
      'K00P',
      {
        cost: false,
        sign: false,
        meeting: 'keep',
        unit: 0,
        flat: false,
      },
      'parallel',
    )

    // ---- the confinement reading ----
    const charges = [
      chargeReading(1, CHARGE_BEATS),
      chargeReading(2, CHARGE_BEATS),
      chargeReading(3, CHARGE_BEATS, true),
    ]

    log('charges')

    const gA = gatesOf(runA, runA)
    const gFab = gatesOf(runFab, runA)
    const gWab = gatesOf(runWab, runA)
    const gK00 = gatesOf(runK00, runA)
    const gK00P = gatesOf(runK00P, runA)
    const gV = runs.map(r => gatesOf(r, runA))
    const b2 = windows.map(ws => ws.every(windowHolds))
    const held = VARIANTS.map(
      (_, i) => gV[i]!.b1 && b2[i]! && gV[i]!.b3,
    )
    const controlUnbound =
      !(gK00.b1 && gK00.b3) && !(gK00P.b1 && gK00P.b3)
    const control = controlUnbound && controlVacuum && controlLone
    const status = !control
      ? 'partial'
      : gL && held.some(Boolean)
        ? 'pass'
        : 'fail'
    const f4 = (x: number): string => x.toFixed(4)
    const row = (name: string, r: Track, g: Gates): string =>
      `${name}: R90 ${r.r90Start} at the start, ${[16, 32, 64, 96, 128].map(t => r.r90[t - 1]).join(', ')} at beats 16, 32, 64, 96, 128; drift ${[16, 32, 64, 128].map(t => f4(r.drift[t - 1]!)).join(', ')}; fidelity ${[1, 4, 16, 32, 64, 128].map(t => f4(r.fidelity[t - 1]!)).join(', ')} at beats 1, 4, 16, 32, 64, 128 (least ${f4(g.leastFidelity)}); share ${r.share.map(s => f4(s.share)).join(', ')}; energy ${f4(r.energy)}; B1 ${g.b1} (worst R90 excess ${g.worstR}, drift excess ${f4(g.worstDrift)}), B3 ${g.b3}`
    const windowRow = (x: MeetingWindow): string =>
      `side ${x.side} (ring ${x.L}, ${x.lines} mesh lines, ${x.startBranches} branches): ${x.beats.map((b, t) => `beat ${t + 1} ${b.branches} branches in ${b.slices} slices, norm ${b.normKept}, physical ${b.physicalNormOff.toExponential(1)}, leak ${b.leak}, disturbed ${b.disturbed}, point gap ${b.pointGap.toExponential(1)}, energy gap ${b.energyGap.toExponential(1)}, tone broken ${b.toneBroken}, outside the cone ${b.outsideCone}`).join('; ')}; reversed ${x.reversed} (${x.seconds.toFixed(0)} s)`
    const chargeRow = (c: (typeof charges)[number]): string =>
      `${c.n} love${c.n === 1 ? '' : 's'}${c.n === 3 ? ' (Gauss start)' : ''}: far weight ${c.farWith.toExponential(2)} with the cost against ${f4(c.farWithout)} without, costly links outside the span ${f4(c.outsideWith)} against ${f4(c.outsideWithout)}, centroid rms at beats 8, 16, 24 ${[8, 16, 24].map(t => c.rmsWith[t - 1]!.toFixed(3)).join(', ')} with the cost and ${[8, 16, 24].map(t => c.rmsWithout[t - 1]!.toFixed(3)).join(', ')} without`
    const metrics: Record<string, number> = {
      gate_L: gL ? 1 : 0,
      control: control ? 1 : 0,
      controlUnbound: controlUnbound ? 1 : 0,
      controlVacuum: controlVacuum ? 1 : 0,
      controlLone: controlLone ? 1 : 0,
      frontHolds: frontHolds ? 1 : 0,
      levelOff,
      placementDropped: fit.dropped,
      flatLinks: gauge.flatLinks,
      ringLength: L,
      holonomyOrder: gauge.order,
      seconds: (Date.now() - started) / 1000,
    }

    VARIANTS.forEach((v, i) => {
      const g = gV[i]!

      metrics[`${v.name}_B1`] = g.b1 ? 1 : 0
      metrics[`${v.name}_B2`] = b2[i] ? 1 : 0
      metrics[`${v.name}_B3`] = g.b3 ? 1 : 0
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

        metrics[`${v.name}_window${x.side}_toneBroken`] =
          x.beats.reduce((s, b) => s + b.toneBroken, 0)

        metrics[`${v.name}_window${x.side}_outsideCone`] =
          x.beats.reduce((s, b) => s + b.outsideCone, 0)
      })
    })

    for (const [name, r, g] of [
      ...VARIANTS.map((v, i) => [v.name, runs[i]!, gV[i]!] as const),
      ['A', runA, gA] as const,
      ['Fab', runFab, gFab] as const,
      ['Wab', runWab, gWab] as const,
      ['K00', runK00, gK00] as const,
      ['K00P', runK00P, gK00P] as const,
    ]) {
      metrics[`${name}_worstR90Excess`] = g.worstR
      metrics[`${name}_worstDriftExcess`] = g.worstDrift
      metrics[`${name}_leastFidelity`] = g.leastFidelity
      metrics[`${name}_worstShareOff`] = g.worstShare
      metrics[`${name}_energy`] = r.energy
      metrics[`${name}_r90_128`] = r.r90[BEATS - 1]!
    }

    for (const c of charges) {
      metrics[`charge${c.n}_farWith`] = c.farWith
      metrics[`charge${c.n}_farWithout`] = c.farWithout
      metrics[`charge${c.n}_outsideWith`] = c.outsideWith
      metrics[`charge${c.n}_rms24With`] = c.rmsWith[CHARGE_BEATS - 1]!
      metrics[`charge${c.n}_rms24Without`] =
        c.rmsWithout[CHARGE_BEATS - 1]!
    }

    return verdict({
      status,
      claim: `E-SPN-0093's cluster (E ${level.unwrapped.toFixed(5)}, share ${level.spinHalf.toFixed(5)}) on the side-16 working vacuum's axis line (the transport flat on ${gauge.flatLinks} of ${L} links, holonomy of order ${gauge.order}), ${BEATS} beats, both pieces: ${VARIANTS.map((v, i) => `${row(v.name, runs[i]!, gV[i]!)}, B2 ${b2[i]}`).join(' | ')}; against ${row('A', runA, gA)}; references ${row('Fab (flat links)', runFab, gFab)}; ${row('Wab (E-SPN-0103, the split, point 0)', runWab, gWab)}; L ${gL} (lone front ${fronts.map(s => `${s.loneReach} docks in ${s.beats} beats, same ${s.loneSame}`).join(', ')}); controls: K00 B1 ${gK00.b1} B3 ${gK00.b3}, K00P B1 ${gK00P.b1} B3 ${gK00P.b3}, vacuum same ${controlVacuum}, lone love same ${controlLone}; confinement (a measurement): ${charges.map(chargeRow).join('; ')}`,
      metrics,
      control: {
        K00_b1: gK00.b1 ? 1 : 0,
        K00_b3: gK00.b3 ? 1 : 0,
        K00P_b1: gK00P.b1 ? 1 : 0,
        K00P_b3: gK00P.b3 ? 1 : 0,
        vacuum: controlVacuum ? 1 : 0,
        lone: controlLone ? 1 : 0,
      },
      notes: `L2. Held (B1, B2, B3): ${VARIANTS.map((v, i) => `${v.name} ${held[i]}`).join(', ')}; L ${gL}, control ${control}. Level against E-SPN-0093's record: ${levelOff.toExponential(1)}. Holonomy ${gauge.holonomy.join('')}. Exact windows: ${VARIANTS.map((v, i) => `${v.name}: ${windows[i]!.map(windowRow).join(' | ')}`).join(' || ')}. ${row('K00 (keep, no pieces, point 0)', runK00, gK00)}. ${row('K00P (keep, no pieces, parallel)', runK00P, gK00P)}. Same as the working rule: ${same.map(s => `${s.meeting} side ${s.side} ${s.beats} beats vacuum ${s.vacuumSame} lone ${s.loneSame} (${s.loneBranches} branches)`).join('; ')}. R90 beat by beat: ${[...VARIANTS.map((v, i) => `${v.name} ${runs[i]!.r90.join(' ')}`), `Fab ${runFab.r90.join(' ')}`, `A ${runA.r90.join(' ')}`].join('; ')}. Largest ring-form states: ${Object.entries(
        largest,
      )
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
