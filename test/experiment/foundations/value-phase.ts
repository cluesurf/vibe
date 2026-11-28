// THE VALUE PHASE: a rule piece that tells pleasure from pain, and what it costs
// (key 5). The piece is code/rule/value-phase: a diagonal phase zeta6^n
// (zeta6 = 1 + w, a unit of Z[w]) placed palindromically around the dock-local block of the working rule (coined, veto
// 'none', contact 'pass'), with n = sum over docks of sigma(x) chi(x), chi a C-odd reading of the dock's own slot tones.
// Three kinds: EVEN (the tone of every full like line: mirror-even, two-body), ODD (a W(F4) pseudoscalar of k* vibes,
// read with each dock's orientation: mirror-odd), ODDLABEL (ODD written in slot labels, the control). Which one valence
// is (its mirror parity) is the author's choice; this file measures both.
//
// THE GATES were fixed in the item's `what` (gate da3345dbf693, 2026-11-14T08:17:28Z) before this file existed, and
// every probe runs through task/pre-register. The item's text is the one in force; the short names here follow it:
//   G0 census 1,152 slot maps (576 det -1), 4 <= k* <= 5; G1 exact reversal; G2 the empty mesh has n = 0 and runs as
//   off; G3 a lone love and fear run as off (light); G4 ODD fires nowhere below k* vibes a dock; G5 C; G6 P; G7 CP;
//   G8 T; G9 CPT; G10 the like knot's CHSH; G11 orientation on the quotient.
//
// THE MESHES. The side-4 D4 box (8 beats; sigma = 1, so ODD = ODDLABEL there), the exact {3,4,3,4} ball (gated at
// R = 4, 3 beats, inside the exact horizon: nothing started within one step of the base dock reaches the frontier in
// 3 beats; R = 2 and 3 are reported), and the (sqrt 2)^6 congruence quotient of the honeycomb (1,048,576 docks: a
// state there is a periodic state of the honeycomb, 8 beats). Links are trivial everywhere (the identity grid move),
// so a mirror carries the tables onto themselves. The box and ball run on the rule's dense arrays; the quotient runs on
// sparse branches (code/rule/sparse-locked-knit: a branch holds its occupied docks
// only), which engineAgreement checks against the dense rule beat by beat.
//
// DETERMINISM: no random numbers. Every comparison of states is exact (Z[w][1/2] in bigint); the occupation distances
// and the CHSH value are the floats, reported.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  lockedState,
  lockedTables,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { currentCoinPlace } from '@/code/rule/coined-locked-knit'
import {
  lockedFresh,
  registerKnot,
} from '@/code/measure/doublet-locked-readings'
import {
  chargeConjugate,
  huskInversion,
  huskMaps,
  mapState,
  mirrorConfiguration,
  mirrorOf,
  motionReversal,
  type Mirror,
} from '@/code/measure/locked-parity'
import {
  newValueTally,
  slotGroup,
  valueBeat,
  valueBeatBack,
  valueCensus,
  VALUE_KINDS,
  type ValueKind,
  type ValuePiece,
  type ValueTally,
} from '@/code/rule/value-phase'
import {
  sparseBranchOf,
  sparseFromDense,
  sparseKey,
  type SparseBranch,
  type SparseState,
} from '@/code/rule/sparse-locked-knit'
import {
  mapSparse,
  sparseCharge,
  sparseKnotChsh,
  sparseMirror,
  sparseMotionReversal,
  sparseOccupationDistance,
  sparseSame,
  sparseStateOf,
  sparseValueBeat,
  sparseValueBeatBack,
} from '@/code/measure/sparse-value-phase'
import {
  asMirror,
  composeMirrors,
  labelMap,
  occupationDistance,
  orientationOf,
  sameStateFast,
  type MeshTable,
} from '@/code/measure/value-phase-maps'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import {
  enumerateFrames,
  quotientMesh,
} from '@/code/substrate/coxeter/congruence-3434'
import { type Mesh } from '@/code/tool/mesh'

const BOX = 4
const BOX_BEATS = 8
const BALL_BEATS = 3
const QUOTIENT_BEATS = 8
const QUOTIENT_LEVEL = { twoPower: 6, odd: 1 }
const QUOTIENT_DOCKS = 1_100_000
const CHSH_TOLERANCE = 1e-12
const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!

export type MeshKind = 'box' | 'ball' | 'quotient'

type Setup = {
  name: string
  kind: MeshKind
  tables: LockedTables
  table: MeshTable
  orientation: Int8Array
  orientationConflicts: number
  beats: number
  // the box's all-open cluster XA (left out by 'box:1': its four lone walkers reach thousands of branches a beat)
  allOpen?: boolean
  // the quotient's feasible subset ('quotient:1'): reversal, vacuum, light, few-body, C, Bell and orientation (G1 to
  // G5, G10, G11); the P, CP, T and CPT runs (G6 to G9) are left out, since each 1,048,576-dock branch holds 108 MB and
  // the full set is about 30 M3 hours
  lite?: boolean
  // the quotient's orientation check alone ('quotient:2'): X1 under L, g and L.g (G11) and the map extensions
  orientationOnly?: boolean
}

