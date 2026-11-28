/**
 * Level 5: the level-4 memory kept across episodes. A learner observes verified experiences and keeps the level-2
 * value table (exact cost-to-go on taught paths, one-ring lower bounds beside them) in an M4 line register that lives
 * for the whole learning phase. Each table entry owns a block of BLOCK_DIGITS slots holding its value in balanced
 * ternary. After each observation the write port writes every digit of every entry whose value changed, then the
 * register runs its rounds (the forward rule, the only thing that can reorganize the structure on its own). At hand-over
 * the read port decodes every block, and that decode is the table.
 *
 * Settings select the arms of the causal test (level5.md): rounds 0 is the dynamics knockout, writes off the frozen
 * structure, spacing 1 a register whose dynamics act, and `smuggle` a table whose ring bounds come from candidate code
 * while only path values are in the register. The report (plain data, unread by the evaluator) lets a judge replay the
 * register with the original rule.
 *
 * Candidate side: imports only interfaces, the value-table learner and this folder's register copy. No random numbers.
 */

import type { Experience, TableLearner } from '@/code/intelligence/experience/experience'
import { valueTableLearner } from '@/code/intelligence/experience/learner/value-table'
import type { Operator } from '@/code/intelligence/operator/operator'
import type { Preprocessing } from '@/code/intelligence/solver/solver'
import {
  BLOCK_DIGITS,
  cellDigest,
  digitsOf,
  grow,
  newRegister,
  readCell,
  round,
  valueOf,
  writeCell,
} from '@/code/intelligence/solver/reorganize/register-copy'

export interface RegisterSettings {
  id: string
  spacing: number
  /** rounds of the forward rule after each observation; 0 is the knockout */
  rounds: number
  /** false: the structure is frozen (no write ever) */
  writes: boolean
  /** true: only taught-path values go to the register, the table still hands over the ring bounds */
  smuggle: boolean
}

/** One observation as the judge replays it: the register length, then the writes as slot, tone pairs, then the rounds. */
export interface ObservationLog {
  cells: number
  writes: number[]
}

export interface RegisterReport {
  kind: 'mesh-register'
  spacing: number
  rounds: number
  blockDigits: number
  /** table keys in slot-block order: key k owns slots k * blockDigits .. k * blockDigits + blockDigits - 1 */
  keys: string[]
  observations: ObservationLog[]
  roundsRun: number
  pairUpdates: number
  writes: number
  finalCells: number
  finalDigest: number
  /** an entry whose value fell outside the block's range (the learner then fails closed: its table is empty) */
  overflow: boolean
}

export function registerLearner<S>(
  settings: RegisterSettings,
  operators: readonly Operator<S>[],
  key: (state: S) => string,
): TableLearner<S> {
  const inner = valueTableLearner(operators, key)
  const register = newRegister(settings.spacing)
  const blockOf = new Map<string, number>()
  const keys: string[] = []
  /** the value each block was last written with (the port's own record, never read back as data) */
  const written = new Map<string, number>()
  const observations: ObservationLog[] = []
  /** keys on a taught path: the smuggler writes only these */
  const onPath = new Set<string>()

  let writes = 0
  let overflow = false

  function observe(experience: Experience<S>): void {
    inner.observe(experience)

    if (experience.utility > 0) {
      for (const state of experience.solution.states) {
        onPath.add(key(state))
      }
    }

    const writesNow: number[] = []

    for (const [entry, value] of inner.table()) {
      if (settings.smuggle && !onPath.has(entry)) {
        continue
      }

      let block = blockOf.get(entry)

      if (block === undefined) {
        block = keys.length
        blockOf.set(entry, block)
        keys.push(entry)
      }

      if (!settings.writes || written.get(entry) === value) {
        continue
      }

      const digits = digitsOf(value)

      if (digits === null) {
        overflow = true
        continue
      }

      written.set(entry, value)
      grow(register, keys.length * BLOCK_DIGITS)

      for (let k = 0; k < BLOCK_DIGITS; k++) {
        const slot = block * BLOCK_DIGITS + k

        writeCell(register, slot, digits[k]!)
        writesNow.push(slot, digits[k]!)
        writes++
      }
    }

    grow(register, keys.length * BLOCK_DIGITS)
    observations.push({ cells: register.cells.length, writes: writesNow })

    for (let r = 0; r < settings.rounds; r++) {
      round(register)
    }
  }

  function decoded(): Map<string, number> {
    const out = new Map<string, number>()

    if (overflow) {
      return out
    }

    for (let block = 0; block < keys.length; block++) {
      const digits: number[] = []

      for (let k = 0; k < BLOCK_DIGITS; k++) {
        digits.push(readCell(register, block * BLOCK_DIGITS + k))
      }

      out.set(keys[block]!, valueOf(digits))
    }

    return out
  }

  function table(): Map<string, number> {
    if (!settings.smuggle) {
      return decoded()
    }

    // the smuggler: the register's path values, and the ring bounds straight from candidate code
    const out = decoded()

    for (const [entry, value] of inner.table()) {
      if (!out.has(entry)) {
        out.set(entry, value)
      }
    }

    return out
  }

  function spent(): Preprocessing {
    const own = inner.spent()

    // one byte per register cell beside the value table's own bytes
    return { ...own, memoryBytes: own.memoryBytes + register.cells.length }
  }

  function report(): RegisterReport {
    return {
      kind: 'mesh-register',
      spacing: settings.spacing,
      rounds: settings.rounds,
      blockDigits: BLOCK_DIGITS,
      keys: keys.slice(),
      observations: observations.map(o => ({ cells: o.cells, writes: o.writes.slice() })),
      roundsRun: register.rounds,
      pairUpdates: register.pairUpdates,
      writes,
      finalCells: register.cells.length,
      finalDigest: cellDigest(register.cells),
      overflow,
    }
  }

  return {
    id: settings.id,
    observe,
    proposeOperators: () => [],
    spent,
    table,
    report,
  }
}
