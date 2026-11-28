// The evaluator's metered mesh round on a declared background. Before this change the metered round padded the line with tone 0, so only rules on the
// vacuum could be metered; every reactive cell lives on +1 or -1. The layout may now declare its background (0, +1 or
// -1, 0 when left out), validated as data and folded into the metered digest; the rule is still looked up by name.
//
// An instrument certificate and its controls, not a physics claim. Algebra: spin-1 tones. Schedule: the brick line.
//
// Gates, each able to fail:
// - B1 on every reactive cell on +1 and -1 (splitCell of the fiber rules, in fiber order) and every one of the 9 words
//   of a width-6 window, the evaluator's runner equals lineBrickRun cell for cell at every round end.
// - B2 the headline cell (the first reactive cell on +1), and every other reactive cell, run METERED through the
//   sandbox: a clean solve, one meter entry naming the rule, the layout and its background, 9 runs, 36 rounds, the pair
//   updates of the runner, the frame digest recomputed by the judge from lineBrickRun's final frames, and the read cells
//   answered to the candidate equal to lineBrickRun's; the headline read takes at least 2 values over the 9 words.
// - B3 the parameter matters: the same window and words run on the vacuum (the pre-0032 padding) differ from the +1
//   run of the headline cell on at least one word.
// - B4 every current caller is unchanged: a vacuum layout with its background left out and with background 0 meter the
//   same runs, pair updates, reads and digest (as first fixed: equal to the pre-0032 formula; restated below).
// - B5 a wrong background (2, -2, null, '1', 0.5, true, [1], {}, NaN) is refused by the evaluator with no run metered,
//   and the exported runner throws on one; an unknown rule name on +1 is refused.
// - B6 the background is in the digest beyond the frames: the +1 meter differs from the same frames folded as the
//   vacuum, and from the same frames folded as -1.
// Added after the audit, each able to fail:
// - B4 restated: the digest is the SHA-256 chain of solver/mesh/mesh-digest.ts, so the vacuum default must equal the
//   judge's chain on the vacuum (the pre-0037 sum is gone for every caller).
// - B7 the chain's SHA-256 equals node:crypto on 304 inputs.
// - B8 the step-fitting forger: wrong words, the step fitted so the pre-0037 sum hits the judge's target; a pre-0037
//   judge accepts it, the chain refuses it, and no admissible step (0 to 10^6) fits the chain with its words.
// - B9 a reordered request and another step change the chain; the pre-0037 sum did not see the order.
// - B10 a layout with no input, or a read outside the final light cone, is refused with no run metered; reads on the
//   cone's edge are admitted.

import { createHash } from 'node:crypto'
import { splitCell } from '@/code/compute/lab/counter'
import { gateRule, inputsOf, lineBrickRun, type GateRule } from '@/code/compute/lab/gates'
import { BACKGROUND_PROBE_ID } from '@/code/intelligence/control/mesh-background-probe'
import { LEGACY_STEP_LIMIT, fitLegacyStep, legacyDigest, legacyKeyHash } from '@/code/intelligence/control/mesh-step-forger'
import { candidate, evaluate, meshFrameHash, meshLineLength, meshLineRun, type Grade, type MeshLayoutSpec } from '@/code/intelligence/problem/evaluate'
import { meshChain, meshKeyHash, sha256, type MeshDigestRun } from '@/code/intelligence/solver/mesh/mesh-digest'
import type { Problem } from '@/code/intelligence/problem/problem'
import { isolationCounts } from '@/code/intelligence/sandbox/channel'
import { pairRulesFromFibers } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// ---- parameters, fixed before the first run ----

const PROBE = 'code/intelligence/control/mesh-background-probe'
const START = 4
const WIDTH = 6
const INPUTS = [1, 4]
// the first input's cell, where the headline cell reads 3 values over the 9 words after 4 rounds (an exploratory probe
// ran before this was fixed; offset 2 reads one value on every word)
const READ_OFFSET = 1
const READ_ROUND = 4
const STEP = 3
const VACUUM_RULE = 'id.CBA.swap'
const WORDS = inputsOf(INPUTS.length)
const WRONG_BACKGROUNDS: readonly unknown[] = [2, -2, null, '1', 0.5, true, [1], {}, Number.NaN]

