// Intelligence level 6, slice 2: can a selected content STEER a later
// proposal? A control cell c and two data cells P and Q each range over the two excitations u and v (index 0 and 1).
// A read STEERS when its behaviour over (P, Q) differs between c = u and c = v, both behaviours are "copy of P", "copy
// of Q" or a constant, and at least one is a copy (a mux is copy P against copy Q, a gate a copy against a constant).
// A one-layout ADAPTIVE STEP (roles a, b, sA, sB, P, Q) steers by the winner's content with one fixed pair of
// behaviours on every strictly ordered score pair, content pair and data pair.
//
// Import-free (a candidate folder): the caller hands in the runs.

import type { RunFrames } from '@/code/intelligence/improve/mesh/multi-score'

/** 0 other, 1 copy of P, 2 copy of Q, 3 + (t + 1) the constant t */
export type Behaviour = number

export const OTHER = 0
export const COPY_P = 1
export const COPY_Q = 2

const isCopy = (b: Behaviour): boolean => b === COPY_P || b === COPY_Q

/** the behaviour of four reads indexed P * 2 + Q, the data values being ex[P] and ex[Q] */
export function behaviourOf(reads: ArrayLike<number>, ex: readonly [number, number]): Behaviour {
  let copyP = true
  let copyQ = true
  let constant = true

  for (let P = 0; P < 2; P++) {
    for (let Q = 0; Q < 2; Q++) {
      const y = reads[P * 2 + Q]!

      copyP &&= y === ex[P]
      copyQ &&= y === ex[Q]
      constant &&= y === reads[0]
    }
  }

  return copyP ? COPY_P : copyQ ? COPY_Q : constant ? 3 + reads[0]! + 1 : OTHER
}

/** whether a pair of behaviours (for c = u and c = v) steers */
export function steers(bu: Behaviour, bv: Behaviour): boolean {
  return bu !== bv && bu !== OTHER && bv !== OTHER && (isCopy(bu) || isCopy(bv))
}

export function isMux(bu: Behaviour, bv: Behaviour): boolean {
  return (bu === COPY_P && bv === COPY_Q) || (bu === COPY_Q && bv === COPY_P)
}

/** the expected read for behaviour b on data (P, Q) */
export function expectedRead(b: Behaviour, ex: readonly [number, number], P: number, Q: number): number {
  return b === COPY_P ? ex[P]! : b === COPY_Q ? ex[Q]! : b - 4
}

/**
 * Every steering read of one layout. runs[c * 4 + P * 2 + Q] are the frames of the eight inputs. A read must be
 * looked at on every cell occupied in some run (a constant behaviour may be the background).
 */
export function steeringReads(input: {
  runs: readonly RunFrames[]
  ex: readonly [number, number]
  rounds: number
  each: (round: number, cell: number, bu: Behaviour, bv: Behaviour) => void
}): void {
  const { runs, ex, rounds, each } = input
  const reads = new Int8Array(4)

  for (let round = 1; round <= rounds; round++) {
    const cells = new Set<number>()

    for (const r of runs) {
      for (const c of r.occupied(round)) {
        cells.add(c)
      }
    }

    for (const cell of [...cells].sort((x, y) => x - y)) {
      const b: Behaviour[] = []

      for (let c = 0; c < 2; c++) {
        for (let d = 0; d < 4; d++) {
          reads[d] = runs[c * 4 + d]!.value(round, cell)
        }

        b.push(behaviourOf(reads, ex))
      }

      if (steers(b[0]!, b[1]!)) {
        each(round, cell, b[0]!, b[1]!)
      }
    }
  }
}

/** a steering pattern (bu, bv) as one number, or -1 */
export const patternKey = (bu: Behaviour, bv: Behaviour): number => (steers(bu, bv) ? bu * 8 + bv : -1)

export interface AdaptiveStep {
  readonly levels: number
  /** level -> tone index (tone = index - 1) */
  readonly codeA: readonly number[]
  readonly codeB: readonly number[]
  readonly pattern: number
}

/**
 * Per score-tone pair k = (tA + 1) * 3 + (tB + 1): the pattern by which A's content steers (the read's behaviour
 * depends on a alone, not on b) and the one by which B's does, or -1. runs[((k * 2 + a) * 2 + b) * 4 + P * 2 + Q].
 */
export function adaptivePatterns(runs: readonly RunFrames[], ex: readonly [number, number], round: number, cell: number): { byA: Int32Array; byB: Int32Array } {
  const byA = new Int32Array(9).fill(-1)
  const byB = new Int32Array(9).fill(-1)
  const reads = new Int8Array(4)
  const beh = new Int32Array(4)

  for (let k = 0; k < 9; k++) {
    for (let ab = 0; ab < 4; ab++) {
      for (let d = 0; d < 4; d++) {
        reads[d] = runs[(k * 4 + ab) * 4 + d]!.value(round, cell)
      }

      beh[ab] = behaviourOf(reads, ex)
    }

    // beh[a * 2 + b]
    if (beh[0] === beh[1] && beh[2] === beh[3]) {
      byA[k] = patternKey(beh[0]!, beh[2]!)
    }

    if (beh[0] === beh[2] && beh[1] === beh[3]) {
      byB[k] = patternKey(beh[0]!, beh[1]!)
    }
  }

  return { byA, byB }
}

/** codes and a pattern making the winner's content steer at `levels` levels, by exhaustion over 3^L x 3^L codes */
export function solveAdaptive(levels: number, byA: Int32Array, byB: Int32Array): AdaptiveStep | null {
  const codes: number[][] = []

  for (let c = 0; c < 3 ** levels; c++) {
    codes.push(Array.from({ length: levels }, (_, j) => Math.floor(c / 3 ** j) % 3))
  }

  for (const codeA of codes) {
    for (const codeB of codes) {
      let pattern = -2
      let ok = true

      for (let i = 0; i < levels && ok; i++) {
        for (let j = 0; j < levels && ok; j++) {
          if (i === j) {
            continue
          }

          const k = codeA[i]! * 3 + codeB[j]!
          const p = i > j ? byA[k]! : byB[k]!

          if (p < 0 || (pattern !== -2 && p !== pattern)) {
            ok = false
          } else {
            pattern = p
          }
        }
      }

      if (ok && pattern >= 0) {
        return { levels, codeA, codeB, pattern }
      }
    }
  }

  return null
}
