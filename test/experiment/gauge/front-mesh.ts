// Item 0089 (roadmap/moving-matter, decision 019 point 3): the front lemma for EVERY n on the true {3,4,3,4} mesh.
//
// The claim: the dock tau_d^L (L straight hops along slot d from the base dock) is reached by exactly one geodesic
// dock path, for every L and all 24 slots, so the lone third's front there is a single colour-blind path.
//
// The argument (research/front-lemma-all-n.md): the docks are the cells of {3,4,3,4}. The reflections F_d in the 24
// facets of the base 24-cell generate a group R that acts simply transitively on the cells (W = R x| W(F4)), and since
// the base cell's dihedral angles are all pi/2, Vinberg's theorem presents R as the RIGHT-ANGLED Coxeter group on 24
// letters with F_d F_e = F_e F_d exactly when facets d and e share a ridge (r_d . r_e = 1) and no relation otherwise.
// The antipodal transport is tau_d = F_d Z with Z F_d Z = F_(-d) (label-transport.ts:16-22, 288-297), so a label word
// k1 k2 k3 ... reaches the cell of the R-word k1, -k2, k3, -k4, ... (a length-preserving bijection). The straight word
// d d d ... is the R-word d, -d, d, -d, ...: every adjacent pair is (d, -d), which never commutes (r_d . r_(-d) = -2),
// so no braid move applies and no letter repeats. By Tits it is reduced and its own unique reduced expression, so the
// geodesic is unique and has length L. The periodic check is the two-letter pair (d,-d)(d,-d): finite, for all L.
//
// This file is the machine witness. It reads, from the real hyperbolic matrices:
//   G1  F_d and F_e commute exactly on the 96 pairs with r_d . r_e = 1, and every other pair's hyperplanes never meet
//       (|<n_d, n_e>| >= 1), which is what Vinberg's presentation needs (no hidden relation)
//   G2  tau_d^L = F_d F_(-d) F_d ... Z^(L mod 2) as matrices, L 1..32, all 24 slots
//   S3  the straight R-word for L 1..32 on all 24 slots: word.ts normalForm keeps all L letters (reduced), the
//       commutation closure has 1 word, and the geodesic count (recursion on normalForm descents) is 1
//   C   controls: a commuting pair reads 2 geodesics, a ridge triangle 6
//   B   the true-mesh ball of radius 4 (162,049 cells, 0086's instrument): every cell's ball geodesic count equals the
//       right-angled group's count, the R normal forms are distinct, and the shell sizes equal the group's growth
//       series from its clique polynomial, so the presentation is the mesh and not a model of it
//   P   0086's meshPaths reproduced: 1 shortest path at distance 2n for n 1..4 on all 24 slots
//
// Base code is read only: word.ts (normalForm), label-transport.ts (labelledCoin, labelTransports, buildHyperbolicBall).

import { normalForm, type Word } from '@/code/substrate/coxeter/word'
import { buildHyperbolicBall, labelTransports, labelledCoin, type LabelledCoin } from '@/code/substrate/coxeter/label-transport'
import { identity, matMul, type Mat } from '@/code/substrate/coxeter/minkowski'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { meshPaths, type MeshPaths } from '@/test/experiment/gauge/cage-front'

export const SLOTS = 24
export const MAX_HOPS = 32

const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0)

function relDiff(a: Mat, b: Mat): number {
  let scale = 1
  let worst = 0

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length; j++) {
      scale = Math.max(scale, Math.abs(a[i]![j]!), Math.abs(b[i]![j]!))
      worst = Math.max(worst, Math.abs(a[i]![j]! - b[i]![j]!))
    }
  }

  return worst / scale
}

function trace(a: Mat): number {
  let s = 0

  for (let i = 0; i < a.length; i++) {
    s += a[i]![i]!
  }

  return s
}

// ---- G1, G2: the geometry of the facet reflections ----