const layoutOn = (background: number | undefined): MeshLayoutSpec => ({
  start: START,
  window: new Array<number>(WIDTH).fill(background ?? 0),
  inputs: INPUTS,
  readPosition: START + READ_OFFSET,
  readRound: READ_ROUND,
  ...(background === undefined ? {} : { background }),
})

// ---- the probe problem (evaluator side): the initial state is the goal, only the metered runs matter ----

interface ProbeState {
  name: string
}

function probeProblem(id: string): Problem<ProbeState> {
  return {
    id,
    regime: 'pure',
    initial: { name: id },
    goal: () => true,
    distance: () => 0,
    budget: { steps: 1, expansions: 8, memoryBytes: 1_000_000 },
    key: state => `probe ${state.name}`,
    links: () => null,
    bytes: state => 2 * state.name.length + 12,
  }
}

const FIBERS = pairRulesFromFibers().map(rule => gateRule(rule.name, rule.table))
const BY_NAME = new Map(FIBERS.map(rule => [rule.name, rule]))

/** The judge's own run of one word (lineBrickRun): every frame, the read and the final frame hash. */
function judgeRun(rule: GateRule, background: number, word: readonly number[]): { frames: Int8Array[]; value: number; frameHash: number } {
  const layout = layoutOn(background)
  const window = layout.window.slice()

  layout.inputs.forEach((offset, j) => {
    window[offset] = word[j]!
  })

  const run = lineBrickRun({ rule, background, start: layout.start, window, rounds: layout.readRound })
  const frame = run.frames[layout.readRound]!

  return { frames: run.frames, value: frame[layout.readPosition + run.pad]!, frameHash: meshFrameHash(frame, frame.length) }
}

/** The runs of one batch of words as the digest reads them, run on `background`. */
function judgeRequest(rule: GateRule, background: number, keyHash: number, words: readonly (readonly number[])[]): MeshDigestRun[] {
  return words.map(word => {
    const run = judgeRun(rule, background, word)

    return { keyHash, word, frameHash: run.frameHash, value: run.value }
  })
}

/**
 * The digest a judge recomputes for one batch of the probe (the 9 words in order, one request at `step`), the runs made
 * on `background` and the chain seeded with a layout naming `fold` (the chain of mesh-digest.ts).
 */
function judgeDigest(rule: GateRule, background: number, keyHash: number, fold: number, step = STEP, words: readonly (readonly number[])[] = WORDS): number {
  return meshChain(rule.name, { ...layoutOn(background), background: fold }).fold(step, judgeRequest(rule, background, keyHash, words))
}

const residues = (values: readonly number[]): string => values.map(v => (v === -1 ? '2' : String(v))).join('')

function meteredProbe(id: string, rule: string, layout: Record<string, unknown>): Grade<ProbeState> {
  const spec = candidate(PROBE, 'meshBackgroundProbe', { rule, layout, words: WORDS.flat(), arity: INPUTS.length, step: STEP })

  return evaluate(spec, probeProblem(id), [])
}

