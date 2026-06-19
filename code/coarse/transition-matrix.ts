// The Markov-state-model layer of the coarse-graining engine (see the multi-level-selves plan, E2 and E3).
// Build a lag-tau transition matrix from a discrete-state trajectory, then read its spectral gap. A clean
// emergent level shows a gap in the implied timescales. No gap means no clean level there, an honest
// negative. The eigenvalues are computed on the reversibilized symmetric matrix, so a symmetric Jacobi
// solver suffices and the values are exact-real, not a non-symmetric approximation.

// Quantile-bin a continuous series into equal-occupancy integer labels in [0, bins). Every bin is populated,
// which avoids the spurious eigenvalue-1 modes that empty fixed bins would produce in the Markov model.
export function quantileLabels(input: {
  series: number[]
  bins: number
}): number[] {
  const { series, bins } = input
  if (series.length === 0) {
    return []
  }
  const sorted = [...series].sort((a, b) => a - b)
  const thresholds = Array.from(
    { length: bins - 1 },
    (_, k) =>
      sorted[Math.floor(((k + 1) / bins) * sorted.length)] ??
      sorted[sorted.length - 1]!,
  )
  return series.map(x => {
    let b = 0
    while (b < bins - 1 && x > thresholds[b]!) {
      b++
    }
    return b
  })
}

// Count matrix at lag tau. counts[i][j] = number of times the trajectory is in state i at time t and state
// j at time t+tau. The trajectory is an array of integer state labels in [0, stateCount).
export function countMatrix(input: {
  trajectory: number[]
  stateCount: number
  lag: number
}): number[][] {
  const { trajectory, stateCount, lag } = input
  const counts: number[][] = Array.from({ length: stateCount }, () =>
    new Array<number>(stateCount).fill(0),
  )
  for (let t = 0; t + lag < trajectory.length; t++) {
    const i = trajectory[t]!
    const j = trajectory[t + lag]!
    if (i >= 0 && j >= 0) {
      counts[i]![j]!++
    }
  }
  return counts
}

// Detailed-balance violation of a flat (states x states) transition-count matrix.
// `violation` is the total off-diagonal asymmetry sum |C[s][s'] - C[s'][s]| over s<s'
// normalized by the total off-diagonal flux. `floor` is the statistical noise floor
// expected for genuinely symmetric counts with Poisson fluctuations,
// sqrt(2 / mean off-diagonal pair count). A reversible (detailed-balance) process sits
// near or below its floor; an irreversible drive sits clearly above it.
export function detailedBalanceViolation(input: {
  counts: ArrayLike<number>
  states: number
}): { violation: number; floor: number } {
  const { counts, states } = input
  let asymmetry = 0
  let total = 0
  let pairs = 0
  let meanCount = 0
  for (let s = 0; s < states; s++) {
    for (let sp = s + 1; sp < states; sp++) {
      const f = counts[s * states + sp]!
      const r = counts[sp * states + s]!
      asymmetry += Math.abs(f - r)
      total += f + r
      if (f + r > 0) {
        meanCount += f + r
        pairs++
      }
    }
  }
  const violation = total > 0 ? asymmetry / total : 0
  meanCount = pairs > 0 ? meanCount / pairs : 1
  const floor = Math.sqrt(2 / Math.max(meanCount, 1))
  return { violation, floor }
}

// Row-stochastic transition matrix from a count matrix. An empty row (an unvisited state) maps to itself.
export function rowStochastic(counts: number[][]): number[][] {
  const n = counts.length
  return counts.map((row, i) => {
    const sum = row.reduce((a, b) => a + b, 0)
    if (sum === 0) {
      const e = new Array<number>(n).fill(0)
      e[i] = 1
      return e
    }
    return row.map(c => c / sum)
  })
}

// Eigenvalues of a real symmetric matrix by the cyclic Jacobi rotation method, returned sorted descending.
// Self-contained so the coarse engine has no external eig dependency.
export function symmetricEigenvalues(matrix: number[][]): number[] {
  const n = matrix.length
  const a = matrix.map(row => row.slice())
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += a[p]![q]! * a[p]![q]!
      }
    }
    if (off < 1e-18) {
      break
    }
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = a[p]![q]!
        if (Math.abs(apq) < 1e-15) {
          continue
        }
        const app = a[p]![p]!
        const aqq = a[q]![q]!
        const phi = 0.5 * Math.atan2(2 * apq, aqq - app)
        const c = Math.cos(phi)
        const s = Math.sin(phi)
        for (let k = 0; k < n; k++) {
          const akp = a[k]![p]!
          const akq = a[k]![q]!
          a[k]![p] = c * akp - s * akq
          a[k]![q] = s * akp + c * akq
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p]![k]!
          const aqk = a[q]![k]!
          a[p]![k] = c * apk - s * aqk
          a[q]![k] = s * apk + c * aqk
        }
      }
    }
  }
  const eigs = a.map((row, i) => row[i]!)
  return eigs.sort((x, y) => y - x)
}

// The eigenvalues of the (reversibilized) transition matrix, real and in [-1, 1], sorted descending. The
// count matrix is symmetrized (detailed balance) and similarity-transformed to a symmetric matrix S =
// D^-1/2 C D^-1/2 with the same spectrum as the reversible transition matrix.
export function transitionEigenvalues(counts: number[][]): number[] {
  const n = counts.length
  const sym: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  )
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sym[i]![j] = 0.5 * (counts[i]![j]! + counts[j]![i]!)
    }
  }
  const degree = sym.map(row => row.reduce((a, b) => a + b, 0))
  const s: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  )
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const di = degree[i]!
      const dj = degree[j]!
      // an unvisited state (degree 0) is left at 0, so it contributes a zero eigenvalue, not a spurious slow
      // mode at 1. Spurious 1-eigenvalues from empty bins would otherwise mask the real spectral gap.
      s[i]![j] = di > 0 && dj > 0 ? sym[i]![j]! / Math.sqrt(di * dj) : 0
    }
  }
  return symmetricEigenvalues(s)
}

// The spectral-gap report. lambda1 is the stationary eigenvalue (near 1). lambda2 is the slowest relaxing
// mode. The gap ratio (lambda2 - lambda3) / (1 - lambda2) is large when there is one clean slow process and
// a fast rest, the signature of a single emergent timescale.
export function spectralGap(eigenvalues: number[]): {
  lambda1: number
  lambda2: number
  lambda3: number
  gap: number
} {
  const l1 = eigenvalues[0] ?? 0
  const l2 = eigenvalues[1] ?? 0
  const l3 = eigenvalues[2] ?? 0
  const gap = 1 - l2 > 1e-9 ? (l2 - l3) / (1 - l2) : 0
  return { lambda1: l1, lambda2: l2, lambda3: l3, gap }
}

// Implied timescale of an eigenvalue at lag tau, in beats. t = -tau / ln(lambda). A slow process has a long
// implied timescale, a fast one a short one. A flat plateau across lags is the standard validity check.
export function impliedTimescale(input: {
  eigenvalue: number
  lag: number
}): number {
  const { eigenvalue, lag } = input
  if (eigenvalue <= 0 || eigenvalue >= 1) {
    return eigenvalue >= 1 ? Infinity : 0
  }
  return -lag / Math.log(eigenvalue)
}
