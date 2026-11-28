// The conservative reversible pair rules on spin-one tones. A pair rule maps the two tones (a, b) of a matched
// edge to (a', b') with a + b = a' + b' (the spin-one charge Q is conserved) and is a bijection on the nine pairs
// (reversible). The nine pairs split by their sum into fibers of size 1, 2, 3, 2, 1, so a rule is a permutation of
// each fiber: s- and s+ permute the two pairs of sum -1 and +1, s0 permutes the three pairs of sum 0,
// A = (-1, +1), B = (0, 0), C = (+1, -1). That gives 2 * 6 * 2 = 24 rules.
//
// The symmetries are the cell swap P, (a, b) -> (b, a), and the negation C, (a, b) -> (-a, -b), acting on a rule by
// conjugation. `pairRuleCensus` finds the 24 by brute force over all 9! permutations of the pairs, and
// `pairRuleClasses` splits them into orbits of {1, P, C, PC}; neither assumes the fiber structure.
//
// A rule is a table of nine pair indices: rule[p] is the image of pair p, where p = (a + 1) * 3 + (b + 1).

export type PairTable = Int8Array

export type PairRule = {
  // the image of every pair index
  table: PairTable
  // the fiber name, s-.s0.s+, with s- and s+ in {id, swap} and s0 the images of A, B, C (ABC is the identity)
  name: string
}

export type PairRuleClass = {
  // the member with the smallest table, the class representative
  representative: PairRule
  members: PairRule[]
}

export const PAIR_COUNT = 9
export const VACUUM_PAIR = 4

export function pairIndex(a: number, b: number): number {
  return (a + 1) * 3 + (b + 1)
}

export function pairTones(p: number): [number, number] {
  return [Math.floor(p / 3) - 1, (p % 3) - 1]
}

export function pairSum(p: number): number {
  const [a, b] = pairTones(p)

  return a + b
}

export function pairExcitation(p: number): number {
  const [a, b] = pairTones(p)

  return a * a + b * b
}

// P: the pair with its two cells swapped
export function swapPair(p: number): number {
  const [a, b] = pairTones(p)

  return pairIndex(b, a)
}

// C: the pair with both tones negated
export function negatePair(p: number): number {
  return PAIR_COUNT - 1 - p
}

export function swapNegatePair(p: number): number {
  return negatePair(swapPair(p))
}

// g rule g, for an involution g of the pairs
export function conjugateTable(
  table: PairTable,
  g: (p: number) => number,
): PairTable {
  const out = new Int8Array(PAIR_COUNT)

  for (let p = 0; p < PAIR_COUNT; p++) {
    out[p] = g(table[g(p)]!)
  }

  return out
}

export function inverseTable(table: PairTable): PairTable {
  const out = new Int8Array(PAIR_COUNT).fill(-1)

  for (let p = 0; p < PAIR_COUNT; p++) {
    out[table[p]!] = p
  }

  return out
}

export function tableKey(table: PairTable): string {
  return Array.from(table).join(',')
}

export function sameTable(x: PairTable, y: PairTable): boolean {
  for (let p = 0; p < PAIR_COUNT; p++) {
    if (x[p] !== y[p]) {
      return false
    }
  }

  return true
}

export function isBijection(table: PairTable): boolean {
  const seen = new Set<number>()

  for (let p = 0; p < PAIR_COUNT; p++) {
    const q = table[p]!

    if (q < 0 || q >= PAIR_COUNT) {
      return false
    }

    seen.add(q)
  }

  return seen.size === PAIR_COUNT
}

export function conservesCharge(table: PairTable): boolean {
  for (let p = 0; p < PAIR_COUNT; p++) {
    if (pairSum(table[p]!) !== pairSum(p)) {
      return false
    }
  }

  return true
}

export function conservesExcitation(table: PairTable): boolean {
  for (let p = 0; p < PAIR_COUNT; p++) {
    if (pairExcitation(table[p]!) !== pairExcitation(p)) {
      return false
    }
  }

  return true
}

export function fixesVacuum(table: PairTable): boolean {
  return table[VACUUM_PAIR] === VACUUM_PAIR
}

export function commutesWithSwap(table: PairTable): boolean {
  return sameTable(conjugateTable(table, swapPair), table)
}

export function commutesWithNegation(table: PairTable): boolean {
  return sameTable(conjugateTable(table, negatePair), table)
}

export function commutesWithSwapNegation(table: PairTable): boolean {
  return sameTable(conjugateTable(table, swapNegatePair), table)
}

