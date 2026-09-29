// CAN A PINNED COMPOSITE MOVE BY EXCHANGE WITH A BACKGROUND OF MATTER (E-SPN-0124)? Pretko, "Emergent gravity of fractons:
// Mach's principle revisited" (Phys. Rev. D 96, 024051, 2017): an isolated fracton cannot move, but in a background of
// other fractons it moves by trading dipoles with them, so its mobility, and its inertia, come from the matter around it.
// note/research/vibe/roadmap/remaining-pieces.md, "Six angles on 3d motion", angle 1. The rule's only line-changing piece
// K fires where two or more singles share a dock, only where matter meets: one hub is pinned (E-SPN-0119's star
// theorem) and two hubs alone cascade (E-SPN-0120). The question: in a uniform BACKGROUND of other composites, does a
// probe composite hop by exchange, its hub handing a line to a neighbor and a neighbor's line becoming its own?
//
// DERIVED BEFORE THE RUN.
// 1. THE STEADY BACKGROUND. Put a neutral trio (loves on b = (1,1,0,0), a = (1,0,1,0), c = (0,1,1,0), charge 3, Z3-neutral)
//    at every dock of X + 4 D4: side 8 holds 16 (T4). The vacuum's store has period 4, so every hub sees the same local
//    vacuum. The stars of two hubs X and X + 4 lam meet where s r - u r' = 4 lam for roots r, r'. For r' = r, parallel
//    lines, this is the SAME line when lam = r: each line through X runs through the hub X + 4 r, so the array's 192
//    star lines are 96 mesh lines, each shared by two hubs. For r' != r, two roots span a plane in which s r - u r' is
//    in 4 D4 only for s, u = 0 mod 4 (check, r = (1,1,0,0): r' = (1,-1,0,0) gives (s - u, s + u, 0, 0), and an even
//    coordinate sum of the quotient forces 4 | s; r' = (1,0,1,0) gives (s - u, s, -u, 0), so 4 | s, u; the rest by the
//    Weyl group), which is a hub. So the union of the stars CROSSES NOWHERE OFF THE HUBS. E-SPN-0119's induction then
//    runs unchanged with the union in place of one star: a dock off the hubs lies on at most one union line, holds at most
//    one single, and K never fires there. The background is CONFINED to its 96 lines at every beat, exactly: steady in the
//    sense G1 asks, since its difference from the vacuum is bounded by those lines' slots. Neighboring hubs DO share a
//    line, so content from X reaches X + 4 r and K there acts on it: the hubs talk, but only through hubs.
//    A second background, the love-fear meson of E-SPN-0115 at every dock of X + 4 D4 (love on b at h, fear on b at
//    h + b, 16 mesons) (M4), lies on parallel lines of one class: E-SPN-0117's theorem makes it confined and
//    factorized, exactly. A third, one trio per box (T8, period 8), is E-SPN-0119's pinned hub.
//    So a periodic array does not cascade, because its members never exchange. That is the catch.
// 2. HOW A PROBE COULD MOVE. A probe trio at P. If star(P) crosses no background line off the hubs and P, the same
//    induction closes star(P) plus the union: the probe runs exactly as in the vacuum (its difference from the
//    background run is its vacuum run's difference from the vacuum), pinned, whatever the density. If star(P) crosses a
//    background line at a dock y, a single of the probe's and a single of the background's can meet at y in one beat.
//    That is the only exchange the rule has, and it is K at y: w_P on y's 24 slots. It never hands one line across. It
//    permutes y's slots, carries the vacuum's full lines onto new lines through y (E-SPN-0119: two singles make a hub),
//    and makes y a NEW hub, whose star crosses other background stars. So each exchange adds a hub rather than moving
//    one, and the prediction is the dichotomy: pinned exactly where no line crosses, and a proliferating wake where one
//    does. A probe drifting as a unit, with the background restored behind it, is not expected at any placement.
//    Direction: the only placements that exchange are the crossing ones, so the motion, if any, is set by which of the
//    probe's lines cross the array (G4 reads it).
// 3. THE WINDOW. Side 8 is the smallest box holding a nontrivial period-4 array (side 4 holds one hub, and a probe there
//    would be its own periodic array). The probe placements are classed by how many docks star(P) adds to the crossings
//    of the union (off the hubs and P) and how many of P's lines are background lines. From each class the nearest dock
//    to X (lowest index on a tie) is taken, a fixed pattern. The probe tmp/mach-probe1 found 5 classes on side 8:
//    0 new crossings (384 docks), 4 (1,152), 12 (1,920), 24 (48), and 27 with one line shared (576).
//
// READINGS. One keyed path of the all-open rule per term (code/measure/full-key-paths, offsets 0 to 7, 'pass', Born
// threshold), 128 beats. The probe's charge excess is the joint run's vibes minus the background run's
// (code/measure/mach-background `machTrack`), its position the excess-weighted centroid, Cartesian, minimal image from P.
// "Off every single line class" is two-hub-bound's `offLine`: the distance of the centroid's displacement from beat 1
// from the nearest of the twelve line classes.
//
// GATES, fixed before the first gated run.
//  G1 the background alone is steady: on every term of T4, M4 and T8, the peak of its wake (slot and store readings
//     differing from the vacuum run) over beats 65 to 128 exceeds its peak over beats 1 to 64 by under 10%, AND its
//     footprint at beat 128 is under half the box (E-SPN-0120's clause: a wake that has filled the box has stopped
//     growing too). If G1 fails the premise fails, and G2 to G4 are not read.
//  G2 a probe moves off every line: at some placement P in some background B, the most its charge centroid moves off
//     every line class over every term and beat exceeds 100 times the same reading of the probe at P in the vacuum
//     (density 0, floored at 1e-3), AND the probe's difference from the background run holds under half the box at
//     beat 128 on every term. The second clause, fixed here: a probe that sets the whole box going is a cascade, and a
//     cascade's charge centroid wanders with its dipoles, not with a composite.
//  G3 the motion is ballistic: at a placement passing G2, the exponent of the terms' root-mean-square off-line
//     displacement against t over beats 8 to 128 is at least 0.75 (ballistic 1, diffusive 0.5).
//  G4 direction: at a placement passing G2, the anisotropy of the terms' displacements at beat 128 (the second-moment
//     tensor's traceless part over its trace) is under 0.25. The 24 roots, a spherical 5-design, give 0 exactly; motion
//     along one line class gives sqrt(3)/2 = 0.866.
//  G3 and G4 are reported at every placement and gated only where G2 holds.
// CONTROLS (a failed control or check makes the verdict partial).
//  CV the probe alone in the vacuum is pinned: at every placement and term, 0 readings off its star at every beat and
//     0 K firings off P.
//  CB the background with no probe is confined: on every term, 0 K firings off the hubs (T4 and T8); on path 0, T4's
//     difference from the vacuum lies on its 96 lines at every beat (starRun over the 16 hubs), and M4's on its meson
//     lines (planon-lines' parallelRun).
//  C0 density 0 reproduces the pinned probe: a background of no composites gives the vacuum control's track bit for
//     bit, and so does T4 at the uncrossed placement (every beat's centroid, wake and off-star readings, every term).
// CHECKS: the probe's charge excess is 3 at every beat of every run; the union of T4's stars crosses at 0 docks off the
//  hubs (the derivation's count); the recording stepper equals keyedRunner bit for bit (starRun on T4, path 0).
// Verdict: partial if a check or a control fails; fail if G1 fails (the premise); pass if G1, G2, G3 and G4 hold at one
// placement; fail otherwise.
// PROBES, disclosed (instrument only): tmp/mach-probe1-8-4.log (T4 alone, paths 0 and 1: 0 crossings off the hubs, K
// only at the 16 hubs, wake 461 and 465 at beat 64, 463 and 460 at 128, footprint about 230); tmp/mach-probe2.log (one
// probe per class, paths 0 and 1: the uncrossed probe runs exactly as in the vacuum; every crossed class fires K off the
// hubs, four of them filling 4,091 to 4,095 docks by beat 128, the 24-crossing class reaching about 1,200 to 1,550
// docks with K on 239; the probe's charge centroid in the vacuum already moves 10 to 18 off every line, since it is
// the charge's mean over three loves and the dipoles of the pairs K displaces).
//
// FIRST RUN (tmp/mach-exp-run1.log): crashed before the verdict. A local number named `control` shadowed the control
// tracks inside the grading map. It was renamed; no gate, control or threshold moved. SECOND RUN (tmp/mach-exp-run2.log,
// 75 s): FAIL on G2, every control and check passing, as derived.
//  - G1 holds. T4's wake peaks at 435, 453, 465 and 470 at beats 16, 32, 64 and 128, with peak growth 0.009 to 0.026 and
//    a footprint of at most 237 of 4,096. K fires only at the 16 hubs (443 to 507 firings per hub over 8 terms, so the
//    array is uniform), and the difference stays on the 96 union lines. M4 holds at 97 readings and T8 at 60. The
//    union crosses at 0 docks off the hubs, as derived.
//  - The uncrossed probe (class 0) runs bit for bit as it does in the vacuum in T4, M4 and T8. That is C0, and it is the
//    derived closure: the background is present and exchanges nothing with the probe.
//  - Every crossed probe in T4 or T8 CASCADES. K fires off the hubs from beats 2 to 11 and on up to 4,079 (T4) or
//    4,094 (T8) docks. The footprint reaches 4,091 to 4,096 of 4,096 at classes 4, 12 and 27, and 1,137 to 1,278 at
//    class 24. The charge centroid then wanders 150 to 1,054 off every line, with exponents 0.97 to 2.26. That is the
//    cascade's dipoles, not a probe moving, and G2's footprint clause refuses it. Even that wander stays under the
//    threshold of 1,329 to 1,944.
//  - The meson background M4 is the one real exchange that stays bounded. A crossed probe fires K off the hubs on 2 to 5
//    docks and holds a footprint of 41 to 231. Its centroid moves 20.8 to 24.5 off every line against the same placements'
//    vacuum control of 13.3 to 17.6 (1.2 to 1.6 times it), with exponents 0.17 to 0.38. So it is bounded, not ballistic.
//  - Stated plainly, the probe's charge centroid in the vacuum already moves 13 to 19 off every line. Its mean over
//    three loves and K's displaced pair dipoles gives an O(box) reading, so 100 times it cannot be reached on a side-8
//    box by anything short of motion over many boxes. On the numbers, though, the verdict does not rest on that
//    ceiling. No bounded placement moves more than 1.6 times its control, and none grows faster than t^0.38.
// Title written after the run.
//
// Depth L1: the committed rule's own terms read exactly, a derived confinement theorem, and controls that can fail.
// DETERMINISM: no random numbers; the key is integer arithmetic and every start is placed. NOTHING MOVES: every piece
// hands a value to a slot, and the stream takes it one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import {
  boxSteps,
  fullPathKey,
  meshLines,
  pathOffset,
} from '@/code/measure/full-key-paths'
import { rootIndex } from '@/code/measure/crossing-lines'
import {
  placeLoves,
  starCrossings,
  starLines,
  starRun,
} from '@/code/measure/hub-star'
import { parallelRun } from '@/code/measure/planon-lines'
import {
  lineDirections,
  offLine,
  placeVibes,
  twoHubTrack,
  type TwoHubTrack,
} from '@/code/measure/two-hub-bound'
import {
  growthExponent,
  machTrack,
  periodicHubs,
  secondMomentAnisotropy,
  type MachTrack,
} from '@/code/measure/mach-background'
import { type Configuration } from '@/code/rule/doublet-locked-knit'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { d4BoxDistanceSquared } from '@/code/substrate/d4-box-integer'

