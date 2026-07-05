// CONSERVING maintenance of a tone field back toward a `target` pattern, using only two
// charge-conserving moves (no charge minted from nothing):
//   1. SWAP a cell that drifted too HIGH (tone above its target) with one that drifted too LOW,
//      fixing both at once (a transport, conserving).
//   2. PAIR-FILL the remaining holes: a hole that wants +1 and a hole that wants -1 become a fresh
//      (+1, -1) pair (the arrow recreating the charge annihilation destroyed, 0/0 -> +1/-1).
// Returns the number of operations performed (the maintenance cost, the "will" holding the self
// together). Net charge is preserved exactly. Mutates `tone` in place.
export function conservingMaintainToTarget(
  tone: Int8Array,
  target: Int8Array,
  size: number,
): number {
  const tooHigh: number[] = []
  const tooLow: number[] = []

  for (let i = 0; i < size; i++) {
    if (tone[i]! > target[i]!) {
      tooHigh.push(i)
    } else if (tone[i]! < target[i]!) {
      tooLow.push(i)
    }
  }

  let ops = 0

  const m = Math.min(tooHigh.length, tooLow.length)

  for (let k = 0; k < m; k++) {
    const hi = tooHigh[k]!
    const lo = tooLow[k]!
    const t = tone[hi]!
    tone[hi] = tone[lo]!
    tone[lo] = t
    ops++
  }

  const needPlus: number[] = []
  const needMinus: number[] = []

  for (let i = 0; i < size; i++) {
    if (tone[i]! !== 0) {
      continue
    }

    if (target[i]! === 1) {
      needPlus.push(i)
    } else if (target[i]! === -1) {
      needMinus.push(i)
    }
  }

  const f = Math.min(needPlus.length, needMinus.length)

  for (let k = 0; k < f; k++) {
    tone[needPlus[k]!] = 1
    tone[needMinus[k]!] = -1
    ops++
  }

  return ops
}
