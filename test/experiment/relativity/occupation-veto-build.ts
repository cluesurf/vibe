// A veto the exchange cannot see: what the like meeting keeps, and two vetoes built on it (E-RLT-0100). The rule is
// code/rule/occupation-veto-knit; its header has the derivation.
//
// THE PROBLEM (E-RLT-0098). Under the doublet lock two like vibes on one line keep (1/4) or exchange (3/4) their grid
// points. The neutral veto refuses to unmake a love and a fear with unequal points, so on an exchanged term a returning
// pair reads a foreign point and is refused, and the coset-union vacuum melts.
//
// WHAT THE LIKE MEETING KEEPS (derived, then checked exhaustively as T1). The meeting's two terms, (1 + w)/2 on the
// kept points and -(1 - w)/2 on the exchanged ones, give U = w P_sym + P_anti on the two points. So it keeps exactly:
// the occupation (every vibe trit and store trit, so love minus fear, count, occupation momentum), the unordered pair of
// points on its line (so the multisets of love points and of fear points at its dock), the antisymmetric part of the
// two registers, and the symmetric part up to the phase w (equal points, the support of the Phi pairing). It keeps no
// single vibe's point.
//
// THE TWO CANDIDATES, each the fewest parts that reads only what is kept:
//   A, 'occupation'  the pair move acts only in a NEUTRAL DOCK (every line's charge 0). Reads trits only.
//   B, 'pairing'     the pair move acts only in a dock whose love points and fear points agree as multisets, slots and
//                    stores together (the dock's vibes Phi-paired love to fear, up to which love holds which point).
// Both unmake pairs whose points differ, so the store keeps both points (the word 9 s + q); both read a quantity the
// pair move keeps, so the move stays an involution.
//
// THEOREMS, proved in the rule's header and checked here:
//   A IS SEEN ALIKE BY EVERY TERM. Under A no piece of the beat reads a point (the meeting keeps the occupation, the coin
//     reads held-or-not, the pair move reads trits, the stream's target is the mesh's), so the occupation at beat t is a
//     function of the occupation at beat 0: one occupation history for every term of the sum, and for every link start.
//   B IS SEEN ALIKE AT THE MEETING, NOT ALONG A HISTORY. The exchange keeps its dock's multisets, so B's decision at that
//     dock and beat is the same on both terms. But a later dock reads the points that arrive there, and two like vibes
//     leave a meeting through different links (a first slot is taken forward, a second back), so their images differ and
//     a later multiset can tell the terms apart. And B cannot be moved down to one line: the 216 grid moves act on the
//     9 points 2-transitively, so the only frame-covariant relations between two points are "equal" and "unequal", and a
//     line-level Phi pairing IS the old veto. The coordinator's "the exchange keeps the Phi pairing up to a phase" holds
//     for the two like vibes' own registers (T1), not for the love-fear pair a later collision reads.
//
// Probes run before these gates, disclosed: tmp/ov-probe1 (on the old vacuum's history every refused pair sits in a
// full dock of 24 vibes and every unmade one in a dock of 8; with no veto at all the vacuum makes 466,944 pairs against
// the old 393,216), tmp/ov-probe2 (starts integer+0 and golden, side 8, 96 beats: all three vetoes reproduce the old
// vacuum bit for bit on the keep path; under A the keep, Born and exchange paths hold one occupation at every beat;
// under B the Born path makes 13,378 against 1,294 unmade).
//
// Gates, fixed before this file's first run:
//  T1 the like meeting, exhaustively (81 point pairs, two loves and two fears, the rule's own meetBranch): the
//     occupation and the unordered pair of points kept on every term; equal points give one term w; unequal give keep
//     (1 + w)/2 and exchange -(1 - w)/2, so on the pair K + E = w and K - E = 1 (U = w P_sym + P_anti); the adjoint
//     meeting returns the start with amplitude 1
//  T2 A is seen alike by every term: (a) A's dock decision unchanged when every held point and every stored word is
//     changed slot by slot (p -> p + slot mod 9), on every dock of a side-4 Born path's 48 beats; (b) side 8, 96 beats,
//     on every start of the 17: the keep, Born and exchange paths hold the same occupation at every beat, and it is the
//     same on every start; (c) side 4: each unequal-point like meeting of the vacuum's first period, exchanged alone,
//     changes the occupation within 2 beats on 0 of them under A, on all of them under the point veto (E-RLT-0097 P1)
//  T3 B at the meeting: every one of those exchanges leaves B's decision at its own dock unchanged; and 2-transitivity:
//     the 216 grid moves carry the ordered pair (0, 1) onto all 72 ordered pairs of unequal points
//  T4 involution: the pair move of each veto applied twice is the identity on every dock of every configuration of its
//     own side-4 Born path (48 beats), vibes, points, stores, words and open bits
//  T5 the classical sector: with no open vibe each veto's rule (the superposed kernel) is the old knit bit for bit on the
//     vacuum, side 8, 96 beats, every start of the 17 (one term, stored words 10 s)
//  T6 the kernel is the rule: with the point veto, the superposing run of E-RLT-0097 L8 (side 4, the first like pair
//     opened, 48 beats) equals the shared doublet-locked kernel term for term and amplitude for amplitude, every start
// PREDICTED: pass. Beside, never gates: B along a history (how many of the first-period exchanges change the
// occupation within 2 beats under B; the theorem says some can); B's and A's decisions under slot-by-slot point
// changes; the lone-seed comparison (love and fear at 4 of 24 directions, side 8, center anchor, 96 beats) of each veto
// against the old knit, the cost of A and B on a charged start.
//
// FIRST RUN (77 s, tmp/rlt100-run1.log): pass, no gate moved. T1 162 of 162; T2 A's decision changed on 0 docks by
// slot-by-slot point changes (the pairing veto's on 526 to 620 of 12,544), the three paths agree on 17 of 17 and one
// history serves every start, 0 of 480 single exchanges change the occupation under A against 480 of 480 under the
// point veto; T3 0 decisions changed at the meeting, 72 of 72 ordered pairs; T4 0 failures; T5 17 of 17; T6 17 of 17
// (up to 5 terms). Beside: B along a history, 480 of 480 single exchanges change the occupation (as the theorem
// allows); lone seeds differ from the old knit on 768 of 768 beats under A and under B (0 under the point veto): one
// charged vibe freezes its own dock's pair move under A, and unbalances its dock's multisets under B, from the first
// beat. Title written after the run.
//
// DETERMINISM: no random numbers; starts are E-MTH-0028's family; path choices are integer Weyl numbers. Every number
// here is an exact integer. Depth L1 for T1 and T3's 2-transitivity (exhaustive), L2 for the runs. Husk: these are bulk
// identities of the rule, which hold on every husk column by holding on every dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { gridMoves } from '@/code/rule/vibe-weave'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  cloneConfiguration,
  lockedBeat,
  lockedState,
  mergeBranches,
  type Branch,
  type Configuration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import {
  dockAllows,
  meetBranch,
  pairPiece,
  toWords,
  vetoBeat,
  VETO_KINDS,
  type VetoKind,
} from '@/code/rule/occupation-veto-knit'
import {
  idRun,
  lockedFresh,
  sameOccupation,
  vacuumConfiguration,
  THRESHOLD_BORN,
  THRESHOLD_EXCHANGE,
  THRESHOLD_KEEP,
  type LockedFresh,
} from '@/code/measure/doublet-locked-readings'
import { vetoPathRunner } from '@/code/measure/occupation-veto-readings'

