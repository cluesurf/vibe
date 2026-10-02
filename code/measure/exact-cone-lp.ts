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

// the extreme rays of the pointed cone { x : A x >= 0 } in R^n, A integer rows, as primitive integer vectors (the
// rays tight on n - 1 independent rows, found by trying every such set of rows: exhaustive, for small cones)
export function extremeRays(A: readonly (readonly bigint[])[], n: number): bigint[][] {
  const rows = A.map(r => r.map(x => q(x)))
  const seen = new Set<string>()
  const out: bigint[][] = []
  const pick: number[] = []

  const visit = (start: number, chosen: Q[][]): void => {
    if (chosen.length === n - 1) {
      const ns = nullSpace(chosen, n)

      if (ns.length !== 1) {
        return
      }

      const v = primitive(ns[0]!)

      for (const sign of [1n, -1n]) {
        const w = v.map(x => x * sign)

        if (A.every(a => a.reduce((s, x, i) => s + x * w[i]!, 0n) >= 0n)) {
          const key = w.join(',')

          if (!seen.has(key)) {
            seen.add(key)
            out.push(w)
          }
        }
      }

      return
    }

    for (let i = start; i <= rows.length - (n - 1 - chosen.length); i++) {
      const next = [...chosen, rows[i]!]

      // prune: keep the chosen rows independent
      if (rank(next, n) < next.length) {
        continue
      }

      pick.push(i)
      visit(i + 1, next)
      pick.pop()
    }
  }

  visit(0, [])

  return out
}

export type LpResult = {
  feasible: boolean
  // the non-negative solution (feasible) or a Farkas certificate y with y . column >= 0 for every column and
  // y . rhs < 0 (infeasible)
  x?: Q[]
  y?: Q[]
  pivots: number
}

// Is there x >= 0 with M x = rhs? M given by columns (integer), rhs integer. Phase I of the simplex method with
// Bland's rule, exact. Returns a solution or a Farkas certificate, each verified exactly by the caller.
export function feasibility(
  columns: readonly (readonly bigint[])[],
  rhs: readonly bigint[],
): LpResult {
  const m = rhs.length
  const nCols = columns.length
  const total = nCols + m
  // tableau rows: m constraint rows over total columns plus rhs; sign-normalise so rhs >= 0
  const T: Q[][] = []

  for (let i = 0; i < m; i++) {
    const s = rhs[i]! < 0n ? -1n : 1n
    const row: Q[] = new Array<Q>(total + 1)

    for (let j = 0; j < nCols; j++) {
      row[j] = q(columns[j]![i]! * s)
    }

    for (let k = 0; k < m; k++) {
      row[nCols + k] = k === i ? Q1 : Q0
    }

    row[total] = q(rhs[i]! * s)
    T.push(row)
  }

  const sign = rhs.map(r => (r < 0n ? -1n : 1n))
  const basis = Array.from({ length: m }, (_, i) => nCols + i)
  // reduced cost row of the phase-I objective (minimise the artificials' sum): c_j - sum_i T_ij for j real
  const cost: Q[] = new Array<Q>(total + 1)

  for (let j = 0; j <= total; j++) {
    if (j >= nCols && j < total) {
      cost[j] = Q0
      continue
    }

    let s = Q0

    for (let i = 0; i < m; i++) {
      s = qadd(s, T[i]![j]!)
    }

    cost[j] = qsub(Q0, s)
  }

  let pivots = 0

  for (;;) {
    // Bland: the lowest index with negative reduced cost
    let enter = -1

    for (let j = 0; j < total; j++) {
      if (cost[j]!.n < 0n) {
        enter = j
        break
      }
    }

    if (enter < 0) {
      break
    }

    let leave = -1
    let best: Q | undefined

    for (let i = 0; i < m; i++) {
      const a = T[i]![enter]!

      if (a.n > 0n) {
        const ratio = qdiv(T[i]![total]!, a)
        const c = best ? qcmp(ratio, best) : -1

        if (c < 0 || (c === 0 && basis[i]! < basis[leave]!)) {
          best = ratio
          leave = i
        }
      }
    }

    if (leave < 0) {
      // unbounded cannot happen in phase I (objective bounded below by 0)
      throw new Error('phase I unbounded')
    }

    const inv = qdiv(Q1, T[leave]![enter]!)
    const pr = T[leave]!.map(x => (x.n === 0n ? Q0 : qmul(x, inv)))

    T[leave] = pr

    const nz: number[] = []

    for (let j = 0; j <= total; j++) {
      if (pr[j]!.n !== 0n) {
        nz.push(j)
      }
    }

    for (let i = 0; i < m; i++) {
      if (i === leave) {
        continue
      }

      const f = T[i]![enter]!

      if (f.n === 0n) {
        continue
      }

      const row = T[i]!

      for (const j of nz) {
        row[j] = qsub(row[j]!, qmul(f, pr[j]!))
      }
    }

    const f = cost[enter]!

    for (const j of nz) {
      cost[j] = qsub(cost[j]!, qmul(f, pr[j]!))
    }

    basis[leave] = enter
    pivots++
  }

  // objective value = -cost[total]
  const value = qsub(Q0, cost[total]!)

  if (value.n === 0n) {
    const x: Q[] = Array.from({ length: nCols }, () => Q0)

    basis.forEach((b, i) => {
      if (b < nCols) {
        x[b] = T[i]![total]!
      }
    })

    return { feasible: true, x, pivots }
  }

  // Farkas: with phase-I duals w, the artificial k's reduced cost is 1 - w_k, real columns have -w . A_j >= 0 and
  // w . rhs is the positive optimum. So y = -w = (reduced cost of artificial k) - 1, undoing the row signs, has
  // y . column >= 0 for every column and y . rhs < 0.
  const y = Array.from({ length: m }, (_, k) =>
    qmul(qsub(cost[nCols + k]!, Q1), q(sign[k]!)),
  )

  return { feasible: false, y, pivots }
}
