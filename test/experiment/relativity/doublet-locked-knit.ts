// THE DOUBLET-LOCKED KNIT (E-RLT-0097): the adopted knit with every vibe's copy set by its role's doublet, the user's
// decision of 2026-09-26, built in code/rule/doublet-locked-knit and proved to reduce to the old knit and, on one line,
// to the locked token.
//
// THE BUILD, in one paragraph (the rule file's header has the derivation). A slot is one side of a line, and the stream
// copies the line's first slot forward and its second back, so the slot within a line already IS a two-valued copy
// label. The lock says which label a vibe holds: its role's doublet component on that line (E-SPN-0081's generator, +1
// forward, -1 back, 0 on the role's scalar line). Read in the vibe's comoving frame (a fixed frame would make the copy
// direction depend on the color frame at a dock), links never mix the two labels. The stream, the lone-bounce collision
// and the pair move are the old ones. The one new piece is the meeting of two vibes on one line: a love and a fear hold
// opposite labels, which under the chosen convention C are orthogonal to Phi, so the knit's meeting is the identity; two
// loves (or two fears) meet by 2U, which keeps the occupation and keeps (1 + w)/2, weight 1/4) or exchanges (-(1 - w)/2,
// weight 3/4) the two vibes' points, a phase w where the points agree. The state is a sum of classical configurations with
// amplitudes in Z[w] over powers of 2.
//
// DECIDED, WITH THE REASON: THE STREAM IS NOT LAZY. E-MTR-0023's lazy token copies the light's fraction by a coin that is
// the reflection about the column's uniform state, Q R = 2J - Q with Q = 9 (2D + 1) ports. Two facts rule out combining
// it with this lock. (1) That coin has no zero entry, so no configuration is a single term after one beat: a lazy stream
// has no classical sector, and the knit would lose every classical result at once. (2) A covariant coin commutes with a
// husk line's units, which act on the moving doublet irreducibly and on a resting port trivially, so by Schur it cannot
// move amplitude between them: the lazy mechanism (trading moving for resting ports) is forbidden to a coin that keeps
// the lock. So the knit's vibes copy whole, and one light speed is not gained (E-RLT-0098 reads it).
//
// THE COORDINATOR'S POINT (E-SPN-0083, E-RLT-0096), ANSWERED. A spin-steered copy (one doublet read on several lines at
// once) needs an order, fixed by E-SPN-0079's T = 0. This lock is SLOT-steered: each vibe copies along the one line its
// slot is on, so the per-line copies move disjoint slots and commute; the ordering term T is 0 identically at period one,
// with no order chosen. The spin-steered alternative has no classical sector (the axis generators anticommute, so no role
// is an eigenvector of two), so it cannot reduce to the old knit. Checked here (L2, L10). The price: the spin does not
// enter a lone vibe's band. E-RLT-0096's charge blindness is kept: every piece but the meeting is the old knit's, and the
// meeting reads only "like or unlike", which charge conjugation keeps.
//
// Gates, fixed before this file's first run. Probes run first, disclosed: tmp/dl-probe1 (the vacuum's full lines: at
// side 8, 7,680 like meetings per three beats, all with unequal points), dl-probe2 (one exchange changes the occupation
// at the next beat: 960 of 960 at side 4, 240 of 240 sampled at side 8), dl-probe3 (the doublet's stabilizer states and
// the lock's Wigner weights), dl-probe4 to 6 (the mechanics: the old knit reproduced, the flat all-open run one term,
// paths, twirls, a superposing run with exact norm and reversal).
//  L1  the lock is the old stream: on the side-8 box, a first-slot label copied by +r and a second-slot label by -r (box
//      arithmetic from the D4 root) land where the old stream's target puts them, on every slot; the meeting maps the
//      four doublet label pairs into doublet label pairs (nothing ever enters the rest state)
//  L2  order-free: the twelve per-line copies composed in three orders (line order, reversed, a silver-rate order) equal
//      the one-permutation stream on a filled configuration, every slot (T = 0 identically)
//  L3  a love and a fear: 3V = 3 + (w - 1) J_Phi is the identity on both opposite-label pairs under C, and not under C'
//      (where a love and a fear on one line hold the same label)
//  L4  two loves or two fears: 2U gives (1 + w) and (1 - w) on every label pair (i != j), 2 on (i, i), with
//      |1 + w|^2 + |1 - w|^2 = 4; the occupation form keeps (1 + w)/2, exchanges -(1 - w)/2, and is w on equal points;
//      the 2 x 2 meeting matrix is symmetric (so motion reversal, the conjugate, is its inverse) and the same for two
//      loves and two fears (charge conjugation keeps it)
//  L5  with no open vibe the locked rule equals the old kernel (code/measure/bounce-pair-kernel) bit for bit: the
//      coset-union vacuum, side 8, 96 beats, on every start of E-MTH-0028's 17
//  L6  the classical sector with every vibe open: flat links and one point for every unit make every like meeting an
//      equal-point one, and the all-open state stays ONE configuration equal to the old kernel's bit for bit, amplitude
//      w^m (m like meetings), side 4 and side 8, 48 beats
//  L7  on one line it is the locked token with its coin removed: LINE_STEP = locked-token-line stepTable for a love and
//      a fear under C; the meeting equals lockedMeetingOnly on every two-token label state at one dock, exactly (two
//      loves, two fears, a love and a fear); the knit's collision keeps a lone vibe's slot (all 24 slots: no coin, so
//      massless) and flips a full line's two (the locked bounce FLIP)
//  L8  exact superposition: the two vacuum vibes of the first like meeting with unequal points, opened, 48 beats on the
//      side-4 union vacuum: the norm is exact at every beat and the exact inverse returns amplitude 1 on the start; on
//      every start of the 17
//  L9  not lazy: Q R = 2J - Q has no zero entry at D = 1 to 16; the coin twirl over each husk axis's units sends every
//      doublet-scalar entry to 0 (under 1e-12)
//  L10 spin-steered has no classical sector: the three husk-axis stream generators anticommute pairwise and vanish on
//      the scalar line (under 1e-12)
//  P1  the physical reading, PREDICTED from dl-probe1 and 2: with every vibe open, the side-4 coset-union vacuum holds
//      like meetings with unequal points in its first period (beats 1 to 3) on every start, and each one exchanged alone
//      changes the occupation within 2 beats: the vacuum is not in the classical sector of the all-open rule
// Verdict: pass if L1 to L10 hold and P1 holds as predicted; fail otherwise.
//
// FIRST RUN (18 s, tmp/rlt097-run1.log): pass, no gate moved, every number identical over the 17 starts. L1 0 of
// 98,304 slots off; L2 0 off over 3 orders; L3 identity under C, acting under C'; L4 exact; L5 0 mismatches on 17 of 17;
// L6 one configuration, 7,680 (side 4) and 122,880 (side 8) equal-point meetings, amplitude 1 (both counts divisible by
// 3); L7 27 of 27 two-token states, 24 of 24 lone slots kept, 12 of 12 full lines flipped; L8 88 splits, at most 5
// branches, 3 distinct occupations at beat 48, norm and reversal exact on 17 of 17; L9 and L10 exactly 0; P1 480
// unequal-point and 0 equal-point like meetings in the first period, 480 of 480 exchanges changing the occupation. Title
// written after the run.
//
// DETERMINISM: no random numbers; starts are E-MTH-0028's family; fills and orders are silver-rate Weyl sequences in
// integers. The rule is exact in Z[w]; the twirls and the doublet readings are floats (measurement). Depth L1 for the
// theorems (L1 to L4, L7, L9, L10: exhaustive or exact), L2 for the rule's runs. Husk first where there is a husk
// number: L1 and L5 to L8 are bulk identities of the rule and hold on every husk column by being bulk identities.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import {
  bouncePermutation,
  BOUNCE_TABLE,
} from '@/code/rule/bounce-pair-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  d4BoxCell,
  d4BoxCoordinates,
  d4Coordinates,
} from '@/code/substrate/d4-box'
import {
  bounceRunner,
  makeBounceKernel,
} from '@/code/measure/bounce-pair-kernel'
import { hubVacuum } from '@/code/measure/causal-components'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  lockedMeetingOnly,
  lockedPairState,
  lockedIndex,
  stepTable,
} from '@/code/rule/locked-token-line'
import {
  LINE_STEP,
  lineMeeting,
  lockedBeat,
  lockedBeatBack,
  lockedNorm,
  lockedState,
  lockedTables,
  newTally,
  streamConfiguration,
  cloneConfiguration,
  type Configuration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import {
  axisGenerator,
  axisTwirl,
  basisOperator,
  idRun,
  lockedFresh,
  multiply3,
  pathRunner,
  sameOccupation,
  vacuumConfiguration,
  SILVER_RATE,
} from '@/code/measure/doublet-locked-readings'

const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f]!)
const ROOTS = rootsD4()