const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f]!)
const K1_SEEDS = [0, 7, 13, 20]

// full equality of two configurations (vibes, held points, open bits, stores, stored words, stored open bits)
function sameAll(a: Configuration, b: Configuration): boolean {
  for (let i = 0; i < a.vibe.length; i++) {
    if (
      a.vibe[i] !== b.vibe[i] ||
      (a.vibe[i] !== 0 &&
        (a.point[i] !== b.point[i] || a.open[i] !== b.open[i]))
    ) {
      return false
    }
  }

  for (let i = 0; i < a.store.length; i++) {
    if (
      a.store[i] !== b.store[i] ||
      (a.store[i] !== 0 &&
        (a.spoint[i] !== b.spoint[i] || a.sopen[i] !== b.sopen[i]))
    ) {
      return false
    }
  }

  return true
}

// an old-knit configuration against a word one: stored point s against word 10 s
function oldAgainstWords(o: Configuration, w: Configuration): number {
  let n = 0

  for (let i = 0; i < o.vibe.length; i++) {
    if (
      o.vibe[i] !== w.vibe[i] ||
      (o.vibe[i] !== 0 && o.point[i] !== w.point[i])
    ) {
      n++
    }
  }

  for (let i = 0; i < o.store.length; i++) {
    if (
      o.store[i] !== w.store[i] ||
      (o.store[i] !== 0 && 10 * o.spoint[i]! !== w.spoint[i])
    ) {
      n++
    }
  }

  return n
}

