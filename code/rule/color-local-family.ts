// The searched family of color-local weaves, as named sweeps over code/rule/color-local-weave's spec.
//
// Every member keeps color an exact local law: its wire tables are the four hop-free tables that make a
// pair from calm (E-FRC-0124), and nothing else in the collision moves a calm slot to the other side of a
// line. The sweeps vary one freedom of the committed schedule at a time, or two together, with the
// others at the committed values:
// - tables: the wire table as a sequence over the beats, every sequence of period 1, 2, 3, 4, 6 or 8
// - schedule: a constant table, with every visiting order of the palindromic swap (720), palindromic or
//   swap-then-clock, and the partition walk out and back (the committed mirror), cyclic, or frozen
// - turn: a constant table with each of the 384 signed coordinate permutations as the turn that
//   precesses the couples, walked out and back or cyclically
// - condition: a constant table with each of seven swap conditions, palindromic or not
// - couple: a different table on each of the six couples of a partition, 4^6 ways
// - none: a constant table with no swap at all, on each walk
// Ids are stable strings, so a result can be traced back to its spec.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { TURN_POS_MIRROR, TURN_SWAP_ORDER } from '@/code/rule/collision'
import { type ColorLocalSpec, colorLocalSpec, HOP_FREE_TABLES, keyState, TURNING_SCHEDULE } from '@/code/rule/color-local-weave'

export type FamilyMember = { readonly id: string; readonly spec: ColorLocalSpec }

export const TABLE_NAMES = ['bind', 'bind-reverse', 'swap-plus', 'swap-minus'] as const
export const FAMILY_TABLES = TABLE_NAMES.map(n => HOP_FREE_TABLES[n] ?? [])

export const WALKS: Readonly<Record<string, readonly number[]>> = {
  mirror: TURN_POS_MIRROR,
  cyclic: [0, 1, 2, 3],
  frozen: [0],
}

const lone = (k: number): boolean => {
  const [a, b] = keyState(k)

  return (a === 0) !== (b === 0)
}
const calm = (k: number): boolean => k === 4

export const SWAP_CONDITIONS: Readonly<Record<string, (line: number, wire: number) => boolean>> = {
  'lone-away': TURNING_SCHEDULE.swapWhen,
  'lone-first': (l, w) => keyState(l)[0] !== 0 && keyState(l)[1] === 0 && calm(w),
  'lone-any': (l, w) => lone(l) && calm(w),
  charged: (l, w) => keyState(l)[0] + keyState(l)[1] !== 0 && calm(w),
  occupied: (l, w) => !calm(l) && calm(w),
  always: () => true,
  never: () => false,
}

function permutations(xs: readonly number[]): number[][] {
  return xs.length <= 1 ? [[...xs]] : xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map(r => [x, ...r]))
}

const mirrored = (order: readonly number[]): number[] => [...order, ...[...order].reverse()]

// the 384 signed permutations of the four axes, as permutations of the 12 lines of the D4 box
export function turnElements(): number[][] {
  const roots = rootsD4()
  const index = new Map(roots.map((r, i) => [r.join(','), i]))
  const lines: [number, number][] = []

  roots.forEach((r, d) => {
    const o = index.get(r.map(x => -x).join(',')) ?? d

    if (d < o) {
      lines.push([d, o])
    }
  })

  const lineOf = (d: number): number => lines.findIndex(([a, b]) => a === d || b === d)
  const out: number[][] = []

  for (const axes of permutations([0, 1, 2, 3])) {
    for (let signs = 0; signs < 16; signs++) {
      const image = (r: readonly number[]): number[] => {
        const v = [0, 0, 0, 0]

        axes.forEach((to, from) => (v[to] = (r[from] ?? 0) * ((signs >> from) & 1 ? -1 : 1)))

        return v
      }

      out.push(lines.map(([a]) => lineOf(index.get(image(roots[a] ?? []).join(',')) ?? 0)))
    }
  }

  return out
}

// every table sequence of the given period, over the four tables
function sequences(period: number): number[][] {
  const out: number[][] = []

  for (let n = 0; n < 4 ** period; n++) {
    out.push(Array.from({ length: period }, (_, i) => Math.floor(n / 4 ** i) % 4))
  }

  return out
}

const name = (i: number): string => TABLE_NAMES[i] ?? '?'

export function familySweep(sweep: string): FamilyMember[] {
  if (sweep === 'tables') {
    const seen = new Set<string>()
    const out: FamilyMember[] = []

    for (const period of [1, 2, 3, 4, 6, 8]) {
      for (const seq of sequences(period)) {
        const expanded = Array.from({ length: 24 }, (_, t) => seq[t % period] ?? 0).join('')

        if (seen.has(expanded)) {
          continue
        }

        seen.add(expanded)
        out.push({ id: `tables:${seq.join('')}`, spec: colorLocalSpec({ tables: FAMILY_TABLES, tableAt: seq }) })
      }
    }

    return out
  }

  if (sweep === 'schedule') {
    return FAMILY_TABLES.flatMap((_, ti) =>
      permutations(TURN_SWAP_ORDER).flatMap(order =>
        [true, false].flatMap(palindrome =>
          Object.entries(WALKS).map(([walk, positionAt]) => ({
            id: `schedule:${name(ti)}:${order.join('')}:${palindrome ? 'palindrome' : 'once'}:${walk}`,
            spec: colorLocalSpec({ tables: FAMILY_TABLES, tableAt: [ti], swapAt: mirrored(order), palindrome, positionAt }),
          })),
        ),
      ),
    )
  }

  if (sweep === 'turn') {
    const turns = turnElements()

    return FAMILY_TABLES.flatMap((_, ti) =>
      turns.flatMap((turn, gi) =>
        ['mirror', 'cyclic'].map(walk => ({
          id: `turn:${name(ti)}:${gi}:${walk}`,
          spec: colorLocalSpec({ tables: FAMILY_TABLES, tableAt: [ti], turn, positionAt: WALKS[walk] ?? [0] }),
        })),
      ),
    )
  }

  if (sweep === 'condition') {
    return FAMILY_TABLES.flatMap((_, ti) =>
      Object.entries(SWAP_CONDITIONS).flatMap(([condition, swapWhen]) =>
        [true, false].map(palindrome => ({
          id: `condition:${name(ti)}:${condition}:${palindrome ? 'palindrome' : 'once'}`,
          spec: colorLocalSpec({ tables: FAMILY_TABLES, tableAt: [ti], swapWhen, palindrome }),
        })),
      ),
    )
  }

  if (sweep === 'couple') {
    return sequences(6).map(coupleTable => ({
      id: `couple:${coupleTable.join('')}`,
      spec: colorLocalSpec({ tables: FAMILY_TABLES, tableAt: [0], coupleTable }),
    }))
  }

  if (sweep === 'none') {
    return FAMILY_TABLES.flatMap((_, ti) =>
      Object.entries(WALKS).map(([walk, positionAt]) => ({
        id: `none:${name(ti)}:${walk}`,
        spec: colorLocalSpec({ tables: FAMILY_TABLES, tableAt: [ti], swapAt: [-1], positionAt }),
      })),
    )
  }

  return []
}

export const SWEEPS = ['tables', 'schedule', 'turn', 'condition', 'couple', 'none'] as const
