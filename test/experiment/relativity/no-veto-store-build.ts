// THE NO-VETO TWO-POINT STORE, AS A BUILD (E-RLT-0102). E-RLT-0101 closed both exchange-blind vetoes: the occupation
// veto keeps the vacuum on every term but a lone vibe melts it, and the pairing veto melts on the Born and exchange
// paths. Its lead, probed and not gated (tmp/ov-probe4, integer+0): NO veto at all, with the two-point store of
// code/rule/occupation-veto-knit (kind 'none'). This file builds that rule under both like contacts and checks it as a
// rule; E-RLT-0103 reads the vacuum on it.
//
// THE RULE. The doublet-locked knit (code/rule/doublet-locked-knit) with one change: the pair move unmakes every love
// and fear on a line with an empty store, whatever their points, and keeps both points in the stored word 9 s + q (s the
// first slot's point, q the second's); a pair made from the store gets s and q back. Nothing else changes: the meeting
// (keep (1 + w)/2, exchange -(1 - w)/2, w on equal points), the coin piece and the stream are the knit's.
//
// THE TWO CONTACTS. 'lone' is the knit's own collision (a full line turns as -1, the bounce, u = -1). 'pass' is
// E-SPN-0092's (a full line of two LIKE vibes keeps its slots, u = +1; a love and a fear still turn), which E-SPN-0093
// needs for the electron and which changes the classical vacuum on 47 of 48 beats. Both are read here.
//
// WHAT IS PREDICTED, before any run:
//  - AN INVOLUTION, EXACTLY REVERSIBLE. The pair move reads trits only and keeps what it reads (a line with an empty
//    store and a love and a fear becomes a line with a stored unit and empty slots, and back), so it is its own inverse;
//    the coin piece is a slot permutation reading trits (both contacts), an involution by E-RLT-0084 and E-SPN-0092.
//  - WHERE IT AGREES WITH THE OLD KNIT, EXACTLY. The no-veto collision of one dock differs from the point veto's (the
//    old knit's, on the same contact, with words) exactly on the docks where the point veto refuses a love and a fear
//    with unequal points: there the old knit leaves them and the new one stores them. So on any history where no such
//    pair ever meets (flat links and one point for every unit, E-RLT-0097 L6's sector) the two are bit for bit one rule.
//    On the real vacuum they are NOT: the old vacuum refuses pairs (tmp/ov-probe1: 393,216 unmade against 466,944 with
//    no veto), so the no-veto vacuum is a different classical history. Reported, per start and contact.
//  - COVARIANT. The pair move reads a line's two trits and writes its store; a coin map that carries a line's first slot
//    onto another line's second reads the stored unit from the other side (trit negated, the two points swapped in the
//    word, the two open bits swapped), and with that reading the pair move commutes with every coin map. The coin piece
//    commutes by E-RLT-0084 (lone) and E-SPN-0092 (pass). Charge conjugation negates trits and keeps points.
//  - THE AUTONOMY THEOREM'S CONSEQUENCE. No piece reads a point: the meeting keeps the occupation (E-RLT-0100 T1), the
//    coin reads trits, the pair move reads trits, the stream's target is the mesh's. So the occupation at beat t is a
//    function of the occupation at beat 0: one history on every term and every link start, for both contacts, lone
//    vibes included. The price, the same sentence: positions carry no amplitude.
//
// Gates, fixed before this file's first run, each on every start of E-MTH-0028's 17 and on BOTH contacts:
//  N1 involution: on every dock of the side-4 Born-path histories (the all-open vacuum, and the vacuum with one open
//     love at the center, 48 beats, 49 configurations each), the pair move applied twice is the identity, and the beat's
//     collision followed by its inverse is the identity (vibes, held points, open bits, stores, words, stored open bits)
//  N2 exact reversal: the rule's own first unequal-point like meeting of two vacuum vibes within 12 beats (found by
//     running the rule's classical history back, code/measure/occupation-veto-readings likePairStart, which must return
//     the vacuum with exactly two marks), those two opened, 48 beats of the superposed rule on the side-4 vacuum: the
//     norm is exact at every beat, the exact inverse returns amplitude 1 on the start, and some meeting split
//  N3 the old knit where it must agree: (a) flat links and one point for every unit, side 8, 48 beats, every vibe open:
//     the no-veto rule is one configuration equal to the old knit (lockedBeat, same contact) bit for bit at every beat,
//     with some like meeting (per contact, start-free); (b) on every dock of N1's histories, the no-veto collision
//     differs from the point veto's exactly when the point veto refuses a pair there (0 docks against the iff)
//  N4 covariance: on every distinct dock of N1's histories (both beat parities), the collision commutes with all 1,152
//     coin maps (the stored unit read from the other side where a map turns a line) and with charge conjugation
//  N5 one occupation history: (a) side 8, 96 beats, the keep, Born-rate and exchange paths (thresholds 0, 49152, 65536)
//     hold the same occupation at every beat, from the vacuum and from the vacuum with one love at the center, and the
//     vacuum's is the same on every start; (b) side 4: each unequal-point like meeting of the vacuum's first period
//     (beats 1 to 3), exchanged alone, changes the occupation within 2 beats on 0 of them (the point veto, the control,
//     on at least one); (c) N2's superposed run holds one occupation among its terms at every beat
// Verdict: pass if N1 to N5 hold on both contacts; fail otherwise. PREDICTED: pass.
// Reported, never gated: on the real vacuum (side 8, keep path, 96 beats) the no-veto and point-veto pairs made and
// unmade, the first beat the two occupations differ and how many beats differ; refused docks per history; branches.
//
// PROBES before this file, disclosed: tmp/ov-probe4 (E-RLT-0101's lead, integer+0, lone contact: one occupation over
// the keep and exchange paths, 466,944 made and unmade, lone wake 13 to 15 trits, 0 off the line); tmp/nv-probe1
// (timing: 25,088 docks and about 9,000 distinct per contact on integer+0, 64 of the 1,152 maps in under a second, 0
// off: it read N4 on those 64 maps for one start).
//
// FIRST RUN (668 s, tmp/rlt102-run1.log): pass, no gate moved, both contacts, 17 of 17 on every gate. N1 0 failures
// over 25,088 docks a start; N2 norm and reversal exact (first like meeting at beat 1, 45 to 151 splits, up to 12
// terms); N3 (a) 0 mismatches over 122,880 like meetings, (b) the no-veto collision differs from the point veto's on
// exactly the 8,939 to 9,241 docks a start where the point veto refuses (0 against the iff); N4 0 off over 8,868 to
// 9,103 distinct docks x 1,152 maps, and C; N5 one occupation on every path, seeded or not, and across starts, 0 of 480
// single exchanges change it (the point veto: 480 under lone, 281 to 392 under pass), the superposed terms hold 1
// occupation. Reported: the no-veto vacuum makes and unmakes 466,944 pairs under both contacts; the old knit (point
// veto) makes and unmakes 393,216 under lone and differs from the no-veto history on 72 of 96 beats; under PASS the old
// knit's own classical vacuum is NOT balanced (made 38,886 to 40,389 against unmade 26,889 to 28,373, differing on 95
// of 96 beats): the pass alone melts the point-veto vacuum on its keep path. Title written after the run.
//
// DETERMINISM: no random numbers; starts are E-MTH-0028's family; path choices are integer Weyl numbers. Every number
// in the rule is an exact integer (amplitudes in Z[w] over powers of 2). Depth L2 (N3 (a) and N4 are exhaustive over
// their sets). Husk: bulk identities of the rule, which hold on every husk column by holding on every dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { cloneConfiguration, lockedBeat, lockedNorm, lockedState, lockedTables, newTally, type Configuration, type LockedState } from '@/code/rule/doublet-locked-knit'
import { pairPiece, toWords, vetoBeat, vetoBeatBack, type VetoKind } from '@/code/rule/occupation-veto-knit'
import { lockedFresh, sameOccupation, samePoints, vacuumConfiguration, THRESHOLD_BORN, THRESHOLD_EXCHANGE, THRESHOLD_KEEP, type LockedFresh } from '@/code/measure/doublet-locked-readings'
import { collideDock, conjugateDock, contactFresh, dockKey, dockOf, likePairStart, sameDock, slotMapDock, vetoPathRunner } from '@/code/measure/occupation-veto-readings'

