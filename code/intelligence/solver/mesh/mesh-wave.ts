/**
 * Level 4 of the intelligence lab: a solver whose frontier is
 * an M3 signal and whose visited memory is an M4 register, with every decision left as candidate code and named.
 *
 * The solver's only access to a problem is the operators the evaluator hands over, so the mesh it runs on is the
 * configuration graph it discovers: one node per distinct state key, one arc per distinct successor (self-loops
 * dropped). On that graph:
 *
 * - transport: the M3-B Z3 wave (wave.ts) seeded +1 at the initial state. A node is non-zero only after an
 *   in-neighbour was, and every non-zero node is expanded the step it first lights, so the field on the discovered
 *   graph is the field on the whole reachable graph (the arcs a non-zero node needs are always known);
 * - memory: the arrival tone of each lit node, written to its slot of a line register (register.ts) that runs one
 *   round of the static carrier `id.CBA.id` every wave step;
 * - decisions (slice 1: candidate code, each counted; slice 2, `decisions: 'switch'`: the lit test and the expand
 *   gate run as the M5 switch layouts of switch.ts, one run per decision, read at their read cell; since the metered round
 *   the evaluator executes and meters every run, asked through the host in one batch per decision per step, and the
 *   solver only writes the input words and reads the answers): the lit test
 *   (non-zero), the expand gate (non-zero and slot empty), the register write, the goal
 *   test at discovery, the stop test (the field back at (0, delta): the map is a bijection, so nothing more ever
 *   lights), and the path read-back (the known in-neighbour with the least first-lit step, which for a lit node is
 *   strictly smaller, so the walk ends at the initial state).
 *
 * The shared Ledger has no field for the mesh work, so the report travels in the solver id as `mesh-wave <json>`,
 * read and checked by the judge of E-CMP-0056 (evaluator side). The controls (mesh-controls.ts) run this same code
 * with one part swapped and make the same claims.
 */

import type { Problem } from '@/code/intelligence/problem/problem'
import { emptyLedger, type Solution, type Solver } from '@/code/intelligence/solver/solver'
import { canExpand, hold, holdBatch, successors, type Held } from '@/code/intelligence/solver/search/expand'
import { growRegister, lineRegister, readSlot, registerRound, STATIC_CARRIER_TABLE, writeSlot } from '@/code/intelligence/solver/mesh/register'
import { meshChain, meshKeyHash, type MeshDigestRun } from '@/code/intelligence/solver/mesh/mesh-digest'
import { DIGEST_MODULUS, keyHash, residueOf, toneOf, waveStep } from '@/code/intelligence/solver/mesh/wave'
import {
  EXCHANGE_RULE,
  EXPAND_SWITCH,
  LIT_SWITCH,
  frameHash,
  runSwitch,
  switchLength,
  type MeshHost,
  type MeshRunsReply,
  type SwitchLayout,
} from '@/code/intelligence/solver/mesh/switch'

export const MESH_ID_PREFIX = 'mesh-wave '

/** Arc reads the wave may spend in one solve. */
export const WAVE_WORK_CAP = 30_000_000

export type MeshOutcome = 'found' | 'initialGoal' | 'waveExhausted' | 'waveCap' | 'expansionBudget'

/** What every mesh-wave solver claims (the controls claim the same). */
export const MESH_CLAIMS = {
  transport: 'm3-wave-z3-linear-self-0',
  memory: 'm4-line-register-id.CBA.id-spacing-2',
} as const

export interface MeshReport {
  kind: 'mesh-wave'
  claims: typeof MESH_CLAIMS
  outcome: MeshOutcome
  /** the wave step the search stopped at */
  stopStep: number
  /** nodes discovered, and nodes expanded (each the step it first lit) */
  states: number
  expanded: number
  /** the widest set of nodes lit in one step: the movers a number-conserving transport would need at once */
  widestFrontier: number
  /** steps with at least one node newly lit */
  litSteps: number
  /** digest of the newly-lit count of every step 0..stopStep */
  litDigest: number
  /** digest of every lit node's arrival tone as read back from the register, keyed by state key and first-lit step */
  arrivalDigest: number
  /** digest of every field value of every step 0..stopStep, keyed by state key and step */
  fieldDigest: number
  /** register slots whose tone differs from the tone written there */
  registerCorruptions: number
  registerCells: number
  registerRounds: number
  registerPairUpdates: number
  /** the wave's arc reads and node updates */
  waveArcReads: number
  waveCellUpdates: number
  /** decisions made by candidate code */
  litTests: number
  expandGates: number
  registerWrites: number
  goalTests: number
  stopTests: number
  readbackComparisons: number
  /** bytes of the mesh structures and the arc table, at the end */
  meshBytes: number
  /** what knocking out each step's rounds would change (provenance accounting) */
  knockout: KnockoutReport
  /** slice 2: present when the lit test and the expand gate run as M5 switch layouts */
  switches?: SwitchReport
}

