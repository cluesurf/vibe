// Margenstern's WEAKLY UNIVERSAL cellular automaton on the pentagrid {5,4}, FIVE states, transcribed from
// the rule table in "A weakly universal cellular automaton in the pentagrid with five states" (Margenstern,
// arXiv:1403.2373). The automaton runs the railway model (tracks, a locomotive, switches) and is therefore
// universal. The 236 rules are rotation invariant. Each rule is a 7-character word [c][n0 n1 n2 n3 n4][c'],
// the current state of a cell, the states of its five neighbours in cyclic order, and the new state, over the
// alphabet W (white, empty), B (blue, track), G (green, locomotive front), R (red, locomotive rear), Y (yellow,
// switch sensor). Rotation invariance means the rule holds under any cyclic permutation of the five neighbours.
// See land/text/papers/maurice-margenstern and note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

export type PentaState = 'W' | 'B' | 'G' | 'R' | 'Y'

// the 236 rules, verbatim from Table 1 onward of arXiv:1403.2373 (current + five neighbours + new state)
export const PENTAGRID_RULES: string[] = [
  'WWWWWWW',
  'WBWWWWW',
  'WGWWWWW',
  'WWWWBGW',
  'WWWWGBW',
  'WWWWBBW',
  'WGGWWWW',
  'WRGWWWW',
  'BWWWWWB',
  'GWWWWWG',
  'BWWWWBB',
  'BWWWWGB',
  'GWWWWGG',
  'BWWWBBB',
  'BWWWBGB',
  'BWWWGBB',
  'BBBWBWB',
  'BBBWWBB',
  'BWWBWBB',
  'BWWBGBB',
  'BBBWBGB',
  'BBGWWBB',
  'BBWGWBB',
  'BBWWGBB',
  'BBBWBRB',
  'BBBGWBB',
  'BBBRWBB',
  'BBRWWBB',
  'BBWRWBB',
  'BBWWRBB',
  'WWWBWBW',
  'WWWBWGW',
  'WWWGWBW',
  'WWGBWBG',
  'WWGBWGG',
  'WGWBWBG',
  'WGWBWGW',
  'WGWGWBG',
  'WRWBWBR',
  'WWRBWBR',
  'WWRBWGR',
  'WRWGWBR',
  'WWWBGBW',
  'WWWBGGW',
  'WWWBRBW',
  'GWWBWBW',
  'GWWBWGW',
  'GWWGWBW',
  'RWWBWBW',
  'RWWBWGW',
  'RWWGWBW',
  'WWWWWRW',
  'WWWWRRW',
  'WWWWRBW',
  'WWBWRRW',
  'RWWWWRR',
  'BWWWWRB',
  'WWWWBRW',
  'RWWWWBR',
  'RWWWWWR',
  'WWWRWBW',
  'RGBWWWR',
  'BGRWWWB',
  'BRRWWWB',
  'BGWWWRB',
  'WGWRWBW',
  'BRWBWWB',
  'BRBWWWB',
  'RBRWWWR',
  'RRBWWWR',
  'WWBBGWG',
  'WGBWRRR',
  'GWBBWWW',
  'WGBBWWW',
  'WRBBWWW',
  'RWBWRRW',
  'BRWWWBB',
  'RGWWWWR',
  'WWBBRWR',
  'RWBBWWW',
  'WRBWRRW',
  'WRWRWBG',
  'WWBBWGW',
  'GWWRWBW',
  'BGWBWWB',
  'BBRBWWB',
  'GWYGGWG',
  'YGGBBBY',
  'GGBWWWG',
  'GGWWWRG',
  'BGYWWWB',
  'WWGRRRW',
  'GWRWWWG',
  'WWBWGRW',
  'GWRGGYG',
  'RGWRRRR',
  'GGRWWWG',
  'GGWWWBG',
  'RRGWWWR',
  'RGRWWWR',
  'WGWGWGG',
  'BWGBWBB',
  'GGWWWGW',
  'GGYGGWG',
  'WGBWGRW',
  'GGRGGYG',
  'WGGWWGW',
  'WGGRRRG',
  'GWYGGGW',
  'WWGGGBW',
  'GWGRRRG',
  'RGGWWWR',
  'WWYGGGW',
  'YWGBBBR',
  'GWBWWWG',
  'GWWRRRG',
  'WWRGGGB',
  'RWGBBBY',
  'GWRGGRW',
  'BWYGGGG',
  'YBWBBBY',
  'GBWWWRG',
  'GWBRRRR',
  'WWRGGYG',
  'RWWRRRW',
  'GWYGGRG',
  'WWRGWBW',
  'RWGRRRR',
  'GWWGGYG',
  'WGWRRRW',
  'GGYGGRG',
  'WGRGWBW',
  'GGWGGYG',
  'BGWBWBB',
  'WWBGGGW',
  'GWGGGYW',
  'GGWRRRG',
  'YGWBBBR',
  'WWGGGYW',
  'RGWBBBY',
  'WWGGGRB',
  'WWYGGRG',
  'BWGGGYG',
  'GBWRRRR',
  'GWBGGWG',
  'GWRGGBG',
  'WWGGWBW',
  'WWWGGBW',
  'BGGBWBB',
  'BBGWWGB',
  'WBGWWGW',
  'WWGRBRW',
  'RGWRBRR',
  'GGBGGWG',
  'GGRGGBG',
  'WGGRBRW',
  'GWBGGRG',
  'RWGRBRR',
  'GWWGGBG',
  'WGWRBRW',
  'GGBGGRG',
  'GGWGGBG',
  'BGGBGBR',
  'GBGWWGW',
  'GWRGGWR',
  'RGGBWBB',
  'BRGWWGB',
  'WRGWWGW',
  'RWBGGWG',
  'BRWBWBB',
  'GRWWWRG',
  'WWRRBRR',
  'WWRGGBG',
  'RWWRBRW',
  'GWWGGRR',
  'WWBGGRG',
  'BWRBWBB',
  'RWWGGBG',
  'WRWRBRR',
  'GRWWWBG',
  'BBWWYYB',
  'BBYYBWB',
  'YBYBWWY',
  'YBWWWWY',
  'BYWWWWB',
  'WYWWWWW',
  'WYYWWWW',
  'WBYWWWW',
  'YBWBYYY',
  'WYWBWWW',
  'BYWBWWB',
  'YYWWWWY',
  'WYBWWWW',
  'YBYRWYY',
  'YYYWWWY',
  'RYWWWWR',
  'WYWBWBW',
  'WRYWWWW',
  'BBYYBGB',
  'BBGWYYB',
  'BGGWWWB',
  'WYWBWGG',
  'BYGBWWB',
  'YBGBYYY',
  'GYWBWWW',
  'BBWGYYR',
  'WYGBWWW',
  'RBWWYYB',
  'BRYYBWY',
  'WRWWGGW',
  'WRGBWWW',
  'YRWBYYB',
  'YRYRWYG',
  'BYWWBGB',
  'YYGBWWY',
  'BYWWBWB',
  'WWYWWBW',
  'GBYRWYY',
  'YGBWWWY',
  'BYWWBYB',
  'YYYBWWY',
  'BYGWWWB',
  'YBYRGYY',
  'YYBWWWY',
  'GYWBWBW',
  'WGRWWWW',
  'BYWGBYB',
  'WWYGWBG',
  'GWYWWBW',
  'BYGWBYR',
  'WGYWWBW',
  'RYWWBYB',
  'YRYYBWB',
  'BRWBYYY',
  'YBGBWWY',
  'YGYWWWY',
]

