// Intelligence level 6, slice 1:
// can the SELECTION step of an improve loop run as mesh dynamics while the evaluator stays outside? The evaluator
// grades each candidate alone and writes each candidate's own score (one trit, through a code of its choosing) beside
// the candidate's content (one trit). A selector is a line layout of a pair rule, a pair of codes and a read such
// that, for every content pair and every strictly ordered score pair, the read holds the better candidate's content.
//
// Algebra: spin-1 tones. Regime: pure. The census covers all 56 quiet rule-background cells of the 24 pair rules on
// the line (brick schedule), windows of width 4 to 6, reads to round 8; L = 2 levels is the positive control, L = 3
// the test, L = 4 reported.
//
// Gates, fixed before the first run, each able to fail:
// - G1 the split: 24 species, 32 reactive, 16 live-vacuum cells; types T0 3, T1 3, T2 3, T3 3, T4 6, T5 6.
// - G2 Lemma S by brute force: no one-score selector (constants included) works at L = 3; sA ? A : B works at L = 2.
// - G3 Lemma P live: 0 selectors at any level in every T0, T3, T4 and T5 cell.
// - G4 positive control: some cell has an L = 2 selector.
// - G5 every kept example replays under lineBrickRun on every input; the import-free runner equals lineBrickRun frame
//   for frame on every width-4 layout of every cell for one input.
// - G6 every kept example with its codes read in reverse order (each written tone moved to the mirrored level) is
//   refused by the replay. An audit found this cannot fail for a selector that replays: reversed codes pick the
//   worse content on every strictly ordered pair by construction. It is now reported as a checker check, and G6 is
//   replaced by: every single code value changed is judged by the census's
//   own runner and by lineBrickRun, the two verdicts agree on every change, and at least one change is refused.
// - G7 a second census of two cells gives identical digests; no random or clock source in the new files.

import { resolve } from 'node:path'
import { splitCell, type SpeciesType } from '@/code/compute/lab/counter'
import { gateRule, lineBrickRun, type GateRule } from '@/code/compute/lab/gates'
import { scanIntelligenceSources } from '@/code/intelligence/benchmark/source-scan'
import {
  fill,
  runLine,
  selectionCensus,
  selectorHolds,
  skeletons,
  type Census,
  type PairMap,
  type Selector,
} from '@/code/intelligence/improve/mesh/selection'
import { pairRuleCensus } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const NEW_FILES = ['code/intelligence/improve/mesh/selection.ts', 'test/experiment/intelligence/mesh-selection.ts']

// ---- parameters, fixed before the first run ----

const MIN_WIDTH = 4
const MAX_WIDTH = 6
const ROUNDS = 8
const LEVELS = [2, 3, 4] as const
const PINNED: readonly SpeciesType[] = ['T0', 'T3', 'T4', 'T5']

interface CellRow {
  rule: GateRule
  name: string
  background: number
  kind: string
  type: SpeciesType | null
  census: Census
}

// the census's own import-free runner, for the single-change cross-check
const censusRunner = (input: { rule: PairMap; background: number; start: number; window: ArrayLike<number>; rounds: number }) => runLine(input)

const brick = (input: { rule: PairMap; background: number; start: number; window: ArrayLike<number>; rounds: number }) =>
  lineBrickRun({ rule: input.rule as GateRule, background: input.background, start: input.start, window: input.window, rounds: input.rounds }).frames

// G2: every selector that reads one candidate's score alone (a map level -> winner), constants included
function oneScoreSelectors(levels: number): { tried: number; working: number } {
  let tried = 0
  let working = 0

  for (const reads of ['A', 'B'] as const) {
    for (let f = 0; f < 2 ** levels; f++) {
      tried++

      let ok = true

      for (let sA = 0; sA < levels && ok; sA++) {
        for (let sB = 0; sB < levels && ok; sB++) {
          if (sA === sB) {
            continue
          }

          const s = reads === 'A' ? sA : sB
          const picksA = ((f >> s) & 1) === 1

          if (picksA !== sA > sB) {
            ok = false
          }
        }
      }

      if (ok) {
        working++
      }
    }
  }

  return { tried, working }
}

function reversed(s: Selector): Selector {
  return { ...s, codeA: [...s.codeA].reverse(), codeB: [...s.codeB].reverse() }
}