/**
 * The knockout reading of the two step components the solver runs itself: a component counts as
 * mesh-realized only if knocking out its rounds (the identity in place of a round) changes some read. Summed over every
 * step, each knocking out that one step's round from the honest configuration.
 */
export interface KnockoutReport {
  /** node values the wave step changed (each is a read of the next step that the step's knockout would leave as it was) */
  waveChangedValues: number
  /** register pair updates that changed their pair; 0 means every register round was the identity on its frame */
  registerChangedPairs: number
}

/** What a slice-2 solver claims about its decisions (the controls claim the same). */
export const SWITCH_CLAIMS = {
  rule: EXCHANGE_RULE,
  background: 0,
  lit: LIT_SWITCH.name,
  expand: EXPAND_SWITCH.name,
} as const

export interface SwitchReport {
  claims: typeof SWITCH_CLAIMS
  /** layout runs, one per decision */
  litRuns: number
  expandRuns: number
  /** pair updates spent by the runs */
  litPairUpdates: number
  expandPairUpdates: number
  /** digest of every run's final frame (read cell and garbage), keyed by state key and step */
  litFrameDigest: number
  expandFrameDigest: number
}

export interface MeshSettings {
  /** the wave's self term: 0 is the M3-B wave; any other value is a control */
  self: number
  /** register slot spacing: 2 holds every tone; 1 is a control */
  spacing: number
  /** 'wave' runs the M3 signal; 'external' is a control that expands breadth-first layers and fabricates a field */
  frontier: 'wave' | 'external'
  /**
   * 'candidate' decides the lit test and the expand gate in candidate code (slice 1); 'switch' has the evaluator run
   * them as the M5 switch layouts, metered (slice 2); 'formula' is a control that decides them in
   * candidate code and reports a frame made up from the output alone; 'lookup' is a control that runs each layout once
   * per input word in candidate code and looks every decision up, reporting exactly what an honest run reports
   */
  decisions: 'candidate' | 'switch' | 'formula' | 'lookup'
  /** the layouts run under 'switch' (the certified ones unless a control swaps one) */
  layouts: { lit: SwitchLayout; expand: SwitchLayout }
}

export const HONEST_SETTINGS: MeshSettings = {
  self: 0,
  spacing: 2,
  frontier: 'wave',
  decisions: 'candidate',
  layouts: { lit: LIT_SWITCH, expand: EXPAND_SWITCH },
}

export const SWITCH_SETTINGS: MeshSettings = { ...HONEST_SETTINGS, decisions: 'switch' }

export function encodeMeshReport(report: MeshReport): string {
  return `${MESH_ID_PREFIX}${JSON.stringify(report)}`
}

interface Arc {
  to: number
  operatorId: string
  cost: number
}