export default experiment({
  id: 'intelligence/mesh-background',
  code: 'E-CMP-0084',
  title:
    "the evaluator's metered mesh round on a declared background tone (0, +1, -1): every reactive pair-rule cell on +1 and -1 run through the sandbox, certified cell for cell against lineBrickRun, with the vacuum default unchanged and wrong backgrounds refused",
  category: 'computation',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const isolationBefore = isolationCounts()
    const metrics: Record<string, number> = {}
    const control: Record<string, number> = {}
    const failures: string[] = []

    const fail = (message: string): void => {
      if (failures.length < 40) {
        failures.push(message)
      }
    }

    // ---- the cells: every reactive cell on +1 and -1, in fiber order ----
    const cells: { rule: GateRule; background: number }[] = []

    for (const background of [1, -1]) {
      for (const rule of FIBERS) {
        if (splitCell(rule, background).kind === 'reactive') {
          cells.push({ rule, background })
        }
      }
    }

    const headline = cells[0]

    if (headline?.background !== 1) {
      fail('no reactive cell on +1')
    }

    metrics.reactiveCells = cells.length
    metrics.reactiveCellsPlus = cells.filter(c => c.background === 1).length

    // ---- B1 the runner against lineBrickRun, cell for cell at every round end ----
    let frameComparisons = 0
    let frameDifferences = 0

    for (const { rule, background } of cells) {
      const layout = layoutOn(background)
      const line = new Int8Array(meshLineLength(layout))
      const table = Int8Array.from(rule.table)

      for (const word of WORDS) {
        const frames: Int8Array[] = []
        const run = meshLineRun(table, layout, word, line, frames)
        const judged = judgeRun(rule, background, word)

        if (frames.length !== judged.frames.length) {
          frameDifferences++
          continue
        }

        for (let t = 0; t < frames.length; t++) {
          for (let i = 0; i < frames[t]!.length; i++) {
            frameComparisons++
            frameDifferences += frames[t]![i] === judged.frames[t]![i] ? 0 : 1
          }
        }

        if (run.value !== judged.value || run.frameHash !== judged.frameHash) {
          frameDifferences++
        }
      }
    }

    metrics.cellComparisons = frameComparisons
    metrics.cellDifferences = frameDifferences

    if (frameDifferences > 0) {
      fail(`the evaluator's runner differs from lineBrickRun in ${frameDifferences} cells`)
    }

    // ---- B2 metered through the sandbox ----
    let certified = 0
    let meteredRuns = 0
    let meteredPairUpdates = 0
    let headlineReads = ''

    cells.forEach(({ rule, background }, index) => {
      const id = `reactive-${index}`
      const layout = layoutOn(background)
      const grade = meteredProbe(id, rule.name, { ...layout })
      const keyHash = meshKeyHash(`probe ${id}`)
      const judgedReads = residues(WORDS.map(word => judgeRun(rule, background, word).value))
      const line = new Int8Array(meshLineLength(layout))
      const table = Int8Array.from(rule.table)
      const pairUpdates = WORDS.reduce((sum, word) => sum + meshLineRun(table, layout, word, line).pairUpdates, 0)
      const entry = grade.mesh.layouts[0]

      let reason = ''

      if (grade.violations.length > 0 || !grade.solved) {
        reason = `not clean: ${grade.violations[0] ?? 'unsolved'}`
      } else if (grade.mesh.layouts.length !== 1 || entry === undefined) {
        reason = `${grade.mesh.layouts.length} metered layouts`
      } else if (entry.rule !== rule.name || entry.layout.background !== background) {
        reason = `metered ${entry.rule} on background ${entry.layout.background}`
      } else if (entry.runs !== WORDS.length || entry.rounds !== WORDS.length * READ_ROUND || entry.pairUpdates !== pairUpdates) {
        reason = `metered ${entry.runs} runs, ${entry.rounds} rounds, ${entry.pairUpdates} pair updates`
      } else if (entry.frameDigest !== judgeDigest(rule, background, keyHash, background)) {
        reason = `metered digest ${entry.frameDigest}, recomputed ${judgeDigest(rule, background, keyHash, background)}`
      } else if (grade.solverId !== `${BACKGROUND_PROBE_ID} ${judgedReads}`) {
        reason = `answered ${grade.solverId}, lineBrickRun reads ${judgedReads}`
      }

      if (reason === '') {
        certified++
        meteredRuns += entry!.runs
        meteredPairUpdates += entry!.pairUpdates
      } else {
        fail(`${rule.name}/${background}: ${reason}`)
      }

      if (index === 0) {
        headlineReads = judgedReads
        metrics.headlineMeteredRuns = entry?.runs ?? 0
        metrics.headlineMeteredRounds = entry?.rounds ?? 0
        metrics.headlinePairUpdates = entry?.pairUpdates ?? 0
        metrics.headlineFrameDigest = entry?.frameDigest ?? 0
        metrics.headlineCertified = reason === '' ? 1 : 0
        metrics.headlineDistinctReads = new Set(judgedReads).size
      }
    })

    if ((metrics.headlineDistinctReads ?? 0) < 2) {
      fail('the headline read does not depend on the input word')
    }

    metrics.meteredCellsCertified = certified
    metrics.meteredRuns = meteredRuns
    metrics.meteredPairUpdates = meteredPairUpdates

    // ---- B3 the parameter matters: the vacuum padding against +1 on the headline cell ----
    let vacuumDiffers = 0

    if (headline !== undefined) {
      const onPlus = layoutOn(1)
      const padded: MeshLayoutSpec = { ...onPlus, background: 0 }
      const line = new Int8Array(meshLineLength(onPlus))
      const table = Int8Array.from(headline.rule.table)

      for (const word of WORDS) {
        const frames: Int8Array[] = []

        meshLineRun(table, padded, word, line, frames)

        const judged = judgeRun(headline.rule, 1, word)

        vacuumDiffers += frames[READ_ROUND]!.every((v, i) => v === judged.frames[READ_ROUND]![i]) ? 0 : 1
      }
    }

    control.vacuumPaddingWordsDiffering = vacuumDiffers

    if (vacuumDiffers === 0) {
      fail('the vacuum padding gives the +1 run on every word: the background is not seen')
    }

    // ---- B4 the vacuum default is unchanged ----
    const vacuum = BY_NAME.get(VACUUM_RULE)

    if (vacuum === undefined) {
      fail(`no rule ${VACUUM_RULE}`)
    } else {
      const left = meteredProbe('vacuum-left-out', VACUUM_RULE, { ...layoutOn(undefined) })
      const named = meteredProbe('vacuum-left-out', VACUUM_RULE, { ...layoutOn(0) })
      const a = left.mesh.layouts[0]
      const b = named.mesh.layouts[0]
      // now the digest is the chain, so 'unchanged' means: left out and named 0 meter the same, equal to the
      // judge's chain on the vacuum (the pre-0037 sum is gone for every caller)
      const preDigest = judgeDigest(vacuum, 0, meshKeyHash('probe vacuum-left-out'), 0)

      const same =
        a !== undefined &&
        b !== undefined &&
        left.violations.length === 0 &&
        named.violations.length === 0 &&
        a.layout.background === 0 &&
        b.layout.background === 0 &&
        a.runs === b.runs &&
        a.pairUpdates === b.pairUpdates &&
        a.frameDigest === b.frameDigest &&
        left.solverId === named.solverId &&
        a.frameDigest === preDigest

      control.vacuumDefaultUnchanged = same ? 1 : 0

      if (!same) {
        fail(`the vacuum default differs: left out ${a?.frameDigest}, named ${b?.frameDigest}, the judge's vacuum chain ${preDigest}`)
      }
    }

    // ---- B5 wrong backgrounds and an unknown rule are refused ----
    let wrongRefused = 0

    WRONG_BACKGROUNDS.forEach((background, i) => {
      const grade = meteredProbe(`wrong-${i}`, headline?.rule.name ?? VACUUM_RULE, { ...layoutOn(1), background })
      const refused = grade.violations.some(v => v.includes('background')) && grade.mesh.layouts.length === 0 && grade.solverId !== `${BACKGROUND_PROBE_ID} ${headlineReads}`

      wrongRefused += refused ? 1 : 0

      if (!refused) {
        fail(`background ${JSON.stringify(background)} not refused: ${grade.violations[0] ?? 'clean'}, ${grade.mesh.layouts.length} layouts`)
      }
    })

    control.wrongBackgroundsRefused = wrongRefused
    control.wrongBackgrounds = WRONG_BACKGROUNDS.length

    let runnerThrows = 0

    try {
      meshLineRun(Int8Array.from(FIBERS[0]!.table), { ...layoutOn(1), background: 2 }, WORDS[0]!, new Int8Array(meshLineLength(layoutOn(1))))
    } catch {
      runnerThrows = 1
    }

    control.runnerRefusesWrongBackground = runnerThrows

    if (runnerThrows === 0) {
      fail('meshLineRun ran a background of 2')
    }

    const unknown = meteredProbe('unknown-rule', 'no.such.rule', { ...layoutOn(1) })
    const unknownRefused = unknown.violations.some(v => v.includes('no pair rule named')) && unknown.mesh.layouts.length === 0

    control.unknownRuleRefused = unknownRefused ? 1 : 0

    if (!unknownRefused) {
      fail(`an unknown rule on +1 was not refused: ${unknown.violations[0] ?? 'clean'}`)
    }

    // ---- B6 the background is folded into the digest beyond the frames ----
    if (headline !== undefined) {
      const keyHash = meshKeyHash('probe reactive-0')
      const asPlus = judgeDigest(headline.rule, 1, keyHash, 1)
      const asVacuum = judgeDigest(headline.rule, 1, keyHash, 0)
      const asMinus = judgeDigest(headline.rule, 1, keyHash, -1)
      const folded = metrics.headlineFrameDigest === asPlus && asPlus !== asVacuum && asPlus !== asMinus

      control.backgroundFolded = folded ? 1 : 0

      if (!folded) {
        fail(`the digest does not fold the background: metered ${metrics.headlineFrameDigest}, +1 ${asPlus}, 0 ${asVacuum}, -1 ${asMinus}`)
      }
    }

    // ---- B7 the digest's SHA-256 against node:crypto ----
    let shaCompared = 0
    let shaDifferent = 0

    for (const length of [...Array.from({ length: 301 }, (_, i) => i), 1000, 65_536, 100_003]) {
      const bytes = Uint8Array.from({ length }, (_, i) => (i * 131 + length * 7 + 11) % 256)

      shaCompared++
      shaDifferent += Buffer.from(sha256(bytes)).toString('hex') === createHash('sha256').update(bytes).digest('hex') ? 0 : 1
    }

    control.shaCompared = shaCompared
    control.shaDifferent = shaDifferent

    if (shaDifferent > 0 || shaCompared === 0) {
      fail(`the digest's SHA-256 differs from node:crypto on ${shaDifferent} of ${shaCompared} inputs`)
    }

    // ---- B8 the step-fitting forger: wrong words, the step picked to hit the judge's target ----
    const forging = { fitted: 0, legacyAccepted: 0, refused: 0, newChainHits: 0, stepsSearched: 0, tries: 0 }

    if (headline !== undefined) {
      const id = 'forged-step'
      const key = `probe ${id}`
      const honest = judgeDigest(headline.rule, 1, meshKeyHash(key), 1)
      const frameOf = new Map(WORDS.map(w => [w.join(','), judgeRun(headline.rule, 1, w).frameHash]))
      const legacyHash = legacyKeyHash(key)
      const target = legacyDigest(WORDS.map(w => ({ keyHash: legacyHash, frameHash: frameOf.get(w.join(','))!, step: STEP })), 1)
      const alternatives = WORDS.map(w => WORDS.filter(o => o.join(',') !== w.join(',')).map(o => ({ word: o, frameHash: frameOf.get(o.join(','))! })))
      const fit = fitLegacyStep({ keyHash: legacyHash, background: 1, target, alternatives, limit: 1_000_000 })

      if (fit === null) {
        fail('B8: the adversary found no step that fits the pre-0037 digest, so the control does not show the hole')
      } else {
        forging.fitted = 1
        forging.tries = fit.tries

        const forgedWords = fit.choice.map((c, k) => alternatives[k]![c]!.word)
        const grade = evaluate(
          candidate(PROBE, 'meshBackgroundProbe', { rule: headline.rule.name, layout: { ...layoutOn(1) }, words: forgedWords.flat(), arity: INPUTS.length, step: fit.step }),
          probeProblem(id),
          [],
        )
        const entry = grade.mesh.layouts[0]
        const line = new Int8Array(meshLineLength(layoutOn(1)))
        const honestPairs = WORDS.reduce((sum, word) => sum + meshLineRun(Int8Array.from(headline.rule.table), layoutOn(1), word, line).pairUpdates, 0)
        // every check a pre-0037 judge made, with the pre-0037 fold of the metered runs
        const legacyFold = legacyDigest(forgedWords.map(w => ({ keyHash: legacyHash, frameHash: frameOf.get(w.join(','))!, step: fit.step })), 1)
        const legacyOk =
          grade.violations.length === 0 &&
          entry !== undefined &&
          grade.mesh.layouts.length === 1 &&
          entry.rule === headline.rule.name &&
          entry.layout.background === 1 &&
          entry.runs === WORDS.length &&
          entry.rounds === WORDS.length * READ_ROUND &&
          entry.pairUpdates === honestPairs &&
          legacyFold === target

        forging.legacyAccepted = legacyOk ? 1 : 0
        forging.refused = entry?.frameDigest !== honest ? 1 : 0

        // can any step fit the chain with these words? every step the evaluator admits, 0 to 10^6
        const forgedRequest = judgeRequest(headline.rule, 1, meshKeyHash(key), forgedWords)
        const seed = { ...layoutOn(1) }

        for (let step = 0; step <= LEGACY_STEP_LIMIT; step++) {
          forging.stepsSearched++
          forging.newChainHits += meshChain(headline.rule.name, seed).fold(step, forgedRequest) === honest ? 1 : 0
        }
      }
    }

    control.forgedStepFitted = forging.fitted
    control.forgedStepFitTries = forging.tries
    control.forgedStepLegacyAccepted = forging.legacyAccepted
    control.forgedStepRefused = forging.refused
    control.forgedStepNewChainStepsSearched = forging.stepsSearched
    control.forgedStepNewChainHits = forging.newChainHits

    if (forging.fitted !== 1 || forging.legacyAccepted !== 1 || forging.refused !== 1 || forging.newChainHits !== 0) {
      fail(`B8: forger fitted ${forging.fitted}, pre-0037 judge accepts ${forging.legacyAccepted}, refused ${forging.refused}, chain hits ${forging.newChainHits}`)
    }

    // ---- B9 the chain is bound to order and decision; the pre-0037 sum is not ----
    let orderBound = 0

    if (headline !== undefined) {
      const keyHash = meshKeyHash('probe reactive-0')
      const reversed = [...WORDS].reverse()
      const legacyHash = legacyKeyHash('probe reactive-0')
      const legacyOf = (words: readonly (readonly number[])[]): number =>
        legacyDigest(words.map(w => ({ keyHash: legacyHash, frameHash: judgeRun(headline.rule, 1, w).frameHash, step: STEP })), 1)

      orderBound =
        judgeDigest(headline.rule, 1, keyHash, 1, STEP, reversed) !== judgeDigest(headline.rule, 1, keyHash, 1) &&
        judgeDigest(headline.rule, 1, keyHash, 1, STEP + 1) !== judgeDigest(headline.rule, 1, keyHash, 1) &&
        legacyOf(reversed) === legacyOf(WORDS)
          ? 1
          : 0
    }

    control.orderAndStepBound = orderBound

    if (orderBound !== 1) {
      fail('B9: the chain does not tell a reordered request or another step apart, or the pre-0037 sum did')
    }

    // ---- B10 layouts that compute nothing are refused with no run metered ----
    const empty = [
      ['no inputs', { ...layoutOn(1), inputs: [] }],
      ['read left of the light cone', { ...layoutOn(1), readPosition: START - 2 * READ_ROUND - 1 }],
      ['read right of the light cone', { ...layoutOn(1), readPosition: START + WIDTH + 2 * READ_ROUND }],
    ] as const
    let emptyRefused = 0

    empty.forEach(([label, layout], i) => {
      const grade = evaluate(
        candidate(PROBE, 'meshBackgroundProbe', {
          rule: headline?.rule.name ?? VACUUM_RULE,
          layout,
          words: label === 'no inputs' ? [] : WORDS.flat(),
          arity: layout.inputs.length,
          step: STEP,
          runs: WORDS.length,
        }),
        probeProblem(`empty-${i}`),
        [],
      )
      const refused = grade.violations.some(v => v.includes(label === 'no inputs' ? 'inputs' : 'light cone')) && grade.mesh.layouts.length === 0

      emptyRefused += refused ? 1 : 0

      if (!refused) {
        fail(`B10: a layout with ${label} was metered: ${grade.violations[0] ?? 'clean'}`)
      }
    })

    // the light cone's edges themselves are admitted: the outermost reads still compute
    const edges = [START - 2 * READ_ROUND, START + WIDTH - 1 + 2 * READ_ROUND].map((readPosition, i) =>
      evaluate(
        candidate(PROBE, 'meshBackgroundProbe', { rule: headline?.rule.name ?? VACUUM_RULE, layout: { ...layoutOn(1), readPosition }, words: WORDS.flat(), arity: INPUTS.length, step: STEP }),
        probeProblem(`edge-${i}`),
        [],
      ),
    )

    control.emptyLayoutsRefused = emptyRefused
    control.coneEdgeLayoutsAdmitted = edges.filter(g => g.violations.length === 0 && g.mesh.layouts.length === 1).length

    if (control.coneEdgeLayoutsAdmitted !== 2) {
      fail(`B10: ${control.coneEdgeLayoutsAdmitted} of 2 reads on the light cone's edge admitted`)
    }

    const isolation = isolationCounts()

    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.failures = failures.length

    const ok = failures.length === 0
    const name = headline === undefined ? 'none' : `${headline.rule.name}/+1`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the evaluator's metered mesh round runs on a declared background: the reactive cell ${name} on +1 runs metered through the sandbox and matches lineBrickRun cell for cell on all ${WORDS.length} words of a width-${WIDTH} window (reads ${headlineReads}, ${metrics.headlinePairUpdates} pair updates, digest recomputed by the judge), and so do all ${certified} of ${cells.length} reactive cells on +1 and -1 (${frameComparisons} cells compared, ${frameDifferences} different); a layout that leaves the background out meters exactly as before; ${wrongRefused} of ${WRONG_BACKGROUNDS.length} wrong backgrounds are refused with no run metered; the digest is a SHA-256 chain bound to the layout, the step, the order and each run's decision, which refuses the step-fitting forger that every pre-0037 check accepted (${forging.refused} of ${forging.fitted}, ${forging.newChainHits} of ${forging.stepsSearched} steps fit the chain), and layouts that compute nothing are refused (${emptyRefused} of ${empty.length})`,
      metrics,
      control,
      notes: `Layout: window of ${WIDTH} background tones at start ${START}, inputs at offsets ${INPUTS.join(', ')}, read at offset ${READ_OFFSET} after ${READ_ROUND} rounds, step ${STEP}; every run labelled with the probe's initial state. The digest is a SHA-256 chain seeded by the rule and the whole layout (background included) and folded per request over the step and every run's key hash, occurrence, word, frame hash and read; its SHA-256 equals node:crypto on ${shaCompared} inputs. The step-fitting forger (wrong words, the step picked so the pre-0037 sum hits the judge's target, found in ${forging.tries} tries) passes every pre-0037 check (${forging.legacyAccepted}) and is refused by the chain (${forging.refused}); none of the ${forging.stepsSearched} admissible steps fits the chain with its words (${forging.newChainHits} hits). Layouts with no input or a read outside the light cone are refused (${emptyRefused} of ${empty.length}); reads on the cone's edge are admitted (${control.coneEdgeLayoutsAdmitted} of 2). The probe reports its answered reads in its id; the judge compares them with lineBrickRun. The vacuum padding differs from the +1 run on ${vacuumDiffers} of ${WORDS.length} words of the headline cell. Limits: one window and one read; the line only; the probe asks for runs and decides nothing. ${metrics.isolatedSessions} isolated contexts, ${metrics.isolatedRequests} requests. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})