// the fiber name of a conservative rule, read off its table
export function pairRuleName(table: PairTable): string {
  const two = (x: number, y: number): string =>
    table[x] === x && table[y] === y
      ? 'id'
      : table[x] === y && table[y] === x
        ? 'swap'
        : '?'
  const letter = (p: number): string =>
    p === pairIndex(-1, 1)
      ? 'A'
      : p === VACUUM_PAIR
        ? 'B'
        : p === pairIndex(1, -1)
          ? 'C'
          : '?'
  const s0 = [pairIndex(-1, 1), VACUUM_PAIR, pairIndex(1, -1)]
    .map(p => letter(table[p]!))
    .join('')

  return `${two(pairIndex(-1, 0), pairIndex(0, -1))}.${s0}.${two(pairIndex(0, 1), pairIndex(1, 0))}`
}

// Brute force: every permutation of the nine pairs (Heap's algorithm), keeping those that conserve the charge.
export function pairRuleCensus(): {
  permutationsChecked: number
  rules: PairRule[]
} {
  const perm = new Int8Array(PAIR_COUNT)

  for (let p = 0; p < PAIR_COUNT; p++) {
    perm[p] = p
  }

  const counter = new Int32Array(PAIR_COUNT)
  const rules: PairRule[] = []

  let checked = 0

  const visit = (): void => {
    checked++

    if (conservesCharge(perm)) {
      const table = Int8Array.from(perm)

      rules.push({ table, name: pairRuleName(table) })
    }
  }

  visit()

  let i = 0

  while (i < PAIR_COUNT) {
    if (counter[i]! < i) {
      const j = i % 2 === 0 ? 0 : counter[i]!
      const t = perm[j]!

      perm[j] = perm[i]!
      perm[i] = t
      visit()
      counter[i] = counter[i]! + 1
      i = 0
    } else {
      counter[i] = 0
      i++
    }
  }

  rules.sort((x, y) => (tableKey(x.table) < tableKey(y.table) ? -1 : 1))

  return { permutationsChecked: checked, rules }
}

// The orbits of the rules under conjugation by {1, P, C, PC}, ordered by representative. When `withInverse` is
// set, the inverse is added as a further symmetry (time reversal), to test that it merges no classes.
export function pairRuleClasses(input: {
  rules: readonly PairRule[]
  withInverse?: boolean
}): PairRuleClass[] {
  const group: ((t: PairTable) => PairTable)[] = [
    t => t,
    t => conjugateTable(t, swapPair),
    t => conjugateTable(t, negatePair),
    t => conjugateTable(t, swapNegatePair),
  ]

  const images = (t: PairTable): PairTable[] => {
    const base = group.map(g => g(t))

    return input.withInverse
      ? [...base, ...base.map(inverseTable)]
      : base
  }

  const byKey = new Map(input.rules.map(r => [tableKey(r.table), r]))
  const done = new Set<string>()
  const classes: PairRuleClass[] = []

  for (const rule of input.rules) {
    const key = tableKey(rule.table)

    if (done.has(key)) {
      continue
    }

    // close the orbit under the generators
    const orbit = new Map<string, PairRule>([[key, rule]])
    const queue: PairRule[] = [rule]

    while (queue.length > 0) {
      const r = queue.pop()!

      for (const image of images(r.table)) {
        const k = tableKey(image)

        if (!orbit.has(k)) {
          const member = byKey.get(k) ?? {
            table: image,
            name: pairRuleName(image),
          }

          orbit.set(k, member)
          queue.push(member)
        }
      }
    }

    const members = [...orbit.values()].sort((x, y) =>
      tableKey(x.table) < tableKey(y.table) ? -1 : 1,
    )

    for (const m of members) {
      done.add(tableKey(m.table))
    }

    classes.push({ representative: members[0]!, members })
  }

  return classes.sort((x, y) =>
    tableKey(x.representative.table) < tableKey(y.representative.table)
      ? -1
      : 1,
  )
}

// The 24 rules built from the fiber structure (s-, s0, s+), the construction the census must agree with.
export function pairRulesFromFibers(): PairRule[] {
  const minus = [pairIndex(-1, 0), pairIndex(0, -1)]
  const plus = [pairIndex(0, 1), pairIndex(1, 0)]
  const zero = [pairIndex(-1, 1), VACUUM_PAIR, pairIndex(1, -1)]
  const twoPerms = [
    [0, 1],
    [1, 0],
  ]
  const threePerms = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ]
  const rules: PairRule[] = []

  for (const sm of twoPerms) {
    for (const s0 of threePerms) {
      for (const sp of twoPerms) {
        const table = new Int8Array(PAIR_COUNT)

        for (let p = 0; p < PAIR_COUNT; p++) {
          table[p] = p
        }

        for (let k = 0; k < 2; k++) {
          table[minus[k]!] = minus[sm[k]!]!
          table[plus[k]!] = plus[sp[k]!]!
        }

        for (let k = 0; k < 3; k++) {
          table[zero[k]!] = zero[s0[k]!]!
        }

        rules.push({ table, name: pairRuleName(table) })
      }
    }
  }

  return rules.sort((x, y) =>
    tableKey(x.table) < tableKey(y.table) ? -1 : 1,
  )
}