// Eisenstein product
const mul = (
  x: bigint,
  y: bigint,
  u: bigint,
  v: bigint,
): [bigint, bigint] => [x * u - y * v, x * v + y * u - y * v]

// ---- L1 ----
function lockIsStream(side: number): {
  slots: number
  mismatches: number
} {
  const f = lockedFresh(side)

  let mismatches = 0

  for (let x = 0; x < f.cells; x++) {
    const c = d4BoxCoordinates({ cell: x, side })

    for (let l = 0; l < 12; l++) {
      const r = d4Coordinates([...ROOTS[LINE_FIRSTS[l]!]!])

      for (const label of [0, 1]) {
        const step = LINE_STEP[label]!
        const to = d4BoxCell({
          coordinates: c.map((v, k) => v + step * r[k]!),
          side,
        })
        const slot =
          x * 24 + (label === 0 ? LINE_FIRSTS[l]! : LINE_SECONDS[l]!)
        const expected =
          to * 24 + (label === 0 ? LINE_FIRSTS[l]! : LINE_SECONDS[l]!)

        mismatches += f.tables.target[slot] === expected ? 0 : 1
      }
    }
  }

  return { slots: f.cells * 24, mismatches }
}

// ---- L2: the per-line copies in three orders ----
function orderFree(side: number): {
  orders: number
  mismatches: number
} {
  const f = lockedFresh(side)
  const slots = f.cells * 24
  const fill: Configuration = vacuumConfiguration(f, 'none')

  for (let i = 0; i < slots; i++) {
    const u = ((i + 1) * SILVER_RATE) % 65536

    fill.vibe[i] = u < 13107 ? -1 : u < 52429 ? 0 : 1
    fill.point[i] = (((i + 3) * SILVER_RATE) % 65536) % 9
  }

  const whole = cloneConfiguration(fill)

  streamConfiguration(f.tables, whole, false)

  const byLine = (order: number[]): Configuration => {
    // each line's copy moves only that line's slots; the others are left for their own copy
    let c = cloneConfiguration(fill)

    const moved = new Uint8Array(slots)

    for (const l of order) {
      const next = cloneConfiguration(c)

      for (let i = 0; i < slots; i++) {
        if (LINE_OF[i % 24] !== l || moved[i]) {
          continue
        }

        next.vibe[i] = 0
      }

      for (let i = 0; i < slots; i++) {
        if (LINE_OF[i % 24] !== l || moved[i]) {
          continue
        }

        const v = c.vibe[i]!

        if (v === 0) {
          continue
        }

        const to = f.tables.target[i]!

        next.vibe[to] = v
        next.point[to] = f.tables.move[i * 9 + c.point[i]!]!
      }

      for (let i = 0; i < slots; i++) {
        if (LINE_OF[i % 24] === l) {
          moved[i] = 1
        }
      }

      c = next
    }

    return c
  }

  const orders = [
    Array.from({ length: 12 }, (_, l) => l),
    Array.from({ length: 12 }, (_, l) => 11 - l),
    Array.from({ length: 12 }, (_, l) => l).sort(
      (a, b) =>
        (((a + 1) * SILVER_RATE) % 65536) -
        (((b + 1) * SILVER_RATE) % 65536),
    ),
  ]

  let mismatches = 0

  for (const order of orders) {
    const c = byLine(order)

    for (let i = 0; i < slots; i++) {
      if (
        c.vibe[i] !== whole.vibe[i] ||
        (c.vibe[i] !== 0 && c.point[i] !== whole.point[i])
      ) {
        mismatches++
      }
    }
  }

  return { orders: orders.length, mismatches }
}