const trivialTables = (weave: Parameters<typeof lockedTables>[0]): LockedTables =>
  lockedTables(
    weave,
    'pass',
    new Int16Array(weave.mesh.cellCount * 24).fill(weave.moves.identity),
  )

function setupOf(mesh: Mesh, kind: MeshKind, name: string, beats: number): Setup {
  const cells = mesh.cellCount
  const f = lockedFresh({ mesh, store: new Int8Array(cells * 12) })
  const table: MeshTable = { cells, neighbour: (x, d) => mesh.neighbour(x, d) }
  const o = orientationOf(table)

  return {
    name,
    kind,
    tables: trivialTables(f.weave),
    table,
    orientation: kind === 'box' ? new Int8Array(cells).fill(1) : o.orientation,
    orientationConflicts: o.conflicts,
    beats,
  }
}

function boxSetup(allOpen: boolean): Setup {
  const f = lockedFresh(BOX)

  return {
    ...setupOf(f.weave.mesh, 'box', `box ${BOX}${allOpen ? '' : ' (X1, no XA)'}`, BOX_BEATS),
    allOpen,
  }
}

// ---- the engines: dense (the rule's own arrays) and sparse (code/rule/sparse-locked-knit) ----
//
// Every run below goes through one engine. The dense one is the rule's own code (valueBeat over coinedVetoBeat,
// locked-parity's maps, sameStateFast); the sparse one holds a branch as its occupied docks only, for the (sqrt 2)^6
// quotient, where one dense branch is 108 MB. The item's S0 gate checks they agree (engineAgreement below, and the
// whole reading with each engine).

type Entry = { slot: number; tone: number; point: number; open: boolean }

export type Engine<C, S> = {
  readonly name: 'dense' | 'sparse'
  config: (entries: readonly Entry[]) => C
  state: (c: C) => S
  beat: (piece: ValuePiece, s: S, t: number, tally?: ValueTally) => S
  back: (piece: ValuePiece, s: S, t: number) => S
  same: (x: S, y: S) => boolean
  distance: (x: S, y: S) => number
  mirror: (m: Mirror, c: C) => C
  mirrorState: (m: Mirror, s: S) => S
  charge: (c: C) => C
  chargeState: (s: S) => S
  reversal: (s: S) => S
  // registerKnot's CHSH after the state, -1 when the branches do not share one occupation
  knot: (s: S, slotA: number, slotB: number) => number
  branches: (s: S) => number
}

function empty(cells: number): Configuration {
  return {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }
}

export function denseEngine(s: Setup): Engine<Configuration, LockedState> {
  return {
    name: 'dense',
    config: entries => {
      const c = empty(s.table.cells)

      for (const e of entries) {
        c.vibe[e.slot] = e.tone
        c.point[e.slot] = e.point
        c.open[e.slot] = e.open ? 1 : 0
      }

      return c
    },
    state: lockedState,
    beat: (piece, x, t, tally) => valueBeat(piece, s.tables, x, t, undefined, tally),
    back: (piece, x, t) => valueBeatBack(piece, s.tables, x, t),
    same: sameStateFast,
    distance: occupationDistance,
    mirror: mirrorConfiguration,
    mirrorState: (m, x) => mapState(x, c => mirrorConfiguration(m, c)),
    charge: chargeConjugate,
    chargeState: x => mapState(x, chargeConjugate),
    reversal: x => motionReversal(s.tables, x),
    knot: (x, a, b) => registerKnot(x, a, b)?.chsh ?? -1,
    branches: x => x.branches.length,
  }
}

export function sparseEngine(s: Setup): Engine<SparseBranch, SparseState> {
  return {
    name: 'sparse',
    config: entries =>
      sparseBranchOf(
        entries.map(e => ({ slot: e.slot, vibe: e.tone, point: e.point, open: e.open ? 1 : 0 })),
        [],
      ),
    state: sparseStateOf,
    beat: (piece, x, t, tally) => sparseValueBeat(piece, s.tables, x, t, tally),
    back: (piece, x, t) => sparseValueBeatBack(piece, s.tables, x, t),
    same: sparseSame,
    distance: sparseOccupationDistance,
    mirror: sparseMirror,
    mirrorState: (m, x) => mapSparse(x, b => sparseMirror(m, b)),
    charge: sparseCharge,
    chargeState: x => mapSparse(x, sparseCharge),
    reversal: x => sparseMotionReversal(s.tables, x),
    knot: (x, a, b) => sparseKnotChsh(x, a, b) ?? -1,
    branches: x => x.branches.length,
  }
}

// ---- starts ----

type Start<C> = { name: string; config: C; fewBody: boolean }

