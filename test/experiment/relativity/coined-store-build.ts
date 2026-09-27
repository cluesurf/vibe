// THE COIN ON THE NO-VETO STORE UNDER THE PASS, AS A BUILD (E-RLT-0104). The working vacuum (chosen 2026-09-26) is the
// no-veto two-point store under the pass contact (E-RLT-0102, E-RLT-0103), with no C walls. Its price, "positions carry
// no amplitude", was proved without the coin. The covariant coin that gives the electron its mass (E-SPN-0090, 0091)
// sends a lone open vibe to (1 + w)/2 on its slot and (1 - w)/2 on its line's other slot, which is amplitude over
// position. This file composes the two and checks the composition as a rule; E-RLT-0105 reads the vacuum on it.
//
// THE RULE, composed from existing pieces and nothing else: code/rule/coined-locked-knit coinBranch (the coin, as
// E-SPN-0091 wrote it) then code/rule/occupation-veto-knit vetoBeat with kind 'none' (the meetings, the no-veto
// collision, the stream), on tables built with collision 'pass' (code/rule/bounce-pair-knit). That is
// coinedVetoBeat, and its inverse coinedVetoBeatBack is the veto beat's inverse then the adjoint coin. The coin acts only
// on OPEN vibes: a line of one open vibe and an empty slot splits into keep (1 + w)/2 and cross (1 - w)/2, a line of
// two open vibes takes the phase det C = w, and every other line is untouched. On a path (one term of the sum) the coin
// keeps or crosses by the meeting's own keyed Weyl number (code/measure/occupation-veto-readings pathCoin), since its
// Born weights 1/4 and 3/4 are the meeting's. NO FERMION SIGN: coined-locked-knit writes it only for configurations
// with no store and refuses otherwise, and every configuration here holds stores. This is the rule E-SPN-0091 calls
// 'native'. On a path the sign would be a phase and change nothing any path reads.
//
// WHAT IS PREDICTED, before any run:
//  - EXACT AND REVERSIBLE. The coin is unitary on each line's open doublet (E-SPN-0090) and exact in Z[w] over 2; the
//    veto beat is exact and reversible (E-RLT-0102).
//  - COVARIANT. The coin reads held-or-not and open-or-not per line and is symmetric in a line's two slots, so it commutes
//    with every coin map (a map that turns a line swaps its slots) and with C. The collision commutes by E-RLT-0102 N4.
//  - THE NO-VETO STORE BIT FOR BIT WHERE NO VIBE IS OPEN. With no open vibe the coin is the identity. So the vacuum with
//    every stored pair closed runs as E-RLT-0102's rule exactly, and so does the keep path of the all-open vacuum (the
//    coin keeps there always, so it touches no configuration).
//  - WHERE IT DIFFERS, per dock: exactly where the dock holds a line of one open vibe and an empty slot (a split), or a
//    number of lines of two open vibes that is not a multiple of 3 (w^3 = 1).
//
// Gates, fixed before this file's first run, each on every start of E-MTH-0028's 17, pass contact:
//  C1 the no-veto store where no vibe is open: (a) side 8, 96 beats, the vacuum with no open vibe: the composed rule is
//     one configuration equal to vetoBeat('none') bit for bit (vibes, points, stores, words, open bits, amplitude) at
//     every beat; (b) side 8, 96 beats: the coined path equals the uncoined path at every beat on the closed vacuum on
//     the keep, Born and exchange paths, and on the all-open vacuum's keep path, with 0 coin crosses
//  C2 exact per dock: on every dock of the side-4 coined Born-path histories (the all-open vacuum, and the vacuum with
//     one open love at the center, 48 beats, 49 configurations each), the composed dock step (the coin, then the
//     no-veto collision) keeps the norm exactly and its exact inverse returns the dock with amplitude 1. AMENDED after
//     a first run that crashed out of memory at 20 s and read nothing (tmp/rlt104-run1.log): as first written the dock
//     step also held the meetings, and a dock of the all-open vacuum holds up to 12 unequal-point like meetings at once
//     (tmp/cv-probe3: 159 such docks in one start's history), so 4,096 terms forward and 16.7 million on the inverse.
//     The meetings are E-RLT-0100's piece, unchanged here, and are checked inside the composition by C5; the dock step
//     is now the two pieces that meet at a dock, the coin and the collision. No gate had been read.
//  C3 covariant: on every distinct dock of C2's histories (both beat parities), the composed dock step commutes with all
//     1,152 coin maps (as sets of configurations with amplitudes; code/measure/occupation-veto-readings slotMapDock) and
//     with charge conjugation
//  C4 where it differs: on every dock of C2's histories, the composed dock step differs from the uncoined one (the
//     collision alone) exactly when the predicted condition above holds (0 docks against the iff), and it differs on some
//  C5 exact and reversible globally, side 4: (a) E-RLT-0103's like pair (the rule's own first unequal-point like meeting
//     of two vacuum vibes, found by running the classical history back, the vacuum otherwise closed), 48 beats; (b) one
//     open love at the vacuum's center, the vacuum otherwise closed, 16 beats: the norm is exact at every beat, the exact
//     inverse returns the start with amplitude 1, and (b) makes some coin split
// Verdict: pass if C1 to C5 hold on all 17 starts; fail otherwise. PREDICTED: pass.
// Reported, never gated: where the composed vacuum differs on paths (side 8, 96 beats, all-open vacuum): coin crosses,
// the first beat the coined path's occupation differs from the uncoined one and how many beats differ, on the Born and
// exchange paths; docks differing per history; coin splits in the like pair's run (the probe read 0) and the lone run's
// branches and occupations (E-RLT-0105 gates the amplitude question).
//
// PROBES before this file, disclosed: tmp/cv-probe1 (integer+0, pass: the like pair's 48 beats with the coin make 0 coin
// splits, since in the dense vacuum a vacuum vibe never sits alone on a line; norm exact; 8 branches, 1 occupation);
// tmp/cv-probe2 (integer+0, pass, side 4: one open love at the center of the closed vacuum splits on its first beat,
// reaches 417 branches and 162 occupations by beat 16 and 4,148 and 601 by beat 23, norm exact, reversal exact; with the
// whole vacuum open the superposed rule meets at 478 unequal-point like meetings in one beat and is not computable, so
// the superposed runs keep the vacuum closed, as E-RLT-0103's like study does); tmp/cv-probe3 (after the crashed first
// run, integer+0, side 4, the coined Born path of the all-open vacuum over 48 beats: 0 coin crosses, and up to 12
// unequal-point like meetings on one dock).
//
// SECOND RUN (586 s, tmp/rlt104-run2.log, after the C2 amendment above): pass, 17 of 17 on every gate. C1 0
// mismatches superposed and on paths, 0 coin crosses; C2 0 norm and 0 inverse failures over 25,088 docks a start; C3 0
// off over 8,861 to 9,013 distinct docks x 1,152 maps, and C; C4 8,550 docks a start differ, 0 against the iff (on the
// all-open history these are the phases w of full open lines, since no line holds a lone open vibe there); C5 exact and
// reversed on the like pair (0 coin splits, 45 to 151 meeting splits, 1 occupation) and on the lone love (206 to 438
// coin splits, up to 310 terms, 105 to 124 occupations by beat 16). Reported: the all-open vacuum's Born and exchange
// paths make 0 coin crosses in 96 beats, so they are the coinless paths occupation for occupation. Title written after
// the run.
//
// DETERMINISM: no random numbers; starts are E-MTH-0028's family; path choices are integer Weyl numbers. Every number in
// the rule is an exact integer (amplitudes in Z[w] over powers of 2). Depth L2 (C3 exhaustive over its maps and docks).
// Husk: bulk identities of the rule, which hold on every husk column by holding on every dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { cloneConfiguration, lockedNorm, lockedState, mergeBranches, newTally, type Branch, type Configuration, type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { collideVeto, toWords, vetoBeat } from '@/code/rule/occupation-veto-knit'
import { coinBranch, coinedVetoBeat, coinedVetoBeatBack, newCoinTally } from '@/code/rule/coined-locked-knit'
import { sameOccupation, samePoints, vacuumConfiguration, THRESHOLD_BORN, THRESHOLD_EXCHANGE, THRESHOLD_KEEP, type LockedFresh } from '@/code/measure/doublet-locked-readings'
import { conjugateDock, contactFresh, dockKey, dockOf, likePairStart, slotMapDock, vetoPathRunner } from '@/code/measure/occupation-veto-readings'