const [B, A, C] = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
].map(rootIndex) as [number, number, number]
const TRIO = [B, A, C]
const SIDE = 8
const BEATS = 128
const PERIOD = 4
const WIDE_PERIOD = 8
const PATHS = 8
const READ_PATHS = 4
const HALF = 64
const GROWTH_LIMIT = 0.1
const BOX_SHARE = 0.5
const FACTOR = 100
const CONTROL_FLOOR = 1e-3
const FIT_FROM = 8
const BALLISTIC = 0.75
const ISOTROPY = 0.25
const PROBE_CHARGE = 3
const REPORT_AT = [16, 32, 64, 128]

type Placement = { klass: number; dock: number; distance2: number }
type ProbeRead = {
  background: string
  placement: Placement
  tracks: MachTrack[]
  control: MachTrack[]
}

const sub = (u: readonly number[], v: readonly number[]): number[] =>
  u.map((x, k) => x - v[k]!)

const peakGrowth = (w: readonly number[]): number => {
  const early = Math.max(...w.slice(0, HALF))
  const late = Math.max(...w.slice(HALF, BEATS))

  return (late - early) / Math.max(1, early)
}

const sameTrack = (p: MachTrack, q: MachTrack): boolean =>
  p.wake.every((v, t) => v === q.wake[t]) &&
  p.offStar.every((v, t) => v === q.offStar[t]) &&
  p.centroid.every((c, t) => c.every((v, k) => v === q.centroid[t]![k]))

