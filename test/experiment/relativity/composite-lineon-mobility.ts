// DOES A COMPOSITE OF LINEONS MOVE WHERE NO MEMBER CAN (E-RLT-0114)? On the working rule every vibe is a lineon: it moves
// only along its mesh line (E-SPN-0098), and line-only matter is excluded by observation (E-SPN-0126, E-RLT-0059). In
// fracton models a single lineon is immobile off its line, yet bound composites of lineons (a dipole on parallel lines,
// a pair or a triple on lines that cross, whose lines may span 3d) move freely in more directions; and the Matter As
// Machine reading asks that Euclidean rotation come out of interaction in a taxicab space (E-RLT-0113). The question:
// on the working rule as it stands, with no new mixer, does a composite of vibes on DIFFERENT lines gain mobility in a
// husk direction no member has, and is that motion isotropic at leading order?
//
// STEP 1, FROM THE CODE: THE LINES AND WHAT BINDS. The dock has 24 slots on 12 lines (code/rule/isometric-knit
// LINE_FIRSTS, LINE_OF), the 12 line classes of D4. The husk reading pi drops the depth and casts them on 9 husk
// directions: the 6 classes e_a +- e_b one to one on the face diagonals, the 6 depth classes e_a +- e_4 two to one on
// the axes; no line casts a body diagonal (code/measure/bulk-shadow, E-SPN-0127). What acts across lines: the coin,
// the meeting, the pair move and the stream act inside one dock line (E-SPN-0117); K, the bounce at a dock of two or
// more singles, permutes that one dock's slots (E-SPN-0110, E-SPN-0118). So two members on different lines interact
// only at a dock both lines pass through, and two distinct lines share at most one dock. Nothing in the rule holds two
// members on different lines together after they leave that dock: the only cross-line binders in the record are
// stand-ins (the drift cost's string, E-SPN-0118, E-SPN-0120), and a phase diagonal in the configuration moves no
// vibe. The composites the rule can PLACE, and which this file runs, are:
//   F2 parallel dipoles: a love at X and a fear at X + r on parallel lines of one class (r any of the 22 roots off the
//      line), for a face-diagonal class (1,1,0,0) and a depth class (1,0,0,1)
//   F3 crossing pairs at one dock X: every one of the 66 pairs of line classes, love with love and love with fear
//   F4 crossing triples at X: every one of the 220 triples of line classes, three loves (a triple spans 3d in the bulk
//      always; its shadows span 3d on the husk for the count `husk3d` read below)
//   and the two-hub start of E-SPN-0127 (stars crossing at 6 bulk docks) as the reading's positive control.
//
// THE FRACTON COMPARISON, DERIVED BEFORE THE RUN. In a fracton model a composite moves because some local term of the
// dynamics moves its members together: a product of local operators, each a term of the rule, takes the composite one
// step while every conserved subsystem charge stays as it was. A lineon pair in the X-cube model is a planon because a
// corner term turns lineons into one another at a vertex. Here the conserved structure is stronger than a charge per
// line:
// (a) parallel composites: every piece acts inside one dock line, so a start differing from the vacuum on lines of
//     one class equals each line's own run (E-SPN-0117): the whole state of every line is kept, not only its tone,
//     and a dipole is two independent 1d worlds. Its singles stay on its two lines, whose shadow is the members'.
// (b) crossing composites: the only cross-line term, K, acts at a dock with two or more singles. The vacuum has none
//     (condition Z), and a dock off X meets at most one line through X, so the difference stays on the twelve lines
//     through X forever (the star theorem, E-SPN-0119). The "corner" is pinned at X: no term exists that could step it.
// So a member can turn onto another line only at X, and then leaves X along that line. A composite that stays bound
// cannot leave X: two singles on star lines with different shadows, each at least 2 husk docks from pi(X), are at
// least 2 * 2 sin(45 / 2 degrees) = 1.53 docks apart (the least angle between two of the 9 shadows is 45 degrees),
// above the bound radius below; and three singles on distinct lines never share one shadow (a shadow carries at most
// two bulk classes). Two singles of one shadow (the depth pair (1,0,0,1), (1,0,0,-1)) move along a member's shadow.
// PREDICTED: no composite is a mover (G1 false), so G2 is empty, the verdict fail; every hub composite's difference
// stays on its star (offStar 0) and no single ever reads a body diagonal (the star casts only the 9 line shadows);
// the composites' singles do reach husk directions no member has, through K at X, but as members leaving X, not as a
// unit that moves. Also reported, an exact census: for every set of 1 to 3 line classes, the span its members' lines
// share (E-SPN-0127 item 4): 1 for one class, 0 for every set of two or more, so no set gains a direction.
//
// THE RUN. Side 8 (and side 12 for F4), the working knit with its vacuum (contact 'pass', veto 'none', the keyed
// coin and meeting, THRESHOLD_BORN), the full-period keys full+0 .. full+3 at side 8 (full+0 at side 12), 64 beats.
// Each start is run beside the vacuum's own kept history on the same key (code/measure/composite-mobility). The
// composite's matter is its SINGLES (dock lines holding one vibe), since the vacuum holds none. Reach along a husk
// direction is counted in husk steps on the husk line through pi(X), antipodes left out.
//
// GATES, fixed before the first run of this file.
//  BOUND a run of a composite with n0 singles at the start is bound if at every beat 1 .. 64 it holds between 1 and
//     2 n0 singles and every two of them are at most 1.5 husk docks apart (the torus distance).
//  G1 a composite gains a mobile direction: some composite (F2, F3 or F4) is a MOVER on every run it has, where a run
//     is a mover if it is bound and at some beat every single sits at least 2 husk docks from pi(X) and off every
//     member's husk line (the whole torus line through the shadow of the member's start dock along its shadow): the
//     composite as a unit is away from the hub, where no member could have taken it.
//  G2 the motion is isotropic at leading order: over the G1 movers, each of the 13 husk directions u is reached (some
//     mover's singles' centroid at its first away beat lies nearest to u in angle), and the first-arrival beats T_u
//     have spread (max - min) / mean at most 0.02.
// Verdict: open if a control or check fails; pass if G1 and G2; partial if G1 alone (new mobile directions, but
// anisotropic); fail if no composite is a mover.
// CONTROLS (a failed control makes the verdict open, the instrument not trusted).
//  C1 a single lineon moves only on its line: a lone love on each of the 12 line classes at X, on each key: 0 singles
//     off its own husk line, reach at least 2 steps along its own shadow, 0 on each of the other 12 directions, and
//     0 differing readings off its star.
// REPORTED, not gated, by family: runs bound, pinned at the hub, away, movers; runs whose singles reach 2 steps along
// a husk direction through pi(X) that no member has (for F2 the fear starts off pi(X), so its count there is only
// a reading); singles off member lines; readings off the star; K off the hubs; the body-diagonal reach; the reach by
// direction and its spread over the 13.
//  CP the reading can see every direction and rejects a cascade: the two-hub start (loves on (1,0,0,1), (0,1,0,1) at X
//     and on (1,0,0,-1), (0,1,0,-1) at Y = X + (0,0,0,2)), key full+0, side 8: its differing readings reach at least
//     2 steps along each of the 13 directions, body diagonals included, and the run is not bound.
//  CV the vacuum: 0 K firings and 0 single lines over 64 beats on every key and side.
// CHECK: the stepper equals keyedRunner bit for bit on every C1 run.
// TIMING PROBE, disclosed (tmp/rlt114-timing-probe.ts, before any composite was run): setup 2.3 s, the vacuum history
// 0.33 s, a run 0.42 s (0.70 s with the check) at side 8; a start equal to the vacuum differs 0 times. No gated
// reading was seen.
//
// FIRST RUN (tmp/rlt114-run1.log, 2026-10-20, 992 s, one thread): FAIL on G1 as predicted; C1, CP, CV and the stepper
// check hold and no gate moved. 0 of 1,804 composite runs are bound and 0 composites are movers, so G2 is empty. F2:
// 0 singles off member lines, 0 K firings (two independent 1d worlds); its 8 "new direction" runs and body reach 1
// are the fear's own line seen from pi(X), as the header warned, not motion. F3 and F4: 0 readings off the star, 0 K
// off X, 0 body-diagonal reach; singles reach 3 steps (side 12: 5) along all 9 line shadows, so 432 of 528 pair runs and
// 872 of 880 triple runs (207 of 220 at side 12) put a single 2 steps along a direction no member has, every one a
// member or a freed vacuum vibe leaving X along a star line (singles up to 32 and 33). Reach by direction [3 on the 9
// shadows, 0 on the 4 body diagonals], spread 1.444, exactly a lone love's union over the 12 classes. CP: 418,798
// readings off the stars, K at 22,204 docks off the hubs, 15,518 singles, apart up to 6.93. Title written after the
// run.
//
// WHAT IT SAYS ABOUT THE LINE LAW. A fracton constraint conserves a few subsystem charges and leaves composites free
// to move wherever those charges allow; that is why the X-cube's lineon pairs are planons. The working rule conserves
// far more: every line's whole state, except at a dock already holding two singles. So the composites here do not even
// bind, and the corner where lineons could turn is fixed at the dock where they started. The line law therefore is not
// the reason matter is composite on this rule; composites inherit it. Fracton-style mobility would need a rule piece
// that acts on two lines at a dock the vacuum supplies (a corner term off the hub), which is exactly the mixer class
// whose every member cascades (E-SPN-0094 to E-SPN-0099).
//
// Depth L1: the no-go is derived (items a and b, the star theorem and the factorization) and read on the committed
// rule through its own beat, exhaustively over the placed composites, with controls that could have shown motion.
// DETERMINISM: no random numbers; every start is placed, the key is integer arithmetic. NOTHING MOVES: the stream
// takes each value one dock along, and the readings only look.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import { fullPathKey, meshLines } from '@/code/measure/full-key-paths'
import { placeLoves } from '@/code/measure/hub-star'
import { shadowClasses, shadowOf } from '@/code/measure/bulk-shadow'
import { spread } from '@/code/measure/husk-transport-order'
import {
  commonLineSpan,
  compositeRun,
  HUSK_DIRECTIONS,
  huskDirectionOf,
  huskFrame,
  memberLineDocks,
  shadowMask,
  vacuumHistory,
  type CompositeReading,
} from '@/code/measure/composite-mobility'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/integer-roots'
import { rootIndex } from '@/code/measure/crossing-lines'
import {
  d4BoxCell,
  d4BoxCoordinates,
  d4Coordinates,
} from '@/code/substrate/d4-box-integer'