// ---- L3, L4: the meeting in integers ----
function meetingChecks(): {
  unlikeIdentityC: boolean
  unlikeActsCprime: boolean
  likeTerms: boolean
  unitary: boolean
  symmetric: boolean
  chargeBlind: boolean
} {
  // 3V |ij> = 3|ij> + (w - 1) [i = j] sum_k |kk>, labels of (love, fear) on the first and second slots
  const threeV = (
    i: number,
    j: number,
  ): Map<string, [bigint, bigint]> => {
    const out = new Map<string, [bigint, bigint]>([
      [`${i}${j}`, [3n, 0n]],
    ])

    if (i === j) {
      for (let k = 0; k < 3; k++) {
        const key = `${k}${k}`
        const [a, b] = out.get(key) ?? [0n, 0n]

        out.set(key, [a - 1n, b + 1n])
      }
    }

    return out
  }

  const isIdentity = (
    m: Map<string, [bigint, bigint]>,
    i: number,
    j: number,
  ): boolean =>
    [...m.entries()].every(([key, [a, b]]) =>
      key === `${i}${j}` ? a === 3n && b === 0n : a === 0n && b === 0n,
    )
  // under C a love on the first slot holds label 0 and a fear on the second label 1 (and the other way round)
  const cPairs: [number, number][] = [
    [0, 1],
    [1, 0],
  ]
  // under C' the fear's labels are reversed: a love on the first (0) and a fear on the second (0)
  const cprimePairs: [number, number][] = [
    [0, 0],
    [1, 1],
  ]
  const unlikeIdentityC = cPairs.every(([i, j]) =>
    isIdentity(threeV(i, j), i, j),
  )
  const unlikeActsCprime = cprimePairs.every(
    ([i, j]) => !isIdentity(threeV(i, j), i, j),
  )

  let likeTerms = true

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const t = lineMeeting(true, i, j)

      likeTerms =
        likeTerms &&
        (i === j
          ? t.length === 1 && t[0]![2] === 2n && t[0]![3] === 0n
          : t.length === 2 &&
            t[0]![0] === i &&
            t[0]![2] === 1n &&
            t[0]![3] === 1n &&
            t[1]![0] === j &&
            t[1]![2] === 1n &&
            t[1]![3] === -1n)
    }
  }

  const n = (a: bigint, b: bigint): bigint => a * a - a * b + b * b
  const unitary = n(1n, 1n) + n(1n, -1n) === 4n
  // the occupation form: keep (1 + w), exchange -(1 - w) = (-1 + w), symmetric by construction; its adjoint is the
  // entrywise conjugate, conj(a + b w) = (a - b) - b w, and M M^dagger = 4 exactly
  const keep: [bigint, bigint] = [1n, 1n]
  const exch: [bigint, bigint] = [-1n, 1n]
  const conj = (z: [bigint, bigint]): [bigint, bigint] => [
    z[0] - z[1],
    -z[1],
  ]
  const add = (
    p: [bigint, bigint],
    q: [bigint, bigint],
  ): [bigint, bigint] => [p[0] + q[0], p[1] + q[1]]
  const d = add(
    mul(...keep, ...conj(keep)),
    mul(...exch, ...conj(exch)),
  )
  const off = add(
    mul(...keep, ...conj(exch)),
    mul(...exch, ...conj(keep)),
  )
  const symmetric =
    d[0] === 4n && d[1] === 0n && off[0] === 0n && off[1] === 0n
  // charge blindness: the meeting reads only whether the vibes are like; lineMeeting takes no sign
  const chargeBlind =
    lineMeeting(true, 0, 1).length === 2 &&
    lineMeeting(false, 0, 1).length === 1

  return {
    unlikeIdentityC,
    unlikeActsCprime,
    likeTerms,
    unitary,
    symmetric,
    chargeBlind,
  }
}

