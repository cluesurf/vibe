// The exact growth series of a Coxeter group given by ANY Coxeter matrix (infinite entries allowed), by Steinberg's
// formula, independent of every construction that builds the group:
//
//   1 / W(t) = sum over the subsets T of the generators with W_T finite of (-1)^|T| t^N_T / W_T(t)
//
// where W_T(t) is the Poincare polynomial of the finite parabolic subgroup W_T (palindromic of degree N_T, the length
// of its longest element). coxeter-growth.ts does the same for linear diagrams; this one takes the polygon groups and
// the right-angled 24-cell of chamber-tiling.ts too. Finite parabolics are recognized from their components (joined by
// entries m >= 3): A1, I2(m) and products of them. A finite component of rank 3 or more never occurs in the lab's
// systems, so it throws rather than guess its polynomial; an infinite one (a hyperbolic or Euclidean triangle, or a
// path [a, b] with 1/a + 1/b <= 1/2) is recognized and excluded, with every superset.
//
// Every coefficient is a bigint and every division is by a series with constant term 1, so nothing is rounded.

type Series = bigint[]

function multiply(a: Series, b: Series, count: number): Series {
  const out = new Array<bigint>(count).fill(0n)

  for (let i = 0; i < a.length && i < count; i++) {
    if (a[i] === 0n) {
      continue
    }

    for (let j = 0; j < b.length && i + j < count; j++) {
      out[i + j] = out[i + j]! + a[i]! * b[j]!
    }
  }

  return out
}

// 1 / a as a power series, a[0] = 1
function invert(a: Series, count: number): Series {
  if (a[0] !== 1n) {
    throw new Error('system-growth: a series to invert needs constant term 1')
  }

  const out: bigint[] = []

  for (let n = 0; n < count; n++) {
    let v = n === 0 ? 1n : 0n

    for (let i = 1; i <= n && i < a.length; i++) {
      v -= a[i]! * out[n - i]!
    }

    out.push(v)
  }

  return out
}

// [m] = 1 + t + ... + t^(m-1)
function qInteger(m: number): Series {
  return new Array<bigint>(m).fill(1n)
}

type Parabolic = { poly: Series; longest: number } | 'infinite'

// The Poincare polynomial of the parabolic subgroup on `subset`, or 'infinite'.
function parabolic(
  coxeter: readonly (readonly number[])[],
  subset: readonly number[],
): Parabolic {
  for (const i of subset) {
    for (const j of subset) {
      if (i !== j && coxeter[i]![j] === Number.POSITIVE_INFINITY) {
        return 'infinite'
      }
    }
  }

  // components joined by entries m >= 3
  const seen = new Set<number>()

  let poly: Series = [1n]
  let longest = 0

  for (const start of subset) {
    if (seen.has(start)) {
      continue
    }

    const component: number[] = []
    const queue = [start]

    seen.add(start)

    while (queue.length > 0) {
      const v = queue.pop()!

      component.push(v)

      for (const w of subset) {
        if (!seen.has(w) && w !== v && coxeter[v]![w]! >= 3) {
          seen.add(w)
          queue.push(w)
        }
      }
    }

    component.sort((a, b) => a - b)

    if (component.length === 1) {
      poly = multiply(poly, [1n, 1n], poly.length + 1)
      longest += 1
    } else if (component.length === 2) {
      const m = coxeter[component[0]!]![component[1]!]!
      const factor = multiply([1n, 1n], qInteger(m), m + 1)

      poly = multiply(poly, factor, poly.length + m)
      longest += m
    } else if (component.length === 3) {
      const [a, b, c] = component as [number, number, number]
      const ab = coxeter[a]![b]!
      const ac = coxeter[a]![c]!
      const bc = coxeter[b]![c]!
      const labels = [ab, ac, bc].filter(m => m >= 3)
      const finite =
        labels.length === 3
          ? 1 / ab + 1 / ac + 1 / bc > 1
          : 1 / labels[0]! + 1 / labels[1]! > 1 / 2

      if (finite) {
        throw new Error('system-growth: a finite rank-3 parabolic is not supported')
      }

      return 'infinite'
    } else {
      throw new Error('system-growth: a parabolic component of rank 4 or more is not supported')
    }
  }

  return { poly, longest }
}