const ROOTS = rootsD4()
const BEATS = 64
const KEYS = [0, 1, 2, 3]
const BOUND = 1.5
const AWAY = 2
const REACH = 2
const ISOTROPY = 0.02
const BODY = [9, 10, 11, 12]
const DIPOLE_LINES = [
  [1, 1, 0, 0],
  [1, 0, 0, 1],
]
const DEPTH_STACK = [0, 0, 0, 2]

type Start = {
  family: 'F1' | 'F2' | 'F3' | 'F4' | 'CP'
  name: string
  loves: { dock: number; slot: number }[]
  fears: { dock: number; slot: number }[]
  hubs: number[]
  roots: number[][]
}

type Box = ReturnType<typeof boxOf>

function boxOf(side: number) {
  const X = centerOf(side)
  const fresh = contactFresh(side, 'pass', X)
  const lines = meshLines(fresh.tables)
  const vacuum = wordVacuum(fresh, fresh.store)
  const frame = huskFrame({ cells: fresh.tables.cells, side, hub: X })
  const plus = (r: readonly number[]): number =>
    d4BoxCell({
      coordinates: d4BoxCoordinates({ cell: X, side }).map(
        (c, k) => c + d4Coordinates(r)[k]!,
      ),
      side,
    })

  return { side, X, fresh, lines, vacuum, frame, plus }
}

