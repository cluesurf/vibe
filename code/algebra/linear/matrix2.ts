// A real 2 x 2 matrix as a flat row-major tuple [a, b, c, d], and its product. Two experiments
// (complex-structure-from-distinction, method/perturbation-audit-harness) each carried this.

export type Matrix2 = [number, number, number, number]

export function multiply2(a: Matrix2, b: Matrix2): Matrix2 {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
  ]
}
