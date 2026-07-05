// The family of momentum-conserving reversible knit rules, and how the 24-cell symmetry forces it. The committed knit
// (headOnRotate) rotates a zero-momentum head-on pair (both slots of one line carrying the same tone) between PAIRED
// lines, which conserves charge and momentum and is a reversible involution. The free part is the PAIRING of the 12
// lines (the 12 opposite-direction pairs of the 24 directions) into 6 pairs. Any pairing gives a valid rule, so by
// conservation and reversibility alone there is a vast family (the number of perfect matchings of 12 lines). But
// almost none of them respect the symmetry of the 24-cell, and counting the symmetric ones is how we test whether the
// knit is FORCED.

import { reflectRoot } from '@/code/algebra/group/root-system'
import { rootsF4 } from '@/code/algebra/group/root-system'

// the 24 directions +-e_a+-e_b of the {3,4,3,4} D4 coin
function directions(): number[][] {
  const dirs: number[][] = []

  for (let a = 0; a < 4; a++) {
    for (let b = a + 1; b < 4; b++) {
      for (const sa of [1, -1]) {
        for (const sb of [1, -1]) {
          const v = [0, 0, 0, 0]
          v[a] = sa
          v[b] = sb
          dirs.push(v)
        }
      }
    }
  }

  return dirs
}

const key = (v: number[]): string => v.join(',')

// enumerate the perfect matchings of a list (each matching is an array of [i, j] pairs)
function* perfectMatchings(remaining: number[]): Generator<number[][]> {
  if (remaining.length === 0) {
    yield []

    return
  }

  const a = remaining[0]!

  for (let k = 1; k < remaining.length; k++) {
    const b = remaining[k]!
    const rest = remaining.filter((_, i) => i !== 0 && i !== k)

    for (const tail of perfectMatchings(rest)) {
      yield [[a, b], ...tail]
    }
  }
}

function matchingKey(m: number[][]): string {
  return m
    .map(p => (p[0]! < p[1]! ? `${p[0]}-${p[1]}` : `${p[1]}-${p[0]}`))
    .sort()
    .join('|')
}

// The reusable line structure of the 24-cell coin: the 24 directions, the 12 opposite-line
// indices, the map from a direction to its line, and the symmetry actions on the 12 lines
// (both the B4 signed-permutation generators and the full F4 reflections). Built once, used by
// every counting function below.
interface LineStructure {
  dirs: number[][]
  lines: number[]
  lineOfDir: (i: number) => number
  b4Generators: number[][]
  f4Reflections: number[][]
}

function buildLineStructure(): LineStructure {
  const dirs = directions()
  const idx = new Map(dirs.map((v, i) => [key(v), i]))
  const negOf = dirs.map(v => idx.get(key(v.map(x => -x)))!)
  // the 12 lines (opposite-direction pairs), canonical id = min(i, neg)
  const lines: number[] = []

  for (let i = 0; i < 24; i++) {
    const c = Math.min(i, negOf[i]!)

    if (!lines.includes(c)) {
      lines.push(c)
    }
  }

  const lineIndex = new Map(lines.map((c, k) => [c, k]))
  const lineOfDir = (i: number): number =>
    lineIndex.get(Math.min(i, negOf[i]!))!

  // a signed coordinate permutation acting as a permutation of the 12 lines (the B4 action)
  function lineAction(perm: number[], sign: number[]): number[] {
    const lp = new Array<number>(12)

    for (let L = 0; L < 12; L++) {
      const v = dirs[lines[L]!]!
      const w = [0, 0, 0, 0]

      for (let c = 0; c < 4; c++) {
        w[perm[c]!] = sign[perm[c]!]! * v[c]!
      }

      lp[L] = lineOfDir(idx.get(key(w))!)
    }

    return lp
  }

  const b4Generators = [
    lineAction([1, 0, 2, 3], [1, 1, 1, 1]),
    lineAction([0, 2, 1, 3], [1, 1, 1, 1]),
    lineAction([0, 1, 3, 2], [1, 1, 1, 1]),
    lineAction([0, 1, 2, 3], [-1, 1, 1, 1]),
  ]

  // the reflection in an F4 root, acting on the 12 lines. Every F4 reflection preserves the
  // 24 long directions (reflections preserve norm), so it permutes the lines. The 48 F4 roots
  // reflections generate the full 24-cell symmetry (Weyl F4), the supergroup of B4 that adds
  // triality.
  function reflectionLineAction(root: number[]): number[] {
    const lp = new Array<number>(12)

    for (let L = 0; L < 12; L++) {
      const v = dirs[lines[L]!]!
      const reflected = reflectRoot(v, root).map(x => Math.round(x))
      lp[L] = lineOfDir(idx.get(key(reflected))!)
    }

    return lp
  }

  const f4Reflections = rootsF4().map(reflectionLineAction)

  return { dirs, lines, lineOfDir, b4Generators, f4Reflections }
}

