// Representation theory of the dihedral group D_n (order 2n: n rotations, n reflections).
// The permutation representation on the n faces of a regular n-gon decomposes, by the
// character inner product, into the trivial rep plus the floor((n-1)/2) two-dimensional
// (vector-like) irreps, with the sign rep and (for even n) the second one-dimensional rep
// appearing only when the permutation character overlaps them. A permutation rep of a
// point group (not a double cover) contains NO spinor (half-integer) irrep, so hasSpinor
// is always false for this construction.

// The conjugacy-class data of the face permutation character of D_n:
//   identity:    char = n
//   rotation^k:  char = 0 (no face fixed by a nontrivial rotation), class size 2 for k=1..floor(n/2) (pairs)
//   reflection:  char = 1 (odd n: each reflection fixes one face), class size n
// (this construction is for odd n, the {7,3} / heptagon case).
interface DihedralClass {
  rep: string
  size: number
  char: number
  k?: number
}

function oddDihedralClasses(n: number): DihedralClass[] {
  const classes: DihedralClass[] = [{ rep: 'e', size: 1, char: n }]

  for (let k = 1; k <= (n - 1) / 2; k++) {
    classes.push({ rep: `r${k}`, size: 2, char: 0, k })
  }

  classes.push({ rep: 'reflection', size: n, char: 1 })

  return classes
}

// Character of irrep `name` evaluated on conjugacy class `c` for odd D_n.
//   triv:  1 everywhere
//   sign:  +1 on rotations, -1 on reflections
//   Ej:    2 cos(2 pi j k / n) on rotation^k, 0 on reflections, 2 on identity
function irrepCharacterOdd(
  name: string,
  c: DihedralClass,
  n: number,
): number {
  if (name === 'triv') {
    return 1
  }

  if (name === 'sign') {
    return c.rep === 'reflection' ? -1 : 1
  }

  const j = Number(name.slice(1)) // E1, E2, ...

  if (c.rep === 'e') {
    return 2
  }

  if (c.rep === 'reflection') {
    return 0
  }

  return 2 * Math.cos((2 * Math.PI * j * (c.k ?? 0)) / n)
}

// Decompose the n-face permutation rep of D_n (odd n) into irreps via the character inner
// product, returning the multiplicities (rounded), a human-readable decomposition string of
// the nonzero terms, and the no-spinor flag.
export function dihedralFacePermutationDecomposition(n: number): {
  multiplicities: Record<string, number>
  decomposition: string
  hasSpinor: boolean
} {
  const classes = oddDihedralClasses(n)
  const order = 2 * n
  const irreps = ['triv', 'sign']

  for (let j = 1; j <= (n - 1) / 2; j++) {
    irreps.push(`E${j}`)
  }

  const multiplicities: Record<string, number> = {}

  for (const ir of irreps) {
    const inner = classes.reduce(
      (s, c) => s + c.size * c.char * irrepCharacterOdd(ir, c, n),
      0,
    )

    multiplicities[ir] = Math.round((inner / order) * 100) / 100
  }

  const decomposition = Object.entries(multiplicities)
    .filter(([, m]) => Math.abs(m) > 1e-6)
    .map(([nm, m]) => `${m}x${nm}`)
    .join(' + ')

  // a permutation rep of a (non-double-cover) point group contains no spinor irrep
  return { multiplicities, decomposition, hasSpinor: false }
}
