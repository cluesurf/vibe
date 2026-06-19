// Real-space block-charge renormalization tower on a 1D field. Starting from a per-cell charge field,
// repeatedly coarse-grain by SUMMING consecutive pairs (block size doubling), and at each level record
// the total charge and the dimensionless compressibility (Var(block charge) / block size). The total
// charge is exactly conserved up every codec; the compressibility converging to a constant across the
// tower is a renormalization fixed point (a faithful multiscale tower).

export interface BlockChargeLevel {
  level: number
  blockSize: number
  totalCharge: number
  compressibility: number
}

// Build the pair-blocking tower from a charge field over `levels + 1` levels (level 0 is the raw field).
// totalCharge is rounded to an integer (charge is integral); compressibility is Var / blockSize.
export function blockChargeTower(input: {
  field: ArrayLike<number>
  levels: number
}): BlockChargeLevel[] {
  const { field, levels: maxLevel } = input
  let level = new Float64Array(field.length)
  for (let i = 0; i < field.length; i++) {
    level[i] = field[i]!
  }
  const levels: BlockChargeLevel[] = []
  let blockSize = 1
  for (let lv = 0; lv <= maxLevel; lv++) {
    let total = 0
    for (let i = 0; i < level.length; i++) {
      total += level[i]!
    }
    const mean = total / level.length
    let varSum = 0
    for (let i = 0; i < level.length; i++) {
      varSum += (level[i]! - mean) ** 2
    }
    const variance = varSum / level.length
    const compressibility = variance / blockSize
    levels.push({
      level: lv,
      blockSize,
      totalCharge: Math.round(total),
      compressibility,
    })
    const next = new Float64Array(Math.floor(level.length / 2))
    for (let i = 0; i < next.length; i++) {
      next[i] = level[2 * i]! + level[2 * i + 1]!
    }
    level = next
    blockSize *= 2
  }
  return levels
}