const triples = (n: number): number[][] => {
  const out: number[][] = []

  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      for (let c = b + 1; c < n; c++) {
        out.push([a, b, c])
      }
    }
  }

  return out
}
const pairs = (n: number): number[][] => {
  const out: number[][] = []

  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      out.push([a, b])
    }
  }

  return out
}

function startsOf(box: Box, families: readonly Start['family'][]): Start[] {
  const { X, plus } = box
  const out: Start[] = []
  const at = (slot: number) => ({ dock: X, slot })

  if (families.includes('F1')) {
    LINE_FIRSTS.forEach((d, l) =>
      out.push({
        family: 'F1',
        name: `love l${l}`,
        loves: [at(d)],
        fears: [],
        hubs: [X],
        roots: [ROOTS[d]!],
      }),
    )
  }

  if (families.includes('F2')) {
    for (const line of DIPOLE_LINES) {
      const a = rootIndex(line)

      ROOTS.forEach((r, i) => {
        if (i === a || r.every((x, k) => x === -line[k]!)) {
          return
        }

        const Y = plus(r)

        out.push({
          family: 'F2',
          name: `dipole (${line.join(',')}) + (${r.join(',')})`,
          loves: [at(a), { dock: Y, slot: a }],
          fears: [{ dock: Y, slot: a }],
          hubs: [X, Y],
          roots: [line, line],
        })
      })
    }
  }

  if (families.includes('F3')) {
    for (const [p, q] of pairs(12)) {
      for (const fear of [false, true]) {
        const a = LINE_FIRSTS[p!]!
        const b = LINE_FIRSTS[q!]!

        out.push({
          family: 'F3',
          name: `pair l${p} l${q} ${fear ? 'love-fear' : 'love-love'}`,
          loves: [at(a), at(b)],
          fears: fear ? [at(b)] : [],
          hubs: [X],
          roots: [ROOTS[a]!, ROOTS[b]!],
        })
      }
    }
  }

  if (families.includes('F4')) {
    for (const t of triples(12)) {
      const slots = t.map(l => LINE_FIRSTS[l]!)

      out.push({
        family: 'F4',
        name: `triple l${t.join(' l')}`,
        loves: slots.map(at),
        fears: [],
        hubs: [X],
        roots: slots.map(d => ROOTS[d]!),
      })
    }
  }

  if (families.includes('CP')) {
    const Y = plus(DEPTH_STACK)

    out.push({
      family: 'CP',
      name: 'two hubs',
      loves: [
        at(rootIndex([1, 0, 0, 1])),
        at(rootIndex([0, 1, 0, 1])),
        { dock: Y, slot: rootIndex([1, 0, 0, -1]) },
        { dock: Y, slot: rootIndex([0, 1, 0, -1]) },
      ],
      fears: [],
      hubs: [X, Y],
      roots: [
        [1, 0, 0, 1],
        [0, 1, 0, 1],
        [1, 0, 0, -1],
        [0, 1, 0, -1],
      ],
    })
  }

  return out
}

