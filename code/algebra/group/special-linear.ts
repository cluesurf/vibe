// The special linear groups over a finite field, SL(2,p), and their projective quotients
// PSL(2,p). SL(2,7) (order 336) is the spinor double cover of PSL(2,7) (order 168), the
// (2,3,7) triangle / Klein-quartic symmetry of the {7,3} tiling, the way the binary
// icosahedral group 2I covers A5 for {5,3,4}. The nontrivial centre element minus the
// identity acts as minus one in the defining representation, the spinor double-cover sign.

export type MatrixModP = readonly [number, number, number, number] // [a, b, c, d] = [[a, b], [c, d]]

const reduce = (value: number, prime: number): number =>
  ((value % prime) + prime) % prime

// Every 2x2 matrix over the field F_p with determinant 1. |SL(2,p)| = p (p^2 - 1).
export function specialLinear(prime: number): MatrixModP[] {
  const group: MatrixModP[] = []

  for (let a = 0; a < prime; a++) {
    for (let b = 0; b < prime; b++) {
      for (let c = 0; c < prime; c++) {
        for (let d = 0; d < prime; d++) {
          if (reduce(a * d - b * c, prime) === 1) {
            group.push([a, b, c, d])
          }
        }
      }
    }
  }

  return group
}

export function identityModP(): MatrixModP {
  return [1, 0, 0, 1]
}

// Minus the identity, the nontrivial centre element of SL(2,p) for p odd, the lift of the
// identity rotation in PSL that the spinor double cover turns into a minus sign.
export function minusIdentityModP(prime: number): MatrixModP {
  return [prime - 1, 0, 0, prime - 1]
}

export function multiplyModP(
  left: MatrixModP,
  right: MatrixModP,
  prime: number,
): MatrixModP {
  return [
    reduce(left[0] * right[0] + left[1] * right[2], prime),
    reduce(left[0] * right[1] + left[1] * right[3], prime),
    reduce(left[2] * right[0] + left[3] * right[2], prime),
    reduce(left[2] * right[1] + left[3] * right[3], prime),
  ]
}

export function equalsModP(
  left: MatrixModP,
  right: MatrixModP,
): boolean {
  return (
    left[0] === right[0] &&
    left[1] === right[1] &&
    left[2] === right[2] &&
    left[3] === right[3]
  )
}

// The centre of SL(2,p): the scalar matrices lambda I with lambda^2 = 1, that is {I, -I}.
export function centre(prime: number): MatrixModP[] {
  const result: MatrixModP[] = []

  for (let lambda = 0; lambda < prime; lambda++) {
    if (reduce(lambda * lambda, prime) === 1) {
      result.push([lambda, 0, 0, lambda])
    }
  }

  return result
}
