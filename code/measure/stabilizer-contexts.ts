// The stabilizer contexts of k roles, read on a whole's integer weights (E-QTM-0149 to 0153).
//
// A whole (code/rule/fear-weave) holds signed integer weights on the 9^k joint phase points of k roles, point
// index x1 9^(k-1) + ... + xk with each role's point 3 a + b. The phase points of k roles are the vectors of
// F3^(2k), (a1, b1, ..., ak, bk), with the symplectic form [u, v] = sum_i (a_i b'_i - b_i a'_i) mod 3.
//
// A stabilizer measurement of k roles is a Lagrangian subspace L (dimension k, [u, v] = 0 on it), its outcomes
// the 3^k cosets x + L, and the chance of an outcome the sum of the whole over its coset, divided by the whole's
// units: the Born rule on lines (E-QTM-0130), the net count the model reads (E-QTM-0142). A partial reading, of
// some roles only, keeps the rest: the conditional weights of the unread roles are the coset sums over the read
// roles' coordinates, taken point by point in the unread ones (Tr_read[(Pi x 1) rho] has Wigner function
// sum_{u in coset} W(u, z), since Tr(Pi A(u)) = 1 on the coset and 0 off it).
//
// Everything here is exact: trits, integers and BigInt sums. No reals.

export type Space = {
  readonly roles: number
  readonly points: number
  // the 2k trits of every point
  readonly trits: readonly Int8Array[]
  // add[x * points + y]: the point x + y
  readonly add: Int32Array
  // neg[x]: the point -x
  readonly neg: Int32Array
  // form[x * points + y]: [x, y] in 0, 1, 2
  readonly form: Int8Array
}

const SPACES = new Map<number, Space>()

export function pointTrits(index: number, roles: number): Int8Array {
  const out = new Int8Array(2 * roles)

  for (let r = 0; r < roles; r++) {
    const p = Math.floor(index / 9 ** (roles - 1 - r)) % 9

    out[2 * r] = Math.floor(p / 3)
    out[2 * r + 1] = p % 3
  }

  return out
}

export function pointOfTrits(
  trits: ArrayLike<number>,
  roles: number,
): number {
  let index = 0

  for (let r = 0; r < roles; r++) {
    const a = (((trits[2 * r] ?? 0) % 3) + 3) % 3
    const b = (((trits[2 * r + 1] ?? 0) % 3) + 3) % 3

    index = index * 9 + 3 * a + b
  }

  return index
}

// the phase space of k roles, with its addition and form tabulated once (k = 1, 2, 3)
export function phaseSpace(roles: number): Space {
  const known = SPACES.get(roles)

  if (known) {
    return known
  }

  const points = 9 ** roles
  const trits = Array.from({ length: points }, (_, i) =>
    pointTrits(i, roles),
  )
  const add = new Int32Array(points * points)
  const form = new Int8Array(points * points)
  const neg = new Int32Array(points)
  const sum = new Int8Array(2 * roles)

  for (let x = 0; x < points; x++) {
    const tx = trits[x] ?? new Int8Array(0)

    neg[x] = pointOfTrits(
      Array.from(tx, t => -t),
      roles,
    )

    for (let y = 0; y < points; y++) {
      const ty = trits[y] ?? new Int8Array(0)

      let f = 0

      for (let r = 0; r < roles; r++) {
        f +=
          (tx[2 * r] ?? 0) * (ty[2 * r + 1] ?? 0) -
          (tx[2 * r + 1] ?? 0) * (ty[2 * r] ?? 0)
      }

      for (let c = 0; c < 2 * roles; c++) {
        sum[c] = (tx[c] ?? 0) + (ty[c] ?? 0)
      }

      add[x * points + y] = pointOfTrits(sum, roles)
      form[x * points + y] = ((f % 3) + 3) % 3
    }
  }

  const space = { roles, points, trits, add, neg, form }

  SPACES.set(roles, space)

  return space
}

// every isotropic subspace of the given dimension, as its sorted member points (the origin first)
export function isotropicSubspaces(
  space: Space,
  dimension: number,
): number[][] {
  const { points, add, form } = space

  let level: number[][] = [[0]]

  for (let d = 0; d < dimension; d++) {
    const seen = new Set<string>()
    const next: number[][] = []

    for (const members of level) {
      const inSet = new Uint8Array(points)

      for (const m of members) {
        inSet[m] = 1
      }

      for (let v = 1; v < points; v++) {
        if (
          inSet[v] === 1 ||
          members.some(m => form[m * points + v] !== 0)
        ) {
          continue
        }

        // the span of members and v: members + t v, t = 0, 1, 2
        const span: number[] = []
        const v2 = add[v * points + v] ?? 0

        for (const m of members) {
          span.push(
            m,
            add[m * points + v] ?? 0,
            add[m * points + v2] ?? 0,
          )
        }

        span.sort((x, y) => x - y)

        const key = span.join(',')

        if (!seen.has(key)) {
          seen.add(key)
          next.push(span)
        }
      }
    }

    level = next
  }

  return level
}

// the Lagrangian subspaces of k roles: 4 for one role, 40 for two, 1,120 for three
export function lagrangians(space: Space): number[][] {
  return isotropicSubspaces(space, space.roles)
}

// the coset label of every point for a subspace: the smallest point of its coset
export function cosetLabels(
  space: Space,
  subspace: readonly number[],
): Int32Array {
  const { points, add } = space
  const label = new Int32Array(points)

  for (let x = 0; x < points; x++) {
    let best = x

    for (const s of subspace) {
      const y = add[x * points + s] ?? x

      best = y < best ? y : best
    }

    label[x] = best
  }

  return label
}

