// The HaPPY holographic code on a `branching`-ary perfect-tensor tree. Each node is
// a perfect tensor whose logical is recoverable iff at least `threshold` of its
// `branching` children are recoverable (e.g. the [[5,1,3]] perfect tensor: any 3 of
// its 5 legs reconstruct it, so branching = 5, threshold = 3). Leaves are the
// boundary qubits at depth `level`; the root is the deep bulk logical. Erasing a
// boundary set propagates inward by this recovery rule, and the code distance
// protecting the root grows as threshold^level.

// A node at (level, offset) is recoverable from the surviving boundary iff at least
// `threshold` of its children are. A leaf (level 0) is recoverable iff not erased.
export function perfectTensorRecoverable(input: {
  level: number
  offset: number
  erased: Set<number>
  branching: number
  threshold: number
}): boolean {
  const { level, offset, erased, branching, threshold } = input
  if (level === 0) {
    return !erased.has(offset)
  }

  const childSize = branching ** (level - 1)
  let alive = 0
  for (let child = 0; child < branching; child++) {
    if (
      perfectTensorRecoverable({
        level: level - 1,
        offset: offset + child * childSize,
        erased,
        branching,
        threshold,
      })
    ) {
      alive++
    }
  }

  return alive >= threshold
}

// The minimal boundary erasure that destroys the node's logical: recursively kill
// `threshold` of the `branching` children. Its size is threshold^level, the code
// distance.
export function perfectTensorMinimalKillSet(input: {
  level: number
  offset: number
  branching: number
  threshold: number
}): number[] {
  const { level, offset, branching, threshold } = input
  if (level === 0) {
    return [offset]
  }

  const childSize = branching ** (level - 1)
  const out: number[] = []
  for (let child = 0; child < threshold; child++) {
    out.push(
      ...perfectTensorMinimalKillSet({
        level: level - 1,
        offset: offset + child * childSize,
        branching,
        threshold,
      }),
    )
  }

  return out
}

// The largest CONTIGUOUS boundary erasure such that every window of that size still
// leaves the root recoverable: the holographic wedge threshold. It grows with depth.
export function perfectTensorContiguousThreshold(input: {
  level: number
  branching: number
  threshold: number
}): number {
  const { level, branching, threshold } = input
  const leaves = branching ** level
  for (let size = 1; size <= leaves; size++) {
    let allRecover = true
    for (let start = 0; start + size <= leaves; start++) {
      const erased = new Set<number>()
      for (let i = start; i < start + size; i++) {
        erased.add(i)
      }

      if (
        !perfectTensorRecoverable({
          level,
          offset: 0,
          erased,
          branching,
          threshold,
        })
      ) {
        allRecover = false
        break
      }
    }

    if (!allRecover) {
      return size - 1
    }
  }

  return leaves
}