function put(
  c: Entry[],
  x: number,
  d: number,
  tone: number,
  point: number,
  open: boolean,
): void {
  if (x < 0) {
    throw new Error('value-phase: a start leaves the mesh')
  }

  c.push({ slot: x * 24 + d, tone, point, open })
}

function startsOf<C, S>(s: Setup, e: Engine<C, S>): Start<C>[] {
  const nb = s.table.neighbour
  const census = valueCensus()
  const lone: Entry[] = []
  const head: Entry[] = []
  const knot: Entry[] = []
  const x1: Entry[] = []
  const xa: Entry[] = []

  put(lone, 0, D0, 1, 0, true)
  put(head, nb(0, D0_BACK), D0, 1, 0, true)
  put(head, nb(0, D0), D0_BACK, 1, 1, true)
  put(knot, 0, D0, 1, 0, true)
  put(knot, 0, D0_BACK, 1, 1, true)

  census.first.forEach(([slot, tone], i) => {
    put(x1, nb(0, OPPOSITE[slot]!), slot, tone, 0, i === 0)
    put(xa, nb(0, OPPOSITE[slot]!), slot, tone, 0, true)
  })

  const base: Start<C>[] = [
    { name: 'L', config: e.config(lone), fewBody: true },
    { name: 'H', config: e.config(head), fewBody: true },
    { name: 'K', config: e.config(knot), fewBody: true },
    { name: 'X1', config: e.config(x1), fewBody: false },
    ...(s.kind === 'box' && s.allOpen ? [{ name: 'XA', config: e.config(xa), fewBody: false }] : []),
  ]

  return [
    ...base.flatMap(st => [
      st,
      { ...st, name: `${st.name}f`, config: e.charge(st.config) },
    ]),
    { name: 'E', config: e.config([]), fewBody: true },
  ]
}

// the number of starts of a setup (the G1 count)
const startCountOf = (s: Setup): number => 9 + (s.kind === 'box' && s.allOpen ? 2 : 0)

// ---- runs, compared beat by beat ----

const pieceOf = (s: Setup, kind: ValueKind): ValuePiece => ({
  kind,
  orientation: s.orientation,
})

type Compare = { off: number; distance: number }

// the most branches any compared run held (reported in the log)
let branchesMax = 0

// run a from `a0` and b from `b0` side by side; count beats where image(a_t) != b_t
function compare<C, S>(
  s: Setup,
  e: Engine<C, S>,
  pa: ValuePiece,
  pb: ValuePiece,
  a0: C,
  b0: C,
  image: (x: S) => S,
): Compare {
  let a = e.state(a0)
  let b = e.state(b0)
  let off = 0
  let distance = 0

  for (let t = 0; t < s.beats; t++) {
    a = e.beat(pa, a, t)
    b = e.beat(pb, b, t)

    branchesMax = Math.max(branchesMax, e.branches(a), e.branches(b))

    const ia = image(a)

    if (!e.same(ia, b)) {
      off++
      distance = Math.max(distance, e.distance(ia, b))
    }
  }

  return { off, distance }
}

// theta(psi_(t+1)) = U_(t+1)^-1 theta(psi_t), beats off
function reversalOff<C, S>(
  s: Setup,
  e: Engine<C, S>,
  piece: ValuePiece,
  a0: C,
  theta: (x: S) => S,
): number {
  let a = e.state(a0)
  let off = 0

  for (let t = 0; t < s.beats; t++) {
    const next = e.beat(piece, a, t)
    const lhs = theta(next)
    const rhs = e.back(piece, theta(a), t + 1)

    if (!e.same(lhs, rhs)) {
      off++
    }

    a = next
  }

  return off
}

function reverses<C, S>(s: Setup, e: Engine<C, S>, piece: ValuePiece, a0: C): boolean {
  let a = e.state(a0)

  for (let t = 0; t < s.beats; t++) {
    a = e.beat(piece, a, t)
  }

  for (let t = s.beats - 1; t >= 0; t--) {
    a = e.back(piece, a, t)
  }

  return e.same(a, e.state(a0))
}

function fires<C, S>(s: Setup, e: Engine<C, S>, piece: ValuePiece, a0: C): number {
  const tally = newValueTally()

  let a = e.state(a0)

  for (let t = 0; t < s.beats; t++) {
    a = e.beat(piece, a, t, tally)
  }

  return tally.fired
}

// ---- the P maps of each mesh ----

type Maps = {
  // the P of G7 and G9
  p: Mirror
  // the box's depth-reversed inversion (a bulk rotation), for G9's second clause
  pRotation?: Mirror
  // G6: mirrors expected to break ODD (det -1) and to keep it (det +1)
  odd: Mirror[]
  even: Mirror[]
  // the mirrors the few-body starts run under (the box's two inversions, G6)
  fewOdd: Mirror[]
  fewEven: Mirror[]
  // G6 on the ball and quotient: the 48 reflections' extension conflicts
  reflectionConflicts: number
  // G11 (quotient): the left translation, the cell map g, their composite
  translation?: Mirror
  cellMap?: Mirror
  rotation?: Mirror
  // the CPT re-read (quotient, an earlier step C1): the inversion cell map, slot d to its opposite, the base dock fixed
  inversion?: Mirror
}

