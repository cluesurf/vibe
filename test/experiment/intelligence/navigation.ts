// Intelligence level 1, benchmark family A: an externally programmed solver runs on the mesh. Six navigation kinds
// (maze, obstacle avoidance, a dynamic maze whose walls move under an M1 pair rule, token sliding, a small Sokoban and
// a travelling-salesperson tour over mesh cells) on all twelve lab geometries, solved by four baselines (breadth-first,
// A*, IDA*, greedy best-first), every attempt graded by the outside evaluator, reported as a profile of eight
// dimensions measured apart: breadth, depth, speed, efficiency, accuracy, optimality, robustness, generalization.
//
// Algebra: spin-one for the dynamic maze's field (the swap.CBA.swap pair rule, greedy edge-coloring schedule, lower
// cell first, the ball a closed finite system); elsewhere the tones are puzzle labels (agent +1, wall or city or box
// -1, open 0) and read as nothing else. Regime: pure (cells only). Every wall pattern is structured, never random.
//
// Gates, each able to fail:
// - evaluator: every baseline attempt is clean (no violation: valid path, honest ledger, within budget), and none
//   claims a solve the evaluator does not verify.
// - BFS against an independent oracle: maze and obstacle against plain graph BFS on the open cells, the tour against
//   Held-Karp over hop distances, the dynamic maze against a (cell, round) BFS over a plain history of the field.
//   Equal optimum wherever the oracle decides; where the oracle says unsolvable, BFS exhausts without a path.
// - BFS optimality is the gate for every heuristic solver: A* and IDA* cost exactly the BFS optimum wherever they
//   solve, greedy never less, no solver ever below BFS; A* solves every instance BFS solves.
// - preprocessing is charged: every informed baseline carries its heuristic table's expansions in the ledger, BFS none.
// - the dynamic maze is dynamic: the field conserves its charge every round, the inverse rounds restore it, and the
//   frozen planner (plans once on the walls of round 0) fails on at least one instance BFS solves.
// - determinism: a second build and grading of two geometries gives identical numbers; no source file of the family
//   reaches for a random number (code/check/determinism scan).
// Controls that must be caught: a shortcut solver (BFS with one middle step dropped) is rejected by the evaluator; a
// detour solver (one step away first, then BFS) is caught by the optimality gate on at least one instance.

import { resolve } from 'node:path'
import { scanIntelligenceSources } from '@/code/intelligence/benchmark/source-scan'
import { navigationFamily } from '@/code/intelligence/benchmark/navigation/family'
import {
  BASELINES,
  NAVIGATION_KINDS,
  type BaselineName,
  type NavigationInstance,
  type SolverRecipe,
} from '@/code/intelligence/benchmark/navigation/instance'
import { gradeFamily, profileOf, type GradedInstance } from '@/code/intelligence/benchmark/navigation/profile'
import { isolationCounts } from '@/code/intelligence/sandbox/channel'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')

const CONTROL_GEOMETRIES = new Set(['{4,4}', '{7,3}', '{3,4,3,4}'])

/** the dishonest and degraded solvers, each an isolated candidate (code/intelligence/control/navigation-controls) */
const CONTROLS = 'code/intelligence/control/navigation-controls'
const recipe = (name: string): SolverRecipe => ({ module: CONTROLS, export: name })

// BFS with the middle step of its path dropped: the listed states no longer follow from the operators
const shortcut = recipe('shortcut')
// one step to the successor the heuristic rates farthest, then BFS: a valid path, often not a shortest one
const detour = recipe('detour')
// A* on four times the heuristic: inadmissible, reported as data
const inflated = recipe('inflated')
// audit C2: A* with its table charged reports zero search expansions; the old gate (search plus preprocessing at least
// the states probed) let it pass whenever the table was as large as the search
const hidingSearch = recipe('hidingSearch')
// audit M1: breadth-first search reporting no memory at all; the old evaluator only checked the numbers were integers
const hidingMemory = recipe('hidingMemory')
// audit M2: A* on the problem's own distance, the same table the informed baselines pay for, declaring no charge
const freeDistance = recipe('freeDistance')

