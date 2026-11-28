// The Brink-Howlett small-root automaton of a rank-3 Coxeter group, and from it the EXACT growth of a coset tiling
// (coset-tiling.ts) for every radius: tiles by facet distance, and minimal coset representatives by word length
// Exact ring arithmetic and certified signs only (cosine-ring.ts).
//
// SMALL ROOTS. With 2B(alpha_i, alpha_j) = -2cos(pi/m_ij) (i != j) and 2 on the diagonal, the small (elementary) roots
// form the smallest set holding the simple roots and closed under beta -> s(beta) whenever -1 < B(beta, alpha_s) < 0
// (Brink and Howlett 1993; Bjorner and Brenti, Combinatorics of Coxeter Groups, 4.7). The set is finite. Reading a word
// left to right, the state A(w) = {small beta > 0 : w(beta) < 0} decides whether w s is still reduced (alpha_s not in
// A(w)), and A(w s) = ({alpha_s} union s(A(w))) intersected with the small roots (Bjorner and Brenti 4.8): a finite
// automaton for the reduced words.
//
// COSET GROWTH. coset-tiling.ts proves each tile's minimal representative w_T has the canonical form
// u_1 s_2 u_2 s_2 ... u_d s_2 (u_i in W_J, d the facet distance), every prefix being reduced and free of right J-descents,
// and that every such sequence names exactly one tile. So the tiles at distance d are the paths of d blocks
// (a reduced word of u, then s_2) through the automaton that end each block in a state holding neither alpha_0 nor
// alpha_1. Counting paths by blocks gives the tile shells; counting by letters gives the minimal coset representatives
// by length, which must equal Steinberg's W(t) / W_J(t).

import { CosineRing, addTimes, cosineRing, ringSign } from '@/code/substrate/coxeter/cosine-ring'

const RANK = 3
const SMALL_ROOT_CAP = 20_000

export type SmallRootAutomaton = {
  readonly ring: CosineRing
  readonly coxeter: readonly (readonly number[])[]
  // small roots as coefficient vectors on the simple roots (RANK * ring.size)
  readonly roots: readonly (readonly bigint[])[]
  // act[i * RANK + s]: the small root s(roots[i]), or -1 when it is not small (or negative)
  readonly act: Int32Array
  // the index of alpha_s
  readonly simple: readonly number[]
}

export function smallRootAutomaton(coxeter: readonly (readonly number[])[]): SmallRootAutomaton {
  if (coxeter.length !== RANK) {
    throw new Error('small-roots: rank 3 only')
  }

  const ring = cosineRing(coxeter.flat().filter(m => m >= 2))
  const size = ring.size
  const roots: bigint[][] = []
  const index = new Map<string, number>()

  const add = (b: bigint[]): number => {
    const key = b.join(',')
    const found = index.get(key)

    if (found !== undefined) {
      return found
    }

    if (roots.length >= SMALL_ROOT_CAP) {
      throw new Error(`small-roots: more than ${SMALL_ROOT_CAP} small roots`)
    }

    roots.push(b)
    index.set(key, roots.length - 1)

    return roots.length - 1
  }

  const simple = Array.from({ length: RANK }, (_, s) => {
    const b = new Array<bigint>(RANK * size).fill(0n)

    b[s * size] = 1n

    return add(b)
  })

  // 2B(beta, alpha_s) = 2 b_s - sum over i != s of 2cos(pi/m_is) b_i
  const form = (b: readonly bigint[], s: number): bigint[] => {
    const out = new Array<bigint>(size).fill(0n)
    const neg = new Array<bigint>(size).fill(0n)

    for (let c = 0; c < size; c++) {
      out[c] = 2n * b[s * size + c]!
    }

    for (let i = 0; i < RANK; i++) {
      if (i !== s) {
        addTimes(ring, coxeter[i]![s]!, neg, 0, b, i * size)
      }
    }

    return out.map((x, c) => x - neg[c]!)
  }

  const reflect = (b: readonly bigint[], s: number): bigint[] => {
    const f = form(b, s)
    const out = [...b]

    for (let c = 0; c < size; c++) {
      out[s * size + c] = out[s * size + c]! - f[c]!
    }

    return out
  }

  // closure: s(beta) is small when -2 < 2B(beta, alpha_s) < 0
  // a for-of over an array that grows while it runs visits the pushed roots too
  for (const root of roots) {
    for (let s = 0; s < RANK; s++) {
      const f = form(root, s)
      const plusTwo = [...f]

      plusTwo[0] = plusTwo[0]! + 2n

      if (ringSign(ring, f) < 0 && ringSign(ring, plusTwo) > 0) {
        add(reflect(root, s))
      }
    }
  }

  const act = new Int32Array(roots.length * RANK).fill(-1)

  roots.forEach((b, i) => {
    for (let s = 0; s < RANK; s++) {
      if (i === simple[s]) {
        continue
      }

      act[i * RANK + s] = index.get(reflect(b, s).join(',')) ?? -1
    }
  })

  return { ring, coxeter, roots, act, simple }
}

