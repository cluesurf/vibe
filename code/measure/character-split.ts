// A CONSERVATION SEARCH SPLIT BY THE CHARACTERS OF AN ELEMENTARY ABELIAN SYMMETRY GROUP (E-FND-0171). A group H of
// commuting involutions acts on the features by permutations. For a character chi of H (chi(h) = +-1), V_chi is the
// set of densities v with v[h f] = chi(h) v[f] for every h. On an orbit O with representative r its only vector, up
// to scale, is b_O = sum over f in O of chi(g_f) e_f (g_f any element with g_f r = f), and that exists exactly when
// chi is 1 on the stabilizer of r. So V_chi has the basis {b_O}, one per admissible orbit, and a density in it is its
// values on the representatives.
//
// THE SPLIT IS EXACT WITHOUT ANY SYMMETRY OF THE DYNAMICS. A row r constrains q in V_chi through r . q =
// sum over O of q_O (r . b_O), so the reduced row is r_O = sum over f in O of chi(g_f) r[f], an integer row on the
// admissible orbits, and the solutions of the reduced system are exactly N(A) meet V_chi. Summed over the characters,
// the dimensions give the largest H-invariant subspace of N(A): every conserved density whose H-images are conserved
// too. When the rule is H-covariant that is all of N(A).
//
//   elementaryGroup    the 2^k products of k commuting involutions, each with its bit mask
//   characterBasis     for one character (a bit mask: chi(h) = (-1)^popcount(mask & h)), the admissible orbits, each
//                      feature's column (or -1) and the sign chi(g_f)
//   reduceRow          a row on the features to the row on the character's columns
//   projectDensity     a density on the features to its coordinates in V_chi, times |H| (sum over h of chi(h) v[h r]):
//                      an integer vector, zero exactly when the density has no component in V_chi
//
// DETERMINISM: no random numbers. EXACT: integer rows.

export type ElementaryGroup = { readonly elements: Int32Array[]; readonly masks: number[] }

export function elementaryGroup(generators: readonly Int32Array[]): ElementaryGroup {
  const n = generators[0]!.length
  const elements: Int32Array[] = []
  const masks: number[] = []

  for (let mask = 0; mask < 1 << generators.length; mask++) {
    let p = Int32Array.from({ length: n }, (_, i) => i)

    generators.forEach((g, k) => {
      if ((mask >> k) & 1) {
        p = Int32Array.from(p, f => g[f]!)
      }
    })

    elements.push(p)
    masks.push(mask)
  }

  return { elements, masks }
}

const parity = (x: number): number => {
  let p = 0

  for (let y = x; y !== 0; y &= y - 1) {
    p ^= 1
  }

  return p
}

export const characterValue = (chi: number, mask: number): number => (parity(chi & mask) ? -1 : 1)

export type CharacterBasis = {
  readonly chi: number
  // the representative feature of each column
  readonly reps: Int32Array
  // column of each feature, or -1 when its orbit is not admissible
  readonly column: Int32Array
  // chi(g_f) for each feature in an admissible orbit
  readonly sign: Int8Array
}

export function characterBasis(group: ElementaryGroup, chi: number): CharacterBasis {
  const n = group.elements[0]!.length
  const column = new Int32Array(n).fill(-1)
  const sign = new Int8Array(n)
  const seen = new Uint8Array(n)
  const reps: number[] = []
  const value = group.masks.map(m => characterValue(chi, m))

  for (let r = 0; r < n; r++) {
    if (seen[r]) {
      continue
    }

    // the orbit of r with chi(g_f), and whether chi is consistent on it (1 on the stabilizer)
    const got = new Map<number, number>()

    let admissible = true

    group.elements.forEach((h, k) => {
      const f = h[r]!
      const s = value[k]!

      seen[f] = 1

      const before = got.get(f)

      if (before === undefined) {
        got.set(f, s)
      } else if (before !== s) {
        admissible = false
      }
    })

    if (!admissible) {
      continue
    }

    const c = reps.length

    reps.push(r)
    got.forEach((s, f) => {
      column[f] = c
      sign[f] = s
    })
  }

  return { chi, reps: Int32Array.from(reps), column, sign }
}

export function reduceRow(basis: CharacterBasis, idx: ArrayLike<number>, val: ArrayLike<number>): Map<number, number> {
  const out = new Map<number, number>()

  for (let k = 0; k < idx.length; k++) {
    const f = idx[k]!
    const c = basis.column[f]!

    if (c >= 0) {
      out.set(c, (out.get(c) ?? 0) + basis.sign[f]! * val[k]!)
    }
  }

  return out
}

// sum over h of chi(h) v[h r] at every column's representative r
export function projectDensity(group: ElementaryGroup, basis: CharacterBasis, v: ArrayLike<number>): number[] {
  const value = group.masks.map(m => characterValue(basis.chi, m))

  return Array.from(basis.reps, r => group.elements.reduce((s, h, k) => s + value[k]! * (v[h[r]!] ?? 0), 0))
}