const applyPermutation = (m: number[][], p: number[]): number[][] =>
  m.map(([a, b]) => [p[a!]!, p[b!]!])

// count the perfect matchings of the 12 lines invariant under a set of permutation generators.
// A matching invariant under every generator is invariant under the whole group they generate,
// so the generators alone suffice for the count.
function countInvariantMatchings(generators: number[][]): number {
  const all = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

  let count = 0

  for (const m of perfectMatchings(all)) {
    const mk = matchingKey(m)
    let invariant = true

    for (const g of generators) {
      if (matchingKey(applyPermutation(m, g)) !== mk) {
        invariant = false
        break
      }
    }

    if (invariant) {
      count++
    }
  }

  return count
}

const permKey = (p: number[]): string => p.join(',')
// (g after e)(i) = g[e[i]]
const composePerm = (g: number[], e: number[]): number[] => e.map(x => g[x]!)

// every element (as a permutation of the 12 lines) of the group generated by a set of
// generators, by closing under composition.
function permutationGroupElements(generators: number[][]): number[][] {
  const size = generators[0]!.length
  const identity = Array.from({ length: size }, (_, i) => i)
  const seen = new Map<string, number[]>([[permKey(identity), identity]])
  let frontier = [identity]

  while (frontier.length > 0) {
    const next: number[][] = []

    for (const element of frontier) {
      for (const generator of generators) {
        const product = composePerm(generator, element)
        const productKey = permKey(product)

        if (!seen.has(productKey)) {
          seen.set(productKey, product)
          next.push(product)
        }
      }
    }

    frontier = next
  }

  return [...seen.values()]
}

// the order of the permutation group generated by a set of generators. Used to VERIFY the four
// B4 generators really generate the expected symmetry on the lines, rather than assuming it.
function permutationGroupOrder(generators: number[][]): number {
  return permutationGroupElements(generators).length
}

// The three-generation coset structure. The substrate carries the full 24-cell symmetry F4 (the
// line-image, order 576), the knit respects only the crystallographic B4 (the line-image, order
// 192), and the quotient F4/B4 has index three. This computes those cosets and checks that a
// triality element (an order-three element of F4 that is not in B4) cyclically PERMUTES the three
// cosets, so the three cosets are a genuine triality orbit, the three generations, and their
// number is forced to be three by the index. The knit, fixing B4, sits in and stabilizes one
// coset, which is why a specific dynamics picks out one generation frame while the count stays
// three.
export function generationCosetStructure(): {
  b4Order: number
  f4Order: number
  cosetCount: number
  cosetSizes: number[]
  trialityOrder: number
  trialityCyclesCosets: boolean
} {
  const { b4Generators, f4Reflections } = buildLineStructure()
  const b4 = permutationGroupElements(b4Generators)
  const f4 = permutationGroupElements([...b4Generators, ...f4Reflections])
  const b4Set = new Set(b4.map(permKey))

  // the right coset B4 . g, labelled by the lexicographically smallest element key in it
  const cosetLabel = (g: number[]): string => {
    let best: string | null = null

    for (const b of b4) {
      const key = permKey(composePerm(b, g))

      if (best === null || key < best) {
        best = key
      }
    }

    return best!
  }

  const labelOf = new Map<string, string>()
  const cosetMembers = new Map<string, number[][]>()

  for (const g of f4) {
    const label = cosetLabel(g)
    labelOf.set(permKey(g), label)

    if (!cosetMembers.has(label)) {
      cosetMembers.set(label, [])
    }

    cosetMembers.get(label)!.push(g)
  }

  const cosetLabels = [...cosetMembers.keys()]
  const cosetSizes = cosetLabels.map(l => cosetMembers.get(l)!.length)

  // a triality element: an order-three element of F4 that is NOT in B4 (its cube is the identity)
  const identityKey = permKey(f4[0]!.map((_, i) => i))
  let triality: number[] | null = null
  let trialityOrder = 0

  for (const g of f4) {
    if (b4Set.has(permKey(g))) {
      continue
    }

    const g2 = composePerm(g, g)
    const g3 = composePerm(g2, g)

    if (permKey(g3) === identityKey && permKey(g) !== identityKey) {
      triality = g
      trialityOrder = 3
      break
    }
  }

  // does the triality element cyclically permute the three cosets (map each coset label to a
  // different coset label, with an orbit of length three)?
  let trialityCyclesCosets = false

  if (triality !== null && cosetLabels.length === 3) {
    // right cosets B4.g are permuted by RIGHT multiplication: B4.g -> B4.(g . t). With
    // composePerm(a, b) = a after b, the element "g then t" is composePerm(triality, g) is wrong;
    // g . t as a group product (t applied on the right of g) is composePerm(g, triality).
    const imageLabel = (label: string): string => {
      const representative = cosetMembers.get(label)![0]!

      return labelOf.get(permKey(composePerm(representative, triality!)))!
    }

    const start = cosetLabels[0]!
    const second = imageLabel(start)
    const third = imageLabel(second)
    const back = imageLabel(third)

    trialityCyclesCosets =
      second !== start &&
      third !== start &&
      third !== second &&
      back === start
  }

  return {
    b4Order: b4.length,
    f4Order: f4.length,
    cosetCount: cosetLabels.length,
    cosetSizes,
    trialityOrder,
    trialityCyclesCosets,
  }
}