export type PairClass = {
  rootDot: number
  pairs: number
  // the commutator F_d F_e - F_e F_d, relative, least and greatest over the class
  commutator: { least: number; most: number }
  // <n_d, n_e>^2 for unit normals, from trace(F_d F_e) = dim - 4 + 4 c^2
  cosineSquared: { least: number; most: number }
}

export type Geometry = {
  dim: number
  gramError: number
  inversionExchangesAntipodes: boolean
  // tau_d = F_d Z, relative, over all slots
  transportIsFaceThenInversion: number
  classes: PairClass[]
  // M[d][e] = 2 where F_d, F_e commute (read from the matrices), Infinity otherwise
  commuting: boolean[][]
  // the commuting pairs are exactly the r_d . r_e = 1 pairs
  commutingIsRidge: boolean
  // tau_d^L against F_d F_(-d) ... Z^(L mod 2), worst relative difference over d and L 1..MAX_HOPS
  straightProduct: number
  seconds: number
}

export function faceOf(coin: LabelledCoin, k: number): Mat {
  return coin.frame.faces[coin.faceOfLabel[k]!]!
}

export function geometry(): Geometry {
  const t0 = Date.now()
  const coin = labelledCoin()
  const roots = rootsD4()
  const dim = coin.frame.dim
  const Z = coin.inversion
  const transports = labelTransports({ coin, kind: 'antipodal' })
  const F = Array.from({ length: SLOTS }, (_, k) => faceOf(coin, k))

  let transportIsFaceThenInversion = 0

  for (let k = 0; k < SLOTS; k++) {
    transportIsFaceThenInversion = Math.max(transportIsFaceThenInversion, relDiff(transports[k]!, matMul(F[k]!, Z)))
  }

  const byDot = new Map<number, PairClass>()
  const commuting: boolean[][] = Array.from({ length: SLOTS }, () => new Array<boolean>(SLOTS).fill(false))

  let commutingIsRidge = true

  for (let d = 0; d < SLOTS; d++) {
    for (let e = d + 1; e < SLOTS; e++) {
      const de = matMul(F[d]!, F[e]!)
      const ed = matMul(F[e]!, F[d]!)
      const comm = relDiff(de, ed)
      const c2 = (trace(de) - dim + 4) / 4
      const rd = dot(roots[d]!, roots[e]!)
      const cls = byDot.get(rd) ?? {
        rootDot: rd,
        pairs: 0,
        commutator: { least: Infinity, most: 0 },
        cosineSquared: { least: Infinity, most: -Infinity },
      }

      cls.pairs++
      cls.commutator.least = Math.min(cls.commutator.least, comm)
      cls.commutator.most = Math.max(cls.commutator.most, comm)
      cls.cosineSquared.least = Math.min(cls.cosineSquared.least, c2)
      cls.cosineSquared.most = Math.max(cls.cosineSquared.most, c2)
      byDot.set(rd, cls)

      const commutes = comm < 1e-9

      commuting[d]![e] = commutes
      commuting[e]![d] = commutes

      if (commutes !== (rd === 1)) {
        commutingIsRidge = false
      }
    }
  }

  let straightProduct = 0

  for (let d = 0; d < SLOTS; d++) {
    const back = coin.opposite[d]!

    let tau = identity(dim)
    let alt = identity(dim)

    for (let L = 1; L <= MAX_HOPS; L++) {
      tau = matMul(tau, transports[d]!)
      alt = matMul(alt, F[L % 2 === 1 ? d : back]!)

      const expect = L % 2 === 1 ? matMul(alt, Z) : alt

      straightProduct = Math.max(straightProduct, relDiff(tau, expect))
    }
  }

  return {
    dim,
    gramError: coin.gramError,
    inversionExchangesAntipodes: coin.inversionExchangesAntipodes,
    transportIsFaceThenInversion,
    classes: [...byDot.values()].sort((a, b) => b.rootDot - a.rootDot),
    commuting,
    commutingIsRidge,
    straightProduct,
    seconds: (Date.now() - t0) / 1000,
  }
}