const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] as number)
const PATHS = [THRESHOLD_KEEP, THRESHOLD_BORN, THRESHOLD_EXCHANGE]
const LIKE_BEATS = 48
const LONE_BEATS = 16

const vacuumOf = (f: LockedFresh, open: 'all' | 'none'): Configuration => toWords(vacuumConfiguration(f, open))

function seeded(f: LockedFresh, open: 'all' | 'none'): Configuration {
  const c = vacuumOf(f, open)
  const slot = centerOf(f.side) * 24

  c.vibe[slot] = 1
  c.open[slot] = 1

  return c
}

// ---- the composed step on one dock, as a set of branches ----

const asBranch = (c: Configuration): Branch => ({ ...cloneConfiguration(c), a: 1n, b: 0n, k: 0 })

function dockStep(tables: LockedTables, d: Configuration, beat: number, coin: boolean): Branch[] {
  const one = { ...tables, cells: 1 }
  const coined = coin ? coinBranch(1, asBranch(d), false) : [asBranch(d)]
  const out: Branch[] = []

  for (const b of mergeBranches(coined)) {
    collideVeto('none', one, b, beat, false)
    out.push(b)
  }

  return mergeBranches(out)
}

function dockStepBack(tables: LockedTables, list: readonly Branch[], beat: number): Branch[] {
  const one = { ...tables, cells: 1 }
  const out: Branch[] = []

  for (const br of list) {
    const b: Branch = { ...cloneConfiguration(br), a: br.a, b: br.b, k: br.k }

    collideVeto('none', one, b, beat, true)
    out.push(...coinBranch(1, b, true))
  }

  return mergeBranches(out)
}