// ---- L5 ----
function bookkeepingReduction(side: number, beats: number): number {
  const f = lockedFresh(side)
  const kernel = makeBounceKernel(f.weave, 'lone')
  const old = bounceRunner(
    kernel,
    hubVacuum({ cells: f.cells, store: f.store, layout: f.layout }),
  )

  let s = lockedState(vacuumConfiguration(f, 'none'))
  let mismatches = 0

  for (let t = 0; t < beats; t++) {
    old.beat()
    s = lockedBeat(f.tables, s, t)

    const a = old.state()
    const b = s.branches[0] as Configuration

    if (s.branches.length !== 1) {
      mismatches++
    }

    for (let i = 0; i < a.vibe.length; i++) {
      if (
        a.vibe[i] !== b.vibe[i] ||
        (a.vibe[i] !== 0 && a.point[i] !== b.point[i])
      ) {
        mismatches++
      }
    }

    for (let i = 0; i < a.store.length; i++) {
      if (
        a.store[i] !== b.store[i] ||
        (a.store[i] !== 0 && a.spoint[i] !== b.spoint[i])
      ) {
        mismatches++
      }
    }
  }

  return mismatches
}

// ---- L6 ----
function classicalSector(
  side: number,
  beats: number,
): {
  branchesMax: number
  mismatches: number
  like: number
  phase: number
  split: number
  amplitude: string
  expected: string
} {
  const f = lockedFresh(side)
  const flat = new Int16Array(f.cells * 24).fill(f.weave.moves.identity)
  const tables = lockedTables(f.weave, 'lone', flat)
  const uniform = new Int8Array(f.cells * 12)
  const kernel = makeBounceKernel(f.weave, 'lone', 'alternate', flat)
  const old = bounceRunner(
    kernel,
    hubVacuum({ cells: f.cells, store: f.store, layout: uniform }),
  )
  const tally = newTally()

  let s = lockedState(vacuumConfiguration(f, 'all', uniform))
  let branchesMax = 1
  let mismatches = 0

  for (let t = 0; t < beats; t++) {
    old.beat()
    s = lockedBeat(tables, s, t, tally)
    branchesMax = Math.max(branchesMax, s.branches.length)

    const a = old.state()
    const b = s.branches[0] as Configuration

    for (let i = 0; i < a.vibe.length; i++) {
      if (
        a.vibe[i] !== b.vibe[i] ||
        (a.vibe[i] !== 0 && a.point[i] !== b.point[i])
      ) {
        mismatches++
      }
    }

    for (let i = 0; i < a.store.length; i++) {
      if (a.store[i] !== b.store[i]) {
        mismatches++
      }
    }
  }

  const b = s.branches[0]!
  // w^m: w^0 = 1, w^1 = w, w^2 = -1 - w
  const m = tally.phaseMeetings % 3
  const expected = m === 0 ? '1,0,0' : m === 1 ? '0,1,0' : '-1,-1,0'

  return {
    branchesMax,
    mismatches,
    like: tally.likeMeetings,
    phase: tally.phaseMeetings,
    split: tally.splitMeetings,
    amplitude: `${b.a},${b.b},${b.k}`,
    expected,
  }
}

