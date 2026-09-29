// IS THE DOUBLET-LOCKED KNIT CHIRAL? (E-FRC-0248) The theory, and its exact checks: which of P, C, T, CP, CPT the
// locked rule (code/rule/doublet-locked-knit, adopted 2026-09-26) keeps, and whether the lock's handedness is physical.
//
// THE QUESTION. The lock sets a moving vibe's copy direction from its role's doublet, so a moving vibe carries a doublet
// label along its motion, and a head-on love and fear pass without meeting (E-SPN-0072). That is the shape of a
// left-handed coupling. Is it one?
//
// P ON THE HUSK (code/measure/locked-parity). The husk is the column-sum shadow of the D4 box along the depth x4, so a
// husk point map is a signed permutation of the husk axes, lifted to the bulk with the depth kept or reversed. Both
// lifts read the same on every husk observable (a column sum does not see the order down its column). Of the 96 lifts,
// 48 reverse the husk's orientation: 24 are bulk reflections and 24 are bulk ROTATIONS. On a configuration: dock x to
// g x, slot d to g d, a store's orientation flipped where g sends its line's first slot to a second slot, a role point
// p to pi(p) for a chosen bijection pi of the grid (the lift to the roles), the links carried and conjugated by pi, the
// amplitudes untouched (a LINEAR P). C negates every vibe and store. T = K S R: every slot to its opposite on its dock
// (R), one stream (S), every amplitude conjugated (K).
//
// THEOREMS (proved here in words, each checked below).
//  T1 THE LOCK'S LABEL IS POLAR. On a line, the lock's label is the slot's side (the first slot holds e0, the +1 vector
//     of the line's doublet generator, the second e1, the -1 vector), and the step it is copied by is the side again,
//     for a love and for a fear under C (locked-token-line stepTable). So the label read along the motion is +1 on every
//     slot for both charges: a constant of the configuration. A husk map carries slot d to slot g d, where it is +1
//     again. The label transforms exactly as the direction of motion does, so it is a POLAR label and its "helicity"
//     cannot be parity-odd. Read instead as an AXIAL spin (the conjugate representation's spin is -conj(sigma), so a
//     fear's physical spin is minus its label), the lock gives loves helicity +1 and fears -1 under C (+1 and +1 under
//     C'): the V-A shape, with CP even, and consistent with E-SPN-0072's singlet overlaps (0 under C, 1/3 under C').
//     But the axial parity is not a map of the knit's states into themselves: it would put a vibe on a slot with the
//     other label, which the lock does not have. The knit holds no spin apart from its slot, so the axial and polar
//     readings name one state space, and the question is decided by whether a LINEAR slot map commutes with the rule.
//  T2 P IS KEPT, EVERY LIFT. The beat is S C_t M (meeting, collision, stream). S is a translation along the root and
//     commutes with every box automorphism that carries the links. The collision (the pair move and the lone bounce B)
//     commutes with all 1,152 coin maps of W(F4) (code/rule/bounce-pair-knit), with the store's orientation carried by
//     the side sign; checked here on the whole momentum table and on sampled docks. M reads only like or unlike, point
//     EQUALITY and which two slots, and is symmetric in them, so it commutes with every slot map that keeps lines and
//     every point bijection. So the rule commutes with all 48 husk parities, both bulk lifts, with any point lift that
//     normalizes the grid moves.
//  T3 C, T, CP, CPT ARE KEPT. C: every piece reads charge only through like or unlike and b = -a. T: T U_0 T = U_1^-1
//     needs M^dagger to commute with the collision; M acts only on full like lines, the collision carries full lines to
//     full lines with both vibes and never makes or unmakes a like pair, so it does; K is needed because M is complex
//     (M is symmetric, so M* = M^dagger = M^-1). CP and CPT are products of kept maps.
//  T4 THE ONLY P THAT FAILS IS A RELABELING. The antilinear P (the linear P times K) carries M to M^-1, so it fails
//     wherever a like meeting splits; it differs from the kept P only by complex conjugation, which is part of T. So no
//     husk-orientation-reversing symmetry is missing, and no parity-odd observable can have a nonzero expectation from
//     a P-symmetric start.
//  T5 THE DEPTH. A husk parity lifts to a bulk rotation (with the depth reversed), so any bulk rule covariant under the
//     W(F4) rotations keeps husk parity whatever it does to bulk reflections: bulk chirality does not reach the husk.
//     A husk chirality needs a rule that breaks the depth-reversing rotations, one that tells deeper from shallower.
//
// GATES, fixed before this file's first run. Probe run first, disclosed: tmp/par-probe1 (one start: the locked runs
// covariant under both inversions, 0 of 48 beats off; the twist toy off on 48 of 48; the fixed turn covariant). Side-4
// box, the coset-union vacuum, E-MTH-0028's 17 link starts.
//  L1  the husk point group: 96 lifts, each a slot permutation and an automorphism of the side-4 box; 48 husk parities,
//      24 bulk reflections and 24 bulk rotations
//  L2  the collision's covariance: the momentum table w_(gP) = g w_P g^-1 under all 96 lifts, 0 mismatches over every
//      key; the lone bounce B on 4,096 silver-rate docks under all 96, 0 mismatches
//  L3  the label: label along the motion +1 on 24 of 24 slots for a love and a fear under C and on every image slot of
//      the 48 parities; axial reading love +1, fear -1 under C, fear +1 under C' (counts)
//  L4  P exact: the superposing state (E-RLT-0097's L8 start) under all 48 husk parities with the identity point lift,
//      24 beats, and under the two husk inversions 48 beats: the mirrored run equals the mirror of the run, every branch
//      and amplitude, 0 beats off, on 17 of 17
//  L5  the point lift does not matter: the two inversions with the anti-symplectic lift (x, y) -> (x, -y), links
//      conjugated, 48 beats, 0 off, 17 of 17
//  L6  C exact: 48 beats, 0 off, 17 of 17
//  L7  T exact: T^2 = 1 and T(psi_(t+1)) = U_(t+1)^-1 T(psi_t) at every beat of the 48, 17 of 17
//  L8  CP (inversion, depth kept, then C) and CPT (C, inversion, T, carried to the mirrored links) exact, 17 of 17
//  Controls, PREDICTED to fail or to hold as stated:
//  C1  the antilinear P fails on every start whose run splits (T4)
//  C2  the linear T (no conjugation) fails on every start whose run splits (T3's K)
//  C3  the chiral twist toy is exactly reversible (48 beats back to the start) and fails P under both inversions on
//      17 of 17, and the inversion carries its run exactly onto the left twist's run of the mirrored start
//  C4  the fixed turn about x3 keeps both inversions exactly and fails the mirror x1 -> -x1, 17 of 17
// Verdict: pass if L1 to L8 hold and C1 to C4 read as predicted; fail otherwise.
//
// FIRST RUN (74 s, tmp/frc0248-run1.log): pass, no gate moved. L1 96 lifts, 48 parities (24 bulk reflections, 24 bulk
// rotations); L2 0 mismatches over 14,281 keys x 96 lifts and 393,216 sampled docks; L3 as stated; L4 to L8 0 beats off
// on 17 of 17 (at most 5 branches); C1 the antilinear P off on 47 of 48 beats, C2 the linear T on 46 of 48, C3 the twist
// toy off on 48 of 48 under both inversions, reversible, and its mirror exactly the left twist, C4 the fixed turn 0 off
// under both inversions and 48 of 48 off under the x1 mirror. Every number is the same on the 17 starts: the checks are
// exact identities of the rule, and E-FRC-0249's readings show the starts themselves differ. Title written after the run.
//
// DETERMINISM: no random numbers; starts are E-MTH-0028's family; sampled docks come from the silver rate in integers.
// The rule is exact in Z[w]; every comparison here is exact. Depth L1 (theorems, exhaustive or exact on the rule).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { momentumKey } from '@/code/rule/isometric-knit'
import {
  bouncePermutation,
  BOUNCE_TABLE,
} from '@/code/rule/bounce-pair-knit'
import {
  lockedBeat,
  lockedBeatBack,
  lockedState,
  lockedTables,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  lockedFresh,
  vacuumConfiguration,
  SILVER_RATE,
  type LockedFresh,
} from '@/code/measure/doublet-locked-readings'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  axialAlongMotion,
  axisSlot,
  chargeConjugate,
  chiralTwist,
  conjugateState,
  FLIP_POINTS,
  fixedTurn,
  huskInversion,
  huskMaps,
  labelAlongMotion,
  linearMotionReversal,
  mapState,
  mirrorConfiguration,
  mirrorLinks,
  mirrorOf,
  motionReversal,
  sameState,
  superposingStart,
  toyBeat,
  toyBeatBack,
  type DockTurn,
  type HuskMap,
  type Mirror,
} from '@/code/measure/locked-parity'