// the sum of the weights over each coset, keyed by the coset's label
export function cosetSums(
  weight: readonly bigint[],
  labels: Int32Array,
): Map<number, bigint> {
  const out = new Map<number, bigint>()

  weight.forEach((w, x) => {
    const c = labels[x] ?? 0

    out.set(c, (out.get(c) ?? 0n) + w)
  })

  return out
}

// the weights of a whole of `roles` roles summed over the listed roles' coordinates on each point set, keeping
// the others: for a reading of the listed roles with outcome sets given by `inOutcome` on their joint points
export function readRoles(input: {
  weight: readonly bigint[]
  roles: number
  read: readonly number[]
  // the read roles' joint point (in their listed order) -> whether it lies in the outcome
  inOutcome: (readPoint: number) => boolean
}): bigint[] {
  const { weight, roles, read } = input
  const kept = Array.from({ length: roles }, (_, r) => r).filter(
    r => !read.includes(r),
  )
  const out = new Array<bigint>(9 ** kept.length).fill(0n)

  weight.forEach((w, i) => {
    if (w === 0n) {
      return
    }

    const digit = (r: number): number =>
      Math.floor(i / 9 ** (roles - 1 - r)) % 9
    const readPoint = read.reduce((acc, r) => acc * 9 + digit(r), 0)

    if (!input.inOutcome(readPoint)) {
      return
    }

    const keptPoint = kept.reduce((acc, r) => acc * 9 + digit(r), 0)

    out[keptPoint] = (out[keptPoint] ?? 0n) + w
  })

  return out
}

// the marginal of the listed roles (every other role summed out)
export function marginalOf(
  weight: readonly bigint[],
  roles: number,
  keep: readonly number[],
): bigint[] {
  const read = Array.from({ length: roles }, (_, r) => r).filter(
    r => !keep.includes(r),
  )

  return readRoles({ weight, roles, read, inOutcome: () => true })
}

// the product of two wholes' weights, the first most significant
export function productWeights(
  a: readonly bigint[],
  b: readonly bigint[],
): bigint[] {
  const out: bigint[] = []

  for (const x of a) {
    for (const y of b) {
      out.push(x * y)
    }
  }

  return out
}

// move one role of a whole by a permutation of its 9 phase points
export function permuteRole(
  weight: readonly bigint[],
  roles: number,
  role: number,
  perm: ArrayLike<number>,
): bigint[] {
  const stride = 9 ** (roles - 1 - role)
  const out = new Array<bigint>(weight.length).fill(0n)

  weight.forEach((w, i) => {
    const c = Math.floor(i / stride) % 9

    out[i + ((perm[c] ?? c) - c) * stride] = w
  })

  return out
}

// the rank of a matrix over F3 (rows of trits), by elimination
export function rankMod3(rows: readonly (readonly number[])[]): number {
  const m = rows.map(r => r.map(x => ((x % 3) + 3) % 3))
  const cols = m[0]?.length ?? 0

  let rank = 0

  for (let c = 0; c < cols && rank < m.length; c++) {
    let pivot = -1

    for (let r = rank; r < m.length; r++) {
      if ((m[r]?.[c] ?? 0) !== 0) {
        pivot = r
        break
      }
    }

    if (pivot < 0) {
      continue
    }

    const swap = m[pivot] ?? []

    m[pivot] = m[rank] ?? []
    m[rank] = swap

    const inv = (swap[c] ?? 1) === 1 ? 1 : 2

    for (let j = 0; j < cols; j++) {
      swap[j] = ((swap[j] ?? 0) * inv) % 3
    }

    for (let r = 0; r < m.length; r++) {
      const row = m[r] ?? []
      const f = row[c] ?? 0

      if (r !== rank && f !== 0) {
        for (let j = 0; j < cols; j++) {
          row[j] = ((((row[j] ?? 0) - f * (swap[j] ?? 0)) % 3) + 3) % 3
        }
      }
    }

    rank++
  }

  return rank
}

// The noncontextual value assignments of the displacements of k roles: a trit f(v) for every nonzero point v
// (the displacement D(v) takes the value omega^f(v)), linear on every Lagrangian subspace, since commuting
// displacements multiply without a phase in the symmetric convention. Written on one representative per line
// through the origin (f(2 v) = 2 f(v)), the constraints are linear over F3. Returns the number of unknowns, the
// rank, and so the dimension of the solution space: 3^dimension assignments in all.
export function assignmentSpace(space: Space): {
  unknowns: number
  rank: number
  dimension: number
} {
  const { points, add } = space
  const rep = new Int32Array(points).fill(-1)
  const scale = new Int8Array(points)

  let unknowns = 0

  for (let v = 1; v < points; v++) {
    if (rep[v] !== -1) {
      continue
    }

    const v2 = add[v * points + v] ?? 0

    rep[v] = unknowns
    scale[v] = 1
    rep[v2] = unknowns
    scale[v2] = 2
    unknowns++
  }

  const rows: number[][] = []

  for (const plane of lagrangians(space)) {
    for (const u of plane) {
      for (const v of plane) {
        const w = add[u * points + v] ?? 0

        if (u === 0 || v === 0 || w === 0) {
          continue
        }

        // f(w) - f(u) - f(v) = 0
        const row = new Array<number>(unknowns).fill(0)

        row[rep[w] ?? 0] = (row[rep[w] ?? 0] ?? 0) + (scale[w] ?? 0)
        row[rep[u] ?? 0] = (row[rep[u] ?? 0] ?? 0) - (scale[u] ?? 0)
        row[rep[v] ?? 0] = (row[rep[v] ?? 0] ?? 0) - (scale[v] ?? 0)
        rows.push(row)
      }
    }
  }

  const rank = rankMod3(rows)

  return { unknowns, rank, dimension: unknowns - rank }
}