export function meshWaveSolver<S>(settings: MeshSettings, host?: MeshHost<S>): Solver<S> {
  if (settings.decisions === 'switch' && typeof host?.meshRuns !== 'function') {
    throw new Error('mesh-wave: switch decisions need the evaluator to run the mesh rounds, and no host was handed in')
  }

  const solver: Solver<S> = {
    id: MESH_ID_PREFIX.trim(),
    solve(problem: Problem<S>, operators): Solution<S> {
      const ledger = emptyLedger()
      const held: Held = { states: 0, bytes: 0 }
      const index = new Map<string, number>()
      const states: S[] = []
      const hashes: number[] = []
      const outArcs: Arc[][] = []
      const inArcs: number[][] = []
      const firstLit: number[] = []
      const register = lineRegister(settings.spacing)
      const written: number[] = []

      let previous: number[] = []
      let current: number[] = []
      let arcCount = 0
      let goal = -1
      let stopStep = 0

      const counts = {
        widestFrontier: 0,
        litSteps: 0,
        litDigest: 0,
        fieldDigest: 0,
        waveArcReads: 0,
        waveCellUpdates: 0,
        litTests: 0,
        expandGates: 0,
        registerWrites: 0,
        goalTests: 0,
        stopTests: 0,
        readbackComparisons: 0,
      }
      const knockout: KnockoutReport = { waveChangedValues: 0, registerChangedPairs: 0 }

      // slice 2: the decisions as switch layouts, each run in its own scratch line
      const switches: SwitchReport = {
        claims: SWITCH_CLAIMS,
        litRuns: 0,
        expandRuns: 0,
        litPairUpdates: 0,
        expandPairUpdates: 0,
        litFrameDigest: 0,
        expandFrameDigest: 0,
      }
      const litCells = new Int8Array(switchLength(settings.layouts.lit))
      const expandCells = new Int8Array(switchLength(settings.layouts.expand))
      // the controls' candidate-side runs, one per input word
      const memo = new Map<string, { value: number; frameHash: number; pairUpdates: number }>()
      // the controls' copy of the evaluator's digest chain, per layout, and the key hash per node (mesh-digest.ts)
      const chains = new Map<string, ReturnType<typeof meshChain>>()
      const meshHashes: number[] = []

      /**
       * Decide one table for a batch of nodes. 'switch': the evaluator runs the layout once per node, metered.
       * The controls decide in candidate code: 'lookup' runs the layout once per input word and looks
       * every later run up, 'formula' computes the table and makes the frame up.
       */
      const decideBatch = (
        layout: SwitchLayout,
        cells: Int8Array,
        formula: (word: readonly number[]) => number,
        step: number,
        nodes: readonly number[],
        words: readonly number[],
      ): MeshRunsReply => {
        if (settings.decisions === 'switch') {
          return host!.meshRuns(EXCHANGE_RULE, layout, step, nodes.map(node => states[node]!), words)
        }

        const arity = layout.inputs.length
        const values: number[] = new Array<number>(nodes.length)
        const runs: MeshDigestRun[] = new Array<MeshDigestRun>(nodes.length)

        let chain = chains.get(layout.name)

        if (chain === undefined) {
          chain = meshChain(EXCHANGE_RULE, layout)
          chains.set(layout.name, chain)
        }

        let pairUpdates = 0

        for (let n = 0; n < nodes.length; n++) {
          const word = words.slice(n * arity, (n + 1) * arity)
          const name = `${layout.name}:${word.join(',')}`

          let run = memo.get(name)

          if (run === undefined) {
            if (settings.decisions === 'lookup') {
              run = runSwitch(layout, word, cells)
            } else {
              const blank = runSwitch(layout, word.map(() => 0), cells)
              const value = formula(word)

              cells.fill(0)
              cells[layout.readPosition + 2 * layout.readRound + 2] = value
              run = { value, frameHash: frameHash(cells, cells.length), pairUpdates: blank.pairUpdates }
            }

            memo.set(name, run)
          }

          values[n] = run.value
          pairUpdates += run.pairUpdates

          let keyHash = meshHashes[nodes[n]!]

          if (keyHash === undefined) {
            keyHash = meshKeyHash(problem.key(states[nodes[n]!]!))
            meshHashes[nodes[n]!] = keyHash
          }

          runs[n] = { keyHash, word, frameHash: run.frameHash, value: run.value }
        }

        // the controls fold the evaluator's chain themselves (mesh-digest.ts is public), so their report copies an honest one
        return { values, pairUpdates, frameDigest: nodes.length > 0 ? chain.fold(step, runs) : chain.value() }
      }

      const litFormula = ([x]: readonly number[]): number => (x !== 0 ? 1 : 0)
      const expandFormula = ([x, s]: readonly number[]): number => (x !== 0 && s === 0 ? 1 : -1)

      const add = (state: S, key: string): number => {
        const at = states.length

        index.set(key, at)
        states.push(state)
        hashes.push(keyHash(key))
        outArcs.push([])
        inArcs.push([])
        firstLit.push(-1)
        written.push(0)
        previous.push(0)
        current.push(0)
        growRegister(register, at)
        hold(problem, held, ledger, state)
        counts.goalTests++

        if (goal < 0 && problem.goal(state)) {
          goal = at
        }

        return at
      }

      const report = (outcome: MeshOutcome): MeshReport => {
        let arrivalDigest = 0
        let registerCorruptions = 0

        for (let i = 0; i < states.length; i++) {
          if (firstLit[i]! < 0) {
            continue
          }

          const tone = readSlot(register, i)

          if (tone !== written[i]) {
            registerCorruptions++
          }

          arrivalDigest = (arrivalDigest + (hashes[i]! * 3 + residueOf(tone)) * (firstLit[i]! + 1)) % DIGEST_MODULUS
        }

        const switchBytes = settings.decisions === 'candidate' ? 0 : litCells.length + expandCells.length
        const meshBytes = 2 * states.length + register.cells.length + 4 * states.length + 8 * arcCount + switchBytes

        return {
          kind: 'mesh-wave',
          claims: MESH_CLAIMS,
          outcome,
          stopStep,
          states: states.length,
          expanded: ledger.expansions,
          widestFrontier: counts.widestFrontier,
          litSteps: counts.litSteps,
          litDigest: counts.litDigest,
          arrivalDigest,
          fieldDigest: counts.fieldDigest,
          registerCorruptions,
          registerCells: register.cells.length,
          registerRounds: register.rounds,
          registerPairUpdates: register.pairUpdates,
          waveArcReads: counts.waveArcReads,
          waveCellUpdates: counts.waveCellUpdates,
          litTests: counts.litTests,
          expandGates: counts.expandGates,
          registerWrites: counts.registerWrites,
          goalTests: counts.goalTests,
          stopTests: counts.stopTests,
          readbackComparisons: counts.readbackComparisons,
          meshBytes,
          knockout: { ...knockout },
          ...(settings.decisions === 'candidate' ? {} : { switches }),
        }
      }

      const finish = (outcome: MeshOutcome, solution: Omit<Solution<S>, 'ledger'>): Solution<S> => {
        const filed = report(outcome)

        if (held.bytes + filed.meshBytes > ledger.peakBytes) {
          ledger.peakBytes = held.bytes + filed.meshBytes
        }

        solver.id = encodeMeshReport(filed)

        return { ...solution, ledger }
      }

      const giveUp = (outcome: MeshOutcome): Solution<S> =>
        finish(outcome, { states: [problem.initial], operators: [], cost: 0, solved: false })

      add(problem.initial, problem.key(problem.initial))

      if (goal === 0) {
        firstLit[0] = 0
        written[0] = 1
        writeSlot(register, 0, 1)
        counts.registerWrites++
        counts.litSteps = 1
        counts.widestFrontier = 1
        counts.litDigest = 2
        counts.fieldDigest = (hashes[0]! + 1) % DIGEST_MODULUS

        return finish('initialGoal', { states: [problem.initial], operators: [], cost: 0, solved: true })
      }

      current[0] = 1

      for (let step = 0; ; step++) {
        stopStep = step

        // the field digest of this step, and the newly lit nodes (non-zero, slot empty)
        const lit: number[] = []

        if (settings.decisions === 'candidate') {
          for (let i = 0; i < states.length; i++) {
            const value = current[i]!

            counts.litTests++

            if (value === 0) {
              continue
            }

            counts.fieldDigest = (counts.fieldDigest + (hashes[i]! + 1) * value * (step + 1)) % DIGEST_MODULUS
            counts.expandGates++

            if (readSlot(register, i) === 0) {
              lit.push(i)
            }
          }
        } else {
          // the lit test on every node, one batch; then the expand gate on the lit nodes, one batch
          const n = states.length
          const all: number[] = new Array<number>(n)
          const litWords: number[] = new Array<number>(n)

          for (let i = 0; i < n; i++) {
            all[i] = i
            litWords[i] = toneOf(current[i]!)
          }

          counts.litTests += n

          const litReply = decideBatch(settings.layouts.lit, litCells, litFormula, step, all, litWords)

          if (litReply.values.length !== n) {
            throw new Error(`mesh-wave: ${litReply.values.length} lit reads for ${n} runs`)
          }

          switches.litRuns += n
          switches.litPairUpdates += litReply.pairUpdates
          switches.litFrameDigest = litReply.frameDigest

          const gated: number[] = []
          const expandWords: number[] = []

          for (let i = 0; i < n; i++) {
            const read = litReply.values[i]

            if (read !== 0 && read !== 1) {
              throw new Error(`mesh-wave: the lit switch read ${read}`)
            }

            if (read === 0) {
              continue
            }

            counts.fieldDigest = (counts.fieldDigest + (hashes[i]! + 1) * current[i]! * (step + 1)) % DIGEST_MODULUS
            counts.expandGates++
            gated.push(i)
            expandWords.push(toneOf(current[i]!), readSlot(register, i))
          }

          if (gated.length > 0) {
            const expandReply = decideBatch(settings.layouts.expand, expandCells, expandFormula, step, gated, expandWords)

            if (expandReply.values.length !== gated.length) {
              throw new Error(`mesh-wave: ${expandReply.values.length} expand reads for ${gated.length} runs`)
            }

            switches.expandRuns += gated.length
            switches.expandPairUpdates += expandReply.pairUpdates
            switches.expandFrameDigest = expandReply.frameDigest

            for (let k = 0; k < gated.length; k++) {
              const read = expandReply.values[k]

              if (read !== 1 && read !== -1) {
                throw new Error(`mesh-wave: the expand switch read ${read}`)
              }

              if (read === 1) {
                lit.push(gated[k]!)
              }
            }
          }
        }

        counts.litDigest = (counts.litDigest * 1_000_003 + lit.length + 1) % DIGEST_MODULUS

        if (lit.length > 0) {
          counts.litSteps++
        }

        if (lit.length > counts.widestFrontier) {
          counts.widestFrontier = lit.length
        }

        for (const i of lit) {
          firstLit[i] = step
          written[i] = toneOf(current[i]!)
          writeSlot(register, i, written[i])
          counts.registerWrites++
        }

        const discoveredBefore = states.length

        for (const i of lit) {
          if (!canExpand(problem, ledger)) {
            return giveUp('expansionBudget')
          }

          ledger.expansions++

          const batch = successors(states[i]!, operators, ledger)

          holdBatch(problem, held, ledger, batch)

          for (const next of batch) {
            const key = problem.key(next.state)
            const known = index.get(key)
            const j = known ?? add(next.state, key)

            if (j === i || outArcs[i]!.some(arc => arc.to === j)) {
              continue
            }

            outArcs[i]!.push({ to: j, operatorId: next.operatorId, cost: next.cost })
            inArcs[j]!.push(i)
            arcCount++
          }

          if (goal >= 0) {
            return readBack()
          }
        }

        // advance the transport one step, and the register one round
        if (settings.frontier === 'wave') {
          let reads = 0

          for (const row of inArcs) {
            reads += row.length
          }

          if (counts.waveArcReads + reads > WAVE_WORK_CAP) {
            return giveUp('waveCap')
          }

          counts.waveArcReads += reads
          counts.waveCellUpdates += states.length

          const next = waveStep(inArcs, previous, current, settings.self)

          for (let i = 0; i < next.length; i++) {
            if (next[i] !== current[i]) {
              knockout.waveChangedValues++
            }
          }

          previous = current
          current = next
        } else {
          // the control: the next layer is every node first discovered this step, given the value +1
          const next: number[] = new Array<number>(states.length).fill(0)

          for (let j = discoveredBefore; j < states.length; j++) {
            next[j] = 1
          }

          previous = current
          current = next
        }

        knockout.registerChangedPairs += registerRound(register, STATIC_CARRIER_TABLE)

        // the stop test: the field back at (0, delta), or (the control) an empty layer
        let returned = true

        for (let i = 0; i < states.length && returned; i++) {
          counts.stopTests++
          returned = previous[i] === 0 && current[i] === (settings.frontier === 'wave' && i === 0 ? 1 : 0)
        }

        if (returned) {
          stopStep = step + 1

          return giveUp('waveExhausted')
        }
      }

      function readBack(): Solution<S> {
        const chain: number[] = [goal]

        let at = goal

        while (at !== 0) {
          let best = -1

          for (const u of inArcs[at]!) {
            counts.readbackComparisons++

            if (best < 0 || firstLit[u]! < firstLit[best]! || (firstLit[u] === firstLit[best] && u < best)) {
              best = u
            }
          }

          if (best < 0 || (at !== goal && firstLit[best]! >= firstLit[at]!)) {
            throw new Error('mesh-wave: the read-back found no earlier in-neighbour')
          }

          chain.push(best)
          at = best
        }

        chain.reverse()

        const path: S[] = chain.map(node => states[node]!)
        const ids: string[] = []

        let cost = 0

        for (let k = 0; k + 1 < chain.length; k++) {
          const arc = outArcs[chain[k]!]!.find(entry => entry.to === chain[k + 1])!

          ids.push(arc.operatorId)
          cost += arc.cost
        }

        return finish('found', { states: path, operators: ids, cost, solved: true })
      }
    },
  }

  return solver
}
