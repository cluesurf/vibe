// Voigt encoding of a symmetric 3x3 tensor as a 6-vector, with the orthonormal (energy-preserving)
// sqrt(2) weighting on the off-diagonal entries so that the Euclidean inner product of the vectors
// equals the Frobenius inner product of the tensors. Order: (xx, yy, zz, xy, xz, yz). Also a helper
// that materialises a linear operator on symmetric tensors as its 6x6 matrix in this basis, which is
// what eigensolvers consume.

import { makeDense } from '@/code/algebra/linear/dense'

const ROOT2 = Math.SQRT2

// Symmetric 3x3 tensor -> orthonormal 6-vector (xx, yy, zz, sqrt2*xy, sqrt2*xz, sqrt2*yz).
export function symmetricTensorToVoigt(tensor: number[][]): number[] {
  return [
    tensor[0]?.[0] ?? 0,
    tensor[1]?.[1] ?? 0,
    tensor[2]?.[2] ?? 0,
    ROOT2 * (tensor[0]?.[1] ?? 0),
    ROOT2 * (tensor[0]?.[2] ?? 0),
    ROOT2 * (tensor[1]?.[2] ?? 0),
  ]
}

// Orthonormal 6-vector -> symmetric 3x3 tensor (inverse of symmetricTensorToVoigt).
export function voigtToSymmetricTensor(vector: number[]): number[][] {
  const xy = (vector[3] ?? 0) / ROOT2
  const xz = (vector[4] ?? 0) / ROOT2
  const yz = (vector[5] ?? 0) / ROOT2
  return [
    [vector[0] ?? 0, xy, xz],
    [xy, vector[1] ?? 0, yz],
    [xz, yz, vector[2] ?? 0],
  ]
}

// Materialise a linear operator on symmetric 3x3 tensors as its 6x6 matrix in the Voigt basis, by
// probing it with each basis vector. The operator maps a symmetric tensor to a symmetric tensor.
export function operatorToVoigtMatrix(
  operator: (tensor: number[][]) => number[][],
): ReturnType<typeof makeDense> {
  const m = makeDense({ rows: 6, cols: 6 })
  for (let a = 0; a < 6; a++) {
    const e = [0, 0, 0, 0, 0, 0]
    e[a] = 1
    const col = symmetricTensorToVoigt(
      operator(voigtToSymmetricTensor(e)),
    )
    for (let r = 0; r < 6; r++) {
      m.data[r * 6 + a] = col[r] ?? 0
    }
  }
  return m
}