function boxMaps(): Maps {
  const parities = huskMaps().filter(m => m.huskDet === -1)

  return {
    p: mirrorOf(huskInversion(false), BOX),
    pRotation: mirrorOf(huskInversion(true), BOX),
    odd: parities.filter(m => m.bulkDet === -1).map(m => mirrorOf(m, BOX)),
    even: parities.filter(m => m.bulkDet === 1).map(m => mirrorOf(m, BOX)),
    fewOdd: [mirrorOf(huskInversion(false), BOX)],
    fewEven: [mirrorOf(huskInversion(true), BOX)],
    reflectionConflicts: 0,
  }
}

function cellMaps(s: Setup): Maps {
  const g = slotGroup()

  let reflectionConflicts = 0

  for (const r of g.reflections) {
    reflectionConflicts += labelMap(s.table, r, 0).conflicts
  }

  const pick = (det: number): Mirror[] => {
    const out: Mirror[] = []

    for (let e = 0; e < g.elements.length && out.length < 8; e++) {
      if (g.det[e] !== det) {
        continue
      }

      const m = labelMap(s.table, g.elements[e]!, 0)

      reflectionConflicts += m.conflicts
      out.push(asMirror(`g${e}`, g.elements[e]!, m.cells, det))
    }

    return out
  }

  const odd = pick(-1)
  const even = pick(1)
  const maps: Maps = {
    p: odd[0]!,
    odd,
    even,
    fewOdd: odd.slice(0, 1),
    fewEven: even.slice(1, 2),
    reflectionConflicts,
  }

  if (s.kind === 'quotient') {
    const ident = Int8Array.from({ length: 24 }, (_, d) => d)
    const lt = labelMap(s.table, ident, s.table.neighbour(0, 0))

    maps.reflectionConflicts += lt.conflicts
    maps.translation = asMirror('L', ident, lt.cells, 1)
    maps.cellMap = odd[0]!
    maps.rotation = composeMirrors('L.g', odd[0]!, maps.translation)

    if (!s.lite && !s.orientationOnly) {
      const inv = labelMap(s.table, OPPOSITE, 0)

      maps.reflectionConflicts += inv.conflicts
      maps.inversion = asMirror('-1', OPPOSITE, inv.cells, 1)
    }
  }

  return maps
}

// ---- one mesh ----

type KindReading = {
  reverses: number
  vacuumFired: number
  vacuumOff: number
  lightOff: number
  fewBodyFired: number
  c: Record<string, Compare>
  pOdd: Record<string, number[]>
  pEven: Record<string, number[]>
  pDistance: number
  cp: Record<string, Compare>
  t: Record<string, number>
  cpt: Record<string, number>
  cptRotation: Record<string, number>
  chsh: Record<string, number>
  orientation: { translation: number; cellMap: number; rotation: number }
  // the CPT re-read on the quotient's full set (an earlier step C1 to C3): beats off under CPT with the inversion cell map,
  // with L.g and with L, per start
  cptMaps: Record<string, Record<string, number>>
}

export type MeshReading = {
  setup: {
    name: string
    kind: MeshKind
    cells: number
    orientationConflicts: number
    lite: boolean
    orientationOnly: boolean
  }
  reflectionConflicts: number
  kinds: Record<ValueKind, KindReading>
  seconds: number
  engine: 'dense' | 'sparse'
}

// the reading of one mesh: the dense engine on the box and ball, the sparse one on the quotient
export function readMesh(s: Setup, log: (line: string) => void = () => {}): MeshReading {
  return s.kind === 'quotient'
    ? readWith(s, sparseEngine(s), log)
    : readWith(s, denseEngine(s), log)
}