// a set of branches as one key: each branch's dock key with its reduced amplitude, sorted
const setKey = (list: readonly (Configuration & { a: bigint; b: bigint; k: number })[]): string =>
  list
    .map(b => `${dockKey(b)}#${b.a},${b.b},${b.k}`)
    .sort()
    .join('|')

// the predicted condition: a line of one open vibe and an empty slot, or a count of lines of two open vibes not 0 mod 3
function predictedDiffer(d: Configuration): boolean {
  let fullOpen = 0

  for (let l = 0; l < 12; l++) {
    const i = LINE_FIRSTS[l] as number
    const j = LINE_SECONDS[l] as number
    const hi = d.vibe[i] !== 0
    const hj = d.vibe[j] !== 0

    if (hi && hj && d.open[i] && d.open[j]) fullOpen++
    if (hi !== hj && ((hi && d.open[i]) || (hj && d.open[j]))) return true
  }

  return fullOpen % 3 !== 0
}

type DockReading = { docks: number; normOff: number; inverseOff: number; differ: number; iffOff: number; distinct: number; covariance: number; conjugation: number }

function dockChecks(f: LockedFresh, perms: readonly (readonly number[])[]): DockReading {
  const out: DockReading = { docks: 0, normOff: 0, inverseOff: 0, differ: 0, iffOff: 0, distinct: 0, covariance: 0, conjugation: 0 }
  const distinct = new Map<string, { dock: Configuration; beat: number }>()

  for (const start of [vacuumOf(f, 'all'), seeded(f, 'all')]) {
    const run = vetoPathRunner('none', f.tables, start, THRESHOLD_BORN, 0, true)

    for (let t = 0; t <= 48; t++) {
      const c = run.state()

      for (let x = 0; x < f.cells; x++) {
        const d = dockOf(c, x)
        const r = dockStep(f.tables, d, t, true)
        const n = lockedNorm({ branches: r })
        const back = dockStepBack(f.tables, r, t)
        const b0 = back[0]

        out.docks++
        out.normOff += n.total === n.unit ? 0 : 1
        out.inverseOff += back.length === 1 && !!b0 && b0.a === 1n && b0.b === 0n && b0.k === 0 && dockKey(b0) === dockKey(d) ? 0 : 1

        const differs = setKey(r) !== setKey(dockStep(f.tables, d, t, false))

        out.differ += differs ? 1 : 0
        out.iffOff += differs === predictedDiffer(d) ? 0 : 1
        distinct.set(`${t % 2}|${dockKey(d)}`, { dock: d, beat: t })
      }

      run.beat()
    }
  }

  out.distinct = distinct.size

  for (const { dock, beat } of distinct.values()) {
    const r = dockStep(f.tables, dock, beat, true)

    for (const g of perms) {
      const mapped = r.map(b => ({ ...slotMapDock(b, g), a: b.a, b: b.b, k: b.k }))

      out.covariance += setKey(dockStep(f.tables, slotMapDock(dock, g), beat, true)) === setKey(mapped) ? 0 : 1
    }

    const conj = r.map(b => ({ ...conjugateDock(b), a: b.a, b: b.b, k: b.k }))

    out.conjugation += setKey(dockStep(f.tables, conjugateDock(dock), beat, true)) === setKey(conj) ? 0 : 1
  }

  return out
}