// the audit probes (code/intelligence/control/audit-probes): P1 (K2) asks the operators about states it made itself,
// a forged handle number or an object of its own; P2 (K3) patches its realm's Set, Map and WeakMap during an A* solve
// on the sealed table and declares no charge and no expansions
const PROBES = 'code/intelligence/control/audit-probes'
const scratchNumber: SolverRecipe = { module: PROBES, export: 'scratchState', args: { scratch: 'number' } }
const scratchObject: SolverRecipe = { module: PROBES, export: 'scratchState', args: { scratch: 'object' } }
const patching: SolverRecipe = { module: PROBES, export: 'patchingIntrinsics' }

function digest(graded: readonly GradedInstance[], ids: ReadonlySet<string>): string {
  return graded
    .filter(entry => ids.has(entry.instance.id))
    .map(entry =>
      BASELINES.map(baseline => {
        const g = entry.grades[baseline]
        return `${entry.instance.id}:${baseline}:${g.solved}:${g.cost}:${g.operatorCalls}:${g.expansions}:${g.bytes}`
      }).join(','),
    )
    .join(';')
}


function tag(name: string): string {
  return name.replace(/[{}]/g, '').replace(/,/g, '-')
}

export default experiment({
  id: 'intelligence/navigation',
  code: 'E-CMP-0026',
  title:
    'intelligence level 1, benchmark family A: maze, obstacle avoidance, a dynamic maze moved by an M1 pair rule, token sliding, a small Sokoban and a tour over mesh cells on the twelve lab geometries, solved by breadth-first, A*, IDA* and greedy baselines graded by the outside evaluator and reported as an eight-dimension profile, with breadth-first optimality as the gate every heuristic solver is checked against',
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

    const family = navigationFamily()
    const graded = gradeFamily(family.instances)

    // gate: the evaluator finds every baseline attempt clean, and no false claim
    let violations = 0
    let falseClaims = 0
    for (const { instance, grades } of graded) {
      for (const baseline of BASELINES) {
        const grade = grades[baseline]
        if (grade.violations.length > 0) {
          violations++
          fail(`${instance.id} ${baseline}: ${grade.violations[0]}`)
        }
        if (grade.claimedSolved && !grade.solved) {
          falseClaims++
        }
      }
    }

    // gate: BFS against the independent oracles
    let oracleChecked = 0
    let oracleUnsolvable = 0
    let undecided = 0
    for (const { instance, reference } of graded) {
      if (reference.solvable === null) {
        undecided++
      }
      if (instance.oracleSolvable === null) {
        continue
      }
      oracleChecked++
      if (instance.oracleSolvable) {
        if (reference.cost !== instance.oracleCost) {
          fail(`${instance.id}: BFS ${reference.cost}, oracle ${instance.oracleCost}`)
        }
      } else {
        oracleUnsolvable++
        if (reference.solvable !== false) {
          fail(`${instance.id}: oracle unsolvable, BFS ${reference.solvable}`)
        }
      }
    }

    // gate: BFS optimality checks every heuristic solver
    let optimalityChecks = 0
    let preprocessingCharged = 0
    for (const { instance, grades, reference } of graded) {
      for (const baseline of BASELINES) {
        const grade = grades[baseline]
        if (baseline === 'breadthFirst') {
          if (grade.preprocessingExpansions !== 0) {
            fail(`${instance.id}: BFS charged preprocessing`)
          }
        } else if (grade.preprocessingExpansions > 0) {
          preprocessingCharged++
        } else {
          fail(`${instance.id} ${baseline}: heuristic table not charged`)
        }
        if (!grade.solved || reference.cost === null) {
          continue
        }
        optimalityChecks++
        const cost = grade.cost ?? -1
        if (cost < reference.cost) {
          fail(`${instance.id} ${baseline}: cost ${cost} below BFS ${reference.cost}`)
        }
        if ((baseline === 'aStar' || baseline === 'idaStar') && cost !== reference.cost) {
          fail(`${instance.id} ${baseline}: admissible search cost ${cost}, BFS ${reference.cost}`)
        }
      }
      if (reference.solvable === true && !grades.aStar.solved) {
        fail(`${instance.id}: A* missed an instance BFS solves`)
      }
    }

    // gate: the dynamic maze is dynamic, and its field obeys the pair rule's conservation and reversibility
    let frozenFailures = 0
    let frozenSolves = 0
    for (const moving of family.dynamic) {
      if (!moving.environment.chargeConserved || !moving.environment.reversible) {
        fail(`${moving.instance.id}: field charge ${moving.environment.chargeConserved}, reversible ${moving.environment.reversible}`)
      }
      const frozen = moving.frozen()
      const bfs = graded.find(entry => entry.instance === moving.instance)!
      if (frozen.violations.length > 0) {
        fail(`${moving.instance.id} frozen: ${frozen.violations[0]}`)
      }
      if (frozen.solved) {
        frozenSolves++
      } else if (bfs.reference.solvable === true) {
        frozenFailures++
      }
      metrics[`dynamicColors${tag(moving.instance.geometry)}`] = moving.environment.colorCount
    }
    if (frozenFailures === 0) {
      fail('the frozen planner never failed where BFS solves: the dynamic maze is not testing replanning')
    }

    // gate: determinism, a second build and grading of two geometries
    const again = gradeFamily(navigationFamily(['line', '{3,6}']).instances)
    const againIds = new Set(again.map(entry => entry.instance.id))
    const deterministic = digest(graded, againIds) === digest(again, againIds) && againIds.size > 0
    if (!deterministic) {
      fail('a second build and grading gave different numbers')
    }

    // gate: no random number anywhere in the family's sources
    const { files, findings: randomFindings } = scanIntelligenceSources(BASE, ['test/experiment/intelligence/navigation.ts'])
    if (randomFindings.length > 0) {
      fail(`random number or clock source: ${randomFindings.map(f => `${f.file}:${f.line} ${f.kind}`).join(', ')}`)
    }

    // controls the gates must catch
    const controlInstances: GradedInstance[] = graded.filter(
      entry => entry.instance.variant === 'base' && CONTROL_GEOMETRIES.has(entry.instance.geometry),
    )
    let shortcutTried = 0
    let shortcutRejected = 0
    let detourValid = 0
    let detourCaught = 0
    let inflatedSolves = 0
    let inflatedSuboptimal = 0
    for (const { instance, reference } of controlInstances) {
      if (reference.cost !== null && reference.cost >= 2) {
        shortcutTried++
        const cut = instance.gradeRecipe(shortcut)
        // rejected either as an invalid path or, when the cut falls on the last step, as a path short of the goal
        if (!cut.solved && cut.violations.length > 0) {
          shortcutRejected++
        }
      }
      if (reference.cost !== null) {
        const around = instance.gradeRecipe(detour)
        if (around.solved) {
          detourValid++
          if ((around.cost ?? 0) > reference.cost) {
            detourCaught++
          }
        }
        const weighted = instance.gradeRecipe(inflated)
        if (weighted.solved) {
          inflatedSolves++
          if ((weighted.cost ?? 0) > reference.cost) {
            inflatedSuboptimal++
          }
        }
      }
    }
    control.shortcutTried = shortcutTried
    control.shortcutRejected = shortcutRejected
    control.detourValid = detourValid
    control.detourCaughtSuboptimal = detourCaught
    control.inflatedAStarSolves = inflatedSolves
    control.inflatedAStarSuboptimal = inflatedSuboptimal
    control.frozenPlannerFailures = frozenFailures
    control.frozenPlannerSolves = frozenSolves
    if (shortcutTried === 0 || shortcutRejected !== shortcutTried) {
      fail(`shortcut control: ${shortcutRejected} of ${shortcutTried} rejected`)
    }
    if (detourCaught === 0) {
      fail('detour control: the optimality gate never caught a longer path')
    }

    // audit controls: each would pass the pre-fix evaluator (shown by the numbers it would have read), and must fail now
    let liarTried = 0
    let hidingSearchRejected = 0
    let hidingSearchOldGatePasses = 0
    let hidingMemoryRejected = 0
    let freeDistanceTried = 0
    let freeDistanceRejected = 0
    let measuredBytesHonestAboveOne = 0
    let measuredBytesLiarAboveOne = 0
    let scratchRejected = 0
    let patchingRejected = 0
    for (const { instance, reference, grades } of controlInstances) {
      if (reference.cost === null || !grades.aStar.solved) {
        continue
      }
      liarTried++
      const hiding = instance.gradeRecipe(hidingSearch)
      if (!hiding.solved && hiding.violations.some(v => v.includes('search expansions'))) {
        hidingSearchRejected++
      }
      // the old gate: ledger search plus ledger preprocessing at least the states probed
      if (hiding.ledgerExpansions + hiding.preprocessingExpansions >= hiding.expansions) {
        hidingSearchOldGatePasses++
      }
      const memory = instance.gradeRecipe(hidingMemory)
      if (!memory.solved && memory.violations.some(v => v.includes('peak bytes'))) {
        hidingMemoryRejected++
      }
      if (grades.aStar.preprocessingExpansions > 0) {
        freeDistanceTried++
        const free = instance.gradeRecipe(freeDistance)
        if (!free.solved && free.violations.some(v => v.includes('preprocessing expansions'))) {
          freeDistanceRejected++
        }
      }
      for (const probe of [scratchNumber, scratchObject]) {
        const scratch = instance.gradeRecipe(probe)

        if (!scratch.solved && scratch.violations.some(v => v.includes('never issued'))) {
          scratchRejected++
        }
      }

      const patched = instance.gradeRecipe(patching)

      if (
        !patched.solved &&
        patched.violations.some(v => v.includes('preprocessing expansions')) &&
        patched.expansions === grades.aStar.expansions &&
        patched.preprocessingExpansions === grades.aStar.preprocessingExpansions
      ) {
        patchingRejected++
      }

      // the budget reads the measured bytes, so a 1-byte memory budget stops the liar exactly as it stops BFS
      if (grades.breadthFirst.bytes > 1) {
        measuredBytesHonestAboveOne++
      }
      if (memory.bytes > 1) {
        measuredBytesLiarAboveOne++
      }
    }
    control.auditLiarInstances = liarTried
    control.hidingSearchRejected = hidingSearchRejected
    control.hidingSearchOldGatePasses = hidingSearchOldGatePasses
    control.hidingMemoryRejected = hidingMemoryRejected
    control.freeDistanceTried = freeDistanceTried
    control.freeDistanceRejected = freeDistanceRejected
    control.measuredBytesHonestAboveOne = measuredBytesHonestAboveOne
    control.measuredBytesLiarAboveOne = measuredBytesLiarAboveOne
    control.scratchStateRejected = scratchRejected
    control.patchingIntrinsicsRejected = patchingRejected
    if (scratchRejected !== 2 * liarTried || patchingRejected !== liarTried) {
      fail(`audit probes: scratch state ${scratchRejected} of ${2 * liarTried}, intrinsic patching ${patchingRejected} of ${liarTried} rejected`)
    }
    if (measuredBytesLiarAboveOne !== liarTried) {
      fail(`hiding-memory control: measured bytes above one on ${measuredBytesLiarAboveOne} of ${liarTried}`)
    }
    if (liarTried === 0 || hidingSearchRejected !== liarTried || hidingMemoryRejected !== liarTried) {
      fail(`audit controls: hiding search ${hidingSearchRejected}, hiding memory ${hidingMemoryRejected} of ${liarTried} rejected`)
    }
    if (hidingSearchOldGatePasses === 0) {
      fail('hiding-search control: the old gate would never have passed it, so it shows nothing')
    }
    if (freeDistanceTried === 0 || freeDistanceRejected !== freeDistanceTried) {
      fail(`free-distance control: ${freeDistanceRejected} of ${freeDistanceTried} rejected`)
    }

    // the ledger and the meter: honest baselines report at least what was measured, and published numbers are measured
    let ledgerAboveMeter = 0
    let measuredGrades = 0
    for (const { grades } of graded) {
      for (const baseline of BASELINES) {
        const grade = grades[baseline]
        measuredGrades++
        if (grade.ledgerExpansions > grade.expansions) {
          ledgerAboveMeter++
        }
      }
    }
    metrics.gradesLedgerExpansionsAboveMeasured = ledgerAboveMeter
    metrics.measuredGrades = measuredGrades

    // the profile, each dimension apart
    const profiles = new Map(BASELINES.map(baseline => [baseline, profileOf(graded, baseline)]))
    for (const [baseline, profile] of profiles) {
      metrics[`${baseline}Breadth`] = profile.breadth
      metrics[`${baseline}Depth`] = profile.depth
      metrics[`${baseline}Speed`] = Math.round(profile.speed)
      metrics[`${baseline}Efficiency`] = Math.round(profile.efficiency)
      metrics[`${baseline}MeasuredEfficiency`] = Math.round(profile.measuredEfficiency)
      metrics[`${baseline}Accuracy`] = profile.accuracy
      metrics[`${baseline}Optimality`] = profile.optimality
      metrics[`${baseline}Robustness`] = profile.robustness
      metrics[`${baseline}Generalization`] = profile.generalization
      metrics[`${baseline}Solved`] = profile.solved
      metrics[`${baseline}PreprocessingExpansions`] = profile.preprocessingExpansions
    }

    // per kind: instances, decided-solvable, and each baseline's verified solves
    const perKind: string[] = []
    for (const kind of NAVIGATION_KINDS) {
      const ofKind = graded.filter(entry => entry.instance.kind === kind)
      const solvable = ofKind.filter(entry => entry.reference.solvable === true).length
      const unsolvable = ofKind.filter(entry => entry.reference.solvable === false).length
      metrics[`${kind}Instances`] = ofKind.length
      metrics[`${kind}Solvable`] = solvable
      metrics[`${kind}Unsolvable`] = unsolvable
      const solves = BASELINES.map(baseline => {
        const count = ofKind.filter(entry => entry.grades[baseline].solved).length
        metrics[`${kind}${baseline.charAt(0).toUpperCase()}${baseline.slice(1)}Solved`] = count
        return `${baseline} ${count}`
      })
      perKind.push(`${kind} ${ofKind.length} (${solvable} solvable, ${unsolvable} proved unsolvable): ${solves.join(', ')}`)
    }

    metrics.instances = graded.length
    metrics.undecided = undecided
    metrics.oracleChecked = oracleChecked
    metrics.oracleUnsolvable = oracleUnsolvable
    metrics.optimalityChecks = optimalityChecks
    metrics.preprocessingCharged = preprocessingCharged
    metrics.violations = violations
    metrics.falseClaims = falseClaims
    metrics.deterministic = deterministic ? 1 : 0
    metrics.sourceFilesScanned = files.length
    const isolation = isolationCounts()

    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.failures = failures.length

    if (falseClaims > 0) {
      fail(`${falseClaims} false solve claims`)
    }

    const line = (baseline: BaselineName): string => {
      const p = profiles.get(baseline)!
      return `${baseline}: breadth ${p.breadth.toFixed(2)}, depth ${p.depth}, speed ${Math.round(p.speed)} calls, efficiency ${Math.round(p.efficiency)} bytes, accuracy ${p.accuracy.toFixed(3)}, optimality ${p.optimality.toFixed(3)}, robustness ${p.robustness.toFixed(3)}, generalization ${p.generalization.toFixed(3)}`
    }
    const unsolvedBy = (baseline: BaselineName): string =>
      graded
        .filter(entry => entry.reference.solvable === true && !entry.grades[baseline].solved)
        .map(entry => entry.instance.id)
        .join(', ') || 'none'
    const ok = failures.length === 0
    const instanceCount = (filter: (instance: NavigationInstance) => boolean): number =>
      graded.filter(entry => filter(entry.instance)).length

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an externally programmed solver runs on the mesh (intelligence level 1): on all twelve lab geometries the six navigation kinds of family A are built from structured patterns, every attempt of breadth-first, A*, IDA* and greedy search is graded clean by the outside evaluator, breadth-first search agrees with three independent oracles (graph BFS, Held-Karp, a time-expanded BFS of the moving field), A* and IDA* match its optimum wherever they solve and greedy never beats it, preprocessing is charged, the dynamic maze defeats a planner that ignores its motion, and the profile is reported dimension by dimension',
      metrics,
      control,
      notes: `L2 benchmark, a level-1 demonstration only: the solvers are programmed from outside and nothing here is learned or found by the mesh. ${instanceCount(i => i.variant === 'base')} base instances plus ${instanceCount(i => i.variant === 'blocked')} blocked and ${instanceCount(i => i.variant === 'sealed')} sealed variants, budget 50,000 expansions (preprocessing counted) per attempt. Profiles. ${BASELINES.map(line).join('. ')}. Per kind: ${perKind.join('; ')}. Solvable instances a baseline did not solve: IDA* ${unsolvedBy('idaStar')}; greedy ${unsolvedBy('greedy')}; A* ${unsolvedBy('aStar')}. IDA* holds only its path and the unexplored siblings along it (the smallest memory) but keeps no table of visited states, so it re-expands a state once per path to it; on the mesh many paths reach each cell, and that is where its budget goes. Instances with no solution are kept as accuracy probes (breadth-first search proves each by exhausting its space): on the line, a path, tokens cannot pass and a box cannot be got behind; {3,4,3,4} at radius 1 is a star, where no push exists; blocked and sealed walls cut some corridors. Dynamic maze: spin-one rule swap.CBA.swap, greedy edge-coloring schedule (color counts in metrics), lower cell first, the ball as a closed finite system; the agent moves after the walls take a round and only into an empty cell. Sokoban pushes move the box to a neighbor not adjacent to the pusher, the graph form of a push on a tiling with no straight-ahead. Every number in the profile is the evaluator's own: operator calls it counted, expansions as the distinct states, by canonical key, it saw an operator consulted on (search alone, never offset by preprocessing), memory as the most issued states live at once in the call trace (a lower bound no implementation can beat), and preprocessing as the charge of the sealed heuristic table the solve actually read, whether through the heuristic or through problem.distance; a ledger below any of them is rejected (controls: A* hiding its search behind its table charge, ${control.hidingSearchRejected} of ${control.auditLiarInstances} rejected where the old gate passed ${control.hidingSearchOldGatePasses}; BFS reporting no memory, ${control.hidingMemoryRejected} rejected; A* on problem.distance declaring nothing, ${control.freeDistanceRejected} of ${control.freeDistanceTried} rejected). IDA* is charged its sibling lists along the path (depth times branching), not the path alone, and its published expansions count distinct states by key, so a state it re-expands in a later iteration is counted once (its ledger counts every re-expansion and stays above the meter). Every solver runs isolated, in a fresh context of a worker with no file, module, process, clock or random source (${metrics.isolatedSessions} contexts, ${metrics.isolatedRequests} requests served); it holds handles to states the evaluator issued, so it cannot consult an operator on a state of its own making (scratch-state probe ${control.scratchStateRejected} of ${2 * liarTried} rejected) and patching its realm's intrinsics touches nothing the evaluator counts with (${control.patchingIntrinsicsRejected} of ${control.auditLiarInstances} rejected, measured and charged exactly as honest A*). Limits: a candidate's own arithmetic on the keys it is handed is unmetered, and what it can know is what its bundle holds, which the run-time bundle check and check:layers keep free of the geometry, substrate, tool, benchmark, oracle and evaluator; the bare-hop heuristic charge is declared by the benchmark when it seals the table (cells reached and table bytes), not built through metered operators. ${ok ? '' : `Failures: ${failures.slice(0, 10).join('; ')}`}`.trim(),
    })
  },
})