export function readWith<C, S>(
  s: Setup,
  e: Engine<C, S>,
  log: (line: string) => void = () => {},
): MeshReading {
  const started = Date.now()
  const starts = startsOf(s, e)
  const maps = s.kind === 'box' ? boxMaps() : cellMaps(s)
  const theta = (x: S): S => e.reversal(x)
  const cpImage = (m: Mirror) => (x: S): S => e.chargeState(e.mirrorState(m, x))
  const mirrorImage = (m: Mirror) => (x: S): S => e.mirrorState(m, x)
  const chargeImage = (x: S): S => e.chargeState(x)
  const identity = (x: S): S => x
  const knot = starts.filter(st => st.name === 'K' || st.name === 'Kf')
  const slotA = s.table.neighbour(0, D0) * 24 + D0
  const slotB = s.table.neighbour(0, D0_BACK) * 24 + D0_BACK
  const off: ValuePiece = { kind: 'off' }
  const kinds = {} as Record<ValueKind, KindReading>
  const extra: [string, Mirror | undefined][] = [
    ['inversion', maps.inversion],
    ['lg', maps.rotation],
    ['translation', maps.translation],
  ]

  branchesMax = 0
  log(`${s.name} (${e.name}): ${s.table.cells} docks, orientation conflicts ${s.orientationConflicts}, map conflicts ${maps.reflectionConflicts}`)

  for (const kind of VALUE_KINDS) {
    const piece = pieceOf(s, kind)
    const r: KindReading = {
      reverses: 0,
      vacuumFired: 0,
      vacuumOff: 0,
      lightOff: 0,
      fewBodyFired: 0,
      c: {},
      pOdd: {},
      pEven: {},
      pDistance: 0,
      cp: {},
      t: {},
      cpt: {},
      cptRotation: {},
      chsh: {},
      orientation: { translation: -1, cellMap: -1, rotation: -1 },
      cptMaps: {},
    }
    const under = (st: Start<C>, m: Mirror): Compare =>
      compare(s, e, piece, piece, st.config, e.mirror(m, st.config), mirrorImage(m))

    for (const st of starts) {
      if (s.orientationOnly) {
        if (st.name === 'X1' && maps.translation && maps.cellMap && maps.rotation) {
          r.orientation = {
            translation: under(st, maps.translation).off,
            cellMap: under(st, maps.cellMap).off,
            rotation: under(st, maps.rotation).off,
          }
        }

        continue
      }

      r.reverses += reverses(s, e, piece, st.config) ? 1 : 0

      const fired = fires(s, e, piece, st.config)

      if (st.name === 'E') {
        r.vacuumFired = fired
        r.vacuumOff = compare(s, e, piece, off, st.config, st.config, identity).off
      }

      if (st.name === 'L' || st.name === 'Lf') {
        r.lightOff += compare(s, e, piece, off, st.config, st.config, identity).off
      }

      if (st.fewBody && (kind === 'odd' || kind === 'oddLabel')) {
        r.fewBodyFired += fired
      }

      if (st.name !== 'E') {
        r.c[st.name] = compare(s, e, piece, piece, st.config, e.charge(st.config), chargeImage)
      }

      if (st.name === 'X1' && maps.translation && maps.cellMap && maps.rotation) {
        r.orientation = {
          translation: under(st, maps.translation).off,
          cellMap: under(st, maps.cellMap).off,
          rotation: under(st, maps.rotation).off,
        }
      }

      if (s.lite) {
        continue
      }

      // P: the X starts under every listed mirror, the rest under the few-body mirrors
      const many = st.name.startsWith('X')
      const oddMaps = many ? maps.odd : maps.fewOdd
      const evenMaps = many ? maps.even : maps.fewEven

      r.pOdd[st.name] = oddMaps.map(m => {
        const c = under(st, m)

        r.pDistance = Math.max(r.pDistance, c.distance)

        return c.off
      })
      r.pEven[st.name] = evenMaps.map(m => under(st, m).off)
      r.cp[st.name] = compare(
        s,
        e,
        piece,
        piece,
        st.config,
        e.charge(e.mirror(maps.p, st.config)),
        cpImage(maps.p),
      )
      r.t[st.name] = reversalOff(s, e, piece, st.config, theta)
      r.cpt[st.name] = reversalOff(s, e, piece, st.config, x => cpImage(maps.p)(theta(x)))

      if (maps.pRotation) {
        r.cptRotation[st.name] = reversalOff(s, e, piece, st.config, x =>
          cpImage(maps.pRotation!)(theta(x)),
        )
      }

      // the CPT re-read on the quotient (an earlier step C1 to C3)
      for (const [name, m] of extra) {
        if (m && maps.inversion) {
          r.cptMaps[name] ??= {}
          r.cptMaps[name]![st.name] = reversalOff(s, e, piece, st.config, x => cpImage(m)(theta(x)))
        }
      }
    }

    for (const st of knot) {
      r.chsh[st.name] = e.knot(e.beat(piece, e.state(st.config), 0), slotA, slotB)
    }

    kinds[kind] = r
    log(`${s.name} ${kind}: ${JSON.stringify(r)} branches max ${branchesMax} (${Math.round((Date.now() - started) / 1000)} s)`)
  }

  return {
    setup: {
      name: s.name,
      kind: s.kind,
      cells: s.table.cells,
      orientationConflicts: s.orientationConflicts,
      lite: s.lite === true,
      orientationOnly: s.orientationOnly === true,
    },
    reflectionConflicts: maps.reflectionConflicts,
    kinds,
    seconds: (Date.now() - started) / 1000,
    engine: e.name,
  }
}

// ---- S0: the sparse engine against the dense one, beat by beat ----

export type Agreement = {
  // runs compared (kind x start), beats compared, beats where the two states differ (as sets, exact amplitudes), beats
  // where the branch lists differ in order or count, beats where the value tallies differ
  runs: number
  beats: number
  differing: number
  orderDiffering: number
  tallyDiffering: number
  branchesMax: number
}