// ---- the right-angled Coxeter group R ----

export function coxeterMatrixOf(commuting: boolean[][]): number[][] {
  return commuting.map((row, d) => row.map((c, e) => (d === e ? 1 : c ? 2 : Infinity)))
}

// a label word to its R-word: even positions keep the label, odd positions take its opposite (tau_k = F_k Z)
export function rWordOf(labels: readonly number[], opposite: readonly number[]): Word {
  return labels.map((k, i) => (i % 2 === 0 ? k : opposite[k]!))
}

// Tits for a right-angled group: reduced iff no two equal letters with only commuting letters between
export function racgReduce(word: readonly number[], M: number[][]): Word {
  const w = word.slice()

  for (;;) {
    let hit = -1
    let hitJ = -1

    outer: for (let i = 0; i < w.length; i++) {
      for (let j = i + 1; j < w.length; j++) {
        if (w[j] === w[i]) {
          hit = i
          hitJ = j
          break outer
        }

        if (M[w[i]!]![w[j]!] !== 2) {
          break
        }
      }
    }

    if (hit < 0) {
      return w
    }

    w.splice(hitJ, 1)
    w.splice(hit, 1)
  }
}

// the lex-least word in the commutation class of a reduced word (greedy over the letters free to move first)
export function racgNormal(word: readonly number[], M: number[][]): Word {
  const rest = word.slice()
  const out: Word = []

  while (rest.length > 0) {
    let best = -1

    for (let i = 0; i < rest.length; i++) {
      let free = true

      for (let j = 0; j < i; j++) {
        if (M[rest[j]!]![rest[i]!] !== 2) {
          free = false
          break
        }
      }

      if (free && (best < 0 || rest[i]! < rest[best]!)) {
        best = i
      }
    }

    out.push(rest[best]!)
    rest.splice(best, 1)
  }

  return out
}

// geodesics from e to a reduced word's element: sum over its right descents (letters free to move last)
export function racgGeodesics(word: readonly number[], M: number[][], memo: Map<string, number>): number {
  if (word.length === 0) {
    return 1
  }

  const key = racgNormal(word, M).join(',')
  const hit = memo.get(key)

  if (hit !== undefined) {
    return hit
  }

  let s = 0

  for (let i = 0; i < word.length; i++) {
    let last = true

    for (let j = i + 1; j < word.length; j++) {
      if (M[word[i]!]![word[j]!] !== 2) {
        last = false
        break
      }
    }

    if (last) {
      s += racgGeodesics([...word.slice(0, i), ...word.slice(i + 1)], M, memo)
    }
  }

  memo.set(key, s)

  return s
}

// the commutation closure of a word (every braid move of a right-angled group is a commutation), capped
export function commutationClosure(word: readonly number[], M: number[][], cap = 100000): number {
  const seen = new Set<string>([word.join(',')])

  let frontier: Word[] = [word.slice()]

  while (frontier.length > 0 && seen.size < cap) {
    const next: Word[] = []

    for (const w of frontier) {
      for (let p = 0; p + 1 < w.length; p++) {
        if (w[p] !== w[p + 1] && M[w[p]!]![w[p + 1]!] === 2) {
          const v = w.slice()

          v[p] = w[p + 1]!
          v[p + 1] = w[p]!

          const k = v.join(',')

          if (!seen.has(k)) {
            seen.add(k)
            next.push(v)
          }
        }
      }
    }

    frontier = next
  }

  return seen.size
}

// geodesics by word.ts alone: descents read as normalForm(w s) shorter than w
export function wordGeodesics(word: Word, M: number[][], memo: Map<string, number>): number {
  if (word.length === 0) {
    return 1
  }

  const nf = normalForm(word, M)
  const key = nf.join(',')
  const hit = memo.get(key)

  if (hit !== undefined) {
    return hit
  }

  let s = 0

  for (let x = 0; x < M.length; x++) {
    const v = normalForm([...nf, x], M)

    if (v.length < nf.length) {
      s += wordGeodesics(v, M, memo)
    }
  }

  memo.set(key, s)

  return s
}