function describe(s: Selector): string {
  const window = s.skeleton.constants
    .map((t, i) =>
      i === s.skeleton.at.contentA ? 'a' : i === s.skeleton.at.contentB ? 'b' : i === s.skeleton.at.scoreA ? 'sA' : i === s.skeleton.at.scoreB ? 'sB' : String(t),
    )
    .join(' ')
  const offset = s.cell - (s.skeleton.start + 2 * s.rounds + 2)

  return `[${window}] parity ${s.skeleton.start}, codes A ${s.codeA.join(',')} B ${s.codeB.join(',')}, read window cell ${offset} at round ${s.round}`
}

export default experiment({
  id: 'intelligence/mesh-selection',
  code: 'E-CMP-0068',
  title:
    'intelligence level 6, slice 1: whether the selection step of an improve loop runs as mesh dynamics with the evaluator outside; a census over all 56 quiet pair-rule cells on the line of layouts that route the better candidate\'s content to a read cell from two separately written scores, with the one-score lemma, the pinned-content lemma for T0, T3, T4 and T5, a two-level positive control and an independent replay',
  category: 'computation',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const control: Record<string, number> = {}
    const failures: string[] = []
    const fail = (why: string): void => {
      failures.push(why)
    }

    // ---- G1 the split ----

    const census = pairRuleCensus()
    const rows: CellRow[] = []
    const kinds: Record<string, number> = { species: 0, reactive: 0, live_vacuum: 0 }
    const types: Record<string, number> = {}

    for (const r of census.rules) {
      const rule = gateRule(r.name, r.table)

      for (const background of [-1, 0, 1]) {
        const split = splitCell(rule, background)

        kinds[split.kind] = kinds[split.kind]! + 1

        if (split.type !== null) {
          types[split.type] = (types[split.type] ?? 0) + 1
        }

        if (split.kind === 'live_vacuum') {
          continue
        }

        rows.push({
          rule,
          name: r.name,
          background,
          kind: split.kind,
          type: split.type,
          census: selectionCensus({ rule, background, minWidth: MIN_WIDTH, maxWidth: MAX_WIDTH, rounds: ROUNDS, levels: LEVELS }),
        })
      }
    }

    const wantTypes: Record<string, number> = { T0: 3, T1: 3, T2: 3, T3: 3, T4: 6, T5: 6 }

    if (kinds.species !== 24 || kinds.reactive !== 32 || kinds.live_vacuum !== 16) {
      fail(`split ${JSON.stringify(kinds)}`)
    }

    for (const [t, n] of Object.entries(wantTypes)) {
      if (types[t] !== n) {
        fail(`type ${t}: ${types[t] ?? 0} cells, want ${n}`)
      }
    }

    // ---- G2 Lemma S ----

    const s3 = oneScoreSelectors(3)
    const s2 = oneScoreSelectors(2)

    if (s3.working !== 0) {
      fail(`${s3.working} one-score selectors work at L = 3`)
    }

    if (s2.working === 0) {
      fail('no one-score selector works at L = 2 (sA ? A : B must)')
    }

    control.oneScoreTriedL3 = s3.tried
    control.oneScoreWorkingL3 = s3.working
    control.oneScoreWorkingL2 = s2.working

    // ---- G3 Lemma P, G4 positive control ----

    const pinnedHits = rows.filter(r => r.type !== null && PINNED.includes(r.type)).reduce((n, r) => n + LEVELS.reduce((m, L) => m + r.census.selectorReads[L]!, 0), 0)

    if (pinnedHits !== 0) {
      fail(`${pinnedHits} selector reads in T0, T3, T4, T5 cells (Lemma P says none)`)
    }

    const level2Cells = rows.filter(r => r.census.selectorReads[2]! > 0)

    if (level2Cells.length === 0) {
      fail('positive control: no cell has a two-level selector')
    }

    // ---- G5 replay of every kept example, G6 reversed codes refused ----

    let replayed = 0
    let replayWrong = 0
    let reversedRefused = 0
    let reversedTried = 0
    let singleChanges = 0
    let singleStillValid = 0
    let singleDisagree = 0

    for (const row of rows) {
      const contents = [-1, 0, 1].filter(t => t !== row.background)

      for (const L of LEVELS) {
        const example = row.census.examples[L]

        if (example === null || example === undefined) {
          continue
        }

        const held = selectorHolds(example, row.rule, row.background, contents, brick)

        replayed++

        if (held.wrong !== 0) {
          replayWrong++
          fail(`${row.name}/${row.background} L ${L}: replay wrong on ${held.wrong} of ${held.inputs}`)
        }

        // a checker check, not evidence about the selector: reversed codes pick the worse content on
        // every strictly ordered pair by construction, so this can fail only if the replay checker is broken
        const bad = selectorHolds(reversed(example), row.rule, row.background, contents, brick)

        reversedTried++
        reversedRefused += bad.wrong > 0 ? 1 : 0

        // a follow-up: every single code value changed, judged twice, by the census's own
        // import-free runner and by lineBrickRun. A change may leave a valid selector or break it, so neither verdict is
        // fixed by construction; the control fails when the two runners disagree on any change, or when no change is
        // refused (the checker would not discriminate)
        for (const side of ['codeA', 'codeB'] as const) {
          for (let level = 0; level < L; level++) {
            for (const tone of [-1, 0, 1]) {
              if (tone === example[side][level]) {
                continue
              }

              const changed: Selector = { ...example, [side]: example[side].map((t, i) => (i === level ? tone : t)) }
              const census = selectorHolds(changed, row.rule, row.background, contents, censusRunner).wrong === 0
              const replay = selectorHolds(changed, row.rule, row.background, contents, brick).wrong === 0

              singleChanges++
              singleStillValid += census ? 1 : 0

              if (census !== replay) {
                singleDisagree++
                fail(`${row.name}/${row.background} L ${L}: a changed code is ${census ? 'valid' : 'refused'} by the census runner and ${replay ? 'valid' : 'refused'} by lineBrickRun`)
              }
            }
          }
        }
      }
    }

    control.singleCodeChanges = singleChanges
    control.singleCodeChangesStillValid = singleStillValid
    control.singleCodeChangesRefused = singleChanges - singleStillValid
    control.singleCodeChangesRunnersDisagree = singleDisagree

    if (singleChanges === 0 || singleChanges - singleStillValid === 0) {
      fail(`single code changes: ${singleChanges} tried, none refused, so the replay does not discriminate`)
    }

    // the import-free runner against lineBrickRun, frame for frame, on every width-4 layout of every cell
    let framesCompared = 0
    let frameMismatches = 0

    for (const row of rows) {
      const [u, v] = [-1, 0, 1].filter(t => t !== row.background) as [number, number]

      for (const skeleton of skeletons(MIN_WIDTH, MIN_WIDTH, row.background)) {
        const window = fill(skeleton, { a: u, b: v, scoreA: v, scoreB: u })
        const mine = runLine({ rule: row.rule, background: row.background, start: skeleton.start, window, rounds: ROUNDS })
        const theirs = brick({ rule: row.rule, background: row.background, start: skeleton.start, window, rounds: ROUNDS })

        for (let t = 0; t <= ROUNDS; t++) {
          framesCompared++

          if (mine[t]!.length !== theirs[t]!.length || mine[t]!.some((x, i) => x !== theirs[t]![i])) {
            frameMismatches++
          }
        }
      }
    }

    if (frameMismatches !== 0) {
      fail(`runner differs from lineBrickRun on ${frameMismatches} of ${framesCompared} frames`)
    }

    // ---- G7 determinism and sources ----

    const again = rows
      .filter(r => (r.name === 'id.CBA.id' && r.background === 0) || (r.name === 'swap.ABC.swap' && r.background === 0))
      .map(r => [r.census.digest, selectionCensus({ rule: r.rule, background: r.background, minWidth: MIN_WIDTH, maxWidth: MAX_WIDTH, rounds: ROUNDS, levels: LEVELS }).digest])

    if (again.length !== 2 || again.some(([x, y]) => x !== y)) {
      fail('a second census gave a different digest')
    }

    const { files, findings } = scanIntelligenceSources(BASE, NEW_FILES.slice(1))

    if (findings.length > 0) {
      fail(`random or clock source: ${findings.map(f => `${f.file}:${f.line} ${f.kind}`).join(', ')}`)
    }

    // ---- what was found ----

    const byLevel = (L: number) => rows.filter(r => r.census.selectorReads[L]! > 0)
    const label = (r: CellRow) => `${r.name}/${r.background > 0 ? '+1' : r.background}${r.type === null ? ' (reactive)' : ` (${r.type})`}`
    const sum = (L: number) => rows.reduce((n, r) => n + r.census.selectorReads[L]!, 0)
    const level3 = byLevel(3)
    const level3Species = level3.filter(r => r.kind === 'species')
    const t2Level3 = rows.filter(r => r.type === 'T2').reduce((n, r) => n + r.census.selectorReads[3]!, 0)
    const t1Level4 = rows.filter(r => r.type === 'T1' || r.type === 'T2').reduce((n, r) => n + r.census.selectorReads[4]!, 0)
    const lead = level3.length > 0

    metrics.cells = rows.length
    metrics.skeletonsPerCell = rows[0]!.census.skeletons
    metrics.runs = rows.reduce((n, r) => n + r.census.runs, 0)

    for (const L of LEVELS) {
      metrics[`selectorReadsL${L}`] = sum(L)
      metrics[`cellsWithSelectorL${L}`] = byLevel(L).length
    }

    metrics.speciesCellsWithSelectorL3 = level3Species.length
    metrics.t2SelectorReadsL3 = t2Level3
    metrics.t1t2SelectorReadsL4 = t1Level4
    metrics.pinnedSelectorReads = pinnedHits
    metrics.examplesReplayed = replayed
    metrics.examplesReplayWrong = replayWrong
    metrics.framesCompared = framesCompared
    metrics.frameMismatches = frameMismatches
    metrics.sourceFilesScanned = files.length
    metrics.failures = failures.length
    control.reversedRefused = reversedRefused
    control.reversedTried = reversedTried

    const exampleOf = (name: string, background: number, L: number): string => {
      const row = rows.find(r => r.name === name && r.background === background)
      const e = row?.census.examples[L]

      return e === null || e === undefined ? 'none' : describe(e)
    }
    const table = rows
      .filter(r => LEVELS.some(L => r.census.selectorReads[L]! > 0))
      .map(r => `${label(r)} ${LEVELS.map(L => `L${L} ${r.census.selectorReads[L]}${r.census.minWidth[L] === null ? '' : ` (w${r.census.minWidth[L]})`}`).join(' ')}`)
      .join('; ')
    const ok = failures.length === 0
    const verdictText = lead
      ? `a one-shot mesh selector over three score levels exists on the line in ${level3.length} cells (${level3.map(label).join(', ')}): a construction lead for the selection step, not yet a loop`
      : 'no cell has a three-level selector within these bounds: a bounded absence on the line'

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `intelligence level 6, slice 1: with the evaluator outside writing each candidate's own score as one trit through any code, ${verdictText}; ${sum(3)} three-level selector reads in all, and ${level2Cells.length} cells have a two-level selector (the positive control); no selector exists at any level in the 18 T0, T3, T4 and T5 cells (Lemma P: the read is pinned to one start cell's content there, on any graph and schedule; 0 found), and the three T2 cells have ${t2Level3} three-level selector reads; no one-score selector works at three levels (0 of ${s3.tried}), so every three-level selector reads both scores; in T1 the scores set occupancy and the cavity length decides which content arrives, so a score trit acts as one threshold bit, and T1 and T2 have ${t1Level4} four-level selector reads; every kept example replays under lineBrickRun on every input, and every one of its ${singleChanges} single code changes gets the same verdict from the census's runner and from lineBrickRun (${singleChanges - singleStillValid} refused, ${singleStillValid} still a selector; the reversed-code check, ${reversedRefused} of ${reversedTried} refused, is a checker check only); the loop is not built: a T1 content is a passive tone that never routes anything (M6), so a mesh proposer could adapt only by reading raw score bits, and the best loop this slice supports is the fixed-order proposer with mesh selection (E-CMP-0031: 6 of 52 hits, mean final Q 0.905, against the learning loop's 19 of 54 and 1.107), and no M1 rule keeps an M9 boundary`,
      metrics,
      control,
      notes: `L2. Census per cell (selector reads, smallest width), cells with any: ${table}. Example in id.CBA.id on the vacuum (the M4 register's rule at spacing 1): ${exampleOf('id.CBA.id', 0, 3)}; A's score cell is occupied for levels 0 and 1, B's for level 0 only, the occupied run is a cavity whose brick permutation is a 4-cycle, a 3-cycle or a swap by its length, and after 3 rounds the read holds b exactly when A's cell is occupied and B's is empty, which on strictly ordered pairs is sB > sA. Reactive example: ${exampleOf('id.ACB.swap', -1, 3)}. Bounds: widths ${MIN_WIDTH} to ${MAX_WIDTH}, four role cells, any constant elsewhere, both parities, reads to round ${ROUNDS} on any cell (no wire riding), contents over the two excitations, ${metrics.skeletonsPerCell} layouts and ${metrics.runs} line runs. The four one-law reactive cells compute min and max only at line width 12 (E-CMP-0061), beyond this census; on the line every finite start of a species cell or a one-sided-wire reactive cell has finitely many interactions, so a closed run holds only bounded selection and each generation needs the evaluator's new injection. Not run: the carrier, the proposer, metered rounds, held-out Q; multi-cell scores; the tilings. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})
