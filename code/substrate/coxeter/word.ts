// The word-problem engine: exact, coordinate-free enumeration of a Coxeter group. Each chamber
// is a word in the reflection generators, and two words name the same chamber exactly when they
// share a ShortLex normal form. By Tits' theorem the only moves needed are cancellation
// (s_i s_i -> nothing) and braid moves (s_i s_j s_i ... -> s_j s_i s_j ..., m_ij letters), so
// word equality is decided by pure integer combinatorics, no floating point and no rim crowding.
// This is the exact replacement for the coordinate dedup at depth, and the normal form is a
// canonical address for each chamber. See note/research/vibe/notes/coxeter-word-problem.md.

export type Word = number[]

// The Coxeter matrix m_ij for a linear symbol {p1, ..., pk}: m_ii = 1, m_{i,i+1} = the symbol
// entries, and 2 (perpendicular) for non-adjacent mirrors.
export function coxeterMatrix(symbol: number[]): number[][] {
  const m = symbol.length + 1
  const M: number[][] = Array.from({ length: m }, () =>
    new Array<number>(m).fill(2),
  )
  for (let i = 0; i < m; i++) {
    M[i]![i] = 1
  }

  for (let i = 0; i < symbol.length; i++) {
    M[i]![i + 1] = symbol[i] ?? 2
    M[i + 1]![i] = symbol[i] ?? 2
  }

  return M
}

const key = (w: Word): string => w.join(',')

// All words reachable from `word` by exactly one braid move (a commutation when m = 2).
function braidStep(word: Word, M: number[][]): Word[] {
  const out: Word[] = []
  const n = word.length
  for (let p = 0; p + 1 < n; p++) {
    const a = word[p]!
    const b = word[p + 1]!
    if (a === b) {
      continue
    }

    const m = M[a]![b]!
    if (p + m > n) {
      continue
    }

    let alternating = true
    for (let t = 0; t < m; t++) {
      const expected = t % 2 === 0 ? a : b
      if (word[p + t] !== expected) {
        alternating = false
        break
      }
    }

    if (!alternating) {
      continue
    }

    const rep: number[] = []
    for (let t = 0; t < m; t++) {
      rep.push(t % 2 === 0 ? b : a)
    }

    out.push([...word.slice(0, p), ...rep, ...word.slice(p + m)])
  }

  return out
}

const braidClassCache = new Map<string, Word[]>()

// The full braid-equivalence class of a word (all words reachable by braid moves, same length).
function braidClass(word: Word, M: number[][], cap = 20000): Word[] {
  const k = key(word)
  const hit = braidClassCache.get(k)
  if (hit) {
    return hit
  }

  const seen = new Set<string>([k])
  const all: Word[] = [word]
  let frontier: Word[] = [word]
  while (frontier.length > 0 && all.length < cap) {
    const next: Word[] = []
    for (const w of frontier) {
      for (const nb of braidStep(w, M)) {
        const nk = key(nb)
        if (seen.has(nk)) {
          continue
        }

        seen.add(nk)
        all.push(nb)
        next.push(nb)
        if (all.length >= cap) {
          break
        }
      }

      if (all.length >= cap) {
        break
      }
    }

    frontier = next
  }

  braidClassCache.set(k, all)

  return all
}

function lexLess(a: Word, b: Word): boolean {
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    if (a[i]! !== b[i]!) {
      return a[i]! < b[i]!
    }
  }

  return a.length < b.length
}

// Reduce a word to a shortest (reduced) word, by exposing an adjacent repeat via braid moves
// and cancelling it, until none can be exposed. Correct by Tits' theorem.
function reduce(word: Word, M: number[][]): Word {
  let current = word
  for (;;) {
    const cls = braidClass(current, M)
    let cancelled: Word | null = null
    for (const w of cls) {
      for (let i = 0; i + 1 < w.length; i++) {
        if (w[i] === w[i + 1]) {
          cancelled = [...w.slice(0, i), ...w.slice(i + 2)]
          break
        }
      }

      if (cancelled) {
        break
      }
    }

    if (!cancelled) {
      return current
    }

    current = cancelled
  }
}

const normalFormCache = new Map<string, Word>()

// The ShortLex normal form: the lexicographically least shortest word for the element. Two words
// have the same normal form exactly when they are the same group element (chamber).
export function normalForm(word: Word, M: number[][]): Word {
  const k = key(word)
  const hit = normalFormCache.get(k)
  if (hit) {
    return hit
  }

  const reduced = reduce(word, M)
  let best = reduced
  for (const w of braidClass(reduced, M)) {
    if (lexLess(w, best)) {
      best = w
    }
  }

  normalFormCache.set(k, best)

  return best
}

