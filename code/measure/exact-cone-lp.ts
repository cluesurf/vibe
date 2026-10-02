// Exact rational tools for noncontextuality tests (E-QTM-0174): the extreme rays of a polyhedral cone and a
// feasibility linear program, both in BigInt rationals. No reals.
//
// A noncontextual ontological model of a fragment (states s, effects e, real coordinates with p(e|s) = s . e) is a
// non-negative linear model: ontic states lambda with mu_lambda(s) = beta_lambda . s >= 0 on every state and
// xi_lambda(e) = alpha_lambda . e >= 0 on every effect, summing to s . e (Spekkens 2008). When states and effects
// both span the space, that is: the identity matrix is a non-negative combination of the outer products b a^T, b an
// extreme ray of the states' dual cone and a an extreme ray of the effects' dual cone (Schmid et al. 2021, Selby et
// al. 2024, the simplex-embedding linear program). The normalisation follows by rescaling each lambda, since a
// non-zero a in the effects' dual cone has a . u > 0 once the effect set holds every effect's complement.

export type Q = { readonly n: bigint; readonly d: bigint }

const babs = (x: bigint): bigint => (x < 0n ? -x : x)

export function gcd(a: bigint, b: bigint): bigint {
  let x = babs(a)
  let y = babs(b)

  while (y) {
    ;[x, y] = [y, x % y]
  }

  return x
}

export function q(n: bigint | number, d: bigint | number = 1n): Q {
  let nn = BigInt(n)
  let dd = BigInt(d)

  if (dd < 0n) {
    nn = -nn
    dd = -dd
  }

  const g = gcd(nn, dd) || 1n

  return { n: nn / g, d: dd / g }
}

export const Q0 = q(0)
export const Q1 = q(1)
export const qadd = (a: Q, b: Q): Q =>
  a.d === b.d ? q(a.n + b.n, a.d) : q(a.n * b.d + b.n * a.d, a.d * b.d)
export const qsub = (a: Q, b: Q): Q => q(a.n * b.d - b.n * a.d, a.d * b.d)
export const qmul = (a: Q, b: Q): Q =>
  a.n === 0n || b.n === 0n ? Q0 : q(a.n * b.n, a.d * b.d)
export const qdiv = (a: Q, b: Q): Q => q(a.n * b.d, a.d * b.n)
export const qcmp = (a: Q, b: Q): number => {
  const x = a.n * b.d - b.n * a.d

  return x < 0n ? -1 : x > 0n ? 1 : 0
}
export const qstr = (a: Q): string =>
  a.d === 1n ? `${a.n}` : `${a.n}/${a.d}`

// the integer vector of a rational vector, scaled to coprime entries
export function primitive(v: readonly Q[]): bigint[] {
  let l = 1n

  for (const x of v) {
    l = (l * x.d) / gcd(l, x.d)
  }

  const ints = v.map(x => (x.n * l) / x.d)
  const g = ints.reduce((s, x) => gcd(s, x), 0n) || 1n

  return ints.map(x => x / g)
}

// the null space of a rational matrix (rows x n), as rational basis vectors
export function nullSpace(rows: readonly (readonly Q[])[], n: number): Q[][] {
  const m = rows.map(r => r.slice())
  const pivots: number[] = []

  let r = 0

  for (let c = 0; c < n && r < m.length; c++) {
    let p = -1

    for (let i = r; i < m.length; i++) {
      if (m[i]![c]!.n !== 0n) {
        p = i
        break
      }
    }

    if (p < 0) {
      continue
    }

    ;[m[r], m[p]] = [m[p]!, m[r]!]

    const inv = qdiv(Q1, m[r]![c]!)

    m[r] = m[r]!.map(x => qmul(x, inv))

    for (let i = 0; i < m.length; i++) {
      if (i !== r && m[i]![c]!.n !== 0n) {
        const f = m[i]![c]!

        m[i] = m[i]!.map((x, j) => qsub(x, qmul(f, m[r]![j]!)))
      }
    }

    pivots.push(c)
    r++
  }

  const free = Array.from({ length: n }, (_, c) => c).filter(
    c => !pivots.includes(c),
  )

  return free.map(f => {
    const v: Q[] = Array.from({ length: n }, () => Q0)

    v[f] = Q1
    pivots.forEach((c, i) => {
      v[c] = qsub(Q0, m[i]![f]!)
    })

    return v
  })
}

export function rank(rows: readonly (readonly Q[])[], n: number): number {
  return n - nullSpace(rows, n).length
}

