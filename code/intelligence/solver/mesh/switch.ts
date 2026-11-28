/**
 * The M5 decisions of level 4, slice 2: switch layouts of the
 * occupancy-blind exchange rule `swap.ABC.swap` on the vacuum (background 0), run on the line under the two-colour
 * brick schedule exactly as code/compute/lab/gates.ts `lineBrickRun` runs them (pairs (2k, 2k + 1), then
 * (2k + 1, 2k + 2), left cell first, the array padded by 2 * rounds + 2 on each side, only the pairs touching the
 * light cone updated). Under this rule a lone tone moves two cells a round and two occupied cells that share a pair
 * keep their places, so two movers that meet trade tracks (an exchange, M5); presence routes, the sign rides along.
 *
 * - LIT_SWITCH, the lit test `|x|` (1 when x is off the background, 0 when not): the switch M5 found at width 2, the
 *   input meeting a constant +1, read where the constant arrives when the input is present.
 * - EXPAND_SWITCH, the expand gate in signed form: +1 when x is off the background and the slot s is empty, -1
 *   otherwise. On the line the movers keep their order (they bounce), so the read cell holds the k-th occupied start
 *   cell's tone, k set by how many movers' free tracks lie left of it; the layout puts the inputs on two crossing
 *   tracks so that k shifts by one with x present and the list shifts by one with s present.
 *
 * The 0/1 form of the expand gate (and both forms of the register write) cannot be laid out: under every
 * occupancy-blind cell a cell's occupancy at any round is the start occupancy of one fixed cell (slice
 * 2), and those tables need the output's occupancy to be x and not s, x and g, or x or s.
 *
 * Since the metered round the honest solver never runs a layout itself: it asks the evaluator through `MeshHost`, which
 * executes and meters every round. `runSwitch` stays as the candidate-side copy the controls use (a lookup table built
 * from one run per input word, a formula with a made-up frame), checked against `swap.ABC.swap` of
 * code/rule/pair-rule.ts and against `lineBrickRun` cell for cell, on every input, in E-CMP-0060. No imports, exact
 * integers.
 */

/** Pair index p = (a + 1) * 3 + (b + 1); entry p is the image pair. `swap.ABC.swap`: the lone pairs swap, the rest keep. */
export const EXCHANGE_TABLE: readonly number[] = [0, 3, 2, 1, 4, 7, 6, 5, 8]

export const EXCHANGE_RULE = 'swap.ABC.swap'

export interface SwitchLayout {
  name: string
  /** the start parity: the window's first cell sits at this position */
  start: number
  /** the window's tones; the input cells hold 0 here and are written per run */
  window: readonly number[]
  /** window offsets of the inputs, in truth-table order (the first input least significant) */
  inputs: readonly number[]
  /** the read cell (a position, window cell i at start + i) and the round it is read at */
  readPosition: number
  readRound: number
  /** the decision's truth table over the inputs, inputs in the order of gates.ts `inputsOf` */
  table: readonly number[]
}

export const LIT_SWITCH: SwitchLayout = {
  name: 'lit-abs-width-2',
  start: 0,
  window: [0, 1],
  inputs: [0],
  readPosition: 2,
  readRound: 1,
  table: [1, 0, 1],
}

export const EXPAND_SWITCH: SwitchLayout = {
  name: 'expand-signed-width-8',
  start: 0,
  window: [0, 0, 1, -1, -1, 0, 0, -1],
  inputs: [0, 5],
  readPosition: 3,
  readRound: 2,
  // x (least significant) then s: +1 exactly when x != 0 and s = 0
  table: [-1, -1, -1, 1, -1, 1, -1, -1, -1],
}

/** What the evaluator answers for one batch of metered runs. */
export interface MeshRunsReply {
  /** each run's read cell, in request order */
  values: number[]
  /** pair updates the evaluator spent on the batch */
  pairUpdates: number
  /** the layout's metered digest after this batch (mesh-digest.ts: an order-sensitive chain, so the last one stands) */
  frameDigest: number
}

/**
 * The metered mesh round: the candidate never runs a layout itself; it names the rule and gives the
 * layout, the step, and per run the state the decision is for and its input word (`words`, layout.inputs.length tones
 * a run). The evaluator executes every round and meters it. The sandbox bridge adds this to every solver's host.
 */
export interface MeshHost<S> {
  meshRuns: (rule: string, layout: SwitchLayout, step: number, nodes: readonly S[], words: readonly number[]) => MeshRunsReply
}

export interface SwitchRun {
  /** the tone at the read cell at the read round */
  value: number
  /** a hash of the whole final frame (read cell and garbage) */
  frameHash: number
  pairUpdates: number
}

/** The array length of a layout's run: start + width + 2 * pad, pad = 2 * readRound + 2 (as lineBrickRun). */
export function switchLength(layout: SwitchLayout): number {
  return layout.start + layout.window.length + 2 * (2 * layout.readRound + 2)
}

/**
 * Run a layout on `inputs` in `cells` (length switchLength, overwritten), round for round as lineBrickRun does. With
 * `frames`, every round end (round 0 the start) is pushed as a copy, for the certificate.
 */
export function runSwitch(layout: SwitchLayout, inputs: readonly number[], cells: Int8Array, table: readonly number[] = EXCHANGE_TABLE, frames?: Int8Array[]): SwitchRun {
  const rounds = layout.readRound
  const pad = 2 * rounds + 2
  const length = layout.start + layout.window.length + 2 * pad

  cells.fill(0)

  for (let i = 0; i < layout.window.length; i++) {
    cells[layout.start + i + pad] = layout.window[i]!
  }

  for (let j = 0; j < layout.inputs.length; j++) {
    cells[layout.start + layout.inputs[j]! + pad] = inputs[j]!
  }

  frames?.push(cells.slice(0, length))

  let lo = layout.start + pad
  let hi = layout.start + pad + layout.window.length - 1
  let pairUpdates = 0

  for (let t = 0; t < rounds; t++) {
    for (let color = 0; color < 2; color++) {
      let i = lo - 2 > 0 ? lo - 2 : 0

      if ((i & 1) !== color) {
        i++
      }

      for (; i + 1 < length && i <= hi; i += 2) {
        const q = table[(cells[i]! + 1) * 3 + cells[i + 1]! + 1]!
        const low = q % 3

        cells[i] = (q - low) / 3 - 1
        cells[i + 1] = low - 1
        pairUpdates++
      }

      lo = lo - 1 > 0 ? lo - 1 : 0
      hi = hi + 1 < length - 1 ? hi + 1 : length - 1
    }

    frames?.push(cells.slice(0, length))
  }

  return { value: cells[layout.readPosition + pad]!, frameHash: frameHash(cells, length), pairUpdates }
}

/** A frame's hash: a polynomial over its tones (residues 0, 1, 2), mod 1,000,003. */
export function frameHash(cells: Int8Array, length: number): number {
  let h = 7

  for (let i = 0; i < length; i++) {
    h = (h * 31 + cells[i]! + 1) % 1_000_003
  }

  return h
}
