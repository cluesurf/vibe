// The Bethe lattice (infinite regular tree) resolvent by the cavity recursion. On
// a tree the Green's function of the adjacency or the graph Laplacian has an exact
// per-step decay, so a bulk-mediated boundary correlator has a clean power-law
// exponent with no finite-patch artifact. Used for the holographic boundary
// correlator and the tree gravity propagator.

// The cavity decay mu(E): the resolvent of the adjacency on a Bethe lattice of
// coordination z (branching b = z - 1) at spectral parameter E decays by mu per
// tree step, where b mu^2 - E mu + 1 = 0. The Laplacian static (massless) point is
// E = z, giving the Coulomb decay per step (mu = 1 / b).
export function betheCavityDecay(input: {
  coordination: number
  energy: number
}): number {
  const branching = input.coordination - 1
  const energy = input.energy
  // At the band edge energy = 2 sqrt(branching) the discriminant is zero, but floating-point roundoff
  // can make it slightly negative, so clamp it before the square root.
  const disc = Math.max(0, energy * energy - 4 * branching)

  return (energy - Math.sqrt(disc)) / (2 * branching)
}

// The boundary correlator exponent alpha: a bulk-mediated correlator on the
// boundary of a Bethe lattice decays as 1 / r^alpha with alpha = 2 ln(1/mu)/ln(b),
// since boundary distance r grows as b^(tree-distance / 2). The massless point
// gives a universal alpha = 2.
export function betheBoundaryExponent(input: {
  coordination: number
  energy: number
}): number {
  const branching = input.coordination - 1
  const mu = betheCavityDecay(input)

  return (2 * Math.log(1 / mu)) / Math.log(branching)
}

// Validate the cavity recursion against a directly-solved FINITE rooted tree: build a tree of branching
// b = z - 1 and the given depth, solve (z I - A) phi = delta_root (the uniform-coordination operator the
// cavity recursion is for, non-singular at the massless point E = z) by relaxation (the tree is small),
// and return the level-to-level decay ratio phi(level 3) / phi(level 2), which should match the predicted
// cavity decay mu. Use a depth a couple of levels beyond level 3 so the measured ratio is in the bulk,
// away from the leaf boundary. Coordination z is the interior degree.
export function finiteTreeResolventRatio(input: {
  coordination: number
  depth: number
}): number {
  const z = input.coordination
  const b = z - 1
  // nodes by level, level 0 = root (1 node), level k has b^k nodes; parent of a node = previous level
  const levelSize: number[] = [1]

  for (let k = 1; k <= input.depth; k++)
    levelSize.push(levelSize[k - 1]! * b)

  const offset: number[] = [0]

  for (let k = 1; k <= input.depth + 1; k++)
    offset.push(offset[k - 1]! + (levelSize[k - 1] ?? 0))

  const N = offset[input.depth + 1]!

  const level = (i: number): number => {
    let k = 0

    while (k <= input.depth && i >= offset[k + 1]!) {
      k++
    }

    return k
  }

  const parent = (i: number): number => {
    const k = level(i)

    if (k === 0) return -1

    const within = i - offset[k]!

    return offset[k - 1]! + Math.floor(within / b)
  }

  const children = (i: number): number[] => {
    const k = level(i)

    if (k >= input.depth) return []

    const within = i - offset[k]!
    const base = offset[k + 1]! + within * b

    return Array.from({ length: b }, (_, j) => base + j)
  }

  // Solve (z I - A) phi = delta_0 by Gauss-Seidel (the tree is small). The diagonal is the
  // UNIFORM coordination z at every node, not each node's actual degree. This is the
  // operator the infinite-tree cavity recursion is for, non-singular at the massless point
  // E = z (above the band edge), so phi decays by mu per step. Using the actual degree
  // would give the graph Laplacian D - A, which is singular (the constant is a zero mode)
  // and has no solution for a single-node source, so the relaxation would drift to the flat
  // constant and read a decay ratio of one.
  const phi = new Float64Array(N)
  const src = new Float64Array(N)

  src[0] = 1

  for (let it = 0; it < 4000; it++) {
    for (let i = 0; i < N; i++) {
      let s = src[i]!

      const p = parent(i)

      if (p >= 0) s += phi[p]!

      for (const c of children(i)) s += phi[c]!

      phi[i] = s / z
    }
  }

  const r2 = phi[offset[2]!]!,
    r3 = phi[offset[3]!]!

  return r3 / r2
}