// both engines from every start of a setup, every kind: `beats` forward, then back to beat 0, compared at every beat
export function engineAgreement(s: Setup, log: (line: string) => void = () => {}): Agreement {
  const dense = denseEngine(s)
  const sparse = sparseEngine(s)
  const ds = startsOf(s, dense)
  const ss = startsOf(s, sparse)
  const out: Agreement = { runs: 0, beats: 0, differing: 0, orderDiffering: 0, tallyDiffering: 0, branchesMax: 0 }

  const check = (d: LockedState, p: SparseState, td: ValueTally, tp: ValueTally): void => {
    const asSparse: SparseState = { branches: d.branches.map(sparseFromDense) }

    out.beats++
    out.branchesMax = Math.max(out.branchesMax, d.branches.length)

    if (!sparseSame(asSparse, p)) {
      out.differing++
    }

    const ordered =
      asSparse.branches.length === p.branches.length &&
      asSparse.branches.every((b, i) => {
        const o = p.branches[i]!

        return sparseKey(b) === sparseKey(o) && b.a === o.a && b.b === o.b && b.k === o.k
      })

    if (!ordered) {
      out.orderDiffering++
    }

    if (td.fired !== tp.fired || td.maxExponent !== tp.maxExponent) {
      out.tallyDiffering++
    }
  }

  for (const kind of VALUE_KINDS) {
    const piece = pieceOf(s, kind)

    ds.forEach((st, i) => {
      const td = newValueTally()
      const tp = newValueTally()

      let d = dense.state(st.config)
      let p = sparse.state(ss[i]!.config)

      out.runs++
      check(d, p, td, tp)

      for (let t = 0; t < s.beats; t++) {
        d = dense.beat(piece, d, t, td)
        p = sparse.beat(piece, p, t, tp)
        check(d, p, td, tp)
      }

      for (let t = s.beats - 1; t >= 0; t--) {
        d = dense.back(piece, d, t)
        p = sparse.back(piece, p, t)
        check(d, p, td, tp)
      }
    })

    log(`${s.name} ${currentCoinPlace()} ${kind}: ${JSON.stringify(out)}`)
  }

  return out
}

// ---- the gates on one mesh's reading ----

const all = (xs: readonly number[], p: (x: number) => boolean): boolean => xs.length > 0 && xs.every(p)

export function meshGates(m: MeshReading, startCount: number): Record<string, boolean> {
  const k = m.kinds
  const kinds = VALUE_KINDS
  const few = ['L', 'Lf', 'H', 'Hf', 'K', 'Kf']
  const xs = Object.keys(k.off.pOdd).filter(n => n.startsWith('X'))
  const box = m.setup.kind === 'box'
  const oddKinds: ValueKind[] = ['odd', 'oddLabel']

  if (m.setup.orientationOnly) {
    const o = (kind: ValueKind) => k[kind].orientation

    return {
      G6maps: m.reflectionConflicts === 0,
      G11:
        m.setup.orientationConflicts === 0 &&
        o('odd').translation > 0 &&
        o('odd').cellMap > 0 &&
        o('odd').rotation === 0 &&
        o('oddLabel').translation === 0 &&
        o('oddLabel').cellMap > 0 &&
        o('oddLabel').rotation > 0 &&
        (['off', 'even'] as ValueKind[]).every(
          kind => o(kind).translation === 0 && o(kind).cellMap === 0 && o(kind).rotation === 0,
        ),
    }
  }

  const gates: Record<string, boolean> = {
    G1: kinds.every(kind => k[kind].reverses === startCount),
    G2: kinds.every(kind => k[kind].vacuumFired === 0 && k[kind].vacuumOff === 0),
    G3: kinds.every(kind => k[kind].lightOff === 0),
    G4: oddKinds.every(kind => k[kind].fewBodyFired === 0),
    G5:
      Object.values(k.off.c).every(c => c.off === 0) &&
      k.even.c.H!.off > 0 &&
      k.even.c.L!.off === 0 &&
      oddKinds.every(
        kind =>
          few.every(n => k[kind].c[n]!.off === 0) &&
          k[kind].c.X1!.off > 0,
      ),
    G10: kinds.every(kind =>
      ['K', 'Kf'].every(
        n => k[kind].chsh[n]! > 0 && Math.abs(k[kind].chsh[n]! - k.off.chsh[n]!) <= CHSH_TOLERANCE,
      ),
    ),
  }

  // G6 to G9 only where their runs were made (not on the quotient's feasible subset)
  if (m.setup.lite) {
    gates.G6maps = m.reflectionConflicts === 0
  } else {
    Object.assign(gates, symmetryGates(m, few, xs, box, oddKinds))
  }

  if (m.setup.kind === 'quotient') {
    const o = (kind: ValueKind) => k[kind].orientation

    gates.G11 =
      m.setup.orientationConflicts === 0 &&
      o('odd').translation > 0 &&
      o('odd').cellMap > 0 &&
      o('odd').rotation === 0 &&
      o('oddLabel').translation === 0 &&
      o('oddLabel').cellMap > 0 &&
      o('oddLabel').rotation > 0 &&
      (['off', 'even'] as ValueKind[]).every(
        kind => o(kind).translation === 0 && o(kind).cellMap === 0 && o(kind).rotation === 0,
      )
  }

  return gates
}