const BOX = 4
const BEATS = 48
const SHORT = 24
const SAMPLES = 4096

// ---- L1, L2 ----
function groupFacts(maps: HuskMap[]): {
  lifts: number
  automorphisms: number
  parities: number
  bulkReflections: number
  bulkRotations: number
} {
  const parities = maps.filter(m => m.huskDet === -1)

  let automorphisms = 0

  for (const m of maps) {
    try {
      mirrorOf(m, BOX)
      automorphisms++
    } catch {
      // counted as missing
    }
  }

  return {
    lifts: maps.length,
    automorphisms,
    parities: parities.length,
    bulkReflections: parities.filter(m => m.bulkDet === -1).length,
    bulkRotations: parities.filter(m => m.bulkDet === 1).length,
  }
}

function tableCovariance(maps: HuskMap[]): {
  keys: number
  mismatches: number
} {
  let keys = 0
  let mismatches = 0

  for (let key = 0; key < 13 ** 4; key++) {
    const p = [0, 1, 2, 3].map(
      k => (Math.floor(key / 13 ** k) % 13) - 6,
    )

    if ((p[0]! + p[1]! + p[2]! + p[3]!) % 2 !== 0) {
      continue
    }

    keys++

    const w = BOUNCE_TABLE[key]

    for (const m of maps) {
      const gp = m.matrix.map(row =>
        row.reduce((s, v, k) => s + v * p[k]!, 0),
      )
      const wg = BOUNCE_TABLE[momentumKey(gp)]

      if (!w || !wg) {
        if (!w !== !wg) {
          mismatches++
        }

        continue
      }

      // w_(gP)(g d) = g w_P(d)
      for (let d = 0; d < 24; d++) {
        if (wg[m.slots[d]!] !== m.slots[w[d]!]) {
          mismatches++
        }
      }
    }
  }

  return { keys, mismatches }
}

