// The family of momentum-conserving reversible knit rules, and how the 24-cell symmetry forces it. The committed knit
// (headOnRotate) rotates a zero-momentum head-on pair (both slots of one line carrying the same tone) between PAIRED
// lines, which conserves charge and momentum and is a reversible involution. The free part is the PAIRING of the 12
// lines (the 12 opposite-direction pairs of the 24 directions) into 6 pairs. Any pairing gives a valid rule, so by
// conservation and reversibility alone there is a vast family (the number of perfect matchings of 12 lines). But
// almost none of them respect the symmetry of the 24-cell, and counting the symmetric ones is how we test whether the
// knit is FORCED.

// the 24 directions +-e_a+-e_b of the {3,4,3,4} D4 coin
function directions(): number[][] {
  const dirs: number[][] = []
  for (let a = 0; a < 4; a++)
    for (let b = a + 1; b < 4; b++)
      for (const sa of [1, -1])
        for (const sb of [1, -1]) {
          const v = [0, 0, 0, 0]
          v[a] = sa
          v[b] = sb
          dirs.push(v)
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
    for (const tail of perfectMatchings(rest)) yield [[a, b], ...tail]
  }
}

function matchingKey(m: number[][]): string {
  return m
    .map(p => (p[0]! < p[1]! ? `${p[0]}-${p[1]}` : `${p[1]}-${p[0]}`))
    .sort()
    .join('|')
}

// count the perfect matchings of the 12 lines, and how many are invariant under the hyperoctahedral B4 symmetry of the
// 24-cell (the signed coordinate permutations). A unique invariant matching means the symmetric momentum-conserving
// minimal knit is forced.
export function linePairingFamily(): {
  totalPairings: number
  symmetricPairings: number
} {
  const dirs = directions()
  const idx = new Map(dirs.map((v, i) => [key(v), i]))
  const negOf = dirs.map(v => idx.get(key(v.map(x => -x)))!)
  // the 12 lines (opposite-direction pairs), canonical id = min(i, neg)
  const lines: number[] = []
  for (let i = 0; i < 24; i++) {
    const c = Math.min(i, negOf[i]!)
    if (!lines.includes(c)) lines.push(c)
  }
  const lineIndex = new Map(lines.map((c, k) => [c, k]))
  const lineOfDir = (i: number): number =>
    lineIndex.get(Math.min(i, negOf[i]!))!

  // the B4 generators (coordinate transpositions and a sign flip) acting as permutations of the 12 lines
  function lineAction(perm: number[], sign: number[]): number[] {
    const lp = new Array<number>(12)
    for (let L = 0; L < 12; L++) {
      const v = dirs[lines[L]!]!
      const w = [0, 0, 0, 0]
      for (let c = 0; c < 4; c++) w[perm[c]!] = sign[perm[c]!]! * v[c]!
      lp[L] = lineOfDir(idx.get(key(w))!)
    }
    return lp
  }
  const generators = [
    lineAction([1, 0, 2, 3], [1, 1, 1, 1]),
    lineAction([0, 2, 1, 3], [1, 1, 1, 1]),
    lineAction([0, 1, 3, 2], [1, 1, 1, 1]),
    lineAction([0, 1, 2, 3], [-1, 1, 1, 1]),
  ]
  const applyPermutation = (m: number[][], p: number[]): number[][] =>
    m.map(([a, b]) => [p[a!]!, p[b!]!])

  let total = 0
  let symmetric = 0
  const all = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  for (const m of perfectMatchings(all)) {
    total++
    const mk = matchingKey(m)
    let invariant = true
    for (const g of generators) {
      if (matchingKey(applyPermutation(m, g)) !== mk) {
        invariant = false
        break
      }
    }
    if (invariant) symmetric++
  }
  return { totalPairings: total, symmetricPairings: symmetric }
}
