// Intelligence level 6, slice 1 :
// can the SELECTION step of an improve loop run as mesh dynamics? The outside evaluator grades each candidate alone
// and writes each candidate's own score (one trit, through a code) into the mesh beside its content (one trit). A
// selector is a line layout of a pair rule, a pair of codes and a read cell and round such that, for every content
// pair and every strictly ordered score pair, the read holds the better candidate's content.
//
// Import-free on purpose: this folder is a candidate folder (check:layers forbids it the rules), so the caller hands
// in each pair rule as its two output tables, indexed (a + 1) * 3 + (b + 1). The runner follows lineBrickRun's
// convention (code/compute/lab/gates.ts): pad 2 * rounds + 2 cells each side, the window at index start + pad, colour 0
// pairs (2k, 2k + 1) by array index, colour 1 pairs (2k + 1, 2k + 2), left cell first, one round = both colours.

export interface PairMap {
  readonly first: ArrayLike<number>
  readonly second: ArrayLike<number>
}

/** every frame of a dense brick run on the line, frame 0 the start; written apart from lineBrickRun (full sweeps) */
export function runLine(input: {
  rule: PairMap
  background: number
  start: number
  window: ArrayLike<number>
  rounds: number
}): Int8Array[] {
  const { rule, background, start, window, rounds } = input
  const pad = 2 * rounds + 2
  const length = start + window.length + 2 * pad
  const cells = new Int8Array(length).fill(background)

  for (let i = 0; i < window.length; i++) {
    cells[start + i + pad] = window[i]!
  }

  const frames = [Int8Array.from(cells)]

  for (let t = 0; t < rounds; t++) {
    for (let color = 0; color < 2; color++) {
      for (let i = color; i + 1 < length; i += 2) {
        const p = (cells[i]! + 1) * 3 + cells[i + 1]! + 1

        cells[i] = rule.first[p]!
        cells[i + 1] = rule.second[p]!
      }
    }

    frames.push(Int8Array.from(cells))
  }

  return frames
}

/** role of a window cell: a constant tone, or one of the four written cells */
export type Role = 'contentA' | 'contentB' | 'scoreA' | 'scoreB'

export interface Skeleton {
  readonly width: number
  readonly start: number
  /** constant tones, with the role cells set to the background (filled per input) */
  readonly constants: readonly number[]
  readonly at: Readonly<Record<Role, number>>
}

export interface Selector {
  readonly skeleton: Skeleton
  readonly levels: number
  /** level -> tone written in the score cell */
  readonly codeA: readonly number[]
  readonly codeB: readonly number[]
  /** array index of the read cell in the frame padded for `rounds` rounds, and the round it is read at */
  readonly cell: number
  readonly round: number
  readonly rounds: number
}

export interface Census {
  readonly skeletons: number
  readonly runs: number
  /** per level count: reads (skeleton, cell, round) that admit some pair of codes */
  readonly selectorReads: Readonly<Record<number, number>>
  readonly minWidth: Readonly<Record<number, number | null>>
  /** the first selector found per level */
  readonly examples: Readonly<Record<number, Selector | null>>
  /** a digest of every selector read, for determinism */
  readonly digest: string
}

const TONES = [-1, 0, 1] as const

/** the window of a skeleton for one written input */
export function fill(s: Skeleton, input: { a: number; b: number; scoreA: number; scoreB: number }): number[] {
  const w = [...s.constants]

  w[s.at.contentA] = input.a
  w[s.at.contentB] = input.b
  w[s.at.scoreA] = input.scoreA
  w[s.at.scoreB] = input.scoreB

  return w
}

/** every skeleton: four distinct role cells, any constant tone elsewhere, both start parities */
export function skeletons(minWidth: number, maxWidth: number, background: number): Skeleton[] {
  const out: Skeleton[] = []

  for (let width = minWidth; width <= maxWidth; width++) {
    for (let ca = 0; ca < width; ca++) {
      for (let cb = 0; cb < width; cb++) {
        for (let sa = 0; sa < width; sa++) {
          for (let sb = 0; sb < width; sb++) {
            const roles = [ca, cb, sa, sb]

            if (new Set(roles).size < 4) {
              continue
            }

            const free = Array.from({ length: width }, (_, i) => i).filter(i => !roles.includes(i))

            for (let code = 0; code < 3 ** free.length; code++) {
              const constants = Array.from({ length: width }, () => background)
              let x = code

              for (const i of free) {
                constants[i] = (x % 3) - 1
                x = Math.floor(x / 3)
              }

              for (const start of [0, 1]) {
                out.push({ width, start, constants, at: { contentA: ca, contentB: cb, scoreA: sa, scoreB: sb } })
              }
            }
          }
        }
      }
    }
  }

  return out
}

/** every map from the levels to the three tones */
function codes(levels: number): number[][] {
  const out: number[][] = []

  for (let c = 0; c < 3 ** levels; c++) {
    out.push(Array.from({ length: levels }, (_, j) => (Math.floor(c / 3 ** j) % 3) - 1))
  }

  return out
}

const toneIndex = (t: number): number => t + 1

/**
 * Whether some pair of codes works for a read, given for every pair of written score tones (index tA * 3 + tB)
 * whether the read equals A's content for every content pair (winsA) and B's (winsB). With A's code fixed, the
 * constraints on B's code split by B's level, so each level of B is chosen alone: exact.
 */
