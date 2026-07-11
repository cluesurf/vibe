// Scale-detail measures for the discrete-to-continuum map. The coarse-grained tone
// density has a continuum limit exactly when the detail added at each finer scale
// vanishes as the blocks grow (the field sequence is Cauchy in scale). The detail
// norm here is the wavelet-style increment: for each parent block at scale 2B, the
// standard deviation of its child block means at scale B, root-mean-squared over
// parents. Self-averaging micro-texture decays at the central-limit rate (block
// side to the minus half power per dimension), while scale-free structure keeps
// detail at every scale, so the norm genuinely discriminates.

import type { Will } from '@/code/tone/will'

// block-mean signed charge density of a Will on the 4D periodic lattice with
// side `side` and block side `block` (block must divide side). Cell index
// convention: cell = ((w * side + z) * side + y) * side + x.
export function blockMeanField(input: {
  will: Will
  side: number
  block: number
}): Float64Array {
  const { will, side, block } = input
  const { mesh, data } = will
  const degree = mesh.degree
  const blocks = side / block
  const field = new Float64Array(blocks ** 4)
  const cellsPerBlock = block ** 4 * degree

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = cell % side
    const y = Math.floor(cell / side) % side
    const z = Math.floor(cell / (side * side)) % side
    const w = Math.floor(cell / (side * side * side)) % side
    const b =
      ((Math.floor(w / block) * blocks + Math.floor(z / block)) *
        blocks +
        Math.floor(y / block)) *
        blocks +
      Math.floor(x / block)

    let q = 0

    for (let d = 0; d < degree; d++) q += data[cell * degree + d] ?? 0

    field[b] = (field[b] ?? 0) + q
  }

  for (let b = 0; b < field.length; b++)
    field[b] = (field[b] ?? 0) / cellsPerBlock

  return field
}

// the detail norm between scale B and scale 2B: root-mean-square over the 2B
// parent blocks of the standard deviation of their sixteen child means at B.
// Vanishing detail as B grows means the coarse fields converge to a limit field.
export function scaleDetailNorm(input: {
  fine: Float64Array
  fineBlocks: number
}): number {
  const { fine, fineBlocks } = input
  const coarseBlocks = fineBlocks / 2

  let sum = 0
  let count = 0

  for (let pw = 0; pw < coarseBlocks; pw++) {
    for (let pz = 0; pz < coarseBlocks; pz++) {
      for (let py = 0; py < coarseBlocks; py++) {
        for (let px = 0; px < coarseBlocks; px++) {
          let mean = 0

          const children: number[] = []

          for (let dw = 0; dw < 2; dw++) {
            for (let dz = 0; dz < 2; dz++) {
              for (let dy = 0; dy < 2; dy++) {
                for (let dx = 0; dx < 2; dx++) {
                  const b =
                    (((pw * 2 + dw) * fineBlocks + (pz * 2 + dz)) *
                      fineBlocks +
                      (py * 2 + dy)) *
                      fineBlocks +
                    (px * 2 + dx)

                  const v = fine[b] ?? 0

                  children.push(v)
                  mean += v
                }
              }
            }
          }

          mean /= children.length

          let variance = 0

          for (const v of children) variance += (v - mean) * (v - mean)

          sum += variance / children.length
          count++
        }
      }
    }
  }

  return Math.sqrt(sum / Math.max(count, 1))
}
