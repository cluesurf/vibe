// Intelligence level 6, slice 4 (item vibe-computation-intelligence-0033, level6.md of vibe/computation/intelligence):
// the two layouts of an adaptive proposer step in one cell. A TIE-HOLDING selector reads the better candidate's content
// on every strictly ordered level pair and A's content on every tied pair (the incumbent stays unless the child is
// strictly better). A MUX reads a copy of P for one value of a control cell c and a copy of Q for the other.
//
// Import-free on purpose (a candidate folder, so check:layers forbids it the rules): the caller hands in each pair rule
// as its two output tables. Runs follow selection.ts's runLine (lineBrickRun's convention). Exact, no random numbers.

import { runLine, skeletons, type PairMap, type Skeleton } from '@/code/intelligence/improve/mesh/selection'
import { COPY_P, COPY_Q, behaviourOf, isMux } from '@/code/intelligence/improve/mesh/steering'

const TONES = [-1, 0, 1] as const

/** a tie-holding selector: the skeleton, the read (array index at `rounds`' pad, and round), and the codes */
export interface TieSelector {
  readonly skeleton: Skeleton
  readonly cell: number
  readonly round: number
  readonly rounds: number
  readonly codeA: readonly number[]
  readonly codeB: readonly number[]
  /** 1 when the read holds B's content for every content pair, per written tone pair (tA + 1) * 3 + (tB + 1) */
  readonly routesB: readonly number[]
}

export interface TieSearch {
  /** the first tie-holding selector */
  readonly selector: TieSelector | null
  /** the first selector whose ties are read wholesale (A's or B's content per tied level) */
  readonly wholesale: TieSelector | null
  readonly skeletons: number
  readonly runs: number
}

/** every map from `levels` levels to the three tones, in a fixed order */
function codes(levels: number): number[][] {
  const out: number[][] = []

  for (let c = 0; c < 3 ** levels; c++) {
    out.push(Array.from({ length: levels }, (_, j) => (Math.floor(c / 3 ** j) % 3) - 1))
  }

  return out
}

const bit = (mask: number, tA: number, tB: number): boolean => ((mask >> ((tA + 1) * 3 + tB + 1)) & 1) === 1

/**
 * How a selector reads tied levels: `hold-a` the incumbent's content on every tie; `wholesale` one candidate's content
 * per tied level, A's or B's, for every content pair (E-CMP-0078's convention: the tie read is taken as it is).
 */
export type TieRule = 'hold-a' | 'wholesale'

/** the first pair of codes, in enumeration order, that selects strictly and reads ties by `ties` at `levels` levels */
export function solveTieCodes(levels: number, winsA: number, winsB: number, ties: TieRule = 'hold-a'): { codeA: number[]; codeB: number[] } | null {
  const all = codes(levels)

  for (const codeA of all) {
    for (const codeB of all) {
      let ok = true

      for (let i = 0; i < levels && ok; i++) {
        for (let j = 0; j < levels && ok; j++) {
          if (i > j) {
            ok = bit(winsA, codeA[i]!, codeB[j]!)
          } else if (i < j) {
            ok = bit(winsB, codeA[i]!, codeB[j]!)
          } else {
            ok = bit(winsA, codeA[i]!, codeB[j]!) || (ties === 'wholesale' && bit(winsB, codeA[i]!, codeB[j]!))
          }
        }
      }

      if (ok) {
        return { codeA, codeB }
      }
    }
  }

  return null
}