const CONTACTS: readonly CollisionKind[] = ['lone', 'pass']
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] as number)
const PATHS = [THRESHOLD_KEEP, THRESHOLD_BORN, THRESHOLD_EXCHANGE]

const wordVacuum = (f: LockedFresh): Configuration => toWords(vacuumConfiguration(f, 'all'))

function seededVacuum(f: LockedFresh): Configuration {
  const c = wordVacuum(f)
  const slot = centerOf(f.side) * 24

  c.vibe[slot] = 1
  c.open[slot] = 1

  return c
}

// ---- N1, N3 (b), N4: the docks of the side-4 Born histories ----
type DockReading = { docks: number; pairTwice: number; inverse: number; refused: number; differ: number; iffOff: number; distinct: number; covariance: number; conjugation: number }

function dockChecks(f: LockedFresh, perms: readonly (readonly number[])[]): DockReading {
  const out: DockReading = { docks: 0, pairTwice: 0, inverse: 0, refused: 0, differ: 0, iffOff: 0, distinct: 0, covariance: 0, conjugation: 0 }
  const distinct = new Map<string, { dock: Configuration; beat: number }>()

  for (const start of [wordVacuum(f), seededVacuum(f)]) {
    const run = vetoPathRunner('none', f.tables, start, THRESHOLD_BORN)

    for (let t = 0; t <= 48; t++) {
      const c = run.state()

      for (let x = 0; x < f.cells; x++) {
        const d = dockOf(c, x)
        const twice = cloneConfiguration(d)

        out.docks++
        pairPiece('none', twice, 0)
        pairPiece('none', twice, 0)
        out.pairTwice += sameDock(twice, d) ? 0 : 1

        const r = collideDock('none', f.tables, d, t, false)

        out.inverse += sameDock(collideDock('none', f.tables, r, t, true), d) ? 0 : 1

        const tally = newTally()
        const p = collideDock('point', f.tables, d, t, false, tally)
        const differs = !sameDock(p, r)
        const refused = tally.vetoed > 0

        out.refused += refused ? 1 : 0
        out.differ += differs ? 1 : 0
        out.iffOff += differs === refused ? 0 : 1
        distinct.set(`${t % 2}|${dockKey(d)}`, { dock: d, beat: t })
      }

      run.beat()
    }
  }

  out.distinct = distinct.size

  for (const { dock, beat } of distinct.values()) {
    const r = collideDock('none', f.tables, dock, beat, false)

    for (const g of perms) out.covariance += dockKey(collideDock('none', f.tables, slotMapDock(dock, g), beat, false)) === dockKey(slotMapDock(r, g)) ? 0 : 1

    out.conjugation += dockKey(collideDock('none', f.tables, conjugateDock(dock), beat, false)) === dockKey(conjugateDock(r)) ? 0 : 1
  }

  return out
}