// ---- L7: one line ----
function oneLine(): {
  stepsMatch: boolean
  meetingStates: number
  meetingMismatches: number
  loneKeeps: number
  fullFlips: number
} {
  const stepsMatch = (['love', 'fear'] as const).every(kind =>
    stepTable(kind, 'C').every((s, j) => s === LINE_STEP[j]),
  )

  let meetingStates = 0
  let meetingMismatches = 0

  for (const kinds of [
    ['love', 'love'],
    ['fear', 'fear'],
    ['love', 'fear'],
  ] as const) {
    for (let j1 = 0; j1 < 3; j1++) {
      for (let j2 = 0; j2 < 3; j2++) {
        const ring = 3
        const s = lockedPairState(
          {
            ring,
            kinds: [kinds[0], kinds[1]],
            convention: 'C',
            unlike: 'knit',
          },
          [{ index: lockedIndex(ring, 0, 0, j1, j2), a: 1n, b: 0n }],
        )

        lockedMeetingOnly(s)

        const expected = new Map<number, [bigint, bigint]>()

        for (const [k1, k2, a, b] of lineMeeting(
          kinds[0] === kinds[1],
          j1,
          j2,
        )) {
          const idx = lockedIndex(ring, 0, 0, k1, k2)
          const [pa, pb] = expected.get(idx) ?? [0n, 0n]

          expected.set(idx, [pa + a, pb + b])
        }

        meetingStates++

        for (let i = 0; i < s.a.length; i++) {
          const [ea, eb] = expected.get(i) ?? [0n, 0n]

          if (s.a[i] !== ea || s.b[i] !== eb) {
            meetingMismatches++
            break
          }
        }
      }
    }
  }

  const perm = new Int32Array(24)

  let loneKeeps = 0
  let fullFlips = 0

  for (let d = 0; d < 24; d++) {
    const vibe = new Int8Array(24)

    vibe[d] = 1
    bouncePermutation(BOUNCE_TABLE, 'lone', vibe, 0, perm)

    // a zero return leaves perm stale: read the identity then
    const kind = bouncePermutation(BOUNCE_TABLE, 'lone', vibe, 0, perm)

    loneKeeps += kind === 0 || perm[d] === d ? 1 : 0
  }

  for (let l = 0; l < 12; l++) {
    const vibe = new Int8Array(24)
    const i = LINE_FIRSTS[l]!
    const j = LINE_SECONDS[l]!

    vibe[i] = 1
    vibe[j] = 1

    const kind = bouncePermutation(BOUNCE_TABLE, 'lone', vibe, 0, perm)

    fullFlips += kind !== 0 && perm[i] === j && perm[j] === i ? 1 : 0
  }

  return {
    stepsMatch,
    meetingStates,
    meetingMismatches,
    loneKeeps,
    fullFlips,
  }
}

// ---- L8: a superposing run ----
type Superposition = {
  found: boolean
  normExact: boolean
  reversed: boolean
  branchesMax: number
  splits: number
  occupations: number
}