function loneCovariance(maps: HuskMap[]): {
  checks: number
  mismatches: number
} {
  const a = new Int32Array(24)
  const b = new Int32Array(24)
  const occ = new Int8Array(24)
  const img = new Int8Array(24)

  let checks = 0
  let mismatches = 0

  for (let n = 0; n < SAMPLES; n++) {
    const threshold = ((n % 4) + 1) * 13107

    for (let d = 0; d < 24; d++) {
      occ[d] =
        ((n * 24 + d + 1) * SILVER_RATE) % 65536 < threshold ? 1 : 0
    }

    const ka = bouncePermutation(BOUNCE_TABLE, 'lone', occ, 0, a)

    if (ka === 0) {
      for (let d = 0; d < 24; d++) {
        a[d] = d
      }
    }

    for (const m of maps) {
      for (let d = 0; d < 24; d++) {
        img[m.slots[d]!] = occ[d]!
      }

      const kb = bouncePermutation(BOUNCE_TABLE, 'lone', img, 0, b)

      if (kb === 0) {
        for (let d = 0; d < 24; d++) {
          b[d] = d
        }
      }

      checks++

      let off = kb !== ka

      for (let d = 0; d < 24 && !off; d++) {
        off = b[m.slots[d]!] !== m.slots[a[d]!]
      }

      if (off) {
        mismatches++
      }
    }
  }

  return { checks, mismatches }
}