// ---- N2, N5 (c): the superposed run on the rule's own like pair ----
type Superposed = { found: boolean; clean: boolean; beat: number; normExact: boolean; reversed: boolean; splits: number; branchesMax: number; occupationsMax: number }

function superposed(f: LockedFresh): Superposed {
  const pick = likePairStart('none', f.tables, toWords(vacuumConfiguration(f, 'none')), 12)

  if (!pick) return { found: false, clean: false, beat: -1, normExact: false, reversed: false, splits: 0, branchesMax: 0, occupationsMax: 0 }

  const tally = newTally()
  let s: LockedState = lockedState(pick.start)
  let normExact = true
  let branchesMax = 1
  let occupationsMax = 1

  for (let t = 0; t < 48; t++) {
    s = vetoBeat('none', f.tables, s, t, tally)

    const n = lockedNorm(s)

    normExact = normExact && n.total === n.unit
    branchesMax = Math.max(branchesMax, s.branches.length)

    const occupations: Configuration[] = []

    for (const b of s.branches) if (!occupations.some(o => sameOccupation(o, b))) occupations.push(b)
    occupationsMax = Math.max(occupationsMax, occupations.length)
  }

  let back = s

  for (let t = 47; t >= 0; t--) back = vetoBeatBack('none', f.tables, back, t)

  const b0 = back.branches[0]
  const reversed = back.branches.length === 1 && !!b0 && b0.a === 1n && b0.b === 0n && b0.k === 0 && samePoints(b0, pick.start) && b0.sopen.every((v, i) => v === pick.start.sopen[i])

  return { found: true, clean: pick.clean, beat: pick.beat, normExact, reversed, splits: tally.splitMeetings, branchesMax, occupationsMax }
}