// ---- S3: the straight transport for every L 1..MAX_HOPS on every slot ----

export type StraightRow = {
  slot: number
  // per L = 1 .. MAX_HOPS
  reducedLength: number[]
  closure: number[]
  geodesics: number[]
  geodesicsRacg: number[]
  // adjacent letter pairs where a commutation applies, over the periodic pair (d,-d)(d,-d)
  periodicMoves: number
}

export type Straight = {
  rows: StraightRow[]
  // least and greatest over slots, per L
  geodesics: { least: number; most: number }[]
  // the first L (and its slot) with 2 or more geodesics, if any
  counter: { L: number; slot: number; geodesics: number } | null
  // controls with known counts
  controls: { name: string; word: Word; expect: number; geodesics: number; racg: number; closure: number }[]
  // word.ts normalForm against the fast right-angled reducer on random words
  reducerAgreement: { words: number; disagree: number }
  seconds: number
}

export function straight(geo: Geometry): Straight {
  const t0 = Date.now()
  const coin = labelledCoin()
  const roots = rootsD4()
  const M = coxeterMatrixOf(geo.commuting)
  const memo = new Map<string, number>()
  const racgMemo = new Map<string, number>()
  const rows: StraightRow[] = []

  for (let d = 0; d < SLOTS; d++) {
    const labels = new Array<number>(MAX_HOPS).fill(d)
    const r = rWordOf(labels, coin.opposite)
    const row: StraightRow = { slot: d, reducedLength: [], closure: [], geodesics: [], geodesicsRacg: [], periodicMoves: 0 }
    const pair = [r[0]!, r[1]!, r[0]!, r[1]!]

    for (let p = 0; p + 1 < pair.length; p++) {
      if (pair[p] === pair[p + 1] || M[pair[p]!]![pair[p + 1]!] === 2) {
        row.periodicMoves++
      }
    }

    for (let L = 1; L <= MAX_HOPS; L++) {
      const w = r.slice(0, L)

      row.reducedLength.push(normalForm(w, M).length)
      row.closure.push(commutationClosure(w, M))
      row.geodesics.push(wordGeodesics(w, M, memo))
      row.geodesicsRacg.push(racgGeodesics(racgReduce(w, M), M, racgMemo))
    }

    rows.push(row)
  }

  const geodesics = Array.from({ length: MAX_HOPS }, (_, i) => ({
    least: Math.min(...rows.map(r => r.geodesics[i]!)),
    most: Math.max(...rows.map(r => r.geodesics[i]!)),
  }))

  let counter: Straight['counter'] = null

  for (let i = 0; i < MAX_HOPS && !counter; i++) {
    for (const row of rows) {
      if (row.geodesics[i]! >= 2) {
        counter = { L: i + 1, slot: row.slot, geodesics: row.geodesics[i]! }
        break
      }
    }
  }

  // controls: a commuting pair (2 geodesics), a ridge triangle of three pairwise commuting facets (6)
  const a = 0
  const b = roots.findIndex((x, i) => i !== a && dot(x, roots[a]!) === 1)
  const c = roots.findIndex((x, i) => i !== a && i !== b && dot(x, roots[a]!) === 1 && dot(x, roots[b]!) === 1)
  const controls = [
    { name: 'commuting pair', word: [a, b], expect: 2 },
    { name: 'ridge triangle', word: [a, b, c], expect: 6 },
    { name: 'straight then turn back', word: [a, coin.opposite[a]!, a, a], expect: 1 },
  ].map(x => {
    const reduced = racgReduce(x.word, M)

    return {
      ...x,
      geodesics: wordGeodesics(normalForm(x.word, M), M, memo),
      racg: racgGeodesics(reduced, M, racgMemo),
      closure: commutationClosure(reduced, M),
    }
  })

  // the fast reducer against word.ts on random words: same element, same ShortLex normal form
  let seed = 89

  const rand = (n: number): number => {
    seed = (seed * 1103515245 + 12345) % 2147483648

    return seed % n
  }

  let disagree = 0

  const WORDS = 3000

  for (let t = 0; t < WORDS; t++) {
    const len = 1 + rand(9)
    const w: Word = []

    for (let i = 0; i < len; i++) {
      // bias toward few letters so repeats and commutations occur
      w.push(rand(4) === 0 ? rand(SLOTS) : [a, b, c, coin.opposite[a]!][rand(4)]!)
    }

    const viaWord = normalForm(w, M).join(',')
    const viaRacg = racgNormal(racgReduce(w, M), M).join(',')

    if (viaWord !== viaRacg) {
      disagree++
    }
  }

  return {
    rows,
    geodesics,
    counter,
    controls,
    reducerAgreement: { words: WORDS, disagree },
    seconds: (Date.now() - t0) / 1000,
  }
}