/** the first tie-holding selector of a cell, in skeleton, round, cell and code order */
export function findTieSelector(input: {
  rule: PairMap
  background: number
  minWidth: number
  maxWidth: number
  rounds: number
  levels: number
}): TieSearch {
  const { rule, background, minWidth, maxWidth, rounds, levels } = input
  const contents = TONES.filter(t => t !== background)
  const pairs = contents.flatMap(a => contents.map(b => [a, b] as const))
  const memo = new Map<number, ({ codeA: number[]; codeB: number[] } | null)[]>()
  const all = skeletons(minWidth, maxWidth, background)

  let runs = 0
  let holding: TieSelector | null = null
  let wholesale: TieSelector | null = null

  for (const skeleton of all) {
    const frames: Int8Array[][][] = []

    for (const tA of TONES) {
      for (const tB of TONES) {
        frames.push(
          pairs.map(([a, b]) => {
            runs++

            const window = [...skeleton.constants]

            window[skeleton.at.contentA] = a
            window[skeleton.at.contentB] = b
            window[skeleton.at.scoreA] = tA
            window[skeleton.at.scoreB] = tB

            return runLine({ rule, background, start: skeleton.start, window, rounds })
          }),
        )
      }
    }

    const length = frames[0]![0]![0]!.length
    const left = skeleton.start + 2 * rounds + 2

    for (let round = 1; round <= rounds; round++) {
      const lo = Math.max(0, left - 2 * round - 1)
      const hi = Math.min(length - 1, left + skeleton.width + 2 * round)

      for (let cell = lo; cell <= hi; cell++) {
        let winsA = 0
        let winsB = 0

        for (let k = 0; k < 9; k++) {
          let allA = true
          let allB = true

          for (let c = 0; c < pairs.length; c++) {
            const read = frames[k]![c]![round]![cell]

            allA &&= read === pairs[c]![0]
            allB &&= read === pairs[c]![1]
          }

          if (allA) {
            winsA |= 1 << k
          }

          if (allB) {
            winsB |= 1 << k
          }
        }

        if (winsA === 0 || winsB === 0) {
          continue
        }

        const signature = winsA * 512 + winsB

        let solved = memo.get(signature)

        if (solved === undefined) {
          solved = [solveTieCodes(levels, winsA, winsB, 'hold-a'), solveTieCodes(levels, winsA, winsB, 'wholesale')]
          memo.set(signature, solved)
        }

        const routesB = Array.from({ length: 9 }, (_, k) => ((winsB >> k) & 1 ? 1 : 0))
        const make = (s: { codeA: number[]; codeB: number[] }): TieSelector => ({ skeleton, cell, round, rounds, codeA: s.codeA, codeB: s.codeB, routesB })

        if (holding === null && solved[0] !== null) {
          holding = make(solved[0]!)
        }

        if (wholesale === null && solved[1] !== null) {
          wholesale = make(solved[1]!)
        }

        if (holding !== null && wholesale !== null) {
          return { selector: holding, wholesale, skeletons: all.length, runs }
        }
      }
    }
  }

  return { selector: holding, wholesale, skeletons: all.length, runs }
}

/** a mux layout: window constants, the window offsets of c, P and Q, start parity, and the read */
export interface MuxLayout {
  readonly width: number
  readonly start: number
  readonly constants: readonly number[]
  /** window offsets of c, P, Q */
  readonly at: readonly [number, number, number]
  readonly cell: number
  readonly round: number
  readonly rounds: number
  /** the value of c (an excitation) at which the read copies P; at the other it copies Q */
  readonly copyPAt: number
}

/** the first mux of a cell, in (width, placement, constants, parity, round, cell) order */
export function findMux(input: { rule: PairMap; background: number; minWidth: number; maxWidth: number; rounds: number }): {
  mux: MuxLayout | null
  layouts: number
} {
  const { rule, background, minWidth, maxWidth, rounds } = input
  const ex = TONES.filter(t => t !== background) as unknown as [number, number]
  const reads = new Int8Array(4)

  let layouts = 0

  for (let width = minWidth; width <= maxWidth; width++) {
    for (let c = 0; c < width; c++) {
      for (let p = 0; p < width; p++) {
        for (let q = 0; q < width; q++) {
          if (c === p || c === q || p === q) {
            continue
          }

          const free = Array.from({ length: width }, (_, i) => i).filter(i => i !== c && i !== p && i !== q)

          for (let code = 0; code < 3 ** free.length; code++) {
            const constants = Array.from({ length: width }, () => background)

            let x = code

            for (const i of free) {
              constants[i] = (x % 3) - 1
              x = Math.floor(x / 3)
            }

            for (const start of [0, 1]) {
              layouts++

              const runs: Int8Array[][] = []

              for (let vc = 0; vc < 2; vc++) {
                for (let vp = 0; vp < 2; vp++) {
                  for (let vq = 0; vq < 2; vq++) {
                    const window = [...constants]

                    window[c] = ex[vc]!
                    window[p] = ex[vp]!
                    window[q] = ex[vq]!
                    runs.push(runLine({ rule, background, start, window, rounds }))
                  }
                }
              }

              const length = runs[0]![0]!.length

              for (let round = 1; round <= rounds; round++) {
                for (let cell = 0; cell < length; cell++) {
                  const beh: number[] = []

                  for (let vc = 0; vc < 2; vc++) {
                    for (let d = 0; d < 4; d++) {
                      reads[d] = runs[vc * 4 + d]![round]![cell]!
                    }

                    beh.push(behaviourOf(reads, ex))
                  }

                  if (isMux(beh[0]!, beh[1]!)) {
                    const copyPAt = beh[0] === COPY_P ? ex[0] : beh[1] === COPY_P ? ex[1] : null

                    if (copyPAt === null || (beh[0] !== COPY_Q && beh[1] !== COPY_Q)) {
                      throw new Error('adaptive-layouts: a mux without a copy of P and of Q')
                    }

                    return { mux: { width, start, constants, at: [c, p, q], cell, round, rounds, copyPAt }, layouts }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return { mux: null, layouts }
}