// ---- N3 (a): the flat sector ----
function flatSector(contact: CollisionKind, side: number, beats: number): { mismatches: number; branchesMax: number; like: number } {
  const f = lockedFresh(side)
  const flat = new Int16Array(f.cells * 24).fill(f.weave.moves.identity)
  const tables = lockedTables(f.weave, contact, flat)
  const uniform = new Int8Array(f.cells * 12)
  const start = vacuumConfiguration(f, 'all', uniform)
  const tally = newTally()
  let old: LockedState = lockedState(start)
  let mine: LockedState = lockedState(toWords(start))
  let mismatches = 0
  let branchesMax = 1

  for (let t = 0; t < beats; t++) {
    old = lockedBeat(tables, old, t)
    mine = vetoBeat('none', tables, mine, t, tally)
    branchesMax = Math.max(branchesMax, old.branches.length, mine.branches.length)

    if (old.branches.length !== 1 || mine.branches.length !== 1) {
      mismatches++
      continue
    }

    const o = old.branches[0]!
    const m = mine.branches[0]!

    // uniform points: every stored word is 9 * 0 + 0 = 0 and every old stored point 0
    mismatches += samePoints(o, m) && o.a === m.a && o.b === m.b && o.k === m.k && o.open.every((v, i) => v === m.open[i] || o.vibe[i] === 0) ? 0 : 1
  }

  return { mismatches, branchesMax, like: tally.likeMeetings }
}