// ---- B: the true-mesh ball against the right-angled group ----

export type BallCompare = {
  radius: number
  cells: number
  inconsistentSteps: number
  shells: number[]
  growth: number[]
  cliques: number[]
  // cells whose ball geodesic count differs from the right-angled count
  mismatches: number
  // ball words the right-angled reducer shortens (would mean the presentation misses a relation)
  shortened: number
  distinctNormalForms: number
  // the largest geodesic count in the ball, to show the counter sees multiplicities
  mostGeodesics: number
  seconds: number
}

// growth series of a right-angled Coxeter group: 1 / f(-t / (1 + t)), f the clique polynomial
export function racgGrowth(cliques: readonly number[], degree: number): number[] {
  // x(t) = -t / (1 + t) = sum_{k >= 1} (-1)^k t^k
  const x = Array.from({ length: degree + 1 }, (_, k) => (k === 0 ? 0 : k % 2 === 0 ? 1 : -1))
  const mul = (p: number[], q: number[]): number[] => {
    const out = new Array<number>(degree + 1).fill(0)

    for (let i = 0; i <= degree; i++) {
      for (let j = 0; i + j <= degree; j++) {
        out[i + j]! += p[i]! * q[j]!
      }
    }

    return out
  }

  let f = new Array<number>(degree + 1).fill(0)
  let power = new Array<number>(degree + 1).fill(0)

  power[0] = 1

  for (let k = 0; k < cliques.length; k++) {
    f = f.map((v, i) => v + cliques[k]! * power[i]!)
    power = mul(power, x)
  }

  // invert f (f[0] = 1)
  const inv = new Array<number>(degree + 1).fill(0)

  inv[0] = 1

  for (let n = 1; n <= degree; n++) {
    let s = 0

    for (let k = 1; k <= n; k++) {
      s += f[k]! * inv[n - k]!
    }

    inv[n] = -s
  }

  return inv
}

export function cliqueCounts(M: number[][]): number[] {
  const n = M.length
  const counts = [1]

  const grow = (clique: number[], from: number): void => {
    counts[clique.length] = (counts[clique.length] ?? 0) + 1

    for (let v = from; v < n; v++) {
      if (clique.every(u => M[u]![v] === 2)) {
        grow([...clique, v], v + 1)
      }
    }
  }

  for (let v = 0; v < n; v++) {
    grow([v], v + 1)
  }

  return counts
}

