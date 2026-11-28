// Intelligence level 6, slice 2 :
// selection with each candidate's score written into several cells. The evaluator writes A's score as a k-tuple of
// tones and B's likewise, each through a code of its own (a map from the levels to the 3^k tuples). A read is a
// selector at L levels when some pair of codes makes it hold the better candidate's content on every content pair and
// strictly ordered score pair.
//
// Import-free on purpose (a candidate folder, check:layers forbids it the rules): the caller hands in the runs.
//
// Lemma K: if the read sees a distinct values of A's score cells and b of B's, at most
// min(a + b - 1, 2a, 2b) levels are ordered. `abstractMaxLevels` checks the bound by exact backtracking over class maps.

/** the frames of one run, read at a round end: the tone of a cell, and the cells off the background */
export interface RunFrames {
  value(round: number, cell: number): number
  occupied(round: number): readonly number[]
}

/** frames of a dense line run (selection.ts runLine) as RunFrames */
export function lineFrames(frames: readonly Int8Array[], background: number): RunFrames {
  const occupiedCache: (number[] | undefined)[] = []

  return {
    value: (round, cell) => frames[round]![cell] ?? background,
    occupied: round => {
      let out = occupiedCache[round]

      if (out === undefined) {
        out = []

        const f = frames[round]!

        for (let i = 0; i < f.length; i++) {
          if (f[i] !== background) {
            out.push(i)
          }
        }

        occupiedCache[round] = out
      }

      return out
    },
  }
}

/** the codes found for a read: level -> value index on each side */
export interface CodePair {
  readonly codeA: readonly number[]
  readonly codeB: readonly number[]
}

/**
 * Codes for exactly `levels` levels over `n` values per side, or null. okA(vA, vB): with A's score written as vA and
 * B's as vB, the read holds A's content on every content pair (A wins); okB likewise for B. A wins the pair (i, j)
 * when i > j. Complete backtracking in the order cA(0), cB(0), cA(1), cB(1), ...: assigning cA(i) checks every
 * assigned cB(j), j < i (A wins), assigning cB(j) every assigned cA(i), i < j (B wins). Exact.
 */
export function solveCodesOver(n: number, levels: number, okA: Uint8Array, okB: Uint8Array): CodePair | null {
  const cA = new Int32Array(levels)
  const cB = new Int32Array(levels)

  const place = (slot: number): boolean => {
    if (slot === 2 * levels) {
      return true
    }

    const level = slot >> 1

    if ((slot & 1) === 0) {
      for (let v = 0; v < n; v++) {
        let fits = true

        for (let j = 0; j < level && fits; j++) {
          fits = okA[v * n + cB[j]!] === 1
        }

        if (fits) {
          cA[level] = v

          if (place(slot + 1)) {
            return true
          }
        }
      }

      return false
    }

    for (let v = 0; v < n; v++) {
      let fits = true

      for (let i = 0; i < level && fits; i++) {
        fits = okB[cA[i]! * n + v] === 1
      }

      if (fits) {
        cB[level] = v

        if (place(slot + 1)) {
          return true
        }
      }
    }

    return false
  }

  return place(0) ? { codeA: Array.from(cA), codeB: Array.from(cB) } : null
}

/** the largest level count from 2 to cap that some pair of codes reaches (monotone: drop the top level), or 1 */
export function maxLevelsOver(n: number, okA: Uint8Array, okB: Uint8Array, cap: number): { levels: number; codes: CodePair | null } {
  let best: { levels: number; codes: CodePair | null } = { levels: 1, codes: null }

  for (let L = 2; L <= cap; L++) {
    const codes = solveCodesOver(n, L, okA, okB)

    if (codes === null) {
      break
    }

    best = { levels: L, codes }
  }

  return best
}

/**
 * Lemma K by brute force: the largest L for which class maps oA: levels -> a values and oB: levels -> b values admit a
 * consistent outcome (no value pair gets both an A-win and a B-win), with any outcome function. Values are taken in
 * first-use order on each side (a relabelling changes nothing). Exact backtracking.
 */
