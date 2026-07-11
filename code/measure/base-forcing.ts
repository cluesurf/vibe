// Forcing the base choices, the ternary tone and the four dimensions. The base posits a ternary tone {-1, 0, +1} on a
// 4D {3,4,3,4} substrate. These are not arbitrary, each is forced by a short requirement.
//
//   - TERNARY is the MINIMAL tone alphabet with both a vacuum (a zero, an absence) AND charge conjugation (a sign-flip
//     symmetry that maps the alphabet to itself and is nontrivial). Binary {0, 1} has a vacuum but no charge
//     conjugation (no negative). The signs {-1, +1} have charge conjugation but no vacuum. Ternary {-1, 0, +1} is the
//     smallest with both, so a tone that can be absent and can be charge-conjugated is forced to be ternary.
//   - FOUR DIMENSIONS is forced by TRIALITY. The substrate is the D4 root system (the 24-cell). D4 is the UNIQUE
//     simple Lie algebra whose Dynkin diagram has an order-three symmetry (triality, the S3 permuting the three outer
//     nodes), which permutes the three eight-dimensional representations 8v, 8s, 8c, the three generations. For D_n
//     with n not four the diagram has only a Z2 (no order-three element), so triality, and the three generations,
//     exist only in four dimensions.

// whether a tone alphabet has a vacuum (contains zero) and a nontrivial charge conjugation (negation maps it to itself
// and flips at least one element)
export function toneAlphabetQualifies(alphabet: number[]): boolean {
  const hasVacuum = alphabet.includes(0)
  const negationClosed = alphabet.every(x => alphabet.includes(-x))
  const nontrivial = alphabet.some(x => x !== -x)

  return hasVacuum && negationClosed && nontrivial
}

// every non-empty subset of the integer range [-range, range], the exhaustive candidate space
// of small integer alphabets. For range 3 this is all 127 subsets of {-3..3}, so "smallest
// qualifying alphabet" is a real exhaustive search, not a curated shortlist.
export function integerAlphabets(range: number): number[][] {
  const universe: number[] = []

  for (let x = -range; x <= range; x++) universe.push(x)

  const subsets: number[][] = []
  const total = 1 << universe.length

  for (let mask = 1; mask < total; mask++) {
    const subset: number[] = []

    for (let i = 0; i < universe.length; i++) {
      if (mask & (1 << i)) subset.push(universe[i]!)
    }

    subsets.push(subset)
  }

  return subsets
}

// the minimal size of a qualifying tone alphabet (a vacuum plus charge conjugation), computed
// exhaustively over [-3, 3], which is three (ternary)
export function minimalQualifyingAlphabetSize(): number {
  const sizes = integerAlphabets(3)
    .filter(toneAlphabetQualifies)
    .map(a => a.length)

  return Math.min(...sizes)
}

// the qualifying alphabet of LEAST CONTENT over [-range, range]: minimal size first, then
// minimal largest magnitude, so among the size-three qualifiers ({-1,0,1}, {-2,0,2}, ...) the
// smallest-magnitude one is chosen. Returns {-1, 0, +1}.
export function minimalContentQualifyingAlphabet(
  range: number,
): number[] {
  const qualifying = integerAlphabets(range).filter(
    toneAlphabetQualifies,
  )

  const maxAbs = (a: number[]): number => Math.max(...a.map(Math.abs))

  return qualifying.reduce((best, a) => {
    if (a.length < best.length) return a

    if (a.length === best.length && maxAbs(a) < maxAbs(best)) return a

    return best
  }, qualifying[0]!)
}

// the minimal alphabet size when only a VACUUM is required (the mirror dropped), over
// [-range, range]: one, the trivial {0}. The control that the mirror is load-bearing.
export function minimalVacuumOnlySize(range: number): number {
  const sizes = integerAlphabets(range)
    .filter(a => a.includes(0))
    .map(a => a.length)

  return Math.min(...sizes)
}

// the minimal alphabet size when only a MIRROR is required (the vacuum dropped), over
// [-range, range]: two, the pair {-1, 1}. The control that the vacuum is load-bearing.
export function minimalMirrorOnlySize(range: number): number {
  const mirror = (a: number[]): boolean =>
    a.every(x => a.includes(-x)) && a.some(x => x !== -x)

  const sizes = integerAlphabets(range)
    .filter(mirror)
    .map(a => a.length)

  return Math.min(...sizes)
}

// the D_n Dynkin diagram as an adjacency list, a chain of n-2 nodes forking into two
function dynkinDn(n: number): number[][] {
  const adjacency: number[][] = Array.from({ length: n }, () => [])
  const edges: [number, number][] = []

  for (let i = 0; i < n - 3; i++) edges.push([i, i + 1])

  edges.push([n - 3, n - 2])
  edges.push([n - 3, n - 1])

  for (const [a, b] of edges) {
    adjacency[a]!.push(b)
    adjacency[b]!.push(a)
  }

  return adjacency
}

// the order of the automorphism group of the D_n Dynkin diagram (D4 gives 6, the triality S3, D_n n>=5 gives 2)
export function dynkinAutomorphismOrder(n: number): number {
  const adjacency = dynkinDn(n)
  const sets = adjacency.map(a => new Set(a))

  function* permutations(arr: number[]): Generator<number[]> {
    if (arr.length <= 1) {
      yield arr

      return
    }

    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]

      for (const p of permutations(rest)) yield [arr[i]!, ...p]
    }
  }

  let count = 0

  for (const p of permutations(
    Array.from({ length: n }, (_, i) => i),
  )) {
    let ok = true

    for (let a = 0; a < n && ok; a++) {
      for (const b of adjacency[a]!) {
        if (!sets[p[a]!]!.has(p[b]!)) {
          ok = false
          break
        }
      }
    }

    if (ok) {
      count++
    }
  }

  return count
}

// whether D_n has triality (an order-three Dynkin symmetry), true only for n = 4. For n < 4 the D_n diagram is
// degenerate (D2 = A1 x A1, D3 = A3), no triality.
export function hasTriality(n: number): boolean {
  if (n < 4) return false

  // S3 (order 6) contains an order-three element; Z2 (order 2) does not. D4 alone gives order 6.
  const order = dynkinAutomorphismOrder(n)

  return order % 3 === 0 && order >= 6
}
