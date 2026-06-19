// Coarse-grain a per-cell field to a per-group field by averaging. `group[i]` is the group id of cell i
// (0..groupCount-1); the result holds the mean field value over each group (empty groups read 0). The
// generic block-average behind the radial / cubic coherence-tower coarse fields.
export function coarseFieldByGroup(input: {
  field: ArrayLike<number>
  group: ArrayLike<number>
  groupCount: number
}): Float64Array {
  const { field, group, groupCount } = input
  const sum = new Float64Array(groupCount)
  const count = new Float64Array(groupCount)
  for (let i = 0; i < field.length; i++) {
    sum[group[i]!]! += field[i]!
    count[group[i]!]!++
  }
  for (let g = 0; g < groupCount; g++)
    sum[g] = count[g]! > 0 ? sum[g]! / count[g]! : 0
  return sum
}

// Coarse-grain a per-cell field to a per-group field by SUMMING (the net block charge). `group[i]` is the
// group id of cell i (0..groupCount-1); the result holds the total field value over each group. The
// many-valued block-charge field of a renormalization step (vs the bounded mean of coarseFieldByGroup).
export function sumFieldByGroup(input: {
  field: ArrayLike<number>
  group: ArrayLike<number>
  groupCount: number
}): Float64Array {
  const { field, group, groupCount } = input
  const sum = new Float64Array(groupCount)
  for (let i = 0; i < field.length; i++) sum[group[i]!]! += field[i]!
  return sum
}

// Build the group id per cell of a cubic-block coarse-graining on a periodic L^3 grid: cell (x,y,z)
// (row-major index z*L*L + y*L + x) maps to block ((z/b)*(L/b) + (y/b))*(L/b) + (x/b). Returns the
// per-cell block id and the block count (L/b)^3. The 3D analogue of a flat blocking partition.
export function cubicBlockGroups(input: {
  size: number
  blockSize: number
}): {
  group: Int32Array
  groupCount: number
} {
  const { size: L, blockSize: b } = input
  const N = L * L * L
  const side = L / b
  const group = new Int32Array(N)
  for (let i = 0; i < N; i++) {
    const x = i % L
    const y = ((i / L) | 0) % L
    const z = (i / (L * L)) | 0
    group[i] =
      (((z / b) | 0) * side + ((y / b) | 0)) * side + ((x / b) | 0)
  }
  return { group, groupCount: side * side * side }
}