// G6 (P), G7 (CP), G8 (T), G9 (CPT)
function symmetryGates(
  m: MeshReading,
  few: readonly string[],
  xs: readonly string[],
  box: boolean,
  oddKinds: readonly ValueKind[],
): Record<string, boolean> {
  const k = m.kinds
  const kinds = VALUE_KINDS

  return {
    G6:
      m.reflectionConflicts === 0 &&
      (['off', 'even'] as ValueKind[]).every(kind =>
        xs.every(
          n => k[kind].pOdd[n]!.every(x => x === 0) && k[kind].pEven[n]!.every(x => x === 0),
        ),
      ) &&
      (box ? ['odd'] : oddKinds).every(
        kind =>
          xs.every(n => all(k[kind as ValueKind].pOdd[n]!, x => x > 0)) &&
          xs.every(n => k[kind as ValueKind].pEven[n]!.every(x => x === 0)) &&
          // the few-body starts are gated under P on the box only (the item's G6); elsewhere they are reported
          few.every(
            n =>
              !box ||
              (k[kind as ValueKind].pOdd[n]!.every(x => x === 0) &&
                k[kind as ValueKind].pEven[n]!.every(x => x === 0)),
          ),
      ),
    G7:
      Object.values(k.off.cp).every(c => c.off === 0) &&
      Object.values(k.odd.cp).every(c => c.off === 0) &&
      k.even.cp.H!.off > 0,
    G8: kinds.every(kind => Object.keys(k.off.t).every(n => k[kind].t[n] === k.off.t[n])),
    G9:
      Object.keys(k.off.cpt).every(n => k.odd.cpt[n] === k.off.cpt[n]) &&
      k.even.cpt.H! > k.off.cpt.H! &&
      (!box || k.odd.cptRotation.X1! > k.off.cptRotation.X1!),
  }
}

// ---- the census gate ----

export function censusGate(): { gate: boolean; summary: string; kStar: number } {
  const g = slotGroup()
  const c = valueCensus()
  const minus = g.det.filter(d => d === -1).length
  const gate = g.elements.length === 1152 && minus === 576 && c.kStar >= 4 && c.kStar <= 5

  return {
    gate,
    kStar: c.kStar,
    summary: `${g.elements.length} slot maps (${minus} det -1), k* ${c.kStar}, classes by size ${c.classes.join('/')}, qualifying ${c.qualifying.join('/')}, first ${JSON.stringify(c.first)}, eps entries ${c.eps.size}`,
  }
}

// ---- the setups ----

export function meshSetup(kind: MeshKind, radius = 4): Setup {
  if (kind === 'box') {
    // radius 1 on the box: X1 only, no XA
    return boxSetup(radius !== 1)
  }

  if (kind === 'ball') {
    const m = exactBallMesh({ radius })

    return setupOf(m.mesh, 'ball', `ball R=${radius}`, BALL_BEATS)
  }

  const e = enumerateFrames({ level: QUOTIENT_LEVEL, maxDocks: QUOTIENT_DOCKS })

  if (!e.fits) {
    throw new Error('value-phase: the (sqrt 2)^6 quotient does not fit')
  }

  const q = quotientMesh(e.table, e.order, 'congruence-3434 (sqrt 2)^6')

  // radius 1 on the quotient: the subset G1 to G5, G10, G11 (Setup.lite); radius 2: the orientation check alone; any
  // other radius: the full set (sparse branches make it feasible)
  const lite = radius === 1
  const orientationOnly = radius === 2
  const tag = lite ? ' (G6 to G9 not run)' : orientationOnly ? ' (G11 only)' : ''

  return {
    ...setupOf(q.mesh, 'quotient', `quotient (sqrt 2)^6${tag}`, QUOTIENT_BEATS),
    lite,
    orientationOnly,
  }
}