function superposing(beats: number): Superposition {
  const f = lockedFresh(4)
  const all = new Map<number, [number, number]>()

  for (let line = 0; line < f.store.length; line++) {
    if (f.store[line] !== 0) {
      all.set(line, [2 * line, 2 * line + 1])
    }
  }

  const r = idRun(
    f.tables,
    f.weave,
    vacuumConfiguration(f, 'none'),
    all,
  )

  let pick: [number, number] | undefined

  for (let t = 0; t < 12 && !pick; t++) {
    const c = r.state()
    const ids = r.ids()

    for (let x = 0; x < f.cells && !pick; x++) {
      for (let l = 0; l < 12 && !pick; l++) {
        const i = x * 24 + LINE_FIRSTS[l]!
        const j = x * 24 + LINE_SECONDS[l]!

        if (
          c.vibe[i] !== 0 &&
          c.vibe[i] === c.vibe[j] &&
          c.point[i] !== c.point[j] &&
          ids[i]! >= 0 &&
          ids[j]! >= 0
        ) {
          pick = [ids[i]!, ids[j]!]
        }
      }
    }

    r.beat()
  }

  if (!pick) {
    return {
      found: false,
      normExact: false,
      reversed: false,
      branchesMax: 0,
      splits: 0,
      occupations: 0,
    }
  }

  const start = vacuumConfiguration(f, 'none')

  for (const id of pick) {
    start.sopen[id >> 1] = start.sopen[id >> 1]! | (1 << (id & 1))
  }

  let s: LockedState = lockedState(start)

  const tally = newTally()

  let normExact = true
  let branchesMax = 1

  for (let t = 0; t < beats; t++) {
    s = lockedBeat(f.tables, s, t, tally)

    const n = lockedNorm(s)

    normExact = normExact && n.total === n.unit
    branchesMax = Math.max(branchesMax, s.branches.length)
  }

  const occupations: Configuration[] = []

  for (const b of s.branches) {
    if (!occupations.some(o => sameOccupation(o, b))) {
      occupations.push(b)
    }
  }

  let back = s

  for (let t = beats - 1; t >= 0; t--) {
    back = lockedBeatBack(f.tables, back, t)
  }

  const b0 = back.branches[0]
  const reversed =
    back.branches.length === 1 &&
    !!b0 &&
    b0.a === 1n &&
    b0.b === 0n &&
    b0.k === 0 &&
    sameOccupation(b0, start)

  return {
    found: true,
    normExact,
    reversed,
    branchesMax,
    splits: tally.splitMeetings,
    occupations: occupations.length,
  }
}

// ---- L9, L10 ----
function lazyAndSpin(): {
  qrNonzero: boolean
  schurWorst: number
  anticommuteWorst: number
  lineWorst: number
} {
  let qrNonzero = true

  for (let D = 1; D <= 16; D++) {
    const Q = 9 * (2 * D + 1)

    // Q R = 2 J - Q: the diagonal 2 - Q, the off-diagonal 2
    qrNonzero = qrNonzero && 2 - Q !== 0
  }

  let schurWorst = 0

  for (let axis = 0; axis < 3; axis++) {
    for (const e of [2, 5, 6, 7]) {
      for (const imaginary of [false, true]) {
        const y = axisTwirl(axis, false, basisOperator(e, imaginary))

        for (const k of [2, 5, 6, 7]) {
          schurWorst = Math.max(
            schurWorst,
            Math.hypot(y.re[k]!, y.im[k]!),
          )
        }
      }
    }
  }

  const g = [0, 1, 2].map(a => axisGenerator(a))

  let anticommuteWorst = 0
  let lineWorst = 0

  for (let a = 0; a < 3; a++) {
    for (const k of [2, 5, 6, 7, 8]) {
      lineWorst = Math.max(
        lineWorst,
        Math.hypot(g[a]!.re[k]!, g[a]!.im[k]!),
      )
    }

    for (let b = a + 1; b < 3; b++) {
      const p = multiply3(g[a]!, g[b]!)
      const q = multiply3(g[b]!, g[a]!)

      for (let i = 0; i < 9; i++) {
        anticommuteWorst = Math.max(
          anticommuteWorst,
          Math.hypot(p.re[i]! + q.re[i]!, p.im[i]! + q.im[i]!),
        )
      }
    }
  }

  return { qrNonzero, schurWorst, anticommuteWorst, lineWorst }
}