// A state is a sorted list of small-root indices; its key is the list joined.
type State = readonly number[]

// The state after appending s, or null when w s is not reduced.
export function automatonStep(a: SmallRootAutomaton, state: State, s: number): State | null {
  if (state.includes(a.simple[s]!)) {
    return null
  }

  const next = new Set<number>([a.simple[s]!])

  for (const i of state) {
    const j = a.act[i * RANK + s]!

    if (j >= 0) {
      next.add(j)
    }
  }

  return [...next].sort((x, y) => x - y)
}

// The 2p reduced words of the dihedral group <s_0, s_1> of order 2p: the alternating words of length 0..p (one word for
// the identity and for the longest element).
export function dihedralReducedWords(p: number): number[][] {
  const out: number[][] = [[]]

  for (let len = 1; len < p; len++) {
    for (const first of [0, 1]) {
      out.push(Array.from({ length: len }, (_, i) => (first + i) % 2))
    }
  }

  out.push(Array.from({ length: p }, (_, i) => i % 2))

  return out
}

export class CosetGrowth {
  readonly automaton: SmallRootAutomaton
  readonly p: number
  private readonly words: number[][]
  // block transitions: state key -> list of [next state key, letters in the block]
  private readonly transitions = new Map<string, [string, number][]>()
  private readonly states = new Map<string, State>()
  // tile shells computed so far, and the current distribution over states
  readonly shells: bigint[] = []
  private frontier = new Map<string, bigint>()

  constructor(input: { p: number; q: number; coxeter?: readonly (readonly number[])[] }) {
    this.p = input.p
    this.automaton = smallRootAutomaton(
      input.coxeter ?? [
        [1, input.p, 2],
        [input.p, 1, input.q],
        [2, input.q, 1],
      ],
    )
    this.words = dihedralReducedWords(input.p)
    this.states.set('', [])
    this.frontier.set('', 1n)
    this.shells.push(1n)
  }

  // the number of automaton states reached so far
  get stateCount(): number {
    return this.states.size
  }

  private blocks(key: string): [string, number][] {
    const cached = this.transitions.get(key)

    if (cached) {
      return cached
    }

    const out: [string, number][] = []
    const a = this.automaton

    for (const w of this.words) {
      let state: State | null = this.states.get(key)!

      for (const s of [...w, 2]) {
        state = automatonStep(a, state, s)

        if (!state) {
          break
        }
      }

      if (!state || state.includes(a.simple[0]!) || state.includes(a.simple[1]!)) {
        continue
      }

      const k = state.join(',')

      if (!this.states.has(k)) {
        this.states.set(k, state)
      }

      out.push([k, w.length + 1])
    }

    this.transitions.set(key, out)

    return out
  }

  // tiles at facet distance d, exact
  shell(d: number): bigint {
    while (this.shells.length <= d) {
      const next = new Map<string, bigint>()

      let total = 0n

      for (const [key, count] of this.frontier) {
        for (const [k] of this.blocks(key)) {
          next.set(k, (next.get(k) ?? 0n) + count)
          total += count
        }
      }

      this.frontier = next
      this.shells.push(total)
    }

    return this.shells[d]!
  }

  // minimal coset representatives of word length 0..count - 1 (the coefficients of W(t) / W_J(t))
  lengthSeries(count: number): bigint[] {
    const out = new Array<bigint>(count).fill(0n)
    // by length: state key -> paths
    const byLength: Map<string, bigint>[] = Array.from({ length: count }, () => new Map<string, bigint>())

    byLength[0]!.set('', 1n)

    for (let len = 0; len < count; len++) {
      for (const [key, c] of byLength[len]!) {
        out[len] = out[len]! + c

        for (const [k, letters] of this.blocks(key)) {
          if (len + letters < count) {
            const m = byLength[len + letters]!

            m.set(k, (m.get(k) ?? 0n) + c)
          }
        }
      }
    }

    return out
  }
}