type Run = {
  start: Start
  side: number
  key: number
  n0: number
  memberMask: number
  r: CompositeReading
}

function runAll(
  box: Box,
  starts: readonly Start[],
  keys: readonly number[],
  check: boolean,
  vacuumOut: { events: number; singles: number }[],
): Run[] {
  const out: Run[] = []

  for (const k of keys) {
    const key = fullPathKey(k)
    const history = vacuumHistory({
      tables: box.fresh.tables,
      vacuum: box.vacuum,
      key,
      threshold: THRESHOLD_BORN,
      beats: BEATS,
    })

    vacuumOut.push({ events: history.events, singles: history.singles })

    for (const start of starts) {
      const s = placeLoves(box.vacuum, start.loves)

      for (const f of start.fears) {
        s.vibe[f.dock * 24 + f.slot] = -1
      }

      const memberMask = shadowMask(start.roots)
      const onMember = memberLineDocks({
        cells: box.fresh.tables.cells,
        side: box.side,
        members: start.loves.map(l => ({
          dock: l.dock,
          root: ROOTS[l.slot]!,
        })),
      })
      const r = compositeRun({
        tables: box.fresh.tables,
        history,
        start: s,
        lines: box.lines,
        frame: box.frame,
        hubs: start.hubs,
        onMember,
        key,
        threshold: THRESHOLD_BORN,
        beats: BEATS,
        check,
      })

      out.push({
        start,
        side: box.side,
        key: k,
        n0: start.loves.length,
        memberMask,
        r,
      })
    }
  }

  return out
}

const isBound = (run: Run): boolean =>
  run.r.singles.every(
    (n, t) => n >= 1 && n <= 2 * run.n0 && run.r.apart[t]! <= BOUND,
  )

// the first beat at which every single is AWAY from the hub point and off every member shadow line, or -1
const awayBeat = (run: Run): number =>
  run.r.singles.findIndex(
    (n, t) =>
      n > 0 &&
      run.r.nearest[t]! >= AWAY &&
      run.r.offMembers[t] === n,
  )

