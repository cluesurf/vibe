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
  // feasible: a non-negative solution with columns . x = rhs; infeasible: a Farkas certificate y with
  // y . column >= 0 for every column and y . rhs < 0. Both are to be checked exactly by the caller.
  x?: Q[]
  y?: Q[]
  pivots: number
}

// Is there x >= 0 with sum_j x_j column_j = rhs? Columns and rhs integer. Phase I of the simplex method with
// Bland's rule, exact rationals throughout (for small programs: tens of rows, hundreds of columns).
export function feasibility(
  columns: readonly (readonly bigint[])[],
  rhs: readonly bigint[],
): LpResult {
  const m = rhs.length
  const nCols = columns.length
  const total = nCols + m
  const sign = rhs.map(r => (r < 0n ? -1n : 1n))
  const T: Q[][] = []

  for (let i = 0; i < m; i++) {
    const row: Q[] = new Array<Q>(total + 1)

    for (let j = 0; j < nCols; j++) {
      row[j] = q(columns[j]![i]! * sign[i]!)
    }

    for (let k = 0; k < m; k++) {
      row[nCols + k] = k === i ? Q1 : Q0
    }

    row[total] = q(rhs[i]! * sign[i]!)
    T.push(row)
  }

  const basis = Array.from({ length: m }, (_, i) => nCols + i)
  // reduced costs of the phase-I objective (the artificials' sum), artificial columns start at 0
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
      const f = T[i]![enter]!

      if (i === leave || f.n === 0n) {
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

  // with phase-I duals w, artificial k's reduced cost is 1 - w_k (sign-normalised rows), every real column has
  // -w . A_j >= 0 and w . rhs is the positive optimum; so y_k = (cost_k - 1) times the row's sign is a certificate
  const y = Array.from({ length: m }, (_, k) =>
    qmul(qsub(cost[nCols + k]!, Q1), q(sign[k]!)),
  )

  return { feasible: false, y, pivots }
}

export type NcResult = {
  feasible: boolean
  raysStates: number
  raysEffects: number
  group: number
  orbits: number
  pivots: number
  // feasible: the ontic states used (pairs with sigma > 0), and whether the full sum reproduces the identity exactly
  onticStates: number
  identityExact: boolean
  // infeasible: the witness Y (n x n, by rows) with b^T Y a >= 0 on every ray pair and trace < 0, checked exactly on
  // every full pair; witnessExact true when it holds
  witness?: Q[]
  witnessTrace?: Q
  witnessExact: boolean
  // feasible: sigma on every full pair (b index * |A| + a index), for the caller's own model check
  sigma?: Map<number, Q>
  statesRays: bigint[][]
  effectsRays: bigint[][]
}

const keyOf = (v: readonly bigint[]): string => {
  const g = v.reduce((s, x) => gcd(s, x), 0n) || 1n

  return v.map(x => x / g).join(',')
}

// Does a fragment (states and effects as integer vectors in R^n, p(e|s) proportional to s . e) admit a non-negative
// linear (noncontextual) model? The simplex-embedding program: identity = sum sigma_ij b_i a_j^T with sigma >= 0, b_i
// the extreme rays of the states' dual cone, a_j those of the effects' dual cone. The program is averaged over the
// coordinate permutations (perms) that keep both sets: a solution averaged over them is a solution, so sigma may be
// taken constant on orbits of pairs. Both answers are then checked exactly on the full program: a solution expanded
// to every pair, a dual witness on every pair.
export function noncontextualModel(input: {
  states: readonly (readonly bigint[])[]
  effects: readonly (readonly bigint[])[]
  n: number
  perms: readonly (readonly number[])[]
}): NcResult {
  const { states, effects, n } = input
  const B = extremeRays(states, n)
  const A = extremeRays(effects, n)
  const permute = (v: readonly bigint[], p: readonly number[]): bigint[] => {
    const out = new Array<bigint>(n)

    for (let i = 0; i < n; i++) {
      out[p[i]!] = v[i]!
    }

    return out
  }
  const setKey = (vs: readonly (readonly bigint[])[]): string =>
    vs.map(keyOf).sort().join('|')
  const sKey = setKey(states)
  const eKey = setKey(effects)
  const group = input.perms.filter(
    p =>
      setKey(states.map(v => permute(v, p))) === sKey &&
      setKey(effects.map(v => permute(v, p))) === eKey,
  )
  const bIndex = new Map(B.map((v, i) => [keyOf(v), i]))
  const aIndex = new Map(A.map((v, i) => [keyOf(v), i]))
  const bPerm = group.map(p => B.map(v => bIndex.get(keyOf(permute(v, p)))!))
  const aPerm = group.map(p => A.map(v => aIndex.get(keyOf(permute(v, p)))!))
  // orbits of pairs, by union-find
  const N = B.length * A.length
  const parent = Int32Array.from({ length: N }, (_, i) => i)
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]!]!
      x = parent[x]!
    }

    return x
  }

  for (let g = 0; g < group.length; g++) {
    for (let i = 0; i < B.length; i++) {
      for (let j = 0; j < A.length; j++) {
        const x = find(i * A.length + j)
        const y = find(bPerm[g]![i]! * A.length + aPerm[g]![j]!)

        if (x !== y) {
          parent[x] = y
        }
      }
    }
  }

  const orbitOf = new Map<number, number>()
  const members: number[][] = []

  for (let k = 0; k < N; k++) {
    const r = find(k)

    if (!orbitOf.has(r)) {
      orbitOf.set(r, members.length)
      members.push([])
    }

    members[orbitOf.get(r)!]!.push(k)
  }

  const columns = members.map(ms => {
    const c = new Array<bigint>(n * n).fill(0n)

    for (const k of ms) {
      const b = B[Math.floor(k / A.length)]!
      const a = A[k % A.length]!

      for (let r = 0; r < n; r++) {
        for (let s = 0; s < n; s++) {
          c[r * n + s] = c[r * n + s]! + b[r]! * a[s]!
        }
      }
    }

    return c
  })
  const rhs = Array.from({ length: n * n }, (_, k) =>
    Math.floor(k / n) === k % n ? 1n : 0n,
  )
  const lp = feasibility(columns, rhs)
  const base = {
    raysStates: B.length,
    raysEffects: A.length,
    group: group.length,
    orbits: members.length,
    pivots: lp.pivots,
    statesRays: B,
    effectsRays: A,
  }

  if (lp.feasible) {
    const sigma = new Map<number, Q>()

    members.forEach((ms, o) => {
      const v = lp.x![o]!

      if (v.n !== 0n) {
        for (const k of ms) {
          sigma.set(k, v)
        }
      }
    })

    // the full sum, exactly
    const sum: Q[] = new Array<Q>(n * n).fill(Q0)

    for (const [k, v] of sigma) {
      const b = B[Math.floor(k / A.length)]!
      const a = A[k % A.length]!

      for (let r = 0; r < n; r++) {
        for (let s = 0; s < n; s++) {
          if (b[r]! !== 0n && a[s]! !== 0n) {
            sum[r * n + s] = qadd(sum[r * n + s]!, qmul(v, q(b[r]! * a[s]!)))
          }
        }
      }
    }

    const identityExact = sum.every((x, k) => qcmp(x, q(rhs[k]!)) === 0)

    return {
      ...base,
      feasible: true,
      onticStates: sigma.size,
      identityExact,
      witnessExact: false,
      sigma,
    }
  }

  // the program's certificate holds for orbit sums; averaged over the group it holds on every pair (a symmetric
  // Y gives b^T Y a constant on each orbit, equal to the orbit sum's value over the orbit's size)
  const raw = lp.y!
  const Y: Q[] = Array.from({ length: n * n }, (_, k) => {
    const r = Math.floor(k / n)
    const c = k % n
    let s = Q0

    for (const p of group) {
      s = qadd(s, raw[p[r]! * n + p[c]!]!)
    }

    return qdiv(s, q(group.length))
  })
  let ok = true

  for (const b of B) {
    for (const a of A) {
      let s = Q0

      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (b[r]! !== 0n && a[c]! !== 0n && Y[r * n + c]!.n !== 0n) {
            s = qadd(s, qmul(Y[r * n + c]!, q(b[r]! * a[c]!)))
          }
        }
      }

      ok &&= s.n >= 0n
    }
  }

  let trace = Q0

  for (let r = 0; r < n; r++) {
    trace = qadd(trace, Y[r * n + r]!)
  }

  ok &&= trace.n < 0n

  return {
    ...base,
    feasible: false,
    onticStates: 0,
    identityExact: false,
    witness: Y,
    witnessTrace: trace,
    witnessExact: ok,
  }
}