export function abstractMaxLevels(a: number, b: number, cap: number): number {
  const fits = (L: number): boolean => {
    const oA = new Int32Array(L)
    const oB = new Int32Array(L)
    // per value pair: count of A-wins and B-wins placed on it
    const winsA = new Int32Array(a * b)
    const winsB = new Int32Array(a * b)

    const place = (slot: number, usedA: number, usedB: number): boolean => {
      if (slot === 2 * L) {
        return true
      }

      const level = slot >> 1

      if ((slot & 1) === 0) {
        for (let v = 0; v < Math.min(a, usedA + 1); v++) {
          let ok = true

          for (let j = 0; j < level && ok; j++) {
            ok = winsB[v * b + oB[j]!] === 0
          }

          if (!ok) {
            continue
          }

          oA[level] = v

          for (let j = 0; j < level; j++) {
            winsA[v * b + oB[j]!]!++
          }

          if (place(slot + 1, Math.max(usedA, v + 1), usedB)) {
            return true
          }

          for (let j = 0; j < level; j++) {
            winsA[v * b + oB[j]!]!--
          }
        }

        return false
      }

      for (let v = 0; v < Math.min(b, usedB + 1); v++) {
        let ok = true

        for (let i = 0; i < level && ok; i++) {
          ok = winsA[oA[i]! * b + v] === 0
        }

        if (!ok) {
          continue
        }

        oB[level] = v

        for (let i = 0; i < level; i++) {
          winsB[oA[i]! * b + v]!++
        }

        if (place(slot + 1, usedA, Math.max(usedB, v + 1))) {
          return true
        }

        for (let i = 0; i < level; i++) {
          winsB[oA[i]! * b + v]!--
        }
      }

      return false
    }

    return place(0, 0, 0)
  }

  let best = 1

  for (let L = 2; L <= cap && fits(L); L++) {
    best = L
  }

  return best
}

/** Lemma K's closed form */
export function alphabetBound(a: number, b: number): number {
  return Math.min(a + b - 1, 2 * a, 2 * b)
}

/**
 * The selection read census of one layout. runs[(vA * n + vB) * pairs.length + c] are the frames for A's score
 * written as value vA, B's as vB and content pair c. Returns, per read (round, cell) with some A-win and some B-win
 * value pair, the masks; the caller solves them (memoized by the masks).
 */
export function selectionMasks(input: {
  runs: readonly RunFrames[]
  n: number
  pairs: readonly (readonly [number, number])[]
  rounds: number
  each: (round: number, cell: number, okA: Uint8Array, okB: Uint8Array) => void
}): void {
  const { runs, n, pairs, rounds, each } = input
  const okA = new Uint8Array(n * n)
  const okB = new Uint8Array(n * n)

  for (let round = 1; round <= rounds; round++) {
    // the read must hold a content (off the background) in every run, so in the first one
    for (const cell of runs[0]!.occupied(round)) {
      let anyA = false
      let anyB = false

      for (let k = 0; k < n * n; k++) {
        let allA = true
        let allB = true

        for (let c = 0; c < pairs.length && (allA || allB); c++) {
          const read = runs[k * pairs.length + c]!.value(round, cell)

          if (read !== pairs[c]![0]) {
            allA = false
          }

          if (read !== pairs[c]![1]) {
            allB = false
          }
        }

        okA[k] = allA ? 1 : 0
        okB[k] = allB ? 1 : 0
        anyA ||= allA
        anyB ||= allB
      }

      if (anyA && anyB) {
        each(round, cell, okA, okB)
      }
    }
  }
}

/** a mask pair as a short key */
export function maskKey(okA: Uint8Array, okB: Uint8Array): string {
  let s = ''

  for (let i = 0; i < okA.length; i++) {
    s += String.fromCharCode(48 + okA[i]! + 2 * okB[i]!)
  }

  return s
}

/** every k-tuple of tones, index = sum (t_j + 1) 3^j */
export function toneTuples(k: number): number[][] {
  return Array.from({ length: 3 ** k }, (_, v) => Array.from({ length: k }, (_, j) => (Math.floor(v / 3 ** j) % 3) - 1))
}

/** every ordering of `count` distinct role cells in a window of `width` cells (role r at out[i][r]) */
export function placements(width: number, count: number): number[][] {
  const out: number[][] = []
  const acc: number[] = []
  const used = new Array<boolean>(width).fill(false)

  const grow = (): void => {
    if (acc.length === count) {
      out.push([...acc])

      return
    }

    for (let i = 0; i < width; i++) {
      if (!used[i]) {
        used[i] = true
        acc.push(i)
        grow()
        acc.pop()
        used[i] = false
      }
    }
  }

  grow()

  return out
}

/** FNV-1a digest of a string (exact) */
export function digestText(text: string): string {
  let h = 0x811c9dc5

  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }

  return h.toString(16).padStart(8, '0')
}