const isMover = (run: Run): boolean => isBound(run) && awayBeat(run) >= 0

// the husk direction (of 13) nearest in angle to a husk vector
const nearestDirection = (v: readonly number[]): number => {
  const n = Math.hypot(...v)

  let best = -1
  let bestCos = -1

  HUSK_DIRECTIONS.forEach((u, i) => {
    const c =
      Math.abs(u.reduce((s, x, k) => s + x * v[k]!, 0)) /
      (Math.hypot(...u) * Math.max(n, 1e-300))

    if (c > bestCos) {
      bestCos = c
      best = i
    }
  })

  return best
}

const newReach = (run: Run): number =>
  Math.max(
    0,
    ...run.r.singleReach.filter((_, i) => ((run.memberMask >> i) & 1) === 0),
  )

export default experiment({
  id: 'relativity/composite-lineon-mobility',
  code: 'E-RLT-0114',
  title:
    "no composite of lineons moves where no member can, so the line law is not a fracton constraint, fail (G1) at L1 as derived: 12 line classes cast 9 husk directions and none a body diagonal, and of 298 sets of 1 to 3 classes none shares a span beyond one class; on the working knit (side 8, four full keys, 64 beats) 396 placed composites in 1,804 runs (176 parallel dipoles, 528 crossing pairs at one dock, 880 crossing triples, the shadows of 150 of the 220 triples spanning the husk, and the 220 triples again at side 12) give 0 bound runs and 0 movers: parallel dipoles put 0 singles off their own lines and fire K 0 times; at a hub K fires 12,288 and 23,320 times, sends singles 3 steps (5 at side 12) along all 9 line shadows, 432 and 872 runs reaching a direction no member has, but only as members leaving the hub (up to 33 singles, with freed vacuum vibes), with 0 readings off the star, 0 K off the hub and 0 body-diagonal reach, so the reach by direction has spread 1.44 over the 13 husk directions, the same as a lone love's; a lone love keeps its own line on 48 of 48 runs, and the two-hub cascade reaches every direction with 15,518 singles and is rejected as unbound",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )

    // ---- the census: classes, shadows, and the span each set of classes shares ----
    const classes = shadowClasses()
    const classRoots = LINE_FIRSTS.map(d => ROOTS[d]!)
    const sets = [
      ...classRoots.map((_, l) => [l]),
      ...pairs(12),
      ...triples(12),
    ]
    const census = sets.map(s => {
      const roots = s.map(l => classRoots[l]!)
      const span = commonLineSpan(roots)
      const shadows = roots.map(r => shadowOf(r))
      const husk3d =
        s.length === 3 &&
        Math.abs(
          shadows[0]![0]! *
            (shadows[1]![1]! * shadows[2]![2]! -
              shadows[1]![2]! * shadows[2]![1]!) -
            shadows[0]![1]! *
              (shadows[1]![0]! * shadows[2]![2]! -
                shadows[1]![2]! * shadows[2]![0]!) +
            shadows[0]![2]! *
              (shadows[1]![0]! * shadows[2]![1]! -
                shadows[1]![1]! * shadows[2]![0]!),
        ) > 0

      return { size: s.length, span, husk3d }
    })
    const spanGains = census.filter(c => c.size > 1 && c.span > 0).length
    const husk3d = census.filter(c => c.husk3d).length
    const bodyShadows = classRoots.filter(r =>
      BODY.includes(huskDirectionOf(shadowOf(r))),
    ).length

    log('census')

    // ---- the runs ----
    const vacuum: { events: number; singles: number }[] = []
    const box8 = boxOf(8)
    const controls8 = runAll(box8, startsOf(box8, ['F1']), KEYS, true, vacuum)

    log('F1')

    const composites8 = runAll(
      box8,
      startsOf(box8, ['F2', 'F3', 'F4']),
      KEYS,
      false,
      vacuum,
    )

    log('F2 F3 F4 side 8')

    const cp = runAll(box8, startsOf(box8, ['CP']), [0], false, vacuum)[0]!
    const box12 = boxOf(12)
    const composites12 = runAll(
      box12,
      startsOf(box12, ['F4']),
      [0],
      false,
      vacuum,
    )

    log('F4 side 12')

    // ---- controls and checks ----
    const c1 = controls8.map(run => {
      const own = run.memberMask
      const ownIndex = Math.log2(own)

      return (
        run.r.singlesOffMembers === 0 &&
        run.r.singleReach[ownIndex]! >= REACH &&
        run.r.singleReach.every((x, i) => i === ownIndex || x === 0) &&
        run.r.offStar === 0
      )
    })
    const C1 = c1.every(Boolean)
    const CP =
      cp.r.wakeReach.every(x => x >= REACH) && !isBound(cp)
    const CV = vacuum.every(v => v.events === 0 && v.singles === 0)
    const stepper = controls8.every(run => run.r.stepperDiffer === 0)
    const controls = { C1, CP, CV }
    const controlled = C1 && CP && CV && stepper

    // ---- the gates ----
    const all = [...composites8, ...composites12]
    const byName = new Map<string, Run[]>()

    all.forEach(run => {
      const k = run.start.name
      const list = byName.get(k) ?? []

      list.push(run)
      byName.set(k, list)
    })

    const movers = [...byName.values()].filter(runs => runs.every(isMover))
    const G1 = movers.length > 0
    const arrival = new Array<number>(13).fill(Infinity)

    movers.flat().forEach(run => {
      const t = awayBeat(run)
      const u = nearestDirection(run.r.centroid[t]!)

      arrival[u] = Math.min(arrival[u]!, t + 1)
    })

    const reached = arrival.every(Number.isFinite)
    const G2 = G1 && reached && spread(arrival) <= ISOTROPY
    const status = !controlled
      ? 'open'
      : G1 && G2
        ? 'pass'
        : G1
          ? 'partial'
          : 'fail'

    // ---- the reported readings, by family ----
    const families = ['F2', 'F3', 'F4'] as const
    const profile = (runs: readonly Run[]) => {
      const reach = new Array<number>(13).fill(0)

      runs.forEach(run =>
        run.r.singleReach.forEach(
          (x, i) => (reach[i] = Math.max(reach[i]!, x)),
        ),
      )

      return {
        runs: runs.length,
        bound: runs.filter(isBound).length,
        pinnedBound: runs.filter(
          run => isBound(run) && run.r.farthest.every(f => f <= BOUND),
        ).length,
        away: runs.filter(run => awayBeat(run) >= 0).length,
        movers: runs.filter(isMover).length,
        newDirection: runs.filter(run => newReach(run) >= REACH).length,
        offMembers: runs.reduce((s, run) => s + run.r.singlesOffMembers, 0),
        offStar: runs.reduce((s, run) => s + run.r.offStar, 0),
        offHub: runs.reduce((s, run) => s + run.r.offHub, 0),
        offHuskLines: runs.reduce((s, run) => s + run.r.offHuskLines, 0),
        bodyReach: Math.max(...BODY.map(i => reach[i]!)),
        reach,
        reachSpread: spread(reach),
        maxSingles: Math.max(...runs.map(run => Math.max(...run.r.singles))),
        kFirings: runs.reduce((s, run) => s + run.r.events, 0),
      }
    }
    const read8 = Object.fromEntries(
      families.map(f => [
        f,
        profile(composites8.filter(run => run.start.family === f)),
      ]),
    ) as Record<(typeof families)[number], ReturnType<typeof profile>>
    const read12 = profile(composites12)
    const loneReach = profile(controls8)

    const metrics: Record<string, number> = {
      G1: G1 ? 1 : 0,
      G2: G2 ? 1 : 0,
      control_C1: C1 ? 1 : 0,
      control_CP: CP ? 1 : 0,
      control_CV: CV ? 1 : 0,
      stepper: stepper ? 1 : 0,
      lineClasses: classRoots.length,
      huskShadows: classes.keys.length,
      bodyShadows,
      censusSets: census.length,
      spanGains,
      husk3dTriples: husk3d,
      compositeNames: byName.size,
      compositeRuns: all.length,
      moverComposites: movers.length,
      loneRuns: controls8.length,
      loneReachSpread: loneReach.reachSpread,
      cpWakeReachMin: Math.min(...cp.r.wakeReach),
      cpSinglesMax: Math.max(...cp.r.singles),
      cpApartMax: Math.max(...cp.r.apart),
      cpOffStar: cp.r.offStar,
      seconds: (Date.now() - started) / 1000,
    }

    for (const f of families) {
      const p = read8[f]

      metrics[`${f}_runs`] = p.runs
      metrics[`${f}_bound`] = p.bound
      metrics[`${f}_pinnedBound`] = p.pinnedBound
      metrics[`${f}_away`] = p.away
      metrics[`${f}_movers`] = p.movers
      metrics[`${f}_newDirection`] = p.newDirection
      metrics[`${f}_offMembers`] = p.offMembers
      metrics[`${f}_offStar`] = p.offStar
      metrics[`${f}_offHub`] = p.offHub
      metrics[`${f}_bodyReach`] = p.bodyReach
      metrics[`${f}_reachSpread`] = p.reachSpread
      metrics[`${f}_kFirings`] = p.kFirings
      metrics[`${f}_maxSingles`] = p.maxSingles
    }

    metrics.F4side12_runs = read12.runs
    metrics.F4side12_bound = read12.bound
    metrics.F4side12_movers = read12.movers
    metrics.F4side12_newDirection = read12.newDirection
    metrics.F4side12_offStar = read12.offStar
    metrics.F4side12_bodyReach = read12.bodyReach
    metrics.F4side12_reachSpread = read12.reachSpread

    const text = (f: string, p: ReturnType<typeof profile>): string =>
      `${f}: ${p.runs} runs, ${p.bound} bound (${p.pinnedBound} pinned at the hub), ${p.away} away, ${p.movers} movers, ${p.newDirection} with a single 2 steps along a direction no member has, ${p.offMembers} single readings off member lines, off-star ${p.offStar}, K off hub ${p.offHub}, body-diagonal reach ${p.bodyReach}, reach by direction [${p.reach.join(' ')}] (spread ${p.reachSpread.toFixed(3)})`

    return verdict({
      status,
      claim: `12 line classes cast ${classes.keys.length} husk directions, ${bodyShadows} of them a body diagonal; of ${census.length} sets of 1 to 3 classes, ${spanGains} share a span beyond one class (${husk3d} triples span the husk); on the working knit ${text('F2 parallel dipoles', read8.F2)}; ${text('F3 crossing pairs', read8.F3)}; ${text('F4 crossing triples', read8.F4)}; ${text('F4 at side 12', read12)}; ${movers.length} composites are movers on every run (G1 ${G1}, G2 ${G2}); a lone love reaches [${loneReach.reach.join(' ')}] steps by direction, only on its own line (C1 ${C1}); the two-hub start reaches at least ${Math.min(...cp.r.wakeReach)} steps on every direction with ${Math.max(...cp.r.singles)} singles (CP ${CP})`,
      metrics,
      control: {
        loneOffMembers: controls8.reduce(
          (s, run) => s + run.r.singlesOffMembers,
          0,
        ),
        loneOffStar: controls8.reduce((s, run) => s + run.r.offStar, 0),
        cpWakeReachMin: Math.min(...cp.r.wakeReach),
        vacuumEvents: vacuum.reduce((s, v) => s + v.events, 0),
        vacuumSingles: vacuum.reduce((s, v) => s + v.singles, 0),
      },
      notes: `L1. Controls ${JSON.stringify(controls)}, stepper ${stepper}. C1 per run: ${c1.filter(Boolean).length} of ${c1.length}. Arrival beats ${arrival.join(' ')}. CP: off-star ${cp.r.offStar}, K ${cp.r.events} (${cp.r.offHub} off the hubs), singles by beat 16s ${cp.r.singles.filter((_, i) => i % 16 === 15).join(' ')}, apart max ${Math.max(...cp.r.apart).toFixed(3)}. Lone love reach by class: ${controls8.filter(run => run.key === 0).map(run => `${run.start.name} [${run.r.singleReach.join('')}]`).join(', ')}. Max singles F2 ${read8.F2.maxSingles}, F3 ${read8.F3.maxSingles}, F4 ${read8.F4.maxSingles}. K firings F2 ${read8.F2.kFirings}, F3 ${read8.F3.kFirings}, F4 ${read8.F4.kFirings}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