// ---- L3 ----
function labelFacts(maps: HuskMap[]): {
  labelPlus: number
  imagePlus: number
  images: number
  axialLove: number
  axialFearC: number
  axialFearCprime: number
} {
  const sign = (kind: 'love' | 'fear'): number =>
    kind === 'love' ? 1 : -1
  const along = (
    kind: 'love' | 'fear',
    convention: 'C' | 'Cprime',
    d: number,
  ): number => labelAlongMotion(sign(kind), d, convention)

  let labelPlus = 0
  let imagePlus = 0

  for (let d = 0; d < 24; d++) {
    labelPlus +=
      along('love', 'C', d) === 1 && along('fear', 'C', d) === 1 ? 1 : 0
  }

  for (const m of maps) {
    for (let d = 0; d < 24; d++) {
      imagePlus +=
        along('love', 'C', m.slots[d]!) === along('love', 'C', d) &&
        along('fear', 'C', m.slots[d]!) === along('fear', 'C', d)
          ? 1
          : 0
    }
  }

  const axial = (
    kind: 'love' | 'fear',
    convention: 'C' | 'Cprime',
    d: number,
  ): number => axialAlongMotion(sign(kind), d, convention)

  const constant = (
    kind: 'love' | 'fear',
    convention: 'C' | 'Cprime',
  ): number => {
    const v = axial(kind, convention, 0)

    return Array.from({ length: 24 }, (_, d) =>
      axial(kind, convention, d),
    ).every(x => x === v)
      ? v
      : 0
  }

  return {
    labelPlus,
    imagePlus,
    images: maps.length * 24,
    axialLove: constant('love', 'C'),
    axialFearC: constant('fear', 'C'),
    axialFearCprime: constant('fear', 'Cprime'),
  }
}

// ---- runs ----
type Run = { tables: LockedTables; states: LockedState[] }

function trajectory(
  tables: LockedTables,
  start: Configuration,
  beats: number,
  turn?: DockTurn,
): Run {
  const states: LockedState[] = [lockedState(start)]

  for (let t = 0; t < beats; t++) {
    const s = states[t]!

    states.push(
      turn ? toyBeat(tables, s, t, turn) : lockedBeat(tables, s, t),
    )
  }

  return { tables, states }
}

// beats (1 .. beats) at which the image of run a differs from run b
function offBeats(
  a: Run,
  b: Run,
  image: (s: LockedState) => LockedState,
  beats: number,
): number {
  let off = 0

  for (let t = 1; t <= beats; t++) {
    if (!sameState(image(a.states[t]!), b.states[t]!)) {
      off++
    }
  }

  return off
}

function mirrored(
  f: LockedFresh,
  m: Mirror,
  start: Configuration,
  beats: number,
  turn?: DockTurn,
): Run {
  return trajectory(
    lockedTables(
      f.weave,
      'lone',
      mirrorLinks(m, f.weave.links, f.weave.moves),
    ),
    mirrorConfiguration(m, start),
    beats,
    turn,
  )
}

// T-type check: theta(psi_(t+1)) = U'_(t+1)^-1 theta(psi_t), U' the beat of `back`'s tables
function reversalOff(
  run: Run,
  theta: (s: LockedState) => LockedState,
  back: LockedTables,
): number {
  let off = 0

  for (let t = 0; t + 1 < run.states.length; t++) {
    const lhs = theta(run.states[t + 1]!)
    const rhs = lockedBeatBack(back, theta(run.states[t]!), t + 1)

    if (!sameState(lhs, rhs)) {
      off++
    }
  }

  return off
}

type StartReading = {
  name: string
  splits: number
  pAll: number
  pInversion: number[]
  pFlip: number[]
  c: number
  tSquare: number
  t: number
  cp: number
  cpt: number
  antilinearP: number
  linearT: number
  twistBack: boolean
  twistOff: number[]
  twistToLeft: number[]
  fixedInversion: number[]
  fixedMirrorX1: number
}