// the extreme rays of the pointed cone { x : A x >= 0 } in R^n, A integer rows spanning R^n, as primitive integer
// vectors: the double description method (Motzkin et al. 1953), exact, with the combinatorial adjacency test
export function extremeRays(
  A: readonly (readonly bigint[])[],
  n: number,
): bigint[][] {
  const dot = (a: readonly bigint[], x: readonly bigint[]): bigint =>
    a.reduce((s, v, i) => s + v * x[i]!, 0n)
  const prim = (v: bigint[]): bigint[] => {
    const g = v.reduce((s, x) => gcd(s, x), 0n) || 1n

    return v.map(x => x / g)
  }
  // a first set of n independent rows
  const chosen: number[] = []

  for (let i = 0; i < A.length && chosen.length < n; i++) {
    const rows = [...chosen, i].map(k => A[k]!.map(x => q(x)))

    if (rank(rows, n) === chosen.length + 1) {
      chosen.push(i)
    }
  }

  if (chosen.length < n) {
    throw new Error('rows do not span: the cone is not pointed')
  }

  // the rays of { x : A_chosen x >= 0 } are the columns of A_chosen^-1: the null vector of the other n - 1 rows,
  // signed positive on its own row
  let rays: bigint[][] = chosen.map((k, idx) => {
    const others = chosen
      .filter((_, j) => j !== idx)
      .map(r => A[r]!.map(x => q(x)))
    const v = primitive(nullSpace(others, n)[0]!)

    return dot(A[k]!, v) > 0n ? v : v.map(x => -x)
  })
  const used = [...chosen]

  for (let h = 0; h < A.length; h++) {
    if (chosen.includes(h)) {
      continue
    }

    const row = A[h]!
    const val = rays.map(r => dot(row, r))
    const pos = rays.filter((_, i) => val[i]! > 0n)
    const zero = rays.filter((_, i) => val[i]! === 0n)
    const neg = rays.filter((_, i) => val[i]! < 0n)
    const zeroSet = (r: bigint[]): Set<number> =>
      new Set(used.filter(k => dot(A[k]!, r) === 0n))
    const zs = rays.map(zeroSet)
    const posIdx = rays.map((_, i) => i).filter(i => val[i]! > 0n)
    const negIdx = rays.map((_, i) => i).filter(i => val[i]! < 0n)
    const fresh: bigint[][] = []

    for (const p of posIdx) {
      for (const m of negIdx) {
        const common = [...zs[p]!].filter(k => zs[m]!.has(k))

        if (common.length < n - 2) {
          continue
        }

        const adjacent = !rays.some(
          (_, r) => r !== p && r !== m && common.every(k => zs[r]!.has(k)),
        )

        if (!adjacent) {
          continue
        }

        const vp = val[p]!
        const vm = -val[m]!

        fresh.push(prim(rays[p]!.map((x, i) => vm * x + vp * rays[m]![i]!)))
      }
    }

    rays = [...pos, ...zero, ...fresh]
    used.push(h)

    if (neg.length === 0 && fresh.length === 0) {
      continue
    }
  }

  const seen = new Set<string>()

  return rays.filter(r => {
    const k = r.join(',')

    if (seen.has(k)) {
      return false
    }

    seen.add(k)

    return true
  })
}

export type LpResult = {
  feasible: boolean
  // feasible: an exact non-negative solution with columns . x = rhs, verified here
  x?: Q[]
  // infeasible: an exact Farkas certificate, y . column >= 0 for every column and y . rhs < 0, verified here
  y?: Q[]
  // the float search's pivots, and whether the exact check on its final basis held
  pivots: number
  certified: boolean
}

// solve the square rational system B z = r exactly (B by rows); undefined if singular
function solveExact(B: readonly (readonly Q[])[], r: readonly Q[]): Q[] | undefined {
  const n = B.length
  const m = B.map((row, i) => [...row, r[i]!])

  for (let c = 0; c < n; c++) {
    let p = -1

    for (let i = c; i < n; i++) {
      if (m[i]![c]!.n !== 0n) {
        p = i
        break
      }
    }

    if (p < 0) {
      return undefined
    }

    ;[m[c], m[p]] = [m[p]!, m[c]!]

    const inv = qdiv(Q1, m[c]![c]!)
    const pr = m[c]!.map(x => (x.n === 0n ? Q0 : qmul(x, inv)))

    m[c] = pr

    for (let i = 0; i < n; i++) {
      const f = m[i]![c]!

      if (i !== c && f.n !== 0n) {
        m[i] = m[i]!.map((x, j) =>
          pr[j]!.n === 0n ? x : qsub(x, qmul(f, pr[j]!)),
        )
      }
    }
  }

  return m.map(row => row[n]!)
}