// The growth series W(t) = sum over n of (elements of length n) t^n, its first `count` coefficients.
export function systemGrowthSeries(
  coxeter: readonly (readonly number[])[],
  count: number,
): bigint[] {
  const rank = coxeter.length

  let reciprocal: Series = new Array<bigint>(count).fill(0n)

  const add = (subset: number[], par: { poly: Series; longest: number }): void => {
    const sign = subset.length % 2 === 0 ? 1n : -1n
    const term = invert(par.poly, count)

    for (let n = par.longest; n < count; n++) {
      reciprocal[n] = reciprocal[n]! + sign * term[n - par.longest]!
    }
  }

  // depth-first over subsets in increasing order; an infinite subset prunes all its supersets
  const visit = (subset: number[], next: number): void => {
    const par = parabolic(coxeter, subset)

    if (par === 'infinite') {
      return
    }

    add(subset, par)

    for (let g = next; g < rank; g++) {
      subset.push(g)
      visit(subset, g + 1)
      subset.pop()
    }
  }

  visit([], 0)

  if (reciprocal[0] !== 1n) {
    throw new Error('system-growth: the reciprocal series does not start at 1')
  }

  reciprocal = reciprocal.slice(0, count)

  return invert(reciprocal, count)
}

export type Recurrence = {
  // a[n] * scale = sum over i of numerators[i] * a[n - 1 - i], for every n >= from
  readonly order: number
  readonly from: number
  readonly numerators: bigint[]
  readonly scale: bigint
  // terms past the ones the fit used that the recurrence predicts exactly
  readonly predicted: number
}

// The determinant of a square bigint matrix by fraction-free (Bareiss) elimination, exact.
function determinant(matrix: bigint[][]): bigint {
  const m = matrix.map(row => [...row])
  const n = m.length

  let sign = 1n
  let previous = 1n

  for (let k = 0; k < n - 1; k++) {
    if (m[k]![k] === 0n) {
      const swap = m.findIndex((row, i) => i > k && row[k] !== 0n)

      if (swap < 0) {
        return 0n
      }

      const row = m[k]!

      m[k] = m[swap]!
      m[swap] = row
      sign = -sign
    }

    for (let i = k + 1; i < n; i++) {
      for (let j = k + 1; j < n; j++) {
        m[i]![j] = (m[i]![j]! * m[k]![k]! - m[i]![k]! * m[k]![j]!) / previous
      }
    }

    previous = m[k]![k]!
  }

  return sign * m[n - 1]![n - 1]!
}

// The shortest linear recurrence (order up to maxOrder, starting at index up to maxFrom) that the first terms fix and
// that then predicts EVERY later term exactly, with at least minPredicted of them; null when none does. The fit solves
// order equations by Cramer's rule in bigints, so a recurrence is a rational one carried as integer numerators over a
// common scale.
export function fitRecurrence(input: {
  series: readonly bigint[]
  maxOrder: number
  maxFrom?: number
  minPredicted: number
}): Recurrence | null {
  const a = input.series
  const maxFrom = input.maxFrom ?? 3

  for (let order = 1; order <= input.maxOrder; order++) {
    for (let from = order; from <= order + maxFrom; from++) {
      const used = from + order
      const predicted = a.length - used

      if (predicted < input.minPredicted) {
        continue
      }

      // rows n = from .. from + order - 1: a[n] = sum c_i a[n - 1 - i]
      const system = Array.from({ length: order }, (_, r) =>
        Array.from({ length: order }, (_, i) => a[from + r - 1 - i]!),
      )
      const rhs = Array.from({ length: order }, (_, r) => a[from + r]!)
      const scale = determinant(system)

      if (scale === 0n) {
        continue
      }

      const numerators = Array.from({ length: order }, (_, i) =>
        determinant(system.map((row, r) => row.map((x, j) => (j === i ? rhs[r]! : x)))),
      )

      let holds = true

      for (let n = from; n < a.length && holds; n++) {
        let sum = 0n

        for (let i = 0; i < order; i++) {
          sum += numerators[i]! * a[n - 1 - i]!
        }

        holds = sum === a[n]! * scale
      }

      if (holds) {
        return { order, from, numerators, scale, predicted }
      }
    }
  }

  return null
}
