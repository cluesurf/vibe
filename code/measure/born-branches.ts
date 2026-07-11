// The Born rule from norm concentration, the route independent of envariance. For N copies of
// alpha |0> + beta |1>, the branches with outcome frequency away from |beta|^2 have a combined
// SQUARED NORM (no probability assumption, just Pythagoras over orthogonal branches, the
// substrate's conserved quantity) that vanishes as N grows. And the rival branch-COUNTING measure
// fails twice: it concentrates at one half for every state (so it carries no information about
// the state), and it is not invariant under unitary refinement (splitting one branch into two
// changes counts but not norms), so counting is inconsistent with the conserved norm while the
// norm measure is forced by it.

function logBinomial(n: number, k: number): number {
  let total = 0

  for (let i = 1; i <= k; i++) {
    total += Math.log(n - k + i) - Math.log(i)
  }

  return total
}

// The squared norm of the projection of the N-copy state onto branches whose outcome frequency
// deviates from target by more than epsilon.
export function deviantBranchNorm(input: {
  weight: number
  copies: number
  epsilon: number
}): number {
  const { weight, copies, epsilon } = input
  const logW = Math.log(weight)
  const logNotW = Math.log(1 - weight)

  let total = 0

  for (let k = 0; k <= copies; k++) {
    const frequency = k / copies

    if (Math.abs(frequency - weight) > epsilon) {
      total += Math.exp(
        logBinomial(copies, k) + k * logW + (copies - k) * logNotW,
      )
    }
  }

  return total
}

// The branch-counting measure of the same deviant set: the fraction of the 2^N branches whose
// frequency deviates from target by more than epsilon. Concentrates at one half regardless of the
// state.
export function deviantBranchCount(input: {
  copies: number
  target: number
  epsilon: number
}): number {
  const { copies, target, epsilon } = input
  const logHalf = Math.log(0.5)

  let total = 0

  for (let k = 0; k <= copies; k++) {
    const frequency = k / copies

    if (Math.abs(frequency - target) > epsilon) {
      total += Math.exp(logBinomial(copies, k) + copies * logHalf)
    }
  }

  return total
}

// Refinement instability of counting: split the |0> branch of a single qubit into two
// sub-branches by a unitary on an ancilla. The counting measure of outcome zero jumps from one
// half (one branch of two) to two thirds (two branches of three), while the norm measure stays at
// |alpha|^2 exactly. Returns both before-and-after pairs.
export function refinementShift(weight0: number): {
  countBefore: number
  countAfter: number
  normBefore: number
  normAfter: number
} {
  return {
    countBefore: 1 / 2,
    countAfter: 2 / 3,
    normBefore: weight0,
    normAfter: weight0,
  }
}