export function ballCompare(geo: Geometry, radius: number): BallCompare {
  const t0 = Date.now()
  const coin = labelledCoin()
  const M = coxeterMatrixOf(geo.commuting)
  const ball = buildHyperbolicBall({ coin, radius })
  const count = new Float64Array(ball.cells)
  const labels: number[][] = [[]]

  count[0] = 1

  for (let c = 1; c < ball.cells; c++) {
    const dc = ball.distance[c]!

    let s = 0
    let parent = -1

    for (let k = 0; k < SLOTS; k++) {
      const y = ball.mesh.neighbour(c, k)

      if (y !== ball.phantom && ball.distance[y] === dc - 1) {
        s += count[y]!

        if (parent < 0) {
          parent = k
        }
      }
    }

    count[c] = s

    // c tau_parent = y, so c = y tau_(-parent): the label word of c is y's word then the opposite label
    const y = ball.mesh.neighbour(c, parent)

    labels[c] = [...labels[y]!, coin.opposite[parent]!]
  }

  const memo = new Map<string, number>()
  const forms = new Set<string>()

  let mismatches = 0
  let shortened = 0
  let mostGeodesics = 0

  for (let c = 0; c < ball.cells; c++) {
    const r = rWordOf(labels[c]!, coin.opposite)
    const reduced = racgReduce(r, M)

    if (reduced.length !== r.length) {
      shortened++
    }

    forms.add(racgNormal(reduced, M).join(','))

    const g = racgGeodesics(reduced, M, memo)

    if (g !== count[c]) {
      mismatches++
    }

    mostGeodesics = Math.max(mostGeodesics, count[c]!)
  }

  const shells = new Array<number>(radius + 1).fill(0)

  for (let c = 0; c < ball.cells; c++) {
    shells[ball.distance[c]!]!++
  }

  const cliques = cliqueCounts(M)

  return {
    radius,
    cells: ball.cells,
    inconsistentSteps: ball.inconsistentSteps,
    shells,
    growth: racgGrowth(cliques, radius),
    cliques,
    mismatches,
    shortened,
    distinctNormalForms: forms.size,
    mostGeodesics,
    seconds: (Date.now() - t0) / 1000,
  }
}

// ---- stages and the verdict ----

export type FmeshStage =
  | { kind: 'geometry'; read: Geometry }
  | { kind: 'straight'; read: Straight }
  | { kind: 'ball'; read: BallCompare }
  | { kind: 'mesh-paths'; read: MeshPaths }

export function fmeshSpecs(): { name: string; run: () => FmeshStage }[] {
  return [
    { name: 'geometry', run: () => ({ kind: 'geometry', read: geometry() }) },
    { name: 'straight', run: () => ({ kind: 'straight', read: straight(geometry()) }) },
    { name: 'ball-3', run: () => ({ kind: 'ball', read: ballCompare(geometry(), 3) }) },
    { name: 'ball-4', run: () => ({ kind: 'ball', read: ballCompare(geometry(), 4) }) },
    { name: 'mesh-paths', run: () => ({ kind: 'mesh-paths', read: meshPaths() }) },
  ]
}

export type FmeshVerdict = {
  verdict: 'PROVED' | 'COUNTER' | 'OPEN'
  checks: { name: string; pass: boolean; read: string }[]
}