// ---- T1 ----
function likeMeeting(): { cases: number; failures: number } {
  const i = LINE_FIRSTS[0]!
  const j = LINE_SECONDS[0]!

  let cases = 0
  let failures = 0

  for (const tone of [1, -1]) {
    for (let p = 0; p < 9; p++) {
      for (let q = 0; q < 9; q++) {
        const br: Branch = {
          vibe: new Int8Array(24),
          point: new Int8Array(24),
          open: new Uint8Array(24),
          store: new Int8Array(12),
          spoint: new Int8Array(12),
          sopen: new Uint8Array(12),
          a: 1n,
          b: 0n,
          k: 0,
        }

        br.vibe[i] = tone
        br.vibe[j] = tone
        br.point[i] = p
        br.point[j] = q
        br.open[i] = 1
        br.open[j] = 1

        const start = cloneConfiguration(br)
        const out = meetBranch(
          { ...cloneConfiguration(br), a: 1n, b: 0n, k: 0 },
          1,
          false,
        )

        let ok = out.every(
          o =>
            sameOccupation(o, start) &&
            Math.min(o.point[i]!, o.point[j]!) === Math.min(p, q) &&
            Math.max(o.point[i]!, o.point[j]!) === Math.max(p, q),
        )

        if (p === q) {
          ok =
            ok &&
            out.length === 1 &&
            out[0]!.a === 0n &&
            out[0]!.b === 1n &&
            out[0]!.k === 0
        } else {
          const keep = out.find(o => o.point[i] === p)
          const exch = out.find(o => o.point[i] === q)

          ok =
            ok &&
            out.length === 2 &&
            !!keep &&
            !!exch &&
            keep.k === 1 &&
            exch.k === 1

          // K + E = w and K - E = 1, numerators over 2
          ok =
            ok &&
            !!keep &&
            !!exch &&
            keep.a + exch.a === 0n &&
            keep.b + exch.b === 2n &&
            keep.a - exch.a === 2n &&
            keep.b - exch.b === 0n
        }

        // the adjoint meeting returns the start with amplitude 1
        const back = mergeBranches(
          out.flatMap(o =>
            meetBranch(
              { ...cloneConfiguration(o), a: o.a, b: o.b, k: o.k },
              1,
              true,
            ),
          ),
        )

        ok =
          ok &&
          back.length === 1 &&
          back[0]!.a === 1n &&
          back[0]!.b === 0n &&
          back[0]!.k === 0 &&
          sameAll(back[0]!, start)
        cases++
        failures += ok ? 0 : 1
      }
    }
  }

  return { cases, failures }
}

// the configurations of a kind's side-4 Born path, 48 beats
function bornHistory(kind: VetoKind, f: LockedFresh): Configuration[] {
  const run = vetoPathRunner(
    kind,
    f.tables,
    toWords(vacuumConfiguration(f, 'all')),
    THRESHOLD_BORN,
  )
  const out: Configuration[] = [cloneConfiguration(run.state())]

  for (let t = 0; t < 48; t++) {
    run.beat()
    out.push(cloneConfiguration(run.state()))
  }

  return out
}