// Is there x >= 0 with sum_j x_j column_j = rhs? Columns and rhs integer. A float phase-I simplex (Dantzig's rule,
// Bland's after a run of degenerate pivots) finds a final basis; the answer is then proved exactly: a feasible basis
// by solving for its values in rationals and checking them against every row, an infeasible one by solving for the
// phase-I duals in rationals and checking every column's reduced cost (a Farkas certificate). certified is false
// when the float basis does not survive the exact check, and the answer is then not to be used.
export function feasibility(
  columns: readonly (readonly bigint[])[],
  rhs: readonly bigint[],
): LpResult {
  const m = rhs.length
  const nCols = columns.length
  const total = nCols + m
  const sign = rhs.map(r => (r < 0n ? -1 : 1))
  const width = total + 1
  const T = new Float64Array(m * width)

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < nCols; j++) {
      T[i * width + j] = Number(columns[j]![i]!) * sign[i]!
    }

    T[i * width + nCols + i] = 1
    T[i * width + total] = Number(rhs[i]!) * sign[i]!
  }

  const cost = new Float64Array(width)

  for (let j = 0; j < width; j++) {
    if (j >= nCols && j < total) {
      continue
    }

    let s = 0

    for (let i = 0; i < m; i++) {
      s += T[i * width + j]!
    }

    cost[j] = -s
  }

  const basis = Array.from({ length: m }, (_, i) => nCols + i)
  const EPS = 1e-9

  let pivots = 0
  let degenerate = 0

  for (; pivots < 200000; pivots++) {
    let enter = -1

    if (degenerate < 50) {
      let best = -EPS

      for (let j = 0; j < total; j++) {
        if (cost[j]! < best) {
          best = cost[j]!
          enter = j
        }
      }
    } else {
      for (let j = 0; j < total; j++) {
        if (cost[j]! < -EPS) {
          enter = j
          break
        }
      }
    }

    if (enter < 0) {
      break
    }

    let leave = -1
    let ratio = Infinity

    for (let i = 0; i < m; i++) {
      const a = T[i * width + enter]!

      if (a > EPS) {
        const rr = T[i * width + total]! / a

        if (
          rr < ratio - 1e-12 ||
          (Math.abs(rr - ratio) <= 1e-12 && basis[i]! < basis[leave]!)
        ) {
          ratio = rr
          leave = i
        }
      }
    }

    if (leave < 0) {
      break
    }

    degenerate = ratio < 1e-12 ? degenerate + 1 : 0

    const piv = T[leave * width + enter]!

    for (let j = 0; j < width; j++) {
      T[leave * width + j] = T[leave * width + j]! / piv
    }

    for (let i = 0; i < m; i++) {
      const f = T[i * width + enter]!

      if (i === leave || f === 0) {
        continue
      }

      for (let j = 0; j < width; j++) {
        T[i * width + j] = T[i * width + j]! - f * T[leave * width + j]!
      }
    }

    const f = cost[enter]!

    for (let j = 0; j < width; j++) {
      cost[j] = cost[j]! - f * T[leave * width + j]!
    }

    basis[leave] = enter
  }

  // the exact check on the final basis, in the original (unsigned) system
  const colOf = (j: number): Q[] =>
    j < nCols
      ? columns[j]!.map(x => q(x))
      : Array.from({ length: m }, (_, i) => (i === j - nCols ? Q1 : Q0))
  const Bcols = basis.map(colOf)
  const Brows = Array.from({ length: m }, (_, i) => Bcols.map(c => c[i]!))
  const rq = rhs.map(x => q(x))

  if (-cost[total]! < 1e-7) {
    const xB = solveExact(Brows, rq)
    const x: Q[] = Array.from({ length: nCols }, () => Q0)

    let ok = xB !== undefined

    basis.forEach((b, i) => {
      const v = xB?.[i] ?? Q0

      if (b >= nCols) {
        ok &&= v.n === 0n
      } else {
        ok &&= v.n >= 0n
        x[b] = v
      }
    })

    for (let i = 0; i < m && ok; i++) {
      let s = Q0

      for (let j = 0; j < nCols; j++) {
        if (x[j]!.n !== 0n && columns[j]![i]! !== 0n) {
          s = qadd(s, qmul(q(columns[j]![i]!), x[j]!))
        }
      }

      ok &&= qcmp(s, rq[i]!) === 0
    }

    return { feasible: true, x, pivots, certified: ok }
  }

  // infeasible: phase-I duals w with w . B_k = c_k (1 on artificials, 0 on real columns) over the basis; the
  // certificate is y = -w: y . column >= 0 for every real column and y . rhs < 0
  const cB = basis.map(b => (b >= nCols ? Q1 : Q0))
  const w = solveExact(Bcols, cB)

  if (!w) {
    return { feasible: false, pivots, certified: false }
  }

  const y = w.map(v => qsub(Q0, v))

  let ok = true

  for (let j = 0; j < nCols && ok; j++) {
    let s = Q0

    for (let i = 0; i < m; i++) {
      if (columns[j]![i]! !== 0n && y[i]!.n !== 0n) {
        s = qadd(s, qmul(y[i]!, q(columns[j]![i]!)))
      }
    }

    ok &&= s.n >= 0n
  }

  let yb = Q0

  for (let i = 0; i < m; i++) {
    yb = qadd(yb, qmul(y[i]!, rq[i]!))
  }

  ok &&= yb.n < 0n

  return { feasible: false, y, pivots, certified: ok }
}
