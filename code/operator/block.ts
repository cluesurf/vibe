import { ComplexMatrix } from '@/code/algebra/linear/dense'

// A 2x2 complex block in row-major order [00, 01, 10, 11], split into real and
// imaginary parts. The building block of the lattice Wilson-Dirac operators (the
// Wilson projectors r I -/+ gamma_mu are 2x2 blocks).
export type Block = {
  re: [number, number, number, number]
  im: [number, number, number, number]
}

// Accumulate (coefficient * phase * block) into the 2x2 sub-block of a
// ComplexMatrix at (rowSite, colSite), where each site owns a 2-spinor. The
// shared assembler for the gauge Wilson-Dirac operator (gauge-index) and the
// U(1) condensate operator (overlap-condensate).
export function addComplexBlock(input: {
  matrix: ComplexMatrix
  rowSite: number
  colSite: number
  block: Block
  phaseRe: number
  phaseIm: number
  coefficient: number
}): void {
  const n = input.matrix.rows

  for (let s = 0; s < 2; s++) {
    for (let t = 0; t < 2; t++) {
      const k = s * 2 + t
      const br = input.block.re[k] ?? 0
      const bi = input.block.im[k] ?? 0
      const pr = input.phaseRe * input.coefficient
      const pi = input.phaseIm * input.coefficient
      const re = pr * br - pi * bi
      const im = pr * bi + pi * br
      const row = input.rowSite * 2 + s
      const col = input.colSite * 2 + t

      input.matrix.re[row * n + col] =
        (input.matrix.re[row * n + col] ?? 0) + re

      input.matrix.im[row * n + col] =
        (input.matrix.im[row * n + col] ?? 0) + im
    }
  }
}