// ---- T2 (a): a dock decision under slot-by-slot point changes ----
function blindness(
  kind: VetoKind,
  history: readonly Configuration[],
  cells: number,
): { docks: number; changed: number } {
  let docks = 0
  let changed = 0

  for (const c of history) {
    const d = cloneConfiguration(c)

    for (let i = 0; i < d.point.length; i++) {
      d.point[i] = (d.point[i]! + (i % 24)) % 9
    }

    for (let l = 0; l < d.spoint.length; l++) {
      d.spoint[l] = (d.spoint[l]! + (l % 12) + 1) % 81
    }

    for (let x = 0; x < cells; x++) {
      docks++
      changed +=
        dockAllows(kind, c, x) === dockAllows(kind, d, x) ? 0 : 1
    }
  }

  return { docks, changed }
}

// ---- T4 ----
function involution(
  kind: VetoKind,
  history: readonly Configuration[],
  cells: number,
): number {
  let failures = 0

  for (const c of history) {
    for (let x = 0; x < cells; x++) {
      const d = cloneConfiguration(c)

      pairPiece(kind, d, x)
      pairPiece(kind, d, x)
      failures += sameAll(c, d) ? 0 : 1
    }
  }

  return failures
}

// ---- T2 (c), T3: single exchanges of the vacuum's first period ----
function sensitivity(
  kind: VetoKind,
  f: LockedFresh,
): { meetings: number; changed: number; decisionChanged: number } {
  const keep = vetoPathRunner(
    kind,
    f.tables,
    toWords(vacuumConfiguration(f, 'all')),
    THRESHOLD_KEEP,
  )
  const history: Configuration[] = [cloneConfiguration(keep.state())]

  for (let t = 0; t < 6; t++) {
    keep.beat()
    history.push(cloneConfiguration(keep.state()))
  }

  let meetings = 0
  let changed = 0
  let decisionChanged = 0

  for (let t0 = 1; t0 <= 3; t0++) {
    const s = history[t0]!

    for (let x = 0; x < f.cells; x++) {
      for (let l = 0; l < 12; l++) {
        const i = x * 24 + LINE_FIRSTS[l]!
        const j = x * 24 + LINE_SECONDS[l]!

        if (
          s.vibe[i] === 0 ||
          s.vibe[i] !== s.vibe[j] ||
          s.point[i] === s.point[j]
        ) {
          continue
        }

        meetings++

        const p = cloneConfiguration(s)
        const a = p.point[i]!

        p.point[i] = p.point[j]!
        p.point[j] = a
        decisionChanged +=
          dockAllows('pairing', s, x) === dockAllows('pairing', p, x)
            ? 0
            : 1

        const run = vetoPathRunner(
          kind,
          f.tables,
          p,
          THRESHOLD_KEEP,
          t0,
        )

        let differs = false

        for (let k = 0; k < 2 && !differs; k++) {
          run.beat()
          differs = !sameOccupation(run.state(), history[t0 + k + 1]!)
        }

        changed += differs ? 1 : 0
      }
    }
  }

  return { meetings, changed, decisionChanged }
}

// ---- T2 (b): one occupation on every path and start ----
function onePath(
  kind: VetoKind,
  f: LockedFresh,
  threshold: number,
  beats: number,
): Int8Array[] {
  const run = vetoPathRunner(
    kind,
    f.tables,
    toWords(vacuumConfiguration(f, 'all')),
    threshold,
  )
  const out: Int8Array[] = []

  for (let t = 0; t < beats; t++) {
    run.beat()

    const s = run.state()
    const occ = new Int8Array(s.vibe.length + s.store.length)

    occ.set(s.vibe)
    occ.set(s.store, s.vibe.length)
    out.push(occ)
  }

  return out
}

const sameBytes = (a: Int8Array, b: Int8Array): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i])

// ---- T5 ----
function classical(
  kind: VetoKind,
  f: LockedFresh,
  beats: number,
): number {
  let old: LockedState = lockedState(vacuumConfiguration(f, 'none'))
  let mine: LockedState = lockedState(
    toWords(vacuumConfiguration(f, 'none')),
  )
  let mismatches = 0

  for (let t = 0; t < beats; t++) {
    old = lockedBeat(f.tables, old, t)
    mine = vetoBeat(kind, f.tables, mine, t)
    mismatches +=
      old.branches.length === 1 && mine.branches.length === 1
        ? oldAgainstWords(old.branches[0]!, mine.branches[0]!)
        : 1
  }

  return mismatches
}