export function valuePhase(
  meshes: readonly { kind: MeshKind; radius?: number; gated: boolean }[],
  log: (line: string) => void = () => {},
): Verdict {
  const started = Date.now()
  const census = censusGate()

  log(`census: ${census.summary} (${Math.round((Date.now() - started) / 1000)} s)`)

  if (census.kStar === 0) {
    return verdict({
      status: 'fail',
      claim: 'no mirror-odd C-odd pattern of up to 5 vibes exists, so the ODD piece is undefined',
      metrics: { kStar: 0 },
      notes: census.summary,
    })
  }

  const readings = meshes.map(spec => {
    const s = meshSetup(spec.kind, spec.radius)
    const m = readMesh(s, log)
    const gates = meshGates(m, startCountOf(s))

    log(`${s.name} gates ${JSON.stringify(gates)}`)

    return { spec, m, gates }
  })
  const gated = readings.filter(r => r.spec.gated)
  const allGates: Record<string, boolean> = { G0: census.gate }

  for (const r of gated) {
    for (const [g, ok] of Object.entries(r.gates)) {
      allGates[g] = (allGates[g] ?? true) && ok
    }
  }

  const failing = Object.entries(allGates).filter(([, ok]) => !ok).map(([g]) => g)
  const offFailsT = gated.some(r => Object.values(r.m.kinds.off.t).some(x => x > 0))
  const status =
    failing.length === 0
      ? 'pass'
      : failing.every(g => g === 'G8' || g === 'G9') && offFailsT
        ? 'partial'
        : 'fail'
  const metrics: Record<string, number> = {
    kStar: census.kStar,
    seconds: (Date.now() - started) / 1000,
  }

  for (const [g, ok] of Object.entries(allGates)) {
    metrics[`gate${g}`] = ok ? 1 : 0
  }

  for (const r of readings) {
    const tag = `${r.spec.kind}${r.spec.radius ?? ''}`

    for (const kind of VALUE_KINDS) {
      const k = r.m.kinds[kind]

      metrics[`${tag}_${kind}_cX1`] = k.c.X1?.off ?? -1
      metrics[`${tag}_${kind}_cH`] = k.c.H?.off ?? -1
      metrics[`${tag}_${kind}_cDistanceMax`] = Math.max(...Object.values(k.c).map(c => c.distance))
      metrics[`${tag}_${kind}_pDistanceMax`] = k.pDistance
      metrics[`${tag}_${kind}_cptH`] = k.cpt.H ?? -1
      metrics[`${tag}_${kind}_cptX1`] = k.cpt.X1 ?? -1
      metrics[`${tag}_${kind}_tTotal`] = Object.values(k.t).reduce((a, b) => a + b, 0)
      metrics[`${tag}_${kind}_chshK`] = k.chsh.K ?? -1
    }
  }

  return verdict({
    status,
    claim: `the value phase on the working rule: ${status}; k* = ${census.kStar}; gates ${JSON.stringify(allGates)} on ${gated.map(r => r.m.setup.name).join(', ')}`,
    metrics,
    notes: `Gates registered before the run, gate da3345dbf693. Census: ${census.summary}. ${readings
      .map(r => `${r.m.setup.name} (${r.spec.gated ? 'gated' : 'reported'}, ${r.m.seconds.toFixed(0)} s): ${JSON.stringify(r.gates)}`)
      .join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'foundations/value-phase',
  code: 'E-FND-0178',
  title:
    "the value phase, a C-odd rule piece that tells pleasure from pain, partial: a diagonal phase zeta6^n (zeta6 = 1 + w, exact in Z[w][1/2], reversible on 9 of 9 starts on every mesh) in two forms; EVEN (the tone of every full like line, mirror-even) breaks C, CP and CPT from two vibes (a head-on like pair: 2 of 3 beats on the R = 4 ball, 7 of 8 on the box, occupation distance 0.13 and 0.29) and keeps every mirror; ODD (a W(F4) pseudoscalar of 4 vibes, k* = 4 with 20 chiral classes of 180, read with each dock's orientation) fires on no dock of fewer than 4 vibes, breaks C and every det -1 cell map on a 4-vibe cluster (phases only, distance 0) and keeps CP and every det +1 map; on the (sqrt 2)^6 quotient ODD breaks the label translation and the cell mirror (7 of 8 beats) and keeps their product, a class-swapping rotation, while the label-written control does the reverse (0, 7, 7): it reads orientation; neither touches the empty vacuum, a lone vibe or the like knot's CHSH sqrt 7; on the quotient's full set (sparse branches, equal to the dense rule bit for bit on the box and the R = 4 ball) every gate G1 to G11 holds on both coin places, and on the split coin (the bare rule 0 beats off under T and CPT on every start) ODD keeps CPT under the det -1 cell map and the translation and breaks it on the 4-vibe cluster at 1 of 8 beats (phases only) under the orientation-keeping inversion and L.g; partial because on the default coin-before rule the box's predicted CPT break of ODD under the depth-reversing lift is masked (the rule without the piece already fails K S R reversal on that start, 2 of 8 beats)",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return valuePhase(
      [
        // the gated runs (M3): the box without XA and the R = 4 ball (2026-11-14, dense), the quotient's full set on
        // sparse branches (2026-11-16; radius 0 = the full set)
        { kind: 'box', radius: 1, gated: true },
        { kind: 'ball', radius: 4, gated: true },
        { kind: 'quotient', radius: 0, gated: true },
      ],
      line => console.error(line),
    )
  },
})