// ---- N5 (a): occupations along paths ----
function occupations(f: LockedFresh, start: Configuration, threshold: number, beats: number): Int8Array[] {
  const run = vetoPathRunner('none', f.tables, start, threshold)
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

const sameBytes = (a: Int8Array, b: Int8Array): boolean => a.length === b.length && a.every((v, i) => v === b[i])

// ---- N5 (b) ----
function sensitivity(kind: VetoKind, f: LockedFresh): { meetings: number; changed: number } {
  const keep = vetoPathRunner(kind, f.tables, wordVacuum(f), THRESHOLD_KEEP)
  const history: Configuration[] = [cloneConfiguration(keep.state())]

  for (let t = 0; t < 6; t++) {
    keep.beat()
    history.push(cloneConfiguration(keep.state()))
  }

  let meetings = 0
  let changed = 0

  for (let t0 = 1; t0 <= 3; t0++) {
    const s = history[t0] as Configuration

    for (let x = 0; x < f.cells; x++) {
      for (let l = 0; l < 12; l++) {
        const i = x * 24 + (LINE_FIRSTS[l] as number)
        const j = x * 24 + (LINE_SECONDS[l] as number)

        if (s.vibe[i] === 0 || s.vibe[i] !== s.vibe[j] || s.point[i] === s.point[j]) continue

        meetings++

        const p = cloneConfiguration(s)
        const a = p.point[i] as number

        p.point[i] = p.point[j] as number
        p.point[j] = a

        const run = vetoPathRunner(kind, f.tables, p, THRESHOLD_KEEP, t0)
        let differs = false

        for (let k = 0; k < 2 && !differs; k++) {
          run.beat()
          differs = !sameOccupation(run.state(), history[t0 + k + 1] as Configuration)
        }

        changed += differs ? 1 : 0
      }
    }
  }

  return { meetings, changed }
}

// ---- reported: the no-veto vacuum against the old (point-veto) vacuum, keep path ----
function againstOld(f: LockedFresh, beats: number): { madeNone: number; unmadeNone: number; madeOld: number; unmadeOld: number; firstDiffer: number; beatsDiffer: number } {
  const a = vetoPathRunner('none', f.tables, wordVacuum(f), THRESHOLD_KEEP)
  const b = vetoPathRunner('point', f.tables, wordVacuum(f), THRESHOLD_KEEP)
  const ta = { likeMeetings: 0, equalPoints: 0, exchanged: 0, unlikeMeetings: 0, made: 0, unmade: 0, vetoed: 0 }
  const tb = { ...ta }
  let firstDiffer = -1
  let beatsDiffer = 0

  for (let t = 0; t < beats; t++) {
    a.beat(ta)
    b.beat(tb)

    if (!sameOccupation(a.state(), b.state())) {
      beatsDiffer++
      if (firstDiffer < 0) firstDiffer = t
    }
  }

  return { madeNone: ta.made, unmadeNone: ta.unmade, madeOld: tb.made, unmadeOld: tb.unmade, firstDiffer, beatsDiffer }
}

type PerContact = { dock: DockReading; sup: Superposed; pathsAgree: boolean; seededAgree: boolean; acrossStarts: boolean; sensNone: { meetings: number; changed: number }; sensPoint: { meetings: number; changed: number }; old: ReturnType<typeof againstOld> }

export default experiment({
  id: 'relativity/no-veto-store-build',
  code: 'E-RLT-0102',
  title:
    'the no-veto two-point store as a rule, pass under both the bounce and the pass contacts: the pair move unmakes every love and fear on an empty line and stores both points; it is an involution (0 of 25,088 docks a start), reverses exactly (17 of 17), commutes with all 1,152 coin maps and C (0 off over about 9,000 distinct docks), equals the old knit bit for bit where no pair is refused (0 of 122,880 like meetings on flat links) and differs from it exactly on the docks the point veto refuses (0 against the iff); nothing reads a point, so every term and every start holds one occupation history (0 of 480 single exchanges change it); the no-veto vacuum makes and unmakes 466,944 pairs under both contacts, where the old knit makes 393,216 under the bounce and, under the pass, is unbalanced on its own classical path (about 39,500 made against 27,500 unmade)',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const perms = groupTable().permutations
    const flat = Object.fromEntries(CONTACTS.map(c => [c, flatSector(c, 8, 48)])) as Record<CollisionKind, ReturnType<typeof flatSector>>

    log('N3 (a)')

    const family = startFamily(16)
    const reference: Partial<Record<CollisionKind, Int8Array[]>> = {}
    const perStart = family.map(member =>
      withStart(member, () => {
        const out = Object.fromEntries(
          CONTACTS.map(contact => {
            const f4 = contactFresh(4, contact)
            const f8 = contactFresh(8, contact)
            const dock = dockChecks(f4, perms)
            const sup = superposed(f4)
            const vac = PATHS.map(th => occupations(f8, wordVacuum(f8), th, 96))
            const seeded = PATHS.map(th => occupations(f8, seededVacuum(f8), th, 96))
            const pathsAgree = vac.every(p => p.every((o, t) => sameBytes(o, vac[0]![t]!)))
            const seededAgree = seeded.every(p => p.every((o, t) => sameBytes(o, seeded[0]![t]!)))

            if (!reference[contact]) reference[contact] = vac[0]!

            const acrossStarts = vac[0]!.every((o, t) => sameBytes(o, reference[contact]![t]!))
            const sensNone = sensitivity('none', f4)
            const sensPoint = sensitivity('point', f4)
            const old = againstOld(f8, 96)

            return [contact, { dock, sup, pathsAgree, seededAgree, acrossStarts, sensNone, sensPoint, old } satisfies PerContact]
          }),
        ) as Record<CollisionKind, PerContact>

        log(`start ${member.name}`)

        return { name: member.name, ...out }
      }),
    )

    const every = (contact: CollisionKind, test: (p: PerContact) => boolean): number => perStart.filter(p => test(p[contact])).length
    const n1 = (p: PerContact): boolean => p.dock.pairTwice === 0 && p.dock.inverse === 0
    const n2 = (p: PerContact): boolean => p.sup.found && p.sup.clean && p.sup.normExact && p.sup.reversed && p.sup.splits > 0
    const n3b = (p: PerContact): boolean => p.dock.iffOff === 0
    const n4 = (p: PerContact): boolean => p.dock.covariance === 0 && p.dock.conjugation === 0 && p.dock.distinct > 0
    const n5 = (p: PerContact): boolean => p.pathsAgree && p.seededAgree && p.acrossStarts && p.sensNone.meetings > 0 && p.sensNone.changed === 0 && p.sensPoint.changed > 0 && p.sup.occupationsMax === 1
    const n3a = (contact: CollisionKind): boolean => flat[contact].mismatches === 0 && flat[contact].branchesMax === 1 && flat[contact].like > 0
    const gates = (contact: CollisionKind): Record<string, boolean> => ({
      N1: every(contact, n1) === family.length,
      N2: every(contact, n2) === family.length,
      N3: n3a(contact) && every(contact, n3b) === family.length,
      N4: every(contact, n4) === family.length,
      N5: every(contact, n5) === family.length,
    })
    const byContact = Object.fromEntries(CONTACTS.map(c => [c, gates(c)])) as Record<CollisionKind, Record<string, boolean>>
    const status = CONTACTS.every(c => Object.values(byContact[c]).every(Boolean)) ? 'pass' : 'fail'
    const range = (xs: number[]): string => (Math.min(...xs) === Math.max(...xs) ? `${Math.min(...xs)}` : `${Math.min(...xs)} to ${Math.max(...xs)}`)
    const over = (contact: CollisionKind, f: (p: PerContact) => number): string => range(perStart.map(p => f(p[contact])))
    const metrics: Record<string, number> = { starts: family.length }

    for (const c of CONTACTS) {
      for (const [name, ok] of Object.entries(byContact[c])) metrics[`${c}_gate${name}`] = ok ? 1 : 0

      metrics[`${c}_N1`] = every(c, n1)
      metrics[`${c}_N2`] = every(c, n2)
      metrics[`${c}_N3b`] = every(c, n3b)
      metrics[`${c}_N4`] = every(c, n4)
      metrics[`${c}_N5`] = every(c, n5)
      metrics[`${c}_flatMismatches`] = flat[c].mismatches
      metrics[`${c}_flatLikeMeetings`] = flat[c].like
      metrics[`${c}_docksPerStart`] = perStart[0]![c].dock.docks
      metrics[`${c}_distinctDocksMin`] = Math.min(...perStart.map(p => p[c].dock.distinct))
      metrics[`${c}_covarianceOff`] = perStart.reduce((s, p) => s + p[c].dock.covariance, 0)
      metrics[`${c}_refusedDocksMax`] = Math.max(...perStart.map(p => p[c].dock.refused))
      metrics[`${c}_superposedBranchesMax`] = Math.max(...perStart.map(p => p[c].sup.branchesMax))
      metrics[`${c}_vacuumMadeNone`] = Math.max(...perStart.map(p => p[c].old.madeNone))
      metrics[`${c}_vacuumMadeOld`] = Math.max(...perStart.map(p => p[c].old.madeOld))
      metrics[`${c}_vacuumBeatsDiffer`] = Math.max(...perStart.map(p => p[c].old.beatsDiffer))
    }

    metrics.seconds = (Date.now() - started) / 1000

    const contactLine = (c: CollisionKind): string =>
      `${c}: gates ${JSON.stringify(byContact[c])}; involution on ${every(c, n1)} of ${family.length} (${perStart[0]![c].dock.docks} docks a start); reversal on ${every(c, n2)} (first like meeting at beat ${over(c, p => p.sup.beat)}, splits ${over(c, p => p.sup.splits)}, branches up to ${over(c, p => p.sup.branchesMax)}); flat sector ${flat[c].mismatches} mismatches over ${flat[c].like} like meetings; docks where the point veto refuses ${over(c, p => p.dock.refused)}, docks differing ${over(c, p => p.dock.differ)}, against the iff ${over(c, p => p.dock.iffOff)}; covariance over ${over(c, p => p.dock.distinct)} distinct docks x 1,152 maps ${over(c, p => p.dock.covariance)} off, C ${over(c, p => p.dock.conjugation)} off; paths agree ${every(c, p => p.pathsAgree)}, seeded ${every(c, p => p.seededAgree)}, across starts ${every(c, p => p.acrossStarts)}; single exchanges changing the occupation ${over(c, p => p.sensNone.changed)} of ${over(c, p => p.sensNone.meetings)} (point veto ${over(c, p => p.sensPoint.changed)}); superposed occupations ${over(c, p => p.sup.occupationsMax)}; the real vacuum against the old: made ${over(c, p => p.old.madeNone)} unmade ${over(c, p => p.old.unmadeNone)} against the point veto's made ${over(c, p => p.old.madeOld)} unmade ${over(c, p => p.old.unmadeOld)}, first differing beat ${over(c, p => p.old.firstDiffer)}, beats differing ${over(c, p => p.old.beatsDiffer)} of 96`

    return verdict({
      status,
      claim: CONTACTS.map(contactLine).join('. '),
      metrics,
      control: Object.fromEntries(CONTACTS.map(c => [`${c}_pointVetoChangedMin`, Math.min(...perStart.map(p => p[c].sensPoint.changed))])),
      notes: `L2 (N3 (a), N4 exhaustive over their sets). Per start (contact: pair twice/inverse failures; refused/differ/iff off; distinct, covariance off, C off; superposed beat, splits, branches, occupations, norm, reversed; paths/seeded/across; exchanges none changed of meetings, point changed; made none/old, first differ, beats differ): ${perStart
        .map(
          p =>
            `${p.name} ${CONTACTS.map(c => {
              const r = p[c]

              return `${c} ${r.dock.pairTwice}/${r.dock.inverse}; ${r.dock.refused}/${r.dock.differ}/${r.dock.iffOff}; ${r.dock.distinct}, ${r.dock.covariance}, ${r.dock.conjugation}; ${r.sup.beat}, ${r.sup.splits}, ${r.sup.branchesMax}, ${r.sup.occupationsMax}, ${r.sup.normExact}, ${r.sup.reversed}; ${r.pathsAgree}/${r.seededAgree}/${r.acrossStarts}; ${r.sensNone.changed} of ${r.sensNone.meetings}, ${r.sensPoint.changed}; ${r.old.madeNone}/${r.old.madeOld}, ${r.old.firstDiffer}, ${r.old.beatsDiffer}`
            }).join(' ; ')}`,
        )
        .join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