export interface WordMesh {
  readonly form: 'coxeter-word-mesh'
  readonly symbol: number[]
  readonly finite: boolean // enumeration closed (a finite, spherical group)
  readonly chamberCount: number
  readonly ballGrowth: number[] // number of chambers at each word length
  readonly cellCount: number
  readonly cellFacetCount: number // mature cell degree, by the J-coset contraction
  readonly sampleAddresses: string[]
}

// Enumerate the Coxeter group exactly by BFS over normal forms, build the chamber Cayley graph,
// contract the cell-stabilizer (J) edges into cells, and read the cell facet-adjacency from the
// outward-generator edges. maxLength caps the word length, maxChambers the work.
export function buildWordMesh(input: {
  symbol: number[]
  maxLength?: number
  maxChambers?: number
}): WordMesh {
  braidClassCache.clear()
  normalFormCache.clear()
  const symbol = input.symbol
  const maxLength = input.maxLength ?? 12
  const maxChambers = input.maxChambers ?? 20000
  const M = coxeterMatrix(symbol)
  const m = M.length
  const outward = symbol.length // the one generator not in the cell stabilizer J = {0..k-1}

  // BFS over chambers (normal forms), recording Cayley edges by generator label.
  const id = new Map<string, number>()
  const words: Word[] = []
  const register = (w: Word): number => {
    const k = key(w)
    const found = id.get(k)
    if (found !== undefined) {
      return found
    }

    const i = words.length
    id.set(k, i)
    words.push(w)

    return i
  }

  register([])
  const edgesJ: Array<[number, number]> = [] // edges labeled by a cell generator (0..k-1)
  const edgesOut: Array<[number, number]> = [] // edges labeled by the outward generator
  let frontier = [0]
  let finite = true
  while (frontier.length > 0) {
    const next: number[] = []
    for (const ci of frontier) {
      if (words[ci]!.length >= maxLength) {
        finite = false
        continue
      }

      for (let s = 0; s < m; s++) {
        const nf = normalForm([...words[ci]!, s], M)
        const before = id.size
        const ni = register(nf)
        const isNew = id.size > before
        if (s === outward) {
          edgesOut.push([ci, ni])
        } else {
          edgesJ.push([ci, ni])
        }

        if (isNew) {
          next.push(ni)
          if (words.length >= maxChambers) {
            finite = false
            frontier = []
            break
          }
        }
      }

      if (words.length >= maxChambers) {
        break
      }
    }

    frontier = next
  }

  const chamberCount = words.length
  const ballGrowth: number[] = []
  for (const w of words) {
    ballGrowth[w.length] = (ballGrowth[w.length] ?? 0) + 1
  }

  // Cells: union-find, merging chambers joined by a cell-stabilizer (J) edge.
  const parent = Array.from({ length: chamberCount }, (_, i) => i)
  const find = (x: number): number => {
    let r = x
    while (parent[r] !== r) {
      r = parent[r]!
    }

    while (parent[x] !== r) {
      const nx = parent[x]!
      parent[x] = r
      x = nx
    }

    return r
  }

  const union = (a: number, b: number): void => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) {
      parent[ra] = rb
    }
  }

  for (const [a, b] of edgesJ) {
    union(a, b)
  }

  const cellOf = new Map<number, number>()
  for (let i = 0; i < chamberCount; i++) {
    const r = find(i)
    if (!cellOf.has(r)) {
      cellOf.set(r, cellOf.size)
    }
  }

  const cellCount = cellOf.size

  // Cell facet-adjacency: an outward edge between chambers in different cells joins those cells.
  const cellNeighbors: Set<number>[] = Array.from(
    { length: cellCount },
    () => new Set<number>(),
  )
  for (const [a, b] of edgesOut) {
    const ca = cellOf.get(find(a))!
    const cb = cellOf.get(find(b))!
    if (ca !== cb) {
      cellNeighbors[ca]!.add(cb)
      cellNeighbors[cb]!.add(ca)
    }
  }

  let cellFacetCount = 0
  for (const s of cellNeighbors) {
    cellFacetCount = Math.max(cellFacetCount, s.size)
  }

  return {
    form: 'coxeter-word-mesh',
    symbol,
    finite,
    chamberCount,
    ballGrowth: ballGrowth.map(x => x ?? 0),
    cellCount,
    cellFacetCount,
    sampleAddresses: words
      .slice(0, 12)
      .map(w => (w.length === 0 ? 'e' : w.join(''))),
  }
}