// ---- T6 ----
function firstLikePair(f: LockedFresh): [number, number] | undefined {
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

  for (let t = 0; t < 12; t++) {
    const c = r.state()
    const ids = r.ids()

    for (let x = 0; x < f.cells; x++) {
      for (let l = 0; l < 12; l++) {
        const i = x * 24 + LINE_FIRSTS[l]!
        const j = x * 24 + LINE_SECONDS[l]!

        if (
          c.vibe[i] !== 0 &&
          c.vibe[i] === c.vibe[j] &&
          c.point[i] !== c.point[j] &&
          ids[i]! >= 0 &&
          ids[j]! >= 0
        ) {
          return [ids[i]!, ids[j]!]
        }
      }
    }

    r.beat()
  }

  return undefined
}

function fidelity(
  f: LockedFresh,
  beats: number,
): { found: boolean; mismatches: number; branchesMax: number } {
  const pick = firstLikePair(f)

  if (!pick) {
    return { found: false, mismatches: 1, branchesMax: 0 }
  }

  const start = vacuumConfiguration(f, 'none')

  for (const id of pick) {
    start.sopen[id >> 1] = start.sopen[id >> 1]! | (1 << (id & 1))
  }

  let old: LockedState = lockedState(start)
  let mine: LockedState = lockedState(toWords(start))
  let mismatches = 0
  let branchesMax = 1

  for (let t = 0; t < beats; t++) {
    old = lockedBeat(f.tables, old, t)
    mine = vetoBeat('point', f.tables, mine, t)
    branchesMax = Math.max(branchesMax, old.branches.length)

    if (old.branches.length !== mine.branches.length) {
      mismatches++
      continue
    }

    for (const b of old.branches) {
      const w = toWords(b)
      const twin = mine.branches.find(o => sameAll(o, w))

      if (!twin || twin.a !== b.a || twin.b !== b.b || twin.k !== b.k) {
        mismatches++
      }
    }
  }

  return { found: true, mismatches, branchesMax }
}

// ---- beside: the lone seed against the old knit ----
function seeds(kind: VetoKind): number {
  const side = 8
  const center = centerOf(side)
  const g = lockedFresh(side, center)

  let mismatches = 0

  for (const tone of [1, -1]) {
    for (const d of K1_SEEDS) {
      const start = vacuumConfiguration(g, 'none')

      start.vibe[center * 24 + d] = tone
      start.open[center * 24 + d] = 1

      let old: LockedState = lockedState(start)
      let mine: LockedState = lockedState(toWords(start))

      for (let t = 0; t < 96; t++) {
        old = lockedBeat(g.tables, old, t)
        mine = vetoBeat(kind, g.tables, mine, t)
        mismatches +=
          old.branches.length === 1 &&
          mine.branches.length === 1 &&
          oldAgainstWords(old.branches[0]!, mine.branches[0]!) === 0
            ? 0
            : 1
      }
    }
  }

  return mismatches
}