function perStart(name: string, parities: HuskMap[]): StartReading {
  const f = lockedFresh(BOX)
  const vac = vacuumConfiguration(f, 'none')
  const sup = superposingStart(f.tables, f.weave, vac)

  if (!sup) {
    throw new Error(`no superposing start on ${name}`)
  }

  const base = trajectory(f.tables, sup, BEATS)
  const splits = Math.max(...base.states.map(s => s.branches.length))
  const inversions = [false, true].map(depth =>
    mirrorOf(huskInversion(depth), BOX),
  )
  const image = (m: Mirror) => (s: LockedState) =>
    mapState(s, c => mirrorConfiguration(m, c))

  // L4: all 48 parities over SHORT beats, the inversions over all BEATS
  let pAll = 0

  for (const g of parities) {
    const m = mirrorOf(g, BOX)

    pAll += offBeats(base, mirrored(f, m, sup, SHORT), image(m), SHORT)
  }

  const pInversion = inversions.map(m =>
    offBeats(base, mirrored(f, m, sup, BEATS), image(m), BEATS),
  )

  // L5: the anti-symplectic point lift
  const pFlip = [false, true].map(depth => {
    const m = mirrorOf(huskInversion(depth), BOX, FLIP_POINTS)

    return offBeats(base, mirrored(f, m, sup, BEATS), image(m), BEATS)
  })

  // L6: C
  const cRun = trajectory(f.tables, chargeConjugate(sup), BEATS)
  const c = offBeats(
    base,
    cRun,
    s => mapState(s, chargeConjugate),
    BEATS,
  )

  // L7: T
  const theta = (s: LockedState): LockedState =>
    motionReversal(f.tables, s)

  let tSquare = 0

  for (const s of base.states) {
    if (!sameState(theta(theta(s)), s)) {
      tSquare++
    }
  }

  const t = reversalOff(base, theta, f.tables)

  // L8: CP and CPT (inversion with the depth kept)
  const inv = inversions[0]!
  const cpImage = (s: LockedState): LockedState =>
    mapState(s, cfg => chargeConjugate(mirrorConfiguration(inv, cfg)))
  const cpRun = trajectory(
    lockedTables(
      f.weave,
      'lone',
      mirrorLinks(inv, f.weave.links, f.weave.moves),
    ),
    chargeConjugate(mirrorConfiguration(inv, sup)),
    BEATS,
  )
  const cp = offBeats(base, cpRun, cpImage, BEATS)
  const invTables = lockedTables(
    f.weave,
    'lone',
    mirrorLinks(inv, f.weave.links, f.weave.moves),
  )
  const cpt = reversalOff(base, s => cpImage(theta(s)), invTables)

  // C1: the antilinear P; C2: the linear T
  const antilinearP = offBeats(
    base,
    mirrored(f, inv, sup, BEATS),
    s => conjugateState(image(inv)(s)),
    BEATS,
  )
  const linearT = reversalOff(
    base,
    s => linearMotionReversal(f.tables, s),
    f.tables,
  )

  // C3: the chiral twist toy on a lone love
  const lone: Configuration = {
    ...vac,
    vibe: Int8Array.from(vac.vibe),
    point: Int8Array.from(vac.point),
  }

  lone.vibe[axisSlot()] = 1

  const right = chiralTwist(1)
  const left = chiralTwist(-1)
  const toy = trajectory(f.tables, lone, BEATS, right)

  let back = toy.states[BEATS]!

  for (let k = BEATS - 1; k >= 0; k--) {
    back = toyBeatBack(f.tables, back, k, left)
  }

  const twistBack = sameState(back, lockedState(lone))
  const twistOff = inversions.map(m =>
    offBeats(toy, mirrored(f, m, lone, BEATS, right), image(m), BEATS),
  )
  const twistToLeft = inversions.map(m =>
    offBeats(toy, mirrored(f, m, lone, BEATS, left), image(m), BEATS),
  )

  // C4: the fixed turn
  const fixed = fixedTurn(1)
  const fixedRun = trajectory(f.tables, lone, BEATS, fixed)
  const fixedInversion = inversions.map(m =>
    offBeats(
      fixedRun,
      mirrored(f, m, lone, BEATS, fixed),
      image(m),
      BEATS,
    ),
  )
  const x1 = huskMaps().find(g => g.name === '[-x1,+x2,+x3,+x4]')!
  const mx1 = mirrorOf(x1, BOX)
  const fixedMirrorX1 = offBeats(
    fixedRun,
    mirrored(f, mx1, lone, BEATS, fixed),
    image(mx1),
    BEATS,
  )

  return {
    name,
    splits,
    pAll,
    pInversion,
    pFlip,
    c,
    tSquare,
    t,
    cp,
    cpt,
    antilinearP,
    linearT,
    twistBack,
    twistOff,
    twistToLeft,
    fixedInversion,
    fixedMirrorX1,
  }
}