// ---- P1: the all-open vacuum is not in the classical sector ----
function sensitivity(): {
  meetings: number
  equal: number
  changed: number
} {
  const f = lockedFresh(4)
  const keep = pathRunner(f.tables, vacuumConfiguration(f, 'all'), 0)
  const history: Configuration[] = [cloneConfiguration(keep.state())]

  for (let t = 0; t < 6; t++) {
    keep.beat()
    history.push(cloneConfiguration(keep.state()))
  }

  let meetings = 0
  let equal = 0
  let changed = 0

  for (let t0 = 1; t0 <= 3; t0++) {
    const s = history[t0]!

    for (let x = 0; x < f.cells; x++) {
      for (let l = 0; l < 12; l++) {
        const i = x * 24 + LINE_FIRSTS[l]!
        const j = x * 24 + LINE_SECONDS[l]!

        if (s.vibe[i] === 0 || s.vibe[i] !== s.vibe[j]) {
          continue
        }

        if (s.point[i] === s.point[j]) {
          equal++
          continue
        }

        meetings++

        const p = cloneConfiguration(s)
        const a = p.point[i]!

        p.point[i] = p.point[j]!
        p.point[j] = a

        const run = pathRunner(f.tables, p, 0, t0)

        let differs = false

        for (let k = 0; k < 2 && !differs; k++) {
          run.beat()
          differs = !sameOccupation(run.state(), history[t0 + k + 1]!)
        }

        changed += differs ? 1 : 0
      }
    }
  }

  return { meetings, equal, changed }
}

