// WHAT CONTENT DOES THE RULE KEEP ON THE HUSK? (E-HLG-0040, quantum-coverage 0026, OPEN-QTM-06 and OPEN-QTM-13.) Physics
// is read on the 3d husk (the horosphere of one cusp of the {3,4,3,4} mesh) and the 4d bulk below it is raw
// experience. E-HLG-0039 found that a lone vibe of the superposed rule leaves the husk (share about 1.103 / t, every
// line through a husk dock meets the husk in 1 or 2 docks and then goes down) and never moves along it. This file
// explores whether any content of a few vibes stays: the stored pair a closed fear makes with a vibe (E-QTM-0187 gate
// M, E-QTM-0190), the like pair's knot (E-QTM-0163), the edgeless line vacuum (E-QTM-0187, the one resting medium of
// a line), and vibes on several lines of one or two husk docks, where the four-part mixer K of the collision can move
// weight between lines (E-SPN-0157). For anything that stays, the bulk is read as its environment.
//
// THE RULE: the full superposed rule (code/rule/coined-locked-knit coinedVetoBeat, veto 'none', the pass contact,
// every link the identity, exact in Z[w][1/2]), the rule of E-QTM-0157, 0184 and 0187, now with every meeting, store
// and collision piece, never the one-body sector alone.
//
// THE MESH: the true labelled mesh below one cusp, grown on demand from a husk dock (code/measure/husk-closure
// buildLazyCuspMesh, E-HLG-0039's patch), never the cusp quotient (traps.md: its translations break the slot labels).
// code/measure/husk-content growingPatch builds all 24 links of every dock holding content in any branch before each
// beat, so there is no frontier and no floor: a patch run is the rule on the infinite mesh, while the float frames
// hold (reciprocity and integer levels, checked). For long times the content that stays on one mesh line is run on a
// tube (code/measure/husk-content lineTube), a ring of docks along the line, which is the line's own dynamics by the
// line law, equal to the infinite line until the content wraps; the tube is checked bit for bit against E-QTM-0187's
// line box and against the patch.
//
// DERIVED BEFORE THE GATE RUN.
//  (a) Every candidate of one line stays on that line (the line law: meetings, stores and the coin act inside one dock
//      line, E-SPN-0098, E-SPN-0156), and the line meets the husk in its 1 or 2 husk docks. So no line candidate moves
//      along the husk beyond 1 unit; whether it stays is whether the line's dynamics keeps weight on 1 or 2 docks.
//  (b) The count (vibes plus two per stored pair) is kept on every branch by every piece of the rule. So two husk
//      configurations of different husk count sit with bulk configurations of different count, which are orthogonal:
//      the husk's reduced state has NO coherence between different husk counts, at every beat, exactly. The bulk reads
//      the husk count perfectly, whatever the content (a superselection made by the leak). Only coherence between
//      husk configurations of one count (roles: slot, tone, point, open or stored) is left to measure.
//  (c) A stored pair releases at the next beat on an empty line (E-QTM-0187: a wall of W stores is gone at beat W), so
//      the pair a closed fear makes with a vibe holds it for about one beat and then the vibe walks as a lone vibe:
//      leak about 1/t, delayed. A like pair's two vibes each walk their line's fear walk between meetings, and on an
//      infinite line they part: leak about 1/t. A stream of closed fears coming up the line from the bulk, one on every
//      dock, stores the vibe at its dock every beat (E-QTM-0190: stay chance 1 for 12 beats): predicted held, for as
//      long as the stream lasts. The edgeless vacuum rests (period 2) and reads the vibe: no prediction for its share.
//  (d) Vibes on different lines of one dock interact only through K, which needs two or more single lines on a dock
//      and a bouncing pattern (code/rule/occupation-veto-knit). No prediction for whether it fires or moves weight
//      along the husk.
//
// PROBES BEFORE THE GATES, DISCLOSED. tmp/hlg40-probe1.ts (test/record/E-HLG-0040/probe1.log): a ball of the true mesh
// holds 8,857, 162,049, 2,962,393 docks at radius 3, 4, 5, too many for a superposed run with a frontier near the
// husk, so the growing patch replaced it. tmp/hlg40-probe2.ts (probe2.log): the tube equals the line box bit for bit
// (16 beats, four starts); the patch equals the tube bit for bit on the compact starts to beat 8, both line classes;
// the fear stream held the open vibe's husk share at 0.8125 (husk-ahead line) and 0.5625 (down line) from beat 2 to 8
// on the tube; the vacuum held it near 0.19; the stored pair and the like pair fell like the lone vibe; husk-count
// coherence read 0 everywhere. tmp/hlg40-probe3.ts (probe3.log, stopped at beat 5): two vibes on two lines of the base
// dock never interacted (shares those of the lone vibe), four did (weight on lines no start vibe held) and reached
// 26,368 branches by beat 5, still no husk dock beyond 1 unit. So the readings below were seen in part; the gates,
// the long tube runs, the marginal checks, the two-dock start and the environment readings are new. The first gate
// run (test/record/E-HLG-0040/run1.log) stopped with a stack overflow (Math.max over a spread of the vacuum's
// branches) before it printed anything; the spread was replaced by a loop and the vacuum's window set as above,
// both before any gate was read.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: the patch mesh reads 0 reciprocity misses and 0 off-integer levels; every patch run of one line holds
//     0 entries off its line at every beat; every branch of every run (patch and tube) keeps the start's count.
//  I2 THE TUBE IS THE LINE: the tube equals E-QTM-0187's line box (side 16, slot 0, its store points copied) bit for bit
//     at beats 1 to 16 on the lone vibe, the vacuum with a vibe, a fear 2 docks away, and the like pair.
//  I3 THE TUBE IS THE TRUE MESH: on both line classes (husk docks at positions 0 and 1, or 0 only), every compact start
//     equals the tube bit for bit at beats 1 to 8 on the patch, and the filled starts (the fear stream and the vacuum,
//     filled to FILL docks on the patch) have the same Born weights on every content pattern of positions |p| <= FILL
//     - t at beat t, 1 to 8.
//  C  CONTROL: the lone vibe reproduces E-HLG-0039: its husk share equals lineWalk's (code/measure/husk-closure)
//     exactly at every beat, 1 to 8 on the patch and 1 to TUBE_BEATS on the tube, on both classes.
//  D  DERIVED (b): the husk's reduced state has 0 coherence between different husk counts on every reading.
//  H  HELD, per candidate and class: the husk share stays at or above HOLD = 1/2 at every beat of the window's second
//     half (beats TUBE_BEATS/2 + 1 to TUBE_BEATS). The share is that of the count for the compact candidates and that
//     of the open vibe for the fear stream and the vacuum, whose medium fills the line. Not held, it is read as a
//     power fall (fitted exponent over beats 16 to TUBE_BEATS) or as leaving. The vibe in the vacuum runs VACUUM_BEATS
//     = 40 on the tube and is judged over beats 21 to 40: its branches grow about 2.7 times every 4 beats (21,678 at
//     beat 40, 152,801 at 48, 282 s, tmp/hlg40-probe5.ts), while the like pair (16,252 at 64, 119 s, probe 4) and the
//     fear stream (65) run the whole window. The vacuum alone is a reading (it fills the line, so its husk share is set
//     by the ring's length): whether its husk share rests exactly.
//  M  MOVES ALONG THE HUSK: some husk dock more than 1 unit from the start dock (or from the two-dock start's farther
//     dock) holds content in some branch of some patch run.
//  E  ENVIRONMENT, read for every held candidate: role coherence (same husk count) at the window's end, the bulk
//     environments, and whether the count is kept exactly.
// VERDICT, fixed before the run: PASS when I1, I2, I3, C and D hold and some candidate is held (content the rule keeps
//  on the husk exists); FAIL when they hold and none is held; PARTIAL when an instrument gate fails. PREDICTED: pass,
//  on the fear stream only, as derived in (c); M not reached on the lines (a), unknown under K.
// WHAT THIS CAN AND CANNOT SHOW. Trivial links, the empty mesh (the working coset-union vacuum is not line safe on the
//  true mesh, E-SPN-0156), one husk dock and its neighbour (every husk dock is alike under the cusp's translations).
//  The four-vibe start is run 4 beats only: its branches grow about threefold a beat (26,368 at beat 5 in probe 3).
//  The fear stream is held by an unending supply of fears from the bulk; the run says what such a supply does, not
//  where it would come from.
//
// GATE RUN 2026-10-27 (test/record/E-HLG-0040/run2.log, 952 s): PASS, as predicted; every gate as registered, none
//  moved; title and claim written after the run. I1: 0 reciprocity misses, 0 off-integer levels over 2,683 docks
//  (deepest level 5.1e13), 0 entries off the line, the count kept on every branch of every run. I2: tube equals the
//  line box on 4 of 4 starts. I3: patch equals tube bit for bit (compact) and by marginals (filled) on both classes.
//  C: the lone vibe's husk share equals lineWalk's exactly (0.25, 0.75, 0.609, 0.328 .. 0.0174 at 64, power -1.03 and
//  -1.00). D: 0 coherence between husk counts on every reading.
//  H: HELD only the fear stream: the open vibe's husk share is exactly 13/16 (husk-ahead line) and 9/16 (down line)
//  at every beat 2 to 64. Not held, all falling as 1/t: the stored pair (1 at beat 1, 0.5, 0.375, then 0.0090 at 64,
//  power -1.06 and -1.03, the lone walk two beats late), the fear meeting (the same from beat 4), the like pair (0.0218
//  at 64, power -1.03 and -1.02). The vibe in the vacuum is not held (0.044 and 0.025 at beat 40, never above 0.19
//  after beat 2, no clean power): the vacuum takes it down the line. The vacuum alone rests on the husk exactly (share
//  constant at every beat to 64).
//  M: nothing moved along the husk beyond 1 unit. Two vibes on two lines of one husk dock, or of two neighbouring
//  husk docks, never interact (no weight off their lines, shares those of lone vibes); four on four lines of one dock
//  fire K: 0.234 of the weight goes onto other lines at beat 1 and 0.241 by beat 4, onto 5 husk docks, still within
//  1 unit, share 0.34 at beat 4.
//  E: the held vibe's leaking part is the count: the bulk records how much is on the husk (D), while the role on the
//  husk stays fully coherent (role coherence 1.000 at beat 64 on the husk-ahead line over 64 bulk environments; the
//  down line has a single husk role). The vacuum, by contrast, dephases the role too (role coherence 0.000, 1,372
//  husk configurations); the like pair keeps 0.034 of it.
//
// Depth L2: known physics (a walk's escape from a boundary, decoherence by an environment that records a conserved
//  charge), read on the true mesh with the rule's full beat and controls.
// DETERMINISM: no random number; exact Eisenstein weights, float frames checked.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  buildLazyCuspMesh,
  lineCells,
  lineHuskWeight,
  lineWalkBeat,
  lineWalkStart,
} from '@/code/measure/husk-closure'
import {
  emptyConfiguration,
  growingPatch,
  huskContent,
  largestK,
  lineKeys,
  lineTube,
  placeOnLine,
  powerOfSeries,
  restrictedMarginal,
  sameKeys,
  type HuskContent,
  type LineContent,
} from '@/code/measure/husk-content'
import { lineBox, lineConfiguration, type LineVibe as BoxVibe } from '@/code/measure/line-barrier'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import {
  lockedState,
  newTally,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'

const SLOTS = 24
const PATCH_BEATS = 8
const FILL = 8
const TUBE_BEATS = 64
const VACUUM_BEATS = 40
const TUBE = 2 * TUBE_BEATS + 16
const HOLD = 0.5
const FIT_FROM = 16
const BOX_SIDE = 16
const BOX_BEATS = 16
const MIX_BEATS = 8
const FOUR_BEATS = 4
const REACH_TOLERANCE = 1 + 1e-9

type Candidate = {
  name: string
  // 'count' judges the count's husk share, 'open' the open vibe's
  judge: 'count' | 'open'
  filled: boolean
  // a reading only, never judged held (the vacuum alone fills the line, so its husk share is set by the line length)
  readOnly?: boolean
  // the tube window when shorter than TUBE_BEATS (compute: the branches grow exponentially)
  beats?: number
  // `others` are the filled positions other than 0, `all` every filled position
  make: (others: number[], all: number[]) => LineContent
}

const love = (position: number, forward = true, point = 0) => ({
  position,
  forward,
  value: 1 as const,
  open: true,
  point,
})
const closedFear = (position: number) => ({
  position,
  forward: false,
  value: -1 as const,
  open: false,
})

// the filled positions of a run: on the patch -FILL..FILL, on the tube the whole ring
const CANDIDATES: Candidate[] = [
  { name: 'lone', judge: 'count', filled: false, make: () => ({ vibes: [love(0)], stores: [] }) },
  {
    name: 'storedPair',
    judge: 'count',
    filled: false,
    make: () => ({ vibes: [love(0), { ...closedFear(0) }], stores: [] }),
  },
  {
    name: 'fearMeeting',
    judge: 'count',
    filled: false,
    make: () => ({ vibes: [love(0), closedFear(2)], stores: [] }),
  },
  {
    name: 'likePair',
    judge: 'count',
    filled: false,
    make: () => ({ vibes: [love(0, true, 0), love(0, false, 1)], stores: [] }),
  },
  {
    name: 'fearStream',
    judge: 'open',
    filled: true,
    make: others => ({ vibes: [love(0), ...others.map(closedFear)], stores: [] }),
  },
  {
    name: 'vacuum',
    judge: 'open',
    filled: true,
    beats: VACUUM_BEATS,
    make: (_, all) => ({
      vibes: [love(0)],
      stores: all.map(position => ({ position, tau: 1 as const })),
    }),
  },
  {
    name: 'vacuumAlone',
    judge: 'count',
    filled: true,
    readOnly: true,
    make: (_, all) => ({
      vibes: [],
      stores: all.map(position => ({ position, tau: 1 as const })),
    }),
  },
]

const countOf = (c: LineContent): number => c.vibes.length + 2 * c.stores.length

const tubePosition = (i: number): number => (i <= TUBE / 2 ? i : i - TUBE)
const tubeDock = (p: number): number => ((p % TUBE) + TUBE) % TUBE

// ---- I2: the tube against E-QTM-0187's line box ----

function tubeAgainstBox(): boolean {
  const box = lineBox(BOX_SIDE, 0)
  const n = box.cells.length
  const blank = box.blank()
  const starts: { vibes: (BoxVibe & { point?: number })[]; stores: boolean }[] = [
    { vibes: [{ dock: 0, forward: true, value: 1, open: true }], stores: false },
    { vibes: [{ dock: 0, forward: true, value: 1, open: true }], stores: true },
    {
      vibes: [
        { dock: 0, forward: true, value: 1, open: true },
        { dock: 2, forward: false, value: -1, open: false },
      ],
      stores: false,
    },
    {
      vibes: [
        { dock: 0, forward: true, value: 1, open: true },
        { dock: 0, forward: false, value: 1, open: true, point: 1 },
      ],
      stores: false,
    },
  ]

  let ok = true

  for (const start of starts) {
    const stores = start.stores
      ? Array.from({ length: n }, (_, dock) => ({ dock, tau: 1 as const }))
      : []
    const cb = lineConfiguration(box, start.vibes, stores)

    for (const v of start.vibes) {
      cb.point[box.cells[v.dock]! * SLOTS + (v.forward ? box.slot : box.back)] = v.point ?? 0
    }

    const tables = lineTube({ slot: 0, length: n })
    const ct = emptyConfiguration(n)

    for (let i = 0; i < n; i++) {
      for (let l = 0; l < 12; l++) {
        ct.spoint[i * 12 + l] = blank.spoint[box.cells[i]! * 12 + l]!
      }
    }

    placeOnLine({
      configuration: ct,
      dockAt: p => ((p % n) + n) % n,
      slot: 0,
      content: {
        vibes: start.vibes.map(v => ({
          position: v.dock,
          forward: v.forward,
          value: v.value,
          open: v.open,
          point: v.point ?? 0,
        })),
        stores: stores.map(s => ({
          position: s.dock,
          tau: s.tau,
          spoint: blank.spoint[box.cells[s.dock]! * 12 + box.line]!,
        })),
      },
    })

    let sb = lockedState(cb)
    let st = lockedState(ct)

    const position = (i: number): number => (i <= n / 2 ? i : i - n)

    for (let t = 0; t < BOX_BEATS; t++) {
      sb = coinedVetoBeat('none', box.tables, sb, t)
      st = coinedVetoBeat('none', tables, st, t)

      const kb = lineKeys({
        state: sb,
        positionOf: x => {
          const i = box.index.get(x)

          return i === undefined ? undefined : position(i)
        },
        slot: 0,
      })
      const kt = lineKeys({ state: st, positionOf: position, slot: 0 })

      ok &&= kb.offLine === 0 && kt.offLine === 0 && sameKeys(kb.keys, kt.keys)
    }
  }

  return ok
}

// ---- one line candidate on the patch and on the tube ----

type LineRun = {
  // per beat 0..TUBE_BEATS on the tube
  share: number[]
  readings: HuskContent[]
  patchSame: boolean
  patchOffLine: number
  patchKept: boolean
  patchReach: number
  tubeKept: boolean
  controlExact: boolean
  countCoherence: boolean
  patchShares: number[]
}

function runLine(input: {
  mesh: ReturnType<typeof buildLazyCuspMesh>
  slot: number
  huskPositions: ReadonlySet<number>
  candidate: Candidate
}): LineRun {
  const { mesh, slot, huskPositions, candidate } = input
  const base = mesh.base
  const line = lineCells({ mesh, dock: base, slot, reach: FILL + PATCH_BEATS + 2 })
  const at = new Map([...line].map(([x, p]) => [p, x]))
  const patchAll = Array.from({ length: 2 * FILL + 1 }, (_, i) => i - FILL)
  const tubeAll = Array.from({ length: TUBE }, (_, i) => tubePosition(i))
  const pc = candidate.make(patchAll.filter(p => p !== 0), patchAll)
  const tc = candidate.make(tubeAll.filter(p => p !== 0), tubeAll)

  const patch = growingPatch(mesh)
  const c = emptyConfiguration(mesh.size())

  placeOnLine({ configuration: c, dockAt: p => at.get(p)!, slot, content: pc })

  const tables: LockedTables = lineTube({ slot, length: TUBE })
  const ct = emptyConfiguration(TUBE)

  placeOnLine({ configuration: ct, dockAt: tubeDock, slot, content: tc })

  let sp: LockedState = lockedState(c)
  let st: LockedState = lockedState(ct)
  let walk = lineWalkStart(true)

  const out: LineRun = {
    share: [],
    readings: [],
    patchSame: true,
    patchOffLine: 0,
    patchKept: true,
    patchReach: 0,
    tubeKept: true,
    controlExact: true,
    countCoherence: true,
    patchShares: [],
  }
  const pick = (h: HuskContent): number => (candidate.judge === 'open' ? h.openShare : h.countShare)
  const tubeHusk = (x: number): boolean => huskPositions.has(tubePosition(x))
  const tubeCount = countOf(tc)
  const patchCount = countOf(pc)

  out.share.push(
    pick(huskContent({ state: st, isHusk: tubeHusk, distance: () => 0, count: tubeCount })),
  )

  for (let t = 1; t <= (candidate.beats ?? TUBE_BEATS); t++) {
    st = coinedVetoBeat('none', tables, st, t - 1)

    const h = huskContent({ state: st, isHusk: tubeHusk, distance: () => 0, count: tubeCount })

    out.share.push(pick(h))
    out.readings.push(h)
    out.tubeKept &&= h.countKept
    out.countCoherence &&= !(h.coherenceCount > 0)

    if (candidate.name === 'lone') {
      walk = lineWalkBeat({ state: walk, husk: huskPositions }).state
      out.controlExact &&=
        h.countHusk * 4n ** BigInt(t) === lineHuskWeight({ state: walk, husk: huskPositions }) * h.weight
    }

    if (t > PATCH_BEATS) {
      continue
    }

    sp = patch.beat(sp, t - 1)

    const hp = huskContent({
      state: sp,
      isHusk: x => mesh.level(x) === 1,
      distance: x => Math.hypot(...mesh.position(x)),
      count: patchCount,
    })

    out.patchShares.push(pick(hp))
    out.patchKept &&= hp.countKept
    out.patchReach = Math.max(out.patchReach, hp.reach)
    out.countCoherence &&= !(hp.coherenceCount > 0)

    const kp = lineKeys({ state: sp, positionOf: x => line.get(x), slot })

    out.patchOffLine += kp.offLine

    if (candidate.name === 'lone') {
      out.controlExact &&= hp.countHusk * 4n ** BigInt(t) === lineHuskWeight({ state: walk, husk: huskPositions }) * hp.weight
    }

    if (!candidate.filled) {
      const kt = lineKeys({ state: st, positionOf: tubePosition, slot })

      out.patchSame &&= sameKeys(kp.keys, kt.keys)
    } else {
      const zone = FILL - t
      const mp = restrictedMarginal({ state: sp, positionOf: x => line.get(x), slot, zone })
      const mt = restrictedMarginal({ state: st, positionOf: tubePosition, slot, zone })

      out.patchSame &&= sameKeys(mp, mt)
    }
  }

  return out
}

// ---- several lines of one or two husk docks: K ----

type MixRun = {
  name: string
  beats: number
  shares: number[]
  reach: number
  huskDocks: number
  crossLine: number[]
  branches: number
  kept: boolean
  countCoherence: boolean
  roleCoherence: number
}

function runMix(input: {
  mesh: ReturnType<typeof buildLazyCuspMesh>
  name: string
  vibes: readonly (readonly [number, number])[]
  beats: number
}): MixRun {
  const { mesh, name, vibes, beats } = input
  const patch = growingPatch(mesh)
  const c = emptyConfiguration(mesh.size())
  const starts = vibes.map(([x]) => x)
  // the start lines: dock -> allowed slots
  const onStart = new Map<number, Set<number>>()

  for (const [x, s] of vibes) {
    c.vibe[x * SLOTS + s] = 1
    c.open[x * SLOTS + s] = 1

    for (const [y] of lineCells({ mesh, dock: x, slot: s, reach: beats + 2 })) {
      const set = onStart.get(y) ?? new Set<number>()

      set.add(s)
      set.add(OPPOSITE[s]!)
      onStart.set(y, set)
    }
  }

  let st: LockedState = lockedState(c)

  const out: MixRun = {
    name,
    beats,
    shares: [],
    reach: 0,
    huskDocks: 0,
    crossLine: [],
    branches: 0,
    kept: true,
    countCoherence: true,
    roleCoherence: Number.NaN,
  }
  const ever = new Set<number>()
  // husk distance from the nearest start dock
  const distance = (x: number): number =>
    Math.min(
      ...starts.map(s =>
        Math.hypot(...mesh.position(x).map((v, a) => v - mesh.position(s)[a]!)),
      ),
    )

  for (let t = 0; t < beats; t++) {
    st = patch.beat(st, t, newTally())

    const h = huskContent({
      state: st,
      isHusk: x => mesh.level(x) === 1,
      distance,
      count: vibes.length,
    })

    out.shares.push(h.countShare)
    out.reach = Math.max(out.reach, h.reach)
    out.kept &&= h.countKept
    out.countCoherence &&= !(h.coherenceCount > 0)
    out.roleCoherence = h.coherenceRole
    h.huskDocks.forEach(x => ever.add(x))

    // the Born weight on vibes off every start line
    const K = largestK(st)

    let off = 0n
    let all = 0n

    for (const b of st.branches) {
      const w = (b.a * b.a - b.a * b.b + b.b * b.b) << BigInt(2 * (K - b.k))

      for (let i = 0; i < b.vibe.length; i++) {
        if (b.vibe[i] === 0) {
          continue
        }

        all += w

        if (!onStart.get((i / SLOTS) | 0)?.has(i % SLOTS)) {
          off += w
        }
      }
    }

    out.crossLine.push(Number((off * 10n ** 12n) / all) / 1e12)
    out.branches = st.branches.length
  }

  out.huskDocks = ever.size

  return out
}

export function huskContentRun(): Verdict {
  const started = Date.now()
  const mesh = buildLazyCuspMesh()
  const base = mesh.base
  const metrics: Record<string, number> = {}
  const classOf = (dock: number, slot: number): string =>
    [...lineCells({ mesh, dock, slot, reach: 2 })]
      .filter(([x]) => mesh.level(x) === 1)
      .map(([, p]) => p)
      .sort((a, b) => a - b)
      .join(',')
  const slots = Array.from({ length: SLOTS }, (_, s) => s)
  const aheadSlot = slots.find(s => classOf(base, s) === '0,1')!
  const downSlot = slots.find(s => classOf(base, s) === '0')!
  const classes = [
    { name: 'ahead', slot: aheadSlot, husk: new Set([0, 1]) },
    { name: 'down', slot: downSlot, husk: new Set([0]) },
  ]

  const i2 = tubeAgainstBox()

  let i1 = true
  let i3 = true
  let control = true
  let d = true
  let moves = false

  const held: string[] = []
  const lines: string[] = []

  for (const k of classes) {
    for (const candidate of CANDIDATES) {
      const r = runLine({ mesh, slot: k.slot, huskPositions: k.husk, candidate })
      const tag = `${candidate.name}_${k.name}`
      const window = candidate.beats ?? TUBE_BEATS
      const second = r.share.slice(window / 2 + 1)
      const minSecond = Math.min(...second)
      const isHeld = !candidate.readOnly && minSecond >= HOLD
      const checkpoints = [1, 2, 3, 4, 8, 16, 32, 40, 64].filter(t => t <= window)

      if (candidate.readOnly) {
        metrics[`${tag}_restsOnHusk`] = r.share.every(s => s === r.share[0]) ? 1 : 0
      }

      const power = powerOfSeries(r.share, FIT_FROM)
      const end = r.readings[window - 1]!

      i1 &&= r.patchOffLine === 0 && r.patchKept && r.tubeKept
      i3 &&= r.patchSame
      d &&= r.countCoherence
      moves ||= r.patchReach > REACH_TOLERANCE

      if (candidate.name === 'lone') {
        control &&= r.controlExact
      }

      if (isHeld) {
        held.push(tag)
      }

      metrics[`${tag}_held`] = isHeld ? 1 : 0
      metrics[`${tag}_minSecondHalf`] = minSecond
      metrics[`${tag}_power`] = power
      metrics[`${tag}_patchReach`] = r.patchReach
      metrics[`${tag}_endRoleCoherence`] = end.coherenceRole
      metrics[`${tag}_endEnvironments`] = end.environments
      metrics[`${tag}_endBranches`] = end.branches

      for (const t of checkpoints) {
        metrics[`${tag}_share_t${t}`] = r.share[t]!
      }

      lines.push(
        `${tag} (${window} beats): ${checkpoints.map(t => `${t}: ${r.share[t]!.toFixed(4)}`).join(', ')}; ${isHeld ? 'HELD' : `power ${power.toFixed(3)}`}; second-half min ${minSecond.toFixed(4)}; end role coherence ${end.coherenceRole.toFixed(3)}, ${end.environments} environments, ${end.huskConfigurations} husk configurations; patch reach ${r.patchReach.toFixed(3)}; patch ${candidate.filled ? 'marginal' : 'bit for bit'} ${r.patchSame}; count kept ${r.patchKept && r.tubeKept}`,
      )
    }
  }

  // K: several lines of one or two husk docks
  const distinctLines = (list: number[]): number[] =>
    list.filter((s, i) => list.findIndex(u => LINE_OF[u] === LINE_OF[s]) === i)
  const ahead = distinctLines(slots.filter(s => classOf(base, s) === '0,1'))
  const down = distinctLines(slots.filter(s => classOf(base, s) === '0'))
  const h = mesh.neighbour(base, ahead[0]!)
  const atH = distinctLines(
    slots.filter(
      s =>
        classOf(h, s) !== '0' &&
        mesh.neighbour(h, s) !== base &&
        LINE_OF[s] !== LINE_OF[ahead[0]!],
    ),
  )
  const mixes = [
    runMix({ mesh, name: 'twoAhead', vibes: [[base, ahead[0]!], [base, ahead[1]!]], beats: MIX_BEATS }),
    runMix({ mesh, name: 'twoDown', vibes: [[base, down[0]!], [base, down[1]!]], beats: MIX_BEATS }),
    runMix({ mesh, name: 'twoDocks', vibes: [[base, ahead[0]!], [h, atH[0]!]], beats: MIX_BEATS }),
    runMix({
      mesh,
      name: 'fourAhead',
      vibes: ahead.slice(0, 4).map(s => [base, s] as const),
      beats: FOUR_BEATS,
    }),
  ]

  for (const m of mixes) {
    i1 &&= m.kept
    d &&= m.countCoherence
    moves ||= m.reach > REACH_TOLERANCE
    metrics[`${m.name}_reach`] = m.reach
    metrics[`${m.name}_huskDocks`] = m.huskDocks
    metrics[`${m.name}_branches`] = m.branches
    metrics[`${m.name}_crossLineMax`] = Math.max(...m.crossLine)
    metrics[`${m.name}_shareEnd`] = m.shares[m.shares.length - 1]!
    lines.push(
      `${m.name} (${m.beats} beats): shares ${m.shares.map(s => s.toFixed(4)).join(' ')}; weight off the start lines ${m.crossLine.map(s => s.toFixed(4)).join(' ')}; husk reach ${m.reach.toFixed(3)}, ${m.huskDocks} husk docks, ${m.branches} branches, end role coherence ${m.roleCoherence.toFixed(3)}`,
    )
  }

  const health = mesh.health()

  i1 &&= health.reciprocityMisses === 0 && health.offInteger === 0

  const instruments = i1 && i2 && i3 && control && d
  const status = instruments ? (held.length > 0 ? 'pass' : 'fail') : 'partial'
  const seconds = (Date.now() - started) / 1000

  return verdict({
    status,
    claim: `on the true {3,4,3,4} mesh with the bulk below, the rule keeps on the husk ${held.length > 0 ? held.join(', ') : 'none of the candidates'} (share at least ${HOLD} over beats ${TUBE_BEATS / 2 + 1} to ${TUBE_BEATS}); ${moves ? 'some content moved along the husk beyond 1 unit' : 'nothing moved along the husk beyond 1 unit'}; the bulk records the husk count exactly (no coherence between husk counts, ${d ? 'on every reading' : 'gate failed'})`,
    metrics: {
      gate_I1: i1 ? 1 : 0,
      gate_I2: i2 ? 1 : 0,
      gate_I3: i3 ? 1 : 0,
      gate_C: control ? 1 : 0,
      gate_D: d ? 1 : 0,
      held: held.length,
      movesAlongHusk: moves ? 1 : 0,
      reciprocityMisses: health.reciprocityMisses,
      offInteger: health.offInteger,
      deepestLevel: health.deepestLevel,
      meshDocks: mesh.size(),
      ...metrics,
      seconds,
    },
    control: { loneEqualsLineWalk: control ? 1 : 0, tubeEqualsLineBox: i2 ? 1 : 0 },
    notes: `L2. Gates I1 ${i1}, I2 ${i2}, I3 ${i3}, C ${control}, D ${d}; held ${held.join(', ') || 'none'}; moves ${moves}. ${lines.join(' | ')}. ${seconds.toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'holography/husk-content',
  code: 'E-HLG-0040',
  title:
    'explores what content the superposed rule keeps on the husk of the true {3,4,3,4} mesh with the bulk below, pass: only a vibe fed by a closed fear on every dock of its line stays, its husk share exactly 13/16 (husk-ahead line) and 9/16 (down line) at every beat 2 to 64; the stored pair, the fear meeting and the like pair leak as 1/t (0.009 and 0.022 at beat 64), the vacuum carries its vibe down (0.04 at beat 40) though the vacuum alone rests; nothing moves along the husk beyond 1 unit, and K (four vibes on four lines of one dock) moves 0.24 of the weight onto other lines but not along the husk; the bulk records the husk count exactly (0 coherence between counts) while the held vibe keeps full role coherence; exact on the growing patch to beat 8 and on the line tube to 64, lone vibe equal to E-HLG-0039',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return huskContentRun()
  },
})