export function frontMeshVerdict(stages: readonly FmeshStage[]): FmeshVerdict {
  const geo = stages.find(s => s.kind === 'geometry')?.read as Geometry | undefined
  const st = stages.find(s => s.kind === 'straight')?.read as Straight | undefined
  const balls = stages.filter(s => s.kind === 'ball').map(s => s.read as BallCompare)
  const mp = stages.find(s => s.kind === 'mesh-paths')?.read as MeshPaths | undefined
  const checks: FmeshVerdict['checks'] = []

  if (geo) {
    const ridge = geo.classes.find(c => c.rootDot === 1)
    const apart = geo.classes.filter(c => c.rootDot !== 1)

    checks.push({
      name: 'G1 commute exactly on ridge pairs, other hyperplanes never meet',
      pass:
        geo.commutingIsRidge &&
        (ridge?.pairs ?? 0) === 96 &&
        (ridge?.commutator.most ?? 1) < 1e-9 &&
        apart.every(c => c.commutator.least > 1e-3 && c.cosineSquared.least >= 1 - 1e-9),
      read: geo.classes
        .map(c => `dot ${c.rootDot}: ${c.pairs} pairs, comm ${c.commutator.least.toExponential(1)}..${c.commutator.most.toExponential(1)}, c^2 ${c.cosineSquared.least.toFixed(6)}..${c.cosineSquared.most.toFixed(6)}`)
        .join('; '),
    })
    checks.push({
      name: 'G2 tau_d = F_d Z and tau_d^L = F_d F_-d ... Z^(L mod 2), L 1..32',
      pass: geo.transportIsFaceThenInversion < 1e-12 && geo.straightProduct < 1e-9 && geo.inversionExchangesAntipodes,
      read: `tau = F Z ${geo.transportIsFaceThenInversion.toExponential(1)}, straight product ${geo.straightProduct.toExponential(1)}, Z F_d Z = F_-d ${geo.inversionExchangesAntipodes}`,
    })
  }

  if (st) {
    const allOne = st.rows.every(r => r.geodesics.every(v => v === 1) && r.geodesicsRacg.every(v => v === 1) && r.closure.every(v => v === 1))
    const reduced = st.rows.every(r => r.reducedLength.every((v, i) => v === i + 1))
    const periodic = st.rows.every(r => r.periodicMoves === 0)

    checks.push({
      name: 'S3 straight transport: reduced, one reduced expression, one geodesic, L 1..32, 24 slots',
      pass: allOne && reduced && periodic && st.counter === null,
      read: `geodesics per L ${st.geodesics.map(g => (g.least === g.most ? `${g.least}` : `${g.least}-${g.most}`)).join(' ')}; reduced ${reduced}; periodic pair moves 0 ${periodic}; counter ${st.counter ? JSON.stringify(st.counter) : 'none'}`,
    })
    checks.push({
      name: 'C controls read their known counts, reducers agree',
      pass: st.controls.every(c => c.geodesics === c.expect && c.racg === c.expect) && st.reducerAgreement.disagree === 0,
      read: `${st.controls.map(c => `${c.name} ${c.geodesics}/${c.racg} (expect ${c.expect})`).join(', ')}; normalForm vs racg ${st.reducerAgreement.disagree}/${st.reducerAgreement.words} disagree`,
    })
  }

  for (const b of balls) {
    checks.push({
      name: `B ball radius ${b.radius}: the right-angled group is the mesh`,
      pass:
        b.inconsistentSteps === 0 &&
        b.mismatches === 0 &&
        b.shortened === 0 &&
        b.distinctNormalForms === b.cells &&
        b.shells.every((v, i) => v === b.growth[i]),
      read: `${b.cells} cells, shells ${b.shells.join(' ')} vs growth ${b.growth.join(' ')}, cliques ${b.cliques.join(' ')}, geodesic mismatches ${b.mismatches}, shortened ${b.shortened}, distinct forms ${b.distinctNormalForms}, most geodesics ${b.mostGeodesics}`,
    })
  }

  if (mp && st) {
    const same = mp.perSlot.every((s, a) => s.paths.every((p, i) => p === st.rows[a]!.geodesics[2 * i + 1] && s.distance[i] === 2 * (i + 1)))

    checks.push({
      name: "P 0086's ball counts reproduced, n 1..4",
      pass: same,
      read: `meshPaths paths ${mp.paths.map(p => `${p.least}-${p.most}`).join(', ')}, distance ${mp.distance.map(p => `${p.least}-${p.most}`).join(', ')}, against the R count at L 2, 4, 6, 8`,
    })
  }

  const counter = st?.counter !== null && st?.counter !== undefined
  const complete = !!geo && !!st && balls.length > 0 && !!mp

  return {
    verdict: counter ? 'COUNTER' : complete && checks.every(c => c.pass) ? 'PROVED' : 'OPEN',
    checks,
  }
}