// ---- C1 ----
function closedAgree(f: LockedFresh, beats: number): { superposed: number; paths: number; crossed: number } {
  const tally = newTally()
  let mine: LockedState = lockedState(vacuumOf(f, 'none'))
  let old: LockedState = lockedState(vacuumOf(f, 'none'))
  let superposed = 0

  for (let t = 0; t < beats; t++) {
    mine = coinedVetoBeat('none', f.tables, mine, t, tally)
    old = vetoBeat('none', f.tables, old, t)

    const m = mine.branches[0]
    const o = old.branches[0]

    superposed += mine.branches.length === 1 && old.branches.length === 1 && !!m && !!o && samePoints(m, o) && m.a === o.a && m.b === o.b && m.k === o.k && m.open.every((v, i) => v === o.open[i] || o.vibe[i] === 0) && m.sopen.every((v, i) => v === o.sopen[i] || o.store[i] === 0) ? 0 : 1
  }

  let paths = 0
  let crossed = 0
  const cases: [Configuration, number][] = [...PATHS.map((th): [Configuration, number] => [vacuumOf(f, 'none'), th]), [vacuumOf(f, 'all'), THRESHOLD_KEEP]]

  for (const [start, th] of cases) {
    const a = vetoPathRunner('none', f.tables, start, th, 0, true)
    const b = vetoPathRunner('none', f.tables, start, th, 0, false)

    for (let t = 0; t < beats; t++) {
      a.beat()
      b.beat()
      paths += samePoints(a.state(), b.state()) ? 0 : 1
    }

    crossed += a.crossed()
  }

  return { superposed, paths, crossed }
}

// ---- C5 ----
type Global = { found: boolean; clean: boolean; normExact: boolean; reversed: boolean; coinSplits: number; meetingSplits: number; branchesMax: number; occupations: number }

function globalRun(f: LockedFresh, start: Configuration | undefined, beats: number, clean: boolean): Global {
  if (!start) return { found: false, clean: false, normExact: false, reversed: false, coinSplits: 0, meetingSplits: 0, branchesMax: 0, occupations: 0 }

  const tally = newTally()
  const coins = newCoinTally()
  let s: LockedState = lockedState(start)
  let normExact = true
  let branchesMax = 1

  for (let t = 0; t < beats; t++) {
    s = coinedVetoBeat('none', f.tables, s, t, tally, coins)

    const n = lockedNorm(s)

    normExact = normExact && n.total === n.unit
    branchesMax = Math.max(branchesMax, s.branches.length)
  }

  const occupations: Configuration[] = []

  for (const b of s.branches) if (!occupations.some(o => sameOccupation(o, b))) occupations.push(b)

  let back = s

  for (let t = beats - 1; t >= 0; t--) back = coinedVetoBeatBack('none', f.tables, back, t)

  const b0 = back.branches[0]
  const reversed = back.branches.length === 1 && !!b0 && b0.a === 1n && b0.b === 0n && b0.k === 0 && samePoints(b0, start) && b0.sopen.every((v, i) => v === start.sopen[i] || start.store[i] === 0) && b0.open.every((v, i) => v === start.open[i] || start.vibe[i] === 0)

  return { found: true, clean, normExact, reversed, coinSplits: coins.splits, meetingSplits: tally.splitMeetings, branchesMax, occupations: occupations.length }
}