// the compiled, rotation-invariant transition table, (current state + the five neighbour states) -> new state
export interface PentagridRuleTable {
  readonly lookup: Map<string, PentaState>
  // how many distinct (current + neighbours) configurations the rules cover, after expanding rotations
  readonly size: number
}

export function buildPentagridRuleTable(
  rules: string[] = PENTAGRID_RULES,
): PentagridRuleTable {
  const lookup = new Map<string, PentaState>()

  for (const rule of rules) {
    const current = rule[0]!
    const neighbours = rule.slice(1, 6)
    const next = rule[6]! as PentaState

    // expand all five cyclic rotations of the neighbour ring (rotation invariance)
    for (let r = 0; r < 5; r++) {
      const rotated = neighbours.slice(r) + neighbours.slice(0, r)
      const key = current + rotated
      const existing = lookup.get(key)

      if (existing !== undefined && existing !== next) {
        throw new Error(
          `rule conflict at ${key}: ${existing} vs ${next} (rule ${rule})`,
        )
      }

      lookup.set(key, next)
    }
  }

  return { lookup, size: lookup.size }
}

// the new state of a cell from its current state and its five neighbours (cyclic order). Falls back to the
// current state (the conservative default) when no rule matches, which is correct for any configuration the
// rule set does not explicitly drive.
export function pentagridNext(
  table: PentagridRuleTable,
  current: PentaState,
  neighbours: PentaState[],
): PentaState {
  const padded = (neighbours.join('') + 'WWWWW').slice(0, 5) // pad short rings (patch boundary) with empty

  return table.lookup.get(current + padded) ?? current
}

// one synchronous beat of the automaton over a cell graph. `states` is per cell, `cyclicNeighbors[cell]` lists
// the cell's neighbours in cyclic order (length up to 5). Returns the next states.
export function stepPentagridCA(input: {
  table: PentagridRuleTable
  states: PentaState[]
  cyclicNeighbors: number[][]
}): PentaState[] {
  const { table, states, cyclicNeighbors } = input
  const next = states.slice()

  for (let cell = 0; cell < states.length; cell++) {
    const ring = cyclicNeighbors[cell]!.map(n => states[n]!)
    next[cell] = pentagridNext(table, states[cell]!, ring)
  }

  return next
}