export default experiment({
  id: 'spin/mach-background',
  code: 'E-SPN-0124',
  title:
    "a pinned composite does not borrow motion from a background of matter, fail (G2): a trio array at X + 4 D4 (16 trios on side 8) is steady, because its stars cross at 0 docks off the hubs, so K fires only at the hubs (443 to 507 firings each over 8 terms) and the wake holds at 470 readings on 96 lines (peak growth under 0.026); the meson array and one trio per box are steady too; a probe whose star crosses no background line runs bit for bit as in the vacuum, pinned, at every density; a probe whose star crosses the trio array fires K off the hubs from beat 2 to 11 and cascades over 1,137 to 4,096 of 4,096 docks, a wake rather than a mover; in the meson array a crossed probe exchanges on 2 to 5 docks with a bounded footprint of 41 to 231, but its charge centroid moves only 20.8 to 24.5 off every line against 13.3 to 17.6 for the same placements in the vacuum (at most 1.6 times, against the 100 asked), growing as t^0.17 to t^0.38, not ballistically; so each exchange K makes adds a hub rather than moving one, and Pretko's dipole trade has no counterpart in this rule",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )

    // ---- the box, the vacuum, the backgrounds ----
    const X = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', X)
    const vacuum = wordVacuum(f, f.store)
    const lines = meshLines(f.tables)
    const dirs = lineDirections(f.tables, SIDE, X)
    const hubs = periodicHubs(SIDE, X, PERIOD)
    const wideHubs = periodicHubs(SIDE, X, WIDE_PERIOD)
    const target = (x: number, slot: number): number =>
      Math.floor(f.tables.target[x * 24 + slot]! / 24)
    const trios = (docks: readonly number[]): Configuration =>
      placeLoves(
        vacuum,
        docks.flatMap(h => TRIO.map(slot => ({ dock: h, slot }))),
      )
    const mesonDocks = hubs.flatMap(h => [h, target(h, B)])
    const backgrounds = [
      { name: 'T4', start: trios(hubs), hubs, paths: PATHS },
      {
        name: 'M4',
        start: placeVibes(
          vacuum,
          hubs.flatMap(h => [
            { dock: h, slot: B, vibe: 1 },
            { dock: target(h, B), slot: B, vibe: -1 },
          ]),
        ),
        hubs: mesonDocks,
        paths: READ_PATHS,
      },
      {
        name: 'T8',
        start: trios(wideHubs),
        hubs: wideHubs,
        paths: READ_PATHS,
      },
    ]
    const union = starLines(lines, hubs)
    const unionLines = union.reduce((s, v) => s + v, 0)
    const unionCrossings = starCrossings(
      f.cells,
      lines,
      union,
      hubs,
    ).length

    // ---- G1: each background alone, against the vacuum run ----
    const alone = backgrounds.map(g => ({
      name: g.name,
      hubs: g.hubs,
      runs: Array.from(
        { length: g.paths },
        (_, k): TwoHubTrack =>
          twoHubTrack({
            tables: f.tables,
            vacuum,
            start: g.start,
            hub: X,
            key: fullPathKey(pathOffset(k)),
            threshold: THRESHOLD_BORN,
            beats: BEATS,
            side: SIDE,
          }),
      ),
    }))
    const steady = (r: TwoHubTrack): boolean =>
      peakGrowth(r.wake) < GROWTH_LIMIT &&
      r.footprint[BEATS - 1]! < BOX_SHARE * f.cells
    const G1 = alone.every(g => g.runs.every(steady))

    log('backgrounds')

    // ---- CB ----
    const offHubFirings = (g: (typeof alone)[number]): number =>
      g.runs.reduce(
        (n, r) =>
          n + r.events.filter(e => !g.hubs.includes(e.dock)).length,
        0,
      )
    const confinedT4 = starRun({
      tables: f.tables,
      vacuum,
      start: backgrounds[0]!.start,
      lines,
      hub: hubs,
      key: fullPathKey(0),
      threshold: THRESHOLD_BORN,
      beats: BEATS,
      side: SIDE,
    })
    const mesonLines = [
      ...new Set(hubs.map(h => lines.lineOf[h * 24 + B]!)),
    ]
    const confinedM4 = parallelRun({
      tables: f.tables,
      vacuum,
      start: backgrounds[1]!.start,
      lines,
      set: mesonLines,
      key: fullPathKey(0),
      threshold: THRESHOLD_BORN,
      beats: BEATS,
      steps: boxSteps(f.cells, SIDE, X),
      factor: false,
    })
    const CB =
      offHubFirings(alone[0]!) === 0 &&
      offHubFirings(alone[2]!) === 0 &&
      confinedT4.offStar === 0 &&
      confinedT4.offHub === 0 &&
      confinedM4.off === 0

    log('CB')

    // ---- the placements: one per crossing class, nearest to X ----
    const classes = new Map<number, Placement>()

    for (let P = 0; P < f.cells; P++) {
      if (hubs.includes(P)) {
        continue
      }

      const added =
        starCrossings(f.cells, lines, starLines(lines, [...hubs, P]), [
          ...hubs,
          P,
        ]).length - unionCrossings
      const shared = LINE_FIRSTS.filter(
        d => union[lines.lineOf[P * 24 + d]!],
      ).length
      const klass = added * 100 + shared
      const distance2 = d4BoxDistanceSquared({ a: X, b: P, side: SIDE })
      const best = classes.get(klass)

      if (best === undefined || distance2 < best.distance2) {
        classes.set(klass, { klass, dock: P, distance2 })
      }
    }

    const placements = [...classes.values()].sort(
      (p, q) => p.klass - q.klass,
    )

    log('placements')

    // ---- the probe runs ----
    const track = (
      background: Configuration,
      bgHubs: readonly number[],
      P: number,
      k: number,
    ): MachTrack =>
      machTrack({
        tables: f.tables,
        background,
        start: placeLoves(
          background,
          TRIO.map(slot => ({ dock: P, slot })),
        ),
        lines,
        hubs: bgHubs,
        probe: P,
        key: fullPathKey(pathOffset(k)),
        threshold: THRESHOLD_BORN,
        beats: BEATS,
        side: SIDE,
      })
    const controls = new Map(
      placements.map(p => [
        p.dock,
        Array.from({ length: PATHS }, (_, k) =>
          track(vacuum, [], p.dock, k),
        ),
      ]),
    )
    const reads: ProbeRead[] = []
    const skipped: string[] = []

    for (const g of backgrounds) {
      for (const p of placements) {
        if (g.hubs.includes(p.dock)) {
          skipped.push(`${g.name}@${p.klass}`)
          continue
        }

        reads.push({
          background: g.name,
          placement: p,
          tracks: Array.from({ length: g.paths }, (_, k) =>
            track(g.start, g.hubs, p.dock, k),
          ),
          control: controls.get(p.dock)!,
        })
      }

      log(`probes ${g.name}`)
    }

    // ---- G2, G3, G4 ----
    const offTrack = (r: MachTrack): number[] =>
      r.centroid.map(c => offLine(sub(c, r.centroid[0]!), dirs))
    const most = (rs: readonly MachTrack[]): number =>
      Math.max(...rs.map(r => Math.max(...offTrack(r))))
    const rmsOff = (rs: readonly MachTrack[]): number[] =>
      Array.from({ length: BEATS }, (_, t) =>
        Math.sqrt(
          rs.reduce((s, r) => s + offTrack(r)[t]! ** 2, 0) / rs.length,
        ),
      )
    const graded = reads.map(r => {
      const reading = most(r.tracks)
      const controlReading = most(r.control.slice(0, r.tracks.length))
      const threshold = FACTOR * Math.max(controlReading, CONTROL_FLOOR)
      const bounded = r.tracks.every(
        t => t.footprint[BEATS - 1]! < BOX_SHARE * f.cells,
      )
      const moves = reading > threshold && bounded
      const exponent = growthExponent(rmsOff(r.tracks), FIT_FROM, BEATS)
      const anisotropy = secondMomentAnisotropy(
        r.tracks.map(t => sub(t.centroid[BEATS - 1]!, t.centroid[0]!)),
      )
      const offHubDocks = Math.max(...r.tracks.map(t => t.offHubDocks))
      const firstOff = Math.min(
        ...r.tracks
          .map(t => t.offStar.findIndex(v => v > 0) + 1)
          .map(v => (v === 0 ? BEATS + 1 : v)),
      )

      return {
        ...r,
        reading,
        controlReading,
        threshold,
        bounded,
        moves,
        exponent,
        anisotropy,
        offHubDocks,
        firstOff,
        footprint: r.tracks.map(t => t.footprint[BEATS - 1]!),
      }
    })
    const movers = graded.filter(r => r.moves)
    const G2 = G1 && movers.length > 0
    const G3 = G2 && movers.some(r => r.exponent >= BALLISTIC)
    const G4 =
      G2 &&
      movers.some(
        r => r.exponent >= BALLISTIC && r.anisotropy < ISOTROPY,
      )

    // ---- CV, C0 ----
    const allControls = [...controls.values()].flat()
    const CV = allControls.every(
      r => r.offStar.every(v => v === 0) && r.offHubEvents === 0,
    )
    const empty = trios([])
    const uncrossed = placements.find(p => p.klass === 0)
    const densityZero =
      uncrossed === undefined
        ? false
        : Array.from({ length: PATHS }, (_, k) =>
            sameTrack(
              track(empty, [], uncrossed.dock, k),
              controls.get(uncrossed.dock)![k]!,
            ),
          ).every(Boolean)
    const uncrossedT4 = graded.find(
      r => r.background === 'T4' && r.placement.klass === 0,
    )
    const C0 =
      densityZero &&
      (uncrossedT4?.tracks.every((t, k) =>
        sameTrack(t, uncrossedT4.control[k]!),
      ) ??
        false)

    // ---- checks ----
    const everyTrack = [
      ...allControls,
      ...graded.flatMap(r => r.tracks),
    ]
    const chargeKept = everyTrack.every(r =>
      r.charge.every(q => q === PROBE_CHARGE),
    )
    const checks = {
      charge: chargeKept,
      unionCrossings: unionCrossings === 0,
      stepper: confinedT4.stepperDiffer === 0,
    }
    const checked = Object.values(checks).every(Boolean)
    const controlled = CV && CB && C0
    const status =
      !checked || !controlled
        ? 'partial'
        : !G1
          ? 'fail'
          : G2 && G3 && G4
            ? 'pass'
            : 'fail'

    // ---- read, not gated: how uniform the background's hubs are (T4's K firings per hub, over its terms) ----
    const perHub = hubs.map(h =>
      alone[0]!.runs.reduce(
        (n, r) => n + r.events.filter(e => e.dock === h).length,
        0,
      ),
    )

    log('graded')

    const metrics: Record<string, number> = {
      G1: G1 ? 1 : 0,
      G2: G2 ? 1 : 0,
      G3: G3 ? 1 : 0,
      G4: G4 ? 1 : 0,
      control_CV: CV ? 1 : 0,
      control_CB: CB ? 1 : 0,
      control_C0: C0 ? 1 : 0,
      cells: f.cells,
      hubs: hubs.length,
      unionLines,
      unionCrossings,
      placements: placements.length,
      movers: movers.length,
      maxPeakGrowth: Math.max(
        ...alone.flatMap(g => g.runs.map(r => peakGrowth(r.wake))),
      ),
      maxBackgroundFootprint: Math.max(
        ...alone.flatMap(g => g.runs.map(r => r.footprint[BEATS - 1]!)),
      ),
      t4OffHubFirings: offHubFirings(alone[0]!),
      t8OffHubFirings: offHubFirings(alone[2]!),
      m4OffLines: confinedM4.off,
      t4OffUnion: confinedT4.offStar,
      stepperDiffer: confinedT4.stepperDiffer,
      perHubMinK: Math.min(...perHub),
      perHubMaxK: Math.max(...perHub),
      maxControlOffLine: Math.max(...graded.map(r => r.controlReading)),
      seconds: (Date.now() - started) / 1000,
    }

    for (const g of alone) {
      REPORT_AT.forEach(
        t =>
          (metrics[`${g.name}Wake_${t}`] = Math.max(
            ...g.runs.map(r => r.wake[t - 1]!),
          )),
      )
    }

    for (const r of graded) {
      const tag = `${r.background}_${r.placement.klass}`

      metrics[`${tag}_reading`] = r.reading
      metrics[`${tag}_threshold`] = r.threshold
      metrics[`${tag}_minFootprint`] = Math.min(...r.footprint)
      metrics[`${tag}_maxFootprint`] = Math.max(...r.footprint)
      metrics[`${tag}_offHubDocks`] = r.offHubDocks
      metrics[`${tag}_firstOffStar`] = r.firstOff
      metrics[`${tag}_exponent`] = r.exponent
      metrics[`${tag}_anisotropy`] = r.anisotropy
    }

    const perPlacement = graded
      .map(
        r =>
          `${r.background} class ${r.placement.klass} (P ${r.placement.dock}, |P - X|^2 ${r.placement.distance2}): off-line ${r.reading.toFixed(2)} vs ${r.threshold.toFixed(1)}, footprint ${Math.min(...r.footprint)} to ${Math.max(...r.footprint)}, K off hubs on up to ${r.offHubDocks} docks, first off-star beat ${r.firstOff}, exponent ${r.exponent.toFixed(3)}, anisotropy ${r.anisotropy.toFixed(3)}${r.moves ? ', MOVES' : ''}`,
      )
      .join('; ')
    const aloneRead = alone
      .map(
        g =>
          `${g.name}: peak growth ${Math.min(...g.runs.map(r => peakGrowth(r.wake))).toFixed(4)} to ${Math.max(...g.runs.map(r => peakGrowth(r.wake))).toFixed(4)}, wake ${REPORT_AT.map(t => Math.max(...g.runs.map(r => r.wake[t - 1]!))).join('/')}, footprint ${Math.max(...g.runs.map(r => r.footprint[BEATS - 1]!))}`,
      )
      .join('; ')

    return verdict({
      status,
      claim: `a trio probe in a background of matter on the side-8 box (16 trios at X + 4 D4, 16 mesons, or one trio): the backgrounds alone are steady (G1 ${G1}); the union of the trio array's stars crosses at ${unionCrossings} docks off its hubs; ${movers.length} of ${graded.length} placements move off every line by 100 times the vacuum control with a bounded wake (G2 ${G2}, G3 ${G3}, G4 ${G4})`,
      metrics,
      control: {
        maxControlOffLine: metrics.maxControlOffLine!,
        t4OffHubFirings: metrics.t4OffHubFirings!,
        t4OffUnion: confinedT4.offStar,
      },
      notes: `L1. G1 ${G1} (${aloneRead}); G2 ${G2}, G3 ${G3}, G4 ${G4}; CV ${CV}, CB ${CB}, C0 ${C0} (density zero ${densityZero}); checks ${JSON.stringify(checks)}. Union: ${unionLines} lines, ${unionCrossings} crossings off the hubs. T4 K firings per hub over ${PATHS} terms: ${perHub.join(',')}. Placements: ${perPlacement}. Skipped (probe on a background dock): ${skipped.join(', ') || 'none'}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
