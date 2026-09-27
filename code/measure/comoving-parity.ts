// The role's 2 pi sign read about each token's OWN role point, the point the knit carries with it: the pieces
// E-SPN-0059 and E-SPN-0062 need to ask whether that makes a conserved fermion number.
//
// E-SPN-0051 found the 2 pi turn of the role about the grid point x is R_x = -A(x), A(x) the phase-point
// operator, so the projector onto the parity-even doublet about x (the spinor, R_x = -1) is Q_x = (1 + A(x)) / 2,
// and a token's spinor number about x is <Q_x> = (1 + 3 W(x)) / 2, W its Wigner weight at x. E-SPN-0054 found every
// link is covariant, U A(x) U^dagger = A(g x). So if each token carries its own point, moved by the same grid
// move as its weights, the number is kept by every link by construction. What a meeting does to it is the
// question, and a meeting sees two tokens whose points need not agree.
//
// The token's own point is the knit's own: the classical role point of code/rule/fear-weave's Lattice, which a
// closed token already carries (point[tk] = moves.act[g][point[tk]] at every crossing). For open tokens the rule
// moves the whole instead, so this module tracks the point beside the whole with the same table.
//
// Indexing: a whole's weights are indexed by the PHASE point (a, b) at 3 a + b; grid moves act on the GRID index
// a + 3 b (fear-weave's GRID_OF_PHASE, an involution). Points are tracked in grid index and read in phase index.
//
// Exact: weights are BigInt; a number is compared as a rational, cross-multiplied. Deterministic.

import { type ColorWeave } from '@/code/rule/color-weave'
import { GRID_OF_PHASE, phaseMinus, translatedKernel, type BeatRecord, type Whole } from '@/code/rule/fear-weave'
import { roleWeights, type RoleState } from '@/code/measure/knit-magic'
import { GOLDEN, weyl } from '@/code/tool/weyl'

// the phase-point difference and the translated kernel live in code/rule/fear-weave since the comoving beat was
// adopted (2026-09-26), one implementation; they are named here too for the experiments that read them from here
export { phaseMinus, translatedKernel }

// one role state's weights displaced to the phase point p: the state D(p) |psi>, whose Wigner function is the
// state's own moved by p
export function roleWeightsAt(state: RoleState, p: number): bigint[] {
  const base = roleWeights(state)

  return Array.from({ length: 9 }, (_, q) => base[phaseMinus(q, p)] ?? 0n)
}

// the product whole of two role states at their own phase points
export function productWholeAt(input: { tokens: readonly [number, number]; states: readonly [RoleState, RoleState]; points: readonly [number, number] }): Whole {
  const first = roleWeightsAt(input.states[0], input.points[0])
  const second = roleWeightsAt(input.states[1], input.points[1])
  const weight: bigint[] = []

  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
      weight.push((first[x] ?? 0n) * (second[y] ?? 0n))
    }
  }

  return { tokens: input.tokens, weight }
}

// a two-token whole's marginal weight of one coordinate at a phase point
export function marginalAt(whole: Whole, coordinate: 0 | 1, p: number): bigint {
  let sum = 0n

  for (let k = 0; k < 9; k++) {
    sum += (coordinate === 0 ? whole.weight[p * 9 + k] : whole.weight[k * 9 + p]) ?? 0n
  }

  return sum
}

export type ComovingReading = {
  // the total, love minus fear, of the whole: the denominator of every reading
  units: bigint
  // each token's marginal weight at its own point: its spinor number is (1 + 3 n / units) / 2
  own: [bigint, bigint]
  // the joint weight at the pair of own points: the product of the two 2 pi signs is 9 n / units
  joint: bigint
}

export function readComoving(whole: Whole, points: readonly [number, number]): ComovingReading {
  const units = whole.weight.reduce((a, b) => a + b, 0n)

  return {
    units,
    own: [marginalAt(whole, 0, points[0]), marginalAt(whole, 1, points[1])],
    joint: whole.weight[points[0] * 9 + points[1]] ?? 0n,
  }
}

// a / u == b / v, exactly
export const sameRatio = (a: bigint, u: bigint, b: bigint, v: bigint): boolean => a * v === b * u

// Each token's grid point beat by beat along a pair's records: the points each meeting of beat t sees (before
// that beat's crossings) and the points after the beat. `start` holds the grid points of the pair's two tokens.
export function trackPoints(input: {
  weave: ColorWeave
  records: readonly BeatRecord[]
  tokens: readonly [number, number]
  start: readonly [number, number]
}): { before: [number, number][]; after: [number, number][] } {
  const { weave, records, tokens } = input
  const point = new Map<number, number>([
    [tokens[0], input.start[0]],
    [tokens[1], input.start[1]],
  ])
  const before: [number, number][] = []
  const after: [number, number][] = []

  for (const record of records) {
    before.push([point.get(tokens[0]) ?? 0, point.get(tokens[1]) ?? 0])

    for (const [tk, g] of record.crossings) {
      const p = point.get(tk)

      if (p !== undefined) {
        point.set(tk, weave.moves.act[g]?.[p] ?? p)
      }
    }

    after.push([point.get(tokens[0]) ?? 0, point.get(tokens[1]) ?? 0])
  }

  return { before, after }
}

export const phaseOfGrid = (g: number): number => GRID_OF_PHASE[g] ?? 0

// A pure-gauge link field: a frame f_x (one of the 216 grid moves, from a golden Weyl sequence) at every dock
// and the link from x to its neighbour y the move f_y f_x^-1, so every closed loop carries the identity (no
// flux) while single links are generic. Its reverse is automatically the inverse move.
export function pureGaugeLinks(weave: ColorWeave): Int16Array {
  const { mesh, moves } = weave
  const count = moves.act.length
  const frame = Array.from({ length: mesh.cellCount }, (_, x) => Math.floor(weyl(x + 1, GOLDEN) * count) % count)
  const links = new Int16Array(mesh.cellCount * 24)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const y = mesh.neighbour(x, d)

      links[x * 24 + d] = moves.compose(frame[y] ?? 0, moves.inverse[frame[x] ?? 0] ?? moves.identity)
    }
  }

  return links
}