export default experiment({
  id: 'relativity/doublet-locked-knit',
  code: 'E-RLT-0097',
  title:
    "the doublet-locked knit, pass: every vibe's copy set by its role's doublet, read on the line its slot lies on in its comoving frame, is the old stream slot for slot (98,304 of 98,304) and order-free (the per-line copies move disjoint slots, so the ordering term is 0 with no order chosen); the one new piece is the meeting: a love and a fear hold opposite labels, orthogonal to Phi under C, so they meet as the identity, and two like vibes keep (weight 1/4) or exchange (3/4) their points, a phase w where the points agree; with no open vibe it is the old knit bit for bit (17 of 17 starts, side 8, 96 beats), all-open on flat links with one point it stays one configuration with amplitude w^m (7,680 and 122,880 meetings), on one line it is the locked token with its coin removed (massless), and a superposing run keeps its norm and reverses exactly (17 of 17); not lazy (the lazy coin has no zero entry, and Schur forbids a covariant coin to trade the moving doublet for a resting scalar); a spin-steered copy has no classical sector (the axis generators anticommute); all-open, the coset-union vacuum is NOT in the classical sector: its 480 unequal-point like meetings per period on side 4 each change the occupation at the next beat through the neutral veto (480 of 480, 17 of 17)",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const l1 = lockIsStream(8)
    const l2 = orderFree(8)
    const l34 = meetingChecks()

    log('L1 to L4')

    const l6 = [4, 8].map(side => classicalSector(side, 48))
    const l7 = oneLine()
    const l910 = lazyAndSpin()

    log('L6 L7 L9 L10')

    const family = startFamily(16)
    const perStart = family.map(member =>
      withStart(member, () => {
        const l5 = bookkeepingReduction(8, 96)
        const l8 = superposing(48)
        const p1 = sensitivity()

        log(`start ${member.name}`)

        return { name: member.name, l5, l8, p1 }
      }),
    )

    const gL1 = l1.mismatches === 0
    const gL2 = l2.mismatches === 0
    const gL3 = l34.unlikeIdentityC && l34.unlikeActsCprime
    const gL4 =
      l34.likeTerms && l34.unitary && l34.symmetric && l34.chargeBlind
    const gL5 = perStart.every(p => p.l5 === 0)
    const gL6 = l6.every(
      r =>
        r.branchesMax === 1 &&
        r.mismatches === 0 &&
        r.split === 0 &&
        r.amplitude === r.expected &&
        r.phase === r.like &&
        r.like > 0,
    )
    const gL7 =
      l7.stepsMatch &&
      l7.meetingMismatches === 0 &&
      l7.loneKeeps === 24 &&
      l7.fullFlips === 12
    const gL8 = perStart.every(
      p =>
        p.l8.found &&
        p.l8.normExact &&
        p.l8.reversed &&
        p.l8.splits > 0,
    )
    const gL9 = l910.qrNonzero && l910.schurWorst < 1e-12
    const gL10 = l910.anticommuteWorst < 1e-12 && l910.lineWorst < 1e-12
    const gP1 = perStart.every(
      p => p.p1.meetings > 0 && p.p1.changed === p.p1.meetings,
    )
    const status =
      gL1 &&
      gL2 &&
      gL3 &&
      gL4 &&
      gL5 &&
      gL6 &&
      gL7 &&
      gL8 &&
      gL9 &&
      gL10 &&
      gP1
        ? 'pass'
        : 'fail'
    const range = (xs: number[]): string =>
      Math.min(...xs) === Math.max(...xs)
        ? `${Math.min(...xs)}`
        : `${Math.min(...xs)} to ${Math.max(...xs)}`

    return verdict({
      status,
      claim: `the doublet-locked knit built: the lock is the old stream slot for slot (${l1.mismatches} of ${l1.slots} off), order-free (${l2.mismatches} off over ${l2.orders} orders), a love and a fear meet as the identity under C, two like vibes keep (1/4) or exchange (3/4) their points; with no open vibe it is the old knit bit for bit on ${perStart.filter(p => p.l5 === 0).length} of ${family.length} starts, and all-open on flat links with one point it stays one configuration (amplitude w^m); on one line it is the locked token with its coin removed; exact superposition (norm and reversal) on ${perStart.filter(p => p.l8.normExact && p.l8.reversed).length} of ${family.length}; not lazy (Schur ${l910.schurWorst.toExponential(1)}); spin-steered copies anticommute (${l910.anticommuteWorst.toExponential(1)}); all-open, the vacuum's ${range(perStart.map(p => p.p1.meetings))} unequal-point like meetings per period each change the occupation (${range(perStart.map(p => p.p1.changed))})`,
      metrics: {
        gateL1: gL1 ? 1 : 0,
        gateL2: gL2 ? 1 : 0,
        gateL3: gL3 ? 1 : 0,
        gateL4: gL4 ? 1 : 0,
        gateL5: perStart.filter(p => p.l5 === 0).length,
        gateL6: gL6 ? 1 : 0,
        gateL7: gL7 ? 1 : 0,
        gateL8: perStart.filter(
          p =>
            p.l8.found &&
            p.l8.normExact &&
            p.l8.reversed &&
            p.l8.splits > 0,
        ).length,
        gateL9: gL9 ? 1 : 0,
        gateL10: gL10 ? 1 : 0,
        gateP1: perStart.filter(
          p => p.p1.meetings > 0 && p.p1.changed === p.p1.meetings,
        ).length,
        starts: family.length,
        lockSlots: l1.slots,
        lockMismatches: l1.mismatches,
        orderMismatches: l2.mismatches,
        flatLike4: l6[0]?.like ?? 0,
        flatLike8: l6[1]?.like ?? 0,
        flatBranchesMax: Math.max(...l6.map(r => r.branchesMax)),
        flatMismatches: l6.reduce((s, r) => s + r.mismatches, 0),
        lineMeetingStates: l7.meetingStates,
        lineMeetingMismatches: l7.meetingMismatches,
        loneKeeps: l7.loneKeeps,
        fullFlips: l7.fullFlips,
        superposeSplitsMin: Math.min(...perStart.map(p => p.l8.splits)),
        superposeBranchesMax: Math.max(
          ...perStart.map(p => p.l8.branchesMax),
        ),
        superposeOccupationsMax: Math.max(
          ...perStart.map(p => p.l8.occupations),
        ),
        schurWorst: l910.schurWorst,
        anticommuteWorst: l910.anticommuteWorst,
        generatorLineWorst: l910.lineWorst,
        vacuumUnequalLikeMin: Math.min(
          ...perStart.map(p => p.p1.meetings),
        ),
        vacuumEqualLikeMax: Math.max(...perStart.map(p => p.p1.equal)),
        vacuumChangedMin: Math.min(...perStart.map(p => p.p1.changed)),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        unlikeActsUnderCprime: l34.unlikeActsCprime ? 1 : 0,
        bookkeepingMismatchesTotal: perStart.reduce(
          (s, p) => s + p.l5,
          0,
        ),
      },
      notes: `L2 (L1 for the theorems). Gates: L1 ${gL1}, L2 ${gL2}, L3 ${gL3} (identity under C ${l34.unlikeIdentityC}, acts under C' ${l34.unlikeActsCprime}), L4 ${gL4} (${JSON.stringify(l34)}), L5 ${perStart.filter(p => p.l5 === 0).length} of ${family.length}, L6 ${gL6} (${JSON.stringify(l6)}), L7 ${gL7} (${JSON.stringify(l7)}), L8 ${perStart.filter(p => p.l8.normExact && p.l8.reversed).length} of ${family.length}, L9 ${gL9}, L10 ${gL10} (${JSON.stringify(l910)}), P1 ${perStart.filter(p => p.p1.changed === p.p1.meetings && p.p1.meetings > 0).length} of ${family.length}. Per start (L5 mismatches; L8 splits, branches max, occupations at beat 48, norm, reversal; P1 unequal-point like meetings, equal-point, changed): ${perStart.map(p => `${p.name} ${p.l5}; ${p.l8.splits}, ${p.l8.branchesMax}, ${p.l8.occupations}, ${p.l8.normExact}, ${p.l8.reversed}; ${p.p1.meetings}, ${p.p1.equal}, ${p.p1.changed}`).join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