// count the perfect matchings of the 12 lines, and how many are invariant under the B4
// symmetry of the 24-cell. A unique invariant matching means the symmetric momentum-conserving
// minimal knit is forced. Kept for callers that want just the endpoints.
export function linePairingFamily(): {
  totalPairings: number
  symmetricPairings: number
} {
  const { b4Generators } = buildLineStructure()
  const total = countInvariantMatchings([]) // no constraint counts every matching
  const symmetric = countInvariantMatchings(b4Generators)

  return { totalPairings: total, symmetricPairings: symmetric }
}

// The full forcing story of the knit, as a curve rather than two endpoints. Reports the
// survivor count as the symmetry demand grows from none (conservation only) through the four
// B4 generators one at a time to the full B4, then to the full F4 (the 24-cell symmetry with
// triality); the order of the line-permutation group each set generates (so the group is
// VERIFIED, not assumed); the drop-one-generator controls (removing any single B4 generator
// leaves more than one survivor); and the identity of the unique survivor.
export function linePairingForcingCurve(): {
  totalPairings: number
  curve: { generatorsUsed: number; survivors: number }[]
  b4LineGroupOrder: number
  f4LineGroupOrder: number
  b4Survivors: number
  f4Survivors: number
  dropOneSurvivors: number[]
  survivorPairsSameCoordinatePair: boolean
} {
  const structure = buildLineStructure()
  const { b4Generators, f4Reflections, dirs, lines } = structure

  const totalPairings = countInvariantMatchings([])

  // the curve: invariance under the first k B4 generators, k = 0..4
  const curve = [0, 1, 2, 3, 4].map(k => ({
    generatorsUsed: k,
    survivors: countInvariantMatchings(b4Generators.slice(0, k)),
  }))

  const b4Survivors = countInvariantMatchings(b4Generators)
  // F4 adds the reflections that are not signed permutations (the triality-bearing part)
  const f4Survivors = countInvariantMatchings([
    ...b4Generators,
    ...f4Reflections,
  ])

  const b4LineGroupOrder = permutationGroupOrder(b4Generators)
  const f4LineGroupOrder = permutationGroupOrder([
    ...b4Generators,
    ...f4Reflections,
  ])

  // drop-one-generator controls: removing any single B4 generator must leave more than one
  const dropOneSurvivors = b4Generators.map((_, i) =>
    countInvariantMatchings(b4Generators.filter((_, j) => j !== i)),
  )

  // identify the unique survivor and check its structure: does it pair the two lines that
  // share a coordinate pair {a,b} (the ++/-- line with the +-/-+ line)?
  const coordinatePairOfLine = (lineDirIndex: number): string => {
    const v = dirs[lineDirIndex]!
    const nonzero = v
      .map((x, i) => (x !== 0 ? i : -1))
      .filter(i => i >= 0)

    return nonzero.join(',')
  }

  let survivorPairsSameCoordinatePair = false

  const all = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

  for (const m of perfectMatchings(all)) {
    const mk = matchingKey(m)
    const invariant = b4Generators.every(
      g => matchingKey(applyPermutation(m, g)) === mk,
    )

    if (invariant) {
      survivorPairsSameCoordinatePair = m.every(
        ([a, b]) =>
          coordinatePairOfLine(lines[a!]!) ===
          coordinatePairOfLine(lines[b!]!),
      )
      break
    }
  }

  return {
    totalPairings,
    curve,
    b4LineGroupOrder,
    f4LineGroupOrder,
    b4Survivors,
    f4Survivors,
    dropOneSurvivors,
    survivorPairsSameCoordinatePair,
  }
}