export default experiment({
  id: 'gauge/locked-parity-ledger',
  code: 'E-FRC-0248',
  title:
    "the doublet-locked knit is not chiral, pass: it keeps P under all 48 husk parities (24 bulk reflections and 24 bulk rotations, the two lifts the husk cannot tell apart) with any role-point lift, and C, T, CP and CPT, every branch and amplitude exact over 48 beats on 17 of 17 starts; the lock's label along the motion is +1 on every slot for a love and a fear (a polar label), and read as an axial spin it has the V-A shape (love +1, fear -1 under C, +1 under C'), but the knit holds no spin apart from its slot, so that reading is a relabeling: the only P that fails is the antilinear one (47 of 48 beats off), which differs from the kept P by the conjugation T already carries; the linear T fails (46 of 48), a planted chiral twist fails P on 48 of 48 beats with its mirror exactly the left twist, and a fixed quarter turn keeps both inversions and fails the x1 mirror",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const maps = huskMaps()
    const parities = maps.filter(m => m.huskDet === -1)
    const l1 = groupFacts(maps)
    const table = tableCovariance(maps)
    const lone = loneCovariance(maps)
    const l3 = labelFacts(parities)

    console.error(
      `L1 to L3 ${Math.round((Date.now() - started) / 1000)}s`,
    )

    const family = startFamily(16)
    const runs = family.map(member =>
      withStart(member, () => {
        const r = perStart(member.name, parities)

        console.error(
          `start ${member.name} ${Math.round((Date.now() - started) / 1000)}s`,
        )

        return r
      }),
    )
    const all = (p: (r: StartReading) => boolean): number =>
      runs.filter(p).length
    const n = family.length
    const zero = (xs: number[]): boolean => xs.every(x => x === 0)

    const gL1 =
      l1.lifts === 96 &&
      l1.automorphisms === 96 &&
      l1.parities === 48 &&
      l1.bulkReflections === 24 &&
      l1.bulkRotations === 24
    const gL2 =
      table.mismatches === 0 &&
      lone.mismatches === 0 &&
      lone.checks === SAMPLES * 96
    const gL3 =
      l3.labelPlus === 24 &&
      l3.imagePlus === l3.images &&
      l3.axialLove === 1 &&
      l3.axialFearC === -1 &&
      l3.axialFearCprime === 1
    const nL4 = all(r => r.pAll === 0 && zero(r.pInversion))
    const nL5 = all(r => zero(r.pFlip))
    const nL6 = all(r => r.c === 0)
    const nL7 = all(r => r.tSquare === 0 && r.t === 0)
    const nL8 = all(r => r.cp === 0 && r.cpt === 0)
    const split = runs.filter(r => r.splits > 1)
    const nC1 = split.filter(r => r.antilinearP > 0).length
    const nC2 = split.filter(r => r.linearT > 0).length
    const nC3 = all(
      r =>
        r.twistBack &&
        r.twistOff.every(x => x > 0) &&
        zero(r.twistToLeft),
    )
    const nC4 = all(r => zero(r.fixedInversion) && r.fixedMirrorX1 > 0)
    const theory =
      gL1 &&
      gL2 &&
      gL3 &&
      nL4 === n &&
      nL5 === n &&
      nL6 === n &&
      nL7 === n &&
      nL8 === n
    const controls =
      split.length > 0 &&
      nC1 === split.length &&
      nC2 === split.length &&
      nC3 === n &&
      nC4 === n
    const status = theory && controls ? 'pass' : 'fail'
    const range = (xs: number[]): string =>
      Math.min(...xs) === Math.max(...xs)
        ? `${Math.min(...xs)}`
        : `${Math.min(...xs)} to ${Math.max(...xs)}`

    return verdict({
      status,
      claim: `the doublet-locked knit keeps P under all 48 husk parities (24 bulk reflections, 24 bulk rotations) with any point lift, and C, T, CP, CPT, exactly on ${nL4} of ${n} starts; the lock's label along the motion is +1 on every slot for both charges (a polar label), read as an axial spin it is love +1, fear -1 under C (the V-A shape), but no linear slot map is missing, so the handedness is a relabeling; the antilinear P fails (${nC1} of ${split.length}), the chiral twist toy fails P (${all(r => r.twistOff.every(x => x > 0))} of ${n}) and the fixed turn keeps it`,
      metrics: {
        gateL1: gL1 ? 1 : 0,
        gateL2: gL2 ? 1 : 0,
        gateL3: gL3 ? 1 : 0,
        gateL4: nL4,
        gateL5: nL5,
        gateL6: nL6,
        gateL7: nL7,
        gateL8: nL8,
        starts: n,
        lifts: l1.lifts,
        parities: l1.parities,
        bulkReflections: l1.bulkReflections,
        bulkRotations: l1.bulkRotations,
        tableKeys: table.keys,
        tableMismatches: table.mismatches,
        loneChecks: lone.checks,
        loneMismatches: lone.mismatches,
        labelPlusSlots: l3.labelPlus,
        axialLove: l3.axialLove,
        axialFearC: l3.axialFearC,
        axialFearCprime: l3.axialFearCprime,
        pOffTotal: runs.reduce(
          (s, r) => s + r.pAll + r.pInversion[0]! + r.pInversion[1]!,
          0,
        ),
        branchesMax: Math.max(...runs.map(r => r.splits)),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        gateC1: nC1,
        gateC2: nC2,
        gateC3: nC3,
        gateC4: nC4,
        splittingStarts: split.length,
        antilinearPOffMin: Math.min(...split.map(r => r.antilinearP)),
        linearTOffMin: Math.min(...split.map(r => r.linearT)),
        twistOffMin: Math.min(...runs.flatMap(r => r.twistOff)),
        fixedMirrorX1OffMin: Math.min(
          ...runs.map(r => r.fixedMirrorX1),
        ),
      },
      notes: `L1. Gates: L1 ${gL1} (${JSON.stringify(l1)}), L2 ${gL2} (table ${JSON.stringify(table)}, lone ${JSON.stringify(lone)}), L3 ${gL3} (${JSON.stringify(l3)}), L4 ${nL4}, L5 ${nL5}, L6 ${nL6}, L7 ${nL7}, L8 ${nL8} of ${n}; C1 ${nC1} and C2 ${nC2} of ${split.length} splitting starts, C3 ${nC3}, C4 ${nC4} of ${n}. Per start (branches max; P off over 48 parities x ${SHORT} beats, inversions; flip lift; C; T^2, T; CP, CPT; antilinear P, linear T; twist back, off, onto left; fixed inversions, x1 mirror): ${runs.map(r => `${r.name} ${r.splits}; ${r.pAll}, ${r.pInversion.join('/')}; ${r.pFlip.join('/')}; ${r.c}; ${r.tSquare}, ${r.t}; ${r.cp}, ${r.cpt}; ${r.antilinearP}, ${r.linearT}; ${r.twistBack}, ${r.twistOff.join('/')}, ${r.twistToLeft.join('/')}; ${r.fixedInversion.join('/')}, ${r.fixedMirrorX1}`).join(' | ')}. Antilinear P off ${range(split.map(r => r.antilinearP))}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
