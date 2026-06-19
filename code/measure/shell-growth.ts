// The shell growth rate of a tessellation, the geometric constant behind the fermion mass hierarchy. In a hyperbolic
// honeycomb the number of cells at shell n (graph distance n from a root) grows like lambda^n, where lambda is the
// growth rate, an algebraic number fixed by the tessellation. For the 4D honeycomb {3,4,3,4} the first shell is the
// 24 directions and the growth rate is about 18.4. This large lambda is the candidate origin of the fermion mass
// hierarchy, fermion generations localized on successive shells have wavefunction overlaps (and so Yukawa couplings)
// suppressed by powers of lambda, giving inter-generation mass ratios that are powers of the derived lambda. A flat
// (Euclidean) lattice has only polynomial shell growth (the ratio tends to one), so it cannot produce a large
// hierarchy from unit shell separations, the control.

// the cells-per-shell counts from a graph, by breadth-first search from a root (shell n = cells at graph distance n)
export function shellCountsFromGraph(input: {
  neighbors: ReadonlyArray<ArrayLike<number>>
  cellCount: number
  root?: number
}): number[] {
  const root = input.root ?? 0
  const distance = new Array<number>(input.cellCount).fill(-1)
  distance[root] = 0
  let frontier = [root]
  while (frontier.length > 0) {
    const next: number[] = []
    for (const cell of frontier) {
      const row = input.neighbors[cell]
      if (!row) {
        continue
      }
      for (let i = 0; i < row.length; i++) {
        const nb = row[i]!
        if (distance[nb] === -1) {
          distance[nb] = distance[cell]! + 1
          next.push(nb)
        }
      }
    }
    frontier = next
  }
  const maxDistance = distance.reduce((m, d) => (d > m ? d : m), 0)
  const counts = new Array<number>(maxDistance + 1).fill(0)
  for (const d of distance) {
    if (d >= 0) {
      counts[d]!++
    }
  }
  return counts
}

// the growth ratio at the largest reliably-resolved shell, counts[shell] / counts[shell - 1]. The last shell is
// dropped because a finite build truncates it, so the ratio is taken at the deepest fully-grown shell.
export function growthRatioFromShellCounts(counts: number[]): {
  ratio: number
  shell: number
} {
  // the deepest shell that is not the truncated boundary, the second-to-last grown shell
  const reliable = counts.length - 2
  if (reliable < 1) {
    return { ratio: 0, shell: 0 }
  }
  return {
    ratio: counts[reliable]! / counts[reliable - 1]!,
    shell: reliable,
  }
}

// the number of integer lattice points at L1 distance n in Z^dimension (the flat-lattice shell), counted exactly by
// the convolution recurrence
export function euclideanL1ShellCount(input: {
  dimension: number
  shell: number
}): number {
  const memo = new Map<string, number>()
  function count(d: number, n: number): number {
    if (d === 0) {
      return n === 0 ? 1 : 0
    }
    const key = `${d},${n}`
    const hit = memo.get(key)
    if (hit !== undefined) {
      return hit
    }
    let sum = 0
    for (let x = -n; x <= n; x++) {
      sum += count(d - 1, n - Math.abs(x))
    }
    memo.set(key, sum)
    return sum
  }
  return count(input.dimension, input.shell)
}

// the flat-lattice shell growth ratio at distance n, which tends to one (polynomial growth), the control
export function euclideanL1ShellRatio(input: {
  dimension: number
  shell: number
}): number {
  const a = euclideanL1ShellCount({
    dimension: input.dimension,
    shell: input.shell,
  })
  const b = euclideanL1ShellCount({
    dimension: input.dimension,
    shell: input.shell - 1,
  })
  return b > 0 ? a / b : 0
}

// the exponent p such that ratio = lambda^p, log_lambda(ratio), the number of shells of separation a mass ratio
// corresponds to
export function shellSeparationExponent(input: {
  ratio: number
  growthRate: number
}): number {
  return Math.log(input.ratio) / Math.log(input.growthRate)
}

// the extrapolated growth rate (the warp factor) from the shell-count ratios, by Aitken's delta-squared acceleration
// on the last three reliable ratios. The raw shell ratios converge to the true growth rate from above (19, 18.37,
// 18.29, ...), so the finite-build ratio overestimates it, and the extrapolation gives the limit (about 18.278).
export function extrapolatedGrowthRate(counts: number[]): number {
  // ratios of consecutive reliable shells (drop the truncated last shell, skip shell 0,1 transients)
  const ratios: number[] = []
  for (let i = 2; i < counts.length - 1; i++) {
    ratios.push(counts[i]! / counts[i - 1]!)
  }
  if (ratios.length < 3) {
    return ratios[ratios.length - 1] ?? 0
  }
  const x0 = ratios[ratios.length - 3]!
  const x1 = ratios[ratios.length - 2]!
  const x2 = ratios[ratios.length - 1]!
  const denom = x2 - x1 - (x1 - x0)
  if (Math.abs(denom) < 1e-12) {
    return x2
  }
  return x2 - ((x2 - x1) * (x2 - x1)) / denom // Aitken's delta-squared limit
}

// whether the shell-count sequence satisfies an integer-coefficient order-2 linear recurrence (a quadratic-irrational
// growth rate). Returns the fitted coefficients and whether they are integers, used to bound the algebraic degree of
// the growth rate (order-2 failing means degree at least 3).
export function fitOrder2Recurrence(counts: number[]): {
  a: number
  b: number
  isInteger: boolean
} {
  // solve s[i] = a s[i-1] + b s[i-2] from two consecutive interior windows
  const s = counts.slice(0, counts.length - 1) // drop truncated last shell
  if (s.length < 5) {
    return { a: 0, b: 0, isInteger: false }
  }
  // windows at indices 3 and 4: s3 = a s2 + b s1 ; s4 = a s3 + b s2
  const s1 = s[1]!,
    s2 = s[2]!,
    s3 = s[3]!,
    s4 = s[4]!
  const det = s2 * s2 - s3 * s1
  if (Math.abs(det) < 1e-9) {
    return { a: 0, b: 0, isInteger: false }
  }
  const a = (s3 * s2 - s4 * s1) / det
  const b = (s2 * s4 - s3 * s3) / det
  const isInteger =
    Math.abs(a - Math.round(a)) < 1e-6 &&
    Math.abs(b - Math.round(b)) < 1e-6
  return { a, b, isInteger }
}