export function solveCodes(levels: number, winsA: number, winsB: number): { codeA: number[]; codeB: number[] } | null {
  const ok = (mask: number, tA: number, tB: number): boolean => ((mask >> (toneIndex(tA) * 3 + toneIndex(tB))) & 1) === 1

  for (const codeA of codes(levels)) {
    const codeB: number[] = []

    for (let j = 0; j < levels; j++) {
      const pick = TONES.find(p => {
        for (let i = 0; i < levels; i++) {
          if (i > j && !ok(winsA, codeA[i]!, p)) {
            return false
          }

          if (i < j && !ok(winsB, codeA[i]!, p)) {
            return false
          }
        }

        return true
      })

      if (pick === undefined) {
        break
      }

      codeB.push(pick)
    }

    if (codeB.length === levels) {
      return { codeA, codeB }
    }
  }

  return null
}

/** whether a selector picks the better content on every input, replayed with the given runner */
export function selectorHolds(
  selector: Selector,
  rule: PairMap,
  background: number,
  contents: readonly number[],
  run: (input: { rule: PairMap; background: number; start: number; window: ArrayLike<number>; rounds: number }) => ArrayLike<ArrayLike<number>>,
): { inputs: number; wrong: number } {
  const { skeleton, levels, codeA, codeB, cell, round, rounds } = selector
  let inputs = 0
  let wrong = 0

  for (let sA = 0; sA < levels; sA++) {
    for (let sB = 0; sB < levels; sB++) {
      if (sA === sB) {
        continue
      }

      for (const a of contents) {
        for (const b of contents) {
          const window = fill(skeleton, { a, b, scoreA: codeA[sA]!, scoreB: codeB[sB]! })
          const frames = run({ rule, background, start: skeleton.start, window, rounds })
          const read = frames[round]![cell]

          inputs++

          if (read !== (sA > sB ? a : b)) {
            wrong++
          }
        }
      }
    }
  }

  return { inputs, wrong }
}

/** FNV-1a over a string, as a hex digest (exact, no floating point) */
export function digestOf(text: string): string {
  let h = 0x811c9dc5

  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }

  return h.toString(16).padStart(8, '0')
}

/** the census of one rule-background cell over every skeleton, for each number of levels */
export function selectionCensus(input: {
  rule: PairMap
  background: number
  minWidth: number
  maxWidth: number
  rounds: number
  levels: readonly number[]
}): Census {
  const { rule, background, minWidth, maxWidth, rounds, levels } = input
  const contents = TONES.filter(t => t !== background)
  const pairs = contents.flatMap(a => contents.map(b => [a, b] as const))
  const memo = new Map<number, ({ codeA: number[]; codeB: number[] } | null)[]>()
  const selectorReads: Record<number, number> = {}
  const minW: Record<number, number | null> = {}
  const examples: Record<number, Selector | null> = {}
  const trail: string[] = []
  let runs = 0

  for (const L of levels) {
    selectorReads[L] = 0
    minW[L] = null
    examples[L] = null
  }

  const all = skeletons(minWidth, maxWidth, background)

  for (const skeleton of all) {
    // frames[tA * 3 + tB][content pair]
    const frames: Int8Array[][][] = []

    for (const tA of TONES) {
      for (const tB of TONES) {
        frames.push(
          pairs.map(([a, b]) => {
            runs++

            return runLine({ rule, background, start: skeleton.start, window: fill(skeleton, { a, b, scoreA: tA, scoreB: tB }), rounds })
          }),
        )
      }
    }

    const length = frames[0]![0]![0]!.length
    const left = skeleton.start + 2 * rounds + 2

    for (let round = 1; round <= rounds; round++) {
      // outside the light cone of the window every read is the background, whatever is written
      const lo = Math.max(0, left - 2 * round - 1)
      const hi = Math.min(length - 1, left + skeleton.width + 2 * round)

      for (let cell = lo; cell <= hi; cell++) {
        let winsA = 0
        let winsB = 0

        for (let k = 0; k < 9; k++) {
          const byPair = frames[k]!
          let allA = true
          let allB = true

          for (let c = 0; c < pairs.length; c++) {
            const read = byPair[c]![round]![cell]

            if (read !== pairs[c]![0]) {
              allA = false
            }

            if (read !== pairs[c]![1]) {
              allB = false
            }

            if (!allA && !allB) {
              break
            }
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
          solved = levels.map(L => solveCodes(L, winsA, winsB))
          memo.set(signature, solved)
        }

        levels.forEach((L, li) => {
          const codesFound = solved[li]

          if (codesFound === null || codesFound === undefined) {
            return
          }

          selectorReads[L] = selectorReads[L]! + 1
          trail.push(`${L}:${skeleton.width}:${skeleton.start}:${skeleton.constants.join('')}:${Object.values(skeleton.at).join('')}:${cell}:${round}`)

          if (minW[L] === null || skeleton.width < minW[L]!) {
            minW[L] = skeleton.width
          }

          if (examples[L] === null) {
            examples[L] = { skeleton, levels: L, codeA: codesFound.codeA, codeB: codesFound.codeB, cell, round, rounds }
          }
        })
      }
    }
  }

  return { skeletons: all.length, runs, selectorReads, minWidth: minW, examples, digest: digestOf(trail.join('|')) }
}