export default experiment({
  id: 'relativity/occupation-veto-build',
  code: 'E-RLT-0100',
  title:
    'a veto the exchange cannot see, pass: the like meeting keeps the occupation, the unordered pair of points and U = w P_sym + P_anti (162 of 162 exhaustive cases) and no single point; the occupation veto (the pair move acts only in a neutral dock) reads no point, so every term of the all-open rule holds one occupation history (keep, Born and exchange paths agree on 17 of 17 starts, one history across starts) and no single exchange changes the occupation (0 of 480, against 480 of 480 under the point veto); the pairing veto (a dock acts only when its love and fear points agree as multisets) is kept by an exchange at its own dock but not along a history (480 of 480 single exchanges change the occupation); the 216 grid moves are 2-transitive on the points (72 of 72 ordered pairs), so a line-level Phi pairing is the old veto; both vetoes are involutions with a two-point store and are the old knit bit for bit with no open vibe (17 of 17), but differ from it on every beat of a run holding one charged vibe (768 of 768)',
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
    const t1 = likeMeeting()
    const moves = gridMoves()
    const pairs = new Set<number>()

    for (const a of moves.act) {
      pairs.add(a[0]! * 9 + a[1]!)
    }

    const twoTransitive =
      pairs.size === 72 &&
      [...pairs].every(k => ((k / 9) | 0) !== k % 9)

    log('T1, T3 2-transitivity')

    const family = startFamily(16)
    const perStart = family.map(member =>
      withStart(member, () => {
        const f4 = lockedFresh(4)
        const f8 = lockedFresh(8)
        const born = Object.fromEntries(
          VETO_KINDS.map(k => [k, bornHistory(k, f4)]),
        ) as Record<VetoKind, Configuration[]>
        const blind = Object.fromEntries(
          VETO_KINDS.map(k => [
            k,
            blindness(k, born.occupation, f4.cells),
          ]),
        ) as Record<VetoKind, { docks: number; changed: number }>
        const invol = Object.fromEntries(
          VETO_KINDS.map(k => [k, involution(k, born[k], f4.cells)]),
        ) as Record<VetoKind, number>
        const sens = Object.fromEntries(
          VETO_KINDS.map(k => [k, sensitivity(k, f4)]),
        ) as Record<
          VetoKind,
          { meetings: number; changed: number; decisionChanged: number }
        >
        const paths = [
          THRESHOLD_KEEP,
          THRESHOLD_BORN,
          THRESHOLD_EXCHANGE,
        ].map(th => onePath('occupation', f8, th, 96))
        const pathsAgree = paths.every(p =>
          p.every((o, t) => sameBytes(o, paths[0]![t]!)),
        )
        const classic = Object.fromEntries(
          VETO_KINDS.map(k => [k, classical(k, f8, 96)]),
        ) as Record<VetoKind, number>
        const fid = fidelity(f4, 48)

        log(`start ${member.name}`)

        return {
          name: member.name,
          blind,
          invol,
          sens,
          keepOccupation: paths[0]!,
          pathsAgree,
          classic,
          fid,
        }
      }),
    )

    const acrossStarts = perStart.every(p =>
      p.keepOccupation.every((o, t) =>
        sameBytes(o, perStart[0]!.keepOccupation[t]!),
      ),
    )
    const seedMismatches = Object.fromEntries(
      VETO_KINDS.map(k => [k, seeds(k)]),
    ) as Record<VetoKind, number>

    log('seeds')

    const gT1 = t1.failures === 0 && t1.cases === 162
    const gT2 =
      perStart.every(
        p =>
          p.blind.occupation.changed === 0 &&
          p.pathsAgree &&
          p.sens.occupation.changed === 0 &&
          p.sens.point.meetings > 0 &&
          p.sens.point.changed === p.sens.point.meetings,
      ) && acrossStarts
    const gT3 =
      twoTransitive &&
      perStart.every(p =>
        VETO_KINDS.every(k => p.sens[k].decisionChanged === 0),
      )
    const gT4 = perStart.every(p =>
      VETO_KINDS.every(k => p.invol[k] === 0),
    )
    const gT5 = perStart.every(p =>
      VETO_KINDS.every(k => p.classic[k] === 0),
    )
    const gT6 = perStart.every(
      p => p.fid.found && p.fid.mismatches === 0,
    )
    const status =
      gT1 && gT2 && gT3 && gT4 && gT5 && gT6 ? 'pass' : 'fail'
    const range = (xs: number[]): string =>
      Math.min(...xs) === Math.max(...xs)
        ? `${Math.min(...xs)}`
        : `${Math.min(...xs)} to ${Math.max(...xs)}`
    const metrics: Record<string, number> = {
      gateT1: gT1 ? 1 : 0,
      gateT2: gT2 ? 1 : 0,
      gateT3: gT3 ? 1 : 0,
      gateT4: gT4 ? 1 : 0,
      gateT5: perStart.filter(p =>
        VETO_KINDS.every(k => p.classic[k] === 0),
      ).length,
      gateT6: perStart.filter(
        p => p.fid.found && p.fid.mismatches === 0,
      ).length,
      starts: family.length,
      meetingCases: t1.cases,
      orderedUnequalPairsReached: pairs.size,
      firstPeriodExchangesMin: Math.min(
        ...perStart.map(p => p.sens.point.meetings),
      ),
      changedUnderPointMin: Math.min(
        ...perStart.map(p => p.sens.point.changed),
      ),
      changedUnderOccupationMax: Math.max(
        ...perStart.map(p => p.sens.occupation.changed),
      ),
      changedUnderPairingMin: Math.min(
        ...perStart.map(p => p.sens.pairing.changed),
      ),
      changedUnderPairingMax: Math.max(
        ...perStart.map(p => p.sens.pairing.changed),
      ),
      pairingBlindChangedMax: Math.max(
        ...perStart.map(p => p.blind.pairing.changed),
      ),
      pointBlindChangedMax: Math.max(
        ...perStart.map(p => p.blind.point.changed),
      ),
      seedMismatchesOccupation: seedMismatches.occupation,
      seedMismatchesPairing: seedMismatches.pairing,
      seedMismatchesPoint: seedMismatches.point,
      fidelityBranchesMax: Math.max(
        ...perStart.map(p => p.fid.branchesMax),
      ),
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `the like meeting keeps the occupation, the unordered pair of points and U = w P_sym + P_anti exactly (${t1.cases - t1.failures} of ${t1.cases} cases); the occupation veto reads no point (${Math.max(...perStart.map(p => p.blind.occupation.changed))} decisions changed by slot-by-slot point changes), so every term holds one occupation (keep, Born and exchange paths agree on ${perStart.filter(p => p.pathsAgree).length} of ${family.length} starts, and across starts ${acrossStarts}) and no single exchange changes the occupation (${range(perStart.map(p => p.sens.occupation.changed))} of ${range(perStart.map(p => p.sens.occupation.meetings))}, against ${range(perStart.map(p => p.sens.point.changed))} under the point veto); the pairing veto is unchanged by the exchange at its own dock but ${range(perStart.map(p => p.sens.pairing.changed))} single exchanges still change the occupation along the history; the 216 grid moves are 2-transitive (${pairs.size} of 72 ordered pairs), so a line-level pairing is the old veto; both vetoes are involutions and equal the old knit bit for bit with no open vibe (${perStart.filter(p => VETO_KINDS.every(k => p.classic[k] === 0)).length} of ${family.length}); lone-seed beats differing from the old knit: occupation ${seedMismatches.occupation}, pairing ${seedMismatches.pairing} of 768`,
      metrics,
      control: {
        pointVetoSeedMismatches: seedMismatches.point,
        pointVetoChangedEqualsMeetings: perStart.filter(
          p => p.sens.point.changed === p.sens.point.meetings,
        ).length,
      },
      notes: `L2 (L1 for T1 and 2-transitivity). Gates: T1 ${gT1}, T2 ${gT2}, T3 ${gT3}, T4 ${gT4}, T5 ${gT5}, T6 ${gT6}. Per start (blind changed point/occupation/pairing of docks; involution failures; first-period exchanges and changed within 2 beats point/occupation/pairing, pairing decision changed at the meeting; paths agree; classical mismatches; fidelity branches max and mismatches): ${perStart
        .map(
          p =>
            `${p.name} ${p.blind.point.changed}/${p.blind.occupation.changed}/${p.blind.pairing.changed} of ${p.blind.occupation.docks}; ${VETO_KINDS.map(k => p.invol[k]).join('/')}; ${p.sens.point.meetings}: ${p.sens.point.changed}/${p.sens.occupation.changed}/${p.sens.pairing.changed}, ${VETO_KINDS.map(k => p.sens[k].decisionChanged).join('/')}; ${p.pathsAgree}; ${VETO_KINDS.map(k => p.classic[k]).join('/')}; ${p.fid.branchesMax}, ${p.fid.mismatches}`,
        )
        .join(
          ' | ',
        )}. Seeds (8 runs x 96 beats): ${JSON.stringify(seedMismatches)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