// ---- reported: where the coined vacuum differs on paths ----
function pathDiffer(f: LockedFresh, threshold: number, beats: number): { crossed: number; firstDiffer: number; beatsDiffer: number } {
  const a = vetoPathRunner('none', f.tables, vacuumOf(f, 'all'), threshold, 0, true)
  const b = vetoPathRunner('none', f.tables, vacuumOf(f, 'all'), threshold, 0, false)
  let firstDiffer = -1
  let beatsDiffer = 0

  for (let t = 0; t < beats; t++) {
    a.beat()
    b.beat()

    if (!sameOccupation(a.state(), b.state())) {
      beatsDiffer++
      if (firstDiffer < 0) firstDiffer = t
    }
  }

  return { crossed: a.crossed(), firstDiffer, beatsDiffer }
}

type PerStart = { name: string; closed: ReturnType<typeof closedAgree>; dock: DockReading; like: Global; lone: Global; born: ReturnType<typeof pathDiffer>; exchange: ReturnType<typeof pathDiffer> }

export default experiment({
  id: 'relativity/coined-store-build',
  code: 'E-RLT-0104',
  title:
    'the covariant coin composed with the no-veto two-point store under the pass contact, as a rule, pass: exact and reversible per dock (0 of 25,088 docks a start) and globally (17 of 17), covariant under all 1,152 coin maps and C (0 off over about 8,900 distinct docks), the no-veto store bit for bit where no vibe is open (0 mismatches over 96 beats, superposed and on every path), and different exactly where the predicted condition holds (0 against the iff); the vacuum makes 0 coin crosses on every path since no vacuum vibe is alone on its line, while a lone open love splits at once (105 to 124 occupations by beat 16)',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const perms = groupTable().permutations
    const family = startFamily(16)
    const perStart: PerStart[] = family.map(member =>
      withStart(member, () => {
        const f4 = contactFresh(4, 'pass')
        const f8 = contactFresh(8, 'pass')
        const closed = closedAgree(f8, 96)
        const dock = dockChecks(f4, perms)
        const pick = likePairStart('none', f4.tables, vacuumOf(f4, 'none'), 12)
        const like = globalRun(f4, pick?.start, LIKE_BEATS, pick?.clean ?? false)
        const lone = globalRun(f4, seeded(f4, 'none'), LONE_BEATS, true)
        const born = pathDiffer(f8, THRESHOLD_BORN, 96)
        const exchange = pathDiffer(f8, THRESHOLD_EXCHANGE, 96)

        log(`start ${member.name}`)

        return { name: member.name, closed, dock, like, lone, born, exchange }
      }),
    )

    const c1 = (p: PerStart): boolean => p.closed.superposed === 0 && p.closed.paths === 0 && p.closed.crossed === 0
    const c2 = (p: PerStart): boolean => p.dock.normOff === 0 && p.dock.inverseOff === 0 && p.dock.docks > 0
    const c3 = (p: PerStart): boolean => p.dock.covariance === 0 && p.dock.conjugation === 0 && p.dock.distinct > 0
    const c4 = (p: PerStart): boolean => p.dock.iffOff === 0 && p.dock.differ > 0
    const c5 = (p: PerStart): boolean => p.like.found && p.like.clean && p.like.normExact && p.like.reversed && p.lone.normExact && p.lone.reversed && p.lone.coinSplits > 0
    const gates = { C1: c1, C2: c2, C3: c3, C4: c4, C5: c5 }
    const counts = Object.fromEntries(Object.entries(gates).map(([name, test]) => [name, perStart.filter(test).length])) as Record<keyof typeof gates, number>
    const status = Object.values(counts).every(n => n === family.length) ? 'pass' : 'fail'
    const range = (xs: number[]): string => (Math.min(...xs) === Math.max(...xs) ? `${Math.min(...xs)}` : `${Math.min(...xs)} to ${Math.max(...xs)}`)
    const over = (f: (p: PerStart) => number): string => range(perStart.map(f))
    const metrics: Record<string, number> = { starts: family.length }

    for (const [name, n] of Object.entries(counts)) {
      metrics[name] = n
      metrics[`gate${name}`] = n === family.length ? 1 : 0
    }

    metrics.docksPerStart = perStart[0]!.dock.docks
    metrics.distinctDocksMin = Math.min(...perStart.map(p => p.dock.distinct))
    metrics.covarianceOff = perStart.reduce((s, p) => s + p.dock.covariance, 0)
    metrics.iffOff = perStart.reduce((s, p) => s + p.dock.iffOff, 0)
    metrics.docksDifferMax = Math.max(...perStart.map(p => p.dock.differ))
    metrics.likeCoinSplitsMax = Math.max(...perStart.map(p => p.like.coinSplits))
    metrics.loneOccupationsMin = Math.min(...perStart.map(p => p.lone.occupations))
    metrics.loneBranchesMax = Math.max(...perStart.map(p => p.lone.branchesMax))
    metrics.bornCrossedMax = Math.max(...perStart.map(p => p.born.crossed))
    metrics.bornBeatsDifferMax = Math.max(...perStart.map(p => p.born.beatsDiffer))
    metrics.exchangeCrossedMax = Math.max(...perStart.map(p => p.exchange.crossed))
    metrics.exchangeBeatsDifferMax = Math.max(...perStart.map(p => p.exchange.beatsDiffer))
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `pass contact, no-veto store, coin on: gates ${JSON.stringify(counts)} of ${family.length}. C1 closed vacuum superposed mismatches ${over(p => p.closed.superposed)}, path mismatches ${over(p => p.closed.paths)}, coin crosses ${over(p => p.closed.crossed)}; C2 over ${perStart[0]!.dock.docks} docks a start, norm off ${over(p => p.dock.normOff)}, inverse off ${over(p => p.dock.inverseOff)}; C3 over ${over(p => p.dock.distinct)} distinct docks x 1,152 maps ${over(p => p.dock.covariance)} off, C ${over(p => p.dock.conjugation)} off; C4 docks differing ${over(p => p.dock.differ)}, against the iff ${over(p => p.dock.iffOff)}; C5 like pair norm ${perStart.filter(p => p.like.normExact).length} reversed ${perStart.filter(p => p.like.reversed).length} (coin splits ${over(p => p.like.coinSplits)}, meeting splits ${over(p => p.like.meetingSplits)}, occupations ${over(p => p.like.occupations)}), lone love norm ${perStart.filter(p => p.lone.normExact).length} reversed ${perStart.filter(p => p.lone.reversed).length} (coin splits ${over(p => p.lone.coinSplits)}, branches up to ${over(p => p.lone.branchesMax)}, occupations at beat ${LONE_BEATS} ${over(p => p.lone.occupations)}). Where the all-open vacuum differs (side 8, 96 beats): Born path ${over(p => p.born.crossed)} coin crosses, first differing beat ${over(p => p.born.firstDiffer)}, beats differing ${over(p => p.born.beatsDiffer)}; exchange path ${over(p => p.exchange.crossed)} crosses, first ${over(p => p.exchange.firstDiffer)}, beats differing ${over(p => p.exchange.beatsDiffer)}`,
      metrics,
      notes: `L2 (C3 exhaustive over its maps and docks). No fermion sign (not written for a configuration holding a store). Per start (C1 superposed/paths/crosses; C2 norm/inverse off; C4 differ/iff off; C3 distinct, off, C off; like splits coin/meeting, occupations; lone splits, branches, occupations; born crosses/first/differ; exchange crosses/first/differ): ${perStart
        .map(p => `${p.name} ${p.closed.superposed}/${p.closed.paths}/${p.closed.crossed}; ${p.dock.normOff}/${p.dock.inverseOff}; ${p.dock.differ}/${p.dock.iffOff}; ${p.dock.distinct}, ${p.dock.covariance}, ${p.dock.conjugation}; ${p.like.coinSplits}/${p.like.meetingSplits}, ${p.like.occupations}; ${p.lone.coinSplits}, ${p.lone.branchesMax}, ${p.lone.occupations}; ${p.born.crossed}/${p.born.firstDiffer}/${p.born.beatsDiffer}; ${p.exchange.crossed}/${p.exchange.firstDiffer}/${p.exchange.beatsDiffer}`)
        .join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
